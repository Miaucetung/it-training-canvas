# Extrahiert DRAG-DROP-Fragen aus dem PDF-Textlayer.
# Lösungen stehen als Text unter dem Widget-Bild in drei Mustern:
#   A) "Kategorie:" gefolgt von Item-Zeilen (optional "- #item")
#   B) "item -->#Kategorie" (Arrow-Mapping, diverse Pfeil-Varianten)
#   C) gar nicht (Lösung nur im Bild) -> needs_review
import fitz, re, json, sys

sys.stdout.reconfigure(encoding="utf-8", errors="replace")

PDF = "C:/Users/mmuja/llmWiki/ClaudeCodeWiki/raw/ccna/00-FragenBeantwortetKomplett200_301.pdf"
d = fitz.open(PDF)

# Ganzen Text mit Seitenmarkern zusammenziehen
full = ""
for i in range(d.page_count):
    full += f"\n@@PAGE{i+1}@@\n" + d[i].get_text()

# In Frage-Blöcke splitten
parts = re.split(r"\n(Q\d{4})\s*\n", full)
blocks = {}  # id -> (text, page)
cur_page = 1
for idx in range(1, len(parts), 2):
    qid = parts[idx]
    body = parts[idx + 1] if idx + 1 < len(parts) else ""
    m = re.search(r"@@PAGE(\d+)@@", parts[idx - 1][::-1] and parts[idx - 1])
    page = None
    for pm in re.finditer(r"@@PAGE(\d+)@@", parts[idx - 1]):
        page = int(pm.group(1))
    blocks[qid] = (body, page)

ARROW = re.compile(r"^(.*?)\s*(?:-+>|-+→|→|--→|-→)\s*#?(.+?)\s*$")

def clean(s):
    s = s.replace("ג€", "'")  # kaputtes Encoding von Anführungszeichen
    s = re.sub(r"\s+", " ", s).strip()
    return s

results = []
for qid, (body, page) in sorted(blocks.items()):
    if "DRAG DROP" not in body[:60]:
        continue
    body_clean = re.sub(r"@@PAGE\d+@@\n?", "", body)
    body_clean = re.sub(r"Seite \d+ von \d+\s*\n?", "", body_clean)
    lines = [l.strip() for l in body_clean.split("\n")]

    # Stem: nach "DRAG DROP -" bis "Select and Place"/"Correct Answer"/Hashtag-Zeile/Leerlauf
    stem_lines = []
    started = False
    for l in lines:
        if not started:
            if l.startswith("DRAG DROP"):
                started = True
            continue
        if l in ("-", ""):
            continue
        if l.startswith("Select and Place") or l.startswith("Correct Answer"):
            break
        if re.fullmatch(r"(#\S+\s*)+", l):
            break
        stem_lines.append(l)
        if len(" ".join(stem_lines)) > 500:
            break
    stem = clean(" ".join(stem_lines))

    # Antwortbereich: alles nach Stem
    rest = body_clean

    # Muster B: Arrow-Mappings
    arrows = []
    for l in rest.split("\n"):
        l = l.strip()
        m = ARROW.match(l)
        if m and 3 <= len(m.group(1).strip()) <= 90 and len(m.group(2).strip()) <= 60:
            item = clean(m.group(1).lstrip("-•· "))
            tgt = clean(m.group(2).lstrip("#"))
            if item and tgt and not item.startswith("Drag and drop"):
                arrows.append((item, tgt))

    # Muster A: "Kategorie:" + Items
    cats = {}
    cur = None
    for l in rest.split("\n"):
        l = l.strip()
        if re.fullmatch(r"[^#\n]{2,70}:", l) and not l.lower().startswith(("select and place", "correct answer", "note", "answer area")):
            cur = clean(l[:-1])
            cats.setdefault(cur, [])
            continue
        if cur is not None:
            item = l.lstrip("-•·✑ ").strip()
            item = item.lstrip("#").strip()
            if not item or l.startswith(("Q", "Select and Place", "Correct Answer")):
                if l == "" or l.startswith("Q"):
                    cur = None
                continue
            if len(item) <= 110:
                cats[cur].append(clean(item))

    cats = {k: v for k, v in cats.items() if v}
    mode = None
    mapping = []
    if len(arrows) >= 3:
        mode = "arrow"
        mapping = arrows
    elif len(cats) >= 2 and sum(len(v) for v in cats.values()) >= 3:
        mode = "categories"
        mapping = cats
    elif len(cats) == 1 and len(list(cats.values())[0]) >= 3:
        mode = "single-or-order"
        mapping = cats

    results.append({
        "id": qid, "page": page, "stem": stem[:300], "mode": mode,
        "mapping": mapping,
    })

ok = [r for r in results if r["mode"]]
bad = [r for r in results if not r["mode"]]
print(f"DRAG-DROP-Bloecke: {len(results)}  parsebar: {len(ok)}  nur-Bild: {len(bad)}")
json.dump(results, open(sys.argv[1], "w", encoding="utf-8"), ensure_ascii=False, indent=1)
print("bad ids:", [r["id"] for r in bad])
