# Dashboard didaktisch ordnen: Konzept (Phase 1)

Stand: Konzept, kein Code. Branch `feature/dashboard-didaktik` (von `main`). Nichts davon ist in Daten oder Oberfläche übernommen; das passiert erst nach deinem OK (Phase 2).
Alle Zahlen stammen aus dem Repo (Themen, Quizzes, Labs, `BLUEPRINT_DOMAINS`, Dashboard-Komponenten). Wo etwas fehlt, steht es als „fehlt“ da.

## 0. Befund: wie das Dashboard heute aufgebaut ist

Reihenfolge in `CcnaDashboard.tsx` (von oben): `TopologyHero` (interaktive Topologie, Fortsetzen-Button), `BlueprintDomainsGrid` (6 Prüfungsbereiche mit Gewichtung, aufklappbar), `TodayPracticeSection` (Subnetzrechner, Schwächen-Drill, Drag-and-Drop-Trainer, Labs), `SimulatorCards` (4 Simulatoren), `RecentActivitySection` (zuletzt geöffnet, max. 5), `DashboardFooter`. Die Kopfzeile bietet bereits Lernen, Üben & Prüfen, Simulatoren, Labs (55), Werkzeuge; dazu Befehlspalette (Strg+K) und Präsentationsmodus (P).

Was Einsteigern heute fehlt, und was ich im Code gefunden habe:

| Befund | Folge |
|---|---|
| Es gibt keinen „nächsten Schritt“. Die Prüfungsbereiche sind nach Blueprint sortiert (1.0 Network Fundamentals … 6.0 Automation), nicht nach Voraussetzungen. | Ein Anfänger weiß nicht, wo er anfängt; Subnetting steht in Bereich 1.0, VLANs in 2.0, OSPF in 3.0 ohne Reihenfolge. |
| **Der Fortschritt kann nicht steigen.** Die Fortschrittsbalken der Bereiche zählen Themen-IDs (`networking-fundamentals` …), gefüllt wird die Liste aber aus den Schritt-IDs des Lernpfads (`step-1-netzwerkgrundlagen` …) und aus `localStorage["ccna-completed-topics"]`, den nirgends jemand schreibt. | Die Anzeige bleibt für alle bei 0 %. Ein „abgeschlossen“-Ereignis für Lektionen existiert nicht. |
| Quiz-Ergebnisse werden nicht gespeichert: `TopicDetailPanel` behält nur `lastResult` im Zustand. | „Übungsfragen bestanden“ lässt sich heute nicht anzeigen. |
| Labs sind nur als ein Dialog mit allen 55 erreichbar. Eine Lektion verweist nicht auf passende Labs, ein Lab nicht auf die Lektion. | Zusammenhang Lektion, Fragen, Lab ist nicht sichtbar. |
| Vorhandene echte Daten: erledigte Labs (`ccna-completed-labs-v1`), zuletzt geöffnete Themen (max. 5), Schwächen-Fragen (`ExamPrep`/`PrioritizedLearning`), Lernpfad-Schritte (`ProgressTracker`, eigener Dialog). | Reicht für „begonnen“ (grob) und „Lab erledigt“, nicht für „Lektion/Fragen abgeschlossen“. |
| Es gibt ein allgemeines Willkommens-Overlay (`OnboardingTour`, mehrere Schritte als Modal). | Widerspricht deinem Wunsch nach einer kurzen, sachlichen Einführung ohne Overlay-Tour; siehe Abschnitt 3. |
| Kein Fachbegriff-Glossar. `CliGlossaryDialog` erklärt CLI-Befehle, jedes Lab hat ein eigenes `glossary`-Feld. | Fachbegriffe auf dem Dashboard brauchen neue Inhalte oder Verweise ins CLI-Glossar. |

## 1. Didaktischer Lernpfad (zur Freigabe)

Prinzip: Voraussetzungen vor Anwendungen, konkret vor abstrakt, jeder Schritt mit Lektion → Fragen → Lab/Simulator. Ausgangspunkt ist deine Reihenfolge. **Abweichungen und Ergänzungen sind markiert (Ergänzung, geteilt).** Der bestehende Lernpfad `ccna-full-path` (36 Schritte, Quiz nach jeder Lektion) bleibt als Detailansicht unverändert.

