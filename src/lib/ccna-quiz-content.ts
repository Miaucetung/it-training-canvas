// ============================================================
// CCNA 200-301 Quiz Content
// Quellengrundlage: Networking Handout zur Vorbereitung auf
// die CCNA Zertifizierung 200-301 von Ralf Pohlmann (2021)
// ============================================================

import type { Quiz } from "./types";

// ────────────────────────────────────────────────────────────
// Helper
// ────────────────────────────────────────────────────────────
let _c = 0;
const uid = () => `ccna-${++_c}`;

// ============================================================
// QUIZ 1: Netzwerkgrundlagen & OSI-Modell
// ============================================================
export const QUIZ_NETZWERKGRUNDLAGEN: Quiz = {
  id: "ccna-quiz-netzwerkgrundlagen",
  title: "CCNA: Netzwerkgrundlagen & OSI-Modell",
  description: "OSI-Modell, TCP/IP, Netzwerkgeräte, Topologien und grundlegende Konzepte",
  passingScore: 70,
  shuffleQuestions: true,
  questions: [
    {
      id: uid(), type: "single-choice", points: 10,
      text: "Auf welcher OSI-Schicht arbeitet ein Router und welches Kriterium verwendet er zur Weiterleitung?",
      explanation: "Router arbeiten auf Schicht 3 (Network Layer) und verwenden IP-Adressen zur Weiterleitung von Paketen zwischen Netzwerken.",
      answers: [
        { id: "a", text: "Schicht 1 – MAC-Adressen", isCorrect: false },
        { id: "b", text: "Schicht 2 – MAC-Adressen", isCorrect: false },
        { id: "c", text: "Schicht 3 – IP-Adressen", isCorrect: true },
        { id: "d", text: "Schicht 4 – TCP-Ports", isCorrect: false },
      ],
    },
    {
      id: uid(), type: "single-choice", points: 10,
      text: "Auf welcher OSI-Schicht arbeitet ein Switch und welches Kriterium verwendet er zur Weiterleitung?",
      explanation: "Ein Switch arbeitet auf Schicht 2 (Data Link Layer) und verwendet MAC-Adressen, um Frames an den richtigen Port weiterzuleiten.",
      answers: [
        { id: "a", text: "Schicht 1 – kein Kriterium (Broadcast)", isCorrect: false },
        { id: "b", text: "Schicht 2 – MAC-Adressen", isCorrect: true },
        { id: "c", text: "Schicht 3 – IP-Adressen", isCorrect: false },
        { id: "d", text: "Schicht 4 – TCP-Ports", isCorrect: false },
      ],
    },
    {
      id: uid(), type: "multiple-choice", points: 15,
      text: "Welche der folgenden Aussagen zum OSI-Modell und TCP/IP-Modell sind korrekt? (Mehrere Antworten möglich)",
      explanation: "Das OSI-Modell hat 7 Schichten, TCP/IP hat 4. Beide Modelle beschreiben die Datenkapselung (Encapsulation). Das OSI-Modell ist ein Referenzmodell, TCP/IP ist das praktisch eingesetzte Protokollmodell.",
      answers: [
        { id: "a", text: "Das OSI-Modell hat 7 Schichten", isCorrect: true },
        { id: "b", text: "Das TCP/IP-Modell hat 5 Schichten", isCorrect: false },
        { id: "c", text: "Beide Modelle beschreiben Encapsulation/Decapsulation", isCorrect: true },
        { id: "d", text: "Das TCP/IP-Modell hat 4 Schichten", isCorrect: true },
        { id: "e", text: "OSI Schicht 3 entspricht TCP/IP Network Access Layer", isCorrect: false },
      ],
    },
    {
      id: uid(), type: "single-choice", points: 10,
      text: "Welche Netzwerktopologie bietet die höchste Redundanz?",
      explanation: "Bei einem fully meshed Netzwerk ist jeder Knoten mit jedem anderen direkt verbunden – maximale Redundanz, aber höchster Aufwand.",
      answers: [
        { id: "a", text: "Bus-Topologie", isCorrect: false },
        { id: "b", text: "Star-Topologie", isCorrect: false },
        { id: "c", text: "Fully Meshed Topologie", isCorrect: true },
        { id: "d", text: "Ring-Topologie", isCorrect: false },
      ],
    },
    {
      id: uid(), type: "true-false", points: 5,
      text: "Bandbreite und Durchsatz sind gleichbedeutende Begriffe.",
      explanation: "Falsch. Bandbreite ist die theoretische maximale Datenrate eines Links. Durchsatz (Throughput) ist die tatsächlich erreichte Datenrate unter realen Bedingungen.",
      answers: [
        { id: "a", text: "Wahr", isCorrect: false },
        { id: "b", text: "Falsch", isCorrect: true },
      ],
    },
    {
      id: uid(), type: "single-choice", points: 10,
      text: "In welcher Schicht des Hierarchical Network Models befinden sich die Access-Switches?",
      explanation: "Im 3-Layer Hierarchical Model: Core Layer (Backbone), Distribution Layer (Routing/Policies), Access Layer (Endgeräteanschluss).",
      answers: [
        { id: "a", text: "Core Layer", isCorrect: false },
        { id: "b", text: "Distribution Layer", isCorrect: false },
        { id: "c", text: "Access Layer", isCorrect: true },
        { id: "d", text: "Management Layer", isCorrect: false },
      ],
    },
    {
      id: uid(), type: "multiple-choice", points: 15,
      text: "Welche der folgenden sind Eigenschaften eines Netzwerks, die 'Skalierbarkeit' beschreiben? (Mehrere Antworten möglich)",
      explanation: "Skalierbarkeit beschreibt die Fähigkeit eines Netzwerks, zu wachsen ohne an Leistung zu verlieren. Sie beinhaltet Erweiterbarkeit, Verwaltbarkeit und Anpassungsfähigkeit.",
      answers: [
        { id: "a", text: "Das Netzwerk kann ohne Performanceverlust wachsen", isCorrect: true },
        { id: "b", text: "Das Netzwerk bietet verschlüsselte Verbindungen", isCorrect: false },
        { id: "c", text: "Neue Geräte können einfach hinzugefügt werden", isCorrect: true },
        { id: "d", text: "Das Netzwerk hat redundante Pfade", isCorrect: false },
      ],
    },
    {
      id: uid(), type: "single-choice", points: 10,
      text: "Was beschreibt der Begriff 'Encapsulation' (Kapselung)?",
      explanation: "Encapsulation: Jede OSI-Schicht fügt beim Senden einen Header (und ggf. Trailer) hinzu. Decapsulation ist der umgekehrte Vorgang beim Empfangen.",
      answers: [
        { id: "a", text: "Verschlüsselung von Daten für sichere Übertragung", isCorrect: false },
        { id: "b", text: "Hinzufügen von Header-Informationen durch jede OSI-Schicht beim Senden", isCorrect: true },
        { id: "c", text: "Komprimierung von Daten zur Bandbreitenreduzierung", isCorrect: false },
        { id: "d", text: "Fehlerkorrektur auf Schicht 2", isCorrect: false },
      ],
    },
  ],
};

// ============================================================
// QUIZ 2: IPv4 Adressierung & Subnetting
// ============================================================
export const QUIZ_IPV4: Quiz = {
  id: "ccna-quiz-ipv4",
  title: "CCNA: IPv4 Adressierung & Subnetting",
  description: "IP-Adressen, Subnetzmasken, CIDR, Subnetting, Supernetting und spezielle Adressen",
  passingScore: 70,
  shuffleQuestions: true,
  questions: [
    {
      id: uid(), type: "single-choice", points: 10,
      text: "Welche Subnetzmaske gehört zu einem /24-Netzwerk?",
      explanation: "/24 = erste 24 Bits sind Netzwerkanteil → 255.255.255.0",
      answers: [
        { id: "a", text: "255.255.0.0", isCorrect: false },
        { id: "b", text: "255.255.255.0", isCorrect: true },
        { id: "c", text: "255.255.255.128", isCorrect: false },
        { id: "d", text: "255.0.0.0", isCorrect: false },
      ],
    },
    {
      id: uid(), type: "multiple-choice", points: 15,
      text: "Welche der folgenden sind private IP-Adressbereiche nach RFC 1918? (Mehrere Antworten möglich)",
      explanation: "Private Adressbereiche: 10.0.0.0/8, 172.16.0.0/12, 192.168.0.0/16 – diese werden im Internet nicht geroutet.",
      answers: [
        { id: "a", text: "10.0.0.0 – 10.255.255.255", isCorrect: true },
        { id: "b", text: "172.16.0.0 – 172.31.255.255", isCorrect: true },
        { id: "c", text: "192.168.0.0 – 192.168.255.255", isCorrect: true },
        { id: "d", text: "169.254.0.0 – 169.254.255.255", isCorrect: false },
        { id: "e", text: "203.0.113.0 – 203.0.113.255", isCorrect: false },
      ],
    },
    {
      id: uid(), type: "single-choice", points: 10,
      text: "Wie viele Hosts können in einem /26-Netzwerk adressiert werden?",
      explanation: "/26 → 6 Host-Bits → 2^6 - 2 = 62 nutzbare Hosts (minus Netzwerk- und Broadcast-Adresse).",
      answers: [
        { id: "a", text: "30", isCorrect: false },
        { id: "b", text: "62", isCorrect: true },
        { id: "c", text: "126", isCorrect: false },
        { id: "d", text: "64", isCorrect: false },
      ],
    },
    {
      id: uid(), type: "single-choice", points: 10,
      text: "Welche Adresse ist die Broadcast-Adresse des Netzes 192.168.10.0/28?",
      explanation: "/28 → Subnetzmaske 255.255.255.240 → Block-Größe 16. Netz: .0, Broadcast: .15",
      answers: [
        { id: "a", text: "192.168.10.255", isCorrect: false },
        { id: "b", text: "192.168.10.16", isCorrect: false },
        { id: "c", text: "192.168.10.15", isCorrect: true },
        { id: "d", text: "192.168.10.14", isCorrect: false },
      ],
    },
    {
      id: uid(), type: "multiple-choice", points: 15,
      text: "Welche der folgenden sind Special-Use IPv4-Adressen? (Mehrere Antworten möglich)",
      explanation: "0.0.0.0 (unspezifisch), 127.0.0.1 (Loopback), 169.254.x.x (APIPA/Link-local), 255.255.255.255 (Broadcast) sind Special-Use-Adressen.",
      answers: [
        { id: "a", text: "0.0.0.0 (unspezifische Adresse)", isCorrect: true },
        { id: "b", text: "127.0.0.1 (Loopback)", isCorrect: true },
        { id: "c", text: "169.254.0.0/16 (APIPA / Link-local)", isCorrect: true },
        { id: "d", text: "10.0.0.0 (privates Netz)", isCorrect: false },
        { id: "e", text: "255.255.255.255 (Limited Broadcast)", isCorrect: true },
      ],
    },
    {
      id: uid(), type: "single-choice", points: 10,
      text: "Ein Unternehmen benötigt 5 Subnetze mit je mindestens 20 Hosts. Welches /27-Netz bietet genug Hosts pro Subnetz?",
      explanation: "/27 → 5 Host-Bits → 2^5 - 2 = 30 Hosts. Das reicht für 20 Hosts und bietet 8 mögliche /27-Subnetze in einem /24.",
      answers: [
        { id: "a", text: "/27 – 30 Hosts pro Subnetz – geeignet", isCorrect: true },
        { id: "b", text: "/28 – 14 Hosts pro Subnetz – nicht ausreichend", isCorrect: false },
        { id: "c", text: "/26 – 62 Hosts pro Subnetz – zu groß", isCorrect: false },
        { id: "d", text: "/29 – 6 Hosts pro Subnetz – nicht ausreichend", isCorrect: false },
      ],
    },
    {
      id: uid(), type: "text-input", points: 10,
      text: "Notieren Sie die Netzwerkadresse (in CIDR-Notation) des Netzes, zu dem der Host 172.16.100.200/22 gehört.",
      explanation: "/22 → Subnetzmaske 255.255.252.0. 100 in Binär: 01100100. 252 in Binär: 11111100. AND: 01100100 AND 11111100 = 01100100 = 100 → Netz: 172.16.100.0/22. Korrekt: 172.16.100.0/22",
      answers: [
        { id: "a", text: "172.16.100.0/22", isCorrect: true },
        { id: "b", text: "172.16.100.0", isCorrect: true },
      ],
    },
    {
      id: uid(), type: "single-choice", points: 10,
      text: "Was bedeutet VLSM (Variable Length Subnet Masking)?",
      explanation: "VLSM erlaubt die Verwendung unterschiedlicher Subnetzmasken-Längen innerhalb desselben Adressraums – optimal für effiziente IP-Adressvergabe.",
      answers: [
        { id: "a", text: "Alle Subnetze haben die gleiche Subnetzmaske", isCorrect: false },
        { id: "b", text: "Subnetzmasken können variabel (unterschiedlich lang) sein", isCorrect: true },
        { id: "c", text: "Subnetze können mit variablen VLANs kombiniert werden", isCorrect: false },
        { id: "d", text: "Eine spezielle Methode für IPv6-Adressierung", isCorrect: false },
      ],
    },
  ],
};

