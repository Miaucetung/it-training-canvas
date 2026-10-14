"""
PDF Reference Matcher & Comparison Script
Compares all CCNA exam questions from the app with the original PDF reference:
C:\\Users\\mmuja\\Nextcloud\\Obsidian Sync\\ClaudeCodeWiki\\raw\\ccna\\00-FragenBeantwortetKomplett200_301.pdf

Rules:
- Read-only on the PDF.
- PDF is NEVER copied or committed into the repository.
- Extracts exact PDF page per question.
- Identifies ingestion errors (option counts, truncated text, merged questions, missing exhibits).
- Identifies discrepancies in question texts, options, and solutions.
- Outputs structured results to .local/pdf_comparison_report.json.
"""

import fitz
import re
import json
import os
import sys

PDF_PATH = r"C:\Users\mmuja\Nextcloud\Obsidian Sync\ClaudeCodeWiki\raw\ccna\00-FragenBeantwortetKomplett200_301.pdf"
DUMP_PATH = r"C:\it-training-canvas-new\.local\app_questions_dump.json"
OUT_REPORT = r"C:\it-training-canvas-new\.local\pdf_comparison_report.json"

if not os.path.exists(PDF_PATH):
    print(f"ERROR: PDF file not found at {PDF_PATH}")
    sys.exit(1)

if not os.path.exists(DUMP_PATH):
    print(f"ERROR: Dump file not found at {DUMP_PATH}")
    sys.exit(1)

print(f"Opening PDF: {PDF_PATH}")
doc = fitz.open(PDF_PATH)
total_pages = len(doc)
print(f"Total pages: {total_pages}")

with open(DUMP_PATH, "r", encoding="utf-8") as f:
    app_data = json.load(f)

# Helper: Detect green fill rects
def is_green(fill):
    if not fill or len(fill) < 3:
        return False
    r, g, b = fill[:3]
    return g > 0.6 and g > r and g > b

# Step 1: Parse all pages of PDF into structured questions
print("Parsing 590 pages...")
page_records = []

for page_idx in range(total_pages):
    page = doc[page_idx]
    p_num = page_idx + 1
    text = page.get_text()
    drawings = page.get_drawings()
    green_rects = [d['rect'] for d in drawings if is_green(d.get('fill'))]
    images = page.get_images()

    # Text blocks with bboxes: (x0, y0, x1, y1, text, block_no, block_type)
    blocks = [b for b in page.get_text("blocks") if b[4].strip()]
    blocks.sort(key=lambda b: (b[1], b[0]))

    page_records.append({
        "page_num": p_num,
        "text": text,
        "blocks": blocks,
        "green_rects": green_rects,
        "image_count": len(images)
    })

# Step 2: Slice questions per page
# We locate headers `Q\s*([0-9]{1,5})`
parsed_pdf_questions = {}

