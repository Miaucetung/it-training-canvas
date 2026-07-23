// ============================================================
// CCNA CLI-Glossar — Datenmodul
// Reine Datenhaltung für CliGlossaryDialog.tsx. Getrennt von der
// Komponente, damit Tests (Integritätsprüfung gegen
// TroubleshootingCase.relatedCommandIds) importieren können, ohne
// die .tsx zu laden.
// ============================================================

export type Category =
  | "Modi & Navigation"
  | "Konfiguration speichern"
  | "Show / Diagnose"
  | "Interface"
  | "VLAN & Trunk"
  | "Spanning Tree"
  | "EtherChannel"
  | "SSH & Sicherheit"
  | "ACLs"
  | "NAT / PAT"
  | "DHCP"
  | "Routing"
  | "HSRP & Redundanz"
  | "L2-Security"
  | "NTP & DNS"
  | "Wartung & Recovery"
  | "Troubleshooting"
  | "IPsec / VPN"
  | "Packet-Tracer-Limits";

export interface Entry {
  cmd: string;
  mode: string;
  desc: string;
  category: Category;
  /** Konkretes Beispiel aus einem Lab, falls über die Kurzbeschreibung hinaus hilfreich. */
  example?: string;
  /** show-Befehle zur Kontrolle des Ergebnisses. */
  verifyWith?: string[];
  /** Typischer Fehler, der in der Prüfung oder im Lab Punkte kostet. */
  pitfall?: string;
  /**
   * Abweichung/Einschränkung in Packet Tracer. Nur für reguläre Kategorien —
   * Einträge, die AUSSCHLIESSLICH in PT existieren oder dort nicht funktionieren,
   * gehören in die eigene Kategorie "Packet-Tracer-Limits", nicht hierher.
   */
  ptNote?: string;
}

