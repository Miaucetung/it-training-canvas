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
  // ── Batch 2 ──────────────────────────────────────────────
  {
    id: "dd-q0588",
    instruction: "Drag and drop the fault-management processes from the left onto the descriptions on the right.",
    targets: [
      { id: "t1", label: "The administrator can manually intervene at the source of the fault." },
      { id: "t2", label: "The network management system launches a preconfigured script to restore functionality." },
      { id: "t3", label: "The system groups alarms from related issues." },
      { id: "t4", label: "The system identifies performance degradation or service interruption." },
      { id: "t5", label: "The system reports on the source of the issue." },
    ],
    items: [
      { id: "i1", label: "problem resolution", target: "t1" },
      { id: "i2", label: "restoration of service", target: "t2" },
      { id: "i3", label: "event correlation and aggregation", target: "t3" },
      { id: "i4", label: "fault detection", target: "t4" },
      { id: "i5", label: "fault diagnosis and isolation", target: "t5" },
    ],
    explanation:
      "Detection erkennt die Störung, Diagnosis/Isolation lokalisiert die Quelle, Correlation gruppiert zusammengehörige Alarme, Restoration stellt per Skript wieder her, Resolution ist der manuelle Eingriff an der Ursache.",
  },
  {
    id: "dd-q0592",
    instruction:
      "Drag and drop the DHCP functions from the left onto any of the positions on the right. Not all functions are used.",
    targets: [{ id: "dhcp", label: "DHCP-Funktionen (4)" }],
    items: [
      { id: "i1", label: "provides local control for network segments using a client-server scheme", target: "dhcp" },
      { id: "i2", label: "maintains an address pool", target: "dhcp" },
      { id: "i3", label: "reduces the administrative burden for onboarding end users", target: "dhcp" },
      { id: "i4", label: "assigns IP addresses to local hosts for a configurable lease time", target: "dhcp" },
      { id: "i5", label: "uses authoritative servers for record keeping", target: null },
      { id: "i6", label: "associates hostnames to IP address", target: null },
      { id: "i7", label: "offers domain name server configuration", target: null },
    ],
    explanation:
      "DHCP: Client-Server-Adressvergabe mit Pool, Lease-Zeit und geringem Onboarding-Aufwand. Die Distraktoren beschreiben DNS (autoritative Server, Namen↔IP-Zuordnung).",
  },
  {
    id: "dd-q0614",
    instruction: "Drag and drop the AAA functions from the left onto the AAA services on the right.",
    targets: [
      { id: "authc", label: "Authentication" },
      { id: "authz", label: "Authorization" },
      { id: "acct", label: "Accounting" },
    ],
    items: [
      { id: "i1", label: "verifies the password associated with a user", target: "authc" },
      { id: "i2", label: "identifies the user", target: "authc" },
      { id: "i3", label: "controls the actions that a user can perform", target: "authz" },
      { id: "i4", label: "restricts the services that are available to a user", target: "authz" },
      { id: "i5", label: "provides analytical information for the network administrator", target: "acct" },
      { id: "i6", label: "records user activities", target: "acct" },
    ],
    explanation:
      "Authentication = Wer bist du (Identität + Passwort). Authorization = Was darfst du (Aktionen/Dienste). Accounting = Was hast du getan (Protokoll + Auswertung).",
  },
  {
    id: "dd-q0617",
    instruction:
      "Drag and drop the WLAN security mechanisms from the left onto the security mechanism categories on the right.",
    targets: [
      { id: "l2", label: "Layer 2 Security Mechanisms" },
      { id: "l3", label: "Layer 3 Security Mechanisms (for WLAN)" },
    ],
    items: [
      { id: "i1", label: "WPA+WPA2", target: "l2" },
      { id: "i2", label: "802.1X", target: "l2" },
      { id: "i3", label: "web policy", target: "l3" },
      { id: "i4", label: "Passthrough", target: "l3" },
    ],
    explanation:
      "Auf dem WLC sind WPA/WPA2 und 802.1X Layer-2-Security; Web-Policy (Web-Auth) und Passthrough arbeiten auf Layer 3 über die IP-Verbindung.",
  },
  {
    id: "dd-q0623",
    instruction: "Drag and drop the security measures from the left onto the attacks they prevent on the right.",
    targets: [
      { id: "t1", label: "802.1q double-tagging VLAN-hopping attack" },
      { id: "t2", label: "MAC flooding attack" },
      { id: "t3", label: "man-in-the-middle spoofing attack" },
      { id: "t4", label: "switch-spoofing VLAN-hopping attack" },
    ],
    items: [
      { id: "i1", label: "configure the native VLAN with a nondefault VLAN ID", target: "t1" },
      { id: "i2", label: "configure 802.1x authenticate", target: "t2" },
      { id: "i3", label: "configure DHCP snooping", target: "t3" },
      { id: "i4", label: "disable DTP", target: "t4" },
    ],
    explanation:
      "Double-Tagging nutzt das Native VLAN → umbenennen. MAC-Flooding scheitert an 802.1X-Port-Auth. DHCP-Snooping blockt Rogue-DHCP (MITM). Switch-Spoofing braucht DTP → abschalten.",
  },
  {
    id: "dd-q0667",
    instruction:
      "Drag and drop the AAA features from the left onto the corresponding AAA security services on the right. Not all options are used.",
    targets: [
      { id: "acct", label: "Accounting" },
      { id: "authz", label: "Authorization" },
    ],
    items: [
      { id: "i1", label: "It records the amount of time for which a user accesses the network on a remote server.", target: "acct" },
      { id: "i2", label: "It uses TACACS+ to log the configuration commands entered by a network administrator.", target: "acct" },
      { id: "i3", label: "It leverages a RADIUS server to grant user access to a reverse Telnet session.", target: "authz" },
      { id: "i4", label: "It restricts the CLI commands that a user can perform.", target: "authz" },
      { id: "i5", label: "It enables the device to allow user- or group-based access.", target: null },
      { id: "i6", label: "It verifies the user and password before granting access to the device.", target: null },
    ],
    explanation:
      "Accounting protokolliert (Zeiten, Befehle via TACACS+). Authorization steuert, was erlaubt ist (CLI-Befehle, Reverse-Telnet-Zugriff). Die Distraktoren beschreiben Authentication.",
  },
  {
    id: "dd-q0700",
    instruction: "Drag and drop the Layer 2 protection features from the left onto the attacks they mitigate on the right.",
    targets: [
      { id: "t1", label: "rogue server that spoofs IP configuration" },
      { id: "t2", label: "cache poisoning" },
      { id: "t3", label: "rogue clients on the network" },
      { id: "t4", label: "flood attacks" },
    ],
    items: [
      { id: "i1", label: "DHCP snooping", target: "t1" },
      { id: "i2", label: "Dynamic ARP Inspection", target: "t2" },
      { id: "i3", label: "IP Source Guard", target: "t3" },
      { id: "i4", label: "storm control", target: "t4" },
    ],
    explanation:
      "DHCP-Snooping filtert Rogue-DHCP-Server, DAI verhindert ARP-Cache-Poisoning, IP Source Guard blockt Clients mit gefälschten Quell-IPs, Storm Control drosselt Broadcast-/Multicast-Fluten.",
  },
  {
    id: "dd-q0715",
    instruction:
      "Drag and drop the characteristics of networking from the left onto the correct networking types on the right.",
    targets: [
      { id: "ctrl", label: "Controller-Based Networking" },
      { id: "trad", label: "Traditional Networking" },
    ],
    items: [
      { id: "i1", label: "focused on network", target: "ctrl" },
      { id: "i2", label: "user input is a policy", target: "ctrl" },
      { id: "i3", label: "uses allow list security model", target: "ctrl" },
      { id: "i4", label: "focused on devices", target: "trad" },
      { id: "i5", label: "user input is a configuration", target: "trad" },
      { id: "i6", label: "uses block list security model", target: "trad" },
    ],
    explanation:
      "Controller-basiert: netzwerkweite Policies, Allow-List (nur Erlaubtes). Traditionell: Gerät-für-Gerät-Konfiguration, Block-List (alles erlaubt außer Verbotenem).",
  },
  {
    id: "dd-q0868",
    instruction:
      "Drag and drop the wireless architecture benefits from the left onto the architecture types on the right.",
    targets: [
      { id: "split", label: "Split-MAC" },
      { id: "auto", label: "Autonomous" },
    ],
    items: [
      { id: "i1", label: "Work is divided between the access point and the controller.", target: "split" },
      { id: "i2", label: "Uses the CAPWAP tunneling protocol.", target: "split" },
      { id: "i3", label: "The access points transmit beacon frames.", target: "split" },
      { id: "i4", label: "Appropriate for a small-business environment.", target: "auto" },
      { id: "i5", label: "Supports per device configuration and management.", target: "auto" },
    ],
    explanation:
      "Split-MAC teilt die Arbeit zwischen Lightweight-AP (Echtzeit, z. B. Beacons) und WLC (Management) via CAPWAP. Autonomous-APs werden einzeln verwaltet — praktikabel nur in kleinen Umgebungen.",
  },
  {
    id: "dd-q0871",
    instruction: "Drag and drop the WLAN components from the left onto the correct descriptions on the right.",
    targets: [
      { id: "t1", label: "manages access points" },
      { id: "t2", label: "provides Wi-Fi devices with a connection to a wired network" },
      { id: "t3", label: "used for out-of-band management" },
      { id: "t4", label: "used for guest authentication" },
      { id: "t5", label: "applied to the WLAN for wireless client communication" },
    ],
    items: [
      { id: "i1", label: "wireless LAN controller", target: "t1" },
      { id: "i2", label: "access point", target: "t2" },
      { id: "i3", label: "service port", target: "t3" },
      { id: "i4", label: "virtual interface", target: "t4" },
      { id: "i5", label: "dynamic interface", target: "t5" },
    ],
    explanation:
      "WLC verwaltet die APs, der AP verbindet Clients mit dem LAN. Am WLC: Service-Port = Out-of-Band-Management, Virtual Interface = Web-/Gast-Auth (Redirect), Dynamic Interface = VLAN-Anbindung der WLANs.",
  },
  {
    id: "dd-q0909",
    instruction:
      "Refer to the exhibit. Drag and drop the static route commands from the left onto the routers on the right so that Host A and Host B can reach each other. Not all commands are used.",
    context: `Host A (10.10.14.10/24) — R1 [.2] —10.10.10.0/30— [.1] R2 [.6] —10.10.10.4/30— [.5] R3 — Host B (10.10.13.10/25)`,
    targets: [
      { id: "r1", label: "R1" },
      { id: "r2", label: "R2 (2 Routen)" },
      { id: "r3", label: "R3" },
    ],
    items: [
      { id: "i1", label: "ip route 10.10.13.0 255.255.255.128 10.10.10.1", target: "r1" },
      { id: "i2", label: "ip route 10.10.13.0 255.255.255.128 10.10.10.5", target: "r2" },
      { id: "i3", label: "ip route 10.10.14.0 255.255.255.0 10.10.10.2", target: "r2" },
      { id: "i4", label: "ip route 10.10.14.0 255.255.255.0 10.10.10.6", target: "r3" },
      { id: "i5", label: "ip route 10.10.13.10 255.255.255.255 10.10.10.1", target: null },
      { id: "i6", label: "ip route 10.10.14.10 255.255.255.255 10.10.10.6", target: null },
    ],
    explanation:
      "R1 erreicht Host-B-Netz über R2 (.1); R2 braucht beide Richtungen: 13.0/25 über R3 (.5) und 14.0/24 über R1 (.2); R3 erreicht Host-A-Netz über R2 (.6). Die /32-Host-Routen sind unnötig.",
  },
  {
    id: "dd-q0928",
    instruction:
      "Refer to the exhibit. OSPF is running between site A and site B. Drag and drop the destination IPs from the left onto the network segments used to reach the destinations on the right.",
    context: `Router2#show ip route
Gateway of last resort is 10.10.10.13 to network 0.0.0.0
C     10.10.10.8/30  directly connected, FastEthernet0/3
C     10.10.10.12/30 directly connected, FastEthernet0/4
C     10.10.10.0/30  directly connected, FastEthernet0/1
O     10.10.13.0/25   [110/6576] via 10.10.10.9 ... (Router1)
C     10.10.10.4/30  directly connected, FastEthernet0/2
O     10.10.13.144/28 [110/110]  via 10.10.10.9 ... (Router1)
S*    0.0.0.0/0 [1/0] via 10.10.10.13`,
    targets: [
      { id: "inet", label: "Internet" },
      { id: "r1", label: "Router1" },
    ],
    items: [
      { id: "i1", label: "10.10.10.16", target: "inet" },
      { id: "i2", label: "10.10.13.129", target: "inet" },
      { id: "i3", label: "10.10.100.128", target: "inet" },
      { id: "i4", label: "10.10.13.1", target: "r1" },
      { id: "i5", label: "10.10.13.150", target: "r1" },
    ],
    explanation:
      "13.1 liegt in 10.10.13.0/25, 13.150 in 10.10.13.144/28 — beide via Router1. 13.129 fällt in KEINE gelernte Route (Lücke zwischen /25 und /28) und geht wie 10.10.10.16 und 10.10.100.128 über die Default-Route ins Internet.",
  },
  {
    id: "dd-q0936",
    instruction:
      "Refer to the exhibit. Drag and drop the learned prefixes from the left onto the subnet masks on the right.",
    context: `R1# show ip route | begin gateway
      172.16.0.0/16 is variably subnetted, 5 subnets, 5 masks
O     172.16.2.128/25 [110/3184437] via 207.165.200.250, Serial0/0/0
O     172.16.3.64/27  [110/3184437] via 207.165.200.250, Serial0/0/0
O     172.16.3.128/28 [110/3184437] via 207.165.200.250, Serial0/0/0
O     172.16.3.192/29 [110/3184437] via 207.165.200.250, Serial0/0/0
O     172.16.4.0/23   [110/3184437] via 207.165.200.250, Serial0/0/0`,
    targets: [
      { id: "t1", label: "255.255.254.0" },
      { id: "t2", label: "255.255.255.128" },
      { id: "t3", label: "255.255.255.224" },
      { id: "t4", label: "255.255.255.240" },
      { id: "t5", label: "255.255.255.248" },
    ],
    items: [
      { id: "i1", label: "172.16.4.0", target: "t1" },
      { id: "i2", label: "172.16.2.128", target: "t2" },
      { id: "i3", label: "172.16.3.64", target: "t3" },
      { id: "i4", label: "172.16.3.128", target: "t4" },
      { id: "i5", label: "172.16.3.192", target: "t5" },
    ],
    explanation: "Präfix→Maske: /23=254.0, /25=255.128, /27=255.224, /28=255.240, /29=255.248.",
  },
  {
    id: "dd-q0938",
    instruction:
      "Refer to the exhibit. Router1 has multiple methods to reach 10.10.10.0/24 (OSPF, eBGP, Static, EIGRP, iBGP). The default Administrative Distance is used. Drag and drop the failure scenarios from the left onto the routing methods that Router1 then uses on the right.",
    targets: [
      { id: "ebgp", label: "eBGP" },
      { id: "eigrp", label: "EIGRP" },
      { id: "static", label: "Static" },
    ],
    items: [
      { id: "i1", label: "The static route and EIGRP are down.", target: "ebgp" },
      { id: "i2", label: "The static route and OSPF are down.", target: "ebgp" },
      { id: "i3", label: "The static route and eBGP are down.", target: "eigrp" },
      { id: "i4", label: "All protocols are up.", target: "static" },
      { id: "i5", label: "OSPF and eBGP are down.", target: "static" },
    ],
    explanation:
      "AD-Rangfolge: Static 1 < eBGP 20 < EIGRP 90 < OSPF 110 < iBGP 200. Es gewinnt immer die kleinste AD unter den verbleibenden Quellen.",
  },
  {
    id: "dd-q0950",
    instruction: "Drag and drop the SNMP components from the left onto the descriptions on the right.",
    targets: [
      { id: "t1", label: "collection of uniquely identifiable objects whose state can be interrogated over SNMP" },
      { id: "t2", label: "network node-controlled by SNMP" },
      { id: "t3", label: "system that runs monitoring applications and controls network nodes" },
      { id: "t4", label: "SNMP component that captures and translates device and network data" },
    ],
    items: [
      { id: "i1", label: "MIB", target: "t1" },
      { id: "i2", label: "managed device", target: "t2" },
      { id: "i3", label: "NMS", target: "t3" },
      { id: "i4", label: "agent", target: "t4" },
    ],
    explanation:
      "MIB = adressierbare Objektsammlung, Managed Device = überwachter Knoten, NMS = Monitoring-Zentrale, Agent = Software auf dem Gerät, die Daten erfasst und übersetzt.",
  },
  // SKIP: Q0260 — beide Bilder zeigen nur ein Config-Snippet (interface Gi1/0 …),
  // kein Drag-Drop-Widget; Zuordnung nicht rekonstruierbar.
];