// ============================================================
// QUIZ 3: IPv6
// ============================================================
export const QUIZ_IPV6: Quiz = {
  id: "ccna-quiz-ipv6",
  title: "CCNA: IPv6 Grundlagen & Adressierung",
  description: "IPv6-Adressen, NDP, SLAAC, OSPFv3 und der Vergleich mit IPv4",
  passingScore: 70,
  shuffleQuestions: true,
  questions: [
    {
      id: uid(), type: "single-choice", points: 10,
      text: "Wie lang ist eine IPv6-Adresse?",
      explanation: "IPv6-Adressen sind 128 Bit lang, dargestellt als 8 Gruppen à 4 Hex-Ziffern (z.B. 2001:0db8:85a3:0000:0000:8a2e:0370:7334).",
      answers: [
        { id: "a", text: "32 Bit", isCorrect: false },
        { id: "b", text: "64 Bit", isCorrect: false },
        { id: "c", text: "128 Bit", isCorrect: true },
        { id: "d", text: "256 Bit", isCorrect: false },
      ],
    },
    {
      id: uid(), type: "multiple-choice", points: 15,
      text: "Welche der folgenden sind gültige Möglichkeiten, eine IPv6-Adresse zu kürzen? (Mehrere Antworten möglich)",
      explanation: "Führende Nullen in einer Gruppe dürfen weggelassen werden. Eine oder mehr aufeinanderfolgende Gruppen nur aus Nullen dürfen genau einmal durch '::' ersetzt werden.",
      answers: [
        { id: "a", text: "Führende Nullen in einer Gruppe weglassen (0db8 → db8)", isCorrect: true },
        { id: "b", text: "Aufeinanderfolgende Null-Gruppen durch '::' ersetzen (einmalig)", isCorrect: true },
        { id: "c", text: "Aufeinanderfolgende Null-Gruppen mehrmals durch '::' ersetzen", isCorrect: false },
        { id: "d", text: "Alle Nullen in der Adresse entfernen", isCorrect: false },
      ],
    },
    {
      id: uid(), type: "single-choice", points: 10,
      text: "Welches Protokoll ersetzt ARP in IPv6-Netzwerken?",
      explanation: "NDP (Neighbor Discovery Protocol) ersetzt ARP in IPv6. Es nutzt ICMPv6-Nachrichten wie Neighbor Solicitation/Advertisement.",
      answers: [
        { id: "a", text: "DHCP", isCorrect: false },
        { id: "b", text: "NDP – Neighbor Discovery Protocol", isCorrect: true },
        { id: "c", text: "ICMPv4", isCorrect: false },
        { id: "d", text: "SLAAC", isCorrect: false },
      ],
    },
    {
      id: uid(), type: "single-choice", points: 10,
      text: "Was ist SLAAC (Stateless Address Autoconfiguration)?",
      explanation: "SLAAC ermöglicht Hosts, sich automatisch eine IPv6-Adresse zu konfigurieren, ohne DHCP-Server. Grundlage: Router Advertisement + Interface Identifier.",
      answers: [
        { id: "a", text: "Eine Methode zur statischen IPv6-Adresszuweisung durch einen Admin", isCorrect: false },
        { id: "b", text: "Automatische IPv6-Adresskonfiguration ohne DHCPv6-Server", isCorrect: true },
        { id: "c", text: "Ein Protokoll zur Verteilung von IPv6-Routen", isCorrect: false },
        { id: "d", text: "Der Nachfolger von DHCPv4", isCorrect: false },
      ],
    },
    {
      id: uid(), type: "multiple-choice", points: 15,
      text: "Welche der folgenden sind neue LSA-Typen, die ausschließlich in OSPFv3 (für IPv6) eingeführt wurden? (Mehrere Antworten möglich)",
      explanation: "OSPFv3 führte LSA Type 8 (Link LSA) und LSA Type 9 (Intra-Area-Prefix LSA) neu ein. Type 7 (NSSA) und Type 3 existierten schon in OSPFv2.",
      answers: [
        { id: "a", text: "LSA Type 8 – Link LSA", isCorrect: true },
        { id: "b", text: "LSA Type 7 – NSSA LSA", isCorrect: false },
        { id: "c", text: "LSA Type 9 – Intra-Area-Prefix LSA", isCorrect: true },
        { id: "d", text: "LSA Type 3 – Interarea-Prefix LSA", isCorrect: false },
      ],
    },
    {
      id: uid(), type: "single-choice", points: 10,
      text: "Über welche IPv6-Adresse kommunizieren OSPFv3-Router miteinander?",
      explanation: "OSPFv3-Router verwenden Link-Local-IPv6-Adressen (fe80::/10) als Quelladresse für OSPF-Nachrichten.",
      answers: [
        { id: "a", text: "Höchste Global Unicast IPv6-Adresse auf dem Interface", isCorrect: false },
        { id: "b", text: "Link-Local IPv6-Adresse auf dem Interface", isCorrect: true },
        { id: "c", text: "Kleinste Global Unicast IPv6-Adresse auf dem Interface", isCorrect: false },
        { id: "d", text: "Administrativ festgelegte OSPFv3 Communication ID", isCorrect: false },
      ],
    },
    {
      id: uid(), type: "single-choice", points: 10,
      text: "Mit welchem Kommando wird OSPFv3 auf einer Schnittstelle fa 0/0 (Prozess-ID 1, Area 0) aktiviert?",
      explanation: "OSPFv3 wird interfacebasiert konfiguriert: im Interface-Konfigurationsmodus mit 'ipv6 ospf [prozess-id] area [area-id]'.",
      answers: [
        { id: "a", text: "(config)# ospfv3 1 interface fa 0/0 area 0", isCorrect: false },
        { id: "b", text: "(config-router)# ipv6 interface fa 0/0 area 0", isCorrect: false },
        { id: "c", text: "(config-if)# ipv6 ospf 1 area 0", isCorrect: true },
        { id: "d", text: "(config-if)# ospfv3 1 area 0", isCorrect: false },
      ],
    },
    {
      id: uid(), type: "multiple-choice", points: 15,
      text: "Welche Methoden sind funktional, wenn OSPF in einem dual-stack IPv4/IPv6-Netzwerk für beide Protokolle eingesetzt wird? (Mehrere Antworten möglich)",
      explanation: "Möglich: Ein OSPFv3-Prozess mit je einer address-family für IPv4 und IPv6 ODER zwei parallele Prozesse (OSPFv2 für IPv4 + OSPFv3 für IPv6).",
      answers: [
        { id: "a", text: "Zwei Prozesse: OSPFv3 für IPv4 + OSPFv2 für IPv6 (falsche Zuordnung)", isCorrect: false },
        { id: "b", text: "Ein OSPFv3-Prozess mit address-family für IPv4 und IPv6", isCorrect: true },
        { id: "c", text: "OSPF kann in dual-stack nicht für beide Protokolle verwendet werden", isCorrect: false },
        { id: "d", text: "Zwei Prozesse: OSPFv2 für IPv4 + OSPFv3 für IPv6", isCorrect: true },
      ],
    },
  ],
};

// ============================================================
// QUIZ 4: DHCP
// ============================================================
export const QUIZ_DHCP: Quiz = {
  id: "ccna-quiz-dhcp",
  title: "CCNA: DHCP",
  description: "DHCP-Nachrichten, DORA-Ablauf, Cisco DHCP-Server und Relay-Agent",
  passingScore: 70,
  shuffleQuestions: true,
  questions: [
    {
      id: uid(), type: "single-choice", points: 10,
      text: "Welche Abkürzung beschreibt den korrekten Ablauf einer DHCP-Anfrage?",
      explanation: "DORA: Discover → Offer → Request → Ack. Der Client sendet Discover, der Server antwortet mit Offer, der Client fordert an (Request), der Server bestätigt (Ack).",
      answers: [
        { id: "a", text: "DROA (Discover, Request, Offer, Ack)", isCorrect: false },
        { id: "b", text: "DORA (Discover, Offer, Request, Ack)", isCorrect: true },
        { id: "c", text: "DARO (Discover, Ack, Request, Offer)", isCorrect: false },
        { id: "d", text: "ROAD (Request, Offer, Ack, Discover)", isCorrect: false },
      ],
    },
    {
      id: uid(), type: "multiple-choice", points: 15,
      text: "Welche Parameter werden typischerweise durch einen DHCP-Server an einen Client vergeben? (Mehrere Antworten möglich)",
      explanation: "DHCP vergibt typischerweise: IP-Adresse, Subnetzmaske, Default-Gateway und DNS-Server-Adresse(n).",
      answers: [
        { id: "a", text: "IP-Adresse", isCorrect: true },
        { id: "b", text: "Subnetzmaske", isCorrect: true },
        { id: "c", text: "Default-Gateway", isCorrect: true },
        { id: "d", text: "DNS-Server-Adresse", isCorrect: true },
        { id: "e", text: "MAC-Adresse des Clients", isCorrect: false },
      ],
    },
    {
      id: uid(), type: "single-choice", points: 10,
      text: "Welche UDP-Ports verwendet DHCP für Server (67) und Client (68)?",
      explanation: "DHCP verwendet UDP: Server hört auf Port 67, Clients senden an Port 67 und empfangen auf Port 68.",
      answers: [
        { id: "a", text: "Server Port 53, Client Port 68", isCorrect: false },
        { id: "b", text: "Server Port 67, Client Port 68", isCorrect: true },
        { id: "c", text: "Server Port 68, Client Port 67", isCorrect: false },
        { id: "d", text: "Server Port 80, Client Port 443", isCorrect: false },
      ],
    },
    {
      id: uid(), type: "true-false", points: 5,
      text: "Ein DHCP-Server kann sowohl dynamische als auch statische (Manual) Bindings vergeben.",
      explanation: "Richtig. Cisco DHCP-Server unterstützt 'Dynamic/Automatic Bindings' (aus einem Adresspool) und 'Manual Bindings' (statische Zuordnung einer IP zu einer MAC-Adresse).",
      answers: [
        { id: "a", text: "Wahr", isCorrect: true },
        { id: "b", text: "Falsch", isCorrect: false },
      ],
    },
    {
      id: uid(), type: "single-choice", points: 10,
      text: "Was ist die Funktion eines DHCP-Relay-Agents?",
      explanation: "Der DHCP-Relay-Agent leitet DHCP-Broadcasts aus einem lokalen Subnetz als Unicast an einen entfernten DHCP-Server weiter, der sich in einem anderen Netzwerk befindet.",
      answers: [
        { id: "a", text: "Er verteilt IP-Adressen selbst aus einem lokalen Pool", isCorrect: false },
        { id: "b", text: "Er leitet DHCP-Nachrichten an einen entfernten DHCP-Server weiter", isCorrect: true },
        { id: "c", text: "Er blockiert DHCP-Broadcasts aus unsicheren Ports", isCorrect: false },
        { id: "d", text: "Er speichert alle vergebenen IP-Adressen in einer Datenbank", isCorrect: false },
      ],
    },
    {
      id: uid(), type: "single-choice", points: 10,
      text: "Mit welchem Windows-Kommando wird eine bestehende IP-Konfiguration freigegeben (DHCPRELEASE gesendet)?",
      explanation: "'ipconfig /release' sendet DHCPRELEASE und löscht die lokale IP-Konfiguration. 'ipconfig /renew' sendet anschließend DHCPDISCOVER.",
      answers: [
        { id: "a", text: "ipconfig /renew", isCorrect: false },
        { id: "b", text: "ipconfig /release", isCorrect: true },
        { id: "c", text: "ipconfig /flush", isCorrect: false },
        { id: "d", text: "ipconfig /reset", isCorrect: false },
      ],
    },
    {
      id: uid(), type: "true-false", points: 5,
      text: "DHCP ist empfehlenswert für die automatische Konfiguration von Routern und Switches.",
      explanation: "Falsch. DHCP ist für dynamische Endgerätekonfiguration geeignet. Router, Switches, Server und Drucker sollten statische IP-Adressen haben, da sich ihre IPs nicht ändern sollten.",
      answers: [
        { id: "a", text: "Wahr", isCorrect: false },
        { id: "b", text: "Falsch", isCorrect: true },
      ],
    },
  ],
};