export const ENTRIES: Entry[] = [
  // Modi & Navigation
  { cmd: "enable", mode: "User", desc: "Wechsel in den Privileged-EXEC-Modus.", category: "Modi & Navigation" },
  { cmd: "disable", mode: "Priv", desc: "Zurück in den User-EXEC-Modus.", category: "Modi & Navigation" },
  { cmd: "configure terminal", mode: "Priv", desc: "Wechsel in den Global-Config-Modus.", category: "Modi & Navigation" },
  { cmd: "exit", mode: "alle", desc: "Eine Ebene zurück.", category: "Modi & Navigation" },
  { cmd: "end", mode: "Config", desc: "Direkt zurück in den Privileged-EXEC.", category: "Modi & Navigation" },
  { cmd: "do <befehl>", mode: "Config", desc: "Privileged-EXEC-Befehl im Config-Modus ausführen (z. B. `do show vlan brief`).", category: "Modi & Navigation" },
  { cmd: "?", mode: "alle", desc: "Kontextsensitive Hilfe — zeigt alle möglichen Eingaben.", category: "Modi & Navigation" },
  { cmd: "show history", mode: "Priv", desc: "Zeigt die zuletzt eingegebenen Befehle.", category: "Modi & Navigation" },
  { cmd: "terminal length 0", mode: "Priv", desc: "Deaktiviert das --More-- Paging in der Ausgabe.", category: "Modi & Navigation" },

  // Konfiguration speichern
  { cmd: "copy running-config startup-config", mode: "Priv", desc: "Speichert die laufende Konfiguration ins NVRAM.", category: "Konfiguration speichern" },
  { cmd: "write memory", mode: "Priv", desc: "Kurzform: speichert running-config → startup-config.", category: "Konfiguration speichern" },
  { cmd: "erase startup-config", mode: "Priv", desc: "Löscht die Startup-Konfiguration (Werks-Reset nach `reload`).", category: "Konfiguration speichern" },
  { cmd: "reload", mode: "Priv", desc: "Neustart des Geräts.", category: "Konfiguration speichern" },
  { cmd: "show running-config", mode: "Priv", desc: "Zeigt die aktive Konfiguration im RAM.", category: "Konfiguration speichern" },
  { cmd: "show startup-config", mode: "Priv", desc: "Zeigt die im NVRAM gespeicherte Konfiguration.", category: "Konfiguration speichern" },
  { cmd: "copy tftp: running-config", mode: "Priv", desc: "Lädt eine Konfiguration vom TFTP-Server.", category: "Konfiguration speichern" },

  // Show / Diagnose
  { cmd: "show version", mode: "Priv", desc: "IOS-Version, Uptime, Hardware, Seriennummer, Config-Register.", category: "Show / Diagnose" },
  { cmd: "show inventory", mode: "Priv", desc: "Slot- und Modul-Bestückung.", category: "Show / Diagnose" },
  { cmd: "show clock", mode: "Priv", desc: "Aktuelle Systemzeit.", category: "Show / Diagnose" },
  { cmd: "show flash:", mode: "Priv", desc: "Inhalt des Flash-Speichers.", category: "Show / Diagnose" },
  { cmd: "show processes cpu", mode: "Priv", desc: "Aktuelle CPU-Auslastung pro Prozess.", category: "Show / Diagnose" },
  { cmd: "show memory", mode: "Priv", desc: "Speichernutzung.", category: "Show / Diagnose" },
  { cmd: "show logging", mode: "Priv", desc: "System-Logbuch.", category: "Show / Diagnose" },
  { cmd: "show ip interface brief", mode: "Priv", desc: "Kompakte Übersicht aller L3-Interfaces mit IP, Status, Protokoll.", category: "Show / Diagnose" },
  { cmd: "show cdp neighbors", mode: "Priv", desc: "Nachbarn via Cisco Discovery Protocol.", category: "Show / Diagnose" },
  { cmd: "show cdp neighbors detail", mode: "Priv", desc: "Detail: IP-Adresse, IOS-Version, Plattform der Nachbarn.", category: "Show / Diagnose" },
  { cmd: "cdp run", mode: "Config", desc: "Aktiviert CDP global (no cdp run schaltet es ab).", category: "Show / Diagnose" },
  { cmd: "show lldp neighbors", mode: "Priv", desc: "Nachbarn via LLDP (Vendor-neutral).", category: "Show / Diagnose" },
  { cmd: "lldp run", mode: "Config", desc: "Aktiviert LLDP global — herstellerneutrale Alternative zu CDP.", category: "Show / Diagnose" },

  // Interface
  { cmd: "interface gi0/1", mode: "Config", desc: "Wechsel in den Interface-Config-Modus (gigabit, 1. Port).", category: "Interface", pitfall: "Interface-Bezeichnung ist modellabhängig — z. B. nutzt der ISR4321 g0/0/0 statt g0/0. Vor der Konfiguration immer show ip interface brief prüfen." },
  { cmd: "interface range gi0/1 - 24", mode: "Config", desc: "Konfiguriert mehrere Interfaces gleichzeitig.", category: "Interface" },
  { cmd: "description <text>", mode: "If", desc: "Klartext-Beschreibung des Ports (Dokumentation).", category: "Interface" },
  { cmd: "shutdown", mode: "If", desc: "Deaktiviert das Interface administrativ.", category: "Interface" },
  { cmd: "no shutdown", mode: "If", desc: "Aktiviert das Interface (`up`).", category: "Interface", pitfall: "Router-Interfaces sind administrativ down per Default — ohne no shutdown bleibt jede sonst korrekte Konfiguration wirkungslos." },
  { cmd: "interface loopback 0", mode: "Config", desc: "Virtuelles, immer aktives Interface — als OSPF-Router-ID oder Test-Ziel.", category: "Interface", ptNote: "Existiert auf L2-Switches in Packet Tracer nicht." },
  { cmd: "speed {10|100|1000|auto}", mode: "If", desc: "Setzt die Port-Geschwindigkeit.", category: "Interface" },
  { cmd: "duplex {half|full|auto}", mode: "If", desc: "Setzt den Duplex-Modus.", category: "Interface" },
  { cmd: "ip address <ip> <maske>", mode: "If", desc: "Weist dem Interface eine IPv4-Adresse zu.", category: "Interface" },
  { cmd: "ipv6 address <prefix>/<länge>", mode: "If", desc: "Weist dem Interface eine IPv6-Adresse zu.", category: "Interface", pitfall: "Anders als bei IPv4 überschreibt eine neue IPv6-Adresse die alte nicht — sie kommt zusätzlich hinzu. Nach jeder Änderung mit show ipv6 interface brief gegenprüfen." },
  { cmd: "ipv6 address 2001:db8::/64 eui-64", mode: "If", desc: "Generiert die Interface-ID aus der MAC-Adresse (EUI-64).", category: "Interface" },
  { cmd: "ipv6 enable", mode: "If", desc: "Aktiviert nur die Link-Local-Adresse, ohne globale IPv6-Adresse.", category: "Interface" },
  { cmd: "show ipv6 interface brief", mode: "Priv", desc: "Alle IPv6-Adressen eines Geräts inkl. Link-Local.", category: "Interface" },
  { cmd: "show interfaces", mode: "Priv", desc: "Alle Counter, Errors, Duplex/Speed, Last.", category: "Interface" },
  { cmd: "show interfaces status", mode: "Priv", desc: "Kompakt: Port, VLAN, Duplex, Speed, Typ.", category: "Interface" },
  { cmd: "show interfaces description", mode: "Priv", desc: "Alle Ports mit Description-Feld.", category: "Interface" },

  // VLAN & Trunk
  { cmd: "vlan 10", mode: "Config", desc: "Legt VLAN 10 an und wechselt in den VLAN-Config-Modus.", category: "VLAN & Trunk" },
  { cmd: "name STAFF", mode: "Vlan", desc: "Vergibt einen Klarnamen für das VLAN.", category: "VLAN & Trunk" },
  { cmd: "switchport mode access", mode: "If", desc: "Setzt Port in den Access-Modus (genau 1 VLAN).", category: "VLAN & Trunk" },
  { cmd: "switchport access vlan 10", mode: "If", desc: "Weist den Access-Port dem VLAN 10 zu.", category: "VLAN & Trunk" },
  { cmd: "switchport mode trunk", mode: "If", desc: "Setzt Port in den Trunk-Modus (mehrere VLANs, getaggt).", category: "VLAN & Trunk" },
  { cmd: "switchport trunk encapsulation dot1q", mode: "If", desc: "Tagging-Protokoll IEEE 802.1Q (auf älteren Switches nötig).", category: "VLAN & Trunk" },
  { cmd: "switchport trunk allowed vlan 10,20,30", mode: "If", desc: "Schränkt erlaubte VLANs auf dem Trunk ein.", category: "VLAN & Trunk" },
  { cmd: "switchport trunk native vlan 99", mode: "If", desc: "Setzt das Native-VLAN (untagged) auf 99.", category: "VLAN & Trunk" },
  { cmd: "switchport voice vlan 100", mode: "If", desc: "Definiert ein Voice-VLAN für IP-Telefone.", category: "VLAN & Trunk" },
  { cmd: "show vlan brief", mode: "Priv", desc: "VLAN-ID, Name, Status, zugeordnete Access-Ports.", category: "VLAN & Trunk" },
  { cmd: "show interfaces trunk", mode: "Priv", desc: "Alle Trunk-Ports + erlaubte/aktive VLANs.", category: "VLAN & Trunk" },
  { cmd: "vtp mode {server|client|transparent}", mode: "Config", desc: "Setzt den VTP-Modus.", category: "VLAN & Trunk" },
  { cmd: "vtp domain CCNA", mode: "Config", desc: "Setzt die VTP-Domain.", category: "VLAN & Trunk" },
  { cmd: "show vtp status", mode: "Priv", desc: "VTP-Modus, Revision, Domain, Anzahl VLANs.", category: "VLAN & Trunk" },
  { cmd: "switchport mode dynamic desirable", mode: "If", desc: "DTP: verhandelt aktiv einen Trunk (auto = passiv abwartend).", category: "VLAN & Trunk" },
  { cmd: "switchport nonegotiate", mode: "If", desc: "Deaktiviert DTP-Verhandlung — Best Practice auf statischen Trunks.", category: "VLAN & Trunk" },
  { cmd: "show dtp interface gi0/1", mode: "Priv", desc: "DTP-Status und verhandelter Modus eines Ports.", category: "VLAN & Trunk" },
  { cmd: "interface gi0/0.10", mode: "Config", desc: "Erstellt Subinterface für Router-on-a-Stick (VLAN 10).", category: "VLAN & Trunk" },
  { cmd: "encapsulation dot1q 10", mode: "If", desc: "Bindet das Subinterface an VLAN-Tag 10 (vor der IP-Adresse setzen!).", category: "VLAN & Trunk" },
  { cmd: "encapsulation dot1q 10 native", mode: "If", desc: "Subinterface für das Native VLAN (untagged) am Router-on-a-Stick.", category: "VLAN & Trunk" },
  { cmd: "no switchport", mode: "If", desc: "Macht einen Switchport zum reinen Routed Port (nur auf L3-Switches).", category: "VLAN & Trunk" },
  { cmd: "show interfaces switchport", mode: "Priv", desc: "Modus, Access-VLAN, Voice-VLAN und DTP-Status pro Port.", category: "VLAN & Trunk" },

  // Spanning Tree
  { cmd: "spanning-tree mode rapid-pvst", mode: "Config", desc: "Aktiviert Rapid-PVST+ (empfohlen).", category: "Spanning Tree" },
  { cmd: "spanning-tree vlan 1 priority 4096", mode: "Config", desc: "Setzt die Bridge-Priorität (niedriger = wahrscheinlicher Root).", category: "Spanning Tree" },
  { cmd: "spanning-tree vlan 1 root primary", mode: "Config", desc: "Macht den Switch zum Root-Bridge für VLAN 1.", category: "Spanning Tree" },
  { cmd: "spanning-tree portfast", mode: "If", desc: "Port überspringt Listening/Learning (Access-Ports!).", category: "Spanning Tree" },
  { cmd: "spanning-tree bpduguard enable", mode: "If", desc: "Deaktiviert Port bei Empfang einer BPDU (PortFast-Schutz).", category: "Spanning Tree" },
  { cmd: "show spanning-tree", mode: "Priv", desc: "STP-Status, Root-Bridge, Port-Rollen/States pro VLAN.", category: "Spanning Tree" },
  { cmd: "show spanning-tree vlan 10", mode: "Priv", desc: "STP-Details nur für VLAN 10.", category: "Spanning Tree" },

  // EtherChannel
  { cmd: "channel-group 1 mode active", mode: "If", desc: "Fügt Interface zu EtherChannel 1 mit LACP-aktiv hinzu.", category: "EtherChannel" },
  { cmd: "channel-group 1 mode desirable", mode: "If", desc: "EtherChannel mit PAgP (Cisco-proprietär).", category: "EtherChannel" },
  { cmd: "interface port-channel 1", mode: "Config", desc: "Konfiguriert den logischen Port-Channel.", category: "EtherChannel" },
  { cmd: "show etherchannel summary", mode: "Priv", desc: "Status aller Port-Channels (P=in-use, D=down).", category: "EtherChannel" },

  // SSH & Sicherheit
  { cmd: "hostname SW1", mode: "Config", desc: "Vergibt den Gerätenamen (Voraussetzung für RSA-Key).", category: "SSH & Sicherheit" },
  { cmd: "ip domain-name lab.local", mode: "Config", desc: "Setzt Domain-Name (für FQDN-basierten RSA-Schlüssel).", category: "SSH & Sicherheit" },
  { cmd: "crypto key generate rsa modulus 2048", mode: "Config", desc: "Erzeugt RSA-Schlüsselpaar (Min. 768 für SSHv2).", category: "SSH & Sicherheit" },
  { cmd: "ip ssh version 2", mode: "Config", desc: "Erzwingt SSHv2.", category: "SSH & Sicherheit" },
  { cmd: "username admin secret <pw>", mode: "Config", desc: "Lokaler User mit Hash-Passwort.", category: "SSH & Sicherheit" },
  { cmd: "line vty 0 15", mode: "Config", desc: "Konfiguriert die 16 virtuellen Terminal-Lines.", category: "SSH & Sicherheit" },
  { cmd: "transport input ssh", mode: "Line", desc: "Erlaubt nur SSH-Verbindungen (kein Telnet).", category: "SSH & Sicherheit" },
  { cmd: "login local", mode: "Line", desc: "Authentifizierung gegen lokale User-DB.", category: "SSH & Sicherheit" },
  { cmd: "enable secret <pw>", mode: "Config", desc: "Setzt das Privileged-Mode-Passwort (gehasht).", category: "SSH & Sicherheit" },
  { cmd: "service password-encryption", mode: "Config", desc: "Verschlüsselt alle Klartext-Passwörter in der Config (schwach!).", category: "SSH & Sicherheit" },
  { cmd: "switchport port-security", mode: "If", desc: "Aktiviert Port-Security.", category: "SSH & Sicherheit" },
  { cmd: "switchport port-security maximum 2", mode: "If", desc: "Maximal 2 MAC-Adressen pro Port erlaubt.", category: "SSH & Sicherheit" },
  { cmd: "switchport port-security violation shutdown", mode: "If", desc: "Aktion bei Verletzung: Port deaktivieren (err-disabled). Alternativen: protect (verwerfen), restrict (verwerfen + Log/Counter).", category: "SSH & Sicherheit" },
  { cmd: "switchport port-security mac-address sticky", mode: "If", desc: "Lernt MAC-Adressen dynamisch und schreibt sie in die running-config.", category: "SSH & Sicherheit" },
  { cmd: "show port-security", mode: "Priv", desc: "Übersicht aller Port-Security-Ports mit Violation-Countern.", category: "SSH & Sicherheit" },
  { cmd: "show port-security interface gi0/1", mode: "Priv", desc: "Detail: Modus, max. MACs, Violation-Mode, Status (z. B. err-disabled).", category: "SSH & Sicherheit" },
  { cmd: "line console 0", mode: "Config", desc: "Konfiguriert den Konsolen-Port (physischer Zugang).", category: "SSH & Sicherheit" },
  { cmd: "password <pw>", mode: "Line", desc: "Setzt das Line-Passwort (Console/VTY) — mit login aktivieren.", category: "SSH & Sicherheit" },
  { cmd: "logging synchronous", mode: "Line", desc: "Syslog-Meldungen zerreißen die Eingabezeile nicht mehr.", category: "SSH & Sicherheit" },
  { cmd: "exec-timeout <min> <sek>", mode: "Line", desc: "Automatischer Sitzungs-Timeout auf der Line.", category: "SSH & Sicherheit" },
  { cmd: "banner motd #Unbefugter Zugriff verboten#", mode: "Config", desc: "Message of the Day — rechtlicher Warnhinweis vor dem Login.", category: "SSH & Sicherheit" },

  // ACLs
  { cmd: "access-list 10 permit 192.168.1.0 0.0.0.255", mode: "Config", desc: "Standard-ACL (1–99): filtert nur nach Quell-IP. Wildcard-Maske!", category: "ACLs" },
  { cmd: "access-list 100 permit tcp any host 10.1.1.5 eq 80", mode: "Config", desc: "Extended ACL (100–199): filtert nach Protokoll, Quelle, Ziel, Port.", category: "ACLs" },
  { cmd: "ip access-list extended WEB-FILTER", mode: "Config", desc: "Named ACL — eigener Config-Modus, Regeln einzeln editierbar.", category: "ACLs" },
  { cmd: "ip access-group 10 in", mode: "If", desc: "Bindet ACL 10 eingehend ans Interface. Ohne Bindung filtert keine ACL!", category: "ACLs" },
  { cmd: "access-class 10 in", mode: "Line", desc: "Beschränkt VTY-Zugriff (SSH/Telnet) auf Quell-IPs der ACL 10.", category: "ACLs" },
  { cmd: "remark Verwaltung -> Server", mode: "Config", desc: "Kommentarzeile innerhalb einer ACL (Dokumentation).", category: "ACLs" },
  { cmd: "show access-lists", mode: "Priv", desc: "Alle ACLs mit Treffer-Countern (matches).", category: "ACLs" },
  { cmd: "show ip interface gi0/1", mode: "Priv", desc: "Zeigt u. a., welche ACL auf dem Interface in welcher Richtung angewendet ist.", category: "ACLs", pitfall: "Eine syntaktisch korrekte ACL, die nirgends gebunden ist, filtert nichts — hier gegenprüfen." },

  // NAT / PAT
  { cmd: "ip nat inside", mode: "If", desc: "Markiert das Interface als Innenseite (privates Netz).", category: "NAT / PAT" },
  { cmd: "ip nat outside", mode: "If", desc: "Markiert das Interface als Außenseite (Internet/WAN).", category: "NAT / PAT" },
  { cmd: "ip nat inside source list 1 interface gi0/1 overload", mode: "Config", desc: "PAT: alle internen Adressen teilen sich die Interface-IP (Port-Multiplexing).", category: "NAT / PAT" },
  { cmd: "ip nat inside source static 192.168.1.10 203.0.113.10", mode: "Config", desc: "Statisches NAT: feste 1:1-Zuordnung (z. B. interner Webserver).", category: "NAT / PAT" },
  { cmd: "ip nat pool POOL1 203.0.113.10 203.0.113.20 netmask 255.255.255.0", mode: "Config", desc: "Adress-Pool für dynamisches NAT (mit source list <n> pool POOL1).", category: "NAT / PAT" },
  { cmd: "show ip nat translations", mode: "Priv", desc: "Aktive Übersetzungstabelle (inside/outside, local/global).", category: "NAT / PAT" },
  { cmd: "show ip nat statistics", mode: "Priv", desc: "Anzahl Übersetzungen, Treffer, konfigurierte Richtungen.", category: "NAT / PAT" },
  { cmd: "clear ip nat translation *", mode: "Priv", desc: "Leert die dynamische NAT-Tabelle (bei Umkonfiguration nötig).", category: "NAT / PAT" },

  // DHCP
  { cmd: "ip dhcp pool LAN10", mode: "Config", desc: "Erstellt einen DHCP-Pool und wechselt in den DHCP-Config-Modus.", category: "DHCP" },
  { cmd: "network 192.168.10.0 255.255.255.0", mode: "Dhcp", desc: "Adressbereich, den der Pool vergibt.", category: "DHCP" },
  { cmd: "default-router 192.168.10.1", mode: "Dhcp", desc: "Gateway, das den Clients mitgeteilt wird.", category: "DHCP" },
  { cmd: "dns-server 8.8.8.8", mode: "Dhcp", desc: "DNS-Server für die Clients.", category: "DHCP" },
  { cmd: "ip dhcp excluded-address 192.168.10.1 192.168.10.10", mode: "Config", desc: "Adressen, die NICHT vergeben werden (Gateway, Server, Drucker).", category: "DHCP" },
  { cmd: "ip helper-address 10.1.1.5", mode: "If", desc: "DHCP-Relay: leitet Broadcast-DISCOVER als Unicast an den DHCP-Server weiter.", category: "DHCP" },
  { cmd: "ip address dhcp", mode: "If", desc: "Interface bezieht seine IP selbst per DHCP (Router als Client).", category: "DHCP" },
  { cmd: "show ip dhcp binding", mode: "Priv", desc: "Vergebene Leases: IP ↔ MAC ↔ Ablaufzeit.", category: "DHCP" },
  { cmd: "show ip dhcp pool", mode: "Priv", desc: "Auslastung und Konflikte eines DHCP-Pools.", category: "DHCP" },

  // Routing
  { cmd: "ip routing", mode: "Config", desc: "Aktiviert IPv4-Routing (auf L3-Switches). Pflicht für Inter-VLAN-Routing per SVI!", category: "Routing" },
  { cmd: "interface vlan 10", mode: "Config", desc: "Erstellt ein SVI (Switch Virtual Interface) — wird zum Gateway aller VLAN-10-Hosts.", category: "Routing" },
  { cmd: "sdm prefer lanbase-routing", mode: "Config", desc: "Schaltet das SDM-Template auf Routing um (nach reload nötig, damit SVIs routen).", category: "Routing" },
  { cmd: "ip route 0.0.0.0 0.0.0.0 <gateway>", mode: "Config", desc: "Statische Default-Route.", category: "Routing" },
  { cmd: "router ospf 1", mode: "Config", desc: "Startet OSPF-Prozess 1.", category: "Routing" },
  { cmd: "network 10.0.0.0 0.0.0.255 area 0", mode: "Router", desc: "Aktiviert OSPF auf passendem Netz in Area 0.", category: "Routing" },
  { cmd: "show ip route", mode: "Priv", desc: "Routing-Tabelle.", category: "Routing" },
  { cmd: "show ip protocols", mode: "Priv", desc: "Aktive Routing-Protokolle + Parameter.", category: "Routing" },
  { cmd: "show ipv6 route", mode: "Priv", desc: "IPv6-Routingtabelle, optional mit show ipv6 route ospf protokollgefiltert.", category: "Routing" },
  { cmd: "show ipv6 protocols", mode: "Priv", desc: "Aktive IPv6-Routingprozesse.", category: "Routing" },
  { cmd: "show ip ospf neighbor", mode: "Priv", desc: "OSPF-Nachbarschaften.", category: "Routing" },
  { cmd: "ip route 192.168.2.0 255.255.255.0 10.0.0.2", mode: "Config", desc: "Statische Route: Zielnetz + Maske + Next-Hop (AD 1).", category: "Routing" },
  { cmd: "ip route 192.168.2.0 255.255.255.0 10.0.1.2 5", mode: "Config", desc: "Floating Static: AD 5 statt 1 — Backup-Route, aktiv nur wenn die primäre ausfällt.", category: "Routing" },
  { cmd: "ip route 192.168.2.0 255.255.255.0 gi0/1", mode: "Config", desc: "Statische Route über Ausgangsinterface statt Next-Hop-IP.", category: "Routing", pitfall: "Auf Multi-Access-Links (z. B. Ethernet mit mehreren Nachbarn) problematisch — führt zu unnötigen ARP-Anfragen für jedes Ziel. Next-Hop-IP ist dort die sicherere Wahl." },
  { cmd: "ip default-gateway 192.168.1.1", mode: "Config", desc: "Default-Gateway für L2-Switch-Management (kein ip routing aktiv).", category: "Routing" },
  { cmd: "router rip", mode: "Config", desc: "Startet RIP. Mit version 2 classless (überträgt Subnetzmasken).", category: "Routing" },
  { cmd: "no auto-summary", mode: "Router", desc: "Deaktiviert RIPv2-Auto-Summarization an Klassengrenzen (fast immer nötig!).", category: "Routing" },
  { cmd: "network 192.168.1.0", mode: "Router", desc: "RIP: aktiviert das classful Netz (keine Wildcard-Maske bei RIP).", category: "Routing" },
  { cmd: "ipv6 router rip FSG", mode: "Config", desc: "Startet den RIPng-Prozess mit Tag FSG (global, noch ohne Interface-Aktivierung).", category: "Routing", ptNote: "RIPng → OSPFv3-Redistribution ist in Packet Tracer unzuverlässig — bei Bedarf parallele Protokolle mit unterschiedlicher AD statt Redistribution nutzen." },
  { cmd: "ipv6 rip FSG enable", mode: "If", desc: "Aktiviert RIPng mit Tag FSG auf dem Interface.", category: "Routing" },
  { cmd: "router eigrp 10", mode: "Config", desc: "Startet EIGRP mit AS-Nummer 10 (muss auf allen Routern gleich sein).", category: "Routing" },
  { cmd: "network 10.0.0.0 0.0.0.255", mode: "Router", desc: "EIGRP: aktiviert passende Interfaces (Wildcard-Maske wie bei OSPF).", category: "Routing" },
  { cmd: "show ip eigrp neighbors", mode: "Priv", desc: "EIGRP-Nachbartabelle (Hello über Multicast 224.0.0.10).", category: "Routing" },
  { cmd: "show ip eigrp topology", mode: "Priv", desc: "Successor und Feasible Successor pro Route.", category: "Routing" },
  { cmd: "ipv6 router eigrp 1", mode: "Config", desc: "Startet den EIGRPv6-Prozess.", category: "Routing", pitfall: "Der Prozess ist nach dem Anlegen administrativ down — zwingend no shutdown im Router-Config-Modus setzen." },
  { cmd: "ipv6 eigrp 1", mode: "If", desc: "Aktiviert EIGRPv6 auf dem Interface.", category: "Routing" },
  { cmd: "show ipv6 eigrp neighbors", mode: "Priv", desc: "EIGRPv6-Nachbartabelle.", category: "Routing" },
  { cmd: "router-id 1.1.1.1", mode: "Router", desc: "Setzt die OSPF-Router-ID manuell (sonst höchste Loopback-/Interface-IP).", category: "Routing" },
  { cmd: "passive-interface gi0/0", mode: "Router", desc: "Keine Hello-Pakete auf diesem Interface (LAN ohne Nachbar-Router).", category: "Routing" },
  { cmd: "passive-interface default", mode: "Router", desc: "Setzt alle Interfaces passiv — anschließend gezielt mit no passive-interface <if> die Backbone-Links wieder aktivieren.", category: "Routing", example: "passive-interface default\\nno passive-interface gi0/2" },
  { cmd: "default-information originate", mode: "Router", desc: "OSPF verteilt die eigene Default-Route an alle Nachbarn.", category: "Routing" },
  { cmd: "show ip ospf interface brief", mode: "Priv", desc: "Area, Kosten, State und Nachbarzahl pro Interface.", category: "Routing" },
  { cmd: "ipv6 unicast-routing", mode: "Config", desc: "Aktiviert IPv6-Routing global (Voraussetzung für IPv6-Forwarding).", category: "Routing", pitfall: "IPv6-Forwarding ist per Default aus — der mit Abstand häufigste IPv6-Anfängerfehler. Immer zuerst prüfen, bevor an anderer Stelle gesucht wird." },
  { cmd: "ipv6 router ospf 1", mode: "Config", desc: "Startet OSPFv3-Prozess 1.", category: "Routing", pitfall: "OSPFv3 braucht zwingend eine IPv4-formatige Router-ID (router-id x.x.x.x), da IPv6-Interfaces keine eindeutige IPv4-Adresse liefern." },
  { cmd: "ipv6 ospf 1 area 0", mode: "If", desc: "Aktiviert OSPFv3 auf dem Interface in Area 0.", category: "Routing", pitfall: "Anders als bei OSPFv2 gibt es keinen network-Befehl — die Aktivierung erfolgt ausschließlich am Interface." },
  { cmd: "show ipv6 ospf neighbor", mode: "Priv", desc: "OSPFv3-Nachbarschaftsstatus — FULL oder 2WAY erwartet.", category: "Routing" },
  { cmd: "redistribute rip FSG metric 20 metric-type 2", mode: "Router", desc: "Verteilt RIPng-Routen in OSPFv3 (oder umgekehrt).", category: "Routing", pitfall: "Ohne explizite metric bleibt die Redistribution wirkungslos — die Metrikangabe ist Pflicht, keine Kür." },

  // HSRP & Redundanz
  { cmd: "standby 1 ip 192.168.1.254", mode: "If", desc: "HSRP-Gruppe 1 mit virtueller Gateway-IP für die Clients.", category: "HSRP & Redundanz" },
  { cmd: "standby 1 priority 110", mode: "If", desc: "Höhere Priorität = Active-Router (Default 100).", category: "HSRP & Redundanz" },
  { cmd: "standby 1 preempt", mode: "If", desc: "Router übernimmt Active-Rolle zurück, sobald er wieder verfügbar ist.", category: "HSRP & Redundanz" },
  { cmd: "show standby brief", mode: "Priv", desc: "HSRP-Status: Gruppe, Priorität, Active/Standby, virtuelle IP.", category: "HSRP & Redundanz" },

  // L2-Security
  { cmd: "ip dhcp snooping", mode: "Config", desc: "Aktiviert DHCP-Snooping global — schützt vor Rogue-DHCP-Servern (DHCP-Spoofing).", category: "L2-Security" },
  { cmd: "ip dhcp snooping vlan 10", mode: "Config", desc: "Aktiviert Snooping für ein VLAN: alle Ports werden untrusted, DISCOVER nur an Trust-Ports.", category: "L2-Security" },
  { cmd: "ip dhcp snooping trust", mode: "If", desc: "Macht den Uplink/Server-Port vertrauenswürdig — nur hier sind DHCP-OFFER erlaubt.", category: "L2-Security" },
  { cmd: "ip dhcp snooping limit rate 10", mode: "If", desc: "Begrenzt DHCP-Pakete/s am Port — bremst DHCP-Starvation-Angriffe aus.", category: "L2-Security" },
  { cmd: "show ip dhcp snooping binding", mode: "Priv", desc: "Binding-Tabelle: MAC ↔ IP ↔ VLAN ↔ Port — Grundlage für DAI und IP Source Guard.", category: "L2-Security" },
  { cmd: "ip arp inspection vlan 10", mode: "Config", desc: "Dynamic ARP Inspection: prüft ARP gegen die Snooping-Binding-Tabelle (gegen ARP-Poisoning).", category: "L2-Security" },
  { cmd: "ip arp inspection trust", mode: "If", desc: "Macht den Port vertrauenswürdig für ARP (Uplinks/Trunks, Server) — überspringt die Prüfung.", category: "L2-Security" },
  { cmd: "show ip arp inspection", mode: "Priv", desc: "DAI-Status pro VLAN + verworfene/erlaubte ARP-Pakete.", category: "L2-Security" },
  { cmd: "ip verify source", mode: "If", desc: "IP Source Guard: filtert IP-Traffic gegen die DHCP-Snooping-Bindings (gegen IP-Spoofing).", category: "L2-Security" },
  { cmd: "show ip verify source", mode: "Priv", desc: "Zeigt die aktiven IP-Source-Guard-Filter pro Port.", category: "L2-Security" },
  { cmd: "spanning-tree guard root", mode: "If", desc: "Root Guard: verhindert, dass ein fremder Switch über diesen Port Root-Bridge wird.", category: "L2-Security" },
  { cmd: "spanning-tree bpdufilter enable", mode: "If", desc: "BPDU-Filter: sendet/empfängt keine BPDUs am Port (mit Vorsicht einsetzen).", category: "L2-Security" },
  { cmd: "storm-control broadcast level 20", mode: "If", desc: "Begrenzt Broadcast-Sturm auf 20 % der Portbandbreite (gegen MAC-Flooding-Folgen).", category: "L2-Security" },

  // NTP & DNS
  { cmd: "ntp master 1", mode: "Config", desc: "Macht den Router zum NTP-Master mit Stratum 1 (Zeitquelle für das Netz).", category: "NTP & DNS" },
  { cmd: "ntp server 10.10.10.1", mode: "Config", desc: "Konfiguriert das Gerät als NTP-Client gegen diesen Server (UDP 123).", category: "NTP & DNS" },
  { cmd: "ntp source loopback 0", mode: "Config", desc: "Feste Quell-IP für ausgehende NTP-Pakete.", category: "NTP & DNS" },
  { cmd: "ntp authenticate", mode: "Config", desc: "Aktiviert NTP-Authentifizierung (mit ntp authentication-key … md5 …).", category: "NTP & DNS" },
  { cmd: "show ntp status", mode: "Priv", desc: "Sync-Status, Stratum, Referenzuhr.", category: "NTP & DNS" },
  { cmd: "show ntp associations", mode: "Priv", desc: "Liste aller NTP-Partner mit Offset und Reachability.", category: "NTP & DNS" },
  { cmd: "clock set 14:30:00 13 JUN 2026", mode: "Priv", desc: "Setzt die Systemzeit manuell (wenn kein NTP verfügbar).", category: "NTP & DNS" },
  { cmd: "clock timezone CET 1", mode: "Config", desc: "Setzt die Zeitzone des Geräts.", category: "NTP & DNS" },
  { cmd: "service timestamps log datetime msec", mode: "Config", desc: "Versieht Logmeldungen mit Zeitstempel (Millisekunden-genau).", category: "NTP & DNS" },
  { cmd: "logging host 192.168.2.11", mode: "Config", desc: "Syslog-Ziel, an das Logmeldungen gesendet werden.", category: "NTP & DNS" },
  { cmd: "logging trap informational", mode: "Config", desc: "Severity-Schwelle für Syslog (0 emerg … 7 debug).", category: "NTP & DNS" },
  { cmd: "logging buffered 16384", mode: "Config", desc: "Größe des lokalen Log-Ringpuffers in Byte.", category: "NTP & DNS" },
  { cmd: "snmp-server group GRP v3 priv", mode: "Config", desc: "SNMPv3-Gruppe mit Authentifizierung + Verschlüsselung.", category: "NTP & DNS" },
  { cmd: "snmp-server user USR GRP v3 auth sha <pw> priv aes 128 <pw>", mode: "Config", desc: "SNMPv3-Benutzer mit Auth- und Priv-Passwort.", category: "NTP & DNS" },
  { cmd: "snmp-server host 192.168.2.11 version 3 priv USR", mode: "Config", desc: "SNMP-Trap-Ziel mit SNMPv3 priv.", category: "NTP & DNS" },
  { cmd: "ip name-server 8.8.8.8", mode: "Config", desc: "Trägt einen DNS-Server für die Namensauflösung des Geräts selbst ein.", category: "NTP & DNS" },
  { cmd: "ip domain-lookup", mode: "Config", desc: "Aktiviert DNS-Auflösung (no ip domain-lookup stoppt das nervige Lookup bei Tippfehlern).", category: "NTP & DNS" },
  { cmd: "ip host www.ccn.com 200.10.20.20", mode: "Config", desc: "Statischer Host-Eintrag — bindet einen Namen an eine IP (lokaler DNS).", category: "NTP & DNS" },
  { cmd: "ip dns server", mode: "Config", desc: "Aktiviert den Router selbst als einfachen DNS-Server (UDP 53).", category: "NTP & DNS" },

  // Wartung & Recovery
  { cmd: "show version | include register", mode: "Priv", desc: "Liest das Konfigurationsregister: 0x2102 = startup lesen, 0x2142 = startup überspringen.", category: "Wartung & Recovery" },
  { cmd: "confreg 0x2142", mode: "Rommon", desc: "ROMMON: setzt das Register so, dass die startup-config beim Boot übersprungen wird (Passwort-Recovery).", category: "Wartung & Recovery" },
  { cmd: "config-register 0x2102", mode: "Config", desc: "Setzt das Register nach dem Recovery zurück auf normal (startup-config wieder laden!).", category: "Wartung & Recovery" },
  { cmd: "flash_init", mode: "Switch", desc: "Switch-Recovery: initialisiert den Flash im Boot-Loader (vor rename config.text).", category: "Wartung & Recovery" },
  { cmd: "rename flash:config.text flash:config.old", mode: "Switch", desc: "Switch-Recovery: versteckt die startup-config, damit der Switch ohne Passwort bootet.", category: "Wartung & Recovery" },
  { cmd: "copy flash: tftp:", mode: "Priv", desc: "Sichert das IOS-Image (oder die Config) auf einen TFTP-Server — Backup vor dem Upgrade!", category: "Wartung & Recovery" },
  { cmd: "copy tftp: flash:", mode: "Priv", desc: "Lädt ein neues IOS-Image vom TFTP-Server in den Flash.", category: "Wartung & Recovery" },
  { cmd: "boot system flash:c2900-universalk9.bin", mode: "Config", desc: "Legt fest, welches IOS-Image beim nächsten Start geladen wird.", category: "Wartung & Recovery" },
  { cmd: "verify /md5 flash:image.bin", mode: "Priv", desc: "Prüft die MD5-Summe des Images gegen Ciscos Angabe (Integrität nach Download).", category: "Wartung & Recovery" },
  { cmd: "show flash:", mode: "Priv", desc: "Inhalt und freier Speicher im Flash (genug Platz fürs neue Image?).", category: "Wartung & Recovery" },

  // Troubleshooting
  { cmd: "ping <ip>", mode: "Priv", desc: "ICMP-Erreichbarkeitstest.", category: "Troubleshooting", pitfall: "Das erste Paket scheitert oft, weil zuerst ARP läuft — das ist normal und kein Fehler." },
  { cmd: "ping <ip> source <lokale-ip>", mode: "Priv", desc: "Erzwingt die Quell-IP des Pings.", category: "Troubleshooting", pitfall: "Pflicht beim Testen von VPN-Traffic — ohne explizite Source wählt der Router sonst die IP des Ausgangsinterfaces, die oft nicht zum interessanten Traffic der Crypto-ACL passt." },
  { cmd: "ping (extended, ohne Zielangabe)", mode: "Priv", desc: "Interaktiver Ping: Anzahl, Größe, Timeout, Quelle einzeln abfragbar.", category: "Troubleshooting", example: "R1# ping\\nProtocol [ip]:\\nTarget IP address: 192.168.2.1\\nRepeat count [5]: 100\\nSource address or interface: gi0/1" },
  { cmd: "traceroute <ip>", mode: "Priv", desc: "Pfad-Verfolgung über alle Hops.", category: "Troubleshooting" },
  { cmd: "show mac address-table", mode: "Priv", desc: "MAC-Adress-Tabelle des Switches.", category: "Troubleshooting" },
  { cmd: "show arp", mode: "Priv", desc: "ARP-Cache (IP ↔ MAC-Mapping).", category: "Troubleshooting" },
  { cmd: "terminal monitor", mode: "Priv", desc: "Zeigt Debug-/Log-Ausgaben auch in SSH-Sitzungen an (sonst nur auf der Konsole sichtbar).", category: "Troubleshooting" },
  { cmd: "clear mac address-table dynamic", mode: "Priv", desc: "Leert die dynamische MAC-Tabelle.", category: "Troubleshooting" },
  { cmd: "clear counters", mode: "Priv", desc: "Setzt die Interface-Counter auf 0.", category: "Troubleshooting" },
  { cmd: "debug ip ospf events", mode: "Priv", desc: "Live-Debug-Ausgabe für OSPF (in Produktion sparsam!).", category: "Troubleshooting" },
  { cmd: "undebug all", mode: "Priv", desc: "Deaktiviert alle Debug-Ausgaben.", category: "Troubleshooting" },
  { cmd: "show interfaces counters errors", mode: "Priv", desc: "Fehler-Counter (CRC, Runts, Giants, Frame).", category: "Troubleshooting" },

  // IPsec / VPN
  { cmd: "license boot module c2900 technology-package securityk9", mode: "Config", desc: "Schaltet die Security-Lizenz frei (Voraussetzung für IPsec). Danach reload nötig.", category: "IPsec / VPN", pitfall: "Modellabhängig — auf manchen Plattform-Varianten wird stattdessen c1900 akzeptiert." },
  { cmd: "crypto isakmp policy 10", mode: "Config", desc: "Startet die IKE-Phase-1-Policy.", category: "IPsec / VPN" },
  { cmd: "encryption aes 256 / hash sha / authentication pre-share / group 5 / lifetime 86400", mode: "Isakmp", desc: "Die fünf Phase-1-Parameter einer ISAKMP-Policy.", category: "IPsec / VPN", pitfall: "Alle fünf Werte müssen auf beiden Peers exakt übereinstimmen — sonst bleibt Phase 1 in MM_NO_STATE hängen." },
  { cmd: "crypto isakmp key <psk> address <peer-ip>", mode: "Config", desc: "Pre-Shared Key für den angegebenen Peer.", category: "IPsec / VPN" },
  { cmd: "crypto ipsec transform-set HH-HB esp-aes 256 esp-sha-hmac", mode: "Config", desc: "Phase-2-Transform-Set (Verschlüsselung + Hash für die Nutzdaten).", category: "IPsec / VPN", pitfall: "Keine Sonderzeichen wie > im Transform-Set-Namen verwenden." },
  { cmd: "crypto map IPSEC-MAP 10 ipsec-isakmp", mode: "Config", desc: "Legt Sequenz 10 einer Crypto-Map an.", category: "IPsec / VPN", pitfall: "Dieselbe Sequenznummer bei einem zweiten Aufruf öffnet die bestehende Sequenz erneut, statt eine neue anzulegen — bei mehreren Peers braucht jeder Tunnel seine eigene Sequenznummer und eigene Crypto-ACL." },
  { cmd: "set peer <ip> / set transform-set <name> / set pfs group5 / set security-association lifetime seconds 86400", mode: "Crypto-map", desc: "Parameter einer Crypto-Map-Sequenz.", category: "IPsec / VPN", pitfall: "seconds ist Pflichtwort vor der Lifetime-Zahl, group5 wird ohne Leerzeichen geschrieben." },
  { cmd: "match address 101", mode: "Crypto-map", desc: "Crypto-ACL: definiert den interessanten Traffic für den Tunnel.", category: "IPsec / VPN", pitfall: "Muss auf beiden Seiten spiegelbildlich sein (Quelle/Ziel vertauscht) — bei mehreren Tunneln jeweils eine eigene ACL-Nummer verwenden." },
  { cmd: "crypto map IPSEC-MAP", mode: "If", desc: "Bindet die Crypto-Map an ein Interface.", category: "IPsec / VPN", pitfall: "Gehört ans Outside-Interface (Richtung Internet/Provider), nicht ans Inside-Interface." },
  { cmd: "show crypto isakmp sa", mode: "Priv", desc: "Phase-1-Status des Tunnels.", category: "IPsec / VPN", pitfall: "QM_IDLE = etabliert. MM_NO_STATE = Phase 1 nie zustande gekommen — meist Erreichbarkeitsproblem auf dem Underlay, nicht PSK-Mismatch." },
  { cmd: "show crypto ipsec sa", mode: "Priv", desc: "Phase-2-Status, Zähler encaps/decaps.", category: "IPsec / VPN", pitfall: "encaps steigt, decaps bleibt 0 → wir senden, die Gegenseite antwortet nicht. Immer zuerst die Gegenseite prüfen, nicht die eigene Konfiguration." },
  { cmd: "debug crypto isakmp", mode: "Priv", desc: "Zeigt die IKE-Aushandlung live.", category: "IPsec / VPN" },

  // Packet-Tracer-Limits
  { cmd: "clear crypto sa / clear crypto isakmp", mode: "PT-Limit", desc: "Nicht implementiert. Workaround: no crypto map am Interface entfernen, dann crypto map wieder setzen.", category: "Packet-Tracer-Limits" },
  { cmd: "RIPng → OSPFv3 Redistribution", mode: "PT-Limit", desc: "Unzuverlässig in Packet Tracer. Stattdessen parallele Protokolle mit unterschiedlicher administrativer Distanz nutzen (Pfadwahl übernimmt die AD automatisch).", category: "Packet-Tracer-Limits" },
  { cmd: "Loopback0 auf L2-Switches", mode: "PT-Limit", desc: "Existiert nicht — Loopback-Interfaces gibt es in Packet Tracer nur auf Routern und L3-Switches.", category: "Packet-Tracer-Limits" },
  { cmd: "NTP-Authentifizierungsbefehle auf Switches", mode: "PT-Limit", desc: "Nicht implementiert.", category: "Packet-Tracer-Limits" },
  { cmd: "logging facility local6", mode: "PT-Limit", desc: "Nicht implementiert.", category: "Packet-Tracer-Limits" },
  { cmd: "localtime / show-timezone bei service timestamps", mode: "PT-Limit", desc: "Diese Keywords werden nicht unterstützt.", category: "Packet-Tracer-Limits" },
  { cmd: "service sequence-numbers", mode: "PT-Limit", desc: "Nicht implementiert.", category: "Packet-Tracer-Limits" },
  { cmd: "crypto map <name> <nr> mit bestehender Nummer", mode: "PT-Limit", desc: "Öffnet die alte Sequenz erneut, legt keine neue an — kein PT-spezifisches Verhalten, aber leicht zu übersehen.", category: "Packet-Tracer-Limits" },
  { cmd: "license boot module c1900 auf einem 2900er", mode: "PT-Limit", desc: "Wird je nach Plattformvariante akzeptiert — kein Konfigurationsfehler, wenn es funktioniert.", category: "Packet-Tracer-Limits" },
  { cmd: "CEF auf einzelnen Modellen (z. B. ISR4321)", mode: "PT-Limit", desc: "Teils deaktiviert, kann zu Folgefehlern bei manchen Features führen.", category: "Packet-Tracer-Limits" },
];

export const CATEGORIES: Category[] = [
  "Modi & Navigation",
  "Konfiguration speichern",
  "Show / Diagnose",
  "Interface",
  "VLAN & Trunk",
  "Spanning Tree",
  "EtherChannel",
  "SSH & Sicherheit",
  "ACLs",
  "NAT / PAT",
  "DHCP",
  "Routing",
  "HSRP & Redundanz",
  "L2-Security",
  "NTP & DNS",
  "Wartung & Recovery",
  "Troubleshooting",
  "IPsec / VPN",
  // "Packet-Tracer-Limits" ist bewusst NICHT hier gelistet: die Kategorie
  // wird in CliGlossaryDialog.tsx separat und zuletzt gerendert, damit sie
  // in der Chip-Reihe optisch abgesetzt bleibt (siehe dort).
];

/** Nur für den ausklappbaren "Packet-Tracer-Limits"-Chip, getrennt von CATEGORIES gehalten (siehe Kommentar oben). */
export const PT_LIMITS_CATEGORY: Category = "Packet-Tracer-Limits";