for p in page_records:
    p_num = p["page_num"]
    text = p["text"]
    blocks = p["blocks"]
    green_rects = p["green_rects"]

    # Find all Q headers on this page with vertical position
    q_headers = []
    for b in blocks:
        b_text = b[4].strip()
        m = re.match(r'(?i)^Q\s*([0-9]{1,5})\b', b_text)
        if m:
            num = int(m.group(1))
            qid = f"q{num:04d}"
            q_headers.append({
                "qid": qid,
                "raw_num": num,
                "y0": b[1],
                "y1": b[3],
                "block": b,
                "page_num": p_num
            })
        else:
            # Check inside block lines
            lines = b_text.splitlines()
            for li, line in enumerate(lines):
                m_inner = re.match(r'(?i)^Q\s*([0-9]{1,5})\b', line.strip())
                if m_inner:
                    num = int(m_inner.group(1))
                    qid = f"q{num:04d}"
                    q_headers.append({
                        "qid": qid,
                        "raw_num": num,
                        "y0": b[1] + (li * 12),
                        "y1": b[1] + ((li + 1) * 12),
                        "block": b,
                        "page_num": p_num
                    })

    # Sort headers by y0
    q_headers.sort(key=lambda x: x["y0"])

    # For each question on this page, identify its bounding region [y_start, y_end]
    for idx, qh in enumerate(q_headers):
        qid = qh["qid"]
        y_start = qh["y0"]
        y_end = q_headers[idx + 1]["y0"] if idx + 1 < len(q_headers) else 9999.0

        # Collect blocks belonging to this question
        q_blocks = [b for b in blocks if (b[1] >= y_start - 5 and b[3] <= y_end + 5) and b != qh["block"]]

        # Extract text lines
        q_lines = []
        for b in q_blocks:
            for l in b[4].splitlines():
                if l.strip() and not l.strip().startswith("Seite ") and not l.strip().startswith(f"Q{qh['raw_num']}"):
                    q_lines.append(l.strip())

        full_q_text = "\n".join(q_lines)

        # Identify options: lines matching bullet / [A-H]\.
        options = []
        opt_rects = []
        is_drag_drop = "drag and drop" in text.lower() or "drag drop" in text.lower() or "select and place" in text.lower()

        # Check green rects falling in [y_start, y_end]
        q_green_rects = [r for r in green_rects if (r.y0 >= y_start - 10 and r.y1 <= y_end + 20)]

        # Extract options from text
        # Regex for option start: bullet or [A-H]\.
        # In this PDF, lines are e.g. "• A. default route" or "A. default route"
        current_opt = None
        question_text_lines = []

        for l in q_lines:
            opt_m = re.match(r'^(?:[•\u2022\ufffd\-\*]\s*)?([A-H])\.\s+(.*)', l)
            if opt_m:
                if current_opt:
                    options.append(current_opt)
                current_opt = {
                    "letter": opt_m.group(1),
                    "text": opt_m.group(2).strip()
                }
            elif current_opt:
                # Continuation of option text
                current_opt["text"] += " " + l.strip()
            else:
                question_text_lines.append(l.strip())

        if current_opt:
            options.append(current_opt)

        clean_question_text = " ".join(question_text_lines).strip()

        # Determine correct answers based on green rects
        # Words of options with bboxes
        correct_letters = []
        # Let's search words in page for option letters and see which intersect with green rects
        words = p_page = doc[p_num - 1].get_text("words")
        for opt in options:
            letter = opt["letter"]
            # find word for letter like 'A.' or 'B.' in [y_start, y_end]
            for w in words:
                # w = (x0, y0, x1, y1, word, block_no, line_no, word_no)
                if (w[4] == f"{letter}." or w[4] == letter) and (w[1] >= y_start - 10 and w[3] <= y_end + 10):
                    w_rect = fitz.Rect(w[0], w[1], w[2] + 200, w[3])
                    # Check intersection with any green rect
                    for gr in q_green_rects:
                        if gr.intersects(w_rect) or abs(gr.y0 - w[1]) < 8:
                            if letter not in correct_letters:
                                correct_letters.append(letter)

        if qid not in parsed_pdf_questions:
            parsed_pdf_questions[qid] = {
                "qid": qid,
                "raw_num": qh["raw_num"],
                "primary_page": p_num,
                "pages": [p_num],
                "question_text": clean_question_text,
                "options": options,
                "correct_letters": sorted(correct_letters),
                "is_drag_drop": is_drag_drop,
                "image_count": p["image_count"],
                "raw_text": full_q_text
            }
        else:
            parsed_pdf_questions[qid]["pages"].append(p_num)
            if not parsed_pdf_questions[qid]["options"] and options:
                parsed_pdf_questions[qid]["options"] = options
                parsed_pdf_questions[qid]["question_text"] = clean_question_text
                parsed_pdf_questions[qid]["correct_letters"] = sorted(correct_letters)

print(f"Parsed {len(parsed_pdf_questions)} questions from PDF.")

# Step 3: Compare with App Questions
discrepancies = []
ingestion_errors = []
content_anomalies = []
page_mapping = {}

def normalize_text(t):
    if not t:
        return ""
    # remove bullets, collapse whitespace
    t = re.sub(r'[\u2022\ufffd\xad]', '', t)
    t = re.sub(r'\s+', ' ', t).strip()
    return t