Kurzform (Voraussetzung = vorheriger Schritt, sofern nicht anders angegeben):

| # | Schritt | Lektionen (Thema-ID, Min.) | Übungsfragen (Quiz-ID, Fragen) | Labs (ID, Stufe) | Simulator/Werkzeug | Voraussetzung |
|---|---|---|---|---|---|---|
| 1 | Netzwerkgrundlagen und OSI/TCP-IP | `networking-fundamentals` 120 | `ccna-quiz-netzwerkgrundlagen` 23; `ccna-quiz-tag1-grundlagen` 70 | – (kein Lab vorhanden) | OSI-Simulator; Topologie-Erkunder | keine |
| 2 | Cisco IOS CLI **(Ergänzung)** | `ios-cli` 120 | `ccna-quiz-ios-cli` 8 | `drill-grundkonfig` (Drill) | CLI-Glossar | 1 |
| 3 | Ethernet, Kabel und Switching | `verkabelung` 70; `glasfaser` 90 | `ccna-quiz-glasfaser` 31 | `layer1-issues` (Mittel) | Verkabelungs-Trainer | 1 |
| 4 | IPv4-Adressierung und Subnetting | `ipv4-addressing` 120; `subnet-segmentation` 90 | `ccna-quiz-ipv4` 31; `ccna-quiz-segmentierung` 20 | `basic-ip` (Anfänger), `drill-pc-ips`, `drill-interfaces` (Drill) | Subnetting-Drill, -Quiz, -Cheatsheet, IPv4-Subnetztabelle, Subnetzrechner | 2 |
| 5 | VLANs und Trunks | `switching-vlans` 90; `vlan-advanced` 240 | `ccna-quiz-switching` 15; `quiz-vlan-advanced` 25; `ccna-quiz-roas` 10 | `vlan-trunking` (Anfänger), `drill-access-ports` (Drill), `vtp-dtp`, `roas`, `ivr-svi` (Mittel) | VLAN-Simulator | 3, 4 |
| 6 | STP und EtherChannel | `stp` 40; `etherchannel` 30 | `ccna-quiz-stp` 15; `ccna-quiz-etherchannel` 8; `ccna-quiz-tag1-wiederholung` 60 | `stp` (Mittel), `etherchannel` (Fortgeschritten) | STP-Simulator | 5 |
| 7 | Statisches Routing und Routingtabelle **(geteilt)** | `routing-ospf` 180 (Teil Routingtabelle/statisch/RIP) | `ccna-quiz-static-routing` 22; `ccna-quiz-rip` 20; `ccna-quiz-admin-distance` 15 | `static-routing`, `floating-static`, `rip-v2`, `rip-v2-passive` (Mittel), `rip-v1` (Anfänger) | Routing-Simulator, Routing-Drill | 4, 5 |
| 8 | OSPF (EIGRP als Vertiefung) **(geteilt)** | `routing-ospf` (Teil OSPF) | `ccna-quiz-ospf` 20; `ccna-quiz-eigrp` 20 | `ospf`, `ospf-rid-wildcard` (Mittel), `ospf-dr-bdr-election`, `ospf-multiarea`, `eigrp` (Fortgeschritten) | Routing-Simulator, OSPF-Wildcard-Drill | 7 |
| 9 | IPv6 | `ipv6` 90 | `ccna-quiz-ipv6` 16 | `ipv6`, `ipv6-static` (Mittel), `ospfv3-ipv6`, `ipv6-ospfv3-eigrpv6` (Fortgeschritten) | IPv6-Rechner | 4, 7 |
| 10 | IP-Services (DHCP, NAT, DNS, NTP/Syslog/SNMP, FHRP, QoS) | `dhcp-nat` 110; `nat` 30; `dns` 25; `device-management` 120; `fhrp` 90; `qos` 90 | `ccna-quiz-dhcp` 25; `ccna-quiz-nat` 8; `ccna-quiz-device-management` 13; `ccna-quiz-fhrp` 8; `ccna-quiz-qos` 10 | `dhcp` (Anfänger), `nat-pat`, `dynamic-nat`, `nat-pool-overload`, `static-nat`, `ntp-syslog-snmp`, `ios-backup-upgrade`, `password-recovery` (Mittel), `dhcp-relay`, `hsrp` (Fortgeschritten) | – | 7 |
| 11 | Security | `security` 100; `acl` 90 | `ccna-quiz-security` 17; `ccna-quiz-harden-access` 17; `ccna-quiz-dhcp-snooping-dai` 8; `ccna-quiz-acl` 14; `ccna-quiz-port-security` 15 | `ssh` (Anfänger), `device-hardening`, `port-security`, `acl-standard` (Mittel), `acl-extended`, `dhcp-snooping-dai`, `stp-hardening`, `vlan-hopping`, `aaa-radius-tacacs`, `co-acl-nat-isp` (Fortgeschritten) | ACL-Drill | 5, 7, 10 |
| 12 | WAN und VPN **(Ergänzung)** | `wan` 120 | `ccna-quiz-wan-vpn` 8 | `gre-tunnel`, `ipsec-s2s-vpn` (Fortgeschritten) | – | 8, 11 |
| 13 | Wireless | `wlan` 90 | `ccna-quiz-wlan` 16 | – (kein Lab vorhanden) | – | 1 |
| 14 | Controller, Virtualisierung und Automation | `sdn-controller` 120; `automation` 120; `ccna-virtualization` 45 | `ccna-quiz-sdn` 8; `ccna-quiz-automation` 12; `ccna-quiz-virtualization` 8 | `netflow`, `restconf`, `netconf-yang` (Fortgeschritten) | – | 10 |
| 15 | Troubleshooting und Prüfungsvorbereitung **(Ergänzung)** | `troubleshooting` 90 | `ccna-quiz-troubleshooting` 8; `ccna-quiz-gesamtpruefung` 100; `ccna-quiz-gesamtpruefung-2` 98; `ccna-quiz-cis1-klausur` 25; `ccna-quiz-cis2-klausur` 25; `ccna-quiz-cis3-klausur` 24 | `troubleshooting-cheat` (Mittel), `dhcp-troubleshoot-lab`, `vlan-dhcp-nat-roas`, `vlan-vtp-dhcp-campus` (Fortgeschritten) | Prüfungsvorbereitung, Drag-and-Drop-Trainer | 1–14 |