// ============================================================
// QUIZ 5: NAT / PAT
// ============================================================
export const QUIZ_NAT: Quiz = {
  id: "ccna-quiz-nat",
  title: "CCNA: NAT & PAT",
  description: "Network Address Translation, Static NAT, Dynamic NAT, PAT (Overload) und Troubleshooting",
  passingScore: 70,
  shuffleQuestions: true,
  questions: [
    {
      id: uid(), type: "single-choice", points: 10,
      text: "Welche Art von NAT wird eingesetzt, um interne Geräte mit privater IP-Adresse aus dem Internet erreichbar zu machen?",
      explanation: "Static NAT: Eine private IP wird fest einer öffentlichen IP zugeordnet. Dadurch ist der interne Server dauerhaft unter einer öffentlichen IP erreichbar.",
      answers: [
        { id: "a", text: "Dynamic NAT", isCorrect: false },
        { id: "b", text: "PAT (NAT Overload)", isCorrect: false },
        { id: "c", text: "Static NAT", isCorrect: true },
        { id: "d", text: "Double NAT", isCorrect: false },
      ],
    },
    {
      id: uid(), type: "single-choice", points: 10,
      text: "Was ist das Haupteinsatzgebiet von PAT (Port Address Translation / NAT Overload)?",
      explanation: "PAT ermöglicht es, dass viele interne Geräte mit privaten IPs über eine einzige öffentliche IP-Adresse ins Internet gelangen – durch Unterscheidung anhand von TCP/UDP-Port-Nummern.",
      answers: [
        { id: "a", text: "Interne Server im Internet erreichbar machen", isCorrect: false },
        { id: "b", text: "Geräten mit privater IP den Zugang in öffentliche Netzwerke ermöglichen", isCorrect: true },
        { id: "c", text: "IPv6-Adressen in IPv4-Adressen übersetzen", isCorrect: false },
        { id: "d", text: "Routing zwischen VLANs ermöglichen", isCorrect: false },
      ],
    },
    {
      id: uid(), type: "text-input", points: 10,
      text: "Notieren Sie die privaten IP-Adressbereiche in CIDR-Notation (kommagetrennt, z.B. x.x.x.x/y, ...).",
      explanation: "10.0.0.0/8, 172.16.0.0/12, 192.168.0.0/16",
      answers: [
        { id: "a", text: "10.0.0.0/8, 172.16.0.0/12, 192.168.0.0/16", isCorrect: true },
      ],
    },
    {
      id: uid(), type: "single-choice", points: 10,
      text: "Welches Kommando zeigt den Inhalt der NAT-Übersetzungstabelle?",
      explanation: "'show ip nat translations' zeigt alle aktiven NAT-Übersetzungseinträge in der Tabelle.",
      answers: [
        { id: "a", text: "# debug ip nat", isCorrect: false },
        { id: "b", text: "# show ip nat translations", isCorrect: true },
        { id: "c", text: "# show nat table", isCorrect: false },
        { id: "d", text: "# show ip route nat", isCorrect: false },
      ],
    },
    {
      id: uid(), type: "single-choice", points: 10,
      text: "Auf welchem Router in einer komplexen Topologie sollte NAT implementiert werden?",
      explanation: "NAT sollte auf dem Edge-Router konfiguriert werden, der die externe Verbindung in das öffentliche Netzwerk bereitstellt.",
      answers: [
        { id: "a", text: "Auf dem Core-Router", isCorrect: false },
        { id: "b", text: "Auf jedem Router im Netzwerk", isCorrect: false },
        { id: "c", text: "Auf dem Edge-Router mit externer Verbindung ins öffentliche Netz", isCorrect: true },
        { id: "d", text: "Auf dem Distribution-Layer-Switch", isCorrect: false },
      ],
    },
    {
      id: uid(), type: "single-choice", points: 10,
      text: "Ein Unternehmen mit 500 Mitarbeitern verwendet PAT. Welches Schlüsselwort ist in der NAT-Konfiguration zwingend erforderlich?",
      explanation: "Das Schlüsselwort 'overload' aktiviert PAT und ermöglicht es, dass viele interne Adressen gleichzeitig eine einzige öffentliche IP-Adresse verwenden.",
      answers: [
        { id: "a", text: "static", isCorrect: false },
        { id: "b", text: "dynamic", isCorrect: false },
        { id: "c", text: "overload", isCorrect: true },
        { id: "d", text: "pool", isCorrect: false },
      ],
    },
    {
      id: uid(), type: "single-choice", points: 10,
      text: "Eine Firma nutzt Dynamic NAT. In der Mittagspause (12-13 Uhr) können einige Mitarbeiter nicht ins Internet. Was ist die wahrscheinlichste Ursache?",
      explanation: "Bei Dynamic NAT werden Adressen aus einem Pool vergeben. Wenn der Pool erschöpft ist (zu wenig öffentliche IPs für alle gleichzeitigen Verbindungen), schlägt die Übersetzung fehl.",
      answers: [
        { id: "a", text: "Der Router ist überlastet und kann keine Pakete mehr verarbeiten", isCorrect: false },
        { id: "b", text: "Die ACL blockiert Datenverkehr aus bestimmten internen Subnetzen", isCorrect: false },
        { id: "c", text: "Der NAT-Pool ist zu klein – zu wenig öffentliche IP-Adressen", isCorrect: true },
        { id: "d", text: "Die DNS-Server sind nicht erreichbar", isCorrect: false },
      ],
    },
    {
      id: uid(), type: "single-choice", points: 10,
      text: "Mit welchem Kommando kann die NAT-Funktion in Echtzeit überwacht werden?",
      explanation: "'debug ip nat' zeigt NAT-Übersetzungsereignisse in Echtzeit an – nützlich für Troubleshooting.",
      answers: [
        { id: "a", text: "# show ip nat translations", isCorrect: false },
        { id: "b", text: "# monitor ip nat", isCorrect: false },
        { id: "c", text: "# debug ip nat", isCorrect: true },
        { id: "d", text: "# show ip nat statistics", isCorrect: false },
      ],
    },
  ],
};

// ============================================================
// QUIZ 6: Security Grundlagen
// ============================================================
export const QUIZ_SECURITY: Quiz = {
  id: "ccna-quiz-security",
  title: "CCNA: Security Grundlagen",
  description: "Netzwerkbedrohungen, Angriffsmethoden, Malware, Social Engineering und Gegenmassnahmen",
  passingScore: 70,
  shuffleQuestions: true,
  questions: [
    {
      id: uid(), type: "single-choice", points: 10,
      text: "Was ist ein 'Exploit'?",
      explanation: "Ein Exploit ist ein Tool (Programmcode), das Sicherheitslücken (Vulnerabilities) erkennt und ausnutzt. Eine Vulnerability ist die Schwachstelle selbst.",
      answers: [
        { id: "a", text: "Eine Sicherheitslücke auf einem System (Vulnerability)", isCorrect: false },
        { id: "b", text: "Ein Tool zum Ausführen von Angriffen", isCorrect: true },
        { id: "c", text: "Ein aktiver Angriff auf das Netzwerk (Threat)", isCorrect: false },
        { id: "d", text: "Eine Massnahme zur Abwehr von Angriffen (Mitigation)", isCorrect: false },
      ],
    },
    {
      id: uid(), type: "single-choice", points: 10,
      text: "Welche Angriffsmethode beschreibt einen TCP SYN Flooding-Angriff?",
      explanation: "TCP SYN Flooding ist eine DoS/DDoS-Methode: Der Angreifer sendet viele TCP SYN-Segmente ohne den Handshake zu vervollständigen, was den Puffer des Servers überläuft.",
      answers: [
        { id: "a", text: "Man-in-the-Middle (MITM)", isCorrect: false },
        { id: "b", text: "DoS/DDoS", isCorrect: true },
        { id: "c", text: "Spoofing", isCorrect: false },
        { id: "d", text: "Reconnaissance", isCorrect: false },
      ],
    },
    {
      id: uid(), type: "multiple-choice", points: 15,
      text: "Welche Threats verwenden immer Spoofing-Methoden? (Mehrere Antworten möglich)",
      explanation: "MITM-Angriffe erfordern Spoofing (z.B. ARP-Spoofing). DoS/DDoS Reflection/Amplification Attacks verwenden gefälschte IP-Adressen des Opfers als Quelladresse.",
      answers: [
        { id: "a", text: "DoS/DDoS (einfach)", isCorrect: false },
        { id: "b", text: "Man-in-the-Middle (MITM)", isCorrect: true },
        { id: "c", text: "DoS/DDoS Reflection und Amplification", isCorrect: true },
        { id: "d", text: "Reconnaissance", isCorrect: false },
      ],
    },
    {
      id: uid(), type: "single-choice", points: 10,
      text: "Welche Spoofing-Methode wird eingesetzt, wenn ein Angreifer durch schnelles Senden vieler Frames mit unterschiedlichen SRC-MAC-Adressen die Weiterleitungsfunktion eines Switch manipuliert?",
      explanation: "MAC Spoofing / MAC Flooding: Der Angreifer füllt die MAC-Table des Switches mit falschen Einträgen. Wenn die Tabelle voll ist, fängt der Switch an zu 'fluten' (Unicast wird zu Broadcast).",
      answers: [
        { id: "a", text: "ARP Spoofing", isCorrect: false },
        { id: "b", text: "MAC Spoofing / MAC Flooding", isCorrect: true },
        { id: "c", text: "IP Spoofing", isCorrect: false },
        { id: "d", text: "Protocol Spoofing (DHCP Spoofing)", isCorrect: false },
      ],
    },
    {
      id: uid(), type: "multiple-choice", points: 15,
      text: "Welche der folgenden Aussagen zu Malware sind korrekt? (Mehrere Antworten möglich)",
      explanation: "Würmer verbreiten sich selbständig im Netzwerk (ohne Wirtsfile). Viren injizieren sich in Programme und brauchen einen Wirt. Trojaner verstecken Schadcode in vertrauenswürdigen Programmen.",
      answers: [
        { id: "a", text: "Würmer verbreiten sich selbständig im Netzwerk", isCorrect: true },
        { id: "b", text: "Viren verbreiten sich selbständig im Netzwerk", isCorrect: false },
        { id: "c", text: "Viren injizieren sich selbstständig in beliebige Programme", isCorrect: true },
        { id: "d", text: "Würmer injizieren sich selbstständig in beliebige Programme", isCorrect: false },
      ],
    },
    {
      id: uid(), type: "text-input", points: 10,
      text: "Wie nennt man Malware, die Schadcode innerhalb eines vertrauenswürdigen Programms versteckt?",
      explanation: "Ein Trojanisches Pferd (Trojan Horse / Trojaner) ist Malware, die in einem scheinbar legitimen Programm versteckt ist.",
      answers: [
        { id: "a", text: "Trojan Horse", isCorrect: true },
        { id: "b", text: "Trojaner", isCorrect: true },
        { id: "c", text: "Trojanisches Pferd", isCorrect: true },
      ],
    },
    {
      id: uid(), type: "single-choice", points: 10,
      text: "Welche SRC-IP-Adresse enthält das Paket eines Angreifers bei einem DoS Reflection Attack?",
      explanation: "Bei einem Reflection Attack verwendet der Angreifer die IP-Adresse des Opfers als gefälschte SRC-IP. So senden die 'Reflectors' ihre Antworten direkt an das Opfer.",
      answers: [
        { id: "a", text: "SRC IP des Angreifers", isCorrect: false },
        { id: "b", text: "SRC IP des Reflectors (z.B. DNS-Server)", isCorrect: false },
        { id: "c", text: "SRC IP des Opfers (gefälscht)", isCorrect: true },
        { id: "d", text: "0.0.0.0 (unbekannt)", isCorrect: false },
      ],
    },
    {
      id: uid(), type: "single-choice", points: 10,
      text: "Welche Social-Engineering-Methode wird verwendet, wenn das Opfer über einen Link in einer E-Mail zu einer gefälschten Website geführt wird?",
      explanation: "Phishing: Der Angreifer sendet eine E-Mail mit einem Link zu einer gefälschten Website, um Zugangsdaten oder andere sensible Informationen zu stehlen.",
      answers: [
        { id: "a", text: "Vishing (Voice Phishing – per Telefon)", isCorrect: false },
        { id: "b", text: "Whaling (gezieltes Phishing gegen Führungskräfte)", isCorrect: false },
        { id: "c", text: "Phishing", isCorrect: true },
        { id: "d", text: "Smishing (SMS-basiert)", isCorrect: false },
      ],
    },
    {
      id: uid(), type: "multiple-choice", points: 15,
      text: "Welche Funktionen auf einem Cisco-Gerät verhindern Spoofing-Angriffe? (Mehrere Antworten möglich)",
      explanation: "Switchport Security, DHCP Snooping und DAI (Dynamic ARP Inspection) schützen vor verschiedenen Spoofing-Angriffen auf Layer 2. IPS und Firewalls arbeiten auf höheren Schichten.",
      answers: [
        { id: "a", text: "IPS (Intrusion Prevention System)", isCorrect: false },
        { id: "b", text: "DHCP Snooping", isCorrect: true },
        { id: "c", text: "DAI (Dynamic ARP Inspection)", isCorrect: true },
        { id: "d", text: "Firewall", isCorrect: false },
        { id: "e", text: "Switchport Security", isCorrect: true },
      ],
    },
  ],
};

