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
    {
      id: uid(), type: "single-choice", points: 10,
      text: "Wofür steht die Abkürzung RFC?",
      explanation: "RFC = Request for Comments. Die IETF veröffentlicht RFCs als Spezifikationsdokumente für alle Internet-Standards (z. B. RFC 791 = IPv4, RFC 1918 = private Adressbereiche).",
      answers: [
        { id: "a", text: "Read for Comments", isCorrect: false },
        { id: "b", text: "Request for Comments", isCorrect: true },
        { id: "c", text: "Routing Function Code", isCorrect: false },
        { id: "d", text: "Reserved Frame Control", isCorrect: false },
      ],
    },
    {
      id: uid(), type: "single-choice", points: 10,
      text: "Wie viele Bits hat eine MAC-Adresse?",
      explanation: "Eine MAC-Adresse ist 48 Bit lang (6 Bytes), typischerweise dargestellt als 12 hexadezimale Stellen, z. B. 00:1A:2B:3C:4D:5E.",
      answers: [
        { id: "a", text: "32 Bit", isCorrect: false },
        { id: "b", text: "48 Bit", isCorrect: true },
        { id: "c", text: "64 Bit", isCorrect: false },
        { id: "d", text: "128 Bit", isCorrect: false },
      ],
    },
    {
      id: uid(), type: "multiple-choice", points: 15,
      text: "Welche Klassifikationen beschreiben die geographische Ausdehnung eines Netzwerks? (Mehrere Antworten möglich)",
      explanation: "PAN, LAN, CAN, MAN, WAN und GAN klassifizieren nach Reichweite. SAN und VPN sind funktionale Klassifikationen.",
      answers: [
        { id: "a", text: "PAN — Personal Area Network", isCorrect: true },
        { id: "b", text: "LAN — Local Area Network", isCorrect: true },
        { id: "c", text: "MAN — Metropolitan Area Network", isCorrect: true },
        { id: "d", text: "SAN — Storage Area Network", isCorrect: false },
        { id: "e", text: "WAN — Wide Area Network", isCorrect: true },
      ],
    },
    {
      id: uid(), type: "single-choice", points: 10,
      text: "Was ist der Unterschied zwischen einem Intranet und einem Extranet?",
      explanation: "Intranet = ausschließlich interne Mitarbeiter. Extranet = kontrollierte Erweiterung des Intranets für definierte externe Partner (Kunden, Lieferanten).",
      answers: [
        { id: "a", text: "Intranet ist verschlüsselt, Extranet nicht", isCorrect: false },
        { id: "b", text: "Intranet ist nur intern; Extranet erweitert es um definierte externe Partner", isCorrect: true },
        { id: "c", text: "Extranet liegt im Internet, Intranet im LAN", isCorrect: false },
        { id: "d", text: "Es gibt keinen Unterschied", isCorrect: false },
      ],
    },
    {
      id: uid(), type: "single-choice", points: 10,
      text: "Welche Aussage zur Topologie 'Linie' (Daisy-Chain) ist korrekt?",
      explanation: "In einer Linientopologie sind die Geräte in Reihe verkettet — jeder Knoten hat zwei Nachbarn (außer den Endpunkten). Ein Kabelbruch trennt das Netz.",
      answers: [
        { id: "a", text: "Jeder Knoten ist mit jedem anderen direkt verbunden", isCorrect: false },
        { id: "b", text: "Geräte sind in Reihe verkettet — ein Kabelbruch trennt das Netz", isCorrect: true },
        { id: "c", text: "Ein zentraler Switch verbindet alle Geräte sternförmig", isCorrect: false },
        { id: "d", text: "Die Endpunkte sind geschlossen (Token kreist)", isCorrect: false },
      ],
    },
    {
      id: uid(), type: "single-choice", points: 10,
      text: "Eine 1-Gbit/s-Leitung liefert in der Praxis nur 600 Mbit/s — wie heißt der Begriff dafür?",
      explanation: "Bandbreite = theoretisches Maximum (1 Gbit/s). Durchsatz (Throughput) = tatsächlich übertragene Nutzdatenmenge pro Zeit (600 Mbit/s). Latenz = Zeit pro Paket.",
      answers: [
        { id: "a", text: "Bandbreite", isCorrect: false },
        { id: "b", text: "Durchsatz (Throughput)", isCorrect: true },
        { id: "c", text: "Latenz", isCorrect: false },
        { id: "d", text: "Jitter", isCorrect: false },
      ],
    },
    // ── Netzwerkanforderungen & QoS ───────────────────────────────
    {
      id: uid(), type: "single-choice", points: 10,
      text: "Was ist der maximale empfohlene One-Way-Delay (Latenz) für VoIP-Qualität laut QoS-Standard?",
      explanation: "Für akzeptable VoIP-Qualität gilt: One-Way-Delay < 150 ms, Jitter < 30 ms, Paketverlust < 1 %.",
      answers: [
        { id: "a", text: "50 ms", isCorrect: false },
        { id: "b", text: "100 ms", isCorrect: false },
        { id: "c", text: "150 ms", isCorrect: true },
        { id: "d", text: "300 ms", isCorrect: false },
      ],
    },
    {
      id: uid(), type: "single-choice", points: 10,
      text: "Was beschreibt 'Jitter' in einem Netzwerk?",
      explanation: "Jitter ist die Schwankung der Übertragungsverzögerung zwischen aufeinanderfolgenden Paketen. Für VoIP darf er < 30 ms betragen.",
      answers: [
        { id: "a", text: "Die maximale Datenrate einer Verbindung", isCorrect: false },
        { id: "b", text: "Die Schwankung der Übertragungsverzögerung zwischen Paketen", isCorrect: true },
        { id: "c", text: "Die Anzahl verlorener Pakete pro Sekunde", isCorrect: false },
        { id: "d", text: "Die Round-Trip-Time eines Pakets", isCorrect: false },
      ],
    },
    {
      id: uid(), type: "multiple-choice", points: 15,
      text: "Welche der folgenden gehören zum CIA+A-Sicherheits-Framework? (Mehrere Antworten möglich)",
      explanation: "CIA+A steht für Confidentiality (Vertraulichkeit), Integrity (Integrität), Availability (Verfügbarkeit) + Authenticity (Authentizität). Authentication ist ein Prozess, kein Schutzziel.",
      answers: [
        { id: "a", text: "Confidentiality (Vertraulichkeit)", isCorrect: true },
        { id: "b", text: "Integrity (Integrität)", isCorrect: true },
        { id: "c", text: "Availability (Verfügbarkeit)", isCorrect: true },
        { id: "d", text: "Authenticity (Authentizität)", isCorrect: true },
        { id: "e", text: "Anonymity (Anonymität)", isCorrect: false },
      ],
    },
    {
      id: uid(), type: "single-choice", points: 10,
      text: "Welches CIA+A-Schutzziel garantiert, dass Daten unterwegs nicht manipuliert wurden?",
      explanation: "Integrity (Integrität) stellt sicher, dass Daten unverändert ankommen. Realisiert durch Hashing (SHA-256) und digitale Signaturen.",
      answers: [
        { id: "a", text: "Confidentiality", isCorrect: false },
        { id: "b", text: "Integrity", isCorrect: true },
        { id: "c", text: "Availability", isCorrect: false },
        { id: "d", text: "Authenticity", isCorrect: false },
      ],
    },
    {
      id: uid(), type: "single-choice", points: 10,
      text: "Welches der '5 As' von Cisco beschreibt, dass ein Netz 24/7/365 erreichbar sein muss?",
      explanation: "Anytime / Always-on beschreibt die Anforderung permanenter Verfügbarkeit. Dies wird durch Redundanz, Failover und unterbrechungsfreie Stromversorgung (USV) realisiert.",
      answers: [
        { id: "a", text: "Anybody", isCorrect: false },
        { id: "b", text: "Anytime / Always-on", isCorrect: true },
        { id: "c", text: "Anywhere", isCorrect: false },
        { id: "d", text: "Any Device", isCorrect: false },
      ],
    },
    // ── Enterprise Network Design ─────────────────────────────────
    {
      id: uid(), type: "single-choice", points: 10,
      text: "Wie nennt man das 2-Tier-Design, bei dem Core-Layer und Distribution-Layer in einem Gerät zusammengeführt werden?",
      explanation: "Collapsed Core: Core- und Distribution-Layer sind physisch zusammengelegt. Günstiger als 3-Tier, geeignet für mittlere Unternehmen, aber weniger skalierbar.",
      answers: [
        { id: "a", text: "Spine-Leaf", isCorrect: false },
        { id: "b", text: "Collapsed Core", isCorrect: true },
        { id: "c", text: "SOHO-Design", isCorrect: false },
        { id: "d", text: "Flat Network", isCorrect: false },
      ],
    },
    {
      id: uid(), type: "multiple-choice", points: 15,
      text: "Welche Aussagen zu Spine-Leaf sind korrekt? (Mehrere Antworten möglich)",
      explanation: "Spine-Leaf Regeln: Jeder Leaf muss mit jedem Spine verbunden sein. Leaf-Leaf und Spine-Spine Verbindungen sind verboten. Endpunkte (Server) nur an Leaf-Switches.",
      answers: [
        { id: "a", text: "Jeder Leaf muss mit jedem Spine verbunden sein", isCorrect: true },
        { id: "b", text: "Leaf-Switches dürfen nicht untereinander verbunden werden", isCorrect: true },
        { id: "c", text: "Spine-Switches dürfen nicht untereinander verbunden werden", isCorrect: true },
        { id: "d", text: "Server können direkt an Spine-Switches angebunden werden", isCorrect: false },
        { id: "e", text: "Endpunkte werden ausschließlich an Leaf-Switches angebunden", isCorrect: true },
      ],
    },
    {
      id: uid(), type: "single-choice", points: 10,
      text: "Welchen Vorteil bietet Spine-Leaf gegenüber einem klassischen 3-Tier-Design im Rechenzentrum?",
      explanation: "Spine-Leaf garantiert immer genau 2 Hops zwischen beliebigen Endpunkten → gleichmäßige, vorhersagbare Latenz. 3-Tier hat variable Hop-Counts.",
      answers: [
        { id: "a", text: "Günstiger in der Anschaffung", isCorrect: false },
        { id: "b", text: "Einfacher zu konfigurieren als 3-Tier", isCorrect: false },
        { id: "c", text: "Gleichmäßige, vorhersagbare Latenz (immer 2 Hops)", isCorrect: true },
        { id: "d", text: "Unterstützt mehr Protokolle als 3-Tier", isCorrect: false },
      ],
    },
    {
      id: uid(), type: "single-choice", points: 10,
      text: "In welcher Schicht des 3-Tier Hierarchical Network Model werden ACLs, QoS und Routing-Policies implementiert?",
      explanation: "Der Distribution Layer ist der Policy-Layer: hier laufen ACLs, QoS, Inter-VLAN-Routing und Routing-Policies. Core ist nur Hochgeschwindigkeits-Backbone, Access ist für Endgeräte.",
      answers: [
        { id: "a", text: "Access Layer", isCorrect: false },
        { id: "b", text: "Distribution Layer", isCorrect: true },
        { id: "c", text: "Core Layer", isCorrect: false },
        { id: "d", text: "Management Layer", isCorrect: false },
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
    // ── Block 1: Maske / Hosts ──────────────────────────────────
    {
      id: uid(), type: "single-choice", points: 10,
      text: "Welche Subnetzmaske in Dotted-Decimal entspricht dem Präfix /22?",
      explanation: "/22 = 22 Netz-Bits. Die ersten drei Oktette sind voll besetzt (255.255), das vierte Oktett: 22 − 16 = 6 Bits gesetzt → 11111100 = 252. Ergebnis: 255.255.252.0",
      answers: [
        { id: "a", text: "255.255.255.0", isCorrect: false },
        { id: "b", text: "255.255.252.0", isCorrect: true },
        { id: "c", text: "255.255.254.0", isCorrect: false },
        { id: "d", text: "255.255.248.0", isCorrect: false },
      ],
    },
    {
      id: uid(), type: "single-choice", points: 10,
      text: "Wie viele nutzbare Hosts hat ein /27-Subnetz?",
      explanation: "/27 → 5 Host-Bits → 2^5 − 2 = 32 − 2 = 30 nutzbare Hosts.",
      answers: [
        { id: "a", text: "14", isCorrect: false },
        { id: "b", text: "30", isCorrect: true },
        { id: "c", text: "32", isCorrect: false },
        { id: "d", text: "62", isCorrect: false },
      ],
    },
    {
      id: uid(), type: "single-choice", points: 10,
      text: "Welches CIDR-Präfix und wie viele Hosts hat die Subnetzmaske 255.255.255.192?",
      explanation: "255.255.255.192 → 192 = 11000000 → 2 Host-Bits gesetzt im letzten Oktett → 24 + 2 = /26. Host-Bits: 6 → 2^6 − 2 = 62 Hosts.",
      answers: [
        { id: "a", text: "/25, 126 Hosts", isCorrect: false },
        { id: "b", text: "/27, 30 Hosts", isCorrect: false },
        { id: "c", text: "/26, 62 Hosts", isCorrect: true },
        { id: "d", text: "/28, 14 Hosts", isCorrect: false },
      ],
    },
    // ── Block 2: Subnetz-ID / Broadcast / Hostbereich ───────────
    {
      id: uid(), type: "single-choice", points: 10,
      text: "Welche Subnetz-ID gehört zu 10.10.10.45 /27?",
      explanation: "Magic Number: 256 − 224 = 32. Vielfache: 0, 32, 64 ... → 32 ≤ 45 < 64 → Subnetz-ID: 10.10.10.32",
      answers: [
        { id: "a", text: "10.10.10.0", isCorrect: false },
        { id: "b", text: "10.10.10.32", isCorrect: true },
        { id: "c", text: "10.10.10.40", isCorrect: false },
        { id: "d", text: "10.10.10.64", isCorrect: false },
      ],
    },
    {
      id: uid(), type: "single-choice", points: 10,
      text: "Was ist die Broadcast-Adresse von 192.168.1.130 /26?",
      explanation: "Magic = 256 − 192 = 64. Subnetz-ID: 128 (128 ≤ 130 < 192). Broadcast: 128 + 64 − 1 = 191 → 192.168.1.191",
      answers: [
        { id: "a", text: "192.168.1.127", isCorrect: false },
        { id: "b", text: "192.168.1.190", isCorrect: false },
        { id: "c", text: "192.168.1.191", isCorrect: true },
        { id: "d", text: "192.168.1.255", isCorrect: false },
      ],
    },
    {
      id: uid(), type: "single-choice", points: 10,
      text: "Welche Subnetz-ID hat 172.16.5.200 /22?",
      explanation: "Magic = 256 − 252 = 4 (im 3. Oktett). Vielfache: 0, 4, 8 ... Oktett 3: 5 → 4 ≤ 5 < 8 → Subnetz-ID: 172.16.4.0",
      answers: [
        { id: "a", text: "172.16.0.0", isCorrect: false },
        { id: "b", text: "172.16.4.0", isCorrect: true },
        { id: "c", text: "172.16.5.0", isCorrect: false },
        { id: "d", text: "172.16.8.0", isCorrect: false },
      ],
    },
    {
      id: uid(), type: "single-choice", points: 10,
      text: "Broadcast-Adresse von 10.0.0.18 /29?",
      explanation: "Magic = 256 − 248 = 8. Vielfache: 0, 8, 16, 24 ... → 16 ≤ 18 < 24 → Subnetz-ID: .16, Broadcast: 16 + 8 − 1 = 23 → 10.0.0.23",
      answers: [
        { id: "a", text: "10.0.0.19", isCorrect: false },
        { id: "b", text: "10.0.0.22", isCorrect: false },
        { id: "c", text: "10.0.0.23", isCorrect: true },
        { id: "d", text: "10.0.0.31", isCorrect: false },
      ],
    },
    // ── Block 3: Subnetzanzahl ───────────────────────────────────
    {
      id: uid(), type: "single-choice", points: 10,
      text: "Wie viele /27-Subnetze passen in ein /24-Netz?",
      explanation: "Differenz der Präfix-Längen: 27 − 24 = 3 zusätzliche Netz-Bits → 2^3 = 8 Subnetze.",
      answers: [
        { id: "a", text: "4", isCorrect: false },
        { id: "b", text: "6", isCorrect: false },
        { id: "c", text: "8", isCorrect: true },
        { id: "d", text: "16", isCorrect: false },
      ],
    },
    {
      id: uid(), type: "single-choice", points: 10,
      text: "Wie viele /20-Subnetze passen in ein /16-Netz?",
      explanation: "20 − 16 = 4 zusätzliche Bits → 2^4 = 16 Subnetze.",
      answers: [
        { id: "a", text: "8", isCorrect: false },
        { id: "b", text: "16", isCorrect: true },
        { id: "c", text: "32", isCorrect: false },
        { id: "d", text: "64", isCorrect: false },
      ],
    },
    // ── Block 4: VLSM ────────────────────────────────────────────
    {
      id: uid(), type: "single-choice", points: 15,
      text: "Ein LAN braucht 50 Hosts. Welches CIDR-Präfix ist das kleinste (sparsamste), das ausreicht?",
      explanation: "/26 → 6 Host-Bits → 2^6 − 2 = 62 nutzbare Hosts ≥ 50. /27 hätte nur 30 Hosts — zu wenig.",
      answers: [
        { id: "a", text: "/25 (126 Hosts)", isCorrect: false },
        { id: "b", text: "/26 (62 Hosts)", isCorrect: true },
        { id: "c", text: "/27 (30 Hosts)", isCorrect: false },
        { id: "d", text: "/28 (14 Hosts)", isCorrect: false },
      ],
    },
    {
      id: uid(), type: "single-choice", points: 15,
      text: "VLSM-Aufgabe: Du hast 192.168.10.0/24. LAN-A braucht 50 Hosts, LAN-B 25, LAN-C 10, WAN-1 und WAN-2 je 2 Hosts. Welches Subnetz wird LAN-A zugewiesen (von größtem Bedarf her)?",
      explanation: "VLSM: größten Bedarf zuerst. 50 Hosts → /26 (62 Hosts). Erstes verfügbares /26 im .0/24 ist 192.168.10.0/26 (Bereich .0–.63).",
      answers: [
        { id: "a", text: "192.168.10.0/27", isCorrect: false },
        { id: "b", text: "192.168.10.0/25", isCorrect: false },
        { id: "c", text: "192.168.10.0/26", isCorrect: true },
        { id: "d", text: "192.168.10.64/26", isCorrect: false },
      ],
    },
    // ── Block 5: Schnell-Tricks ───────────────────────────────────
    {
      id: uid(), type: "single-choice", points: 10,
      text: "Wie groß ist die Block-Size (Magic Number) bei /29?",
      explanation: "/29 → Maske 255.255.255.248 → letztes Oktett: 248. Magic = 256 − 248 = 8.",
      answers: [
        { id: "a", text: "4", isCorrect: false },
        { id: "b", text: "8", isCorrect: true },
        { id: "c", text: "16", isCorrect: false },
        { id: "d", text: "32", isCorrect: false },
      ],
    },
    {
      id: uid(), type: "single-choice", points: 10,
      text: "Wie viele nutzbare Hosts hat ein /23-Netz?",
      explanation: "/23 → 9 Host-Bits → 2^9 − 2 = 512 − 2 = 510 nutzbare Hosts.",
      answers: [
        { id: "a", text: "254", isCorrect: false },
        { id: "b", text: "510", isCorrect: true },
        { id: "c", text: "512", isCorrect: false },
        { id: "d", text: "1022", isCorrect: false },
      ],
    },
    {
      id: uid(), type: "true-false", points: 5,
      text: "Der Host 172.20.130.5 liegt im Subnetz 172.20.128.0/17.",
      explanation: "Richtig. Magic = 256 − 128 = 128 (im 3. Oktett). Subnetz-ID: 128 (da 128 ≤ 130 < 256). Das Subnetz 172.20.128.0/17 umfasst 172.20.128.0 – 172.20.255.254 → 130.5 liegt darin.",
      answers: [
        { id: "a", text: "Wahr", isCorrect: true },
        { id: "b", text: "Falsch", isCorrect: false },
      ],
    },
    // ── Block 6: Klasse erkennen ─────────────────────────────────
    {
      id: uid(), type: "single-choice", points: 10,
      text: "Welcher IP-Klasse gehört 172.20.0.39 an?",
      explanation: "172 in Binär: 10101100. Beginnt mit '10' → Klasse B (128–191).",
      answers: [
        { id: "a", text: "Klasse A", isCorrect: false },
        { id: "b", text: "Klasse B", isCorrect: true },
        { id: "c", text: "Klasse C", isCorrect: false },
        { id: "d", text: "Klasse D", isCorrect: false },
      ],
    },
    {
      id: uid(), type: "single-choice", points: 10,
      text: "Welcher IP-Klasse gehört 224.0.0.5 an, und wofür wird sie typischerweise genutzt?",
      explanation: "224 = 11100000 → beginnt mit '1110' → Klasse D (Multicast). 224.0.0.5 ist die OSPF AllSPFRouters Multicast-Adresse.",
      answers: [
        { id: "a", text: "Klasse C – Unicast", isCorrect: false },
        { id: "b", text: "Klasse D – Multicast", isCorrect: true },
        { id: "c", text: "Klasse E – Reserviert", isCorrect: false },
        { id: "d", text: "Klasse B – Unicast", isCorrect: false },
      ],
    },
    {
      id: uid(), type: "single-choice", points: 10,
      text: "Welcher IP-Klasse gehört 245.72.189.160 an?",
      explanation: "245 = 11110101 → beginnt mit '1111' → Klasse E (reserviert/experimentell).",
      answers: [
        { id: "a", text: "Klasse C", isCorrect: false },
        { id: "b", text: "Klasse D", isCorrect: false },
        { id: "c", text: "Klasse E", isCorrect: true },
        { id: "d", text: "Klasse A", isCorrect: false },
      ],
    },
    // ── Block 7: Magic-Number-Praxis ─────────────────────────────
    {
      id: uid(), type: "single-choice", points: 10,
      text: "Welche Subnetz-ID hat 220.8.7.100 /28?",
      explanation: "Magic = 256 − 240 = 16. Vielfache: 80, 96, 112 ... → 96 ≤ 100 < 112 → Subnetz-ID: 220.8.7.96",
      answers: [
        { id: "a", text: "220.8.7.80", isCorrect: false },
        { id: "b", text: "220.8.7.96", isCorrect: true },
        { id: "c", text: "220.8.7.100", isCorrect: false },
        { id: "d", text: "220.8.7.112", isCorrect: false },
      ],
    },
    {
      id: uid(), type: "single-choice", points: 10,
      text: "Broadcast-Adresse von 177.88.77.154 /27?",
      explanation: "Magic = 256 − 224 = 32. Vielfache: 128, 160 ... → 128 ≤ 154 < 160 → Subnetz-ID: .128, Broadcast: 128 + 32 − 1 = 159 → 177.88.77.159",
      answers: [
        { id: "a", text: "177.88.77.158", isCorrect: false },
        { id: "b", text: "177.88.77.159", isCorrect: true },
        { id: "c", text: "177.88.77.160", isCorrect: false },
        { id: "d", text: "177.88.77.191", isCorrect: false },
      ],
    },
    {
      id: uid(), type: "single-choice", points: 10,
      text: "Subnetz-ID für 197.99.178.212 /25?",
      explanation: "Magic = 256 − 128 = 128. Vielfache: 0, 128, 256 ... → 128 ≤ 212 < 256 → Subnetz-ID: 197.99.178.128",
      answers: [
        { id: "a", text: "197.99.178.0", isCorrect: false },
        { id: "b", text: "197.99.178.128", isCorrect: true },
        { id: "c", text: "197.99.178.192", isCorrect: false },
        { id: "d", text: "197.99.178.224", isCorrect: false },
      ],
    },
    {
      id: uid(), type: "single-choice", points: 10,
      text: "Subnetz-ID (3. Oktett) für 172.25.45.154 /22?",
      explanation: "Magic = 256 − 252 = 4 im 3. Oktett. Vielfache: 40, 44, 48 ... → 44 ≤ 45 < 48 → Subnetz-ID: 172.25.44.0",
      answers: [
        { id: "a", text: "172.25.40.0", isCorrect: false },
        { id: "b", text: "172.25.44.0", isCorrect: true },
        { id: "c", text: "172.25.45.0", isCorrect: false },
        { id: "d", text: "172.25.48.0", isCorrect: false },
      ],
    },
    {
      id: uid(), type: "single-choice", points: 10,
      text: "Was ist die Broadcast-Adresse von 192.168.78.189 /28?",
      explanation: "Magic = 16. Vielfache: 176, 192 ... → 176 ≤ 189 < 192 → Subnetz-ID: .176, Broadcast: 176 + 16 − 1 = 191 → 192.168.78.191",
      answers: [
        { id: "a", text: "192.168.78.188", isCorrect: false },
        { id: "b", text: "192.168.78.190", isCorrect: false },
        { id: "c", text: "192.168.78.191", isCorrect: true },
        { id: "d", text: "192.168.78.255", isCorrect: false },
      ],
    },
    {
      id: uid(), type: "single-choice", points: 10,
      text: "Subnetz-ID (3. Oktett) für 10.1.98.199 /19?",
      explanation: "Magic = 256 − 224 = 32 im 3. Oktett. Vielfache: 64, 96, 128 ... → 96 ≤ 98 < 128 → Subnetz-ID: 10.1.96.0",
      answers: [
        { id: "a", text: "10.1.64.0", isCorrect: false },
        { id: "b", text: "10.1.96.0", isCorrect: true },
        { id: "c", text: "10.1.98.0", isCorrect: false },
        { id: "d", text: "10.1.128.0", isCorrect: false },
      ],
    },
  ],
};

// ============================================================
// QUIZ 2b: Netzwerk-Segmentierung
// ============================================================
export const QUIZ_SEGMENTIERUNG: Quiz = {
  id: "ccna-quiz-segmentierung",
  title: "CCNA: Netzwerk-Segmentierung",
  description: "Sicherheitszonen, VLSM-Design, DMZ, ACL-Policy und Enterprise-Segmentierungsszenarien",
  passingScore: 70,
  shuffleQuestions: true,
  questions: [
    // ── Block 1: Warum segmentieren? ─────────────────────────
    {
      id: uid(), type: "single-choice", points: 10,
      text: "Welches Problem löst Netzwerk-Segmentierung als erstes?",
      explanation: "Das Hauptproblem ohne Segmentierung sind zu große Broadcast-Domänen: Jedes Gerät verarbeitet jeden Broadcast (ARP, DHCP, STP-BPDUs). Ab ~200 Geräten entstehen messbare Performance-Einbußen.",
      answers: [
        { id: "a", text: "Zu langsame Festplatten auf Servern", isCorrect: false },
        { id: "b", text: "Zu große Broadcast-Domänen mit zu vielen Geräten", isCorrect: true },
        { id: "c", text: "Zu wenig DHCP-Lease-Zeiten", isCorrect: false },
        { id: "d", text: "Zu langsame Switch-Backplane", isCorrect: false },
      ],
    },
    {
      id: uid(), type: "multiple-choice", points: 15,
      text: "Welche der folgenden Vorteile bietet Netzwerk-Segmentierung? (Mehrere Antworten möglich)",
      explanation: "Segmentierung verbessert Performance (kleinere Broadcast-Domänen), Sicherheit (Zonenübergänge kontrollierbar), IP-Management (Adressen = Funktionen) und Compliance (PCI-DSS, ISO 27001 fordern Netztrennung). WLAN-Geschwindigkeit selbst wird nicht durch IP-Segmentierung beeinflusst.",
      answers: [
        { id: "a", text: "Kleinere Broadcast-Domänen → bessere Performance", isCorrect: true },
        { id: "b", text: "Laterale Bewegung von Angreifern erschwert", isCorrect: true },
        { id: "c", text: "IP-Adressen reflektieren Funktion und Zone", isCorrect: true },
        { id: "d", text: "WLAN-Übertragungsrate wird erhöht", isCorrect: false },
        { id: "e", text: "Compliance-Anforderungen (PCI-DSS) leichter erfüllbar", isCorrect: true },
      ],
    },
    {
      id: uid(), type: "single-choice", points: 10,
      text: "Was ist 'laterale Bewegung' (Lateral Movement) im Kontext der Netzwerksicherheit?",
      explanation: "Laterale Bewegung bezeichnet das Ausbreiten eines Angreifers innerhalb eines Netzwerks nach dem ersten Einbruch. Ein kompromittierter PC in der Client-Zone kann ohne Segmentierung direkt Server angreifen. Segmentierung mit ACLs verhindert diese Ausbreitung.",
      answers: [
        { id: "a", text: "Das Roaming von WLAN-Clients zwischen Access Points", isCorrect: false },
        { id: "b", text: "Das Ausbreiten eines Angreifers von System zu System nach dem Einbruch", isCorrect: true },
        { id: "c", text: "Das Verschieben von VMs zwischen Hypervisoren", isCorrect: false },
        { id: "d", text: "Die Verlagerung von Traffic auf redundante Links", isCorrect: false },
      ],
    },
    // ── Block 2: Sicherheitszonen ─────────────────────────────
    {
      id: uid(), type: "single-choice", points: 10,
      text: "Was ist eine DMZ (Demilitarized Zone) in einem Unternehmensnetz?",
      explanation: "Die DMZ ist eine Netzwerkzone für Server, die vom Internet erreichbar sein müssen (Web, Mail, DNS), aber keinen direkten Zugriff auf das interne Netz haben dürfen. Sie liegt zwischen der äußeren und inneren Firewall.",
      answers: [
        { id: "a", text: "Eine spezielle VLAN für Management-Geräte", isCorrect: false },
        { id: "b", text: "Eine Zone für öffentlich erreichbare Server, getrennt vom internen Netz", isCorrect: true },
        { id: "c", text: "Das Standard-VLAN 1 auf Cisco-Switches", isCorrect: false },
        { id: "d", text: "Ein separates WLAN nur für Gäste", isCorrect: false },
      ],
    },
    {
      id: uid(), type: "single-choice", points: 10,
      text: "Welche Firewall-Regel ist für eine korrekt konfigurierte DMZ ZWINGEND notwendig?",
      explanation: "Die kritischste Regel: DMZ → Internes Netz muss blockiert sein. Wenn ein Web-Server in der DMZ kompromittiert wird, darf er keinen Zugriff auf interne Systeme haben. Ohne diese Regel ist die DMZ wertlos.",
      answers: [
        { id: "a", text: "Internet → DMZ: alles erlauben", isCorrect: false },
        { id: "b", text: "DMZ → Internes Netz: blockieren", isCorrect: true },
        { id: "c", text: "Intern → DMZ: alles blockieren", isCorrect: false },
        { id: "d", text: "DMZ → Internet: alles erlauben", isCorrect: false },
      ],
    },
    {
      id: uid(), type: "single-choice", points: 10,
      text: "Welches VLAN sollte laut Best Practices für das Management-Netz verwendet werden?",
      explanation: "Management-Datenverkehr (SSH zu Switches, SNMP) sollte niemals über VLAN 1 laufen (VLAN 1 ist Default und unsicher). Best Practice: ein dediziertes VLAN (oft 99 oder 100) für Management, das nur Admin-Stationen nutzen dürfen.",
      answers: [
        { id: "a", text: "VLAN 1 (Default VLAN)", isCorrect: false },
        { id: "b", text: "VLAN 0 (reserviert)", isCorrect: false },
        { id: "c", text: "Ein dediziertes VLAN (z.B. VLAN 99)", isCorrect: true },
        { id: "d", text: "Das VLAN mit der höchsten ID (4094)", isCorrect: false },
      ],
    },
    {
      id: uid(), type: "multiple-choice", points: 15,
      text: "Welche Systeme gehören typischerweise in die DMZ? (Mehrere Antworten möglich)",
      explanation: "In die DMZ gehören nur Systeme, die direkt aus dem Internet erreichbar sein müssen: Web-Server, Mail-Server (SMTP), öffentliche DNS-Resolver, VPN-Gateways. Active Directory, interne Datenbanken und File-Server gehören niemals in die DMZ.",
      answers: [
        { id: "a", text: "Web-Server (HTTP/HTTPS)", isCorrect: true },
        { id: "b", text: "Active Directory Domain Controller", isCorrect: false },
        { id: "c", text: "Mail-Server (SMTP)", isCorrect: true },
        { id: "d", text: "Interner SQL-Datenbank-Server", isCorrect: false },
        { id: "e", text: "Öffentlicher DNS-Resolver", isCorrect: true },
        { id: "f", text: "VPN-Gateway", isCorrect: true },
      ],
    },
    // ── Block 3: VLSM-Planung ─────────────────────────────────
    {
      id: uid(), type: "single-choice", points: 10,
      text: "Du musst 5 Subnetze aus 192.168.50.0/24 bilden: 100 Hosts, 50 Hosts, 25 Hosts, 10 Hosts, 5 Hosts. In welcher Reihenfolge vergibst du die Subnetze bei VLSM?",
      explanation: "VLSM-Grundregel: Immer vom größten zum kleinsten Subnetz planen. Sonst entstehen Lücken im Adressraum, die nicht mehr genutzt werden können. Also: 100 → 50 → 25 → 10 → 5.",
      answers: [
        { id: "a", text: "Kleinste zuerst: 5, 10, 25, 50, 100", isCorrect: false },
        { id: "b", text: "Alphabetisch nach Zone", isCorrect: false },
        { id: "c", text: "Größte zuerst: 100, 50, 25, 10, 5", isCorrect: true },
        { id: "d", text: "Beliebig — VLSM hat keine Reihenfolge", isCorrect: false },
      ],
    },
    {
      id: uid(), type: "single-choice", points: 10,
      text: "Eine Zone benötigt 50 nutzbare Hosts. Welches CIDR-Präfix ist das kleinste (effizienteste), das ausreicht?",
      explanation: "50 Hosts benötigen: 2^n - 2 ≥ 50 → 2^6 = 64 → 64 - 2 = 62 Hosts nutzbar. Also /26. Ein /27 würde nur 30 Hosts liefern (zu wenig). Ein /25 wäre zu groß (126 Hosts).",
      answers: [
        { id: "a", text: "/25 (126 Hosts)", isCorrect: false },
        { id: "b", text: "/26 (62 Hosts) ✓", isCorrect: true },
        { id: "c", text: "/27 (30 Hosts)", isCorrect: false },
        { id: "d", text: "/28 (14 Hosts)", isCorrect: false },
      ],
    },
    {
      id: uid(), type: "single-choice", points: 10,
      text: "Du planst VLSM aus 10.0.0.0/22. Erst vergibst du ein /24 für 200 Hosts. Wo beginnt das nächste Subnetz (/26, 60 Hosts)?",
      explanation: "10.0.0.0/22 enthält .0 bis .3.255. Ein /24 beginnt bei 10.0.0.0 und endet bei 10.0.0.255. Das nächste Subnetz beginnt daher bei 10.0.1.0.",
      answers: [
        { id: "a", text: "10.0.0.192", isCorrect: false },
        { id: "b", text: "10.0.0.254", isCorrect: false },
        { id: "c", text: "10.0.1.0", isCorrect: true },
        { id: "d", text: "10.0.2.0", isCorrect: false },
      ],
    },
    {
      id: uid(), type: "single-choice", points: 10,
      text: "Firma bekommt 172.16.0.0/20. Welche maximale Anzahl nutzbarer Hosts bietet dieses Netz?",
      explanation: "/20 → 12 Host-Bits → 2^12 - 2 = 4096 - 2 = 4094 nutzbare Hosts. Der Adressraum geht von 172.16.0.0 bis 172.16.15.255.",
      answers: [
        { id: "a", text: "1022", isCorrect: false },
        { id: "b", text: "2046", isCorrect: false },
        { id: "c", text: "4094", isCorrect: true },
        { id: "d", text: "8190", isCorrect: false },
      ],
    },
    {
      id: uid(), type: "single-choice", points: 10,
      text: "Für eine Point-to-Point Verbindung zwischen zwei Routern — welches CIDR-Präfix spart am meisten Adressen?",
      explanation: "/30 liefert genau 2 nutzbare Hosts (4 Adressen: Netz, Host1, Host2, Broadcast) — perfekt für P2P-Links. /31 (RFC 3021) ist auch gültig für P2P, aber weniger verbreitet. /29 wäre Verschwendung (6 nutzbar, aber nur 2 gebraucht).",
      answers: [
        { id: "a", text: "/28 (14 nutzbare Hosts)", isCorrect: false },
        { id: "b", text: "/29 (6 nutzbare Hosts)", isCorrect: false },
        { id: "c", text: "/30 (2 nutzbare Hosts)", isCorrect: true },
        { id: "d", text: "/32 (0 nutzbare Hosts — Host-Route)", isCorrect: false },
      ],
    },
    // ── Block 4: Cisco IOS Segmentierung ─────────────────────
    {
      id: uid(), type: "single-choice", points: 10,
      text: "Du konfigurierst Router-on-a-Stick für VLAN 20. Welcher Befehl aktiviert das 802.1Q-Tagging am Sub-Interface?",
      explanation: "encapsulation dot1Q 20 weist dem Sub-Interface die VLAN-ID 20 zu und aktiviert 802.1Q-Tagging. Ohne diesen Befehl weiß der Router nicht, welches VLAN dieses Sub-Interface bedient.",
      answers: [
        { id: "a", text: "switchport mode trunk", isCorrect: false },
        { id: "b", text: "vlan 20", isCorrect: false },
        { id: "c", text: "encapsulation dot1Q 20", isCorrect: true },
        { id: "d", text: "ip vlan-id 20", isCorrect: false },
      ],
    },
    {
      id: uid(), type: "single-choice", points: 10,
      text: "Welcher Befehl verknüpft eine ACL namens 'GAESTE-POLICY' mit einem Router-Interface in eingehender Richtung?",
      explanation: "ip access-group NAME in wendet eine named ACL eingehend (in) auf ein Interface an. 'out' wäre ausgehend. access-list group und ip access-list in sind keine gültigen Cisco IOS Befehle.",
      answers: [
        { id: "a", text: "access-list group GAESTE-POLICY in", isCorrect: false },
        { id: "b", text: "ip access-group GAESTE-POLICY in", isCorrect: true },
        { id: "c", text: "ip access-list GAESTE-POLICY in", isCorrect: false },
        { id: "d", text: "apply access-list GAESTE-POLICY inbound", isCorrect: false },
      ],
    },
    {
      id: uid(), type: "single-choice", points: 10,
      text: "Ein Layer-3-Switch soll als Inter-VLAN-Router fungieren. Welcher globale Befehl muss zuerst eingegeben werden?",
      explanation: "ip routing aktiviert auf einem Layer-3-Switch die Routing-Funktion. Ohne diesen Befehl arbeitet der Switch nur auf Layer 2, auch wenn SVIs konfiguriert sind.",
      answers: [
        { id: "a", text: "router eigrp 1", isCorrect: false },
        { id: "b", text: "ip routing", isCorrect: true },
        { id: "c", text: "no switchport", isCorrect: false },
        { id: "d", text: "routing-protocol on", isCorrect: false },
      ],
    },
    {
      id: uid(), type: "single-choice", points: 10,
      text: "Was zeigt der Befehl 'show ip route' nach korrekter Segmentierungs-Konfiguration?",
      explanation: "show ip route zeigt alle bekannten Netzwerke in der Routing-Tabelle. Nach korrekter Segmentierung sollten alle konfigurierten Subnetze als 'C' (Connected) erscheinen — eines pro Sub-Interface oder SVI.",
      answers: [
        { id: "a", text: "Die MAC-Adresstabelle des Switches", isCorrect: false },
        { id: "b", text: "Alle direkt verbundenen und erlernten Netzwerke", isCorrect: true },
        { id: "c", text: "Alle konfigurierten ACLs", isCorrect: false },
        { id: "d", text: "Die DHCP-Lease-Tabelle", isCorrect: false },
      ],
    },
    // ── Block 5: Szenarien & Planung ─────────────────────────
    {
      id: uid(), type: "single-choice", points: 10,
      text: "Ein Unternehmen hat 3 Abteilungen (je 30 Hosts) und ein Managementnetz (5 Hosts). Welches Netz als Basis ist mindestens nötig, um alle Bereiche zu versorgen?",
      explanation: "3 × /27 (je 32er-Block) + 1 × /29 (8er-Block) = 96 + 8 = 104 Adressen. Ein /25 (128 Adressen, 126 nutzbar) reicht nicht für 4 separate Subnetze mit eigenen Netz- und Broadcast-Adressen. Ein /24 (256 Adressen) passt bequem.",
      answers: [
        { id: "a", text: "/25 (128 Adressen)", isCorrect: false },
        { id: "b", text: "/24 (256 Adressen)", isCorrect: true },
        { id: "c", text: "/28 (16 Adressen)", isCorrect: false },
        { id: "d", text: "/30 (4 Adressen)", isCorrect: false },
      ],
    },
    {
      id: uid(), type: "single-choice", points: 10,
      text: "Was passiert, wenn ein Gäste-WLAN-Client versucht, einen internen Server zu erreichen, und die ACL lautet: 'deny ip 192.168.40.0 0.0.0.255 192.168.0.0 0.0.255.255'?",
      explanation: "Die ACL-Regel verweigert (deny) allen Traffic von 192.168.40.0/24 (Gäste-WLAN) in Richtung 192.168.0.0/16 (internes Netz). Der Verbindungsversuch wird stillschweigend verworfen. Der Client erhält keine direkte Fehlermeldung — der TCP-Verbindungsaufbau läuft ins Timeout.",
      answers: [
        { id: "a", text: "Die Verbindung wird aufgebaut, aber langsamer", isCorrect: false },
        { id: "b", text: "Der Paket wird verworfen — Verbindung schlägt fehl", isCorrect: true },
        { id: "c", text: "Der Client wird ins Management-VLAN umgeleitet", isCorrect: false },
        { id: "d", text: "Eine ICMP-Fehlermeldung wird an den Client gesendet", isCorrect: false },
      ],
    },
    {
      id: uid(), type: "multiple-choice", points: 15,
      text: "Welche der folgenden Aussagen zur Netzwerk-Segmentierung sind korrekt? (Mehrere Antworten möglich)",
      explanation: "Korrekt: Segmentierung reduziert Broadcast-Domänen, ACLs kontrollieren Zonenübergänge, und Management-Traffic sollte ein eigenes VLAN haben. Falsch: VLANs allein sind keine vollständige Sicherheitslösung (ohne ACLs/Firewall sind Inter-VLAN-Flows offen) und Segmentierung erhöht nicht automatisch die Bandbreite.",
      answers: [
        { id: "a", text: "Segmentierung reduziert die Größe von Broadcast-Domänen", isCorrect: true },
        { id: "b", text: "ACLs an Zonen-Übergängen kontrollieren, welcher Traffic erlaubt ist", isCorrect: true },
        { id: "c", text: "VLANs allein (ohne ACLs) sind bereits eine vollständige Sicherheitslösung", isCorrect: false },
        { id: "d", text: "Management-Traffic sollte in einem eigenen VLAN isoliert sein", isCorrect: true },
        { id: "e", text: "Segmentierung erhöht automatisch die Netzwerkbandbreite", isCorrect: false },
      ],
    },
    {
      id: uid(), type: "single-choice", points: 10,
      text: "Native VLAN auf einem Trunk-Port ist standardmäßig VLAN 1. Was ist das Sicherheitsrisiko?",
      explanation: "VLAN 1 ist das Default-VLAN auf allen Cisco-Ports und trägt auch untagged Management-Traffic (CDP, STP, VTP). Ein Angreifer kann VLAN-Hopping via Double-Tagging betreiben, wenn Native VLAN = VLAN 1 ist. Best Practice: Native VLAN auf ein ungenutztes VLAN setzen.",
      answers: [
        { id: "a", text: "VLAN 1 hat weniger Bandbreite", isCorrect: false },
        { id: "b", text: "VLAN 1 kann für VLAN-Hopping-Angriffe missbraucht werden", isCorrect: true },
        { id: "c", text: "VLAN 1 unterstützt kein 802.1Q", isCorrect: false },
        { id: "d", text: "VLAN 1 ist auf Layer 3 nicht routbar", isCorrect: false },
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
    // ── 7 neue Fragen (T-1/R-1 IPv6 Gap-Plan, blueprint: "1.4") ───
    {
      id: uid(), type: "single-choice", points: 10, blueprint: "1.4",
      text: "Welcher IPv6-Adresstyp beginnt mit dem Präfix FE80::/10 und ist nur im lokalen Netzwerksegment gültig?",
      explanation: "Link-Local-Adressen (FE80::/10) werden automatisch auf jedem IPv6-Interface konfiguriert. Sie sind nicht routbar und gelten nur im lokalen Segment. OSPFv3 und NDP nutzen sie als Quelladressen.",
      answers: [
        { id: "a", text: "Global Unicast Address (GUA)", isCorrect: false },
        { id: "b", text: "Unique Local Address (ULA)", isCorrect: false },
        { id: "c", text: "Link-Local Address", isCorrect: true },
        { id: "d", text: "Multicast Address", isCorrect: false },
      ],
    },
    {
      id: uid(), type: "single-choice", points: 10, blueprint: "1.4",
      text: "Welches Präfix kennzeichnet eine Global Unicast Address (GUA) in IPv6?",
      explanation: "GUAs beginnen mit dem Binärpräfix 001, was dem Bereich 2000::/3 entspricht. Sie sind öffentlich routbar — vergleichbar mit öffentlichen IPv4-Adressen.",
      answers: [
        { id: "a", text: "FC00::/7", isCorrect: false },
        { id: "b", text: "FE80::/10", isCorrect: false },
        { id: "c", text: "FF00::/8", isCorrect: false },
        { id: "d", text: "2000::/3", isCorrect: true },
      ],
    },
    {
      id: uid(), type: "single-choice", points: 10, blueprint: "1.4",
      text: "Eine Unique Local Address (ULA) in IPv6 entspricht am ehesten welchem IPv4-Konzept?",
      explanation: "ULAs (FC00::/7) sind privat und nicht global routbar — das IPv6-Äquivalent zu RFC-1918-Adressen (10.0.0.0/8, 172.16.0.0/12, 192.168.0.0/16) in IPv4.",
      answers: [
        { id: "a", text: "IPv4 Public Addresses", isCorrect: false },
        { id: "b", text: "IPv4 APIPA-Adressen (169.254.x.x)", isCorrect: false },
        { id: "c", text: "IPv4 Private Addresses (RFC 1918)", isCorrect: true },
        { id: "d", text: "IPv4 Multicast-Adressen (224.0.0.0/4)", isCorrect: false },
      ],
    },
    {
      id: uid(), type: "single-choice", points: 10, blueprint: "1.4",
      text: "Welche NDP-Nachricht sendet ein Router regelmäßig aus, um Hosts über das Netzwerkpräfix zu informieren?",
      explanation: "Router Advertisement (RA) — gesendet periodisch oder als Antwort auf eine Router Solicitation. RA enthält den IPv6-Präfix, Gateway-Adresse und Flags für SLAAC oder DHCPv6.",
      answers: [
        { id: "a", text: "Neighbor Solicitation (NS)", isCorrect: false },
        { id: "b", text: "Neighbor Advertisement (NA)", isCorrect: false },
        { id: "c", text: "Router Advertisement (RA)", isCorrect: true },
        { id: "d", text: "Router Solicitation (RS)", isCorrect: false },
      ],
    },
    {
      id: uid(), type: "single-choice", points: 10, blueprint: "1.4",
      text: "Was ist der Unterschied zwischen Stateful DHCPv6 und Stateless DHCPv6?",
      explanation: "Stateful DHCPv6: Server vergibt vollständige Adresse + DNS (wie DHCPv4). Stateless DHCPv6: Host nutzt SLAAC für die Adresse, DHCPv6 liefert nur zusätzliche Parameter (z. B. DNS-Server).",
      answers: [
        { id: "a", text: "Stateless DHCPv6 vergibt Adressen, Stateful DHCPv6 nur DNS-Informationen", isCorrect: false },
        { id: "b", text: "Stateful DHCPv6 vergibt Adresse + DNS; Stateless DHCPv6 nur zusätzliche Parameter (z. B. DNS), Adresse via SLAAC", isCorrect: true },
        { id: "c", text: "Beide Methoden liefern das gleiche Ergebnis, nur mit unterschiedlichem Protokoll", isCorrect: false },
        { id: "d", text: "Stateful DHCPv6 funktioniert nur mit IPv4-Dual-Stack", isCorrect: false },
      ],
    },
    {
      id: uid(), type: "true-false", points: 5, blueprint: "1.4",
      text: "Eine IPv6-Loopback-Adresse ist ::1/128.",
      explanation: "Wahr. Der IPv6-Loopback ist ::1/128 (vollständig: 0000:0000:0000:0000:0000:0000:0000:0001) — entspricht 127.0.0.1 in IPv4.",
      answers: [
        { id: "a", text: "Wahr", isCorrect: true },
        { id: "b", text: "Falsch", isCorrect: false },
      ],
    },
    {
      id: uid(), type: "single-choice", points: 10, blueprint: "1.9",
      text: "Was ist eine IPv6 Anycast-Adresse und wie unterscheidet sie sich von einer Multicast-Adresse?",
      explanation: "Anycast: eine normale GUA-Adresse, die mehreren Interfaces gleichzeitig zugewiesen wird. Das Routing-Protokoll leitet Pakete zum topologisch nächsten Empfänger (one-to-nearest). Kein eigener Adressbereich — syntaktisch identisch mit GUA. Multicast (FF00::/8) sendet dagegen an ALLE Mitglieder einer Gruppe (one-to-all).",
      answers: [
        { id: "a", text: "Anycast hat den Präfix FF00::/8 und sendet an alle Gruppenmitglieder", isCorrect: false },
        { id: "b", text: "Anycast ist eine GUA-Adresse auf mehreren Interfaces — Routing wählt den nächsten Empfänger (one-to-nearest)", isCorrect: true },
        { id: "c", text: "Anycast-Adressen beginnen immer mit FE80:: und sind nur lokal gültig", isCorrect: false },
        { id: "d", text: "Anycast und Multicast sind identisch — nur verschiedene Bezeichnungen für denselben Mechanismus", isCorrect: false },
      ],
    },
    {
      id: uid(), type: "single-choice", points: 10, blueprint: "1.4",
      text: "Welcher Cisco IOS-Befehl muss global konfiguriert sein, damit ein Router IPv6-Pakete weiterleitet?",
      explanation: "'ipv6 unicast-routing' aktiviert IPv6-Routing auf dem Cisco-Router. Ohne diesen Befehl verhält sich der Router bezüglich IPv6 wie ein Host und verwirft fremde IPv6-Pakete.",
      answers: [
        { id: "a", text: "ip routing ipv6 enable", isCorrect: false },
        { id: "b", text: "ipv6 unicast-routing", isCorrect: true },
        { id: "c", text: "ipv6 routing enable", isCorrect: false },
        { id: "d", text: "ipv6 forward-protocol", isCorrect: false },
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
    // ── 8 neue Fragen (M-5 802.1X Gap-Plan) ─────────────────────
    {
      id: uid(), type: "single-choice", points: 10, blueprint: "5.6",
      text: "Welche drei Rollen sind am 802.1X-Authentifizierungsprozess beteiligt?",
      explanation: "802.1X hat drei klar definierte Rollen: Supplicant (Endgerät mit 802.1X-Client), Authenticator (Switch/AP, leitet EAP weiter), Authentication Server (RADIUS, prüft Identität).",
      answers: [
        { id: "a", text: "Client, Server, Gateway", isCorrect: false },
        { id: "b", text: "Supplicant, Authenticator, Authentication Server", isCorrect: true },
        { id: "c", text: "Initiator, Responder, Validator", isCorrect: false },
        { id: "d", text: "Host, Switch, Firewall", isCorrect: false },
      ],
    },
    {
      id: uid(), type: "single-choice", points: 10, blueprint: "5.6",
      text: "Was ist die Aufgabe des Authenticators in 802.1X?",
      explanation: "Der Authenticator (Switch oder WLAN-AP) hält den Port gesperrt bis zur Authentifizierung und leitet EAP-Pakete zwischen Supplicant und Authentication Server weiter. Der Switch selbst überprüft Credentials NICHT — das macht der RADIUS-Server.",
      answers: [
        { id: "a", text: "Der Authenticator prüft Username/Passwort direkt", isCorrect: false },
        { id: "b", text: "Der Authenticator leitet EAP-Pakete weiter und öffnet/sperrt den Port", isCorrect: true },
        { id: "c", text: "Der Authenticator generiert Zertifikate für den Supplicant", isCorrect: false },
        { id: "d", text: "Der Authenticator ist das Endgerät mit 802.1X-Client-Software", isCorrect: false },
      ],
    },
    {
      id: uid(), type: "single-choice", points: 10, blueprint: "5.6",
      text: "Welches Transport-Protokoll wird zwischen Authenticator und Authentication Server bei 802.1X verwendet?",
      explanation: "Zwischen dem Authenticator (Switch) und dem Authentication Server (RADIUS) wird RADIUS verwendet — UDP Port 1812 (Authentication) und 1813 (Accounting). Das Protokoll zwischen Supplicant und Authenticator ist EAPOL (EAP over LAN).",
      answers: [
        { id: "a", text: "TACACS+ (TCP 49)", isCorrect: false },
        { id: "b", text: "RADIUS (UDP 1812/1813)", isCorrect: true },
        { id: "c", text: "LDAP (TCP 389)", isCorrect: false },
        { id: "d", text: "Kerberos (UDP 88)", isCorrect: false },
      ],
    },
    {
      id: uid(), type: "single-choice", points: 10, blueprint: "5.6",
      text: "Welcher Cisco IOS Befehl aktiviert 802.1X auf einem Switch-Port?",
      explanation: "'dot1x port-control auto' aktiviert 802.1X auf dem Interface. Der Port bleibt gesperrt bis zur erfolgreichen Authentifizierung. Zusätzlich müssen 'aaa new-model' und 'dot1x system-auth-control' global konfiguriert sein.",
      answers: [
        { id: "a", text: "switchport dot1x enable", isCorrect: false },
        { id: "b", text: "authentication port-control enable", isCorrect: false },
        { id: "c", text: "dot1x port-control auto", isCorrect: true },
        { id: "d", text: "aaa dot1x port auto", isCorrect: false },
      ],
    },
    {
      id: uid(), type: "single-choice", points: 10, blueprint: "5.6",
      text: "Was ist MAB (MAC Authentication Bypass) bei 802.1X?",
      explanation: "MAB ermöglicht Authentifizierung über MAC-Adresse für Geräte ohne 802.1X-Supplicant (Drucker, VoIP-Telefone, ältere Geräte). Der Switch sendet die MAC-Adresse als RADIUS-Request. Weniger sicher als 802.1X, aber Fallback-Option.",
      answers: [
        { id: "a", text: "Eine Methode zur MAC-Adressfilterung ohne RADIUS-Server", isCorrect: false },
        { id: "b", text: "Authentifizierung über MAC-Adresse für Geräte ohne 802.1X-Client", isCorrect: true },
        { id: "c", text: "Ein Angriff, der 802.1X durch gefälschte MACs umgeht", isCorrect: false },
        { id: "d", text: "Ein VLAN für nicht-authentifizierte Geräte", isCorrect: false },
      ],
    },
    {
      id: uid(), type: "multiple-choice", points: 15, blueprint: "5.6",
      text: "Welche EAP-Methoden sind für die CCNA-Prüfung relevant? (Mehrere Antworten möglich)",
      explanation: "CCNA-relevante EAP-Methoden: EAP-TLS (beidseitige Zertifikate, höchste Sicherheit), PEAP (Server-Zertifikat + Username/Passwort, häufig in WPA2-Enterprise), EAP-FAST (Cisco, nutzt PAC). EAP-MD5 ist veraltet.",
      answers: [
        { id: "a", text: "EAP-TLS (beidseitige Zertifikate)", isCorrect: true },
        { id: "b", text: "PEAP (Server-Zertifikat + Username/Passwort)", isCorrect: true },
        { id: "c", text: "EAP-FAST (Cisco, nutzt PAC)", isCorrect: true },
        { id: "d", text: "EAP-MD5 (aktueller Standard)", isCorrect: false },
      ],
    },
    {
      id: uid(), type: "true-false", points: 10, blueprint: "5.6",
      text: "Bei 802.1X bleibt ein Switch-Port im Modus 'dot1x port-control auto' vollständig gesperrt, bis die Authentifizierung erfolgreich war.",
      explanation: "Wahr. Im Modus 'auto' ist der Port blocked bis zur Authentifizierung. Nur EAPOL-Pakete (für 802.1X) passieren den gesperrten Port — kein anderer Traffic.",
      answers: [
        { id: "a", text: "Wahr", isCorrect: true },
        { id: "b", text: "Falsch — der Port ist teilweise offen für alle Protokolle", isCorrect: false },
      ],
    },
    {
      id: uid(), type: "single-choice", points: 10, blueprint: "5.6",
      text: "In welchem Szenario wird ein 'Guest VLAN' bei 802.1X eingesetzt?",
      explanation: "Ein Guest VLAN empfängt Geräte, die 802.1X nicht unterstützen (kein Supplicant). Sie landen in einem eingeschränkten VLAN (z.B. nur Internet, kein Unternehmensnetz). Unterschied zum 'Auth-Fail VLAN' (für Geräte, die authentifiziert haben, aber scheitern).",
      answers: [
        { id: "a", text: "Für Besucher, die sich erfolgreich authentifiziert haben", isCorrect: false },
        { id: "b", text: "Für Geräte ohne 802.1X-Supplicant-Unterstützung", isCorrect: true },
        { id: "c", text: "Für Geräte, die die Authentifizierung bestanden haben aber keine Berechtigung haben", isCorrect: false },
        { id: "d", text: "Guest VLAN ist identisch mit Auth-Fail VLAN", isCorrect: false },
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
    // ── 8 neue Fragen (M-4 Security-Program-Elemente Gap-Plan) ──
    {
      id: uid(), type: "single-choice", points: 10, blueprint: "5.4",
      text: "Was beschreibt der Begriff 'Risk' im Kontext der Informationssicherheit am besten?",
      explanation: "Risk = Wahrscheinlichkeit × Schadensausmaß. Eine Vulnerability allein ist noch kein Risiko — erst in Kombination mit einer realen Threat und möglichem Schaden entsteht ein Risiko.",
      answers: [
        { id: "a", text: "Eine Schwachstelle in einem System (Vulnerability)", isCorrect: false },
        { id: "b", text: "Ein Werkzeug zum Ausnutzen einer Schwachstelle (Exploit)", isCorrect: false },
        { id: "c", text: "Die Wahrscheinlichkeit und das Ausmaß eines Schadens durch eine Bedrohung", isCorrect: true },
        { id: "d", text: "Eine aktive Bedrohung (Threat)", isCorrect: false },
      ],
    },
    {
      id: uid(), type: "single-choice", points: 10, blueprint: "5.4",
      text: "Welche CVSS-Score-Spanne kennzeichnet eine 'High'-Schwachstelle?",
      explanation: "CVSS: None=0.0, Low=0.1–3.9, Medium=4.0–6.9, High=7.0–8.9, Critical=9.0–10.0. Eine 'High'-Schwachstelle liegt zwischen 7.0 und 8.9.",
      answers: [
        { id: "a", text: "4.0 – 6.9", isCorrect: false },
        { id: "b", text: "7.0 – 8.9", isCorrect: true },
        { id: "c", text: "8.0 – 9.9", isCorrect: false },
        { id: "d", text: "9.0 – 10.0", isCorrect: false },
      ],
    },
    {
      id: uid(), type: "single-choice", points: 10, blueprint: "5.4",
      text: "Was legt eine Acceptable Use Policy (AUP) fest?",
      explanation: "Eine AUP (Acceptable Use Policy) definiert die erlaubte und verbotene Nutzung von IT-Ressourcen eines Unternehmens durch Mitarbeiter — z.B. Internetzugang, E-Mail-Nutzung, Installation von Software.",
      answers: [
        { id: "a", text: "Mindeststärke für Passwörter und Sperrfristen", isCorrect: false },
        { id: "b", text: "Erlaubte und verbotene Nutzung von IT-Ressourcen des Unternehmens", isCorrect: true },
        { id: "c", text: "Verfahren bei einem Sicherheitsvorfall", isCorrect: false },
        { id: "d", text: "Verschlüsselungsstandards für gespeicherte Daten", isCorrect: false },
      ],
    },
    {
      id: uid(), type: "single-choice", points: 10, blueprint: "5.4",
      text: "In welcher Phase des NIST Incident-Response-Prozesses werden Systeme nach einem Angriff wiederhergestellt und der Normalbetrieb geprüft?",
      explanation: "Phase 5 'Recovery': Betroffene Systeme werden gereinigt, neu aufgesetzt oder aus Backups wiederhergestellt. Anschließend wird verifiziert, dass der Normalbetrieb sicher läuft.",
      answers: [
        { id: "a", text: "Containment", isCorrect: false },
        { id: "b", text: "Eradication", isCorrect: false },
        { id: "c", text: "Recovery", isCorrect: true },
        { id: "d", text: "Lessons Learned", isCorrect: false },
      ],
    },
    {
      id: uid(), type: "single-choice", points: 10, blueprint: "5.4",
      text: "Wie lautet die korrekte Reihenfolge der 6 NIST-Incident-Response-Phasen?",
      explanation: "NIST SP 800-61: Preparation → Identification → Containment → Eradication → Recovery → Lessons Learned. Merkhilfe: P-I-C-E-R-L.",
      answers: [
        { id: "a", text: "Identification → Containment → Preparation → Eradication → Recovery → Lessons Learned", isCorrect: false },
        { id: "b", text: "Preparation → Identification → Containment → Eradication → Recovery → Lessons Learned", isCorrect: true },
        { id: "c", text: "Preparation → Containment → Identification → Eradication → Recovery → Lessons Learned", isCorrect: false },
        { id: "d", text: "Identification → Preparation → Containment → Recovery → Eradication → Lessons Learned", isCorrect: false },
      ],
    },
    {
      id: uid(), type: "true-false", points: 10, blueprint: "5.4",
      text: "Security Awareness Training richtet sich ausschließlich an IT-Mitarbeiter und nicht an reguläre Mitarbeiter eines Unternehmens.",
      explanation: "Falsch. Security Awareness Training richtet sich an ALLE Mitarbeiter — besonders an nicht-technisches Personal, da Social Engineering (Phishing, Pretexting) häufig diese Zielgruppe angreift.",
      answers: [
        { id: "a", text: "Wahr", isCorrect: false },
        { id: "b", text: "Falsch — es richtet sich an alle Mitarbeiter", isCorrect: true },
      ],
    },
    {
      id: uid(), type: "single-choice", points: 10, blueprint: "5.4",
      text: "Welches Cisco IOS-Kommando erzwingt eine Mindestpasswortlänge von 12 Zeichen?",
      explanation: "'security passwords min-length 12' setzt global eine Mindestpasswortlänge. Passwörter, die kürzer als der konfigurierte Wert sind, werden abgelehnt.",
      answers: [
        { id: "a", text: "enable password-length 12", isCorrect: false },
        { id: "b", text: "password minimum-length 12", isCorrect: false },
        { id: "c", text: "security passwords min-length 12", isCorrect: true },
        { id: "d", text: "aaa password min-length 12", isCorrect: false },
      ],
    },
    {
      id: uid(), type: "multiple-choice", points: 15, blueprint: "5.4",
      text: "Welche der folgenden Maßnahmen gehören zum Vulnerability Management? (Mehrere Antworten möglich)",
      explanation: "Vulnerability Management umfasst: Vulnerability Scanning (automatisiert, z.B. Nessus), Penetration Testing (autorisierter Angriff), Patch Management (Einspielen von Security-Patches). Phishing-Simulationen gehören zu Security Awareness Training.",
      answers: [
        { id: "a", text: "Vulnerability Scanning mit Tools wie Nessus oder OpenVAS", isCorrect: true },
        { id: "b", text: "Penetration Testing (autorisierter simulierter Angriff)", isCorrect: true },
        { id: "c", text: "Patch Management", isCorrect: true },
        { id: "d", text: "Phishing-Simulationen für Mitarbeiter", isCorrect: false },
      ],
    },
  ],
};

// ============================================================
// QUIZ STP: Spanning Tree Protocol
// ============================================================
export const QUIZ_STP: Quiz = {
  id: "ccna-quiz-stp",
  title: "CCNA: Spanning Tree Protocol (STP / RSTP)",
  description: "Root-Bridge-Wahl, Port-Rollen, Port-Zustände, STP-Timer, RSTP, BPDU Guard, PortFast, PVST+",
  passingScore: 70,
  shuffleQuestions: true,
  questions: [
    {
      id: uid(), type: "single-choice", points: 10, blueprint: "2.3",
      text: "Wie wird die Root Bridge in STP gewählt?",
      explanation: "Die Root Bridge ist der Switch mit der niedrigsten Bridge-ID. Die Bridge-ID besteht aus: Priority (16 Bit, Standard 32768) + MAC-Adresse. Zuerst wird die Priority verglichen; bei Gleichstand entscheidet die niedrigste MAC-Adresse.",
      answers: [
        { id: "a", text: "Der Switch mit der höchsten Priority-Zahl", isCorrect: false },
        { id: "b", text: "Der Switch mit der niedrigsten Bridge-ID (Priority + MAC)", isCorrect: true },
        { id: "c", text: "Der Switch mit den meisten Uplinks", isCorrect: false },
        { id: "d", text: "Der Switch, der zuerst hochgefahren ist", isCorrect: false },
      ],
    },
    {
      id: uid(), type: "single-choice", points: 10, blueprint: "2.3",
      text: "Auf welchen Wert muss die STP-Priority gesetzt werden, um einen Switch garantiert zur Root Bridge zu machen?",
      explanation: "STP-Priority muss ein Vielfaches von 4096 sein (0, 4096, 8192, … 61440). Der Wert 0 ist die niedstmögliche Priority und macht diesen Switch zur bevorzugten Root Bridge.",
      answers: [
        { id: "a", text: "1", isCorrect: false },
        { id: "b", text: "0", isCorrect: true },
        { id: "c", text: "32768", isCorrect: false },
        { id: "d", text: "4096", isCorrect: false },
      ],
    },
    {
      id: uid(), type: "single-choice", points: 10, blueprint: "2.3",
      text: "Welche Port-Rolle erhält auf der Root Bridge jeder ihrer Ports?",
      explanation: "Auf der Root Bridge sind alle Ports Designated Ports (immer im Forwarding-State). Die Root Bridge sendet BPDUs hinaus und leitet Traffic weiter.",
      answers: [
        { id: "a", text: "Root Port", isCorrect: false },
        { id: "b", text: "Designated Port", isCorrect: true },
        { id: "c", text: "Alternate Port", isCorrect: false },
        { id: "d", text: "Blocked Port", isCorrect: false },
      ],
    },
    {
      id: uid(), type: "single-choice", points: 10, blueprint: "2.3",
      text: "Was ist der Root Port eines Switches?",
      explanation: "Der Root Port ist der Port mit dem niedrigsten Root-Path-Cost zur Root Bridge. Jeder Nicht-Root-Switch hat genau einen Root Port. Dieser Port ist im Forwarding-State.",
      answers: [
        { id: "a", text: "Jeder Port, der BPDUs sendet", isCorrect: false },
        { id: "b", text: "Der Port mit dem günstigsten Pfad zur Root Bridge", isCorrect: true },
        { id: "c", text: "Der Port, der gesperrt ist und keine Frames weiterleitet", isCorrect: false },
        { id: "d", text: "Der Port, der auf der Root Bridge liegt", isCorrect: false },
      ],
    },
    {
      id: uid(), type: "single-choice", points: 10, blueprint: "2.3",
      text: "Welcher Port-Zustand in klassischem STP (802.1D) leitet weder Frames weiter noch lernt er MAC-Adressen?",
      explanation: "Blocking-Zustand: Der Port empfängt BPDUs, leitet aber keine Frames weiter und lernt keine MAC-Adressen. Er dient als Loop-Prävention.",
      answers: [
        { id: "a", text: "Learning", isCorrect: false },
        { id: "b", text: "Listening", isCorrect: false },
        { id: "c", text: "Blocking", isCorrect: true },
        { id: "d", text: "Disabled", isCorrect: false },
      ],
    },
    {
      id: uid(), type: "multiple-choice", points: 15, blueprint: "2.3",
      text: "In welchen STP-Port-Zuständen werden MAC-Adressen gelernt? (Mehrere Antworten möglich)",
      explanation: "MAC-Adressen werden in den Zuständen Learning und Forwarding gelernt. In Blocking und Listening werden keine MAC-Adressen gelernt.",
      answers: [
        { id: "a", text: "Blocking", isCorrect: false },
        { id: "b", text: "Listening", isCorrect: false },
        { id: "c", text: "Learning", isCorrect: true },
        { id: "d", text: "Forwarding", isCorrect: true },
      ],
    },
    {
      id: uid(), type: "single-choice", points: 10, blueprint: "2.3",
      text: "Wie lange dauert es bei Standard-STP (802.1D), bis ein Port vom Blocking-Zustand in den Forwarding-Zustand wechselt?",
      explanation: "Standard-STP Konvergenz: Blocking (Max-Age 20s) → Listening (15s Forward-Delay) → Learning (15s Forward-Delay) → Forwarding. Gesamt: bis zu 50 Sekunden.",
      answers: [
        { id: "a", text: "Ca. 15 Sekunden (nur Forward-Delay)", isCorrect: false },
        { id: "b", text: "Ca. 30 Sekunden (2 × Forward-Delay)", isCorrect: false },
        { id: "c", text: "Ca. 50 Sekunden (Max-Age + 2 × Forward-Delay)", isCorrect: true },
        { id: "d", text: "Ca. 5 Sekunden (Hello-Timer)", isCorrect: false },
      ],
    },
    {
      id: uid(), type: "single-choice", points: 10, blueprint: "2.3",
      text: "Welche RSTP-Port-Rolle ersetzt den Blocked Port aus klassischem STP?",
      explanation: "RSTP (802.1w) ersetzt den Blocked Port durch den Alternate Port (beste Alternative zur Root Bridge) und den Backup Port (Backup für Designated Port am selben Segment).",
      answers: [
        { id: "a", text: "Disabled Port", isCorrect: false },
        { id: "b", text: "Alternate Port und Backup Port", isCorrect: true },
        { id: "c", text: "Edge Port", isCorrect: false },
        { id: "d", text: "Standby Port", isCorrect: false },
      ],
    },
    {
      id: uid(), type: "single-choice", points: 10, blueprint: "2.3",
      text: "Wie schnell konvergiert RSTP (Rapid STP 802.1w) im Vergleich zu klassischem STP?",
      explanation: "RSTP konvergiert in Sekunden (typisch < 1–2 Sekunden) statt bis zu 50 Sekunden bei 802.1D. RSTP nutzt aktiven Handshake-Mechanismus statt Timer.",
      answers: [
        { id: "a", text: "Gleich schnell wie 802.1D (ca. 50 Sekunden)", isCorrect: false },
        { id: "b", text: "Sekunden (typisch < 2 Sekunden) statt 50 Sekunden", isCorrect: true },
        { id: "c", text: "Ca. 30 Sekunden (halbiert)", isCorrect: false },
        { id: "d", text: "Ca. 15 Sekunden (Forward-Delay wird halbiert)", isCorrect: false },
      ],
    },
    {
      id: uid(), type: "single-choice", points: 10, blueprint: "2.3",
      text: "Was macht BPDU Guard auf einem Switch-Port?",
      explanation: "BPDU Guard deaktiviert (err-disabled) einen Port sofort, wenn ein BPDU empfangen wird. Typisch auf PortFast-Ports (Endgeräte-Ports) — verhindert, dass ein Endgerät fälschlicherweise als Switch agiert.",
      answers: [
        { id: "a", text: "Es filtert BPDUs und verhindert, dass sie weitergeleitet werden", isCorrect: false },
        { id: "b", text: "Es blockiert den Port dauerhaft, wenn BPDUs empfangen werden (err-disabled)", isCorrect: true },
        { id: "c", text: "Es sendet BPDUs schneller aus, um die Konvergenz zu beschleunigen", isCorrect: false },
        { id: "d", text: "Es setzt die Root Bridge zurück, wenn ein ungültiges BPDU erkannt wird", isCorrect: false },
      ],
    },
    {
      id: uid(), type: "single-choice", points: 10, blueprint: "2.3",
      text: "Für welche Ports ist PortFast geeignet und warum?",
      explanation: "PortFast überspringt Listening und Learning und geht direkt in Forwarding — geeignet nur für Ports, an denen Endgeräte (kein Switch!) angeschlossen sind. Auf Trunk-/Switch-Ports würde es Schleifen riskieren.",
      answers: [
        { id: "a", text: "Für alle Switch-to-Switch-Verbindungen, um STP zu beschleunigen", isCorrect: false },
        { id: "b", text: "Für Access-Ports mit Endgeräten — überspringt Listening/Learning", isCorrect: true },
        { id: "c", text: "Für Trunk-Ports, um VLAN-Konfigurationen sofort anzuwenden", isCorrect: false },
        { id: "d", text: "Für Root-Ports, um die Konvergenz zur Root Bridge zu beschleunigen", isCorrect: false },
      ],
    },
    {
      id: uid(), type: "single-choice", points: 10, blueprint: "2.3",
      text: "Was ist PVST+ (Per-VLAN Spanning Tree Plus)?",
      explanation: "PVST+ ist eine Cisco-Erweiterung, die für jedes VLAN eine separate STP-Instanz betreibt. Dies erlaubt Load Balancing über verschiedene VLANs mit unterschiedlichen Root Bridges.",
      answers: [
        { id: "a", text: "Eine Erweiterung, die STP global deaktiviert", isCorrect: false },
        { id: "b", text: "Eine separate STP-Instanz pro VLAN für Load Balancing", isCorrect: true },
        { id: "c", text: "Ein Protokoll, das RSTP vollständig ersetzt", isCorrect: false },
        { id: "d", text: "Eine Methode zur Beschleunigung von PortFast", isCorrect: false },
      ],
    },
    {
      id: uid(), type: "true-false", points: 10, blueprint: "2.3",
      text: "Rapid PVST+ kombiniert die Vorteile von PVST+ (pro VLAN) mit der schnellen Konvergenz von RSTP.",
      explanation: "Wahr. Rapid PVST+ = Per-VLAN RSTP. Cisco-Standard in modernen Netzwerken. Jedes VLAN hat eine eigene RSTP-Instanz mit < 2 Sekunden Konvergenz.",
      answers: [
        { id: "a", text: "Wahr", isCorrect: true },
        { id: "b", text: "Falsch — Rapid PVST+ nutzt klassisches STP pro VLAN", isCorrect: false },
      ],
    },
    {
      id: uid(), type: "single-choice", points: 10, blueprint: "2.3",
      text: "Ein Switch mit Priority 32768 und MAC 0011.2233.4455 konkurriert gegen einen Switch mit Priority 4096 und MAC 0022.3344.5566. Welcher wird Root Bridge?",
      explanation: "Bridge-ID-Vergleich: Zuerst Priority. 4096 < 32768 → der zweite Switch gewinnt, unabhängig von der MAC-Adresse.",
      answers: [
        { id: "a", text: "Switch mit Priority 32768 und niedrigerer MAC", isCorrect: false },
        { id: "b", text: "Switch mit Priority 4096 — niedrigere Priority gewinnt", isCorrect: true },
        { id: "c", text: "Unentschieden — beide haben gleiche Rechte", isCorrect: false },
        { id: "d", text: "Der Switch, der zuerst online war", isCorrect: false },
      ],
    },
    {
      id: uid(), type: "single-choice", points: 10, blueprint: "2.3",
      text: "Welches Cisco IOS-Kommando konfiguriert einen Switch als Root Bridge für VLAN 10?",
      explanation: "'spanning-tree vlan 10 root primary' setzt automatisch die Priority auf 24576 (oder niedriger als der aktuelle Root). Alternativ: 'spanning-tree vlan 10 priority 4096'.",
      answers: [
        { id: "a", text: "spanning-tree vlan 10 root-bridge", isCorrect: false },
        { id: "b", text: "spanning-tree vlan 10 root primary", isCorrect: true },
        { id: "c", text: "spanning-tree vlan 10 priority 32768", isCorrect: false },
        { id: "d", text: "set spanning-tree vlan 10 root enable", isCorrect: false },
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
  title: "CCNA: OSPF Single-Area & Multi-Area",
  description: "OSPFv2 Neighbor-States, DR/BDR-Wahl, LSA-Typen, Cost-Berechnung, Konfiguration und Troubleshooting — Blueprint 3.4",
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
    // ── 12 neue Fragen (T-4 Gap-Plan) ──────────────────────────
    {
      id: uid(), type: "single-choice", points: 10,
      blueprint: "3.4",
      text: "Welcher OSPF-Neighbor-State zeigt an, dass die LSDB vollständig synchronisiert ist?",
      explanation: "Der Zustand 'Full' bedeutet, dass beide Router ihre LSDBs vollständig ausgetauscht haben. Alle anderen Zustände (Exchange, Loading, 2-Way) sind Übergangszustände. 'Full' ist der einzige stabile, betriebsbereite Zustand zwischen DR/BDR und anderen Routern.",
      answers: [
        { id: "a", text: "2-Way", isCorrect: false },
        { id: "b", text: "Exchange", isCorrect: false },
        { id: "c", text: "Loading", isCorrect: false },
        { id: "d", text: "Full", isCorrect: true },
      ],
    },
    {
      id: uid(), type: "single-choice", points: 10,
      blueprint: "3.4",
      text: "Zwei OSPF-Router R1 und R2 sind über ein Ethernet-Segment verbunden. Beide haben OSPF-Priority 1. In welchem Zustand befinden sich R1 und R2 zueinander, nachdem ein DR gewählt wurde und R1 NICHT DR oder BDR ist?",
      explanation: "DROther-Router (weder DR noch BDR) bilden untereinander nur eine 2-Way-Beziehung — kein vollständiger DBD-Austausch. Das ist korrekt und gewollt, kein Fehler. Full-Adjacency besteht nur zwischen DROther ↔ DR und DROther ↔ BDR.",
      answers: [
        { id: "a", text: "Full — alle OSPF-Router in einem Segment bilden Full-Adjacencies", isCorrect: false },
        { id: "b", text: "2-Way — DROther-Router bleiben untereinander im 2-Way-Zustand", isCorrect: true },
        { id: "c", text: "Exchange — der DBD-Austausch läuft dauerhaft", isCorrect: false },
        { id: "d", text: "Init — das Interface ist noch nicht bereit", isCorrect: false },
      ],
    },
    {
      id: uid(), type: "single-choice", points: 10,
      blueprint: "3.4",
      text: "R1 und R2 sind über Ethernet verbunden und sollen OSPF-Nachbarn werden. Nach mehreren Minuten zeigt 'show ip ospf neighbor' keine Einträge. Welche Ursache ist NICHT möglich?",
      explanation: "Ein MTU-Mismatch verhindert den Übergang von Exchange zu Loading — NICHT die initiale Hello-Erkennung. Hello-Timer-Mismatch, falsche Area-ID und blockierter Multicast 224.0.0.5 würden alle dazu führen, dass gar kein Nachbar erscheint. MTU-Mismatch tritt erst nach 2-Way auf, also würde der Nachbar in ExStart/Exchange erscheinen.",
      answers: [
        { id: "a", text: "Hello-Timer-Mismatch zwischen R1 und R2", isCorrect: false },
        { id: "b", text: "R1 ist in Area 0, R2 ist in Area 1", isCorrect: false },
        { id: "c", text: "Firewall blockiert Multicast 224.0.0.5", isCorrect: false },
        { id: "d", text: "MTU-Mismatch (R1: 1500 Byte, R2: 1400 Byte)", isCorrect: true },
      ],
    },
    {
      id: uid(), type: "single-choice", points: 10,
      blueprint: "3.4",
      text: "Welche der folgenden Aussagen zur OSPF DR/BDR-Wahl ist korrekt?",
      explanation: "Die DR/BDR-Wahl ist non-preemptive: Ein neuer Router mit höherer Priority verdrängt den bestehenden DR nicht automatisch. Der DR bleibt bis zum nächsten Neustart oder Ausfall. Erst dann wird neu gewählt.",
      answers: [
        { id: "a", text: "Ein neuer Router mit Priority 255 wird sofort DR, wenn er ins Segment kommt", isCorrect: false },
        { id: "b", text: "Die DR-Wahl ist non-preemptive — der bestehende DR bleibt auch bei höherer Priority eines neuen Routers", isCorrect: true },
        { id: "c", text: "Der Router mit der niedrigsten Router-ID wird DR", isCorrect: false },
        { id: "d", text: "BDR und DR haben immer dieselbe Priority", isCorrect: false },
      ],
    },
    {
      id: uid(), type: "single-choice", points: 10,
      blueprint: "3.4",
      text: "In einem OSPF-Broadcast-Segment haben R1 (Priority 2, RID 3.3.3.3), R2 (Priority 2, RID 1.1.1.1) und R3 (Priority 1, RID 5.5.5.5). Welcher Router wird DR, welcher BDR?",
      explanation: "Wahlkriterium 1: Höchste Priority. R1 und R2 sind gleichauf (Priority 2). Wahlkriterium 2 (Gleichstand): Höchste Router-ID. R1 hat RID 3.3.3.3, R2 hat RID 1.1.1.1 — R1 gewinnt → DR. Nächsthöchste Priority 2 mit RID 1.1.1.1 → R2 wird BDR. R3 (Priority 1) = DROther.",
      answers: [
        { id: "a", text: "DR = R3 (höchste RID 5.5.5.5), BDR = R1", isCorrect: false },
        { id: "b", text: "DR = R1 (Priority 2, RID 3.3.3.3), BDR = R2 (Priority 2, RID 1.1.1.1)", isCorrect: true },
        { id: "c", text: "DR = R2 (niedrigste RID), BDR = R1", isCorrect: false },
        { id: "d", text: "DR = R1, BDR = R3 (weil R3 höhere RID als R2)", isCorrect: false },
      ],
    },
    {
      id: uid(), type: "single-choice", points: 10,
      blueprint: "3.4",
      text: "Was ist der OSPF-Cost eines GigabitEthernet-Interfaces mit der default OSPF-Referenzbandbreite?",
      explanation: "OSPF-Cost = Referenzbandbreite / Interface-Bandbreite = 100 Mbit/s / 1000 Mbit/s = 0,1 → aufgerundet auf Minimum 1. Deshalb haben FastEthernet (100M), GigabitEthernet (1G) und 10GigabitEthernet (10G) alle denselben Cost von 1 — ein bekannter Fallstrick! Lösung: auto-cost reference-bandwidth anpassen.",
      answers: [
        { id: "a", text: "10", isCorrect: false },
        { id: "b", text: "100", isCorrect: false },
        { id: "c", text: "1", isCorrect: true },
        { id: "d", text: "0 (kein Cost — direkt verbunden)", isCorrect: false },
      ],
    },
    {
      id: uid(), type: "single-choice", points: 10,
      blueprint: "3.4",
      text: "Ein Netzwerk besteht aus Routern mit FastEthernet-, GigabitEthernet- und 10GigabitEthernet-Links. Welcher Befehl löst das Problem, dass OSPF nicht zwischen diesen Linkgeschwindigkeiten unterscheiden kann?",
      explanation: "Mit 'auto-cost reference-bandwidth 100000' (100 Gbit/s = 100.000 Mbit/s) als Referenz bekommen die Interfaces unterschiedliche Costs: FE=1000, GigE=100, 10GigE=10. Wichtig: Dieser Befehl muss auf ALLEN Routern in der Area identisch gesetzt werden — sonst entstehen asymmetrische Kosten und suboptimales Routing.",
      answers: [
        { id: "a", text: "auto-cost reference-bandwidth 1000", isCorrect: false },
        { id: "b", text: "auto-cost reference-bandwidth 100000", isCorrect: true },
        { id: "c", text: "ip ospf cost 10 (manuell auf jedem Interface)", isCorrect: false },
        { id: "d", text: "ospf reference-bandwidth gigabit", isCorrect: false },
      ],
    },
    {
      id: uid(), type: "single-choice", points: 10,
      blueprint: "3.4",
      text: "Was bewirkt der Befehl 'passive-interface GigabitEthernet0/0' in einem OSPF-Prozess?",
      explanation: "passive-interface unterdrückt das Senden und Empfangen von OSPF-Hello-Paketen auf diesem Interface. Damit können keine OSPF-Nachbarn über dieses Interface gebildet werden. Das Netzwerk des Interfaces wird jedoch weiterhin in OSPF-LSAs annonciert — der Router gibt die Route bekannt, akzeptiert aber keine OSPF-Verbindungen darüber.",
      answers: [
        { id: "a", text: "Das Interface wird vollständig aus OSPF entfernt — das Netz wird nicht mehr annonciert", isCorrect: false },
        { id: "b", text: "Hello-Pakete werden unterdrückt — kein Nachbar möglich, aber das Netz wird weiter annonciert", isCorrect: true },
        { id: "c", text: "Das Interface sendet nur noch Hello-Pakete, empfängt aber keine mehr", isCorrect: false },
        { id: "d", text: "OSPF-Updates werden verlangsamt, um Bandbreite zu sparen", isCorrect: false },
      ],
    },
    {
      id: uid(), type: "multiple-choice", points: 15,
      blueprint: "3.4",
      text: "Welche Bedingungen müssen zwischen zwei OSPF-Routern übereinstimmen, damit eine Adjacency aufgebaut werden kann? (Mehrere Antworten möglich)",
      explanation: "Pflichtvoraussetzungen für OSPF-Adjacency: gleiche Area-ID, gleiches Subnetz, gleicher Hello/Dead-Timer, gleiche Authentication-Konfiguration, gleicher Stub-Flag und kompatible MTU. OSPF-Priority muss NICHT übereinstimmen — sie beeinflusst nur die DR/BDR-Wahl. Router-ID muss eindeutig sein, aber nicht 'übereinstimmen' im herkömmlichen Sinne.",
      answers: [
        { id: "a", text: "Gleiche Area-ID", isCorrect: true },
        { id: "b", text: "Gleicher Hello-Interval und Dead-Interval", isCorrect: true },
        { id: "c", text: "Gleiche OSPF-Priority", isCorrect: false },
        { id: "d", text: "Gleiche Authentication-Konfiguration (oder beide ohne Auth)", isCorrect: true },
        { id: "e", text: "Beide Router im gleichen Subnetz (auf dem verbindenden Interface)", isCorrect: true },
      ],
    },
    {
      id: uid(), type: "single-choice", points: 10,
      blueprint: "3.4",
      text: "Welche Priorität hat die OSPF Router-ID-Auswahl, wenn keine manuelle Konfiguration vorliegt?",
      explanation: "OSPF-Router-ID-Reihenfolge: 1) Manuell konfigurierte Router-ID ('router-id X.X.X.X') hat höchste Priorität. 2) Höchste IP-Adresse eines Loopback-Interfaces (diese sind immer up). 3) Höchste IP-Adresse eines aktiven physischen Interfaces. Loopbacks werden bevorzugt, weil sie nicht ausfallen können und stabil bleiben.",
      answers: [
        { id: "a", text: "Niedrigste IP eines aktiven Interfaces → Loopback → manuelle Konfiguration", isCorrect: false },
        { id: "b", text: "Manuelle Konfiguration → höchste Loopback-IP → höchste physische Interface-IP", isCorrect: true },
        { id: "c", text: "Höchste physische Interface-IP → Loopback-IP → manuelle Konfiguration", isCorrect: false },
        { id: "d", text: "Die MAC-Adresse des ersten Interfaces wird als Router-ID verwendet", isCorrect: false },
      ],
    },
    {
      id: uid(), type: "single-choice", points: 10,
      blueprint: "3.4",
      text: "R1 ist mit 'router ospf 1' und 'network 0.0.0.0 255.255.255.255 area 0' konfiguriert. R1 hat Interface Gi0/0 (192.168.1.1/24) zum LAN und Gi0/1 (10.0.0.1/30) zum WAN-Router. Das LAN soll keine OSPF-Nachbarn haben. Welcher zusätzliche Befehl ist korrekt?",
      explanation: "passive-interface Gi0/0 unterdrückt OSPF-Hellos auf dem LAN-Interface. Das Netz 192.168.1.0/24 wird trotzdem in OSPF annonciert (die network-Anweisung greift), aber es werden keine OSPF-Nachbarn auf diesem Interface akzeptiert. Dies ist die beste Praxis für Access-Layer-Interfaces.",
      answers: [
        { id: "a", text: "no network 192.168.1.0 0.0.0.255 area 0", isCorrect: false },
        { id: "b", text: "passive-interface Gi0/0", isCorrect: true },
        { id: "c", text: "ip ospf priority 0 (auf Gi0/0)", isCorrect: false },
        { id: "d", text: "shutdown (auf Gi0/0 temporär)", isCorrect: false },
      ],
    },
    {
      id: uid(), type: "single-choice", points: 10,
      blueprint: "3.4",
      text: "R1 konfiguriert 'ip ospf hello-interval 5' auf Gi0/1. R2 hat die Standard-Konfiguration (Hello 10s, Dead 40s). Was passiert?",
      explanation: "Hello-Interval und Dead-Interval müssen auf beiden Seiten übereinstimmen. R1 hat jetzt Hello=5s, Dead=20s (automatisch 4×Hello). R2 hat Hello=10s, Dead=40s. Der Dead-Timer stimmt nicht überein → keine OSPF-Adjacency. Lösung: Entweder beide auf 5/20 oder beide auf den Standard zurücksetzen.",
      answers: [
        { id: "a", text: "Die Adjacency wird aufgebaut, aber mit Hello=5s auf beiden Seiten", isCorrect: false },
        { id: "b", text: "Die Adjacency wird aufgebaut — Timer-Mismatch wird automatisch korrigiert", isCorrect: false },
        { id: "c", text: "Keine Adjacency — Hello/Dead-Timer müssen auf beiden Seiten identisch sein", isCorrect: true },
        { id: "d", text: "Die Adjacency fluktuiert: kommt hoch und fällt alle 40 Sekunden wieder weg", isCorrect: false },
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
    // ── 3 neue Fragen (T-5 QoS Gap-Plan, blueprint: "4.1") ────────
    {
      id: uid(), type: "single-choice", points: 10, blueprint: "4.1",
      text: "Welcher DSCP-Wert (EF — Expedited Forwarding) wird typischerweise für VoIP-Sprachverkehr verwendet?",
      explanation: "EF (Expedited Forwarding) hat den DSCP-Wert 46 (Binär 101110) und entspricht IP Precedence 5. EF garantiert minimale Latenz, Jitter und Verlust — ideal für VoIP. Per Hop Behavior: Bits werden bevorzugt weitergeleitet.",
      answers: [
        { id: "a", text: "DSCP 0 (Best Effort)", isCorrect: false },
        { id: "b", text: "DSCP 46 (EF — Expedited Forwarding)", isCorrect: true },
        { id: "c", text: "DSCP 26 (AF31)", isCorrect: false },
        { id: "d", text: "DSCP 10 (AF11)", isCorrect: false },
      ],
    },
    {
      id: uid(), type: "single-choice", points: 10, blueprint: "4.1",
      text: "Was ist der Unterschied zwischen Traffic Policing und Traffic Shaping?",
      explanation: "Policing: Überschreitender Traffic wird sofort verworfen (drop) — kein Delay, aber Paketverlust. Shaping: Überschreitender Traffic wird gepuffert (buffer) und verzögert gesendet — kein Verlust, aber erhöhter Delay. Shaping erzeugt eine glattere Sendecharakteristik.",
      answers: [
        { id: "a", text: "Policing puffert Traffic; Shaping verwirft ihn", isCorrect: false },
        { id: "b", text: "Beide verwerfen Traffic über dem Limit", isCorrect: false },
        { id: "c", text: "Policing verwirft Traffic über dem Limit; Shaping puffert ihn für späteres Senden", isCorrect: true },
        { id: "d", text: "Policing und Shaping sind identische Mechanismen mit unterschiedlichen Namen", isCorrect: false },
      ],
    },
    {
      id: uid(), type: "single-choice", points: 10, blueprint: "4.1",
      text: "Was ist LLQ (Low Latency Queuing) und für welchen Traffic wird es eingesetzt?",
      explanation: "LLQ fügt CBWFQ eine streng priorisierte Warteschlange (Priority Queue) hinzu. VoIP-Traffic wird in diese PQ eingereiht und immer zuerst bedient — bevor andere Queues Traffic senden. Dies garantiert minimalen Jitter und Delay für Sprachverkehr.",
      answers: [
        { id: "a", text: "LLQ ist eine Congestion-Avoidance-Methode für TCP-Traffic", isCorrect: false },
        { id: "b", text: "LLQ ergänzt CBWFQ mit einer Priority Queue für delay-sensitiven Traffic (z. B. VoIP)", isCorrect: true },
        { id: "c", text: "LLQ verteilt Bandbreite gleichmäßig auf alle Queues (Round Robin)", isCorrect: false },
        { id: "d", text: "LLQ puffert alle Pakete, bis die Leitung frei ist", isCorrect: false },
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
    // ── 6 neue Fragen (T-3/R-3 WLAN AP-Modi Gap-Plan) ───────────
    {
      id: uid(), type: "single-choice", points: 10, blueprint: "2.6",
      text: "Welchen AP-Modus sollte man wählen, wenn eine Filiale mit schlechter WAN-Verbindung zum WLC trotzdem WLAN-Dienste aufrechterhalten soll, wenn der WLC nicht erreichbar ist?",
      explanation: "FlexConnect ermöglicht lokales Forwarding, wenn der WLC nicht erreichbar ist (Standalone-Modus). Die Filiale kann weiter WLAN-Dienste anbieten, ohne dass Traffic durch den CAPWAP-Tunnel zum WLC muss.",
      answers: [
        { id: "a", text: "Lightweight (Local Modus)", isCorrect: false },
        { id: "b", text: "Autonomous AP", isCorrect: false },
        { id: "c", text: "FlexConnect", isCorrect: true },
        { id: "d", text: "Monitor-Modus", isCorrect: false },
      ],
    },
    {
      id: uid(), type: "single-choice", points: 10, blueprint: "2.6",
      text: "Was beschreibt die Split MAC-Architektur bei Lightweight APs?",
      explanation: "Split MAC: Der AP übernimmt nur Layer-1/2-Aufgaben (Senden/Empfangen, Frame-Erkennung), während der WLC die Steuerungsfunktionen übernimmt (Authentifizierung, Verschlüsselung, SSID-Management). Dies ermöglicht zentrales Management.",
      answers: [
        { id: "a", text: "Jeder AP hat zwei MAC-Adressen — eine für Management, eine für Daten", isCorrect: false },
        { id: "b", text: "Der AP verarbeitet Layer-1/2-Aufgaben; der WLC übernimmt alle Steuerungsfunktionen", isCorrect: true },
        { id: "c", text: "Der Switch trennt MAC-Adressen auf zwei VLANs auf", isCorrect: false },
        { id: "d", text: "Zwei WLCs teilen sich die MAC-Tabelle eines APs", isCorrect: false },
      ],
    },
    {
      id: uid(), type: "single-choice", points: 10, blueprint: "2.6",
      text: "Für welchen Einsatzzweck ist der Monitor-Modus eines Lightweight APs geeignet?",
      explanation: "Im Monitor-Modus lauscht der AP passiv — er sendet keine Frames und assoziiert keine Clients. Er wird für Rogue-AP-Erkennung, IDS/IPS und WLAN-Überwachung genutzt.",
      answers: [
        { id: "a", text: "Client-Traffic-Weiterleitung bei WLC-Ausfall", isCorrect: false },
        { id: "b", text: "Passives Lauschen für Rogue-AP-Erkennung und IDS", isCorrect: true },
        { id: "c", text: "Aufzeichnen von Frames für Wireshark-Analyse", isCorrect: false },
        { id: "d", text: "Erweiterung des WLAN-Coverage über mehrere Etagen", isCorrect: false },
      ],
    },
    {
      id: uid(), type: "single-choice", points: 10, blueprint: "2.6",
      text: "An welchen Switch-Port-Typ wird ein Lightweight AP (LAP) üblicherweise angeschlossen?",
      explanation: "Ein Lightweight AP wird an einen Access Port angeschlossen (einem VLAN zugewiesen). Der AP selbst macht kein Trunking — alle VLAN-Logik liegt beim WLC. Der WLC hingegen wird an einen Trunk Port angeschlossen.",
      answers: [
        { id: "a", text: "Trunk Port (alle VLANs)", isCorrect: false },
        { id: "b", text: "Access Port (einem VLAN zugewiesen)", isCorrect: true },
        { id: "c", text: "Routed Port (Layer-3-Interface)", isCorrect: false },
        { id: "d", text: "EtherChannel-Port (gebündelt)", isCorrect: false },
      ],
    },
    {
      id: uid(), type: "true-false", points: 10, blueprint: "2.6",
      text: "Ein Lightweight AP im Local-Modus leitet Client-Traffic direkt lokal weiter, ohne den WLC zu involvieren.",
      explanation: "Falsch. Im Local-Modus wird der gesamte Client-Traffic durch den CAPWAP-Tunnel zum WLC geleitet (centralized forwarding). Nur FlexConnect kann Traffic lokal weiterleiten.",
      answers: [
        { id: "a", text: "Wahr", isCorrect: false },
        { id: "b", text: "Falsch — im Local-Modus wird Traffic durch CAPWAP zum WLC geleitet", isCorrect: true },
      ],
    },
    {
      id: uid(), type: "single-choice", points: 10, blueprint: "2.6",
      text: "Welche CAPWAP-UDP-Ports werden zwischen einem Lightweight AP und dem WLC verwendet?",
      explanation: "CAPWAP nutzt UDP 5246 für den Control-Kanal (AP-Steuerung, DTLS-verschlüsselt) und UDP 5247 für den Data-Kanal (Client-Traffic-Tunnel). Diese Ports müssen in Firewalls zwischen AP und WLC freigegeben sein.",
      answers: [
        { id: "a", text: "TCP 5246 und TCP 5247", isCorrect: false },
        { id: "b", text: "UDP 5246 (Control) und UDP 5247 (Data)", isCorrect: true },
        { id: "c", text: "UDP 1812 und UDP 1813", isCorrect: false },
        { id: "d", text: "UDP 4500 und UDP 500", isCorrect: false },
      ],
    },
    {
      id: uid(), type: "single-choice", points: 10, blueprint: "2.8",
      text: "Welches AAA-Protokoll sollte für den administrativen Zugriff auf einen Cisco WLC verwendet werden, und welches für die Authentifizierung von WLAN-Clients?",
      explanation: "TACACS+ (TCP 49, gesamter Payload verschlüsselt) eignet sich für Device Administration: Command-Authorization ermöglicht granulare Kontrolle über CLI-Befehle auf dem WLC. RADIUS (UDP 1812/1813) ist das Standardprotokoll für Network Access (WLAN-Client-Auth via 802.1X). Merkregel: TACACS+ → Terminal/Admin, RADIUS → Remote-Access/Clients.",
      answers: [
        { id: "a", text: "RADIUS für beide — WLC und WLAN-Clients", isCorrect: false },
        { id: "b", text: "TACACS+ für WLC Device-Admin (Command-Authorization); RADIUS für WLAN-Client-Auth (802.1X)", isCorrect: true },
        { id: "c", text: "TACACS+ für WLAN-Clients; RADIUS für WLC-Admin-Zugriff", isCorrect: false },
        { id: "d", text: "Kerberos für WLC-Admin; TACACS+ für WLAN-Clients", isCorrect: false },
      ],
    },
  ],
};

// ============================================================
// QUIZ 13: CCNA Gesamtprüfung (Simuliertes Exam)
// ============================================================
export const QUIZ_CCNA_EXAM: Quiz = {
  id: "ccna-quiz-gesamtpruefung",
  title: "CCNA 200-301 Prüfungssimulation (100 Fragen)",
  description: "Simuliertes CCNA-Exam mit 100 Fragen aus allen Themenbereichen – Bestehensgrenze 82% | Verteilung: 20×1.0 / 20×2.0 / 25×3.0 / 10×4.0 / 15×5.0 / 10×6.0",
  passingScore: 82,
  timeLimit: 7200,
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
    // ── Section 1.0 – Network Fundamentals (15 neue Fragen) ──────
    {
      id: uid(), type: "single-choice", points: 5, blueprint: "1.1",
      text: "Auf welcher OSI-Schicht arbeiten Switches hauptsächlich?",
      explanation: "Switches arbeiten auf Schicht 2 (Data Link Layer) und leiten Frames anhand von MAC-Adressen weiter. Router leiten Pakete auf Schicht 3 (Network Layer).",
      answers: [
        { id: "a", text: "Schicht 1 (Physical)", isCorrect: false },
        { id: "b", text: "Schicht 2 (Data Link)", isCorrect: true },
        { id: "c", text: "Schicht 3 (Network)", isCorrect: false },
        { id: "d", text: "Schicht 4 (Transport)", isCorrect: false },
      ],
    },
    {
      id: uid(), type: "single-choice", points: 5, blueprint: "1.5",
      text: "Welche Aussage über TCP ist korrekt?",
      explanation: "TCP ist verbindungsorientiert und garantiert die zuverlässige, geordnete Übertragung durch Sequenznummern, Bestätigungen (ACK) und Wiederübertragungen. UDP ist verbindungslos und unzuverlässig, dafür deutlich schneller.",
      answers: [
        { id: "a", text: "TCP ist verbindungslos und sendet ohne vorherigen Verbindungsaufbau", isCorrect: false },
        { id: "b", text: "TCP garantiert die zuverlässige, geordnete Übertragung durch ACK und Retransmits", isCorrect: true },
        { id: "c", text: "TCP wird bevorzugt für Videostreaming und VoIP eingesetzt", isCorrect: false },
        { id: "d", text: "TCP nutzt keine Ports — Ports sind nur bei UDP relevant", isCorrect: false },
      ],
    },
    {
      id: uid(), type: "single-choice", points: 5, blueprint: "1.5",
      text: "Welche Port-Nummer verwendet HTTPS?",
      explanation: "HTTPS (HTTP Secure) verwendet TCP Port 443. Unverschlüsseltes HTTP nutzt Port 80.",
      answers: [
        { id: "a", text: "80", isCorrect: false },
        { id: "b", text: "443", isCorrect: true },
        { id: "c", text: "8080", isCorrect: false },
        { id: "d", text: "22", isCorrect: false },
      ],
    },
    {
      id: uid(), type: "single-choice", points: 5, blueprint: "1.6",
      text: "Welcher IP-Adressbereich ist für APIPA (Automatic Private IP Addressing) reserviert?",
      explanation: "APIPA: 169.254.0.0/16. Ein Host vergibt sich automatisch eine Adresse aus diesem Bereich, wenn kein DHCP-Server erreichbar ist. Eine APIPA-Adresse ist ein Hinweis auf ein DHCP-Problem.",
      answers: [
        { id: "a", text: "192.168.0.0/16", isCorrect: false },
        { id: "b", text: "172.16.0.0/12", isCorrect: false },
        { id: "c", text: "169.254.0.0/16", isCorrect: true },
        { id: "d", text: "10.0.0.0/8", isCorrect: false },
      ],
    },
    {
      id: uid(), type: "single-choice", points: 5, blueprint: "1.8",
      text: "Wie lautet die IPv6-Loopback-Adresse?",
      explanation: "Die IPv6-Loopback-Adresse ist ::1 (128 Bit, alle null außer dem letzten). Sie entspricht 127.0.0.1 bei IPv4.",
      answers: [
        { id: "a", text: "FE80::1", isCorrect: false },
        { id: "b", text: "::1", isCorrect: true },
        { id: "c", text: "FF02::1", isCorrect: false },
        { id: "d", text: "2001::1", isCorrect: false },
      ],
    },
    {
      id: uid(), type: "single-choice", points: 5, blueprint: "1.3",
      text: "Wofür wird das ARP-Protokoll verwendet?",
      explanation: "ARP (Address Resolution Protocol) löst IPv4-Adressen in MAC-Adressen auf. Das Gerät sendet einen ARP-Request (Broadcast); das Zielgerät antwortet mit seiner MAC-Adresse (Unicast).",
      answers: [
        { id: "a", text: "Auflösung von Hostnamen in IP-Adressen", isCorrect: false },
        { id: "b", text: "Auflösung von IP-Adressen in MAC-Adressen", isCorrect: true },
        { id: "c", text: "Automatische IP-Adressvergabe", isCorrect: false },
        { id: "d", text: "Verschlüsselung von Ethernet-Frames", isCorrect: false },
      ],
    },
    {
      id: uid(), type: "single-choice", points: 5, blueprint: "1.3",
      text: "Was unterscheidet eine Collision Domain von einer Broadcast Domain?",
      explanation: "Eine Collision Domain ist der Bereich, in dem Kollisionen auftreten können — ein Switch-Port bildet eine eigene Collision Domain. Eine Broadcast Domain ist der Bereich, in den Broadcasts weitergeleitet werden. Router und VLANs trennen Broadcast Domains.",
      answers: [
        { id: "a", text: "Collision Domains werden durch Switches getrennt, Broadcast Domains durch Hubs", isCorrect: false },
        { id: "b", text: "Ein Switch-Port bildet eine eigene Collision Domain; Broadcast Domains werden durch Router oder VLANs getrennt", isCorrect: true },
        { id: "c", text: "Collision und Broadcast Domains sind identisch bei modernen Switches", isCorrect: false },
        { id: "d", text: "Broadcasts werden von Switches nicht weitergeleitet", isCorrect: false },
      ],
    },
    {
      id: uid(), type: "single-choice", points: 5, blueprint: "1.5",
      text: "Welcher Port wird für DNS (Domain Name System) verwendet?",
      explanation: "DNS verwendet Port 53 — sowohl UDP (normale Abfragen bis 512 Byte) als auch TCP (Zone Transfers, große Antworten).",
      answers: [
        { id: "a", text: "Port 25", isCorrect: false },
        { id: "b", text: "Port 53", isCorrect: true },
        { id: "c", text: "Port 67", isCorrect: false },
        { id: "d", text: "Port 110", isCorrect: false },
      ],
    },
    {
      id: uid(), type: "single-choice", points: 5, blueprint: "1.6",
      text: "Wie viele nutzbare Hosts gibt es in einem /26-Netzwerk?",
      explanation: "/26 = 6 Host-Bits → 2^6 = 64 Adressen − 2 (Netz + Broadcast) = 62 nutzbare Hosts.",
      answers: [
        { id: "a", text: "32", isCorrect: false },
        { id: "b", text: "30", isCorrect: false },
        { id: "c", text: "62", isCorrect: true },
        { id: "d", text: "64", isCorrect: false },
      ],
    },
    {
      id: uid(), type: "true-false", points: 5, blueprint: "1.3",
      text: "Ein Hub leitet eingehende Frames an alle anderen Ports weiter.",
      explanation: "Wahr. Ein Hub (Layer-1-Gerät) wiederholt eingehende Signale an alle Ports. Er kennt keine MAC-Adressen, daher entsteht eine große Collision Domain. Switches (Layer 2) lernen MAC-Adressen und leiten Frames gezielt weiter.",
      answers: [
        { id: "a", text: "Wahr", isCorrect: true },
        { id: "b", text: "Falsch", isCorrect: false },
      ],
    },
    {
      id: uid(), type: "single-choice", points: 5, blueprint: "1.1",
      text: "Welche OSI-Schichten werden im TCP/IP-Modell als 'Application Layer' zusammengefasst?",
      explanation: "Das TCP/IP-Modell hat 4 Schichten. Der Application Layer fasst die OSI-Schichten 5 (Session), 6 (Presentation) und 7 (Application) zusammen.",
      answers: [
        { id: "a", text: "Physical und Data Link (OSI 1+2)", isCorrect: false },
        { id: "b", text: "Session, Presentation und Application (OSI 5+6+7)", isCorrect: true },
        { id: "c", text: "Network und Transport (OSI 3+4)", isCorrect: false },
        { id: "d", text: "Data Link und Network (OSI 2+3)", isCorrect: false },
      ],
    },
    {
      id: uid(), type: "multiple-choice", points: 5, blueprint: "1.6",
      text: "Welche Adressbereiche sind als private IPv4-Adressen (RFC 1918) definiert? (Mehrere Antworten)",
      explanation: "RFC 1918 definiert drei private Bereiche: 10.0.0.0/8, 172.16.0.0/12, 192.168.0.0/16. Diese werden im Internet nicht geroutet und erfordern NAT für den Internetzugang.",
      answers: [
        { id: "a", text: "10.0.0.0/8", isCorrect: true },
        { id: "b", text: "172.16.0.0/12", isCorrect: true },
        { id: "c", text: "192.168.0.0/16", isCorrect: true },
        { id: "d", text: "169.254.0.0/16", isCorrect: false },
        { id: "e", text: "100.64.0.0/10", isCorrect: false },
      ],
    },
    {
      id: uid(), type: "single-choice", points: 5, blueprint: "1.2",
      text: "Was ist der erste Schritt eines TCP-Drei-Wege-Handshakes?",
      explanation: "TCP Three-Way Handshake: 1) SYN (Client → Server) 2) SYN-ACK (Server → Client) 3) ACK (Client → Server). Erst danach besteht die Verbindung.",
      answers: [
        { id: "a", text: "ACK vom Client", isCorrect: false },
        { id: "b", text: "SYN-ACK vom Server", isCorrect: false },
        { id: "c", text: "SYN vom Client", isCorrect: true },
        { id: "d", text: "FIN vom Client", isCorrect: false },
      ],
    },
    {
      id: uid(), type: "single-choice", points: 5, blueprint: "1.2",
      text: "Welche Transport-Protokollkombination ist für HTTP und VoIP jeweils korrekt?",
      explanation: "HTTP/HTTPS verwendet TCP (zuverlässig, vollständige Inhalte erforderlich). VoIP verwendet UDP (verbindungslos, schnell — kurze Verzögerung wichtiger als Vollständigkeit; fehlende Pakete werden verworfen).",
      answers: [
        { id: "a", text: "HTTP = UDP, VoIP = TCP", isCorrect: false },
        { id: "b", text: "HTTP = TCP, VoIP = UDP", isCorrect: true },
        { id: "c", text: "Beide nutzen TCP", isCorrect: false },
        { id: "d", text: "Beide nutzen UDP", isCorrect: false },
      ],
    },
    {
      id: uid(), type: "single-choice", points: 5, blueprint: "1.3",
      text: "Welcher IPv4-Adressbereich ist für Multicast reserviert?",
      explanation: "IPv4-Multicast: 224.0.0.0/4 (224.0.0.0 bis 239.255.255.255 = Class D). Beispiele: 224.0.0.5 = All OSPF Routers, 224.0.0.1 = All Hosts.",
      answers: [
        { id: "a", text: "192.168.0.0/16", isCorrect: false },
        { id: "b", text: "240.0.0.0/4", isCorrect: false },
        { id: "c", text: "224.0.0.0/4", isCorrect: true },
        { id: "d", text: "172.16.0.0/12", isCorrect: false },
      ],
    },
    // ── Section 2.0 – Network Access (16 neue Fragen) ────────────
    {
      id: uid(), type: "single-choice", points: 5, blueprint: "2.1",
      text: "Welches IEEE-Protokoll definiert VLAN-Tagging auf Trunk-Links?",
      explanation: "IEEE 802.1Q ist das Standardprotokoll für VLAN-Tagging. Es fügt einen 4-Byte-Tag in den Ethernet-Frame ein. Cisco-Switches verwenden 802.1Q auf allen Trunk-Interfaces.",
      answers: [
        { id: "a", text: "IEEE 802.1D", isCorrect: false },
        { id: "b", text: "IEEE 802.1Q", isCorrect: true },
        { id: "c", text: "IEEE 802.3", isCorrect: false },
        { id: "d", text: "IEEE 802.11", isCorrect: false },
      ],
    },
    {
      id: uid(), type: "single-choice", points: 5, blueprint: "2.1",
      text: "Was ist das Standard Native VLAN auf einem Cisco-Trunk-Interface?",
      explanation: "Das Native VLAN auf Cisco-Trunk-Interfaces ist standardmäßig VLAN 1. Frames im Native VLAN werden ungetaggt übertragen. Best Practice: Native VLAN auf ein ungenutztes VLAN ändern.",
      answers: [
        { id: "a", text: "VLAN 0", isCorrect: false },
        { id: "b", text: "VLAN 1", isCorrect: true },
        { id: "c", text: "VLAN 100", isCorrect: false },
        { id: "d", text: "VLAN 4094", isCorrect: false },
      ],
    },
    {
      id: uid(), type: "single-choice", points: 5, blueprint: "2.3",
      text: "Welches Merkmal unterscheidet RSTP (802.1w) am deutlichsten von STP (802.1D)?",
      explanation: "RSTP konvergiert deutlich schneller: 1-2 Sekunden statt 30-50 Sekunden bei klassischem STP. RSTP nutzt Proposal/Agreement-Mechanismus und Edge Ports (PortFast-äquivalent).",
      answers: [
        { id: "a", text: "RSTP unterstützt keine VLANs", isCorrect: false },
        { id: "b", text: "RSTP konvergiert deutlich schneller (1-2 Sek. vs. 30-50 Sek.)", isCorrect: true },
        { id: "c", text: "RSTP benötigt keinen Root Bridge", isCorrect: false },
        { id: "d", text: "RSTP verschlüsselt BPDU-Pakete", isCorrect: false },
      ],
    },
    {
      id: uid(), type: "single-choice", points: 5, blueprint: "2.3",
      text: "Wie wird die STP Root Bridge gewählt?",
      explanation: "Die Root Bridge ist der Switch mit der niedrigsten Bridge-ID. Bridge-ID = Bridge-Priority (default 32768) + MAC-Adresse. Kriterium 1: niedrigste Priority. Kriterium 2 (Gleichstand): niedrigste MAC-Adresse.",
      answers: [
        { id: "a", text: "Der Switch mit der höchsten MAC-Adresse", isCorrect: false },
        { id: "b", text: "Der Switch mit der niedrigsten Bridge-ID (Priority + MAC)", isCorrect: true },
        { id: "c", text: "Der erste Switch, der einen BPDU sendet", isCorrect: false },
        { id: "d", text: "Die Root Bridge wird manuell registriert", isCorrect: false },
      ],
    },
    {
      id: uid(), type: "multiple-choice", points: 5, blueprint: "2.3",
      text: "Welche STP-Port-Rollen gibt es? (Mehrere Antworten)",
      explanation: "STP-Port-Rollen: Root Port (bester Pfad zur Root Bridge), Designated Port (weitergeleiteter Port pro Segment), Alternate/Backup Port (in RSTP), Disabled. In 802.1D ist der blockierte Port der Non-Root/Non-Designated Port.",
      answers: [
        { id: "a", text: "Root Port", isCorrect: true },
        { id: "b", text: "Designated Port", isCorrect: true },
        { id: "c", text: "Alternate Port (RSTP)", isCorrect: true },
        { id: "d", text: "Upstream Port", isCorrect: false },
        { id: "e", text: "Disabled Port", isCorrect: true },
      ],
    },
    {
      id: uid(), type: "single-choice", points: 5, blueprint: "2.2",
      text: "Wie viele physische Interfaces kann ein EtherChannel maximal bündeln (aktiv)?",
      explanation: "EtherChannel kann 2 bis 8 physische Interfaces aktiv bündeln. Bei LACP (802.3ad) können bis zu 16 konfiguriert werden, aber nur 8 sind gleichzeitig aktiv (die anderen 8 sind Hot-Standby).",
      answers: [
        { id: "a", text: "2", isCorrect: false },
        { id: "b", text: "4", isCorrect: false },
        { id: "c", text: "8", isCorrect: true },
        { id: "d", text: "16", isCorrect: false },
      ],
    },
    {
      id: uid(), type: "single-choice", points: 5, blueprint: "2.2",
      text: "Was ist der Unterschied zwischen LACP und PAgP bei EtherChannel?",
      explanation: "LACP (Link Aggregation Control Protocol) = IEEE-Standard 802.3ad, funktioniert mit Geräten verschiedener Hersteller. PAgP (Port Aggregation Protocol) = Cisco-proprietär. LACP-Modi: active/passive. PAgP-Modi: desirable/auto.",
      answers: [
        { id: "a", text: "LACP ist Cisco-proprietär, PAgP ist der IEEE-Standard", isCorrect: false },
        { id: "b", text: "LACP ist der IEEE-Standard (802.3ad), PAgP ist Cisco-proprietär", isCorrect: true },
        { id: "c", text: "Beide sind IEEE-Standards", isCorrect: false },
        { id: "d", text: "Kein Unterschied", isCorrect: false },
      ],
    },
    {
      id: uid(), type: "single-choice", points: 5, blueprint: "2.6",
      text: "Welches Verschlüsselungsprotokoll verwendet WPA2?",
      explanation: "WPA2 verwendet AES-CCMP (AES mit Counter Mode CBC-MAC Protocol). Deutlich sicherer als WPA1 (TKIP) oder WEP (RC4). WPA3 nutzt SAE und GCMP-256.",
      answers: [
        { id: "a", text: "RC4 (WEP-Algorithmus)", isCorrect: false },
        { id: "b", text: "TKIP", isCorrect: false },
        { id: "c", text: "AES-CCMP", isCorrect: true },
        { id: "d", text: "3DES", isCorrect: false },
      ],
    },
    {
      id: uid(), type: "single-choice", points: 5, blueprint: "2.6",
      text: "Welches Frequenzband nutzt IEEE 802.11ac (Wi-Fi 5) ausschließlich?",
      explanation: "802.11ac (Wi-Fi 5) arbeitet ausschließlich im 5-GHz-Band. Vorteile: weniger Interferenzen, mehr Kanäle, höhere Datenraten. 802.11ax (Wi-Fi 6) unterstützt sowohl 2,4 GHz als auch 5 GHz.",
      answers: [
        { id: "a", text: "2,4 GHz", isCorrect: false },
        { id: "b", text: "5 GHz", isCorrect: true },
        { id: "c", text: "Sowohl 2,4 GHz als auch 5 GHz", isCorrect: false },
        { id: "d", text: "6 GHz", isCorrect: false },
      ],
    },
    {
      id: uid(), type: "single-choice", points: 5, blueprint: "2.7",
      text: "Welches Protokoll verwenden Cisco Lightweight APs zur Kommunikation mit dem WLC?",
      explanation: "CAPWAP (Control And Provisioning of Wireless Access Points): UDP-Port 5246 (Control) und 5247 (Data). CAPWAP löste das Cisco-proprietäre LWAPP ab.",
      answers: [
        { id: "a", text: "LWAPP", isCorrect: false },
        { id: "b", text: "CAPWAP", isCorrect: true },
        { id: "c", text: "RADIUS", isCorrect: false },
        { id: "d", text: "SNMP", isCorrect: false },
      ],
    },
    {
      id: uid(), type: "single-choice", points: 5, blueprint: "2.7",
      text: "Was ist der Hauptunterschied zwischen einem Lightweight AP und einem Autonomous AP?",
      explanation: "Lightweight AP: Arbeitet nur mit einem WLC zusammen. Der WLC übernimmt Management und Konfiguration via CAPWAP. Autonomous AP: Eigenständig konfiguriert, kein WLC erforderlich. Lightweight + WLC ist besser skalierbar.",
      answers: [
        { id: "a", text: "Lightweight APs unterstützen keine WLAN-Clients", isCorrect: false },
        { id: "b", text: "Lightweight APs benötigen einen WLC; Autonomous APs sind eigenständig konfigurierbar", isCorrect: true },
        { id: "c", text: "Autonomous APs sind teurer und für größere Netzwerke", isCorrect: false },
        { id: "d", text: "Kein Unterschied", isCorrect: false },
      ],
    },
    {
      id: uid(), type: "single-choice", points: 5, blueprint: "2.4",
      text: "Was passiert bei Port Security mit Violation-Modus 'shutdown', wenn eine unbekannte MAC-Adresse erkannt wird?",
      explanation: "Im Modus 'shutdown' (Standard): Der Port wird in den err-disabled Zustand versetzt, die Verbindung getrennt und ein Syslog-Eintrag erstellt. Reaktivierung erfordert manuelles 'shutdown' + 'no shutdown'.",
      answers: [
        { id: "a", text: "Frame verworfen, Port bleibt aktiv (kein Log)", isCorrect: false },
        { id: "b", text: "Port wird err-disabled und muss manuell reaktiviert werden", isCorrect: true },
        { id: "c", text: "Frames verworfen, Log-Eintrag erstellt, Port bleibt aktiv", isCorrect: false },
        { id: "d", text: "Nur der betroffene VLAN-Traffic wird blockiert", isCorrect: false },
      ],
    },
    {
      id: uid(), type: "single-choice", points: 5, blueprint: "2.5",
      text: "Auf welchem Port-Typ ist Dynamic ARP Inspection (DAI) normalerweise 'trusted'?",
      explanation: "DAI markiert Uplink-Ports (zu anderen Switches oder Routern) als 'trusted'. Access-Ports (zu Endgeräten) sind 'untrusted' und werden auf ARP-Validität geprüft. DHCP-Snooping muss aktiv sein für die Binding-Datenbank.",
      answers: [
        { id: "a", text: "Access-Ports (zu Endgeräten)", isCorrect: false },
        { id: "b", text: "Uplink-Ports (zu anderen Switches oder Routern)", isCorrect: true },
        { id: "c", text: "Alle Ports sind standardmäßig trusted", isCorrect: false },
        { id: "d", text: "Trunk-Ports sind nie trusted", isCorrect: false },
      ],
    },
    {
      id: uid(), type: "true-false", points: 5, blueprint: "2.3",
      text: "PortFast sollte auf allen Trunk-Ports zwischen Switches aktiviert werden.",
      explanation: "Falsch. PortFast sollte NUR auf Access-Ports zu Endgeräten (PCs, Server) aktiviert werden. Auf Trunk-Ports zwischen Switches würde PortFast den STP-Prozess umgehen und Loops verursachen können.",
      answers: [
        { id: "a", text: "Wahr", isCorrect: false },
        { id: "b", text: "Falsch", isCorrect: true },
      ],
    },
    {
      id: uid(), type: "single-choice", points: 5, blueprint: "2.1",
      text: "Welcher Befehl zeigt alle VLANs und ihre zugehörigen Ports auf einem Cisco-Switch?",
      explanation: "'show vlan brief' zeigt alle VLANs mit Namen, Status und zugeordneten Access-Ports. 'show interfaces trunk' zeigt Trunk-Ports mit erlaubten VLANs.",
      answers: [
        { id: "a", text: "show vlan all", isCorrect: false },
        { id: "b", text: "show vlan brief", isCorrect: true },
        { id: "c", text: "show interface vlan", isCorrect: false },
        { id: "d", text: "show ip vlan", isCorrect: false },
      ],
    },
    {
      id: uid(), type: "single-choice", points: 5, blueprint: "2.6",
      text: "Was ist der wesentliche Sicherheitsvorteil von WPA3 gegenüber WPA2?",
      explanation: "WPA3 verwendet SAE (Simultaneous Authentication of Equals, auch 'Dragonfly') statt PSK-Handshake. SAE verhindert Offline-Wörterbuch-Angriffe auf das WLAN-Passwort und bietet Forward Secrecy. WPA3 ist zudem sicherer in offenen Netzwerken (OWE).",
      answers: [
        { id: "a", text: "WPA3 verwendet AES-128 statt AES-256", isCorrect: false },
        { id: "b", text: "WPA3 nutzt SAE statt PSK — verhindert Offline-Wörterbuchangriffe und bietet Forward Secrecy", isCorrect: true },
        { id: "c", text: "WPA3 ist kompatibel mit WEP-Geräten", isCorrect: false },
        { id: "d", text: "WPA3 benötigt keinen Authentifizierungsserver", isCorrect: false },
      ],
    },
    // ── Section 3.0 – IP Connectivity (22 neue Fragen) ───────────
    {
      id: uid(), type: "single-choice", points: 5, blueprint: "3.1",
      text: "Welcher Administrative Distance (AD) hat OSPF standardmäßig?",
      explanation: "OSPF hat AD 110. Je niedriger die AD, desto vertrauenswürdiger: Directly Connected=0, Static=1, EIGRP=90, OSPF=110, RIP=120, External EIGRP=170, Unknown=255.",
      answers: [
        { id: "a", text: "90", isCorrect: false },
        { id: "b", text: "100", isCorrect: false },
        { id: "c", text: "110", isCorrect: true },
        { id: "d", text: "120", isCorrect: false },
      ],
    },
    {
      id: uid(), type: "single-choice", points: 5, blueprint: "3.1",
      text: "Was ist die maximale Hop-Anzahl bei RIPv2?",
      explanation: "RIPv2 hat eine maximale Hop-Anzahl von 15. Eine Route mit 16 Hops gilt als unerreichbar ('infinite'). Das begrenzt RIP auf kleine Netzwerke.",
      answers: [
        { id: "a", text: "8", isCorrect: false },
        { id: "b", text: "15", isCorrect: true },
        { id: "c", text: "32", isCorrect: false },
        { id: "d", text: "255", isCorrect: false },
      ],
    },
    {
      id: uid(), type: "single-choice", points: 5, blueprint: "3.1",
      text: "Ein Router hat für das Ziel 192.168.1.250 drei Routen: /24 via R1, /26 via R2, /28 via R3. Welche Route wird verwendet?",
      explanation: "Longest Prefix Match: Der spezifischste (längste) Präfix gewinnt immer. /28 ist spezifischer als /26 ist spezifischer als /24. Route via R3 (/28) wird verwendet.",
      answers: [
        { id: "a", text: "/24 via R1 (stabilste Route)", isCorrect: false },
        { id: "b", text: "/26 via R2", isCorrect: false },
        { id: "c", text: "/28 via R3 (längster Präfix)", isCorrect: true },
        { id: "d", text: "Alle drei — Load Balancing", isCorrect: false },
      ],
    },
    {
      id: uid(), type: "single-choice", points: 5, blueprint: "3.3",
      text: "Was ist eine Floating Static Route?",
      explanation: "Eine Floating Static Route ist eine statische Route mit höherer (schlechterer) AD als die primäre Route. Sie wird nur aktiv, wenn die primäre Route ausfällt. Beispiel: OSPF (AD 110) als primär, Floating Static mit AD 120 als Backup.",
      answers: [
        { id: "a", text: "Eine Route, die automatisch zwischen Interfaces wechselt", isCorrect: false },
        { id: "b", text: "Eine statische Route mit höherer AD als die primäre Route — aktiviert nur beim Ausfall", isCorrect: true },
        { id: "c", text: "Eine Default-Route (0.0.0.0/0)", isCorrect: false },
        { id: "d", text: "Eine von OSPF automatisch generierte Route", isCorrect: false },
      ],
    },
    {
      id: uid(), type: "single-choice", points: 5, blueprint: "3.4",
      text: "Was ist der Standard OSPF Hello-Interval auf einem Broadcast-Interface (Ethernet)?",
      explanation: "Ethernet/Broadcast: Hello = 10 Sekunden, Dead = 40 Sekunden. NBMA (Frame Relay): Hello = 30 Sekunden, Dead = 120 Sekunden.",
      answers: [
        { id: "a", text: "5 Sekunden", isCorrect: false },
        { id: "b", text: "10 Sekunden", isCorrect: true },
        { id: "c", text: "30 Sekunden", isCorrect: false },
        { id: "d", text: "60 Sekunden", isCorrect: false },
      ],
    },
    {
      id: uid(), type: "single-choice", points: 5, blueprint: "3.4",
      text: "Was bewirkt 'ip ospf priority 0' auf einem Interface?",
      explanation: "Priority 0 schließt den Router vollständig von der DR/BDR-Wahl aus — er kann niemals DR oder BDR werden und bleibt dauerhaft DROther.",
      answers: [
        { id: "a", text: "Der Router wird bevorzugt als DR gewählt", isCorrect: false },
        { id: "b", text: "Der Router wird niemals DR oder BDR", isCorrect: true },
        { id: "c", text: "OSPF wird auf diesem Interface deaktiviert", isCorrect: false },
        { id: "d", text: "Der Router nimmt nicht an der Wahl teil, sendet aber Hello-Pakete", isCorrect: false },
      ],
    },
    {
      id: uid(), type: "single-choice", points: 5, blueprint: "3.4",
      text: "Welcher OSPF-Routertyp erzeugt Type-3 Summary LSAs?",
      explanation: "ABR (Area Border Router) erzeugt Type-3 Summary LSAs. Ein ABR verbindet mindestens zwei OSPF-Areas und kündigt Routen aus einer Area in der anderen an.",
      answers: [
        { id: "a", text: "ASBR (Autonomous System Boundary Router)", isCorrect: false },
        { id: "b", text: "DR (Designated Router)", isCorrect: false },
        { id: "c", text: "ABR (Area Border Router)", isCorrect: true },
        { id: "d", text: "Internal Router", isCorrect: false },
      ],
    },
    {
      id: uid(), type: "single-choice", points: 5, blueprint: "3.4",
      text: "Welchen Code zeigt 'show ip route' für eine OSPF-Inter-Area-Route?",
      explanation: "O = OSPF Intra-Area, O IA = OSPF Inter-Area (Type-3-LSA vom ABR), O E1/O E2 = External OSPF (Type-5-LSA vom ASBR).",
      answers: [
        { id: "a", text: "O", isCorrect: false },
        { id: "b", text: "O IA", isCorrect: true },
        { id: "c", text: "O E2", isCorrect: false },
        { id: "d", text: "IA", isCorrect: false },
      ],
    },
    {
      id: uid(), type: "single-choice", points: 5, blueprint: "3.5",
      text: "Was ist die Funktion eines FHRP (First Hop Redundancy Protocol)?",
      explanation: "FHRP (HSRP, VRRP, GLBP) stellt eine virtuelle IP als redundantes Default-Gateway bereit. Bei Ausfall des aktiven Routers übernimmt der Standby-Router. Endgeräte konfigurieren die virtuelle IP als Gateway.",
      answers: [
        { id: "a", text: "Lastverteilung auf mehrere Uplink-Interfaces", isCorrect: false },
        { id: "b", text: "Redundantes Default-Gateway durch gemeinsame virtuelle IP-Adresse", isCorrect: true },
        { id: "c", text: "Verschlüsselung des Default-Gateway-Traffics", isCorrect: false },
        { id: "d", text: "Automatische Subnetz-Konfiguration", isCorrect: false },
      ],
    },
    {
      id: uid(), type: "single-choice", points: 5, blueprint: "3.5",
      text: "Welcher Router ist in einer HSRP-Gruppe standardmäßig aktiv?",
      explanation: "Der Router mit der höchsten HSRP-Priority wird aktiv (Standard-Priority: 100). Bei Gleichstand gewinnt die höhere IP-Adresse. 'preempt' muss aktiviert sein, damit ein Router mit höherer Priority den aktuellen aktiven Router verdrängt.",
      answers: [
        { id: "a", text: "Der Router mit der niedrigsten Priority", isCorrect: false },
        { id: "b", text: "Der Router mit der höchsten Priority (Standard 100)", isCorrect: true },
        { id: "c", text: "Der Router mit der niedrigsten IP-Adresse", isCorrect: false },
        { id: "d", text: "Der erste konfigurierte Router", isCorrect: false },
      ],
    },
    {
      id: uid(), type: "single-choice", points: 5, blueprint: "3.5",
      text: "Was unterscheidet VRRP von HSRP?",
      explanation: "VRRP (RFC 5798) ist ein offener Standard — funktioniert mit Geräten verschiedener Hersteller. HSRP ist Cisco-proprietär. In gemischten Umgebungen ist VRRP die richtige Wahl.",
      answers: [
        { id: "a", text: "VRRP ist Cisco-proprietär, HSRP ist ein offener Standard", isCorrect: false },
        { id: "b", text: "VRRP ist ein offener Standard (RFC 5798), HSRP ist Cisco-proprietär", isCorrect: true },
        { id: "c", text: "VRRP unterstützt keine virtuelle MAC-Adresse", isCorrect: false },
        { id: "d", text: "Beide sind vollständig identisch", isCorrect: false },
      ],
    },
    {
      id: uid(), type: "single-choice", points: 5, blueprint: "3.2",
      text: "Welche zwei Methoden für Inter-VLAN-Routing gibt es auf Cisco-Geräten?",
      explanation: "Methode 1: Router-on-a-Stick (ein Router mit Sub-Interfaces, Trunk-Link zum Switch). Methode 2: Layer-3-Switch mit SVIs (Switched Virtual Interfaces) — effizienter für viele VLANs.",
      answers: [
        { id: "a", text: "RIP und OSPF als Inter-VLAN-Protokolle", isCorrect: false },
        { id: "b", text: "Router-on-a-Stick (Sub-Interfaces) und Layer-3-Switch mit SVIs", isCorrect: true },
        { id: "c", text: "NAT und PAT für VLAN-Routing", isCorrect: false },
        { id: "d", text: "Nur Layer-3-Switches können Inter-VLAN-Routing", isCorrect: false },
      ],
    },
    {
      id: uid(), type: "single-choice", points: 5, blueprint: "3.1",
      text: "Was passiert, wenn ein Router keine passende Route findet und keine Default-Route konfiguriert ist?",
      explanation: "Der Router verwirft das Paket (Drop) und sendet eine ICMP 'Destination Unreachable'-Nachricht zurück an den Absender.",
      answers: [
        { id: "a", text: "Der Router sendet das Paket an den Default-Gateway weiter", isCorrect: false },
        { id: "b", text: "Der Router verwirft das Paket und sendet ICMP Destination Unreachable", isCorrect: true },
        { id: "c", text: "Der Router brodcastet das Paket in alle Netzwerke", isCorrect: false },
        { id: "d", text: "Das Paket wird zwischengespeichert bis eine Route verfügbar ist", isCorrect: false },
      ],
    },
    {
      id: uid(), type: "single-choice", points: 5, blueprint: "3.3",
      text: "Wie lautet das Cisco-Kommando für eine IPv4-Default-Route?",
      explanation: "'ip route 0.0.0.0 0.0.0.0 <next-hop>' erstellt eine Default-Route. Sie matched jedes Ziel, wenn keine spezifischere Route vorhanden ist.",
      answers: [
        { id: "a", text: "ip route default 0.0.0.0 <next-hop>", isCorrect: false },
        { id: "b", text: "ip route 0.0.0.0 0.0.0.0 <next-hop>", isCorrect: true },
        { id: "c", text: "ip default-route 0.0.0.0 <next-hop>", isCorrect: false },
        { id: "d", text: "ip default-gateway 0.0.0.0", isCorrect: false },
      ],
    },
    {
      id: uid(), type: "single-choice", points: 5, blueprint: "3.1",
      text: "Welcher Administrative Distance hat eine direkt verbundene Route?",
      explanation: "Directly Connected Routes haben AD = 0 (höchste Vertrauenswürdigkeit). Static = 1, EIGRP = 90, OSPF = 110, RIP = 120.",
      answers: [
        { id: "a", text: "1", isCorrect: false },
        { id: "b", text: "0", isCorrect: true },
        { id: "c", text: "5", isCorrect: false },
        { id: "d", text: "10", isCorrect: false },
      ],
    },
    {
      id: uid(), type: "multiple-choice", points: 5, blueprint: "3.4",
      text: "Welche Parameter müssen übereinstimmen, damit zwei OSPF-Nachbarn eine Adjacency aufbauen? (Mehrere Antworten)",
      explanation: "OSPF-Adjacency-Voraussetzungen: gleiche Area-ID, übereinstimmende Hello/Dead-Timer, kompatible Authentication, beide im gleichen Subnetz. Priority muss NICHT übereinstimmen (nur für DR-Wahl relevant).",
      answers: [
        { id: "a", text: "Gleiche Area-ID", isCorrect: true },
        { id: "b", text: "Übereinstimmende Hello/Dead-Timer", isCorrect: true },
        { id: "c", text: "Gleiche OSPF-Priority", isCorrect: false },
        { id: "d", text: "Gleiche Authentication-Konfiguration", isCorrect: true },
        { id: "e", text: "Beide Interfaces im gleichen Subnetz", isCorrect: true },
      ],
    },
    {
      id: uid(), type: "single-choice", points: 5, blueprint: "3.4",
      text: "Was beschreibt 'OSPF Equal-Cost Load Balancing'?",
      explanation: "Wenn OSPF zwei oder mehr Routen zum gleichen Ziel mit identischer Cost findet, verteilt es den Traffic auf alle gleichwertigen Pfade. Standard: bis zu 4 equal-cost Pfade.",
      answers: [
        { id: "a", text: "OSPF bevorzugt den Pfad mit der niedrigsten Bandbreite", isCorrect: false },
        { id: "b", text: "OSPF verteilt Traffic auf mehrere Pfade mit identischer Cost", isCorrect: true },
        { id: "c", text: "OSPF unterstützt kein Load Balancing", isCorrect: false },
        { id: "d", text: "OSPF sendet Traffic immer auf den schnellsten Pfad", isCorrect: false },
      ],
    },
    {
      id: uid(), type: "single-choice", points: 5, blueprint: "3.4",
      text: "Was bedeutet der Ausgabe-Code 'O 192.168.10.0/24 [110/2]' in 'show ip route'?",
      explanation: "[AD/Metrik]: 110 = Administrative Distance (OSPF). 2 = OSPF-Cost. O = OSPF Intra-Area-Route. Ein Cost von 2 entspricht typisch zwei FastEthernet-Hops (100M/100M = 1+1).",
      answers: [
        { id: "a", text: "110 = OSPF-Cost, 2 = Hop-Anzahl", isCorrect: false },
        { id: "b", text: "110 = Administrative Distance (OSPF), 2 = OSPF-Cost (Metrik)", isCorrect: true },
        { id: "c", text: "110 = Hop-Anzahl, 2 = Bandbreite in Gbit/s", isCorrect: false },
        { id: "d", text: "110 = OSPF-Prozessnummer, 2 = Interface-Index", isCorrect: false },
      ],
    },
    {
      id: uid(), type: "single-choice", points: 5, blueprint: "3.4",
      text: "Welcher Befehl zeigt die OSPF Link-State-Datenbank (LSDB)?",
      explanation: "'show ip ospf database' zeigt alle LSA-Typen im Überblick. 'show ip route ospf' zeigt nur die Routing-Tabelleneinträge. 'show ip ospf neighbor' zeigt Nachbarn und deren Status.",
      answers: [
        { id: "a", text: "show ip route ospf", isCorrect: false },
        { id: "b", text: "show ip ospf neighbor", isCorrect: false },
        { id: "c", text: "show ip ospf database", isCorrect: true },
        { id: "d", text: "show ospf lsdb detail", isCorrect: false },
      ],
    },
    {
      id: uid(), type: "single-choice", points: 5, blueprint: "3.4",
      text: "Welcher Vorteil ergibt sich aus Multi-Area-OSPF?",
      explanation: "Multi-Area-OSPF: Kleinere LSDBs pro Area, lokalisierte SPF-Berechnungen bei Topologieänderungen, Route Summarization am ABR, bessere Skalierbarkeit für große Netzwerke.",
      answers: [
        { id: "a", text: "Einfachere Konfiguration gegenüber Single-Area", isCorrect: false },
        { id: "b", text: "Kleinere LSDBs, lokalisierte SPF-Berechnungen, bessere Skalierbarkeit", isCorrect: true },
        { id: "c", text: "Mehr OSPF-Nachbarn pro Router möglich", isCorrect: false },
        { id: "d", text: "OSPF kann nur in Multi-Area-Umgebungen genutzt werden", isCorrect: false },
      ],
    },
    {
      id: uid(), type: "single-choice", points: 5, blueprint: "3.1",
      text: "Welchen AD-Wert hat EIGRP für interne Routen?",
      explanation: "EIGRP interne Routen: AD = 90. Externe EIGRP-Routen: AD = 170. EIGRP ist vertrauenswürdiger als OSPF (110) oder RIP (120).",
      answers: [
        { id: "a", text: "70", isCorrect: false },
        { id: "b", text: "90", isCorrect: true },
        { id: "c", text: "100", isCorrect: false },
        { id: "d", text: "110", isCorrect: false },
      ],
    },
    {
      id: uid(), type: "single-choice", points: 5, blueprint: "3.4",
      text: "Welchen OSPF-Netzwerktyp hat ein serielles Point-to-Point-Interface standardmäßig?",
      explanation: "Serielle Point-to-Point-Interfaces haben standardmäßig OSPF-Netzwerktyp 'Point-to-Point'. Kein DR/BDR-Wahl notwendig. Hello-Timer: 10s, Dead-Timer: 40s. Ethernet hat standardmäßig 'Broadcast' (mit DR/BDR).",
      answers: [
        { id: "a", text: "Broadcast (mit DR/BDR)", isCorrect: false },
        { id: "b", text: "Point-to-Point (ohne DR/BDR)", isCorrect: true },
        { id: "c", text: "NBMA", isCorrect: false },
        { id: "d", text: "Point-to-Multipoint", isCorrect: false },
      ],
    },
    // ── Section 4.0 – IP Services (7 neue Fragen) ────────────────
    {
      id: uid(), type: "single-choice", points: 5, blueprint: "4.3",
      text: "Was beschreibt ein NTP-Stratum-Wert?",
      explanation: "NTP Stratum = Entfernung zur Referenzuhr in NTP-Hops. Stratum 0 = Referenzuhr (GPS/Atomuhr, sendet kein NTP). Stratum 1 = direkt mit Stratum-0 verbunden. Stratum 16 = unsynchronisiert.",
      answers: [
        { id: "a", text: "Die Genauigkeit der Zeit in Millisekunden", isCorrect: false },
        { id: "b", text: "Die Entfernung (in NTP-Hops) zur Referenzuhr", isCorrect: true },
        { id: "c", text: "Die Anzahl der NTP-Clients pro Server", isCorrect: false },
        { id: "d", text: "Die NTP-Version", isCorrect: false },
      ],
    },
    {
      id: uid(), type: "single-choice", points: 5, blueprint: "4.4",
      text: "Welcher SNMP-Community-String ist standardmäßig für Read-Only-Zugriff vorgesehen?",
      explanation: "'public' ist der Standard-Community-String für Read-Only bei SNMP v1/v2c. 'private' für Read-Write. Best Practice: Beide sofort ändern! SNMPv3 verwendet Authentifizierung statt Community-Strings.",
      answers: [
        { id: "a", text: "private", isCorrect: false },
        { id: "b", text: "public", isCorrect: true },
        { id: "c", text: "admin", isCorrect: false },
        { id: "d", text: "read-only", isCorrect: false },
      ],
    },
    {
      id: uid(), type: "single-choice", points: 5, blueprint: "4.5",
      text: "Welcher Syslog-Level ist für 'Critical' (kritische Systembedingungen) vorgesehen?",
      explanation: "Syslog-Levels: 0=Emergency, 1=Alert, 2=Critical, 3=Error, 4=Warning, 5=Notice, 6=Info, 7=Debug. Level 2 (Critical) für kritische Systembedingungen, die sofortiges Eingreifen erfordern.",
      answers: [
        { id: "a", text: "Level 0 (Emergency)", isCorrect: false },
        { id: "b", text: "Level 1 (Alert)", isCorrect: false },
        { id: "c", text: "Level 2 (Critical)", isCorrect: true },
        { id: "d", text: "Level 3 (Error)", isCorrect: false },
      ],
    },
    {
      id: uid(), type: "single-choice", points: 5, blueprint: "4.6",
      text: "Was ist der Unterschied zwischen FTP und TFTP hinsichtlich Transportprotokoll und Port?",
      explanation: "FTP: TCP, Ports 20 (Data) und 21 (Control). TFTP: UDP, Port 69. FTP ist vollwertig mit Auth und Directory-Browsing. TFTP ist einfach ohne Auth — ideal für IOS-Image-Übertragungen.",
      answers: [
        { id: "a", text: "FTP = UDP Port 69, TFTP = TCP Port 21", isCorrect: false },
        { id: "b", text: "FTP = TCP Ports 20/21, TFTP = UDP Port 69", isCorrect: true },
        { id: "c", text: "FTP = TCP Port 22, TFTP = TCP Port 69", isCorrect: false },
        { id: "d", text: "Beide nutzen TCP", isCorrect: false },
      ],
    },
    {
      id: uid(), type: "single-choice", points: 5, blueprint: "4.1",
      text: "Was ist NAT Overload (PAT) und wie unterscheidet es sich von Static NAT?",
      explanation: "PAT: Viele interne Hosts teilen eine öffentliche IP via Port-Nummern. Static NAT: Feste 1-zu-1-Zuordnung zwischen einer privaten und einer öffentlichen IP — für Server, die von außen erreichbar sein müssen.",
      answers: [
        { id: "a", text: "PAT: 1-zu-1; Static NAT: viele-zu-1 mit Ports", isCorrect: false },
        { id: "b", text: "PAT: viele interne Hosts teilen eine öffentliche IP via Ports; Static NAT: feste 1-zu-1-Zuordnung", isCorrect: true },
        { id: "c", text: "Beide sind identisch in der Funktion", isCorrect: false },
        { id: "d", text: "Static NAT für ausgehenden Traffic, PAT für eingehenden", isCorrect: false },
      ],
    },
    {
      id: uid(), type: "single-choice", points: 5, blueprint: "4.3",
      text: "Syslog-Nachrichten werden standardmäßig über welches Protokoll und welchen Port übertragen?",
      explanation: "Syslog verwendet standardmäßig UDP Port 514. Für zuverlässige Übertragung kann TCP Port 514 oder 6514 (TLS/Encrypted) verwendet werden.",
      answers: [
        { id: "a", text: "TCP Port 514", isCorrect: false },
        { id: "b", text: "UDP Port 514", isCorrect: true },
        { id: "c", text: "TCP Port 161", isCorrect: false },
        { id: "d", text: "UDP Port 162", isCorrect: false },
      ],
    },
    {
      id: uid(), type: "single-choice", points: 5, blueprint: "4.2",
      text: "Was ist der Cisco IOS-Befehl zur HSRP-Konfiguration auf einem Interface?",
      explanation: "HSRP: Unter dem Interface-Kontext 'standby <group> ip <virtual-ip>'. Optional: 'standby <group> priority <0-255>' und 'standby <group> preempt'. Die virtuelle IP ist das Default-Gateway der Endgeräte.",
      answers: [
        { id: "a", text: "router hsrp 1 → virtual-ip → priority", isCorrect: false },
        { id: "b", text: "standby <group> ip <virtual-ip> (im Interface-Kontext)", isCorrect: true },
        { id: "c", text: "ip hsrp <virtual-ip> → standby priority", isCorrect: false },
        { id: "d", text: "hsrp enable → virtual-address → group-number", isCorrect: false },
      ],
    },
    // ── Section 5.0 – Security (11 neue Fragen) ──────────────────
    {
      id: uid(), type: "single-choice", points: 5, blueprint: "5.6",
      text: "Welcher Port Security-Violation-Modus verwirft Frames OHNE den Port zu deaktivieren, erstellt aber einen Log-Eintrag?",
      explanation: "Drei Violation-Modi: shutdown (Port wird err-disabled), restrict (verwirft + Syslog + SNMP-Trap, Port bleibt aktiv), protect (verwirft still, kein Log). 'restrict' generiert Logs ohne Port-Abschaltung.",
      answers: [
        { id: "a", text: "shutdown", isCorrect: false },
        { id: "b", text: "protect", isCorrect: false },
        { id: "c", text: "restrict", isCorrect: true },
        { id: "d", text: "drop", isCorrect: false },
      ],
    },
    {
      id: uid(), type: "single-choice", points: 5, blueprint: "5.2",
      text: "Wo sollte eine Standard-ACL platziert werden?",
      explanation: "Standard ACLs filtern nur nach Quell-IP. Sie werden so nah am Ziel wie möglich platziert (close to destination), damit kein unnötiger Traffic früh blockiert wird.",
      answers: [
        { id: "a", text: "Nah an der Quelle (close to source)", isCorrect: false },
        { id: "b", text: "Nah am Ziel (close to destination)", isCorrect: true },
        { id: "c", text: "Auf dem Core-Switch im Netzwerkzentrum", isCorrect: false },
        { id: "d", text: "Platzierung ist irrelevant", isCorrect: false },
      ],
    },
    {
      id: uid(), type: "true-false", points: 5, blueprint: "5.2",
      text: "Jede Cisco ACL enthält am Ende einen impliziten 'deny any' Eintrag.",
      explanation: "Wahr. Am Ende jeder Cisco ACL befindet sich ein implizites 'deny ip any any'. Pakete, die von keiner Permit-Regel erfasst werden, werden automatisch verworfen.",
      answers: [
        { id: "a", text: "Wahr", isCorrect: true },
        { id: "b", text: "Falsch", isCorrect: false },
      ],
    },
    {
      id: uid(), type: "single-choice", points: 5, blueprint: "5.3",
      text: "Was sind die drei Komponenten von AAA?",
      explanation: "AAA: Authentication (Wer bist du? — Identitätsprüfung), Authorization (Was darfst du? — Rechte), Accounting (Was hast du gemacht? — Protokollierung).",
      answers: [
        { id: "a", text: "Authentication, Authorization, Accounting", isCorrect: true },
        { id: "b", text: "Authentication, Access, Audit", isCorrect: false },
        { id: "c", text: "Availability, Authorization, Accounting", isCorrect: false },
        { id: "d", text: "Authentication, Availability, Access-Control", isCorrect: false },
      ],
    },
    {
      id: uid(), type: "single-choice", points: 5, blueprint: "5.3",
      text: "Was ist der Hauptunterschied zwischen TACACS+ und RADIUS?",
      explanation: "TACACS+ (TCP 49, gesamter Payload verschlüsselt): Device Administration (CLI-Zugriff auf Router/Switches). RADIUS (UDP 1812/1813, nur Passwort verschlüsselt): Network Access (WLAN-Clients, 802.1X, VPN).",
      answers: [
        { id: "a", text: "TACACS+ nutzt UDP, RADIUS nutzt TCP", isCorrect: false },
        { id: "b", text: "TACACS+ für Geräteverwaltung (CLI); RADIUS für Netzwerkzugriff (WLAN/802.1X)", isCorrect: true },
        { id: "c", text: "RADIUS verschlüsselt den gesamten Payload, TACACS+ nur das Passwort", isCorrect: false },
        { id: "d", text: "Beide sind vollständig austauschbar", isCorrect: false },
      ],
    },
    {
      id: uid(), type: "single-choice", points: 5, blueprint: "5.1",
      text: "Was ist der Unterschied zwischen IDS und IPS?",
      explanation: "IDS (Intrusion Detection System): Passiv, out-of-band — erkennt Angriffe und meldet sie, kann Traffic NICHT blockieren. IPS (Intrusion Prevention System): Aktiv, inline — kann Traffic in Echtzeit blockieren.",
      answers: [
        { id: "a", text: "IDS liegt inline und blockiert Traffic; IPS erkennt nur", isCorrect: false },
        { id: "b", text: "IPS liegt inline und kann Traffic blockieren; IDS erkennt out-of-band ohne Blocking", isCorrect: true },
        { id: "c", text: "Beide können Traffic blockieren — IPS ist nur schneller", isCorrect: false },
        { id: "d", text: "IDS und IPS sind identisch", isCorrect: false },
      ],
    },
    {
      id: uid(), type: "single-choice", points: 5, blueprint: "5.4",
      text: "Was ist Phishing?",
      explanation: "Phishing ist eine Social-Engineering-Methode: Täuschend echte E-Mails oder Websites werden verwendet, um Benutzer zur Preisgabe von Zugangsdaten zu verleiten. Varianten: Spear Phishing (gezielt), Vishing (Voice), Smishing (SMS).",
      answers: [
        { id: "a", text: "Ein technischer Angriff auf Protokollschwachstellen", isCorrect: false },
        { id: "b", text: "Social-Engineering-Angriff via gefälschter E-Mails oder Websites", isCorrect: true },
        { id: "c", text: "Ein automatisierter Port-Scan", isCorrect: false },
        { id: "d", text: "Eine Methode zur Datenverschlüsselung", isCorrect: false },
      ],
    },
    {
      id: uid(), type: "single-choice", points: 5, blueprint: "5.5",
      text: "Welcher Cisco IOS Befehl schützt alle lokalen Passwörter in der Konfiguration?",
      explanation: "'service password-encryption' verschlüsselt Passwörter mit dem schwachen Type-7-Algorithmus. Besser als Klartext, aber kein starker Schutz. Für das Enable-Passwort: 'enable secret' verwenden (MD5/SHA256).",
      answers: [
        { id: "a", text: "enable secret", isCorrect: false },
        { id: "b", text: "service password-encryption", isCorrect: true },
        { id: "c", text: "crypto key protect", isCorrect: false },
        { id: "d", text: "password hash all", isCorrect: false },
      ],
    },
    {
      id: uid(), type: "multiple-choice", points: 5, blueprint: "5.6",
      text: "Welche Aussagen zu SSH auf Cisco-Geräten sind korrekt? (Mehrere Antworten)",
      explanation: "SSH v2 ist sicherer als v1. SSH verwendet Port 22. Telnet überträgt Passwörter im Klartext. RSA-Schlüssel sind erforderlich. 'transport input ssh' deaktiviert Telnet auf VTY-Leitungen.",
      answers: [
        { id: "a", text: "SSHv2 ist sicherer als SSHv1", isCorrect: true },
        { id: "b", text: "SSH verwendet Port 22", isCorrect: true },
        { id: "c", text: "Telnet überträgt Passwörter im Klartext", isCorrect: true },
        { id: "d", text: "RSA-Schlüssel werden für SSH nicht benötigt", isCorrect: false },
        { id: "e", text: "'transport input ssh' deaktiviert Telnet-Zugriff auf VTY", isCorrect: true },
      ],
    },
    {
      id: uid(), type: "single-choice", points: 5, blueprint: "5.6",
      text: "Was ist 802.1X Port-Based Network Access Control?",
      explanation: "802.1X: Drei Rollen: Supplicant (Endgerät), Authenticator (Switch/AP — leitet Credentials weiter), Authentication Server (RADIUS). Bis zur Authentifizierung ist der Port gesperrt.",
      answers: [
        { id: "a", text: "Eine Verschlüsselungsmethode für Switch-zu-Switch-Links", isCorrect: false },
        { id: "b", text: "Portbasierte Zugriffskontrolle: Port gesperrt bis RADIUS-Authentifizierung", isCorrect: true },
        { id: "c", text: "VLAN-Zuordnung ohne Authentifizierung", isCorrect: false },
        { id: "d", text: "MAC-Adressfilterung ohne Authentifizierungsserver", isCorrect: false },
      ],
    },
    {
      id: uid(), type: "single-choice", points: 5, blueprint: "5.2",
      text: "Wo sollte eine Extended ACL platziert werden?",
      explanation: "Extended ACLs filtern nach Quell-IP UND Ziel-IP (+ Ports). Sie werden nah an der Quelle platziert (close to source), damit unerwünschter Traffic sofort verworfen wird.",
      answers: [
        { id: "a", text: "Nah am Ziel (close to destination)", isCorrect: false },
        { id: "b", text: "Nah an der Quelle (close to source)", isCorrect: true },
        { id: "c", text: "Immer auf dem Core-Switch", isCorrect: false },
        { id: "d", text: "Auf dem DNS-Server", isCorrect: false },
      ],
    },
    // ── Section 6.0 – Automation & Programmability (9 neue Fragen)─
    {
      id: uid(), type: "single-choice", points: 5, blueprint: "6.1",
      text: "Was ist der Unterschied zwischen Northbound und Southbound API in einem SDN-Controller?",
      explanation: "Northbound API: Controller ↔ Applikationen (Network Management, Orchestration). Southbound API: Controller ↔ Netzwerkgeräte (OpenFlow, NETCONF, RESTCONF). Der Controller sitzt dazwischen.",
      answers: [
        { id: "a", text: "Northbound = zu Netzwerkgeräten; Southbound = zu Applikationen", isCorrect: false },
        { id: "b", text: "Northbound = zu Applikationen; Southbound = zu Netzwerkgeräten", isCorrect: true },
        { id: "c", text: "Beide APIs kommunizieren nur mit Endgeräten", isCorrect: false },
        { id: "d", text: "Northbound und Southbound sind identisch", isCorrect: false },
      ],
    },
    {
      id: uid(), type: "single-choice", points: 5, blueprint: "6.2",
      text: "Welche HTTP-Methode wird bei REST APIs verwendet, um eine neue Ressource zu erstellen?",
      explanation: "REST-Methoden: GET = lesen, POST = erstellen (neue Ressource), PUT = aktualisieren/ersetzen, PATCH = teilweise aktualisieren, DELETE = löschen.",
      answers: [
        { id: "a", text: "GET", isCorrect: false },
        { id: "b", text: "POST", isCorrect: true },
        { id: "c", text: "PUT", isCorrect: false },
        { id: "d", text: "DELETE", isCorrect: false },
      ],
    },
    {
      id: uid(), type: "single-choice", points: 5, blueprint: "6.3",
      text: "Was unterscheidet Ansible von Puppet/Chef hinsichtlich der Architektur?",
      explanation: "Ansible: Agentless — kommuniziert über SSH, kein Agent auf verwalteten Geräten. Puppet/Chef: Agentbasiert — erfordert Installation eines Agents auf jedem Gerät.",
      answers: [
        { id: "a", text: "Ansible benötigt Agenten; Puppet/Chef sind agentless", isCorrect: false },
        { id: "b", text: "Ansible ist agentless (SSH); Puppet/Chef sind agentbasiert", isCorrect: true },
        { id: "c", text: "Alle drei sind agentless", isCorrect: false },
        { id: "d", text: "Puppet ist agentless, Ansible und Chef benötigen Agenten", isCorrect: false },
      ],
    },
    {
      id: uid(), type: "single-choice", points: 5, blueprint: "6.3",
      text: "Welches Datenformat und welches Transportprotokoll verwendet NETCONF?",
      explanation: "NETCONF: XML als Datenformat, SSH als Transportprotokoll (Port 830). RESTCONF ist der neuere Standard: JSON oder XML über HTTP/HTTPS. YANG ist das gemeinsame Datenmodell.",
      answers: [
        { id: "a", text: "JSON über HTTPS", isCorrect: false },
        { id: "b", text: "XML über SSH", isCorrect: true },
        { id: "c", text: "YAML über TCP", isCorrect: false },
        { id: "d", text: "CSV über UDP", isCorrect: false },
      ],
    },
    {
      id: uid(), type: "single-choice", points: 5, blueprint: "6.3",
      text: "Was ist YANG in Bezug auf Netzwerkkonfiguration?",
      explanation: "YANG (Yet Another Next Generation) ist eine Datenmodellierungssprache für Netzwerkkonfiguration und -status. YANG definiert die Datenstruktur; NETCONF oder RESTCONF übertragen die Daten.",
      answers: [
        { id: "a", text: "Ein Netzwerkprotokoll zur Gerätekonfiguration", isCorrect: false },
        { id: "b", text: "Eine Datenmodellierungssprache für Netzwerkkonfiguration (verwendet von NETCONF/RESTCONF)", isCorrect: true },
        { id: "c", text: "Ein Dateiformat zur Speicherung von Netzwerktopologien", isCorrect: false },
        { id: "d", text: "Ein JSON-Schema-Standard", isCorrect: false },
      ],
    },
    {
      id: uid(), type: "single-choice", points: 5, blueprint: "6.4",
      text: "Was ist das Ziel von Intent-Based Networking (IBN)?",
      explanation: "IBN: Administrator beschreibt die gewünschte Absicht ('Intent'); das System konfiguriert alle Geräte automatisch. Cisco DNA Center / Catalyst Center ist eine IBN-Plattform.",
      answers: [
        { id: "a", text: "Automatische Erkennung von Netzwerkangriffen", isCorrect: false },
        { id: "b", text: "Administrator beschreibt gewünschtes Netzwerkverhalten; System konfiguriert automatisch", isCorrect: true },
        { id: "c", text: "Physische Separation von Management und Data Plane", isCorrect: false },
        { id: "d", text: "Ersatz von TCP/IP durch ein neues Protokoll", isCorrect: false },
      ],
    },
    {
      id: uid(), type: "true-false", points: 5, blueprint: "6.4",
      text: "Cisco DNA Center (Catalyst Center) kann als SDN-Controller für Cisco-Enterprise-Netzwerke eingesetzt werden.",
      explanation: "Wahr. Cisco DNA Center (umbenannt in Catalyst Center) ist Ciscos SDN-Controller-Plattform für Enterprise-Netzwerke mit Intent-Based Networking, Assurance und NETCONF/RESTCONF-Kommunikation.",
      answers: [
        { id: "a", text: "Wahr", isCorrect: true },
        { id: "b", text: "Falsch", isCorrect: false },
      ],
    },
    {
      id: uid(), type: "single-choice", points: 5, blueprint: "6.2",
      text: "Welches Datenformat ist für Menschen besonders lesbar und wird häufig in Ansible-Playbooks verwendet?",
      explanation: "YAML ist am besten von Menschen lesbar — keine spitzen Klammern (XML) und keine geschweiften Klammern (JSON). Ansible-Playbooks werden in YAML geschrieben. YAML verwendet Einrückung zur Strukturierung.",
      answers: [
        { id: "a", text: "JSON", isCorrect: false },
        { id: "b", text: "XML", isCorrect: false },
        { id: "c", text: "YAML", isCorrect: true },
        { id: "d", text: "CSV", isCorrect: false },
      ],
    },
    {
      id: uid(), type: "single-choice", points: 5, blueprint: "6.1",
      text: "Was beschreibt den Unterschied zwischen traditionellem Netzwerken und SDN?",
      explanation: "Traditionell: Control Plane und Data Plane sind auf jedem Gerät verteilt. SDN: Control Plane zentralisiert im SDN-Controller. Geräte behalten nur die Data Plane (Forwarding). Netzwerk wird zentral programmierbar.",
      answers: [
        { id: "a", text: "Bei SDN hat jedes Gerät seine eigene Control Plane wie beim traditionellen Netzwerken", isCorrect: false },
        { id: "b", text: "SDN zentralisiert die Control Plane im Controller; Geräte behalten nur die Data Plane", isCorrect: true },
        { id: "c", text: "Traditionelles Networking ist schneller wegen direkter Kontrolle", isCorrect: false },
        { id: "d", text: "SDN erfordert neue physische Hardware", isCorrect: false },
      ],
    },
  ],
};

// ============================================================
// QUIZ 14: Cisco IOS CLI
// ============================================================
export const QUIZ_IOS_CLI: Quiz = {
  id: "ccna-quiz-ios-cli",
  title: "CCNA: Cisco IOS CLI",
  description: "CLI-Modi, Gerätezugriff, SSH, Interface-Konfiguration und Diagnose",
  passingScore: 70,
  shuffleQuestions: true,
  questions: [
    {
      id: uid(), type: "single-choice", points: 10,
      text: "Welcher Prompt zeigt den Privileged EXEC Mode?",
      explanation: "Privileged EXEC Mode wird durch '#' angezeigt (z.B. R1#). User EXEC Mode endet mit '>'.",
      answers: [
        { id: "a", text: "R1>", isCorrect: false },
        { id: "b", text: "R1#", isCorrect: true },
        { id: "c", text: "R1(config)#", isCorrect: false },
        { id: "d", text: "R1(config-if)#", isCorrect: false },
      ],
    },
    {
      id: uid(), type: "single-choice", points: 10,
      text: "Mit welchem Befehl wechselt man vom Privileged EXEC in den Global Configuration Mode?",
      explanation: "'configure terminal' (kurz: conf t) wechselt in den Global Config Mode.",
      answers: [
        { id: "a", text: "enable", isCorrect: false },
        { id: "b", text: "configure terminal", isCorrect: true },
        { id: "c", text: "config router", isCorrect: false },
        { id: "d", text: "interface global", isCorrect: false },
      ],
    },
    {
      id: uid(), type: "multiple-choice", points: 15,
      text: "Welche Schritte sind für SSH auf einem Cisco-Router erforderlich? (Mehrere Antworten)",
      explanation: "SSH benötigt: Hostname (≠ Default), Domain-Name, RSA-Schlüssel (>=1024 Bit empfohlen), lokaler User mit Passwort sowie 'transport input ssh' auf der VTY-Linie.",
      answers: [
        { id: "a", text: "ip domain-name setzen", isCorrect: true },
        { id: "b", text: "crypto key generate rsa", isCorrect: true },
        { id: "c", text: "transport input ssh auf VTY", isCorrect: true },
        { id: "d", text: "no ip http server", isCorrect: false },
        { id: "e", text: "Lokalen User mit Passwort anlegen", isCorrect: true },
      ],
    },
    {
      id: uid(), type: "single-choice", points: 10,
      text: "Wie speichert man die laufende Konfiguration dauerhaft?",
      explanation: "'copy running-config startup-config' (oder 'write memory') speichert die aktive Konfiguration ins NVRAM.",
      answers: [
        { id: "a", text: "save config", isCorrect: false },
        { id: "b", text: "write running", isCorrect: false },
        { id: "c", text: "copy running-config startup-config", isCorrect: true },
        { id: "d", text: "reload", isCorrect: false },
      ],
    },
    {
      id: uid(), type: "single-choice", points: 10,
      text: "Welcher Befehl zeigt den Status aller Layer-1/2-Interfaces inklusive IP-Adressen kompakt an?",
      explanation: "'show ip interface brief' (sh ip int br) listet alle Interfaces mit IP, Status (up/down) und Protocol.",
      answers: [
        { id: "a", text: "show interfaces", isCorrect: false },
        { id: "b", text: "show ip interface brief", isCorrect: true },
        { id: "c", text: "show running-config", isCorrect: false },
        { id: "d", text: "show ip route", isCorrect: false },
      ],
    },
    {
      id: uid(), type: "single-choice", points: 10,
      text: "Welcher IOS-Befehl deaktiviert die störende DNS-Auflösung von Tippfehlern?",
      explanation: "'no ip domain-lookup' verhindert, dass der Router fehlerhafte Befehle als Hostnamen interpretiert und DNS-Lookups startet.",
      answers: [
        { id: "a", text: "no dns lookup", isCorrect: false },
        { id: "b", text: "no ip domain-lookup", isCorrect: true },
        { id: "c", text: "ip dns disable", isCorrect: false },
        { id: "d", text: "no resolver", isCorrect: false },
      ],
    },
    {
      id: uid(), type: "single-choice", points: 10,
      text: "Welche Passwortform ist auf einem Cisco-Gerät am sichersten?",
      explanation: "'enable secret' (oder 'username … secret 9 …') verwendet starke Hashes (Type 9 = scrypt). 'enable password' speichert reversibel (Type 7 ist trivial entschlüsselbar).",
      answers: [
        { id: "a", text: "enable password", isCorrect: false },
        { id: "b", text: "service password-encryption (Type 7)", isCorrect: false },
        { id: "c", text: "enable secret (Type 9 / scrypt)", isCorrect: true },
        { id: "d", text: "Keine Passwörter setzen", isCorrect: false },
      ],
    },
    {
      id: uid(), type: "true-false", points: 5,
      text: "'shutdown' auf einem Interface ist Standardeinstellung bei Cisco-Routern.",
      explanation: "Wahr. Auf Routern sind Interfaces im Default 'shutdown'; auf Catalyst-Switches dagegen 'no shutdown'.",
      answers: [
        { id: "a", text: "Wahr", isCorrect: true },
        { id: "b", text: "Falsch", isCorrect: false },
      ],
    },
  ],
};

// ============================================================
// QUIZ 15: Device Management (CDP/LLDP/NTP/Syslog/SNMP)
// ============================================================
export const QUIZ_DEVICE_MGMT: Quiz = {
  id: "ccna-quiz-device-management",
  title: "CCNA: Device Management Protocols",
  description: "CDP, LLDP, NTP, Syslog und SNMPv3 im Cisco-Betrieb",
  passingScore: 70,
  shuffleQuestions: true,
  questions: [
    {
      id: uid(), type: "single-choice", points: 10,
      text: "Welches Discovery-Protokoll ist ein offener IEEE-Standard?",
      explanation: "LLDP (IEEE 802.1AB) ist herstellerunabhängig. CDP ist Cisco-proprietär.",
      answers: [
        { id: "a", text: "CDP", isCorrect: false },
        { id: "b", text: "LLDP", isCorrect: true },
        { id: "c", text: "VTP", isCorrect: false },
        { id: "d", text: "STP", isCorrect: false },
      ],
    },
    {
      id: uid(), type: "single-choice", points: 10,
      text: "Welcher Befehl zeigt detaillierte CDP-Nachbarinformationen inklusive IP-Adressen?",
      explanation: "'show cdp neighbors detail' (oder 'show cdp entry *') zeigt IPs und IOS-Version.",
      answers: [
        { id: "a", text: "show cdp", isCorrect: false },
        { id: "b", text: "show cdp neighbors", isCorrect: false },
        { id: "c", text: "show cdp neighbors detail", isCorrect: true },
        { id: "d", text: "show neighbors", isCorrect: false },
      ],
    },
    {
      id: uid(), type: "single-choice", points: 10,
      text: "Welcher UDP-Port wird von NTP verwendet?",
      explanation: "NTP nutzt UDP/123.",
      answers: [
        { id: "a", text: "UDP/53", isCorrect: false },
        { id: "b", text: "UDP/123", isCorrect: true },
        { id: "c", text: "UDP/161", isCorrect: false },
        { id: "d", text: "UDP/514", isCorrect: false },
      ],
    },
    {
      id: uid(), type: "single-choice", points: 10,
      text: "Welcher Syslog-Severity-Level ist am kritischsten?",
      explanation: "Severity 0 (Emergency) ist am höchsten, 7 (Debug) am niedrigsten.",
      answers: [
        { id: "a", text: "0 — Emergency", isCorrect: true },
        { id: "b", text: "3 — Error", isCorrect: false },
        { id: "c", text: "5 — Notification", isCorrect: false },
        { id: "d", text: "7 — Debug", isCorrect: false },
      ],
    },
    {
      id: uid(), type: "multiple-choice", points: 15,
      text: "Welche Eigenschaften treffen auf SNMPv3 zu? (Mehrere Antworten)",
      explanation: "SNMPv3 unterstützt Authentication (MD5/SHA), Verschlüsselung (DES/AES) und Integritätsprüfung. SNMPv1/v2c verwenden nur Community-Strings im Klartext.",
      answers: [
        { id: "a", text: "Authentication via MD5/SHA", isCorrect: true },
        { id: "b", text: "Verschlüsselung der Payload (priv)", isCorrect: true },
        { id: "c", text: "Community-String im Klartext (Standard)", isCorrect: false },
        { id: "d", text: "Integritätsprüfung", isCorrect: true },
      ],
    },
    {
      id: uid(), type: "single-choice", points: 10,
      text: "Welche Adresse ist die Layer-2-Multicast-MAC für CDP-Frames?",
      explanation: "CDP nutzt 0100.0CCC.CCCC als Destination-MAC.",
      answers: [
        { id: "a", text: "FFFF.FFFF.FFFF (Broadcast)", isCorrect: false },
        { id: "b", text: "0100.0CCC.CCCC", isCorrect: true },
        { id: "c", text: "0180.C200.0000", isCorrect: false },
        { id: "d", text: "0100.5E00.0001", isCorrect: false },
      ],
    },
    {
      id: uid(), type: "single-choice", points: 10,
      text: "Welcher Befehl konfiguriert einen Cisco-Router als NTP-Client zu Server 10.10.10.1?",
      explanation: "'ntp server 10.10.10.1' (im Global Config) macht den Router zum NTP-Client.",
      answers: [
        { id: "a", text: "clock source ntp 10.10.10.1", isCorrect: false },
        { id: "b", text: "ntp server 10.10.10.1", isCorrect: true },
        { id: "c", text: "ntp client 10.10.10.1", isCorrect: false },
        { id: "d", text: "set ntp 10.10.10.1", isCorrect: false },
      ],
    },
    {
      id: uid(), type: "single-choice", points: 10,
      text: "Wohin schickt 'logging host 192.168.1.10' Syslog-Meldungen?",
      explanation: "An den externen Syslog-Server 192.168.1.10 (UDP/514).",
      answers: [
        { id: "a", text: "An die Konsole", isCorrect: false },
        { id: "b", text: "In den lokalen Buffer", isCorrect: false },
        { id: "c", text: "An den externen Syslog-Server 192.168.1.10", isCorrect: true },
        { id: "d", text: "An alle aktiven VTY-Sessions", isCorrect: false },
      ],
    },
    // ── 5 neue Fragen (M-3 TFTP/FTP Gap-Plan, blueprint: "4.4") ──
    {
      id: uid(), type: "single-choice", points: 10, blueprint: "4.4",
      text: "Auf welchem Port und welchem Transport-Protokoll arbeitet TFTP?",
      explanation: "TFTP (Trivial File Transfer Protocol, RFC 1350) verwendet UDP Port 69. Es ist bewusst einfach gehalten: kein Auth, keine Verschlüsselung, keine Verzeichnisnavigation.",
      answers: [
        { id: "a", text: "TCP Port 21", isCorrect: false },
        { id: "b", text: "TCP Port 69", isCorrect: false },
        { id: "c", text: "UDP Port 69", isCorrect: true },
        { id: "d", text: "UDP Port 161", isCorrect: false },
      ],
    },
    {
      id: uid(), type: "single-choice", points: 10, blueprint: "4.4",
      text: "Welche zwei TCP-Ports nutzt FTP?",
      explanation: "FTP nutzt TCP Port 21 für den Kommandokanal (Control) und TCP Port 20 für den Datenkanal (aktiver Modus). Im passiven Modus nutzt der Server einen ephemeren Port >1023 statt Port 20.",
      answers: [
        { id: "a", text: "TCP 20 (Daten) und TCP 21 (Control)", isCorrect: true },
        { id: "b", text: "TCP 22 (SSH) und TCP 23 (Telnet)", isCorrect: false },
        { id: "c", text: "UDP 69 und TCP 21", isCorrect: false },
        { id: "d", text: "TCP 80 und TCP 443", isCorrect: false },
      ],
    },
    {
      id: uid(), type: "single-choice", points: 10, blueprint: "4.4",
      text: "Welcher Cisco IOS-Befehl kopiert die laufende Konfiguration auf einen TFTP-Server?",
      explanation: "'copy running-config tftp:' startet den interaktiven Dialog zur Eingabe der TFTP-Server-IP und des Dateinamens. Alternativ vollständig: 'copy running-config tftp://192.168.1.100/backup.cfg'.",
      answers: [
        { id: "a", text: "backup running-config tftp:", isCorrect: false },
        { id: "b", text: "save running-config tftp:", isCorrect: false },
        { id: "c", text: "copy running-config tftp:", isCorrect: true },
        { id: "d", text: "write tftp:", isCorrect: false },
      ],
    },
    {
      id: uid(), type: "single-choice", points: 10, blueprint: "4.4",
      text: "Was ist der Vorteil von SCP gegenüber FTP und TFTP für Cisco-Geräteverwaltung?",
      explanation: "SCP (Secure Copy Protocol) basiert auf SSH und verschlüsselt die gesamte Übertragung inkl. Authentifizierung. FTP überträgt Passwörter im Klartext, TFTP hat gar keine Authentifizierung.",
      answers: [
        { id: "a", text: "SCP ist schneller als TFTP bei großen Dateien", isCorrect: false },
        { id: "b", text: "SCP verschlüsselt die Übertragung und Authentifizierung via SSH", isCorrect: true },
        { id: "c", text: "SCP verwendet UDP, was weniger Overhead hat", isCorrect: false },
        { id: "d", text: "SCP benötigt keinen separaten Server — es ist im IOS integriert", isCorrect: false },
      ],
    },
    {
      id: uid(), type: "true-false", points: 5, blueprint: "4.4",
      text: "FTP überträgt Benutzername und Passwort verschlüsselt.",
      explanation: "Falsch. Standard-FTP überträgt Credentials im Klartext (TCP Port 21). Für verschlüsselte Übertragung sind FTPS (FTP over TLS) oder SFTP (SSH-basiert) zu verwenden.",
      answers: [
        { id: "a", text: "Wahr", isCorrect: false },
        { id: "b", text: "Falsch", isCorrect: true },
      ],
    },
  ],
};

// ============================================================
// QUIZ 16: First Hop Redundancy (HSRP/VRRP/GLBP)
// ============================================================
export const QUIZ_FHRP: Quiz = {
  id: "ccna-quiz-fhrp",
  title: "CCNA: FHRP – HSRP / VRRP / GLBP",
  description: "Default-Gateway-Redundanz mit virtueller IP/MAC, Priorities, Preemption und Object Tracking",
  passingScore: 70,
  shuffleQuestions: true,
  questions: [
    {
      id: uid(), type: "single-choice", points: 10,
      text: "Welches Problem löst FHRP?",
      explanation: "FHRP stellt eine virtuelle Default-Gateway-IP/MAC bereit, sodass Hosts beim Ausfall des aktiven Routers nicht umkonfiguriert werden müssen.",
      answers: [
        { id: "a", text: "Layer-2-Loops in redundanten Topologien", isCorrect: false },
        { id: "b", text: "Single Point of Failure des Default Gateways", isCorrect: true },
        { id: "c", text: "Routing-Schleifen zwischen Areas", isCorrect: false },
        { id: "d", text: "DHCP-Pool-Erschöpfung", isCorrect: false },
      ],
    },
    {
      id: uid(), type: "single-choice", points: 10,
      text: "Welche virtuelle MAC-Adresse nutzt HSRPv2 für Group 10?",
      explanation: "HSRPv2: 0000.0C9F.F000–0FFF (Group hex angehängt). Group 10 = 0000.0C9F.F00A.",
      answers: [
        { id: "a", text: "0000.0C07.AC0A", isCorrect: false },
        { id: "b", text: "0000.0C9F.F00A", isCorrect: true },
        { id: "c", text: "0000.5E00.010A", isCorrect: false },
        { id: "d", text: "FFFF.FFFF.FFFF", isCorrect: false },
      ],
    },
    {
      id: uid(), type: "single-choice", points: 10,
      text: "Welcher HSRP-Router ist der aktive Router?",
      explanation: "Der Router mit der höchsten HSRP-Priority (Default 100) wird Active. Bei gleicher Priority entscheidet die höchste IP.",
      answers: [
        { id: "a", text: "Der mit der niedrigsten Priority", isCorrect: false },
        { id: "b", text: "Der mit der höchsten Priority (Default 100)", isCorrect: true },
        { id: "c", text: "Der mit der niedrigsten IP-Adresse", isCorrect: false },
        { id: "d", text: "Immer der erste, der online ist", isCorrect: false },
      ],
    },
    {
      id: uid(), type: "true-false", points: 5,
      text: "VRRP ist ein offener IEEE-Standard, HSRP ist Cisco-proprietär.",
      explanation: "Wahr. VRRP (RFC 5798) ist offen, HSRP ist Cisco-spezifisch.",
      answers: [
        { id: "a", text: "Wahr", isCorrect: true },
        { id: "b", text: "Falsch", isCorrect: false },
      ],
    },
    {
      id: uid(), type: "single-choice", points: 10,
      text: "Welches FHRP unterstützt Lastverteilung über mehrere aktive Router pro Gruppe?",
      explanation: "GLBP (Cisco) verteilt Anfragen über mehrere AVF-Router. HSRP/VRRP haben nur einen aktiven Router pro Gruppe.",
      answers: [
        { id: "a", text: "HSRP", isCorrect: false },
        { id: "b", text: "VRRP", isCorrect: false },
        { id: "c", text: "GLBP", isCorrect: true },
        { id: "d", text: "Keiner", isCorrect: false },
      ],
    },
    {
      id: uid(), type: "single-choice", points: 10,
      text: "Was bewirkt HSRP-Preemption?",
      explanation: "Mit Preemption übernimmt ein Router mit höherer Priority sofort die Active-Rolle, sobald er online kommt.",
      answers: [
        { id: "a", text: "Verhindert, dass Router je die Active-Rolle wechseln", isCorrect: false },
        { id: "b", text: "Erlaubt höher priorisiertem Router, sofort Active zu werden", isCorrect: true },
        { id: "c", text: "Reduziert die Hello-Zeit auf 1 Sekunde", isCorrect: false },
        { id: "d", text: "Aktiviert Object Tracking", isCorrect: false },
      ],
    },
    {
      id: uid(), type: "single-choice", points: 10,
      text: "Was macht 'standby 1 track 1 decrement 30'?",
      explanation: "Wenn Object 1 (z.B. Uplink-Interface) ausfällt, wird die HSRP-Priority um 30 reduziert — der Standby-Router kann übernehmen.",
      answers: [
        { id: "a", text: "Erhöht Priority um 30 bei Uplink-Failure", isCorrect: false },
        { id: "b", text: "Senkt Priority um 30 wenn Object 1 ausfällt", isCorrect: true },
        { id: "c", text: "Setzt die Priority hart auf 30", isCorrect: false },
        { id: "d", text: "Verzögert Failover um 30 Sekunden", isCorrect: false },
      ],
    },
    {
      id: uid(), type: "single-choice", points: 10,
      text: "Welche Multicast-IP nutzt VRRPv2 für Hello-Pakete?",
      explanation: "VRRPv2 sendet Advertisements an 224.0.0.18 (HSRPv1: 224.0.0.2; HSRPv2: 224.0.0.102).",
      answers: [
        { id: "a", text: "224.0.0.2", isCorrect: false },
        { id: "b", text: "224.0.0.18", isCorrect: true },
        { id: "c", text: "224.0.0.102", isCorrect: false },
        { id: "d", text: "239.255.255.250", isCorrect: false },
      ],
    },
  ],
};

// ============================================================
// QUIZ 17: WAN & VPN
// ============================================================
export const QUIZ_WAN_VPN: Quiz = {
  id: "ccna-quiz-wan-vpn",
  title: "CCNA: WAN & VPN",
  description: "WAN-Technologien, IPsec, GRE/DMVPN und Cisco SD-WAN",
  passingScore: 70,
  shuffleQuestions: true,
  questions: [
    {
      id: uid(), type: "multiple-choice", points: 15,
      text: "Welche Aussagen treffen auf MPLS zu? (Mehrere Antworten)",
      explanation: "MPLS arbeitet zwischen Layer 2 und 3 ('Layer 2.5'), verwendet Label statt IP-Lookup im Provider-Backbone und unterstützt Traffic Engineering und L3-VPNs.",
      answers: [
        { id: "a", text: "Arbeitet zwischen Layer 2 und 3", isCorrect: true },
        { id: "b", text: "Verwendet Labels für Forwarding", isCorrect: true },
        { id: "c", text: "Ist ein Layer-1-Übertragungsstandard", isCorrect: false },
        { id: "d", text: "Unterstützt L3-VPN-Dienste", isCorrect: true },
      ],
    },
    {
      id: uid(), type: "single-choice", points: 10,
      text: "Welche IPsec-Komponente bietet Vertraulichkeit (Verschlüsselung)?",
      explanation: "ESP (Encapsulating Security Payload) verschlüsselt Daten. AH liefert nur Authentizität/Integrität, keine Verschlüsselung.",
      answers: [
        { id: "a", text: "AH (Authentication Header)", isCorrect: false },
        { id: "b", text: "ESP (Encapsulating Security Payload)", isCorrect: true },
        { id: "c", text: "IKE Phase 1", isCorrect: false },
        { id: "d", text: "ISAKMP", isCorrect: false },
      ],
    },
    {
      id: uid(), type: "single-choice", points: 10,
      text: "Welche Funktion hat IKE Phase 1?",
      explanation: "IKE Phase 1 etabliert einen sicheren Management-Tunnel (ISAKMP SA) zwischen den Peers. Phase 2 verhandelt dann die IPsec-SAs für Nutzdaten.",
      answers: [
        { id: "a", text: "Verschlüsselt Nutzdaten", isCorrect: false },
        { id: "b", text: "Etabliert ISAKMP SA (sicherer Management-Kanal)", isCorrect: true },
        { id: "c", text: "Vergibt IP-Adressen an VPN-Clients", isCorrect: false },
        { id: "d", text: "Macht Routing über den Tunnel", isCorrect: false },
      ],
    },
    {
      id: uid(), type: "true-false", points: 5,
      text: "GRE-Tunnel verschlüsseln den Datenverkehr standardmäßig.",
      explanation: "Falsch. GRE kapselt nur (Multicast/Routing-fähig), bietet aber keine Verschlüsselung. Schutz: GRE über IPsec.",
      answers: [
        { id: "a", text: "Wahr", isCorrect: false },
        { id: "b", text: "Falsch", isCorrect: true },
      ],
    },
    {
      id: uid(), type: "single-choice", points: 10,
      text: "Welche Hauptkomponente ist im Cisco SD-WAN für die zentrale Konfigurationsverwaltung verantwortlich?",
      explanation: "vManage ist das zentrale Management/Orchestration-Tool. vSmart steuert das Control Plane (OMP), vBond authentifiziert Endgeräte, vEdge/cEdge sind die Edge-Router.",
      answers: [
        { id: "a", text: "vSmart", isCorrect: false },
        { id: "b", text: "vBond", isCorrect: false },
        { id: "c", text: "vManage", isCorrect: true },
        { id: "d", text: "vEdge", isCorrect: false },
      ],
    },
    {
      id: uid(), type: "single-choice", points: 10,
      text: "Was ist DMVPN?",
      explanation: "DMVPN (Dynamic Multipoint VPN) baut on-demand verschlüsselte mGRE/IPsec-Tunnel zwischen Spokes auf. Konfiguration nur am Hub erforderlich (Zero-Touch für neue Spokes).",
      answers: [
        { id: "a", text: "Layer-2-VPN über MPLS", isCorrect: false },
        { id: "b", text: "Dynamische Multipoint-VPN-Lösung mit mGRE/IPsec/NHRP", isCorrect: true },
        { id: "c", text: "DSL-Multiplexing-Verfahren", isCorrect: false },
        { id: "d", text: "WLAN-Roaming-Protokoll", isCorrect: false },
      ],
    },
    {
      id: uid(), type: "multiple-choice", points: 15,
      text: "Welche Vorteile bietet SD-WAN gegenüber klassischem MPLS-WAN? (Mehrere Antworten)",
      explanation: "SD-WAN: zentrales Policy-Management, dynamische Pfadauswahl pro Anwendung, Direct Internet Breakout, transportunabhängig (MPLS/Internet/LTE).",
      answers: [
        { id: "a", text: "Zentralisiertes Policy-Management", isCorrect: true },
        { id: "b", text: "Application-aware Routing", isCorrect: true },
        { id: "c", text: "Direct Internet Breakout möglich", isCorrect: true },
        { id: "d", text: "Erfordert zwingend MPLS als Transport", isCorrect: false },
      ],
    },
    {
      id: uid(), type: "single-choice", points: 10,
      text: "Welcher VPN-Modus verschlüsselt das gesamte ursprüngliche IP-Paket inkl. Header?",
      explanation: "Tunnel-Mode kapselt das komplette Original-Paket in ein neues IP-Paket. Transport-Mode erhält den Original-IP-Header (Host-zu-Host).",
      answers: [
        { id: "a", text: "Transport Mode", isCorrect: false },
        { id: "b", text: "Tunnel Mode", isCorrect: true },
        { id: "c", text: "Aggressive Mode", isCorrect: false },
        { id: "d", text: "Main Mode", isCorrect: false },
      ],
    },
  ],
};

// ============================================================
// QUIZ 18: SDN, DNA Center & Cloud
// ============================================================
export const QUIZ_SDN: Quiz = {
  id: "ccna-quiz-sdn",
  title: "CCNA: SDN, Controller-Based Networking & Cloud",
  description: "Control/Data/Mgmt Plane, SDN-Architekturen, Cisco DNA Center, SD-Access und Cloud-Service-Modelle",
  passingScore: 70,
  shuffleQuestions: true,
  questions: [
    {
      id: uid(), type: "single-choice", points: 10,
      text: "Welche Plane wird in einer SDN-Architektur am stärksten zentralisiert?",
      explanation: "Die Control Plane wird in einem zentralen Controller zusammengeführt; die Data Plane bleibt verteilt auf den Forwarding-Geräten.",
      answers: [
        { id: "a", text: "Data Plane", isCorrect: false },
        { id: "b", text: "Control Plane", isCorrect: true },
        { id: "c", text: "Application Plane", isCorrect: false },
        { id: "d", text: "Power Plane", isCorrect: false },
      ],
    },
    {
      id: uid(), type: "single-choice", points: 10,
      text: "Welche Schnittstelle eines SDN-Controllers wird Richtung der Netzwerkgeräte (Switches/Router) verwendet?",
      explanation: "Southbound API (z.B. OpenFlow, NETCONF, gRPC) spricht mit den Geräten. Northbound API spricht mit Anwendungen.",
      answers: [
        { id: "a", text: "Northbound API", isCorrect: false },
        { id: "b", text: "Southbound API", isCorrect: true },
        { id: "c", text: "Eastbound API", isCorrect: false },
        { id: "d", text: "Westbound API", isCorrect: false },
      ],
    },
    {
      id: uid(), type: "single-choice", points: 10,
      text: "Was ist Cisco DNA Center?",
      explanation: "DNA Center ist Ciscos Intent-Based-Networking-Controller für Campus-Netze (Design, Provisioning, Assurance, SD-Access).",
      answers: [
        { id: "a", text: "Ein Cloud-Backup-Dienst", isCorrect: false },
        { id: "b", text: "Cisco Intent-Based Networking Controller für Campus", isCorrect: true },
        { id: "c", text: "Ersatz für vManage in SD-WAN", isCorrect: false },
        { id: "d", text: "Ein Hypervisor", isCorrect: false },
      ],
    },
    {
      id: uid(), type: "single-choice", points: 10,
      text: "Welches Cloud-Service-Modell stellt vorgefertigte Anwendungen (z.B. Office 365) bereit?",
      explanation: "SaaS = Software as a Service (komplette Anwendung). PaaS = Plattform für Eigenentwicklung. IaaS = virtuelle Infrastruktur.",
      answers: [
        { id: "a", text: "IaaS", isCorrect: false },
        { id: "b", text: "PaaS", isCorrect: false },
        { id: "c", text: "SaaS", isCorrect: true },
        { id: "d", text: "FaaS", isCorrect: false },
      ],
    },
    {
      id: uid(), type: "multiple-choice", points: 15,
      text: "Welche Bestandteile gehören zu Cisco SD-Access? (Mehrere Antworten)",
      explanation: "SD-Access kombiniert: Underlay (IP-Routing IS-IS), Overlay (VXLAN), LISP für Endpoint-Tracking, Cisco TrustSec/SGT für Mikrosegmentierung — verwaltet via DNA Center.",
      answers: [
        { id: "a", text: "VXLAN als Overlay", isCorrect: true },
        { id: "b", text: "LISP als Control Plane", isCorrect: true },
        { id: "c", text: "Cisco TrustSec / Security Group Tags", isCorrect: true },
        { id: "d", text: "MPLS als Pflicht-Backbone", isCorrect: false },
      ],
    },
    {
      id: uid(), type: "single-choice", points: 10,
      text: "Was ist der Hauptvorteil eines Intent-Based-Networking-Ansatzes?",
      explanation: "Admins definieren das gewünschte Ergebnis ('Intent'); der Controller übersetzt es in Konfigurationen und verifiziert kontinuierlich (Assurance).",
      answers: [
        { id: "a", text: "CLI-Befehle pro Gerät einzeln tippen", isCorrect: false },
        { id: "b", text: "Deklarative Beschreibung des Ziels — Controller setzt um und überwacht", isCorrect: true },
        { id: "c", text: "Manuelle Konfiguration bleibt Pflicht", isCorrect: false },
        { id: "d", text: "Hardware-spezifische Skripte bevorzugen", isCorrect: false },
      ],
    },
    {
      id: uid(), type: "true-false", points: 5,
      text: "OpenFlow ist ein Beispiel für eine Southbound-Schnittstelle.",
      explanation: "Wahr. OpenFlow programmiert die Forwarding-Tabellen der Switches direkt vom Controller aus.",
      answers: [
        { id: "a", text: "Wahr", isCorrect: true },
        { id: "b", text: "Falsch", isCorrect: false },
      ],
    },
    {
      id: uid(), type: "single-choice", points: 10,
      text: "Welches Cloud-Deployment-Modell kombiniert Public und Private Cloud?",
      explanation: "Hybrid Cloud verbindet beide Modelle, oft via Site-to-Site-VPN oder Direct Connect/ExpressRoute.",
      answers: [
        { id: "a", text: "Private Cloud", isCorrect: false },
        { id: "b", text: "Hybrid Cloud", isCorrect: true },
        { id: "c", text: "Community Cloud", isCorrect: false },
        { id: "d", text: "Edge Cloud", isCorrect: false },
      ],
    },
  ],
};

// ============================================================
// QUIZ 18b: Virtualization & Cloud (Blueprint 1.2)
// ============================================================
export const QUIZ_VIRTUALIZATION: Quiz = {
  id: "ccna-quiz-virtualization",
  title: "CCNA: Virtualisierung & Cloud",
  description: "Hypervisoren Typ 1/2, VMs vs. Container, NFV, vSwitch und Cloud-Servicemodelle",
  passingScore: 70,
  shuffleQuestions: true,
  questions: [
    {
      id: uid(), type: "single-choice", points: 10, blueprint: "1.2",
      text: "Was ist der Hauptunterschied zwischen einem Typ-1- und einem Typ-2-Hypervisor?",
      explanation: "Typ-1 (Bare-Metal) läuft direkt auf der Hardware ohne Host-OS, z. B. VMware ESXi. Typ-2 läuft als Anwendung auf einem Host-OS, z. B. VirtualBox. Typ-1 ist effizienter und wird in Rechenzentren bevorzugt.",
      answers: [
        { id: "a", text: "Typ-1 läuft auf einem Host-OS, Typ-2 direkt auf Hardware", isCorrect: false },
        { id: "b", text: "Typ-1 läuft direkt auf Hardware (Bare-Metal), Typ-2 als App auf einem Host-OS", isCorrect: true },
        { id: "c", text: "Typ-1 unterstützt nur Windows-VMs, Typ-2 nur Linux-VMs", isCorrect: false },
        { id: "d", text: "Typ-2 benötigt keine CPU-Virtualisierungsunterstützung", isCorrect: false },
      ],
    },
    {
      id: uid(), type: "single-choice", points: 10, blueprint: "1.2",
      text: "Welcher Vorteil zeichnet Container im Vergleich zu VMs aus?",
      explanation: "Container teilen den Kernel des Host-OS und benötigen kein vollständiges OS-Image. Dadurch starten sie in Sekunden und benötigen nur MBs statt GBs.",
      answers: [
        { id: "a", text: "Stärkere Isolation durch eigenen Kernel", isCorrect: false },
        { id: "b", text: "Geringerer Overhead und schnellerer Start durch Teilen des Host-Kernels", isCorrect: true },
        { id: "c", text: "Bessere Unterstützung für GUI-Anwendungen", isCorrect: false },
        { id: "d", text: "Container können ohne Host-Betriebssystem laufen", isCorrect: false },
      ],
    },
    {
      id: uid(), type: "single-choice", points: 10, blueprint: "1.2",
      text: "Was beschreibt NFV (Network Functions Virtualization)?",
      explanation: "NFV ersetzt dedizierte Netzwerk-Hardware (Firewall, Router, Load Balancer) durch Software-Instanzen (VNFs), die auf Standard-x86-Servern laufen.",
      answers: [
        { id: "a", text: "Ein Protokoll zur Verwaltung von physischen Netzwerkgeräten per REST API", isCorrect: false },
        { id: "b", text: "Die Verlagerung von Netzwerkfunktionen (Firewall, Router) von dedizierter HW auf Standard-Server", isCorrect: true },
        { id: "c", text: "Ein Cloud-Dienst von Cisco für SD-WAN", isCorrect: false },
        { id: "d", text: "Ein Hypervisor-Typ speziell für Netzwerkgeräte", isCorrect: false },
      ],
    },
    {
      id: uid(), type: "single-choice", points: 10, blueprint: "1.2",
      text: "Ein Unternehmen möchte eigene Server nutzen, aber auch bei Lastspitzen auf Public-Cloud-Ressourcen zurückgreifen. Welches Deployment-Modell ist das?",
      explanation: "Hybrid Cloud kombiniert On-Premises (Private Cloud) und Public Cloud. Die Verbindung erfolgt meist über Site-to-Site-VPN oder dedizierte Leitungen (AWS Direct Connect, Azure ExpressRoute).",
      answers: [
        { id: "a", text: "Private Cloud", isCorrect: false },
        { id: "b", text: "Community Cloud", isCorrect: false },
        { id: "c", text: "Public Cloud", isCorrect: false },
        { id: "d", text: "Hybrid Cloud", isCorrect: true },
      ],
    },
    {
      id: uid(), type: "single-choice", points: 10, blueprint: "1.2",
      text: "Welches Cloud-Service-Modell überlässt dem Kunden nur die Anwendung selbst — der Anbieter verwaltet Hardware, OS, Middleware und Runtime?",
      explanation: "PaaS (Platform as a Service) stellt eine Laufzeitumgebung bereit. Der Kunde deployt nur seine Anwendung und verwaltet die Daten — alles darunter (OS, Middleware, Runtime) übernimmt der Anbieter.",
      answers: [
        { id: "a", text: "IaaS", isCorrect: false },
        { id: "b", text: "PaaS", isCorrect: true },
        { id: "c", text: "SaaS", isCorrect: false },
        { id: "d", text: "FaaS (Function as a Service)", isCorrect: false },
      ],
    },
    {
      id: uid(), type: "true-false", points: 5, blueprint: "1.2",
      text: "VMware vSwitch ist ein physischer Switch, der in ESXi-Hosts eingebaut ist.",
      explanation: "Falsch. VMware vSwitch ist ein rein softwarebasierter virtueller Switch innerhalb des ESXi-Hypervisors. Er verbindet VMs intern und mit den physischen NICs — es gibt keine dedizierte Hardware-Komponente.",
      answers: [
        { id: "a", text: "Wahr", isCorrect: false },
        { id: "b", text: "Falsch", isCorrect: true },
      ],
    },
    {
      id: uid(), type: "single-choice", points: 10, blueprint: "1.2",
      text: "Was ist Cisco NFVIS?",
      explanation: "NFVIS (Enterprise NFV Infrastructure Software) ist Ciscos Plattform, die VNFs (virtuelle Netzwerkfunktionen wie vRouter, vFirewall) auf einem einzigen Branch-Router (z. B. ISR 4000) hostet und über REST/DNA-Center verwaltet.",
      answers: [
        { id: "a", text: "Ein SDN-Controller für Cisco Catalyst-Switches", isCorrect: false },
        { id: "b", text: "Ein Cisco-Hypervisor zum Hosten von VNFs auf Branch-Routern", isCorrect: true },
        { id: "c", text: "Ein Monitoring-Tool für virtuelle Maschinen in der Public Cloud", isCorrect: false },
        { id: "d", text: "Eine virtuelle Cisco ASA Firewall-Instanz", isCorrect: false },
      ],
    },
    {
      id: uid(), type: "single-choice", points: 10, blueprint: "1.2",
      text: "Bei IaaS (Infrastructure as a Service) — welche Komponente verwaltet der Kunde selbst?",
      explanation: "Bei IaaS stellt der Anbieter Hardware, Hypervisor und Netzwerk bereit. Der Kunde verwaltet ab dem Betriebssystem aufwärts: OS, Middleware, Laufzeit, Anwendungen und Daten.",
      answers: [
        { id: "a", text: "Nur die Daten, alles andere übernimmt der Anbieter", isCorrect: false },
        { id: "b", text: "Hardware und Hypervisor", isCorrect: false },
        { id: "c", text: "Betriebssystem, Middleware, Laufzeit, Anwendungen und Daten", isCorrect: true },
        { id: "d", text: "Nur die Anwendung und Daten", isCorrect: false },
      ],
    },
  ],
};

// ============================================================
// QUIZ 19: Programmability & Automation
// ============================================================
export const QUIZ_AUTOMATION: Quiz = {
  id: "ccna-quiz-automation",
  title: "CCNA: Programmability & Automation",
  description: "REST APIs, JSON/YAML, Ansible, Terraform und GitOps-Grundlagen",
  passingScore: 70,
  shuffleQuestions: true,
  questions: [
    {
      id: uid(), type: "single-choice", points: 10,
      text: "Welche HTTP-Methode wird in REST üblicherweise zum Anlegen einer Ressource verwendet?",
      explanation: "POST erzeugt eine neue Ressource. GET liest, PUT ersetzt, DELETE löscht.",
      answers: [
        { id: "a", text: "GET", isCorrect: false },
        { id: "b", text: "POST", isCorrect: true },
        { id: "c", text: "DELETE", isCorrect: false },
        { id: "d", text: "OPTIONS", isCorrect: false },
      ],
    },
    {
      id: uid(), type: "single-choice", points: 10,
      text: "Welcher HTTP-Statuscode bedeutet 'Erfolg, Ressource erstellt'?",
      explanation: "201 Created. 200 = OK, 204 = No Content, 401 = Unauthorized.",
      answers: [
        { id: "a", text: "200", isCorrect: false },
        { id: "b", text: "201", isCorrect: true },
        { id: "c", text: "401", isCorrect: false },
        { id: "d", text: "500", isCorrect: false },
      ],
    },
    {
      id: uid(), type: "multiple-choice", points: 15,
      text: "Welche Eigenschaften treffen auf Ansible zu? (Mehrere Antworten)",
      explanation: "Ansible ist agentenlos, nutzt SSH/NETCONF, beschreibt Playbooks in YAML und ist idempotent.",
      answers: [
        { id: "a", text: "Agentenlos (kein Client auf Zielgeräten nötig)", isCorrect: true },
        { id: "b", text: "Playbooks in YAML", isCorrect: true },
        { id: "c", text: "Idempotente Tasks", isCorrect: true },
        { id: "d", text: "Erfordert zwingend Windows-Zielsysteme", isCorrect: false },
      ],
    },
    {
      id: uid(), type: "single-choice", points: 10,
      text: "Welches Format ist Whitespace-sensitiv und nutzt Einrückung als Strukturierung?",
      explanation: "YAML basiert auf Einrückung (keine Klammern). JSON nutzt {} und [].",
      answers: [
        { id: "a", text: "JSON", isCorrect: false },
        { id: "b", text: "XML", isCorrect: false },
        { id: "c", text: "YAML", isCorrect: true },
        { id: "d", text: "INI", isCorrect: false },
      ],
    },
    {
      id: uid(), type: "true-false", points: 5,
      text: "Terraform verwendet eine deklarative Sprache (HCL) zur Beschreibung der gewünschten Infrastruktur.",
      explanation: "Wahr. HCL ist deklarativ; Terraform berechnet die Differenz zum aktuellen State und führt notwendige Änderungen aus.",
      answers: [
        { id: "a", text: "Wahr", isCorrect: true },
        { id: "b", text: "Falsch", isCorrect: false },
      ],
    },
    {
      id: uid(), type: "single-choice", points: 10,
      text: "Welche Datenstruktur entspricht in JSON einem Schlüssel-Wert-Mapping?",
      explanation: "Ein JSON-Objekt {} ist ein Set von key:value-Paaren; ein Array [] ist eine geordnete Liste.",
      answers: [
        { id: "a", text: "Array []", isCorrect: false },
        { id: "b", text: "Objekt {}", isCorrect: true },
        { id: "c", text: "String", isCorrect: false },
        { id: "d", text: "Boolean", isCorrect: false },
      ],
    },
    {
      id: uid(), type: "single-choice", points: 10,
      text: "Was ist 'Idempotenz' im Kontext von Konfigurationsmanagement?",
      explanation: "Mehrfache Ausführung desselben Tasks führt zum gleichen Ergebnis — keine ungewollten Seiteneffekte bei Wiederholung.",
      answers: [
        { id: "a", text: "Tasks laufen nur einmal pro Tag", isCorrect: false },
        { id: "b", text: "Wiederholte Ausführung erzeugt das gleiche Endergebnis", isCorrect: true },
        { id: "c", text: "Tasks werden parallel ausgeführt", isCorrect: false },
        { id: "d", text: "Konfiguration wird automatisch verschlüsselt", isCorrect: false },
      ],
    },
    {
      id: uid(), type: "single-choice", points: 10,
      text: "Welche Schnittstelle wird häufig auf modernen Cisco-Geräten für strukturierte Konfiguration genutzt (statt CLI-Parsing)?",
      explanation: "NETCONF (RFC 6241) mit YANG-Datenmodellen liefert strukturierte XML/JSON-Konfiguration. RESTCONF ist die HTTP/REST-Variante.",
      answers: [
        { id: "a", text: "Telnet-Skript-Parsing", isCorrect: false },
        { id: "b", text: "NETCONF/YANG bzw. RESTCONF", isCorrect: true },
        { id: "c", text: "TFTP-Push", isCorrect: false },
        { id: "d", text: "FTP-Konfigurationssync", isCorrect: false },
      ],
    },
    // ── 4 neue Fragen (T-6/R-4 NETCONF/YANG Gap-Plan) ───────────
    {
      id: uid(), type: "single-choice", points: 10, blueprint: "6.3",
      text: "Auf welchem TCP-Port kommuniziert NETCONF standardmäßig?",
      explanation: "NETCONF verwendet SSH als Transport auf TCP-Port 830. RESTCONF nutzt HTTPS (TCP 443). Nicht verwechseln mit SNMP (UDP 161).",
      answers: [
        { id: "a", text: "UDP 161", isCorrect: false },
        { id: "b", text: "TCP 443", isCorrect: false },
        { id: "c", text: "TCP 830", isCorrect: true },
        { id: "d", text: "UDP 514", isCorrect: false },
      ],
    },
    {
      id: uid(), type: "single-choice", points: 10, blueprint: "6.3",
      text: "Was ist YANG im Kontext von NETCONF?",
      explanation: "YANG (Yet Another Next Generation, RFC 7950) ist eine Datenmodellierungssprache. Es definiert die Struktur und Typen von Konfigurationsdaten, die über NETCONF übertragen werden — ähnlich einem Schema für die Geräteconfig.",
      answers: [
        { id: "a", text: "Eine Skriptsprache wie Python zum Konfigurieren von Geräten", isCorrect: false },
        { id: "b", text: "Eine Datenmodellierungssprache für NETCONF/RESTCONF-Datenstrukturen", isCorrect: true },
        { id: "c", text: "Ein Ersatz für SNMP MIBs zur WLAN-Verwaltung", isCorrect: false },
        { id: "d", text: "Ein Cisco-proprietäres Format für Konfigurationsdateien", isCorrect: false },
      ],
    },
    {
      id: uid(), type: "single-choice", points: 10, blueprint: "6.3",
      text: "Was ist der Unterschied zwischen NETCONF und RESTCONF?",
      explanation: "NETCONF: SSH (TCP 830), XML, vollständige Transaktionskontrolle mit Candidate-Datastore. RESTCONF: HTTPS (RFC 8040), JSON oder XML, vereinfachter REST-ähnlicher Zugriff. Beide verwenden YANG-Datenmodelle.",
      answers: [
        { id: "a", text: "NETCONF ist neuer als RESTCONF und ersetzt es", isCorrect: false },
        { id: "b", text: "NETCONF nutzt SSH/XML, RESTCONF nutzt HTTPS/JSON — beide mit YANG", isCorrect: true },
        { id: "c", text: "RESTCONF kann keine Konfiguration ändern, nur lesen", isCorrect: false },
        { id: "d", text: "NETCONF ist nur für Cisco-Geräte, RESTCONF ist herstellerneutral", isCorrect: false },
      ],
    },
    {
      id: uid(), type: "single-choice", points: 10, blueprint: "6.3",
      text: "Welches Cisco IOS-Kommando aktiviert NETCONF auf einem Cisco-Gerät?",
      explanation: "'netconf-yang' aktiviert den NETCONF-Agent auf Cisco IOS-XE. Außerdem muss AAA konfiguriert sein. Anschließend sind YANG-Modell-basierte Konfigurationen über TCP 830 möglich.",
      answers: [
        { id: "a", text: "ip netconf enable", isCorrect: false },
        { id: "b", text: "netconf-yang", isCorrect: true },
        { id: "c", text: "service netconf activate", isCorrect: false },
        { id: "d", text: "yang-agent start", isCorrect: false },
      ],
    },
  ],
};

// ============================================================
// QUIZ 20: Troubleshooting & Diagnose
// ============================================================
export const QUIZ_TROUBLESHOOTING: Quiz = {
  id: "ccna-quiz-troubleshooting",
  title: "CCNA: Troubleshooting & Diagnose",
  description: "Methodik, Ping/Traceroute, Interface-Counter, err-disabled Recovery",
  passingScore: 70,
  shuffleQuestions: true,
  questions: [
    {
      id: uid(), type: "single-choice", points: 10,
      text: "Welcher Troubleshooting-Ansatz beginnt bei der physischen Schicht und arbeitet sich nach oben durch das OSI-Modell?",
      explanation: "Bottom-Up startet bei Layer 1. Top-Down beginnt bei der Anwendung. Divide-and-Conquer in der Mitte.",
      answers: [
        { id: "a", text: "Top-Down", isCorrect: false },
        { id: "b", text: "Bottom-Up", isCorrect: true },
        { id: "c", text: "Divide-and-Conquer", isCorrect: false },
        { id: "d", text: "Follow-the-Path", isCorrect: false },
      ],
    },
    {
      id: uid(), type: "single-choice", points: 10,
      text: "Was deutet 'line protocol is down' bei 'show interfaces' auf?",
      explanation: "Layer 1 ist up (Kabel/Träger ok), aber Layer 2 ist down — typisch bei Encapsulation-Mismatch, Keepalive-Fehlern oder Clock-Problemen auf seriellen Strecken.",
      answers: [
        { id: "a", text: "Kabel ist nicht angeschlossen", isCorrect: false },
        { id: "b", text: "Layer 2 down (z.B. Encap-Mismatch, Keepalive-Fehler)", isCorrect: true },
        { id: "c", text: "Interface ist administrativ deaktiviert", isCorrect: false },
        { id: "d", text: "Routing-Protokoll konvergiert", isCorrect: false },
      ],
    },
    {
      id: uid(), type: "single-choice", points: 10,
      text: "Welcher 'show interface'-Counter steigt bei einem Duplex-Mismatch typischerweise?",
      explanation: "'late collisions' sind ein klassisches Symptom für Duplex-Mismatch (eine Seite Half, andere Full).",
      answers: [
        { id: "a", text: "input errors / CRC", isCorrect: false },
        { id: "b", text: "late collisions", isCorrect: true },
        { id: "c", text: "no buffer", isCorrect: false },
        { id: "d", text: "ignored", isCorrect: false },
      ],
    },
    {
      id: uid(), type: "single-choice", points: 10,
      text: "Wie setzt man einen err-disabled Switch-Port wieder in Betrieb (manuell)?",
      explanation: "'shutdown' gefolgt von 'no shutdown' auf dem Port. Alternativ 'errdisable recovery cause psecure-violation' für automatische Wiederherstellung.",
      answers: [
        { id: "a", text: "Nur Switch neu starten", isCorrect: false },
        { id: "b", text: "shutdown / no shutdown am Port", isCorrect: true },
        { id: "c", text: "clear mac address-table", isCorrect: false },
        { id: "d", text: "write erase", isCorrect: false },
      ],
    },
    {
      id: uid(), type: "multiple-choice", points: 15,
      text: "Welche Befehle sind nützlich, um einen Layer-3-Pfad zu prüfen? (Mehrere Antworten)",
      explanation: "ping prüft Erreichbarkeit, traceroute zeigt Hop-für-Hop-Pfad, 'show ip route' zeigt die Routing-Tabelle, 'show ip cef' das FIB.",
      answers: [
        { id: "a", text: "ping", isCorrect: true },
        { id: "b", text: "traceroute", isCorrect: true },
        { id: "c", text: "show ip route", isCorrect: true },
        { id: "d", text: "show vlan brief", isCorrect: false },
      ],
    },
    {
      id: uid(), type: "single-choice", points: 10,
      text: "Was zeigt 'show ip arp'?",
      explanation: "Die ARP-Tabelle des Routers — Zuordnung IP↔MAC für direkt verbundene Layer-2-Nachbarn.",
      answers: [
        { id: "a", text: "Routing-Tabelle", isCorrect: false },
        { id: "b", text: "MAC-Adressen mit zugehörigen IPs (ARP-Tabelle)", isCorrect: true },
        { id: "c", text: "Interface-Statistiken", isCorrect: false },
        { id: "d", text: "DHCP-Leases", isCorrect: false },
      ],
    },
    {
      id: uid(), type: "single-choice", points: 10,
      text: "Ein extended ping zeigt '!!!.!' — was bedeutet das?",
      explanation: "'!' = Echo Reply empfangen, '.' = Timeout. Hier 4 Erfolge, 1 Verlust → 80% Erfolgsquote (typischerweise akzeptabel, kann aber Hinweis auf Paketverlust sein).",
      answers: [
        { id: "a", text: "Alle Pakete erfolgreich", isCorrect: false },
        { id: "b", text: "4 Antworten, 1 Timeout (80% Erfolg)", isCorrect: true },
        { id: "c", text: "Alle Pakete verloren", isCorrect: false },
        { id: "d", text: "Destination Unreachable", isCorrect: false },
      ],
    },
    {
      id: uid(), type: "true-false", points: 5,
      text: "Beim 'traceroute' inkrementiert der Sender das TTL-Feld, um jeden Router auf dem Pfad sichtbar zu machen.",
      explanation: "Wahr. Traceroute startet mit TTL=1, jeder Router antwortet mit ICMP 'Time Exceeded' und enthüllt sich so.",
      answers: [
        { id: "a", text: "Wahr", isCorrect: true },
        { id: "b", text: "Falsch", isCorrect: false },
      ],
    },
  ],
};

// ============================================================
// QUIZ: Glasfaser & Verkabelung (Tag 8 — Fragenpool)
// ============================================================
export const QUIZ_GLASFASER: Quiz = {
  id: "ccna-quiz-glasfaser",
  title: "Glasfaser & Verkabelung: Stecker, Dämpfung, LSZH",
  description:
    "Glasfaser-Grundlagen, Sicherheit, Steckverbinder, Dämpfungsarten, Reinigung, LSZH und Kupfer-/Ethernet-Basics",
  passingScore: 70,
  shuffleQuestions: true,
  questions: [
    // ── Glasfaser Grundlagen ────────────────────────────────
    {
      id: uid(), type: "single-choice", points: 10,
      text: "Wie erfolgt die Datenübertragung bei Glasfaser?",
      explanation: "Glasfaser überträgt Daten mit Lichtsignalen (optisch), nicht elektrisch. Das ermöglicht hohe Bandbreiten und Immunität gegen elektromagnetische Störungen.",
      answers: [
        { id: "a", text: "Elektrisch über Kupferadern", isCorrect: false },
        { id: "b", text: "Magnetisch", isCorrect: false },
        { id: "c", text: "Mit Lichtsignalen (optisch)", isCorrect: true },
        { id: "d", text: "Per Funk (WLAN)", isCorrect: false },
      ],
    },
    {
      id: uid(), type: "single-choice", points: 10,
      text: "Was ist ein typischer Vorteil von Glasfaser gegenüber Kupfer?",
      explanation: "Glasfaser bietet konstante Leistung auch in Stoßzeiten (keine Bandbreitendegradation durch Crosstalk/EMI), hohe Upload-Raten und Zukunftssicherheit durch sehr hohe mögliche Bandbreiten.",
      answers: [
        { id: "a", text: "Hohe elektromagnetische Störungsanfälligkeit", isCorrect: false },
        { id: "b", text: "Geringe Bandbreite", isCorrect: false },
        { id: "c", text: "Günstiger Ausbau", isCorrect: false },
        { id: "d", text: "Konstante Leistung auch bei Stoßzeiten", isCorrect: true },
      ],
    },
    {
      id: uid(), type: "single-choice", points: 10,
      text: "Was ist ein Nachteil von Glasfaser?",
      explanation: "Glasfaser ist empfindlicher als Kupfer und der Ausbau (Grabungs-/Verlegearbeiten) ist aufwendiger und teurer als Kupferverkabelung.",
      answers: [
        { id: "a", text: "Niedrige Geschwindigkeit", isCorrect: false },
        { id: "b", text: "Aufwendiger Ausbau und höhere Kosten", isCorrect: true },
        { id: "c", text: "Keine Zukunftssicherheit", isCorrect: false },
        { id: "d", text: "Empfindlich für EMI", isCorrect: false },
      ],
    },
    {
      id: uid(), type: "single-choice", points: 10,
      text: "Was bedeutet FTTH?",
      explanation: "FTTH = Fiber to the Home. Die Glasfaserleitung endet direkt in der Wohnung/am Büro an der Anschlussdose. Das ist die leistungsstärkste FTTx-Variante, da kein Kupferanteil auf der letzten Meile vorhanden ist.",
      answers: [
        { id: "a", text: "Fiber to the Hall", isCorrect: false },
        { id: "b", text: "Fiber to the Hub", isCorrect: false },
        { id: "c", text: "Fiber to the Home", isCorrect: true },
        { id: "d", text: "Fiber to the Host", isCorrect: false },
      ],
    },
    {
      id: uid(), type: "single-choice", points: 10,
      text: "Wo endet die Glasfaserleitung bei FTTC?",
      explanation: "FTTC = Fiber to the Curb. Die Glasfaser endet am Straßenverteiler (Multifunktionsgehäuse, MFG — die grauen Kästen am Straßenrand). Von dort überbrückt Kupfer/VDSL die letzte Meile bis zur Wohnung.",
      answers: [
        { id: "a", text: "In der Wohnung", isCorrect: false },
        { id: "b", text: "Am Straßenverteiler", isCorrect: true },
        { id: "c", text: "Im Router", isCorrect: false },
        { id: "d", text: "Im Rechenzentrum", isCorrect: false },
      ],
    },
    {
      id: uid(), type: "single-choice", points: 10,
      text: "Welche Technik wandelt am FTTx-Übergangspunkt optische Signale in elektrische Signale um?",
      explanation: "Der OLT (Optical Line Transmitter) wandelt optische Signale in elektrische um. Er steht z.B. im Straßenverteiler (FTTC) oder Gebäudekeller (FTTB) und bildet den Übergang zwischen Glasfaser- und Kupfernetz.",
      answers: [
        { id: "a", text: "DNS-Server", isCorrect: false },
        { id: "b", text: "DHCP-Server", isCorrect: false },
        { id: "c", text: "OLT (Optical Line Transmitter)", isCorrect: true },
        { id: "d", text: "NAT-Gateway", isCorrect: false },
      ],
    },
    // ── Sicherheit ─────────────────────────────────────────
    {
      id: uid(), type: "single-choice", points: 10,
      text: "Was ist die Methode 'Bending' beim Abhören von Glasfaserkabeln?",
      explanation: "Beim Bending wird das Glasfaserkabel gezielt gebogen, um den Mindestbiegeradius zu unterschreiten. Dabei tritt ein Teil des Lichts aus dem Faserkern seitlich aus und kann mit einem empfindlichen optischen Sensor abgefangen werden — ohne die Verbindung zu unterbrechen.",
      answers: [
        { id: "a", text: "Routing-Angriff auf Layer 3", isCorrect: false },
        { id: "b", text: "Gezieltes Biegen des Kabels, um Licht auszukoppeln", isCorrect: true },
        { id: "c", text: "VLAN-Hopping-Technik", isCorrect: false },
        { id: "d", text: "Crimpen eines Steckers", isCorrect: false },
      ],
    },
    {
      id: uid(), type: "single-choice", points: 10,
      text: "Was ist der effektivste Schutz gegen das Abhören von Glasfaserleitungen?",
      explanation: "Verschlüsselung (Ende-zu-Ende, z.B. MACsec auf Layer 2 oder TLS/IPSec auf höheren Schichten) ist der effektivste Schutz. Da 100 % physische Sicherheit nicht garantiert werden kann, müssen Daten auch bei physischem Zugriff unlesbar sein.",
      answers: [
        { id: "a", text: "Verwenden eines Hubs statt Switches", isCorrect: false },
        { id: "b", text: "Firewall-Regeln", isCorrect: false },
        { id: "c", text: "NAT-Verschleierung", isCorrect: false },
        { id: "d", text: "Ende-zu-Ende-Verschlüsselung (MACsec, TLS)", isCorrect: true },
      ],
    },
    {
      id: uid(), type: "single-choice", points: 10,
      text: "Was detektieren optische Netzwerk-Monitoringsysteme, um Abhörversuche zu erkennen?",
      explanation: "Optische Monitoringsysteme messen Dämpfungsverluste kontinuierlich. Ein Abhörversuch (z.B. durch Bending oder Tapping) verursacht messbare Änderungen in der Signalstärke, die ein Alarm-System triggern können.",
      answers: [
        { id: "a", text: "Temperaturveränderungen", isCorrect: false },
        { id: "b", text: "Dämpfungsverluste (Signalpegeländerungen)", isCorrect: true },
        { id: "c", text: "Spannungsänderungen", isCorrect: false },
        { id: "d", text: "DHCP-Anomalien", isCorrect: false },
      ],
    },
    {
      id: uid(), type: "single-choice", points: 10,
      text: "Glasfaserkabel benötigen für Alarmanlagen eine separate Notstromversorgung, weil...",
      explanation: "Glasfaser überträgt Licht, keine Elektrizität. Analoges Kupfernetz (PSTN) lieferte früher Strom über die Leitung. FTTH-Anschlüsse benötigen daher eine USV (Notstromversorgung) am ONT, damit Alarmanlagen und Notrufe bei Stromausfall funktionieren.",
      answers: [
        { id: "a", text: "Glasfaser zu schnell für Alarmsignale ist", isCorrect: false },
        { id: "b", text: "Glasfaser keinen elektrischen Strom überträgt", isCorrect: true },
        { id: "c", text: "Glasfaser störanfällig ist", isCorrect: false },
        { id: "d", text: "Glasfaser nur für Internet genutzt werden kann", isCorrect: false },
      ],
    },
    // ── Steckverbinder ─────────────────────────────────────
    {
      id: uid(), type: "single-choice", points: 10,
      text: "Welcher Glasfaser-Steckverbinder ist weltweit am häufigsten verbaut (über 50 Millionen Einheiten)?",
      explanation: "Der LC-Steckverbinder (Lucent Connector) ist mit über 50 Millionen verbauten Einheiten der weltweit meistverbauteste Glasfaserstecker. Er hat eine 1,25 mm Ferrule und eignet sich als SFF-Stecker (Small Form Factor) für hochdichte Installationen.",
      answers: [
        { id: "a", text: "ST (Straight Tip)", isCorrect: false },
        { id: "b", text: "MPO/MTP", isCorrect: false },
        { id: "c", text: "LC (Lucent Connector)", isCorrect: true },
        { id: "d", text: "E2000", isCorrect: false },
      ],
    },
    {
      id: uid(), type: "single-choice", points: 10,
      text: "Welcher Glasfaser-Stecker nutzt einen Bajonettverschluss (BFOC) und unterstützt nur Simplex?",
      explanation: "Der ST-Stecker (Straight Tip, entwickelt von AT&T) besitzt eine 2,5 mm Ferrule und einen Bajonettverschluss (BFOC-Stecker). Er ist ausschließlich für Simplex-Übertragung ausgelegt und wird hauptsächlich in Legacy-LANs gefunden.",
      answers: [
        { id: "a", text: "LC (Lucent Connector)", isCorrect: false },
        { id: "b", text: "ST (Straight Tip)", isCorrect: true },
        { id: "c", text: "SC (Subscriber Connector)", isCorrect: false },
        { id: "d", text: "MPO (Multifiber Push On)", isCorrect: false },
      ],
    },
    {
      id: uid(), type: "single-choice", points: 10,
      text: "Welcher Glasfaser-Stecker besitzt eine Push/Pull-Verriegelung und eine 2,5 mm Ferrule?",
      explanation: "Der SC-Stecker (Subscriber Connector) hat eine 2,5 mm Ferrule und wird durch eine beliebt Push/Pull-Verriegelung gesichert. Er ist der zweithäufigst eingesetzte Stecker nach LC und sowohl in Simplex als auch Duplex erhältlich.",
      answers: [
        { id: "a", text: "SC (Subscriber Connector)", isCorrect: true },
        { id: "b", text: "ST (Straight Tip)", isCorrect: false },
        { id: "c", text: "LC (Lucent Connector)", isCorrect: false },
        { id: "d", text: "MTRJ", isCorrect: false },
      ],
    },
    {
      id: uid(), type: "single-choice", points: 10,
      text: "Was bedeutet die Abkürzung MPO?",
      explanation: "MPO steht für 'Multifiber Push On'. MPO-Stecker sind mehrfaserige Steckverbinder mit 12, 16, 24 oder 32 Fasern in einer rechteckigen Ferrule. Sie werden nach IEC 61754-7 genormt und hauptsächlich in Rechenzentren für paralleloptische Hochgeschwindigkeitsverbindungen eingesetzt.",
      answers: [
        { id: "a", text: "Multi Port Optic", isCorrect: false },
        { id: "b", text: "Multi Protocol Output", isCorrect: false },
        { id: "c", text: "Multifiber Push On", isCorrect: true },
        { id: "d", text: "Multi Power Optic", isCorrect: false },
      ],
    },
    {
      id: uid(), type: "single-choice", points: 10,
      text: "Welche Ferrulengröße besitzt der LC-Steckverbinder?",
      explanation: "Der LC-Stecker hat eine 1,25 mm Ferrule — halb so groß wie SC/ST (2,5 mm). Diese geringe Baugröße macht LC zum SFF-Stecker (Small Form Factor) der Wahl für hochdichte Patchfelder und SFP-Transceiver.",
      answers: [
        { id: "a", text: "5,0 mm", isCorrect: false },
        { id: "b", text: "1,25 mm", isCorrect: true },
        { id: "c", text: "10,0 mm", isCorrect: false },
        { id: "d", text: "2,5 mm", isCorrect: false },
      ],
    },
    {
      id: uid(), type: "single-choice", points: 10,
      text: "Welche besondere Schutzfunktion besitzt der E2000-Steckverbinder?",
      explanation: "Der E2000-Stecker besitzt eine automatische Schutzkappe, die sich beim Stecken/Trennen selbstständig zurück- bzw. vorschiebt. Sie schützt sowohl den Anwender vor dem Laserstrahl als auch die Ferrule vor Verschmutzungen.",
      answers: [
        { id: "a", text: "Metallplatte als Zugentlastung", isCorrect: false },
        { id: "b", text: "Doppelte Ferrule für bessere Dämpfung", isCorrect: false },
        { id: "c", text: "Automatische Schutzkappe für Ferrule und Laserschutz", isCorrect: true },
        { id: "d", text: "Integriertes Patchpanel", isCorrect: false },
      ],
    },
    // ── Dämpfung ───────────────────────────────────────────
    {
      id: uid(), type: "single-choice", points: 10,
      text: "In welcher Einheit wird die Glasfaser-Dämpfung gemessen?",
      explanation: "Dämpfung wird in Dezibel (dB) gemessen. dB ist eine logarithmische Einheit, die den Leistungsverlust beschreibt. Bei Glasfaser gilt: je niedriger die Dämpfung (in dB), desto besser die Signalqualität.",
      answers: [
        { id: "a", text: "Volt (V)", isCorrect: false },
        { id: "b", text: "Watt (W)", isCorrect: false },
        { id: "c", text: "Ampere (A)", isCorrect: false },
        { id: "d", text: "Dezibel (dB)", isCorrect: true },
      ],
    },
    {
      id: uid(), type: "single-choice", points: 10,
      text: "Wozu werden Dämpfungsglieder (Attenuatoren) bei Glasfaser eingesetzt?",
      explanation: "Dämpfungsglieder reduzieren die optische Leistung. Bei kurzen Strecken kann das Empfängersignal zu stark sein und den Empfänger übersteuern. Attenuatoren senken dann gezielt die Signalstärke auf ein kompatibles Niveau (0–30 dB Dämpfungsbereich).",
      answers: [
        { id: "a", text: "Erhöhung der Signalspannung", isCorrect: false },
        { id: "b", text: "Reduktion der optischen Leistung zur Vermeidung von Übersteuerung", isCorrect: true },
        { id: "c", text: "Verstärkung des WLAN-Signals", isCorrect: false },
        { id: "d", text: "Routing zwischen Glasfasersegmenten", isCorrect: false },
      ],
    },
    {
      id: uid(), type: "single-choice", points: 10,
      text: "Was bedeutet 'Return Loss' bei Glasfaserverbindungen?",
      explanation: "Return Loss (Reflexionsdämpfung) beschreibt die Lichtmenge, die an Verbindungsstellen zur Quelle zurückreflektiert wird (Fresnel-Reflexion). Ein hoher Return Loss-Wert (in dB) ist gut — er bedeutet, dass wenig Licht reflektiert wird. APC-Schliff (grüne Stecker) liefert besseren Return Loss als PC/UPC.",
      answers: [
        { id: "a", text: "Rückflussdämpfung — Licht wird an Steckern zur Quelle reflektiert", isCorrect: true },
        { id: "b", text: "Netzwerkausfall durch Überlastung", isCorrect: false },
        { id: "c", text: "Kabelbruch-Diagnose", isCorrect: false },
        { id: "d", text: "Broadcast-Verlust im VLAN", isCorrect: false },
      ],
    },
    {
      id: uid(), type: "single-choice", points: 10,
      text: "Wann treten bei Glasfaser Übertragungsfehler aufgrund von Dämpfung auf?",
      explanation: "Übertragungsfehler entstehen bei zu hoher Dämpfung — das Signal am Empfänger ist zu schwach, um korrekt dekodiert zu werden. Bei zu geringer Dämpfung (z.B. kurze Strecken mit leistungsstarkem Laser) kann der Empfänger übersteuert werden — auch das verursacht Fehler, weshalb Dämpfungsglieder eingesetzt werden.",
      answers: [
        { id: "a", text: "Bei zu geringer Dämpfung", isCorrect: false },
        { id: "b", text: "Bei zu hoher Dämpfung (Signal zu schwach am Empfänger)", isCorrect: true },
        { id: "c", text: "Bei zu wenigen VLANs", isCorrect: false },
        { id: "d", text: "Bei zu vielen Routern im Netz", isCorrect: false },
      ],
    },
    // ── Reinigung ──────────────────────────────────────────
    {
      id: uid(), type: "single-choice", points: 10,
      text: "Was ist die wichtigste Maßnahme zur Fehlervermeidung bei Glasfaserverbindungen?",
      explanation: "98% aller Verbindungsausfälle bei Glasfaser sind auf Verschmutzungen zurückzuführen (NTT-Studie). Reinigung der Ferrulen vor der Installation und nach jedem Abziehen/Wiederanschließen ist die einfachste und wirksamste Fehlervermeidung.",
      answers: [
        { id: "a", text: "Regelmäßiger Neustart aller Netzwerkgeräte", isCorrect: false },
        { id: "b", text: "Routing-Tabellen optimieren", isCorrect: false },
        { id: "c", text: "Reinigung der Ferrulen und Stecker", isCorrect: true },
        { id: "d", text: "VLANs konfigurieren", isCorrect: false },
      ],
    },
    {
      id: uid(), type: "single-choice", points: 10,
      text: "Welche Reihenfolge ist beim Reinigen von Glasfasersteckern einzuhalten?",
      explanation: "Der korrekte Ablauf ist immer: Inspektion (mit Glasfaser-Mikroskop prüfen) → ggf. Reinigung → Inspektion (Reinigungserfolg prüfen). Nur reinigen, wenn die Inspektion Verschmutzung zeigt. Nach der Reinigung erneut prüfen.",
      answers: [
        { id: "a", text: "Reinigen → Prüfen", isCorrect: false },
        { id: "b", text: "Prüfen → Reinigen → Prüfen (Inspektion-Reinigung-Inspektion)", isCorrect: true },
        { id: "c", text: "Prüfen → Tauschen", isCorrect: false },
        { id: "d", text: "Installieren → Reinigen ohne Prüfung", isCorrect: false },
      ],
    },
    {
      id: uid(), type: "single-choice", points: 10,
      text: "Wann ist die Reinigung von Glasfasersteckern besonders wichtig?",
      explanation: "Nach dem Abziehen und Wiederanschließen: Beim Abziehen wandert Schmutz vom Rand der Ferrule in die Mitte. Da das Lichtsignal durch die Mitte der Ferrule geleitet wird, verursacht Schmutz in der Mitte direkte Übertragungsfehler.",
      answers: [
        { id: "a", text: "Nach jedem Router-Wechsel", isCorrect: false },
        { id: "b", text: "Beim Umzug des Servers", isCorrect: false },
        { id: "c", text: "Nach dem Abziehen und Wiederanschließen eines Steckers", isCorrect: true },
        { id: "d", text: "Nach jeder DHCP-Erneuerung", isCorrect: false },
      ],
    },
    // ── LSZH ──────────────────────────────────────────────
    {
      id: uid(), type: "single-choice", points: 10,
      text: "Wofür steht die Abkürzung LSZH?",
      explanation: "LSZH = Low Smoke Zero Halogen. Diese Materialklasse für Kabelmäntel entwickelt im Brandfall minimalen Rauch und keine Halogene (kein Chlorwasserstoff/HCl). Im Gegensatz zu PVC-Kabeln entsteht kein gefährliches Salzsäuregas.",
      answers: [
        { id: "a", text: "Low Signal Zero Heat", isCorrect: false },
        { id: "b", text: "Long Shield Zone Housing", isCorrect: false },
        { id: "c", text: "Low Smoke Zero Halogen", isCorrect: true },
        { id: "d", text: "Light Signal Zone Handling", isCorrect: false },
      ],
    },
    {
      id: uid(), type: "single-choice", points: 10,
      text: "Warum sind LSZH-Kabel in Flugzeugen und U-Booten vorgeschrieben?",
      explanation: "In engen, geschlossenen Räumen mit vielen Menschen (Flugzeuge, U-Boote) darf im Brandfall kein giftiges Chlorwasserstoffgas entstehen. LSZH-Kabel sind daher gesetzlich vorgeschrieben, da sie keinen HCl-Rauch produzieren, der mit Löschmitteln zu gefährlicher Salzsäure reagieren würde.",
      answers: [
        { id: "a", text: "Wegen geringerer Kosten", isCorrect: false },
        { id: "b", text: "Wegen schnellerer Datenübertragung", isCorrect: false },
        { id: "c", text: "Kein giftiger Rauch in engen Räumen mit vielen Menschen", isCorrect: true },
        { id: "d", text: "Wegen WLAN-Kompatibilität", isCorrect: false },
      ],
    },
    // ── Kupfer / Ethernet / RJ45 ───────────────────────────
    {
      id: uid(), type: "single-choice", points: 10,
      text: "Wie nennt man das Verbinden eines RJ45-Steckers mit einem Kabel?",
      explanation: "Das Verbinden (Anpressen) eines RJ45-Steckers auf ein Kabel mit einem Crimpwerkzeug heißt Crimpen. Das Werkzeug drückt die Kontaktstifte in die Kabeladern und fixiert gleichzeitig den Stecker auf dem Kabel.",
      answers: [
        { id: "a", text: "Patchen", isCorrect: false },
        { id: "b", text: "Spleißen", isCorrect: false },
        { id: "c", text: "Crimpen", isCorrect: true },
        { id: "d", text: "Stecken", isCorrect: false },
      ],
    },
    {
      id: uid(), type: "single-choice", points: 10,
      text: "Wie viele Pins und wie viele verdrillte Adernpaare hat ein RJ45-Netzwerkkabel?",
      explanation: "RJ45 (8P8C) hat 8 Pins und 4 verdrillte Adernpaare (= 8 Adern). Bei 10/100BASE-T werden nur 2 Paare genutzt, bei 1000BASE-T/10GBASE-T alle 4 Paare.",
      answers: [
        { id: "a", text: "4 Pins, 2 Paare", isCorrect: false },
        { id: "b", text: "8 Pins, 4 Paare", isCorrect: true },
        { id: "c", text: "12 Pins, 6 Paare", isCorrect: false },
        { id: "d", text: "6 Pins, 3 Paare", isCorrect: false },
      ],
    },
    {
      id: uid(), type: "single-choice", points: 10,
      text: "Welche Farbe liegt bei T568B auf Pin 1?",
      explanation: "Bei T568B ist Pin 1 = Weiß/Orange. Merkhilfe: Bei 568B kommt Orange zuerst (Pins 1+2 = Weiß-Orange, Orange). Bei 568A ist Pin 1 = Weiß/Grün.",
      answers: [
        { id: "a", text: "Weiß/Grün", isCorrect: false },
        { id: "b", text: "Blau", isCorrect: false },
        { id: "c", text: "Weiß/Orange", isCorrect: true },
        { id: "d", text: "Braun", isCorrect: false },
      ],
    },
    {
      id: uid(), type: "single-choice", points: 10,
      text: "Was ist der einzige Unterschied zwischen T568A und T568B?",
      explanation: "Bei T568A und T568B sind ausschließlich das grüne und das orangene Adernpaar vertauscht. Alle anderen Paare (Blau, Braun) bleiben identisch. 568A: Pin 1+2 = Grün, Pin 3+6 = Orange. 568B: Pin 1+2 = Orange, Pin 3+6 = Grün.",
      answers: [
        { id: "a", text: "Unterschiedliche Pinanzahl", isCorrect: false },
        { id: "b", text: "Grünes und oranges Adernpaar sind vertauscht", isCorrect: true },
        { id: "c", text: "Anderer Steckertyp erforderlich", isCorrect: false },
        { id: "d", text: "Anderes Kabel erforderlich", isCorrect: false },
      ],
    },
    {
      id: uid(), type: "single-choice", points: 10,
      text: "Welche Belegungsnorm (568A oder 568B) ist heute weiter verbreitet?",
      explanation: "T568B ist heute die weltweit verbreitetere Norm, besonders in kommerziellen und gewerblichen Installationen. T568A wird hauptsächlich in US-Regierungsinstallationen und einigen älteren Installationen verwendet. Beide Normen sind technisch gleichwertig.",
      answers: [
        { id: "a", text: "568A", isCorrect: false },
        { id: "b", text: "STP (nicht relevant)", isCorrect: false },
        { id: "c", text: "FTTH", isCorrect: false },
        { id: "d", text: "568B", isCorrect: true },
      ],
    },
    {
      id: uid(), type: "single-choice", points: 10,
      text: "Welche Steckverbinder zählen zu den SFF-Steckern (Small Form Factor)?",
      explanation: "LC (1,25 mm Ferrule) und SC (2,5 mm Ferrule) zählen beide zu den SFF-Steckern. Trotz des doppelten Ferrulendurchmessers gilt SC noch als SFF. ST ist kein SFF-Stecker. MPO ist ein separater Standard für Multifaser-Anwendungen.",
      answers: [
        { id: "a", text: "LC und SC", isCorrect: true },
        { id: "b", text: "ST und GG45", isCorrect: false },
        { id: "c", text: "RJ45 und LC", isCorrect: false },
        { id: "d", text: "MPO und ST", isCorrect: false },
      ],
    },
  ],
};

// ============================================================
// QUIZ: Switching (VLAN, Trunking, Inter-VLAN Routing)
// ============================================================
export const QUIZ_SWITCHING: Quiz = {
  id: "ccna-quiz-switching",
  title: "CCNA: Switching, VLANs & Trunking",
  description: "VLAN-Konfiguration, 802.1Q Trunking, DTP, VTP, Inter-VLAN Routing, Switchport-Modi",
  passingScore: 70,
  shuffleQuestions: true,
  questions: [
    {
      id: uid(), type: "single-choice", points: 10, blueprint: "2.1",
      text: "Was ist ein VLAN (Virtual LAN) und welchen Zweck erfüllt es?",
      explanation: "Ein VLAN segmentiert ein physisches Netzwerk in logische Broadcast-Domänen. Geräte in verschiedenen VLANs können ohne Router nicht kommunizieren, was Sicherheit und Netzwerkeffizienz verbessert.",
      answers: [
        { id: "a", text: "Eine Methode zur WLAN-Kanalzuweisung", isCorrect: false },
        { id: "b", text: "Logische Segmentierung in separate Broadcast-Domänen", isCorrect: true },
        { id: "c", text: "Ein Layer-3-Protokoll für virtuelle Netzwerke", isCorrect: false },
        { id: "d", text: "Ein Protokoll für verschlüsselte VPN-Verbindungen", isCorrect: false },
      ],
    },
    {
      id: uid(), type: "single-choice", points: 10, blueprint: "2.1",
      text: "Welches IEEE-Protokoll wird für VLAN-Tagging auf Trunk-Ports verwendet?",
      explanation: "IEEE 802.1Q ist der offene Standard für VLAN-Tagging. Es fügt einen 4-Byte-Tag (inkl. 12-Bit VLAN-ID) in den Ethernet-Frame ein. Cisco ISL ist ein älteres, proprietäres Verfahren.",
      answers: [
        { id: "a", text: "802.1D", isCorrect: false },
        { id: "b", text: "802.1Q", isCorrect: true },
        { id: "c", text: "802.3ad", isCorrect: false },
        { id: "d", text: "ISL (Inter-Switch Link)", isCorrect: false },
      ],
    },
    {
      id: uid(), type: "single-choice", points: 10, blueprint: "2.1",
      text: "Was ist das Native VLAN auf einem 802.1Q Trunk-Port?",
      explanation: "Das Native VLAN ist das VLAN, dessen Frames OHNE 802.1Q-Tag über den Trunk übertragen werden. Standard ist VLAN 1. Aus Sicherheitsgründen sollte das Native VLAN auf ein unbenutztes VLAN geändert werden (VLAN Hopping-Angriff).",
      answers: [
        { id: "a", text: "Das VLAN mit den meisten Hosts", isCorrect: false },
        { id: "b", text: "Das VLAN, dessen Frames ohne 802.1Q-Tag übertragen werden", isCorrect: true },
        { id: "c", text: "Das Verwaltungs-VLAN für SSH-Zugriff", isCorrect: false },
        { id: "d", text: "Das VLAN mit der höchsten Priorität", isCorrect: false },
      ],
    },
    {
      id: uid(), type: "single-choice", points: 10, blueprint: "2.1",
      text: "Wie wird Inter-VLAN Routing mit einem 'Router-on-a-Stick' implementiert?",
      explanation: "Router-on-a-Stick: Ein Router-Port wird als Trunk zu einem Switch konfiguriert. Für jedes VLAN wird ein Sub-Interface (z.B. G0/0.10 für VLAN 10) mit 802.1Q Encapsulation und IP-Adresse erstellt.",
      answers: [
        { id: "a", text: "Durch einen L3-Switch mit SVIs", isCorrect: false },
        { id: "b", text: "Trunk-Port + Router-Sub-Interfaces mit 802.1Q Encapsulation", isCorrect: true },
        { id: "c", text: "Durch direkte physische Verbindung jedes VLANs mit dem Router", isCorrect: false },
        { id: "d", text: "Durch statische Routen im Switch", isCorrect: false },
      ],
    },
    {
      id: uid(), type: "single-choice", points: 10, blueprint: "2.1",
      text: "Was ist ein Switch Virtual Interface (SVI)?",
      explanation: "Ein SVI ist ein logisches Layer-3-Interface auf einem L3-Switch, das einer VLAN-ID zugeordnet ist. Es ermöglicht Inter-VLAN Routing ohne externen Router und wird für Management-Zugriff genutzt.",
      answers: [
        { id: "a", text: "Ein physischer Port, der als Trunk konfiguriert ist", isCorrect: false },
        { id: "b", text: "Ein logisches L3-Interface auf einem L3-Switch für Inter-VLAN Routing", isCorrect: true },
        { id: "c", text: "Ein virtueller Switch-Port ohne VLAN-Zugehörigkeit", isCorrect: false },
        { id: "d", text: "Eine Sub-Interface-Konfiguration auf einem Router", isCorrect: false },
      ],
    },
    {
      id: uid(), type: "single-choice", points: 10, blueprint: "2.1",
      text: "Was ist DTP (Dynamic Trunking Protocol)?",
      explanation: "DTP ist ein Cisco-proprietäres Protokoll, das Switchports automatisch als Trunk oder Access aushandelt. Standard-Modus: dynamic auto (wartet) oder dynamic desirable (verhandelt aktiv). Aus Sicherheitsgründen sollte DTP deaktiviert werden: 'switchport nonegotiate'.",
      answers: [
        { id: "a", text: "Ein offener Standard (IEEE 802.1Q-Erweiterung) für Trunk-Konfiguration", isCorrect: false },
        { id: "b", text: "Cisco-proprietäres Protokoll zur automatischen Trunk-Aushandlung", isCorrect: true },
        { id: "c", text: "Ein Protokoll zur VLAN-Datenbank-Synchronisation zwischen Switches", isCorrect: false },
        { id: "d", text: "Das Protokoll für dynamische VLAN-Zuweisung basierend auf MAC-Adressen", isCorrect: false },
      ],
    },
    {
      id: uid(), type: "single-choice", points: 10, blueprint: "2.1",
      text: "Welches Cisco IOS-Kommando ordnet einen Switchport dem VLAN 20 zu?",
      explanation: "'switchport access vlan 20' ordnet den Port VLAN 20 zu. Vorher sollte 'switchport mode access' den Port als Access-Port konfigurieren.",
      answers: [
        { id: "a", text: "vlan 20 access", isCorrect: false },
        { id: "b", text: "switchport access vlan 20", isCorrect: true },
        { id: "c", text: "switchport vlan 20 access", isCorrect: false },
        { id: "d", text: "set port vlan 20", isCorrect: false },
      ],
    },
    {
      id: uid(), type: "single-choice", points: 10, blueprint: "2.1",
      text: "Wie lautet das Kommando, um alle auf einem Trunk erlaubten VLANs auf 10 und 20 zu beschränken?",
      explanation: "'switchport trunk allowed vlan 10,20' beschränkt den Trunk auf VLAN 10 und 20. Ohne diese Einschränkung werden alle VLANs erlaubt.",
      answers: [
        { id: "a", text: "switchport trunk vlan allow 10,20", isCorrect: false },
        { id: "b", text: "vlan allowed 10,20 trunk", isCorrect: false },
        { id: "c", text: "switchport trunk allowed vlan 10,20", isCorrect: true },
        { id: "d", text: "switchport access vlan 10,20", isCorrect: false },
      ],
    },
    {
      id: uid(), type: "multiple-choice", points: 15, blueprint: "2.1",
      text: "Welche Vorteile bietet Inter-VLAN Routing über einen L3-Switch mit SVIs gegenüber Router-on-a-Stick? (Mehrere Antworten möglich)",
      explanation: "L3-Switch mit SVIs: Höherer Durchsatz (Hardware-switching), keine einzelne physische Verbindung als Engpass, zentralere Verwaltung. Router-on-a-Stick hat eine physische Verbindung als Bottleneck.",
      answers: [
        { id: "a", text: "Höherer Durchsatz durch Hardware-Switching im ASIC", isCorrect: true },
        { id: "b", text: "Kein physischer Engpass durch eine einzige Uplink-Verbindung", isCorrect: true },
        { id: "c", text: "Kein Router erforderlich — Routing im Switch integriert", isCorrect: true },
        { id: "d", text: "Günstiger in der Anschaffung als alle anderen Lösungen", isCorrect: false },
      ],
    },
    {
      id: uid(), type: "single-choice", points: 10, blueprint: "2.1",
      text: "Was passiert, wenn ein Gerät in VLAN 10 ein Paket an ein Gerät in VLAN 20 sendet, ohne dass Inter-VLAN Routing konfiguriert ist?",
      explanation: "Ohne Inter-VLAN Routing können Geräte in verschiedenen VLANs NICHT kommunizieren — VLANs sind separate Broadcast-Domänen auf Layer 2. Ein Router oder L3-Switch ist zwingend erforderlich.",
      answers: [
        { id: "a", text: "Das Paket wird automatisch weitergeleitet, da beide im gleichen Switch sind", isCorrect: false },
        { id: "b", text: "Die Kommunikation schlägt fehl — VLANs sind isolierte Layer-2-Segmente", isCorrect: true },
        { id: "c", text: "Das Paket wird mit VLAN-Tag weitergeleitet", isCorrect: false },
        { id: "d", text: "Der Switch fragt automatisch beim DHCP-Server nach dem nächsten Hop", isCorrect: false },
      ],
    },
    {
      id: uid(), type: "single-choice", points: 10, blueprint: "2.1",
      text: "Welches Kommando zeigt alle konfigurierten VLANs und die zugehörigen Ports auf einem Cisco Switch?",
      explanation: "'show vlan brief' zeigt eine kompakte Übersicht aller VLANs (ID, Name, Status) und der zugeordneten Ports. 'show interfaces trunk' zeigt Trunk-Informationen.",
      answers: [
        { id: "a", text: "show interfaces trunk", isCorrect: false },
        { id: "b", text: "show vlan brief", isCorrect: true },
        { id: "c", text: "show ip vlan", isCorrect: false },
        { id: "d", text: "show switch vlan", isCorrect: false },
      ],
    },
    {
      id: uid(), type: "true-false", points: 10, blueprint: "2.1",
      text: "VLAN 1 ist auf Cisco Switches ein spezielles VLAN, das nicht gelöscht werden kann.",
      explanation: "Wahr. VLAN 1 ist das Standard-VLAN auf Cisco Switches und kann nicht gelöscht werden. Es ist das Standard-Native VLAN und das Verwaltungs-VLAN (ohne explizite Konfiguration). Best Practice: Management-VLAN von VLAN 1 trennen.",
      answers: [
        { id: "a", text: "Wahr", isCorrect: true },
        { id: "b", text: "Falsch — VLAN 1 kann wie jedes andere VLAN gelöscht werden", isCorrect: false },
      ],
    },
    {
      id: uid(), type: "single-choice", points: 10, blueprint: "2.1",
      text: "Was ist VTP (VLAN Trunking Protocol) und welches Sicherheitsrisiko besteht?",
      explanation: "VTP synchronisiert VLAN-Datenbanken zwischen Switches automatisch. Risiko: Ein Switch im VTP-Server-Modus mit höherer Revision-Nummer kann alle VLANs auf allen Switches löschen — potentiell katastrophal. Best Practice: VTP Transparent- oder Off-Modus.",
      answers: [
        { id: "a", text: "Cisco-Protokoll zur VLAN-Synchronisation — Risiko: versehentliches Löschen aller VLANs", isCorrect: true },
        { id: "b", text: "IEEE-Standard für VLAN-Trunking ohne Sicherheitsrisiken", isCorrect: false },
        { id: "c", text: "Protokoll für verschlüsselte VLAN-Übertragung", isCorrect: false },
        { id: "d", text: "Ersatz für 802.1Q ohne Risiken", isCorrect: false },
      ],
    },
    {
      id: uid(), type: "single-choice", points: 10, blueprint: "2.2",
      text: "Auf welcher OSI-Schicht lernen und speichern Switches MAC-Adressen?",
      explanation: "Switches arbeiten auf Layer 2 (Data Link Layer) und speichern MAC-Adressen in der CAM-Tabelle (Content Addressable Memory). Unicast-Frames werden nur an den Port weitergeleitet, an dem die Ziel-MAC gelernt wurde.",
      answers: [
        { id: "a", text: "Layer 1 (Physical)", isCorrect: false },
        { id: "b", text: "Layer 2 (Data Link)", isCorrect: true },
        { id: "c", text: "Layer 3 (Network)", isCorrect: false },
        { id: "d", text: "Layer 4 (Transport)", isCorrect: false },
      ],
    },
    {
      id: uid(), type: "single-choice", points: 10, blueprint: "2.2",
      text: "Was passiert bei einem Unbekannten Unicast Frame auf einem Switch?",
      explanation: "Wenn ein Unicast-Frame an eine MAC-Adresse gesendet wird, die nicht in der CAM-Tabelle steht (Unknown Unicast), flutet der Switch den Frame an alle Ports außer dem Eingangsport — ähnlich wie Broadcast/Multicast.",
      answers: [
        { id: "a", text: "Der Frame wird verworfen", isCorrect: false },
        { id: "b", text: "Der Frame wird an alle Ports außer dem Eingangsport geflutet", isCorrect: true },
        { id: "c", text: "Der Switch sendet ARP, um die MAC aufzulösen", isCorrect: false },
        { id: "d", text: "Der Frame wird an den Router weitergeleitet", isCorrect: false },
      ],
    },
  ],
};

// ============================================================
// QUIZ: EtherChannel (LACP / PAgP)
// ============================================================
export const QUIZ_ETHERCHANNEL: Quiz = {
  id: "ccna-quiz-etherchannel",
  title: "CCNA: EtherChannel (LACP & PAgP)",
  description: "Link Aggregation, LACP, PAgP, EtherChannel-Modi und Konfiguration",
  passingScore: 70,
  shuffleQuestions: true,
  questions: [
    {
      id: uid(), type: "single-choice", points: 10, blueprint: "2.4",
      text: "Was ist der Hauptvorteil von EtherChannel gegenüber mehreren einzelnen Links zwischen zwei Switches?",
      explanation: "EtherChannel bündelt 2–8 physische Links zu einem logischen Link. Vorteile: Höhere Gesamtbandbreite, Redundanz (kein STP-Blocking), und STP sieht nur einen logischen Link.",
      answers: [
        { id: "a", text: "Verschlüsselung des Datenverkehrs zwischen Switches", isCorrect: false },
        { id: "b", text: "Höhere Gesamtbandbreite + Redundanz ohne STP-Blocking", isCorrect: true },
        { id: "c", text: "Vereinfachte Layer-3-Konfiguration", isCorrect: false },
        { id: "d", text: "VLAN-Isolierung zwischen den gebündelten Links", isCorrect: false },
      ],
    },
    {
      id: uid(), type: "single-choice", points: 10, blueprint: "2.4",
      text: "Was ist der Unterschied zwischen LACP und PAgP?",
      explanation: "LACP (Link Aggregation Control Protocol, IEEE 802.3ad) ist ein offener Standard. PAgP (Port Aggregation Protocol) ist Cisco-proprietär. Beide handeln EtherChannel-Verbindungen automatisch aus.",
      answers: [
        { id: "a", text: "LACP ist Cisco-proprietär, PAgP ist IEEE-Standard", isCorrect: false },
        { id: "b", text: "LACP ist IEEE 802.3ad (offen), PAgP ist Cisco-proprietär", isCorrect: true },
        { id: "c", text: "Beide sind identische Standards mit anderem Namen", isCorrect: false },
        { id: "d", text: "LACP arbeitet auf Layer 3, PAgP auf Layer 2", isCorrect: false },
      ],
    },
    {
      id: uid(), type: "single-choice", points: 10, blueprint: "2.4",
      text: "Welche zwei LACP-Modi können eine EtherChannel-Verbindung aushandeln?",
      explanation: "LACP-Modi: 'active' sendet LACP-Pakete aktiv; 'passive' wartet auf LACP-Pakete. Eine Verbindung entsteht wenn mindestens eine Seite 'active' ist: active-active oder active-passive.",
      answers: [
        { id: "a", text: "desirable und auto", isCorrect: false },
        { id: "b", text: "active und passive", isCorrect: true },
        { id: "c", text: "on und auto", isCorrect: false },
        { id: "d", text: "force und negotiate", isCorrect: false },
      ],
    },
    {
      id: uid(), type: "single-choice", points: 10, blueprint: "2.4",
      text: "Was passiert, wenn beide Seiten eines EtherChannels auf 'passive' (LACP) konfiguriert sind?",
      explanation: "Passive-passive: Beide Seiten warten auf LACP-Pakete der Gegenseite — keine EtherChannel-Verbindung entsteht. Mindestens eine Seite muss 'active' sein.",
      answers: [
        { id: "a", text: "EtherChannel wird erfolgreich aufgebaut", isCorrect: false },
        { id: "b", text: "Kein EtherChannel — passive wartet, beide warten endlos", isCorrect: true },
        { id: "c", text: "Die Verbindung fällt back auf einen einzelnen Link", isCorrect: false },
        { id: "d", text: "STP blockiert alle redundanten Links", isCorrect: false },
      ],
    },
    {
      id: uid(), type: "single-choice", points: 10, blueprint: "2.4",
      text: "Welche Voraussetzung muss für alle Ports eines EtherChannels erfüllt sein?",
      explanation: "Alle Ports eines EtherChannels müssen identisch konfiguriert sein: gleiche Geschwindigkeit, gleicher Duplex, gleicher VLAN-Modus (Access/Trunk), gleiche VLANs auf Trunks. Unterschiedliche Konfigurationen verhindern den Aufbau.",
      answers: [
        { id: "a", text: "Alle Ports müssen auf demselben physischen Switch sein", isCorrect: false },
        { id: "b", text: "Gleiche Geschwindigkeit, Duplex und VLAN-Konfiguration auf allen Ports", isCorrect: true },
        { id: "c", text: "Alle Ports müssen GigabitEthernet sein (FastEthernet nicht unterstützt)", isCorrect: false },
        { id: "d", text: "Alle Ports müssen im selben VLAN und im Access-Modus sein", isCorrect: false },
      ],
    },
    {
      id: uid(), type: "single-choice", points: 10, blueprint: "2.4",
      text: "Welches Cisco IOS-Kommando erstellt einen EtherChannel mit LACP im active-Modus?",
      explanation: "'channel-group 1 mode active' fügt den Port zur EtherChannel-Gruppe 1 im LACP-Active-Modus hinzu. 'mode desirable' ist PAgP, 'mode on' ist statisch ohne Protokoll.",
      answers: [
        { id: "a", text: "channel-group 1 mode desirable", isCorrect: false },
        { id: "b", text: "channel-group 1 mode active", isCorrect: true },
        { id: "c", text: "etherchannel 1 lacp active", isCorrect: false },
        { id: "d", text: "port-channel 1 mode active", isCorrect: false },
      ],
    },
    {
      id: uid(), type: "single-choice", points: 10, blueprint: "2.4",
      text: "Wie viele physische Links kann ein EtherChannel maximal bündeln (aktiv)?",
      explanation: "EtherChannel unterstützt 2–8 aktive Links. Bei LACP können bis zu 16 konfiguriert werden, aber maximal 8 sind gleichzeitig aktiv (8 weitere sind Hot-Standby).",
      answers: [
        { id: "a", text: "Maximal 4 Links", isCorrect: false },
        { id: "b", text: "Maximal 8 aktive Links", isCorrect: true },
        { id: "c", text: "Maximal 16 Links (alle aktiv)", isCorrect: false },
        { id: "d", text: "Maximal 2 Links", isCorrect: false },
      ],
    },
    {
      id: uid(), type: "single-choice", points: 10, blueprint: "2.4",
      text: "Welches Kommando zeigt den Status aller EtherChannel-Gruppen auf einem Cisco Switch?",
      explanation: "'show etherchannel summary' zeigt eine kompakte Übersicht aller Port-Channel-Gruppen, deren Protokoll (LACP/PAgP/static) und den Status jedes Member-Ports.",
      answers: [
        { id: "a", text: "show port-channel brief", isCorrect: false },
        { id: "b", text: "show lacp neighbor", isCorrect: false },
        { id: "c", text: "show etherchannel summary", isCorrect: true },
        { id: "d", text: "show interfaces port-channel 1", isCorrect: false },
      ],
    },
  ],
};

// ============================================================
// QUIZ: CCNA Exam-Simulation 2 (200-301 v1.1)
// 100 neue Fragen — alle Blueprint-Bereiche abgedeckt
// ============================================================
export const QUIZ_CCNA_EXAM_2: Quiz = {
  id: "ccna-quiz-gesamtpruefung-2",
  title: "CCNA 200-301 Prüfungssimulation 2",
  description: "Zweite vollständige Prüfungssimulation mit 100 neuen Fragen — alle Blueprint-Domains der CCNA 200-301 v1.1",
  passingScore: 82,
  shuffleQuestions: true,
  timeLimit: 120,
  questions: [
    // ── Domain 1: Network Fundamentals (20 Q) ────────────────
    {
      id: uid(), type: "single-choice", points: 10, blueprint: "1.1",
      text: "Auf welchem OSI-Layer arbeitet ein Router primär?",
      explanation: "Router arbeiten auf Layer 3 (Network Layer). Sie treffen Weiterleitungsentscheidungen basierend auf IP-Adressen in der Routing-Tabelle.",
      answers: [
        { id: "a", text: "Layer 1 (Physical)", isCorrect: false },
        { id: "b", text: "Layer 2 (Data Link)", isCorrect: false },
        { id: "c", text: "Layer 3 (Network)", isCorrect: true },
        { id: "d", text: "Layer 4 (Transport)", isCorrect: false },
      ],
    },
    {
      id: uid(), type: "single-choice", points: 10, blueprint: "1.1",
      text: "Was ist die Funktion des TCP-Three-Way-Handshakes?",
      explanation: "Der TCP-3-Wege-Handshake (SYN, SYN-ACK, ACK) etabliert eine verbindungsorientierte Sitzung zwischen Client und Server, bevor Nutzdaten gesendet werden.",
      answers: [
        { id: "a", text: "Prüfsummen für Datenpakete berechnen", isCorrect: false },
        { id: "b", text: "Eine verbindungsorientierte TCP-Sitzung aufbauen", isCorrect: true },
        { id: "c", text: "IP-Adressen dynamisch zuweisen", isCorrect: false },
        { id: "d", text: "DNS-Auflösung durchführen", isCorrect: false },
      ],
    },
    {
      id: uid(), type: "single-choice", points: 10, blueprint: "1.1",
      text: "Welches Protokoll sendet auf UDP Port 53?",
      explanation: "DNS (Domain Name System) nutzt primär UDP Port 53 für Abfragen. Bei Antworten >512 Byte oder für Zonentransfers wird TCP 53 verwendet.",
      answers: [
        { id: "a", text: "DHCP", isCorrect: false },
        { id: "b", text: "DNS", isCorrect: true },
        { id: "c", text: "SNMP", isCorrect: false },
        { id: "d", text: "NTP", isCorrect: false },
      ],
    },
    {
      id: uid(), type: "single-choice", points: 10, blueprint: "1.1",
      text: "Was ist der Unterschied zwischen einem Hub und einem Switch?",
      explanation: "Ein Hub leitet alle Frames an alle Ports weiter (Broadcast-Domäne = alle Ports). Ein Switch lernt MAC-Adressen und leitet Frames nur an den Ziel-Port — separate Kollisionsdomänen pro Port.",
      answers: [
        { id: "a", text: "Hubs arbeiten auf Layer 3, Switches auf Layer 2", isCorrect: false },
        { id: "b", text: "Hubs leiten Frames an alle Ports; Switches nur an den Ziel-Port (MAC-Lernen)", isCorrect: true },
        { id: "c", text: "Switches sind langsamer als Hubs", isCorrect: false },
        { id: "d", text: "Hubs und Switches sind funktional identisch", isCorrect: false },
      ],
    },
    {
      id: uid(), type: "single-choice", points: 10, blueprint: "1.1",
      text: "Was ist eine Kollisionsdomäne?",
      explanation: "Eine Kollisionsdomäne umfasst alle Geräte, die gleichzeitig senden und dadurch Kollisionen verursachen können. Switches trennen Kollisionsdomänen pro Port — im Gegensatz zu Hubs.",
      answers: [
        { id: "a", text: "Ein Bereich, in dem Broadcasts empfangen werden", isCorrect: false },
        { id: "b", text: "Ein Bereich, in dem gleichzeitige Übertragungen kollidieren können", isCorrect: true },
        { id: "c", text: "Ein Subnetz mit mehr als 254 Hosts", isCorrect: false },
        { id: "d", text: "Eine VLAN-Broadcast-Domäne", isCorrect: false },
      ],
    },
    {
      id: uid(), type: "single-choice", points: 10, blueprint: "1.2",
      text: "Welches Cloud-Servicemodell stellt dem Nutzer eine komplette Anwendung bereit — ohne Verwaltung von OS oder Infrastruktur?",
      explanation: "SaaS (Software as a Service) liefert eine fertige Anwendung über das Internet. Der Nutzer verwaltet nur seine Daten und Einstellungen. Beispiel: Microsoft 365, Google Workspace.",
      answers: [
        { id: "a", text: "IaaS", isCorrect: false },
        { id: "b", text: "PaaS", isCorrect: false },
        { id: "c", text: "SaaS", isCorrect: true },
        { id: "d", text: "FaaS", isCorrect: false },
      ],
    },
    {
      id: uid(), type: "single-choice", points: 10, blueprint: "1.3",
      text: "Auf welcher OSI-Schicht arbeitet das Ethernet-Protokoll?",
      explanation: "Ethernet arbeitet auf Layer 1 (Physical — Signale, Kabel, Bit-Übertragung) und Layer 2 (Data Link — Frames, MAC-Adressen, CSMA/CD).",
      answers: [
        { id: "a", text: "Nur Layer 1", isCorrect: false },
        { id: "b", text: "Layer 2 und Layer 3", isCorrect: false },
        { id: "c", text: "Layer 1 und Layer 2", isCorrect: true },
        { id: "d", text: "Nur Layer 2", isCorrect: false },
      ],
    },
    {
      id: uid(), type: "single-choice", points: 10, blueprint: "1.3",
      text: "Was ist die maximale Kabellänge für Gigabit-Ethernet über Cat6-Kupferkabel (1000BASE-T)?",
      explanation: "Gigabit-Ethernet (1000BASE-T) über Cat5e/Cat6-Kupferkabel unterstützt maximal 100 Meter — wie alle anderen 1000BASE-T-Implementierungen auf UTP.",
      answers: [
        { id: "a", text: "55 Meter", isCorrect: false },
        { id: "b", text: "100 Meter", isCorrect: true },
        { id: "c", text: "185 Meter", isCorrect: false },
        { id: "d", text: "500 Meter", isCorrect: false },
      ],
    },
    {
      id: uid(), type: "single-choice", points: 10, blueprint: "1.4",
      text: "Welche IPv4-Adressklasse ist für 192.168.1.0/24 gültig?",
      explanation: "192.168.0.0 bis 192.168.255.255 gehört zu Klasse C (192.0.0.0 – 223.255.255.255). /24 = 254 nutzbare Hosts.",
      answers: [
        { id: "a", text: "Klasse A", isCorrect: false },
        { id: "b", text: "Klasse B", isCorrect: false },
        { id: "c", text: "Klasse C", isCorrect: true },
        { id: "d", text: "Klasse D (Multicast)", isCorrect: false },
      ],
    },
    {
      id: uid(), type: "single-choice", points: 10, blueprint: "1.4",
      text: "Welche Subnetzmaske entspricht /26?",
      explanation: "/26 = 26 Einsen: 11111111.11111111.11111111.11000000 = 255.255.255.192. Das ergibt 64 Adressen pro Subnetz (62 nutzbare Hosts).",
      answers: [
        { id: "a", text: "255.255.255.128", isCorrect: false },
        { id: "b", text: "255.255.255.192", isCorrect: true },
        { id: "c", text: "255.255.255.224", isCorrect: false },
        { id: "d", text: "255.255.255.240", isCorrect: false },
      ],
    },
    {
      id: uid(), type: "single-choice", points: 10, blueprint: "1.5",
      text: "Was ist die Funktion von ARP (Address Resolution Protocol)?",
      explanation: "ARP löst IPv4-Adressen in MAC-Adressen auf. Ein Host sendet einen ARP-Broadcast ('Wer hat IP X?'); der Zielhost antwortet mit seiner MAC-Adresse.",
      answers: [
        { id: "a", text: "IP-Adressen in Domainnamen auflösen", isCorrect: false },
        { id: "b", text: "IPv4-Adressen in MAC-Adressen auflösen", isCorrect: true },
        { id: "c", text: "Subnetzmasken automatisch berechnen", isCorrect: false },
        { id: "d", text: "Routing-Tabellen zwischen Routern austauschen", isCorrect: false },
      ],
    },
    {
      id: uid(), type: "single-choice", points: 10, blueprint: "1.6",
      text: "Was ist der Loopback-Address-Bereich in IPv4?",
      explanation: "127.0.0.0/8 ist für Loopback reserviert. 127.0.0.1 ist die bekannteste Adresse und zeigt auf das eigene Gerät. Diese Adressen verlassen niemals das Gerät.",
      answers: [
        { id: "a", text: "10.0.0.0/8", isCorrect: false },
        { id: "b", text: "127.0.0.0/8", isCorrect: true },
        { id: "c", text: "169.254.0.0/16", isCorrect: false },
        { id: "d", text: "192.168.0.0/16", isCorrect: false },
      ],
    },
    {
      id: uid(), type: "single-choice", points: 10, blueprint: "1.6",
      text: "Was bedeutet APIPA (169.254.x.x)?",
      explanation: "APIPA (Automatic Private IP Addressing) wird von Windows-Geräten vergeben, wenn kein DHCP-Server erreichbar ist. Bereich: 169.254.0.0/16. Nur zur lokalen Kommunikation geeignet.",
      answers: [
        { id: "a", text: "Eine ISP-zugewiesene öffentliche Adresse", isCorrect: false },
        { id: "b", text: "Eine privat zugewiesene Adresse wenn kein DHCP-Server erreichbar ist", isCorrect: true },
        { id: "c", text: "Ein IPv6-Tunnelprotokoll-Adressbereich", isCorrect: false },
        { id: "d", text: "Ein Cisco-eigener Adressbereich für Management", isCorrect: false },
      ],
    },
    {
      id: uid(), type: "single-choice", points: 10, blueprint: "1.7",
      text: "Wie viele nutzbare Hosts hat ein /28-Subnetz?",
      explanation: "/28 = 4 Host-Bits → 2^4 = 16 Adressen. Davon 2 reserviert (Netz + Broadcast) = 14 nutzbare Hosts.",
      answers: [
        { id: "a", text: "12", isCorrect: false },
        { id: "b", text: "14", isCorrect: true },
        { id: "c", text: "16", isCorrect: false },
        { id: "d", text: "30", isCorrect: false },
      ],
    },
    {
      id: uid(), type: "single-choice", points: 10, blueprint: "1.7",
      text: "Was ist die Broadcast-Adresse des Subnetzes 192.168.10.64/27?",
      explanation: "/27 = 32 Adressen pro Block. Blöcke: 0, 32, 64, 96... Das Subnetz 192.168.10.64 endet bei .95 (64+32-1=95). Broadcast: 192.168.10.95.",
      answers: [
        { id: "a", text: "192.168.10.79", isCorrect: false },
        { id: "b", text: "192.168.10.95", isCorrect: true },
        { id: "c", text: "192.168.10.127", isCorrect: false },
        { id: "d", text: "192.168.10.63", isCorrect: false },
      ],
    },
    {
      id: uid(), type: "single-choice", points: 10, blueprint: "1.8",
      text: "Welche IPv6-Adresse entspricht dem IPv4-Loopback 127.0.0.1?",
      explanation: "Der IPv6-Loopback ist ::1/128 (vollständig: 0000:0000:0000:0000:0000:0000:0000:0001) — das Pendant zu 127.0.0.1 in IPv4.",
      answers: [
        { id: "a", text: "FE80::1", isCorrect: false },
        { id: "b", text: "FF02::1", isCorrect: false },
        { id: "c", text: "::1", isCorrect: true },
        { id: "d", text: "2001::1", isCorrect: false },
      ],
    },
    {
      id: uid(), type: "single-choice", points: 10, blueprint: "1.9",
      text: "Was ist der Hauptzweck von ICMP?",
      explanation: "ICMP (Internet Control Message Protocol) dient zur Fehlerberichterstattung und Diagnose im IP-Netz. Bekannte Nutzungen: ping (Echo Request/Reply), traceroute (Time Exceeded), Destination Unreachable.",
      answers: [
        { id: "a", text: "Zuverlässige Datenübertragung sicherstellen", isCorrect: false },
        { id: "b", text: "IP-Adressvergabe automatisieren", isCorrect: false },
        { id: "c", text: "Fehlermeldungen und Netzwerkdiagnose", isCorrect: true },
        { id: "d", text: "Routing-Tabellen synchronisieren", isCorrect: false },
      ],
    },
    {
      id: uid(), type: "single-choice", points: 10, blueprint: "1.9",
      text: "Welches Transportprotokoll verwendet HTTPS?",
      explanation: "HTTPS (HTTP Secure) nutzt TLS/SSL zur Verschlüsselung und läuft über TCP Port 443. HTTP (unverschlüsselt) läuft über TCP Port 80.",
      answers: [
        { id: "a", text: "UDP Port 443", isCorrect: false },
        { id: "b", text: "TCP Port 80", isCorrect: false },
        { id: "c", text: "TCP Port 443", isCorrect: true },
        { id: "d", text: "UDP Port 80", isCorrect: false },
      ],
    },
    {
      id: uid(), type: "true-false", points: 5, blueprint: "1.1",
      text: "UDP bietet Zuverlässigkeit durch Sequenznummern und Bestätigungen (ACKs).",
      explanation: "Falsch. UDP (User Datagram Protocol) ist verbindungslos und bietet keine Zuverlässigkeit, Reihenfolgegarantie oder Flusskontrolle. TCP bietet diese Mechanismen. UDP ist schneller und wird für VoIP, DNS, DHCP genutzt.",
      answers: [
        { id: "a", text: "Wahr", isCorrect: false },
        { id: "b", text: "Falsch", isCorrect: true },
      ],
    },
    {
      id: uid(), type: "true-false", points: 5, blueprint: "1.3",
      text: "Multimode-Glasfaserkabel unterstützen längere Distanzen als Singlemode-Glasfaser.",
      explanation: "Falsch. Singlemode-Glasfaser (SMF) unterstützt Distanzen von mehreren Kilometern bis über 100 km (mit Verstärkern). Multimode (MMF) ist auf 300-550 m begrenzt, aber günstiger für kurze Distanzen.",
      answers: [
        { id: "a", text: "Wahr", isCorrect: false },
        { id: "b", text: "Falsch", isCorrect: true },
      ],
    },
    // ── Domain 2: Network Access (20 Q) ──────────────────────
    {
      id: uid(), type: "single-choice", points: 10, blueprint: "2.1",
      text: "Auf welchem VLAN sind alle Ports nach dem Einschalten eines neuen Cisco-Switches standardmäßig?",
      explanation: "Alle Ports sind standardmäßig in VLAN 1 (dem Default-VLAN). VLAN 1 kann nicht gelöscht oder umbenannt werden.",
      answers: [
        { id: "a", text: "VLAN 0", isCorrect: false },
        { id: "b", text: "VLAN 1", isCorrect: true },
        { id: "c", text: "VLAN 100", isCorrect: false },
        { id: "d", text: "VLAN 4094", isCorrect: false },
      ],
    },
    {
      id: uid(), type: "single-choice", points: 10, blueprint: "2.1",
      text: "Was ist ein Native VLAN bei einem 802.1Q-Trunk?",
      explanation: "Das Native VLAN ist das einzige VLAN, dessen Frames auf einem Trunk ohne 802.1Q-Tag gesendet werden. Standardmäßig VLAN 1. Cisco empfiehlt, das Native VLAN zu ändern (z. B. auf VLAN 999) aus Sicherheitsgründen.",
      answers: [
        { id: "a", text: "Das VLAN mit der höchsten ID auf dem Trunk", isCorrect: false },
        { id: "b", text: "Das VLAN, dessen Frames auf dem Trunk untagged übertragen werden", isCorrect: true },
        { id: "c", text: "Das Management-VLAN für Cisco-Geräte", isCorrect: false },
        { id: "d", text: "Ein VLAN, das nur Routing-Updates trägt", isCorrect: false },
      ],
    },
    {
      id: uid(), type: "single-choice", points: 10, blueprint: "2.2",
      text: "Was macht DTP (Dynamic Trunking Protocol)?",
      explanation: "DTP verhandelt automatisch zwischen benachbarten Cisco-Switches, ob ein Link als Trunk konfiguriert werden soll. Aus Sicherheitsgründen empfiehlt Cisco: DTP deaktivieren ('switchport nonegotiate') und Trunks manuell konfigurieren.",
      answers: [
        { id: "a", text: "Verteilt VLAN-Informationen zwischen Switches (wie VTP)", isCorrect: false },
        { id: "b", text: "Verhandelt automatisch Trunk-Konfiguration zwischen Cisco-Switches", isCorrect: true },
        { id: "c", text: "Erkennt Duplex-Mismatches auf Access-Ports", isCorrect: false },
        { id: "d", text: "Synchronisiert Spanning-Tree-Topologien", isCorrect: false },
      ],
    },
    {
      id: uid(), type: "single-choice", points: 10, blueprint: "2.2",
      text: "Welche VTP-Modi gibt es auf einem Cisco-Switch? (Richtige Kombination)",
      explanation: "VTP-Modi: Server (erstellt/bearbeitet/löscht VLANs, sendet Updates), Client (empfängt Updates, kann keine Änderungen machen), Transparent (leitet Updates weiter, nutzt eigene lokale VLAN-DB), Off (VTP deaktiviert).",
      answers: [
        { id: "a", text: "Master, Slave, Passive", isCorrect: false },
        { id: "b", text: "Server, Client, Transparent (und Off)", isCorrect: true },
        { id: "c", text: "Primary, Secondary, Observer", isCorrect: false },
        { id: "d", text: "Active, Standby, Monitor", isCorrect: false },
      ],
    },
    {
      id: uid(), type: "single-choice", points: 10, blueprint: "2.3",
      text: "Was ist der Zweck von STP (Spanning Tree Protocol)?",
      explanation: "STP (IEEE 802.1D) verhindert Layer-2-Loops (Broadcast-Storms) in redundanten Switch-Netzwerken, indem es redundante Ports in den Blocking-Zustand versetzt.",
      answers: [
        { id: "a", text: "VLANs über mehrere Switches synchronisieren", isCorrect: false },
        { id: "b", text: "Layer-2-Loops in redundanten Switch-Netzwerken verhindern", isCorrect: true },
        { id: "c", text: "Trunks automatisch konfigurieren", isCorrect: false },
        { id: "d", text: "IP-Routing zwischen VLANs ermöglichen", isCorrect: false },
      ],
    },
    {
      id: uid(), type: "single-choice", points: 10, blueprint: "2.3",
      text: "Wie wird der Root Bridge in STP ausgewählt?",
      explanation: "Der Switch mit der niedrigsten Bridge-ID (Priority + MAC) wird Root Bridge. Default-Priority: 32768. Bei gleicher Priority gewinnt die niedrigste MAC-Adresse.",
      answers: [
        { id: "a", text: "Der Switch mit der höchsten Bridge-ID wird Root Bridge", isCorrect: false },
        { id: "b", text: "Der Switch mit der niedrigsten Bridge-ID (Priority + MAC) wird Root Bridge", isCorrect: true },
        { id: "c", text: "Der erste Switch, der das Netzwerk bootet, wird Root Bridge", isCorrect: false },
        { id: "d", text: "Der Administrator wählt die Root Bridge durch VLAN-Konfiguration", isCorrect: false },
      ],
    },
    {
      id: uid(), type: "single-choice", points: 10, blueprint: "2.3",
      text: "Was ist PortFast bei Cisco STP?",
      explanation: "PortFast lässt einen STP-Port sofort in den Forwarding-State wechseln, ohne die normalen STP-Zustände (Listening, Learning) zu durchlaufen. Nur für Access-Ports zu Endgeräten geeignet — nie auf Trunk-Ports!",
      answers: [
        { id: "a", text: "Beschleunigt die Root-Bridge-Wahl", isCorrect: false },
        { id: "b", text: "Ermöglicht sofortigen Forwarding-State für Access-Ports ohne STP-Wartezeit", isCorrect: true },
        { id: "c", text: "Erhöht die STP-Priority eines Ports", isCorrect: false },
        { id: "d", text: "Deaktiviert STP auf bestimmten VLANs", isCorrect: false },
      ],
    },
    {
      id: uid(), type: "single-choice", points: 10, blueprint: "2.4",
      text: "Was ist EtherChannel und welchen Vorteil bietet es?",
      explanation: "EtherChannel (IEEE 802.3ad / LACP) bündelt mehrere physische Links zu einem logischen Link. Vorteile: höhere Bandbreite (2-8 Links), Redundanz (kein STP-Blocking), Load-Balancing.",
      answers: [
        { id: "a", text: "Ein Protokoll zur VLAN-Segmentierung über mehrere Switches", isCorrect: false },
        { id: "b", text: "Bündelung mehrerer physischer Links zu einem logischen Link für mehr Bandbreite und Redundanz", isCorrect: true },
        { id: "c", text: "Eine QoS-Technik zur Priorisierung von Ethernet-Frames", isCorrect: false },
        { id: "d", text: "Ein Sicherheitsmerkmal zur Authentifizierung von Switch-zu-Switch-Links", isCorrect: false },
      ],
    },
    {
      id: uid(), type: "single-choice", points: 10, blueprint: "2.5",
      text: "Was ist Rapid PVST+ (IEEE 802.1w)?",
      explanation: "Rapid PVST+ ist Ciscos Implementierung von Rapid Spanning Tree (802.1w) — eine pro-VLAN STP-Instanz. Konvergenz in ~1-2 Sekunden statt 30-50 Sekunden bei klassischem STP (802.1D).",
      answers: [
        { id: "a", text: "Ein EtherChannel-Protokoll für Cisco-Switches", isCorrect: false },
        { id: "b", text: "Rapid Spanning Tree per VLAN — Konvergenz in ~1-2 Sekunden", isCorrect: true },
        { id: "c", text: "Ein Protokoll zur automatischen VLAN-Erkennung", isCorrect: false },
        { id: "d", text: "Ein Cisco-proprietäres Trunk-Protokoll", isCorrect: false },
      ],
    },
    {
      id: uid(), type: "single-choice", points: 10, blueprint: "2.6",
      text: "Welcher 802.11-Standard nutzt ausschließlich das 5-GHz-Band?",
      explanation: "802.11a arbeitet nur im 5-GHz-Band (bis 54 Mbps). 802.11n und 802.11ac/ax unterstützen auch 5 GHz, aber 802.11a ist der einzige Standard, der ausschließlich 5 GHz nutzt.",
      answers: [
        { id: "a", text: "802.11b", isCorrect: false },
        { id: "b", text: "802.11g", isCorrect: false },
        { id: "c", text: "802.11a", isCorrect: true },
        { id: "d", text: "802.11n", isCorrect: false },
      ],
    },
    {
      id: uid(), type: "single-choice", points: 10, blueprint: "2.6",
      text: "Was ist der Unterschied zwischen WPA2 Personal und WPA2 Enterprise?",
      explanation: "WPA2 Personal: Pre-Shared Key (PSK) — alle Nutzer teilen dasselbe Passwort. WPA2 Enterprise: 802.1X-Authentifizierung mit RADIUS-Server — individuelle Credentials pro Nutzer, sicherer für Unternehmen.",
      answers: [
        { id: "a", text: "WPA2 Personal bietet stärkere Verschlüsselung als Enterprise", isCorrect: false },
        { id: "b", text: "WPA2 Personal nutzt PSK; Enterprise nutzt 802.1X mit RADIUS", isCorrect: true },
        { id: "c", text: "WPA2 Enterprise ist nur für öffentliche WLAN-Netze", isCorrect: false },
        { id: "d", text: "WPA2 Personal unterstützt mehr Geräte gleichzeitig", isCorrect: false },
      ],
    },
    {
      id: uid(), type: "true-false", points: 5, blueprint: "2.1",
      text: "Bei einem 802.1Q-Trunk werden Frames des Native VLAN mit einem Tag versehen.",
      explanation: "Falsch. Das Native VLAN ist das einzige VLAN, dessen Frames auf einem 802.1Q-Trunk ohne Tag (untagged) übertragen werden. Alle anderen VLANs erhalten einen 802.1Q-Tag.",
      answers: [
        { id: "a", text: "Wahr", isCorrect: false },
        { id: "b", text: "Falsch", isCorrect: true },
      ],
    },
    {
      id: uid(), type: "true-false", points: 5, blueprint: "2.3",
      text: "Ein STP-Designated Port ist immer im Forwarding-State.",
      explanation: "Wahr. Designated Ports sind im Forwarding-State und leiten Traffic weiter. Root Ports ebenfalls. Nur Non-Designated (Alternate) Ports sind im Blocking-State.",
      answers: [
        { id: "a", text: "Wahr", isCorrect: true },
        { id: "b", text: "Falsch", isCorrect: false },
      ],
    },
    {
      id: uid(), type: "single-choice", points: 10, blueprint: "2.7",
      text: "Welchen Befehl nutzt man, um ein Interface als Access-Port für VLAN 20 zu konfigurieren?",
      explanation: "'switchport mode access' setzt den Port auf Access-Mode. 'switchport access vlan 20' weist VLAN 20 zu. Diese Befehle werden im Interface-Konfigurationsmodus eingegeben.",
      answers: [
        { id: "a", text: "switchport vlan 20 access", isCorrect: false },
        { id: "b", text: "switchport mode access; switchport access vlan 20", isCorrect: true },
        { id: "c", text: "vlan 20 mode access; interface assigned", isCorrect: false },
        { id: "d", text: "interface access-vlan 20", isCorrect: false },
      ],
    },
    {
      id: uid(), type: "single-choice", points: 10, blueprint: "2.7",
      text: "Wie konfiguriert man einen Cisco-Switch-Port als Trunk?",
      explanation: "'switchport mode trunk' erzwingt Trunk-Mode. Optional: 'switchport trunk encapsulation dot1q' (auf älteren Switches). Danach: 'switchport trunk allowed vlan' zur VLAN-Einschränkung.",
      answers: [
        { id: "a", text: "switchport trunk enable", isCorrect: false },
        { id: "b", text: "switchport mode trunk", isCorrect: true },
        { id: "c", text: "trunk mode on", isCorrect: false },
        { id: "d", text: "switchport dot1q trunk", isCorrect: false },
      ],
    },
    {
      id: uid(), type: "single-choice", points: 10, blueprint: "2.9",
      text: "Was ist DHCP Snooping?",
      explanation: "DHCP Snooping schützt vor Rogue-DHCP-Servern. Trusted Ports (Uplink) dürfen DHCP-Angebote weiterleiten; Untrusted Ports (Endgeräte) nur DHCP-Discover/Request. DHCP-Angebote von Untrusted Ports werden verworfen.",
      answers: [
        { id: "a", text: "Eine Methode zur DHCP-Adresspool-Überwachung", isCorrect: false },
        { id: "b", text: "Schutz vor Rogue-DHCP-Servern durch Trusted/Untrusted Port-Klassifizierung", isCorrect: true },
        { id: "c", text: "Ein Protokoll zur DHCP-Relay-Konfiguration", isCorrect: false },
        { id: "d", text: "Automatische VLAN-Zuweisung basierend auf DHCP-Antworten", isCorrect: false },
      ],
    },
    {
      id: uid(), type: "single-choice", points: 10, blueprint: "2.9",
      text: "Was ist Dynamic ARP Inspection (DAI)?",
      explanation: "DAI schützt vor ARP-Poisoning/Spoofing. Es prüft ARP-Pakete gegen die DHCP Snooping Binding Table: nur ARP-Pakete mit übereinstimmender IP/MAC-Zuordnung werden weitergeleitet.",
      answers: [
        { id: "a", text: "Eine Technik zur ARP-Cache-Beschleunigung", isCorrect: false },
        { id: "b", text: "Schutz vor ARP-Spoofing durch Validierung gegen DHCP Snooping Binding Table", isCorrect: true },
        { id: "c", text: "Dynamische MAC-Adresszuweisung für neue Geräte", isCorrect: false },
        { id: "d", text: "Ein Protokoll zur Layer-2-Loop-Erkennung", isCorrect: false },
      ],
    },
    {
      id: uid(), type: "single-choice", points: 10, blueprint: "2.9",
      text: "Was macht Port Security 'sticky' auf einem Cisco-Switch?",
      explanation: "Mit 'switchport port-security mac-address sticky' lernt der Switch dynamisch die erste MAC-Adresse und speichert sie als statische Secure MAC. Diese Adresse bleibt auch nach Neustart erhalten (wird in die running-config gespeichert).",
      answers: [
        { id: "a", text: "Der Port bleibt dauerhaft im err-disabled-Zustand", isCorrect: false },
        { id: "b", text: "Dynamisch gelernte MACs werden als statische Secure MACs gespeichert", isCorrect: true },
        { id: "c", text: "Der Port akzeptiert alle MAC-Adressen ohne Limit", isCorrect: false },
        { id: "d", text: "Der Port sendet BPDU-Guard-Benachrichtigungen", isCorrect: false },
      ],
    },
    {
      id: uid(), type: "true-false", points: 5, blueprint: "2.6",
      text: "802.11ac (Wi-Fi 5) arbeitet nur im 5-GHz-Frequenzband.",
      explanation: "Wahr. 802.11ac arbeitet ausschließlich im 5-GHz-Band. Für Dual-Band (2,4 + 5 GHz) müssen Access Points zusätzlich 802.11n oder 802.11ax (Wi-Fi 6) unterstützen.",
      answers: [
        { id: "a", text: "Wahr", isCorrect: true },
        { id: "b", text: "Falsch", isCorrect: false },
      ],
    },
    {
      id: uid(), type: "true-false", points: 5, blueprint: "2.4",
      text: "LACP (Link Aggregation Control Protocol) ist ein Cisco-proprietäres Protokoll.",
      explanation: "Falsch. LACP ist ein IEEE-Standard (802.3ad). Das Cisco-proprietäre Pendant heißt PAgP (Port Aggregation Protocol). Beide werden für EtherChannel genutzt.",
      answers: [
        { id: "a", text: "Wahr", isCorrect: false },
        { id: "b", text: "Falsch", isCorrect: true },
      ],
    },
    // ── Domain 3: IP Connectivity / Routing (20 Q) ───────────
    {
      id: uid(), type: "single-choice", points: 10, blueprint: "3.1",
      text: "Was ist der Unterschied zwischen einer statischen und einer dynamischen Route?",
      explanation: "Statische Routen werden manuell vom Administrator konfiguriert und ändern sich nicht automatisch. Dynamische Routen werden durch Routing-Protokolle (OSPF, EIGRP, BGP) automatisch gelernt und aktualisiert.",
      answers: [
        { id: "a", text: "Statische Routen sind schneller als dynamische Routen", isCorrect: false },
        { id: "b", text: "Statische Routen sind manuell konfiguriert; dynamische werden durch Routing-Protokolle gelernt", isCorrect: true },
        { id: "c", text: "Dynamische Routen haben immer eine höhere Administrative Distance", isCorrect: false },
        { id: "d", text: "Statische Routen werden automatisch nach 24h gelöscht", isCorrect: false },
      ],
    },
    {
      id: uid(), type: "single-choice", points: 10, blueprint: "3.1",
      text: "Welche Administrative Distance hat OSPF standardmäßig auf Cisco-Routern?",
      explanation: "Administrative Distance (AD) bei Cisco: Connected=0, Static=1, EIGRP=90, OSPF=110, IS-IS=115, RIP=120. Niedrigere AD = höhere Vertrauenswürdigkeit.",
      answers: [
        { id: "a", text: "90", isCorrect: false },
        { id: "b", text: "100", isCorrect: false },
        { id: "c", text: "110", isCorrect: true },
        { id: "d", text: "120", isCorrect: false },
      ],
    },
    {
      id: uid(), type: "single-choice", points: 10, blueprint: "3.2",
      text: "Was ist der Unterschied zwischen einem Link-State- und einem Distance-Vector-Routing-Protokoll?",
      explanation: "Link-State (OSPF, IS-IS): Jeder Router hat vollständige Topologiekarte (LSDB), berechnet kürzeste Pfade via Dijkstra. Distance Vector (RIP, EIGRP): Router kennen nur Entfernungen zu Zielen, lernen von Nachbarn ('Routing by Rumor').",
      answers: [
        { id: "a", text: "Distance-Vector-Protokolle sind immer schneller konvergent", isCorrect: false },
        { id: "b", text: "Link-State-Router haben vollständige Topologiekarte; Distance-Vector-Router nur Entfernungen", isCorrect: true },
        { id: "c", text: "Link-State-Protokolle sind Cisco-proprietär", isCorrect: false },
        { id: "d", text: "Distance-Vector-Protokolle unterstützen kein VLSM", isCorrect: false },
      ],
    },
    {
      id: uid(), type: "single-choice", points: 10, blueprint: "3.3",
      text: "Was beschreibt die 'longest prefix match' Regel beim IP-Routing?",
      explanation: "Wenn mehrere Routen auf ein Ziel passen, wählt der Router die Route mit dem längsten (spezifischsten) Präfix. Beispiel: 192.168.1.0/24 gewinnt über 0.0.0.0/0 (Default Route) für Pakete an 192.168.1.x.",
      answers: [
        { id: "a", text: "Der Router wählt die Route mit der niedrigsten Metrik", isCorrect: false },
        { id: "b", text: "Der Router wählt die spezifischste (längste Präfixlänge) passende Route", isCorrect: true },
        { id: "c", text: "Der Router verteilt Traffic gleichmäßig auf alle passenden Routen", isCorrect: false },
        { id: "d", text: "Der Router wählt die Route mit der niedrigsten Administrative Distance", isCorrect: false },
      ],
    },
    {
      id: uid(), type: "single-choice", points: 10, blueprint: "3.4",
      text: "Was ist eine Floating Static Route?",
      explanation: "Eine Floating Static Route ist eine statische Route mit absichtlich hoher Administrative Distance (z. B. 200), die als Backup dient. Sie wird nur aktiv, wenn die bevorzugte dynamische Route (z. B. OSPF AD=110) ausfällt.",
      answers: [
        { id: "a", text: "Eine statische Route, die sich automatisch anpasst", isCorrect: false },
        { id: "b", text: "Eine Backup-Route mit hoher AD, die nur bei Ausfall der primären Route aktiv wird", isCorrect: true },
        { id: "c", text: "Eine Route für DHCP-floating-Adressen", isCorrect: false },
        { id: "d", text: "Eine default-Route für Internet-Traffic", isCorrect: false },
      ],
    },
    {
      id: uid(), type: "single-choice", points: 10, blueprint: "3.5",
      text: "Welche OSPF-Nachbarschaftsbedingungen müssen auf zwei Routern übereinstimmen? (Hauptbedingungen)",
      explanation: "OSPF-Nachbarn müssen übereinstimmen bei: gleiche Area-ID, gleicher Hello/Dead-Timer, gleiches MTU (für Full-Adjacency), gleicher Stub-Area-Flag, gleiche Authentifizierung. Router-ID muss eindeutig sein, aber nicht übereinstimmen.",
      answers: [
        { id: "a", text: "Router-ID, AS-Nummer, Bandbreite", isCorrect: false },
        { id: "b", text: "Area-ID, Hello/Dead-Timer, MTU (und Stub-Flag, Auth)", isCorrect: true },
        { id: "c", text: "VLAN-ID, Subnetzmaske, Prozess-ID", isCorrect: false },
        { id: "d", text: "Hostname, IP-Adresse, Gateway", isCorrect: false },
      ],
    },
    {
      id: uid(), type: "single-choice", points: 10, blueprint: "3.5",
      text: "Was ist eine OSPF Designated Router (DR)?",
      explanation: "Auf Multi-Access-Netzwerken (Ethernet) wird ein DR gewählt, um LSA-Flooding zu reduzieren. Alle OSPF-Router bauen Adjacency zum DR (und BDR) auf statt untereinander — das reduziert die Anzahl der Adjacencies von n(n-1)/2 auf n.",
      answers: [
        { id: "a", text: "Der Router mit der höchsten OSPF-Metrik wird DR", isCorrect: false },
        { id: "b", text: "Der DR reduziert LSA-Flooding auf Multi-Access-Netzwerken", isCorrect: true },
        { id: "c", text: "Der DR ist der einzige Router, der in eine andere OSPF-Area routen kann", isCorrect: false },
        { id: "d", text: "Der DR synchronisiert NTP für alle OSPF-Router", isCorrect: false },
      ],
    },
    {
      id: uid(), type: "single-choice", points: 10, blueprint: "3.5",
      text: "Wie berechnet OSPF die Kosten (Cost) einer Route?",
      explanation: "OSPF Cost = Referenzbandbreite / Interface-Bandbreite. Default-Referenz: 100 Mbps. FastEthernet (100 Mbps) = Cost 1. Gigabit (1000 Mbps) = Cost 1 (gerundet). Um GigE/10GigE zu unterscheiden: 'auto-cost reference-bandwidth 10000' auf allen Routern setzen.",
      answers: [
        { id: "a", text: "Hop-Count (Anzahl der Router bis zum Ziel)", isCorrect: false },
        { id: "b", text: "Referenzbandbreite / Interface-Bandbreite", isCorrect: true },
        { id: "c", text: "Latenz + Bandbreite + Zuverlässigkeit (Composite Metric)", isCorrect: false },
        { id: "d", text: "Manuell konfigurierte Administrative Distance", isCorrect: false },
      ],
    },
    {
      id: uid(), type: "single-choice", points: 10, blueprint: "3.6",
      text: "Was ist Inter-VLAN-Routing und welche Methoden gibt es?",
      explanation: "Inter-VLAN-Routing verbindet Geräte aus verschiedenen VLANs auf Layer 3. Methoden: (1) Router-on-a-Stick (Subinterfaces auf Trunk), (2) Layer-3-Switch mit SVIs (Switched Virtual Interfaces), (3) separater Router pro VLAN.",
      answers: [
        { id: "a", text: "Routing zwischen IPv4 und IPv6 (Dual Stack)", isCorrect: false },
        { id: "b", text: "Layer-3-Verbindung zwischen verschiedenen VLANs via Router oder L3-Switch", isCorrect: true },
        { id: "c", text: "Verbindung von VLANs ohne Router durch Trunks", isCorrect: false },
        { id: "d", text: "VLAN-Übertragung zwischen verschiedenen Rechenzentren via WAN", isCorrect: false },
      ],
    },
    {
      id: uid(), type: "single-choice", points: 10, blueprint: "3.6",
      text: "Welche Cisco IOS-Konfiguration aktiviert Router-on-a-Stick für VLAN 10?",
      explanation: "Subinterface auf dem physischen Interface: 'interface Gi0/0.10' → 'encapsulation dot1Q 10' → 'ip address 192.168.10.1 255.255.255.0'. Das physische Interface braucht kein 'ip address'.",
      answers: [
        { id: "a", text: "interface Gi0/0; ip address 192.168.10.1/24; vlan 10", isCorrect: false },
        { id: "b", text: "interface Gi0/0.10; encapsulation dot1Q 10; ip address 192.168.10.1 255.255.255.0", isCorrect: true },
        { id: "c", text: "interface vlan10; ip address 192.168.10.1 255.255.255.0", isCorrect: false },
        { id: "d", text: "ip routing vlan 10 gateway 192.168.10.1", isCorrect: false },
      ],
    },
    {
      id: uid(), type: "true-false", points: 5, blueprint: "3.1",
      text: "Eine Default-Route (0.0.0.0/0) entspricht dem kürzesten Präfix und wird nur gewählt, wenn keine spezifischere Route existiert.",
      explanation: "Wahr. 0.0.0.0/0 hat das kürzeste Präfix und passt auf alle Ziele. Durch Longest-Prefix-Match werden spezifischere Routen bevorzugt. Die Default-Route wird nur als 'letzter Ausweg' genutzt.",
      answers: [
        { id: "a", text: "Wahr", isCorrect: true },
        { id: "b", text: "Falsch", isCorrect: false },
      ],
    },
    {
      id: uid(), type: "true-false", points: 5, blueprint: "3.5",
      text: "OSPF-Router in verschiedenen Areas können nur über Area 0 (Backbone Area) kommunizieren.",
      explanation: "Wahr. In OSPF muss jede Non-Backbone-Area direkt mit Area 0 verbunden sein (oder über einen Virtual Link). Inter-Area-Traffic wird immer über Area 0 geleitet.",
      answers: [
        { id: "a", text: "Wahr", isCorrect: true },
        { id: "b", text: "Falsch", isCorrect: false },
      ],
    },
    {
      id: uid(), type: "single-choice", points: 10, blueprint: "3.4",
      text: "Was ist HSRP (Hot Standby Router Protocol)?",
      explanation: "HSRP ist ein Cisco-proprietäres FHRP, das eine virtuelle IP und MAC für Default-Gateway-Redundanz bereitstellt. Active Router verarbeitet Traffic; Standby-Router übernimmt bei Ausfall. Virtual MAC: 0000.0C07.ACxx (xx=HSRP-Gruppe).",
      answers: [
        { id: "a", text: "Ein Cisco-Protokoll zur automatischen Router-Konfiguration", isCorrect: false },
        { id: "b", text: "Ein FHRP für Default-Gateway-Redundanz mit Active/Standby-Routern", isCorrect: true },
        { id: "c", text: "Ein Routing-Protokoll für kleine Netzwerke", isCorrect: false },
        { id: "d", text: "Eine Methode zur NAT-Redundanz", isCorrect: false },
      ],
    },
    {
      id: uid(), type: "single-choice", points: 10, blueprint: "3.4",
      text: "Welcher Befehl zeigt die IPv4-Routing-Tabelle auf einem Cisco-Router?",
      explanation: "'show ip route' zeigt die vollständige IPv4-Routing-Tabelle mit Quellen (C=Connected, S=Static, O=OSPF, D=EIGRP, R=RIP) und Metriken.",
      answers: [
        { id: "a", text: "show routing-table ipv4", isCorrect: false },
        { id: "b", text: "show ip route", isCorrect: true },
        { id: "c", text: "display ip routing", isCorrect: false },
        { id: "d", text: "show routes all", isCorrect: false },
      ],
    },
    {
      id: uid(), type: "single-choice", points: 10, blueprint: "3.4",
      text: "Welche OSPF-Nachbarschaftszustände gibt es in der richtigen Reihenfolge?",
      explanation: "OSPF-Zustände: Down → Init → 2-Way → ExStart → Exchange → Loading → Full. 2-Way: Hellos empfangen. Full: alle LSAs ausgetauscht, vollständige Adjacency.",
      answers: [
        { id: "a", text: "Down → Attempt → Init → 2-Way → Full", isCorrect: false },
        { id: "b", text: "Down → Init → 2-Way → ExStart → Exchange → Loading → Full", isCorrect: true },
        { id: "c", text: "Init → Establish → Learn → Active → Full", isCorrect: false },
        { id: "d", text: "Start → Connect → OpenConfirm → Established", isCorrect: false },
      ],
    },
    {
      id: uid(), type: "single-choice", points: 10, blueprint: "3.5",
      text: "Was ist eine OSPF Stub Area?",
      explanation: "Eine Stub Area akzeptiert keine External LSAs (Type 5) aus dem OSPF-Netz. Stattdessen injiziert der ABR eine Default-Route in die Stub Area. Vorteil: kleinere LSDB, weniger Speicher für Access-Router.",
      answers: [
        { id: "a", text: "Eine Area ohne Router-Adjacencies (nur Hosts)", isCorrect: false },
        { id: "b", text: "Eine Area, die keine externen LSAs akzeptiert und stattdessen eine Default-Route nutzt", isCorrect: true },
        { id: "c", text: "Eine verschlüsselte OSPF-Area für sichere Kommunikation", isCorrect: false },
        { id: "d", text: "Eine temporäre Area während der OSPF-Konvergenz", isCorrect: false },
      ],
    },
    {
      id: uid(), type: "single-choice", points: 10, blueprint: "3.2",
      text: "Was ist 'Summarization' (Route Aggregation) in OSPF?",
      explanation: "Route Summarization fasst mehrere spezifische Routen zu einer aggregierten Route zusammen. Vorteil: kleinere Routing-Tabellen, weniger LSA-Updates, schnellere Konvergenz. In OSPF: ABR kann Inter-Area Summary LSAs (Type 3) senden.",
      answers: [
        { id: "a", text: "Das Zusammenführen von zwei OSPF-Prozessen", isCorrect: false },
        { id: "b", text: "Das Zusammenfassen mehrerer spezifischer Routen zu einer aggregierten Route", isCorrect: true },
        { id: "c", text: "Die OSPF-Authentifizierungsmethode", isCorrect: false },
        { id: "d", text: "Die Berechnung der OSPF-Metrik", isCorrect: false },
      ],
    },
    {
      id: uid(), type: "true-false", points: 5, blueprint: "3.6",
      text: "Eine SVI (Switched Virtual Interface) auf einem Layer-3-Switch kann für Inter-VLAN-Routing genutzt werden.",
      explanation: "Wahr. SVIs sind virtuelle Layer-3-Interfaces für VLANs auf einem L3-Switch. Mit 'ip routing' aktiviert man das Routing zwischen SVIs — effizienter als Router-on-a-Stick.",
      answers: [
        { id: "a", text: "Wahr", isCorrect: true },
        { id: "b", text: "Falsch", isCorrect: false },
      ],
    },
    // ── Domain 4: IP Services (15 Q) ─────────────────────────
    {
      id: uid(), type: "single-choice", points: 10, blueprint: "4.1",
      text: "Was ist PAT (Port Address Translation)?",
      explanation: "PAT (auch NAT Overload) übersetzt viele private IP-Adressen auf eine öffentliche IP durch Nutzung verschiedener Quell-TCP/UDP-Ports. Der Router erstellt eine NAT-Tabelle mit IP:Port-Mappings.",
      answers: [
        { id: "a", text: "Eine 1:1-Übersetzung von privaten auf öffentliche IP-Adressen", isCorrect: false },
        { id: "b", text: "Übersetzung vieler privater IPs auf eine öffentliche IP via Quell-Port-Multiplexing", isCorrect: true },
        { id: "c", text: "Dynamische Zuweisung öffentlicher IPs aus einem Pool", isCorrect: false },
        { id: "d", text: "Übersetzung von IPv4 auf IPv6-Adressen", isCorrect: false },
      ],
    },
    {
      id: uid(), type: "single-choice", points: 10, blueprint: "4.1",
      text: "Was ist der Cisco IOS-Befehl für NAT Overload (PAT) auf dem Outside-Interface?",
      explanation: "'ip nat inside source list [ACL] interface [outside-if] overload' aktiviert PAT. Das 'overload' Keyword aktiviert Port-Multiplexing auf der Outside-IP.",
      answers: [
        { id: "a", text: "ip nat overload outside interface", isCorrect: false },
        { id: "b", text: "ip nat inside source list ACL interface Gi0/1 overload", isCorrect: true },
        { id: "c", text: "nat pat enable outside Gi0/1", isCorrect: false },
        { id: "d", text: "ip nat pool outside overload", isCorrect: false },
      ],
    },
    {
      id: uid(), type: "single-choice", points: 10, blueprint: "4.2",
      text: "Was ist NTP (Network Time Protocol) und warum ist es wichtig?",
      explanation: "NTP synchronisiert Uhrzeiten zwischen Netzwerkgeräten. Wichtig für: Syslog-Korrelation (korrekte Zeitstempel), Kerberos-Auth, Zertifikatsgültigkeit, Forensik. NTP nutzt UDP Port 123.",
      answers: [
        { id: "a", text: "Ein Protokoll zur Netzwerk-Topologie-Entdeckung", isCorrect: false },
        { id: "b", text: "Synchronisiert Uhrzeiten zwischen Geräten (wichtig für Logs und Auth) via UDP 123", isCorrect: true },
        { id: "c", text: "Ein Protokoll zur automatischen VLAN-Konfiguration", isCorrect: false },
        { id: "d", text: "Ein Monitoring-Protokoll für Interface-Statistiken", isCorrect: false },
      ],
    },
    {
      id: uid(), type: "single-choice", points: 10, blueprint: "4.3",
      text: "Was ist SNMP und welche Version wird für sichere Kommunikation empfohlen?",
      explanation: "SNMP (Simple Network Management Protocol) überwacht und verwaltet Netzwerkgeräte. SNMPv1/v2c nutzen Community-Strings (Klartext). SNMPv3 bietet Auth (MD5/SHA) und Verschlüsselung (DES/AES) — empfohlen für Produktionsumgebungen.",
      answers: [
        { id: "a", text: "SNMP dient zur Adressvergabe; SNMPv2c ist am sichersten", isCorrect: false },
        { id: "b", text: "SNMP überwacht Netzwerkgeräte; SNMPv3 wird für sichere Kommunikation empfohlen", isCorrect: true },
        { id: "c", text: "SNMPv1 bietet die stärkste Verschlüsselung", isCorrect: false },
        { id: "d", text: "SNMP arbeitet auf TCP Port 161", isCorrect: false },
      ],
    },
    {
      id: uid(), type: "single-choice", points: 10, blueprint: "4.4",
      text: "Welche DHCP-Nachrichten werden beim DORA-Prozess ausgetauscht (richtige Reihenfolge)?",
      explanation: "DORA: Discover (Broadcast vom Client) → Offer (Unicast/Broadcast vom Server) → Request (Broadcast vom Client) → Acknowledge (Unicast/Broadcast vom Server). Erst nach Ack hat der Client die Adresse.",
      answers: [
        { id: "a", text: "Discover → Request → Offer → Acknowledge", isCorrect: false },
        { id: "b", text: "Discover → Offer → Request → Acknowledge", isCorrect: true },
        { id: "c", text: "Request → Offer → Discover → Acknowledge", isCorrect: false },
        { id: "d", text: "Offer → Discover → Acknowledge → Request", isCorrect: false },
      ],
    },
    {
      id: uid(), type: "single-choice", points: 10, blueprint: "4.4",
      text: "Was ist ein DHCP-Relay-Agent (ip helper-address)?",
      explanation: "'ip helper-address' auf einem Router-Interface leitet DHCP-Broadcast-Anfragen als Unicast an den DHCP-Server weiter — ermöglicht einen zentralen DHCP-Server für mehrere Subnetze.",
      answers: [
        { id: "a", text: "Ein Redundanz-DHCP-Server für Ausfallsicherheit", isCorrect: false },
        { id: "b", text: "Leitet DHCP-Broadcasts als Unicast an einen entfernten DHCP-Server weiter", isCorrect: true },
        { id: "c", text: "Ein Protokoll zur DHCP-Adresspool-Erweiterung", isCorrect: false },
        { id: "d", text: "Eine Methode zur statischen IP-Reservierung per MAC-Adresse", isCorrect: false },
      ],
    },
    {
      id: uid(), type: "single-choice", points: 10, blueprint: "4.5",
      text: "Was ist Syslog und auf welchem Protokoll/Port arbeitet es?",
      explanation: "Syslog ist ein Standard für Logging-Nachrichten (RFC 5424). Es nutzt UDP Port 514 (traditionell) oder TCP 6514 (sicheres Syslog über TLS). Geräte senden Meldungen an einen zentralen Syslog-Server.",
      answers: [
        { id: "a", text: "Ein Datenbankprotokoll für Konfig-Backups auf TCP 443", isCorrect: false },
        { id: "b", text: "Ein Logging-Standard; UDP Port 514 (oder TCP 6514 für sicheres Syslog)", isCorrect: true },
        { id: "c", text: "Ein Netzwerkdiagnoseprotokoll auf UDP 161", isCorrect: false },
        { id: "d", text: "Ein Protokoll zur Zeitsynchronisation auf UDP 123", isCorrect: false },
      ],
    },
    {
      id: uid(), type: "true-false", points: 5, blueprint: "4.1",
      text: "Static NAT bildet eine öffentliche IP-Adresse dauerhaft auf eine private Adresse ab.",
      explanation: "Wahr. Static NAT (1:1-Mapping) ordnet eine öffentliche IP dauerhaft einer privaten IP zu. Wird für Server genutzt, die aus dem Internet erreichbar sein müssen (z. B. Webserver).",
      answers: [
        { id: "a", text: "Wahr", isCorrect: true },
        { id: "b", text: "Falsch", isCorrect: false },
      ],
    },
    {
      id: uid(), type: "single-choice", points: 10, blueprint: "4.6",
      text: "Was ist NetFlow und wofür wird es eingesetzt?",
      explanation: "NetFlow ist ein Cisco-Protokoll zur Netzwerkverkehrsanalyse. Es exportiert Datenfluss-Metadaten (IP-Adressen, Ports, Byte-Zähler) an einen NetFlow-Collector für Kapazitätsplanung, Security-Analyse und Troubleshooting.",
      answers: [
        { id: "a", text: "Ein Protokoll zur VLAN-Konfiguration", isCorrect: false },
        { id: "b", text: "Cisco-Protokoll zur Netzwerkverkehrsanalyse — exportiert Flussdaten an Collector", isCorrect: true },
        { id: "c", text: "Ein Routing-Protokoll für IP-Datenflüsse", isCorrect: false },
        { id: "d", text: "Ein Protokoll zur Bandbreitenreservierung (QoS)", isCorrect: false },
      ],
    },
    {
      id: uid(), type: "single-choice", points: 10, blueprint: "4.7",
      text: "Welche Syslog-Severity gibt es für kritische Systemfehler (Severity 2)?",
      explanation: "Syslog-Severity-Level: 0=Emergency, 1=Alert, 2=Critical, 3=Error, 4=Warning, 5=Notice, 6=Informational, 7=Debug. Merkhilfe: 'Every Awful Crisis Exists Warning Notice Information Debug'.",
      answers: [
        { id: "a", text: "Error (3)", isCorrect: false },
        { id: "b", text: "Alert (1)", isCorrect: false },
        { id: "c", text: "Critical (2)", isCorrect: true },
        { id: "d", text: "Emergency (0)", isCorrect: false },
      ],
    },
    {
      id: uid(), type: "true-false", points: 5, blueprint: "4.4",
      text: "Der Cisco IOS-Befehl 'ip dhcp excluded-address' verhindert, dass bestimmte Adressen aus dem DHCP-Pool vergeben werden.",
      explanation: "Wahr. 'ip dhcp excluded-address 192.168.1.1 192.168.1.10' schließt einen Adressbereich von der automatischen Vergabe aus — typischerweise für Router-IPs, Server und Drucker, die statische Adressen haben.",
      answers: [
        { id: "a", text: "Wahr", isCorrect: true },
        { id: "b", text: "Falsch", isCorrect: false },
      ],
    },
    {
      id: uid(), type: "true-false", points: 5, blueprint: "4.2",
      text: "NTP Stratum 1 Server sind direkt mit einer Referenzuhr (z. B. GPS, Atomuhr) verbunden.",
      explanation: "Wahr. Stratum 0 = Referenzuhr (GPS, Atomuhr — nicht im Netz). Stratum 1 = NTP-Server direkt an Stratum-0-Gerät. Stratum 2 = synchronisiert von Stratum 1. Je höher der Stratum, desto ungenauer.",
      answers: [
        { id: "a", text: "Wahr", isCorrect: true },
        { id: "b", text: "Falsch", isCorrect: false },
      ],
    },
    {
      id: uid(), type: "single-choice", points: 10, blueprint: "4.8",
      text: "Welche Protokolle gehören zu FHRP (First Hop Redundancy Protocol)?",
      explanation: "FHRP-Protokolle: HSRP (Cisco-proprietär), VRRP (IEEE-Standard, RFC 5798), GLBP (Cisco-proprietär, unterstützt Load Balancing). Alle stellen eine virtuelle Gateway-IP/MAC bereit.",
      answers: [
        { id: "a", text: "OSPF, EIGRP, BGP", isCorrect: false },
        { id: "b", text: "HSRP, VRRP, GLBP", isCorrect: true },
        { id: "c", text: "LACP, PAgP, STP", isCorrect: false },
        { id: "d", text: "CDP, LLDP, NTP", isCorrect: false },
      ],
    },
    {
      id: uid(), type: "single-choice", points: 10, blueprint: "4.8",
      text: "Was ist der Unterschied zwischen HSRP und VRRP?",
      explanation: "HSRP ist Cisco-proprietär (RFC 2281). VRRP ist ein offener IEEE-Standard (RFC 5798). Beide bieten Default-Gateway-Redundanz. Hauptunterschiede: VRRP-Master heißt 'Master' (HSRP: Active), VRRP hat keine separate Standby-Wahl-Nachricht.",
      answers: [
        { id: "a", text: "VRRP bietet Load Balancing; HSRP nicht", isCorrect: false },
        { id: "b", text: "HSRP ist Cisco-proprietär; VRRP ist ein offener IEEE-Standard", isCorrect: true },
        { id: "c", text: "HSRP unterstützt IPv6; VRRP nur IPv4", isCorrect: false },
        { id: "d", text: "VRRP ist schneller als HSRP bei Failover", isCorrect: false },
      ],
    },
    {
      id: uid(), type: "single-choice", points: 10, blueprint: "4.4",
      text: "Was ist ein Cisco IOS-Befehl zur Überprüfung des DHCP-Lease-Status?",
      explanation: "'show ip dhcp binding' zeigt alle aktuellen DHCP-Leases (IP, MAC, Ablaufzeit). 'show ip dhcp pool' zeigt Pool-Konfiguration und Statistiken.",
      answers: [
        { id: "a", text: "show dhcp leases active", isCorrect: false },
        { id: "b", text: "show ip dhcp binding", isCorrect: true },
        { id: "c", text: "display dhcp clients", isCorrect: false },
        { id: "d", text: "show ip dhcp clients all", isCorrect: false },
      ],
    },
    // ── Domain 5: Security Fundamentals (15 Q) ───────────────
    {
      id: uid(), type: "single-choice", points: 10, blueprint: "5.1",
      text: "Was ist das CIA-Triad-Modell in der Informationssicherheit?",
      explanation: "CIA = Confidentiality (Vertraulichkeit), Integrity (Integrität), Availability (Verfügbarkeit). Diese drei Prinzipien bilden das Fundament der Informationssicherheit.",
      answers: [
        { id: "a", text: "Cisco, Internet, Access — die drei Netzwerkebenen", isCorrect: false },
        { id: "b", text: "Confidentiality, Integrity, Availability — die drei Sicherheitsprinzipien", isCorrect: true },
        { id: "c", text: "Control, Inspect, Allow — ACL-Grundprinzipien", isCorrect: false },
        { id: "d", text: "Certificate, Identity, Authentication — PKI-Konzepte", isCorrect: false },
      ],
    },
    {
      id: uid(), type: "single-choice", points: 10, blueprint: "5.2",
      text: "Was ist ein Phishing-Angriff?",
      explanation: "Phishing ist ein Social-Engineering-Angriff, bei dem Angreifer gefälschte E-Mails/Websites nutzen, um Nutzer zur Preisgabe von Credentials, Kreditkartendaten oder anderen sensiblen Informationen zu verleiten.",
      answers: [
        { id: "a", text: "Ein Angriff auf Netzwerkinfrastruktur durch Packet-Flooding", isCorrect: false },
        { id: "b", text: "Social-Engineering-Angriff via gefälschte E-Mails/Websites zur Credential-Diebstahl", isCorrect: true },
        { id: "c", text: "Eine Methode zur Umgehung von Firewalls durch verschlüsselte Tunnel", isCorrect: false },
        { id: "d", text: "Ein Angriff auf DNS-Server zur Umlenkung von Traffic", isCorrect: false },
      ],
    },
    {
      id: uid(), type: "single-choice", points: 10, blueprint: "5.3",
      text: "Was ist der Unterschied zwischen einer Stateful und einer Stateless Firewall?",
      explanation: "Stateless: Prüft jedes Paket einzeln gegen ACL-Regeln ohne Verbindungskontext. Stateful: Verfolgt den Verbindungszustand (Connection State Table) und erlaubt Rückverkehr automatisch für erlaubte Verbindungen.",
      answers: [
        { id: "a", text: "Stateful Firewalls sind immer schneller", isCorrect: false },
        { id: "b", text: "Stateful verfolgt Verbindungszustände; Stateless prüft Pakete ohne Kontext", isCorrect: true },
        { id: "c", text: "Stateless Firewalls können VPNs, Stateful nicht", isCorrect: false },
        { id: "d", text: "Der Begriff 'Stateful' bezieht sich auf Firewall-Redundanz", isCorrect: false },
      ],
    },
    {
      id: uid(), type: "single-choice", points: 10, blueprint: "5.4",
      text: "Welcher Cisco IOS-Befehl legt ein lokales Benutzerkonto mit Passwort und Privilege Level 15 an?",
      explanation: "'username admin privilege 15 secret cisco123' erstellt einen lokalen User mit verschlüsseltem Passwort und Privilege Level 15 (voller Zugriff). 'secret' nutzt MD5-Hash, 'password' Klartext.",
      answers: [
        { id: "a", text: "user admin password cisco123 privilege 15", isCorrect: false },
        { id: "b", text: "username admin privilege 15 secret cisco123", isCorrect: true },
        { id: "c", text: "create user admin priv 15 password cisco123", isCorrect: false },
        { id: "d", text: "set user admin level 15 password cisco123", isCorrect: false },
      ],
    },
    {
      id: uid(), type: "single-choice", points: 10, blueprint: "5.5",
      text: "Was ist eine ACL (Access Control List) und wo wird sie angewendet?",
      explanation: "ACLs filtern Traffic auf Router-Interfaces. Standard-ACLs filtern nur nach Quell-IP (nahe am Ziel platzieren). Extended ACLs filtern nach Quell-IP, Ziel-IP, Protokoll und Port (nahe an der Quelle platzieren).",
      answers: [
        { id: "a", text: "Eine Liste autorisierter Benutzer für SSH-Zugriff", isCorrect: false },
        { id: "b", text: "Regelwerk zum Filtern von IP-Traffic auf Router-Interfaces (Standard: Quell-IP; Extended: Src+Dst+Port)", isCorrect: true },
        { id: "c", text: "Ein Protokoll zur sicheren VLAN-Verwaltung", isCorrect: false },
        { id: "d", text: "Eine Methode zur NAT-Konfiguration", isCorrect: false },
      ],
    },
    {
      id: uid(), type: "single-choice", points: 10, blueprint: "5.5",
      text: "Welche implicit rule gilt am Ende jeder Cisco-ACL?",
      explanation: "Am Ende jeder Cisco-ACL gilt die implizite 'deny any' (deny all) Regel. Jeder Traffic, der keiner permit-Regel entspricht, wird verworfen. Diese Regel ist unsichtbar, aber immer vorhanden.",
      answers: [
        { id: "a", text: "permit any any", isCorrect: false },
        { id: "b", text: "deny any (implizites deny-all)", isCorrect: true },
        { id: "c", text: "log any", isCorrect: false },
        { id: "d", text: "forward any", isCorrect: false },
      ],
    },
    {
      id: uid(), type: "single-choice", points: 10, blueprint: "5.6",
      text: "Was ist der Unterschied zwischen IDS und IPS?",
      explanation: "IDS (Intrusion Detection System): Erkennt Angriffe und sendet Alerts — kein aktives Eingreifen. IPS (Intrusion Prevention System): Erkennt und blockiert Angriffe in Echtzeit (inline im Datenpfad). IPS bietet aktiven Schutz.",
      answers: [
        { id: "a", text: "IDS blockiert Angriffe; IPS nur erkennt", isCorrect: false },
        { id: "b", text: "IDS erkennt und alarmiert; IPS erkennt und blockiert in Echtzeit", isCorrect: true },
        { id: "c", text: "IPS wird für WLAN, IDS für kabelgebundene Netze eingesetzt", isCorrect: false },
        { id: "d", text: "IDS und IPS sind identisch — nur verschiedene Bezeichnungen", isCorrect: false },
      ],
    },
    {
      id: uid(), type: "single-choice", points: 10, blueprint: "5.7",
      text: "Was ist AAA in der Netzwerksicherheit?",
      explanation: "AAA = Authentication (Identitätsprüfung), Authorization (Zugriffsberechtigungen), Accounting (Protokollierung). TACACS+ und RADIUS sind Protokolle zur Implementierung von AAA in Cisco-Netzwerken.",
      answers: [
        { id: "a", text: "Access, Authenticate, Audit — drei Firewall-Funktionen", isCorrect: false },
        { id: "b", text: "Authentication, Authorization, Accounting — Sicherheitsframework für Netzwerkzugang", isCorrect: true },
        { id: "c", text: "Area, Address, Association — OSPF-Grundbegriffe", isCorrect: false },
        { id: "d", text: "Administer, Allow, Audit — Cisco TACACS+-Funktionen", isCorrect: false },
      ],
    },
    {
      id: uid(), type: "single-choice", points: 10, blueprint: "5.7",
      text: "Welches Protokoll bietet verschlüsselte Übertragung des gesamten Nutzdaten-Pakets bei AAA?",
      explanation: "TACACS+ verschlüsselt das gesamte Paket (inkl. Authorization und Accounting-Daten). RADIUS verschlüsselt nur das Passwort. TACACS+ ist daher sicherer, aber Cisco-proprietär.",
      answers: [
        { id: "a", text: "RADIUS", isCorrect: false },
        { id: "b", text: "TACACS+", isCorrect: true },
        { id: "c", text: "LDAP", isCorrect: false },
        { id: "d", text: "Kerberos", isCorrect: false },
      ],
    },
    {
      id: uid(), type: "single-choice", points: 10, blueprint: "5.8",
      text: "Was ist VPN (Virtual Private Network) und welche Typen gibt es?",
      explanation: "VPN schafft einen verschlüsselten Tunnel über ein unsicheres Netz. Haupttypen: Site-to-Site VPN (Router-zu-Router, permanente Verbindung), Remote Access VPN (Client-zu-Router, für mobile Mitarbeiter), SSL-VPN (über Browser/HTTPS).",
      answers: [
        { id: "a", text: "Ein Protokoll zur VLAN-Segmentierung über WAN-Leitungen", isCorrect: false },
        { id: "b", text: "Verschlüsselter Tunnel über unsicheres Netz: Site-to-Site und Remote Access VPN", isCorrect: true },
        { id: "c", text: "Eine Methode zur IP-Adressübersetzung für private Netze", isCorrect: false },
        { id: "d", text: "Ein SD-WAN-Protokoll für Cisco-Router", isCorrect: false },
      ],
    },
    {
      id: uid(), type: "true-false", points: 5, blueprint: "5.5",
      text: "Eine Extended ACL sollte möglichst nah an der Quelle des Traffics platziert werden.",
      explanation: "Wahr. Extended ACLs können nach Quell-IP, Ziel-IP und Port filtern — nahe an der Quelle platziert, blockieren sie unerwünschten Traffic früh, bevor er das Netz belastet. Standard-ACLs (nur Quell-IP) nahe am Ziel.",
      answers: [
        { id: "a", text: "Wahr", isCorrect: true },
        { id: "b", text: "Falsch", isCorrect: false },
      ],
    },
    {
      id: uid(), type: "true-false", points: 5, blueprint: "5.4",
      text: "SSH Version 2 ist sicherer als SSHv1 und sollte bevorzugt werden.",
      explanation: "Wahr. SSHv1 hat bekannte Sicherheitslücken (Protokoll-Schwächen). SSHv2 bietet stärkere Kryptografie, bessere Schlüsselaustausch-Mechanismen und ist heute Standard. Cisco IOS: 'ip ssh version 2'.",
      answers: [
        { id: "a", text: "Wahr", isCorrect: true },
        { id: "b", text: "Falsch", isCorrect: false },
      ],
    },
    {
      id: uid(), type: "single-choice", points: 10, blueprint: "5.3",
      text: "Was ist ein Rogue Access Point?",
      explanation: "Ein Rogue AP ist ein nicht autorisierter WLAN-Access-Point, der ohne Wissen des Netzwerkadministrators im Netzwerk betrieben wird. Er kann als Evil-Twin für Man-in-the-Middle-Angriffe genutzt werden.",
      answers: [
        { id: "a", text: "Ein AP, der zu viele WLAN-Clients ablehnt", isCorrect: false },
        { id: "b", text: "Ein nicht autorisierter Access Point im Netzwerk — potenzielle Sicherheitsbedrohung", isCorrect: true },
        { id: "c", text: "Ein AP im FlexConnect-Modus ohne WLC-Verbindung", isCorrect: false },
        { id: "d", text: "Ein veralteter AP mit WEP-Verschlüsselung", isCorrect: false },
      ],
    },
    {
      id: uid(), type: "single-choice", points: 10, blueprint: "5.3",
      text: "Was ist eine DoS (Denial of Service) Attacke?",
      explanation: "DoS-Angriffe überfluten ein Ziel mit Traffic oder Anfragen, um legitime Nutzer zu blockieren. DDoS (Distributed DoS) verwendet viele kompromittierte Geräte (Botnetz). Cisco-Gegenmassnahmen: CoPP (Control Plane Policing), Rate Limiting.",
      answers: [
        { id: "a", text: "Ein Angriff zur Verschlüsselung von Netzwerktraffic", isCorrect: false },
        { id: "b", text: "Überflutung eines Ziels mit Traffic um legitime Nutzer zu blockieren", isCorrect: true },
        { id: "c", text: "Diebstahl von Authentifizierungsdaten via Man-in-the-Middle", isCorrect: false },
        { id: "d", text: "Angriff auf DNS-Server zur Umlenkung von Nutzern", isCorrect: false },
      ],
    },
    {
      id: uid(), type: "single-choice", points: 10, blueprint: "5.2",
      text: "Was ist ein Man-in-the-Middle (MitM) Angriff?",
      explanation: "Bei einem MitM-Angriff positioniert sich der Angreifer zwischen zwei kommunizierende Parteien und kann Traffic mitlesen (Eavesdropping) oder modifizieren. Methoden: ARP-Poisoning, DNS-Spoofing. Schutz: TLS/SSL, HTTPS, VPN.",
      answers: [
        { id: "a", text: "Ein Angriff, bei dem Passwörter durch Brute-Force geknackt werden", isCorrect: false },
        { id: "b", text: "Angreifer positioniert sich zwischen zwei Kommunikationsparteien zum Mitlesen/Modifizieren", isCorrect: true },
        { id: "c", text: "Ein Angriff auf Netzwerkgeräte via kompromittierte Management-Software", isCorrect: false },
        { id: "d", text: "Übernahme eines Benutzerkontos durch gestohlene Session-Cookies", isCorrect: false },
      ],
    },
    // ── Domain 6: Automation & Programmability (10 Q) ────────
    {
      id: uid(), type: "single-choice", points: 10, blueprint: "6.1",
      text: "Was ist der Hauptvorteil von Netzwerkautomatisierung gegenüber manueller CLI-Konfiguration?",
      explanation: "Netzwerkautomatisierung bietet: Konsistenz (keine menschlichen Fehler), Geschwindigkeit (1000 Devices in Sekunden), Skalierbarkeit (Infrastructure as Code), Wiederholbarkeit und Dokumentierbarkeit.",
      answers: [
        { id: "a", text: "Automatisierung ist immer günstiger in der Anschaffung", isCorrect: false },
        { id: "b", text: "Konsistenz, Geschwindigkeit, Skalierbarkeit und Fehlerreduktion", isCorrect: true },
        { id: "c", text: "Automatisierungstools erfordern weniger Netzwerkkenntnisse", isCorrect: false },
        { id: "d", text: "Nur Automatisierung unterstützt IPv6", isCorrect: false },
      ],
    },
    {
      id: uid(), type: "single-choice", points: 10, blueprint: "6.2",
      text: "Was sind die HTTP-Methoden einer REST API für CRUD-Operationen?",
      explanation: "REST CRUD → HTTP: Create=POST, Read=GET, Update=PUT/PATCH, Delete=DELETE. GET ist idempotent und sicher (ändert nichts). POST/PUT/DELETE modifizieren Ressourcen.",
      answers: [
        { id: "a", text: "GET, SET, PUSH, REMOVE", isCorrect: false },
        { id: "b", text: "GET (Read), POST (Create), PUT/PATCH (Update), DELETE (Delete)", isCorrect: true },
        { id: "c", text: "READ, WRITE, UPDATE, DELETE", isCorrect: false },
        { id: "d", text: "FETCH, POST, MODIFY, REMOVE", isCorrect: false },
      ],
    },
    {
      id: uid(), type: "single-choice", points: 10, blueprint: "6.3",
      text: "Was ist der Unterschied zwischen NETCONF und RESTCONF?",
      explanation: "NETCONF: SSH (TCP 830), XML, vollständige Transaktionskontrolle mit Candidate-Datastore. RESTCONF (RFC 8040): HTTPS, JSON oder XML, vereinfachter REST-ähnlicher Zugriff. Beide verwenden YANG-Datenmodelle.",
      answers: [
        { id: "a", text: "NETCONF ist neuer und ersetzt RESTCONF vollständig", isCorrect: false },
        { id: "b", text: "NETCONF nutzt SSH/XML; RESTCONF nutzt HTTPS/JSON — beide mit YANG-Modellen", isCorrect: true },
        { id: "c", text: "RESTCONF kann keine Konfiguration ändern", isCorrect: false },
        { id: "d", text: "Nur NETCONF unterstützt YANG-Datenmodelle", isCorrect: false },
      ],
    },
    {
      id: uid(), type: "single-choice", points: 10, blueprint: "6.4",
      text: "Was ist Ansible und wie unterscheidet es sich von Terraform?",
      explanation: "Ansible: Agentless, Konfigurationsmanagement/Task-Automation, Push-basiert, YAML Playbooks. Terraform: Infrastructure-as-Code (IaC), provisioniert Infrastruktur (VMs, Netzwerke), HCL-Sprache, State-basiert. Ansible konfiguriert bestehende Systeme, Terraform erstellt Infrastruktur.",
      answers: [
        { id: "a", text: "Ansible und Terraform sind identische Tools für dasselbe Einsatzgebiet", isCorrect: false },
        { id: "b", text: "Ansible: Konfigurationsmanagement (agentless, YAML); Terraform: Infrastruktur-Provisionierung (HCL, State)", isCorrect: true },
        { id: "c", text: "Terraform konfiguriert Netzwerkgeräte; Ansible nur Cloud-Ressourcen", isCorrect: false },
        { id: "d", text: "Ansible ist nur für Linux, Terraform nur für Windows", isCorrect: false },
      ],
    },
    {
      id: uid(), type: "single-choice", points: 10, blueprint: "6.5",
      text: "Was ist SDN (Software-Defined Networking)?",
      explanation: "SDN trennt Control Plane (Routing-Entscheidungen) von der Data Plane (Forwarding). Eine zentrale Controller-Software programmiert die Weiterleitung in den Switches via Southbound APIs (z. B. OpenFlow, NETCONF).",
      answers: [
        { id: "a", text: "Ein Protokoll zur automatischen Switch-Konfiguration", isCorrect: false },
        { id: "b", text: "Trennung von Control und Data Plane — zentraler Controller programmiert Forwarding-Regeln", isCorrect: true },
        { id: "c", text: "Ein Cisco-Protokoll zur VLAN-Verwaltung", isCorrect: false },
        { id: "d", text: "Ein WAN-Optimierungsprotokoll für SD-WAN", isCorrect: false },
      ],
    },
    {
      id: uid(), type: "single-choice", points: 10, blueprint: "6.5",
      text: "Was ist Cisco DNA Center?",
      explanation: "Cisco DNA Center (Digital Network Architecture) ist Ciscos SDN-Controller für das Campus-Netzwerk. Es bietet: Intent-based Networking, automatische Konfiguration, Netzwerkanalyse, SD-Access (Fabric) und AI/ML-basierte Troubleshooting.",
      answers: [
        { id: "a", text: "Ein Cisco-WLAN-Controller für kleine Unternehmen", isCorrect: false },
        { id: "b", text: "Ciscos SDN-Controller für Campus-Netzwerke — Intent-based Networking, SD-Access", isCorrect: true },
        { id: "c", text: "Ein Cloud-basiertes NAT-Gateway", isCorrect: false },
        { id: "d", text: "Ein Cisco-Protokoll für OSPF-Automatisierung", isCorrect: false },
      ],
    },
    {
      id: uid(), type: "single-choice", points: 10, blueprint: "6.6",
      text: "Was ist JSON (JavaScript Object Notation) und wie wird es im Netzwerkkontext genutzt?",
      explanation: "JSON ist ein leichtgewichtiges Datenaustauschformat (Text, menschenlesbar). Im Netzwerk: REST-API-Antworten, RESTCONF-Konfigurationen, Ansible-Variablen. Struktur: Key-Value-Paare in geschweiften Klammern.",
      answers: [
        { id: "a", text: "Eine Programmiersprache für Netzwerkautomatisierung", isCorrect: false },
        { id: "b", text: "Leichtgewichtiges Datenaustauschformat für REST APIs, Konfigurationsdaten", isCorrect: true },
        { id: "c", text: "Ein Cisco-proprietäres Konfigurationsformat für IOS-XE", isCorrect: false },
        { id: "d", text: "Ein Protokoll zur Netzwerküberwachung", isCorrect: false },
      ],
    },
    {
      id: uid(), type: "true-false", points: 5, blueprint: "6.2",
      text: "Eine REST API ist immer zustandslos (stateless) — der Server speichert keinen Client-Sitzungsstatus.",
      explanation: "Wahr. REST (Representational State Transfer) ist per Definition stateless. Jede Anfrage muss alle nötigen Informationen enthalten. Kein Sitzungskontext auf dem Server. Authentifizierung wird bei jeder Anfrage mitgegeben (z. B. API-Token im HTTP-Header).",
      answers: [
        { id: "a", text: "Wahr", isCorrect: true },
        { id: "b", text: "Falsch", isCorrect: false },
      ],
    },
    {
      id: uid(), type: "true-false", points: 5, blueprint: "6.4",
      text: "Ansible verwendet Agenten auf den verwalteten Geräten für die Kommunikation.",
      explanation: "Falsch. Ansible ist agentless — es nutzt SSH (Linux) oder WinRM (Windows) für die Kommunikation. Kein Agent-Software auf den Zielgeräten nötig. Das vereinfacht das Deployment und Patch-Management.",
      answers: [
        { id: "a", text: "Wahr", isCorrect: false },
        { id: "b", text: "Falsch", isCorrect: true },
      ],
    },
    {
      id: uid(), type: "single-choice", points: 10, blueprint: "6.1",
      text: "Was beschreibt 'Infrastructure as Code' (IaC)?",
      explanation: "IaC verwaltet und provisioniert IT-Infrastruktur (Server, Netzwerke, Konfigurationen) durch Code/Konfigurationsdateien statt manueller Prozesse. Vorteile: Versionskontrolle (Git), Wiederholbarkeit, Peer-Review, automatisierte Tests.",
      answers: [
        { id: "a", text: "Das Schreiben von Netzwerkdokumentation in Code-Formaten", isCorrect: false },
        { id: "b", text: "Verwaltung und Provisionierung von Infrastruktur durch Code/Konfigurationsdateien (z. B. Terraform)", isCorrect: true },
        { id: "c", text: "Eine Methode zur Netzwerküberwachung via Skripte", isCorrect: false },
        { id: "d", text: "Cisco-IOS-Konfiguration im Python-Format", isCorrect: false },
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
  [QUIZ_SEGMENTIERUNG.id]: QUIZ_SEGMENTIERUNG,
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
  [QUIZ_IOS_CLI.id]: QUIZ_IOS_CLI,
  [QUIZ_DEVICE_MGMT.id]: QUIZ_DEVICE_MGMT,
  [QUIZ_FHRP.id]: QUIZ_FHRP,
  [QUIZ_WAN_VPN.id]: QUIZ_WAN_VPN,
  [QUIZ_SDN.id]: QUIZ_SDN,
  [QUIZ_AUTOMATION.id]: QUIZ_AUTOMATION,
  [QUIZ_TROUBLESHOOTING.id]: QUIZ_TROUBLESHOOTING,
  [QUIZ_GLASFASER.id]: QUIZ_GLASFASER,
  [QUIZ_STP.id]: QUIZ_STP,
  [QUIZ_SWITCHING.id]: QUIZ_SWITCHING,
  [QUIZ_ETHERCHANNEL.id]: QUIZ_ETHERCHANNEL,
  [QUIZ_VIRTUALIZATION.id]: QUIZ_VIRTUALIZATION,
  [QUIZ_CCNA_EXAM_2.id]: QUIZ_CCNA_EXAM_2,
};
