#!/usr/bin/env python3
"""Cortex design server — live Graphviz viewer + playground for headless use over Tailscale.

Surfaces:
  /              index: all .dot artifacts in this directory
  /view/<name>   live-reload viewer for <name>.dot (re-renders when the file changes)
  /play          playground: edit DOT in the browser, rendered server-side by local `dot`
  /svg/<name>    rendered SVG of a .dot file (engine via ?engine=)
  /mtime/<name>  file mtime (viewer poll target)
  /render        POST {dot, engine} -> SVG (playground backend)

stdlib only; renders via the local graphviz binaries so output matches committed artifacts.
Bind: 0.0.0.0:8484 -> reachable at http://ava:8484 on the tailnet/LAN.
"""
import http.server
import json
import os
import re
import subprocess
import urllib.parse

PORT = 8484
DIR = os.path.dirname(os.path.abspath(__file__))
ENGINES = ("dot", "neato", "fdp", "sfdp", "circo", "twopi", "osage", "patchwork")
NAME_RE = re.compile(r"^[A-Za-z0-9._-]+$")

def render_dot(src: str, engine: str = "dot"):
    if engine not in ENGINES:
        return None, f"unknown engine: {engine}"
    try:
        p = subprocess.run(
            ["dot", f"-K{engine}", "-Tsvg"],
            input=src.encode(), capture_output=True, timeout=30,
        )
    except subprocess.TimeoutExpired:
        return None, "render timed out (30s)"
    if p.returncode != 0:
        return None, p.stderr.decode(errors="replace")
    return p.stdout.decode(errors="replace"), p.stderr.decode(errors="replace")

def dot_files():
    return sorted(f[:-4] for f in os.listdir(DIR) if f.endswith(".dot"))

PAGE = """<!doctype html><html><head><meta charset="utf-8"><title>{title}</title>
<style>
 body{{margin:0;font-family:Helvetica,Arial,sans-serif;background:#1e2430;color:#dde3ec}}
 header{{display:flex;gap:1rem;align-items:center;padding:.5rem 1rem;background:#2c3e50;position:sticky;top:0}}
 header a{{color:#7fd4a8;text-decoration:none}} header .t{{font-weight:bold}}
 main{{padding:1rem}} .err{{white-space:pre-wrap;color:#ff8b8b;font-family:monospace;padding:1rem}}
 .svgbox{{background:#fff;border-radius:6px;padding:8px;overflow:auto}}
 select,button{{background:#3a4a5e;color:#dde3ec;border:1px solid #54657c;border-radius:4px;padding:.3rem .6rem}}
 ul.idx li{{margin:.4rem 0}} ul.idx a{{color:#8fc7ff}}
 #wrap{{display:flex;height:calc(100vh - 52px)}}
 #ed{{width:42%;background:#141922;color:#cde2ff;border:none;padding:1rem;font-family:monospace;font-size:13px;resize:none;outline:none}}
 #out{{flex:1;overflow:auto;background:#fff;padding:8px}}
 small{{color:#93a4b8}}
</style></head><body>
<header><span class="t">Cortex design server</span>
 <a href="/">artifacts</a> <a href="/play">playground</a> {extra}</header>
{body}</body></html>"""

VIEW_JS = """
<script>
const name = %NAME%; let last = 0;
async function refresh(force) {
  const m = await (await fetch('/mtime/' + name)).json();
  if (force || m.mtime !== last) {
    last = m.mtime;
    const eng = document.getElementById('eng').value;
    const r = await fetch('/svg/' + name + '?engine=' + eng);
    const t = await r.text();
    document.getElementById('box').innerHTML = r.ok ? t : '<pre class="err">' + t.replace(/</g,'&lt;') + '</pre>';
  }
}
setInterval(() => refresh(false), 1500); refresh(true);
</script>"""

