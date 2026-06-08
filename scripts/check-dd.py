import json, sys
sys.stdout.reconfigure(encoding='utf-8')
data = json.loads(open('notes/ccna-exam/questions.json', encoding='utf-8').read())
for qid in ['Q0003','Q0005','Q0012','Q0133','Q0134','Q0148','Q0176','Q0182']:
    q = next((x for x in data if x['id'] == qid), None)
    if q:
        imgs = q['exhibitImages']
        print(f"{qid}: type={q['type']} images={imgs} correct={q['correctAnswer']}")
