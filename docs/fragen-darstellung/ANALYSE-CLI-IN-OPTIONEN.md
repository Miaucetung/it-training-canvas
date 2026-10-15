# Analyse: CLI-Inhalte in den Antwortoptionen

Erzeugt von `scripts/audit/option-cli-analysis.audit.ts` (nur lesend, Erkennung in `src/__tests__/helpers/option-cli.ts`). Es wurde nichts geändert.

## Erkennung

Jede Option wird einzeln eingeordnet (Reihenfolge der Prüfung):

1. **Zeilenumbruch bereits im Text:** die Option enthält schon `\n`.
2. **show-Ausgabe:** typische Ausgabemerkmale (`line protocol is`, `Hardware is`, `Gateway of last resort`, `Codes:`, `[AD/Metrik] via`, MAC-/Nachbar-Tabellenköpfe).
3. **mehrzeilig mit Prompts:** mindestens zwei Prompts (`Router(config)#`, `R15(config-line)#`, `R7#`) in einer Option.
4. **Konfiguration ohne Prompt:** mindestens drei verschiedene IOS-Konfigurationsbefehle (`interface`, `ip address`, `switchport`, `network` …) in einer Option.
5. **Einzelbefehl:** genau ein Prompt oder ein Befehl, z. B. `no shutdown`; das ist normale Kurzantwort und kein Problem.
6. **kein CLI:** übrige Optionen (Fließtext-Antworten).

## Zahlen

| Einordnung | Optionen (Prüfungspool) | Fragen (Prüfungspool) | Optionen (klassifiziert) | Fragen (klassifiziert) |
|---|---:|---:|---:|---:|
| mehrzeilig mit Prompts | 157 | 40 | 157 | 40 |
| Konfiguration ohne Prompt | 111 | 36 | 111 | 36 |
| show-Ausgabe | 8 | 2 | 12 | 3 |
| Zeilenumbruch bereits im Text | 4 | 1 | 4 | 1 |
| Einzelbefehl | 912 | 393 | 911 | 390 |
| kein CLI | 3321 | 895 | 3277 | 874 |
| **alle Optionen** | 4513 | 1081 | 4472 | 1055 |

**Mehrzeilige Konfigurationen oder Ausgaben in Optionen, die als Fließtext erscheinen (ohne Einzelbefehle): 280 Optionen in 78 Fragen** (Prüfungspool; der klassifizierte Pool hat dieselben Optionen mit Abweichungen in wenigen Fragen). Die längste Option hat 492 Zeichen.

Beide Pools speichern die Optionen als **einzeilige Texte**; nur 4 Optionen in 1 Frage tragen Zeilenumbrüche. Die Zeilen sind in den Daten also nicht erhalten, aber an den Prompts bzw. Befehlsanfängen erkennbar.

## Betroffene Fragen

### mehrzeilig mit Prompts: 157 Optionen in 40 Fragen

q0109 (ABCD), q0166 (ABCD), q0274 (ABCD), q0276 (ABCD), q0288 (ABCD), q0293 (ABCD), q0307 (ABCD), q0308 (ABCD), q0309 (ABCD), q0310 (ABCD), q0345 (ABCD), q0354 (ABCD), q0399 (ABC), q0442 (ABCD), q0443 (ABCD), q0446 (ABCDE), q0454 (ABCD), q0470 (ABCD), q0472 (ABCD), q0474 (ABCD), q0479 (ABCD), q0483 (ABCD), q0484 (ABCD), q0487 (ABCD), q0492 (ABCD), q0498 (ABCD), q0530 (ABCDE), q0560 (ABCD), q0565 (ABCD), q0605 (ABCD), q0645 (ABCD), q0703 (C), q0834 (ABCD), q0843 (ABCD), q0875 (ABD), q0904 (ABCD), q0964 (ABCD), q0972 (ABCD), q1050 (ABCD), q1339 (ABCD)

### Konfiguration ohne Prompt: 111 Optionen in 36 Fragen

q0014 (ABCD), q0130 (BCD), q0200 (C), q0249 (ABCD), q0267 (ABCDE), q0268 (ABCD), q0280 (ABCD), q0291 (AC), q0306 (ABCD), q0457 (ABCD), q0459 (ABCD), q0461 (ABCD), q0499 (B), q0537 (ABCD), q0568 (ABCD), q0582 (ABCD), q0584 (ABCD), q0601 (B), q0658 (ABCD), q0663 (BCD), q0696 (ABCD), q0702 (BCD), q0859 (BD), q0875 (C), q0948 (ABCD), q0957 (ABCD), q0976 (ABCD), q0984 (ABCD), q0997 (D), q0999 (ABCD), q1036 (D), q1051 (BD), q1141 (ABC), q1149 (ABCD), q1222 (C), q1340 (A)

### show-Ausgabe: 8 Optionen in 2 Fragen

q0493 (ABCD), q0942 (ABCD)

Zusätzlich im klassifizierten Pool eingeordnet: Q0089.

### Zeilenumbruch bereits im Text: 4 Optionen in 1 Fragen

q0846 (ABCD)

## Beispiele (Wortlaut unverändert)

