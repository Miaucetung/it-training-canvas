import json, sys
sys.stdout.reconfigure(encoding='utf-8')
data = json.loads(open('notes/ccna-exam/questions.json', encoding='utf-8').read())
dd = [q for q in data if q.get('type') == 'drag-drop']
full = [q for q in dd if len(q.get('dragItems',[])) >= 2 and len(q.get('correctMapping',[])) >= 2]
has_state = [q for q in dd if q.get('questionStateImage')]
has_both = [q for q in dd if q.get('questionStateImage') and q.get('answerStateImage')]
print('Total drag-drop:', len(dd))
print('Full interactive (items+mapping>=2):', len(full))
print('Has state image:', len(has_state))
print('Has both images:', len(has_both))
print()
print('Interactive examples:')
for q in full[:6]:
    di = q['dragItems']
    dt = q['dropTargets']
    cm = q['correctMapping']
    print(f'  {q["id"]}: {len(di)} items -> {len(dt)} targets, {len(cm)} mapping')
    for i, item in enumerate(di[:3]):
        print(f'    item: {item[:50]}')
    for i, t in enumerate(dt[:3]):
        print(f'    target[{i}]: {t[:50]}')
    for i, m in enumerate(cm[:3]):
        print(f'    correct[{i}]: {m[:50]}')
    print()
