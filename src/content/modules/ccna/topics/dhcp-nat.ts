// ============================================================
// CCNA Topic: DHCP & NAT
// ============================================================

import type { Concept, Topic } from "@/lib/content/types";

export const CONCEPT_DHCP: Concept = {
  id: "dhcp",
  title: "DHCP — Dynamic Host Configuration Protocol",
  appliesTo: ["ccna", "comptia-network-plus"],
  tags: ["networking", "dhcp", "ip", "automation", "layer-7"],
  content: `
## DHCP (RFC 2131)

:::kernidee
DHCP löst ein Henne-Ei-Problem: Ein frischer Client hat **noch keine IP** und kennt den Server **nicht** — also fragt er per **Broadcast** ins Blaue („Ist hier ein DHCP-Server?"). Der ganze DORA-Tanz dreht sich darum, von „ich habe gar nichts" sicher zu „ich habe genau **diese** geliehene IP" zu kommen — inklusive einer **Lease** (Mietdauer), denn die Adresse gehört dem Client nur auf Zeit.
:::

DHCP vergibt automatisch IP-Adressen, Subnetzmaske, Default-Gateway und DNS.

### DORA-Prozess
\`\`\`
Client → Broadcast: DISCOVER  (Wer ist DHCP-Server?)
Server → Broadcast: OFFER     (Ich bin hier, deine IP: 192.168.1.100)
Client → Broadcast: REQUEST   (Ich nehme 192.168.1.100)
Server → Unicast:   ACK       (Bestätigt, Lease 86400 s)
\`\`\`

### DHCP auf Cisco Router
\`\`\`
R1(config)# ip dhcp pool OFFICE
R1(dhcp-config)# network 192.168.1.0 255.255.255.0
R1(dhcp-config)# default-router 192.168.1.1
R1(dhcp-config)# dns-server 8.8.8.8 8.8.4.4
R1(dhcp-config)# lease 1 0 0           ! 1 Tag

R1(config)# ip dhcp excluded-address 192.168.1.1 192.168.1.10

R1# show ip dhcp binding
R1# show ip dhcp pool
\`\`\`

### DHCP Relay (IP Helper)
Falls DHCP-Server in einem anderen Subnetz:
\`\`\`
R1(config-if)# ip helper-address 10.0.0.1  ! IP des DHCP-Servers
\`\`\`
Router wandelt Broadcast in Unicast um und leitet weiter.

### DHCP Snooping (Layer-2-Sicherheit)
- Blockiert DHCP-Antworten von nicht-autorisierten Ports
- Trusted: Uplink-Ports (zum echten Server)
- Untrusted: Access-Ports (Endgeräte)
\`\`\`
SW(config)# ip dhcp snooping
SW(config)# ip dhcp snooping vlan 10,20
SW(config-if)# ip dhcp snooping trust         ! Uplink-Port
\`\`\`
  `.trim(),
};

export const CONCEPT_DHCP_DORA: Concept = {
  id: "dhcp-dora",
  title: "DHCP DORA — Ablauf, Paketfelder & Broadcast/Unicast",
  appliesTo: ["ccna", "comptia-network-plus"],
  tags: ["dhcp", "dora", "discover", "offer", "request", "ack", "udp", "layer-7"],
  content: `
## 🎯 CCNA-Prüfungsrelevanz: ⭐⭐⭐ | Exam Topic: 2.6 | ⏱️ 15 Min

---

## 📚 Lernziele

- Die vier DORA-Schritte in **korrekter Reihenfolge** benennen und erklären
- Pro Schritt sagen, ob er **Broadcast oder Unicast** ist — und warum
- Die wichtigsten **BOOTP-Felder** (chaddr, yiaddr, giaddr, xid) und Optionen zuordnen
- Die Sondernachrichten **NAK, DECLINE, RELEASE** einordnen

---

## DORA im Detail

DHCP läuft über **UDP** — Server lauscht auf **Port 67**, Client auf **Port 68**. Der gesamte Handshake heißt **DORA**:

\`\`\`
1. DISCOVER  Client → Broadcast (255.255.255.255)
   src 0.0.0.0:68  dst 255.255.255.255:67
   "Gibt es hier einen DHCP-Server?"  (enthält chaddr = Client-MAC, xid)

2. OFFER     Server → Client (Broadcast ODER Unicast)
   yiaddr = angebotene IP, plus Maske/Gateway/DNS/Lease als Optionen

3. REQUEST   Client → Broadcast
   "Ich nehme diese IP."  Option 50 = Requested IP, Option 54 = Server-ID
   Broadcast, damit ALLE Server es hören — die nicht gewählten geben ihr Angebot wieder frei

4. ACK       Server → Client
   Bestätigung, ab jetzt läuft die Lease-Zeit
\`\`\`

Der Client kennt zu Beginn weder seine eigene IP (\`src 0.0.0.0\`) noch die Server-IP — deshalb sind **DISCOVER und REQUEST Broadcasts**. **OFFER und ACK** können je nach Implementierung Broadcast oder Unicast sein (oft Broadcast, weil der Client noch keine bestätigte IP hat).

## Wichtige Felder (BOOTP-Header)

| Feld | Bedeutung |
|------|-----------|
| \`xid\` | Transaction-ID — ordnet Antworten der Anfrage zu |
| \`chaddr\` | Client-Hardware-Adresse (MAC) |
| \`yiaddr\` | "your IP" — die dem Client zugewiesene Adresse (im OFFER/ACK) |
| \`giaddr\` | Gateway-IP des Relay-Agents (0.0.0.0 wenn kein Relay) |
| \`siaddr\` | IP des nächsten Servers (z. B. TFTP für Boot) |

## Sondernachrichten

- **NAK** — Server lehnt ab (z. B. Client fragt nach IP aus falschem Subnetz)
- **DECLINE** — Client hat die IP per ARP getestet und festgestellt: schon belegt
- **RELEASE** — Client gibt seine Lease freiwillig zurück (Unicast an Server)

---

## ⚠️ Häufige Fehler & Prüfungsfallen

- ⚠️ **Reihenfolge verwechselt:** DROA, DORA, ROAD — geprüft wird fast immer **DORA** (Discover, Offer, Request, Ack). Ein beliebter Distraktor ist "DROA".
- ⚠️ **Broadcast/Unicast falsch zugeordnet:** REQUEST ist ein **Broadcast** (nicht Unicast!), obwohl der Client den Server bereits kennt — damit die anderen Server ihr Angebot zurücknehmen.
- ⚠️ **Ports verdreht:** Server = 67, Client = 68. Eine häufige Falschantwort tauscht beide.
  `.trim(),
};