// ============================================================
// QUIZ 7: Harden Device Access & AAA
// ============================================================
export const QUIZ_HARDEN: Quiz = {
  id: "ccna-quiz-harden-access",
  title: "CCNA: Device Hardening & AAA",
  description: "Cisco-Gerätesicherheit, Passwortmethoden, SSH, ACLs auf VTY-Lines, AAA-Server",
  passingScore: 70,
  shuffleQuestions: true,
  questions: [
    {
      id: uid(), type: "text-input", points: 10,
      text: "Wie lautet das Cisco IOS-Kommando (ohne Prompt), um Klartext-Passwörter in der Konfigurationsdatei unlesbar zu machen?",
      explanation: "'service password-encryption' verschlüsselt alle Klartext-Passwörter in der Konfiguration (Type 7 – Cisco-Algorithmus).",
      answers: [
        { id: "a", text: "service password-encryption", isCorrect: true },
      ],
    },
    {
      id: uid(), type: "single-choice", points: 10,
      text: "Die running-config zeigt: 'enable secret 5 $1$HXHT$b2w37mLAJ62v3zkZRw/Ik1'. Welcher Algorithmus wurde verwendet?",
      explanation: "Type 5 = MD5-Hash. Type 8 = SHA256, Type 9 = Scrypt. Der '5' nach 'secret' gibt den Typ an.",
      answers: [
        { id: "a", text: "SHA1 (Type 4)", isCorrect: false },
        { id: "b", text: "MD5 (Type 5)", isCorrect: true },
        { id: "c", text: "SHA256 (Type 8)", isCorrect: false },
        { id: "d", text: "Scrypt (Type 9)", isCorrect: false },
      ],
    },
    {
      id: uid(), type: "single-choice", points: 10,
      text: "Mit welcher Kennziffer werden Passwörter gekennzeichnet, die mit dem Kommando 'password' (Klartext) konfiguriert wurden?",
      explanation: "Type 0 = Klartext ('password'-Kommando). Type 7 = mit 'service password-encryption' verschlüsselt. Type 5/8/9 = verschiedene Hash-Verfahren mit 'secret'.",
      answers: [
        { id: "a", text: "Type 0", isCorrect: true },
        { id: "b", text: "Type 1", isCorrect: false },
        { id: "c", text: "Type 5", isCorrect: false },
        { id: "d", text: "Type 7", isCorrect: false },
      ],
    },
    {
      id: uid(), type: "single-choice", points: 10,
      text: "An die VTY Lines von R1 wurde folgende ACL gebunden: 'access-list 1 permit host 10.1.1.1'. SSH ist aktiv. Welche Aussage ist wahr?",
      explanation: "Standard-ACL mit 'permit host 10.1.1.1' erlaubt nur diesem Host SSH-Zugriff. Alle anderen werden durch das implizite 'deny any' blockiert.",
      answers: [
        { id: "a", text: "Nur Host 10.1.1.1 darf SSH-Verbindung zu R1 aufbauen", isCorrect: true },
        { id: "b", text: "Alle Geräte im Netzwerk 10.1.1.0/24 dürfen SSH aufbauen", isCorrect: false },
        { id: "c", text: "Host 10.1.1.1 darf keine SSH-Verbindung aufbauen", isCorrect: false },
        { id: "d", text: "Alle Geräte dürfen SSH-Verbindungen aufbauen", isCorrect: false },
      ],
    },
    {
      id: uid(), type: "multiple-choice", points: 15,
      text: "Welche Kriterien muss Datenverkehr erfüllen, damit er von einem Router an eine VTY Line weitergeleitet wird? (Mehrere Antworten möglich)",
      explanation: "VTY-Traffic-Kriterien: DST-IP muss eine IP des Routers sein, TCP an Port 22 (SSH) oder 23 (Telnet), bei aktiver ACL muss die SRC-IP durch ACL erlaubt sein.",
      answers: [
        { id: "a", text: "Nur UDP-Datenverkehr wird an VTY Lines weitergeleitet", isCorrect: false },
        { id: "b", text: "DST-IP muss eine IP-Adresse des Routers sein", isCorrect: true },
        { id: "c", text: "TCP an Zielport 22 (SSH) oder 23 (Telnet)", isCorrect: true },
        { id: "d", text: "SRC-IP muss bei aktiver ACL durch die ACL erlaubt sein", isCorrect: true },
      ],
    },
    {
      id: uid(), type: "text-input", points: 10,
      text: "Wofür steht die Abkürzung AAA in der Netzwerksicherheit?",
      explanation: "AAA steht für Authentication (Wer bist du?), Authorization (Was darfst du?) und Accounting (Was hast du getan?).",
      answers: [
        { id: "a", text: "Authentication, Authorization, Accounting", isCorrect: true },
        { id: "b", text: "authentication, authorization, accounting", isCorrect: true },
      ],
    },
    {
      id: uid(), type: "multiple-choice", points: 15,
      text: "Welche der folgenden sind AAA-Server-Implementierungen? (Mehrere Antworten möglich)",
      explanation: "RADIUS, TACACS+ und Cisco ISE (Identity Services Engine) sind AAA-Server. SYSLOG ist ein Logging-System, UDB ist kein Standard-AAA-Server.",
      answers: [
        { id: "a", text: "RADIUS", isCorrect: true },
        { id: "b", text: "SYSLOG", isCorrect: false },
        { id: "c", text: "ISE (Cisco Identity Services Engine)", isCorrect: true },
        { id: "d", text: "TACACS+", isCorrect: true },
        { id: "e", text: "UDB", isCorrect: false },
      ],
    },
    {
      id: uid(), type: "single-choice", points: 10,
      text: "Welcher AAA-Server-Dienst verwendet TCP Port 49 zur Kommunikation?",
      explanation: "TACACS+ verwendet TCP Port 49. RADIUS verwendet UDP Port 1812 (Authentication) und 1813 (Accounting).",
      answers: [
        { id: "a", text: "RADIUS", isCorrect: false },
        { id: "b", text: "TACACS+", isCorrect: true },
        { id: "c", text: "ISE", isCorrect: false },
        { id: "d", text: "LDAP", isCorrect: false },
      ],
    },
    {
      id: uid(), type: "single-choice", points: 10,
      text: "Welcher AAA-Server unterstützt dot1x (IEEE 802.1x Port-Based Authentication)?",
      explanation: "RADIUS unterstützt IEEE 802.1x (dot1x) und wird häufig für WLAN-Authentifizierung (WPA2-Enterprise) und kabelgebundene Port-Authentifizierung eingesetzt.",
      answers: [
        { id: "a", text: "TACACS+", isCorrect: false },
        { id: "b", text: "RADIUS", isCorrect: true },
        { id: "c", text: "SYSLOG", isCorrect: false },
        { id: "d", text: "UDB", isCorrect: false },
      ],
    },
  ],
};