Prüfung der Vollständigkeit: alle 26 Lektionsthemen (zusammen 2520 Minuten), alle 39 Quizzes und alle 55 Labs sind genau einem Schritt zugeordnet (Labs je Schritt: 1, 1, 3, 5, 2, 5, 5, 4, 10, 10, 2, 0, 3, 4 = 55; Schritt 1 und 13 ohne Lab).

Entscheidungen, die du treffen musst:

1. **Schritt 2 (IOS CLI) ist eine Ergänzung** zu deiner Reihenfolge. Begründung: Ohne CLI-Grundlagen lässt sich kein Lab ausführen; der bestehende Lernpfad stellt die CLI aus demselben Grund vor die IP-Konfiguration.
2. **„Ethernet und Switching“ hat kein eigenes Thema.** Die Switching-Grundlagen stecken in `switching-vlans`, dem ersten Teil von Schritt 5. Schritt 3 enthält deshalb nur Verkabelung und Glasfaser; die Lektion „Switching“ erscheint unter Schritt 5. Alternativ ein neues Thema schreiben (Inhalt, nicht Teil dieses Auftrags).
3. **`routing-ospf` (180 Min.) liegt in zwei Schritten.** Das Thema ist eine Lektion. Die Schritte 7 und 8 verweisen beide darauf; der Fortschritt eines Schritts hängt dann an den Fragen und Labs, nicht an der Lektion allein. Alternative: die Lektion in zwei Themen teilen (Inhalt).
4. **Schritte 12, 13, 15 (WAN/VPN, Wireless, Prüfung) sind Ergänzungen bzw. Zusammenfassungen.** Wireless hat weder Lab noch Simulator; das Dashboard zeigt das sachlich („kein Lab vorhanden“).
5. **EIGRP** steht als Vertiefung in Schritt 8 (Labs `eigrp`, `ipv6-ospfv3-eigrpv6` sind „Fortgeschritten“).
6. **Simulatoren und Tools sind nach Thema zugeordnet** (z. B. STP-Simulator zu Schritt 6). Die Zuordnung der vier Simulatoren ist eindeutig, die der Drills ist mein Vorschlag.

