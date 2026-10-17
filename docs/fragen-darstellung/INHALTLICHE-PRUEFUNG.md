# Inhaltliche Prüfung des Fragenpools (nur Analyse, nichts geändert)

Grundlage: [INHALTLICHE-BEFUNDE.md](INHALTLICHE-BEFUNDE.md) (31 Lösungsabweichungen, 23 Einlesefehler, Q1254) gegen die Referenz-PDF `00-FragenBeantwortetKomplett200_301.pdf` (nur gelesen, nicht kopiert). Prüfwerkzeug: `scripts/audit/pdf_pruefung.py` (Aufruf in der Kopfzeile des Skripts). Ergebnis: Fragen, Optionen und Lösungen der App wurden seitenübergreifend und zeilenbasiert mit den grünen Markierungen der PDF verglichen.

Sicherheitsstufen: **sicher** = aus PDF und Fachwissen eindeutig, **wahrscheinlich** = PDF und Fachwissen stützen es, restlicher Zweifel benannt, **unklar** = PDF und Fachwissen reichen nicht, Entscheidung nötig.

## 1. Ergebnis in Zahlen

| Meldung | Anzahl | Davon echt | Falschmeldung des Vergleichs |
|---|---:|---:|---:|
| „Lösungsbuchstabe weicht ab“ | 22 | 7 | 15 |
| „Fragetext abweichend“ (in der Liste als Lösungsabweichung geführt) | 9 | 1 (q0665, ID-Verschiebung) | 8 |
| „Abweichende Optionenanzahl“ (Einlesefehler) | 23 | 3 (+ q0551: Lücke in der PDF selbst) | 19 |
| Q1254 | 1 | 1 | – |

Die echten Fälle sind andere als die bisher gemeldeten, und es gibt Funde außerhalb der Liste (Abschnitt 2.2 und 2.3). Gesamter Pool (1081 Fragen): 1060 stimmen in Optionen und Lösung vollständig mit der PDF überein; 21 sind auffällig und unten erfasst.

Von den 21 sind 17 unten behandelt. Die übrigen vier sind Scan-Treffer ohne App-Fehler: q0089, q0365, q0664 und q0846 (der PDF-Block enthält zusätzlich die Folgefrage und deren grüne Markierung; die App-Frage selbst ist korrekt; bei q0846 trägt die PDF den Tippfehler „vian“). q0965 hat keinen Treffer, weil der Fragetext beim Umzug des CLI-Blocks (`fix/inline-cli-exhibits`) gekürzt wurde.

### Warum der bisherige Vergleich so viele Falschmeldungen hatte

1. **Buchstabenerkennung:** Wörter wie „A“ im Optionstext einer grün markierten Zeile („A leaf switch can be added …“) wurden als Option A gezählt. Das erzeugte die Muster „App B, PDF A,B“ (q0008, q0415, q0445, q0533, q0876, q1235, q1245 u. a.).
2. **Seitenweise Auswertung:** Fragen, die über einen Seitenumbruch laufen, verloren Optionen und Markierungen auf der Folgeseite (q0522, q0983, q0045, q0086, q0166 u. a.): „PDF hat 3 Optionen“ bei tatsächlich 4.
3. **Doppelte Nummern in der PDF:** Q1006, Q1157 und Q1288 kommen in der PDF jeweils zweimal mit unterschiedlichem Inhalt vor; die App übernimmt das (doppelte IDs, Abschnitt 2.3). Der Vergleich nahm für beide App-Fragen denselben PDF-Block.
4. **Fragetext-Vergleich** nach Zeichenlänge: Zeilenumbrüche und „✑“-Aufzählungen der PDF ergeben Längenunterschiede ohne inhaltlichen Unterschied (q0034, q0145, q0267, q0297, q0551, q0565).

## 2. Befunde, nach Sicherheit sortiert

### 2.1 Sicher: Fehler in den App-Daten

