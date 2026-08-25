import {
  Key,
  Lightning,
  Shield,
} from "@phosphor-icons/react";
import type { LabScenario } from "./types";

export const SECURITY_LABS: LabScenario[] = [

  // ─────────────────────────────────────────────────────────────
  // 8. SSH-Konfiguration
  // ─────────────────────────────────────────────────────────────
  {
    id: "ssh",
    icon: <Key size={20} />,
    title: "SSH Remote-Zugriff",
    subtitle: "Router · Admin-PC",
    difficulty: "Anfänger",
    duration: "15 min",
    context: {
      problem:
        "Telnet überträgt Login und gesamte Sitzung im Klartext — jeder im Pfad kann Passwörter mitlesen. Fernzugriff auf Netzgeräte muss verschlüsselt sein.",
      purpose:
        "SSHv2 für sicheren Remote-Zugriff einrichten: RSA-Schlüssel, lokale Benutzer, VTY-Lines nur per SSH. Standard-Härtung, die auf jedes produktive Gerät gehört.",
    },
    topology: {
      description:
        "SSH verschlüsselt den Administrationszugriff (sicherer als Telnet).",
      devices: [
        { type: "router", label: "R1", count: 1 },
        { type: "pc", label: "Admin-PC", count: 1 },
      ],
      connections: ["Admin-PC → R1 Gi0/0 direkt oder via Switch (192.168.1.0/24)"],
      hint: "Einfachste Topologie: Admin-PC direkt an Router.",
    },
    steps: [
      {
        title: "Router: Grundkonfiguration + Interface",
        blocks: [
          {
            device: "R1",
            mode: "privileged",
            modeLabel: "Router>",
            commands: [
              {
                cmd: "enable\nconfigure terminal\nhostname R1\nenable secret class",
                explanation:
                  "Üblicher Einstieg. enable secret sichert zusätzlich den Privileged-EXEC — SSH allein schützt nur die Übertragung, nicht den Zugriff selbst.",
              },
              {
                cmd: "interface GigabitEthernet0/0\nip address 192.168.1.1 255.255.255.0\nno shutdown\nexit",
                explanation: "Management-Interface des Routers — muss VOR dem SSH-Test aktiv sein.",
              },
            ],
          },
        ],
      },
      {
        title: "SSH auf Router aktivieren",
        blocks: [
          {
            device: "R1",
            mode: "global",
            modeLabel: "R1(config)#",
            commands: [
              {
                cmd: "ip domain-name lab.local",
                explanation:
                  "Domain-Name ist Pflicht für die RSA-Schlüssel-Generierung — zusammen mit dem Hostnamen bildet er den FQDN, an den der Schlüssel gebunden wird.",
              },
              {
                cmd: "crypto key generate rsa modulus 2048",
                explanation:
                  "Generiert ein RSA-Schlüsselpaar. Modulus 2048 = sicher. Kleinere Werte (768, 1024) sind veraltet. Dauert einen Moment.",
              },
              {
                cmd: "ip ssh version 2",
                explanation:
                  "Erzwingt SSHv2 (SSHv1 hat Sicherheitslücken). Best Practice: immer v2.",
              },
              {
                cmd: "username admin privilege 15 secret cisco123",
                explanation:
                  "Erstellt lokalen Benutzer 'admin' mit Privilege Level 15 (= voller Zugriff) und verschlüsseltem Passwort.",
              },
            ],
          },
          {
            device: "R1",
            mode: "line",
            modeLabel: "R1(config)#",
            commands: [
              {
                cmd: "line vty 0 4",
                explanation:
                  "Konfiguriert virtuelle Terminals 0–4 (5 gleichzeitige Verbindungen).",
              },
              {
                cmd: "login local",
                explanation:
                  "Authentifizierung über die lokale Datenbank (username/password oben definiert).",
              },
              {
                cmd: "transport input ssh",
                explanation:
                  "Erlaubt NUR SSH. Verhindert unsicheres Telnet. Ohne diese Zeile wäre Telnet noch möglich.",
              },
              {
                cmd: "exec-timeout 5 0",
                explanation:
                  "Session-Timeout nach 5 Minuten Inaktivität — Sicherheitsbest Practice.",
              },
            ],
          },
          {
            device: "R1",
            mode: "privileged",
            modeLabel: "R1(config)#",
            commands: [
              {
                cmd: "end\ncopy running-config startup-config",
                explanation: "Zurück in den EXEC und speichern.",
              },
            ],
          },
        ],
      },
      {
        title: "Admin-PC adressieren + SSH-Verbindung testen",
        blocks: [
          {
            device: "Admin-PC",
            mode: "desktop",
            modeLabel: "Desktop > IP Configuration",
            commands: [
              {
                cmd: "IP Address:  192.168.1.10\nSubnet Mask: 255.255.255.0\nDefault Gateway: 192.168.1.1",
                explanation: "Admin-PC im selben Subnetz wie R1 Gi0/0 — ohne passende IP scheitert die SSH-Verbindung schon auf IP-Ebene.",
              },
            ],
          },
          {
            device: "Admin-PC",
            mode: "desktop",
            modeLabel: "Desktop > Command Prompt",
            commands: [
              {
                cmd: "ssh -l admin 192.168.1.1",
                explanation:
                  "-l admin = Login-Name. Passwort: cisco123. Nach erfolgreichem Login: Prompt R1# — das ist der eigentliche Host-zu-Host-Nachweis dieses Labs.",
              },
            ],
          },
        ],
      },
      {
        title: "Typische Fehler bei der SSH-Einrichtung",
        blocks: [
          {
            device: "Merke",
            mode: "info",
            modeLabel: "Häufige Fehler",
            commands: [
              { cmd: "hostname/ip domain-name nach crypto key gesetzt", explanation: "hostname und ip domain-name müssen VOR crypto key generate rsa gesetzt sein — sonst lässt sich der Schlüssel gar nicht erzeugen." },
              { cmd: "login local vergessen", explanation: "Ohne login local prüft die Line gegen die (meist leere) Line-Password-Konfiguration statt gegen die username-Datenbank — Login schlägt fehl." },
              { cmd: "transport input ssh vergessen", explanation: "Ohne diese Zeile bleibt Telnet zusätzlich offen — SSH ist zwar konfiguriert, aber nicht erzwungen." },
              { cmd: "Admin-PC ohne passende IP/Gateway", explanation: "SSH scheitert schon am TCP-Verbindungsaufbau, wenn Admin-PC nicht im selben Subnetz liegt oder das Gateway fehlt." },
            ],
          },
        ],
      },
    ],
    verifyCommands: [
      { cmd: "show ip ssh", expected: "SSH Enabled - version 2.0" },
      { cmd: "show users", expected: "admin  vty0  SSH" },
      { cmd: "ssh -l admin 192.168.1.1 (von Admin-PC)", expected: "Login erfolgreich, Prompt wechselt auf R1#" },
    ],
    glossary: [
      { term: "SSH", def: "Secure Shell — verschlüsselter Fernzugriff (TCP 22), Ersatz für Telnet." },
      { term: "Telnet", def: "Unverschlüsselter Fernzugriff (TCP 23) — überträgt alles im Klartext, unsicher." },
      { term: "ip domain-name", def: "Setzt die Domäne; nötig, weil der RSA-Schlüssel an einen FQDN gebunden wird." },
      { term: "crypto key generate rsa", def: "Erzeugt das RSA-Schlüsselpaar (Modulus >= 768 für SSHv2)." },
      { term: "ip ssh version 2", def: "Erzwingt das sichere SSHv2 (statt des schwächeren v1)." },
      { term: "line vty 0 4", def: "Die virtuellen Terminal-Lines für den Fernzugriff." },
      { term: "login local", def: "Authentifizierung gegen die lokale Benutzerdatenbank." },
      { term: "transport input ssh", def: "Erlaubt auf den VTY-Lines nur SSH (kein Telnet)." },
    ],
  },

  // ─────────────────────────────────────────────────────────────
  // 25. Banner & Local Hardening
  // ─────────────────────────────────────────────────────────────
  {
    id: "device-hardening",
    icon: <Shield size={20} />,
    title: "Device Hardening",
    subtitle: "Banner, Password-Policy, Login-Block, Service-Cleanup",
    difficulty: "Mittel",
    duration: "20 min",
    context: {
      problem:
        "Ein Gerät mit Standardeinstellungen ist leicht angreifbar: schwache Passwort-Hashes, Brute-Force auf den Login und fehlende rechtliche Warnbanner.",
      purpose:
        "Das Gerät absichern: gehashte Passwörter, Mindest-Passwortlänge, Brute-Force-Schutz am Login und Warnbanner — die Basis-Härtung jedes produktiven Geräts.",
    },
    topology: {
      description:
        "Standalone Switch SW1 — Erstkonfiguration in einem 'sicher per Default'-Setup. Ein Admin-PC testet am Ende, dass der Zugang trotz aller Härtung funktioniert.",
      devices: [
        { type: "switch", label: "SW1", count: 1 },
        { type: "pc", label: "Admin-PC", count: 1 },
      ],
      connections: ["Admin-PC → SW1 (192.168.1.0/24, einziges erlaubtes Management-Subnetz)"],
      hint: "Das hier ist die 'Day-1 Checkliste' für jedes neue Cisco-Gerät vor Produktivnahme.",
    },
    steps: [
      {
        title: "Grundkonfiguration + Management-Interface",
        blocks: [
          {
            device: "SW1",
            mode: "privileged",
            modeLabel: "Switch>",
            commands: [
              {
                cmd: "enable\nconfigure terminal\nhostname SW1\nno ip domain-lookup\nip domain-name lab.local",
                explanation: "Üblicher Einstieg + Domain-Name für die spätere SSH-Schlüsselerzeugung.",
              },
              {
                cmd: "crypto key generate rsa modulus 2048\nip ssh version 2",
                explanation: "SSH vorbereiten — der Abschlusstest läuft per SSH.",
              },
              {
                cmd: "interface vlan 1\nip address 192.168.1.254 255.255.255.0\nno shutdown\nexit",
                explanation: "Management-SVI im Netz des Admin-PCs.",
              },
            ],
          },
        ],
      },
      {
        title: "Login-Banner (rechtlich relevant!)",
        blocks: [
          {
            device: "SW1",
            mode: "global",
            modeLabel: "SW1(config)#",
            commands: [
              { cmd: "banner motd ^\n*** AUTHORIZED ACCESS ONLY ***\nAll activities are monitored and logged.\nUnauthorized access will be prosecuted.\n^", explanation: "MOTD-Banner — wichtig für Gerichtsfähigkeit gegen Eindringlinge. '^' ist Delimiter (beliebiges, nicht im Text vorkommendes Zeichen)." },
              { cmd: "banner login ^\nPlease enter your credentials.\n^", explanation: "Erscheint nach MOTD vor dem Username-Prompt." },
              { cmd: "banner exec ^\nWelcome — type ? for help.\n^", explanation: "Nach erfolgreichem Login." },
            ],
          },
        ],
      },
      {
        title: "Password-Hardening",
        blocks: [
          {
            device: "SW1",
            mode: "global",
            modeLabel: "SW1(config)#",
            commands: [
              { cmd: "service password-encryption", explanation: "Verschlüsselt alle Klartext-Passwörter in der config mit Type-7 (schwach, aber besser als nichts)." },
              { cmd: "security passwords min-length 12", explanation: "Mindestens 12 Zeichen für neue Passwörter." },
              { cmd: "enable secret EnablePass!2024", explanation: "Type-5-Hash (MD5) für den Privileged-EXEC. Auf realer Hardware wäre 'enable algorithm-type scrypt secret' (Type-9, deutlich stärker) die bessere Wahl — Packet Tracer akzeptiert scrypt nicht zuverlässig, daher hier der klassische Type-5-Hash." },
              { cmd: "username admin privilege 15 secret AdminPass!2024", explanation: "Admin-User mit Type-5-Hash und vollem Zugriff." },
            ],
          },
        ],
      },
      {
        title: "Login-Block & Brute-Force-Protection",
        blocks: [
          {
            device: "SW1",
            mode: "global",
            modeLabel: "SW1(config)#",
            commands: [
              { cmd: "login block-for 120 attempts 5 within 60", explanation: "Bei 5 fehlgeschlagenen Logins in 60s → 120s Komplett-Block aller VTYs." },
              { cmd: "login delay 3", explanation: "3 Sekunden Verzögerung zwischen Login-Versuchen." },
              { cmd: "login on-failure log every 1", explanation: "Jeden Fehlversuch loggen." },
              { cmd: "login on-success log", explanation: "Erfolgreiche Logins auch loggen." },
            ],
          },
        ],
      },
      {
        title: "Unsichere Services deaktivieren",
        blocks: [
          {
            device: "SW1",
            mode: "global",
            modeLabel: "SW1(config)#",
            commands: [
              { cmd: "no ip http server", explanation: "HTTP-Webserver aus (unverschlüsselt)." },
              { cmd: "ip http secure-server", explanation: "Falls Web-UI nötig: nur HTTPS." },
              { cmd: "no service pad", explanation: "Veraltetes X.25 PAD — deaktivieren." },
              { cmd: "no ip source-route", explanation: "Source-Routing deaktivieren — gegen IP-Spoofing." },
              { cmd: "no cdp run", explanation: "(Optional) CDP global aus oder nur an Trunks erlauben." },
            ],
          },
        ],
      },
      {
        title: "VTY-Lines härten",
        blocks: [
          {
            device: "SW1",
            mode: "global",
            modeLabel: "SW1(config)#",
            commands: [
              { cmd: "access-list 10 permit 192.168.1.0 0.0.0.255", explanation: "Management-ACL: nur dieses Subnetz darf sich per VTY verbinden. Muss VOR der access-class-Zeile existieren." },
              { cmd: "line vty 0 15", explanation: "Alle 16 VTY-Lines." },
              { cmd: "transport input ssh", explanation: "Nur SSH, kein Telnet." },
              { cmd: "login local", explanation: "Authentifizierung gegen die lokale Benutzerdatenbank (admin)." },
              { cmd: "exec-timeout 10 0", explanation: "Auto-Logout nach 10 Min Inaktivität." },
              { cmd: "logging synchronous", explanation: "Verhindert, dass Log-Messages deine Eingabe überschreiben." },
              { cmd: "access-class 10 in", explanation: "Nur Source-IPs aus ACL 10 (192.168.1.0/24) dürfen sich verbinden." },
            ],
          },
          {
            device: "SW1",
            mode: "privileged",
            modeLabel: "SW1(config-line)#",
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
        title: "Admin-PC adressieren + Zugang testen",
        blocks: [
          {
            device: "Admin-PC",
            mode: "desktop",
            modeLabel: "Desktop > IP Configuration",
            commands: [
              { cmd: "IP Address: 192.168.1.10\nSubnet Mask: 255.255.255.0\nDefault Gateway: 192.168.1.254", explanation: "Im erlaubten Management-Subnetz (ACL 10)." },
            ],
          },
          {
            device: "Admin-PC",
            mode: "desktop",
            modeLabel: "Desktop > Command Prompt",
            commands: [
              {
                cmd: "ssh -l admin 192.168.1.254",
                explanation: "Trotz Banner, Login-Block und access-class funktioniert der Zugang weiterhin — Härtung schränkt nicht den legitimen Zugriff ein, nur den illegitimen.",
              },
            ],
          },
        ],
      },
      {
        title: "Typische Fehler beim Hardening",
        blocks: [
          {
            device: "Merke",
            mode: "info",
            modeLabel: "Häufige Fehler",
            commands: [
              { cmd: "access-class ohne vorherige ACL", explanation: "access-class 10 in referenziert eine ACL, die vorher existieren muss — sonst greift kein Filter, obwohl der Befehl fehlerfrei angenommen wird." },
              { cmd: "login local vergessen", explanation: "Ohne login local auf den VTY-Lines wird gegen die (meist leere) Line-Passwort-Konfiguration geprüft statt gegen die username-Datenbank." },
              { cmd: "Eigenes Management-Subnetz aus der ACL ausgesperrt", explanation: "Wird die ACL zu eng gefasst, sperrt man sich selbst aus — vor dem Speichern immer prüfen, dass das eigene Subnetz erlaubt ist." },
              { cmd: "Banner-Delimiter kommt im Text vor", explanation: "Wird z. B. ^ als Trennzeichen gewählt und taucht im Bannertext selbst auf, bricht der Banner vorzeitig ab." },
            ],
          },
        ],
      },
    ],
    verifyCommands: [
      { cmd: "show running-config | section line vty", expected: "transport input ssh, login local, access-class 10 in, exec-timeout 10" },
      { cmd: "show login", expected: "Login Block-for 120 seconds, 5 attempts within 60s" },
      { cmd: "ssh -l admin 192.168.1.254 (von Admin-PC)", expected: "Login erfolgreich trotz aller Härtungsmaßnahmen" },
    ],
    glossary: [
      { term: "Device Hardening", def: "Maßnahmen, die die Angriffsfläche eines Geräts verkleinern." },
      { term: "banner motd / login / exec", def: "Textbanner zu verschiedenen Zeitpunkten — u. a. rechtlicher Warnhinweis." },
      { term: "enable secret (Type 5)", def: "MD5-Hash für den Privileged-EXEC. Type 9 (scrypt) wäre auf realer Hardware stärker, in Packet Tracer aber nicht zuverlässig nutzbar." },
      { term: "security passwords min-length", def: "Erzwingt eine Mindestlänge für neue Passwörter." },
      { term: "login block-for", def: "Sperrt Logins nach zu vielen Fehlversuchen für eine Zeitspanne (Brute-Force-Schutz)." },
      { term: "login delay", def: "Verzögerung zwischen Login-Versuchen — bremst automatisierte Angriffe." },
      { term: "service password-encryption", def: "Verschleiert Klartext-Passwörter in der Konfiguration (schwach, aber Pflicht)." },
      { term: "access-class", def: "Bindet eine Standard-ACL an VTY-Lines — filtert, welche Source-IPs sich überhaupt verbinden dürfen." },
      { term: "Brute-Force", def: "Angriff, der systematisch Passwörter durchprobiert." },
    ],
  },

  // ─────────────────────────────────────────────────────────────
  // 17. Port Security
  // ─────────────────────────────────────────────────────────────
  {
    id: "port-security",
    icon: <Shield size={20} />,
    title: "Port Security",
    subtitle: "MAC-Limit, Sticky-MAC, Violation-Modus, err-disable Gegenprobe",
    difficulty: "Mittel",
    duration: "25 min",
    context: {
      problem:
        "An einem offenen Switch-Port kann jeder ein eigenes Gerät anstecken — oder per MAC-Flooding die MAC-Tabelle überlaufen lassen, sodass der Switch wie ein Hub alles flutet.",
      purpose:
        "Port-Security begrenzt die erlaubten MAC-Adressen pro Port, lernt sie sticky in die Konfiguration und reagiert bei Verstoß automatisch (protect/restrict/shutdown).",
    },
    topology: {
      description:
        "Access-Switch SW1 mit einem PC pro Port plus einem dritten, zunächst nicht angeschlossenen Gerät für die Gegenprobe. Wir schützen Ports vor unauthorisierten MAC-Adressen und limitieren die Anzahl gelernter MACs.",
      devices: [
        { type: "switch", label: "SW1", count: 1 },
        { type: "pc", label: "PC1, PC2", count: 2 },
        { type: "pc", label: "PC3 (Fremd-Gerät, für die Gegenprobe)", count: 1 },
      ],
      connections: ["PC1 → SW1 Fa0/1", "PC2 → SW1 Fa0/2", "PC3 → zunächst NICHT angeschlossen"],
      hint: "Sticky-MAC merkt sich die erste MAC dauerhaft in der running-config — nach 'wr mem' überlebt sie den Reboot.",
    },
    steps: [
      {
        title: "SW1: Grundkonfiguration",
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
        ],
      },
      {
        title: "Port Security auf beiden Access-Ports",
        blocks: [
          {
            device: "SW1",
            mode: "interface",
            modeLabel: "SW1(config)#",
            commands: [
              { cmd: "interface Fa0/1", explanation: "Port zu PC1." },
              { cmd: "switchport mode access", explanation: "Port Security funktioniert NUR auf Access- oder statischen Trunk-Ports." },
              { cmd: "switchport port-security", explanation: "Feature aktivieren. Default-Limit = 1 MAC." },
              { cmd: "switchport port-security maximum 1", explanation: "Genau 1 MAC erlaubt — nur PC1 selbst." },
              { cmd: "switchport port-security mac-address sticky", explanation: "Sticky: dynamisch gelernte MAC wird in die running-config geschrieben." },
              { cmd: "switchport port-security violation shutdown", explanation: "Default-Violation-Modus: bei einer zweiten, unbekannten MAC geht der Port sofort in err-disabled — genau das zeigt die spätere Gegenprobe." },
            ],
          },
          {
            device: "SW1",
            mode: "interface",
            modeLabel: "SW1(config)#",
            commands: [
              { cmd: "interface Fa0/2", explanation: "Port zu PC2." },
              { cmd: "switchport mode access", explanation: "" },
              { cmd: "switchport port-security", explanation: "" },
              { cmd: "switchport port-security maximum 2", explanation: "Hier bewusst 2 MACs erlaubt (z. B. PC + VoIP-Phone)." },
              { cmd: "switchport port-security mac-address sticky", explanation: "" },
              { cmd: "switchport port-security violation restrict", explanation: "Alternativer Modus: verwirft unbekannte MACs, zählt und loggt sie, aber der Port bleibt aktiv (kein err-disabled)." },
            ],
          },
          {
            device: "SW1",
            mode: "privileged",
            modeLabel: "SW1(config-if)#",
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
        title: "PCs adressieren + Baseline-Test",
        blocks: [
          {
            device: "PC1",
            mode: "desktop",
            modeLabel: "Desktop > IP Configuration",
            commands: [
              { cmd: "IP Address: 192.168.1.10\nSubnet Mask: 255.255.255.0\nDefault Gateway: 192.168.1.1", explanation: "An Fa0/1." },
            ],
          },
          {
            device: "PC2",
            mode: "desktop",
            modeLabel: "Desktop > IP Configuration",
            commands: [
              { cmd: "IP Address: 192.168.1.20\nSubnet Mask: 255.255.255.0\nDefault Gateway: 192.168.1.1", explanation: "An Fa0/2." },
            ],
          },
          {
            device: "PC1",
            mode: "desktop",
            modeLabel: "Desktop > Command Prompt",
            commands: [
              { cmd: "ping 192.168.1.20", explanation: "Baseline: normale Konnektivität, bevor die Gegenprobe den Port absichtlich verletzt." },
            ],
          },
        ],
      },
      {
        title: "Gegenprobe — Fremdgerät an Fa0/1 anschließen",
        blocks: [
          {
            device: "PT-Aktion",
            mode: "info",
            modeLabel: "Physische Aktion im Canvas",
            commands: [
              {
                cmd: "PC1-Kabel von Fa0/1 abziehen, stattdessen PC3 (Fremd-Gerät) an Fa0/1 anschließen",
                explanation: "PC3 hat eine andere MAC-Adresse als die per Sticky gelernte MAC von PC1. Sobald PC3 sendet (z. B. durch Öffnen der IP-Konfiguration oder einen Ping-Versuch), erkennt Fa0/1 eine zweite, unbekannte MAC — Verstoß gegen maximum 1.",
              },
            ],
          },
          {
            device: "SW1",
            mode: "privileged",
            modeLabel: "SW1#",
            commands: [
              {
                cmd: "show interfaces status",
                explanation: "Fa0/1 zeigt jetzt 'err-disabled' statt 'connected' — echtes, in Packet Tracer nachvollziehbares Verhalten von violation shutdown (im Gegensatz zu restrict auf Fa0/2, das den Port aktiv gelassen hätte).",
              },
              {
                cmd: "show port-security interface Fa0/1",
                explanation: "Zeigt 'Security Violation Count: 1' und 'Port Status: Secure-shutdown'.",
              },
              {
                cmd: "interface Fa0/1\nshutdown\nno shutdown",
                explanation: "Manuelle Wiederherstellung — ohne konfigurierte errdisable recovery muss der Port von Hand reaktiviert werden. PC1 danach wieder anschließen.",
              },
            ],
          },
        ],
      },
      {
        title: "Typische Fehler bei Port Security",
        blocks: [
          {
            device: "Merke",
            mode: "info",
            modeLabel: "Häufige Fehler",
            commands: [
              { cmd: "switchport mode access vergessen", explanation: "Port Security lässt sich auf einem Port im DTP-Default (dynamic auto/desirable) gar nicht erst aktivieren — switchport mode access ist Pflicht." },
              { cmd: "maximum kleiner als tatsächlich angeschlossene Geräte", explanation: "Ein zu niedriges Limit (z. B. maximum 1 bei PC + VoIP-Phone am selben Port) löst ständig Violations aus, obwohl kein Angriff vorliegt." },
              { cmd: "violation shutdown ohne Recovery-Plan", explanation: "Geht ein Port in err-disabled und ist keine errdisable recovery konfiguriert, bleibt er dauerhaft aus — Admin muss manuell shutdown/no shutdown ausführen." },
              { cmd: "Sticky-MAC nicht gespeichert", explanation: "Ohne copy running-config startup-config geht die per Sticky gelernte MAC beim nächsten Reload verloren — der Port lernt danach die erste angeschlossene MAC neu." },
            ],
          },
        ],
      },
    ],
    verifyCommands: [
      { cmd: "show port-security interface Fa0/1", expected: "Port Security: Enabled, Max: 1, Sticky MAC gelernt" },
      { cmd: "show port-security address", expected: "VLAN, MAC, Type=SecureSticky, Port" },
      { cmd: "show interfaces status (nach Gegenprobe)", expected: "Fa0/1: err-disabled — echtes Verhalten, kein nur geparster Befehl" },
      { cmd: "ping 192.168.1.20 (von PC1, vor der Gegenprobe)", expected: "Erfolgreich" },
    ],
    glossary: [
      { term: "Port-Security", def: "Switch-Funktion, die je Port nur bestimmte/begrenzte MAC-Adressen zulässt." },
      { term: "maximum <n>", def: "Maximale Anzahl erlaubter MAC-Adressen am Port." },
      { term: "sticky MAC", def: "Lernt die erlaubte MAC dynamisch und schreibt sie fest in die running-config." },
      { term: "Violation: protect", def: "Verwirft Verkehr unbekannter MACs ohne Meldung." },
      { term: "Violation: restrict", def: "Verwirft + zählt + meldet (Syslog/SNMP), Port bleibt aktiv." },
      { term: "Violation: shutdown", def: "Default — Port geht bei Verstoß in err-disabled. In Packet Tracer nachweisbares, echtes Verhalten." },
      { term: "err-disabled", def: "Abgeschalteter Zustand nach einer Verletzung. Ohne konfigurierte errdisable recovery nur manuell (shutdown/no shutdown) rückholbar." },
      { term: "MAC-Flooding", def: "Angriff, der die MAC-Tabelle mit Fake-Adressen füllt, bis der Switch wie ein Hub flutet." },
    ],
  },

  // ─────────────────────────────────────────────────────────────
  // 9. Standard ACL
  // ─────────────────────────────────────────────────────────────
  {
    id: "acl-standard",
    icon: <Shield size={20} />,
    title: "Standard ACL",
    subtitle: "Router · 2 LANs",
    difficulty: "Mittel",
    duration: "25 min",
    context: {
      problem:
        "Ohne Filter erreicht jedes Netz jedes andere. Oft soll ein bestimmtes Quellnetz blockiert, der übrige Verkehr aber durchgelassen werden.",
      purpose:
        "Eine Standard-ACL filtert ausschließlich nach der Quell-IP. Sie wird nah am Ziel angewendet. Wichtig: am Ende steht ein unsichtbares deny any.",
    },
    topology: {
      description:
        "Standard-ACL filtert nach Quell-IP. Platzierung: so nah wie möglich am Ziel.",
      devices: [
        { type: "router", label: "R1", count: 1 },
        { type: "pc", label: "PC0 (erlaubt) / PC1 (geblockt)", count: 2 },
        { type: "server", label: "Server", count: 1 },
      ],
      connections: [
        "PC0 (192.168.1.10) → R1 Gi0/0",
        "PC1 (192.168.2.10) → R1 Gi0/1",
        "R1 Gi0/2 → Server (192.168.3.100)",
      ],
      hint: "R1 hat 3 Interfaces: LAN1 (PC0), LAN2 (PC1), Server-LAN.",
    },
    steps: [
      {
        title: "R1: Grundkonfiguration + Interfaces",
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
              { cmd: "interface GigabitEthernet0/0\nip address 192.168.1.1 255.255.255.0\nno shutdown", explanation: "LAN1-Interface zu PC0." },
              { cmd: "interface GigabitEthernet0/1\nip address 192.168.2.1 255.255.255.0\nno shutdown", explanation: "LAN2-Interface zu PC1." },
              { cmd: "interface GigabitEthernet0/2\nip address 192.168.3.1 255.255.255.0\nno shutdown", explanation: "Server-LAN-Interface." },
            ],
          },
        ],
      },
      {
        title: "Endgeräte + Baseline (vor der ACL)",
        blocks: [
          {
            device: "PC0",
            mode: "desktop",
            modeLabel: "Desktop > IP Configuration",
            commands: [
              { cmd: "IP Address: 192.168.1.10\nSubnet Mask: 255.255.255.0\nDefault Gateway: 192.168.1.1", explanation: "Gateway = R1 Gi0/0." },
            ],
          },
          {
            device: "PC1",
            mode: "desktop",
            modeLabel: "Desktop > IP Configuration",
            commands: [
              { cmd: "IP Address: 192.168.2.10\nSubnet Mask: 255.255.255.0\nDefault Gateway: 192.168.2.1", explanation: "Gateway = R1 Gi0/1." },
            ],
          },
          {
            device: "Server",
            mode: "desktop",
            modeLabel: "Desktop > IP Configuration",
            commands: [
              { cmd: "IP Address: 192.168.3.100\nSubnet Mask: 255.255.255.0\nDefault Gateway: 192.168.3.1", explanation: "Gateway = R1 Gi0/2." },
            ],
          },
          {
            device: "PC0",
            mode: "desktop",
            modeLabel: "Desktop > Command Prompt",
            commands: [
              { cmd: "ping 192.168.3.100", explanation: "Baseline: ohne ACL erreichen beide LANs den Server. Nach dem nächsten Schritt darf nur noch PC0 durchkommen." },
            ],
          },
        ],
      },
      {
        title: "Standard-ACL erstellen und anwenden",
        blocks: [
          {
            device: "R1",
            mode: "global",
            modeLabel: "R1(config)#",
            commands: [
              {
                cmd: "access-list 10 permit 192.168.1.0 0.0.0.255",
                explanation:
                  "Erlaubt komplettes Netz 192.168.1.0/24 (PC0-LAN). Zahl 10 = Standard-ACL (1–99).",
              },
              {
                cmd: "access-list 10 deny 192.168.2.0 0.0.0.255",
                explanation:
                  "Blockiert PC1-LAN. Am Ende jeder ACL steht implizit 'deny any' — aber explizit ist klarer.",
              },
              {
                cmd: "access-list 10 permit any",
                explanation:
                  "Erlaubt alles andere (z. B. andere Netze). Optional — ohne diese Zeile gilt implicit deny.",
              },
            ],
          },
          {
            device: "R1",
            mode: "interface",
            modeLabel: "R1(config)#",
            commands: [
              {
                cmd: "interface GigabitEthernet0/2",
                explanation:
                  "Standard-ACLs am Ziel-Interface platzieren (so nah wie möglich am Ziel = Ausgangs-Interface Richtung Server).",
              },
              {
                cmd: "ip access-group 10 out",
                explanation:
                  "'out' = Pakete werden gefiltert, BEVOR sie dieses Interface verlassen (Richtung Server). 'in' würde am Eingangs-Interface filtern.",
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
        title: "Abschlusstest",
        blocks: [
          {
            device: "PC0",
            mode: "desktop",
            modeLabel: "Desktop > Command Prompt",
            commands: [
              { cmd: "ping 192.168.3.100", explanation: "PC0-LAN ist per ACL 10 erlaubt — Ping muss weiterhin funktionieren." },
            ],
          },
          {
            device: "PC1",
            mode: "desktop",
            modeLabel: "Desktop > Command Prompt",
            commands: [
              { cmd: "ping 192.168.3.100", explanation: "PC1-LAN ist per ACL 10 explizit verweigert — Ping muss jetzt scheitern (Destination unreachable)." },
            ],
          },
        ],
      },
      {
        title: "Typische Fehler bei Standard-ACLs",
        blocks: [
          {
            device: "Merke",
            mode: "info",
            modeLabel: "Häufige Fehler",
            commands: [
              { cmd: "Standard-ACL zu nah an der Quelle platziert", explanation: "Eine Standard-ACL filtert nur nach Quell-IP — wird sie zu quellnah gesetzt, blockiert sie den Zugriff dieses Netzes auf ALLE Ziele, nicht nur auf den gewünschten Server." },
              { cmd: "Reihenfolge der Zeilen vertauscht", explanation: "ACL-Einträge werden von oben nach unten geprüft, die erste Übereinstimmung gewinnt — steht permit any vor der deny-Zeile, greift das deny nie." },
              { cmd: "permit any vergessen", explanation: "Ohne die abschließende permit-Zeile (oder das implizite deny any im Hinterkopf) werden versehentlich auch gewollte Netze blockiert." },
              { cmd: "in/out verwechselt", explanation: "ip access-group 10 out filtert Pakete beim Verlassen des Interfaces, in beim Eintreten — eine vertauschte Richtung lässt die ACL wirkungslos oder am falschen Ort greifen." },
            ],
          },
        ],
      },
    ],
    verifyCommands: [
      { cmd: "show ip access-lists", expected: "Permit-/Deny-Zähler steigen bei Traffic" },
      { cmd: "ping 192.168.3.100 (von PC0)", expected: "!!!!!  — erlaubt" },
      { cmd: "ping 192.168.3.100 (von PC1)", expected: "UUUUU — geblockt" },
    ],
    glossary: [
      { term: "ACL", def: "Access Control List — geordnete Regelliste, die Verkehr erlaubt (permit) oder verwirft (deny)." },
      { term: "Standard-ACL", def: "Nummern 1–99 / 1300–1999 — filtert NUR nach Quell-IP." },
      { term: "permit / deny", def: "Erlaubt bzw. verwirft passende Pakete. Reihenfolge zählt (erste Übereinstimmung gewinnt)." },
      { term: "Wildcard-Maske", def: "Invertierte Maske zur Adressauswahl (0 = muss passen, 1 = egal)." },
      { term: "implizites deny any", def: "Unsichtbare letzte Regel — was nicht erlaubt ist, wird verworfen." },
      { term: "ip access-group", def: "Bindet eine ACL an ein Interface in einer Richtung (in/out)." },
      { term: "in / out", def: "Richtung relativ zum Interface. Standard-ACL möglichst nah am Ziel platzieren." },
    ],
  },

  // ─────────────────────────────────────────────────────────────
  // 10. Extended ACL
  // ─────────────────────────────────────────────────────────────
  {
    id: "acl-extended",
    icon: <Shield size={20} weight="fill" />,
    title: "Extended ACL",
    subtitle: "Router · 2 Hosts · Web-Server",
    difficulty: "Fortgeschritten",
    duration: "30 min",
    context: {
      problem:
        "Standard-ACLs können nur nach Quelle filtern. Oft will man aber gezielter steuern — z. B. nur HTTP von einem bestimmten PC zu einem Server sperren, alles andere zulassen.",
      purpose:
        "Eine Extended ACL filtert nach Protokoll, Quelle, Ziel UND Port. Sie wird nah an der Quelle angewendet, um unerwünschten Verkehr früh zu stoppen.",
    },
    topology: {
      description:
        "Extended ACL filtert nach Quelle, Ziel, Protokoll und Port. Platzierung: so nah wie möglich an der Quelle.",
      devices: [
        { type: "router", label: "R1", count: 1 },
        { type: "pc", label: "PC0 / PC1", count: 2 },
        { type: "server", label: "Web-Server (Port 80)", count: 1 },
      ],
      connections: ["PC0 / PC1 → R1 Gi0/0", "R1 Gi0/1 → Web-Server"],
      hint: "Gleiche Topologie wie Standard-ACL. Extended ACL am Quell-Interface (Gi0/0 in).",
    },
    steps: [
      {
        title: "R1: Grundkonfiguration + Interfaces",
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
              { cmd: "interface GigabitEthernet0/0\nip address 192.168.1.1 255.255.255.0\nno shutdown", explanation: "LAN-Interface zu PC0/PC1." },
              { cmd: "interface GigabitEthernet0/1\nip address 192.168.2.1 255.255.255.0\nno shutdown", explanation: "Interface zum Web-Server-Segment." },
            ],
          },
        ],
      },
      {
        title: "Endgeräte + Baseline (vor der ACL)",
        blocks: [
          {
            device: "PC0",
            mode: "desktop",
            modeLabel: "Desktop > IP Configuration",
            commands: [
              { cmd: "IP Address: 192.168.1.10\nSubnet Mask: 255.255.255.0\nDefault Gateway: 192.168.1.1", explanation: "Gateway = R1 Gi0/0." },
            ],
          },
          {
            device: "PC1",
            mode: "desktop",
            modeLabel: "Desktop > IP Configuration",
            commands: [
              { cmd: "IP Address: 192.168.1.20\nSubnet Mask: 255.255.255.0\nDefault Gateway: 192.168.1.1", explanation: "Gateway = R1 Gi0/0 — die IP 192.168.1.20 wird in der ACL unten gezielt referenziert." },
            ],
          },
          {
            device: "Web-Server",
            mode: "desktop",
            modeLabel: "Desktop > IP Configuration",
            commands: [
              { cmd: "IP Address: 192.168.2.100\nSubnet Mask: 255.255.255.0\nDefault Gateway: 192.168.2.1", explanation: "Gateway = R1 Gi0/1." },
            ],
          },
          {
            device: "PC1",
            mode: "desktop",
            modeLabel: "Desktop > Command Prompt",
            commands: [
              { cmd: "ping 192.168.2.100", explanation: "Baseline: ohne ACL erreicht PC1 den Server per ICMP und HTTP. Nach der ACL bleibt nur ICMP übrig." },
            ],
          },
        ],
      },
      {
        title: "Extended ACL erstellen",
        blocks: [
          {
            device: "R1",
            mode: "global",
            modeLabel: "R1(config)#",
            commands: [
              {
                cmd: "ip access-list extended BLOCK_PC1_HTTP",
                explanation:
                  "Erstellt benannte Extended ACL. Benannte ACLs sind besser wartbar als nummerierte. Prompt: R1(config-ext-nacl)#",
              },
              {
                cmd: "deny tcp host 192.168.1.20 host 192.168.2.100 eq 80",
                explanation:
                  "Blockiert TCP-Port 80 von PC1 (192.168.1.20) zum Web-Server (192.168.2.100). 'host' = exakte IP ohne Wildcard. 'eq 80' = HTTP.",
              },
              {
                cmd: "permit ip any any",
                explanation:
                  "Erlaubt alles andere. Ohne diese Zeile würde alles geblockt (implicit deny).",
              },
              {
                cmd: "exit",
                explanation: "Verlässt ACL-Konfigurationsmodus.",
              },
            ],
          },
          {
            device: "R1",
            mode: "interface",
            modeLabel: "R1(config)#",
            commands: [
              {
                cmd: "interface GigabitEthernet0/0\nip access-group BLOCK_PC1_HTTP in",
                explanation:
                  "Extended ACL so nah wie möglich an der QUELLE. 'in' = Pakete werden beim Eingang auf Gi0/0 gefiltert — bevor sie geroutet werden. Spart Router-Ressourcen.",
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
        title: "Abschlusstest",
        blocks: [
          {
            device: "PC1",
            mode: "desktop",
            modeLabel: "Desktop > Command Prompt",
            commands: [
              { cmd: "ping 192.168.2.100", explanation: "ICMP ist von der ACL nicht betroffen — der Ping muss weiterhin funktionieren." },
              { cmd: "(Browser: http://192.168.2.100 öffnen)", explanation: "HTTP (Port 80) ist explizit verweigert — die Seite darf NICHT laden, während der Ping gleichzeitig durchgeht. Das ist der eigentliche Beweis, dass die ACL protokoll-spezifisch filtert." },
            ],
          },
        ],
      },
      {
        title: "Typische Fehler bei Extended ACLs",
        blocks: [
          {
            device: "Merke",
            mode: "info",
            modeLabel: "Häufige Fehler",
            commands: [
              { cmd: "Extended ACL zu zielnah platziert", explanation: "Extended ACLs gehören quellnah — wird sie stattdessen am Ziel-Interface angewendet, muss der unerwünschte Verkehr erst den ganzen Weg durch den Router zurücklegen, bevor er verworfen wird." },
              { cmd: "permit ip any any vergessen", explanation: "Ohne die abschließende permit-Zeile blockiert die ACL wegen des impliziten deny any auch jeden anderen, eigentlich erlaubten Verkehr." },
              { cmd: "host-Schlüsselwort vergessen", explanation: "deny tcp 192.168.1.20 ... ohne host wird als Netzwerkadresse mit fehlender Wildcard interpretiert und von IOS abgelehnt oder falsch verstanden — host ist Pflicht für eine einzelne IP." },
              { cmd: "eq 80 mit einer anderen Portnummer verwechselt", explanation: "Ein falscher Port (z. B. eq 8080 statt eq 80) lässt den eigentlichen HTTP-Verkehr ungehindert durch — show ip access-lists zeigt dann keinen steigenden Treffer-Zähler bei der deny-Zeile." },
            ],
          },
        ],
      },
    ],
    verifyCommands: [
      { cmd: "show ip access-lists BLOCK_PC1_HTTP", expected: "deny: Treffer-Zähler > 0" },
      { cmd: "ping 192.168.2.100 (von PC1)", expected: "ping funktioniert (ICMP, nicht HTTP)" },
    ],
    glossary: [
      { term: "Extended ACL", def: "Nummern 100–199 / named — filtert nach Protokoll, Quelle, Ziel und Port." },
      { term: "Named ACL", def: "ACL mit Namen statt Nummer (ip access-list extended NAME) — Regeln einzeln editierbar." },
      { term: "eq <port>", def: "Match auf eine Portnummer (z. B. eq 80 = HTTP, eq 443 = HTTPS)." },
      { term: "Protokoll-Filter", def: "Match auf tcp/udp/icmp/ip statt nur auf Adressen." },
      { term: "ip access-group in", def: "Bindet die ACL eingehend ans Interface." },
      { term: "nah an der Quelle", def: "Extended ACLs platziert man quellnah, um Verkehr früh zu verwerfen." },
      { term: "established", def: "Optionales TCP-Match auf bereits aufgebaute Verbindungen (ACK/RST gesetzt)." },
    ],
  },

  // ─────────────────────────────────────────────────────────────
  // 16. DHCP Snooping + Dynamic ARP Inspection
  // ─────────────────────────────────────────────────────────────
  {
    id: "dhcp-snooping-dai",
    icon: <Shield size={20} />,
    title: "DHCP Snooping + Dynamic ARP Inspection",
    subtitle: "Anti-Spoofing auf dem Access-Switch",
    difficulty: "Fortgeschritten",
    duration: "30 min",
    context: {
      problem:
        "Im LAN ermöglichen Rogue-DHCP-Server und ARP-Poisoning Man-in-the-Middle-Angriffe: der Angreifer leitet fremden Verkehr über sich um.",
      purpose:
        "Die zusammenhängende L2-Security-Kette aufbauen: DHCP-Snooping (nur Server-Port trusted) erzeugt eine Binding-Tabelle, auf der Dynamic ARP Inspection aufsetzt.",
    },
    topology: {
      description:
        "Access-Switch SW1 mit 2 legitimen Endgeräten und einem Angreifer-PC. Der legitime DHCP-Server hängt am Uplink (trusted). Wir blockieren Rogue-DHCP und ARP-Spoofing.",
      devices: [
        { type: "switch", label: "SW1 (Access)", count: 1 },
        { type: "router", label: "R1 (DHCP-Server)", count: 1 },
        { type: "pc", label: "PC1, PC2, Angreifer", count: 3 },
      ],
      connections: ["R1 (DHCP) → SW1 Gi0/1 (UPLINK = TRUSTED)", "PC1-3 → SW1 Fa0/1-3 (UNTRUSTED)"],
      hint: "Trusted = Switch akzeptiert DHCP-Replies und ARP. Untrusted = alle Spoofing-Versuche werden gedroppt.",
    },
    steps: [
      {
        title: "SW1: Grundkonfiguration",
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
        ],
      },
      {
        title: "R1: DHCP-Server für VLAN 10",
        blocks: [
          {
            device: "R1",
            mode: "privileged",
            modeLabel: "Router>",
            commands: [
              {
                cmd: "enable\nconfigure terminal\nhostname R1\nno ip domain-lookup\ninterface GigabitEthernet0/0\nip address 192.168.10.1 255.255.255.0\nno shutdown",
                explanation: "Grundkonfiguration + LAN-Interface als Gateway.",
              },
              {
                cmd: "ip dhcp excluded-address 192.168.10.1 192.168.10.10\nip dhcp pool VLAN10\nnetwork 192.168.10.0 255.255.255.0\ndefault-router 192.168.10.1",
                explanation: "DHCP-Pool für PC1/PC2 — der legitime Server, den DHCP-Snooping später als einzig erlaubte Quelle akzeptiert.",
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
        title: "DHCP Snooping aktivieren",
        blocks: [
          {
            device: "SW1",
            mode: "global",
            modeLabel: "SW1(config)#",
            commands: [
              { cmd: "ip dhcp snooping", explanation: "Globaler Switch — Feature an." },
              { cmd: "ip dhcp snooping vlan 10", explanation: "Nur in diesem VLAN aktiv." },
              { cmd: "no ip dhcp snooping information option", explanation: "Option-82 deaktivieren falls DHCP-Server kein 'option 82' versteht (häufige Fehlerquelle)." },
            ],
          },
          {
            device: "SW1",
            mode: "interface",
            modeLabel: "SW1(config)#",
            commands: [
              { cmd: "interface Gi0/1", explanation: "Uplink zum echten DHCP-Server." },
              { cmd: "ip dhcp snooping trust", explanation: "TRUSTED — DHCP-Replies erlaubt. Default ist UNTRUSTED auf allen Ports, auch Fa0/1-3 bleiben untrusted." },
            ],
          },
        ],
      },
      {
        title: "Dynamic ARP Inspection (DAI)",
        blocks: [
          {
            device: "SW1",
            mode: "global",
            modeLabel: "SW1(config)#",
            commands: [
              { cmd: "ip arp inspection vlan 10", explanation: "DAI in VLAN 10 aktiv. Prüft jeden ARP-Reply gegen die DHCP-Snooping-Binding-Table." },
            ],
          },
          {
            device: "SW1",
            mode: "interface",
            modeLabel: "SW1(config)#",
            commands: [
              { cmd: "interface Gi0/1", explanation: "Uplink." },
              { cmd: "ip arp inspection trust", explanation: "Trusted für ARP (sonst würden auch legitime Gateway-ARPs gedroppt)." },
            ],
          },
          {
            device: "SW1",
            mode: "privileged",
            modeLabel: "SW1(config-if)#",
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
        title: "PC1/PC2 auf DHCP stellen + Baseline",
        blocks: [
          {
            device: "PC1",
            mode: "desktop",
            modeLabel: "Desktop > IP Configuration",
            commands: [
              { cmd: "◉ DHCP  (Radio-Button anklicken)", explanation: "Bekommt eine Adresse vom legitimen R1-Pool über den trusted Uplink." },
            ],
          },
          {
            device: "PC2",
            mode: "desktop",
            modeLabel: "Desktop > IP Configuration",
            commands: [
              { cmd: "◉ DHCP  (Radio-Button anklicken)", explanation: "Gleicher Vorgang." },
            ],
          },
          {
            device: "PC1",
            mode: "desktop",
            modeLabel: "Desktop > Command Prompt",
            commands: [
              { cmd: "ipconfig", explanation: "Baseline: echte 192.168.10.x-Adresse vom legitimen Server — vor der Gegenprobe." },
            ],
          },
        ],
      },
      {
        title: "Gegenprobe — Rogue-DHCP-Server am Angreifer-Port",
        blocks: [
          {
            device: "Angreifer",
            mode: "service",
            modeLabel: "Desktop > IP Configuration (statisch) + Services > DHCP",
            commands: [
              {
                cmd: "Statische IP: 192.168.10.99 /24\nServices > DHCP: Service AN, Pool mit Default Gateway 192.168.10.99 (gefälscht)",
                explanation: "Der Angreifer-PC an Fa0/3 (UNTRUSTED) versucht, sich selbst als DHCP-Server auszugeben und Clients ein falsches Gateway unterzujubeln — der klassische Rogue-DHCP-Angriff.",
              },
            ],
          },
          {
            device: "SW1",
            mode: "privileged",
            modeLabel: "SW1#",
            commands: [
              {
                cmd: "show ip dhcp snooping binding",
                explanation: "Die Bindings stammen ausschließlich von R1 (über den trusted Uplink) — kein Eintrag mit Gateway 192.168.10.99. DHCP-Snooping verwirft DHCP-Server-Antworten (Offer/Ack) von jedem untrusted Port, also auch vom Angreifer.",
              },
              {
                cmd: "show ip dhcp snooping statistics",
                explanation: "Zeigt gestiegene Drop-Zähler für Fa0/3 — der Nachweis, dass tatsächlich etwas verworfen wurde, nicht nur ein geparster Befehl ohne Wirkung.",
              },
            ],
          },
        ],
      },
      {
        title: "Typische Fehler bei DHCP Snooping/DAI",
        blocks: [
          {
            device: "Merke",
            mode: "info",
            modeLabel: "Häufige Fehler",
            commands: [
              { cmd: "Uplink nicht als trusted markiert", explanation: "Vergisst man ip dhcp snooping trust auf Gi0/1, verwirft der Switch auch die Antworten des LEGITIMEN DHCP-Servers — kein Client bekommt mehr eine Adresse." },
              { cmd: "VLAN in ip dhcp snooping vlan vergessen", explanation: "DHCP-Snooping und DAI wirken nur in den explizit gelisteten VLANs — ein vergessenes VLAN bleibt komplett ungeschützt." },
              { cmd: "DAI ohne vorheriges DHCP-Snooping", explanation: "DAI braucht die Binding-Tabelle von DHCP-Snooping als Referenz — ohne sie hat DAI keine Grundlage, um legitime von gefälschten ARP-Antworten zu unterscheiden." },
              { cmd: "Rate-Limit auf sehr niedrigen Standardwert getroffen", explanation: "Access-Ports haben in IOS einen niedrigen DAI-Rate-Limit-Default — auf realer Hardware bei hohem legitimen ARP-Aufkommen ggf. mit ip arp inspection limit rate anpassen (in diesem Lab nicht konfiguriert, da in Packet Tracer nicht zuverlässig wirksam)." },
            ],
          },
        ],
      },
    ],
    verifyCommands: [
      { cmd: "show ip dhcp snooping", expected: "Switch DHCP snooping: enabled, Trusted Gi0/1" },
      { cmd: "show ip dhcp snooping binding", expected: "Nur Einträge über den trusted Uplink — keiner mit der Angreifer-MAC" },
      { cmd: "show ip arp inspection", expected: "Source Mac Validation: enabled" },
      { cmd: "ipconfig (PC1, nach Gegenprobe)", expected: "Weiterhin Gateway 192.168.10.1 (R1) — NICHT die gefälschte .99" },
    ],
    glossary: [
      { term: "DHCP-Snooping", def: "Lässt DHCP-Server-Antworten nur an trusted Ports zu — blockiert Rogue-DHCP-Server." },
      { term: "trusted / untrusted", def: "Trusted = Uplink zum echten Server (alles erlaubt); untrusted = Access-Ports (Server-Antworten verworfen)." },
      { term: "Binding-Tabelle", def: "MAC ↔ IP ↔ VLAN ↔ Port, vom Snooping aufgebaut — Datenbasis für DAI." },
      { term: "Dynamic ARP Inspection (DAI)", def: "Prüft ARP-Pakete gegen die Binding-Tabelle — stoppt ARP-Poisoning." },
      { term: "ip arp inspection trust", def: "Markiert Uplinks/Trunks als vertrauenswürdig, sodass sie die ARP-Prüfung überspringen." },
      { term: "Rogue-DHCP", def: "Unbefugter DHCP-Server, der Clients ein falsches Gateway (MITM) zuweist." },
    ],
  },

  // ─────────────────────────────────────────────────────────────
  // 15. STP Root-Bridge Hardening
  // ─────────────────────────────────────────────────────────────
  {
    id: "stp-hardening",
    icon: <Lightning size={20} />,
    title: "STP Root-Bridge Hardening",
    subtitle: "PortFast + BPDU Guard + Root Guard kombiniert einsetzen",
    difficulty: "Fortgeschritten",
    duration: "30 min",
    context: {
      problem:
        "Standard-STP konvergiert langsam und ist manipulierbar: ein fremder Switch mit niedriger Priorität kann Root werden und den Verkehr umleiten.",
      purpose:
        "STP produktionsreif härten: Rapid-PVST für schnelle Konvergenz, Root bewusst festlegen, PortFast+BPDU-Guard global und Root-Guard gegen unerlaubte Root-Übernahme.",
    },
    topology: {
      description:
        "3 Switches im Triangle plus ein vierter, zunächst nicht angeschlossener Switch für die Gegenprobe. Wir definieren bewusst die Root Bridge und schützen sie gegen unerlaubte Übernahme.",
      devices: [
        { type: "switch", label: "Core, Dist1, Dist2", count: 3 },
        { type: "switch", label: "Rogue-Switch (für die Gegenprobe)", count: 1 },
      ],
      connections: [
        "Core ↔ Dist1 (Gi0/1)",
        "Core ↔ Dist2 (Gi0/2)",
        "Dist1 ↔ Dist2 (Gi0/3) — wird per STP blockiert",
        "Rogue-Switch → zunächst NICHT angeschlossen",
      ],
      hint: "Core MUSS Root sein. Falls ein Mitarbeiter versehentlich einen Heim-Switch ansteckt, darf er NIE Root werden.",
    },
    steps: [
      {
        title: "Core hart als Root setzen",
        blocks: [
          {
            device: "Core",
            mode: "privileged",
            modeLabel: "Switch>",
            commands: [
              {
                cmd: "enable\nconfigure terminal\nhostname Core\nno ip domain-lookup",
                explanation: "Üblicher Einstieg.",
              },
            ],
          },
          {
            device: "Core",
            mode: "global",
            modeLabel: "Core(config)#",
            commands: [
              { cmd: "spanning-tree mode rapid-pvst", explanation: "RSTP (802.1w) statt klassisches STP → Konvergenz <1s." },
              { cmd: "spanning-tree vlan 1-100 priority 4096", explanation: "Niedrigste Priority = garantiert Root für alle VLANs 1-100." },
              { cmd: "spanning-tree vlan 1-100 root primary", explanation: "Alternative Schreibweise — setzt Priority auf 24576 (oder niedriger als der bisherige Root)." },
            ],
          },
          {
            device: "Core",
            mode: "privileged",
            modeLabel: "Core(config)#",
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
        title: "Backup-Root auf Dist1, Grundkonfig auf Dist2",
        blocks: [
          {
            device: "Dist1",
            mode: "privileged",
            modeLabel: "Switch>",
            commands: [
              {
                cmd: "enable\nconfigure terminal\nhostname Dist1\nno ip domain-lookup",
                explanation: "Üblicher Einstieg.",
              },
            ],
          },
          {
            device: "Dist1",
            mode: "global",
            modeLabel: "Dist1(config)#",
            commands: [
              { cmd: "spanning-tree mode rapid-pvst", explanation: "Gleicher Mode wie Core." },
              { cmd: "spanning-tree vlan 1-100 root secondary", explanation: "Priority 28672 — übernimmt sofort, falls Core ausfällt." },
            ],
          },
          {
            device: "Dist1",
            mode: "privileged",
            modeLabel: "Dist1(config)#",
            commands: [
              {
                cmd: "end\ncopy running-config startup-config",
                explanation: "Speichern.",
              },
            ],
          },
          {
            device: "Dist2",
            mode: "privileged",
            modeLabel: "Switch>",
            commands: [
              {
                cmd: "enable\nconfigure terminal\nhostname Dist2\nno ip domain-lookup\nspanning-tree mode rapid-pvst",
                explanation: "Dist2 bekommt keine besondere Priority — bleibt regulärer Non-Root-Switch.",
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
        title: "Access-Ports: PortFast + BPDU Guard global",
        blocks: [
          {
            device: "Core",
            mode: "global",
            modeLabel: "Core(config)#",
            commands: [
              { cmd: "spanning-tree portfast default", explanation: "PortFast automatisch für alle Access-Ports → sofortiges Forwarding." },
              { cmd: "spanning-tree portfast bpduguard default", explanation: "BPDU Guard global — alle PortFast-Ports gehen bei BPDU-Empfang err-disabled. Ohne konfigurierte errdisable recovery bleibt der Port bis zur manuellen shutdown/no shutdown-Reaktivierung aus." },
            ],
          },
          {
            device: "Core",
            mode: "privileged",
            modeLabel: "Core(config)#",
            commands: [
              {
                cmd: "copy running-config startup-config",
                explanation: "Speichern.",
              },
            ],
          },
        ],
      },
      {
        title: "Trunk-Ports: Root Guard",
        blocks: [
          {
            device: "Core",
            mode: "interface",
            modeLabel: "Core(config)#",
            commands: [
              { cmd: "interface range Gi0/1 - 2", explanation: "Trunks zu Dist1 und Dist2." },
              { cmd: "spanning-tree guard root", explanation: "Root Guard: Verhindert, dass über diesen Port ein 'überlegener' BPDU akzeptiert wird → wenn jemand am Trunk eine 'bessere' Switch ansteckt: root-inconsistent." },
            ],
          },
          {
            device: "Core",
            mode: "privileged",
            modeLabel: "Core(config-if)#",
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
        title: "Baseline prüfen",
        blocks: [
          {
            device: "Core",
            mode: "privileged",
            modeLabel: "Core#",
            commands: [
              {
                cmd: "show spanning-tree root",
                explanation: "Core ist Root ID mit Priority 4096 — bevor die Gegenprobe einen Übernahmeversuch simuliert.",
              },
            ],
          },
        ],
      },
      {
        title: "Gegenprobe — Rogue-Switch mit besserer Priority anschließen",
        blocks: [
          {
            device: "Rogue-Switch",
            mode: "global",
            modeLabel: "Rogue(config)#",
            commands: [
              {
                cmd: "hostname Rogue\nspanning-tree mode rapid-pvst\nspanning-tree vlan 1-100 priority 0",
                explanation: "Priority 0 ist niedriger als Core's 4096 — auf einem UNGESCHÜTZTEN Port würde dieser Switch sofort zur neuen Root Bridge werden.",
              },
            ],
          },
          {
            device: "PT-Aktion",
            mode: "info",
            modeLabel: "Physische Aktion im Canvas",
            commands: [
              {
                cmd: "Rogue-Switch an Core Gi0/1 anschließen (statt/parallel zu Dist1)",
                explanation: "Dieser Port trägt Root Guard aus dem vorigen Schritt — genau das wird jetzt getestet.",
              },
            ],
          },
          {
            device: "Core",
            mode: "privileged",
            modeLabel: "Core#",
            commands: [
              {
                cmd: "show spanning-tree root",
                explanation: "Core bleibt weiterhin Root ID mit Priority 4096 — der Rogue-Switch hat NICHT übernommen, trotz besserer Priority.",
              },
              {
                cmd: "show spanning-tree interface Gi0/1 inconsistentports",
                explanation: "Zeigt Gi0/1 im Zustand 'Root_Inconsistent' — Root Guard hat den überlegenen BPDU des Rogue-Switches erkannt und den Port blockiert, statt die Root-Rolle abzugeben.",
              },
              {
                cmd: "interface Gi0/1\nshutdown\nno shutdown",
                explanation: "Nach dem Entfernen des Rogue-Switches den Port manuell zurücksetzen (Root Guard hebt die Blockierung sonst erst auf, sobald keine überlegenen BPDUs mehr empfangen werden).",
              },
            ],
          },
        ],
      },
      {
        title: "Typische Fehler bei STP-Hardening",
        blocks: [
          {
            device: "Merke",
            mode: "info",
            modeLabel: "Häufige Fehler",
            commands: [
              { cmd: "Root Guard mit Root-Rolle am selben Port verwechselt", explanation: "Root Guard gehört auf Ports, die NIEMALS zu einem Root Port werden dürfen (z. B. Downlinks vom Core) — nicht auf den tatsächlichen Root Port selbst, sonst blockiert der Switch seinen eigenen Weg zur Root Bridge." },
              { cmd: "PortFast auf einem Switch-Uplink aktiviert", explanation: "spanning-tree portfast gehört NUR auf Ports zu Endgeräten — auf einem Trunk zwischen zwei Switches kann es kurzzeitig einen Loop durchlassen." },
              { cmd: "Priority nicht in Vielfachen von 4096 gesetzt", explanation: "IOS akzeptiert nur Vielfache von 4096 als Priority-Wert." },
              { cmd: "root-inconsistent für einen Fehler gehalten", explanation: "Ein Port im Zustand Root_Inconsistent ist gewollt — das ist Root Guard, das eine unerlaubte Root-Übernahme verhindert, kein Konfigurationsfehler." },
            ],
          },
        ],
      },
    ],
    verifyCommands: [
      { cmd: "show spanning-tree root", expected: "Root ID Priority 4096, This bridge IS the root — bleibt so auch nach der Gegenprobe" },
      { cmd: "show spanning-tree summary", expected: "PortFast Default ON, BPDU Guard Default ON" },
      { cmd: "show spanning-tree interface Gi0/1 inconsistentports (während Gegenprobe)", expected: "Gi0/1: Root_Inconsistent" },
    ],
    glossary: [
      { term: "Rapid-PVST+", def: "Ciscos schnelle STP-Variante (802.1w) pro VLAN — Konvergenz in Sekunden statt ~50 s." },
      { term: "root primary / secondary", def: "Setzt die Bridge-Priority so, dass ein Switch sicher Root (bzw. Backup-Root) wird." },
      { term: "Root Guard", def: "Verhindert, dass über einen Port ein fremder Switch Root-Bridge wird (Port geht in root-inconsistent)." },
      { term: "PortFast default", def: "Aktiviert PortFast global auf allen Access-Ports." },
      { term: "BPDU-Guard default", def: "Aktiviert BPDU-Guard global auf allen PortFast-Ports." },
      { term: "err-disabled", def: "Sicherheits-Aus-Zustand eines Ports nach einer Verletzung (z. B. BPDU auf PortFast-Port). Ohne errdisable recovery nur manuell rückholbar." },
      { term: "Root_Inconsistent", def: "Zustand eines Root-Guard-geschützten Ports, der einen überlegenen BPDU empfangen hat — blockiert, bis der überlegene BPDU verschwindet." },
    ],
  },

  // ═════════════════════════════════════════════════════════════
  // ERWEITERTE LABS (14–31)
  // ═════════════════════════════════════════════════════════════

  // ─────────────────────────────────────────────────────────────
  // 14. VLAN-Hopping & Mitigation
  // ─────────────────────────────────────────────────────────────
  {
    id: "vlan-hopping",
    icon: <Shield size={20} />,
    title: "VLAN-Hopping & Mitigation",
    subtitle: "Switch-Spoofing + Double-Tagging verhindern",
    difficulty: "Fortgeschritten",
    duration: "30 min",
    context: {
      problem:
        "Ein Angreifer kann per Double-Tagging (zwei 802.1Q-Tags) oder einem erschlichenen Trunk (DTP) Frames in ein fremdes VLAN einschleusen, das er eigentlich nicht erreichen darf.",
      purpose:
        "Die Standard-Gegenmaßnahmen gegen VLAN-Hopping umsetzen: ein ungenutztes Native-VLAN als Blackhole, DTP per nonegotiate abschalten und Access-Ports härten.",
    },
    topology: {
      description:
        "Angriffsszenario: Ein PC versucht durch Switch-Spoofing (DTP) in fremde VLANs zu gelangen. Wir härten die Switch-Ports und weisen die Wirkung von BPDU Guard über einen versuchsweise angeschlossenen Switch nach.",
      devices: [
        { type: "switch", label: "SW1, SW2", count: 2 },
        { type: "pc", label: "Angreifer + 2 normale PCs", count: 3 },
        { type: "switch", label: "Angreifer-Switch (für die Gegenprobe)", count: 1 },
      ],
      connections: [
        "SW1 Gi0/1 ↔ SW2 Gi0/1 (Trunk)",
        "Angreifer-PC → SW1 Fa0/1 (VLAN 10, gehärtet)",
        "PC0 → SW1 Fa0/2 (VLAN 10), PC1 → SW2 Fa0/1 (VLAN 10)",
        "Angreifer-Switch → zunächst NICHT angeschlossen",
      ],
      hint: "Default-DTP-Modus 'dynamic auto' erlaubt einem Angreifer, einen Trunk auszuhandeln → Zugang zu ALLEN VLANs!",
    },
    steps: [
      {
        title: "SW1: Grundkonfiguration + VLANs",
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
              { cmd: "vlan 10\nname DATA\nvlan 20\nname VOICE\nexit", explanation: "VLANs anlegen." },
            ],
          },
        ],
      },
      {
        title: "Access-Ports hart konfigurieren (gegen Switch-Spoofing)",
        blocks: [
          {
            device: "SW1",
            mode: "interface",
            modeLabel: "SW1(config)#",
            commands: [
              { cmd: "interface Fa0/1", explanation: "Port des Angreifers." },
              { cmd: "switchport mode access", explanation: "Explizit Access — kein DTP-Aushandeln mehr möglich." },
              { cmd: "switchport access vlan 10", explanation: "Statisch VLAN 10 zugewiesen." },
              { cmd: "switchport nonegotiate", explanation: "Deaktiviert DTP komplett. Port verschickt keine DTP-Frames mehr." },
              { cmd: "spanning-tree portfast", explanation: "Sofort Forwarding für Endgeräte." },
              { cmd: "spanning-tree bpduguard enable", explanation: "Bei BPDU-Empfang → err-disabled. Schutz wenn jemand einen Switch ansteckt — genau das zeigt die spätere Gegenprobe." },
              { cmd: "interface Fa0/2\nswitchport mode access\nswitchport access vlan 10\nswitchport nonegotiate\nspanning-tree portfast\nspanning-tree bpduguard enable", explanation: "Gleiche Härtung für PC0." },
            ],
          },
        ],
      },
      {
        title: "Trunk-Port härten (gegen Double-Tagging)",
        blocks: [
          {
            device: "SW1",
            mode: "interface",
            modeLabel: "SW1(config)#",
            commands: [
              { cmd: "interface Gi0/1", explanation: "Trunk zwischen den Switches." },
              { cmd: "switchport mode trunk", explanation: "Hart Trunk — kein Auto/Desirable." },
              { cmd: "switchport nonegotiate", explanation: "Kein DTP." },
              { cmd: "switchport trunk native vlan 999", explanation: "Native VLAN ändern (nicht VLAN 1)! Double-Tag-Angriff nutzt das Default-Native-VLAN." },
              { cmd: "switchport trunk allowed vlan 10,20", explanation: "Nur erlaubte VLANs auf dem Trunk — kein VLAN 1 für User-Daten." },
            ],
          },
          {
            device: "SW1",
            mode: "global",
            modeLabel: "SW1(config)#",
            commands: [
              { cmd: "vlan 999\nname BLACKHOLE-NATIVE\nexit", explanation: "Black-Hole-VLAN für das Native VLAN anlegen." },
              { cmd: "vlan dot1q tag native", explanation: "Globaler Befehl (nicht Interface-Befehl!): zwingt den Switch, Frames im Native VLAN auf ALLEN Trunks zu taggen — killt Double-Tagging sicher. Auf realer Hardware korrekt als globaler Befehl, nicht als switchport-Unterbefehl." },
            ],
          },
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
        title: "SW2: gleiche Härtung",
        blocks: [
          {
            device: "SW2",
            mode: "privileged",
            modeLabel: "Switch>",
            commands: [
              {
                cmd: "enable\nconfigure terminal\nhostname SW2\nno ip domain-lookup\nvlan 10\nname DATA\nvlan 20\nname VOICE\nexit",
                explanation: "Gleicher Einstieg + VLANs wie SW1.",
              },
              {
                cmd: "interface Fa0/1\nswitchport mode access\nswitchport access vlan 10\nswitchport nonegotiate\nspanning-tree portfast\nspanning-tree bpduguard enable",
                explanation: "PC1-Port, gleiche Härtung."
              },
              {
                cmd: "interface Gi0/1\nswitchport mode trunk\nswitchport nonegotiate\nswitchport trunk native vlan 999\nswitchport trunk allowed vlan 10,20",
                explanation: "Trunk zu SW1, spiegelbildlich gehärtet.",
              },
              {
                cmd: "vlan 999\nname BLACKHOLE-NATIVE\nexit\nvlan dot1q tag native",
                explanation: "Gleiches Blackhole-Native-VLAN + Tagging wie SW1.",
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
        title: "PCs adressieren + Baseline",
        blocks: [
          {
            device: "Angreifer-PC",
            mode: "desktop",
            modeLabel: "Desktop > IP Configuration",
            commands: [
              { cmd: "IP Address: 192.168.10.99\nSubnet Mask: 255.255.255.0\nDefault Gateway: 192.168.10.1", explanation: "An SW1 Fa0/1, VLAN 10." },
            ],
          },
          {
            device: "PC0",
            mode: "desktop",
            modeLabel: "Desktop > IP Configuration",
            commands: [
              { cmd: "IP Address: 192.168.10.10\nSubnet Mask: 255.255.255.0\nDefault Gateway: 192.168.10.1", explanation: "An SW1 Fa0/2, VLAN 10." },
            ],
          },
          {
            device: "PC1",
            mode: "desktop",
            modeLabel: "Desktop > IP Configuration",
            commands: [
              { cmd: "IP Address: 192.168.10.20\nSubnet Mask: 255.255.255.0\nDefault Gateway: 192.168.10.1", explanation: "An SW2 Fa0/1, VLAN 10 — über den Trunk erreichbar." },
            ],
          },
          {
            device: "PC0",
            mode: "desktop",
            modeLabel: "Desktop > Command Prompt",
            commands: [
              { cmd: "ping 192.168.10.20", explanation: "Baseline: normaler VLAN-10-Verkehr über den gehärteten Trunk funktioniert weiterhin." },
            ],
          },
        ],
      },
      {
        title: "Gegenprobe — Switch-Spoofing am Angreifer-Port",
        blocks: [
          {
            device: "PT-Aktion",
            mode: "info",
            modeLabel: "Physische Aktion im Canvas",
            commands: [
              {
                cmd: "Angreifer-PC-Kabel von Fa0/1 abziehen, stattdessen Angreifer-Switch an Fa0/1 anschließen",
                explanation: "Simuliert den klassischen Switch-Spoofing-Versuch: ein Angreifer steckt statt eines PCs einen eigenen Switch an, um per DTP einen Trunk auszuhandeln und Zugriff auf alle VLANs zu bekommen.",
              },
            ],
          },
          {
            device: "SW1",
            mode: "privileged",
            modeLabel: "SW1#",
            commands: [
              {
                cmd: "show interfaces status",
                explanation: "Fa0/1 zeigt 'err-disabled' statt 'connected' — sobald der Angreifer-Switch BPDUs sendet, greift BPDU Guard. Der Port bleibt in VLAN 10 gefangen und wird NIE zum Trunk — switchport nonegotiate hätte ohnehin jede DTP-Aushandlung verhindert, BPDU Guard schaltet zusätzlich sofort ab.",
              },
              {
                cmd: "interface Fa0/1\nshutdown\nno shutdown",
                explanation: "Nach Entfernen des Angreifer-Switches den Port manuell zurücksetzen, Angreifer-PC wieder anschließen.",
              },
            ],
          },
        ],
      },
      {
        title: "Typische Fehler bei VLAN-Hopping-Mitigation",
        blocks: [
          {
            device: "Merke",
            mode: "info",
            modeLabel: "Häufige Fehler",
            commands: [
              { cmd: "vlan dot1q tag native als Interface-Befehl versucht", explanation: "Es ist ein GLOBALER Befehl (gilt für alle Trunks des Switches gleichzeitig) — nicht 'switchport trunk native vlan tag' im Interface-Kontext, das IOS als Syntaxfehler ablehnt." },
              { cmd: "Native VLAN nicht auf beiden Trunk-Enden geändert", explanation: "SW1 und SW2 müssen dasselbe Native VLAN (999) verwenden — ein Mismatch erzeugt eine CDP-Warnung und kann VLAN-Leakage verursachen." },
              { cmd: "nonegotiate für ausreichend gehalten", explanation: "nonegotiate verhindert nur die DTP-Aushandlung — BPDU Guard schützt zusätzlich davor, dass ein fremder Switch überhaupt am Port aktiv wird (STP-Ebene, nicht Trunk-Ebene)." },
              { cmd: "VLAN 1 weiterhin für User-Daten genutzt", explanation: "Best Practice ist, VLAN 1 nirgends für echten Nutzverkehr zu verwenden — switchport trunk allowed vlan grenzt genau das ein." },
            ],
          },
        ],
      },
    ],
    verifyCommands: [
      { cmd: "show interfaces switchport", expected: "Operational Mode: static access, Negotiation: Off" },
      { cmd: "show interfaces trunk", expected: "Native vlan: 999, Allowed: 10,20" },
      { cmd: "ping 192.168.10.20 (von PC0)", expected: "Erfolgreich — normaler Verkehr bleibt unbeeinträchtigt" },
      { cmd: "show interfaces status (während Gegenprobe)", expected: "Fa0/1: err-disabled — echtes Verhalten durch BPDU Guard" },
    ],
    glossary: [
      { term: "VLAN-Hopping", def: "Angriff, der Frames in ein anderes VLAN bringt — per Double-Tagging oder Switch-Spoofing (DTP)." },
      { term: "Double-Tagging", def: "Angreifer setzt zwei 802.1Q-Tags; der erste wird am Trunk entfernt, der zweite leitet ins Ziel-VLAN." },
      { term: "Native VLAN", def: "Das eine VLAN, dessen Frames am Trunk UNgetaggt laufen — Einfallstor für Double-Tagging." },
      { term: "Blackhole-VLAN", def: "Ein leeres, nirgends genutztes VLAN, das man als Native VLAN setzt, damit getaggter Angriffsverkehr ins Leere läuft." },
      { term: "vlan dot1q tag native", def: "Globaler Befehl (kein Interface-Unterbefehl!): erzwingt Tagging auch für das Native VLAN auf allen Trunks des Switches." },
      { term: "switchport nonegotiate", def: "Schaltet DTP ab, damit kein Port automatisch zum Trunk verhandelt wird (Switch-Spoofing-Schutz)." },
      { term: "DTP", def: "Dynamic Trunking Protocol — automatische Trunk-Verhandlung, die ein Angreifer ausnutzen kann." },
      { term: "BPDU-Guard", def: "Sichert Access-Ports zusätzlich gegen eingeschleuste Switches ab — Port geht bei BPDU-Empfang in err-disabled." },
    ],
  },

  // ─────────────────────────────────────────────────────────────
  // 23. AAA mit RADIUS
  // ─────────────────────────────────────────────────────────────
  {
    id: "aaa-radius-tacacs",
    icon: <Key size={20} />,
    title: "AAA mit RADIUS",
    subtitle: "Zentrales Login mit lokalem Fallback",
    difficulty: "Fortgeschritten",
    duration: "25 min",
    context: {
      problem:
        "Lokale Passwörter auf jedem einzelnen Gerät skalieren nicht und sind kaum zu auditieren. Geräte-Zugriff sollte zentral verwaltet und protokolliert werden.",
      purpose:
        "AAA mit RADIUS einrichten: zentrale Authentifizierung und Autorisierung über einen Server, mit lokalem Fallback, falls der Server nicht erreichbar ist. Enterprise-Standard für Admin-Login.",
    },
    topology: {
      description:
        "Switch SW1. Login wird zentral gegen einen RADIUS-Server geprüft. Lokaler Fallback-User, falls Server down. Ein Admin-PC testet den Login per SSH.",
      devices: [
        { type: "switch", label: "SW1", count: 1 },
        { type: "server", label: "RADIUS-Server", count: 1 },
        { type: "pc", label: "Admin-PC", count: 1 },
      ],
      connections: [
        "SW1 Mgmt → RADIUS-Server (10.0.0.50)",
        "Admin-PC → SW1 (192.168.1.0/24)",
      ],
      hint: "IMMER lokalen Fallback-User behalten — sonst sperrst du dich aus, wenn der Server down ist!",
    },
    steps: [
      {
        title: "SW1: Grundkonfiguration + SSH-Voraussetzungen",
        blocks: [
          {
            device: "SW1",
            mode: "privileged",
            modeLabel: "Switch>",
            commands: [
              {
                cmd: "enable\nconfigure terminal\nhostname SW1\nno ip domain-lookup\nip domain-name lab.local",
                explanation: "Üblicher Einstieg + Domain-Name — Pflicht für die RSA-Schlüssel-Generierung im nächsten Schritt.",
              },
              {
                cmd: "crypto key generate rsa modulus 2048\nip ssh version 2",
                explanation: "SSH vorbereiten — der Login-Test am Ende läuft per SSH, nicht per unsicherem Telnet.",
              },
              {
                cmd: "interface vlan 1\nip address 192.168.1.254 255.255.255.0\nno shutdown\nexit",
                explanation: "Management-SVI im Netz des Admin-PCs (192.168.1.0/24).",
              },
            ],
          },
        ],
      },
      {
        title: "Lokaler Fallback-User",
        blocks: [
          {
            device: "SW1",
            mode: "global",
            modeLabel: "SW1(config)#",
            commands: [
              { cmd: "username localadmin privilege 15 secret StrongP@ss1", explanation: "Lokaler User mit höchster Privilege-Stufe — Fallback wenn RADIUS unerreichbar." },
              { cmd: "enable secret EnableP@ss2", explanation: "Enable-Passwort gehasht (Type 5)." },
            ],
          },
        ],
      },
      {
        title: "RADIUS-Server definieren",
        blocks: [
          {
            device: "SW1",
            mode: "global",
            modeLabel: "SW1(config)#",
            commands: [
              { cmd: "radius server RADSRV", explanation: "Server-Objekt anlegen." },
              { cmd: "address ipv4 10.0.0.50 auth-port 1812 acct-port 1813", explanation: "Server-IP + Standard-Ports: 1812 Authentifizierung, 1813 Accounting (UDP)." },
              { cmd: "key CCNAradKey", explanation: "Shared Secret (gleiches auf Server-Seite)." },
              { cmd: "exit", explanation: "" },
              { cmd: "aaa group server radius RAD-GRP", explanation: "Gruppe für Load-Balancing/Failover." },
              { cmd: "server name RADSRV", explanation: "" },
            ],
          },
        ],
      },
      {
        title: "AAA Methodenlisten",
        blocks: [
          {
            device: "SW1",
            mode: "global",
            modeLabel: "SW1(config)#",
            commands: [
              { cmd: "aaa new-model", explanation: "AAA-Framework einschalten — überschreibt alte 'login local'-Logik." },
              { cmd: "aaa authentication login default group RAD-GRP local", explanation: "Login: erst RADIUS, bei Server-Down → lokal (localadmin)." },
              { cmd: "aaa authentication enable default group RAD-GRP enable", explanation: "Enable-Pass: RADIUS, dann lokal." },
              { cmd: "aaa authorization exec default group RAD-GRP local if-authenticated", explanation: "Authorization (welche Privilege-Stufe der Nutzer erhält)." },
              { cmd: "aaa accounting exec default start-stop group RAD-GRP", explanation: "Accounting — wer hat sich wann eingeloggt. Anders als TACACS+ kennt RADIUS keine granulare Pro-Befehl-Autorisierung (aaa authorization commands) — RADIUS autorisiert nur die Session als Ganzes." },
            ],
          },
        ],
      },
      {
        title: "VTY-Lines mit AAA",
        blocks: [
          {
            device: "SW1",
            mode: "global",
            modeLabel: "SW1(config)#",
            commands: [
              { cmd: "line vty 0 15", explanation: "Alle 16 VTY-Lines." },
              { cmd: "transport input ssh", explanation: "Nur SSH erlaubt — kein Telnet." },
              { cmd: "login authentication default", explanation: "Verwendet die oben definierte Methodenliste." },
              { cmd: "authorization exec default", explanation: "" },
            ],
          },
          {
            device: "SW1",
            mode: "privileged",
            modeLabel: "SW1(config-line)#",
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
        title: "Admin-PC adressieren + Login testen",
        blocks: [
          {
            device: "Admin-PC",
            mode: "desktop",
            modeLabel: "Desktop > IP Configuration",
            commands: [
              { cmd: "IP Address: 192.168.1.10\nSubnet Mask: 255.255.255.0\nDefault Gateway: 192.168.1.254", explanation: "Gleiches Subnetz wie die Management-SVI von SW1." },
            ],
          },
          {
            device: "Admin-PC",
            mode: "desktop",
            modeLabel: "Desktop > Command Prompt",
            commands: [
              {
                cmd: "ssh -l localadmin 192.168.1.254",
                explanation: "Login-Test mit dem lokalen Fallback-User (StrongP@ss1) — falls in der Lab-Umgebung kein echter RADIUS-Server antwortet, greift automatisch der lokale Fallback und der Login gelingt trotzdem. Das ist der eigentliche Nachweis dieses Labs: Login funktioniert AUCH ohne erreichbaren AAA-Server.",
              },
            ],
          },
        ],
      },
      {
        title: "Typische Fehler bei AAA/RADIUS",
        blocks: [
          {
            device: "Merke",
            mode: "info",
            modeLabel: "Häufige Fehler",
            commands: [
              { cmd: "Lokalen Fallback vergessen", explanation: "Ohne local am Ende der Methodenliste (aaa authentication login default group RAD-GRP local) sperrt man sich beim ersten RADIUS-Ausfall komplett aus — kein Login mehr möglich." },
              { cmd: "aaa new-model vor den Methodenlisten vergessen", explanation: "Ohne aaa new-model bleiben alle folgenden aaa-Befehle wirkungslos — das Gerät nutzt weiterhin die alte login-local-Logik." },
              { cmd: "Shared Secret stimmt nicht überein", explanation: "Der key auf dem Switch muss ZEICHENGENAU mit dem Secret auf dem RADIUS-Server übereinstimmen, sonst schlägt jede Authentifizierung fehl (Access-Reject)." },
              { cmd: "SSH-Voraussetzungen vergessen", explanation: "Ohne ip domain-name + crypto key generate rsa lässt sich kein SSH-Zugang aufbauen — der AAA-Login-Test scheitert dann schon am Transport, nicht an der Authentifizierung." },
            ],
          },
        ],
      },
    ],
    verifyCommands: [
      { cmd: "show aaa servers", expected: "RADSRV: state UP, 0 timeouts" },
      { cmd: "test aaa group RAD-GRP localadmin StrongP@ss1 legacy", expected: "User successfully authenticated (oder Fallback bei Server-Down)" },
      { cmd: "show running-config | section aaa", expected: "AAA-Block komplett sichtbar" },
      { cmd: "ssh -l localadmin 192.168.1.254 (von Admin-PC)", expected: "Login erfolgreich, Prompt wechselt auf SW1#" },
    ],
    glossary: [
      { term: "AAA", def: "Authentication, Authorization, Accounting — wer darf rein, was darf er, was hat er getan." },
      { term: "aaa new-model", def: "Schaltet das AAA-Framework ein (Voraussetzung für RADIUS)." },
      { term: "RADIUS", def: "Offenes AAA-Protokoll (UDP 1812/1813) — verschlüsselt nur das Passwort, nicht die ganze Sitzung; autorisiert nur session-weit, nicht pro Befehl." },
      { term: "TACACS+", def: "Cisco-Protokoll (TCP 49) — verschlüsselt die gesamte Sitzung und erlaubt granulare Pro-Befehl-Autorisierung. In Packet Tracer nicht zuverlässig konfigurierbar, daher hier RADIUS." },
      { term: "group server", def: "Bündelt mehrere AAA-Server zu einer benannten Gruppe." },
      { term: "lokaler Fallback", def: "Schlüsselwort local in der Methodenliste — Login über lokale DB, wenn der Server ausfällt." },
      { term: "key", def: "Gemeinsames Secret zwischen Gerät und AAA-Server." },
    ],
  },

  // ─────────────────────────────────────────────────────────────
  // 28. ACL + Static NAT — Dual-Site mit ISP
  // Zwei Standorte (CO-1 EIGRP, CO-2 OSPF), gemeinsamer ISP-MUMBAI,
  // statisches NAT auf beiden Routern + Extended ACL pro Interface.
  // ─────────────────────────────────────────────────────────────
  {
    id: "co-acl-nat-isp",
    icon: <Shield size={20} />,
    title: "ACL + Static NAT — Dual-Site mit ISP",
    subtitle: "CO-1 · CO-2 · EIGRP · OSPF · ISP-MUMBAI · 13 Hosts · 2×ACL + 2×NAT",
    difficulty: "Fortgeschritten",
    duration: "65 min",
    context: {
      problem:
        "Zwei Unternehmensstandorte (CO-1 und CO-2) sollen über einen gemeinsamen ISP ins Internet. Die internen Adressen müssen per Static NAT veröffentlicht werden, und Extended ACLs auf beiden Routern legen exakt fest, welcher Datenverkehr in welche Richtung erlaubt ist.",
      purpose:
        "Das Lab zeigt das Zusammenspiel von Static NAT und Extended ACL in einer realen Dual-Site-Topologie. Zentrales Lernziel: wann sieht die ACL die private IP und wann die öffentliche — und warum muss man EIGRP/OSPF in der Rückwärts-ACL explizit erlauben.",
    },
    topology: {
      description:
        "CO-1 (EIGRP AS 199, LAN 192.168.10.0/24) und CO-2 (OSPF 100 Area 1, LAN 172.16.10.0/24) verbinden sich jeweils über eine Access-VLAN-Verbindung am ISP-SW mit dem ISP-MUMBAI-Router. ISP-MUMBAI läuft Sub-Interfaces (ETH0/0.99 für CO-1, ETH0/0.199 für CO-2) und verbindet das Internet-Segment (200.10.20.0/24) via ETH0/1. Alle End-Hosts nutzen Default-Routing.",
      devices: [
        { type: "router", label: "CO-1  (ETH0/0=192.168.10.254, ETH0/1=20.30.10.10)", count: 1 },
        { type: "router", label: "CO-2  (ETH0/0=172.16.10.254, ETH0/1=45.35.55.65)", count: 1 },
        { type: "router", label: "ISP-MUMBAI  (ETH0/0 trunk, ETH0/1=200.10.20.1)", count: 1 },
        { type: "switch", label: "ISP-SW  (VLAN 99 → CO-1, VLAN 199 → CO-2, trunk → ISP)", count: 1 },
        { type: "pc",     label: "VPC-9 .1 / VPC-10 .2 / VPC-11 .3 / R-PC .100 (CO-1 LAN)", count: 4 },
        { type: "pc",     label: "VPC-12 .1 / VPC-13 .2 / VPC-14 .3 / INT_SRV .100 (CO-2 LAN)", count: 4 },
        { type: "pc",     label: "DNS .10 / WEB-1 .20 / WEB-2 .30 / SERVER-1 .40 / USER_PC .50 (Internet)", count: 5 },
      ],
      connections: [
        "CO-1 ETH0/1 ──── ISP-SW (Fa0/1, VLAN 99) ──── trunk ──── ISP-MUMBAI ETH0/0.99",
        "CO-2 ETH0/1 ──── ISP-SW (Fa0/2, VLAN 199) ─── trunk ──── ISP-MUMBAI ETH0/0.199",
        "ISP-MUMBAI ETH0/1 ──────────────────────────────────────── Internet-Segment 200.10.20.0/24",
        "CO-1 ETH0/0 ──── SW1 ──── VPC-9/10/11/R-PC (192.168.10.x/24)",
        "CO-2 ETH0/0 ──── SW2 ──── VPC-12/13/14/INT_SRV (172.16.10.x/24)",
      ],
      hint: "Static NAT auf CO-1/CO-2 konfigurieren BEVOR die ACLs greifen — sonst sieht die ACL-Outbound-Prüfung noch die privaten IPs.",
      topologyDiagram: (
        <svg viewBox="0 0 730 360" className="w-full bg-slate-950" style={{ fontFamily: "ui-monospace, monospace" }}>
          {/* ── CO-1 LAN ── */}
          <rect x="2" y="10" width="100" height="115" rx="4" fill="#0f172a" stroke="#3b82f6" strokeWidth="1.5"/>
          <text x="52" y="24" textAnchor="middle" fill="#93c5fd" fontSize="9" fontWeight="bold">CO-1 LAN</text>
          <text x="7" y="38" fill="#475569" fontSize="8">192.168.10.0/24</text>
          <line x1="7" y1="41" x2="99" y2="41" stroke="#1e3a5f" strokeWidth="0.5"/>
          <text x="7" y="54" fill="#cbd5e1" fontSize="8">VPC-9  · .1</text>
          <text x="7" y="66" fill="#cbd5e1" fontSize="8">VPC-10 · .2</text>
          <text x="7" y="78" fill="#cbd5e1" fontSize="8">VPC-11 · .3</text>
          <text x="7" y="90" fill="#fbbf24" fontSize="8">R-PC   · .100</text>
          <text x="7" y="104" fill="#475569" fontSize="7">GW: .254</text>

          {/* ── CO-1 Router ── */}
          <rect x="112" y="10" width="130" height="115" rx="4" fill="#1e3a5f" stroke="#60a5fa" strokeWidth="1.5"/>
          <text x="177" y="24" textAnchor="middle" fill="#93c5fd" fontSize="10" fontWeight="bold">CO-1</text>
          <text x="116" y="38" fill="#94a3b8" fontSize="7.5">ETH0/0: .254 inside</text>
          <text x="116" y="49" fill="#94a3b8" fontSize="7.5">ETH0/1: 20.30.10.10 out</text>
          <line x1="116" y1="53" x2="238" y2="53" stroke="#1e3a5f" strokeWidth="0.5"/>
          <text x="116" y="64" fill="#fbbf24" fontSize="7">NAT .1→20.30.10.1</text>
          <text x="116" y="74" fill="#fbbf24" fontSize="7">    .2→.2  .3→.3</text>
          <text x="116" y="84" fill="#fbbf24" fontSize="7">    .100→20.30.10.100</text>
          <rect x="116" y="90" width="120" height="14" rx="2" fill="#1e1b4b" stroke="#6366f1" strokeWidth="1"/>
          <text x="176" y="100" textAnchor="middle" fill="#a5b4fc" fontSize="7">ACL: in-out | out-in</text>
          <line x1="102" y1="67" x2="112" y2="67" stroke="#3b82f6" strokeWidth="1.5"/>

          {/* ── CO-2 LAN ── */}
          <rect x="2" y="235" width="100" height="115" rx="4" fill="#0f172a" stroke="#22c55e" strokeWidth="1.5"/>
          <text x="52" y="249" textAnchor="middle" fill="#86efac" fontSize="9" fontWeight="bold">CO-2 LAN</text>
          <text x="7" y="263" fill="#475569" fontSize="8">172.16.10.0/24</text>
          <line x1="7" y1="266" x2="99" y2="266" stroke="#14532d" strokeWidth="0.5"/>
          <text x="7" y="279" fill="#cbd5e1" fontSize="8">VPC-12 · .1</text>
          <text x="7" y="291" fill="#cbd5e1" fontSize="8">VPC-13 · .2</text>
          <text x="7" y="303" fill="#cbd5e1" fontSize="8">VPC-14 · .3</text>
          <text x="7" y="315" fill="#fbbf24" fontSize="8">INT_SRV· .100</text>
          <text x="7" y="329" fill="#475569" fontSize="7">GW: .254</text>

          {/* ── CO-2 Router ── */}
          <rect x="112" y="235" width="130" height="115" rx="4" fill="#14532d" stroke="#4ade80" strokeWidth="1.5"/>
          <text x="177" y="249" textAnchor="middle" fill="#86efac" fontSize="10" fontWeight="bold">CO-2</text>
          <text x="116" y="263" fill="#94a3b8" fontSize="7.5">ETH0/0: .254 inside</text>
          <text x="116" y="274" fill="#94a3b8" fontSize="7.5">ETH0/1: 45.35.55.65 out</text>
          <line x1="116" y1="278" x2="238" y2="278" stroke="#14532d" strokeWidth="0.5"/>
          <text x="116" y="289" fill="#fbbf24" fontSize="7">NAT .1→45.35.55.10</text>
          <text x="116" y="299" fill="#fbbf24" fontSize="7">    .2→.20  .3→.30</text>
          <text x="116" y="309" fill="#fbbf24" fontSize="7">    .100→45.35.55.100</text>
          <rect x="116" y="315" width="120" height="14" rx="2" fill="#1e1b4b" stroke="#6366f1" strokeWidth="1"/>
          <text x="176" y="325" textAnchor="middle" fill="#a5b4fc" fontSize="7">ACL: wan-lan | lan-wan</text>
          <line x1="102" y1="292" x2="112" y2="292" stroke="#22c55e" strokeWidth="1.5"/>

          {/* ── Diagonals to ISP-SW ── */}
          <line x1="242" y1="67" x2="295" y2="183" stroke="#fbbf24" strokeWidth="1.5" strokeDasharray="4,2"/>
          <text x="249" y="107" fill="#fbbf24" fontSize="7.5">EIGRP 199</text>
          <text x="249" y="117" fill="#475569" fontSize="7">VLAN 99</text>
          <line x1="242" y1="292" x2="295" y2="207" stroke="#a78bfa" strokeWidth="1.5" strokeDasharray="4,2"/>
          <text x="246" y="265" fill="#a78bfa" fontSize="7.5">OSPF 100</text>
          <text x="246" y="275" fill="#475569" fontSize="7">VLAN 199</text>

          {/* ── ISP-SW ── */}
          <rect x="295" y="165" width="72" height="60" rx="4" fill="#1e1b4b" stroke="#818cf8" strokeWidth="1.5"/>
          <text x="331" y="182" textAnchor="middle" fill="#c7d2fe" fontSize="9" fontWeight="bold">ISP-SW</text>
          <text x="331" y="196" textAnchor="middle" fill="#94a3b8" fontSize="7.5">VLAN 99/199</text>
          <text x="331" y="208" textAnchor="middle" fill="#94a3b8" fontSize="7">trunk</text>
          <line x1="367" y1="192" x2="393" y2="165" stroke="#818cf8" strokeWidth="1.5"/>
          <text x="366" y="173" fill="#818cf8" fontSize="7">trunk</text>

          {/* ── ISP-MUMBAI ── */}
          <rect x="393" y="100" width="140" height="125" rx="4" fill="#2d1f3d" stroke="#c084fc" strokeWidth="1.5"/>
          <text x="463" y="116" textAnchor="middle" fill="#e9d5ff" fontSize="9.5" fontWeight="bold">ISP-MUMBAI</text>
          <line x1="397" y1="120" x2="529" y2="120" stroke="#3b1f5e" strokeWidth="0.5"/>
          <text x="397" y="132" fill="#94a3b8" fontSize="7.5">ETH0/0.99:  20.30.10.20/24</text>
          <text x="397" y="143" fill="#94a3b8" fontSize="7.5">ETH0/0.199: 45.35.55.75/24</text>
          <text x="397" y="154" fill="#94a3b8" fontSize="7.5">ETH0/1:     200.10.20.1/24</text>
          <line x1="397" y1="158" x2="529" y2="158" stroke="#3b1f5e" strokeWidth="0.5"/>
          <text x="397" y="168" fill="#c084fc" fontSize="7">EIGRP 199 ↔ CO-1</text>
          <text x="397" y="178" fill="#c084fc" fontSize="7">OSPF 100  ↔ CO-2</text>
          <text x="397" y="188" fill="#c084fc" fontSize="7">redistribute EIGRP+OSPF</text>
          <text x="397" y="198" fill="#c084fc" fontSize="7">ip route 0.0.0.0/0 null0</text>
          <line x1="533" y1="157" x2="557" y2="157" stroke="#f87171" strokeWidth="1.5"/>

          {/* ── Internet Zone ── */}
          <rect x="557" y="20" width="168" height="320" rx="4" fill="#1a0a0a" stroke="#f87171" strokeWidth="1.5"/>
          <text x="641" y="37" textAnchor="middle" fill="#fca5a5" fontSize="9" fontWeight="bold">Internet</text>
          <text x="641" y="50" textAnchor="middle" fill="#475569" fontSize="7.5">200.10.20.0/24</text>
          <line x1="561" y1="54" x2="721" y2="54" stroke="#7f1d1d" strokeWidth="0.5"/>
          <text x="561" y="67" fill="#94a3b8" fontSize="8">DNS_SERVER · .10</text>
          <text x="561" y="79" fill="#f87171" fontSize="8">WEB-1      · .20</text>
          <text x="561" y="91" fill="#f87171" fontSize="8">WEB-2      · .30</text>
          <text x="561" y="103" fill="#fbbf24" fontSize="8">SERVER-1   · .40</text>
          <text x="561" y="115" fill="#86efac" fontSize="8">USER_PC    · .50</text>
          <line x1="561" y1="121" x2="721" y2="121" stroke="#7f1d1d" strokeWidth="0.5"/>
          <text x="641" y="136" textAnchor="middle" fill="#60a5fa" fontSize="7.5" fontWeight="bold">CO-1 erlaubt →</text>
          <text x="563" y="148" fill="#6ee7b7" fontSize="7">ICMP: LAN→WEB-1/WEB-2</text>
          <text x="563" y="158" fill="#6ee7b7" fontSize="7">SSH/Telnet: R-PC→WEB-1/WEB-2</text>
          <text x="563" y="168" fill="#6ee7b7" fontSize="7">HTTP/HTTPS: R-PC→SERVER-1</text>
          <line x1="561" y1="174" x2="721" y2="174" stroke="#7f1d1d" strokeWidth="0.5"/>
          <text x="641" y="189" textAnchor="middle" fill="#4ade80" fontSize="7.5" fontWeight="bold">CO-2 erlaubt →</text>
          <text x="563" y="201" fill="#6ee7b7" fontSize="7">ICMP: USER_PC→CO-2 LAN</text>
          <text x="563" y="211" fill="#6ee7b7" fontSize="7">SSH/Telnet/HTTP/HTTPS:</text>
          <text x="563" y="221" fill="#6ee7b7" fontSize="7">  USER_PC→INT_SRV</text>
        </svg>
      ),
    },
    steps: [
      // ─── Schritt 1: IP-Adressen ───────────────────────────────
      {
        title: "IP-Adressen vergeben — alle Router und Hosts",
        blocks: [
          {
            device: "CO-1",
            mode: "privileged",
            modeLabel: "Router>",
            commands: [
              { cmd: "enable\nconfigure terminal\nhostname CO-1\nno ip domain-lookup", explanation: "Üblicher Einstieg." },
            ],
          },
          {
            device: "CO-1",
            mode: "config-if",
            modeLabel: "Interface-Modus",
            commands: [
              { cmd: "interface ethernet 0/0", explanation: "LAN-Interface — hier hängen VPC-9/10/11 und R-PC." },
              { cmd: "ip address 192.168.10.254 255.255.255.0", explanation: "Gateway-IP für das CO-1-LAN. Alle Hosts zeigen hierhin als Default-Gateway." },
              { cmd: "no shutdown", explanation: "Interface aktivieren." },
              { cmd: "interface ethernet 0/1", explanation: "WAN-Interface in Richtung ISP-SW (VLAN 99 → ISP-MUMBAI ETH0/0.99)." },
              { cmd: "ip address 20.30.10.10 255.255.255.0", explanation: "Öffentliche IP von CO-1 auf der WAN-Seite. ISP-MUMBAI's Sub-Interface .99 liegt auf 20.30.10.20 — gleiche /24." },
              { cmd: "no shutdown", explanation: "WAN-Interface aktivieren." },
            ],
          },
          {
            device: "CO-2",
            mode: "privileged",
            modeLabel: "Router>",
            commands: [
              { cmd: "enable\nconfigure terminal\nhostname CO-2\nno ip domain-lookup", explanation: "Üblicher Einstieg." },
            ],
          },
          {
            device: "CO-2",
            mode: "config-if",
            modeLabel: "Interface-Modus",
            commands: [
              { cmd: "interface ethernet 0/0", explanation: "LAN-Interface — hier hängen VPC-12/13/14 und INT_SRV." },
              { cmd: "ip address 172.16.10.254 255.255.255.0", explanation: "Gateway-IP für das CO-2-LAN." },
              { cmd: "no shutdown", explanation: "Interface aktivieren." },
              { cmd: "interface ethernet 0/1", explanation: "WAN-Interface in Richtung ISP-SW (VLAN 199 → ISP-MUMBAI ETH0/0.199)." },
              { cmd: "ip address 45.35.55.65 255.255.255.0", explanation: "Öffentliche IP von CO-2. ISP-MUMBAI's Sub-Interface .199 liegt auf 45.35.55.75 — gleiche /24." },
              { cmd: "no shutdown", explanation: "WAN-Interface aktivieren." },
            ],
          },
          {
            device: "ISP-SW",
            mode: "privileged",
            modeLabel: "Switch>",
            commands: [
              { cmd: "enable\nconfigure terminal\nhostname ISP-SW\nno ip domain-lookup", explanation: "Üblicher Einstieg." },
            ],
          },
          {
            device: "ISP-SW",
            mode: "config-if",
            modeLabel: "Interface-Modus",
            commands: [
              { cmd: "vlan 99", explanation: "VLAN 99 anlegen — gehört zu CO-1." },
              { cmd: "vlan 199", explanation: "VLAN 199 anlegen — gehört zu CO-2." },
              { cmd: "interface ethernet 0/0", explanation: "Port in Richtung CO-1." },
              { cmd: "switchport mode access", explanation: "Access-Port — kein Trunk-Tag nötig." },
              { cmd: "switchport access vlan 99", explanation: "CO-1-Verkehr wird in VLAN 99 eingeordnet." },
              { cmd: "interface ethernet 0/1", explanation: "Port in Richtung CO-2." },
              { cmd: "switchport mode access", explanation: "Access-Port." },
              { cmd: "switchport access vlan 199", explanation: "CO-2-Verkehr wird in VLAN 199 eingeordnet." },
              { cmd: "interface ethernet 0/2", explanation: "Trunk-Port in Richtung ISP-MUMBAI — muss beide VLANs tragen." },
              { cmd: "switchport mode trunk", explanation: "802.1Q-Trunk aktivieren." },
              { cmd: "end\ncopy running-config startup-config", explanation: "Speichern." },
            ],
          },
          {
            device: "ISP-MUMBAI",
            mode: "privileged",
            modeLabel: "Router>",
            commands: [
              { cmd: "enable\nconfigure terminal\nhostname ISP-MUMBAI\nno ip domain-lookup", explanation: "Üblicher Einstieg." },
            ],
          },
          {
            device: "ISP-MUMBAI",
            mode: "config-if",
            modeLabel: "Interface-Modus",
            commands: [
              { cmd: "interface ethernet 0/0", explanation: "Physical interface — kein IP, nur 'no shutdown'. Sub-Interfaces übernehmen die Adressierung." },
              { cmd: "no ip address", explanation: "Kein IP auf dem Physical Interface." },
              { cmd: "no shutdown", explanation: "Physical Interface muss aktiv sein, damit Sub-Interfaces funktionieren." },
              { cmd: "interface ethernet 0/0.99", explanation: "Sub-Interface für CO-1 (VLAN 99)." },
              { cmd: "encapsulation dot1q 99", explanation: "802.1Q-Tag für VLAN 99 — ISP-MUMBAI akzeptiert Frames mit diesem Tag." },
              { cmd: "ip address 20.30.10.20 255.255.255.0", explanation: "IP auf der CO-1-Seite. CO-1 hat .10 — beide im selben /24, direkt erreichbar." },
              { cmd: "interface ethernet 0/0.199", explanation: "Sub-Interface für CO-2 (VLAN 199)." },
              { cmd: "encapsulation dot1q 199", explanation: "802.1Q-Tag für VLAN 199." },
              { cmd: "ip address 45.35.55.75 255.255.255.0", explanation: "IP auf der CO-2-Seite. CO-2 hat .65 — gleiche /24." },
              { cmd: "interface ethernet 0/1", explanation: "Internet-facing Interface." },
              { cmd: "ip address 200.10.20.1 255.255.255.0", explanation: "Gateway für das Internet-Segment (WEB-1, WEB-2, SERVER-1, USER_PC)." },
              { cmd: "no shutdown", explanation: "Internet-Interface aktivieren." },
            ],
          },
        ],
      },

      // ─── Schritt 1b: Endgeräte ─────────────────────────────────
      {
        title: "Endgeräte adressieren — CO-1-LAN, CO-2-LAN, Internet-Zone",
        blocks: [
          {
            device: "VPC-9 / VPC-10 / VPC-11",
            mode: "desktop",
            modeLabel: "Desktop > IP Configuration",
            commands: [
              { cmd: "VPC-9:  192.168.10.1 / 255.255.255.0 / GW 192.168.10.254\nVPC-10: 192.168.10.2 / 255.255.255.0 / GW 192.168.10.254\nVPC-11: 192.168.10.3 / 255.255.255.0 / GW 192.168.10.254", explanation: "Drei Standard-Hosts im CO-1-LAN, Gateway = CO-1 ETH0/0." },
            ],
          },
          {
            device: "R-PC",
            mode: "desktop",
            modeLabel: "Desktop > IP Configuration",
            commands: [
              { cmd: "IP Address: 192.168.10.100\nSubnet Mask: 255.255.255.0\nDefault Gateway: 192.168.10.254", explanation: "Management-Station im CO-1-LAN — bekommt in den ACLs unten gezielte SSH/Telnet/HTTP/HTTPS-Rechte." },
            ],
          },
          {
            device: "VPC-12 / VPC-13 / VPC-14",
            mode: "desktop",
            modeLabel: "Desktop > IP Configuration",
            commands: [
              { cmd: "VPC-12: 172.16.10.1 / 255.255.255.0 / GW 172.16.10.254\nVPC-13: 172.16.10.2 / 255.255.255.0 / GW 172.16.10.254\nVPC-14: 172.16.10.3 / 255.255.255.0 / GW 172.16.10.254", explanation: "Drei Standard-Hosts im CO-2-LAN, Gateway = CO-2 ETH0/0." },
            ],
          },
          {
            device: "INT_SRV",
            mode: "desktop",
            modeLabel: "Desktop > IP Configuration",
            commands: [
              { cmd: "IP Address: 172.16.10.100\nSubnet Mask: 255.255.255.0\nDefault Gateway: 172.16.10.254", explanation: "Interner Server im CO-2-LAN — via Static NAT als 45.35.55.100 im Internet erreichbar." },
            ],
          },
          {
            device: "DNS_SERVER / WEB-1 / WEB-2 / SERVER-1 / USER_PC",
            mode: "desktop",
            modeLabel: "Desktop > IP Configuration",
            commands: [
              { cmd: "DNS_SERVER: 200.10.20.10 / 255.255.255.0 / GW 200.10.20.1\nWEB-1:      200.10.20.20 / 255.255.255.0 / GW 200.10.20.1\nWEB-2:      200.10.20.30 / 255.255.255.0 / GW 200.10.20.1\nSERVER-1:   200.10.20.40 / 255.255.255.0 / GW 200.10.20.1\nUSER_PC:    200.10.20.50 / 255.255.255.0 / GW 200.10.20.1", explanation: "Fünf öffentliche Hosts im Internet-Segment, alle mit Gateway ISP-MUMBAI ETH0/1." },
            ],
          },
        ],
      },

      // ─── Schritt 2: Routing ───────────────────────────────────
      {
        title: "Routing konfigurieren — EIGRP, OSPF und Redistribution",
        blocks: [
          {
            device: "CO-1",
            mode: "config-router",
            modeLabel: "Router-Modus",
            commands: [
              { cmd: "router eigrp 199", explanation: "EIGRP Autonomous System 199 — muss auf CO-1 und ISP-MUMBAI identisch sein." },
              { cmd: "network 192.168.10.0 0.0.0.255", explanation: "CO-1-LAN in EIGRP einbinden — wird zu ISP-MUMBAI propagiert." },
              { cmd: "network 20.30.10.0 0.0.0.255", explanation: "WAN-Link in EIGRP einbinden — Nachbarschaft mit ISP-MUMBAI ETH0/0.99." },
              { cmd: "no auto-summary", explanation: "Classless-Routing aktivieren — wichtig für korrekte Subnetz-Propagierung." },
            ],
          },
          {
            device: "CO-2",
            mode: "config-router",
            modeLabel: "Router-Modus",
            commands: [
              { cmd: "router ospf 100", explanation: "OSPF Process ID 100." },
              { cmd: "network 172.16.10.0 0.0.0.255 area 1", explanation: "CO-2-LAN in OSPF Area 1 einbinden." },
              { cmd: "network 45.35.55.0 0.0.0.255 area 1", explanation: "WAN-Link in OSPF Area 1 — Nachbarschaft mit ISP-MUMBAI ETH0/0.199." },
            ],
          },
          {
            device: "ISP-MUMBAI",
            mode: "config-router",
            modeLabel: "Router-Modus",
            commands: [
              { cmd: "router eigrp 199", explanation: "EIGRP AS 199 auf ISP-MUMBAI — Nachbarschaft mit CO-1." },
              { cmd: "network 20.30.10.0 0.0.0.255", explanation: "Sub-Interface .99 einbinden." },
              { cmd: "redistribute ospf 100 metric 10000 1 255 1 1500", explanation: "OSPF-Routen (CO-2-Netz) in EIGRP einstreuen: Bandwidth=10000, Delay=1, Reliability=255, Load=1, MTU=1500." },
              { cmd: "no auto-summary", explanation: "Classless." },
              { cmd: "router ospf 100", explanation: "OSPF Process 100 auf ISP-MUMBAI — Nachbarschaft mit CO-2." },
              { cmd: "network 45.35.55.0 0.0.0.255 area 1", explanation: "Sub-Interface .199 einbinden." },
              { cmd: "network 200.10.20.0 0.0.0.255 area 1", explanation: "Internet-Segment in OSPF propagieren, damit CO-2 die Routen lernt." },
              { cmd: "redistribute eigrp 199 subnets", explanation: "EIGRP-Routen (CO-1-Netz) in OSPF einstreuen — CO-2 lernt CO-1-Netz." },
              { cmd: "ip route 0.0.0.0 0.0.0.0 null0", explanation: "Default-Route auf ISP-MUMBAI erzwingen — wird über Redistribution zu CO-1 und CO-2 gesendet." },
              { cmd: "end\ncopy running-config startup-config", explanation: "Speichern. CO-1/CO-2/ISP-SW werden nach ihren jeweils letzten Konfigurationsschritten ebenso gespeichert." },
            ],
          },
        ],
      },

      // ─── Schritt 3: CO-1 Static NAT ──────────────────────────
      {
        title: "CO-1: Static NAT — 4 feste 1:1-Zuordnungen",
        blocks: [
          {
            device: "CO-1",
            mode: "config",
            modeLabel: "Global Config",
            commands: [
              { cmd: "ip nat inside source static 192.168.10.1 20.30.10.1", explanation: "VPC-9 (.1) bekommt die feste öffentliche IP 20.30.10.1. Diese Zuordnung gilt dauerhaft — auch ohne aktive Verbindung." },
              { cmd: "ip nat inside source static 192.168.10.2 20.30.10.2", explanation: "VPC-10 (.2) → 20.30.10.2." },
              { cmd: "ip nat inside source static 192.168.10.3 20.30.10.3", explanation: "VPC-11 (.3) → 20.30.10.3." },
              { cmd: "ip nat inside source static 192.168.10.100 20.30.10.100", explanation: "R-PC (.100) → 20.30.10.100. R-PC ist die Management-Station — bekommt die .100 als public IP." },
            ],
          },
          {
            device: "CO-1",
            mode: "config-if",
            modeLabel: "Interface-Modus",
            commands: [
              { cmd: "interface ethernet 0/0", explanation: "LAN-Interface." },
              { cmd: "ip nat inside", explanation: "Markiert ETH0/0 als 'inside' — Quell-IPs ausgehender Pakete werden übersetzt." },
              { cmd: "interface ethernet 0/1", explanation: "WAN-Interface." },
              { cmd: "ip nat outside", explanation: "Markiert ETH0/1 als 'outside' — Ziel-IPs eingehender Pakete werden zurückübersetzt." },
            ],
          },
        ],
      },

      // ─── Schritt 4: CO-1 ACL in-out ──────────────────────────
      {
        title: "CO-1: ACL \"in-out\" — was darf das LAN nach außen senden?",
        blocks: [
          {
            device: "CO-1",
            mode: "config",
            modeLabel: "Global Config",
            commands: [
              { cmd: "ip access-list extended in-out", explanation: "Named Extended ACL 'in-out' — wird auf ETH0/0 inbound angewendet (Pakete vom LAN Richtung Internet). Die ACL sieht hier noch die PRIVATEN Source-IPs (192.168.10.x), weil NAT erst nach der Inbound-ACL-Prüfung auf ETH0/0 erfolgt." },
              { cmd: " permit icmp 192.168.10.0 0.0.0.255 host 200.10.20.20 echo", explanation: "Gesamtes CO-1-LAN darf WEB-1 (200.10.20.20) anpingen. 'echo' = nur ICMP-Requests erlaubt (nicht echo-reply — die werden in out-in behandelt)." },
              { cmd: " permit icmp 192.168.10.0 0.0.0.255 host 200.10.20.30 echo", explanation: "Gesamtes CO-1-LAN darf WEB-2 (200.10.20.30) anpingen." },
              { cmd: " permit tcp host 192.168.10.100 host 200.10.20.20 eq 23", explanation: "R-PC darf WEB-1 per Telnet (Port 23) erreichen." },
              { cmd: " permit tcp host 192.168.10.100 host 200.10.20.20 eq 22", explanation: "R-PC darf WEB-1 per SSH (Port 22) erreichen." },
              { cmd: " permit tcp host 192.168.10.100 host 200.10.20.30 eq 23", explanation: "R-PC darf WEB-2 per Telnet erreichen." },
              { cmd: " permit tcp host 192.168.10.100 host 200.10.20.30 eq 22", explanation: "R-PC darf WEB-2 per SSH erreichen." },
              { cmd: " permit tcp host 192.168.10.100 host 200.10.20.40 eq 80", explanation: "R-PC darf SERVER-1 per HTTP erreichen." },
              { cmd: " permit tcp host 192.168.10.100 host 200.10.20.40 eq 443", explanation: "R-PC darf SERVER-1 per HTTPS erreichen. Alles andere wird implizit verworfen (deny any any)." },
            ],
          },
        ],
      },

      // ─── Schritt 5: CO-1 ACL out-in ──────────────────────────
      {
        title: "CO-1: ACL \"out-in\" — was darf von außen ins LAN kommen?",
        blocks: [
          {
            device: "CO-1",
            mode: "config",
            modeLabel: "Global Config",
            commands: [
              { cmd: "ip access-list extended out-in", explanation: "ACL 'out-in' wird auf ETH0/1 inbound angewendet (Pakete vom Internet Richtung LAN). WICHTIG: Diese ACL sieht die ÖFFENTLICHEN Ziel-IPs (20.30.10.x), weil NAT erst NACH der Inbound-ACL-Prüfung auf ETH0/1 das Ziel auf 192.168.10.x zurückübersetzt." },
              { cmd: " permit icmp host 200.10.20.20 host 20.30.10.1 echo-reply", explanation: "WEB-1 darf VPC-9's Public-IP (.1) mit ICMP echo-reply antworten — Antwort auf den ping von VPC-9." },
              { cmd: " permit icmp host 200.10.20.20 host 20.30.10.2 echo-reply", explanation: "WEB-1 antwortet VPC-10." },
              { cmd: " permit icmp host 200.10.20.20 host 20.30.10.3 echo-reply", explanation: "WEB-1 antwortet VPC-11." },
              { cmd: " permit icmp host 200.10.20.30 host 20.30.10.1 echo-reply", explanation: "WEB-2 antwortet VPC-9." },
              { cmd: " permit icmp host 200.10.20.30 host 20.30.10.2 echo-reply", explanation: "WEB-2 antwortet VPC-10." },
              { cmd: " permit icmp host 200.10.20.30 host 20.30.10.3 echo-reply", explanation: "WEB-2 antwortet VPC-11." },
              { cmd: " permit tcp host 200.10.20.20 host 20.30.10.100 ack", explanation: "WEB-1 darf TCP-Antworten (ACK-Flag gesetzt) an R-PC's Public-IP (.100) senden. 'ack' erlaubt nur bestehende Verbindungen — neue Verbindungsversuche (SYN ohne ACK) werden verworfen." },
              { cmd: " permit tcp host 200.10.20.30 host 20.30.10.100 ack", explanation: "WEB-2 darf TCP-Antworten an R-PC senden." },
              { cmd: " permit tcp host 200.10.20.40 host 20.30.10.100 ack", explanation: "SERVER-1 darf TCP-Antworten an R-PC senden." },
              { cmd: " permit eigrp any any", explanation: "EIGRP-Protokoll (IP Protokoll 88) erlauben — sonst reißt die EIGRP-Nachbarschaft mit ISP-MUMBAI ab, da EIGRP Hello-Pakete auf ETH0/1 ankommen und von der ACL geblockt würden." },
            ],
          },
        ],
      },

      // ─── Schritt 6: CO-1 ACLs anwenden ───────────────────────
      {
        title: "CO-1: ACLs auf Interfaces anwenden",
        blocks: [
          {
            device: "CO-1",
            mode: "config-if",
            modeLabel: "Interface-Modus",
            commands: [
              { cmd: "interface ethernet 0/0", explanation: "LAN-Interface." },
              { cmd: "ip access-group in-out in", explanation: "ACL 'in-out' greift auf eingehende Pakete von ETH0/0 (= vom LAN zum Router). Richtung 'in' = Pakete die in das Interface hineinkommen." },
              { cmd: "interface ethernet 0/1", explanation: "WAN-Interface." },
              { cmd: "ip access-group out-in in", explanation: "ACL 'out-in' greift auf eingehende Pakete von ETH0/1 (= vom Internet zum Router). Beide ACLs sind jeweils 'in' — d.h. der Router prüft alle ankommenden Pakete bevor er sie weiterleitet." },
              { cmd: "end\ncopy running-config startup-config", explanation: "Speichern." },
            ],
          },
        ],
      },

      // ─── Schritt 7: CO-2 Static NAT ──────────────────────────
      {
        title: "CO-2: Static NAT — 4 feste 1:1-Zuordnungen",
        blocks: [
          {
            device: "CO-2",
            mode: "config",
            modeLabel: "Global Config",
            commands: [
              { cmd: "ip nat inside source static 172.16.10.1 45.35.55.10", explanation: "VPC-12 (.1) → öffentliche IP 45.35.55.10. Beachte: CO-2 nutzt einen anderen öffentlichen IP-Bereich als CO-1 (45.35.55.x statt 20.30.10.x)." },
              { cmd: "ip nat inside source static 172.16.10.2 45.35.55.20", explanation: "VPC-13 (.2) → 45.35.55.20." },
              { cmd: "ip nat inside source static 172.16.10.3 45.35.55.30", explanation: "VPC-14 (.3) → 45.35.55.30." },
              { cmd: "ip nat inside source static 172.16.10.100 45.35.55.100", explanation: "INT_SRV (.100) → 45.35.55.100. Der interne Server ist unter dieser Public-IP erreichbar." },
            ],
          },
          {
            device: "CO-2",
            mode: "config-if",
            modeLabel: "Interface-Modus",
            commands: [
              { cmd: "interface ethernet 0/0", explanation: "LAN-Interface." },
              { cmd: "ip nat inside", explanation: "ETH0/0 = inside. Source-IPs werden übersetzt." },
              { cmd: "interface ethernet 0/1", explanation: "WAN-Interface." },
              { cmd: "ip nat outside", explanation: "ETH0/1 = outside. Destination-IPs werden zurückübersetzt." },
            ],
          },
        ],
      },

      // ─── Schritt 8: CO-2 ACL wan-lan ─────────────────────────
      {
        title: "CO-2: ACL \"wan-lan\" — was darf aus dem Internet ins LAN?",
        blocks: [
          {
            device: "CO-2",
            mode: "config",
            modeLabel: "Global Config",
            commands: [
              { cmd: "ip access-list extended wan-lan", explanation: "ACL 'wan-lan' wird auf ETH0/1 inbound angewendet (Pakete vom Internet). Wie bei CO-1: Die ACL sieht die ÖFFENTLICHEN Ziel-IPs (45.35.55.x) — NAT übersetzt erst danach." },
              { cmd: " permit icmp host 200.10.20.50 45.35.55.0 0.0.0.255 echo", explanation: "USER_PC (200.10.20.50) darf das gesamte CO-2-Public-Subnetz (45.35.55.0/24) anpingen. Wildcard 0.0.0.255 = alle 4 CO-2-Public-IPs erlaubt." },
              { cmd: " permit tcp host 200.10.20.50 host 45.35.55.100 eq 22", explanation: "USER_PC darf INT_SRV per SSH erreichen (Public-IP 45.35.55.100)." },
              { cmd: " permit tcp host 200.10.20.50 host 45.35.55.100 eq 23", explanation: "USER_PC darf INT_SRV per Telnet erreichen." },
              { cmd: " permit tcp host 200.10.20.50 host 45.35.55.100 eq 80", explanation: "USER_PC darf INT_SRV per HTTP erreichen." },
              { cmd: " permit tcp host 200.10.20.50 host 45.35.55.100 eq 443", explanation: "USER_PC darf INT_SRV per HTTPS erreichen." },
              { cmd: " permit ospf any any", explanation: "OSPF-Protokoll (IP Protokoll 89) erlauben — sonst verliert CO-2 die OSPF-Nachbarschaft mit ISP-MUMBAI." },
            ],
          },
        ],
      },

      // ─── Schritt 9: CO-2 ACL lan-wan ─────────────────────────
      {
        title: "CO-2: ACL \"lan-wan\" — was darf das LAN nach außen antworten?",
        blocks: [
          {
            device: "CO-2",
            mode: "config",
            modeLabel: "Global Config",
            commands: [
              { cmd: "ip access-list extended lan-wan", explanation: "ACL 'lan-wan' wird auf ETH0/0 inbound angewendet (Pakete vom LAN). Hier sieht die ACL die PRIVATEN Source-IPs (172.16.10.x), weil auf ETH0/0 Inbound NAT noch nicht erfolgt ist." },
              { cmd: " permit icmp 172.16.10.0 0.0.0.255 host 200.10.20.50 echo-reply", explanation: "CO-2-LAN darf USER_PC mit ICMP echo-reply antworten. Die Hosts antworten mit ihrer privaten IP — NAT übersetzt erst auf dem Weg nach außen (ETH0/1 outbound)." },
              { cmd: " permit tcp host 172.16.10.100 host 200.10.20.50 ack", explanation: "INT_SRV darf TCP-Antworten (ACK) an USER_PC senden. 'ack' = nur Antworten auf bereits bestehende Verbindungen — kein TCP-SYN von innen nach außen zu USER_PC." },
            ],
          },
        ],
      },

      // ─── Schritt 10: CO-2 ACLs anwenden ──────────────────────
      {
        title: "CO-2: ACLs auf Interfaces anwenden",
        blocks: [
          {
            device: "CO-2",
            mode: "config-if",
            modeLabel: "Interface-Modus",
            commands: [
              { cmd: "interface ethernet 0/0", explanation: "LAN-Interface." },
              { cmd: "ip access-group lan-wan in", explanation: "ACL 'lan-wan' prüft Pakete vom LAN (private IPs sichtbar)." },
              { cmd: "interface ethernet 0/1", explanation: "WAN-Interface." },
              { cmd: "ip access-group wan-lan in", explanation: "ACL 'wan-lan' prüft Pakete vom Internet (öffentliche Ziel-IPs sichtbar, da NAT noch nicht zurückübersetzt hat)." },
              { cmd: "end\ncopy running-config startup-config", explanation: "Speichern." },
            ],
          },
        ],
      },

      // ─── Schritt 10b: Abschlusstest ───────────────────────────
      {
        title: "Abschlusstest — Ende-zu-Ende von echten Endgeräten",
        blocks: [
          {
            device: "VPC-9",
            mode: "desktop",
            modeLabel: "Desktop > Command Prompt",
            commands: [
              { cmd: "ping 200.10.20.20", explanation: "VPC-9 (192.168.10.1) → WEB-1 im Internet. Erfolgreich nur wenn Static NAT (192.168.10.1 → 20.30.10.1) UND beide ACLs (in-out erlaubt ICMP, out-in erlaubt echo-reply zurück) korrekt stehen." },
            ],
          },
          {
            device: "R-PC",
            mode: "desktop",
            modeLabel: "Desktop > Command Prompt",
            commands: [
              { cmd: "ssh -l admin 200.10.20.20", explanation: "R-PC (via Static NAT 20.30.10.100) baut eine SSH-Verbindung zu WEB-1 auf — nur R-PC hat dieses Recht in der in-out-ACL, VPC-9/10/11 nicht." },
            ],
          },
          {
            device: "USER_PC",
            mode: "desktop",
            modeLabel: "Desktop > Command Prompt",
            commands: [
              { cmd: "ping 45.35.55.10\nssh -l admin 45.35.55.100", explanation: "USER_PC pingt das gesamte CO-2-Public-Subnetz und baut SSH zu INT_SRV (via Static NAT 45.35.55.100) auf — beides laut wan-lan-ACL erlaubt." },
            ],
          },
        ],
      },

      // ─── Schritt 11: Abschlusserklärung ──────────────────────
      {
        title: "Abschlusserklärung: Wie ACL und NAT zusammenspielen",
        blocks: [
          {
            device: "CO-1 / CO-2",
            mode: "info",
            modeLabel: "Verification",
            commands: [
              { cmd: "show ip nat translations", explanation: "Zeigt alle aktiven NAT-Einträge. Bei Static NAT erscheinen alle 4 Zeilen dauerhaft — auch ohne Verbindung. Bei PAT/Dynamic NAT nur wenn Verbindungen aktiv sind." },
              { cmd: "show ip access-lists", explanation: "Zeigt alle ACL-Regeln inklusive Match-Counter. Jede Zeile zeigt, wie oft sie bereits getroffen hat. Erhöhende Counter = ACL greift korrekt." },
              { cmd: "show ip nat statistics", explanation: "Überblick: Wie viele Pakete wurden übersetzt? Wie viele Inside/Outside-Interfaces? Hilft beim Debuggen ob NAT überhaupt aktiv ist." },
              { cmd: "debug ip nat", explanation: "Echtzeit-Übersetzungsprotokoll — zeigt jedes NAT-Ereignis. Nur für Debugging — mit 'undebug all' deaktivieren!" },
            ],
          },
          {
            device: "── Kernkonzept: Reihenfolge NAT ↔ ACL ──",
            mode: "info",
            modeLabel: "Theorie",
            commands: [
              {
                cmd: "Ausgehend (LAN → Internet) auf CO-1:",
                explanation:
                  "① Paket kommt auf ETH0/0 an (Inbound). " +
                  "② ACL 'in-out' wird geprüft — sieht PRIVATE Source-IP 192.168.10.x. " +
                  "③ Router leitet weiter → NAT übersetzt Source-IP: 192.168.10.x → 20.30.10.x. " +
                  "④ Paket verlässt ETH0/1 mit öffentlicher Source-IP. " +
                  "Merkregel: Auf dem Inside-Interface prüft die ACL IMMER die private IP.",
              },
              {
                cmd: "Eingehend (Internet → LAN) auf CO-1:",
                explanation:
                  "① Paket kommt auf ETH0/1 an (Inbound) — Ziel ist 20.30.10.x (die öffentliche IP). " +
                  "② ACL 'out-in' wird geprüft — sieht noch die ÖFFENTLICHE Ziel-IP 20.30.10.x. " +
                  "③ Router leitet weiter → NAT übersetzt Ziel-IP zurück: 20.30.10.x → 192.168.10.x. " +
                  "④ Paket verlässt ETH0/0 mit privater Ziel-IP. " +
                  "Merkregel: Auf dem Outside-Interface prüft die ACL die ÖFFENTLICHE IP.",
              },
              {
                cmd: "Warum 'ack' statt 'established'?",
                explanation:
                  "Cisco IOS kennt in Named Extended ACLs das Keyword 'established' (= ACK oder RST gesetzt). " +
                  "'ack' ist eine alternative Schreibweise und prüft explizit das ACK-Flag. " +
                  "Beide erlauben nur TCP-Pakete einer laufenden Verbindung — der erste SYN (ohne ACK) wird geblockt. " +
                  "Das verhindert, dass Hosts aus dem Internet neue Verbindungen initiieren können.",
              },
              {
                cmd: "Warum 'permit eigrp any any' in out-in?",
                explanation:
                  "EIGRP-Hello-Pakete kommen von ISP-MUMBAI auf ETH0/1 an. " +
                  "Ohne explizite Erlaubnis würde die ACL sie verwerfen und die EIGRP-Nachbarschaft abreißen. " +
                  "CO-2 braucht stattdessen 'permit ospf any any' in wan-lan — gleiches Prinzip für OSPF. " +
                  "Protokoll-Nummern: EIGRP = 88, OSPF = 89 (beide IP-Layer, kein TCP/UDP).",
              },
              {
                cmd: "NAT-Reihenfolge — die komplette Tabelle:",
                explanation:
                  "Inside Interface Inbound:   ACL → Routing → NAT-Translate-Source (Outbound-Seite). " +
                  "Outside Interface Inbound:  ACL → NAT-Translate-Dest (Zurückübersetzung) → Routing. " +
                  "Konsequenz: Inside-ACL sieht private IPs, Outside-ACL sieht öffentliche IPs. " +
                  "Dieses Verhalten ist bei Cisco IOS festgelegt und nicht konfigurierbar.",
              },
            ],
          },
        ],
      },
      {
        title: "Typische Fehler bei ACL + Static NAT (Dual-Site)",
        blocks: [
          {
            device: "Merke",
            mode: "info",
            modeLabel: "Häufige Fehler",
            commands: [
              { cmd: "ACL prüft die falsche IP-Seite erwartet", explanation: "Auf dem Inside-Interface sieht die ACL noch die PRIVATE IP, auf dem Outside-Interface die ÖFFENTLICHE — wird das vertauscht angenommen, matchen die permit/deny-Zeilen nie und der Traffic wird unerwartet verworfen." },
              { cmd: "permit eigrp/ospf in der Outside-ACL vergessen", explanation: "Ohne die explizite Freigabe des Routing-Protokolls (IP-Proto 88 bzw. 89) reißt die EIGRP- oder OSPF-Nachbarschaft mit ISP-MUMBAI ab, sobald die ACL aufs WAN-Interface gebunden wird." },
              { cmd: "ack statt established (oder umgekehrt) uneinheitlich verwendet", explanation: "Beide Schlüsselwörter erlauben nur TCP-Antworten auf bestehende Verbindungen — wird stattdessen aus Versehen eine offene permit-Regel ohne dieses Flag gesetzt, können auch neue Verbindungen von außen initiiert werden." },
              { cmd: "Sub-Interface-Tag auf ISP-MUMBAI vergessen", explanation: "Ohne encapsulation dot1q auf ETH0/0.99 bzw. .199 akzeptiert das Sub-Interface keine getaggten Frames vom jeweiligen VLAN — CO-1 oder CO-2 verlieren die Verbindung zum ISP, obwohl die Router-Konfiguration selbst korrekt aussieht." },
            ],
          },
        ],
      },
    ],
    verifyCommands: [
      { cmd: "ping 200.10.20.20 source 192.168.10.1", expected: "!!!!! — VPC-9 kann WEB-1 anpingen (NAT + ACL greifen)", explanation: "Von CO-1 aus mit Source-IP 192.168.10.1 — NAT übersetzt auf 20.30.10.1." },
      { cmd: "ping 200.10.20.20 source 192.168.10.100", expected: "!!!!! — R-PC kann WEB-1 anpingen", explanation: "R-PC hat auch ICMP-Berechtigung über in-out ACL." },
      { cmd: "telnet 200.10.20.20 /source-interface e0/0.100", expected: "Verbindungsaufbau — R-PC kann Telnet zu WEB-1", explanation: "Port 23 ist in in-out für host 192.168.10.100 erlaubt." },
      { cmd: "show ip nat translations", expected: "Static NAT-Einträge für .1/.2/.3/.100 auf beiden Routern", explanation: "Alle 8 Static-NAT-Einträge müssen sichtbar sein (je 4 pro Router)." },
      { cmd: "show ip access-lists in-out", expected: "Match-Counter > 0 nach ping-Tests", explanation: "Jede getroffene Regel erhöht ihren Zähler." },
      { cmd: "ping 45.35.55.10 source 200.10.20.50", expected: "!!!!! — USER_PC kann CO-2-LAN anpingen", explanation: "wan-lan ACL erlaubt ICMP von USER_PC zum gesamten 45.35.55.0/24." },
    ],
    glossary: [
      { term: "Inside Local", def: "Die private IP eines Hosts im LAN (z.B. 192.168.10.1) — wie der Router das Gerät intern kennt." },
      { term: "Inside Global", def: "Die öffentliche IP nach der NAT-Übersetzung (z.B. 20.30.10.1) — wie das Internet das Gerät sieht." },
      { term: "Outside Local", def: "Die IP eines externen Hosts aus Sicht des LANs — bei Static NAT meist identisch mit Outside Global." },
      { term: "Outside Global", def: "Die echte IP des externen Hosts (z.B. 200.10.20.20 für WEB-1)." },
      { term: "ip nat inside", def: "Markiert ein Interface als 'innen' — Source-IPs ausgehender Pakete werden übersetzt." },
      { term: "ip nat outside", def: "Markiert ein Interface als 'außen' — Ziel-IPs eingehender Pakete werden zurückübersetzt." },
      { term: "echo / echo-reply", def: "ICMP-Typen: echo = Ping-Request, echo-reply = Ping-Antwort. In ACLs explizit unterscheidbar." },
      { term: "ack", def: "TCP-Flag: zeigt an, dass das Paket eine bestehende Verbindung bestätigt. Kein ack = neuer Verbindungsversuch (SYN)." },
      { term: "permit eigrp any any", def: "Erlaubt EIGRP-Protokollpakete (IP Proto 88) — nötig damit EIGRP-Nachbarschaften nicht durch die ACL unterbrochen werden." },
      { term: "Sub-Interface", def: "Logisches Interface auf einem physischen Interface mit 802.1Q-Tag — ermöglicht mehrere Netze auf einem Kabel (Router-on-a-Stick-Prinzip)." },
      { term: "Redistribution", def: "Einstreuen von Routen aus einem Routing-Protokoll in ein anderes. ISP-MUMBAI streut EIGRP-Routen in OSPF ein und umgekehrt." },
      { term: "encapsulation dot1q", def: "Aktiviert 802.1Q-Tagging auf einem Sub-Interface — der Router akzeptiert nur Frames mit dem angegebenen VLAN-Tag." },
    ],
  },
];