export const CONCEPT_DHCP_LEASE: Concept = {
  id: "dhcp-lease",
  title: "DHCP Lease — T1 Renewal & T2 Rebinding",
  appliesTo: ["ccna"],
  tags: ["dhcp", "lease", "renewal", "rebinding", "t1", "t2", "timer"],
  content: `
## 🎯 CCNA-Prüfungsrelevanz: ⭐⭐ | Exam Topic: 2.6 | ⏱️ 10 Min

---

## 📚 Lernziele

- Den **Lebenszyklus** einer DHCP-Lease beschreiben
- Die Timer **T1 (50 %)** und **T2 (87,5 %)** und ihre Aktionen erklären
- Den Unterschied zwischen **Renewal (Unicast)** und **Rebinding (Broadcast)** benennen
- Die Lease-Dauer auf einem Cisco-Router konfigurieren

---

## Der Lease-Lebenszyklus

Eine DHCP-Adresse wird **geliehen** (lease), nicht dauerhaft vergeben. Beim ACK startet die Lease-Uhr. Zwei Timer steuern die Verlängerung:

\`\`\`
|========== Lease-Dauer (z. B. 8 Tage) ==========|
0%            T1 (50%)        T2 (87,5%)      100%
              Renewal         Rebinding       Expiry
              (Unicast)       (Broadcast)
\`\`\`

- **T1 = 50 % der Lease** → **Renewal**: Der Client schickt einen **Unicast-REQUEST direkt an den ursprünglichen Server** ("verlängere bitte meine IP"). Antwortet der Server mit ACK, beginnt die Lease von vorn.
- **T2 = 87,5 % der Lease** → **Rebinding**: Renewal hat bis hierher nicht geklappt (Server weg?). Der Client schickt nun einen **Broadcast-REQUEST an JEDEN erreichbaren Server**.
- **100 % = Expiry**: Auch Rebinding gescheitert → der Client **gibt die IP auf** und startet eine komplett neue DORA-Sequenz. Bis dahin kann er kein IP-Routing mehr nutzen.

## Konfiguration (Cisco)

\`\`\`
R1(config)# ip dhcp pool OFFICE
R1(dhcp-config)# network 192.168.1.0 255.255.255.0
R1(dhcp-config)# default-router 192.168.1.1
R1(dhcp-config)# lease 8 0 0        ! 8 Tage, 0 Stunden, 0 Minuten
R1(dhcp-config)# lease infinite      ! alternativ: niemals ablaufen

R1# show ip dhcp binding             ! zeigt Lease-Ablaufzeitpunkt
\`\`\`

Kurze Leases (z. B. Gäste-WLAN, \`lease 0 2 0\` = 2 Stunden) geben Adressen schnell zurück in den Pool. Lange Leases reduzieren DHCP-Traffic in stabilen Büronetzen.

---

## ⚠️ Häufige Fehler & Prüfungsfallen

- ⚠️ **T1/T2-Prozente verwechselt:** T1 = **50 %** (Renewal, Unicast), T2 = **87,5 %** (Rebinding, Broadcast). Geprüft wird gern, welcher Timer einen Broadcast auslöst → **T2**.
- ⚠️ **Lease-Syntax:** \`lease <Tage> <Stunden> <Minuten>\` — \`lease 1\` allein bedeutet **1 Tag**, nicht 1 Stunde.
  `.trim(),
};

