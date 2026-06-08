"""Inspect drag-drop question format in the PDF."""
import fitz
import json
import sys

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
    print(f"text excerpt: {q['text'][:300]}")
    print(f"options: {q['options']}")
    print(f"exhibitImages: {q['exhibitImages']}")
    print(f"correctAnswer: {q['correctAnswer']}")
    print()

    # Look for green rects on this page
    from scripts.extract_ccna_exam_utils import green_rects_on_page
    pass

    # Look for colored rects (any color)
    print("-- COLORED RECTS (non-white, non-black) --")
    for path in page.get_drawings():
        fill = path.get("fill")
        if fill and fill != (1,1,1) and fill != (0,0,0) and fill is not None:
            r = path.get("rect")
            if r:
                print(f"  fill={fill}  rect=({r.x0:.0f},{r.y0:.0f},{r.x1:.0f},{r.y1:.0f})")

    # Print ALL text on that page, looking specifically for content AFTER 'Correct Answer:'
    print("-- RAW PAGE TEXT (full) --")
    after_correct = False
    for block in page.get_text("dict")["blocks"]:
        if "lines" not in block:
            continue
        for line in block["lines"]:
            txt = "".join(s.get("text", "") for s in line["spans"]).strip()
            if txt:
                if "Correct Answer" in txt:
                    after_correct = True
                marker = " *** AFTER CORRECT ANSWER ***" if after_correct else ""
                print(f"  y={line['bbox'][1]:.0f}-{line['bbox'][3]:.0f}  {repr(txt)}{marker}")

    # Images on this page
    imgs = page.get_images(full=True)
    print(f"-- IMAGES ON PAGE: {len(imgs)} --")
    for img in imgs:
        print(f"  xref={img[0]} name={img[7]} w={img[2]} h={img[3]}")
    print()
