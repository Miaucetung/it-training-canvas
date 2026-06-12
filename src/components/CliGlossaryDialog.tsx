// ============================================================
// CliGlossaryDialog — Glossar aller relevanten Cisco IOS-CLI-Befehle
// Mit Kategorien-Filter, Volltextsuche und Copy-to-Clipboard pro Befehl.
// ============================================================

import { X, MagnifyingGlass, Copy, Check } from "@phosphor-icons/react";
import { useMemo, useState } from "react";

interface Props {
  dark: boolean;
  onClose: () => void;
}

type Category =
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
  | "Troubleshooting";

interface Entry {
  cmd: string;
  mode: string;
  desc: string;
  category: Category;
}

const ENTRIES: Entry[] = [
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
  { cmd: "show lldp neighbors", mode: "Priv", desc: "Nachbarn via LLDP (Vendor-neutral).", category: "Show / Diagnose" },

  // Interface
  { cmd: "interface gi0/1", mode: "Config", desc: "Wechsel in den Interface-Config-Modus (gigabit, 1. Port).", category: "Interface" },
  { cmd: "interface range gi0/1 - 24", mode: "Config", desc: "Konfiguriert mehrere Interfaces gleichzeitig.", category: "Interface" },
  { cmd: "description <text>", mode: "If", desc: "Klartext-Beschreibung des Ports (Dokumentation).", category: "Interface" },
  { cmd: "shutdown", mode: "If", desc: "Deaktiviert das Interface administrativ.", category: "Interface" },
  { cmd: "no shutdown", mode: "If", desc: "Aktiviert das Interface (`up`).", category: "Interface" },
  { cmd: "speed {10|100|1000|auto}", mode: "If", desc: "Setzt die Port-Geschwindigkeit.", category: "Interface" },
  { cmd: "duplex {half|full|auto}", mode: "If", desc: "Setzt den Duplex-Modus.", category: "Interface" },
  { cmd: "ip address <ip> <maske>", mode: "If", desc: "Weist dem Interface eine IPv4-Adresse zu.", category: "Interface" },
  { cmd: "ipv6 address <prefix>/<länge>", mode: "If", desc: "Weist dem Interface eine IPv6-Adresse zu.", category: "Interface" },
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
  { cmd: "banner motd #Unbefugter Zugriff verboten#", mode: "Config", desc: "Message of the Day — rechtlicher Warnhinweis vor dem Login.", category: "SSH & Sicherheit" },

  // ACLs
  { cmd: "access-list 10 permit 192.168.1.0 0.0.0.255", mode: "Config", desc: "Standard-ACL (1–99): filtert nur nach Quell-IP. Wildcard-Maske!", category: "ACLs" },
  { cmd: "access-list 100 permit tcp any host 10.1.1.5 eq 80", mode: "Config", desc: "Extended ACL (100–199): filtert nach Protokoll, Quelle, Ziel, Port.", category: "ACLs" },
  { cmd: "ip access-list extended WEB-FILTER", mode: "Config", desc: "Named ACL — eigener Config-Modus, Regeln einzeln editierbar.", category: "ACLs" },
  { cmd: "ip access-group 10 in", mode: "If", desc: "Bindet ACL 10 eingehend ans Interface. Ohne Bindung filtert keine ACL!", category: "ACLs" },
  { cmd: "access-class 10 in", mode: "Line", desc: "Beschränkt VTY-Zugriff (SSH/Telnet) auf Quell-IPs der ACL 10.", category: "ACLs" },
  { cmd: "remark Verwaltung -> Server", mode: "Config", desc: "Kommentarzeile innerhalb einer ACL (Dokumentation).", category: "ACLs" },
  { cmd: "show access-lists", mode: "Priv", desc: "Alle ACLs mit Treffer-Countern (matches).", category: "ACLs" },

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

  // Routing
  { cmd: "ip routing", mode: "Config", desc: "Aktiviert IPv4-Routing (auf L3-Switches).", category: "Routing" },
  { cmd: "ip route 0.0.0.0 0.0.0.0 <gateway>", mode: "Config", desc: "Statische Default-Route.", category: "Routing" },
  { cmd: "router ospf 1", mode: "Config", desc: "Startet OSPF-Prozess 1.", category: "Routing" },
  { cmd: "network 10.0.0.0 0.0.0.255 area 0", mode: "Router", desc: "Aktiviert OSPF auf passendem Netz in Area 0.", category: "Routing" },
  { cmd: "show ip route", mode: "Priv", desc: "Routing-Tabelle.", category: "Routing" },
  { cmd: "show ip protocols", mode: "Priv", desc: "Aktive Routing-Protokolle + Parameter.", category: "Routing" },
  { cmd: "show ip ospf neighbor", mode: "Priv", desc: "OSPF-Nachbarschaften.", category: "Routing" },
  { cmd: "ip route 192.168.2.0 255.255.255.0 10.0.0.2", mode: "Config", desc: "Statische Route: Zielnetz + Maske + Next-Hop (AD 1).", category: "Routing" },
  { cmd: "ip route 192.168.2.0 255.255.255.0 10.0.1.2 5", mode: "Config", desc: "Floating Static: AD 5 statt 1 — Backup-Route, aktiv nur wenn die primäre ausfällt.", category: "Routing" },
  { cmd: "ip default-gateway 192.168.1.1", mode: "Config", desc: "Default-Gateway für L2-Switch-Management (kein ip routing aktiv).", category: "Routing" },
  { cmd: "router rip", mode: "Config", desc: "Startet RIP. Mit version 2 classless (überträgt Subnetzmasken).", category: "Routing" },
  { cmd: "no auto-summary", mode: "Router", desc: "Deaktiviert RIPv2-Auto-Summarization an Klassengrenzen (fast immer nötig!).", category: "Routing" },
  { cmd: "network 192.168.1.0", mode: "Router", desc: "RIP: aktiviert das classful Netz (keine Wildcard-Maske bei RIP).", category: "Routing" },
  { cmd: "router eigrp 10", mode: "Config", desc: "Startet EIGRP mit AS-Nummer 10 (muss auf allen Routern gleich sein).", category: "Routing" },
  { cmd: "network 10.0.0.0 0.0.0.255", mode: "Router", desc: "EIGRP: aktiviert passende Interfaces (Wildcard-Maske wie bei OSPF).", category: "Routing" },
  { cmd: "show ip eigrp neighbors", mode: "Priv", desc: "EIGRP-Nachbartabelle (Hello über Multicast 224.0.0.10).", category: "Routing" },
  { cmd: "router-id 1.1.1.1", mode: "Router", desc: "Setzt die OSPF-Router-ID manuell (sonst höchste Loopback-/Interface-IP).", category: "Routing" },
  { cmd: "passive-interface gi0/0", mode: "Router", desc: "Keine Hello-Pakete auf diesem Interface (LAN ohne Nachbar-Router).", category: "Routing" },
  { cmd: "default-information originate", mode: "Router", desc: "OSPF verteilt die eigene Default-Route an alle Nachbarn.", category: "Routing" },
  { cmd: "ipv6 unicast-routing", mode: "Config", desc: "Aktiviert IPv6-Routing global (Voraussetzung für IPv6-Forwarding).", category: "Routing" },

  // HSRP & Redundanz
  { cmd: "standby 1 ip 192.168.1.254", mode: "If", desc: "HSRP-Gruppe 1 mit virtueller Gateway-IP für die Clients.", category: "HSRP & Redundanz" },
  { cmd: "standby 1 priority 110", mode: "If", desc: "Höhere Priorität = Active-Router (Default 100).", category: "HSRP & Redundanz" },
  { cmd: "standby 1 preempt", mode: "If", desc: "Router übernimmt Active-Rolle zurück, sobald er wieder verfügbar ist.", category: "HSRP & Redundanz" },
  { cmd: "show standby brief", mode: "Priv", desc: "HSRP-Status: Gruppe, Priorität, Active/Standby, virtuelle IP.", category: "HSRP & Redundanz" },

  // Troubleshooting
  { cmd: "ping <ip>", mode: "Priv", desc: "ICMP-Erreichbarkeitstest.", category: "Troubleshooting" },
  { cmd: "traceroute <ip>", mode: "Priv", desc: "Pfad-Verfolgung über alle Hops.", category: "Troubleshooting" },
  { cmd: "show mac address-table", mode: "Priv", desc: "MAC-Adress-Tabelle des Switches.", category: "Troubleshooting" },
  { cmd: "show arp", mode: "Priv", desc: "ARP-Cache (IP ↔ MAC-Mapping).", category: "Troubleshooting" },
  { cmd: "clear mac address-table dynamic", mode: "Priv", desc: "Leert die dynamische MAC-Tabelle.", category: "Troubleshooting" },
  { cmd: "clear counters", mode: "Priv", desc: "Setzt die Interface-Counter auf 0.", category: "Troubleshooting" },
  { cmd: "debug ip ospf events", mode: "Priv", desc: "Live-Debug-Ausgabe für OSPF (in Produktion sparsam!).", category: "Troubleshooting" },
  { cmd: "undebug all", mode: "Priv", desc: "Deaktiviert alle Debug-Ausgaben.", category: "Troubleshooting" },
  { cmd: "show interfaces counters errors", mode: "Priv", desc: "Fehler-Counter (CRC, Runts, Giants, Frame).", category: "Troubleshooting" },
];