export const CONCEPT_DHCP_OPTIONS: Concept = {
  id: "dhcp-options",
  title: "DHCP-Optionen — 3, 6, 51 & 82 (Relay Agent Info)",
  appliesTo: ["ccna"],
  tags: ["dhcp", "options", "option-82", "relay-agent", "circuit-id", "remote-id"],
  content: `
## 🎯 CCNA-Prüfungsrelevanz: ⭐⭐ | Exam Topic: 2.6 / 5.7 | ⏱️ 12 Min

---

## 📚 Lernziele

- Die wichtigsten **DHCP-Optionen** und ihre Funktion zuordnen
- **Option 82** (Relay Agent Information) und ihren Sicherheitsnutzen erklären
- Den Zusammenhang zwischen Option 82, DHCP-Relay und DHCP-Snooping verstehen

---

## Was sind DHCP-Optionen?

Neben der IP selbst transportiert DHCP **Optionen** im Paket — codiert als Type-Length-Value. Die prüfungsrelevanten:

| Option | Name | Inhalt |
|--------|------|--------|
| 1 | Subnet Mask | Subnetzmaske |
| 3 | Router | Default-Gateway |
| 6 | DNS Server | DNS-Server-Adresse(n) |
| 15 | Domain Name | DNS-Domänensuffix |
| 51 | Lease Time | Lease-Dauer in Sekunden |
| 53 | Message Type | DISCOVER/OFFER/REQUEST/ACK… |
| 50 | Requested IP | vom Client gewünschte IP |
| 54 | Server Identifier | IP des ausgewählten Servers |
| **82** | **Relay Agent Info** | Port-/Switch-Kennung (Sicherheit) |

\`\`\`
R1(config)# ip dhcp pool OFFICE
R1(dhcp-config)# network 192.168.1.0 255.255.255.0
R1(dhcp-config)# default-router 192.168.1.1      ! Option 3
R1(dhcp-config)# dns-server 8.8.8.8 1.1.1.1      ! Option 6
R1(dhcp-config)# domain-name firma.local         ! Option 15
R1(dhcp-config)# lease 1 0 0                       ! Option 51
\`\`\`

## Option 82 — Relay Agent Information

Option 82 wird vom **Relay-Agent oder DHCP-Snooping-Switch** in das DHCP-Paket eingefügt, **bevor** es zum Server weitergeleitet wird. Sie enthält zwei Sub-Optionen:

- **Circuit-ID** — an welchem Port/VLAN kam die Anfrage rein
- **Remote-ID** — welcher Switch/Relay (z. B. dessen MAC)

Dadurch weiß der Server (oder ein zentrales System) **woher** eine Anfrage physisch stammt — Grundlage für Adresszuteilung pro Port und für die Missbrauchserkennung.

\`\`\`
SW(config)# ip dhcp snooping information option         ! Option 82 einfügen (Default an)
R1(config)# ip dhcp relay information trust-all          ! Relay vertraut Option-82-Paketen
\`\`\`

---

## ⚠️ Häufige Fehler & Prüfungsfallen

- ⚠️ **Option 3 vs. 6 verwechselt:** **3 = Gateway (Router)**, **6 = DNS**. Ein klassischer Distraktor dreht beide um.
- ⚠️ **Option 82 wird vom Server verworfen:** Fügt ein Snooping-Switch Option 82 ein, der Relay-Router aber vertraut ihr nicht, droppt er das Paket. Lösung: \`ip dhcp relay information trust-all\` (oder am Switch \`ip dhcp snooping information option allow-untrusted\`).
  `.trim(),
};

export const CONCEPT_DHCP_APIPA: Concept = {
  id: "dhcp-apipa",
  title: "APIPA — 169.254.x.x als Diagnose-Signal",
  appliesTo: ["ccna", "comptia-network-plus"],
  tags: ["dhcp", "apipa", "link-local", "169.254", "troubleshooting", "rfc-3927"],
  content: `
## 🎯 CCNA-Prüfungsrelevanz: ⭐⭐⭐ | Exam Topic: 5.5 | ⏱️ 10 Min

---

## 📚 Lernziele

- Erkennen, dass eine **169.254.x.x**-Adresse ein DHCP-Problem signalisiert
- Den Adressbereich und seine **Link-Local-Eigenschaft** (nicht routbar) benennen
- Die häufigsten **Ursachen** systematisch eingrenzen

---

## Was ist APIPA?

**APIPA** (Automatic Private IP Addressing) ist ein Mechanismus von Windows (und macOS), der sich aus dem Bereich **169.254.0.0/16** (RFC 3927, "link-local") **selbst** eine Adresse gibt, **wenn kein DHCP-Server antwortet**. Der Host pingt den Bereich vorher per ARP durch, um Konflikte zu vermeiden.

\`\`\`
C:\\> ipconfig
   IPv4-Adresse  . . . . . . : 169.254.137.42
   Subnetzmaske  . . . . . . : 255.255.0.0
   Standardgateway . . . . . :              ← LEER!
\`\`\`

Entscheidend: **169.254.x.x ist nicht routbar.** Zwei APIPA-Hosts im selben L2-Segment können sich gegenseitig erreichen, aber es gibt **kein Gateway** — kein Internet, kein Inter-VLAN.

## APIPA als Diagnose-Signal

Sieht ein Techniker **169.254.x.x**, heißt das fast immer: **"DHCP hat nicht funktioniert."** Eingrenzung:

1. **DHCP-Server down** oder Pool erschöpft (\`show ip dhcp pool\` → 0 freie Adressen)
2. **Relay fehlt/falsch:** Server in anderem Subnetz, aber kein \`ip helper-address\` auf dem Client-Interface
3. **L2-Problem:** Access-Port im falschen VLAN, Trunk down, Kabel
4. **DHCP-Snooping** blockiert den (legitimen) Server, weil der Uplink-Port nicht \`trust\` ist

\`\`\`
! Schnelltest vom Client
ipconfig /release
ipconfig /renew      ! holt der Client jetzt eine echte IP?
\`\`\`

---

## ⚠️ Häufige Fehler & Prüfungsfallen

- ⚠️ **APIPA ≠ Fehlkonfiguration des Clients:** Die 169.254-Adresse ist **kein** Client-Tippfehler, sondern die **Folge** eines DHCP-Ausfalls — am Server/Relay/VLAN suchen, nicht am Client.
- ⚠️ **169.254 mit 192.168 verwechselt:** 192.168.0.0/16 ist privat-routbar (RFC 1918), **169.254.0.0/16 ist link-local und nicht routbar** (RFC 3927).
  `.trim(),
};

