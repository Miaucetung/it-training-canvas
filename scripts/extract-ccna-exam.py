"""
Extract CCNA 200-301 exam questions + exhibit images from the source PDF.

Correct answers are encoded as green background-fill rectangles
RGB=(0.506, 0.831, 0.102)=#81d41a placed behind option text.
We detect which option letter overlaps with such a rectangle geometrically.

Outputs:
  notes/ccna-exam/questions.json
  notes/ccna-exam/images/Q####-N.png
  notes/ccna-exam/extraction-stats.txt
"""
from __future__ import annotations
import json
import re
from pathlib import Path
import fitz  # PyMuPDF

SRC_PDF = Path(r"C:\Users\mmuja\llmWiki\ClaudeCodeWiki\raw\00 - FragenBeantwortetKomplett200_301.pdf")
OUT_DIR = Path(__file__).resolve().parent.parent / "notes" / "ccna-exam"
IMG_DIR = OUT_DIR / "images"
GREEN_FILL = (0.5058823823928833, 0.8313725590705872, 0.10196078568696976)
COLOR_TOL = 0.02

OUT_DIR.mkdir(parents=True, exist_ok=True)
IMG_DIR.mkdir(parents=True, exist_ok=True)

Q_RE = re.compile(r"^Q\s*(\d{4})\s*$")
OPT_RE = re.compile(r"^\s*[*\->\u2022\u00b7]\s*([A-F])\.\s*(.+?)\s*$")
CHOOSE_RE = re.compile(r"\(Choose\s+(two|three|four|2|3|4)\.?\)", re.I)
DRAG_RE = re.compile(r"^(Drag and Drop|DRAG DROP)", re.I)
EXHIBIT_RE = re.compile(r"Refer to the exhibit", re.I)
CHOOSE_MAP = {"two": 2, "2": 2, "three": 3, "3": 3, "four": 4, "4": 4}


def is_green(fill) -> bool:
    if not fill or len(fill) < 3:
        return False
    return all(abs(fill[i] - GREEN_FILL[i]) < COLOR_TOL for i in range(3))


def overlap(r1, r2) -> bool:
    return not (r1[2] <= r2[0] or r2[2] <= r1[0] or r1[3] <= r2[1] or r2[3] <= r1[1])


def norm(s: str) -> str:
    s = s.replace("\u00a0", " ").replace("\u202f", " ")
    return re.sub(r"[ \t]+", " ", s).strip()


def green_rects_on_page(page):
    rects = []
    for path in page.get_drawings():
        if is_green(path.get("fill")):
            r = path.get("rect")
            if r:
                rects.append((r.x0, r.y0, r.x1, r.y1))
    return rects


def highlighted_options_on_page(page) -> list[str]:
    green = green_rects_on_page(page)
    if not green:
        return []
    found = []
    # Use "dict" (not "rawdict") so spans have "text" field + lines have "bbox"
    for block in page.get_text("dict")["blocks"]:
        if "lines" not in block:
            continue
        for line in block["lines"]:
            line_text = norm("".join(s.get("text", "") for s in line["spans"]))
            m = OPT_RE.match(line_text)
            if not m:
                continue
            letter = m.group(1)
            bbox = line["bbox"]
            exp = (bbox[0] - 5, bbox[1] - 5, bbox[2] + 5, bbox[3] + 5)
            if any(overlap(exp, gr) for gr in green):
                if letter not in found:
                    found.append(letter)
    return found


def classify(body: str, options: list[dict]) -> str:
    blob = (body + " " + " ".join(o["text"] for o in options)).lower()
    cats = [
        ("OSPF", ["ospf", "lsa", "designated router", "stub area", "spf", "abr", "asbr"]),
        ("Routing", ["routing table", "static route", "default route", "next hop", "longest match",
                     "administrative distance", "eigrp", " bgp", "floating"]),
        ("Switching/VLAN", ["vlan", " trunk", "stp", "spanning-tree", "switchport", "voice vlan",
                            "etherchannel", "lacp", "pagp", "bpdu", "portfast"]),
        ("Wireless", ["wlan", "wlc", " ap ", "ssid", "wpa", "802.11", "wireless", "capwap"]),
        ("Security", ["access-list", " aaa", "tacacs", "radius", "port-security", "dhcp snooping",
                      " dai ", "firewall", "ipsec", "zone-based"]),
        ("IPv6", ["ipv6", "fe80", "eui-64", "ff02", "::/", "global unicast"]),
        ("IPv4/Subnetting", ["subnet", "/24", "/25", "/26", "/27", "/28", "/29", "/30",
                             "wildcard", "cidr", "host range"]),
        ("NAT/DHCP", ["nat ", "pat ", "dhcp pool", "dhcp client", "dhcp server", "overload", "inside local"]),
        ("Automation/SDN", ["rest", "json", "netconf", "yang", "ansible", "puppet",
                            "controller-based", "openflow", "api "]),
        ("Architecture", ["spine", "leaf", "three-tier", "two-tier", "collapsed core"]),
        ("Network Fundamentals", ["osi", " tcp", " udp", "ethernet", "frame check", "mac address",
                                  "duplex", "csma", "collision"]),
    ]
    for name, kws in cats:
        if any(kw in blob for kw in kws):
            return name
    return "General"