#### a) Folgefrage in Optionen und Lösung hineingezogen (Lösungsabweichung echt)

Muster: Die PDF führt eine Folgefrage („Qnnnn Nachfragen“ oder ohne Nummer) direkt unter der Frage. Beim Einlesen wurden deren Optionstexte an die Optionen der Frage angehängt oder zusätzliche Optionen erzeugt, und die Lösung enthält Buchstaben der Folgefrage. Wirkung in der App: `expectedAnswerCount` ist die Länge der Lösung, deshalb verlangt die Frage mehr Antworten als vorgesehen (z. B. vier bei q0219).

| Frage | Was kaputt ist | Korrektur aus der PDF | Folgefrage in der App? |
|---|---|---|---|
| **q0219** (S. 81) | 6 statt 4 Optionen, Optionen A–D mit Text aus Q0220 verschmolzen; Lösung A,C,D,E | 4 Optionen: A „It is a Cisco-proprietary protocol.“, B „It runs on the network layer.“, C „It can discover information from routers, firewalls, and switches.“, D „It runs on the physical layer and the data link layer.“; Lösung **A** (PDF grün A). Fachlich: A ist unstrittig; C beschreibt auch Cisco-Geräte-Erkennung, ist aber nicht die markierte Antwort | **fehlt**: Q0220 |
| **q0501** (S. 226) | Optionen A–D tragen Text aus Q0502; Lösung B,D | A `00-05-42-38-53-31`, B `00-00-5E-00-01-0a`, C `00-00-0C-07-AD-89`, D `00-07-C0-70-AB-01`; Lösung **B** (VRRP-Virtual-MAC 0000.5E00.01xx; `…0C07.AC` gehört zu HSRP) | **fehlt**: Q0502 |
| **q0658** (S. 286/287) | 5 statt 4 Optionen (Optionen der Folgefrage Q0659 angehängt); Lösung A,B,C | 4 Optionen (ACL 99/199 mit Wildcard `0.0.255.255` bzw. `0.255.255.255`), Lösung **A** (`standard 99 … deny 192.168.0.0 0.0.255.255`; /16-Wildcard) | Q0659 steht als eigene Frage schon im Pool (q0201, q0490, q0566) |
| **q0769** (S. 326) | Optionen A–C tragen Text aus Q0770; Lösung A,D | A „1“, B „2“, C „3“, D „4“; Lösung **A** (das JSON im Exhibit ist ein einziges äußeres Objekt mit vier Schlüsseln, die auf Arrays zeigen) | **fehlt**: Q0770 |
| **q1014** (S. 452) | Optionen mit Text aus Q1015 verschmolzen, Exhibit (JSON) gehört zu Q1015; Lösung C,D | Q1014: 4 Optionen, Lösung **C**. Q1015 „Refer to the exhibit. What is missing from this output for it to be executed?“: A double quotes, B exclamation point, C square bracket `[` am Anfang, D curly bracket `}` am Ende; Lösung **D** (im Exhibit fehlt die schließende `}`) | **fehlt**: Q1015 |
| **q1151** (S. 527–529) | Frage mit 4 Optionen, Lösung C,B: B stammt von einer unbenannten Zusatzfrage, deren 4 Optionen als Text an Option D hängen | Q1151: Lösung **C** (192.168.25.100 ist der im Exhibit markierte DHCP-Server). Zusatzfrage „Which switch becomes the root bridge?“: A SW4 (8192, 05:0f:e8:ed:b2:98), B SW2 (8192, 00:ac:f0:9b:dc:72), C SW3 (16384, …), D SW4 (16384, …); Lösung **B** (niedrigste Priorität, dann niedrigste MAC) | **fehlt** als eigene Frage |

Dieselbe Verschmelzung, aber **nur im Optionstext** (Lösung stimmt):