export const CONCEPT_DHCP_RELAY: Concept = {
  id: "dhcp-relay",
  title: "DHCP Relay — ip helper-address richtig platzieren",
  appliesTo: ["ccna"],
  tags: ["dhcp", "relay", "ip-helper-address", "giaddr", "inter-vlan", "broadcast"],
  content: `
## 🎯 CCNA-Prüfungsrelevanz: ⭐⭐⭐ | Exam Topic: 4.3 | ⏱️ 15 Min

---

## 📚 Lernziele

- Erklären, **warum** ein zentraler DHCP-Server ohne Relay nicht über Subnetzgrenzen funktioniert
- \`ip helper-address\` auf dem **richtigen (Client-seitigen) Interface** platzieren
- Die Rolle des **giaddr**-Felds bei der Pool-Auswahl verstehen
- Mehrere Helper-Adressen für Redundanz konfigurieren

---

## Das Problem: DHCP ist Broadcast, Router blockieren Broadcasts

Der DISCOVER eines Clients ist ein **Broadcast** (255.255.255.255). Router leiten Broadcasts **nicht** weiter — ein DHCP-Server in einem anderen VLAN/Subnetz sieht die Anfrage also nie. Lösung: der **DHCP-Relay-Agent**.

## ip helper-address — wohin?

Der Befehl gehört auf das **Interface, das den Clients zugewandt ist** — also das SVI bzw. Router-Subinterface des **Client-VLANs**, **nicht** das Interface Richtung Server.

\`\`\`
! R1 ist Gateway der Clients in VLAN 10 (192.168.10.0/24).
! DHCP-Server steht zentral in 192.168.2.11.

R1(config)# interface gi0/0.10            ! CLIENT-seitiges Interface!
R1(config-subif)# encapsulation dot1q 10
R1(config-subif)# ip address 192.168.10.1 255.255.255.0
R1(config-subif)# ip helper-address 192.168.2.11
\`\`\`

**Was der Relay tut:** Er fängt den Client-Broadcast auf dem Client-Interface ab, trägt die **eigene Interface-IP in das giaddr-Feld** ein und sendet das Paket als **Unicast** an den Server. Der Server liest \`giaddr\` und weiß dadurch, **aus welchem Pool** (welchem Subnetz) er eine Adresse vergeben muss. Genau deshalb muss \`ip helper-address\` client-seitig stehen — nur dort entsteht das korrekte giaddr.

\`\`\`
! Redundanz: zwei Server
R1(config-subif)# ip helper-address 192.168.2.11
R1(config-subif)# ip helper-address 192.168.2.12
\`\`\`

Nebenwirkung: \`ip helper-address\` leitet standardmäßig **acht UDP-Dienste** weiter (DHCP/BOOTP, DNS, TFTP, TIME, NetBIOS …). Mit \`no ip forward-protocol udp <port>\` lässt sich das einschränken.

---

## ⚠️ Häufige Fehler & Prüfungsfallen

- ⚠️ **Helper auf dem falschen Interface:** Steht \`ip helper-address\` auf dem **Server-seitigen** Interface statt am Client-VLAN, entsteht kein korrektes giaddr → der Server kann den Pool nicht zuordnen, der Client bekommt **APIPA**. Klassischer Troubleshooting-Fehler.
- ⚠️ **Server hat keinen Pool für das Client-Subnetz:** Relay funktioniert, aber der Server kennt das per giaddr angefragte Subnetz nicht → NAK/keine Antwort. Beide Seiten müssen zusammenpassen.
  `.trim(),
};