## 2. Aufbau des Dashboards (von oben nach unten)

```
┌ Kopfzeile (wie bisher: Lernen, Üben & Prüfen, Simulatoren, Labs, Werkzeuge, Strg+K, P) ┐
│
│ [A] Nächster Schritt            genau eine Karte
│ [B] Lernpfad                     15 Schritte, aufklappbar, mit Status
│       Schritt n  ▸ Verstehen → Üben → Anwenden  (Dreiklang)
│ [C] Prüfungsbereiche (Blueprint) zweite Sicht, Gewichtung
│ [D] Werkzeuge und Referenzen     ruhiger Bereich
│ [E] Zuletzt geöffnet · Footer
└
```

**[A] Nächster Schritt.** Eine Karte mit Titel, Dauer, Begründung („Du hast Schritt 3 abgeschlossen; weiter mit IPv4“) und einem Button. Regel (nur aus echten Daten): erster Schritt des Lernpfads, dessen Voraussetzungen erfüllt sind und der nicht abgeschlossen ist; darin zuerst die erste ungelesene Lektion, dann Übungsfragen, dann das erste nicht erledigte Lab. Neue Nutzer: Schritt 1, Lektion 1, Text „Hier fängst du an“. Ohne Daten kein Raten: Sind alle 15 Schritte abgeschlossen, steht dort „Alle Schritte abgeschlossen“ mit Verweis auf die Prüfungsvorbereitung.

**[B] Lernpfad.** Liste der 15 Schritte, Status je Schritt als Text und Symbol (nicht nur Farbe): **offen**, **begonnen**, **abgeschlossen**. Der aktuelle Schritt ist aufgeklappt, die anderen eingeklappt. Gesperrt wird nichts: Eine nicht erfüllte Voraussetzung ist ein Hinweis („Empfohlen: Schritt 4 zuerst“), kein Verbot.

Pro aufgeklapptem Schritt der Dreiklang, klar beschriftet:

| Spalte | Inhalt | Status-Quelle |
|---|---|---|
| **Verstehen** | Lektionen des Schritts (Titel, Minuten) | Lektion „gelesen“ (neu, siehe unten) |
| **Üben** | Übungsfragen zum Thema (Anzahl Fragen), Drills | bestes Quiz-Ergebnis (neu) |
| **Anwenden** | Labs (mit Stufe und Dauer), Simulator | Lab erledigt (vorhanden: `ccna-completed-labs-v1`) |

„Voraussetzungen“ stehen als eine Zeile oberhalb („Baut auf: Schritt 4 IPv4, Schritt 5 VLANs“).

**[C] Prüfungsbereiche.** Das vorhandene Raster der 6 Blueprint-Domänen mit Gewichtung (20/20/25/10/15/10) bleibt, wird als zweite Sicht („Nach Prüfungsbereichen“) unter oder neben dem Lernpfad gezeigt, und rechnet den Fortschritt aus denselben echten Daten (Befund in Abschnitt 0).

**[D] Werkzeuge und Referenzen.** Eigener, ruhigerer Bereich weiter unten: Subnetzrechner, Befehlsreferenz (CLI-Glossar), Befehlspalette (Strg+K), Präsentationsmodus (P), Simulatoren, Drills, Topologie-Erkunder und Canvas. Alles bleibt außerdem über die Kopfzeile erreichbar.

**[E] Zuletzt geöffnet und Footer** bleiben, kleiner.

Was mit den vorhandenen Bausteinen passiert (nichts wird ersatzlos entfernt):