| Frage | Auffälligkeit | Korrektur |
|---|---|---|
| q0271 | Option E „forwarding Q0272 #autonomousaccesspoint #cloudbasedaccesspoint AAP = …“ | E = „forwarding“; Q0272 ist eine Drag-and-Drop-Frage ohne Text |
| q0786 | Optionen A–D mit „One / Four / Seven / Nine“ und „Q0787 Nachfragen …“ | Optionen ohne Anhang; Lösung D „Accept: application/json“; Q0787 steht als q0780 im Pool |
| q0840 | Optionen mit „radio policy / profile name / NAS-ID configuration“ und „Q0841 Nachfragen …“ | Optionen A–D ohne Anhang (D „Set the Layer 2 Security to None.“); Q0841 **fehlt** (Frage „…SSID called „Office“… What must be set the same on each network…“, A radio policy, B profile name, C NAS-ID configuration, D security policies; PDF grün D) |
| q1163 | Optionen mit „collisions / bad NIC / duplex mismatch / broadcast storm“ | Optionen A „provides unlimited address ranges“, B „is used when the network has multiple endpoint listeners“, C „reduces network complexity“, D „alleviates the shortage of IPv4 addresses“; Q1164 („Which interface condition is occurring in this output?“, PDF grün D „broadcast storm“) steht nicht als eigene Frage mit diesem Text im Pool |

Verschwundene Folgefragen insgesamt: **Q0220, Q0502, Q0770, Q0841, Q1015, die unbenannte Root-Bridge-Frage, evtl. Q1164**. Ob sie aufgenommen werden sollen, ist eine Inhaltsentscheidung.

#### b) Einzelwahl-Fragen mit zwei Lösungen (nicht in der bisherigen Liste)

Der Pool-Vergleich zeigt vier Einzelwahl-Fragen, bei denen die App zwei richtige Antworten führt, die PDF aber nur eine grün markiert. Die App fragt dort „zwei Antworten“ ab.

| Frage | App | PDF | Einschätzung | Sicherheit |
|---|---|---|---|---|
| q0060 „binary pattern of unique ipv6 unique local address“ | B,D | B (`11111100`) | RFC 4193: Präfix FC00::/7; in Gebrauch ist FD00::/8 (`11111101`). Die PDF und die übliche Prüfungsantwort sind B; D ist praxisnah, aber nicht markiert | unklar (B laut PDF, D vertretbar) |
| q0213 „How will SW2 handle traffic from VLAN 10 on SW1?“ | B,C | C („drops“) | Exhibit: SW1 Trunk native VLAN 10, SW2 Trunk native VLAN 100, beide erlauben 5–20. VLAN-10-Frames gehen untagged über den Trunk und landen auf SW2 im nativen VLAN 100 → **B** „sends the traffic to VLAN 100“. „Drops“ stimmt nicht (nur Warnungen von CDP/STP) | wahrscheinlich B (PDF-Markierung C fachlich zweifelhaft) |
| q0949 „Which IP header field is changed … when QoS marking is enabled?“ | C,D | C („Type of Service“) | DSCP ist der Anteil des ToS-Bytes, den QoS-Marking setzt; beide Antworten sind fachlich vertretbar, die PDF markiert nur C | unklar |
| q0982 „Which type of security program is violated when a group of employees enters a building using the ID badge of only one person?“ | C,D | D („user awareness“) | Tailgating verletzt formal die Zutrittskontrolle (C); die Prüfungsantwort laut PDF ist D, weil das Schulungsprogramm (Awareness) greift | unklar |

#### c) Weitere Datenfehler

