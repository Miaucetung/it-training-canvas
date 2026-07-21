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
  /** Optionaler CLI-/Exhibit-Kontext (monospace, dunkel gerendert). */
  context?: string;
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
  // ── Batch 1 (aus answer/state-Bildern kuratiert) ─────────────
  {
    id: "dd-q0005",
    instruction: "Drag and drop the IPv4 network subnets from the left onto the correct usable host ranges on the right.",
    targets: [
      { id: "t1", label: "172.28.228.1 - 172.28.229.254" },
      { id: "t2", label: "172.28.224.1 - 172.28.231.254" },
      { id: "t3", label: "172.28.228.129 - 172.28.228.254" },
      { id: "t4", label: "172.28.228.145 - 172.28.228.150" },
      { id: "t5", label: "172.28.192.1 - 172.28.255.254" },
    ],
    items: [
      { id: "i1", label: "172.28.228.144/18", target: "t5" },
      { id: "i2", label: "172.28.228.144/21", target: "t2" },
      { id: "i3", label: "172.28.228.144/23", target: "t1" },
      { id: "i4", label: "172.28.228.144/25", target: "t3" },
      { id: "i5", label: "172.28.228.144/29", target: "t4" },
    ],
    explanation:
      "Netz-ID aus Präfix ableiten: /18→172.28.192.0, /21→172.28.224.0, /23→172.28.228.0, /25→172.28.228.128, /29→172.28.228.144. Nutzbarer Bereich = Netz-ID+1 bis Broadcast−1.",
  },
  {
    id: "dd-q0132",
    instruction:
      "The IP address configurations must be completed on the DC-1 and HQ-1 routers based on these requirements: DC-1 Gi1/0 must be the last usable address on a /30; DC-1 Gi1/1 must be the first usable address on a /29; DC-1 Gi1/2 must be the last usable address on a /28; HQ-1 Gi1/3 must be the last usable address on a /29. Drag and drop the commands from the left onto the destination interfaces on the right. Not all commands are used.",
    targets: [
      { id: "gi10", label: "DC-1 Gi1/0" },
      { id: "gi11", label: "DC-1 Gi1/1" },
      { id: "gi12", label: "DC-1 Gi1/2" },
      { id: "gi13", label: "HQ-1 Gi1/3" },
    ],
    items: [
      { id: "i1", label: "ip address 209.165.202.130 255.255.255.252", target: "gi10" },
      { id: "i2", label: "ip address 192.168.4.9 255.255.255.248", target: "gi11" },
      { id: "i3", label: "ip address 192.168.3.14 255.255.255.240", target: "gi12" },
      { id: "i4", label: "ip address 192.168.3.14 255.255.255.248", target: "gi13" },
      { id: "i5", label: "ip address 192.168.4.13 255.255.255.240", target: null },
      { id: "i6", label: "ip address 209.165.202.129 255.255.255.252", target: null },
      { id: "i7", label: "ip address 209.165.202.131 255.255.255.252", target: null },
    ],
    explanation:
      "/30 209.165.202.128: letzte nutzbare .130. /29 192.168.4.8: erste nutzbare .9. /28 192.168.3.0: letzte nutzbare .14 (Maske .240). /29 192.168.3.8: letzte nutzbare .14 (Maske .248).",
  },
  {
    id: "dd-q0134",
    instruction: "Drag and drop the IPv6 address types from the left onto their descriptions on the right.",
    targets: [
      { id: "t1", label: "multicast address used only locally within the site" },
      { id: "t2", label: "address that is automatically created on a link when IPv6 is enabled on an interface" },
      { id: "t3", label: "address that is prohibited from routing to the Internet" },
      { id: "t4", label: "address that is unique and reserved for documentation purposes" },
    ],
    items: [
      { id: "i1", label: "FF05::23:becf:22:1111", target: "t1" },
      { id: "i2", label: "FE80::abcdf:ffff:12de:3992", target: "t2" },
      { id: "i3", label: "FD00:0000:0000:1a2d:a153:3992:a19d:cca", target: "t3" },
      { id: "i4", label: "2001:DB8::bced:1234:456d:aacc", target: "t4" },
    ],
    explanation:
      "FF05::/16 = site-local Multicast, FE80::/10 = Link-Local (automatisch), FD00::/8 = Unique Local (nicht Internet-routbar), 2001:DB8::/32 = reserviert für Dokumentation.",
  },
  {
    id: "dd-q0148",
    instruction: "Drag and drop the DNS record types from the left onto the descriptions on the right.",
    targets: [
      { id: "t1", label: "aliases one name to another" },
      { id: "t2", label: "associates the domain serial number with its owner" },
      { id: "t3", label: "correlates a domain with its authoritative name servers" },
      { id: "t4", label: "correlates a host name with an IP address" },
      { id: "t5", label: "supports reverse name lookups" },
    ],
    items: [
      { id: "i1", label: "CNAME", target: "t1" },
      { id: "i2", label: "SOA", target: "t2" },
      { id: "i3", label: "NS", target: "t3" },
      { id: "i4", label: "AAAA", target: "t4" },
      { id: "i5", label: "PTR", target: "t5" },
    ],
    explanation:
      "CNAME = Alias, SOA = Zonen-Metadaten inkl. Seriennummer, NS = autoritative Nameserver, AAAA = Hostname→IPv6, PTR = Reverse-Lookup (IP→Name).",
  },
  {
    id: "dd-q0176",
    instruction: "Drag and drop the Wi-Fi terms from the left onto the descriptions on the right.",
    targets: [
      { id: "t1", label: "Wi-Fi option in which cells from different access points are linked together" },
      { id: "t2", label: "Wi-Fi option that enables two or more clients to communicate directly without a central access point" },
      { id: "t3", label: "Wi-Fi option based around one or more access points" },
      { id: "t4", label: "alphanumeric text string that identifies a wireless network" },
      { id: "t5", label: "entire wireless cell of an access point and the linkage to the wired network" },
    ],
    items: [
      { id: "i1", label: "distribution system", target: "t1" },
      { id: "i2", label: "independent basic service set", target: "t2" },
      { id: "i3", label: "infrastructure mode", target: "t3" },
      { id: "i4", label: "SSID", target: "t4" },
      { id: "i5", label: "extended service set", target: "t5" },
    ],
    explanation:
      "IBSS = Ad-hoc ohne AP, Infrastructure Mode = Betrieb über APs, SSID = Netzname. DS verbindet die Zellen mehrerer APs; ESS = Zelle(n) eines APs samt Anbindung ans LAN (Zuordnung wie im Prüfungs-Original).",
  },
  {
    id: "dd-q0182",
    instruction:
      "Refer to the exhibit. An engineer must verify that the network parameters are valid for the user's wireless LAN connectivity on a /24 subnet. Drag and drop the values from the left onto the parameters on the right. Not all values are used.",
    context: `C:\\>ipconfig/all
Wireless LAN adapter Local Area Connection* 12:
   Media State . . . . . . . . : Media disconnected
   Description . . . . . . . . : Microsoft Wi-Fi Direct Virtual Adapter
   Physical Address. . . . . . : 1A-76-3F-7C-57-DF
Wireless LAN adapter Wi-Fi:
   Description . . . . . . . . : Dell Wireless 1703 802.11b/g/n <2.4GHz>
   Physical Address. . . . . . : B8-76-3F-7C-57-DF
   IPv4 Address. . . . . . . . : 192.168.1.20<Preferred>
   Subnet Mask . . . . . . . . : 255.255.255.0
   Default Gateway . . . . . . : 192.168.1.1`,
    targets: [
      { id: "t1", label: "broadcast address" },
      { id: "t2", label: "default gateway" },
      { id: "t3", label: "host IP address" },
      { id: "t4", label: "last assignable IP address in the subnet" },
      { id: "t5", label: "MAC address" },
      { id: "t6", label: "Network address" },
    ],
    items: [
      { id: "i1", label: "192.168.1.255", target: "t1" },
      { id: "i2", label: "192.168.1.1", target: "t2" },
      { id: "i3", label: "192.168.1.20", target: "t3" },
      { id: "i4", label: "192.168.1.254", target: "t4" },
      { id: "i5", label: "B8-76-3F-7C-57-DF", target: "t5" },
      { id: "i6", label: "192.168.1.0", target: "t6" },
      { id: "i7", label: "1A-76-3F-7C-57-DF", target: null },
    ],
    explanation:
      "Im /24: Netz .0, Broadcast .255, letzte vergebbare .254. Die MAC des aktiven Wi-Fi-Adapters ist B8-…; 1A-… gehört zum getrennten Wi-Fi-Direct-Virtual-Adapter (Distraktor).",
  },
  {
    id: "dd-q0416",
    instruction:
      "Drag and drop the OSPF adjacency parameters from the left onto their requirements on the right. Not all parameters are used.",
    targets: [
      { id: "match", label: "must match" },
      { id: "unique", label: "must be unique" },
    ],
    items: [
      { id: "i1", label: "area ID", target: "match" },
      { id: "i2", label: "netmask", target: "match" },
      { id: "i3", label: "timers", target: "match" },
      { id: "i4", label: "IP address", target: "unique" },
      { id: "i5", label: "router ID", target: "unique" },
      { id: "i6", label: "OSPF process ID", target: null },
    ],
    explanation:
      "Für die Adjacency müssen Area-ID, Subnetzmaske und Hello/Dead-Timer übereinstimmen; IP-Adresse und Router-ID müssen eindeutig sein. Die OSPF-Prozess-ID ist nur lokal relevant.",
  },
  {
    id: "dd-q0480",
    instruction:
      "Refer to the exhibit. Drag and drop the subnet masks from the left onto the corresponding prefixes on the right. Not all masks are used.",
    context: `Router1#show ip route
      209.165.202.0/27 is subnetted, 1 subnets
B        209.165.202.128 [20/0] via 10.10.12.2, 02:26:03
O        10.10.13.0/25 [110/2] via 10.10.10.1, GigabitEthernet0/0
O        10.10.13.144/28 [110/2] via 10.10.10.1, GigabitEthernet0/0
O        10.10.13.160/29 [110/2] via 10.10.10.1, GigabitEthernet0/0`,
    targets: [
      { id: "t1", label: "10.10.13.0" },
      { id: "t2", label: "10.10.13.144" },
      { id: "t3", label: "10.10.13.160" },
      { id: "t4", label: "209.165.202.128" },
    ],
    items: [
      { id: "i1", label: "255.255.255.128", target: "t1" },
      { id: "i2", label: "255.255.255.240", target: "t2" },
      { id: "i3", label: "255.255.255.248", target: "t3" },
      { id: "i4", label: "255.255.255.224", target: "t4" },
      { id: "i5", label: "255.255.255.252", target: null },
    ],
    explanation:
      "Präfixlängen aus der Routing-Tabelle: /25 = .128, /28 = .240, /29 = .248, /27 = .224. /30 (.252) kommt nicht vor.",
  },
  {
    id: "dd-q0523",
    instruction:
      "Drag and drop the application protocols from the left onto the transport protocol categories on the right.",
    targets: [
      { id: "co", label: "Connection Oriented" },
      { id: "cl", label: "Connectionless" },
    ],
    items: [
      { id: "i1", label: "FTP", target: "co" },
      { id: "i2", label: "SMTP", target: "co" },
      { id: "i3", label: "SSH", target: "co" },
      { id: "i4", label: "SNMP", target: "cl" },
      { id: "i5", label: "TFTP", target: "cl" },
      { id: "i6", label: "VoIP", target: "cl" },
    ],
    explanation:
      "FTP, SMTP und SSH laufen über TCP (verbindungsorientiert). SNMP, TFTP und VoIP nutzen UDP (verbindungslos, geringere Latenz).",
  },
  {
    id: "dd-q0534",
    instruction: "Drag and drop the functions from the left onto the servers on the right.",
    targets: [
      { id: "dhcp", label: "DHCP Server" },
      { id: "dns", label: "DNS Server" },
    ],
    items: [
      { id: "i1", label: "assigns a default gateway to a client", target: "dhcp" },
      { id: "i2", label: "holds the TCP/IP settings to be distributed to the clients", target: "dhcp" },
      { id: "i3", label: "assigns IP addresses to enabled clients", target: "dhcp" },
      { id: "i4", label: "resolves web URLs to IP addresses", target: "dns" },
      { id: "i5", label: "stores a list of IP addresses mapped to names", target: "dns" },
    ],
    explanation:
      "DHCP verteilt TCP/IP-Einstellungen (IP, Gateway, Maske) an Clients; DNS löst Namen zu IP-Adressen auf und hält die Zuordnungsliste.",
  },
  {
    id: "dd-q0545",
    instruction: "Drag and drop the SNMP components from the left onto the descriptions on the right.",
    targets: [
      { id: "t1", label: "collection of variables that can be monitored" },
      { id: "t2", label: "unsolicited message" },
      { id: "t3", label: "responds to status requests and requests for information about a device" },
      { id: "t4", label: "resides on an NMS" },
    ],
    items: [
      { id: "i1", label: "MIB", target: "t1" },
      { id: "i2", label: "SNMP trap", target: "t2" },
      { id: "i3", label: "SNMP agent", target: "t3" },
      { id: "i4", label: "SNMP manager", target: "t4" },
    ],
    explanation:
      "MIB = Variablensammlung, Trap = unaufgeforderte Meldung des Agenten, Agent = läuft auf dem Gerät und antwortet, Manager = läuft auf der NMS und fragt ab.",
  },
  {
    id: "dd-q0552",
    instruction:
      "An engineer is configuring the router to provide static NAT for the webserver. Drag and drop the configuration commands from the left onto the letters that correspond to their position in the configuration on the right.",
    context: `interface Ethernet0          interface Serial0
 <position A>                 <position C>
 <position B>                 <position D>
!
<position E>
<position F>`,
    targets: [
      { id: "a", label: "Position A" },
      { id: "b", label: "Position B" },
      { id: "c", label: "Position C" },
      { id: "d", label: "Position D" },
      { id: "e", label: "Position E" },
      { id: "f", label: "Position F" },
    ],
    items: [
      { id: "i1", label: "ip address 172.16.1.1 255.255.255.0", target: "a" },
      { id: "i2", label: "ip nat inside", target: "b" },
      { id: "i3", label: "ip address 45.83.2.214 255.255.255.240", target: "c" },
      { id: "i4", label: "ip nat outside", target: "d" },
      { id: "i5", label: "ip nat inside source static tcp 172.16.1.2 80 45.83.2.214 80 extendable", target: "e" },
      { id: "i6", label: "ip nat inside source list 1 interface s0 overload", target: "f" },
    ],
    explanation:
      "Innen-Interface: private IP + ip nat inside. Außen-Interface: öffentliche IP + ip nat outside. Danach global: statisches Port-NAT für den Webserver, dann PAT-Overload für die übrigen Clients.",
  },
  {
    id: "dd-q0583",
    instruction: "Drag and drop the SNMP verification commands from the left onto the corresponding outputs on the right.",
    targets: [
      { id: "t1", label: "displays information about the SNMP recipient" },
      { id: "t2", label: "displays the IP address of the remote SNMP device" },
      { id: "t3", label: "displays the SNMP security model in use" },
      { id: "t4", label: "displays the SNMP access string" },
      { id: "t5", label: "displays the SNMP server serial number" },
    ],
    items: [
      { id: "i1", label: "show snmp host", target: "t1" },
      { id: "i2", label: "show snmp engineID", target: "t2" },
      { id: "i3", label: "show snmp group", target: "t3" },
      { id: "i4", label: "show snmp community", target: "t4" },
      { id: "i5", label: "show snmp chassis", target: "t5" },
    ],
    explanation:
      "host = Trap-Empfänger, engineID = lokale/remote Engine samt IP, group = Gruppen mit Security-Model (v1/v2c/v3), community = Access-Strings, chassis = Geräteseriennummer.",
  },
  {
    id: "dd-q0586",
    instruction: "Drag and drop the QoS terms from the left onto the descriptions on the right.",
    targets: [
      { id: "t1", label: "categorizes packets based on the value of a traffic descriptor" },
      { id: "t2", label: "guarantees minimum bandwidth to specific traffic classes when an interface is congested" },
      { id: "t3", label: "prevents congestion by reducing the flow of outbound traffic" },
      { id: "t4", label: "outcome of overutilization" },
      { id: "t5", label: "uses defined criteria to limit the transmission of one or more classes of traffic" },
    ],
    items: [
      { id: "i1", label: "classification", target: "t1" },
      { id: "i2", label: "class-based weighted fair queueing", target: "t2" },
      { id: "i3", label: "shaping", target: "t3" },
      { id: "i4", label: "congestion", target: "t4" },
      { id: "i5", label: "policing", target: "t5" },
    ],
    explanation:
      "Classification markiert nach Deskriptoren, CBWFQ garantiert Mindestbandbreite bei Stau, Shaping verzögert Überschusstraffic, Congestion = Folge von Überlastung, Policing begrenzt/verwirft nach Kriterien. (Hinweis: Das Dump-Antwortbild vertauscht CBWFQ und Policing — hier fachlich korrekt.)",
  },
  // SKIP: Q0260 — beide Bilder zeigen nur ein Config-Snippet (interface Gi1/0 …),
  // kein Drag-Drop-Widget; Zuordnung nicht rekonstruierbar.
];