| Heute | Vorschlag |
|---|---|
| `TopologyHero` (großer interaktiver Kopfbereich) | wandert in den Bereich [D] als „Topologie erkunden“; oben übernimmt [A] |
| `BlueprintDomainsGrid` | bleibt als Sicht [C] |
| `TodayPracticeSection` (Subnetzrechner, Schwächen-Drill, Drag-and-Drop, Labs) | Subnetzrechner → [D]; Schwächen-Drill und Drag-and-Drop → [D] und im Schritt unter „Üben“; Labs → im Schritt unter „Anwenden“ |
| `SimulatorCards` | im passenden Schritt unter „Anwenden“ und in [D] |
| `RecentActivitySection` | bleibt, kleiner |

**Neue Daten (Phase 2).** Nur erfasst, was Nutzer tatsächlich tun; Speicherort wie die vorhandenen Fortschritte (`localStorage`, bei Anmeldung wie bisher synchronisiert):

| Datum | Ereignis | Heute |
|---|---|---|
| Lektion geöffnet / gelesen | Öffnen = „begonnen“; Button „Lektion als gelesen markieren“ am Ende = „gelesen“ | fehlt (nur „zuletzt geöffnet“, max. 5) |
| Quiz-Ergebnis je Quiz | bestes Ergebnis und Datum nach `onComplete` | fehlt |
| Lab erledigt | bereits vorhanden | vorhanden |
| Schritt-Status | **abgeleitet**: abgeschlossen, wenn alle Lektionen gelesen und alle Quizzes des Schritts mindestens einmal bearbeitet; Labs zählen nicht als Pflicht, werden aber angezeigt | wird abgeleitet |

Offen zu entscheiden: ob „abgeschlossen“ eine Mindestquote verlangt (z. B. 70 % in jedem Quiz) oder nur Bearbeitung. Mein Vorschlag: Bearbeitung genügt, die Quote wird angezeigt, aber nicht verlangt (keine Gamification, kein Druck).

## 3. Orientierung für Einsteiger

**„So funktioniert die App“** beim ersten Besuch: eine einzelne, schließbare Karte oben im Dashboard (kein Overlay, keine Tour), jederzeit über „Hilfe“ in [D] wieder aufrufbar. Wortlaut (Entwurf):

> 1. **Verstehen:** Jeder Schritt beginnt mit einer Lektion.
> 2. **Üben:** Danach prüfst du dich mit Übungsfragen.
> 3. **Anwenden:** Zum Schluss baust du das Thema in einem Lab oder Simulator nach.
> Den nächsten Schritt zeigt dir die Karte „Nächster Schritt“.

Die vorhandene `OnboardingTour` (mehrstufiges Modal) wird auf dem Dashboard nicht mehr automatisch gezeigt, wenn du zustimmst; sie bleibt aus der Hilfe erreichbar. (Rücksprache nötig, weil sie bisher beim ersten Start erscheint.)

**Was ist die CCNA, wie ist die Prüfung aufgebaut?** Kurzer, ausklappbarer Block: Cisco Certified Network Associate, Prüfung 200-301; sechs Prüfungsbereiche mit den Gewichten 20/20/25/10/15/10 % (aus der Konfiguration im Repo); die Plattform enthält Prüfungssimulationen (100 Fragen). **Angaben zu Dauer, Fragenzahl und Bestehensgrenze nehme ich nicht aus dem Gedächtnis auf**, sondern erst nach Prüfung gegen die Cisco-Seite; bis dahin steht dort „Details nennt Cisco auf der Prüfungsseite“.

**Schwierigkeitsangabe.** Labs haben bereits Stufen (Anfänger 5, Mittel 24, Fortgeschritten 22, Drill 4); sie erscheinen als Text („Einsteiger“ statt „Anfänger“ ist sprachlich möglich, bitte entscheiden). Simulatoren und Drills haben keine Stufe: Vorschlag OSI, VLAN = Einsteiger; STP, Routing = Fortgeschritten; Drills = Drill. Schritte erhalten die höchste Stufe ihrer Pflichtinhalte nicht, sondern die Angabe „Baut auf: …“.