export const CONCEPT_DHCP_TROUBLESHOOT: Concept = {
  id: "dhcp-troubleshoot",
  title: "DHCP Troubleshooting — show & debug",
  appliesTo: ["ccna"],
  tags: ["dhcp", "troubleshooting", "show", "debug", "binding", "conflict"],
  content: `
## 🎯 CCNA-Prüfungsrelevanz: ⭐⭐ | Exam Topic: 5.7 | ⏱️ 12 Min

---

## 📚 Lernziele

- Die zentralen **show-Befehle** für DHCP-Server und -Leases anwenden
- Einen **Adresskonflikt** erkennen und auflösen
- Mit **debug** den DORA-Ablauf live mitlesen
- Bindings und Konflikte gezielt zurücksetzen

---

## Die wichtigsten show-Befehle

\`\`\`
R1# show ip dhcp binding
IP address       Client-ID/MAC        Lease expiration        Type
192.168.1.11     0100.1122.3344.55    Jun 14 2026 10:42 AM    Automatic

R1# show ip dhcp pool
Pool OFFICE :
 Utilization mark (high/low) : 100 / 0
 Total addresses             : 254
 Leased addresses            : 254      ← Pool erschöpft!

R1# show ip dhcp conflict
IP address       Detection method   Detection time
192.168.1.50     Ping               Jun 13 2026 09:10 AM

R1# show ip dhcp server statistics    ! Zähler je Nachrichtentyp
\`\`\`

## Adresskonflikte

Cisco erkennt Konflikte auf zwei Wegen: der **Server pingt** eine Adresse vor der Vergabe (Antwort = belegt), der **Client prüft per Gratuitous ARP**. Konflikt-Adressen werden aus dem Pool genommen und in \`show ip dhcp conflict\` gelistet — bis man sie freigibt.

\`\`\`
R1# clear ip dhcp conflict *      ! alle Konflikte zurücksetzen
R1# clear ip dhcp binding *       ! alle dynamischen Bindings lösen
\`\`\`

## Live mitlesen mit debug

\`\`\`
R1# debug ip dhcp server events     ! Lease-Vergabe, Ablauf, Pool-Auswahl
R1# debug ip dhcp server packet     ! einzelne DORA-Pakete
R1# undebug all                     ! Debug wieder aus (wichtig!)
\`\`\`

Typischer Fund im Debug: \`DHCPD: there is no address pool for 192.168.10.1\` → der Server hat keinen Pool für das per giaddr angefragte Subnetz (Relay-Problem, siehe dhcp-relay).

---

## ⚠️ Häufige Fehler & Prüfungsfallen

- ⚠️ **excluded-address vergessen → Konflikt:** Ist die Router/Gateway-IP nicht per \`ip dhcp excluded-address\` ausgenommen, vergibt der Server sie an einen Client → Adresskonflikt mit dem Gateway.
- ⚠️ **debug in Produktion vergessen abzuschalten:** \`debug ip dhcp server packet\` kann die CPU fluten. Immer mit \`undebug all\` beenden.
  `.trim(),
};

export const CONCEPT_DHCP_SNOOPING: Concept = {
  id: "dhcp-snooping",
  title: "DHCP Snooping — trusted/untrusted & Binding-Tabelle",
  appliesTo: ["ccna"],
  tags: ["dhcp", "snooping", "security", "trusted", "untrusted", "binding-table", "layer-2"],
  content: `
## 🎯 CCNA-Prüfungsrelevanz: ⭐⭐⭐ | Exam Topic: 5.7 | ⏱️ 15 Min

---

## 📚 Lernziele

- Den Angriff **Rogue-DHCP / DHCP-Spoofing** und seine Wirkung (MITM) erklären
- **Trusted** und **untrusted** Ports korrekt zuordnen
- DHCP-Snooping konfigurieren und die **Binding-Tabelle** lesen
- Den Zusammenhang zu **DAI** und **IP Source Guard** benennen

---

## Der Angriff: Rogue-DHCP-Server

Stellt ein Angreifer einen eigenen DHCP-Server ins LAN, kann er Clients ein **falsches Gateway** (seine eigene IP) zuweisen — der gesamte Traffic läuft dann über ihn (**Man-in-the-Middle**). Dazu oft kombiniert mit **DHCP-Starvation** (alle echten Adressen abgreifen, damit nur noch der Rogue-Server antwortet).

## Die Abwehr: Snooping mit trusted/untrusted

DHCP-Snooping macht alle Ports per Default **untrusted**. Auf untrusted Ports lässt der Switch **nur Client-Nachrichten** (DISCOVER/REQUEST) durch und **verwirft Server-Nachrichten** (OFFER/ACK/NAK). Nur explizit als **trusted** markierte Ports — der Uplink zum echten Server bzw. Relay — dürfen Server-Antworten senden.

\`\`\`
SW(config)# ip dhcp snooping                       ! global aktivieren
SW(config)# ip dhcp snooping vlan 10,20             ! pro VLAN

SW(config)# interface gi0/1                          ! Uplink zum echten Server
SW(config-if)# ip dhcp snooping trust

SW(config)# interface range fa0/1-24                 ! Access-Ports = untrusted
SW(config-if-range)# ip dhcp snooping limit rate 10  ! gegen Starvation
\`\`\`

## Die Binding-Tabelle

Auf untrusted Ports baut der Switch aus erfolgreichen Leases eine **Binding-Tabelle** auf — **MAC ↔ IP ↔ VLAN ↔ Port ↔ Lease**:

\`\`\`
SW# show ip dhcp snooping binding
MacAddress          IpAddress       Lease(sec)  Type           VLAN  Interface
00:11:22:33:44:55   192.168.10.31   84600       dhcp-snooping  10    FastEthernet0/3
\`\`\`

Diese Tabelle ist die **Grundlage für Dynamic ARP Inspection (DAI)** und **IP Source Guard** — beide prüfen Pakete gegen diese Bindings. Snooping ist damit das Fundament der Layer-2-Sicherheit.

---

## ⚠️ Häufige Fehler & Prüfungsfallen

- ⚠️ **Uplink nicht trust gesetzt:** Bleibt der Port zum echten Server untrusted, verwirft der Switch dessen OFFER/ACK → alle Clients bekommen **APIPA**. Klassische Falle: Snooping aktiviert, aber \`ip dhcp snooping trust\` am Uplink vergessen.
- ⚠️ **Trust auf Access-Port:** Ein als trusted markierter Endgeräte-Port hebelt den Schutz aus — dort könnte ein Rogue-Server unbehelligt antworten. Trust **nur** Richtung echtem Server/Relay/Trunk.
  `.trim(),
};

