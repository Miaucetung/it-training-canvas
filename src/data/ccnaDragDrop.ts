// ============================================================
// CCNA Drag-and-Drop-Fragen (Zuordnungsfragen aus dem Prüfungspool).
// Quelle: 00-FragenBeantwortetKomplett200_301.pdf — Textlayer-Extraktion
// plus manuelle Kuratierung über die Antwort-Bilder (notes/ccna-exam/images).
// Distraktoren ("Not all … are used") tragen target: null.
// ============================================================

export interface DragDropTarget {
  id: string;
  label: string;
}

export interface DragDropItem {
  id: string;
  label: string;
  /** Ziel-ID der korrekten Zuordnung; null = Distraktor (bleibt übrig). */
  target: string | null;
}

export interface DragDropQuestion {
  id: string;
  /** Original-Aufgabenstellung (englisch, wie im Prüfungspool). */
  instruction: string;
  targets: DragDropTarget[];
  items: DragDropItem[];
  /** Kurze deutsche Erklärung, angezeigt nach dem Prüfen. */
  explanation?: string;
}

export const ccnaDragDropQuestions: DragDropQuestion[] = [
  {
    id: "dd-q0003",
    instruction: "Drag and drop the characteristics from the left onto the file transfer protocols on the right.",
    targets: [
      { id: "ftp", label: "FTP" },
      { id: "tftp", label: "TFTP" },
    ],
    items: [
      { id: "i1", label: "provides reliability when transferring files", target: "ftp" },
      { id: "i2", label: "uses ports 20 and 21", target: "ftp" },
      { id: "i3", label: "does not require user authentication", target: "tftp" },
      { id: "i4", label: "uses port 69", target: "tftp" },
    ],
    explanation:
      "FTP nutzt TCP 20/21 (verbindungsorientiert, zuverlässig, mit Login). TFTP nutzt UDP 69 — minimalistisch, ohne Authentifizierung.",
  },
  {
    id: "dd-q0012",
    instruction: "Drag and drop the networking parameters from the left onto the correct values on the right.",
    targets: [
      { id: "t1", label: "00:0C:22" },
      { id: "t2", label: "00:0C:22:83:79:A3" },
      { id: "t3", label: "192.168.1.193" },
      { id: "t4", label: "192.168.1.200" },
      { id: "t5", label: "255.255.255.192" },
    ],
    items: [
      { id: "i1", label: "NIC vendor OUI", target: "t1" },
      { id: "i2", label: "NIC MAC address", target: "t2" },
      { id: "i3", label: "default gateway", target: "t3" },
      { id: "i4", label: "host IP address", target: "t4" },
      { id: "i5", label: "subnet mask", target: "t5" },
    ],
    explanation:
      "Die OUI sind die ersten 3 Bytes der MAC (00:0C:22). Host .200 und Gateway .193 liegen im Subnetz 192.168.1.192/26 (Maske 255.255.255.192).",
  },
  {
    id: "dd-q0811",
    instruction:
      "Drag and drop the wireless standards from the left onto the number of nonoverlapping channels they support on the right.",
    targets: [
      { id: "t3ch", label: "3 Non-Overlapping Channels" },
      { id: "t23ch", label: "23 Non-Overlapping Channels" },
    ],
    items: [
      { id: "i1", label: "802.11b", target: "t3ch" },
      { id: "i2", label: "802.11g", target: "t3ch" },
      { id: "i3", label: "802.11n (2.4 GHz)", target: "t3ch" },
      { id: "i4", label: "802.11a", target: "t23ch" },
      { id: "i5", label: "802.11n (5 GHz)", target: "t23ch" },
    ],
    explanation:
      "Im 2,4-GHz-Band (b/g/n) gibt es nur die 3 überlappungsfreien Kanäle 1/6/11. Das 5-GHz-Band (a/n) bietet 23 überlappungsfreie Kanäle.",
  },
  {
    id: "dd-q0900",
    instruction:
      "Drag and drop the subnet masks from the left onto the corresponding subnets on the right. Not all subnet masks are used.",
    targets: [
      { id: "t1", label: "10.10.13.0 (126 Hosts)" },
      { id: "t2", label: "10.10.13.128 (14 Hosts)" },
      { id: "t3", label: "10.10.13.160 (6 Hosts)" },
      { id: "t4", label: "10.10.13.252 (2 Hosts)" },
    ],
    items: [
      { id: "i1", label: "255.255.255.128", target: "t1" },
      { id: "i2", label: "255.255.255.240", target: "t2" },
      { id: "i3", label: "255.255.255.248", target: "t3" },
      { id: "i4", label: "255.255.255.252", target: "t4" },
      { id: "i5", label: "255.255.255.224", target: null },
      { id: "i6", label: "255.255.255.192", target: null },
    ],
    explanation:
      "Hosts + 2 auf die nächste Zweierpotenz runden: 126→/25 (.128), 14→/28 (.240), 6→/29 (.248), 2→/30 (.252). /27 und /26 bleiben übrig.",
  },
  {
    id: "dd-q0905",
    instruction: "Drag and drop the device behaviors from the left onto the matching HSRP state on the right.",
    targets: [
      { id: "active", label: "Active" },
      { id: "learn", label: "Learn" },
      { id: "listen", label: "Listen" },
      { id: "speak", label: "Speak" },
      { id: "standby", label: "Standby" },
    ],
    items: [
      { id: "i1", label: "is forwarding packets", target: "active" },
      { id: "i2", label: "is waiting to hear from the neighbor device", target: "learn" },
      { id: "i3", label: "has heard from the neighbor device and is receiving hello packets", target: "listen" },
      { id: "i4", label: "is transmitting and receiving hello packets", target: "speak" },
      { id: "i5", label: "is ready to forward packets if the active device fails", target: "standby" },
    ],
    explanation:
      "HSRP-Reihenfolge: Learn (wartet auf Hellos) → Listen (kennt VIP, hört mit) → Speak (sendet selbst Hellos, wählt) → Standby (Ersatz) → Active (leitet weiter).",
  },
  {
    id: "dd-q1068",
    instruction: "Drag and drop the IPv6 addresses from the left onto the address types on the right.",
    targets: [
      { id: "global", label: "global unicast" },
      { id: "unique", label: "unique local" },
      { id: "linklocal", label: "link-local unicast" },
      { id: "multicast", label: "multicast" },
    ],
    items: [
      { id: "i1", label: "2000:6794:5699:e122:42e0:4236:085d:1", target: "global" },
      { id: "i2", label: "fc00:a4d3:af37:cbc6:cdbd:b73d:5561:3", target: "unique" },
      { id: "i3", label: "fe80:b680:8af8:7cc1:6df1:71e1:b8f3:7", target: "linklocal" },
      { id: "i4", label: "ff00:af60:767d:9258:e688:c478:ec75:12", target: "multicast" },
    ],
    explanation:
      "Präfixe merken: 2000::/3 global unicast, fc00::/7 unique local, fe80::/10 link-local, ff00::/8 multicast.",
  },
  {
    id: "dd-q1135",
    instruction: "Drag and drop the characteristics from the left onto the IPv6 address type on the right.",
    targets: [
      { id: "anycast", label: "Anycast" },
      { id: "multicast", label: "Multicast" },
    ],
    items: [
      { id: "i1", label: "is assigned to more than one interface", target: "anycast" },
      { id: "i2", label: "is used exclusively by a non-host device", target: "anycast" },
      { id: "i3", label: "cannot be used as a source address", target: "multicast" },
      { id: "i4", label: "provides one-to-many communications", target: "multicast" },
    ],
    explanation:
      "Anycast: dieselbe Adresse auf mehreren Interfaces (Router antworten, nicht Hosts), Pakete gehen zum nächstgelegenen. Multicast: nie Quelladresse, Eins-zu-viele-Verteilung.",
  },
  {
    id: "dd-q1327",
    instruction:
      "Drag and drop the characteristics from the left onto the wireless components on the right.",
    targets: [
      { id: "ap", label: "Access Point" },
      { id: "wlc", label: "Wireless LAN Controller" },
    ],
    items: [
      { id: "i1", label: "ability to boost a Wi-Fi signal", target: "ap" },
      { id: "i2", label: "configurable as a workgroup bridge", target: "ap" },
      { id: "i3", label: "uses templates to implement QoS configuration", target: "wlc" },
      { id: "i4", label: "supplies user connection data within a device group", target: "wlc" },
    ],
    explanation:
      "Der AP arbeitet am Funksignal (Verstärkung, Bridge-Modi); der WLC verwaltet zentral — Templates, QoS-Richtlinien und Verbindungsdaten aller APs.",
  },
  {
    id: "dd-q1093",
    instruction: "Drag and drop the characteristics from the left onto the fiber cable types on the right.",
    targets: [
      { id: "single", label: "Single-mode fiber" },
      { id: "multi", label: "Multimode fiber" },
    ],
    items: [
      { id: "i1", label: "long distance", target: "single" },
      { id: "i2", label: "single wavelength", target: "single" },
      { id: "i3", label: "commonly used with DWDM", target: "single" },
      { id: "i4", label: "core diameter of 62.5 or 50 microns", target: "multi" },
      { id: "i5", label: "multiple light paths in the core", target: "multi" },
    ],
    explanation:
      "Single-Mode: dünner Kern (~9 µm), ein Lichtpfad, große Distanzen, DWDM-tauglich. Multimode: 50/62,5-µm-Kern, mehrere Lichtpfade, kürzere Strecken.",
  },
];
