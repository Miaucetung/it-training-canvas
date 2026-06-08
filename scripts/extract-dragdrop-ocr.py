"""
extract-dragdrop-ocr.py  (v2)
==============================
Extracts structured drag-drop question data for all 84 CCNA drag-drop questions.

Uses row-based word grouping from pytesseract image_to_data() to split
individual box items correctly instead of merging them.
"""
from __future__ import annotations

import json
import sys
from pathlib import Path
import fitz  # PyMuPDF
from PIL import Image, ImageEnhance, ImageOps
import pytesseract
import io

pytesseract.pytesseract.tesseract_cmd = r"C:\Program Files\Tesseract-OCR\tesseract.exe"

SRC_PDF = Path(r"C:\Users\mmuja\llmWiki\ClaudeCodeWiki\raw\00 - FragenBeantwortetKomplett200_301.pdf")
QS_JSON = Path("notes/ccna-exam/questions.json")
IMG_DIR = Path("notes/ccna-exam/images")

sys.stdout.reconfigure(encoding="utf-8")


# ── Image preprocessing ────────────────────────────────────────────────────────

def prepare_for_ocr(pil_img: Image.Image) -> Image.Image:
    w, h = pil_img.size
    scale = max(1, 400 // min(w, h))
    if scale > 1:
        pil_img = pil_img.resize((w * scale, h * scale), Image.LANCZOS)
    gray = pil_img.convert("L")
    gray = ImageOps.autocontrast(gray, cutoff=2)
    gray = ImageEnhance.Sharpness(gray).enhance(2.0)
    return gray


# ── Row-based OCR extraction ───────────────────────────────────────────────────

def extract_column_items(full_img: Image.Image, left: bool) -> list[str]:
    """
    Extract text items from left or right column using word-level bounding boxes.
    Words with similar y-positions form a line; lines separated by vertical gaps
    form individual items (one item = one visual box in the drag-drop interface).
    """
    w, h = full_img.size
    mid_x = w * 0.50

    # Scale up for OCR
    scale = 3
    scaled = full_img.resize((w * scale, h * scale), Image.LANCZOS)
    gray = ImageOps.autocontrast(scaled.convert("L"), cutoff=2)
    gray = ImageEnhance.Sharpness(gray).enhance(2.0)

    try:
        data = pytesseract.image_to_data(
            gray,
            config="--psm 6 --oem 3 -l eng",
            output_type=pytesseract.Output.DICT,
        )
    except Exception as e:
        print(f"    [OCR error] {e}")
        return []

    # Collect words for target column (scale coords back to original)
    words: list[tuple] = []  # (y0, y1, x_center, text)
    for i in range(len(data["text"])):
        raw_txt = str(data["text"][i]).strip()
        if not raw_txt:
            continue
        try:
            conf = int(data["conf"][i])
        except (ValueError, TypeError):
            conf = 0
        if conf < 10:
            continue

        x0 = data["left"][i] / scale
        y0 = data["top"][i] / scale
        x1 = (data["left"][i] + data["width"][i]) / scale
        y1 = (data["top"][i] + data["height"][i]) / scale
        xc = (x0 + x1) / 2

        is_left_col = xc < mid_x
        if (left and is_left_col) or (not left and not is_left_col):
            words.append((y0, y1, xc, raw_txt))

    if not words:
        return []

    words.sort(key=lambda t: (t[0], t[2]))

    # Group into lines (words within LINE_BAND px vertically = same line)
    LINE_BAND = 10
    lines: list[list[tuple]] = []
    cur_line: list[tuple] = []
    cur_y_end = -999.0

    for word in words:
        y0, y1, xc, txt = word
        if y0 > cur_y_end + LINE_BAND and cur_line:
            lines.append(cur_line)
            cur_line = []
        cur_line.append(word)
        cur_y_end = max(cur_y_end, y1)
    if cur_line:
        lines.append(cur_line)

    # Compute gap threshold from median line height
    if not lines:
        return []
    heights = [max(w[1] for w in ln) - min(w[0] for w in ln) for ln in lines]
    med_h = sorted(heights)[len(heights) // 2]
    GAP = max(5.0, med_h * 0.7)

    # Group lines into items
    items: list[str] = []
    cur_item: list[list[tuple]] = []
    prev_end = max(w[1] for w in lines[0])

    for ln in lines:
        y_top = min(w[0] for w in ln)
        gap = y_top - prev_end
        if gap > GAP and cur_item:
            text = " ".join(
                " ".join(w[3] for w in sorted(l, key=lambda t: t[2]))
                for l in cur_item
            ).strip()
            if text and len(text) > 1:
                items.append(text)
            cur_item = []
        cur_item.append(ln)
        prev_end = max(w[1] for w in ln)

    if cur_item:
        text = " ".join(
            " ".join(w[3] for w in sorted(l, key=lambda t: t[2]))
            for l in cur_item
        ).strip()
        if text and len(text) > 1:
            items.append(text)

    # Filter out visual labels
    SKIP = {"answer area", "select and place", "select and place:"}
    items = [i for i in items if i.lower().strip() not in SKIP]
    return items


def is_answer_state(pil_img: Image.Image) -> bool:
    """True if right column is blue (answer placed) vs yellow/beige (empty targets)."""
    w, h = pil_img.size
    sample = pil_img.crop((w * 2 // 3, h // 4, w - 5, h * 3 // 4)).convert("RGB")
    pixels = list(sample.getdata())
    if not pixels:
        return False
    blue = sum(1 for r, g, b in pixels if g > 140 and b > 155 and r < g and r < b)
    beige = sum(1 for r, g, b in pixels if r > 180 and g > 160 and b < 180 and r > b)
    return blue > beige


# ── Spatial image extraction from PDF ─────────────────────────────────────────

def get_images_for_page(doc: fitz.Document, page_idx: int, all_qs: list[dict]) -> dict[str, list[tuple]]:
    page = doc[page_idx]
    assignment: dict[str, list[tuple]] = {q["id"]: [] for q in all_qs}

    q_starts: list[tuple] = []
    for q in all_qs:
        qid_clean = q["id"].replace(" ", "")
        for block in page.get_text("dict")["blocks"]:
            if "lines" not in block:
                continue
            for line in block["lines"]:
                txt = "".join(s.get("text", "") for s in line["spans"]).strip().replace(" ", "")
                if txt == qid_clean:
                    q_starts.append((q["id"], line["bbox"][1]))
                    break
    q_starts.sort(key=lambda x: x[1])

    for img_info in page.get_images(full=True):
        xref = img_info[0]
        try:
            rects = page.get_image_rects(xref)
        except Exception:
            continue
        if not rects:
            continue
        img_y = (rects[0].y0 + rects[0].y1) / 2

        best_qid = q_starts[0][0] if q_starts else None
        for qid, qy in q_starts:
            if qy <= img_y:
                best_qid = qid
        if best_qid is None and q_starts:
            best_qid = q_starts[0][0]

        try:
            bi = doc.extract_image(xref)
            if bi:
                pil = Image.open(io.BytesIO(bi["image"]))
                assignment[best_qid].append((pil, img_y, bi["ext"]))
        except Exception as e:
            print(f"    [img err] xref={xref}: {e}")

    return assignment


# ── Per-question processing ────────────────────────────────────────────────────

def save_pil(pil: Image.Image, ext: str, qid: str, suffix: str) -> str:
    out_ext = "png" if ext.lower() in ("png", "jpx", "jb2") else "jpg"
    fname = f"{qid}-{suffix}.{out_ext}"
    pil.save(str(IMG_DIR / fname))
    return fname


def process_dd_question(q: dict, images: list[tuple]) -> dict:
    """images: [(pil, y_center, ext), ...] assigned to this question."""
    qid = q["id"]
    updated = dict(q)
    updated.setdefault("dragItems", [])
    updated.setdefault("dropTargets", [])
    updated.setdefault("correctMapping", [])
    updated.setdefault("questionStateImage", None)
    updated.setdefault("answerStateImage", None)

    if not images:
        return updated

    imgs_sorted = sorted(images, key=lambda t: t[1])  # sort by y (ascending)

    # Separate state vs answer images by color analysis
    state_imgs = [t for t in imgs_sorted if not is_answer_state(t[0])]
    answer_imgs = [t for t in imgs_sorted if is_answer_state(t[0])]

    # Fallback: if color analysis can't distinguish, use position order
    if not state_imgs and not answer_imgs:
        state_imgs = [imgs_sorted[0]] if len(imgs_sorted) >= 1 else []
        answer_imgs = [imgs_sorted[-1]] if len(imgs_sorted) >= 2 else []
    elif not state_imgs and answer_imgs:
        # All classified as answer — first one by y is probably state
        state_imgs = [answer_imgs[0]]
        answer_imgs = answer_imgs[1:]
    elif not answer_imgs and state_imgs:
        # All classified as state — last one is probably answer
        answer_imgs = [state_imgs[-1]]
        state_imgs = state_imgs[:-1]

    # If 3+ images, skip the first (likely exhibit diagram)
    if len(imgs_sorted) >= 3:
        non_exhibit = imgs_sorted[1:]  # skip first
        state_imgs = [t for t in non_exhibit if not is_answer_state(t[0])]
        answer_imgs = [t for t in non_exhibit if is_answer_state(t[0])]
        if not state_imgs:
            state_imgs = [non_exhibit[0]]
        if not answer_imgs and len(non_exhibit) >= 2:
            answer_imgs = [non_exhibit[-1]]

    # Save images
    if state_imgs:
        pil, _, ext = state_imgs[0]
        updated["questionStateImage"] = save_pil(pil, ext, qid, "state")

    if answer_imgs:
        pil, _, ext = answer_imgs[0]
        updated["answerStateImage"] = save_pil(pil, ext, qid, "answer")

    # OCR
    if state_imgs:
        pil = state_imgs[0][0]
        updated["dragItems"] = extract_column_items(pil, left=True)
        updated["dropTargets"] = extract_column_items(pil, left=False)

    if answer_imgs:
        pil = answer_imgs[0][0]
        updated["correctMapping"] = extract_column_items(pil, left=False)

    di = len(updated["dragItems"])
    dt = len(updated["dropTargets"])
    cm = len(updated["correctMapping"])
    print(f"  {qid}: items={di} targets={dt} mapping={cm}  state={updated['questionStateImage']} answer={updated['answerStateImage']}")
    if updated["dragItems"]:
        print(f"    drag: {[x[:25] for x in updated['dragItems']]}")
    if updated["correctMapping"]:
        print(f"    mapping: {[x[:25] for x in updated['correctMapping']]}")

    return updated


# ── Main ──────────────────────────────────────────────────────────────────────

def main():
    doc = fitz.open(SRC_PDF)
    data: list[dict] = json.loads(QS_JSON.read_text(encoding="utf-8"))
    dd_qs = [q for q in data if q["type"] == "drag-drop"]
    print(f"Processing {len(dd_qs)} drag-drop questions...")

    pages: dict[int, list[dict]] = {}
    for q in dd_qs:
        pages.setdefault(q["sourcePage"] - 1, []).append(q)

    id_to_updated: dict[str, dict] = {}

    for page_idx, qs_on_page in sorted(pages.items()):
        all_on_page = [q for q in data if q["sourcePage"] == page_idx + 1]
        print(f"\nPage {page_idx + 1}: {[q['id'] for q in qs_on_page]}")
        assignment = get_images_for_page(doc, page_idx, all_on_page)

        for q in qs_on_page:
            imgs = assignment.get(q["id"], [])
            updated = process_dd_question(q, imgs)
            id_to_updated[q["id"]] = updated

    for i, q in enumerate(data):
        if q["id"] in id_to_updated:
            data[i] = id_to_updated[q["id"]]

    QS_JSON.write_text(json.dumps(data, ensure_ascii=False, indent=2), encoding="utf-8")

    good = sum(
        1 for q in id_to_updated.values()
        if len(q.get("dragItems", [])) > 1 and len(q.get("correctMapping", [])) > 1
    )
    print(f"\n=== Done: {good}/{len(dd_qs)} questions with full interactive data ===")


if __name__ == "__main__":
    main()