export const CONCEPT_NAT: Concept = {
  id: "nat",
  title: "NAT & PAT — Network/Port Address Translation",
  appliesTo: ["ccna", "comptia-network-plus"],
  tags: ["networking", "nat", "pat", "layer-3", "ipv4", "internet-access"],
  content: `
## NAT / PAT (RFC 3022)

:::kernidee
NAT existiert, weil **IPv4-Adressen knapp** sind: Ein ganzes Heimnetz teilt sich **eine** öffentliche IP. Der NAT-Router merkt sich in einer **Übersetzungstabelle**, welche interne Adresse welche Verbindung aufgebaut hat, und tauscht die Quell-IP beim Rausgehen aus. **PAT** macht das massentauglich, indem es zusätzlich die **Port-Nummer** als Unterscheidungsmerkmal nutzt — so passen tausende interne Hosts hinter eine einzige öffentliche IP.
:::

:::analogie
Wie die **Telefonzentrale** einer Firma mit *einer* Außennummer: Alle Mitarbeiter (interne IPs) telefonieren nach draußen über dieselbe Hauptnummer. Die Zentrale merkt sich per **Durchwahl** (Port), welcher Rückruf zu welchem Mitarbeiter gehört.
:::

NAT übersetzt private IP-Adressen in öffentliche (und zurück).

### NAT-Typen
| Typ | Beschreibung | Anwendung |
|-----|-------------|-----------|
| Static NAT | 1:1 Übersetzung (privat ↔ öffentlich) | Server hinter NAT |
| Dynamic NAT | Pool öffentlicher IPs | Mehrere User, Pool |
| PAT (NAT Overload) | Viele private IPs → eine öffentliche (per Port) | Home/Office Router |

### NAT-Terminologie
| Term | Beschreibung |
|------|-------------|
| Inside Local | Private IP des Hosts (z.B. 192.168.1.10) |
| Inside Global | Öffentliche IP nach Übersetzung (z.B. 203.0.113.5) |
| Outside Local | IP des externen Ziels, wie intern gesehen |
| Outside Global | Echte IP des externen Ziels |

:::merke
**Inside/Outside = wo das Gerät steht; Local/Global = welche Sicht.** „Inside" ist dein Netz, „Outside" das Internet. „Local" ist die private Sicht, „Global" die öffentliche. **Inside Local** = deine private IP, **Inside Global** = wie das Internet dich sieht. Das wird in der Prüfung gern vertauscht.
:::

### PAT Konfiguration (Cisco)
\`\`\`
! ACL: Welche Adressen übersetzt werden
R1(config)# access-list 1 permit 192.168.1.0 0.0.0.255

! NAT: ACL + Ausgangsinterface, overload = PAT
R1(config)# ip nat inside source list 1 interface GigabitEthernet0/1 overload

! Interfaces markieren
R1(config-if)# ip nat inside   ! LAN-Seite
R1(config-if)# ip nat outside  ! WAN-Seite (Internet)

R1# show ip nat translations
R1# show ip nat statistics
\`\`\`

### Probleme mit NAT
- End-to-End Connectivity ist unterbrochen
- Stateful → Ausfall des Routers verliert Verbindungen
- Erschwert IPsec, VoIP (Protokolle mit IP im Payload)
- IPv6 macht NAT überflüssig
  `.trim(),
};