| Frage | Option | Einordnung | Text |
|---|---|---|---|
| q0109 | A | mehrzeilig mit Prompts | R7# interface FastEthernet1/0 ip address 10.88.31.127 255.255.255.192 R8# interface FastEthernet0/0 ip address 10.19.63.95 255.255.255.240 R9# interface FastEthernet1/1 ip address 10.23.98.1… |
| q0109 | B | mehrzeilig mit Prompts | R7# interface FastEthernet1/0 ip address 10.88.31.126 255.255.255.240 R8# interface FastEthernet0/0 ip address 10.19.63.94 255.255.255.192 R9# interface FastEthernet1/1 ip address 10.23.98.1… |
| q0109 | C | mehrzeilig mit Prompts | R7# interface FastEthernet1/0 ip address 10.88.31.127 255.255.255.240 R8# interface FastEthernet0/0 ip address 10.19.63.95 255.255.255.192 R9# interface FastEthernet1/1 ip address 10.23.98.1… |
| q0014 | A | Konfiguration ohne Prompt | interface e0/0 description to XX-AXXX:XXXXX ip address 10.2.1.3 255.255.255.252 |
| q0014 | B | Konfiguration ohne Prompt | interface e0/0 description to XX-AXXX:XXXXX ip address 192.168.1.1 255.255.255.248 |
| q0014 | C | Konfiguration ohne Prompt | interface e0/0 description to XX-AXXX:XXXXX ip address 172.16.1.4 255.255.255.248 |
| q0493 | A | show-Ausgabe | S 192.168.0.0/20 [1/0] via 10.1.1.1 |
| q0493 | B | show-Ausgabe | S 192.168.2.0/29 [1/0] via 10.1.1.1 |
| q0493 | C | show-Ausgabe | S 192.168.2.0/28 [1/0] via 10.1.1.1 |
| q0846 | A | Zeilenumbruch bereits im Text | switchport mode trunk
switchport trunk native vlan 321
switchport trunk allowed vlan 100,200,300 |
| q0846 | B | Zeilenumbruch bereits im Text | switchport mode dynamic desirable
switchport trunk native vlan 321
switchport trunk allowed vlan 100,200,300 |
| q0846 | C | Zeilenumbruch bereits im Text | switchport trunk encapsulation dot1q
switchport trunk native vlan 321
switchport trunk allowed vlan 100-300 |

## Darstellungsvorschlag ohne Inhaltsänderung

**Grundsatz:** Die Daten bleiben unverändert (eine Option = ein String, Reihenfolge, Index und Lösung bleiben). Nur die Anzeige ändert sich; der Snapshot-Test bleibt ohne Aktualisierung grün.

1. **Reine Anzeigefunktion** `splitCliOption(text): string[]`: zerlegt eine als CLI erkannte Option in Zeilen und ändert dabei kein Zeichen, es entfallen nur die Leerzeichen an den Schnittstellen.
   - *mehrzeilig mit Prompts:* neue Zeile vor jedem Prompt (`Name(config…)#`, `R7#`). Der Trenner „ - “ vor einem Prompt (Aufzählungszeichen aus dem PDF) bleibt als letztes Zeichen der vorherigen Zeile stehen.
   - *Konfiguration ohne Prompt:* neue Zeile vor den Befehlsanfängen aus einer festen Liste (`interface`, `description`, `ip address`, `no shutdown`, `switchport …`, `encapsulation`, `network`, `router …`, `access-list` …). Bei Mehrdeutigkeit (ein Befehlswort im Fließtext) wird nicht getrennt.
   - *show-Ausgabe:* wie im Fragetext die IOS-Zeilenanfänge (`show interfaces`) bzw. Spaltenköpfe.
2. **Rendering:** erkannte Optionen erscheinen im Antwortfeld in Monospace (`font-mono text-xs`, `whitespace-pre-wrap`, dunkel/hell wie die CLI-Exhibits), mit dem Buchstaben links. Einzelbefehle und Fließtext bleiben wie bisher. Gilt in Prüfungstrainer, priorisiertem Lernen und Quiz.
3. **Nachweis:** Test über alle erkannten Optionen beider Pools: die zusammengesetzten Zeilen ergeben ohne Leerraum-Unterschiede genau den Originaltext; der Inhalts-Snapshot bleibt unverändert; `question-rendering.mjs` prüft bei 390 px weiterhin auf abgeschnittene Texte und horizontales Scrollen (`pre-wrap` verhindert beides).
4. **Grenzen:** Die Zerlegung ist eine Heuristik für die Anzeige, kein Parser. Wo sie unsicher ist, bleibt der Fließtext. Tippfehler im Original (`name-serveer`, `contig`, `015`) bleiben sichtbar und unkorrigiert.
5. **Alternative (nicht empfohlen):** Zeilenumbrüche in die Datenstrings schreiben. Das ändert den Snapshot für ca. 280 Optionen, braucht dieselbe Heuristik und lässt sich nicht rückgängig machen, ohne die Daten erneut zu ändern.

Aufwand grob: eine Funktion mit Tests (rund 150 Zeilen), eine Komponente für die Optionsanzeige in den drei Dialogen und ein Lauf von `question-rendering.mjs`.