// ============================================================
// QUIZ 8: DHCP Snooping & DAI
// ============================================================
export const QUIZ_DHCP_SNOOPING: Quiz = {
  id: "ccna-quiz-dhcp-snooping-dai",
  title: "CCNA: DHCP Snooping & DAI",
  description: "DHCP Snooping, Dynamic ARP Inspection – Schutz vor Layer-2-Angriffen",
  passingScore: 70,
  shuffleQuestions: true,
  questions: [
    {
      id: uid(), type: "single-choice", points: 10,
      text: "Auf welchem Gerät im Netzwerk sollte DHCP Snooping konfiguriert werden?",
      explanation: "DHCP Snooping wird auf Access-Layer-2-Switches konfiguriert, da dort Endgeräte angeschlossen sind und DHCP-Spoofing-Angriffe am häufigsten stattfinden.",
      answers: [
        { id: "a", text: "Distribution L3 Switches", isCorrect: false },
        { id: "b", text: "Core L3 Switches", isCorrect: false },
        { id: "c", text: "Router", isCorrect: false },
        { id: "d", text: "Access L2 Switches", isCorrect: true },
      ],
    },
    {
      id: uid(), type: "multiple-choice", points: 15,
      text: "Welche Angriffsmethoden können durch DHCP Snooping und DAI verhindert werden? (Mehrere Antworten möglich)",
      explanation: "DHCP Snooping + DAI schützen vor: Man-in-the-Middle (verhindert ARP-Spoofing und DHCP-Spoofing), ARP Spoofing und DoS (Rate-Limiting). Reconnaissance wird dadurch nicht verhindert.",
      answers: [
        { id: "a", text: "Man-in-the-Middle", isCorrect: true },
        { id: "b", text: "ARP Spoofing", isCorrect: true },
        { id: "c", text: "Denial-of-Service (durch Rate-Limiting)", isCorrect: true },
        { id: "d", text: "Reconnaissance", isCorrect: false },
      ],
    },
    {
      id: uid(), type: "multiple-choice", points: 15,
      text: "Welche Aussagen zu DHCP Snooping 'untrusted Ports' sind wahr? (Mehrere Antworten möglich)",
      explanation: "Untrusted Ports: Per Default sind alle Ports untrusted. An untrusted Ports werden DHCP DISCOVER und RELEASE weitergeleitet, aber DHCP OFFER wird blockiert (verhindert rogue DHCP-Server).",
      answers: [
        { id: "a", text: "Ports zu PCs sind untrusted Ports", isCorrect: true },
        { id: "b", text: "Ports zu Distribution-Switches sind untrusted Ports", isCorrect: false },
        { id: "c", text: "Alle Ports sind per Default untrusted", isCorrect: true },
        { id: "d", text: "Auf untrusted Ports empfangene DHCP DISCOVER-Nachrichten werden weitergeleitet", isCorrect: true },
        { id: "e", text: "Auf untrusted Ports empfangene DHCP OFFER-Nachrichten werden weitergeleitet", isCorrect: false },
        { id: "f", text: "Auf untrusted Ports empfangene DHCP RELEASE-Nachrichten werden weitergeleitet", isCorrect: true },
      ],
    },
    {
      id: uid(), type: "text-input", points: 10,
      text: "Notieren Sie alle Kommandos (ohne Prompt), um DHCP Snooping für VLANs 10-19 global zu aktivieren (2 Kommandos, Zeilenumbruch als Trenner).",
      explanation: "Zwei Kommandos: 'ip dhcp snooping' (globale Aktivierung) und 'ip dhcp snooping vlan 10-19' (für spezifische VLANs).",
      answers: [
        { id: "a", text: "ip dhcp snooping\nip dhcp snooping vlan 10-19", isCorrect: true },
      ],
    },
    {
      id: uid(), type: "single-choice", points: 10,
      text: "Welche Einstellung ist nach der Aktivierung von DHCP Snooping und DAI zwingend notwendig?",
      explanation: "Mindestens ein Port muss als 'trusted' definiert werden – typischerweise der Uplink zum DHCP-Server oder Distribution-Switch. Ohne trusted Port werden alle DHCP-OFFER-Nachrichten verworfen.",
      answers: [
        { id: "a", text: "Mindestens einen Port als trusted Port definieren", isCorrect: true },
        { id: "b", text: "Mindestens einen Port als untrusted Port definieren", isCorrect: false },
        { id: "c", text: "Mehrere Ports als trusted und einen als untrusted definieren", isCorrect: false },
        { id: "d", text: "Alle Ports müssen explizit konfiguriert werden", isCorrect: false },
      ],
    },
    {
      id: uid(), type: "single-choice", points: 10,
      text: "Welches Kommando sollte für DHCP Snooping immer gesetzt werden, wenn das Gerät kein DHCP Relay Agent ist?",
      explanation: "'no ip dhcp snooping information option' deaktiviert Option 82 (DHCP Relay Information). Ohne dieses Kommando können DHCP-Anfragen von Clients verworfen werden, wenn der Switch kein Relay-Agent ist.",
      answers: [
        { id: "a", text: "no ip dhcp snooping option 82", isCorrect: false },
        { id: "b", text: "no ip dhcp snooping information option", isCorrect: true },
        { id: "c", text: "no ip dhcp snooping relay information", isCorrect: false },
        { id: "d", text: "no ip dhcp snooping relay option", isCorrect: false },
      ],
    },
    {
      id: uid(), type: "single-choice", points: 10,
      text: "Notieren Sie das Kommando für DAI, um DAI für VLANs 10-19 zu aktivieren.",
      explanation: "'ip arp inspection vlan 10-19' aktiviert DAI für die angegebenen VLANs. DAI prüft ARP-Anfragen anhand der DHCP-Snooping-Binding-Tabelle.",
      answers: [
        { id: "a", text: "ip arp inspection vlan 10-19", isCorrect: true },
        { id: "b", text: "ip dhcp snooping vlan 10-19", isCorrect: false },
        { id: "c", text: "ip arp snooping vlan 10-19", isCorrect: false },
        { id: "d", text: "ip dai vlan 10-19", isCorrect: false },
      ],
    },
    {
      id: uid(), type: "multiple-choice", points: 15,
      text: "Welche Informationsquellen kann DAI verwenden, um ARP-Anfragen zu validieren? (Mehrere Antworten möglich)",
      explanation: "DAI kann zur Validierung von ARP-Anfragen die DHCP Snooping Binding Table und ARP ACLs verwenden.",
      answers: [
        { id: "a", text: "DHCP Snooping Binding Table", isCorrect: true },
        { id: "b", text: "ARP ACL", isCorrect: true },
        { id: "c", text: "MAC-Address-Table des Switches", isCorrect: false },
        { id: "d", text: "IP Routing Table", isCorrect: false },
      ],
    },
  ],
};

// ============================================================
// QUIZ 9: ACLs (Access Control Lists)
// ============================================================
export const QUIZ_ACL: Quiz = {
  id: "ccna-quiz-acl",
  title: "CCNA: ACLs – Access Control Lists",
  description: "Standard ACL, Extended ACL, Konfiguration, Verarbeitung und Troubleshooting",
  passingScore: 70,
  shuffleQuestions: true,
  questions: [
    {
      id: uid(), type: "single-choice", points: 10,
      text: "Nach welchem Kriterium kann eine Standard ACL Datenverkehr identifizieren?",
      explanation: "Eine Standard ACL kann Datenverkehr ausschließlich anhand der Source-IP-Adresse im IP-Header identifizieren.",
      answers: [
        { id: "a", text: "Nur nach Ziel-IP (Destination IP)", isCorrect: false },
        { id: "b", text: "Nach Source-IP (Quelladresse)", isCorrect: true },
        { id: "c", text: "Nach Source-IP und Ziel-IP", isCorrect: false },
        { id: "d", text: "Nach Protokoll und Port-Nummern", isCorrect: false },
      ],
    },
    {
      id: uid(), type: "single-choice", points: 10,
      text: "Welche Art von ACL ist notwendig, um den Zugriff auf bestimmte entfernte Serverdienste (z.B. nur HTTP auf einem bestimmten Server) zu reglementieren?",
      explanation: "Nur eine Extended ACL kann nach Protokoll (TCP/UDP/ICMP), Source-IP, Destination-IP UND Ports filtern.",
      answers: [
        { id: "a", text: "Standard ACL (numbered)", isCorrect: false },
        { id: "b", text: "Standard ACL (named)", isCorrect: false },
        { id: "c", text: "Extended ACL", isCorrect: true },
        { id: "d", text: "Reflexive ACL", isCorrect: false },
      ],
    },
    {
      id: uid(), type: "single-choice", points: 10,
      text: "Wie viele ACLs können auf einer IP-Schnittstelle als Paketfilter aktiv sein?",
      explanation: "Pro Schnittstelle maximal 2 ACLs: eine inbound (eingehend) und eine outbound (ausgehend). Pro Richtung nur eine ACL.",
      answers: [
        { id: "a", text: "Nur eine – entweder inbound oder outbound", isCorrect: false },
        { id: "b", text: "Zwei – eine inbound und eine outbound", isCorrect: true },
        { id: "c", text: "Vier – je zwei pro Richtung", isCorrect: false },
        { id: "d", text: "Unbegrenzt", isCorrect: false },
      ],
    },
    {
      id: uid(), type: "single-choice", points: 10,
      text: "Notieren Sie den gültigen Nummernbereich für eine Numbered Standard IP ACL.",
      explanation: "Standard ACL: Nummern 1–99 (und 1300–1999 als erweiterter Bereich). Extended ACL: 100–199 (und 2000–2699).",
      answers: [
        { id: "a", text: "1 – 99", isCorrect: true },
        { id: "b", text: "100 – 199", isCorrect: false },
        { id: "c", text: "1 – 199", isCorrect: false },
        { id: "d", text: "200 – 299", isCorrect: false },
      ],
    },
    {
      id: uid(), type: "true-false", points: 5,
      text: "Am Ende jeder ACL steht eine unsichtbare 'deny any'-Regel (Implicit Deny), die alle nicht explizit erlaubten Pakete verwirft.",
      explanation: "Richtig. Das Implicit Deny ist immer vorhanden, aber nicht sichtbar (wird nicht angezeigt). Es sorgt dafür, dass alle Pakete, die keiner permit-Regel entsprechen, verworfen werden.",
      answers: [
        { id: "a", text: "Wahr", isCorrect: true },
        { id: "b", text: "Falsch", isCorrect: false },
      ],
    },
    {
      id: uid(), type: "single-choice", points: 10,
      text: "Welche Art von ACL wird verwendet, um SSH/Telnet-Zugriff auf ein Cisco-Gerät zu reglementieren, und wo wird sie gebunden?",
      explanation: "Für VTY-Zugriff (SSH/Telnet) wird eine Standard ACL verwendet und mit 'access-class [acl-nr] in' an den VTY Lines gebunden.",
      answers: [
        { id: "a", text: "Extended ACL, gebunden an Interface mit 'ip access-group'", isCorrect: false },
        { id: "b", text: "Standard ACL, gebunden an VTY Lines mit 'access-class'", isCorrect: true },
        { id: "c", text: "Standard ACL, gebunden an Interface mit 'ip access-group'", isCorrect: false },
        { id: "d", text: "Extended ACL, gebunden an VTY Lines mit 'access-class'", isCorrect: false },
      ],
    },
    {
      id: uid(), type: "single-choice", points: 10,
      text: "ACL: 'access-list 99 permit 10.1.1.0 0.0.0.255' dann 'access-list 99 deny host 10.1.1.11' – an VTY Lines gebunden. Warum kann Host 10.1.1.11 trotzdem SSH aufbauen?",
      explanation: "ACLs werden von oben nach unten verarbeitet. Die erste Regel 'permit 10.1.1.0/24' trifft auf Host 10.1.1.11 zu und erlaubt ihn sofort. Die 'deny'-Regel danach wird nie erreicht. Lösung: Reihenfolge tauschen.",
      answers: [
        { id: "a", text: "Die 'deny'-Regel wurde nicht gespeichert", isCorrect: false },
        { id: "b", text: "Falsche Reihenfolge: 'permit' trifft als erste Regel für 10.1.1.11 zu", isCorrect: true },
        { id: "c", text: "Standard ACLs unterstützen keine 'deny'-Regeln", isCorrect: false },
        { id: "d", text: "Die ACL ist an der falschen Richtung gebunden", isCorrect: false },
      ],
    },
    {
      id: uid(), type: "single-choice", points: 10,
      text: "Mit welchem Kommando innerhalb einer ACL-Regel wird ein Kommentar eingeleitet?",
      explanation: "'remark' fügt einen Kommentar zu einer ACL hinzu: z.B. 'access-list 10 remark Dieser Eintrag erlaubt Admins'",
      answers: [
        { id: "a", text: "comment", isCorrect: false },
        { id: "b", text: "remark", isCorrect: true },
        { id: "c", text: "description", isCorrect: false },
        { id: "d", text: "note", isCorrect: false },
      ],
    },
  ],
};

