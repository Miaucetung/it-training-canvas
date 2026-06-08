"""Debug actual unicode codepoints of option bullet character."""
import fitz

PDF = r"C:\Users\mmuja\llmWiki\ClaudeCodeWiki\raw\00 - FragenBeantwortetKomplett200_301.pdf"
d = fitz.open(PDF)

p = d[0]  # page 1 has Q0001 options

print("=== get_text() plain output (first 30 lines) ===")
for i, ln in enumerate(p.get_text().split("\n")[:30]):
    if ln.strip():
        hexcodes = " ".join(f"U+{ord(c):04X}" for c in ln[:8])
        print(f"  {repr(ln[:60])}")
        print(f"    hex: {hexcodes}")

print()
print("=== get_text('dict') span texts for option lines ===")
for block in p.get_text("dict")["blocks"]:
    if "lines" not in block:
        continue
    for line in block["lines"]:
        full = "".join(s.get("text","") for s in line["spans"])
        if full.strip() and ("A." in full or "B." in full or "C." in full or "route" in full.lower()):
            print(f"  FULL: {repr(full[:60])}")
            for s in line["spans"]:
                t = s.get("text","")
                if t.strip():
                    hexcodes = " ".join(f"U+{ord(c):04X}" for c in t[:10])
                    print(f"    span: {repr(t[:40])}  hex={hexcodes}")

import fitz
import re

PDF = r"C:\Users\mmuja\llmWiki\ClaudeCodeWiki\raw\00 - FragenBeantwortetKomplett200_301.pdf"
d = fitz.open(PDF)
GREEN = (0.5058823823928833, 0.8313725590705872, 0.10196078568696976)
TOL = 0.02

def is_green(fill):
    if not fill or len(fill) < 3:
        return False
    return all(abs(fill[i]-GREEN[i]) < TOL for i in range(3))

# Print full text + green rect coords for pages 1, 4, 7
for page_num in [0, 3, 6, 10, 20]:
    p = d[page_num]
    green_rects = []
    for path in p.get_drawings():
        if is_green(path.get("fill")):
            r = path.get("rect")
            if r:
                green_rects.append((r.x0, r.y0, r.x1, r.y1))

    if not green_rects:
        continue

    print(f"\n{'='*60}")
    print(f"PAGE {page_num+1}: {len(green_rects)} green rects")
    for gr in green_rects:
        print(f"  GREEN: y={gr[1]:.1f}-{gr[3]:.1f}")

    print("\n  RAW TEXT (each line + y-coord):")
    for block in p.get_text("dict")["blocks"]:
        if "lines" not in block:
            continue
        for line in block["lines"]:
            txt = "".join(s.get("text","") for s in line["spans"]).strip()
            if not txt:
                continue
            bb = line["bbox"]
            # Mark if this line's y-range overlaps a green rect
            mark = ""
            for gr in green_rects:
                if not (bb[3]+5 <= gr[1] or gr[3] <= bb[1]-5):
                    mark = " <-- GREEN OVERLAP"
                    break
            print(f"  y={bb[1]:.1f}-{bb[3]:.1f}  |  {txt[:80]}{mark}")

import fitz

PDF = r"C:\Users\mmuja\llmWiki\ClaudeCodeWiki\raw\00 - FragenBeantwortetKomplett200_301.pdf"
d = fitz.open(PDF)
GREEN = (0.5058823823928833, 0.8313725590705872, 0.10196078568696976)
TOL = 0.02

def is_green(fill):
    if not fill or len(fill) < 3:
        return False
    return all(abs(fill[i]-GREEN[i]) < TOL for i in range(3))

# Pages 1, 4, 5 have drawings with green fill
for page_num in [0, 3, 4, 6, 7]:
    p = d[page_num]
    paths = p.get_drawings()
    green_paths = [pt for pt in paths if is_green(pt.get("fill"))]
    print(f"\n=== Page {page_num+1}: {len(paths)} drawings, {len(green_paths)} green ===")
    for pt in green_paths[:5]:
        print(f"  fill={pt.get('fill')}  rect={pt.get('rect')}  items_count={len(pt.get('items',[]))}")

    if green_paths:
        print("  Option lines:")
        for block in p.get_text("rawdict")["blocks"]:
            if "lines" not in block:
                continue
            for line in block["lines"]:
                txt = "".join(s.get("text","") for s in line["spans"]).strip()
                if not txt:
                    continue
                bb = line["bbox"]
                print(f"    bbox=({bb[0]:.1f},{bb[1]:.1f},{bb[2]:.1f},{bb[3]:.1f}) | {txt[:70]}")

import fitz

PDF = r"C:\Users\mmuja\llmWiki\ClaudeCodeWiki\raw\00 - FragenBeantwortetKomplett200_301.pdf"
d = fitz.open(PDF)
GREEN = (0.5058823823928833, 0.8313725590705872, 0.10196078568696976)
TOL = 0.02

def is_green(fill):
    if not fill or len(fill) < 3: return False
    return all(abs(fill[i]-GREEN[i]) < TOL for i in range(3))

p = d[1]  # page 2 index

print("=== Drawings on page 2 ===")
for path in p.get_drawings():
    fill = path.get("fill")
    if fill:
        r = path.get("rect")
        g = is_green(fill)
        print(f"  fill={fill}  green={g}  rect={r}")

print()
print("=== All lines on page 2 ===")
for block in p.get_text("rawdict")["blocks"]:
    if "lines" not in block:
        continue
    for line in block["lines"]:
        txt = "".join(s.get("text","") for s in line["spans"]).strip()
        if txt:
            bb = line["bbox"]
            bbs = [round(x,1) for x in bb]
            print(f"  bbox={bbs}  | {txt[:80]}")
