"""
Extract CCNA 200-301 exam questions + exhibit images from the source PDF.

Correct answers are encoded as green background-fill rectangles
RGB=(0.506, 0.831, 0.102)=#81d41a placed behind option text.

Key findings from format analysis:
  - get_text("dict") splits bullet+letter into TWO spans:
      span1: "•"  (U+2022)
      span2: "A. option text "
  - Joined: "•A. option text" — NO SPACE between bullet and letter
  - OPT_RE must match this joined form
  - Green rects must be matched per-question using y-center of option line
  - Each page can have multiple questions → must NOT lump all page-answers into one question

Outputs:
  notes/ccna-exam/questions.json       (1 JSON array, sorted by source page)
  notes/ccna-exam/images/Q####-N.ext   (exhibit images)
  notes/ccna-exam/extraction-stats.txt
"""
from __future__ import annotations
import json
import re
from pathlib import Path
import fitz  # PyMuPDF

SRC_PDF = Path(r"C:\Users\mmuja\llmWiki\ClaudeCodeWiki\raw\00 - FragenBeantwortetKomplett200_301.pdf")
OUT_DIR  = Path(__file__).resolve().parent.parent / "notes" / "ccna-exam"
IMG_DIR  = OUT_DIR / "images"

# ── Green highlight color ────────────────────────────────────────────────────
GREEN_FILL = (0.5058823823928833, 0.8313725590705872, 0.10196078568696976)
COLOR_TOL  = 0.025   # tolerance for color matching

# ── Regexes ──────────────────────────────────────────────────────────────────
# Question number: "Q0001", "Q 0001", "Q0001 " etc.
Q_RE = re.compile(r"^Q\s*(\d{4})\s*$")

# Option line from get_text("dict"):
#   get_text("dict") joins spans as: "•A. option text " (no space between • and A)
#   also handle "• A. ..." in case some spans do include a space
OPT_RE = re.compile(
    r"^\s*"           # optional leading whitespace
    r"[•·*\->\u2022\u00b7\u25cf\u2192]?"   # optional bullet
    r"\s*"            # optional space after bullet
    r"([A-F])\."      # letter + dot (NO space required before it)
    r"\s*(.+?)"       # option text
    r"\s*$",
    re.DOTALL,
)

# From get_text() plain:  "• A. option text"  (HAS space between • and A)
OPT_RE_PLAIN = re.compile(
    r"^\s*[•·*\->\u2022\u00b7\u25cf\u2192]?\s*([A-F])\.\s*(.+?)\s*$"
)

CHOOSE_RE  = re.compile(r"\(Choose\s+(two|three|four|2|3|4)\.?\)", re.I)
DRAG_RE    = re.compile(r"^(Drag and Drop|DRAG DROP)", re.I)
EXHIBIT_RE = re.compile(r"Refer to the exhibit", re.I)
CHOOSE_MAP = {"two": 2, "2": 2, "three": 3, "3": 3, "four": 4, "4": 4}

OUT_DIR.mkdir(parents=True, exist_ok=True)
IMG_DIR.mkdir(parents=True, exist_ok=True)


# ── Helpers ──────────────────────────────────────────────────────────────────

def is_green(fill) -> bool:
    if not fill or len(fill) < 3:
        return False
    return all(abs(fill[i] - GREEN_FILL[i]) < COLOR_TOL for i in range(3))


def norm(s: str) -> str:
    """Normalize whitespace and non-breaking spaces."""
    s = s.replace("\u00a0", " ").replace("\u202f", " ")
    return re.sub(r"[ \t]+", " ", s).strip()


def green_rects_on_page(page) -> list[tuple]:
    """Return list of (x0, y0, x1, y1) for all green fill rectangles."""
    rects = []
    for path in page.get_drawings():
        if is_green(path.get("fill")):
            r = path.get("rect")
            if r:
                rects.append((r.x0, r.y0, r.x1, r.y1))
    return rects