PLAY_JS = """
<script>
let timer = null;
async function rerender() {
  const body = JSON.stringify({dot: document.getElementById('ed').value,
                               engine: document.getElementById('eng').value});
  const r = await fetch('/render', {method:'POST', headers:{'Content-Type':'application/json'}, body});
  const t = await r.text();
  document.getElementById('out').innerHTML = r.ok ? t : '<pre class="err">' + t.replace(/</g,'&lt;') + '</pre>';
}
function arm() { clearTimeout(timer); timer = setTimeout(rerender, 500); }
document.getElementById('ed').addEventListener('input', arm);
document.getElementById('eng').addEventListener('change', rerender);
rerender();
</script>"""

STARTER = """digraph hello {
  rankdir=LR;
  node [shape=box, style=filled, fillcolor="#3498DB", fontcolor=white, fontname="Helvetica"];
  edge [color="#888888"];
  design -> render -> commit -> view;
  view -> design [style=dashed, label="iterate", constraint=false];
}"""

ENGINE_SELECT = '<select id="eng">' + "".join(
    f'<option value="{e}">{e}</option>' for e in ENGINES) + "</select>"

class H(http.server.BaseHTTPRequestHandler):
    def _send(self, code, body, ctype="text/html; charset=utf-8"):
        data = body.encode() if isinstance(body, str) else body
        self.send_response(code)
        self.send_header("Content-Type", ctype)
        self.send_header("Content-Length", str(len(data)))
        self.end_headers()
        self.wfile.write(data)

    def log_message(self, *a):  # quiet
        pass

    def do_GET(self):
        u = urllib.parse.urlparse(self.path)
        parts = [p for p in u.path.split("/") if p]
        q = urllib.parse.parse_qs(u.query)
        if not parts:
            items = "".join(
                f'<li><a href="/view/{n}">{n}</a> <small>(.dot)</small></li>' for n in dot_files())
            return self._send(200, PAGE.format(
                title="Cortex design", extra="",
                body=f'<main><h3>Design artifacts in exploration/design/</h3><ul class="idx">{items}</ul>'
                     f'<p><small>Viewer live-reloads when a .dot file changes on disk.</small></p></main>'))
        if parts[0] == "play":
            body = (f'<div id="wrap"><textarea id="ed" spellcheck="false">{STARTER}</textarea>'
                    f'<div id="out"></div></div>' + PLAY_JS)
            return self._send(200, PAGE.format(title="playground", extra=ENGINE_SELECT, body=body))
        if parts[0] in ("view", "svg", "mtime") and len(parts) == 2 and NAME_RE.match(parts[1]):
            name = parts[1][:-4] if parts[1].endswith(".dot") else parts[1]
            path = os.path.join(DIR, name + ".dot")
            if not os.path.isfile(path):
                return self._send(404, "not found", "text/plain")
            if parts[0] == "mtime":
                return self._send(200, json.dumps({"mtime": os.stat(path).st_mtime}), "application/json")
            if parts[0] == "svg":
                engine = q.get("engine", ["dot"])[0]
                svg, err = render_dot(open(path).read(), engine)
                if svg is None:
                    return self._send(500, err, "text/plain")
                return self._send(200, svg, "image/svg+xml")
            body = (f'<main><h3>{name}.dot <small>edit the file; this view live-reloads</small></h3>'
                    f'<div class="svgbox" id="box">loading…</div></main>'
                    + VIEW_JS.replace("%NAME%", json.dumps(name)))
            return self._send(200, PAGE.format(title=name, extra=ENGINE_SELECT, body=body))
        return self._send(404, "not found", "text/plain")

    def do_POST(self):
        if self.path != "/render":
            return self._send(404, "not found", "text/plain")
        try:
            n = int(self.headers.get("Content-Length", 0))
            req = json.loads(self.rfile.read(n))
            svg, err = render_dot(req.get("dot", ""), req.get("engine", "dot"))
        except Exception as e:  # malformed request
            return self._send(400, str(e), "text/plain")
        if svg is None:
            return self._send(422, err, "text/plain")
        return self._send(200, svg, "image/svg+xml")

if __name__ == "__main__":
    os.chdir(DIR)
    with http.server.ThreadingHTTPServer(("0.0.0.0", PORT), H) as srv:
        print(f"cortex design server on http://0.0.0.0:{PORT} serving {DIR}")
        srv.serve_forever()