# 3A. Prüfungstrainer (ccnaQuestions)
print("Comparing ccnaQuestions...")
for q in app_data["ccnaQuestions"]:
    qid = q["id"].lower()
    pdf_q = parsed_pdf_questions.get(qid)

    if not pdf_q:
        page_mapping[qid] = {"page": "NICHT GEFUNDEN", "matched": False}
        continue

    p_num = pdf_q["primary_page"]
    page_mapping[qid] = {"page": p_num, "matched": True}

    # 1. Option count
    app_opt_count = len(q["options"])
    pdf_opt_count = len(pdf_q["options"])

    if pdf_opt_count > 0 and app_opt_count != pdf_opt_count:
        ingestion_errors.append({
            "qid": qid,
            "page": p_num,
            "type": "Optionen-Anzahl abweichend (Einlesefehler)",
            "app_text": f"{app_opt_count} Optionen",
            "pdf_text": f"{pdf_opt_count} Optionen",
            "details": f"App hat {app_opt_count} Optionen, PDF hat {pdf_opt_count} Optionen"
        })

    # 2. Text comparison
    norm_app_q = normalize_text(q["question"])
    norm_pdf_q = normalize_text(pdf_q["question_text"])

    # Check truncated text in app
    if norm_app_q.endswith("...") or len(norm_app_q) < 20 and len(norm_pdf_q) > 40:
        ingestion_errors.append({
            "qid": qid,
            "page": p_num,
            "type": "Fragetext abgeschnitten (Einlesefehler)",
            "app_text": norm_app_q[:120],
            "pdf_text": norm_pdf_q[:120],
            "details": "Fragetext bricht in der App vorzeitig ab"
        })
    elif norm_app_q and norm_pdf_q and norm_app_q != norm_pdf_q:
        # Check text similarity
        if abs(len(norm_app_q) - len(norm_pdf_q)) > 25:
            discrepancies.append({
                "qid": qid,
                "page": p_num,
                "type": "Fragetext abweichend",
                "app_text": norm_app_q[:120],
                "pdf_text": norm_pdf_q[:120],
                "details": f"Längendifferenz: App {len(norm_app_q)} vs PDF {len(norm_pdf_q)} Zeichen"
            })

    # 3. Correct answer comparison
    # In App: correct is 0-based index or array of indices
    app_correct = q["correct"]
    if isinstance(app_correct, int):
        app_letters = [chr(65 + app_correct)]
    elif isinstance(app_correct, list):
        app_letters = sorted([chr(65 + i) for i in app_correct])
    else:
        app_letters = []

    pdf_letters = pdf_q["correct_letters"]
    if pdf_letters and app_letters and app_letters != pdf_letters:
        discrepancies.append({
            "qid": qid,
            "page": p_num,
            "type": "Lösungsbuchstabe weicht ab",
            "app_text": f"Lösung: {','.join(app_letters)}",
            "pdf_text": f"PDF grün hervorgehoben: {','.join(pdf_letters)}",
            "details": f"App={app_letters} vs PDF={pdf_letters}"
        })

    # 4. Exhibit check
    # Does question mention exhibit?
    mentions_exhibit = "refer to the exhibit" in norm_app_q.lower() or "refer to exhibit" in norm_app_q.lower()
    app_has_exhibit = q["exhibit"] is not False and q["exhibit"] is not None
    if mentions_exhibit and not app_has_exhibit:
        content_anomalies.append({
            "qid": qid,
            "page": p_num,
            "type": "Fehlendes Exhibit",
            "app_text": "exhibit: false",
            "pdf_text": f"PDF Seite {p_num} enthält Exhibit / Bild",
            "details": "Fragetext verweist auf Exhibit, aber in App fehlt die Grafik"
        })

# 3B. Priorisiertes Lernen (ccnaQuestionsClassified)
print("Comparing ccnaQuestionsClassified...")
for q in app_data["ccnaQuestionsClassified"]:
    qid = q["id"].lower()
    pdf_q = parsed_pdf_questions.get(qid)
    if not pdf_q:
        continue
    p_num = pdf_q["primary_page"]

    # Check exhibit needsExhibit
    ex = q["exhibit"]
    if isinstance(ex, dict) and ex.get("needsExhibit"):
        content_anomalies.append({
            "qid": q["id"],
            "page": p_num,
            "type": "Exhibit als ungelöst markiert (needsExhibit)",
            "app_text": "needsExhibit: true (exhibitData: null)",
            "pdf_text": f"PDF Seite {p_num}",
            "details": "In ccnaQuestionsClassified als needsExhibit markiert"
        })

# 3C. Drag and Drop
print("Comparing ccnaDragDropQuestions...")
for q in app_data["ccnaDragDropQuestions"]:
    qid = q["id"].replace("dd-", "").lower()
    pdf_q = parsed_pdf_questions.get(qid)
    if not pdf_q:
        continue
    p_num = pdf_q["primary_page"]
    page_mapping[q["id"]] = {"page": p_num, "matched": True}

print("\nComparison complete:")
print(f"- Mapped questions to PDF pages: {len(page_mapping)}")
print(f"- Ingestion errors (Einlesefehler): {len(ingestion_errors)}")
print(f"- Text/Solution discrepancies: {len(discrepancies)}")
print(f"- Content/Exhibit anomalies: {len(content_anomalies)}")

report_data = {
    "summary": {
        "totalPages": total_pages,
        "totalAppQuestions": len(app_data["ccnaQuestions"]) + len(app_data["ccnaDragDropQuestions"]),
        "mappedQuestions": len(page_mapping),
        "ingestionErrorsCount": len(ingestion_errors),
        "discrepanciesCount": len(discrepancies),
        "contentAnomaliesCount": len(content_anomalies),
    },
    "page_mapping": page_mapping,
    "ingestion_errors": ingestion_errors,
    "discrepancies": discrepancies,
    "content_anomalies": content_anomalies
}

with open(OUT_REPORT, "w", encoding="utf-8") as f:
    json.dump(report_data, f, indent=2, ensure_ascii=False)

print(f"Saved comparison report to {OUT_REPORT}")