// ============================================================
// QUIZ 10: OSPF
// ============================================================
export const QUIZ_OSPF: Quiz = {
  id: "ccna-quiz-ospf",
  title: "CCNA: OSPF",
  description: "OSPFv2, Multiple Area OSPF, LSA-Typen, DR/BDR, Router-Typen und Konfiguration",
  passingScore: 70,
  shuffleQuestions: true,
  questions: [
    {
      id: uid(), type: "multiple-choice", points: 15,
      text: "Welche Vorteile bietet Multiple Area OSPF gegenüber Single Area OSPF? (Mehrere Antworten möglich)",
      explanation: "Multiple Area OSPF: kleinere LSDB pro Router (weniger CPU/RAM), Route Summarization möglich (kleinere Routing-Tabellen), schnellere Konvergenz innerhalb der Area, erweiterte OSPF-Features nutzbar (Stub Areas, etc.).",
      answers: [
        { id: "a", text: "Kleinere LSDB auf den OSPF-Routern → weniger CPU/RAM", isCorrect: true },
        { id: "b", text: "Route Summarization möglich → kleinere Routing-Tabellen", isCorrect: true },
        { id: "c", text: "Automatische Verschlüsselung aller OSPF-Updates", isCorrect: false },
        { id: "d", text: "Vermeidung von Konvergenzprozessen in anderen Areas", isCorrect: true },
        { id: "e", text: "Nutzung erweiterter OSPF-Features (z.B. Area Types)", isCorrect: true },
      ],
    },
    {
      id: uid(), type: "single-choice", points: 10,
      text: "Welche Area-ID hat die OSPF Backbone Area?",
      explanation: "Die OSPF Backbone Area hat immer Area-ID 0 (oder 0.0.0.0). Alle anderen Areas müssen mit Area 0 verbunden sein.",
      answers: [
        { id: "a", text: "Area 1", isCorrect: false },
        { id: "b", text: "Area 0", isCorrect: true },
        { id: "c", text: "Area 255", isCorrect: false },
        { id: "d", text: "Area 100", isCorrect: false },
      ],
    },
    {
      id: uid(), type: "single-choice", points: 10,
      text: "Welcher LSA-Typ wird ausschließlich von einem DR (Designated Router) generiert?",
      explanation: "LSA Type 2 (Network LSA) wird vom DR in Multiaccess-Netzwerken generiert und enthält eine Liste aller OSPF-Router im Segment.",
      answers: [
        { id: "a", text: "LSA Type 1 (Router LSA)", isCorrect: false },
        { id: "b", text: "LSA Type 2 (Network LSA)", isCorrect: true },
        { id: "c", text: "LSA Type 3 (Summary LSA)", isCorrect: false },
        { id: "d", text: "LSA Type 5 (External LSA)", isCorrect: false },
      ],
    },
    {
      id: uid(), type: "single-choice", points: 10,
      text: "Welcher LSA-Typ enthält Informationen zu externen Zielen und wird ausschließlich von einem ASBR generiert?",
      explanation: "LSA Type 5 (AS External LSA) wird vom ASBR (Autonomous System Boundary Router) generiert und enthält Routen zu externen Netzwerken (außerhalb der OSPF-Domain).",
      answers: [
        { id: "a", text: "LSA Type 2 – Network LSA (vom DR)", isCorrect: false },
        { id: "b", text: "LSA Type 3 – Summary LSA (vom ABR)", isCorrect: false },
        { id: "c", text: "LSA Type 5 – AS External LSA (vom ASBR)", isCorrect: true },
        { id: "d", text: "LSA Type 7 – NSSA External LSA", isCorrect: false },
      ],
    },
    {
      id: uid(), type: "single-choice", points: 10,
      text: "Wann wird ein OSPF-Router zu einem ABR (Area Border Router)?",
      explanation: "Ein Router wird ABR, wenn er mindestens eine Schnittstelle in Area 0 und mindestens eine weitere Schnittstelle in einer anderen Area hat.",
      answers: [
        { id: "a", text: "Wenn er Routen aus externen Routing-Protokollen redistributiert", isCorrect: false },
        { id: "b", text: "Wenn er mindestens eine Schnittstelle in Area 0 und eine in einer anderen Area hat", isCorrect: true },
        { id: "c", text: "Wenn er in einer Stub Area liegt", isCorrect: false },
        { id: "d", text: "Wenn er DR in einem Multiaccess-Netzwerk ist", isCorrect: false },
      ],
    },
    {
      id: uid(), type: "single-choice", points: 10,
      text: "Wann wird ein OSPF-Router zu einem ASBR (Autonomous System Boundary Router)?",
      explanation: "Ein Router wird automatisch zum ASBR, wenn eine Redistribution aus einem anderen Routing-Protokoll (oder Static Routes) in OSPF konfiguriert wird.",
      answers: [
        { id: "a", text: "Wenn er in mehreren OSPF Areas ist", isCorrect: false },
        { id: "b", text: "Wenn er als DR gewählt wurde", isCorrect: false },
        { id: "c", text: "Wenn er Redistribution aus einem anderen Routing-Protokoll konfiguriert hat", isCorrect: true },
        { id: "d", text: "Wenn er sich in einer NSSA befindet", isCorrect: false },
      ],
    },
    {
      id: uid(), type: "single-choice", points: 10,
      text: "Auf welchen OSPF-Routern ist der Inhalt der LSDB (Link State Database) identisch?",
      explanation: "Alle OSPF-Router innerhalb derselben Area haben eine identische LSDB. Router in verschiedenen Areas haben unterschiedliche LSDBs.",
      answers: [
        { id: "a", text: "Auf allen OSPF-Routern im gesamten Netzwerk", isCorrect: false },
        { id: "b", text: "Nur auf DR und BDR", isCorrect: false },
        { id: "c", text: "Auf allen OSPF-Routern innerhalb der gleichen Area", isCorrect: true },
        { id: "d", text: "Nur auf ABRs und ASBRs", isCorrect: false },
      ],
    },
    {
      id: uid(), type: "text-input", points: 10,
      text: "Notieren Sie das Kommando (mit Prompt), um auf einem ABR die OSPF-Routen in 172.16.0.0/16 bis 172.16.23.0/24 (Area 2) zusammenzufassen.",
      explanation: "172.16.0.0 bis 172.16.23.0 fasst man mit 172.16.0.0/255.255.248.0 zusammen (8 Subnetze × /24 = /21): (config-router)# area 2 range 172.16.0.0 255.255.248.0",
      answers: [
        { id: "a", text: "(config-router)# area 2 range 172.16.0.0 255.255.248.0", isCorrect: true },
      ],
    },
  ],
};

// ============================================================
// QUIZ 11: QoS
// ============================================================
export const QUIZ_QOS: Quiz = {
  id: "ccna-quiz-qos",
  title: "CCNA: QoS – Quality of Service",
  description: "QoS-Funktionen, Klassifizierung, Markierung, Queuing, DSCP, CoS und Congestion Avoidance",
  passingScore: 70,
  shuffleQuestions: true,
  questions: [
    {
      id: uid(), type: "multiple-choice", points: 15,
      text: "Welche der folgenden sind QoS-Funktionen? (Mehrere Antworten möglich)",
      explanation: "QoS-Funktionen: Classification/Marking, Policing, Queuing und Congestion Avoidance. 'Tagging' und 'Labeling' sind keine CCNA-QoS-Fachbegriffe.",
      answers: [
        { id: "a", text: "Classification/Marking", isCorrect: true },
        { id: "b", text: "Tagging", isCorrect: false },
        { id: "c", text: "Policing", isCorrect: true },
        { id: "d", text: "Queuing", isCorrect: true },
        { id: "e", text: "Congestion Avoidance", isCorrect: true },
      ],
    },
    {
      id: uid(), type: "multiple-choice", points: 15,
      text: "Welche Netzwerkcharakteristika können mit QoS-Funktionen optimiert werden? (Mehrere Antworten möglich)",
      explanation: "QoS optimiert: Bandwidth (Bandbreite), Packet Loss (Paketverlust), Jitter (Verzitterung) und Delay (Latenz). MTU und Load sind keine QoS-optimierbaren Parameter.",
      answers: [
        { id: "a", text: "Bandwidth (Bandbreite)", isCorrect: true },
        { id: "b", text: "MTU (Maximum Transmission Unit)", isCorrect: false },
        { id: "c", text: "Packet Loss (Paketverlust)", isCorrect: true },
        { id: "d", text: "Jitter (Variation der Latenz)", isCorrect: true },
        { id: "e", text: "Delay (Latenz)", isCorrect: true },
      ],
    },
    {
      id: uid(), type: "single-choice", points: 10,
      text: "Welcher Wert wird für die QoS-Kennzeichnung auf OSI Layer 2 (Ethernet Frame) verwendet?",
      explanation: "CoS (Class of Service) ist im 802.1Q-Tag des Ethernet-Frames enthalten (3 Bit, PCP-Feld). DSCP ist in Layer 3 (IP-Header).",
      answers: [
        { id: "a", text: "DSCP (Differentiated Services Code Point)", isCorrect: false },
        { id: "b", text: "CoS (Class of Service / PCP im 802.1Q-Tag)", isCorrect: true },
        { id: "c", text: "IPP (IP Precedence)", isCorrect: false },
        { id: "d", text: "EXP (MPLS Experimental Bits)", isCorrect: false },
      ],
    },
    {
      id: uid(), type: "single-choice", points: 10,
      text: "Welcher Wert wird für die QoS-Kennzeichnung auf OSI Layer 3 (IP-Header) verwendet?",
      explanation: "DSCP (Differentiated Services Code Point) ist im DS-Feld (ToS-Feld) des IP-Headers und wird für Layer-3-QoS-Markierung verwendet.",
      answers: [
        { id: "a", text: "CoS (Class of Service)", isCorrect: false },
        { id: "b", text: "DSCP (Differentiated Services Code Point)", isCorrect: true },
        { id: "c", text: "EXP (MPLS Experimental)", isCorrect: false },
        { id: "d", text: "VLAN-ID", isCorrect: false },
      ],
    },
    {
      id: uid(), type: "multiple-choice", points: 15,
      text: "Welche Queuing-Methoden werden für QoS-Einordnung mit prozentualen Übertragungsraten verwendet? (Mehrere Antworten möglich)",
      explanation: "LLQ (Low Latency Queuing) und CBWFQ (Class-Based Weighted Fair Queuing) werden für QoS-Queuing mit prozentualen Bandbreitenzuweisungen verwendet.",
      answers: [
        { id: "a", text: "LLQ (Low Latency Queuing)", isCorrect: true },
        { id: "b", text: "WRED (Weighted Random Early Detection)", isCorrect: false },
        { id: "c", text: "CBWFQ (Class-Based Weighted Fair Queuing)", isCorrect: true },
        { id: "d", text: "SSR (Selective Send/Receive)", isCorrect: false },
      ],
    },
    {
      id: uid(), type: "single-choice", points: 10,
      text: "Wenn die konfigurierte Bitrate eines Queues überschritten wird – was passiert bei Policing vs. Shaping?",
      explanation: "Policing: Pakete über dem Limit werden verworfen (discarding). Shaping: Pakete über dem Limit werden gepuffert (queuing) und später gesendet – kein Verlust, aber Delay.",
      answers: [
        { id: "a", text: "Policing: discarding; Shaping: queuing", isCorrect: true },
        { id: "b", text: "Policing: queuing; Shaping: discarding", isCorrect: false },
        { id: "c", text: "Beide: discarding", isCorrect: false },
        { id: "d", text: "Beide: queuing", isCorrect: false },
      ],
    },
    {
      id: uid(), type: "single-choice", points: 10,
      text: "Für welchen Traffic-Typ sind Congestion Avoidance-Methoden (wie WRED) vorgesehen?",
      explanation: "WRED (Weighted Random Early Detection) ist für TCP-Datenverkehr konzipiert, da TCP einen Congestion-Control-Mechanismus hat und auf künstliche Paketverluste reagiert.",
      answers: [
        { id: "a", text: "Voice (UDP-basiert, delay-sensitiv)", isCorrect: false },
        { id: "b", text: "Video (multicast-basiert)", isCorrect: false },
        { id: "c", text: "TCP-Datenverkehr", isCorrect: true },
        { id: "d", text: "ICMP-Datenverkehr", isCorrect: false },
      ],
    },
  ],
};