**Fachbegriffe.** Ein kleines Dashboard-Glossar (Entwurf von ca. 20 Begriffen: Switch, Router, VLAN, Trunk, Subnetz, Gateway, OSPF, NAT, DHCP, ACL …) mit je einem Satz; Begriffe im Dashboard-Text erhalten eine kurze Erklärung per Tooltip oder Link. Das ist neuer Inhalt, den du freigeben musst. Befehlsbezogene Begriffe verweisen auf das vorhandene CLI-Glossar.

**Sprache.** Einfach und kurz, Fachbegriffe im Original (Trunk, Gateway, Subnetz-Maske, Native VLAN).

## 4. Prüfung mit einer Anfänger-Persona

Persona: „Mia“, kennt Netzwerke nur als WLAN zu Hause, öffnet die App zum ersten Mal.

| Weg | Heute (Klicks) | Soll (Klicks, Ziel ≤ 2) |
|---|---|---|
| Dashboard → erste Lektion | Bereichskarte „1.0 Network Fundamentals“ aufklappen, Thema wählen = 2; ob dies der richtige Anfang ist, sieht Mia nicht | „Nächster Schritt“ → „Lektion starten“ = **1** |
| Lektion → passende Fragen | in der Lektion nach unten zum Quiz-Bereich, „Quiz starten“ = 1 (plus Scrollen) | Am Lektionsende „Weiter: Übungsfragen“ = **1** |
| Fragen → passendes Lab | Dashboard, „Labs“ öffnen, Dialog, Filter/Suche, Lab wählen = mindestens 3; kein Bezug zum Thema | In Schritt 4 unter „Anwenden“ „Lab: IP-Grundkonfiguration“ = **1–2** (Lab-Dialog öffnet direkt dieses Lab) |
| zurück zum Dashboard | Dialog schließen, Thema schließen = 2 | „Zum Lernpfad“ = **1** |

Bei Schritt 1 gibt es kein Lab: der Dreiklang zeigt „Anwenden: Simulator (OSI)“, die Wegstrecke bleibt bei 1–2 Klicks.

Messung in Phase 2: Playwright-Test des Wegs (leerer Zustand → Lektion → Fragen → Lab → Dashboard, maximal zwei Klicks pro Etappe) plus axe-Lauf in Dark und Light bei 1440, 1024 und 390 px; Screenshots für neuen Nutzer und Nutzer mit Fortschritt (außerhalb des Repos).

## 5. Phase 2: Arbeitspakete (nach deinem OK, Reihenfolge)

1. Datenmodell: `lernpfad`-Konfiguration (Schritte, Zuordnung aus Abschnitt 1) als typisierte Datei mit Test, dass jedes Thema, Quiz und Lab genau einmal vorkommt.
2. Fortschrittsdaten: Lektion geöffnet/gelesen, Quiz-Ergebnis speichern; Fix für die Fortschrittsberechnung der Blueprint-Bereiche; Tests.
3. Dashboard-Komponenten [A] bis [E], Design-Tokens, Dark/Light, 1440/1024/390 px, WCAG AA.
4. Verbindungen Lektion → Quiz → Lab (Labs öffnen mit `initialLabId`), Rücksprung zum Lernpfad.
5. Einführung, Glossar, Schwierigkeitsangaben.
6. Playwright-Test des Anfänger-Wegs, axe, Screenshots (nicht ins Repo), Bericht.

Vor jedem Commit lint, test, build. Merge nach deinem OK.

## 6. Zur Freigabe

- Lernpfad-Tabelle aus Abschnitt 1 (insbesondere die Ergänzungen 2, 12, 15 und die geteilte Lektion `routing-ospf`).
- „Abgeschlossen“: Bearbeitung genügt, keine Mindestquote?
- `TopologyHero` nach unten in [D] verschieben?
- `OnboardingTour` auf dem Dashboard ersetzen durch die schlichte Einführungskarte?
- Stufenbezeichnungen (Anfänger oder Einsteiger) und die Stufen für Simulatoren.
- Glossar-Begriffe und die Aussagen zur Prüfung (nach Prüfung gegen Cisco).
