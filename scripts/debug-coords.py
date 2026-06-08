"""Debug coordinate matching on pages with known green fills."""
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
