import {
  Desktop,
  Globe,
  HardDrives,
  Info,
  Network,
  Shield,
  Shuffle,
} from "@phosphor-icons/react";
import type { LabScenario } from "./types";

export const SERVICES_LABS: LabScenario[] = [

  // ─────────────────────────────────────────────────────────────
  // 6. DHCP-Server auf Router
  // ─────────────────────────────────────────────────────────────
  {
    id: "dhcp",
    icon: <HardDrives size={20} />,
    title: "DHCPv4 auf Router",
    subtitle: "Router · Switch · 2 PCs",
    difficulty: "Anfänger",
    duration: "15 min",
    context: {
      problem:
        "Jeden PC von Hand mit IP, Maske, Gateway und DNS zu versorgen ist mühsam und fehleranfällig — und bei Netzänderungen muss man alles erneut anfassen.",
      purpose:
        "Ein Router als DHCP-Server vergibt diese Parameter automatisch per DORA. Das Lab zeigt Pool, ausgenommene Adressen und die Client-Seite.",
    },
    topology: {
      description:
        "Der Router fungiert als DHCP-Server. PCs erhalten automatisch IP-Adressen.",
      devices: [
        { type: "router", label: "Router0", count: 1 },
        { type: "switch", label: "Switch0", count: 1 },
        { type: "pc", label: "PC0 / PC1 (DHCP)", count: 2 },
      ],
      connections: [
        "PC0 / PC1 → Switch0",
        "Switch0 → Router0 Gi0/0",
      ],
      hint: "Gleiche Topologie wie Basic-IP. PCs auf 'DHCP' stellen in IP Configuration.",
    },
    steps: [
      {
        title: "Router: Grundkonfiguration + Interface",
        blocks: [
          {
            device: "Router0",
            mode: "privileged",
            modeLabel: "Router>",
            commands: [
              {
                cmd: "enable\nconfigure terminal\nhostname R1\nno ip domain-lookup",
                explanation: "Üblicher Einstieg.",
              },
            ],
          },
          {
            device: "Router0",
            mode: "interface",
            modeLabel: "R1(config)#",
            commands: [
              {
                cmd: "interface GigabitEthernet0/0\nip address 192.168.1.1 255.255.255.0\nno shutdown",
                explanation: "Router-Interface als Default Gateway.",
              },
            ],
          },
        ],
      },
      {
        title: "DHCP-Pool auf Router konfigurieren",
        blocks: [
          {
            device: "Router0",
            mode: "global",
            modeLabel: "R1(config)#",
            commands: [
              {
                cmd: "ip dhcp excluded-address 192.168.1.1 192.168.1.10",
                explanation:
                  "Reserviert .1–.10 für statische Geräte (Router, Server). Diese IPs werden NICHT per DHCP vergeben.",
              },
              {
                cmd: "ip dhcp pool LAN_POOL",
                explanation:
                  "Erstellt einen DHCP-Pool namens LAN_POOL. Prompt wechselt zu R1(dhcp-config)#.",
              },
              {
                cmd: "network 192.168.1.0 255.255.255.0",
                explanation: "Definiert das Subnetz, aus dem IPs vergeben werden.",
              },
              {
                cmd: "default-router 192.168.1.1",
                explanation:
                  "Router teilt Clients das Default Gateway mit — wird mit DHCP-Option 3 übertragen.",
              },
              {
                cmd: "dns-server 8.8.8.8",
                explanation:
                  "DNS-Server-Adresse für Clients (DHCP-Option 6). Hier: Google DNS. Auf realer Hardware würde man zusätzlich mit lease <tage> die Lease-Dauer festlegen (Default 24 Stunden) — in Packet Tracer 9.0 zeigt dieser Befehl kein zuverlässiges Verhalten und entfällt daher hier.",
              },
            ],
          },
          {
            device: "Router0",
            mode: "privileged",
            modeLabel: "R1(config)#",
            commands: [
              {
                cmd: "end\ncopy running-config startup-config",
                explanation: "Speichern.",
              },
            ],
          },
        ],
      },
      {
        title: "Switch: Grundkonfiguration",
        blocks: [
          {
            device: "Switch0",
            mode: "privileged",
            modeLabel: "Switch>",
            commands: [
              {
                cmd: "enable\nconfigure terminal\nhostname SW1\nno ip domain-lookup",
                explanation: "Reiner L2-Switch — Default-VLAN 1 reicht, DHCP-Broadcasts werden ohne Zutun durchgereicht.",
              },
            ],
          },
          {
            device: "Switch0",
            mode: "privileged",
            modeLabel: "SW1(config)#",
            commands: [
              {
                cmd: "do copy running-config startup-config",
                explanation: "Speichern.",
              },
            ],
          },
        ],
      },
      {
        title: "PCs auf DHCP setzen",
        blocks: [
          {
            device: "PC0",
            mode: "desktop",
            modeLabel: "Desktop > IP Configuration",
            commands: [
              {
                cmd: "◉ DHCP  (Radio-Button anklicken)",
                explanation:
                  "PC schickt DHCP Discover-Broadcast. Router antwortet mit Offer → Request → Acknowledge (DORA-Prozess).",
              },
            ],
          },
          {
            device: "PC1",
            mode: "desktop",
            modeLabel: "Desktop > IP Configuration",
            commands: [
              {
                cmd: "◉ DHCP  (Radio-Button anklicken)",
                explanation: "Gleicher Vorgang wie PC0 — bekommt die nächste freie Adresse aus dem Pool.",
              },
            ],
          },
        ],
      },
      {
        title: "Abschlusstest",
        blocks: [
          {
            device: "PC0",
            mode: "desktop",
            modeLabel: "Desktop > Command Prompt",
            commands: [
              {
                cmd: "ipconfig",
                explanation: "Bestätigt die per DHCP erhaltene IP, Maske und Gateway.",
              },
              {
                cmd: "ping 192.168.1.12",
                explanation: "PC0 pingt PC1 (voraussichtlich .12, da .11 an PC0 selbst ging) — beweist, dass beide PCs korrekt adressiert wurden und sich erreichen.",
              },
            ],
          },
        ],
      },
      {
        title: "Typische Fehler bei DHCP",
        blocks: [
          {
            device: "Merke",
            mode: "info",
            modeLabel: "Häufige Fehler",
            commands: [
              { cmd: "ip dhcp excluded-address vergessen", explanation: "Ohne diese Zeile kann der Server die Gateway-Adresse selbst an einen Client vergeben — Adresskonflikt mit dem Router." },
              { cmd: "network-Befehl mit falscher Maske", explanation: "Die Maske im network-Befehl muss zur tatsächlichen Subnetzgröße passen, sonst vergibt der Pool Adressen aus einem zu großen oder zu kleinen Bereich." },
              { cmd: "PC steht noch auf statischer IP", explanation: "Der Radio-Button muss aktiv auf DHCP stehen — eine alte statische IP wird sonst nicht automatisch ersetzt." },
              { cmd: "APIPA (169.254.x.x) nach ipconfig", explanation: "Kein DHCP-Server geantwortet — meist fehlt no shutdown auf dem Router-Interface oder der Pool ist falsch konfiguriert." },
            ],
          },
        ],
      },
    ],
    verifyCommands: [
      { cmd: "show ip dhcp pool", expected: "LAN_POOL, Leases: 2" },
      { cmd: "show ip dhcp binding", expected: "192.168.1.11 und .12 → jeweilige PC-MAC" },
      { cmd: "ipconfig (auf PC)", expected: "IP aus Pool 192.168.1.11 oder .12" },
      { cmd: "ping 192.168.1.12 (von PC0)", expected: "Erfolgreich — beide PCs per DHCP im selben Subnetz" },
    ],
    glossary: [
      { term: "DHCP", def: "Dynamic Host Configuration Protocol — vergibt IP, Maske, Gateway und DNS automatisch (UDP 67/68)." },
      { term: "DORA", def: "Discover, Offer, Request, Ack — die vier Schritte der DHCP-Adressvergabe." },
      { term: "ip dhcp pool", def: "Legt einen Adresspool an und öffnet den DHCP-Config-Modus." },
      { term: "network", def: "Definiert den Adressbereich, den der Pool vergibt." },
      { term: "default-router", def: "Gateway, das der Server den Clients mitteilt." },
      { term: "dns-server", def: "DNS-Server-Adresse für die Clients." },
      { term: "ip dhcp excluded-address", def: "Nimmt Adressen aus dem Pool heraus (Gateway, Server, Drucker) — verhindert Konflikte." },
      { term: "Lease", def: "Geliehene Adresse mit Ablaufzeit; wird per Renewal/Rebinding verlängert." },
      { term: "APIPA", def: "169.254.x.x — Adresse, die sich ein Client selbst gibt, wenn kein DHCP-Server antwortet." },
    ],
  },

  // ─────────────────────────────────────────────────────────────
  // DHCP Relay über VLAN-Grenzen (Router-on-a-Stick + ip helper-address)
  // ─────────────────────────────────────────────────────────────
  {
    id: "dhcp-relay",
    icon: <Network size={20} />,
    title: "DHCP Relay über VLAN-Grenzen",
    subtitle: "Router-on-a-Stick · 3 VLANs · zentraler DHCP-Server · ip helper-address",
    difficulty: "Fortgeschritten",
    duration: "40 min",
    context: {
      problem:
        "DHCP-Clients suchen ihren Server per Broadcast. Router leiten Broadcasts aber NICHT zwischen Subnetzen weiter — ein zentraler DHCP-Server in VLAN 71 würde die Discover-Pakete aus VLAN 51 und 61 also nie sehen. Ohne Lösung bekäme jeder Client nur eine APIPA-Adresse (169.254.x.x).",
      purpose:
        "In echten Netzen will man EINEN zentralen DHCP-Server für viele VLANs statt einen Pool pro Router. Dieses Szenario zeigt den Standardweg dafür: Der Router wird mit 'ip helper-address' zum DHCP-Relay, das die Broadcasts als gezielten Unicast an den Server weiterreicht — genau so läuft es in Unternehmens- und Campus-Netzen.",
    },
    topology: {
      description:
        "Drei VLANs auf zwei Switches, Inter-VLAN-Routing per Router-on-a-Stick. Ein einziger DHCP-Server (192.168.2.11) im VLAN 71 versorgt die Clients in VLAN 51 und 61 — der Router leitet die DHCP-Broadcasts per ip helper-address als Unicast weiter.",
      devices: [
        { type: "router", label: "R1 (RoaS, Gi0/0.51/.61/.71)", count: 1 },
        { type: "switch", label: "SW1 (VTP-Server)", count: 1 },
        { type: "switch", label: "SW2 (VTP-Client, downstream)", count: 1 },
        { type: "server", label: "DHCP-Server 192.168.2.11", count: 1 },
        { type: "pc", label: "Clients Rot/Blau/Gelb", count: 3 },
      ],
      connections: [
        "R1 Gi0/0 ↔ SW1 Gi0/1  (Trunk 802.1Q, alle VLANs)",
        "SW1 Gi0/2 ↔ SW2 Gi0/1  (Trunk, downstream)",
        "DHCP-Server → SW1 Fa0/24  (VLAN 71 Gelb)",
        "Client-Rot → SW1 Fa0/1 (VLAN 51) · Client-Blau → SW1 Fa0/11 (VLAN 61)",
      ],
      hint: "ip helper-address gehört auf die CLIENT-Subinterfaces (.51 und .61). VLAN 71 (Server) braucht keinen Helper — der Server steht dort lokal.",
    },
    steps: [
      {
        title: "SW1 als VTP-Server + VLANs anlegen",
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
            mode: "global",
            modeLabel: "SW1(config)#",
            commands: [
              {
                cmd: "vtp domain FSG57\nvtp password geheim!\nvtp mode server",
                explanation:
                  "VTP-Domain FSG57 mit Passwort 'geheim!'. SW1 ist Server und verteilt die VLAN-Datenbank an SW2 — Domain und Passwort müssen auf beiden Switches identisch sein.",
              },
              {
                cmd: "vlan 51\nname Rot\nvlan 61\nname Blau\nvlan 71\nname Gelb",
                explanation:
                  "Drei VLANs: 51 Rot (172.16.51.0/24), 61 Blau (172.16.61.0/24), 71 Gelb (192.168.2.0/24 — DHCP-Server). VTP überträgt sie automatisch an SW2.",
              },
            ],
          },
        ],
      },
      {
        title: "SW1 Access-Ports + Trunks",
        blocks: [
          {
            device: "SW1",
            mode: "global",
            modeLabel: "SW1(config)#",
            commands: [
              {
                cmd: "interface range fa0/1-10\nswitchport mode access\nswitchport access vlan 51",
                explanation: "Fa0/1-10 = VLAN 51 Rot.",
              },
              {
                cmd: "interface range fa0/11-20\nswitchport mode access\nswitchport access vlan 61",
                explanation: "Fa0/11-20 = VLAN 61 Blau.",
              },
              {
                cmd: "interface range fa0/21-24\nswitchport mode access\nswitchport access vlan 71",
                explanation: "Fa0/21-24 = VLAN 71 Gelb (DHCP-Server an Fa0/24).",
              },
              {
                cmd: "interface gi0/1\nswitchport mode trunk\ninterface gi0/2\nswitchport mode trunk",
                explanation: "Gi0/1 = Trunk zum Router (RoaS), Gi0/2 = Trunk zu SW2.",
              },
              {
                cmd: "end\ncopy running-config startup-config",
                explanation: "Speichern.",
              },
            ],
          },
        ],
      },
      {
        title: "SW2 als VTP-Client + Access-Ports",
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
            mode: "global",
            modeLabel: "SW2(config)#",
            commands: [
              {
                cmd: "vtp domain FSG57\nvtp password geheim!\nvtp mode client",
                explanation:
                  "SW2 übernimmt die VLAN-Datenbank von SW1 — keine lokale VLAN-Erstellung nötig. Prüfung: 'show vtp status' muss gleiche Revision wie SW1 zeigen.",
              },
              {
                cmd: "interface gi0/1\nswitchport mode trunk\ninterface range fa0/1-10\nswitchport mode access\nswitchport access vlan 51",
                explanation: "Uplink-Trunk zu SW1, Access-Ports z. B. für weitere Rot-Clients.",
              },
              {
                cmd: "end\ncopy running-config startup-config",
                explanation: "Speichern.",
              },
            ],
          },
        ],
      },
      {
        title: "R1 Router-on-a-Stick + ip helper-address",
        blocks: [
          {
            device: "R1",
            mode: "privileged",
            modeLabel: "Router>",
            commands: [
              { cmd: "enable\nconfigure terminal\nhostname R1\nno ip domain-lookup", explanation: "Üblicher Einstieg." },
            ],
          },
          {
            device: "R1",
            mode: "global",
            modeLabel: "R1(config)#",
            commands: [
              {
                cmd: "interface gi0/0\nno ip address\nno shutdown",
                explanation: "Physisches Parent-Interface: KEINE IP, aber aktivieren — sonst sind alle Subinterfaces down.",
              },
              {
                cmd: "interface gi0/0.51\nencapsulation dot1q 51\nip address 172.16.51.1 255.255.255.0\nip helper-address 192.168.2.11",
                explanation:
                  "VLAN-51-Gateway. Der Helper leitet DHCP-Broadcasts der Rot-Clients als Unicast an 192.168.2.11 weiter und trägt 172.16.51.1 ins giaddr-Feld → der Server wählt den Rot-Pool.",
              },
              {
                cmd: "interface gi0/0.61\nencapsulation dot1q 61\nip address 172.16.61.1 255.255.255.0\nip helper-address 192.168.2.11",
                explanation: "VLAN-61-Gateway + Helper für die Blau-Clients (giaddr 172.16.61.1 → Blau-Pool).",
              },
              {
                cmd: "interface gi0/0.71\nencapsulation dot1q 71\nip address 192.168.2.1 255.255.255.0",
                explanation:
                  "VLAN-71-Gateway. KEIN Helper nötig — der DHCP-Server steht in diesem VLAN lokal.",
              },
              {
                cmd: "end\ncopy running-config startup-config",
                explanation: "Speichern.",
              },
            ],
          },
        ],
      },
      {
        title: "DHCP-Server (192.168.2.11) — Pools je VLAN",
        blocks: [
          {
            device: "DHCP-Server",
            mode: "service",
            modeLabel: "Server > Services > DHCP",
            commands: [
              {
                cmd: "Pool Rot:  Default Gateway 172.16.51.1 · DNS 192.168.2.11 · Start 172.16.51.10 · Maske 255.255.255.0",
                explanation:
                  "Der Pool für die Rot-Clients. Das Default-Gateway ist die Router-Subinterface-IP (172.16.51.1) — NICHT die Server-IP.",
              },
              {
                cmd: "Pool Blau: Default Gateway 172.16.61.1 · DNS 192.168.2.11 · Start 172.16.61.10 · Maske 255.255.255.0",
                explanation:
                  "Analog für Blau. Wichtig: pro Client-Subnetz ein eigener Pool, dessen Netz zur giaddr passt — sonst antwortet der Server nicht.",
              },
              {
                cmd: "Server-NIC: statisch 192.168.2.11/24, Gateway 192.168.2.1",
                explanation: "Der Server selbst bekommt eine statische IP im VLAN 71.",
              },
            ],
          },
        ],
      },
      {
        title: "Clients auf DHCP stellen + Abschlusstest",
        blocks: [
          {
            device: "Client Rot",
            mode: "desktop",
            modeLabel: "Desktop > IP Configuration",
            commands: [
              { cmd: "IP-Konfiguration: DHCP", explanation: "Client Rot bezieht per DHCP eine Adresse aus dem Rot-Pool (172.16.51.10+) über R1 als Relay." },
            ],
          },
          {
            device: "Client Blau",
            mode: "desktop",
            modeLabel: "Desktop > IP Configuration",
            commands: [
              { cmd: "IP-Konfiguration: DHCP", explanation: "Client Blau bezieht per DHCP eine Adresse aus dem Blau-Pool (172.16.61.10+)." },
            ],
          },
          {
            device: "Client Rot",
            mode: "desktop",
            modeLabel: "Desktop > Command Prompt",
            commands: [
              {
                cmd: "ipconfig\nping 172.16.61.10",
                explanation: "Bestätigt die per DHCP zugewiesene Adresse und testet Inter-VLAN-Routing zu Client Blau über R1.",
              },
            ],
          },
        ],
      },
      {
        title: "Typische Fehler bei DHCP Relay",
        blocks: [
          {
            device: "Merke",
            mode: "info",
            modeLabel: "Häufige Fehler",
            commands: [
              { cmd: "ip helper-address auf dem falschen Interface", explanation: "Der Helper gehört auf das CLIENT-Subinterface (hier .51/.61) — wird er versehentlich auf das Server-VLAN (.71) gesetzt, hat er keine Wirkung." },
              { cmd: "Pool-Netz passt nicht zur giaddr", explanation: "Der DHCP-Server wählt den Pool anhand des giaddr-Feldes (= Helper-Interface-IP) — ein Pool mit falschem Netz wird von IOS zwar akzeptiert, aber nie für diese Clients benutzt." },
              { cmd: "Default-Gateway im Pool auf die Server-IP statt Router-IP gesetzt", explanation: "Das im Pool hinterlegte Gateway muss die jeweilige Router-Subinterface-Adresse sein (z. B. 172.16.51.1) — sonst bekommen Clients zwar eine IP, aber kein funktionierendes Gateway." },
              { cmd: "VTP-Domain/Passwort zwischen SW1 und SW2 unterschiedlich", explanation: "Stimmen Domain oder Passwort nicht exakt überein, lehnt SW2 die VLAN-Updates von SW1 stillschweigend ab — die VLANs fehlen dann auf SW2." },
            ],
          },
        ],
      },
    ],
    verifyCommands: [
      { cmd: "ipconfig (Client Rot)", expected: "IP aus 172.16.51.10+, Gateway 172.16.51.1" },
      { cmd: "ipconfig (Client Blau)", expected: "IP aus 172.16.61.10+, Gateway 172.16.61.1" },
      { cmd: "show ip dhcp binding (Server)", expected: "Leases in 172.16.51.x UND 172.16.61.x" },
      { cmd: "show vlans (R1)", expected: "Gi0/0.51→VLAN51, .61→VLAN61, .71→VLAN71 + Paketzähler" },
      { cmd: "show vtp status (SW2)", expected: "Mode: Client, Domain FSG57, gleiche Revision wie SW1" },
    ],
    glossary: [
      { term: "DHCP Relay", def: "Funktion eines Routers, die DHCP-Broadcasts aus einem Client-VLAN als Unicast an einen entfernten Server weiterleitet. Aktiviert mit ip helper-address." },
      { term: "ip helper-address", def: "Befehl auf dem Client-seitigen Interface, der die Ziel-IP des DHCP-Servers setzt. Macht den Router zum Relay-Agent." },
      { term: "giaddr", def: "Gateway IP Address — Feld im DHCP-Paket, in das der Relay seine Interface-IP einträgt. Der Server wählt daran den passenden Adresspool." },
      { term: "Router-on-a-Stick", def: "Inter-VLAN-Routing über EIN physisches Interface, das per Subinterfaces (encapsulation dot1q) in mehrere VLAN-Gateways aufgeteilt wird." },
      { term: "Subinterface", def: "Logisches Unter-Interface (z. B. Gi0/0.51) mit eigener VLAN-Zuordnung und IP — dient als Default-Gateway eines VLANs." },
      { term: "encapsulation dot1q <id>", def: "Bindet ein Subinterface an ein VLAN-Tag nach IEEE 802.1Q. Pflicht, sonst weiß das Subinterface nicht, welches VLAN es bedient." },
      { term: "VTP", def: "VLAN Trunking Protocol — verteilt die VLAN-Datenbank automatisch vom Server- an die Client-Switches derselben Domain." },
      { term: "Trunk", def: "Switch-Link, der mehrere VLANs getaggt (802.1Q) überträgt — hier zwischen Switch und Router bzw. zwischen den Switches." },
      { term: "APIPA", def: "169.254.x.x — Adresse, die ein Client sich selbst gibt, wenn KEIN DHCP-Server antwortet. Sicheres Zeichen für ein DHCP-/Relay-Problem." },
    ],
  },

  // ─────────────────────────────────────────────────────────────
  // 7. NAT / PAT (Overload)
  // Topologie: PC0/PC0(1)/PC0(2) → SW1 → NAT → ISP → INTERNET → Webserver
  // ─────────────────────────────────────────────────────────────
  {
    id: "nat-pat",
    icon: <Desktop size={20} />,
    title: "NAT / PAT (Overload)",
    subtitle: "3 PCs · SW1 · NAT-Router · ISP · INTERNET · Webserver",
    difficulty: "Mittel",
    duration: "35 min",
    context: {
      problem:
        "Drei PCs mit privaten Adressen (192.168.1.0/24) sollen das Internet erreichen — aber es steht nur EINE öffentliche IP zur Verfügung (200.0.0.1 auf Gig0/1 des NAT-Routers).",
      purpose:
        "PAT (Port Address Translation, auch 'NAT Overload') löst das Problem: Alle internen Hosts teilen sich eine einzige öffentliche IP, unterschieden per Portnummer. Das ist das Verfahren, das in 99 % aller Heimrouter und kleinen Büros läuft.",
    },
    topology: {
      description:
        "Drei PCs hängen via SW1 am NAT-Router (Gig0/0 = inside). Die WAN-Strecke zum ISP ist ein /30-Subnetz (200.0.0.0/30): NAT=.1, ISP=.2. Dahinter verbindet ein INTERNET-Router (Transit 1.1.1.0/30) den ISP mit dem Webserver-Segment (47.11.8.0/24).",
      devices: [
        { type: "pc",     label: "PC0 (192.168.1.10/24)",   count: 1 },
        { type: "pc",     label: "PC0(1) (192.168.1.11/24)", count: 1 },
        { type: "pc",     label: "PC0(2) (192.168.1.12/24)", count: 1 },
        { type: "switch", label: "SW1 (Fa0/1–3, Gig0/1)",   count: 1 },
        { type: "router", label: "NAT-Router (Gig0/0 inside, Gig0/1 outside)", count: 1 },
        { type: "router", label: "ISP (Gig0/2 ↔ NAT, Gig0/1 ↔ INTERNET)",    count: 1 },
        { type: "router", label: "INTERNET (Gig0/2 ↔ ISP, Gi0/0 ↔ Webserver)", count: 1 },
        { type: "server", label: "Webserver (47.11.8.15/24)", count: 1 },
      ],
      connections: [
        "PC0/PC0(1)/PC0(2) → SW1 Fa0/1–3 → SW1 Gig0/1 → NAT Gig0/0  (192.168.1.0/24)",
        "NAT Gig0/1 (200.0.0.1) ↔ ISP Gig0/2 (200.0.0.2)  — 200.0.0.0/30",
        "ISP Gig0/1 (1.1.1.1) ↔ INTERNET Gig0/2 (1.1.1.2)  — 1.1.1.0/30",
        "INTERNET Gi0/0 (47.11.8.1) ↔ Webserver Fa0 (47.11.8.15)  — 47.11.8.0/24",
      ],
      hint: "PAT nutzt die Outside-Interface-IP (200.0.0.1) für alle Hosts — kein Pool nötig. Der INTERNET-Router braucht eine Rückroute für 200.0.0.0/30, damit Antwortpakete zurückfinden.",
    },
    steps: [
      {
        title: "1) IP-Adressen auf allen Geräten vergeben",
        blocks: [
          {
            device: "PC0",
            mode: "desktop",
            modeLabel: "PC0 – IP-Konfiguration",
            commands: [
              {
                cmd: "IP:      192.168.1.10\nMaske:   255.255.255.0\nGateway: 192.168.1.1",
                explanation:
                  "Gleiche Vorgehensweise für PC0(1) mit .11 und PC0(2) mit .12. Gateway = NAT-Router Gig0/0.",
              },
            ],
          },
          {
            device: "NAT-Router",
            mode: "privileged",
            modeLabel: "Router>",
            commands: [
              { cmd: "enable\nconfigure terminal\nhostname NAT-Router\nno ip domain-lookup", explanation: "Üblicher Einstieg." },
            ],
          },
          {
            device: "NAT-Router",
            mode: "interface",
            modeLabel: "NAT-Router(config-if)#",
            commands: [
              {
                cmd: "interface GigabitEthernet0/0\n ip address 192.168.1.1 255.255.255.0\n no shutdown",
                explanation:
                  "LAN-Interface. Die inside-Markierung wird im nächsten Schritt gesetzt.",
              },
              {
                cmd: "interface GigabitEthernet0/1\n ip address 200.0.0.1 255.255.255.252\n no shutdown",
                explanation:
                  "WAN-Interface. /30 (255.255.255.252) = 4 Adressen, 2 nutzbar: .1 (NAT) und .2 (ISP). Typische P2P-Maske für WAN-Strecken.",
              },
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
            mode: "interface",
            modeLabel: "ISP(config-if)#",
            commands: [
              {
                cmd: "interface GigabitEthernet0/2\n ip address 200.0.0.2 255.255.255.252\n no shutdown",
                explanation:
                  "ISP-seitiger Anschluss des NAT-Routers. Gig0/2 = Kundenseite (200.0.0.2).",
              },
              {
                cmd: "interface GigabitEthernet0/1\n ip address 1.1.1.1 255.255.255.252\n no shutdown",
                explanation:
                  "Transit-Interface zum INTERNET-Router. 1.1.1.0/30: ISP=.1, INTERNET=.2.",
              },
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
            mode: "interface",
            modeLabel: "INTERNET(config-if)#",
            commands: [
              {
                cmd: "interface GigabitEthernet0/2\n ip address 1.1.1.2 255.255.255.252\n no shutdown",
                explanation:
                  "Transit-Interface Richtung ISP (.2 im /30-Subnetz).",
              },
              {
                cmd: "interface GigabitEthernet0/0\n ip address 47.11.8.1 255.255.255.0\n no shutdown",
                explanation:
                  "Interface zum Webserver-Segment. Webserver hat .15, Gateway = .1.",
              },
            ],
          },
          {
            device: "Webserver",
            mode: "desktop",
            modeLabel: "Webserver – IP-Konfiguration",
            commands: [
              {
                cmd: "IP:      47.11.8.15\nMaske:   255.255.255.0\nGateway: 47.11.8.1",
                explanation:
                  "Statische öffentliche IP. Gateway = INTERNET-Router Gi0/0.",
              },
            ],
          },
        ],
      },
      {
        title: "2) NAT inside / outside auf Interfaces setzen",
        blocks: [
          {
            device: "NAT-Router",
            mode: "interface",
            modeLabel: "NAT(config-if)#",
            commands: [
              {
                cmd: "interface GigabitEthernet0/0\n ip nat inside",
                explanation:
                  "Markiert Gig0/0 als 'innen'. Pakete, die hier ankommen, werden gegen die NAT-Regeln geprüft. Ohne diese Markierung passiert KEINE Übersetzung.",
              },
              {
                cmd: "interface GigabitEthernet0/1\n ip nat outside",
                explanation:
                  "Markiert Gig0/1 als 'außen'. Übersetzte Pakete verlassen hier das Netz mit der öffentlichen IP 200.0.0.1 als Source.",
              },
            ],
          },
        ],
      },
      {
        title: "3) ACL — welche Hosts übersetzt werden",
        blocks: [
          {
            device: "NAT-Router",
            mode: "global",
            modeLabel: "NAT(config)#",
            commands: [
              {
                cmd: "access-list 1 permit 192.168.1.0 0.0.0.255",
                explanation:
                  "Standard-ACL 1: Erlaubt das gesamte LAN-Subnetz 192.168.1.0/24 (Wildcard 0.0.0.255). Nur diese Hosts werden von PAT übersetzt. Alles außerhalb dieser ACL bleibt unverändert.",
              },
            ],
          },
        ],
      },
      {
        title: "4) PAT aktivieren (der Schlüsselbefehl)",
        blocks: [
          {
            device: "NAT-Router",
            mode: "global",
            modeLabel: "NAT(config)#",
            commands: [
              {
                cmd: "ip nat inside source list 1 interface GigabitEthernet0/1 overload",
                explanation:
                  "Zerlegt in Teile:\n  'list 1'              → Quelle muss ACL 1 treffen (192.168.1.0/24)\n  'interface Gi0/1'     → benutze die IP von Gig0/1 (200.0.0.1) als öffentliche Adresse\n  'overload'            → PAT aktivieren — viele Hosts teilen diese eine IP per Port-Nummer\nOHNE 'overload' würde der Router versuchen, 1:1-NAT zu machen — mit nur einer IP würde ab dem 2. Host nichts mehr funktionieren.",
              },
            ],
          },
        ],
      },
      {
        title: "5) Default-Route + Rückrouten konfigurieren",
        blocks: [
          {
            device: "NAT-Router",
            mode: "global",
            modeLabel: "NAT(config)#",
            commands: [
              {
                cmd: "ip route 0.0.0.0 0.0.0.0 200.0.0.2",
                explanation:
                  "Default-Route: Alles unbekannte Traffic geht zum ISP (200.0.0.2). Nach PAT-Übersetzung verlässt das Paket Gig0/1 mit Quelle 200.0.0.1.",
              },
              {
                cmd: "end\ncopy running-config startup-config",
                explanation: "Speichern.",
              },
            ],
          },
          {
            device: "ISP",
            mode: "global",
            modeLabel: "ISP(config)#",
            commands: [
              {
                cmd: "ip route 0.0.0.0 0.0.0.0 1.1.1.2",
                explanation:
                  "ISP leitet alles zum INTERNET-Router. Antwortpakete des Webservers (Ziel: 200.0.0.1) kommen über diesen Weg zurück zum ISP.",
              },
              {
                cmd: "end\ncopy running-config startup-config",
                explanation: "Speichern.",
              },
            ],
          },
          {
            device: "INTERNET",
            mode: "global",
            modeLabel: "INTERNET(config)#",
            commands: [
              {
                cmd: "ip route 200.0.0.0 255.255.255.252 1.1.1.1",
                explanation:
                  "Rückroute für 200.0.0.0/30! Der INTERNET-Router muss wissen, dass 200.0.0.1 (die PAT-Adresse) über den ISP (1.1.1.1) erreichbar ist. Ohne diese Route schmeißt er alle Antwortpakete weg — die Verbindung scheitert still.",
              },
              {
                cmd: "end\ncopy running-config startup-config",
                explanation: "Speichern.",
              },
            ],
          },
        ],
      },
      {
        title: "6) Konnektivität testen & PAT-Verhalten beobachten",
        blocks: [
          {
            device: "PC0",
            mode: "desktop",
            modeLabel: "Desktop > Command Prompt",
            commands: [
              {
                cmd: "ping 47.11.8.15",
                explanation:
                  "PC0 (192.168.1.10) sendet ICMP. NAT übersetzt: Quelle 192.168.1.10 → 200.0.0.1:xxxx (Port wird zugewiesen). Wenn PC0(1) gleichzeitig pingt, benutzt es ebenfalls 200.0.0.1 — aber mit einem anderen Port. Beide Antworten landen korrekt beim richtigen PC.",
              },
            ],
          },
          {
            device: "NAT-Router",
            mode: "privileged",
            modeLabel: "NAT#",
            commands: [
              {
                cmd: "show ip nat translations",
                explanation:
                  "Pro Verbindung eine Zeile mit Port-Nummern:\n  icmp 192.168.1.10:1  200.0.0.1:1  47.11.8.15:1  47.11.8.15:1\n  icmp 192.168.1.11:1  200.0.0.1:2  47.11.8.15:1  47.11.8.15:1\nAlle PCs teilen 200.0.0.1, unterschieden nur durch den Port (Spalte 3). Genau das ist PAT.",
              },
              {
                cmd: "show ip nat statistics",
                explanation:
                  "Zeigt: Total active translations, inside/outside interfaces und die gebundene ACL. 'Hits' steigen bei aktivem Traffic, 'misses' bei Konfigurationsfehlern (falsche ACL oder inside/outside vergessen).",
              },
            ],
          },
        ],
      },
      {
        title: "Typische Fehler bei NAT/PAT",
        blocks: [
          {
            device: "Merke",
            mode: "info",
            modeLabel: "Häufige Fehler",
            commands: [
              { cmd: "ip nat inside / outside vergessen oder vertauscht", explanation: "Ohne beide Markierungen (oder mit vertauschten Interfaces) übersetzt der Router gar nichts oder in die falsche Richtung — show ip nat statistics zeigt dann 'misses' statt 'hits'." },
              { cmd: "overload vergessen", explanation: "Ohne overload versucht IOS eine 1:1-Übersetzung — mit nur einer öffentlichen IP funktioniert dann höchstens ein Host gleichzeitig." },
              { cmd: "Fehlende Rückroute auf dem INTERNET-Router", explanation: "Der Ping scheitert nicht am Hinweg, sondern weil die Antwort des Webservers keinen Weg zurück zu 200.0.0.1 findet — die Rückroute für 200.0.0.0/30 ist Pflicht." },
              { cmd: "ACL zu eng oder zu weit gefasst", explanation: "Eine falsche Wildcard-Maske in der Standard-ACL übersetzt entweder zu wenige Hosts (Timeout beim Ping) oder unbeabsichtigt weitere Subnetze." },
            ],
          },
        ],
      },
    ],
    verifyCommands: [
      { cmd: "ping 47.11.8.15 (von PC0)", expected: "Erfolgreich — Quelle 192.168.1.10 → 200.0.0.1:Port in NAT-Tabelle" },
      { cmd: "show ip nat translations", expected: "Alle 3 PCs erscheinen mit 200.0.0.1 als Inside Global, unterschiedliche Ports" },
      { cmd: "show ip nat statistics", expected: "Hits steigen, interface GigabitEthernet0/1, ACL 1 gebunden" },
      { cmd: "ping 200.0.0.1 (vom Webserver)", expected: "Fehlschlag — PAT hat keinen permanenten Eintrag für eingehende Verbindungen" },
    ],
    glossary: [
      { term: "PAT (Overload)",   def: "Port Address Translation — viele private Hosts teilen eine öffentliche IP per eindeutiger Portnummer." },
      { term: "NAT",              def: "Network Address Translation — übersetzt private in öffentliche IPs." },
      { term: "Inside Local",     def: "Private Host-IP vor der Übersetzung (z. B. 192.168.1.10)." },
      { term: "Inside Global",    def: "Öffentliche IP nach Übersetzung — bei PAT immer 200.0.0.1 (die Outside-Interface-IP)." },
      { term: "overload",         def: "Aktiviert PAT: mehrere Hosts teilen eine IP, unterschieden per Port. Ohne 'overload' = 1:1-NAT." },
      { term: "ip nat inside",    def: "Markiert das LAN-Interface — Pakete hier werden übersetzt." },
      { term: "ip nat outside",   def: "Markiert das WAN-Interface — übersetzte Pakete verlassen hier das Netz." },
      { term: "/30 (255.255.255.252)", def: "WAN-Subnetz mit 4 Adressen (2 nutzbar). Typisch für P2P-Strecken zwischen Router und ISP." },
      { term: "Rückroute",        def: "INTERNET-Router braucht Route für 200.0.0.0/30 → sonst keine Antwortpakete." },
      { term: "RFC 1918",         def: "Definiert private Adressbereiche: 10/8, 172.16/12, 192.168/16." },
    ],
  },

  // ─────────────────────────────────────────────────────────────
  // Dynamic NAT (Pool) — gleiche Topologie wie Statisches NAT
  // Topologie: PC0/PC0(1)/PC0(2) → SW → NAT → ISP → INTERNET → Webserver
  // ─────────────────────────────────────────────────────────────
  {
    id: "dynamic-nat",
    icon: <Globe size={20} />,
    title: "Dynamisches NAT (Pool)",
    subtitle: "3 PCs · SW · NAT-Router · ISP · INTERNET · Webserver",
    difficulty: "Mittel",
    duration: "35 min",
    context: {
      problem:
        "Drei PCs sollen ins Internet, aber die öffentlichen IPs sollen nicht fest zugeordnet sein — wer zuerst Verbindung aufbaut, bekommt die nächste freie Pool-Adresse. Ist der Pool leer, wird die Verbindung verworfen.",
      purpose:
        "Dynamic NAT verwaltet einen Pool öffentlicher Adressen und weist jede davon bei Bedarf dynamisch einem internen Host zu (1:1, keine Port-Multiplexierung). Tabelleneinträge entstehen erst bei aktivem Traffic und verfallen danach — im Gegensatz zu Static NAT, wo Einträge permanent existieren.",
    },
    topology: {
      description:
        "Drei PCs hängen an einem Switch im Netz 192.168.1.0/24. Der NAT-Router trennt das private LAN vom öffentlichen 200.0.0.0/24-Netz. Dahinter simuliert ein ISP-Router + INTERNET-Router das Kernnetz; ein Webserver (47.11.8.15) stellt das Internet dar. Gleiche Topologie wie Statisches NAT — nur der Übersetzungsmechanismus ist anders.",
      devices: [
        { type: "pc",     label: "PC0  (192.168.1.10/24)",  count: 1 },
        { type: "pc",     label: "PC0(1) (192.168.1.11/24)", count: 1 },
        { type: "pc",     label: "PC0(2) (192.168.1.12/24)", count: 1 },
        { type: "switch", label: "SW (Layer-2, kein Config)", count: 1 },
        { type: "router", label: "NAT-Router",               count: 1 },
        { type: "router", label: "ISP",                      count: 1 },
        { type: "router", label: "INTERNET",                 count: 1 },
        { type: "server", label: "Webserver (47.11.8.15/24)", count: 1 },
      ],
      connections: [
        "PC0 / PC0(1) / PC0(2) → SW  (192.168.1.0/24)",
        "SW Gig0/1 → NAT Gig0/0  (inside, 192.168.1.1/24)",
        "NAT Gig0/1 → ISP Gig0/1  (200.0.0.253 ↔ 200.0.0.254, /24)",
        "ISP Gig0/2 → INTERNET Gig0/2  (1.1.1.1 ↔ 1.1.1.2, /30)",
        "INTERNET Gig0/0 → Webserver Fa0  (47.11.8.1 ↔ 47.11.8.15, /24)",
        "NAT-Pool: 200.0.0.10 – 200.0.0.12 (3 öffentliche IPs, 1 pro PC)",
      ],
      hint: "Reihenfolge: 1) ACL = WER wird übersetzt, 2) ip nat inside/outside auf die Interfaces, 3) ip nat pool anlegen, 4) ip nat inside source list → pool verknüpfen. Danach Rückroute auf INTERNET-Router nicht vergessen.",
    },
    steps: [
      {
        title: "1) IP-Adressen auf allen Geräten vergeben",
        blocks: [
          {
            device: "PC0",
            mode: "desktop",
            modeLabel: "PC0 – IP-Konfiguration",
            commands: [
              {
                cmd: "IP:      192.168.1.10\nMaske:   255.255.255.0\nGateway: 192.168.1.1",
                explanation:
                  "Statische IP auf PC0. Gleiche Vorgehensweise für PC0(1) mit .11 und PC0(2) mit .12. Das Gateway zeigt auf den NAT-Router (inside-Interface).",
              },
            ],
          },
          {
            device: "NAT-Router",
            mode: "privileged",
            modeLabel: "Router>",
            commands: [
              { cmd: "enable\nconfigure terminal\nhostname NAT-Router\nno ip domain-lookup", explanation: "Üblicher Einstieg." },
            ],
          },
          {
            device: "NAT-Router",
            mode: "interface",
            modeLabel: "NAT-Router(config-if)#",
            commands: [
              {
                cmd: "interface GigabitEthernet0/0\n ip address 192.168.1.1 255.255.255.0\n ip nat inside\n no shutdown",
                explanation:
                  "'ip nat inside' markiert das LAN-Interface. Der Router übersetzt Source-IPs eingehender Pakete von hier gegen die NAT-Pool-Adressen.",
              },
              {
                cmd: "interface GigabitEthernet0/1\n ip address 200.0.0.253 255.255.255.0\n ip nat outside\n no shutdown",
                explanation:
                  "'ip nat outside' markiert das WAN-Interface. Übersetzte Pakete verlassen das Netz hier mit einer Adresse aus dem Pool.",
              },
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
            mode: "interface",
            modeLabel: "ISP(config-if)#",
            commands: [
              {
                cmd: "interface GigabitEthernet0/1\n ip address 200.0.0.254 255.255.255.0\n no shutdown\ninterface GigabitEthernet0/2\n ip address 1.1.1.1 255.255.255.252\n no shutdown",
                explanation:
                  "ISP verbindet NAT-Router (200.0.0.x) und INTERNET-Router (1.1.1.0/30). Identisch zum Static-NAT-Lab.",
              },
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
            mode: "interface",
            modeLabel: "INTERNET(config-if)#",
            commands: [
              {
                cmd: "interface GigabitEthernet0/2\n ip address 1.1.1.2 255.255.255.252\n no shutdown\ninterface GigabitEthernet0/0\n ip address 47.11.8.1 255.255.255.0\n no shutdown",
                explanation:
                  "INTERNET-Router: Transit (.2) und LAN-Seite zum Webserver (47.11.8.x/24).",
              },
            ],
          },
          {
            device: "Webserver",
            mode: "desktop",
            modeLabel: "Webserver – IP-Konfiguration",
            commands: [
              {
                cmd: "IP:      47.11.8.15\nMaske:   255.255.255.0\nGateway: 47.11.8.1",
                explanation:
                  "Webserver mit statischer öffentlicher IP. Gateway zeigt auf den INTERNET-Router.",
              },
            ],
          },
        ],
      },
      {
        title: "2) ACL definieren — welche Hosts übersetzt werden",
        blocks: [
          {
            device: "NAT-Router",
            mode: "global",
            modeLabel: "NAT(config)#",
            commands: [
              {
                cmd: "access-list 1 permit 192.168.1.0 0.0.0.255",
                explanation:
                  "Standard-ACL 1 erlaubt das gesamte LAN-Subnetz (Wildcard 0.0.0.255 = alle 256 Adressen in .0/24). Nur Hosts, die dieser ACL entsprechen, werden von Dynamic NAT übersetzt. Alles andere bleibt unverändert.",
              },
            ],
          },
        ],
      },
      {
        title: "3) NAT-Pool anlegen",
        blocks: [
          {
            device: "NAT-Router",
            mode: "global",
            modeLabel: "NAT(config)#",
            commands: [
              {
                cmd: "ip nat pool PUBLIC-POOL 200.0.0.10 200.0.0.12 netmask 255.255.255.0",
                explanation:
                  "Definiert den Vorrat öffentlicher Adressen:\n  Name:     PUBLIC-POOL\n  Start-IP: 200.0.0.10\n  End-IP:   200.0.0.12\n  Maske:    255.255.255.0 (gleiche Maske wie das outside-Interface)\n3 IPs für 3 PCs — genau so viele wie im LAN. Verbindet sich ein 4. Host bevor ein Eintrag ausläuft, wird seine Verbindung verworfen (Pool leer).",
              },
            ],
          },
        ],
      },
      {
        title: "4) ACL mit Pool verknüpfen (NAT aktivieren)",
        blocks: [
          {
            device: "NAT-Router",
            mode: "global",
            modeLabel: "NAT(config)#",
            commands: [
              {
                cmd: "ip nat inside source list 1 pool PUBLIC-POOL",
                explanation:
                  "Der Schlüsselbefehl: 'list 1' = Quelle muss ACL 1 treffen, 'pool PUBLIC-POOL' = Zieladresse aus dem Pool.\nOHNE 'overload': reines Dynamic NAT — jeder Host bekommt eine eigene Pool-IP (1:1).\nMIT 'overload': Dynamic NAT + PAT — mehrere Hosts teilen eine Pool-IP per Port-Multiplexierung.\nFür dieses Lab: kein overload — Pool hat genau 3 IPs für 3 PCs.",
              },
            ],
          },
        ],
      },
      {
        title: "5) Default-Route + Rückrouten konfigurieren",
        blocks: [
          {
            device: "NAT-Router",
            mode: "global",
            modeLabel: "NAT(config)#",
            commands: [
              {
                cmd: "ip route 0.0.0.0 0.0.0.0 200.0.0.254",
                explanation:
                  "Default-Route zum ISP. Nach der NAT-Übersetzung verlässt das Paket Gig0/1 mit einer Adresse aus 200.0.0.10–.12.",
              },
              {
                cmd: "end\ncopy running-config startup-config",
                explanation: "Speichern.",
              },
            ],
          },
          {
            device: "ISP",
            mode: "global",
            modeLabel: "ISP(config)#",
            commands: [
              {
                cmd: "ip route 0.0.0.0 0.0.0.0 1.1.1.2",
                explanation:
                  "ISP-Default-Route Richtung INTERNET. Antwortpakete des Webservers (Ziel: 200.0.0.x) werden so korrekt weitergeleitet.",
              },
              {
                cmd: "end\ncopy running-config startup-config",
                explanation: "Speichern.",
              },
            ],
          },
          {
            device: "INTERNET",
            mode: "global",
            modeLabel: "INTERNET(config)#",
            commands: [
              {
                cmd: "ip route 200.0.0.0 255.255.255.0 1.1.1.1",
                explanation:
                  "Kritische Rückroute! Der INTERNET-Router muss wissen, dass 200.0.0.0/24 (inklusive Pool-IPs .10–.12) über den ISP erreichbar ist. Ohne diese Route werden Antwortpakete verworfen.",
              },
              {
                cmd: "end\ncopy running-config startup-config",
                explanation: "Speichern.",
              },
            ],
          },
        ],
      },
      {
        title: "6) Konnektivität testen & Pool-Verhalten beobachten",
        blocks: [
          {
            device: "PC0",
            mode: "desktop",
            modeLabel: "Desktop > Command Prompt",
            commands: [
              {
                cmd: "ping 47.11.8.15",
                explanation:
                  "PC0 (192.168.1.10) bekommt bei der ersten Verbindung eine freie Pool-IP (z. B. 200.0.0.10) dynamisch zugewiesen. Wenn PC0(1) und PC0(2) gleichzeitig pingen, belegen sie .11 und .12 — der Pool ist erschöpft. Nachfolgende Hosts erhalten: 'Translation failed' bis ein Eintrag abläuft.",
              },
            ],
          },
          {
            device: "NAT-Router",
            mode: "privileged",
            modeLabel: "NAT#",
            commands: [
              {
                cmd: "show ip nat translations",
                explanation:
                  "Zeigt AKTIVE Einträge (nur solange Verbindungen offen):\n  icmp 192.168.1.10:x  200.0.0.10:x  47.11.8.15:x  47.11.8.15:x\nUnterschied zu Static NAT: Nach Ablauf des Timeouts verschwinden die Einträge — kein dauerhafter Eintrag wie 'Pro --- 192.168.1.10  200.0.0.10  ---  ---'.",
              },
              {
                cmd: "show ip nat statistics",
                explanation:
                  "Zeigt Pool-Auslastung:\n  Pool PUBLIC-POOL: 3 addresses, X allocated, Y misses\n'misses' steigt, wenn ein Host übersetzt werden soll aber der Pool leer ist. Das ist die klare Abgrenzung zu PAT: bei PAT gibt es keine Pool-Erschöpfung.",
              },
              {
                cmd: "clear ip nat translation *",
                explanation:
                  "Löscht alle dynamischen NAT-Einträge manuell. Nützlich zum Testen der Pool-Erschöpfung: nach 'clear' stehen wieder alle 3 Pool-IPs zur Verfügung.",
              },
            ],
          },
        ],
      },
      {
        title: "7) Eingehende Verbindung testen (Unterschied zu Static NAT)",
        blocks: [
          {
            device: "PC0",
            mode: "desktop",
            modeLabel: "Desktop > Command Prompt",
            commands: [
              {
                cmd: "ping 47.11.8.15",
                explanation:
                  "Schritt 1 — erst einen NAT-Eintrag erzeugen: PC0 pingt den Webserver. Dadurch weist der Router die Pool-IP 200.0.0.10 zu und schreibt den Eintrag in die NAT-Tabelle. Dieser Eintrag lebt standardmäßig für ~60 s (ICMP-Timeout).",
              },
            ],
          },
          {
            device: "NAT-Router",
            mode: "privileged",
            modeLabel: "NAT#",
            commands: [
              {
                cmd: "show ip nat translations",
                explanation:
                  "Bestätigt den aktiven Eintrag:\n  icmp 192.168.1.10:x  200.0.0.10:x  47.11.8.15:x  ...\nSolange dieser Eintrag existiert, kennt der Router die Zuordnung 200.0.0.10 → 192.168.1.10.",
              },
            ],
          },
          {
            device: "Webserver",
            mode: "desktop",
            modeLabel: "Desktop > Command Prompt",
            commands: [
              {
                cmd: "ping 200.0.0.10",
                explanation:
                  "Schritt 2 — SOFORT nach dem PC0-Ping vom Webserver aus versuchen (Eintrag noch aktiv):\n  ✓ Funktioniert: Der NAT-Router findet den Eintrag 200.0.0.10 → 192.168.1.10 und leitet weiter.\n  ✗ Scheitert, wenn der Eintrag abgelaufen ist oder PC0 nie gepingt hat.\n\nUnterschied zu Static NAT:\n  Static NAT: Eintrag ist permanent — Webserver kann jederzeit 200.0.0.10 erreichen.\n  Dynamic NAT: Eintrag existiert nur während aktiver Verbindung — eingehende Verbindungen nur im Zeitfenster nach einem ausgehenden Paket von PC0.",
              },
            ],
          },
        ],
      },
      {
        title: "Typische Fehler bei Dynamic NAT",
        blocks: [
          {
            device: "Merke",
            mode: "info",
            modeLabel: "Häufige Fehler",
            commands: [
              { cmd: "Pool zu klein für die Anzahl Hosts", explanation: "Sind mehr Hosts gleichzeitig aktiv als Pool-IPs vorhanden, scheitern weitere Verbindungen mit 'Translation failed' — show ip nat statistics zeigt steigende misses." },
              { cmd: "Netmask im Pool passt nicht zum outside-Interface", explanation: "Eine falsche Maske im ip nat pool-Befehl kann dazu führen, dass Pool-Adressen als ungültig für das Segment behandelt werden." },
              { cmd: "overload versehentlich mit angegeben", explanation: "Mit overload würden sich alle Hosts EINE Pool-Adresse teilen (PAT) statt je eine eigene zu bekommen — das widerspricht dem Sinn von reinem Dynamic NAT in diesem Lab." },
              { cmd: "Rückroute für das gesamte Pool-Subnetz vergessen", explanation: "Die Route auf dem INTERNET-Router muss das GESAMTE Pool-Netz abdecken (hier 200.0.0.0/24), nicht nur eine einzelne Pool-Adresse." },
            ],
          },
        ],
      },
    ],
    verifyCommands: [
      { cmd: "show ip nat translations", expected: "Einträge erscheinen NUR nach aktivem Traffic — kein permanenter 'Pro ---'-Eintrag wie bei Static NAT" },
      { cmd: "show ip nat statistics", expected: "Pool PUBLIC-POOL: 3 addresses, mind. 1 allocated nach Ping" },
      { cmd: "ping 47.11.8.15 (von PC0)", expected: "Erfolgreich — 192.168.1.10 → 200.0.0.10 (erste freie Pool-IP)" },
      { cmd: "ping 200.0.0.10 (vom Webserver, sofort nach PC0-Ping)", expected: "Erfolgreich NUR wenn NAT-Eintrag noch aktiv; ohne aktiven Eintrag: Fehlschlag" },
      { cmd: "show ip nat statistics (bei leerem Pool)", expected: "misses erhöhen sich wenn 4. Host versucht zu verbinden" },
    ],
    glossary: [
      { term: "Dynamic NAT",     def: "Hosts bekommen bei Bedarf eine IP aus einem Pool — 1:1, erste Verbindung gewinnt. Kein dauerhafter Eintrag." },
      { term: "NAT-Pool",        def: "Vorrat routbarer öffentlicher Adressen: ip nat pool NAME start end netmask M." },
      { term: "Inside Local",    def: "Die private Quelladresse vor der Übersetzung (z. B. 192.168.1.10)." },
      { term: "Inside Global",   def: "Die dynamisch zugewiesene Pool-Adresse nach der Übersetzung (z. B. 200.0.0.10)." },
      { term: "Pool-Erschöpfung", def: "Wenn alle Pool-IPs belegt sind, werden neue Verbindungen verworfen bis ein Eintrag abläuft." },
      { term: "overload",        def: "Schlüsselwort für PAT: mehrere Hosts teilen eine IP via Ports. OHNE overload = reines 1:1 Dynamic NAT." },
      { term: "clear ip nat translation *", def: "Löscht alle dynamischen NAT-Einträge sofort — statische Einträge bleiben." },
      { term: "Static vs. Dynamic", def: "Static: dauerhafter Eintrag, eingehende Verbindungen immer möglich. Dynamic: Eintrag nur während aktiver Session, eingehende Verbindungen nur im Zeitfenster." },
      { term: "Rückroute (INTERNET)", def: "Der INTERNET-Router muss 200.0.0.0/24 über ISP kennen — sonst werden Antwortpakete verworfen." },
    ],
  },

  // ─────────────────────────────────────────────────────────────
  // Dynamic NAT Pool + Overload
  // Topologie: PC0/PC0(1)/PC0(2) → SW → NAT → ISP → INTERNET → Webserver
  // WAN: 200.0.0.0/29 (NAT=.5, ISP=.6), Pool: 200.0.0.1–200.0.0.4
  // ─────────────────────────────────────────────────────────────
  {
    id: "nat-pool-overload",
    icon: <Globe size={20} />,
    title: "Dynamic NAT — Pool + Overload",
    subtitle: "3 PCs · SW · NAT-Router · ISP · INTERNET · Webserver · /29-Pool",
    difficulty: "Mittel",
    duration: "35 min",
    context: {
      problem:
        "Weder reines PAT (eine einzige öffentliche IP) noch reines Dynamic NAT (Pool der sich erschöpft) passen: Es sollen mehrere öffentliche IPs zur Verfügung stehen UND beliebig viele interne Hosts bedient werden können.",
      purpose:
        "Pool + Overload kombiniert beides: Ein Pool verteilt die Last auf mehrere öffentliche IPs, und 'overload' aktiviert zusätzlich PAT je Pool-Adresse — so können beliebig viele Hosts gleichzeitig ins Internet. Das ist die skalierbarste NAT-Variante.",
    },
    topology: {
      description:
        "Drei PCs im LAN 192.168.1.0/24, SW1, NAT-Router. WAN-Strecke zum ISP: 200.0.0.0/29 (/29 = 255.255.255.248 = 6 nutzbare Adressen). NAT-Router hat .5, ISP hat .6. Pool: 200.0.0.1–200.0.0.4 (4 IPs aus demselben /29). Hinter dem ISP: INTERNET-Router (1.1.1.0/30) → Webserver (47.11.8.0/24).",
      devices: [
        { type: "pc",     label: "PC0 (192.168.1.10/24)",    count: 1 },
        { type: "pc",     label: "PC0(1) (192.168.1.11/24)", count: 1 },
        { type: "pc",     label: "PC0(2) (192.168.1.12/24)", count: 1 },
        { type: "switch", label: "SW1 (Fa0/1–3, Gig0/1)",    count: 1 },
        { type: "router", label: "NAT-Router (Gig0/0 inside, Gig0/1=200.0.0.5 outside)", count: 1 },
        { type: "router", label: "ISP (Gig0/2=200.0.0.6, Gig0/1=1.1.1.1)",  count: 1 },
        { type: "router", label: "INTERNET (Gig0/2=1.1.1.2, Gi0/0=47.11.8.1)", count: 1 },
        { type: "server", label: "Webserver (47.11.8.15/24)", count: 1 },
      ],
      connections: [
        "PC0/PC0(1)/PC0(2) → SW1 → NAT Gig0/0  (192.168.1.0/24)",
        "NAT Gig0/1 (200.0.0.5) ↔ ISP Gig0/2 (200.0.0.6)  — 200.0.0.0/29",
        "ISP Gig0/1 (1.1.1.1) ↔ INTERNET Gig0/2 (1.1.1.2)  — 1.1.1.0/30",
        "INTERNET Gi0/0 (47.11.8.1) ↔ Webserver Fa0 (47.11.8.15)  — 47.11.8.0/24",
        "NAT-Pool DYNAMIC-POOL: 200.0.0.1 – 200.0.0.4 /29 (4 IPs aus dem WAN-Subnetz)",
      ],
      hint: "/29 hat 6 nutzbare Adressen: .1–.6. .5 = NAT-Router, .6 = ISP. .1–.4 stehen als Pool zur Verfügung. Die INTERNET-Rückroute muss das gesamte /29 (200.0.0.0/29) abdecken — nicht nur die Interface-IPs.",
    },
    steps: [
      {
        title: "1) IP-Adressen auf allen Geräten vergeben",
        blocks: [
          {
            device: "PC0",
            mode: "desktop",
            modeLabel: "PC0 – IP-Konfiguration",
            commands: [
              {
                cmd: "IP:      192.168.1.10\nMaske:   255.255.255.0\nGateway: 192.168.1.1",
                explanation:
                  "Gleiche Vorgehensweise für PC0(1) mit .11 und PC0(2) mit .12.",
              },
            ],
          },
          {
            device: "NAT-Router",
            mode: "privileged",
            modeLabel: "Router>",
            commands: [
              { cmd: "enable\nconfigure terminal\nhostname NAT-Router\nno ip domain-lookup", explanation: "Üblicher Einstieg." },
            ],
          },
          {
            device: "NAT-Router",
            mode: "interface",
            modeLabel: "NAT-Router(config-if)#",
            commands: [
              {
                cmd: "interface GigabitEthernet0/0\n ip address 192.168.1.1 255.255.255.0\n no shutdown",
                explanation: "LAN-Interface. Gateway für alle drei PCs.",
              },
              {
                cmd: "interface GigabitEthernet0/1\n ip address 200.0.0.5 255.255.255.248\n no shutdown",
                explanation:
                  "WAN-Interface im /29-Subnetz (255.255.255.248). .5 = NAT-Router, .6 = ISP — die Pool-IPs .1–.4 liegen im selben Subnetz und sind trotzdem routbar, weil der NAT-Router via Proxy-ARP für sie antwortet.",
              },
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
            mode: "interface",
            modeLabel: "ISP(config-if)#",
            commands: [
              {
                cmd: "interface GigabitEthernet0/2\n ip address 200.0.0.6 255.255.255.248\n no shutdown",
                explanation: "ISP-Anschluss des NAT-Routers (.6 im /29).",
              },
              {
                cmd: "interface GigabitEthernet0/1\n ip address 1.1.1.1 255.255.255.252\n no shutdown",
                explanation: "Transit zum INTERNET-Router (1.1.1.0/30).",
              },
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
            mode: "interface",
            modeLabel: "INTERNET(config-if)#",
            commands: [
              {
                cmd: "interface GigabitEthernet0/2\n ip address 1.1.1.2 255.255.255.252\n no shutdown",
                explanation: "Transit-Interface Richtung ISP (.2 im /30).",
              },
              {
                cmd: "interface GigabitEthernet0/0\n ip address 47.11.8.1 255.255.255.0\n no shutdown",
                explanation: "Interface zum Webserver-Segment.",
              },
            ],
          },
          {
            device: "Webserver",
            mode: "desktop",
            modeLabel: "Webserver – IP-Konfiguration",
            commands: [
              {
                cmd: "IP:      47.11.8.15\nMaske:   255.255.255.0\nGateway: 47.11.8.1",
                explanation: "Gateway = INTERNET-Router Gi0/0.",
              },
            ],
          },
        ],
      },
      {
        title: "2) NAT inside / outside auf Interfaces setzen",
        blocks: [
          {
            device: "NAT-Router",
            mode: "interface",
            modeLabel: "NAT(config-if)#",
            commands: [
              {
                cmd: "interface GigabitEthernet0/0\n ip nat inside",
                explanation: "LAN-Seite = inside. Pakete von hier werden gegen die NAT-Regeln übersetzt.",
              },
              {
                cmd: "interface GigabitEthernet0/1\n ip nat outside",
                explanation: "WAN-Seite = outside. Übersetzte Pakete verlassen hier das Netz.",
              },
            ],
          },
        ],
      },
      {
        title: "3) ACL — welche Hosts übersetzt werden",
        blocks: [
          {
            device: "NAT-Router",
            mode: "global",
            modeLabel: "NAT(config)#",
            commands: [
              {
                cmd: "access-list 1 permit 192.168.1.0 0.0.0.255",
                explanation:
                  "Alle Hosts im 192.168.1.0/24 sollen NAT bekommen. Wildcard 0.0.0.255 = alle 256 Adressen im Subnetz.",
              },
            ],
          },
        ],
      },
      {
        title: "4) NAT-Pool anlegen",
        blocks: [
          {
            device: "NAT-Router",
            mode: "global",
            modeLabel: "NAT(config)#",
            commands: [
              {
                cmd: "ip nat pool DYNAMIC-POOL 200.0.0.1 200.0.0.4 netmask 255.255.255.248",
                explanation:
                  "Pool mit 4 öffentlichen IPs (.1, .2, .3, .4) aus dem /29-Subnetz.\nMaske: 255.255.255.248 muss mit der Subnetzmaske des Pools übereinstimmen.\n.5 (NAT Outside-IP) und .6 (ISP) bleiben ausgespart — sie sind bereits belegt.",
              },
            ],
          },
        ],
      },
      {
        title: "5) Pool + Overload aktivieren (der Schlüsselbefehl)",
        blocks: [
          {
            device: "NAT-Router",
            mode: "global",
            modeLabel: "NAT(config)#",
            commands: [
              {
                cmd: "ip nat inside source list 1 pool DYNAMIC-POOL overload",
                explanation:
                  "Drei Teile:\n  'list 1'              → Quelle muss ACL 1 treffen\n  'pool DYNAMIC-POOL'   → öffentliche Adresse aus dem Pool (.1–.4)\n  'overload'            → PAT pro Pool-IP aktivieren\n\nVergleich der drei NAT-Varianten:\n  PAT (interface overload):  1 IP  × viele Ports → unbegrenzt Hosts, eine IP\n  Dynamic NAT (pool):        4 IPs × 1:1         → max. 4 gleichzeitige Hosts\n  Pool + Overload (dieses Lab): 4 IPs × viele Ports → unbegrenzt Hosts, Last über 4 IPs verteilt",
              },
            ],
          },
        ],
      },
      {
        title: "6) Default-Route + Rückrouten konfigurieren",
        blocks: [
          {
            device: "NAT-Router",
            mode: "global",
            modeLabel: "NAT(config)#",
            commands: [
              {
                cmd: "ip route 0.0.0.0 0.0.0.0 200.0.0.6",
                explanation: "Default-Route zum ISP (.6 = ISP Gig0/2).",
              },
              {
                cmd: "end\ncopy running-config startup-config",
                explanation: "Speichern.",
              },
            ],
          },
          {
            device: "ISP",
            mode: "global",
            modeLabel: "ISP(config)#",
            commands: [
              {
                cmd: "ip route 0.0.0.0 0.0.0.0 1.1.1.2",
                explanation: "Default-Route zum INTERNET-Router.",
              },
              {
                cmd: "end\ncopy running-config startup-config",
                explanation: "Speichern.",
              },
            ],
          },
          {
            device: "INTERNET",
            mode: "global",
            modeLabel: "INTERNET(config)#",
            commands: [
              {
                cmd: "ip route 200.0.0.0 255.255.255.248 1.1.1.1",
                explanation:
                  "Rückroute für das gesamte /29 (200.0.0.0–200.0.0.7) → ISP (.1). Deckt sowohl die Pool-IPs (.1–.4) als auch die NAT-Outside-IP (.5) ab. Ohne diese Route kommen Antwortpakete nicht zurück.",
              },
              {
                cmd: "end\ncopy running-config startup-config",
                explanation: "Speichern.",
              },
            ],
          },
        ],
      },
      {
        title: "7) Konnektivität testen & Pool-Verteilung beobachten",
        blocks: [
          {
            device: "PC0",
            mode: "desktop",
            modeLabel: "Desktop > Command Prompt",
            commands: [
              {
                cmd: "ping 47.11.8.15",
                explanation:
                  "PC0 bekommt eine IP aus dem Pool zugewiesen (z. B. 200.0.0.1) plus eine Port-Nummer. PC0(1) und PC0(2) können ebenfalls pingen — sie erhalten entweder dieselbe Pool-IP mit anderem Port oder die nächste Pool-IP.",
              },
            ],
          },
          {
            device: "NAT-Router",
            mode: "privileged",
            modeLabel: "NAT#",
            commands: [
              {
                cmd: "show ip nat translations",
                explanation:
                  "Zeigt Einträge mit Pool-IPs als Inside Global:\n  icmp 192.168.1.10:1  200.0.0.1:1  47.11.8.15:1  47.11.8.15:1\n  icmp 192.168.1.11:1  200.0.0.1:2  47.11.8.15:1  47.11.8.15:1\nAlle Hosts teilen sich eine Pool-IP (wegen overload). Erst wenn die erste Pool-IP zu viele Verbindungen hat, nimmt der Router die nächste (.2, .3, .4).",
              },
              {
                cmd: "show ip nat statistics",
                explanation:
                  "Zeigt Pool-Auslastung:\n  Pool DYNAMIC-POOL: 4 addresses, X allocated\n'allocated' zeigt, wie viele Pool-IPs gerade aktiv genutzt werden.",
              },
            ],
          },
        ],
      },
      {
        title: "Typische Fehler bei Pool + Overload",
        blocks: [
          {
            device: "Merke",
            mode: "info",
            modeLabel: "Häufige Fehler",
            commands: [
              { cmd: "overload beim ip nat inside source-Befehl vergessen", explanation: "Ohne overload verhält sich der Befehl wie reines Dynamic NAT — der Pool erschöpft sich schon bei 4 gleichzeitigen Hosts statt beliebig viele zu bedienen." },
              { cmd: "Pool-Bereich überschneidet sich mit Interface-IPs", explanation: "Der Pool darf NICHT die bereits vergebenen Adressen .5 (NAT) und .6 (ISP) enthalten — sonst entstehen IP-Konflikte." },
              { cmd: "Netmask im Pool falsch (z. B. /24 statt /29)", explanation: "Die Pool-Maske muss zur tatsächlichen Subnetzgröße des WAN-Segments passen — sonst werden Pool-Adressen als in einem anderen Netz liegend behandelt." },
              { cmd: "Rückroute nur für eine einzelne Pool-IP statt das ganze /29", explanation: "Die Route auf dem INTERNET-Router muss 200.0.0.0/29 als Ganzes abdecken — eine Route nur für .1 lässt Antworten für .2–.4 verwerfen." },
            ],
          },
        ],
      },
    ],
    verifyCommands: [
      { cmd: "ping 47.11.8.15 (von PC0/PC0(1)/PC0(2))", expected: "Alle drei erfolgreich — Inside Global aus 200.0.0.1–200.0.0.4" },
      { cmd: "show ip nat translations", expected: "Pool-IPs (.1–.4) als Inside Global mit unterschiedlichen Ports" },
      { cmd: "show ip nat statistics", expected: "Pool DYNAMIC-POOL: 4 addresses, mind. 1 allocated" },
      { cmd: "show ip nat statistics", expected: "Hits steigen pro Paket; misses = 0 bei korrekter Konfiguration" },
    ],
    glossary: [
      { term: "Pool + Overload",    def: "Kombination: mehrere öffentliche IPs (Pool) + PAT pro IP (Overload) — unbegrenzt skalierbar." },
      { term: "NAT-Pool",           def: "Vorrat öffentlicher IPs: ip nat pool NAME start end netmask M." },
      { term: "overload",           def: "Aktiviert PAT je Pool-IP: viele Hosts teilen eine IP per Port." },
      { term: "/29 (255.255.255.248)", def: "8 Adressen, 6 nutzbar. Ideal für WAN-Strecken mit kleinem Pool." },
      { term: "Inside Local",       def: "Private Host-IP (192.168.1.x) vor der Übersetzung." },
      { term: "Inside Global",      def: "Pool-IP (200.0.0.1–.4) nach der Übersetzung — sichtbar im Internet." },
      { term: "Proxy ARP",          def: "Der NAT-Router antwortet auf ARP-Anfragen für Pool-IPs mit seiner eigenen MAC — so werden die Pool-IPs über sein Interface routbar, obwohl sie nicht direkt konfiguriert sind." },
      { term: "Rückroute /29",      def: "INTERNET-Router braucht Route 200.0.0.0/255.255.255.248 → ISP — deckt Pool + Outside-Interface ab." },
    ],
  },

  // ─────────────────────────────────────────────────────────────
  // Statisches NAT — 1:1-Adresszuordnung (Packet-Tracer-Topologie)
  // Topologie: PC0/PC0(1)/PC0(2) → SW → NAT → ISP → INTERNET → Webserver
  // ─────────────────────────────────────────────────────────────
  {
    id: "static-nat",
    icon: <Globe size={20} />,
    title: "Statisches NAT",
    subtitle: "3 PCs · SW · NAT-Router · ISP · INTERNET · Webserver",
    difficulty: "Mittel",
    duration: "35 min",
    context: {
      problem:
        "Ein Server im LAN (z. B. ein Webserver oder RDP-Host) muss permanent unter einer festen öffentlichen IP erreichbar sein — PAT und Dynamic NAT vergeben Adressen zufällig oder nur für ausgehende Verbindungen.",
      purpose:
        "Statisches NAT legt eine unveränderliche 1:1-Zuordnung zwischen einer privaten (Inside Local) und einer öffentlichen (Inside Global) Adresse fest. Der Eintrag existiert dauerhaft in der NAT-Tabelle — auch ohne aktive Verbindung. Damit sind eingehende Verbindungen von außen möglich, was bei PAT nicht geht.",
    },
    topology: {
      description:
        "Drei PCs hängen an einem Switch im Netz 192.168.1.0/24. Der NAT-Router trennt das private LAN vom öffentlichen 200.0.0.0/24-Netz. Dahinter simuliert ein ISP-Router + INTERNET-Router das Kernnetz; ein Webserver (47.11.8.15) stellt das Internet dar.",
      devices: [
        { type: "pc",     label: "PC0  (192.168.1.10/24)",  count: 1 },
        { type: "pc",     label: "PC0(1) (192.168.1.11/24)", count: 1 },
        { type: "pc",     label: "PC0(2) (192.168.1.12/24)", count: 1 },
        { type: "switch", label: "SW (Layer-2, kein Config)", count: 1 },
        { type: "router", label: "NAT-Router",               count: 1 },
        { type: "router", label: "ISP",                      count: 1 },
        { type: "router", label: "INTERNET",                 count: 1 },
        { type: "server", label: "Webserver (47.11.8.15/24)", count: 1 },
      ],
      connections: [
        "PC0 / PC0(1) / PC0(2) → SW  (192.168.1.0/24)",
        "SW Gig0/1 → NAT Gig0/0  (inside, 192.168.1.1/24)",
        "NAT Gig0/1 → ISP Gig0/1  (200.0.0.253 ↔ 200.0.0.254, /24)",
        "ISP Gig0/2 → INTERNET Gig0/2  (1.1.1.1 ↔ 1.1.1.2, /30)",
        "INTERNET Gig0/0 → Webserver Fa0  (47.11.8.1 ↔ 47.11.8.15, /24)",
      ],
      hint: "NAT Gig0/0 = ip nat inside (LAN), NAT Gig0/1 = ip nat outside (WAN). Die öffentlichen IPs 200.0.0.10–.12 müssen im ISP-Kernnetz routbar sein — der INTERNET-Router braucht eine Rückroute.",
    },
    steps: [
      {
        title: "1) IP-Adressen auf allen Geräten vergeben",
        blocks: [
          {
            device: "PC0",
            mode: "desktop",
            modeLabel: "PC0 – IP-Konfiguration",
            commands: [
              {
                cmd: "IP:      192.168.1.10\nMaske:   255.255.255.0\nGateway: 192.168.1.1",
                explanation:
                  "Statische IP-Konfiguration auf PC0. Gateway zeigt auf den NAT-Router (inside-Interface). Gleiche Vorgehensweise für PC0(1) mit .11 und PC0(2) mit .12.",
              },
            ],
          },
          {
            device: "NAT-Router",
            mode: "privileged",
            modeLabel: "Router>",
            commands: [
              { cmd: "enable\nconfigure terminal\nhostname NAT-Router\nno ip domain-lookup", explanation: "Üblicher Einstieg." },
            ],
          },
          {
            device: "NAT-Router",
            mode: "interface",
            modeLabel: "NAT-Router(config-if)#",
            commands: [
              {
                cmd: "interface GigabitEthernet0/0\n ip address 192.168.1.1 255.255.255.0\n ip nat inside\n no shutdown",
                explanation:
                  "LAN-seitiges Interface — 'ip nat inside' markiert es als die vertrauenswürdige Seite. Pakete, die hier ankommen, werden gegen die statische NAT-Tabelle geprüft.",
              },
              {
                cmd: "interface GigabitEthernet0/1\n ip address 200.0.0.253 255.255.255.0\n ip nat outside\n no shutdown",
                explanation:
                  "'ip nat outside' markiert das WAN-Interface. Übersetzte Pakete verlassen das Netz hier mit der öffentlichen Inside-Global-Adresse.",
              },
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
            mode: "interface",
            modeLabel: "ISP(config-if)#",
            commands: [
              {
                cmd: "interface GigabitEthernet0/1\n ip address 200.0.0.254 255.255.255.0\n no shutdown\ninterface GigabitEthernet0/2\n ip address 1.1.1.1 255.255.255.252\n no shutdown",
                explanation:
                  "ISP verbindet NAT-Router (Gi0/1, 200.0.0.x) und INTERNET-Router (Gi0/2, 1.1.1.0/30). /30 auf dem Transit-Link = 2 nutzbare Adressen, ideale P2P-Strecke.",
              },
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
            mode: "interface",
            modeLabel: "INTERNET(config-if)#",
            commands: [
              {
                cmd: "interface GigabitEthernet0/2\n ip address 1.1.1.2 255.255.255.252\n no shutdown\ninterface GigabitEthernet0/0\n ip address 47.11.8.1 255.255.255.0\n no shutdown",
                explanation:
                  "INTERNET-Router: Transit-Seite zum ISP (.2 im /30) und LAN-Seite zum Webserver (47.11.8.x/24).",
              },
            ],
          },
          {
            device: "Webserver",
            mode: "desktop",
            modeLabel: "Webserver – IP-Konfiguration",
            commands: [
              {
                cmd: "IP:      47.11.8.15\nMaske:   255.255.255.0\nGateway: 47.11.8.1",
                explanation:
                  "Der Webserver braucht eine statische öffentliche IP. Gateway zeigt auf den INTERNET-Router.",
              },
            ],
          },
        ],
      },
      {
        title: "2) Statische NAT-Einträge anlegen",
        blocks: [
          {
            device: "NAT-Router",
            mode: "global",
            modeLabel: "NAT(config)#",
            commands: [
              {
                cmd: "ip nat inside source static 192.168.1.10 200.0.0.10\nip nat inside source static 192.168.1.11 200.0.0.11\nip nat inside source static 192.168.1.12 200.0.0.12",
                explanation:
                  "Jeder Befehl legt eine permanente 1:1-Zuordnung an:\n  Inside Local  →  Inside Global\n  192.168.1.10  →  200.0.0.10\n  192.168.1.11  →  200.0.0.11\n  192.168.1.12  →  200.0.0.12\nDieser Eintrag existiert immer in der NAT-Tabelle — unabhängig davon, ob der Host gerade kommuniziert. Eingehende Verbindungen an 200.0.0.10 landen direkt auf PC0.",
              },
            ],
          },
        ],
      },
      {
        title: "3) Default-Route + Rückrouten konfigurieren",
        blocks: [
          {
            device: "NAT-Router",
            mode: "global",
            modeLabel: "NAT(config)#",
            commands: [
              {
                cmd: "ip route 0.0.0.0 0.0.0.0 200.0.0.254",
                explanation:
                  "Default-Route: Alles, was der NAT-Router nicht kennt, schickt er zum ISP (.254). Nach der Übersetzung verlässt das Paket das Netz über Gi0/1 mit der Inside-Global-Adresse.",
              },
              {
                cmd: "end\ncopy running-config startup-config",
                explanation: "Speichern.",
              },
            ],
          },
          {
            device: "ISP",
            mode: "global",
            modeLabel: "ISP(config)#",
            commands: [
              {
                cmd: "ip route 0.0.0.0 0.0.0.0 1.1.1.2",
                explanation:
                  "ISP-Default-Route zum INTERNET-Router. Antwortpakete vom Webserver (Ziel: 200.0.0.x) kommen über diesen Weg zurück.",
              },
              {
                cmd: "end\ncopy running-config startup-config",
                explanation: "Speichern.",
              },
            ],
          },
          {
            device: "INTERNET",
            mode: "global",
            modeLabel: "INTERNET(config)#",
            commands: [
              {
                cmd: "ip route 200.0.0.0 255.255.255.0 1.1.1.1",
                explanation:
                  "Kritische Rückroute! Der INTERNET-Router muss wissen, dass 200.0.0.0/24 über den ISP (.1) erreichbar ist — sonst wirft er Antwortpakete weg (Inside-Global-Adressen sind nicht direkt verbunden).",
              },
              {
                cmd: "end\ncopy running-config startup-config",
                explanation: "Speichern.",
              },
            ],
          },
        ],
      },
      {
        title: "4) Konnektivität testen",
        blocks: [
          {
            device: "PC0",
            mode: "desktop",
            modeLabel: "Desktop > Command Prompt",
            commands: [
              {
                cmd: "ping 47.11.8.15",
                explanation:
                  "PC0 (192.168.1.10) sendet ICMP. Der NAT-Router übersetzt die Quelle auf 200.0.0.10 (Inside Global) und leitet weiter. Webserver antwortet an 200.0.0.10, NAT übersetzt zurück auf 192.168.1.10.",
              },
            ],
          },
          {
            device: "NAT-Router",
            mode: "privileged",
            modeLabel: "NAT#",
            commands: [
              {
                cmd: "show ip nat translations",
                explanation:
                  "Zeigt drei dauerhafte Einträge (auch ohne Ping):\n  Pro --- 192.168.1.10  200.0.0.10  ---  ---\nNach einem Ping kommen ICMP-Einträge mit Timestamps hinzu:\n  icmp 192.168.1.10:x  200.0.0.10:x  47.11.8.15:x  47.11.8.15:x\nGenau dieser Unterschied zu Dynamic NAT / PAT ist Prüfungsinhalt!",
              },
              {
                cmd: "show ip nat statistics",
                explanation:
                  "Zeigt: Translations total, inside/outside Interfaces, Hits und Misses. Bei statischem NAT: 'static mappings' immer > 0. Misses deuten auf fehlende ip nat inside/outside-Markierung hin.",
              },
              {
                cmd: "debug ip nat",
                explanation:
                  "Zeigt jede Übersetzung in Echtzeit:\n  NAT: s=192.168.1.10->200.0.0.10, d=47.11.8.15\nZum Beenden: 'undebug all'. Nur in Lab-Umgebungen verwenden — produktiv zu laut.",
              },
            ],
          },
        ],
      },
      {
        title: "5) Eingehende Verbindung testen (Besonderheit Static NAT)",
        blocks: [
          {
            device: "Webserver",
            mode: "desktop",
            modeLabel: "Desktop > Command Prompt",
            commands: [
              {
                cmd: "ping 200.0.0.10",
                explanation:
                  "Der Webserver initiiert eine Verbindung an die öffentliche IP 200.0.0.10. Der NAT-Router übersetzt das Ziel 200.0.0.10 → 192.168.1.10 und leitet ins LAN. Das funktioniert NUR mit Static NAT — PAT kann eingehende Verbindungen nicht zuordnen, da kein Port-Mapping vorhanden ist.",
              },
            ],
          },
        ],
      },
      {
        title: "Typische Fehler bei Static NAT",
        blocks: [
          {
            device: "Merke",
            mode: "info",
            modeLabel: "Häufige Fehler",
            commands: [
              { cmd: "Inside-Global-Adresse doppelt vergeben", explanation: "Zwei statische Einträge auf dieselbe öffentliche IP führen zu unvorhersehbarem Verhalten — jede Inside-Global-Adresse darf nur einem Inside-Local-Host zugeordnet sein." },
              { cmd: "ip nat inside/outside auf den Interfaces vergessen", explanation: "Auch bei statischen Einträgen findet ohne die Interface-Markierungen keine Übersetzung statt — die Einträge existieren zwar in der Tabelle, werden aber nie angewendet." },
              { cmd: "Rückroute für die Inside-Global-Adressen vergessen", explanation: "Ohne Route auf dem INTERNET-Router für 200.0.0.0/24 kommt die Antwort auf eine eingehende Verbindung nie beim Webserver an." },
              { cmd: "Statischen Eintrag mit dynamischem NAT/PAT für dasselbe Netz kombiniert", explanation: "Ohne saubere ACL-Trennung kann ein Host versehentlich sowohl einen festen als auch einen dynamischen Eintrag bekommen — führt zu widersprüchlichen Übersetzungen." },
            ],
          },
        ],
      },
    ],
    verifyCommands: [
      { cmd: "show ip nat translations", expected: "3 statische Einträge (Pro-Zeilen) dauerhaft sichtbar, auch ohne aktiven Traffic" },
      { cmd: "show ip nat statistics", expected: "Total active translations: 3 static; Hits steigen bei Ping" },
      { cmd: "ping 47.11.8.15 (von PC0)", expected: "Quelle 192.168.1.10 → 200.0.0.10 in der NAT-Tabelle sichtbar" },
      { cmd: "ping 200.0.0.10 (vom Webserver)", expected: "Eingehende Verbindung landet auf PC0 — nur möglich mit Static NAT" },
      { cmd: "debug ip nat", expected: "s=192.168.1.10->200.0.0.10 für jedes Paket von PC0" },
    ],
    glossary: [
      { term: "Statisches NAT",       def: "Permanente 1:1-Zuordnung: eine private Inside-Local-Adresse ↔ eine feste öffentliche Inside-Global-Adresse." },
      { term: "Inside Local",         def: "Die private IP des Hosts im LAN (vor der Übersetzung, z. B. 192.168.1.10)." },
      { term: "Inside Global",        def: "Die öffentliche IP nach der Übersetzung (z. B. 200.0.0.10) — sichtbar im Internet." },
      { term: "Outside Global",       def: "Die IP des externen Hosts (Webserver 47.11.8.15) — bleibt unverändert." },
      { term: "ip nat inside source static",  def: "Konfiguriert einen statischen NAT-Eintrag: ip nat inside source static <priv> <pub>." },
      { term: "ip nat inside",        def: "Markiert das LAN-Interface als vertrauenswürdige Seite." },
      { term: "ip nat outside",       def: "Markiert das WAN-Interface als öffentliche Seite." },
      { term: "Eingehende Verbindung", def: "Static NAT ermöglicht Verbindungen von außen nach innen (z. B. Webserver→PC). PAT kann das nicht." },
      { term: "Rückroute (INTERNET)", def: "Der INTERNET-Router muss 200.0.0.0/24 über den ISP kennen — sonst werden Antwortpakete verworfen." },
      { term: "debug ip nat",         def: "Zeigt jede Übersetzung in Echtzeit. Zum Beenden: 'undebug all'." },
    ],
  },

  // ─────────────────────────────────────────────────────────────
  // 22. NTP + Syslog + SNMPv3
  // ─────────────────────────────────────────────────────────────
  {
    id: "ntp-syslog-snmp",
    icon: <Info size={20} />,
    title: "NTP + Syslog + SNMPv2c",
    subtitle: "Time-Sync, zentrales Logging, Monitoring",
    difficulty: "Mittel",
    duration: "25 min",
    context: {
      problem:
        "Ohne synchronisierte Uhren lassen sich Logs verschiedener Geräte nicht korrelieren — und ohne zentrales Logging übersieht man Vorfälle ganz.",
      purpose:
        "Betriebsgrundlagen einrichten: NTP für eine einheitliche, authentifizierte Zeit, Syslog für zentrale Logs mit korrekten Zeitstempeln und SNMP für Monitoring per Community-String.",
    },
    topology: {
      description:
        "Switch SW1 als 'managed Device' im Management-Segment 10.0.0.0/24. NTP-Server 10.0.0.10, Syslog-Server 10.0.0.20, SNMP-Manager 10.0.0.30.",
      devices: [
        { type: "switch", label: "SW1", count: 1 },
        { type: "server", label: "NTP, Syslog, SNMP-Manager", count: 3 },
      ],
      connections: ["SW1 Gi0/1 → Server-VLAN 99 (10.0.0.0/24)"],
      hint: "Ohne korrekte Zeit sind Logs WERTLOS — NTP zuerst, dann alles andere.",
    },
    steps: [
      {
        title: "SW1: Grundkonfiguration + Management-Interface",
        blocks: [
          {
            device: "SW1",
            mode: "privileged",
            modeLabel: "Switch>",
            commands: [
              {
                cmd: "enable\nconfigure terminal\nhostname SW1\nno ip domain-lookup",
                explanation: "Üblicher Einstieg.",
              },
            ],
          },
          {
            device: "SW1",
            mode: "global",
            modeLabel: "SW1(config)#",
            commands: [
              {
                cmd: "vlan 99\nname MGMT\nexit",
                explanation: "Management-VLAN für das Server-Segment anlegen.",
              },
              {
                cmd: "interface Gi0/1\nswitchport mode access\nswitchport access vlan 99\nexit",
                explanation: "Uplink zum Server-Segment als Access-Port in VLAN 99.",
              },
              {
                cmd: "interface vlan 99\nip address 10.0.0.2 255.255.255.0\nno shutdown\nexit",
                explanation: "Management-SVI — ohne eigene IP im 10.0.0.0/24-Netz kann SW1 die Server (NTP/Syslog/SNMP) gar nicht erreichen.",
              },
              {
                cmd: "interface loopback0\nip address 10.0.0.1 255.255.255.255\nexit",
                explanation: "Stabile Quell-IP für NTP/Syslog — ein Loopback ist immer up/up, unabhängig vom Status einzelner physischer Ports. Muss VOR den folgenden Schritten existieren, da diese darauf verweisen.",
              },
            ],
          },
        ],
      },
      {
        title: "NTP-Client mit Authentication",
        blocks: [
          {
            device: "SW1",
            mode: "global",
            modeLabel: "SW1(config)#",
            commands: [
              { cmd: "clock timezone CET 1", explanation: "Zeitzone Mitteleuropa = UTC+1." },
              { cmd: "clock summer-time CEST recurring last Sun Mar 2:00 last Sun Oct 3:00", explanation: "Sommerzeit-Regel automatisch." },
              { cmd: "ntp authentication-key 1 md5 CCNAntpKey", explanation: "Authentication-Key 1, MD5-Hash." },
              { cmd: "ntp authenticate", explanation: "Server-Auth einschalten." },
              { cmd: "ntp trusted-key 1", explanation: "Erlaubte Key-IDs." },
              { cmd: "ntp server 10.0.0.10 key 1 prefer", explanation: "Primärer NTP-Server, signiert mit Key 1." },
              { cmd: "ntp source Loopback0", explanation: "Stabile Quell-IP — jetzt vorhanden aus dem vorigen Schritt." },
            ],
          },
        ],
      },
      {
        title: "Syslog zentral senden",
        blocks: [
          {
            device: "SW1",
            mode: "global",
            modeLabel: "SW1(config)#",
            commands: [
              { cmd: "logging host 10.0.0.20", explanation: "Syslog-Server." },
              { cmd: "logging trap informational", explanation: "Severity 6 — alles ab informational (0-7: emerg/alert/crit/err/warn/notif/info/debug)." },
              { cmd: "logging facility local6", explanation: "Facility (Default local7) — hilft Server beim Sortieren." },
              { cmd: "logging source-interface Loopback0", explanation: "Quell-IP konstant halten." },
              { cmd: "service timestamps log datetime msec localtime show-timezone", explanation: "Logs mit Millisekunden-Zeitstempel + Zeitzone." },
              { cmd: "service sequence-numbers", explanation: "Jede Log-Zeile nummerieren — keine Logs verloren." },
            ],
          },
        ],
      },
      {
        title: "SNMP (Community-basiert, v2c)",
        blocks: [
          {
            device: "SW1",
            mode: "global",
            modeLabel: "SW1(config)#",
            commands: [
              { cmd: "snmp-server community CCNAmon ro", explanation: "Community-String 'CCNAmon' mit Read-Only-Zugriff. Auf realer Hardware wäre SNMPv3 mit Auth+Priv (verschlüsselte User-Authentifizierung) die sichere Wahl — v2c überträgt die Community im Klartext, ist aber die in Packet Tracer verlässlich testbare Variante." },
              { cmd: "snmp-server host 10.0.0.30 version 2c CCNAmon", explanation: "Trap-Empfänger — sendet Traps an den SNMP-Manager mit derselben Community." },
              { cmd: "snmp-server enable traps", explanation: "Alle Standard-Traps senden." },
              { cmd: "snmp-server location Serverraum-EG", explanation: "Optionale Metadaten für den Manager." },
              { cmd: "snmp-server contact netadmin@example.local", explanation: "Optionale Metadaten für den Manager." },
            ],
          },
        ],
      },
      {
        title: "Speichern",
        blocks: [
          {
            device: "SW1",
            mode: "privileged",
            modeLabel: "SW1(config)#",
            commands: [
              {
                cmd: "end\ncopy running-config startup-config",
                explanation: "Speichern.",
              },
            ],
          },
        ],
      },
      {
        title: "Typische Fehler bei NTP/Syslog/SNMP",
        blocks: [
          {
            device: "Merke",
            mode: "info",
            modeLabel: "Häufige Fehler",
            commands: [
              { cmd: "Loopback vor Referenz nicht angelegt", explanation: "ntp source Loopback0 bzw. logging source-interface Loopback0 scheitern, wenn das Loopback-Interface noch gar nicht existiert." },
              { cmd: "Kein Management-Pfad zu den Servern", explanation: "Ohne eigene IP im 10.0.0.0/24-Segment (hier über die VLAN-99-SVI) erreicht SW1 weder NTP- noch Syslog- noch SNMP-Server — alle drei Dienste bleiben wirkungslos." },
              { cmd: "NTP-Key stimmt nicht mit dem Server überein", explanation: "Key-Nummer und MD5-Hash müssen exakt zum NTP-Server passen, sonst bleibt show ntp status auf 'Clock is unsynchronized'." },
              { cmd: "Falsche Community beim Trap-Empfänger", explanation: "snmp-server host und snmp-server community müssen dieselbe Community verwenden — sonst verwirft der Manager die eingehenden Traps." },
            ],
          },
        ],
      },
    ],
    verifyCommands: [
      { cmd: "show ntp status", expected: "Clock is synchronized, stratum 4, reference is 10.0.0.10" },
      { cmd: "show ntp associations", expected: "*~10.0.0.10  (* = sys.peer)" },
      { cmd: "show logging", expected: "Trap logging: level informational, 0 messages lost, Logging to 10.0.0.20" },
      { cmd: "show snmp community", expected: "CCNAmon, permission: RO" },
    ],
    glossary: [
      { term: "NTP", def: "Network Time Protocol (UDP 123) — synchronisiert die Uhren aller Geräte." },
      { term: "Stratum", def: "Distanz zur Referenzuhr; je niedriger, desto vertrauenswürdiger die Zeitquelle." },
      { term: "ntp authenticate", def: "Aktiviert NTP-Authentifizierung (mit ntp authentication-key … md5)." },
      { term: "Syslog", def: "Standard für Geräte-Logmeldungen, üblicherweise an einen zentralen Server (logging host)." },
      { term: "logging trap <level>", def: "Legt fest, ab welchem Schweregrad Meldungen zum Server gehen." },
      { term: "Severity-Level", def: "0 (Emergency) bis 7 (Debug) — Schweregrad einer Syslog-Meldung." },
      { term: "service timestamps", def: "Versieht Log-/Debug-Zeilen mit Datum/Uhrzeit — Voraussetzung für Korrelation." },
      { term: "facility", def: "Kategorie/Quelle einer Syslog-Meldung (z. B. local6)." },
      { term: "SNMP Community", def: "Klartext-'Passwort' bei SNMPv1/v2c, das Lese- (ro) oder Schreibzugriff (rw) gewährt." },
      { term: "Loopback-Interface", def: "Logisches, immer up/up-Interface — ideal als stabile Quell-IP für Management-Traffic." },
    ],
  },

  // ─────────────────────────────────────────────────────────────
  // 21. HSRP (FHRP)
  // ─────────────────────────────────────────────────────────────
  {
    id: "hsrp",
    icon: <Shuffle size={20} />,
    title: "HSRP First-Hop Redundancy",
    subtitle: "Virtuelles Gateway, Priority, Preempt, Tracking",
    difficulty: "Fortgeschritten",
    duration: "30 min",
    context: {
      problem:
        "Ein einzelnes Default-Gateway ist ein Single Point of Failure: fällt der Router aus, verlieren alle Hosts ihre Verbindung nach außen.",
      purpose:
        "HSRP gibt zwei Routern eine gemeinsame virtuelle Gateway-IP. Fällt der Active-Router aus, übernimmt der Standby unbemerkt — die Clients merken nichts. FHRP-Standard für Gateway-Redundanz.",
    },
    topology: {
      description:
        "Zwei Distribution-Router teilen sich ein virtuelles Default Gateway. Fällt R1 (Active) aus, übernimmt R2 (Standby) automatisch.",
      devices: [
        { type: "router", label: "R1, R2", count: 2 },
        { type: "pc", label: "PC0", count: 1 },
      ],
      connections: [
        "R1 Gi0/0 — 192.168.1.2/24 (HSRP Active, Priority 110)",
        "R2 Gi0/0 — 192.168.1.3/24 (HSRP Standby, Priority 100)",
        "PC0 → gemeinsames LAN 192.168.1.0/24",
        "Virtuelle IP — 192.168.1.1 (Default Gateway von PC0)",
      ],
      hint: "PC0 kennt NUR 192.168.1.1. HSRP-Gruppe nutzt eine virtuelle MAC 0000.0c07.acXX (XX = Gruppen-ID hex).",
    },
    steps: [
      {
        title: "R1 — Active (höhere Priority)",
        blocks: [
          {
            device: "R1",
            mode: "privileged",
            modeLabel: "Router>",
            commands: [
              {
                cmd: "enable\nconfigure terminal\nhostname R1\nno ip domain-lookup",
                explanation: "Üblicher Einstieg.",
              },
            ],
          },
          {
            device: "R1",
            mode: "interface",
            modeLabel: "R1(config)#",
            commands: [
              { cmd: "interface Gi0/0", explanation: "" },
              { cmd: "ip address 192.168.1.2 255.255.255.0", explanation: "Eigene IP." },
              { cmd: "no shutdown", explanation: "Interface aktivieren." },
              { cmd: "standby version 2", explanation: "HSRPv2 (statt Default v1) — unterstützt IPv6 und größere Group-IDs." },
              { cmd: "standby 1 ip 192.168.1.1", explanation: "Gruppen-ID 1, virtuelle Gateway-IP." },
              { cmd: "standby 1 priority 110", explanation: "Priorität (Default 100). Höhere wins." },
              { cmd: "standby 1 preempt", explanation: "Übernimmt SOFORT die Active-Rolle, wenn online (sonst bleibt der bisherige Active)." },
              { cmd: "standby 1 timers 1 3", explanation: "Hello alle 1 Sekunde, Hold-Time 3 Sekunden — ganze Sekunden statt msec-Werte, damit das Timing in Packet Tracer zuverlässig funktioniert." },
              { cmd: "standby 1 track Gi0/1 30", explanation: "Wenn Uplink Gi0/1 ausfällt → Priority sinkt um 30 (110→80) → R2 (100) übernimmt." },
              { cmd: "standby 1 authentication CCNAhsrp", explanation: "Klartext-Authentifizierung gegen Rogue-HSRP-Spoofing (statt MD5 key-string — einfache Textform ist in PT zuverlässiger)." },
            ],
          },
          {
            device: "R1",
            mode: "privileged",
            modeLabel: "R1(config-if)#",
            commands: [
              {
                cmd: "end\ncopy running-config startup-config",
                explanation: "Speichern.",
              },
            ],
          },
        ],
      },
      {
        title: "R2 — Standby (Default-Priority)",
        blocks: [
          {
            device: "R2",
            mode: "privileged",
            modeLabel: "Router>",
            commands: [
              {
                cmd: "enable\nconfigure terminal\nhostname R2\nno ip domain-lookup",
                explanation: "Gleicher Einstieg wie R1.",
              },
            ],
          },
          {
            device: "R2",
            mode: "interface",
            modeLabel: "R2(config)#",
            commands: [
              { cmd: "interface Gi0/0", explanation: "" },
              { cmd: "ip address 192.168.1.3 255.255.255.0", explanation: "" },
              { cmd: "no shutdown", explanation: "Interface aktivieren." },
              { cmd: "standby version 2", explanation: "Muss übereinstimmen." },
              { cmd: "standby 1 ip 192.168.1.1", explanation: "Gleiche Virtual-IP." },
              { cmd: "standby 1 preempt", explanation: "Damit es bei R1-Recovery die Rolle auch wieder zurückgeben kann." },
              { cmd: "standby 1 timers 1 3", explanation: "Gleiche Timer wie R1 — müssen auf beiden Seiten übereinstimmen." },
              { cmd: "standby 1 authentication CCNAhsrp", explanation: "Gleicher Klartext-Auth-String wie R1." },
            ],
          },
          {
            device: "R2",
            mode: "privileged",
            modeLabel: "R2(config-if)#",
            commands: [
              {
                cmd: "end\ncopy running-config startup-config",
                explanation: "Speichern.",
              },
            ],
          },
        ],
      },
      {
        title: "PC0 adressieren",
        blocks: [
          {
            device: "PC0",
            mode: "desktop",
            modeLabel: "Desktop > IP Configuration",
            commands: [
              { cmd: "IP Address: 192.168.1.10\nSubnet Mask: 255.255.255.0\nDefault Gateway: 192.168.1.1", explanation: "Gateway ist die VIRTUELLE HSRP-IP, nicht die reale Adresse von R1 oder R2." },
            ],
          },
        ],
      },
      {
        title: "Abschlusstest — Baseline und Failover",
        blocks: [
          {
            device: "PC0",
            mode: "desktop",
            modeLabel: "Desktop > Command Prompt",
            commands: [
              {
                cmd: "ping 192.168.1.1",
                explanation: "Baseline: die virtuelle Gateway-IP antwortet — aktuell über R1 (Active, höhere Priority).",
              },
            ],
          },
          {
            device: "R1",
            mode: "interface",
            modeLabel: "R1(config-if)#",
            commands: [
              {
                cmd: "interface Gi0/0\nshutdown",
                explanation: "Simuliert den Ausfall des Active-Routers.",
              },
            ],
          },
          {
            device: "PC0",
            mode: "desktop",
            modeLabel: "Desktop > Command Prompt",
            commands: [
              {
                cmd: "ping 192.168.1.1",
                explanation: "MUSS weiterhin funktionieren — R2 hat die Active-Rolle übernommen, PC0 hat davon nichts gemerkt (keine Gateway-Änderung nötig). Danach: no shutdown auf R1 Gi0/0, um den Ursprungszustand wiederherzustellen (preempt holt R1 automatisch zurück in die Active-Rolle).",
              },
            ],
          },
        ],
      },
      {
        title: "Typische Fehler bei HSRP",
        blocks: [
          {
            device: "Merke",
            mode: "info",
            modeLabel: "Häufige Fehler",
            commands: [
              { cmd: "Timer stimmen nicht überein", explanation: "Hello- und Hold-Time müssen auf BEIDEN Routern identisch sein — sonst hält der Standby den Active fälschlich für ausgefallen (oder umgekehrt)." },
              { cmd: "preempt nur auf einer Seite gesetzt", explanation: "Ohne preempt auf R1 übernimmt R1 nach seiner Rückkehr NICHT wieder die Active-Rolle — R2 bleibt dauerhaft Active, auch wenn R1 die höhere Priority hat." },
              { cmd: "PC-Gateway zeigt auf reale statt virtuelle IP", explanation: "192.168.1.2 oder .3 als Gateway funktioniert zwar im Normalbetrieb, bringt aber KEINE Redundanz — fällt genau dieser Router aus, ist der PC ohne Gateway." },
              { cmd: "Authentication-String unterschiedlich", explanation: "Stimmen die Auth-Strings nicht überein, ignorieren sich die Router gegenseitig — es bilden sich zwei getrennte 'Active'-Router mit derselben virtuellen IP (Split-Brain)." },
            ],
          },
        ],
      },
    ],
    verifyCommands: [
      { cmd: "show standby brief", expected: "Grp 1, State Active (R1) / Standby (R2), Virtual IP 192.168.1.1" },
      { cmd: "show standby Gi0/0 1", expected: "Hellos sent, Priority 110, Track Gi0/1 line-protocol Up" },
      { cmd: "ping 192.168.1.1 (von PC0)", expected: "Erfolgreich — vor UND nach dem simulierten R1-Ausfall" },
    ],
    glossary: [
      { term: "HSRP", def: "Hot Standby Router Protocol (Cisco) — zwei Router teilen sich eine virtuelle Gateway-IP." },
      { term: "FHRP", def: "First Hop Redundancy Protocol — Oberbegriff (HSRP, VRRP, GLBP)." },
      { term: "Virtuelle IP/MAC", def: "Gemeinsame Adresse, die die Clients als Gateway nutzen; wandert beim Failover mit." },
      { term: "Active / Standby", def: "Der Active leitet weiter; der Standby wartet bereit und übernimmt bei Ausfall." },
      { term: "priority", def: "Höhere Priorität wird Active (Default 100)." },
      { term: "preempt", def: "Erlaubt einem zurückkehrenden Router, die Active-Rolle zurückzuholen." },
      { term: "Object Tracking", def: "Senkt die Priorität bei Uplink-Ausfall (standby track), sodass der Standby übernimmt." },
      { term: "standby version 2", def: "HSRPv2 — unterstützt mehr Gruppen und (auf realer Hardware) msec-Timer." },
    ],
  },

  // ─────────────────────────────────────────────────────────────
  // GRE-Tunnel-VPN — aus Cisco Practice Lab 6
  // ─────────────────────────────────────────────────────────────
  {
    id: "gre-tunnel",
    icon: <Network size={20} />,
    title: "GRE-Tunnel-VPN zwischen Sites",
    subtitle: "Site-to-Site Tunnel über das Internet + OSPF darüber",
    difficulty: "Fortgeschritten",
    duration: "40 min",
    context: {
      problem:
        "Zwei Standorte sind nur über das öffentliche Internet verbunden. Private Netze und ein dynamisches Routing-Protokoll (OSPF, Multicast!) lassen sich nicht direkt über das Internet transportieren.",
      purpose:
        "Ein GRE-Tunnel bildet eine virtuelle Punkt-zu-Punkt-Leitung über das Internet. Darin laufen private IPs UND OSPF — als ob die Sites direkt verkabelt wären. (GRE allein ist unverschlüsselt; in der Praxis kombiniert mit IPsec.)",
    },
    topology: {
      description:
        "R1-1 (Site 1) und R2-1 (Site 2) haben je eine öffentliche IP am Internet-Interface, dazwischen simuliert ein Internet-Router das Provider-Netz. Über die öffentlichen Adressen wird ein GRE-Tunnel (Tunnel12) mit eigenem privatem /30 aufgebaut; OSPF läuft über das Tunnel-Subnetz und verteilt die LAN-Präfixe beider Sites.",
      devices: [
        { type: "router", label: "R1-1 (Site 1)", count: 1 },
        { type: "router", label: "R2-1 (Site 2)", count: 1 },
        { type: "router", label: "Internet", count: 1 },
        { type: "pc", label: "PC0 (Site 1, 192.168.1.0/24)", count: 1 },
        { type: "pc", label: "PC1 (Site 2, 192.168.2.0/24)", count: 1 },
      ],
      connections: [
        "R1-1 Gi0/0 192.168.1.1/24 → PC0",
        "R1-1 Se0/0/0 1.1.1.2 ↔ Internet Se0/0/0 1.1.1.1",
        "R2-1 Gi0/0 192.168.2.1/24 → PC1",
        "R2-1 Se0/0/0 2.2.2.2 ↔ Internet Se0/0/1 2.2.2.1",
        "Tunnel12 (GRE): 216.145.12.1/30 (R1-1) ↔ 216.145.12.2/30 (R2-1)",
      ],
      hint: "tunnel source = eigenes öffentliches Interface, tunnel destination = öffentliche IP der Gegenseite. Die Tunnel-IP ist privat und liegt im OSPF. Voraussetzung: die öffentlichen Adressen sind erreichbar (Default-Route ins Internet).",
    },
    steps: [
      {
        title: "1) R1-1 — Grundkonfiguration, LAN + öffentliches Interface",
        blocks: [
          {
            device: "R1-1",
            mode: "privileged",
            modeLabel: "Router>",
            commands: [
              { cmd: "enable\nconfigure terminal\nhostname R1-1\nno ip domain-lookup", explanation: "Üblicher Einstieg." },
            ],
          },
          {
            device: "R1-1",
            mode: "interface",
            modeLabel: "R1-1(config)#",
            commands: [
              { cmd: "interface GigabitEthernet0/0\nip address 192.168.1.1 255.255.255.0\nno shutdown", explanation: "LAN-Interface zu PC0." },
              { cmd: "interface Se0/0/0\nip address 1.1.1.2 255.255.255.252\nno shutdown", explanation: "Öffentliches Interface Richtung Internet-Router." },
            ],
          },
          {
            device: "R1-1",
            mode: "global",
            modeLabel: "R1-1(config)#",
            commands: [
              { cmd: "ip route 0.0.0.0 0.0.0.0 1.1.1.1", explanation: "Default-Route ins 'Internet' — Voraussetzung, damit R1-1 die öffentliche Adresse von R2-1 (2.2.2.2) überhaupt erreicht." },
            ],
          },
        ],
      },
      {
        title: "2) R2-1 — Grundkonfiguration, LAN + öffentliches Interface",
        blocks: [
          {
            device: "R2-1",
            mode: "privileged",
            modeLabel: "Router>",
            commands: [
              { cmd: "enable\nconfigure terminal\nhostname R2-1\nno ip domain-lookup", explanation: "Gleicher Einstieg wie R1-1." },
            ],
          },
          {
            device: "R2-1",
            mode: "interface",
            modeLabel: "R2-1(config)#",
            commands: [
              { cmd: "interface GigabitEthernet0/0\nip address 192.168.2.1 255.255.255.0\nno shutdown", explanation: "LAN-Interface zu PC1." },
              { cmd: "interface Se0/0/0\nip address 2.2.2.2 255.255.255.252\nno shutdown", explanation: "Öffentliches Interface Richtung Internet-Router." },
            ],
          },
          {
            device: "R2-1",
            mode: "global",
            modeLabel: "R2-1(config)#",
            commands: [
              { cmd: "ip route 0.0.0.0 0.0.0.0 2.2.2.1", explanation: "Default-Route ins 'Internet' — analog zu R1-1." },
            ],
          },
        ],
      },
      {
        title: "3) Internet-Router — Provider-Kern",
        blocks: [
          {
            device: "Internet",
            mode: "privileged",
            modeLabel: "Router>",
            commands: [
              { cmd: "enable\nconfigure terminal\nhostname Internet\nno ip domain-lookup", explanation: "Üblicher Einstieg." },
            ],
          },
          {
            device: "Internet",
            mode: "interface",
            modeLabel: "Internet(config)#",
            commands: [
              { cmd: "interface Se0/0/0\nip address 1.1.1.1 255.255.255.252\nno shutdown", explanation: "Anschluss Richtung R1-1." },
              { cmd: "interface Se0/0/1\nip address 2.2.2.1 255.255.255.252\nno shutdown", explanation: "Anschluss Richtung R2-1. Beide Netze (1.1.1.0/30 und 2.2.2.0/30) sind direkt verbunden — keine zusätzliche Route nötig, der Internet-Router kennt beide Seiten bereits." },
            ],
          },
        ],
      },
      {
        title: "4) Baseline — vor dem Tunnel",
        blocks: [
          {
            device: "R1-1",
            mode: "privileged",
            modeLabel: "R1-1#",
            commands: [
              { cmd: "ping 2.2.2.2", explanation: "Bestätigt, dass die öffentlichen Adressen sich erreichen — Grundvoraussetzung für den GRE-Tunnel. Ein Ping von PC0 zu PC1 würde an dieser Stelle noch fehlschlagen: die privaten LANs sind dem Internet-Router unbekannt." },
            ],
          },
        ],
      },
      {
        title: "5) GRE-Tunnel-Interface auf R1-1",
        blocks: [
          {
            device: "R1-1",
            mode: "interface",
            modeLabel: "R1-1(config)#",
            commands: [
              {
                cmd: "interface tunnel 12\ntunnel source se0/0/0\ntunnel destination 2.2.2.2\nip address 216.145.12.1 255.255.255.252\nno shutdown",
                explanation:
                  "tunnel source = eigenes Internet-Interface, tunnel destination = öffentliche IP von R2-1. Die Tunnel-IP (216.145.12.1/30) ist die LOGISCHE Punkt-zu-Punkt-Adresse. Default-Encap ist GRE/IP.",
              },
            ],
          },
        ],
      },
      {
        title: "6) Spiegelbildlicher Tunnel auf R2-1",
        blocks: [
          {
            device: "R2-1",
            mode: "interface",
            modeLabel: "R2-1(config)#",
            commands: [
              {
                cmd: "interface tunnel 12\ntunnel source se0/0/0\ntunnel destination 1.1.1.2\nip address 216.145.12.2 255.255.255.252\nno shutdown",
                explanation:
                  "Source/Destination sind exakt vertauscht zu R1-1, die Tunnel-IP ist die zweite Adresse im selben /30. Sobald beide Seiten stehen, geht 'line protocol' auf up.",
              },
            ],
          },
        ],
      },
      {
        title: "7) OSPF über den Tunnel laufen lassen",
        blocks: [
          {
            device: "R1-1",
            mode: "router",
            modeLabel: "R1-1(config-router)#",
            commands: [
              {
                cmd: "router ospf 1\nnetwork 192.168.1.0 0.0.0.255 area 0\nnetwork 216.145.12.0 0.0.0.3 area 0\nend\ncopy running-config startup-config",
                explanation:
                  "LAN UND Tunnel-Subnetz werden in OSPF aufgenommen (Wildcard 0.0.0.3 = /30). Dadurch bilden R1-1 und R2-1 ÜBER den Tunnel eine OSPF-Nachbarschaft und tauschen ihre LAN-Routen aus.",
              },
            ],
          },
          {
            device: "R2-1",
            mode: "router",
            modeLabel: "R2-1(config-router)#",
            commands: [
              {
                cmd: "router ospf 1\nnetwork 192.168.2.0 0.0.0.255 area 0\nnetwork 216.145.12.0 0.0.0.3 area 0\nend\ncopy running-config startup-config",
                explanation: "Spiegelbildlich zu R1-1: eigenes LAN + Tunnel-Subnetz in Area 0.",
              },
            ],
          },
        ],
      },
      {
        title: "8) Endgeräte",
        blocks: [
          {
            device: "PC0",
            mode: "desktop",
            modeLabel: "Desktop > IP Configuration",
            commands: [
              { cmd: "IP Address: 192.168.1.10\nSubnet Mask: 255.255.255.0\nDefault Gateway: 192.168.1.1", explanation: "Gateway = R1-1 Gi0/0." },
            ],
          },
          {
            device: "PC1",
            mode: "desktop",
            modeLabel: "Desktop > IP Configuration",
            commands: [
              { cmd: "IP Address: 192.168.2.10\nSubnet Mask: 255.255.255.0\nDefault Gateway: 192.168.2.1", explanation: "Gateway = R2-1 Gi0/0." },
            ],
          },
        ],
      },
      {
        title: "9) Tunnel + OSPF verifizieren",
        blocks: [
          {
            device: "R1-1",
            mode: "privileged",
            modeLabel: "R1-1#",
            commands: [
              {
                cmd: "show interface tunnel 12",
                explanation:
                  "Erwartet: 'Tunnel12 is up, line protocol is up', 'Tunnel protocol/transport GRE/IP', source/destination korrekt. Bei 'line protocol down' ist die Gegenseite (destination) nicht erreichbar.",
              },
              {
                cmd: "show ip ospf neighbor",
                explanation:
                  "Der OSPF-Nachbar (R2-1) muss im State FULL erscheinen — über das Tunnel-Interface. Danach zeigt 'show ip route ospf' die Remote-LANs als O-Routen.",
              },
            ],
          },
        ],
      },
      {
        title: "10) Abschlusstest — PC0 ↔ PC1 durch den Tunnel",
        blocks: [
          {
            device: "PC0",
            mode: "desktop",
            modeLabel: "Desktop > Command Prompt",
            commands: [
              {
                cmd: "ping 192.168.2.10\ntracert 192.168.2.10",
                explanation: "PC0 → PC1, über OSPF und den GRE-Tunnel geroutet — der tracert-Pfad läuft über die Tunnel-IPs 216.145.12.x, nicht über die öffentlichen Adressen direkt.",
              },
            ],
          },
        ],
      },
      {
        title: "Typische Fehler bei GRE + OSPF",
        blocks: [
          {
            device: "Merke",
            mode: "info",
            modeLabel: "Häufige Fehler",
            commands: [
              { cmd: "tunnel destination zeigt auf die falsche IP", explanation: "tunnel destination muss die ÖFFENTLICHE IP der Gegenseite sein (nicht die Tunnel-IP) — sonst bleibt 'line protocol down', obwohl das Tunnel-Interface administrativ up ist." },
              { cmd: "Fehlende Default-Route zum Internet-Router", explanation: "Ohne Route zur öffentlichen Gegenstelle kann der GRE-Header gar nicht zugestellt werden — der Tunnel bleibt down, obwohl Source/Destination korrekt konfiguriert sind." },
              { cmd: "OSPF nur auf dem Tunnel, LAN vergessen", explanation: "Wird nur das Tunnel-Subnetz in OSPF aufgenommen, wird das eigene LAN nicht beworben — die Gegenseite sieht dann keine Route zum lokalen Netz." },
              { cmd: "MTU/Fragmentierung bei großen Paketen übersehen", explanation: "GRE fügt einen zusätzlichen Header hinzu — bei sehr großen Paketen kann das zu Fragmentierung führen; in Packet Tracer meist unkritisch, in echten Netzen ein häufiger Performance-Fallstrick." },
            ],
          },
        ],
      },
    ],
    verifyCommands: [
      { cmd: "show interface tunnel 12", expected: "Tunnel12 up/up, Tunnel protocol/transport GRE/IP" },
      { cmd: "show ip ospf neighbor", expected: "Nachbar über Tunnel12 im State FULL" },
      { cmd: "show ip route ospf", expected: "Remote-LANs als O-Routen via 216.145.12.x (Tunnel)" },
      { cmd: "ping 192.168.2.10 (von PC0)", expected: "Erfolgreich — privater Verkehr fließt durch den GRE-Tunnel" },
    ],
    glossary: [
      { term: "GRE", def: "Generic Routing Encapsulation — kapselt beliebige L3-Pakete in IP; bildet eine virtuelle P2P-Leitung. Unverschlüsselt." },
      { term: "tunnel source/destination", def: "Die ÖFFENTLICHEN Endpunkt-IPs des Tunnels (eigenes Interface bzw. Gegenseite)." },
      { term: "Tunnel-IP", def: "Logische private Adresse des Tunnel-Interfaces (hier /30) — Basis für das Routing darüber." },
      { term: "OSPF over GRE", def: "Weil GRE Multicast transportiert, kann OSPF (224.0.0.5/6) über den Tunnel Nachbarschaften bilden — über reines Internet nicht möglich." },
      { term: "GRE vs. IPsec", def: "GRE kapselt (auch Multicast), verschlüsselt aber nicht. Produktiv: GRE over IPsec für Vertraulichkeit." },
    ],
  },

  // ─────────────────────────────────────────────────────────────
  // IPSec Site-to-Site VPN — Hamburg ↔ Bremen
  // ─────────────────────────────────────────────────────────────
  {
    id: "ipsec-s2s-vpn",
    icon: <Shield size={20} />,
    title: "IPSec Site-to-Site VPN: Hamburg ↔ Bremen",
    subtitle: "6 Router · 2 Switches · 6 Hosts · komplette Adressierung · IKE Ph1/Ph2 · Crypto Map · AES-256/SHA · PFS G5",
    difficulty: "Fortgeschritten",
    duration: "90 min",
    context: {
      problem:
        "Zwei Firmenstandorte — Hamburg (LAN 192.168.1.0/24) und Bremen (LAN 192.168.2.0/24) — sollen über das öffentliche Internet sicher gekoppelt werden. Das Provider-Backbone (ISP1, Internet1, Internet2, ISP2) routet nur öffentliche Netze und kennt die privaten LANs NICHT — direkter Verkehr PC0 → PC2 schlägt fehl. Ein IPSec Site-to-Site VPN zwischen den WAN-Routern Hamburg (100.0.0.1) und Bremen (200.0.0.1) baut einen verschlüsselten Tunnel über das Internet.",
      purpose:
        "Das Lab wird komplett von null aufgebaut: alle sechs Router (Hostname, Interfaces, Adressen, statisches Core-Routing), beide Switches (Access-Ports, Management-SVI, Default-Gateway) und alle sechs Endgeräte (IP, Maske, Gateway). Erst wenn das Underlay nachweislich steht, folgt die IPSec-Site-to-Site-Konfiguration: IKE Phase 1 (ISAKMP-Policy, Pre-Shared Key) und Phase 2 (Transform-Set, Crypto-ACL, Crypto Map) inkl. der beidseitigen Übereinstimmungspflicht der Parameter. Schwerpunkte: spiegelbildliche Crypto-ACLs, Crypto Map aufs Outside-Interface, PFS, die zwei verschiedenen Lifetimes (Phase 1 vs. Phase 2) und die Selektivität der Crypto-ACL (Split Tunneling).",
    },
    topology: {
      description:
        "Zwei Standorte über ein Provider-Internet gekoppelt. Links Hamburg: PC0, PC1 und ein DHCP-Server (.11) an SW1, dahinter Router Hamburg (LAN .254 / WAN 100.0.0.1). Rechts Bremen: Router Bremen (LAN .254 / WAN 200.0.0.1) an SW2 mit PC2 und PC3. Dazwischen der vorkonfigurierte Core aus ISP1, Internet1, Internet2 und ISP2 (nur /30-Transfernetze) sowie ein Webserver 47.11.8.15. Über dieses Underlay wird der IPSec-Tunnel Hamburg (100.0.0.1) ↔ Bremen (200.0.0.1) aufgebaut.",
      devices: [
        { type: "PC", label: "PC0/PC1 (LAN Hamburg, an SW1)", count: 2 },
        { type: "Server", label: "DHCP .11 (SW1 Fa0/24)", count: 1 },
        { type: "Switch", label: "SW1 (Hamburg, Uplink Gig0/1)", count: 1 },
        { type: "Router", label: "Hamburg (LAN .254 / WAN 100.0.0.1)", count: 1 },
        { type: "Router", label: "Core: ISP1 / Internet1 / Internet2 / ISP2 (statisches Routing)", count: 4 },
        { type: "Server", label: "Webserver 47.11.8.15 (an Internet2)", count: 1 },
        { type: "Router", label: "Bremen (LAN .254 / WAN 200.0.0.1)", count: 1 },
        { type: "Switch", label: "SW2 (Bremen, Uplink Gig0/2)", count: 1 },
        { type: "PC", label: "PC2/PC3 (LAN Bremen, an SW2)", count: 2 },
      ],
      connections: [
        "Hamburg Gig0/0 .254 ──── SW1 ──── PC0/PC1 + DHCP .11 (LAN 192.168.1.0/24)",
        "Hamburg Gig0/1 100.0.0.1 ──── 100.0.0.0/30 ──── ISP1 Gig0/2 100.0.0.2",
        "ISP1 Gig0/1 2.2.2.1 ──── 2.2.2.0/30 ──── Internet1 Gig0/2 2.2.2.2",
        "Internet1 Gig0/1 1.1.1.1 ──── 1.1.1.0/30 ──── Internet2 Gig0/2 1.1.1.2",
        "Internet1 Gig0/0 3.3.3.1 ──── 3.3.3.0/30 ──── ISP2 Gig0/1 3.3.3.2",
        "Internet2 Gig0/0 47.11.8.1 ──── 47.11.8.0/24 ──── Webserver Fa0 47.11.8.15",
        "ISP2 Gig0/2 200.0.0.2 ──── 200.0.0.0/30 ──── Bremen Gig0/1 200.0.0.1",
        "Bremen Gig0/0 .254 ──── SW2 ──── PC2/PC3 (LAN 192.168.2.0/24)",
        "IPSec-Tunnel: Hamburg 100.0.0.1 ↔ Bremen 200.0.0.1 (über das Provider-Internet)",
      ],
      hint: "Reihenfolge: 1) Alle sechs Router adressieren inkl. Core-Routing (Steps 1–6). 2) Switches und Endgeräte (Steps 7–8). 3) Underlay prüfen (Step 9): Hamburg → 200.0.0.1 MUSS klappen, PC0 → PC2 muss noch FEHLSCHLAGEN. 4) Erst dann IPSec: Phase 1 (ISAKMP + PSK), Phase 2 (Transform-Set + Crypto-ACL + Crypto Map), Crypto Map aufs WAN-Interface Gig0/1. Der Tunnel baut sich erst bei interessantem Traffic (PC0 → PC2) auf — nicht durch einen Ping vom Router selbst.",
    },
    exhibits: [
      {
        type: "topology",
        devices: [
          { id: "pc0", type: "pc", label: "PC0", x: 40, y: 40 },
          { id: "pc1", type: "pc", label: "PC1", x: 40, y: 130 },
          { id: "dhcp", type: "pc", label: "DHCP .11", x: 40, y: 220 },
          { id: "sw1", type: "switch", label: "SW1", x: 165, y: 130 },
          { id: "hamburg", type: "router", label: "Hamburg", x: 300, y: 130 },
          { id: "isp1", type: "router", label: "ISP1", x: 430, y: 130 },
          { id: "internet1", type: "router", label: "Internet1", x: 560, y: 130 },
          { id: "isp2", type: "router", label: "ISP2", x: 690, y: 130 },
          { id: "bremen", type: "router", label: "Bremen", x: 820, y: 130 },
          { id: "sw2", type: "switch", label: "SW2", x: 950, y: 130 },
          { id: "pc2", type: "pc", label: "PC2", x: 1075, y: 90 },
          { id: "pc3", type: "pc", label: "PC3", x: 1075, y: 175 },
          { id: "internet2", type: "router", label: "Internet2", x: 560, y: 285 },
          { id: "webserver", type: "pc", label: "Webserver .15", x: 415, y: 285 },
        ],
        links: [
          { from: "pc0", to: "sw1" },
          { from: "pc1", to: "sw1" },
          { from: "dhcp", to: "sw1", labelTo: "Fa0/24" },
          { from: "sw1", to: "hamburg", subnet: "192.168.1.0/24", labelTo: "G0/0 .254" },
          { from: "hamburg", to: "isp1", subnet: "100.0.0.0/30", labelFrom: "G0/1 .1", labelTo: "G0/2 .2" },
          { from: "isp1", to: "internet1", subnet: "2.2.2.0/30", labelFrom: "G0/1 .1", labelTo: "G0/2 .2" },
          { from: "internet1", to: "isp2", subnet: "3.3.3.0/30", labelFrom: "G0/0 .1", labelTo: "G0/1 .2" },
          { from: "isp2", to: "bremen", subnet: "200.0.0.0/30", labelFrom: "G0/2 .2", labelTo: "G0/1 .1" },
          { from: "bremen", to: "sw2", subnet: "192.168.2.0/24", labelFrom: "G0/0 .254" },
          { from: "sw2", to: "pc2" },
          { from: "sw2", to: "pc3" },
          { from: "internet1", to: "internet2", subnet: "1.1.1.0/30", labelFrom: "G0/1 .1", labelTo: "G0/2 .2" },
          { from: "internet2", to: "webserver", subnet: "47.11.8.0/24", labelFrom: "G0/0 .1", labelTo: "Fa0 .15" },
        ],
        labels: [
          { text: "◄═══ IPSec-Tunnel: Hamburg 100.0.0.1 ↔ Bremen 200.0.0.1 ═══►", attachTo: "internet1", position: "above" },
        ],
      },
      {
        type: "table",
        headers: ["Gerät", "Interface", "IP-Adresse", "Netz", "Gegenstelle"],
        rows: [
          ["Hamburg", "Gig0/0", "192.168.1.254/24", "192.168.1.0/24", "SW1 Gig0/1"],
          ["Hamburg", "Gig0/1", "100.0.0.1/30", "100.0.0.0/30", "ISP1 Gig0/2"],
          ["ISP1", "Gig0/2", "100.0.0.2/30", "100.0.0.0/30", "Hamburg Gig0/1"],
          ["ISP1", "Gig0/1", "2.2.2.1/30", "2.2.2.0/30", "Internet1 Gig0/2"],
          ["Internet1", "Gig0/2", "2.2.2.2/30", "2.2.2.0/30", "ISP1 Gig0/1"],
          ["Internet1", "Gig0/1", "1.1.1.1/30", "1.1.1.0/30", "Internet2 Gig0/2"],
          ["Internet1", "Gig0/0", "3.3.3.1/30", "3.3.3.0/30", "ISP2 Gig0/1"],
          ["Internet2", "Gig0/2", "1.1.1.2/30", "1.1.1.0/30", "Internet1 Gig0/1"],
          ["Internet2", "Gig0/0", "47.11.8.1/24", "47.11.8.0/24", "Webserver"],
          ["Webserver", "Fa0", "47.11.8.15/24", "47.11.8.0/24", "Internet2 Gig0/0"],
          ["ISP2", "Gig0/1", "3.3.3.2/30", "3.3.3.0/30", "Internet1 Gig0/0"],
          ["ISP2", "Gig0/2", "200.0.0.2/30", "200.0.0.0/30", "Bremen Gig0/1"],
          ["Bremen", "Gig0/1", "200.0.0.1/30", "200.0.0.0/30", "ISP2 Gig0/2"],
          ["Bremen", "Gig0/0", "192.168.2.254/24", "192.168.2.0/24", "SW2 Gig0/2"],
        ],
      },
      {
        type: "cli",
        content: `Hamburg# show crypto isakmp sa
IPv4 Crypto ISAKMP SA
dst             src             state          conn-id slot status
200.0.0.1       100.0.0.1       QM_IDLE           1001    0 ACTIVE

Hamburg# show crypto ipsec sa
interface: GigabitEthernet0/1
    Crypto map tag: IPSEC-MAP, local addr 100.0.0.1

   local  ident (addr/mask/prot/port): (192.168.1.0/255.255.255.0/0/0)
   remote ident (addr/mask/prot/port): (192.168.2.0/255.255.255.0/0/0)
   current_peer 200.0.0.1 port 500
    #pkts encaps: 4, #pkts encrypt: 4, #pkts digest: 4
    #pkts decaps: 4, #pkts decrypt: 4, #pkts verify: 4`,
        highlight: [
          "200.0.0.1       100.0.0.1       QM_IDLE           1001    0 ACTIVE",
          "    #pkts encaps: 4, #pkts encrypt: 4, #pkts digest: 4",
          "    #pkts decaps: 4, #pkts decrypt: 4, #pkts verify: 4",
        ],
      },
    ],
    steps: [
      {
        title: "1) Router Hamburg — Grundkonfiguration, Interfaces, Default-Route",
        blocks: [
          {
            device: "Hamburg",
            mode: "privileged",
            modeLabel: "Router>",
            commands: [
              { cmd: "enable", explanation: "Vom User-EXEC (Router>) in den privilegierten EXEC-Modus (Router#) wechseln." },
              { cmd: "configure terminal", explanation: "In den globalen Konfigurationsmodus wechseln. Kurzform: conf t." },
              { cmd: "hostname Hamburg", explanation: "Setzt den Gerätenamen — der Prompt wechselt auf Hamburg(config)#. Wichtig, damit die späteren VPN-Prompts eindeutig sind." },
              { cmd: "no ip domain-lookup", explanation: "Verhindert, dass der Router bei Tippfehlern minutenlang eine DNS-Auflösung versucht." },
              { cmd: "interface GigabitEthernet0/0", explanation: "LAN-Interface Richtung SW1 auswählen (Prompt: Hamburg(config-if)#)." },
              { cmd: "ip address 192.168.1.254 255.255.255.0", explanation: "LAN-IP = Default Gateway für PC0, PC1 und den DHCP-Server im Netz 192.168.1.0/24." },
              { cmd: "no shutdown", explanation: "Interface aktivieren — ohne diesen Befehl bleibt es administrativ down." },
              { cmd: "exit", explanation: "Zurück in den globalen Konfigurationsmodus." },
              { cmd: "interface GigabitEthernet0/1", explanation: "WAN-Interface Richtung ISP1 auswählen." },
              { cmd: "ip address 100.0.0.1 255.255.255.252", explanation: "WAN-IP 100.0.0.1/30 — das ist später der lokale IPSec-Endpunkt (aus Sicht von Bremen die Peer-Adresse)." },
              { cmd: "no shutdown", explanation: "WAN-Interface aktivieren." },
              { cmd: "exit", explanation: "Zurück in den globalen Konfigurationsmodus." },
              { cmd: "ip route 0.0.0.0 0.0.0.0 100.0.0.2", explanation: "Default-Route zum Provider ISP1. Hamburg kennt keine Core-Netze — alles Unbekannte geht an 100.0.0.2." },
              { cmd: "end", explanation: "Zurück in den privilegierten EXEC (Hamburg#)." },
              { cmd: "copy running-config startup-config", explanation: "Konfiguration dauerhaft ins NVRAM speichern." },
            ],
          },
        ],
      },
      {
        title: "2) Router ISP1 — Grundkonfiguration, Interfaces, Default-Route",
        blocks: [
          {
            device: "ISP1",
            mode: "privileged",
            modeLabel: "Router>",
            commands: [
              { cmd: "enable", explanation: "In den privilegierten EXEC-Modus wechseln." },
              { cmd: "configure terminal", explanation: "In den globalen Konfigurationsmodus wechseln." },
              { cmd: "hostname ISP1", explanation: "Gerätename setzen." },
              { cmd: "no ip domain-lookup", explanation: "DNS-Auflösung bei Tippfehlern abschalten." },
              { cmd: "interface GigabitEthernet0/2", explanation: "Interface Richtung Hamburg auswählen." },
              { cmd: "ip address 100.0.0.2 255.255.255.252", explanation: "Gegenstelle zu Hamburg Gig0/1 (100.0.0.1) im Transfernetz 100.0.0.0/30." },
              { cmd: "no shutdown", explanation: "Interface aktivieren." },
              { cmd: "exit", explanation: "Zurück in den globalen Konfigurationsmodus." },
              { cmd: "interface GigabitEthernet0/1", explanation: "Interface Richtung Internet1 auswählen." },
              { cmd: "ip address 2.2.2.1 255.255.255.252", explanation: "Transfernetz 2.2.2.0/30 zum Core-Router Internet1." },
              { cmd: "no shutdown", explanation: "Interface aktivieren." },
              { cmd: "exit", explanation: "Zurück in den globalen Konfigurationsmodus." },
              { cmd: "ip route 0.0.0.0 0.0.0.0 2.2.2.2", explanation: "Default-Route in den Core (Internet1). ISP1 kennt nur seine beiden Transfernetze — alles andere geht nach oben." },
              { cmd: "end", explanation: "Zurück in den privilegierten EXEC (ISP1#)." },
              { cmd: "copy running-config startup-config", explanation: "Konfiguration dauerhaft speichern." },
            ],
          },
        ],
      },
      {
        title: "3) Router Internet1 — Core-Hub mit drei Interfaces und statischen Routen",
        blocks: [
          {
            device: "Internet1",
            mode: "privileged",
            modeLabel: "Router>",
            commands: [
              { cmd: "enable", explanation: "In den privilegierten EXEC-Modus wechseln." },
              { cmd: "configure terminal", explanation: "In den globalen Konfigurationsmodus wechseln." },
              { cmd: "hostname Internet1", explanation: "Gerätename setzen." },
              { cmd: "no ip domain-lookup", explanation: "DNS-Auflösung bei Tippfehlern abschalten." },
              { cmd: "interface GigabitEthernet0/2", explanation: "Interface Richtung ISP1 auswählen." },
              { cmd: "ip address 2.2.2.2 255.255.255.252", explanation: "Gegenstelle zu ISP1 Gig0/1 (2.2.2.1)." },
              { cmd: "no shutdown", explanation: "Interface aktivieren." },
              { cmd: "exit", explanation: "Zurück in den globalen Konfigurationsmodus." },
              { cmd: "interface GigabitEthernet0/1", explanation: "Interface Richtung Internet2 auswählen." },
              { cmd: "ip address 1.1.1.1 255.255.255.252", explanation: "Transfernetz 1.1.1.0/30 zu Internet2 (dahinter liegt der Webserver)." },
              { cmd: "no shutdown", explanation: "Interface aktivieren." },
              { cmd: "exit", explanation: "Zurück in den globalen Konfigurationsmodus." },
              { cmd: "interface GigabitEthernet0/0", explanation: "Interface Richtung ISP2 auswählen." },
              { cmd: "ip address 3.3.3.1 255.255.255.252", explanation: "Transfernetz 3.3.3.0/30 zu ISP2 (dahinter liegt Bremen)." },
              { cmd: "no shutdown", explanation: "Interface aktivieren." },
              { cmd: "exit", explanation: "Zurück in den globalen Konfigurationsmodus." },
              { cmd: "ip route 100.0.0.0 255.255.255.252 2.2.2.1", explanation: "Rückweg zum Hamburg-Transfernetz über ISP1. Ohne diese Route kommt kein Antwortpaket bei Hamburg an." },
              { cmd: "ip route 200.0.0.0 255.255.255.252 3.3.3.2", explanation: "Weg zum Bremen-Transfernetz über ISP2 — die Grundlage für den späteren Tunnel Hamburg ↔ Bremen." },
              { cmd: "ip route 47.11.8.0 255.255.255.0 1.1.1.2", explanation: "Weg zum Webserver-Netz über Internet2." },
              { cmd: "end", explanation: "Zurück in den privilegierten EXEC (Internet1#)." },
              { cmd: "copy running-config startup-config", explanation: "Konfiguration dauerhaft speichern." },
            ],
          },
        ],
      },
      {
        title: "4) Router Internet2 — Interfaces und Default-Route (Webserver-Segment)",
        blocks: [
          {
            device: "Internet2",
            mode: "privileged",
            modeLabel: "Router>",
            commands: [
              { cmd: "enable", explanation: "In den privilegierten EXEC-Modus wechseln." },
              { cmd: "configure terminal", explanation: "In den globalen Konfigurationsmodus wechseln." },
              { cmd: "hostname Internet2", explanation: "Gerätename setzen." },
              { cmd: "no ip domain-lookup", explanation: "DNS-Auflösung bei Tippfehlern abschalten." },
              { cmd: "interface GigabitEthernet0/2", explanation: "Interface Richtung Internet1 auswählen." },
              { cmd: "ip address 1.1.1.2 255.255.255.252", explanation: "Gegenstelle zu Internet1 Gig0/1 (1.1.1.1)." },
              { cmd: "no shutdown", explanation: "Interface aktivieren." },
              { cmd: "exit", explanation: "Zurück in den globalen Konfigurationsmodus." },
              { cmd: "interface GigabitEthernet0/0", explanation: "Interface Richtung Webserver-Segment auswählen." },
              { cmd: "ip address 47.11.8.1 255.255.255.0", explanation: "Default Gateway für den Webserver 47.11.8.15 im Netz 47.11.8.0/24." },
              { cmd: "no shutdown", explanation: "Interface aktivieren." },
              { cmd: "exit", explanation: "Zurück in den globalen Konfigurationsmodus." },
              { cmd: "ip route 0.0.0.0 0.0.0.0 1.1.1.1", explanation: "Default-Route zurück in den Core. Internet2 kennt nur sein Transfernetz und das Webserver-Netz." },
              { cmd: "end", explanation: "Zurück in den privilegierten EXEC (Internet2#)." },
              { cmd: "copy running-config startup-config", explanation: "Konfiguration dauerhaft speichern." },
            ],
          },
        ],
      },
      {
        title: "5) Router ISP2 — Interfaces und Default-Route",
        blocks: [
          {
            device: "ISP2",
            mode: "privileged",
            modeLabel: "Router>",
            commands: [
              { cmd: "enable", explanation: "In den privilegierten EXEC-Modus wechseln." },
              { cmd: "configure terminal", explanation: "In den globalen Konfigurationsmodus wechseln." },
              { cmd: "hostname ISP2", explanation: "Gerätename setzen." },
              { cmd: "no ip domain-lookup", explanation: "DNS-Auflösung bei Tippfehlern abschalten." },
              { cmd: "interface GigabitEthernet0/1", explanation: "Interface Richtung Internet1 auswählen." },
              { cmd: "ip address 3.3.3.2 255.255.255.252", explanation: "Gegenstelle zu Internet1 Gig0/0 (3.3.3.1)." },
              { cmd: "no shutdown", explanation: "Interface aktivieren." },
              { cmd: "exit", explanation: "Zurück in den globalen Konfigurationsmodus." },
              { cmd: "interface GigabitEthernet0/2", explanation: "Interface Richtung Bremen auswählen." },
              { cmd: "ip address 200.0.0.2 255.255.255.252", explanation: "Gegenstelle zu Bremen Gig0/1 (200.0.0.1) im Transfernetz 200.0.0.0/30." },
              { cmd: "no shutdown", explanation: "Interface aktivieren." },
              { cmd: "exit", explanation: "Zurück in den globalen Konfigurationsmodus." },
              { cmd: "ip route 0.0.0.0 0.0.0.0 3.3.3.1", explanation: "Default-Route in den Core (Internet1)." },
              { cmd: "end", explanation: "Zurück in den privilegierten EXEC (ISP2#)." },
              { cmd: "copy running-config startup-config", explanation: "Konfiguration dauerhaft speichern." },
            ],
          },
        ],
      },
      {
        title: "6) Router Bremen — Grundkonfiguration, Interfaces, Default-Route",
        blocks: [
          {
            device: "Bremen",
            mode: "privileged",
            modeLabel: "Router>",
            commands: [
              { cmd: "enable", explanation: "In den privilegierten EXEC-Modus wechseln." },
              { cmd: "configure terminal", explanation: "In den globalen Konfigurationsmodus wechseln." },
              { cmd: "hostname Bremen", explanation: "Gerätename setzen — Prompt wechselt auf Bremen(config)#." },
              { cmd: "no ip domain-lookup", explanation: "DNS-Auflösung bei Tippfehlern abschalten." },
              { cmd: "interface GigabitEthernet0/0", explanation: "LAN-Interface Richtung SW2 auswählen." },
              { cmd: "ip address 192.168.2.254 255.255.255.0", explanation: "LAN-IP = Default Gateway für PC2 und PC3 im Netz 192.168.2.0/24." },
              { cmd: "no shutdown", explanation: "Interface aktivieren." },
              { cmd: "exit", explanation: "Zurück in den globalen Konfigurationsmodus." },
              { cmd: "interface GigabitEthernet0/1", explanation: "WAN-Interface Richtung ISP2 auswählen." },
              { cmd: "ip address 200.0.0.1 255.255.255.252", explanation: "WAN-IP 200.0.0.1/30 — der lokale IPSec-Endpunkt (aus Sicht von Hamburg die Peer-Adresse)." },
              { cmd: "no shutdown", explanation: "WAN-Interface aktivieren." },
              { cmd: "exit", explanation: "Zurück in den globalen Konfigurationsmodus." },
              { cmd: "ip route 0.0.0.0 0.0.0.0 200.0.0.2", explanation: "Default-Route zum Provider ISP2." },
              { cmd: "end", explanation: "Zurück in den privilegierten EXEC (Bremen#)." },
              { cmd: "copy running-config startup-config", explanation: "Konfiguration dauerhaft speichern." },
            ],
          },
        ],
      },
      {
        title: "7) Switches SW1 und SW2 — Grundkonfiguration, Management-IP, Gateway",
        blocks: [
          {
            device: "SW1",
            mode: "privileged",
            modeLabel: "Switch>",
            commands: [
              { cmd: "enable", explanation: "In den privilegierten EXEC-Modus wechseln." },
              { cmd: "configure terminal", explanation: "In den globalen Konfigurationsmodus wechseln." },
              { cmd: "hostname SW1", explanation: "Gerätename für den Hamburg-Access-Switch." },
              { cmd: "no ip domain-lookup", explanation: "DNS-Auflösung bei Tippfehlern abschalten." },
              { cmd: "interface range FastEthernet0/1-24", explanation: "Alle Host-Ports gemeinsam auswählen (PC0 an Fa0/1, PC1 an Fa0/2, DHCP-Server an Fa0/24)." },
              { cmd: "switchport mode access", explanation: "Ports fest als Access-Ports setzen — kein DTP-Aushandeln, kein versehentlicher Trunk." },
              { cmd: "switchport access vlan 1", explanation: "Alle Hosts liegen im flachen Default-VLAN 1. Der Uplink Gig0/1 zu Hamburg bleibt ebenfalls Access-Port in VLAN 1." },
              { cmd: "exit", explanation: "Zurück in den globalen Konfigurationsmodus." },
              { cmd: "interface vlan 1", explanation: "Management-SVI auswählen — ein Switch braucht eine IP nur für die Verwaltung, nicht fürs Switching." },
              { cmd: "ip address 192.168.1.2 255.255.255.0", explanation: "Management-IP des Switches im LAN Hamburg." },
              { cmd: "no shutdown", explanation: "SVI aktivieren." },
              { cmd: "exit", explanation: "Zurück in den globalen Konfigurationsmodus." },
              { cmd: "ip default-gateway 192.168.1.254", explanation: "Default Gateway des Switches. Achtung: am Switch heißt der Befehl 'ip default-gateway', nicht 'ip route' — ein L2-Switch routet nicht." },
              { cmd: "end", explanation: "Zurück in den privilegierten EXEC (SW1#)." },
              { cmd: "copy running-config startup-config", explanation: "Konfiguration dauerhaft speichern." },
            ],
          },
          {
            device: "SW2",
            mode: "privileged",
            modeLabel: "Switch>",
            commands: [
              { cmd: "enable", explanation: "In den privilegierten EXEC-Modus wechseln." },
              { cmd: "configure terminal", explanation: "In den globalen Konfigurationsmodus wechseln." },
              { cmd: "hostname SW2", explanation: "Gerätename für den Bremen-Access-Switch." },
              { cmd: "no ip domain-lookup", explanation: "DNS-Auflösung bei Tippfehlern abschalten." },
              { cmd: "interface range FastEthernet0/1-24", explanation: "Alle Host-Ports gemeinsam auswählen (PC2 an Fa0/1, PC3 an Fa0/2)." },
              { cmd: "switchport mode access", explanation: "Ports fest als Access-Ports setzen." },
              { cmd: "switchport access vlan 1", explanation: "Alle Hosts im Default-VLAN 1. Der Uplink Gig0/2 zu Bremen bleibt ebenfalls Access-Port in VLAN 1." },
              { cmd: "exit", explanation: "Zurück in den globalen Konfigurationsmodus." },
              { cmd: "interface vlan 1", explanation: "Management-SVI auswählen." },
              { cmd: "ip address 192.168.2.2 255.255.255.0", explanation: "Management-IP des Switches im LAN Bremen." },
              { cmd: "no shutdown", explanation: "SVI aktivieren." },
              { cmd: "exit", explanation: "Zurück in den globalen Konfigurationsmodus." },
              { cmd: "ip default-gateway 192.168.2.254", explanation: "Default Gateway des Switches (LAN-Interface von Bremen)." },
              { cmd: "end", explanation: "Zurück in den privilegierten EXEC (SW2#)." },
              { cmd: "copy running-config startup-config", explanation: "Konfiguration dauerhaft speichern." },
            ],
          },
        ],
      },
      {
        title: "8) Endgeräte adressieren — PCs, DHCP-Server, Webserver",
        blocks: [
          {
            device: "PC0",
            mode: "desktop",
            modeLabel: "Desktop > IP Configuration",
            commands: [
              { cmd: "IP Address: 192.168.1.10\nSubnet Mask: 255.255.255.0\nDefault Gateway: 192.168.1.254", explanation: "PT: PC0 anklicken → Desktop-Tab → IP Configuration → Static. Gateway ist das LAN-Interface von Hamburg. PC0 ist später die Quelle für den interessanten VPN-Traffic." },
            ],
          },
          {
            device: "PC1",
            mode: "desktop",
            modeLabel: "Desktop > IP Configuration",
            commands: [
              { cmd: "IP Address: 192.168.1.20\nSubnet Mask: 255.255.255.0\nDefault Gateway: 192.168.1.254", explanation: "Zweiter Host im LAN Hamburg, gleiches Gateway." },
            ],
          },
          {
            device: "DHCP-Server",
            mode: "desktop",
            modeLabel: "Desktop > IP Configuration",
            commands: [
              { cmd: "IP Address: 192.168.1.11\nSubnet Mask: 255.255.255.0\nDefault Gateway: 192.168.1.254", explanation: "Der Server bekommt selbst immer eine STATISCHE Adresse (an SW1 Fa0/24). Optional kann unter Services → DHCP ein Pool für 192.168.1.0/24 mit Gateway .254 aktiviert werden; für dieses Lab sind die PCs bewusst statisch adressiert, damit die Ziel-IPs deterministisch bleiben." },
            ],
          },
          {
            device: "PC2",
            mode: "desktop",
            modeLabel: "Desktop > IP Configuration",
            commands: [
              { cmd: "IP Address: 192.168.2.10\nSubnet Mask: 255.255.255.0\nDefault Gateway: 192.168.2.254", explanation: "Erster Host im LAN Bremen — das spätere Ziel des Tunnel-Pings von PC0." },
            ],
          },
          {
            device: "PC3",
            mode: "desktop",
            modeLabel: "Desktop > IP Configuration",
            commands: [
              { cmd: "IP Address: 192.168.2.20\nSubnet Mask: 255.255.255.0\nDefault Gateway: 192.168.2.254", explanation: "Zweiter Host im LAN Bremen, gleiches Gateway." },
            ],
          },
          {
            device: "Webserver",
            mode: "desktop",
            modeLabel: "Desktop > IP Configuration",
            commands: [
              { cmd: "IP Address: 47.11.8.15\nSubnet Mask: 255.255.255.0\nDefault Gateway: 47.11.8.1", explanation: "Öffentlicher Server hinter Internet2. Dient später als Gegenprobe: Traffic dorthin wird NICHT vom Tunnel erfasst." },
            ],
          },
        ],
      },
      {
        title: "9) Underlay verifizieren — Peer erreichbar, LAN-zu-LAN noch NICHT",
        blocks: [
          {
            device: "Hamburg",
            mode: "privileged",
            modeLabel: "Hamburg#",
            commands: [
              { cmd: "show ip interface brief", explanation: "Kontrolle, dass Gig0/0 (192.168.1.254) und Gig0/1 (100.0.0.1) up/up sind." },
              { cmd: "show ip route", explanation: "Die Default-Route 0.0.0.0/0 via 100.0.0.2 muss stehen. Das ferne LAN 192.168.2.0/24 taucht NICHT auf — der Core kennt keine privaten Netze. Genau deshalb der Tunnel." },
              { cmd: "ping 200.0.0.1", explanation: "Erreichbarkeit der Bremen-WAN-Adresse über das Provider-Underlay. MUSS erfolgreich sein — IPSec setzt eine funktionierende IP-Verbindung zwischen den WAN-Peers voraus. Schlägt das fehl, stimmt das Core-Routing (Steps 2–5) nicht." },
            ],
          },
          {
            device: "PC0",
            mode: "desktop",
            modeLabel: "Desktop > Command Prompt",
            commands: [
              { cmd: "ping 192.168.2.10", explanation: "MUSS an dieser Stelle FEHLSCHLAGEN. Der Core routet 192.168.1.0/24 und 192.168.2.0/24 nicht — private Netze sind im Internet unbekannt. Genau dieses Problem löst der IPSec-Tunnel in den folgenden Schritten." },
            ],
          },
        ],
      },
      {
        title: "10) In den Konfig-Modus + IKE Phase 1 (ISAKMP-Policy, Hamburg)",
        blocks: [
          {
            device: "Hamburg",
            mode: "isakmp",
            modeLabel: "Hamburg#",
            commands: [
              { cmd: "configure terminal", explanation: "Vom privilegierten EXEC (Hamburg#) in den globalen Konfigurationsmodus (Hamburg(config)#) wechseln. Kurzform: conf t." },
              { cmd: "crypto isakmp policy 10", explanation: "Legt ISAKMP/IKE-Phase-1-Policy Nr. 10 an (niedrigere Nummer = höhere Priorität). Diese Policy handelt aus, WIE der sichere Management-Kanal (IKE-SA) aufgebaut wird." },
              { cmd: "encryption aes 256", explanation: "Verschlüsselung des IKE-Kanals mit AES-256. Muss auf beiden Peers identisch sein, sonst scheitert Phase 1." },
              { cmd: "hash sha", explanation: "Integritätsschutz per SHA-1 (HMAC). Beidseitig identisch." },
              { cmd: "authentication pre-share", explanation: "Peer-Authentisierung über Pre-Shared Key (statt Zertifikate). Bestimmt, dass im nächsten Schritt ein PSK definiert wird." },
              { cmd: "group 5", explanation: "Diffie-Hellman-Gruppe 5 (1536 Bit) für den Schlüsselaustausch. DH erzeugt ein gemeinsames Geheimnis, ohne es je über die Leitung zu schicken. Muss beidseitig gleich sein." },
              { cmd: "lifetime 86400", explanation: "Gültigkeitsdauer der IKE-SA (Phase 1) in Sekunden = 24 h. NICHT verwechseln mit der Phase-2-Lifetime in der Crypto Map." },
              { cmd: "exit", explanation: "Zurück in den globalen Konfigurationsmodus." },
            ],
          },
        ],
      },
      {
        title: "11) Pre-Shared Key (Hamburg)",
        blocks: [
          {
            device: "Hamburg",
            mode: "global",
            modeLabel: "Hamburg(config)#",
            commands: [
              { cmd: "crypto isakmp key ganzganzganzgeheim! address 200.0.0.1", explanation: "PSK an die PEER-IP (Bremen WAN 200.0.0.1) binden — nicht an ein Interface. Der Schlüssel inkl. Ausrufezeichen muss auf beiden Seiten ZEICHENGENAU identisch sein, sonst schlägt die Phase-1-Authentisierung fehl." },
            ],
          },
        ],
      },
      {
        title: "12) IKE Phase 2 — Transform-Set (Hamburg)",
        blocks: [
          {
            device: "Hamburg",
            mode: "global",
            modeLabel: "Hamburg(config)#",
            commands: [
              { cmd: "crypto ipsec transform-set HH-HB esp-aes 256 esp-sha-hmac", explanation: "Definiert den Phase-2-Schutz für die Nutzdaten: ESP mit AES-256 (Vertraulichkeit) + SHA-HMAC (Integrität). Der NAME (HH-HB) ist lokal frei wählbar und muss NICHT mit Bremen übereinstimmen — die PARAMETER (esp-aes 256, esp-sha-hmac) aber schon. Bindestrich statt '->' verwenden (Packet-Tracer-kompatibel)." },
            ],
          },
        ],
      },
      {
        title: "13) Crypto-ACL — interesting traffic (Hamburg)",
        blocks: [
          {
            device: "Hamburg",
            mode: "global",
            modeLabel: "Hamburg(config)#",
            commands: [
              { cmd: "access-list 100 permit ip 192.168.1.0 0.0.0.255 192.168.2.0 0.0.0.255", explanation: "Definiert, WELCHER Verkehr in den Tunnel soll — hier LAN Hamburg → LAN Bremen. permit = verschlüsseln. Alles andere (z. B. Richtung Webserver/Internet) bleibt unverschlüsselt. Alternativ als benannte ACL (ip access-list extended VPN-TRAFFIC) — funktional identisch, in der Praxis lesbarer; die nummerierte Variante bleibt hier die Referenz." },
            ],
          },
        ],
      },
      {
        title: "14) Crypto Map — alle Bausteine zusammenführen (Hamburg)",
        blocks: [
          {
            device: "Hamburg",
            mode: "crypto-map",
            modeLabel: "Hamburg(config)#",
            commands: [
              { cmd: "crypto map IPSEC-MAP 10 ipsec-isakmp", explanation: "Legt die Crypto Map an, die Peer + Transform-Set + ACL verbindet. 'ipsec-isakmp' = SAs dynamisch per IKE aushandeln. Beim Anlegen erscheint die NOTE 'This new crypto map will remain disabled until a peer and a valid access list have been configured.' — das ist KEIN Fehler; sie verschwindet, sobald peer + match address gesetzt sind." },
              { cmd: "set peer 200.0.0.1", explanation: "VPN-Gegenstelle = Bremen WAN 200.0.0.1." },
              { cmd: "set pfs group5", explanation: "Perfect Forward Secrecy mit DH-Gruppe 5: erzeugt für Phase 2 frisches Schlüsselmaterial, unabhängig von Phase 1. Schreibweise OHNE Leerzeichen: 'group5', nicht 'group 5'. Muss beidseitig gleich sein." },
              { cmd: "set security-association lifetime seconds 86400", explanation: "Phase-2-Lebensdauer der IPSec-SA (Default wäre 3600 s). Das Schlüsselwort 'seconds' ist PFLICHT, sonst Syntaxfehler; Maximum 86400 s. Nicht verwechseln mit der ISAKMP-'lifetime' aus Step 10 (Phase 1)." },
              { cmd: "set transform-set HH-HB", explanation: "Verknüpft den in Step 12 definierten Phase-2-Schutz mit dieser Crypto Map." },
              { cmd: "match address 100", explanation: "Verknüpft die Crypto-ACL 100 (Step 13): nur dieser Traffic wird verschlüsselt. Ab jetzt ist die Map vollständig und die NOTE-Warnung gegenstandslos." },
              { cmd: "exit", explanation: "Zurück in den globalen Modus." },
            ],
          },
        ],
      },
      {
        title: "15) Crypto Map aufs WAN-Interface (Hamburg)",
        blocks: [
          {
            device: "Hamburg",
            mode: "interface",
            modeLabel: "Hamburg(config-if)#",
            commands: [
              { cmd: "interface GigabitEthernet0/1", explanation: "Das WAN-/Outside-Interface Richtung ISP1 (100.0.0.1) — hier tritt der zu schützende Verkehr aus. NICHT das LAN-Interface." },
              { cmd: "crypto map IPSEC-MAP", explanation: "Aktiviert die Crypto Map auf dem Interface. Erst JETZT wird IPSec scharf. Erwartete Konsolenmeldung: %CRYPTO-6-ISAKMP_ON_OFF: ISAKMP is ON. Pro Interface ist nur EINE Crypto Map möglich." },
              { cmd: "end", explanation: "Verlässt den Konfigurationsmodus direkt zurück in den privilegierten EXEC (Hamburg#). Alternativ mehrfach exit." },
              { cmd: "copy running-config startup-config", explanation: "Speichert die laufende Konfiguration dauerhaft ins NVRAM (startup-config), damit sie einen Reload übersteht. Kurzform: write memory. Konfiguration Hamburg abgeschlossen." },
            ],
          },
        ],
      },
      {
        title: "16) Spiegelbildliche IPSec-Konfiguration auf Bremen (vollständig)",
        blocks: [
          {
            device: "Bremen",
            mode: "isakmp",
            modeLabel: "Bremen>",
            commands: [
              { cmd: "enable", explanation: "Auf dem Bremen-Router: vom User-EXEC (Bremen>) in den privilegierten EXEC-Modus (Bremen#) wechseln." },
              { cmd: "configure terminal", explanation: "In den globalen Konfigurationsmodus (Bremen(config)#) wechseln. Kurzform: conf t." },
              { cmd: "crypto isakmp policy 10", explanation: "Identische Phase-1-Policy wie Hamburg — die Parameter MÜSSEN matchen." },
              { cmd: "encryption aes 256", explanation: "AES-256, wie Hamburg." },
              { cmd: "hash sha", explanation: "SHA, wie Hamburg." },
              { cmd: "authentication pre-share", explanation: "Pre-Shared Key, wie Hamburg." },
              { cmd: "group 5", explanation: "DH-Gruppe 5, wie Hamburg." },
              { cmd: "lifetime 86400", explanation: "Phase-1-Lifetime 86400 s, wie Hamburg." },
              { cmd: "exit", explanation: "Zurück in den globalen Modus." },
            ],
          },
          {
            device: "Bremen",
            mode: "global",
            modeLabel: "Bremen(config)#",
            commands: [
              { cmd: "crypto isakmp key ganzganzganzgeheim! address 100.0.0.1", explanation: "GLEICHER Schlüssel wie Hamburg, aber gebunden an die PEER-IP Hamburg (100.0.0.1). Nur die Adresse ist spiegelverkehrt, der Key selbst ist identisch." },
              { cmd: "crypto ipsec transform-set HB-HH esp-aes 256 esp-sha-hmac", explanation: "Lokaler Name HB-HH (darf sich von Hamburgs HH-HB unterscheiden) — die Parameter esp-aes 256 + esp-sha-hmac sind identisch. Genau das ist entscheidend, nicht der Name." },
              { cmd: "access-list 100 permit ip 192.168.2.0 0.0.0.255 192.168.1.0 0.0.0.255", explanation: "SPIEGELBILDLICH zu Hamburg: Source = LAN Bremen, Destination = LAN Hamburg. Werden Source/Destination nicht korrekt vertauscht, gibt es einen Proxy-ID-Mismatch und Phase 2 kommt nicht hoch." },
            ],
          },
          {
            device: "Bremen",
            mode: "crypto-map",
            modeLabel: "Bremen(config)#",
            commands: [
              { cmd: "crypto map IPSEC-MAP 10 ipsec-isakmp", explanation: "Wie Hamburg — dieselbe NOTE-Warnung, bis peer + match address gesetzt sind." },
              { cmd: "set peer 100.0.0.1", explanation: "Gegenstelle = Hamburg WAN 100.0.0.1." },
              { cmd: "set pfs group5", explanation: "PFS Gruppe 5, wie Hamburg (Schreibweise group5)." },
              { cmd: "set security-association lifetime seconds 86400", explanation: "Phase-2-Lifetime 86400 s, wie Hamburg." },
              { cmd: "set transform-set HB-HH", explanation: "Lokales Transform-Set HB-HH verknüpfen." },
              { cmd: "match address 100", explanation: "Crypto-ACL 100 (Bremen → Hamburg) verknüpfen." },
              { cmd: "exit", explanation: "Zurück in den globalen Modus." },
            ],
          },
          {
            device: "Bremen",
            mode: "interface",
            modeLabel: "Bremen(config-if)#",
            commands: [
              { cmd: "interface GigabitEthernet0/1", explanation: "WAN-/Outside-Interface Richtung ISP2 (200.0.0.1)." },
              { cmd: "crypto map IPSEC-MAP", explanation: "Crypto Map aktivieren → ISAKMP is ON." },
              { cmd: "end", explanation: "Zurück in den privilegierten EXEC (Bremen#)." },
              { cmd: "copy running-config startup-config", explanation: "Bremen-Konfiguration dauerhaft speichern. Konfiguration Bremen abgeschlossen." },
            ],
          },
        ],
      },
      {
        title: "17) Tunnel aufbauen und verifizieren",
        blocks: [
          {
            device: "PC0",
            mode: "cli",
            modeLabel: "PC>",
            commands: [
              { cmd: "ping 192.168.2.10", explanation: "Interessanten Traffic erzeugen (LAN Hamburg → LAN Bremen), damit der Tunnel überhaupt aufgebaut wird. Der erste Ping kann verloren gehen, während IKE Phase 1+2 aushandelt — danach läuft es." },
            ],
          },
          {
            device: "Hamburg",
            mode: "privileged",
            modeLabel: "Hamburg#",
            commands: [
              { cmd: "show crypto isakmp sa", explanation: "Phase 1 prüfen: Zustand QM_IDLE + status ACTIVE = IKE-SA steht (Quick Mode idle). Ohne QM_IDLE ist Phase 1 nicht fertig — dann PSK/Policy prüfen." },
              { cmd: "show crypto ipsec sa", explanation: "Phase 2 prüfen: die Zähler #pkts encaps/encrypt und #pkts decaps/decrypt müssen auf BEIDEN Seiten steigen. Steigt nur encaps, decaps bleibt 0 → die Gegenseite antwortet nicht (ACL/Routing/Peer prüfen)." },
              { cmd: "show crypto map", explanation: "Zeigt Peer, Transform-Set, match address und das Interface-Binding — schnelle Gesamtübersicht der VPN-Konfiguration." },
            ],
          },
        ],
      },
      {
        title: "18) Gegenprobe — Selektivität der Crypto-ACL (Split Tunneling)",
        blocks: [
          {
            device: "PC0",
            mode: "cli",
            modeLabel: "PC>",
            commands: [
              { cmd: "ping 47.11.8.15", explanation: "Ping zum Webserver im Internet. Dieser Verkehr wird von der Crypto-ACL 100 NICHT erfasst (Ziel ist nicht 192.168.2.0/24) → er geht NICHT in den Tunnel. Der Ping selbst scheitert hier zusätzlich am fehlenden Rückweg: der Core kennt 192.168.1.0/24 nicht (ohne NAT/PAT). Entscheidend für diese Gegenprobe ist nicht der Ping-Erfolg, sondern dass der encaps-Zähler unverändert bleibt." },
            ],
          },
          {
            device: "Hamburg",
            mode: "privileged",
            modeLabel: "Hamburg#",
            commands: [
              { cmd: "show crypto ipsec sa", explanation: "Gegenprobe: der #pkts encaps-Zähler steigt bei diesem Webserver-Ping NICHT — Beweis, dass nur ACL-gematchter Traffic in den Tunnel geht (Split Tunneling / Selektivität der Crypto-ACL)." },
            ],
          },
        ],
      },
      {
        title: "19) Häufige Fehler & Troubleshooting",
        blocks: [
          {
            device: "Merke",
            mode: "info",
            modeLabel: "Häufige Fehler",
            commands: [
              { cmd: "ACLs spiegelbildlich halten", explanation: "Source/Destination auf der Gegenseite vertauschen — sonst Proxy-ID-Mismatch, Phase 2 kommt nicht hoch." },
              { cmd: "Transform-Set: Name lokal, Parameter global", explanation: "Der Name muss NICHT identisch sein, die Parameter (esp-aes 256 + esp-sha-hmac) auf beiden Seiten schon." },
              { cmd: "Keine Sonderzeichen im Namen", explanation: "'HH->HB' funktioniert in Packet Tracer nicht zuverlässig → 'HH-HB' verwenden." },
              { cmd: "set security-association lifetime seconds 86400", explanation: "Das Schlüsselwort 'seconds' (bzw. 'kilobytes') ist Pflicht, sonst Syntaxfehler. Maximum 86400 s." },
              { cmd: "set pfs group5 (ohne Leerzeichen)", explanation: "'group5', nicht 'group 5'. Im crypto-map-Modus hilft 'set pfs ?' bei der richtigen Schreibweise." },
              { cmd: "Zwei Lifetimes nicht verwechseln", explanation: "'lifetime' in der ISAKMP-Policy = Phase 1 (Default 86400 s); 'set security-association lifetime' in der Crypto Map = Phase 2 (Default 3600 s)." },
              { cmd: "PSK zeichengenau + an Peer-IP", explanation: "Muss exakt übereinstimmen, inkl. Ausrufezeichen. Der PSK ist an die Peer-IP gebunden, nicht ans Interface." },
              { cmd: "Crypto Map aufs WAN-Interface", explanation: "Gehört aufs Outside-/WAN-Interface, nicht aufs LAN. Pro Interface nur EINE Crypto Map." },
              { cmd: "DH-Group + Encryption müssen matchen", explanation: "Group 5 (1536 Bit) und AES-256 auf beiden Seiten identisch." },
              { cmd: "Tunnel braucht interessanten Traffic", explanation: "Ein Ping vom Router selbst (Source = WAN-IP) matcht die ACL nicht → immer von PC0 zu PC2 pingen bzw. 'ping 192.168.2.10 source 192.168.1.254'." },
              { cmd: "NAT/PAT vor VPN ausnehmen", explanation: "Falls NAT aktiv ist: in der NAT-ACL 'deny ip 192.168.1.0 0.0.0.255 192.168.2.0 0.0.0.255' VOR den Overload-Eintrag setzen, sonst wird übersetzt und matcht die Crypto-ACL nicht mehr (optionaler Advanced-Step)." },
            ],
          },
        ],
      },
    ],
    verifyCommands: [
      { cmd: "show ip interface brief (alle 6 Router)", expected: "Alle konfigurierten Interfaces up/up — kein 'administratively down' (no shutdown vergessen)" },
      { cmd: "ping Hamburg → 200.0.0.1 (vor IPSec)", expected: "Erfolgreich — Core-Routing/Underlay steht, Voraussetzung für IKE" },
      { cmd: "ping PC0 → PC2 (vor IPSec)", expected: "Schlägt fehl — der Core routet keine privaten Netze. Genau das löst der Tunnel" },
      { cmd: "show crypto isakmp sa (Hamburg & Bremen)", expected: "Zustand QM_IDLE, status ACTIVE — IKE-SA (Phase 1) steht auf beiden Seiten" },
      { cmd: "show crypto ipsec sa (Hamburg & Bremen)", expected: "#pkts encaps UND #pkts decaps steigen beidseitig — Phase 2 verschlüsselt bidirektional" },
      { cmd: "show crypto map (Hamburg & Bremen)", expected: "Peer, transform-set, match address 100 und Interface-Binding korrekt angezeigt" },
      { cmd: "ping PC0 → PC2 (192.168.2.x)", expected: "Erfolgreich — LAN-zu-LAN läuft durch den Tunnel (erster Ping ggf. verloren, während IKE aushandelt)" },
      { cmd: "ping PC0 → Webserver 47.11.8.15", expected: "encaps-Zähler steigt NICHT — Traffic geht nicht in den Tunnel (ohne NAT scheitert der Ping am fehlenden Rückweg)" },
    ],
    glossary: [
      { term: "ISAKMP / IKE", def: "Internet Security Association and Key Management Protocol — das Aushandlungsprotokoll (IKE) für IPSec. Läuft über UDP 500." },
      { term: "IKE Phase 1", def: "Baut den sicheren Management-Kanal (IKE-SA) zwischen den Peers auf: ISAKMP-Policy (Encryption/Hash/DH/Auth/Lifetime) + Peer-Authentisierung (PSK). Ergebnis: Zustand QM_IDLE." },
      { term: "IKE Phase 2 (Quick Mode)", def: "Handelt unter dem Schutz von Phase 1 die IPSec-SAs für die eigentlichen Nutzdaten aus: Transform-Set + Crypto-ACL + PFS." },
      { term: "QM_IDLE", def: "Zustand in 'show crypto isakmp sa': Quick Mode idle = Phase 1 steht, IKE-SA aufgebaut und bereit. Nur mit QM_IDLE + ACTIVE ist die Basis für Phase 2 gelegt." },
      { term: "ESP", def: "Encapsulating Security Payload (IP-Protokoll 50): verschlüsselt UND authentifiziert die Nutzdaten. Für Vertraulichkeit immer ESP (nicht AH)." },
      { term: "AH", def: "Authentication Header (IP-Protokoll 51): authentifiziert nur, verschlüsselt NICHT — daher für Vertraulichkeit ungeeignet." },
      { term: "Transform-Set", def: "Definiert den Phase-2-Schutz (z. B. esp-aes 256 esp-sha-hmac). Name lokal frei, Parameter müssen beidseitig gleich sein." },
      { term: "Crypto-ACL (interesting traffic)", def: "permit-ACL, die festlegt, welcher Verkehr verschlüsselt wird. Muss auf beiden Peers spiegelbildlich sein (Source/Destination vertauscht)." },
      { term: "Crypto Map", def: "Bindet Peer + Transform-Set + Crypto-ACL + PFS/Lifetime zusammen und wird aufs WAN-/Outside-Interface gelegt. Pro Interface nur eine." },
      { term: "PFS (set pfs group5)", def: "Perfect Forward Secrecy: erzeugt für Phase 2 frisches DH-Schlüsselmaterial, unabhängig von Phase 1. Schreibweise 'group5' ohne Leerzeichen." },
      { term: "Pre-Shared Key (PSK)", def: "Gemeinsames Geheimnis zur Peer-Authentisierung, an die Peer-IP gebunden. Muss zeichengenau (inkl. Sonderzeichen) beidseitig gleich sein." },
      { term: "Zwei Lifetimes", def: "'lifetime' in der ISAKMP-Policy = Phase 1 (Default 86400 s); 'set security-association lifetime seconds' in der Crypto Map = Phase 2 (Default 3600 s). Nicht verwechseln." },
      { term: "enable / configure terminal", def: "enable wechselt vom User-EXEC (>) in den privilegierten EXEC (#); configure terminal (conf t) öffnet von dort den globalen Konfigurationsmodus ((config)#)." },
      { term: "end / copy running-config startup-config", def: "end springt aus jedem Config-Untermodus direkt zurück nach #; copy running-config startup-config (write memory) speichert die Konfiguration dauerhaft ins NVRAM." },
      { term: "ip route (statische Route)", def: "Trägt manuell einen Weg in die Routing-Tabelle ein: 'ip route <Ziel> <Maske> <Next-Hop>'. Mit 0.0.0.0 0.0.0.0 wird daraus die Default-Route für alles Unbekannte." },
      { term: "ip default-gateway (Switch)", def: "Gateway eines reinen L2-Switches für seinen eigenen Management-Verkehr. Nicht mit 'ip route' verwechseln — ein L2-Switch routet keinen Nutzerverkehr." },
      { term: "Transfernetz /30", def: "Punkt-zu-Punkt-Netz mit genau 2 nutzbaren Adressen (z. B. 100.0.0.0/30 → .1 und .2). Standard für Router-zu-Router-Links im WAN." },
    ],
  },
];
