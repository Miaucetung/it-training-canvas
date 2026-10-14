# show-Ausgaben (Nachrüstschritt): Bericht

Branch `feature/show-outputs` (von `main` @ `6b5ee88`). Nicht gemergt.
Regeln wie bei IPv4/IPv6: nichts erfinden, was nur zur Laufzeit entsteht ist leer mit Hinweis, positive und negative Tests.

## Stufe 1: DHCP und VTP

### Neu im Modell
- `DeviceConfig.dhcpPools`, `dhcpExcluded`, `vtp` (Modus, Domain, Version, Passwort) und `TopologyInterface.dtp` / `nonegotiate`. Alles stammt nur aus den Lab-Befehlen (`parseLabDeviceConfig`).
- Parser: `ip dhcp pool` mit `network`, `default-router`, `dns-server`, `lease`; `ip dhcp excluded-address` (einzeln oder Bereich); `vtp domain|mode|version|password`; `switchport mode dynamic desirable|auto`, `switchport nonegotiate`. Beim Trunk-Modus gilt der letzte Befehl.

### Ausgaben
| Befehl | Gerät | Inhalt |
|---|---|---|
| `show ip dhcp pool` | Router/L3-Switch mit Pool | Netz, Adressen gesamt, ausgeschlossene Adressen im Pool (überlappende Bereiche einmal), Default-Router, DNS, Lease, Liste der `excluded-address`-Bereiche; „Leased addresses“ 0 mit Hinweis „entsteht erst nach DHCP-Anfragen“. Fehlt `network`: „im Lab nicht angegeben“ bzw. „nicht bestimmbar“. |
| `show ip dhcp binding` | wie oben | leer, Hinweis „entsteht erst nach DHCP-Anfragen“ (Adresse hängt von der Reihenfolge der Anfragen ab); keine Client-Adresse. |
| `show vtp status` | Switch mit `vtp`-Befehlen | Modus, Domain und Version nur aus der Konfiguration (Version ohne `vtp version`: „im Lab nicht angegeben“); Revision „abhängig vom Verlauf“; Zahl der VLANs: Server = 5 Standard-VLANs + Lab-VLANs, Client = nur bei Synchronisation. |

### VTP-Synchronisation
Ein Client erhält VLANs nur über eine Kette von Switches mit funktionierendem Trunk, gleicher Domain und gleichem Passwort zu einem Server. Der Trunk wird aus den Port-Einstellungen nach der DTP-Tabelle bestimmt (trunk/trunk, trunk/dynamisch, desirable/desirable|auto ja; auto/auto, access, Port aus, Trunk mit `nonegotiate` gegenüber dynamischer Seite nein). Nicht festgelegte Ports gelten als `dynamic auto` (Standard der Catalyst-Plattform). Bei fehlender Synchronisation nennt die Ausgabe die Verbindung und den Grund.
- **vtp-dtp:** SW1 `desirable` ↔ SW2 `trunk nonegotiate`: kein Trunk, SW2 und SW3 bleiben bei den 5 Standard-VLANs (der bekannte Fehler im Lab-Text, siehe `KORREKTURVORSCHLAEGE-LABTEXT.md`).
- **vlan-dhcp-nat-roas, dhcp-relay, vlan-vtp-dhcp-campus:** Trunks funktionieren, Clients synchronisieren.

### Korrektur nach Review
- **Switch ohne Domain** (Server oder Client): übernimmt die Domain der ersten empfangenen VTP-Nachricht über einen Trunk und synchronisiert danach, wenn das Passwort passt (beide ohne Passwort zählt als passend). Sind mehrere Domains erreichbar, steht „abhängig vom Verlauf“. Switches ohne jeden VTP-Befehl im Lab gelten als Werkseinstellung (Server, keine Domain, kein Passwort) und nehmen an der Verteilung teil. Hinweis im Inspector (`vtpHints`).
- **Transparent in der Kette:** übernimmt keine VLANs, leitet VTP-Nachrichten über seine Trunks weiter: v2 unabhängig von der Domain, v1 nur bei gleicher Domain. Das Passwort prüft er nicht. Fehlt im Lab die `vtp version` und weicht die Domain ab, ist die Weiterleitung „nicht bestimmbar“ (kein Ergebnis behauptet).
- Annahme: ein Passwort nur auf einer Seite zählt als Abweichung (Digest passt nicht).

