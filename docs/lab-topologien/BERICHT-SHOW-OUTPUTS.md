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

### Tests
`lab-show-outputs-dhcp-vtp.test.ts` (23 Prüfungen): positive Fälle an dhcp, vtp-dtp, vlan-dhcp-nat-roas, vlan-vtp-dhcp-campus; negative Fälle (Geräte ohne Pool/VTP, Startzustand, Pool ohne `network`, andere Domain, anderes Passwort, Access-Port, Port aus, auto/auto, Domain fehlt, Transparent, unterbrochene Kette); Parser-Tests; DTP-Tabelle. Der Test „keine erfundenen IP-Adressen“ lässt zusätzlich die im Lab konfigurierten DHCP-Werte des jeweiligen Geräts zu (Gateway, DNS, Netz, Ausschlüsse), sonst nichts.

### Offene Punkte
- Die Revisionsnummer und der MD5-Digest werden nicht ausgegeben (hängen vom Verlauf ab bzw. sind nicht bestimmbar).
- DHCP-Pools auf Servern (Packet-Tracer-Server mit GUI-Pools, z. B. dhcp-relay) sind keine IOS-Konfiguration und erzeugen keine Ausgabe.
- In vlan-vtp-dhcp-campus sind laut Lab SW1 und SW2 beide Server; die Ausgabe weist darauf hin, dass bei Konflikten die Revisionsnummer entscheidet.