// ============================================================
// QUIZ 12: WLAN Grundlagen & Sicherheit
// ============================================================
export const QUIZ_WLAN: Quiz = {
  id: "ccna-quiz-wlan",
  title: "CCNA: WLAN Grundlagen & Sicherheit",
  description: "802.11 Standards, WLAN-Topologien, Frequenzbänder, Sicherheitsstandards und WLC-Konfiguration",
  passingScore: 70,
  shuffleQuestions: true,
  questions: [
    {
      id: uid(), type: "multiple-choice", points: 15,
      text: "Welche Aussagen treffen auf 802.11 WLAN-Standards zu? (Mehrere Antworten möglich)",
      explanation: "WLAN (802.11) verwendet CSMA/CA (Collision Avoidance), da Kollisionen auf Radiowellen nicht erkannt werden können. WLAN kann nur half-duplex.",
      answers: [
        { id: "a", text: "Verwenden CSMA/CA (Collision Avoidance)", isCorrect: true },
        { id: "b", text: "Verwenden CSMA/CD (Collision Detection wie Ethernet)", isCorrect: false },
        { id: "c", text: "Bieten full-duplex Verbindungen", isCorrect: false },
        { id: "d", text: "Bieten nur half-duplex Verbindungen", isCorrect: true },
      ],
    },
    {
      id: uid(), type: "multiple-choice", points: 15,
      text: "Welche Cisco-Geräte werden für WLAN-Kommunikation eingesetzt? (Mehrere Antworten möglich)",
      explanation: "Cisco WLAN-Geräte: LAP (Lightweight Access Point), WLC (Wireless LAN Controller), Autonomous AP, Meraki AP. 'Alone AP', 'TWP', 'BAP', 'Kameri AP' sind keine Cisco-Produkte.",
      answers: [
        { id: "a", text: "LAP (Lightweight Access Point)", isCorrect: true },
        { id: "b", text: "WLC (Wireless LAN Controller)", isCorrect: true },
        { id: "c", text: "Autonomous AP", isCorrect: true },
        { id: "d", text: "Meraki AP", isCorrect: true },
        { id: "e", text: "TWP (Thin Wireless Point)", isCorrect: false },
      ],
    },
    {
      id: uid(), type: "single-choice", points: 10,
      text: "Welcher 802.11 Standard bietet als erster eine maximale Datenrate von 100+ Mbps?",
      explanation: "802.11n (Wi-Fi 4) bietet bis zu 600 Mbps theoretisch, realistisch 100-300 Mbps. 802.11g max 54 Mbps. 802.11a max 54 Mbps.",
      answers: [
        { id: "a", text: "802.11a (max 54 Mbps)", isCorrect: false },
        { id: "b", text: "802.11g (max 54 Mbps)", isCorrect: false },
        { id: "c", text: "802.11n (max ~600 Mbps, realistisch 100+ Mbps)", isCorrect: true },
        { id: "d", text: "802.11b (max 11 Mbps)", isCorrect: false },
      ],
    },
    {
      id: uid(), type: "multiple-choice", points: 15,
      text: "Welche Frequenzbänder werden von WLAN genutzt? (Mehrere Antworten möglich)",
      explanation: "WLAN nutzt das 2,4-GHz-Band (802.11b/g/n) und das 5-GHz-Band (802.11a/n/ac). Wi-Fi 6E erweitert auf 6 GHz, aber im CCNA-Bereich sind 2,4 GHz und 5 GHz relevant.",
      answers: [
        { id: "a", text: "7-GHz-Band", isCorrect: false },
        { id: "b", text: "2,4-GHz-Band", isCorrect: true },
        { id: "c", text: "5-GHz-Band", isCorrect: true },
        { id: "d", text: "4,2-GHz-Band", isCorrect: false },
      ],
    },
    {
      id: uid(), type: "single-choice", points: 10,
      text: "Welche Kanäle im 2,4-GHz-Band überlappen sich nicht (non-overlapping channels) – nach US-Standard?",
      explanation: "Im 2,4-GHz-Band gibt es 11 Kanäle (USA). Die drei nicht-überlappenden Kanäle sind 1, 6 und 11. Diese werden für benachbarte APs empfohlen.",
      answers: [
        { id: "a", text: "Kanal 1, 15 und 23", isCorrect: false },
        { id: "b", text: "Kanal 4 und 7", isCorrect: false },
        { id: "c", text: "Kanal 1, 6 und 11", isCorrect: true },
        { id: "d", text: "Alle Kanäle überlappen sich nicht", isCorrect: false },
      ],
    },
    {
      id: uid(), type: "multiple-choice", points: 15,
      text: "Was kann WLAN-Kommunikation stören? (Mehrere Antworten möglich)",
      explanation: "Störquellen: Metallwände (reflektieren/dämpfen), Wasserdampf (absorbiert 2,4-GHz-Signale), Mikrowellengeräte (verwenden 2,4 GHz). Holzmöbel haben kaum Einfluss.",
      answers: [
        { id: "a", text: "Metallwände", isCorrect: true },
        { id: "b", text: "Wasserdampf", isCorrect: true },
        { id: "c", text: "Mikrowellengeräte", isCorrect: true },
        { id: "d", text: "Holzmöbel", isCorrect: false },
      ],
    },
    {
      id: uid(), type: "single-choice", points: 10,
      text: "Was ist der Unterschied zwischen einem BSS und einem ESS?",
      explanation: "BSS (Basic Service Set): ein einzelner AP. ESS (Extended Service Set): mehrere APs, die dasselbe SSID bereitstellen und durch ein Distribution System verbunden sind.",
      answers: [
        { id: "a", text: "BSS verwendet WPA2, ESS verwendet WPA3", isCorrect: false },
        { id: "b", text: "BSS = 1 AP, ESS = mehrere APs mit gleichem SSID", isCorrect: true },
        { id: "c", text: "BSS ist für Infrastruktur-Modus, ESS für Ad-hoc-Modus", isCorrect: false },
        { id: "d", text: "Kein Unterschied – beide Begriffe bezeichnen dasselbe", isCorrect: false },
      ],
    },
    {
      id: uid(), type: "single-choice", points: 10,
      text: "An welchem Switch-Port-Typ muss ein Autonomous AP angeschlossen werden, wenn ein Distribution System (mehrere SSIDs) verwendet wird?",
      explanation: "Ein Autonomous AP mit mehreren SSIDs/VLANs muss an einem Trunk Port angeschlossen sein, damit mehrere VLANs übertragen werden können.",
      answers: [
        { id: "a", text: "Access Port", isCorrect: false },
        { id: "b", text: "Trunk Port", isCorrect: true },
        { id: "c", text: "DSAP Port", isCorrect: false },
        { id: "d", text: "Dynamic Port", isCorrect: false },
      ],
    },
    {
      id: uid(), type: "multiple-choice", points: 15,
      text: "Welche der folgenden Anschlüsse sind für die genannten WLAN-Geräte korrekt? (Mehrere Antworten möglich)",
      explanation: "Autonomous AP → Trunk Port (unterstützt mehrere VLANs/SSIDs). LAP → Access Port (wird vom WLC gesteuert, kein eigenes VLAN-Trunking). WLC → Trunk Port (verbindet mehrere VLANs).",
      answers: [
        { id: "a", text: "Autonomous AP wird an einen Trunk Port angeschlossen", isCorrect: true },
        { id: "b", text: "LAP wird an einen Access Port angeschlossen", isCorrect: true },
        { id: "c", text: "WLC wird an einen Trunk Port angeschlossen", isCorrect: true },
        { id: "d", text: "LAP wird an einen Trunk Port angeschlossen", isCorrect: false },
      ],
    },
  ],
};

