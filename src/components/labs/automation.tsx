import {
  Stack,
} from "@phosphor-icons/react";
import type { LabScenario } from "./types";

export const AUTOMATION_LABS: LabScenario[] = [

  // ─────────────────────────────────────────────────────────────
  // 24. NetFlow / Flexible NetFlow
  // ─────────────────────────────────────────────────────────────
  {
    id: "netflow",
    icon: <Stack size={20} />,
    title: "NetFlow / Flexible NetFlow",
    subtitle: "Flow-Monitor, Exporter, Top-Talker erkennen",
    difficulty: "Fortgeschritten",
    duration: "25 min",
    context: {
      problem:
        "Ohne Verkehrsanalyse weiß man nicht, wer wieviel Traffic verursacht — entscheidend für Kapazitätsplanung, Abrechnung und das Erkennen von Anomalien.",
      purpose:
        "Flexible NetFlow erfasst Flows (Quelle, Ziel, Ports, Protokoll) und exportiert sie an einen Collector. Verschafft Sichtbarkeit über den tatsächlichen Datenverkehr.",
    },
    topology: {
      description:
        "Router R1 exportiert Flow-Records an einen Collector (z. B. Cisco Stealthwatch, ntopng).",
      devices: [
        { type: "router", label: "R1", count: 1 },
        { type: "server", label: "Flow-Collector", count: 1 },
      ],
      connections: ["R1 Gi0/0 (LAN) — wird beobachtet", "R1 Mgmt → Collector 10.0.0.60:9996"],
      hint: "Flexible NetFlow (FNF) ist der moderne Nachfolger von Traditional NetFlow. Definiere selbst, WELCHE Felder du erfassen willst.",
    },
    steps: [
      {
        title: "R1: Grundkonfiguration + Loopback + Collector",
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
            mode: "interface",
            modeLabel: "R1(config)#",
            commands: [
              { cmd: "interface GigabitEthernet0/0\nip address 10.0.0.1 255.255.255.0\nno shutdown", explanation: "LAN-Interface, das später per NetFlow beobachtet wird." },
              { cmd: "interface Loopback0\nip address 10.0.0.254 255.255.255.255", explanation: "Stabile Quell-IP für den Flow-Exporter — muss VOR 'flow exporter' existieren, da dort per 'source Loopback0' darauf verwiesen wird." },
            ],
          },
          {
            device: "Flow-Collector",
            mode: "desktop",
            modeLabel: "Desktop > IP Configuration",
            commands: [
              { cmd: "IP Address: 10.0.0.60\nSubnet Mask: 255.255.255.0\nDefault Gateway: 10.0.0.1", explanation: "Collector im selben Segment wie R1 Gi0/0." },
            ],
          },
        ],
      },
      {
        title: "Flow Record definieren",
        blocks: [
          {
            device: "R1",
            mode: "global",
            modeLabel: "R1(config)#",
            commands: [
              { cmd: "flow record FNF-RECORD", explanation: "Eigenes Record-Template anlegen." },
              { cmd: "match ipv4 source address", explanation: "Key-Field: Quell-IP." },
              { cmd: "match ipv4 destination address", explanation: "Key-Field: Ziel-IP." },
              { cmd: "match transport source-port", explanation: "Key-Field." },
              { cmd: "match transport destination-port", explanation: "Key-Field." },
              { cmd: "match ipv4 protocol", explanation: "TCP/UDP/ICMP unterscheiden." },
              { cmd: "collect counter bytes", explanation: "Non-Key: Bytes pro Flow." },
              { cmd: "collect counter packets", explanation: "Non-Key: Pakete pro Flow." },
              { cmd: "collect timestamp sys-uptime first", explanation: "Wann Flow gestartet." },
              { cmd: "collect timestamp sys-uptime last", explanation: "Wann letzter Paket des Flows." },
            ],
          },
        ],
      },
      {
        title: "Flow Exporter (UDP zu Collector)",
        blocks: [
          {
            device: "R1",
            mode: "global",
            modeLabel: "R1(config)#",
            commands: [
              { cmd: "flow exporter FNF-EXP", explanation: "Exporter-Konfig." },
              { cmd: "destination 10.0.0.60", explanation: "Collector-IP." },
              { cmd: "source Loopback0", explanation: "Stabile Quell-IP." },
              { cmd: "transport udp 9996", explanation: "UDP-Port. Standard 2055 oder 9996." },
              { cmd: "template data timeout 60", explanation: "Templates alle 60s neu senden — Collector vergisst sonst." },
            ],
          },
        ],
      },
      {
        title: "Flow Monitor & am Interface anwenden",
        blocks: [
          {
            device: "R1",
            mode: "global",
            modeLabel: "R1(config)#",
            commands: [
              { cmd: "flow monitor FNF-MON", explanation: "Verknüpft Record + Exporter." },
              { cmd: "record FNF-RECORD", explanation: "" },
              { cmd: "exporter FNF-EXP", explanation: "" },
              { cmd: "cache timeout active 60", explanation: "Lange Flows alle 60s exportieren." },
              { cmd: "cache timeout inactive 15", explanation: "Inaktive Flows nach 15s exportieren." },
            ],
          },
          {
            device: "R1",
            mode: "interface",
            modeLabel: "R1(config)#",
            commands: [
              { cmd: "interface Gi0/0", explanation: "Beobachtetes Interface." },
              { cmd: "ip flow monitor FNF-MON input", explanation: "Ingress-Flow erfassen." },
              { cmd: "ip flow monitor FNF-MON output", explanation: "Egress-Flow erfassen — beidseitige Sicht." },
            ],
          },
          {
            device: "R1",
            mode: "privileged",
            modeLabel: "R1(config-if)#",
            commands: [
              { cmd: "end\ncopy running-config startup-config", explanation: "Speichern." },
            ],
          },
        ],
      },
      {
        title: "Typische Fehler bei NetFlow",
        blocks: [
          {
            device: "Merke",
            mode: "info",
            modeLabel: "Häufige Fehler",
            commands: [
              { cmd: "source-Interface im Exporter existiert nicht", explanation: "'source Loopback0' scheitert oder bleibt wirkungslos, wenn das Loopback-Interface vorher nicht angelegt wurde." },
              { cmd: "flow monitor nur an einem Interface angewendet", explanation: "Ohne 'ip flow monitor ... input' UND '... output' sieht der Collector nur eine Richtung des Traffics — die Top-Talker-Auswertung ist dann unvollständig." },
              { cmd: "Record und Exporter nicht im Monitor verknüpft", explanation: "Ein flow monitor ohne 'record' und 'exporter' sammelt zwar lokal Daten, sendet aber nichts an den Collector." },
              { cmd: "UDP-Port zwischen Router und Collector unterschiedlich", explanation: "'transport udp 9996' auf dem Router muss zum Listener-Port der Collector-Software passen — ein Mismatch führt zu 'errors' in show flow exporter statistics." },
            ],
          },
        ],
      },
    ],
    verifyCommands: [
      { cmd: "show flow monitor FNF-MON cache", expected: "Flow-Liste mit Bytes/Packets pro Flow" },
      { cmd: "show flow exporter FNF-EXP statistics", expected: "Records sent, errors 0" },
      { cmd: "show flow monitor FNF-MON cache aggregate ipv4 source address sort highest counter bytes top 10", expected: "Top-Talker Liste" },
    ],
    glossary: [
      { term: "NetFlow", def: "Cisco-Technik zur Erfassung von Verkehrsflüssen pro Gerät." },
      { term: "Flow", def: "Folge von Paketen mit gleichem 5-Tupel (Quelle/Ziel-IP, Quelle/Ziel-Port, Protokoll)." },
      { term: "Flow Record", def: "Definiert, welche Felder erfasst werden (match) und welche Zähler (collect)." },
      { term: "match / collect", def: "match = Schlüsselfelder eines Flows; collect = mitgezählte Werte (Bytes, Pakete, Zeit)." },
      { term: "Flow Exporter", def: "Sendet die gesammelten Flows an einen externen Collector." },
      { term: "Flow Monitor", def: "Verknüpft Record + Exporter und wird auf ein Interface angewendet." },
      { term: "Collector", def: "Server, der NetFlow-Daten empfängt und auswertet." },
      { term: "5-Tupel", def: "Die fünf Felder, die einen Flow eindeutig identifizieren." },
    ],
  },

  // ─────────────────────────────────────────────────────────────
  // 28. REST API mit RESTCONF
  // ─────────────────────────────────────────────────────────────
  {
    id: "restconf",
    icon: <Stack size={20} />,
    title: "REST API mit RESTCONF",
    subtitle: "HTTPS + YANG-Daten + curl-Beispiel (CCNA 6.0)",
    difficulty: "Fortgeschritten",
    duration: "20 min",
    context: {
      problem:
        "Geräte einzeln per CLI zu konfigurieren skaliert nicht. Automatisierung braucht eine programmierbare Schnittstelle statt Tastatureingaben.",
      purpose:
        "RESTCONF auf IOS-XE aktivieren und per HTTPS/JSON Interfaces auslesen und ändern — der Einstieg in Netzwerk-Automatisierung über eine REST-API.",
    },
    topology: {
      description:
        "Router R1 (IOS-XE 17.x) wird via RESTCONF (HTTPS auf Port 443) konfigurierbar. Wir holen Interface-Status mit curl.",
      devices: [
        { type: "router", label: "R1 (IOS-XE)", count: 1 },
        { type: "pc", label: "Admin-PC mit curl", count: 1 },
      ],
      connections: ["Admin-PC → R1 Mgmt 10.0.0.1:443"],
      hint: "RESTCONF nutzt YANG-Modelle als Datenstruktur — JSON oder XML. Ideal für Python-Skripte und Ansible.",
    },
    steps: [
      {
        title: "R1: Grundkonfiguration + Management-Interface",
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
            mode: "interface",
            modeLabel: "R1(config)#",
            commands: [
              { cmd: "interface GigabitEthernet0/0\nip address 10.0.0.1 255.255.255.0\nno shutdown", explanation: "Management-Interface, über das der Admin-PC per HTTPS zugreift." },
            ],
          },
          {
            device: "Admin-PC",
            mode: "desktop",
            modeLabel: "Desktop > IP Configuration",
            commands: [
              { cmd: "IP Address: 10.0.0.10\nSubnet Mask: 255.255.255.0\nDefault Gateway: 10.0.0.1", explanation: "Gleiches Segment wie R1 Gi0/0." },
            ],
          },
        ],
      },
      {
        title: "RESTCONF auf dem Router aktivieren",
        blocks: [
          {
            device: "R1",
            mode: "global",
            modeLabel: "R1(config)#",
            commands: [
              { cmd: "ip http secure-server", explanation: "HTTPS-Webserver aktivieren — RESTCONF läuft darüber." },
              { cmd: "ip http authentication local", explanation: "Lokale User-DB für Auth." },
              { cmd: "restconf", explanation: "RESTCONF-Feature aktivieren." },
              { cmd: "username admin privilege 15 secret AdminP@ss", explanation: "User für API-Zugriff." },
              { cmd: "end\ncopy running-config startup-config", explanation: "Speichern." },
            ],
          },
        ],
      },
      {
        title: "Vom Admin-PC: GET /interfaces",
        blocks: [
          {
            device: "Admin-PC",
            mode: "shell",
            modeLabel: "$ curl",
            commands: [
              { cmd: "curl -k -u admin:AdminP@ss \\\n  -H 'Accept: application/yang-data+json' \\\n  https://10.0.0.1/restconf/data/ietf-interfaces:interfaces", explanation: "Holt alle Interfaces als JSON. '-k' = unsicheres SSL akzeptieren (Self-Signed). Response: { 'ietf-interfaces:interfaces': { 'interface': [...] } }" },
              { cmd: "curl -k -u admin:AdminP@ss \\\n  -H 'Accept: application/yang-data+json' \\\n  https://10.0.0.1/restconf/data/ietf-interfaces:interfaces-state/interface=GigabitEthernet0%2F0", explanation: "Live-State eines einzelnen Interfaces. '%2F' ist URL-encoded '/'." },
            ],
          },
        ],
      },
      {
        title: "PUT — Description ändern",
        blocks: [
          {
            device: "Admin-PC",
            mode: "shell",
            modeLabel: "$ curl",
            commands: [
              { cmd: "curl -k -u admin:AdminP@ss -X PUT \\\n  -H 'Content-Type: application/yang-data+json' \\\n  -d '{\"ietf-interfaces:interface\":{\"name\":\"GigabitEthernet0/0\",\"description\":\"Uplink to Core\",\"type\":\"iana-if-type:ethernetCsmacd\",\"enabled\":true}}' \\\n  https://10.0.0.1/restconf/data/ietf-interfaces:interfaces/interface=GigabitEthernet0%2F0", explanation: "PUT ersetzt das komplette Objekt. PATCH = nur Teil ändern. POST = neues Objekt erstellen." },
            ],
          },
        ],
      },
      {
        title: "Typische Fehler bei RESTCONF",
        blocks: [
          {
            device: "Merke",
            mode: "info",
            modeLabel: "Häufige Fehler",
            commands: [
              { cmd: "ip http secure-server vergessen", explanation: "Ohne den HTTPS-Server läuft RESTCONF gar nicht — 'restconf' allein aktiviert nur das Feature, nicht den Transport." },
              { cmd: "Accept-Header fehlt oder falsch", explanation: "Ohne 'Accept: application/yang-data+json' liefert der Router oft XML statt JSON oder lehnt die Anfrage ab." },
              { cmd: "URL-Encoding von '/' im Interface-Namen vergessen", explanation: "GigabitEthernet0/0 muss in der URL als GigabitEthernet0%2F0 kodiert werden — ein rohes '/' wird als Pfadtrenner missverstanden." },
              { cmd: "PUT mit unvollständigem JSON-Body", explanation: "PUT ersetzt das GESAMTE Objekt — fehlen Pflichtfelder wie 'type' oder 'enabled', wird die Anfrage abgelehnt oder das Interface fehlkonfiguriert." },
            ],
          },
        ],
      },
    ],
    verifyCommands: [
      { cmd: "show running-config | include restconf", explanation: "restconf", expected: "restconf" },
      { cmd: "show platform software yang-management process", expected: "ncsshd, confd, syncfd: Running" },
      { cmd: "Browser: https://10.0.0.1/restconf/data?depth=2", expected: "JSON-Response mit Top-Level YANG-Modulen" },
    ],
    glossary: [
      { term: "RESTCONF", def: "HTTP(S)-basierte API (RFC 8040), die YANG-Datenmodelle als REST-Ressourcen bereitstellt." },
      { term: "YANG", def: "Modellierungssprache, die die Konfigurations-/Statusdaten eines Geräts strukturiert beschreibt." },
      { term: "ip http secure-server", def: "Aktiviert den HTTPS-Server — Voraussetzung für RESTCONF." },
      { term: "GET / PUT", def: "HTTP-Methoden: GET liest Daten, PUT setzt/ersetzt eine Konfiguration." },
      { term: "JSON", def: "Datenformat der Anfragen/Antworten (application/yang-data+json)." },
      { term: "ietf-interfaces", def: "Standard-YANG-Modul für Interface-Konfiguration und -Status." },
      { term: "API-Endpoint", def: "URL-Pfad einer Ressource, z. B. /restconf/data/ietf-interfaces:interfaces." },
    ],
  },

  // ─────────────────────────────────────────────────────────────
  // 29. NETCONF + YANG
  // ─────────────────────────────────────────────────────────────
  {
    id: "netconf-yang",
    icon: <Stack size={20} />,
    title: "NETCONF + YANG",
    subtitle: "SSH-basierte API + Python-ncclient-Snippet",
    difficulty: "Fortgeschritten",
    duration: "20 min",
    context: {
      problem:
        "Programmierbare Konfiguration braucht ein robustes, transaktionales Protokoll — kein fehleranfälliges Screen-Scraping der CLI.",
      purpose:
        "NETCONF (Port 830) auf IOS-XE aktivieren und per Python (ncclient) Konfigurationen lesen und schreiben. XML/YANG-basierte Automatisierung mit Transaktionen.",
    },
    topology: {
      description:
        "Router R1 mit NETCONF über SSH-Port 830. Python-Skript holt die Hostname-Konfig per ncclient.",
      devices: [
        { type: "router", label: "R1 (IOS-XE)", count: 1 },
        { type: "pc", label: "Admin-PC mit Python", count: 1 },
      ],
      connections: ["Admin-PC → R1 Mgmt 10.0.0.1:830 (SSH/NETCONF)"],
      hint: "NETCONF ist 'state-aware' — kennt Configure (candidate) + Commit. Im Gegensatz zu CLI: atomare Transaktionen.",
    },
    steps: [
      {
        title: "R1: Grundkonfiguration + Management-Interface",
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
            mode: "interface",
            modeLabel: "R1(config)#",
            commands: [
              { cmd: "interface GigabitEthernet0/0\nip address 10.0.0.1 255.255.255.0\nno shutdown", explanation: "Management-Interface, über das der Admin-PC per SSH/NETCONF zugreift." },
            ],
          },
          {
            device: "Admin-PC",
            mode: "desktop",
            modeLabel: "Desktop > IP Configuration",
            commands: [
              { cmd: "IP Address: 10.0.0.10\nSubnet Mask: 255.255.255.0\nDefault Gateway: 10.0.0.1", explanation: "Gleiches Segment wie R1 Gi0/0." },
            ],
          },
        ],
      },
      {
        title: "NETCONF auf R1 aktivieren",
        blocks: [
          {
            device: "R1",
            mode: "global",
            modeLabel: "R1(config)#",
            commands: [
              { cmd: "netconf-yang", explanation: "NETCONF-Server aktivieren — lauscht auf Port 830." },
              { cmd: "username netops privilege 15 secret NetOpsP@ss", explanation: "User für NETCONF." },
              { cmd: "aaa new-model", explanation: "PFLICHT für NETCONF in IOS-XE." },
              { cmd: "aaa authentication login default local", explanation: "Lokale Auth." },
              { cmd: "aaa authorization exec default local", explanation: "" },
              { cmd: "end\ncopy running-config startup-config", explanation: "Speichern." },
            ],
          },
        ],
      },
      {
        title: "Python-Snippet (ncclient)",
        blocks: [
          {
            device: "Admin-PC",
            mode: "shell",
            modeLabel: "$ python3",
            commands: [
              { cmd: "pip install ncclient", explanation: "Library installieren." },
              { cmd: "from ncclient import manager\n\nwith manager.connect(\n    host='10.0.0.1', port=830,\n    username='netops', password='NetOpsP@ss',\n    hostkey_verify=False, device_params={'name':'iosxe'}\n) as m:\n    filter = '''\n    <filter>\n      <native xmlns=\"http://cisco.com/ns/yang/Cisco-IOS-XE-native\">\n        <hostname/>\n      </native>\n    </filter>'''\n    reply = m.get_config(source='running', filter=filter)\n    print(reply.xml)", explanation: "Holt den Hostname aus der running-config via NETCONF. Filter im XML mit Cisco-IOS-XE-native YANG-Modell." },
            ],
          },
        ],
      },
      {
        title: "Hostname per NETCONF ändern",
        blocks: [
          {
            device: "Admin-PC",
            mode: "shell",
            modeLabel: "$ python3",
            commands: [
              { cmd: "config = '''\n<config>\n  <native xmlns=\"http://cisco.com/ns/yang/Cisco-IOS-XE-native\">\n    <hostname>R1-NEW</hostname>\n  </native>\n</config>'''\nm.edit_config(target='running', config=config)\nprint('Hostname updated!')", explanation: "edit_config schreibt direkt in running-config. Alternativ: target='candidate' + m.commit() für transaktionale Änderung." },
            ],
          },
        ],
      },
      {
        title: "Typische Fehler bei NETCONF",
        blocks: [
          {
            device: "Merke",
            mode: "info",
            modeLabel: "Häufige Fehler",
            commands: [
              { cmd: "aaa new-model vor den Auth-Methodenlisten vergessen", explanation: "Ohne aaa new-model bleiben aaa authentication/authorization-Befehle wirkungslos — der NETCONF-Login schlägt dann fehl, obwohl netconf-yang aktiv ist." },
              { cmd: "hostkey_verify nicht bewusst gesetzt", explanation: "hostkey_verify=False ist nur für Lab-Umgebungen akzeptabel — in Produktion muss der SSH-Host-Key verifiziert werden, sonst sind Man-in-the-Middle-Angriffe möglich." },
              { cmd: "XML-Filter mit falschem Namespace", explanation: "Der xmlns-Namespace im <native>-Filter muss exakt zum verwendeten YANG-Modell passen — ein falscher Namespace liefert eine leere oder fehlerhafte Antwort." },
              { cmd: "edit_config auf 'running' statt 'candidate' bei Bedarf nach Transaktion", explanation: "Wird eine transaktionale, prüfbare Änderung gebraucht, gehört target='candidate' + anschließendes m.commit() verwendet — direktes Schreiben auf 'running' wirkt sofort und lässt sich nicht vorher validieren." },
            ],
          },
        ],
      },
    ],
    verifyCommands: [
      { cmd: "show netconf-yang sessions", expected: "Active sessions: 1, User: netops" },
      { cmd: "show platform software yang-management process", expected: "ncsshd: Running" },
      { cmd: "show running-config | include hostname", expected: "hostname R1-NEW" },
    ],
    glossary: [
      { term: "NETCONF", def: "XML-basiertes Konfigurationsprotokoll (RFC 6241) über SSH, Port 830." },
      { term: "YANG", def: "Datenmodell, das NETCONF und RESTCONF gemeinsam nutzen." },
      { term: "ncclient", def: "Python-Bibliothek, um NETCONF-Sitzungen aufzubauen und RPCs zu senden." },
      { term: "Port 830", def: "Standard-TCP-Port für NETCONF over SSH." },
      { term: "RPC", def: "Remote Procedure Call — NETCONF-Operation wie get-config oder edit-config." },
      { term: "Datastore", def: "Konfigurationsspeicher: running (aktiv) bzw. candidate (Entwurf vor Commit)." },
      { term: "XML", def: "Auszeichnungsformat der NETCONF-Nachrichten." },
    ],
  },
];
