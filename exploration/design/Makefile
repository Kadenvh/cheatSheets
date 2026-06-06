# Render all .dot design artifacts to SVG (committed) and high-dpi PNG (chat surfaces)
# Usage: make            (or: make diagrams)
#        make clean
DOTS := $(wildcard *.dot)
SVGS := $(DOTS:.dot=.svg)
PNGS := $(DOTS:.dot=.png)

diagrams: $(SVGS) $(PNGS)

%.svg: %.dot
	dot -Tsvg $< -o $@

%.png: %.dot
	dot -Tpng -Gdpi=150 $< -o $@

clean:
	rm -f $(SVGS) $(PNGS)

.PHONY: diagrams clean