def get_dict_lines(page) -> list[tuple]:
    """
    Return list of (text, bbox) for every non-empty line on the page.
    Uses get_text("dict") which provides per-character bboxes.
    """
    results = []
    for block in page.get_text("dict")["blocks"]:
        if "lines" not in block:
            continue
        for line in block["lines"]:
            txt = norm("".join(s.get("text", "") for s in line["spans"]))
            if txt:
                results.append((txt, line["bbox"]))
    # Sort by y then x so we read top→bottom, left→right
    results.sort(key=lambda t: (t[1][1], t[1][0]))
    return results


def classify(body: str, options: list[dict]) -> str:
    blob = (body + " " + " ".join(o["text"] for o in options)).lower()
    cats = [
        ("OSPF",             ["ospf", "lsa", "designated router", "stub area", "spf", "abr", "asbr"]),
        ("Routing",          ["routing table", "static route", "default route", "next hop", "longest match",
                              "administrative distance", "eigrp", " bgp", "floating"]),
        ("Switching/VLAN",   ["vlan", " trunk", "stp", "spanning-tree", "switchport", "voice vlan",
                              "etherchannel", "lacp", "pagp", "bpdu", "portfast"]),
        ("Wireless",         ["wlan", "wlc", " ap ", "ssid", "wpa", "802.11", "wireless", "capwap"]),
        ("Security",         ["access-list", " aaa", "tacacs", "radius", "port-security", "dhcp snooping",
                              " dai ", "firewall", "ipsec", "zone-based"]),
        ("IPv6",             ["ipv6", "fe80", "eui-64", "ff02", "::/", "global unicast"]),
        ("IPv4/Subnetting",  ["subnet", "/24", "/25", "/26", "/27", "/28", "/29", "/30",
                              "wildcard", "cidr", "host range"]),
        ("NAT/DHCP",         ["nat ", "pat ", "dhcp pool", "dhcp client", "dhcp server", "overload", "inside local"]),
        ("Automation/SDN",   ["rest", "json", "netconf", "yang", "ansible", "puppet",
                              "controller-based", "openflow", "api "]),
        ("Architecture",     ["spine", "leaf", "three-tier", "two-tier", "collapsed core"]),
        ("Network Fundamentals", ["osi", " tcp", " udp", "ethernet", "frame check", "mac address",
                                  "duplex", "csma", "collision"]),
    ]
    for name, kws in cats:
        if any(kw in blob for kw in kws):
            return name
    return "General"


# ── Core extraction ──────────────────────────────────────────────────────────

