const fs = require("fs");
const { execSync } = require("child_process");
const path = require("path");
const { logHook } = require("./log-util");
logHook("typecheck-on-edit");

let input;
try {
  input = JSON.parse(fs.readFileSync(0, "utf8"));
} catch {
  process.exit(0);
}

const filePath = (input.tool_input?.file_path || "").replace(/\\/g, "/");

// Only type-check TypeScript files
if (!/\.(ts|tsx)$/.test(filePath)) {
  process.exit(0);
}

// Find the nearest tsconfig.json by walking up from the edited file
const projectDir =
  process.env.CLAUDE_PROJECT_DIR || path.resolve(__dirname, "../..");

// Look for tsconfig.json in project root or common subdirectories
const candidates = [
  projectDir,
  path.join(projectDir, "src"),
];

let tsconfigDir = null;
for (const dir of candidates) {
  if (fs.existsSync(path.join(dir, "tsconfig.json"))) {
    tsconfigDir = dir;
    break;
  }
}

// Also check if the edited file's directory tree has a tsconfig
if (!tsconfigDir) {
  let check = path.dirname(filePath);
  while (check.length > projectDir.length) {
    if (fs.existsSync(path.join(check, "tsconfig.json"))) {
      tsconfigDir = check;
      break;
    }
    check = path.dirname(check);
  }
}

if (!tsconfigDir) {
  process.exit(0); // No tsconfig found, skip
}

try {
  execSync("npx tsc --noEmit --pretty", {
    cwd: tsconfigDir,
    encoding: "utf8",
    timeout: 25000,
    stdio: ["pipe", "pipe", "pipe"],
  });
} catch (e) {
  const errors = (e.stdout || e.stderr || e.message)
    .split("\n")
    .slice(0, 20)
    .join("\n");
  process.stderr.write(errors);
  process.exit(2);
}