### Tests
`lab-show-outputs-dhcp-vtp.test.ts` (40 Prüfungen): positive Fälle an dhcp, vtp-dtp, vlan-dhcp-nat-roas, vlan-vtp-dhcp-campus; negative Fälle (Geräte ohne Pool/VTP, Startzustand, Pool ohne `network`, andere Domain, anderes Passwort, Access-Port, Port aus, auto/auto, Domain fehlt, Transparent, unterbrochene Kette); Parser-Tests; DTP-Tabelle. Der Test „keine erfundenen IP-Adressen“ lässt zusätzlich die im Lab konfigurierten DHCP-Werte des jeweiligen Geräts zu (Gateway, DNS, Netz, Ausschlüsse), sonst nichts.

### Offene Punkte
- Die Revisionsnummer und der MD5-Digest werden nicht ausgegeben (hängen vom Verlauf ab bzw. sind nicht bestimmbar).
- DHCP-Pools auf Servern (Packet-Tracer-Server mit GUI-Pools, z. B. dhcp-relay) sind keine IOS-Konfiguration und erzeugen keine Ausgabe.
- In vlan-vtp-dhcp-campus sind laut Lab SW1 und SW2 beide Server; die Ausgabe weist darauf hin, dass bei Konflikten die Revisionsnummer entscheidet.

## Stufe 2: NAT (statische Einträge)

- **Modell:** `DeviceConfig.nat` (statische Zuordnungen mit optionalem Protokoll/Port, Pools, Regeln `list … pool|interface [overload]`, inside-/outside-Interfaces). Parser in `parseLabDeviceConfig`, Ausgabe in `src/lib/topology/nat-outputs.ts`.
- **`show ip nat translations`** (Router/L3-Switch mit NAT-Befehlen): statische Einträge stehen vollständig in der Tabelle (`---` Zeilen bzw. `tcp`/`udp` mit Ports). Für dynamische Regeln (Pool, Interface-Overload) bleibt die Tabelle leer; darunter steht je Regel „Dynamisch: ACL … → Pool/Interface …: Einträge entstehen erst nach Verkehr“. Fehlt der Pool im Lab: „im Lab nicht definiert“.
- **Inspector-Hinweise** (`natHints`): fehlendes `ip nat inside`/`outside`, Pool ohne Overload, dynamische Einträge erst nach Verkehr.
- **Labs:** static-nat (3 Einträge), co-acl-nat-isp (CO-1 und CO-2 je 4 Einträge mit den eigenen Adressen), nat-pat, dynamic-nat, nat-pool-overload, vlan-dhcp-nat-roas (dynamisch).
- **Test „keine erfundenen IP-Adressen“:** lässt zusätzlich die im Lab konfigurierten NAT-Adressen (statische Zuordnungen, Pool-Grenzen) des jeweiligen Geräts zu.
- **Tests:** `lab-show-outputs-nat.test.ts` (10 Prüfungen): positive Fälle je Lab, negative (Geräte ohne NAT, Startzustand, nur inside/outside ohne Regeln, dynamisch ohne Einträge, Pool nicht definiert), Parser mit Port/Pool/Interface.
- **Bewusst nicht enthalten:** `show ip nat statistics` (Treffer/Fehlschläge sind Laufzeitwerte). Kann auf Wunsch mit den Konfigurationsteilen (Interfaces, Pool) ergänzt werden.
- **Annahme:** Statische Einträge erscheinen mit der Konfiguration in der Tabelle, auch wenn `ip nat inside/outside` fehlt; dann weist der Inspector darauf hin, dass nicht übersetzt wird.
