"""
Prüft die App-Fragen (ccnaQuestions) gegen die Referenz-PDF (nur lesend, PDF wird nicht kopiert):
Optionstexte und grün markierte Lösungen je Frage, seitenübergreifend und zeilenbasiert.
Voraussetzung: .local/app_current.json (node --experimental-strip-types scripts/audit/dump-current-questions.mjs).
Aufruf: python scripts/audit/pdf_pruefung.py     (Ausgabe: Zusammenfassung und .local/pruefung-scan.json)
"""
import json,fitz,re,sys
PDF=r"C:\Users\mmuja\Nextcloud\Obsidian Sync\ClaudeCodeWiki\raw\ccna\00-FragenBeantwortetKomplett200_301.pdf"
doc=fitz.open(PDF)
app={q['id']:q for q in json.load(open('.local/app_current.json',encoding='utf-8'))['ccnaQuestions']}
def green(fill): return bool(fill) and len(fill)>=3 and fill[1]>0.5 and fill[0]<0.75 and fill[2]<0.75 and fill[1]-fill[0]>0.15
seq=[]  # (page, text, letter_if_green, is_option_start)
for pn in range(len(doc)):
    p=doc[pn]
    gr=[x['rect'] for x in p.get_drawings() if green(x.get('fill'))]
    for b in p.get_text('dict')['blocks']:
        for l in b.get('lines',[]):
            t=''.join(s['text'] for s in l['spans']).strip()
            if not t: continue
            r=fitz.Rect(l['bbox'])
            m=re.match(r'^[•\W]*([A-H])\.\s?',t)
            g=False
            if m:
                for x in gr:
                    i=r&x
                    if not i.is_empty and i.get_area()>=0.5*r.get_area(): g=True;break
            seq.append((pn+1,t,m.group(1) if m else None,g,r.y0))
heads=[i for i,s in enumerate(seq) if re.fullmatch(r'Q\s?0*\d+(\s+\w+)?',s[1])]
def norm(s): return re.sub(r'\W+','',s.lower())
def blocks():
    for k,i in enumerate(heads):
        j=heads[k+1] if k+1<len(heads) else len(seq)
        yield i,j
B=list(blocks())
def find(qid,hint_pages=None):
    q=app[qid]; key=norm(q['question'])[:45]
    cands=[]
    for i,j in B:
        body=norm(' '.join(s[1] for s in seq[i+1:min(j,i+8)]))
        if key and key[:35] in body: cands.append((i,j))
    return cands

L=json.load(open('.local/app_current.json',encoding='utf-8'))['ccnaQuestions']
byhead={}
for i,j in B:
    h=seq[i][1]; n=int(re.sub(r'\D','',h.split()[0] if h.split()[0]!='Q' else h.split()[1]))
    byhead.setdefault(n,[]).append((i,j))
def opts_of(i,j):
    lines=[s for s in seq[i:j] if not s[1].startswith('Seite ')]
    o=[]
    for s in lines:
        if s[2]: o.append([s[2],re.sub(r'^[•\W]*[A-H]\.\s?','',s[1]),s[3]])
        elif o and not re.fullmatch(r'Q\s?0*\d+(\s+\w+)?',s[1]): o[-1][1]+=' '+s[1]
    return o,[s[1] for s in lines]
res={'ok':0,'kein_block':[],'opt_diff':[],'sol_diff':[],'q_diff':[]}
for q in L:
    n=int(q['id'][1:]); cands=byhead.get(n,[])
    key=norm(q['question'])[:30]
    pick=None
    for i,j in cands:
        o,t=opts_of(i,j)
        if key[:25] in norm(' '.join(t[1:8])): pick=(o,t);break
    if not pick: res['kein_block'].append(q['id']);continue
    o,t=pick
    ao=q['options']; po=[x[1] for x in o]
    c=q['correct'];cs=c if isinstance(c,list) else [c]
    al=[chr(65+i) for i in cs]; pl=[x[0] for x in o if x[2]]
    same=len(po)==len(ao) and all(norm(a)==norm(p) for a,p in zip(ao,po))
    if not same: res['opt_diff'].append(q['id'])
    if al!=pl and pl: res['sol_diff'].append((q['id'],al,pl))
    if same and al==pl: res['ok']+=1
print('ok',res['ok'],'kein_block',len(res['kein_block']),'opt_diff',len(res['opt_diff']),'sol_diff',len(res['sol_diff']))
print('kein_block',res['kein_block'])
print('opt_diff',res['opt_diff'])
print('sol_diff',res['sol_diff'])
json.dump(res,open('.local/pruefung-scan.json','w'),ensure_ascii=False)
