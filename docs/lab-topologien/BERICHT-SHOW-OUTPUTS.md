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

## Stufe 3: HSRP

- **Modell:** `TopologyInterface.hsrp` (Version, Gruppen mit virtueller IP, Priority, Preempt, Timer, Tracking, Authentication). Parser für `standby version`, `standby [n] ip|priority|preempt|timers|track|authentication`.
- **`show standby brief`** (Router/L3-Switch mit `standby`-Befehlen, `src/lib/topology/hsrp.ts`): Zeile je Interface und Gruppe mit Priority (nach Tracking-Abzug), Preempt-Kennzeichen P, Zustand, Active, Standby, virtuelle IP. Die Wahl läuft über alle Teilnehmer am Segment (L2-Segmentlogik wie bei OSPF): höchste Priority, bei Gleichstand die höhere Interface-IP; weitere Router sind `Listen`.
- **Preempt-Hinweis analog zur DR-Wahl:** Hat der Router mit der höchsten Priority kein Preempt, steht dort „Angezeigt ist das Ergebnis bei gleichzeitigem Start … abhängig von der Startreihenfolge“, ebenso im Inspector.
- **Ausgeschlossene Teilnehmer:** andere HSRP-Version, unterschiedliche Authentication (beide Router werden Active), anderes Subnetz, andere Gruppennummer. Unterschiedliche Timer: Hinweis „nicht bestimmbar“. Tracking-Objekte (`track <Nummer>`) werden nicht ausgewertet und vermerkt. Ein Layer-3-Switch oder Routed-Port im Pfad: „nicht bestimmbar“.
- **Tracking:** Ein Tracking-Interface gilt als oben, wenn es existiert, nicht abgeschaltet und im Lab mit einem aktiven Link verbunden ist; sonst sinkt die Priority um den Abzug (Standard 10).
- **hsrp-Lab:** Im Zielzustand ist R1 abgeschaltet (letzter Befehl des Failover-Tests), R2 ist allein Active. Ohne diesen `shutdown` wäre R1 wegen `track Gi0/1 30` (Gi0/1 nicht verbunden) nur 80 und R2 Active; beides steht als Befund in `KORREKTURVORSCHLAEGE-LABTEXT.md`, Abschnitt 13.
- **Tests:** `lab-show-outputs-hsrp.test.ts` (18 Prüfungen): Lab im Zielzustand und in zwei Varianten (ohne Shutdown, ohne Tracking), negative Fälle (PC/Switch, Startzustand, Authentication, Version, Subnetz, Gruppe, Interface down/ohne IP, Tracking-Objekt), Wahl bei 3 Routern, Gleichstand, Preempt-Fälle, Timer, Tracking mit verbundenem/abgeschaltetem Interface, Parser. Der IP-Test lässt die virtuellen IPs aus dem Lab zu.
- **Annahme:** Ein Tracking-Interface ohne Link im Lab ist down (physikalisch kein Signal), auch wenn `no shutdown` fehlt oder gesetzt ist.

## Stufe 4: statische Routen, GRE und IPsec

- **Voraussetzung, jetzt im Modell:** `ip route` (statische IPv4-Routen), nummerierte ACLs (`access-list <n> permit|deny …`), Tunnel-Befehle (`tunnel source|destination|mode`) und die Crypto-Befehle (ISAKMP-Policy, Pre-Shared Key, Transform-Set, Crypto Map, `crypto map` am Interface). Alles nur aus den Lab-Befehlen.
- **`show ip route`** zeigt jetzt auch statische Routen (`S`, Default als `S*` mit „Gateway of last resort is … to network 0.0.0.0“). Eine statische Route erscheint nur, wenn der Next Hop in einem aktiven verbundenen Netz liegt (bzw. das angegebene Interface aktiv ist). Das ist eine Änderung gegenüber früher (statische Routen fehlten in der Tabelle) und betrifft alle Labs mit `ip route`.
- **`show interfaces tunnel <n>`** (`src/lib/topology/gre-tunnel.ts`): Zustand, Internet-Adresse, Tunnel source (mit IP und Interface), destination und Protokoll (GRE/IP, sonst der Modus laut Lab) aus der Konfiguration. „line protocol up“ gilt, wenn die Quelle aktiv ist und eine verbundene oder statische Route zum Ziel besteht (GRE ohne Keepalive, wie im Hinweis vermerkt). Nur dynamisch lernbare Wege: „nicht bestimmbar“. Gegenstelle im Lab wird verglichen (Ziel gehört keinem Gerät im Lab; Gegenstelle zeigt auf eine andere Adresse). MTU, Bandbreite und Zähler werden nicht ausgegeben.
- **`show crypto map`** (`src/lib/topology/ipsec.ts`): Peer, Crypto-ACL mit den Zeilen aus dem Lab, SA-Lifetime (nur wenn im Lab gesetzt), PFS und DH-Gruppe, Transform-Set mit Parametern, Interfaces, auf denen die Map liegt. Darunter „Prüfung der Konfiguration“ gegen die Gegenstelle im Lab: Map nicht am Interface, Transform-Set/ACL nicht definiert, Pre-Shared Key fehlt oder weicht ab, keine passende ISAKMP-Policy, Transform-Set-Parameter oder PFS weichen ab, Crypto-ACL nicht gespiegelt, Peer nicht im Lab.
- **`show crypto isakmp sa` / `show crypto ipsec sa`:** leer mit Hinweis „entsteht erst nach Verkehr (interesting traffic gemäß Crypto-ACL)“; ohne Paket- und SPI-Zähler. Bei der ISAKMP-Ausgabe stehen die Prüfpunkte als mögliche Gründe darunter.
- **Inspector:** `greHints`, `cryptoHints`.
- **Tests:** `lab-show-outputs-gre-ipsec.test.ts` (24 Prüfungen): gre-tunnel und ipsec-s2s-vpn positiv; negative Varianten mit geänderten Lab-Befehlen (falsches Ziel, Gegenstelle zeigt woanders hin, shutdown, Quelle fehlt/nicht vorhanden, Route fehlt, Map nicht am Interface, PSK abweichend/fehlend, ACL nicht gespiegelt, Transform-Set/PFS/Policy abweichend, Peer unbekannt, Transform-Set/ACL fehlt), Geräte ohne Tunnel/Crypto, Startzustand, statische Routen (installiert / nicht installiert), Parser. Der IP-Test lässt Routen, Crypto-ACLs, Peers und Tunnel-Ziele aus dem Lab zu.
- **Annahmen:** (1) Die DH-Gruppe wird als Text verglichen (`group 5` ↔ `group 5`); fehlende Policy-Parameter gelten als „Standard“ auf beiden Seiten. (2) Die Spiegelung der Crypto-ACL wird nur für einfache Zeilen `permit <Protokoll> <Quelle> <Wildcard> <Ziel> <Wildcard>` geprüft. (3) NAT-Ausnahme vor dem VPN („NAT/PAT vor VPN ausnehmen“) wird nicht ausgewertet.