export const CONCEPT_DHCP_NAT_GUIDE: Concept = {
  id: "dhcp-nat-guide",
  title: "Lernguide: DHCP & NAT",
  appliesTo: ["ccna"],
  tags: ["dhcp", "nat", "pat", "ip-management", "guide"],
  content: `
## Lernziele
- Einen DHCP-Pool auf einem Cisco-Router konfigurieren (inkl. exclusions, DNS, Gateway)
- Den DORA-Prozess (Discover, Offer, Request, ACK) in der richtigen Reihenfolge beschreiben
- PAT (NAT Overload) für ein internes Subnetz konfigurieren
- \`ip nat inside\` und \`ip nat outside\` an den richtigen Interfaces setzen
- DHCP Relay (ip helper-address) erklären und konfigurieren

## Praxis-Szenario
Die "Bäckerei Hofmann KG" eröffnet eine Filiale in Nürnberg (50 Mitarbeiter, darunter Kassenterminals und Büro-PCs). Der Cisco ISR 1100 übernimmt gleichzeitig DHCP-Server und NAT-Router. Das interne Netz ist 10.10.30.0/24, der Router hat die LAN-IP 10.10.30.1/24. Die erste Adresse ist für den Router reserviert, 10.10.30.2–10.10.30.10 für Server und Drucker. Der ISP hat dem Router die öffentliche IP 85.214.99.5 auf dem WAN-Interface (Gi0/0/1) zugewiesen. Mit PAT (NAT Overload) sollen alle 50 internen Hosts über diese eine IP ins Internet gelangen.

## Canvas-Übung
**Aufgabe:** Baue eine Topologie mit dem Cisco ISR 1100 (LAN: Gi0/0/0, WAN: Gi0/0/1), einem LAN-Switch, drei PCs (als DHCP-Clients) und einem simulierten ISP-Router. Beschrifte den Router mit DHCP-Pool-Konfiguration und NAT-Overload-Konfiguration als Notizen. Markiere LAN-Interface als "ip nat inside" und WAN-Interface als "ip nat outside".
**Ziel:** Den vollständigen Weg eines Pakets von einem internen DHCP-Client über NAT ins Internet visualisieren.
**Tipps:** Erstelle zuerst die ACL (access-list 1 permit 10.10.30.0 0.0.0.255), dann den NAT-Befehl. Die Reihenfolge der Konfigurationsschritte ist im CCNA-Exam Thema.

## Verständnisfragen
1. In welcher Reihenfolge laufen die vier DORA-Schritte ab — und welche sind Broadcasts, welche Unicasts?
2. Warum muss \`ip nat inside\` auf dem LAN-Interface und \`ip nat outside\` auf dem WAN-Interface konfiguriert werden — was passiert, wenn man es vertauscht?
3. Was ist der Unterschied zwischen Static NAT, Dynamic NAT und PAT (NAT Overload) in Bezug auf die Anzahl benötigter öffentlicher IP-Adressen?
*(Antworten im Quiz verfügbar)*

## Häufige Fehler & Fallstricke
- ⚠️ **\`ip nat inside\`/\`ip nat outside\` fehlt oder vertauscht:** Ohne diese Interface-Befehle funktioniert NAT überhaupt nicht. Cisco IOS übersetzt nur Traffic, der ein "inside"-Interface betritt und ein "outside"-Interface verlässt (oder umgekehrt).
- ⚠️ **DORA-Reihenfolge in Prüfungsfragen:** Häufig wird gefragt, welcher DORA-Schritt ein Broadcast ist. DISCOVER und REQUEST sind Broadcasts (Client kennt den Server noch nicht / meldet Auswahl an alle), OFFER und ACK können Broadcasts oder Unicasts sein.
- ⚠️ **Excluded-Address-Befehl vergessen:** Wenn der Router 10.10.30.1 hat und kein \`ip dhcp excluded-address\` konfiguriert ist, kann DHCP dieselbe Adresse an einen Client vergeben — Adresskonflikt!
  `.trim(),
};

export const TOPIC_DHCP_NAT: Topic = {
  id: "dhcp-nat",
  title: "DHCP, DNS & NAT",
  description:
    "Netzwerkdienste: DHCP für automatische IP-Vergabe (Relay, Snooping), DNS für Namensauflösung (Records, Rekursion, TTL) und NAT/PAT für Internetzugang aus privaten Netzen.",
  conceptIds: [
    "dhcp",
    "dhcp-dora",
    "dhcp-lease",
    "dhcp-options",
    "dhcp-relay",
    "dhcp-apipa",
    "dhcp-troubleshoot",
    "dhcp-snooping",
    "dns",
    "nat",
    "dhcp-nat-guide",
  ],
  quizIds: ["ccna-quiz-dhcp", "ccna-quiz-nat"],
  exerciseIds: [],
  prerequisiteTopicIds: ["ipv4-addressing"],
  estimatedMinutes: 165,
  tags: ["dhcp", "dns", "nat", "pat", "ip-management"],
};

