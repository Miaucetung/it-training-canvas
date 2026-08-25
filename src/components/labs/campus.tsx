import {
  Globe,
  Network,
} from "@phosphor-icons/react";
import type { LabScenario } from "./types";

export const CAMPUS_LABS: LabScenario[] = [

  // ─────────────────────────────────────────────────────────────
  // Campus-Integration: VLAN + VTP + DTP + RoaS + DHCP + PAT
  // SW1 (VTP-Server) → SW2 (VTP-Client) → Router0 (DHCP+NAT)
  // VLAN10=Blau(192.168.10.0/24), VLAN20=Grün(192.168.20.0/24), VLAN30=Gelb(192.168.30.0/24)
  // ─────────────────────────────────────────────────────────────
  {
    id: "vlan-dhcp-nat-roas",
    icon: <Globe size={20} />,
    title: "VLAN + DHCP + NAT — Campus mit Internetzugang",
    subtitle: "SW1/SW2 · VTP · DTP · RoaS · 3×DHCP-Pool · PAT · ISP · INTERNET",
    difficulty: "Fortgeschritten",
    duration: "40 min",
    context: {
      problem:
        "Ein Campus hat drei Abteilungen (Blau, Grün, Gelb) in separaten VLANs. Alle Hosts bekommen ihre IPs per DHCP und sollen trotzdem gemeinsam über eine einzige öffentliche IP ins Internet.",
      purpose:
        "Dieses Lab verbindet alle Kernthemen: VLAN-Segmentierung via VTP, automatischer Trunking via DTP, Inter-VLAN-Routing via Router-on-a-Stick, DHCP-Versorgung je VLAN und PAT für den Internetzugang. Jede Komponente hängt von der vorherigen ab.",
    },
    topology: {
      description:
        "SW1 (VTP Server, VLAN-Quelle) ist per Trunk mit SW2 (VTP Client) verbunden. SW2 verbindet sich per Trunk mit Router0 (RoaS). Router0 verwaltet drei Sub-Interfaces für die VLANs, dient als DHCP-Server für alle drei Netze und übersetzt per PAT auf seine öffentliche IP (200.0.0.1/30). Dahinter: ISP → INTERNET → Webserver (47.11.8.15).",
      devices: [
        { type: "switch", label: "SW1 — VTP Server, VLAN 10/20/30 anlegen",    count: 1 },
        { type: "switch", label: "SW2 — VTP Client, Trunk zu SW1 + Router0",   count: 1 },
        { type: "router", label: "Router0 — RoaS + DHCP-Server + NAT/PAT",     count: 1 },
        { type: "pc",     label: "PC3 (Blau, VLAN 10) — SW1 Fa0/1",            count: 1 },
        { type: "pc",     label: "PC4 (Grün, VLAN 20) — SW1 Fa0/11",           count: 1 },
        { type: "pc",     label: "C5 (Gelb, VLAN 30) — SW1 Fa0/15",            count: 1 },
        { type: "pc",     label: "PC0 (Blau, VLAN 10) — SW2 Fa0/1",            count: 1 },
        { type: "pc",     label: "PC2 (Grün, VLAN 20) — SW2 Fa0/11",           count: 1 },
        { type: "pc",     label: "PC1 (Gelb, VLAN 30) — SW2 Fa0/15",           count: 1 },
        { type: "router", label: "ISP (Gig0/2=200.0.0.2, Gig0/1=1.1.1.1)",    count: 1 },
        { type: "router", label: "INTERNET (Gig0/2=1.1.1.2, Gi0/0=47.11.8.1)", count: 1 },
        { type: "server", label: "Webserver (47.11.8.15/24)",                  count: 1 },
      ],
      connections: [
        "SW1 Gig0/1 ↔ SW2 Gig0/2  — Trunk (DTP: SW1 mode on, SW2 mode desirable)",
        "SW2 Gig0/1 ↔ Router0 Gig0/0  — Trunk (Router-on-a-Stick)",
        "Router0 Gig0/1 (200.0.0.1) ↔ ISP Gig0/2 (200.0.0.2)  — 200.0.0.0/30",
        "ISP Gig0/1 (1.1.1.1) ↔ INTERNET Gig0/2 (1.1.1.2)  — 1.1.1.0/30",
        "INTERNET Gi0/0 (47.11.8.1) ↔ Webserver Fa0 (47.11.8.15)  — 47.11.8.0/24",
      ],
      hint: "Reihenfolge ist entscheidend: 1) VLANs auf VTP-Server anlegen → propagieren zu Client. 2) Trunks aktiv. 3) Sub-Interfaces + DHCP auf Router. 4) NAT-ACL muss alle drei Subnetze erfassen. 5) Routing.",
    },
    steps: [
      {
        title: "1) VLANs anlegen — SW1 als VTP Server",
        blocks: [
          {
            device: "SW1",
            mode: "privileged",
            modeLabel: "Switch>",
            commands: [
              { cmd: "enable\nconfigure terminal\nhostname SW1\nno ip domain-lookup", explanation: "Üblicher Einstieg." },
            ],
          },
          {
            device: "SW1",
            mode: "config",
            modeLabel: "SW1(config)#",
            commands: [
              { cmd: "vtp mode server", explanation: "SW1 ist die VLAN-Quelle im VTP-Verbund. Nur auf dem Server können VLANs angelegt werden." },
              { cmd: "vtp domain VTPDOM", explanation: "VTP-Domäne: VTPDOM. Alle Switches im Verbund müssen dieselbe Domäne haben — sonst ignorieren sie VTP-Nachrichten." },
              { cmd: "vtp password geheim!", explanation: "VTP-Passwort als MD5-Hash. SW2 muss dasselbe Passwort haben, sonst werden keine VTP-Updates akzeptiert." },
              { cmd: "vlan 10", explanation: "VLAN 10 anlegen." },
              { cmd: " name Blau", explanation: "VLAN 10 heißt 'Blau' — PCs in blauen Ovalen in der Topologie." },
              { cmd: "vlan 20", explanation: "VLAN 20 anlegen." },
              { cmd: " name Gruen", explanation: "VLAN 20 = 'Gruen' — grüne PCs." },
              { cmd: "vlan 30", explanation: "VLAN 30 anlegen." },
              { cmd: " name Gelb", explanation: "VLAN 30 = 'Gelb' — gelbe PCs. Alle drei VLANs werden über VTP an SW2 propagiert, sobald der Trunk aktiv ist." },
            ],
          },
        ],
      },
      {
        title: "2) VTP auf SW2 konfigurieren",
        blocks: [
          {
            device: "SW2",
            mode: "privileged",
            modeLabel: "Switch>",
            commands: [
              { cmd: "enable\nconfigure terminal\nhostname SW2\nno ip domain-lookup", explanation: "Gleicher Einstieg wie SW1." },
            ],
          },
          {
            device: "SW2",
            mode: "config",
            modeLabel: "SW2(config)#",
            commands: [
              { cmd: "vtp mode client", explanation: "SW2 ist VTP Client — darf keine VLANs anlegen, empfängt sie vom Server." },
              { cmd: "vtp domain VTPDOM", explanation: "Muss identisch mit SW1 sein." },
              { cmd: "vtp password geheim!", explanation: "Muss identisch mit SW1 sein. Danach warten bis der Trunk aktiv ist — VLANs erscheinen automatisch." },
            ],
          },
        ],
      },
      {
        title: "3) Trunk SW1 ↔ SW2 konfigurieren (DTP)",
        blocks: [
          {
            device: "SW1",
            mode: "config-if",
            modeLabel: "SW1(config-if)#",
            commands: [
              { cmd: "interface GigabitEthernet0/1", explanation: "Trunk-Port zu SW2." },
              { cmd: "switchport mode trunk", explanation: "DTP Mode 'on' — sendet aktiv DTP-Frames und erzwingt Trunk. Wartet nicht auf Gegenseite." },
            ],
          },
          {
            device: "SW2",
            mode: "config-if",
            modeLabel: "SW2(config-if)#",
            commands: [
              { cmd: "interface GigabitEthernet0/2", explanation: "Trunk-Port zu SW1." },
              { cmd: "switchport mode dynamic desirable", explanation: "DTP Mode 'desirable' — SW2 sendet DTP-Frames und möchte einen Trunk. Da SW1 auf 'on' steht, wird der Trunk erfolgreich ausgehandelt." },
            ],
          },
        ],
      },
      {
        title: "4) Access-Ports konfigurieren (SW1 + SW2)",
        blocks: [
          {
            device: "SW1",
            mode: "config-if",
            modeLabel: "SW1(config-if)#",
            commands: [
              { cmd: "interface FastEthernet0/1", explanation: "Port zu PC3 (Blau)." },
              { cmd: "switchport mode access", explanation: "Access-Port — kein Trunk-Tag." },
              { cmd: "switchport access vlan 10", explanation: "PC3 kommt in VLAN 10 (Blau)." },
              { cmd: "interface FastEthernet0/11", explanation: "Port zu PC4 (Grün)." },
              { cmd: "switchport mode access", explanation: "Access-Port." },
              { cmd: "switchport access vlan 20", explanation: "PC4 → VLAN 20 (Grün)." },
              { cmd: "interface FastEthernet0/15", explanation: "Port zu C5 (Gelb)." },
              { cmd: "switchport mode access", explanation: "Access-Port." },
              { cmd: "switchport access vlan 30", explanation: "C5 → VLAN 30 (Gelb)." },
              { cmd: "end\ncopy running-config startup-config", explanation: "Speichern." },
            ],
          },
          {
            device: "SW2",
            mode: "config-if",
            modeLabel: "SW2(config-if)#",
            commands: [
              { cmd: "interface FastEthernet0/1", explanation: "Port zu PC0 (Blau)." },
              { cmd: "switchport mode access", explanation: "Access-Port." },
              { cmd: "switchport access vlan 10", explanation: "PC0 → VLAN 10." },
              { cmd: "interface FastEthernet0/11", explanation: "Port zu PC2 (Grün)." },
              { cmd: "switchport mode access", explanation: "Access-Port." },
              { cmd: "switchport access vlan 20", explanation: "PC2 → VLAN 20." },
              { cmd: "interface FastEthernet0/15", explanation: "Port zu PC1 (Gelb)." },
              { cmd: "switchport mode access", explanation: "Access-Port." },
              { cmd: "switchport access vlan 30", explanation: "PC1 → VLAN 30." },
            ],
          },
        ],
      },
      {
        title: "5) Trunk SW2 ↔ Router0 konfigurieren",
        blocks: [
          {
            device: "SW2",
            mode: "config-if",
            modeLabel: "SW2(config-if)#",
            commands: [
              { cmd: "interface GigabitEthernet0/1", explanation: "Uplink zum Router0." },
              { cmd: "switchport mode trunk", explanation: "Trunk zum Router erzwingen. Kein DTP-Aushandeln nötig — Router unterstützt kein DTP." },
              { cmd: "end\ncopy running-config startup-config", explanation: "Speichern." },
            ],
          },
        ],
      },
      {
        title: "6) Router0: Sub-Interfaces (RoaS) + ip nat inside",
        blocks: [
          {
            device: "Router0",
            mode: "privileged",
            modeLabel: "Router>",
            commands: [
              { cmd: "enable\nconfigure terminal\nhostname Router0\nno ip domain-lookup", explanation: "Üblicher Einstieg." },
            ],
          },
          {
            device: "Router0",
            mode: "config-if",
            modeLabel: "Router0(config-if)#",
            commands: [
              { cmd: "interface GigabitEthernet0/0", explanation: "Physical Interface — kein IP, nur aktivieren. Sub-Interfaces übernehmen die Adressierung." },
              { cmd: "no ip address", explanation: "Keine IP auf dem Physical Interface." },
              { cmd: "no shutdown", explanation: "Physical Interface muss aktiv sein damit Sub-Interfaces funktionieren." },
              { cmd: "interface GigabitEthernet0/0.10", explanation: "Sub-Interface für VLAN 10." },
              { cmd: "encapsulation dot1q 10", explanation: "802.1Q-Tag für VLAN 10." },
              { cmd: "ip address 192.168.10.1 255.255.255.0", explanation: "Gateway für VLAN 10 (Blau). Alle DHCP-Clients in VLAN 10 erhalten diese IP als Default-Gateway." },
              { cmd: "ip nat inside", explanation: "Sub-Interface .10 als NAT-inside markieren. Wichtig: Jedes LAN-Sub-Interface bekommt 'ip nat inside'." },
              { cmd: "interface GigabitEthernet0/0.20", explanation: "Sub-Interface für VLAN 20." },
              { cmd: "encapsulation dot1q 20", explanation: "802.1Q-Tag für VLAN 20." },
              { cmd: "ip address 192.168.20.1 255.255.255.0", explanation: "Gateway für VLAN 20 (Grün)." },
              { cmd: "ip nat inside", explanation: "VLAN-20-Traffic wird ebenfalls NAT-übersetzt." },
              { cmd: "interface GigabitEthernet0/0.30", explanation: "Sub-Interface für VLAN 30." },
              { cmd: "encapsulation dot1q 30", explanation: "802.1Q-Tag für VLAN 30." },
              { cmd: "ip address 192.168.30.1 255.255.255.0", explanation: "Gateway für VLAN 30 (Gelb)." },
              { cmd: "ip nat inside", explanation: "VLAN-30-Traffic NAT-fähig." },
              { cmd: "interface GigabitEthernet0/1", explanation: "WAN-Interface Richtung ISP." },
              { cmd: "ip address 200.0.0.1 255.255.255.252", explanation: "Öffentliche IP auf dem /30-Subnetz. .1 = Router0, .2 = ISP." },
              { cmd: "ip nat outside", explanation: "WAN-Interface = outside. Übersetzte Pakete aller drei VLANs verlassen hier das Netz mit Source 200.0.0.1." },
              { cmd: "no shutdown", explanation: "WAN-Interface aktivieren." },
            ],
          },
        ],
      },
      {
        title: "7) DHCP-Server einrichten — 3 Pools (je ein VLAN)",
        blocks: [
          {
            device: "Router0",
            mode: "config",
            modeLabel: "Router0(config)#",
            commands: [
              { cmd: "ip dhcp excluded-address 192.168.10.1", explanation: "Gateway-IP aus dem DHCP-Pool ausschließen — Router0 vergibt sie nicht an Clients." },
              { cmd: "ip dhcp excluded-address 192.168.20.1", explanation: "Gateway VLAN 20 ausschließen." },
              { cmd: "ip dhcp excluded-address 192.168.30.1", explanation: "Gateway VLAN 30 ausschließen." },
              { cmd: "ip dhcp pool VLAN10", explanation: "DHCP-Pool für VLAN 10 (Blau)." },
              { cmd: " network 192.168.10.0 255.255.255.0", explanation: "Der Pool bedient das gesamte 192.168.10.0/24." },
              { cmd: " default-router 192.168.10.1", explanation: "Gateway, das den Clients mitgeteilt wird (= das Sub-Interface .10)." },
              { cmd: " dns-server 8.8.8.8", explanation: "DNS-Server. In Packet Tracer kann auch eine beliebige erreichbare IP verwendet werden." },
              { cmd: "ip dhcp pool VLAN20", explanation: "DHCP-Pool für VLAN 20 (Grün)." },
              { cmd: " network 192.168.20.0 255.255.255.0", explanation: "Pool für 192.168.20.0/24." },
              { cmd: " default-router 192.168.20.1", explanation: "Gateway VLAN 20." },
              { cmd: " dns-server 8.8.8.8", explanation: "DNS-Server." },
              { cmd: "ip dhcp pool VLAN30", explanation: "DHCP-Pool für VLAN 30 (Gelb)." },
              { cmd: " network 192.168.30.0 255.255.255.0", explanation: "Pool für 192.168.30.0/24." },
              { cmd: " default-router 192.168.30.1", explanation: "Gateway VLAN 30." },
              { cmd: " dns-server 8.8.8.8", explanation: "DNS-Server." },
            ],
          },
        ],
      },
      {
        title: "8) NAT/PAT konfigurieren — alle VLANs über eine IP",
        blocks: [
          {
            device: "Router0",
            mode: "config",
            modeLabel: "Router0(config)#",
            commands: [
              { cmd: "access-list 1 permit 192.168.10.0 0.0.0.255", explanation: "ACL 1 erlaubt VLAN-10-Hosts als NAT-Quellen." },
              { cmd: "access-list 1 permit 192.168.20.0 0.0.0.255", explanation: "ACL 1 erlaubt VLAN-20-Hosts. Mehrere 'permit'-Zeilen in einer ACL sind möglich." },
              { cmd: "access-list 1 permit 192.168.30.0 0.0.0.255", explanation: "ACL 1 erlaubt VLAN-30-Hosts. Alle drei Subnetze werden auf 200.0.0.1 übersetzt." },
              { cmd: "ip nat inside source list 1 interface GigabitEthernet0/1 overload", explanation: "'list 1' → Quelle muss ACL 1 treffen. 'interface Gi0/1' → benutze 200.0.0.1 als öffentliche IP. 'overload' → PAT. Egal ob Host aus VLAN 10, 20 oder 30 — alle erscheinen im Internet als 200.0.0.1 mit unterschiedlichen Ports." },
            ],
          },
        ],
      },
      {
        title: "9) Routing — Default-Route + Rückrouten",
        blocks: [
          {
            device: "Router0",
            mode: "config",
            modeLabel: "Router0(config)#",
            commands: [
              { cmd: "ip route 0.0.0.0 0.0.0.0 200.0.0.2", explanation: "Default-Route zum ISP (.2)." },
              { cmd: "end\ncopy running-config startup-config", explanation: "Speichern." },
            ],
          },
          {
            device: "ISP",
            mode: "privileged",
            modeLabel: "Router>",
            commands: [
              { cmd: "enable\nconfigure terminal\nhostname ISP\nno ip domain-lookup", explanation: "Üblicher Einstieg." },
            ],
          },
          {
            device: "ISP",
            mode: "config",
            modeLabel: "ISP(config)#",
            commands: [
              { cmd: "interface GigabitEthernet0/2\n ip address 200.0.0.2 255.255.255.252\n no shutdown", explanation: "ISP-Interface Richtung Router0." },
              { cmd: "interface GigabitEthernet0/1\n ip address 1.1.1.1 255.255.255.252\n no shutdown", explanation: "ISP-Interface Richtung INTERNET." },
              { cmd: "ip route 0.0.0.0 0.0.0.0 1.1.1.2", explanation: "Default-Route zum INTERNET-Router." },
              { cmd: "end\ncopy running-config startup-config", explanation: "Speichern." },
            ],
          },
          {
            device: "INTERNET",
            mode: "privileged",
            modeLabel: "Router>",
            commands: [
              { cmd: "enable\nconfigure terminal\nhostname INTERNET\nno ip domain-lookup", explanation: "Üblicher Einstieg." },
            ],
          },
          {
            device: "INTERNET",
            mode: "config",
            modeLabel: "INTERNET(config)#",
            commands: [
              { cmd: "interface GigabitEthernet0/2\n ip address 1.1.1.2 255.255.255.252\n no shutdown", explanation: "Transit-Interface Richtung ISP." },
              { cmd: "interface GigabitEthernet0/0\n ip address 47.11.8.1 255.255.255.0\n no shutdown", explanation: "Interface zum Webserver-Segment." },
              { cmd: "ip route 200.0.0.0 255.255.255.252 1.1.1.1", explanation: "Rückroute für 200.0.0.0/30 → ISP. Ohne diese Route finden Antwortpakete den Weg zu 200.0.0.1 nicht." },
              { cmd: "end\ncopy running-config startup-config", explanation: "Speichern." },
            ],
          },
          {
            device: "Webserver",
            mode: "desktop",
            modeLabel: "Webserver – IP-Konfiguration",
            commands: [
              { cmd: "IP:      47.11.8.15\nMaske:   255.255.255.0\nGateway: 47.11.8.1", explanation: "Statische öffentliche IP. Gateway = INTERNET-Router." },
            ],
          },
        ],
      },
      {
        title: "10) Konnektivität testen",
        blocks: [
          {
            device: "PC0 / PC3",
            mode: "desktop",
            modeLabel: "Desktop > Command Prompt (DHCP abwarten)",
            commands: [
              { cmd: "ipconfig /renew", explanation: "DHCP-Adresse anfordern (falls nötig). PC0 und PC3 sollten eine 192.168.10.x bekommen, Gateway 192.168.10.1." },
              { cmd: "ping 192.168.20.x", explanation: "Inter-VLAN-Ping zu einem Grün-PC — bestätigt, dass RoaS funktioniert. Router0 leitet zwischen den Sub-Interfaces weiter." },
              { cmd: "ping 47.11.8.15", explanation: "Internet-Ping — bestätigt NAT + Routing. Quelle 192.168.10.x wird zu 200.0.0.1:Port in der NAT-Tabelle." },
            ],
          },
          {
            device: "Router0",
            mode: "privileged",
            modeLabel: "Router0#",
            commands: [
              { cmd: "show ip dhcp binding", explanation: "Zeigt alle DHCP-Leases: welche IP an welche MAC vergeben wurde. Müssen Einträge aus allen drei VLANs sehen." },
              { cmd: "show ip nat translations", explanation: "Aktive PAT-Einträge: alle Hosts aus VLANs 10/20/30 erscheinen mit 200.0.0.1 als Inside Global." },
              { cmd: "show vlan brief", explanation: "Auf SW1/SW2: VLANs 10/20/30 müssen mit den richtigen Ports und Status 'active' sichtbar sein." },
              { cmd: "show interfaces trunk", explanation: "Auf SW1/SW2: Trunk-Ports zeigt VLANs allowed und in STP forwarding — alle drei VLANs müssen im Trunk-Status sein." },
            ],
          },
        ],
      },
      {
        title: "Typische Fehler bei VLAN + DHCP + NAT (Campus)",
        blocks: [
          {
            device: "Merke",
            mode: "info",
            modeLabel: "Häufige Fehler",
            commands: [
              { cmd: "VTP-Domain/Passwort zwischen SW1 und SW2 unterschiedlich", explanation: "Stimmen sie nicht exakt überein, lehnt SW2 die VLAN-Updates ab — die VLANs 10/20/30 fehlen dann komplett auf SW2, obwohl der Trunk steht." },
              { cmd: "ip dhcp excluded-address für ein Gateway vergessen", explanation: "Ohne den Ausschluss kann der DHCP-Server versehentlich die Gateway-IP (z. B. 192.168.10.1) an einen Client vergeben — es entsteht ein IP-Konflikt mit dem Router-Sub-Interface." },
              { cmd: "ip nat inside auf einem Sub-Interface vergessen", explanation: "Jedes der drei LAN-Sub-Interfaces braucht seine EIGENE ip nat inside-Markierung — fehlt sie auf einem, werden nur die anderen beiden VLANs ins Internet übersetzt." },
              { cmd: "ACL deckt nicht alle drei Subnetze ab", explanation: "Fehlt eine der drei permit-Zeilen in ACL 1, kommen Hosts aus diesem VLAN zwar ins LAN-Routing, aber nicht ins Internet — show ip nat translations zeigt für sie keinen Eintrag." },
            ],
          },
        ],
      },
    ],
    verifyCommands: [
      { cmd: "show vlan brief (SW1)", expected: "VLAN 10 Blau, VLAN 20 Gruen, VLAN 30 Gelb — alle active mit korrekten Ports" },
      { cmd: "show vtp status (SW2)", expected: "Mode Client, Domain VTPDOM, VLANs 10/20/30 vorhanden" },
      { cmd: "show interfaces trunk (SW1/SW2)", expected: "Gi0/1 als Trunk, VLANs 10/20/30 allowed and active" },
      { cmd: "show ip dhcp binding (Router0)", expected: "Leases aus 192.168.10.x, .20.x, .30.x — alle drei VLANs bedient" },
      { cmd: "ping 47.11.8.15 (von PC0/PC3/PC1/PC2)", expected: "Alle Hosts aller VLANs erreichen den Webserver" },
      { cmd: "show ip nat translations (Router0)", expected: "Inside Global 200.0.0.1 für Hosts aus allen drei VLANs" },
    ],
    glossary: [
      { term: "VTP Server/Client",    def: "Server legt VLANs an und propagiert sie per VTP-Update über Trunks an Clients." },
      { term: "VTP Domain + Passwort", def: "Beide müssen auf allen Switches übereinstimmen — sonst werden VTP-Updates ignoriert." },
      { term: "DTP mode on",          def: "Erzwingt Trunk — sendet DTP-Frames, wartet nicht auf Antwort." },
      { term: "DTP mode desirable",   def: "Möchte Trunk — verhandelt aktiv, wird mit 'on' oder 'desirable' erfolgreich." },
      { term: "Router-on-a-Stick",    def: "Ein Router-Interface trägt per 802.1Q-Trunk mehrere VLANs über Sub-Interfaces — Inter-VLAN-Routing ohne L3-Switch." },
      { term: "ip dhcp pool",         def: "Definiert einen DHCP-Adressbereich. Pro VLAN ein eigener Pool." },
      { term: "ip dhcp excluded-address", def: "Schließt IPs (z. B. Gateways) aus dem DHCP-Pool aus." },
      { term: "ACL + NAT (mehrere Subnetze)", def: "Mehrere 'permit'-Zeilen in einer Standard-ACL reichen — alle werden mit 'overload' auf eine IP übersetzt." },
      { term: "ip nat inside (Sub-Interface)", def: "Jedes LAN-Sub-Interface muss einzeln mit 'ip nat inside' markiert werden." },
    ],
  },

  // ---------------------------------------------------------------
  // Campus-Capstone: VTP + Router-on-a-Stick + zentrales DHCP (3 Switches)
  // ---------------------------------------------------------------
  {
    id: "vlan-vtp-dhcp-campus",
    icon: <Network size={20} />,
    title: "Campus: VTP + RoaS + zentrales DHCP (3 Switches)",
    subtitle: "R1 als DHCP-Server · VTP CCNA · 3 VLANs + Mgmt · End-to-End",
    difficulty: "Fortgeschritten",
    duration: "45 min",
    context: {
      problem:
        "Drei Abteilungen (VLANs) verteilt über drei in Reihe geschaltete Switches sollen automatisch IP-Adressen bekommen und miteinander routen — mit nur EINEM Router und einem zentralen DHCP-Server, ohne auf jedem Switch VLANs und auf jedem Router-Port Adressen von Hand zu pflegen.",
      purpose:
        "Ein vollständiges Campus-Szenario von Grund auf, das den CIS-Grundlagenstoff zusammenführt: Grundkonfiguration, automatische VLAN-Verteilung per VTP über drei Switches, Inter-VLAN-Routing per Router-on-a-Stick (inkl. Native-VLAN-Subinterface), ein zentraler DHCP-Server mit vier Pools und ausgenommenen Bereichen sowie Switch-Management über SVIs — abgeschlossen mit End-to-End-Ping-Tests. Ideales Abschluss-Lab.",
    },
    topology: {
      description:
        "Router R1 (Router-on-a-Stick + DHCP-Server) hängt an SW1; die drei Switches sind in Reihe per Trunk verbunden (SW1—SW2—SW3). VLANs werden per VTP von SW1/SW2 (Server) an SW3 (Client) verteilt. An jedem Switch sitzen drei PCs in VLAN 100 (Rot), 110 (Blau) und 120 (Grün); das Management läuft über VLAN 1.",
      devices: [
        { type: "router", label: "R1 (RoaS + DHCP-Server)", count: 1 },
        { type: "switch", label: "SW1 / SW2 (VTP-Server)", count: 2 },
        { type: "switch", label: "SW3 (VTP-Client)", count: 1 },
        { type: "pc", label: "9 PCs (Rot/Blau/Grün je Switch)", count: 9 },
      ],
      connections: [
        "R1 Gi0/0 ↔ SW1 Gi0/1  (Trunk, Router-on-a-Stick)",
        "SW1 Gi0/2 ↔ SW2 Gi0/1  (Trunk)",
        "SW2 Gi0/2 ↔ SW3 Gi0/1  (Trunk)",
        "Je Switch: PC Rot → Fa0/1 (VLAN 100), PC Blau → Fa0/2 (VLAN 110), PC Grün → Fa0/3 (VLAN 120)",
      ],
      hint: "Access-Ports: Fa0/1 = VLAN 100 (Rot), Fa0/2 = VLAN 110 (Blau), Fa0/3 = VLAN 120 (Grün). Bei SW3 (VTP-Client) zuerst den Trunk setzen, auf die VLAN-Synchronisation warten, DANN die Access-Ports zuweisen.",
    },
    steps: [
      {
        title: "Schritt 1 — R1: Grundkonfig, Subinterfaces (RoaS), DHCP-Server",
        blocks: [
          {
            device: "R1",
            mode: "global",
            modeLabel: "R1(config)#",
            commands: [
              {
                cmd: "hostname R1\nenable secret cisco\nno ip domain-lookup\nline console 0\npassword cisco\nlogin\nexit\nline vty 0 4\npassword cisco\nlogin\nexit",
                explanation:
                  "Grundkonfiguration: Hostname, Privileged-Passwort (Hash), kein DNS-Lookup bei Tippfehlern, Console- und VTY-Zugang mit Passwort.",
              },
              {
                cmd: "interface gi0/0\nno ip address\nno shutdown",
                explanation:
                  "Das physische Parent-Interface bekommt KEINE IP, muss aber aktiviert werden — sonst sind alle Subinterfaces down.",
              },
              {
                cmd: "interface gi0/0.1\nencapsulation dot1Q 1 native\nip address 192.168.1.1 255.255.255.0\nexit",
                explanation:
                  "Subinterface für das Management-VLAN 1 als NATIVE VLAN (ungetaggt). 192.168.1.1 ist Gateway des Mgmt-Netzes.",
              },
              {
                cmd: "interface gi0/0.100\nencapsulation dot1Q 100\nip address 10.10.100.1 255.255.255.0\nexit\ninterface gi0/0.110\nencapsulation dot1Q 110\nip address 10.10.110.1 255.255.255.0\nexit\ninterface gi0/0.120\nencapsulation dot1Q 120\nip address 10.10.120.1 255.255.255.0\nexit",
                explanation:
                  "Je ein Subinterface als Gateway pro Daten-VLAN (100 Rot, 110 Blau, 120 Grün). encapsulation dot1Q <id> bindet das Tag, dann die IP.",
              },
              {
                cmd: "ip dhcp excluded-address 192.168.1.1 192.168.1.100\nip dhcp excluded-address 192.168.1.200 192.168.1.255\nip dhcp excluded-address 10.10.100.1 10.10.100.100\nip dhcp excluded-address 10.10.100.200 10.10.100.255\nip dhcp excluded-address 10.10.110.1 10.10.110.100\nip dhcp excluded-address 10.10.110.200 10.10.110.255\nip dhcp excluded-address 10.10.120.1 10.10.120.100\nip dhcp excluded-address 10.10.120.200 10.10.120.255",
                explanation:
                  "Nimmt Gateways, Server- und Reservebereiche aus den Pools heraus. So vergibt DHCP nur den Bereich .101–.199 je Netz.",
              },
              {
                cmd: "ip dhcp pool MGMT\nnetwork 192.168.1.0 255.255.255.0\ndefault-router 192.168.1.1\nexit",
                explanation: "DHCP-Pool für das Management-Netz (VLAN 1).",
              },
              {
                cmd: "ip dhcp pool VLAN100\nnetwork 10.10.100.0 255.255.255.0\ndefault-router 10.10.100.1\nexit\nip dhcp pool VLAN110\nnetwork 10.10.110.0 255.255.255.0\ndefault-router 10.10.110.1\nexit\nip dhcp pool VLAN120\nnetwork 10.10.120.0 255.255.255.0\ndefault-router 10.10.120.1\nexit",
                explanation:
                  "Ein Pool je Daten-VLAN. Das Default-Gateway ist jeweils die Subinterface-IP des Routers — so erreichen die Clients ihr Inter-VLAN-Routing.",
              },
            ],
          },
          {
            device: "R1",
            mode: "privileged",
            modeLabel: "R1#",
            commands: [
              {
                cmd: "end\nwrite memory",
                explanation: "Konfiguration speichern.",
              },
              {
                cmd: "show ip interface brief\nshow ip dhcp pool",
                explanation:
                  "Verifikation: alle Subinterfaces up/up; jeder Pool zeigt seinen Bereich und (nach Schritt 5) vergebene Leases.",
              },
            ],
          },
        ],
      },
      {
        title: "Schritt 2 — SW1 (VTP-Server): VLANs, Access-Ports, Trunks, Mgmt-SVI",
        blocks: [
          {
            device: "SW1",
            mode: "global",
            modeLabel: "SW1(config)#",
            commands: [
              {
                cmd: "hostname SW1\nenable secret cisco\nno ip domain-lookup\nline console 0\npassword cisco\nlogin\nexit\nline vty 0 4\npassword cisco\nlogin\nexit",
                explanation: "Grundkonfiguration wie bei R1.",
              },
              {
                cmd: "vtp mode server\nvtp domain CCNA\nvtp password cisco",
                explanation:
                  "SW1 ist VTP-Server der Domain CCNA und verteilt die VLAN-Datenbank. Domain + Passwort müssen auf allen Switches gleich sein.",
              },
              {
                cmd: "vlan 100\nname Rot\nexit\nvlan 110\nname Blau\nexit\nvlan 120\nname Gruen\nexit",
                explanation:
                  "Die drei Daten-VLANs anlegen. VTP überträgt sie automatisch an SW2 und SW3.",
              },
              {
                cmd: "interface fa0/1\nswitchport mode access\nswitchport access vlan 100\nexit\ninterface fa0/2\nswitchport mode access\nswitchport access vlan 110\nexit\ninterface fa0/3\nswitchport mode access\nswitchport access vlan 120\nexit",
                explanation:
                  "Access-Ports den VLANs zuordnen: Fa0/1 → 100 (Rot), Fa0/2 → 110 (Blau), Fa0/3 → 120 (Grün) — passend zu den drei PCs je Switch.",
              },
              {
                cmd: "interface gi0/1\nswitchport mode trunk\nexit\ninterface gi0/2\nswitchport mode trunk\nexit",
                explanation: "Gi0/1 = Trunk zum Router (RoaS), Gi0/2 = Trunk zu SW2.",
              },
              {
                cmd: "interface vlan 1\nip address 192.168.1.2 255.255.255.0\nno shutdown\nexit\nip default-gateway 192.168.1.1",
                explanation:
                  "Management-SVI im VLAN 1 + Default-Gateway, damit SW1 fernadministrierbar ist (L2-Switch routet selbst nicht).",
              },
            ],
          },
          {
            device: "SW1",
            mode: "privileged",
            modeLabel: "SW1#",
            commands: [
              {
                cmd: "end\nwrite memory",
                explanation: "Speichern.",
              },
              {
                cmd: "show vtp status\nshow vlan brief\nshow interfaces trunk",
                explanation:
                  "Verifikation: VTP-Server, Domain CCNA; VLAN 100/110/120 vorhanden; Gi0/1 und Gi0/2 trunking.",
              },
            ],
          },
        ],
      },
      {
        title: "Schritt 3 — SW2 (VTP-Server): Access-Ports, Trunks, Mgmt-SVI",
        blocks: [
          {
            device: "SW2",
            mode: "global",
            modeLabel: "SW2(config)#",
            commands: [
              {
                cmd: "hostname SW2\nenable secret cisco\nno ip domain-lookup\nline console 0\npassword cisco\nlogin\nexit\nline vty 0 4\npassword cisco\nlogin\nexit",
                explanation: "Grundkonfiguration.",
              },
              {
                cmd: "vtp mode server\nvtp domain CCNA\nvtp password cisco",
                explanation:
                  "Auch SW2 ist Server der Domain CCNA. Die VLANs muss SW2 NICHT selbst anlegen — sie kommen per VTP von SW1 (gleiche Domain, höhere Revision gewinnt).",
              },
              {
                cmd: "interface fa0/1\nswitchport mode access\nswitchport access vlan 100\nexit\ninterface fa0/2\nswitchport mode access\nswitchport access vlan 110\nexit\ninterface fa0/3\nswitchport mode access\nswitchport access vlan 120\nexit",
                explanation: "Access-Ports wie auf SW1 zuordnen.",
              },
              {
                cmd: "interface gi0/1\nswitchport mode trunk\nexit\ninterface gi0/2\nswitchport mode trunk\nexit",
                explanation: "Gi0/1 = Trunk zu SW1, Gi0/2 = Trunk zu SW3.",
              },
              {
                cmd: "interface vlan 1\nip address 192.168.1.3 255.255.255.0\nno shutdown\nexit\nip default-gateway 192.168.1.1",
                explanation: "Management-SVI + Gateway (192.168.1.3).",
              },
            ],
          },
          {
            device: "SW2",
            mode: "privileged",
            modeLabel: "SW2#",
            commands: [
              { cmd: "end\nwrite memory", explanation: "Speichern." },
            ],
          },
        ],
      },
      {
        title: "Schritt 4 — SW3 (VTP-Client): erst Trunk, VLAN-Sync abwarten, dann Access",
        blocks: [
          {
            device: "SW3",
            mode: "global",
            modeLabel: "SW3(config)#",
            commands: [
              {
                cmd: "hostname SW3\nenable secret cisco\nno ip domain-lookup\nline console 0\npassword cisco\nlogin\nexit\nline vty 0 4\npassword cisco\nlogin\nexit",
                explanation: "Grundkonfiguration.",
              },
              {
                cmd: "vtp mode client\nvtp domain CCNA\nvtp password cisco",
                explanation:
                  "SW3 ist VTP-Client und übernimmt die VLAN-Datenbank — kann selbst keine VLANs anlegen.",
              },
              {
                cmd: "interface gi0/1\nswitchport mode trunk\nexit",
                explanation:
                  "ZUERST den Trunk setzen! Erst über den Trunk synchronisiert VTP die VLANs zu SW3.",
              },
            ],
          },
          {
            device: "SW3",
            mode: "privileged",
            modeLabel: "SW3#",
            commands: [
              {
                cmd: "show vlan brief",
                explanation:
                  "Warten und prüfen: VLAN 100, 110, 120 MÜSSEN per VTP erschienen sein. Erst dann weiter mit den Access-Ports.",
              },
            ],
          },
          {
            device: "SW3",
            mode: "global",
            modeLabel: "SW3(config)#",
            commands: [
              {
                cmd: "interface fa0/1\nswitchport mode access\nswitchport access vlan 100\nexit\ninterface fa0/2\nswitchport mode access\nswitchport access vlan 110\nexit\ninterface fa0/3\nswitchport mode access\nswitchport access vlan 120\nexit",
                explanation: "Jetzt die Access-Ports den (synchronisierten) VLANs zuweisen.",
              },
              {
                cmd: "interface vlan 1\nip address 192.168.1.4 255.255.255.0\nno shutdown\nexit\nip default-gateway 192.168.1.1",
                explanation: "Management-SVI + Gateway (192.168.1.4).",
              },
            ],
          },
          {
            device: "SW3",
            mode: "privileged",
            modeLabel: "SW3#",
            commands: [
              { cmd: "end\nwrite memory", explanation: "Speichern." },
            ],
          },
        ],
      },
      {
        title: "Schritt 5 — PCs auf DHCP stellen",
        blocks: [
          {
            device: "Alle PCs",
            mode: "desktop",
            modeLabel: "Desktop > IP Configuration",
            commands: [
              {
                cmd: "Jeden PC anklicken → Desktop → IP Configuration → DHCP auswählen",
                explanation:
                  "Erwartete IPs: VLAN 100 (Rot) 10.10.100.101–199, VLAN 110 (Blau) 10.10.110.101–199, VLAN 120 (Grün) 10.10.120.101–199 — Gateway jeweils .1.",
              },
            ],
          },
        ],
      },
      {
        title: "Schritt 6 — Abschlusstest",
        blocks: [
          {
            device: "R1",
            mode: "privileged",
            modeLabel: "R1#",
            commands: [
              {
                cmd: "show ip dhcp binding",
                explanation:
                  "Alle 9 PCs sollten mit IP und MAC erscheinen. Danach die Ping-Tests durchführen.",
              },
            ],
          },
          {
            device: "PC Rot (an SW1)",
            mode: "desktop",
            modeLabel: "Desktop > Command Prompt",
            commands: [
              {
                cmd: "ping 10.10.100.103",
                explanation: "PC Rot an SW1 → PC Rot an SW3 (gleiches VLAN 100, zwei Trunk-Hops SW1—SW2—SW3). Genaue Ziel-IP aus show ip dhcp binding entnehmen — hier beispielhaft die dritte vergebene Adresse im Pool (.101–.199).",
              },
              {
                cmd: "ping 10.10.110.101",
                explanation: "PC Rot (VLAN 100) → PC Blau (VLAN 110), über R1: muss funktionieren — Inter-VLAN-Routing über die RoaS-Subinterfaces.",
              },
              {
                cmd: "ping 10.10.120.102",
                explanation: "PC Rot (SW1) → ein Grün-PC an SW2 oder SW3: muss über beide Trunk-Hops UND Inter-VLAN-Routing gleichzeitig funktionieren.",
              },
            ],
          },
        ],
      },
      {
        title: "Typische Fehler in diesem Campus-Szenario",
        blocks: [
          {
            device: "Merke",
            mode: "info",
            modeLabel: "Häufige Fehler",
            commands: [
              { cmd: "Access-Ports vor dem Trunk auf SW3 gesetzt", explanation: "Werden die Access-Ports zugewiesen, bevor der Trunk zu SW2 steht und die VLANs per VTP synchronisiert sind, landen sie in einem noch nicht existierenden VLAN — erst Trunk, dann warten, dann Access-Ports." },
              { cmd: "excluded-address für ein Netz vergessen", explanation: "Fehlt der Ausschluss für Gateway oder Reservebereich eines VLANs, kann der DHCP-Server diese IP an einen Client vergeben — Adresskonflikt mit dem Router-Subinterface." },
              { cmd: "Native VLAN auf dem RoaS-Subinterface vergessen", explanation: "Ohne 'encapsulation dot1Q 1 native' auf gi0/0.1 stimmt das Native VLAN zwischen Router und Switch nicht überein — Management-Traffic im VLAN 1 kann fehlschlagen oder eine CDP-Warnung auslösen." },
              { cmd: "VTP-Revision eines gebrauchten Switches ignoriert", explanation: "Ein Switch, der vorher schon in einer anderen VTP-Domain war, kann eine höhere Revision mitbringen und beim Anschließen versehentlich die VLAN-Datenbank von SW1 überschreiben." },
            ],
          },
        ],
      },
    ],
    verifyCommands: [
      { cmd: "show ip dhcp binding (R1)", expected: "9 Einträge — je PC eine IP aus .101–.199 + MAC" },
      { cmd: "show ip dhcp pool (R1)", expected: "MGMT/VLAN100/110/120 mit vergebenen Leases" },
      { cmd: "show vlan brief (SW3)", expected: "VLAN 100/110/120 per VTP vorhanden (obwohl SW3 Client ist)" },
      { cmd: "show vtp status (alle)", expected: "Domain CCNA, gleiche Configuration Revision auf allen Switches" },
      { cmd: "show interfaces trunk", expected: "Gi0/1/Gi0/2 trunking, VLAN 1/100/110/120 allowed+active" },
      { cmd: "ping VLAN100 → VLAN110", expected: "Erfolgreich (Inter-VLAN über R1-Subinterfaces)" },
    ],
    glossary: [
      { term: "Router-on-a-Stick", def: "Inter-VLAN-Routing über ein physisches Router-Interface, aufgeteilt in Subinterfaces pro VLAN." },
      { term: "Subinterface (gi0/0.X)", def: "Logisches Unter-Interface mit eigenem VLAN-Tag und IP — Default-Gateway eines VLANs." },
      { term: "encapsulation dot1Q <id> native", def: "Bindet das Subinterface an ein VLAN; 'native' = dieses VLAN läuft am Trunk ungetaggt (hier VLAN 1)." },
      { term: "Native VLAN", def: "Das eine VLAN, dessen Frames am Trunk ungetaggt übertragen werden (Standard VLAN 1)." },
      { term: "VTP (Server/Client)", def: "VLAN Trunking Protocol — Server legen VLANs an und verteilen sie; Clients übernehmen sie automatisch." },
      { term: "VTP-Domain", def: "Gemeinsamer Name + Passwort, den alle Switches teilen müssen, damit VTP synchronisiert (hier CCNA)." },
      { term: "ip dhcp excluded-address", def: "Nimmt Adressbereiche aus einem Pool heraus (Gateways, Server, Reserve) — verhindert Konflikte." },
      { term: "ip dhcp pool / default-router", def: "Definiert Adressbereich (network) und das den Clients mitgeteilte Gateway je VLAN." },
      { term: "SVI (interface vlan 1)", def: "Virtuelles Switch-Interface für das Management — gibt dem L2-Switch eine erreichbare IP." },
      { term: "ip default-gateway", def: "Gateway für einen reinen L2-Switch (der selbst nicht routet) — für Fernzugriff aus anderen Netzen." },
      { term: "show ip dhcp binding", def: "Zeigt alle vergebenen Leases: IP ↔ MAC ↔ Ablaufzeit." },
    ],
  },
];