| Frage | Befund | Korrektur / Hinweis | Sicherheit |
|---|---|---|---|
| **q1254** (S. 568) | `question` ist leer. Die PDF hat auf dieser Seite **keinen** Fragetext, nur das JSON-Bild (`["firewall":"FW12", …]`, 5 Zeilen) und die Optionen value/array/object/key, grün A „value“ | Der Text ist aus der PDF nicht wiederherstellbar. Nach Vorbild q1062/q1063 („What is represented by the word … within this JSON schema?“) und der Lösung „value“ lautet die Frage vermutlich auf einen der Werte „FW12“, „R20“ oder „SW25“ (Schlüssel wären „firewall“, „router“, „switch“) | sicher (Text fehlt auch in der PDF), Wortlaut unklar |
| **q0551** (S. 241/242) | Option A ist leer („• A.“), Fragetext endet auf „• A.“ | Das steht schon so in der PDF (Option A ohne Text); Lösung D „6“ stimmt (informational = Level 6). Der Text von Option A (vermutlich „0“) ist nicht ableitbar | sicher (Quelle fehlerhaft) |
| **q0665** | App-Text „How does MAC learning function?“ (Lösung D) | In der PDF ist **Q0665** eine Drag-and-Drop-Frage zu Port-Security (switchport port-security maximum 2 / sticky). Die App-Frage ist der zweite Teil von „Q0664 (2)“ (S. 289) mit identischem Text; die ID ist verschoben. Antwort D „adds unknown source MAC addresses to the CAM table“ ist fachlich richtig | sicher (Zuordnung), Lösung sicher |

### 2.2 Wahrscheinlich

| Frage | App / PDF | Einschätzung | Sicherheit |
|---|---|---|---|
| **q0593**, **q1227** (S. 261, 560; dritte Kopie Q1124, S. 510) | App C / PDF **B** bzw. **A** (Q1124: C) | Dieselbe Frage dreimal in der PDF mit **drei verschiedenen** Markierungen. Exhibit: PC 10.2.2.2/255.255.255.248, Default Gateway **10.2.2.10** (liegt nicht im Netz 10.2.2.0/29), DNS 8.8.8.8. Defekt ist das Gateway → **C**. B (DNS) ist falsch (8.8.8.8 ist gültig); A würde nur helfen, wenn der Router im selben /28 läge (Exhibit nennt das Router-Netz 10.2.2.0/29). Die PDF-Markierungen B/A sind vermutlich Markierungsfehler der Quelle | wahrscheinlich C |
| q0220 (verloren, siehe 2.1) | PDF grün C,D, Kommentar „Jonny statt C.“ | CDP liefert IP-Adresse des Nachbarn (E) und hilft, L2-Konnektivität zu prüfen, wenn L3 ausfällt (D); „VLAN-Informationen beziehen“ (C) ist nicht der typische Grund. Der Kommentar spricht für **D,E** | wahrscheinlich D,E |
| q0502 (verloren) | PDF grün B | VRRP als Herstellerstandard für gemischte Umgebungen → B; D beschreibt ebenfalls Failover | wahrscheinlich B |
| q0770 (verloren) | PDF grün D „encoded JSON token … used for authentication“ | Lehrbuchdefinition ist „…to securely exchange information“ (C); die PDF markiert D | unklar (D laut PDF) |
| q0533 | App = PDF (C) | Notice (Level 5) = „significant normal events“, z. B. OSPF-Adjacency-Wechsel („routing instance has flapped“) | wahrscheinlich |
| q0565 | App = PDF (A) | PAT nur für VLAN 200 (192.168.100.32/27 wird nur dann passen, wenn VLAN 200 dieses Netz ist; B enthält das ganze /24 inkl. VLAN 100; C/D sind öffentliche Adressen). Exhibit nicht gegengeprüft | wahrscheinlich |
| q0795 | App = PDF (B,D) | SOHO: 1–50 Nutzer, Router-Port am Breitband | wahrscheinlich |
| q1006 (beide Fassungen), q1157, q1288 | App = PDF | DNA Center (D), „warning“ im Array (A), SDN Control Plane (D), WLC (B, RRM), SSID (C), RADIUS am WLC (C) | wahrscheinlich |
| q1245 | App = PDF (C) | Show-Ausgabe: 1,9 von 2,3 Mio. Eingangspaketen sind Broadcasts | wahrscheinlich |

### 2.3 Strukturbefund: doppelte IDs