export const CONCEPT_DNS: Concept = {
  id: "dns",
  title: "DNS — Namensauflösung (Records, Rekursion, TTL)",
  appliesTo: ["ccna", "comptia-network-plus"],
  tags: ["dns", "name-resolution", "udp-53", "resource-records", "network-services"],
  content: `
## Wozu DNS?

:::kernidee
DNS ist das **Telefonbuch des Internets**: Menschen merken sich Namen, Pakete brauchen IPs. Statt einer einzigen riesigen Liste ist DNS **hierarchisch verteilt** (Root → TLD → autoritativer Server) — niemand kennt alles, jeder kennt nur den nächsten Schritt nach unten. Caching mit **TTL** sorgt dafür, dass nicht jede Abfrage bis zur Wurzel läuft.
:::

**DNS** (Domain Name System) übersetzt **Namen ↔ IP-Adressen**, damit niemand sich IPs merken muss
und Namen stabil bleiben, auch wenn die IP wechselt.
- **Forward Lookup:** Name → IP (\`web.corp.local\` → \`10.0.2.50\`)
- **Reverse Lookup:** IP → Name — über die Spezialzone \`in-addr.arpa\` (IPv6: \`ip6.arpa\`)
- **Port:** **UDP 53** für normale Abfragen, **TCP 53** nur für Zonentransfer & große Antworten (> 512 Byte).

## Hierarchie & Auflösung
\`\`\`
Client → lokaler Resolver → Root (.) → TLD (.com) → Authoritative (example.com)
\`\`\`
- **Rekursiv:** der Resolver erledigt die **ganze** Arbeit und liefert dem Client die fertige Antwort.
- **Iterativ:** jeder Server verweist nur auf den **nächsten** zuständigen Server.
- **Forwarder:** unbekannte Anfragen werden an einen festen DNS weitergeleitet (z. B. \`8.8.8.8\`, \`1.1.1.1\`) —
  der interne Server muss dann nicht selbst rekursiv ins Internet auflösen.
- **Root Hints:** Liste der 13 Root-Server (a–m.root-servers.net) als Startpunkt ohne Forwarder.
- **Conditional Forwarder:** nur Anfragen für **eine bestimmte Domäne** gezielt an einen Server (Split-DNS).

## Resource Records (Prüfungsstoff)
| Record | Funktion | Beispiel |
|--------|----------|----------|
| **A** | Name → IPv4 | \`web.corp.local\` → 10.0.2.50 |
| **AAAA** | Name → IPv6 | \`web.corp.local\` → 2001:db8::1 |
| **CNAME** | Alias → anderer **Name** | \`files\` → \`fs01.corp.local\` |
| **MX** | Mailserver (mit Priorität, → **Hostname**) | corp.local MX 10 mail.corp.local |
| **NS** | autoritative Server der Zone | corp.local NS dc1.corp.local |
| **PTR** | IP → Name (Reverse) | 50.2.0.10.in-addr.arpa → web.corp.local |
| **SRV** | Dienst/Port/Protokoll | \`_ldap._tcp.…\` |
| **TXT** | Freitext (SPF, DKIM, Verifizierung) | "v=spf1 …" |

> ⚠️ **Prüfungsfallen:** CNAME **nicht** an der Zone-Apex (dort nur A/AAAA) · CNAME zeigt nie direkt auf eine IP ·
> MX zeigt auf einen **Hostnamen**, nie auf eine IP · PTR braucht eine **eigene Reverse-Lookup-Zone**.
> **Merke:** A = **A**dresse (IP drin), CNAME = **C**odename (Zeiger auf anderen Namen).

## TTL & Caching
- **TTL** (Sekunden) im Record bestimmt, wie lange ein Resolver/Client die Antwort cachen darf.
  Typisch: 3600 (1 h), 86400 (1 Tag), 300 (5 min für oft wechselnde Einträge).
- **Cache-Hit** (TTL gültig) → sofortige Antwort; **Cache-Miss** → neue Auflösung, Antwort wird gecacht.
- **Negative Caching:** auch NXDOMAIN ("nicht gefunden") wird kurz gecacht (Negative TTL im SOA).
- **Trade-off:** hoher TTL = wenig Traffic, **langsame** Propagation; niedriger TTL = mehr Traffic, **schnelle**
  Propagation. → Vor geplanter IP-Änderung den TTL **vorab senken**.

## Diagnose
\`\`\`
nslookup web.corp.local              ! Forward-Auflösung über den konfigurierten DNS
nslookup web.corp.local 8.8.8.8      ! anderen DNS gezielt abfragen
nslookup -type=MX corp.local         ! Record-Typ festlegen (MX/SRV/PTR/AAAA …)
ipconfig /displaydns                 ! lokalen DNS-Cache anzeigen (Windows)
ipconfig /flushdns                   ! DNS-Cache leeren
dig web.corp.local A   (+short)      ! Linux/macOS-Pendant zu nslookup
\`\`\`
> 🩺 **Klassisches Symptom:** Ziel per **IP erreichbar**, per **Name nicht** → DNS-Problem
> (falscher/ausgefallener DNS-Server am Client, fehlender Record, alter Cache).

## DNS im Zusammenspiel
- **DHCP** liefert dem Client neben IP/Maske/Gateway auch die **DNS-Server-Adresse** (Option 6).
- Ohne erreichbaren DNS funktioniert Surfen per Name nicht — Ping auf 8.8.8.8 geht, \`ping cisco.com\` scheitert.

> 🎯 **CCNA-Kern (Domain 1):** DNS = UDP 53, Forward/Reverse, rekursiv vs. iterativ, Record-Typen
> A/AAAA/CNAME/MX/NS/PTR/TXT, TTL/Caching. (AD-spezifische Aging/Scavenging-Details sind MS-/MD-Stoff.)

[[dhcp]] · [[ntp]] · [[ipv4-addressing]]
  `.trim(),
};

export const DHCP_NAT_CONCEPTS: Record<string, Concept> = {
  dhcp: CONCEPT_DHCP,
  dns: CONCEPT_DNS,
  "dhcp-dora": CONCEPT_DHCP_DORA,
  "dhcp-lease": CONCEPT_DHCP_LEASE,
  "dhcp-options": CONCEPT_DHCP_OPTIONS,
  "dhcp-apipa": CONCEPT_DHCP_APIPA,
  "dhcp-relay": CONCEPT_DHCP_RELAY,
  "dhcp-troubleshoot": CONCEPT_DHCP_TROUBLESHOOT,
  "dhcp-snooping": CONCEPT_DHCP_SNOOPING,
  nat: CONCEPT_NAT,
  "dhcp-nat-guide": CONCEPT_DHCP_NAT_GUIDE,
};