def extract_questions():
    doc = fitz.open(SRC_PDF)
    print(f"Opened: {doc.page_count} pages")

    questions: list[dict] = []
    current: dict | None = None

    for page_idx in range(doc.page_count):
        page     = doc[page_idx]
        page_num = page_idx + 1

        # ── Get green rects ──────────────────────────────────────────────────
        green = green_rects_on_page(page)

        # ── Get all text lines with bboxes (dict-based) ──────────────────────
        dict_lines = get_dict_lines(page)

        # ── Parse questions & options from dict lines ─────────────────────────
        for ln, bbox in dict_lines:
            # Skip page-number footer
            if re.match(r"^Seite\s+\d+\s+von\s+\d+", ln):
                continue

            # New question?
            m = Q_RE.match(ln.replace(" ", ""))
            if m:
                if current:
                    questions.append(current)
                current = {
                    "id":          f"Q{m.group(1)}",
                    "page":        page_num,
                    "body_lines":  [],
                    "options":     [],   # [{"letter": "A", "text": "..."}]
                    "opt_bboxes":  [],   # [(letter, y0, y1, y_center, page_idx)]
                    "drag_drop":   False,
                    "needs_exhibit": False,
                    "expected":    1,
                    "hi_letters":  [],
                    "images":      [],
                }
                continue

            if current is None:
                continue

            # Skip artefacts
            if DRAG_RE.match(ln):
                current["drag_drop"] = True
                continue
            if "Select and Place" in ln or ln.startswith("Correct Answer"):
                continue

            # Option line?  OPT_RE handles both "•A. text" and "• A. text"
            m_opt = OPT_RE.match(ln)
            if m_opt:
                letter = m_opt.group(1)
                text   = m_opt.group(2).strip()
                current["options"].append({"letter": letter, "text": text})
                y_center = (bbox[1] + bbox[3]) / 2
                current["opt_bboxes"].append((letter, bbox[1], bbox[3], y_center, page_idx))
                continue

            # Non-option content
            if EXHIBIT_RE.search(ln):
                current["needs_exhibit"] = True
            m_c = CHOOSE_RE.search(ln)
            if m_c:
                current["expected"] = CHOOSE_MAP[m_c.group(1).lower()]

            # Multi-line option continuation (line that follows an option but isn't one)
            if (current["options"]
                    and not re.match(r"^[A-F]\.\s", ln)   # not a bare "A. text" line
                    and not re.match(r"^Q\d{4}", ln)):
                current["options"][-1]["text"] += " " + ln
            else:
                current["body_lines"].append(ln)

        # ── Match green rects → options (per-question, per-page) ────────────
        # Build set of questions that have options on THIS page
        qs_with_opts_here: list[dict] = []
        for q in questions:
            if any(ob[4] == page_idx for ob in q["opt_bboxes"]):
                qs_with_opts_here.append(q)
        if current and any(ob[4] == page_idx for ob in current.get("opt_bboxes", [])):
            qs_with_opts_here.append(current)

        for gr in green:
            gr_y0, gr_y1 = gr[1], gr[3]
            gr_center    = (gr_y0 + gr_y1) / 2

            # Search each question's options on this page for a y-center match
            for q in qs_with_opts_here:
                for letter, y0, y1, y_center, pg in q["opt_bboxes"]:
                    if pg != page_idx:
                        continue
                    # Use center-point: option center must be INSIDE the green rect (±3px)
                    if gr_y0 - 3 <= y_center <= gr_y1 + 3:
                        if letter not in q["hi_letters"]:
                            q["hi_letters"].append(letter)
                        break  # each green rect → at most 1 option per question

        # ── Extract exhibit images ───────────────────────────────────────────
        q_this_page = [q for q in questions if q["page"] == page_num]
        if current and current["page"] == page_num and current not in q_this_page:
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

    # Flush last question
    if current:
        questions.append(current)
    print(f"Parsed: {len(questions)} questions")

    # ── Write output ─────────────────────────────────────────────────────────
    img_total = 0
    final     = []
    answered  = 0

    for q in questions:
        body = re.sub(r"\n{3,}", "\n\n", "\n".join(q["body_lines"])).strip()
        if not body and not q["options"] and not q["drag_drop"]:
            continue

        # Save images
        image_paths = []
        for i, info in enumerate(q["images"], 1):
            ext     = info["ext"]
            out_ext = "png" if ext.lower() in ("png", "jpx", "jb2") else "jpg"
            fname   = f"{q['id']}-{i}.{out_ext}"
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
            "id":                 q["id"],
            "category":           classify(body, q["options"]),
            "type":               ("drag-drop"    if q["drag_drop"]
                                   else "multi-select" if q["expected"] > 1
                                   else "single"),
            "expectedAnswerCount": q["expected"],
            "text":               body,
            "options":            q["options"],
            "correctAnswer":      correct,
            "exhibitImages":      image_paths,
            "needsExhibit":       q["needs_exhibit"],
            "sourcePage":         q["page"],
            "needsReview":        correct is None,
        })

    # Write JSON (preserves PDF order)
    (OUT_DIR / "questions.json").write_text(
        json.dumps(final, ensure_ascii=False, indent=2), encoding="utf-8"
    )

    # Stats
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
    print("\n=== Sample correct answers (first 20 answered) ===")
    shown = 0
    for q in final:
        if q["correctAnswer"] and shown < 20:
            opts = {o["letter"]: o["text"][:40] for o in q["options"]}
            ans  = q["correctAnswer"]
            print(f"  {q['id']}  page={q['sourcePage']}  ans={ans}  opts={opts}")
            shown += 1


if __name__ == "__main__":
    extract_questions()