def extract_questions():
    doc = fitz.open(SRC_PDF)
    print(f"Opened: {doc.page_count} pages")

    questions: list[dict] = []
    current: dict | None = None

    for page_idx in range(doc.page_count):
        page = doc[page_idx]
        lines = [ln.rstrip() for ln in page.get_text().split("\n")]

        # Get highlighted option letters for this page
        hi_letters = highlighted_options_on_page(page)

        # ── Parse questions from text ────────────────────────────────────
        for raw in lines:
            ln = norm(raw)
            if not ln:
                if current:
                    current["body_lines"].append("")
                continue
            if re.match(r"^Seite\s+\d+\s+von\s+\d+", ln):
                continue

            m = Q_RE.match(ln.replace(" ", ""))
            if m:
                if current:
                    questions.append(current)
                current = {
                    "id": f"Q{m.group(1)}",
                    "page": page_idx + 1,
                    "body_lines": [],
                    "options": [],
                    "drag_drop": False,
                    "needs_exhibit": False,
                    "expected": 1,
                    "hi_letters": [],
                    "images": [],
                }
                continue

            if current is None:
                continue

            if DRAG_RE.match(ln):
                current["drag_drop"] = True
                continue
            if "Select and Place" in ln or ln.startswith("Correct Answer"):
                continue

            m_opt = OPT_RE.match(ln)
            if m_opt:
                current["options"].append({"letter": m_opt.group(1), "text": m_opt.group(2)})
                continue

            if EXHIBIT_RE.search(ln):
                current["needs_exhibit"] = True
            m_c = CHOOSE_RE.search(ln)
            if m_c:
                current["expected"] = CHOOSE_MAP[m_c.group(1).lower()]

            # multi-line option continuation
            if current["options"] and not m_opt and not ln.startswith("•"):
                current["options"][-1]["text"] += " " + ln
            else:
                current["body_lines"].append(ln)

        # Assign highlighted letters to current or last Q on this page
        if hi_letters:
            # Try current Q first
            target = current if current and current["page"] == page_idx + 1 else None
            if target is None:
                # Fall back to last question that started on this page
                for q in reversed(questions):
                    if q["page"] == page_idx + 1:
                        target = q
                        break
            if target is None and questions:
                target = questions[-1]
            if target:
                for l in hi_letters:
                    if l not in target["hi_letters"]:
                        target["hi_letters"].append(l)

        # Extract images
        q_this_page = [q for q in questions if q["page"] == page_idx + 1]
        if current and current["page"] == page_idx + 1 and current not in q_this_page:
            q_this_page.append(current)
        if not q_this_page and current:
            q_this_page = [current]

        for img_idx, img_info in enumerate(page.get_images(full=True)):
            xref = img_info[0]
            try:
                bi = doc.extract_image(xref)
            except Exception:
                continue
            if not bi:
                continue
            tq = q_this_page[img_idx % len(q_this_page)] if q_this_page else None
            if tq:
                tq["images"].append({"ext": bi["ext"], "data": bi["image"]})

    if current:
        questions.append(current)
    print(f"Parsed: {len(questions)} questions")

    # ── Write output ─────────────────────────────────────────────────────
    img_total = 0
    final = []
    answered = 0

    for q in questions:
        body = re.sub(r"\n{3,}", "\n\n", "\n".join(q["body_lines"])).strip()
        if not body and not q["options"] and not q["drag_drop"]:
            continue

        image_paths = []
        for i, info in enumerate(q["images"], 1):
            ext = info["ext"]
            out_ext = "png" if ext.lower() in ("png", "jpx", "jb2") else "jpg"
            fname = f"{q['id']}-{i}.{out_ext}"
            try:
                if ext.lower() in ("png", "jpeg", "jpg"):
                    (IMG_DIR / fname).write_bytes(info["data"])
                else:
                    pm = fitz.Pixmap(info["data"])
                    if pm.n - pm.alpha < 4:
                        pm.save(str(IMG_DIR / fname))
                image_paths.append(fname)
                img_total += 1
            except Exception as e:
                print(f"  skip {fname}: {e}")

        correct = sorted(set(q["hi_letters"])) if q["hi_letters"] else None
        if correct:
            answered += 1

        final.append({
            "id": q["id"],
            "category": classify(body, q["options"]),
            "type": "drag-drop" if q["drag_drop"]
                    else ("multi-select" if q["expected"] > 1 else "single"),
            "expectedAnswerCount": q["expected"],
            "text": body,
            "options": q["options"],
            "correctAnswer": correct,
            "exhibitImages": image_paths,
            "needsExhibit": q["needs_exhibit"],
            "sourcePage": q["page"],
            "needsReview": correct is None,
        })

    (OUT_DIR / "questions.json").write_text(
        json.dumps(final, ensure_ascii=False, indent=2), encoding="utf-8"
    )

    cat_counts = {}
    for q in final:
        cat_counts[q["category"]] = cat_counts.get(q["category"], 0) + 1

    stats_lines = [
        f"Total questions : {len(final)}",
        f"Images          : {img_total}",
        f"With exhibits   : {sum(1 for q in final if q['exhibitImages'])}",
        f"Drag-drop       : {sum(1 for q in final if q['type'] == 'drag-drop')}",
        f"Multi-select    : {sum(1 for q in final if q['type'] == 'multi-select')}",
        f"Answered        : {answered}",
        f"Needs review    : {len(final) - answered}",
        "",
        "By category:",
    ] + [f"  {k:<32}: {v}" for k, v in sorted(cat_counts.items(), key=lambda x: -x[1])]

    txt = "\n".join(stats_lines)
    (OUT_DIR / "extraction-stats.txt").write_text(txt, encoding="utf-8")
    print("\n" + txt)

    # Sample check
    print("\n=== Sample correct answers ===")
    shown = 0
    for q in final:
        if q["correctAnswer"] and shown < 15:
            opts = {o["letter"]: o["text"][:45] for o in q["options"]}
            print(f"  {q['id']}  ans={q['correctAnswer']}  {opts}")
            shown += 1


if __name__ == "__main__":
    extract_questions()
