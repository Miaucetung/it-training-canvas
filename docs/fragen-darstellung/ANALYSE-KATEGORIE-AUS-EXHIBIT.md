# Analyse: Kategorie-Ableitung mit dem Text von CLI-Exhibits

Erzeugt von `scripts/audit/category-exhibit.audit.ts` (nur lesend). Es wurde nichts geändert.

## Fragestellung

`categorizeQuestion` (`src/lib/ccna-question-pool.ts`) leitet die Kategorie nur aus dem Fragetext ab; sie wird für den Kategorie-Filter im Prüfungstrainer und für die Domain-Analyse im Quiz verwendet. Seit dem Umzug der CLI-Ausgabe von q0829 ins Exhibit fehlt deren Text bei der Ableitung (q0829 wechselte von „Geräte & Medien“ zu „Grundlagen & Sonstige“). Geprüft wurde, was passiert, wenn der Text von CLI-Exhibits mit einfließt.

## Ergebnis

| Pool | Fragen | davon mit CLI-Exhibit | Kategorie wechselt |
|---|---:|---:|---:|
| ccnaQuestions | 1081 | 231 | 101 |
| ccnaQuestionsClassified | 1055 | 223 | 101 |

**Es ändert sich nicht nur q0829:** im Prüfungspool wechseln 101 von 231 Fragen mit CLI-Exhibit die Kategorie (im klassifizierten Pool gleich viele). Deshalb wurde nichts umgesetzt.

- **Rückfall → Kategorie** (Frage fällt heute in „Grundlagen & Sonstige“, mit CLI-Text bekäme sie eine Fachkategorie): 75 Fragen.
- **Kategorie → andere Kategorie** (heute schon einer Fachkategorie zugeordnet, die CLI-Wörter verschieben sie): 26 Fragen.

| Wechsel | Fragen |
|---|---:|
| Grundlagen & Sonstige → Switching & VLANs | 25 |
| Grundlagen & Sonstige → IPv4 & Subnetting | 21 |
| Grundlagen & Sonstige → Routing | 16 |
| Architektur & Automation → IPv4 & Subnetting | 7 |
| Grundlagen & Sonstige → IPv6 | 5 |
| IPv4 & Subnetting → Routing | 4 |
| Architektur & Automation → Security & Services | 4 |
| Geräte & Medien → IPv4 & Subnetting | 3 |
| Grundlagen & Sonstige → Wireless | 3 |
| Switching & VLANs → Wireless | 3 |
| Grundlagen & Sonstige → Geräte & Medien | 3 |
| Security & Services → Switching & VLANs | 2 |
| Grundlagen & Sonstige → Security & Services | 2 |
| Security & Services → Routing | 1 |
| IPv4 & Subnetting → IPv6 | 1 |
| Security & Services → IPv4 & Subnetting | 1 |

## Einschätzung

- Der Fall q0829 gehört zur ersten Gruppe („Grundlagen & Sonstige“ → „Geräte & Medien“) und stellt den Zustand vor dem Umzug wieder her.
- Die erste Gruppe ist überwiegend plausibel (Frage „Refer to the exhibit …“ ohne Fachwort im Text, die CLI-Ausgabe nennt VLANs, Routen usw.), aber nicht durchgehend: q0103 (`ipconfig /all` eines Windows-PCs) würde wegen der Zeile „Wireless LAN adapter“ nach „Wireless“ wandern.
- Die zweite Gruppe ist heikel: die Schlüsselwörter der Kategorie-Regeln stehen auch in beliebigen CLI-Texten (Subnetzmasken `255.255…` und Port-Namen wie `fe1/34` treffen die Regel „IPv4 & Subnetting“, `password`/`nat` die Regel „Security“, `static`/`metric`/`route` die Regel „Routing“), und die Reihenfolge der Regeln entscheidet. Dort verschiebt der CLI-Text Fragen, deren Thema der Fragetext richtig trifft: die JSON-Schema-Fragen q1062–q1066, q1082, q1084, q1085 („Architektur & Automation“) würden wegen Port-Namen wie `fe1/34` nach „IPv4“ bzw. wegen `firewall` nach „Security“ wandern; q0590 (NAT-Konfiguration) würde wegen des Wortes `static` nach „Routing“ wandern.

## Entscheidungsvorlage