const CATEGORIES: Category[] = [
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
  "Troubleshooting",
];

function CopyButton({ text, dark }: { text: string; dark: boolean }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      onClick={async (e) => {
        e.stopPropagation();
        try {
          await navigator.clipboard.writeText(text);
          setCopied(true);
          window.setTimeout(() => setCopied(false), 1400);
        } catch {
          // Clipboard nicht verfügbar (z. B. unsicherer Kontext)
        }
      }}
      title={copied ? "Kopiert!" : "Befehl in Zwischenablage kopieren"}
      aria-label="Befehl kopieren"
      className={`shrink-0 p-1.5 rounded-md border transition-colors ${
        copied
          ? dark
            ? "bg-emerald-500/20 border-emerald-500/40 text-emerald-300"
            : "bg-emerald-50 border-emerald-300 text-emerald-700"
          : dark
            ? "border-slate-700 text-slate-400 hover:bg-slate-700 hover:text-slate-200"
            : "border-slate-300 text-slate-500 hover:bg-slate-100 hover:text-slate-700"
      }`}
    >
      {copied ? <Check size={14} weight="bold" /> : <Copy size={14} />}
    </button>
  );
}

export function CliGlossaryDialog({ dark, onClose }: Props) {
  const [query, setQuery] = useState("");
  const [activeCat, setActiveCat] = useState<Category | "Alle">("Alle");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return ENTRIES.filter((e) => {
      if (activeCat !== "Alle" && e.category !== activeCat) return false;
      if (!q) return true;
      return (
        e.cmd.toLowerCase().includes(q) ||
        e.desc.toLowerCase().includes(q) ||
        e.mode.toLowerCase().includes(q) ||
        e.category.toLowerCase().includes(q)
      );
    });
  }, [query, activeCat]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
      onClick={onClose}
    >
      <div
        className={`relative w-full max-w-5xl max-h-[92vh] flex flex-col rounded-2xl border shadow-2xl ${
          dark ? "bg-slate-900 border-slate-700 text-slate-100" : "bg-white border-slate-200 text-slate-900"
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className={`flex items-center justify-between px-6 py-4 border-b ${
          dark ? "border-slate-700" : "border-slate-200"
        }`}>
          <div>
            <h2 className="text-lg font-semibold">Cisco IOS — CLI-Glossar</h2>
            <p className="text-xs opacity-70">
              {ENTRIES.length} Befehle · Suche, Filter & 1-Klick-Kopie pro Eintrag
            </p>
          </div>
          <button
            onClick={onClose}
            aria-label="Schließen"
            className="p-2 rounded-lg hover:bg-slate-500/20"
          >
            <X size={18} weight="bold" />
          </button>
        </div>

        {/* Search + Filter */}
        <div className={`px-6 py-3 border-b space-y-3 ${
          dark ? "border-slate-700 bg-slate-900" : "border-slate-200 bg-white"
        }`}>
          <div className={`flex items-center gap-2 px-3 py-2 rounded-lg border ${
            dark ? "border-slate-700 bg-slate-800" : "border-slate-300 bg-slate-50"
          }`}>
            <MagnifyingGlass size={16} className="opacity-60" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Befehl, Beschreibung, Modus oder Kategorie suchen …"
              className="flex-1 bg-transparent outline-none text-sm"
              autoFocus
            />
            {query && (
              <button
                onClick={() => setQuery("")}
                className="text-xs opacity-60 hover:opacity-100"
              >
                löschen
              </button>
            )}
          </div>
          <div className="flex flex-wrap gap-1.5">
            {(["Alle", ...CATEGORIES] as const).map((c) => {
              const active = activeCat === c;
              return (
                <button
                  key={c}
                  onClick={() => setActiveCat(c)}
                  className={`text-xs px-2.5 py-1 rounded-full border transition-colors ${
                    active
                      ? dark
                        ? "bg-cyan-500/20 border-cyan-500/50 text-cyan-100"
                        : "bg-cyan-100 border-cyan-300 text-cyan-900"
                      : dark
                        ? "border-slate-700 text-slate-400 hover:bg-slate-800"
                        : "border-slate-300 text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  {c}
                </button>
              );
            })}
          </div>
        </div>

        {/* Liste */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {filtered.length === 0 ? (
            <div className="text-center py-12 opacity-60 text-sm">
              Keine Befehle gefunden.
            </div>
          ) : (
            <ul className="space-y-2">
              {filtered.map((e, i) => (
                <li
                  key={i}
                  className={`flex items-start gap-3 rounded-lg border px-3 py-2.5 ${
                    dark
                      ? "border-slate-700 bg-slate-800/40 hover:bg-slate-800/70"
                      : "border-slate-200 bg-slate-50 hover:bg-slate-100"
                  }`}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <code className={`text-sm font-mono font-semibold ${
                        dark ? "text-cyan-300" : "text-cyan-700"
                      }`}>
                        {e.cmd}
                      </code>
                      <span className={`text-[10px] px-1.5 py-0.5 rounded font-mono ${
                        dark ? "bg-slate-700 text-slate-300" : "bg-slate-200 text-slate-600"
                      }`}>
                        {e.mode}
                      </span>
                      <span className={`text-[10px] px-1.5 py-0.5 rounded ${
                        dark ? "bg-indigo-500/20 text-indigo-300" : "bg-indigo-50 text-indigo-700"
                      }`}>
                        {e.category}
                      </span>
                    </div>
                    <div className="text-xs opacity-80 mt-1">{e.desc}</div>
                  </div>
                  <CopyButton text={e.cmd} dark={dark} />
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Footer */}
        <div className={`px-6 py-3 border-t text-xs flex items-center justify-between ${
          dark ? "border-slate-700 text-slate-400" : "border-slate-200 text-slate-500"
        }`}>
          <span>{filtered.length} von {ENTRIES.length} Befehlen</span>
          <span>Tipp: Im IOS-Terminal mit <code className="font-mono">?</code> kontextsensitive Hilfe abrufen.</span>
        </div>
      </div>
    </div>
  );
}