In `ccnaQuestions` kommen **q1006, q1157 und q1288 je zweimal** mit unterschiedlichem Inhalt vor (die PDF nummeriert diese Fragen selbst doppelt). Fortschritt, Schwächeliste und Kategorie-Overrides sind über die ID adressiert. Folgen nicht geprüft; Vorschlag: nur als Entscheidung festhalten.

### 2.4 Falschmeldungen: App stimmt mit der PDF überein

Alle Fragen unten sind in Optionen und Lösung **gleich** zur PDF, mit fachlicher Einschätzung.

| Frage | Lösung (App = PDF) | Begründung | Sicherheit |
|---|---|---|---|
| q0008 | C | Spine-Leaf: neuer Leaf mit Verbindung zu **jedem** Spine | sicher |
| q0034 | C | 4 × /27 (je ≤ 30 Hosts) = /25 Summe | sicher |
| q0145 | C | 8 Subnetze → /27; letzte nutzbare Adresse im ersten Subnetz = .30; Layer 3 → `no switchport` | sicher |
| q0222 | B,D,E | L3 für Inter-VLAN, getrennte Adressräume, MAC-Tabelle je VLAN | sicher |
| q0267 | A,E | /27 und /23; erste Adresse im Subnetz: 10.70.148.1/23, 10.70.155.65/27 (B ist .17 im Netz .0/27, D ist .159.1 im Netz .158.0/23) | sicher |
| q0297 | B | Access-Port + Voice-VLAN | sicher |
| q0415 | B | Trunk erlaubt nur VLAN 10–12, VLAN 13 fehlt | sicher |
| q0445 | A | Neighbor hängt in EXCHANGE: typischer MTU-Mismatch | sicher |
| q0522 | B,D,F | `logging trap 3` = Level 0–3 (emergency, alert, critical, error): hier emergency, critical, error | sicher |
| q0551 | D | informational = Level 6 (Option A in der PDF leer, siehe 2.1c) | sicher |
| q0625 | B,E | ACL lässt alles zu bei zu weitem permit oder zu frühem permit | wahrscheinlich |
| q0656 | B | WPA2-PSK ASCII mindestens 8 Zeichen | sicher |
| q0876 | B | CDP auf Gi0/0/0 (Richtung Router B) abschalten, damit nur Router C Informationen erhält | sicher |
| q0983 | C,E | ESP und AH gehören zur IPsec-Suite | sicher |
| q1235 | B | Multicast: an alle Mitglieder, Anycast: an den nächsten | sicher |

Die 23 „Optionenanzahl“-Meldungen und ihre Ursachen:

| Frage | Befund | Ursache |
|---|---|---|
| q0045, q0086, q0166, q0171, q0181, q0313, q0382, q0419, q0476, q0821, q0834, q0875, q0984, q1149, q1198 | App = PDF (4 bzw. 5 Optionen), Lösung gleich | Seitenumbruch oder Fragenkopf mit Zusatzzeilen; der bisherige Vergleich sah nur die erste Seite |
| q0522, q0565, q0876, q0983 | App = PDF | wie oben (siehe 2.4) |
| q0551 | App = PDF, Option A leer | PDF selbst (2.1c) |
| q0219, q0658, q1014 | echte Einlesefehler | 2.1a |

## 3. Vorschlag zur Reihenfolge der Einzelentscheidungen

1. 2.1a (Verschmelzungen, 6 Fragen + 4 nur im Optionstext) mit Entscheidung, ob die 7 verlorenen Folgefragen aufgenommen werden.
2. 2.1b (vier Einzelwahl-Fragen mit zwei Lösungen) und q0593/q1227 (2.2).
3. q1254, q0551, q0665 (2.1c) und die doppelten IDs (2.3).

Zu **jeder** Frage kann ich auf Anweisung einzeln die Korrektur vorbereiten (mit Snapshot-Update und den geänderten Feldern im Bericht).
