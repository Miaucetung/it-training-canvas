"""Inspect drag-drop question format in the PDF."""
import fitz
import json
import sys
import re

sys.stdout.reconfigure(encoding="utf-8")
doc = fitz.open(r"C:\Users\mmuja\llmWiki\ClaudeCodeWiki\raw\00 - FragenBeantwortetKomplett200_301.pdf")
questions_json = json.loads(open(r"notes/ccna-exam/questions.json", encoding="utf-8").read())
dd_qs = [q for q in questions_json if q["type"] == "drag-drop"]
print(f"Total drag-drop: {len(dd_qs)}")
print()

for q in dd_qs[:10]:
    page_idx = q["sourcePage"] - 1
    page = doc[page_idx]
    print(f"=== {q['id']} page={q['sourcePage']} ===")
    print(f"text: {q['text'][:300]}")
    print(f"options: {q['options']}")
    print(f"exhibitImages: {q['exhibitImages']}")
    print(f"correctAnswer: {q['correctAnswer']}")
    print()

    # Look for colored rects (non-white, non-transparent)
    print("-- COLORED RECTS --")
    for path in page.get_drawings():
        fill = path.get("fill")
        if fill and len(fill) >= 3:
            if not all(abs(fill[i] - 1.0) < 0.05 for i in range(3)):  # not white
                r = path.get("rect")
                if r and (r.x1 - r.x0) > 20 and (r.y1 - r.y0) > 5:
                    print(f"  fill={tuple(round(x,3) for x in fill)}  rect=({r.x0:.0f},{r.y0:.0f},{r.x1:.0f},{r.y1:.0f})")

    # Print ALL text, flagging after Correct Answer
    print("-- PAGE TEXT --")
    all_lines = []
    for block in page.get_text("dict")["blocks"]:
        if "lines" not in block:
            continue
        for line in block["lines"]:
            txt = "".join(s.get("text", "") for s in line["spans"]).strip()
            if txt:
                all_lines.append((line["bbox"], txt))
    all_lines.sort(key=lambda t: (t[0][1], t[0][0]))
    after_correct = False
    for bbox, txt in all_lines:
        if "Correct Answer" in txt:
            after_correct = True
        marker = " <-- ANSWER AREA" if after_correct else ""
        print(f"  y={bbox[1]:.0f}-{bbox[3]:.0f}  {repr(txt)}{marker}")

    imgs = page.get_images(full=True)
    print(f"-- IMAGES: {len(imgs)} --")
    for img in imgs:
        # get bbox of image on page
        print(f"  xref={img[0]} name={img[7]} w={img[2]} h={img[3]}")
    print()