1. **Nichts ändern** (Stand jetzt): nur q0829 hat die Kategorie gewechselt.
2. **Nur Rückfallfälle** (75 Fragen): der CLI-Text wird nur herangezogen, wenn der Fragetext allein in „Grundlagen & Sonstige“ fällt. Eine Frage, die schon eine Fachkategorie hat, bleibt unverändert.
3. **Alle** (101 Fragen): der CLI-Text fließt immer ein; größte Änderung, die zweite Gruppe wird verschoben.
4. **Nur q0829** zurücksetzen: dafür bräuchte es ein ausdrückliches Kategorie-Feld an der Frage (Datenänderung, Snapshot-Feld `meta`) und ist nur für den einen Fall sinnvoll.

## Liste der Wechsel (Prüfungspool; der klassifizierte Pool hat dieselben Wechsel mit den Großbuchstaben-IDs)

| Frage | jetzt (nur Fragetext) | mit CLI-Text | Kategorie nur aus dem CLI-Text | Gruppe |
|---|---|---|---|---|
| q0016 | Grundlagen & Sonstige | IPv4 & Subnetting | IPv4 & Subnetting | Rückfall → Kategorie |
| q0075 | Geräte & Medien | IPv4 & Subnetting | IPv4 & Subnetting | Kategorie → andere Kategorie |
| q0093 | Grundlagen & Sonstige | Switching & VLANs | Switching & VLANs | Rückfall → Kategorie |
| q0103 | Grundlagen & Sonstige | Wireless | Wireless | Rückfall → Kategorie |
| q0123 | Geräte & Medien | IPv4 & Subnetting | IPv4 & Subnetting | Kategorie → andere Kategorie |
| q0130 | Grundlagen & Sonstige | IPv4 & Subnetting | IPv4 & Subnetting | Rückfall → Kategorie |
| q0135 | Grundlagen & Sonstige | IPv4 & Subnetting | IPv4 & Subnetting | Rückfall → Kategorie |
| q0186 | Grundlagen & Sonstige | Switching & VLANs | Switching & VLANs | Rückfall → Kategorie |
| q0189 | Grundlagen & Sonstige | Switching & VLANs | Switching & VLANs | Rückfall → Kategorie |
| q0202 | Grundlagen & Sonstige | Switching & VLANs | Switching & VLANs | Rückfall → Kategorie |
| q0203 | Grundlagen & Sonstige | Switching & VLANs | Switching & VLANs | Rückfall → Kategorie |
| q0229 | Grundlagen & Sonstige | Switching & VLANs | Switching & VLANs | Rückfall → Kategorie |
| q0263 | Grundlagen & Sonstige | Switching & VLANs | Switching & VLANs | Rückfall → Kategorie |
| q0276 | Grundlagen & Sonstige | Switching & VLANs | Switching & VLANs | Rückfall → Kategorie |
| q0282 | Grundlagen & Sonstige | Switching & VLANs | Switching & VLANs | Rückfall → Kategorie |
| q0292 | Switching & VLANs | Wireless | Wireless | Kategorie → andere Kategorie |
| q0296 | Grundlagen & Sonstige | Switching & VLANs | Switching & VLANs | Rückfall → Kategorie |
| q0309 | Grundlagen & Sonstige | Switching & VLANs | Switching & VLANs | Rückfall → Kategorie |
| q0323 | Grundlagen & Sonstige | Switching & VLANs | Switching & VLANs | Rückfall → Kategorie |
| q0329 | Grundlagen & Sonstige | Switching & VLANs | Switching & VLANs | Rückfall → Kategorie |
| q0343 | Grundlagen & Sonstige | Routing | Routing | Rückfall → Kategorie |
| q0347 | Grundlagen & Sonstige | Routing | Routing | Rückfall → Kategorie |
| q0349 | Grundlagen & Sonstige | Routing | Routing | Rückfall → Kategorie |
| q0351 | Grundlagen & Sonstige | Routing | Routing | Rückfall → Kategorie |
| q0359 | Grundlagen & Sonstige | Routing | Routing | Rückfall → Kategorie |
| q0380 | Grundlagen & Sonstige | Routing | Routing | Rückfall → Kategorie |
| q0386 | Grundlagen & Sonstige | Routing | Routing | Rückfall → Kategorie |
| q0394 | Grundlagen & Sonstige | Routing | Routing | Rückfall → Kategorie |
| q0396 | Grundlagen & Sonstige | IPv6 | IPv6 | Rückfall → Kategorie |
| q0412 | Grundlagen & Sonstige | Routing | Routing | Rückfall → Kategorie |
| q0413 | IPv4 & Subnetting | Routing | Routing | Kategorie → andere Kategorie |
| q0415 | Grundlagen & Sonstige | Switching & VLANs | Switching & VLANs | Rückfall → Kategorie |
| q0446 | Grundlagen & Sonstige | Routing | Routing | Rückfall → Kategorie |
| q0457 | IPv4 & Subnetting | Routing | Routing | Kategorie → andere Kategorie |
| q0477 | Grundlagen & Sonstige | Routing | Routing | Rückfall → Kategorie |
| q0492 | Grundlagen & Sonstige | Routing | Routing | Rückfall → Kategorie |
| q0510 | Grundlagen & Sonstige | IPv4 & Subnetting | IPv4 & Subnetting | Rückfall → Kategorie |
| q0566 | Grundlagen & Sonstige | IPv4 & Subnetting | IPv4 & Subnetting | Rückfall → Kategorie |
| q0580 | Grundlagen & Sonstige | IPv4 & Subnetting | IPv4 & Subnetting | Rückfall → Kategorie |
| q0582 | IPv4 & Subnetting | Routing | Routing | Kategorie → andere Kategorie |
| q0590 | Security & Services | Routing | Routing | Kategorie → andere Kategorie |
| q0593 | Grundlagen & Sonstige | IPv6 | IPv6 | Rückfall → Kategorie |
| q0605 | Security & Services | Switching & VLANs | Switching & VLANs | Kategorie → andere Kategorie |
| q0609 | Grundlagen & Sonstige | Switching & VLANs | Switching & VLANs | Rückfall → Kategorie |
| q0610 | Grundlagen & Sonstige | Switching & VLANs | Switching & VLANs | Rückfall → Kategorie |
| q0611 | Grundlagen & Sonstige | Switching & VLANs | Switching & VLANs | Rückfall → Kategorie |
| q0628 | Grundlagen & Sonstige | Switching & VLANs | Switching & VLANs | Rückfall → Kategorie |
| q0630 | Grundlagen & Sonstige | Switching & VLANs | Switching & VLANs | Rückfall → Kategorie |
| q0647 | Grundlagen & Sonstige | Routing | Routing | Rückfall → Kategorie |
| q0664 | Grundlagen & Sonstige | Security & Services | Security & Services | Rückfall → Kategorie |
| q0703 | Grundlagen & Sonstige | Switching & VLANs | Switching & VLANs | Rückfall → Kategorie |
| q0790 | Grundlagen & Sonstige | Security & Services | Security & Services | Rückfall → Kategorie |
| q0794 | IPv4 & Subnetting | IPv6 | IPv6 | Kategorie → andere Kategorie |
| q0829 | Grundlagen & Sonstige | Geräte & Medien | Geräte & Medien | Rückfall → Kategorie |
| q0831 | Geräte & Medien | IPv4 & Subnetting | IPv4 & Subnetting | Kategorie → andere Kategorie |
| q0843 | Grundlagen & Sonstige | Switching & VLANs | Switching & VLANs | Rückfall → Kategorie |
| q0846 | Grundlagen & Sonstige | Switching & VLANs | Switching & VLANs | Rückfall → Kategorie |
| q0898 | Grundlagen & Sonstige | Routing | Routing | Rückfall → Kategorie |
| q0937 | Grundlagen & Sonstige | Routing | Routing | Rückfall → Kategorie |
| q0957 | IPv4 & Subnetting | Routing | Routing | Kategorie → andere Kategorie |
| q0972 | Security & Services | Switching & VLANs | Switching & VLANs | Kategorie → andere Kategorie |
| q0997 | Security & Services | IPv4 & Subnetting | IPv4 & Subnetting | Kategorie → andere Kategorie |
| q1033 | Switching & VLANs | Wireless | Wireless | Kategorie → andere Kategorie |
| q1037 | Grundlagen & Sonstige | IPv4 & Subnetting | IPv4 & Subnetting | Rückfall → Kategorie |
| q1046 | Switching & VLANs | Wireless | Wireless | Kategorie → andere Kategorie |
| q1053 | Grundlagen & Sonstige | Wireless | Wireless | Rückfall → Kategorie |
| q1062 | Architektur & Automation | Security & Services | Security & Services | Kategorie → andere Kategorie |
| q1063 | Architektur & Automation | IPv4 & Subnetting | IPv4 & Subnetting | Kategorie → andere Kategorie |
| q1064 | Architektur & Automation | IPv4 & Subnetting | IPv4 & Subnetting | Kategorie → andere Kategorie |
| q1065 | Architektur & Automation | IPv4 & Subnetting | IPv4 & Subnetting | Kategorie → andere Kategorie |
| q1066 | Architektur & Automation | IPv4 & Subnetting | IPv4 & Subnetting | Kategorie → andere Kategorie |
| q1069 | Grundlagen & Sonstige | IPv4 & Subnetting | IPv4 & Subnetting | Rückfall → Kategorie |
| q1082 | Architektur & Automation | Security & Services | Security & Services | Kategorie → andere Kategorie |
| q1084 | Architektur & Automation | IPv4 & Subnetting | IPv4 & Subnetting | Kategorie → andere Kategorie |
| q1085 | Architektur & Automation | Security & Services | Security & Services | Kategorie → andere Kategorie |
| q1095 | Grundlagen & Sonstige | IPv4 & Subnetting | IPv4 & Subnetting | Rückfall → Kategorie |
| q1099 | Grundlagen & Sonstige | IPv4 & Subnetting | IPv4 & Subnetting | Rückfall → Kategorie |
| q1111 | Grundlagen & Sonstige | Switching & VLANs | Switching & VLANs | Rückfall → Kategorie |
| q1117 | Grundlagen & Sonstige | IPv4 & Subnetting | IPv4 & Subnetting | Rückfall → Kategorie |
| q1121 | Grundlagen & Sonstige | IPv4 & Subnetting | IPv4 & Subnetting | Rückfall → Kategorie |
| q1122 | Architektur & Automation | Security & Services | Security & Services | Kategorie → andere Kategorie |
| q1124 | Grundlagen & Sonstige | IPv6 | IPv6 | Rückfall → Kategorie |
| q1129 | Architektur & Automation | IPv4 & Subnetting | IPv4 & Subnetting | Kategorie → andere Kategorie |
| q1131 | Grundlagen & Sonstige | IPv4 & Subnetting | IPv4 & Subnetting | Rückfall → Kategorie |
| q1145 | Grundlagen & Sonstige | IPv4 & Subnetting | IPv4 & Subnetting | Rückfall → Kategorie |
| q1149 | Grundlagen & Sonstige | Switching & VLANs | Switching & VLANs | Rückfall → Kategorie |
| q1151 | Grundlagen & Sonstige | Wireless | Wireless | Rückfall → Kategorie |
| q1177 | Grundlagen & Sonstige | IPv4 & Subnetting | IPv4 & Subnetting | Rückfall → Kategorie |
| q1184 | Grundlagen & Sonstige | IPv4 & Subnetting | IPv4 & Subnetting | Rückfall → Kategorie |
| q1189 | Grundlagen & Sonstige | IPv4 & Subnetting | IPv4 & Subnetting | Rückfall → Kategorie |
| q1197 | Grundlagen & Sonstige | Geräte & Medien | Geräte & Medien | Rückfall → Kategorie |
| q1211 | Grundlagen & Sonstige | IPv6 | IPv6 | Rückfall → Kategorie |
| q1227 | Grundlagen & Sonstige | IPv6 | IPv6 | Rückfall → Kategorie |
| q1241 | Grundlagen & Sonstige | Routing | Routing | Rückfall → Kategorie |
| q1245 | Grundlagen & Sonstige | Geräte & Medien | Geräte & Medien | Rückfall → Kategorie |
| q1254 | Grundlagen & Sonstige | IPv4 & Subnetting | IPv4 & Subnetting | Rückfall → Kategorie |
| q1259 | Grundlagen & Sonstige | IPv4 & Subnetting | IPv4 & Subnetting | Rückfall → Kategorie |
| q1261 | Architektur & Automation | IPv4 & Subnetting | IPv4 & Subnetting | Kategorie → andere Kategorie |
| q1276 | Grundlagen & Sonstige | IPv4 & Subnetting | IPv4 & Subnetting | Rückfall → Kategorie |
| q1279 | Grundlagen & Sonstige | Switching & VLANs | Switching & VLANs | Rückfall → Kategorie |
| q1296 | Grundlagen & Sonstige | IPv4 & Subnetting | IPv4 & Subnetting | Rückfall → Kategorie |
