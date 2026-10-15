# Analyse: CLI-Ausgaben im Fragetext statt im Exhibit

Erzeugt von `scripts/audit/inline-cli-exhibits.audit.ts` (nur lesend, Erkennung in `src/__tests__/helpers/inline-cli.ts`). Es wurde nichts geändert.

## Vorgehen der Erkennung

- Geprüft werden alle Fragetexte in `ccnaQuestions` (1081) und `ccnaQuestionsClassified` (1055).
- **show-Ausgabe:** Interface-Statuszeile (`… is up, line protocol is …`), `Codes:`-Kopf einer Routing-Tabelle, `Gateway of last resort`, MAC-/Nachbar-/Interface-Tabellenköpfe oder Routenzeilen mit `[AD/Metrik] via`, zusammen mit weiteren typischen Zeilen (`Hardware is`, `MTU … bytes`, `packets input` …).
- **Konfigurationszeilen:** mindestens vier verschiedene IOS-Konfigurationsbefehle (`hostname`, `ip domain name`, `line vty`, `transport input`, `login local` …) im Text.
- **Prompt-Befehl im Satz:** Einzelbefehl mit Prompt (`City(config-router)# network …`) mitten im Satz; kein Block.
- **Wertliste aus der Grafik:** vier und mehr Zeilen mit MAC-Adressen, BIDs oder Prioritäten; nur über die Zeilenstruktur des klassifizierten Pools erkennbar.
- Beide Pools enthalten dieselben Fragetexte; der klassifizierte Pool hat noch die Zeilenumbrüche aus dem PDF, der Prüfungspool nicht (Abschnitt „Zeilenumbrüche“).

## Ergebnis: 2 Fragen mit CLI-Block im Fragetext, 5 Randfälle

### Zu verschieben (CLI-Block im Text)

| Frage-ID | Art | Exhibit heute | Vorschlag Trennung | Zeilen |
|---|---|---|---|---|
| q0829 / Q0829 | show-Ausgabe | keins | Text davor: „…erface FastEthemet0/13. What is the root cause of the issue?“ → CLI-Block ab „FastEthernet0/13 is up, line protocol is up Hardwa…“ (1112 Zeichen) → Text danach: „“ | 26 Zeilen im klassifizierten Pool |
| q0965 / Q0965 | Konfigurationszeilen | CLI-Exhibit vorhanden (Inhalt gleich) | Text davor: „“ → CLI-Block ab „hostname CPE service password-encryption ip domain…“ (228 Zeichen) → Text danach: „Refer to the exhibit. An engineer executed the script and ad…“ | 12 Zeilen im klassifizierten Pool |

### Randfälle (kein eigener CLI-Block; Entscheidung nötig)

| Frage-ID | Art | Exhibit heute | Fundstelle |
|---|---|---|---|
| Q0181 | Wertliste aus der Grafik | anderes Exhibit vorhanden | SW1: 0C:E0:38:41:86:07 - · SW2: 0C:0E:15:22:05:97 - |
| Q0242 | Wertliste aus der Grafik | anderes Exhibit vorhanden | Switch 1: 0C:E0:38:81:32:58 - · Switch 2: 0C:0E:15:22:1A:61 - |
| Q0254 | Wertliste aus der Grafik | anderes Exhibit vorhanden | Branch-1: priority 614440 - · Branch-2: priority 39391170 - |
| Q0277 | Wertliste aus der Grafik | anderes Exhibit vorhanden | Switch 1 - · BID: 32778 0018.184e.3c00 - |
| q0398 | Prompt-Befehl im Satz | CLI-Exhibit vorhanden (Inhalt abweichend) | City(config-router)# network 192.168.12.64 0.0.0.63 area 0 After completing the configuration, the associate d… |

## Zeilenumbrüche

- 1050 Fragen haben in beiden Pools einen Text; bei 1035 ist der Text bis auf Leerraum identisch. Der klassifizierte Pool trägt die ursprünglichen Zeilenumbrüche aus dem PDF, der Prüfungspool hat alles in einer Zeile.
- Für die Umsetzung sind die Umbrüche der gefundenen Fragen daher **nicht zu raten**: sie lassen sich für beide Pools aus dem klassifizierten Pool übernehmen und mit den typischen IOS-Zeilenanfängen gegenprüfen (Interface-Statuszeile, `Hardware is`, `MTU`, `reliability`, `Encapsulation`, `Keepalive`, `Auto-duplex`, `ARP type`, `Last input`, `Last clearing`, `Queueing`, `Output queue`, `5 minute`, Zähler mit führender Zahl …). Nur wo der klassifizierte Pool keinen passenden Text hat, bleibt die Heuristik.

## Anmerkungen

- Die Beispiel-ID `q0042` aus dem Auftrag enthält keine CLI-Ausgabe (TCP/UDP-Frage). Gemeint ist vermutlich `q0829` (FastEthernet0/13).
- Nicht untersucht werden CLI-Ausgaben in den Antwortoptionen (z. B. Konfigurationsvarianten als Optionen); das ist eine andere Darstellung und bräuchte eine eigene Entscheidung.
- Einzelne Befehle, die im Satz genannt werden (`show ip route`, `ip route 172.16.3.0 …`), sind Fließtext und keine CLI-Ausgabe; sie gelten nicht als Fund.
- Die Erkennung ist bewusst konservativ; ein Treffer ist ein Vorschlag, keine automatische Änderung.