// ============================================================
// QUIZ 13: CCNA Gesamtprüfung (Simuliertes Exam)
// ============================================================
export const QUIZ_CCNA_EXAM: Quiz = {
  id: "ccna-quiz-gesamtpruefung",
  title: "CCNA 200-301 Prüfungssimulation",
  description: "Simuliertes CCNA-Exam mit Fragen aus allen Themenbereichen – Bestehensgrenze 82% (wie im echten Exam)",
  passingScore: 82,
  timeLimit: 5400,
  shuffleQuestions: true,
  questions: [
    // OSI & Grundlagen
    {
      id: uid(), type: "single-choice", points: 5,
      text: "Auf welcher OSI-Schicht arbeitet ein Router?",
      explanation: "Router arbeiten auf Schicht 3 (Network Layer) und leiten Pakete anhand von IP-Adressen weiter.",
      answers: [
        { id: "a", text: "Schicht 1", isCorrect: false },
        { id: "b", text: "Schicht 2", isCorrect: false },
        { id: "c", text: "Schicht 3", isCorrect: true },
        { id: "d", text: "Schicht 4", isCorrect: false },
      ],
    },
    // IPv4
    {
      id: uid(), type: "single-choice", points: 5,
      text: "Wie viele Hosts können in einem /29-Netzwerk genutzt werden?",
      explanation: "/29 → 3 Host-Bits → 2^3 - 2 = 6 nutzbare Hosts.",
      answers: [
        { id: "a", text: "6", isCorrect: true },
        { id: "b", text: "8", isCorrect: false },
        { id: "c", text: "14", isCorrect: false },
        { id: "d", text: "30", isCorrect: false },
      ],
    },
    // IPv6
    {
      id: uid(), type: "single-choice", points: 5,
      text: "Welches Protokoll ersetzt ARP in IPv6?",
      explanation: "NDP (Neighbor Discovery Protocol) nutzt ICMPv6 und ersetzt ARP in IPv6-Netzwerken.",
      answers: [
        { id: "a", text: "DHCPv6", isCorrect: false },
        { id: "b", text: "NDP (Neighbor Discovery Protocol)", isCorrect: true },
        { id: "c", text: "SLAAC", isCorrect: false },
        { id: "d", text: "ICMPv4", isCorrect: false },
      ],
    },
    // DHCP
    {
      id: uid(), type: "single-choice", points: 5,
      text: "In welcher Reihenfolge laufen DHCP-Nachrichten ab?",
      explanation: "DORA: Discover → Offer → Request → Ack",
      answers: [
        { id: "a", text: "Discover, Request, Offer, Ack", isCorrect: false },
        { id: "b", text: "Discover, Offer, Request, Ack", isCorrect: true },
        { id: "c", text: "Request, Discover, Offer, Ack", isCorrect: false },
        { id: "d", text: "Offer, Discover, Ack, Request", isCorrect: false },
      ],
    },
    // NAT
    {
      id: uid(), type: "single-choice", points: 5,
      text: "Welches Schlüsselwort aktiviert PAT (NAT Overload) für viele interne Geräte über eine öffentliche IP?",
      explanation: "'overload' aktiviert PAT und ermöglicht die gleichzeitige Nutzung einer IP-Adresse durch viele interne Hosts.",
      answers: [
        { id: "a", text: "static", isCorrect: false },
        { id: "b", text: "pool", isCorrect: false },
        { id: "c", text: "overload", isCorrect: true },
        { id: "d", text: "dynamic", isCorrect: false },
      ],
    },
    // Security
    {
      id: uid(), type: "single-choice", points: 5,
      text: "Was ist ein Exploit?",
      explanation: "Ein Exploit ist ein Tool zum Ausführen von Angriffen, das Vulnerabilities (Sicherheitslücken) ausnutzt.",
      answers: [
        { id: "a", text: "Eine Sicherheitslücke (Vulnerability)", isCorrect: false },
        { id: "b", text: "Ein Tool zum Ausführen von Angriffen", isCorrect: true },
        { id: "c", text: "Ein aktiver Angriff (Threat)", isCorrect: false },
        { id: "d", text: "Eine Abwehrmassnahme (Mitigation)", isCorrect: false },
      ],
    },
    // AAA
    {
      id: uid(), type: "single-choice", points: 5,
      text: "Welcher AAA-Server verwendet TCP Port 49?",
      explanation: "TACACS+ verwendet TCP Port 49. RADIUS nutzt UDP.",
      answers: [
        { id: "a", text: "RADIUS", isCorrect: false },
        { id: "b", text: "TACACS+", isCorrect: true },
        { id: "c", text: "ISE", isCorrect: false },
        { id: "d", text: "LDAP", isCorrect: false },
      ],
    },
    // DHCP Snooping
    {
      id: uid(), type: "single-choice", points: 5,
      text: "Auf welchem Gerät wird DHCP Snooping konfiguriert?",
      explanation: "DHCP Snooping wird auf Access Layer 2 Switches konfiguriert.",
      answers: [
        { id: "a", text: "Core Router", isCorrect: false },
        { id: "b", text: "Distribution Switch", isCorrect: false },
        { id: "c", text: "Access L2 Switch", isCorrect: true },
        { id: "d", text: "Firewall", isCorrect: false },
      ],
    },
    // ACL
    {
      id: uid(), type: "single-choice", points: 5,
      text: "Welchen Nummernbereich hat eine Standard IP ACL?",
      explanation: "Standard ACL: 1–99 (Expanded: 1300–1999). Extended ACL: 100–199.",
      answers: [
        { id: "a", text: "1–99", isCorrect: true },
        { id: "b", text: "100–199", isCorrect: false },
        { id: "c", text: "200–299", isCorrect: false },
        { id: "d", text: "1–199", isCorrect: false },
      ],
    },
    // OSPF
    {
      id: uid(), type: "single-choice", points: 5,
      text: "Welche Area-ID hat die OSPF Backbone Area?",
      explanation: "Die OSPF Backbone Area hat immer Area-ID 0.",
      answers: [
        { id: "a", text: "Area 1", isCorrect: false },
        { id: "b", text: "Area 0", isCorrect: true },
        { id: "c", text: "Area 255", isCorrect: false },
        { id: "d", text: "Es gibt keine spezielle Backbone Area", isCorrect: false },
      ],
    },
    // QoS
    {
      id: uid(), type: "single-choice", points: 5,
      text: "Welcher Wert wird auf Layer 3 (IP-Header) für QoS-Markierung verwendet?",
      explanation: "DSCP (Differentiated Services Code Point) im DS-Feld des IP-Headers für Layer-3-QoS.",
      answers: [
        { id: "a", text: "CoS (Class of Service)", isCorrect: false },
        { id: "b", text: "DSCP (Differentiated Services Code Point)", isCorrect: true },
        { id: "c", text: "VLAN-ID", isCorrect: false },
        { id: "d", text: "ToS-Precedence (alt)", isCorrect: false },
      ],
    },
    // WLAN
    {
      id: uid(), type: "single-choice", points: 5,
      text: "Welche Kanäle im 2,4-GHz-Band überlappen sich nicht (USA-Standard)?",
      explanation: "Non-overlapping channels im 2,4 GHz: 1, 6 und 11.",
      answers: [
        { id: "a", text: "1, 6 und 11", isCorrect: true },
        { id: "b", text: "2, 6 und 10", isCorrect: false },
        { id: "c", text: "1 und 13", isCorrect: false },
        { id: "d", text: "Alle 13 Kanäle", isCorrect: false },
      ],
    },
    // Switching
    {
      id: uid(), type: "single-choice", points: 5,
      text: "Was beschreibt STP (Spanning Tree Protocol)?",
      explanation: "STP verhindert Layer-2-Loops in geswitchten Netzwerken durch Blockieren redundanter Pfade.",
      answers: [
        { id: "a", text: "Ein Protokoll zur verschlüsselten Übertragung über Switch-Links", isCorrect: false },
        { id: "b", text: "Ein Protokoll zur Verhinderung von Layer-2-Loops durch Blockierung redundanter Pfade", isCorrect: true },
        { id: "c", text: "Ein Protokoll zur VLAN-Konfiguration", isCorrect: false },
        { id: "d", text: "Ein Routing-Protokoll für Layer-3-Switches", isCorrect: false },
      ],
    },
    // VLANs
    {
      id: uid(), type: "single-choice", points: 5,
      text: "Was ist ein VLAN (Virtual Local Area Network)?",
      explanation: "Ein VLAN ist eine logische Trennung eines Switches in mehrere virtuelle Segmente – unabhängig von der physischen Verbindung.",
      answers: [
        { id: "a", text: "Ein physisch getrenntes Netzwerk zwischen zwei Gebäuden", isCorrect: false },
        { id: "b", text: "Eine logische Segmentierung eines Switches in mehrere virtuelle Netzwerke", isCorrect: true },
        { id: "c", text: "Ein verschlüsselter Tunnel zwischen zwei Routern", isCorrect: false },
        { id: "d", text: "Eine Methode zur WLAN-Authentifizierung", isCorrect: false },
      ],
    },
    // Routing
    {
      id: uid(), type: "single-choice", points: 5,
      text: "Was ist statisches Routing?",
      explanation: "Statisches Routing: Routen werden manuell durch einen Administrator konfiguriert und ändern sich nicht automatisch bei Topologieänderungen.",
      answers: [
        { id: "a", text: "Routing, das sich automatisch an Netzwerkänderungen anpasst", isCorrect: false },
        { id: "b", text: "Manuell konfigurierte Routen, die sich nicht automatisch ändern", isCorrect: true },
        { id: "c", text: "Routing-Protokoll basierend auf dem Bellman-Ford-Algorithmus", isCorrect: false },
        { id: "d", text: "Eine Methode zur Lastverteilung über mehrere Pfade", isCorrect: false },
      ],
    },
    // Cloud & Automation
    {
      id: uid(), type: "single-choice", points: 5,
      text: "Was ist der Unterschied zwischen IaaS, PaaS und SaaS im Cloud Computing?",
      explanation: "IaaS: Infrastructure as a Service (virtuelle Server). PaaS: Platform as a Service (Entwicklungsplattform). SaaS: Software as a Service (Anwendungen, z.B. Office 365).",
      answers: [
        { id: "a", text: "IaaS = Software, PaaS = Platform, SaaS = Infrastructure", isCorrect: false },
        { id: "b", text: "IaaS = Infrastructure (VMs), PaaS = Platform (Dev), SaaS = Software (Apps)", isCorrect: true },
        { id: "c", text: "Alle drei Begriffe beschreiben dasselbe Konzept", isCorrect: false },
        { id: "d", text: "IaaS = Internet, PaaS = Private, SaaS = Secure Access Service", isCorrect: false },
      ],
    },
    // Troubleshooting
    {
      id: uid(), type: "single-choice", points: 5,
      text: "Mit welchem Cisco-Kommando können CDP-Nachbarn angezeigt werden?",
      explanation: "'show cdp neighbors' zeigt direkt verbundene Cisco-Geräte, die CDP-Informationen austauschen.",
      answers: [
        { id: "a", text: "# show ip route", isCorrect: false },
        { id: "b", text: "# show interfaces", isCorrect: false },
        { id: "c", text: "# show cdp neighbors", isCorrect: true },
        { id: "d", text: "# show arp", isCorrect: false },
      ],
    },
    // EtherChannel
    {
      id: uid(), type: "single-choice", points: 5,
      text: "Was ist EtherChannel?",
      explanation: "EtherChannel bündelt mehrere physische Links zwischen Switches zu einem logischen Link – mehr Bandbreite und Redundanz.",
      answers: [
        { id: "a", text: "Ein WLAN-Protokoll zur Kanalbündelung", isCorrect: false },
        { id: "b", text: "Bündelung mehrerer physischer Links zu einem logischen Link (mehr Bandbreite + Redundanz)", isCorrect: true },
        { id: "c", text: "Ein Protokoll zur VLAN-Erweiterung über WAN", isCorrect: false },
        { id: "d", text: "Eine Methode zur Ethernet-Frame-Verschlüsselung", isCorrect: false },
      ],
    },
    // FHRP
    {
      id: uid(), type: "single-choice", points: 5,
      text: "Was ist HSRP (Hot Standby Router Protocol)?",
      explanation: "HSRP ist ein Cisco-FHRP (First Hop Redundancy Protocol): Mehrere Router teilen sich eine virtuelle IP als Default-Gateway. Bei Ausfall des aktiven Routers übernimmt der Standby-Router.",
      answers: [
        { id: "a", text: "Ein Routing-Protokoll für automatische Pfadoptimierung", isCorrect: false },
        { id: "b", text: "Cisco-Protokoll für Router-Redundanz mit virtueller Gateway-IP", isCorrect: true },
        { id: "c", text: "Eine Methode zur Switchport-Sicherheit", isCorrect: false },
        { id: "d", text: "Ein Spanning-Tree-Erweiterungsprotokoll", isCorrect: false },
      ],
    },
    // WAN
    {
      id: uid(), type: "single-choice", points: 5,
      text: "Was ist PPP (Point-to-Point Protocol)?",
      explanation: "PPP ist ein Layer-2-Protokoll für Punkt-zu-Punkt-WAN-Verbindungen (Leased Lines, ISDN, DSL via PPPoE). Es unterstützt Authentication (PAP/CHAP), Kompression und Multilink.",
      answers: [
        { id: "a", text: "Ein Layer-3-Routing-Protokoll für WAN-Verbindungen", isCorrect: false },
        { id: "b", text: "Ein Layer-2-Protokoll für Punkt-zu-Punkt-WAN-Verbindungen", isCorrect: true },
        { id: "c", text: "Ein WLAN-Sicherheitsprotokoll", isCorrect: false },
        { id: "d", text: "Ein Cloud-Protokoll zur Lastverteilung", isCorrect: false },
      ],
    },
  ],
};

// ============================================================
// Alle CCNA Quizzes als Collection
// ============================================================
export const CCNA_QUIZZES: Record<string, Quiz> = {
  [QUIZ_NETZWERKGRUNDLAGEN.id]: QUIZ_NETZWERKGRUNDLAGEN,
  [QUIZ_IPV4.id]: QUIZ_IPV4,
  [QUIZ_IPV6.id]: QUIZ_IPV6,
  [QUIZ_DHCP.id]: QUIZ_DHCP,
  [QUIZ_NAT.id]: QUIZ_NAT,
  [QUIZ_SECURITY.id]: QUIZ_SECURITY,
  [QUIZ_HARDEN.id]: QUIZ_HARDEN,
  [QUIZ_DHCP_SNOOPING.id]: QUIZ_DHCP_SNOOPING,
  [QUIZ_ACL.id]: QUIZ_ACL,
  [QUIZ_OSPF.id]: QUIZ_OSPF,
  [QUIZ_QOS.id]: QUIZ_QOS,
  [QUIZ_WLAN.id]: QUIZ_WLAN,
  [QUIZ_CCNA_EXAM.id]: QUIZ_CCNA_EXAM,
};
