// ============================================================
// CCNA 200-301 Official Blueprint Domain Configuration
// Maps the 6 official exam domains, their official weights,
// and curriculum topics for progress tracking and drilldowns.
// ============================================================

export interface BlueprintSubtopic {
  code: string; // e.g. "1.1", "2.1"
  title: string;
  topicId?: string; // Optional direct mapping to topic
  hint?: string;
}

export interface BlueprintDomain {
  id: string; // e.g. "1.0"
  number: string;
  title: string;
  weightPercent: number; // Official Cisco weight (20, 20, 25, 10, 15, 10)
  shortDesc: string;
  topicIds: string[];
  subtopics: BlueprintSubtopic[];
}

export const BLUEPRINT_DOMAINS: BlueprintDomain[] = [
  {
    id: "domain-1",
    number: "1.0",
    title: "Network Fundamentals",
    weightPercent: 20,
    shortDesc: "OSI- & TCP/IP-Modelle, IPv4 & IPv6 Adressierung, Subnetting, Kabel, Glasfaser, Virtualisierung & Cloud",
    topicIds: [
      "networking-fundamentals",
      "ios-cli",
      "ipv4-addressing",
      "subnet-segmentation",
      "ipv6",
      "verkabelung",
      "glasfaser",
      "ccna-virtualization",
    ],
    subtopics: [
      { code: "1.1", title: "Rollen & Funktionen von Netzwerkkomponenten (Router, L2/L3-Switches, Firewall)", topicId: "networking-fundamentals" },
      { code: "1.2", title: "Topologie-Architekturen (2-Tier, 3-Tier, Spine-Leaf, WAN, SOHO)", topicId: "networking-fundamentals" },
      { code: "1.3", title: "Physikalische Schnittstellen & Kabeltypen (Kupfer Cat6/6a, Glasfaser, Transceiver)", topicId: "verkabelung" },
      { code: "1.4", title: "Interface- und Kabelprobleme identifizieren (Kollisionen, Errors, Duplex-Mismatch)", topicId: "glasfaser" },
      { code: "1.5", title: "TCP vs. UDP Vergleich (Verbindungsorientiert vs. Verbindungslos, Ports)", topicId: "networking-fundamentals" },
      { code: "1.6", title: "IPv4-Subnetting & VLSM Adressierungsplanung", topicId: "subnet-segmentation" },
      { code: "1.7", title: "Private IPv4-Adressräume (RFC 1918) & Schnittstellenkonfiguration", topicId: "ipv4-addressing" },
      { code: "1.8", title: "IPv6-Adressierung & Präfixe (Global Unicast, Unique Local, Link-Local)", topicId: "ipv6" },
      { code: "1.9", title: "Virtualisierungsgrundlagen (Hypervisor Typ 1/2, VMs vs. Container)", topicId: "ccna-virtualization" },
    ],
  },
  {
    id: "domain-2",
    number: "2.0",
    title: "Network Access",
    weightPercent: 20,
    shortDesc: "VLANs, 802.1Q Trunks, Spanning Tree (STP/RSTP), EtherChannel (LACP) und Wireless LAN Architekturen",
    topicIds: [
      "switching-vlans",
      "stp",
      "etherchannel",
      "vlan-advanced",
      "wlan",
    ],
    subtopics: [
      { code: "2.1", title: "VLANs & Access-Ports über mehrere Switches konfigurieren", topicId: "switching-vlans" },
      { code: "2.2", title: "Interswitch-Konnektivität (802.1Q Trunking, Native VLAN)", topicId: "switching-vlans" },
      { code: "2.3", title: "Layer-2 Discovery Protokolle (CDP und LLDP)", topicId: "vlan-advanced" },
      { code: "2.4", title: "Layer-2 / Layer-3 EtherChannel konfigurieren & verifizieren (LACP)", topicId: "etherchannel" },
      { code: "2.5", title: "Spanning Tree Protocol (STP / Rapid PVST+ Port-Rollen & Zustände)", topicId: "stp" },
      { code: "2.6", title: "Cisco Wireless-Architekturen (Centralized WLC, FlexConnect, AP-Modi)", topicId: "wlan" },
      { code: "2.7", title: "WLAN-Sicherheit & Verschlüsselung (WPA2/WPA3 Personal & Enterprise)", topicId: "wlan" },
    ],
  },
  {
    id: "domain-3",
    number: "3.0",
    title: "IP Connectivity",
    weightPercent: 25,
    shortDesc: "Routingtabellen-Logik, Longest Match, Administrative Distanz, statisches Routing und OSPFv2 Single-Area",
    topicIds: [
      "routing-ospf",
      "fhrp",
    ],
    subtopics: [
      { code: "3.1", title: "Komponenten einer Routingtabelle interpretieren (Netzwerk, Next-Hop, Metrik)", topicId: "routing-ospf" },
      { code: "3.2", title: "Forwarding-Entscheidungen (Longest Prefix Match, Administrative Distance)", topicId: "routing-ospf" },
      { code: "3.3", title: "IPv4 & IPv6 statisches Routing (Default Route, Network Route, Floating Static)", topicId: "routing-ospf" },
      { code: "3.4", title: "OSPFv2 Single-Area konfigurieren & verifizieren (Neighbor, Router-ID, DR/BDR)", topicId: "routing-ospf" },
      { code: "3.5", title: "First Hop Redundancy Protocol (HSRP Active/Standby, Virtual IP)", topicId: "fhrp" },
    ],
  },
  {
    id: "domain-4",
    number: "4.0",
    title: "IP Services",
    weightPercent: 10,
    shortDesc: "NAT/PAT, NTP Zeitsynchronisation, DHCP Relay & Client, DNS, SNMPv2c/v3, Syslog und QoS Mechanismen",
    topicIds: [
      "dhcp-nat",
      "nat",
      "dns",
      "device-management",
      "qos",
    ],
    subtopics: [
      { code: "4.1", title: "Inside Source NAT (Static, Dynamic, PAT / Overload) konfigurieren", topicId: "nat" },
      { code: "4.2", title: "NTP im Client- und Server-Modus konfigurieren & verifizieren", topicId: "device-management" },
      { code: "4.3", title: "DHCP-Server, Relay-Agent (ip helper-address) und Client-Betrieb", topicId: "dhcp-nat" },
      { code: "4.4", title: "SNMPv2c und SNMPv3 für Netzwerk-Monitoring einsetzen", topicId: "device-management" },
      { code: "4.5", title: "Syslog-Facility & Logging-Levels konfigurieren", topicId: "device-management" },
      { code: "4.6", title: "QoS-Konzepte: Classification, Marking (DSCP/CoS), Queuing (LLQ), Policing", topicId: "qos" },
      { code: "4.7", title: "TFTP/FTP Dateiübertragungen auf Cisco-Routern", topicId: "device-management" },
    ],
  },
  {
    id: "domain-5",
    number: "5.0",
    title: "Security Fundamentals",
    weightPercent: 15,
    shortDesc: "Sicherheitsbedrohungen, Geräte-Härtung, AAA, Access Control Lists (ACLs), Port Security & DHCP Snooping",
    topicIds: [
      "security",
      "acl",
    ],
    subtopics: [
      { code: "5.1", title: "Wesentliche Sicherheitskonzepte (Bedrohungen, Schwachstellen, CIA-Triade)", topicId: "security" },
      { code: "5.2", title: "Passwort-Sicherheit & Geräte-Härtung (Enable Secret, Service Password-Encryption)", topicId: "security" },
      { code: "5.3", title: "Remote-Zugriff über SSH konfigurieren (RSA Keys, Line vty)", topicId: "security" },
      { code: "5.4", title: "AAA-Konzepte (Authentication, Authorization, Accounting) & RADIUS/TACACS+", topicId: "security" },
      { code: "5.5", title: "Standard & Extended IPv4 ACLs filtern (Inbound/Outbound, Named ACLs)", topicId: "acl" },
      { code: "5.6", title: "Layer-2 Sicherheitsfunktionen: Port-Security (Protect, Restrict, Shutdown)", topicId: "security" },
      { code: "5.7", title: "DHCP Snooping & Dynamic ARP Inspection (DAI) gegen Spoofing", topicId: "security" },
    ],
  },
  {
    id: "domain-6",
    number: "6.0",
    title: "Automation and Programmability",
    weightPercent: 10,
    shortDesc: "Cisco DNA Center, Controller-Architekturen, REST-APIs, Datenformate (JSON/YAML) & Ansible/Terraform",
    topicIds: [
      "sdn-controller",
      "automation",
      "wan",
    ],
    subtopics: [
      { code: "6.1", title: "Traditionelles Gerätemanagement vs. Controller-basiertes Networking (SDN)", topicId: "sdn-controller" },
      { code: "6.2", title: "Controller-Architektur (Control Plane vs. Data Plane, Northbound/Southbound APIs)", topicId: "sdn-controller" },
      { code: "6.3", title: "Cisco DNA Center (Assurance, Fabric, Intent-Based Networking)", topicId: "sdn-controller" },
      { code: "6.4", title: "REST-APIs verstehen (HTTP-Verben GET/POST/PUT/DELETE, Status-Codes, Auth)", topicId: "automation" },
      { code: "6.5", title: "Datenformate interpretieren: JSON, XML und YAML", topicId: "automation" },
      { code: "6.6", title: "Konfigurationsmanagement-Tools: Ansible, Terraform & Puppet", topicId: "automation" },
    ],
  },
];
