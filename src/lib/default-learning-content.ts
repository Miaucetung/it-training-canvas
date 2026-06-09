// ============================================================
// Default Learning Paths, Quizzes & Lab Scenarios
// Content sourced from azure-learning-app, md102-learning-app,
// linux-lpic-learning & homelab-academy
// ============================================================

import type { LearningPath, Quiz } from "./types";
import { CCNA_QUIZZES } from "./ccna-quiz-content";

// ────────────────────────────────────────────────────────────
// Helper: Generate unique IDs
// ────────────────────────────────────────────────────────────
let _idCounter = 0;
const uid = (prefix: string) => `${prefix}-${++_idCounter}`;

// ────────────────────────────────────────────────────────────
// QUIZZES
// ────────────────────────────────────────────────────────────

export const DEFAULT_QUIZZES: Record<string, Quiz> = {
  // ── FISI: Netzwerk-Grundlagen Quiz ──────────────────────
  "quiz-fisi-netzwerk-grundlagen": {
    id: "quiz-fisi-netzwerk-grundlagen",
    title: "Netzwerk-Grundlagen",
    description:
      "Grundlegende Netzwerkkonzepte für Fachinformatiker Systemintegration",
    passingScore: 70,
    shuffleQuestions: true,
    questions: [
      {
        id: "q-fisi-net-1",
        type: "single-choice",
        text: "Welches Gerät arbeitet auf Schicht 3 (Network Layer) des OSI-Modells und leitet Pakete zwischen verschiedenen Netzwerken weiter?",
        explanation:
          "Ein Router arbeitet auf Schicht 3 (Vermittlungsschicht) des OSI-Modells. Er verwendet IP-Adressen, um Pakete zwischen verschiedenen Netzwerken weiterzuleiten.",
        points: 10,
        answers: [
          { id: "a1", text: "Switch", isCorrect: false },
          { id: "a2", text: "Router", isCorrect: true },
          { id: "a3", text: "Hub", isCorrect: false },
          { id: "a4", text: "Access Point", isCorrect: false },
        ],
      },
      {
        id: "q-fisi-net-2",
        type: "single-choice",
        text: "Welche Subnetzmaske gehört zu einem /24-Netzwerk?",
        explanation:
          "/24 bedeutet, dass die ersten 24 Bits für das Netzwerk reserviert sind. Das ergibt 255.255.255.0 als Subnetzmaske.",
        points: 10,
        answers: [
          { id: "a1", text: "255.255.0.0", isCorrect: false },
          { id: "a2", text: "255.255.255.0", isCorrect: true },
          { id: "a3", text: "255.255.255.128", isCorrect: false },
          { id: "a4", text: "255.0.0.0", isCorrect: false },
        ],
      },
      {
        id: "q-fisi-net-3",
        type: "multiple-choice",
        text: "Welche der folgenden sind private IP-Adressbereiche nach RFC 1918? (Mehrere Antworten möglich)",
        explanation:
          "Die drei privaten IP-Adressbereiche nach RFC 1918 sind: 10.0.0.0/8, 172.16.0.0/12 und 192.168.0.0/16.",
        points: 15,
        answers: [
          { id: "a1", text: "10.0.0.0 – 10.255.255.255", isCorrect: true },
          { id: "a2", text: "172.16.0.0 – 172.31.255.255", isCorrect: true },
          { id: "a3", text: "192.168.0.0 – 192.168.255.255", isCorrect: true },
          { id: "a4", text: "169.254.0.0 – 169.254.255.255", isCorrect: false },
        ],
      },
      {
        id: "q-fisi-net-4",
        type: "true-false",
        text: "Ein Switch arbeitet auf Schicht 2 (Data Link Layer) und verwendet MAC-Adressen zur Weiterleitung von Frames.",
        explanation:
          "Richtig! Ein Switch arbeitet auf Layer 2 und leitet Ethernet-Frames anhand der MAC-Adresse an den korrekten Port weiter.",
        points: 5,
        answers: [
          { id: "a1", text: "Wahr", isCorrect: true },
          { id: "a2", text: "Falsch", isCorrect: false },
        ],
      },
      {
        id: "q-fisi-net-5",
        type: "single-choice",
        text: "Welches Protokoll wird verwendet, um eine IP-Adresse automatisch einem Gerät zuzuweisen?",
        explanation:
          "DHCP (Dynamic Host Configuration Protocol) weist Geräten automatisch IP-Adressen, Subnetzmasken, Gateways und DNS-Server zu.",
        points: 10,
        answers: [
          { id: "a1", text: "DNS", isCorrect: false },
          { id: "a2", text: "ARP", isCorrect: false },
          { id: "a3", text: "DHCP", isCorrect: true },
          { id: "a4", text: "ICMP", isCorrect: false },
        ],
      },
      {
        id: "q-fisi-net-6",
        type: "text-input",
        text: "Welcher Standardport wird für HTTPS verwendet? (Nur die Zahl eingeben)",
        explanation:
          "HTTPS verwendet standardmäßig Port 443. HTTP verwendet Port 80.",
        points: 10,
        answers: [{ id: "a1", text: "443", isCorrect: true }],
      },
    ],
  },

  // ── Azure: Cloud-Grundlagen Quiz (AZ-900) ──────────────
  "quiz-azure-grundlagen": {
    id: "quiz-azure-grundlagen",
    title: "Azure Cloud-Grundlagen (AZ-900)",
    description:
      "Cloud-Computing-Modelle, Bereitstellungsmodelle und Azure-Grundkonzepte",
    passingScore: 70,
    shuffleQuestions: true,
    questions: [
      {
        id: "q-az-1",
        type: "single-choice",
        text: "Welches Cloud-Servicemodell bietet die meiste Kontrolle über die Infrastruktur, einschließlich Betriebssystem und Netzwerkkonfiguration?",
        explanation:
          "IaaS (Infrastructure as a Service) bietet die meiste Kontrolle. Der Kunde verwaltet OS, Middleware und Anwendungen. Der Anbieter stellt Virtualisierung, Server, Speicher und Netzwerk bereit.",
        points: 10,
        answers: [
          { id: "a1", text: "SaaS (Software as a Service)", isCorrect: false },
          { id: "a2", text: "PaaS (Platform as a Service)", isCorrect: false },
          {
            id: "a3",
            text: "IaaS (Infrastructure as a Service)",
            isCorrect: true,
          },
          { id: "a4", text: "FaaS (Function as a Service)", isCorrect: false },
        ],
      },
      {
        id: "q-az-2",
        type: "single-choice",
        text: "Welches Azure-Bereitstellungsmodell kombiniert lokale Rechenzentren mit Cloud-Ressourcen?",
        explanation:
          "Ein Hybrid-Cloud-Modell kombiniert On-Premises-Infrastruktur mit Public Cloud. Dies ermöglicht Flexibilität und Datensouveränität.",
        points: 10,
        answers: [
          { id: "a1", text: "Public Cloud", isCorrect: false },
          { id: "a2", text: "Private Cloud", isCorrect: false },
          { id: "a3", text: "Hybrid Cloud", isCorrect: true },
          { id: "a4", text: "Community Cloud", isCorrect: false },
        ],
      },
      {
        id: "q-az-3",
        type: "multiple-choice",
        text: "Welche Vorteile bietet Cloud Computing? (Mehrere Antworten möglich)",
        explanation:
          "Cloud Computing bietet Hochverfügbarkeit, Skalierbarkeit, Elastizität und ein Pay-as-you-go-Preismodell. Dedizierte Hardware ist ein Merkmal von Private Cloud / On-Premises.",
        points: 15,
        answers: [
          { id: "a1", text: "Hochverfügbarkeit", isCorrect: true },
          { id: "a2", text: "Skalierbarkeit", isCorrect: true },
          { id: "a3", text: "Elastizität", isCorrect: true },
          {
            id: "a4",
            text: "Garantierte dedizierte Hardware",
            isCorrect: false,
          },
        ],
      },
      {
        id: "q-az-4",
        type: "true-false",
        text: "Bei PaaS (Platform as a Service) ist der Kunde für die Verwaltung des Betriebssystems verantwortlich.",
        explanation:
          "Falsch! Bei PaaS verwaltet der Cloud-Anbieter das Betriebssystem. Der Kunde ist nur für die Anwendung und Daten verantwortlich.",
        points: 5,
        answers: [
          { id: "a1", text: "Wahr", isCorrect: false },
          { id: "a2", text: "Falsch", isCorrect: true },
        ],
      },
      {
        id: "q-az-5",
        type: "single-choice",
        text: "Was ist eine Azure Region?",
        explanation:
          "Eine Azure Region ist ein geografisches Gebiet mit einem oder mehreren Rechenzentren, die über ein Netzwerk mit geringer Latenz verbunden sind.",
        points: 10,
        answers: [
          { id: "a1", text: "Ein einzelnes Rechenzentrum", isCorrect: false },
          {
            id: "a2",
            text: "Ein geografisches Gebiet mit einem oder mehreren Rechenzentren",
            isCorrect: true,
          },
          {
            id: "a3",
            text: "Ein virtuelles Netzwerk in Azure",
            isCorrect: false,
          },
          {
            id: "a4",
            text: "Eine Abteilung innerhalb von Microsoft",
            isCorrect: false,
          },
        ],
      },
      {
        id: "q-az-6",
        type: "single-choice",
        text: "Welcher Azure-Dienst wird verwendet, um virtuelle Netzwerke zu erstellen und zu verwalten?",
        explanation:
          "Azure Virtual Network (VNet) ermöglicht es, isolierte Netzwerke in Azure zu erstellen, in denen Ressourcen sicher kommunizieren können.",
        points: 10,
        answers: [
          { id: "a1", text: "Azure Load Balancer", isCorrect: false },
          { id: "a2", text: "Azure Virtual Network (VNet)", isCorrect: true },
          { id: "a3", text: "Azure DNS", isCorrect: false },
          { id: "a4", text: "Azure Firewall", isCorrect: false },
        ],
      },
    ],
  },

  // ── Linux: Grundbefehle Quiz ────────────────────────────
  "quiz-linux-grundlagen": {
    id: "quiz-linux-grundlagen",
    title: "Linux-Grundbefehle",
    description: "Grundlegende Linux-Befehle, Dateisystem und Berechtigungen",
    passingScore: 70,
    shuffleQuestions: true,
    questions: [
      {
        id: "q-lx-1",
        type: "single-choice",
        text: "Welcher Befehl zeigt die aktuell geladenen Kernelmodule an?",
        explanation:
          "Der Befehl 'lsmod' zeigt alle aktuell geladenen Kernelmodule an. Er liest die Informationen aus /proc/modules.",
        points: 10,
        answers: [
          { id: "a1", text: "modprobe", isCorrect: false },
          { id: "a2", text: "lsmod", isCorrect: true },
          { id: "a3", text: "insmod", isCorrect: false },
          { id: "a4", text: "modinfo", isCorrect: false },
        ],
      },
      {
        id: "q-lx-2",
        type: "single-choice",
        text: "Welches Systemd-Target entspricht dem SysVinit Runlevel 3 (Multi-User ohne GUI)?",
        explanation:
          "multi-user.target entspricht Runlevel 3. Es startet das System mit Netzwerk, aber ohne grafische Oberfläche.",
        points: 10,
        answers: [
          { id: "a1", text: "graphical.target", isCorrect: false },
          { id: "a2", text: "multi-user.target", isCorrect: true },
          { id: "a3", text: "rescue.target", isCorrect: false },
          { id: "a4", text: "default.target", isCorrect: false },
        ],
      },
      {
        id: "q-lx-3",
        type: "text-input",
        text: "Welche Datei muss bearbeitet werden, um ein Dateisystem beim Boot automatisch zu mounten? (Vollständiger Pfad)",
        explanation:
          "Die Datei /etc/fstab (File System Table) enthält alle Dateisysteme, die beim Systemstart automatisch gemountet werden.",
        points: 10,
        answers: [{ id: "a1", text: "/etc/fstab", isCorrect: true }],
      },
      {
        id: "q-lx-4",
        type: "single-choice",
        text: "Welches Partitionsschema unterstützt Festplatten größer als 2 TB?",
        explanation:
          "GPT (GUID Partition Table) unterstützt Festplatten bis 9,4 ZB und bis zu 128 Partitionen. MBR ist auf 2 TB und 4 primäre Partitionen begrenzt.",
        points: 10,
        answers: [
          { id: "a1", text: "MBR", isCorrect: false },
          { id: "a2", text: "GPT", isCorrect: true },
          { id: "a3", text: "EXT4", isCorrect: false },
          { id: "a4", text: "NTFS", isCorrect: false },
        ],
      },
      {
        id: "q-lx-5",
        type: "multiple-choice",
        text: "Welche Befehle können verwendet werden, um Dateien zu suchen? (Mehrere Antworten)",
        explanation:
          "'find' durchsucht das Dateisystem in Echtzeit. 'locate' nutzt eine Datenbank (updatedb). 'which' findet ausführbare Dateien im PATH.",
        points: 15,
        answers: [
          { id: "a1", text: "find", isCorrect: true },
          { id: "a2", text: "locate", isCorrect: true },
          { id: "a3", text: "which", isCorrect: true },
          { id: "a4", text: "search", isCorrect: false },
        ],
      },
      {
        id: "q-lx-6",
        type: "single-choice",
        text: "Was bewirkt der Befehl 'chmod 755 script.sh'?",
        explanation:
          "755 = rwxr-xr-x. Der Besitzer hat alle Rechte (7=rwx), Gruppe und Andere haben Lese- und Ausführungsrechte (5=r-x).",
        points: 10,
        answers: [
          {
            id: "a1",
            text: "Nur der Besitzer kann die Datei lesen",
            isCorrect: false,
          },
          {
            id: "a2",
            text: "Alle können lesen und ausführen, nur Besitzer kann schreiben",
            isCorrect: true,
          },
          {
            id: "a3",
            text: "Niemand kann die Datei ausführen",
            isCorrect: false,
          },
          { id: "a4", text: "Alle haben volle Rechte", isCorrect: false },
        ],
      },
    ],
  },

  // ── Docker: Container-Grundlagen Quiz ───────────────────
  "quiz-docker-grundlagen": {
    id: "quiz-docker-grundlagen",
    title: "Docker Container-Grundlagen",
    description: "Docker-Konzepte, Befehle und Container-Management",
    passingScore: 70,
    shuffleQuestions: true,
    questions: [
      {
        id: "q-dk-1",
        type: "single-choice",
        text: "Was ist der Unterschied zwischen einem Docker Image und einem Docker Container?",
        explanation:
          "Ein Image ist eine unveränderliche Vorlage (Template). Ein Container ist eine laufende Instanz eines Images. Aus einem Image können beliebig viele Container erstellt werden.",
        points: 10,
        answers: [
          { id: "a1", text: "Es gibt keinen Unterschied", isCorrect: false },
          {
            id: "a2",
            text: "Ein Image ist die Vorlage, ein Container ist die laufende Instanz",
            isCorrect: true,
          },
          {
            id: "a3",
            text: "Ein Container ist die Vorlage, ein Image ist die laufende Instanz",
            isCorrect: false,
          },
          {
            id: "a4",
            text: "Images laufen nur in der Cloud, Container nur lokal",
            isCorrect: false,
          },
        ],
      },
      {
        id: "q-dk-2",
        type: "text-input",
        text: "Mit welchem Befehl listet man alle laufenden Docker-Container auf? (docker ...)",
        explanation:
          "'docker ps' zeigt alle laufenden Container. Mit 'docker ps -a' werden auch gestoppte Container angezeigt.",
        points: 10,
        answers: [{ id: "a1", text: "docker ps", isCorrect: true }],
      },
      {
        id: "q-dk-3",
        type: "single-choice",
        text: "Welche Datei definiert die Schritte zum Erstellen eines Docker Images?",
        explanation:
          "Ein Dockerfile enthält die Anweisungen (FROM, RUN, COPY, CMD, etc.) zum Erstellen eines Docker Images.",
        points: 10,
        answers: [
          { id: "a1", text: "docker-compose.yml", isCorrect: false },
          { id: "a2", text: "Dockerfile", isCorrect: true },
          { id: "a3", text: "container.json", isCorrect: false },
          { id: "a4", text: ".dockerignore", isCorrect: false },
        ],
      },
      {
        id: "q-dk-4",
        type: "multiple-choice",
        text: "Welche Docker-Netzwerktypen gibt es standardmäßig? (Mehrere Antworten)",
        explanation:
          "Docker bietet standardmäßig die Netzwerke bridge, host und none. Overlay ist für Docker Swarm/Multi-Host verfügbar.",
        points: 15,
        answers: [
          { id: "a1", text: "bridge", isCorrect: true },
          { id: "a2", text: "host", isCorrect: true },
          { id: "a3", text: "none", isCorrect: true },
          { id: "a4", text: "mesh", isCorrect: false },
        ],
      },
      {
        id: "q-dk-5",
        type: "true-false",
        text: "Docker-Volumes überleben das Löschen eines Containers und sind der empfohlene Weg für persistente Daten.",
        explanation:
          "Richtig! Volumes werden außerhalb des Container-Dateisystems gespeichert und bleiben bestehen, auch wenn der Container gelöscht wird.",
        points: 5,
        answers: [
          { id: "a1", text: "Wahr", isCorrect: true },
          { id: "a2", text: "Falsch", isCorrect: false },
        ],
      },
    ],
  },

  // ── Kubernetes: Grundlagen Quiz ─────────────────────────
  "quiz-k8s-grundlagen": {
    id: "quiz-k8s-grundlagen",
    title: "Kubernetes-Grundlagen",
    description: "Kubernetes-Architektur, Pods, Services und Deployments",
    passingScore: 70,
    shuffleQuestions: true,
    questions: [
      {
        id: "q-k8s-1",
        type: "single-choice",
        text: "Was ist die kleinste deploybare Einheit in Kubernetes?",
        explanation:
          "Ein Pod ist die kleinste Einheit in Kubernetes. Er enthält einen oder mehrere Container, die sich Netzwerk und Speicher teilen.",
        points: 10,
        answers: [
          { id: "a1", text: "Container", isCorrect: false },
          { id: "a2", text: "Pod", isCorrect: true },
          { id: "a3", text: "Deployment", isCorrect: false },
          { id: "a4", text: "Node", isCorrect: false },
        ],
      },
      {
        id: "q-k8s-2",
        type: "single-choice",
        text: "Welche Kubernetes-Komponente verteilt Pods auf Worker Nodes?",
        explanation:
          "Der kube-scheduler ist verantwortlich für die Zuweisung neuer Pods zu geeigneten Worker Nodes basierend auf Ressourcen, Affinität und Constraints.",
        points: 10,
        answers: [
          { id: "a1", text: "kube-proxy", isCorrect: false },
          { id: "a2", text: "kubelet", isCorrect: false },
          { id: "a3", text: "kube-scheduler", isCorrect: true },
          { id: "a4", text: "etcd", isCorrect: false },
        ],
      },
      {
        id: "q-k8s-3",
        type: "text-input",
        text: "Mit welchem kubectl-Befehl listet man alle Pods im Namespace 'default'? (kubectl ...)",
        explanation:
          "'kubectl get pods' listet alle Pods im aktuellen/default Namespace. Mit '-n <namespace>' kann man andere Namespaces angeben.",
        points: 10,
        answers: [{ id: "a1", text: "kubectl get pods", isCorrect: true }],
      },
      {
        id: "q-k8s-4",
        type: "single-choice",
        text: "Was macht ein Kubernetes Service vom Typ 'ClusterIP'?",
        explanation:
          "ClusterIP ist der Standard-Service-Typ. Er macht den Service nur innerhalb des Clusters erreichbar über eine interne virtuelle IP-Adresse.",
        points: 10,
        answers: [
          {
            id: "a1",
            text: "Macht den Service über das Internet erreichbar",
            isCorrect: false,
          },
          {
            id: "a2",
            text: "Macht den Service nur innerhalb des Clusters erreichbar",
            isCorrect: true,
          },
          {
            id: "a3",
            text: "Bindet den Service an einen bestimmten Node-Port",
            isCorrect: false,
          },
          {
            id: "a4",
            text: "Erstellt einen externen Load Balancer",
            isCorrect: false,
          },
        ],
      },
      {
        id: "q-k8s-5",
        type: "true-false",
        text: "Ein Kubernetes Deployment sorgt automatisch dafür, dass eine gewünschte Anzahl von Pod-Replicas immer läuft.",
        explanation:
          "Richtig! Ein Deployment verwaltet ReplicaSets und stellt sicher, dass die gewünschte Anzahl an Pods (replicas) immer verfügbar ist. Fällt ein Pod aus, wird automatisch ein neuer erstellt.",
        points: 5,
        answers: [
          { id: "a1", text: "Wahr", isCorrect: true },
          { id: "a2", text: "Falsch", isCorrect: false },
        ],
      },
    ],
  },

  // ── Security: IT-Sicherheit Quiz ────────────────────────
  "quiz-security-grundlagen": {
    id: "quiz-security-grundlagen",
    title: "IT-Sicherheit Grundlagen",
    description: "Firewall-Konzepte, Verschlüsselung und Sicherheitsmaßnahmen",
    passingScore: 70,
    shuffleQuestions: true,
    questions: [
      {
        id: "q-sec-1",
        type: "single-choice",
        text: "Welcher Firewall-Typ untersucht den Zustand einer Verbindung und lässt nur gültige Pakete durch?",
        explanation:
          "Eine Stateful Firewall verfolgt den Zustand jeder Netzwerkverbindung und entscheidet anhand des Verbindungskontexts, ob ein Paket zugelassen wird.",
        points: 10,
        answers: [
          { id: "a1", text: "Paketfilter (Stateless)", isCorrect: false },
          { id: "a2", text: "Stateful Inspection Firewall", isCorrect: true },
          { id: "a3", text: "Proxy Firewall", isCorrect: false },
          {
            id: "a4",
            text: "WAF (Web Application Firewall)",
            isCorrect: false,
          },
        ],
      },
      {
        id: "q-sec-2",
        type: "multiple-choice",
        text: "Welche Maßnahmen gehören zur Defense-in-Depth-Strategie? (Mehrere Antworten)",
        explanation:
          "Defense in Depth nutzt mehrere Sicherheitsebenen: Firewall (Netzwerk), IDS (Überwachung), Verschlüsselung (Daten). Ein einzelnes Passwort allein ist KEINE Schichtstrategie.",
        points: 15,
        answers: [
          { id: "a1", text: "Firewall", isCorrect: true },
          {
            id: "a2",
            text: "Intrusion Detection System (IDS)",
            isCorrect: true,
          },
          { id: "a3", text: "Verschlüsselung", isCorrect: true },
          {
            id: "a4",
            text: "Nur ein einziges starkes Passwort für alles",
            isCorrect: false,
          },
        ],
      },
      {
        id: "q-sec-3",
        type: "single-choice",
        text: "Was ist der Zweck einer DMZ (Demilitarized Zone) in einem Netzwerk?",
        explanation:
          "Eine DMZ ist ein Netzwerksegment zwischen dem internen Netz und dem Internet, in dem öffentlich zugängliche Dienste (Webserver, Mail) isoliert betrieben werden.",
        points: 10,
        answers: [
          {
            id: "a1",
            text: "Backup-Speicher für sensible Daten",
            isCorrect: false,
          },
          {
            id: "a2",
            text: "Isoliertes Segment für öffentlich erreichbare Dienste",
            isCorrect: true,
          },
          {
            id: "a3",
            text: "VPN-Tunnel zwischen Standorten",
            isCorrect: false,
          },
          { id: "a4", text: "Verschlüsselter DNS-Server", isCorrect: false },
        ],
      },
      {
        id: "q-sec-4",
        type: "true-false",
        text: "HTTPS verwendet TLS/SSL zur Verschlüsselung und stellt sicher, dass Daten zwischen Client und Server nicht abgehört werden können.",
        explanation:
          "Richtig! HTTPS nutzt TLS (Transport Layer Security) für Verschlüsselung, Authentifizierung und Datenintegrität.",
        points: 5,
        answers: [
          { id: "a1", text: "Wahr", isCorrect: true },
          { id: "a2", text: "Falsch", isCorrect: false },
        ],
      },
    ],
  },

  // ── Windows: MD-102 Intune Quiz ─────────────────────────
  "quiz-windows-intune": {
    id: "quiz-windows-intune",
    title: "Microsoft Intune & Endpoint Management",
    description:
      "Geräte-Enrollment, Compliance-Policies und Konfigurationsprofile (MD-102)",
    passingScore: 70,
    shuffleQuestions: true,
    questions: [
      {
        id: "q-win-1",
        type: "single-choice",
        text: "Was ist der Unterschied zwischen einer Compliance Policy und einem Configuration Profile in Intune?",
        explanation:
          "Eine Compliance Policy PRÜFT ob ein Gerät bestimmte Anforderungen erfüllt (z.B. 'Ist BitLocker aktiv?'). Ein Configuration Profile KONFIGURIERT das Gerät aktiv (z.B. 'BitLocker aktivieren').",
        points: 10,
        answers: [
          { id: "a1", text: "Es gibt keinen Unterschied", isCorrect: false },
          {
            id: "a2",
            text: "Compliance prüft den Zustand, Configuration ändert den Zustand",
            isCorrect: true,
          },
          {
            id: "a3",
            text: "Configuration prüft den Zustand, Compliance ändert den Zustand",
            isCorrect: false,
          },
          {
            id: "a4",
            text: "Compliance ist nur für Android, Configuration für Windows",
            isCorrect: false,
          },
        ],
      },
      {
        id: "q-win-2",
        type: "single-choice",
        text: "Welche Lizenz wird für die automatische MDM-Registrierung in Intune benötigt?",
        explanation:
          "Für die automatische MDM-Registrierung (Automatic Enrollment) wird Azure AD Premium P1 (oder höher) plus eine Intune-Lizenz benötigt.",
        points: 10,
        answers: [
          { id: "a1", text: "Microsoft 365 Basic", isCorrect: false },
          { id: "a2", text: "Azure AD Free", isCorrect: false },
          { id: "a3", text: "Azure AD Premium P1 + Intune", isCorrect: true },
          { id: "a4", text: "Windows Server CAL", isCorrect: false },
        ],
      },
      {
        id: "q-win-3",
        type: "true-false",
        text: "Windows Autopilot im Self-Deploying-Modus erfordert TPM 2.0, der User-Driven-Modus hingegen nicht.",
        explanation:
          "Richtig! TPM 2.0 ist NUR für den Self-Deploying-Modus zwingend erforderlich. Im User-Driven-Modus ist es empfohlen, aber nicht vorgeschrieben. Dies ist ein häufiger Prüfungsfallstrick!",
        points: 10,
        answers: [
          { id: "a1", text: "Wahr", isCorrect: true },
          { id: "a2", text: "Falsch", isCorrect: false },
        ],
      },
      {
        id: "q-win-4",
        type: "single-choice",
        text: "Was passiert, wenn eine Security Baseline und ein Configuration Profile die gleiche Einstellung unterschiedlich konfigurieren?",
        explanation:
          "Bei einem Konflikt zwischen Baseline und Profile entsteht ein FEHLER-Zustand – keine der beiden Einstellungen wird angewendet! Man muss den Konflikt manuell auflösen.",
        points: 15,
        answers: [
          { id: "a1", text: "Die Baseline gewinnt immer", isCorrect: false },
          { id: "a2", text: "Das Profile gewinnt immer", isCorrect: false },
          {
            id: "a3",
            text: "Es entsteht ein Konfliktstatus, keine wird angewendet",
            isCorrect: true,
          },
          {
            id: "a4",
            text: "Die zuletzt erstellte Einstellung gewinnt",
            isCorrect: false,
          },
        ],
      },
    ],
  },

  // ── Networking: Netzwerk-Diagnose Quiz ──────────────────
  "quiz-networking-diagnose": {
    id: "quiz-networking-diagnose",
    title: "Netzwerk-Diagnose & Troubleshooting",
    description: "Netzwerk-Tools, Protokolle und Fehlerbehebung",
    passingScore: 70,
    shuffleQuestions: true,
    questions: [
      {
        id: "q-net-1",
        type: "single-choice",
        text: "Welches Tool wird verwendet, um den Pfad eines Pakets durch das Netzwerk zu verfolgen?",
        explanation:
          "traceroute (Linux) bzw. tracert (Windows) zeigt jeden Hop (Router) auf dem Weg zum Ziel an, inklusive Latenzzeiten.",
        points: 10,
        answers: [
          { id: "a1", text: "ping", isCorrect: false },
          { id: "a2", text: "traceroute / tracert", isCorrect: true },
          { id: "a3", text: "nslookup", isCorrect: false },
          { id: "a4", text: "arp", isCorrect: false },
        ],
      },
      {
        id: "q-net-2",
        type: "single-choice",
        text: "Welches Protokoll löst Domainnamen in IP-Adressen auf?",
        explanation:
          "DNS (Domain Name System) übersetzt menschenlesbare Domainnamen (z.B. google.com) in IP-Adressen (z.B. 142.250.185.78).",
        points: 10,
        answers: [
          { id: "a1", text: "DHCP", isCorrect: false },
          { id: "a2", text: "ARP", isCorrect: false },
          { id: "a3", text: "DNS", isCorrect: true },
          { id: "a4", text: "NAT", isCorrect: false },
        ],
      },
      {
        id: "q-net-3",
        type: "text-input",
        text: "Welcher Befehl zeigt unter Linux alle offenen Netzwerkverbindungen und lauschenden Ports an? (modernes Tool, 2 Buchstaben)",
        explanation:
          "'ss' (Socket Statistics) ist das moderne Replacement für 'netstat'. Es zeigt TCP/UDP-Verbindungen, lauschende Ports und Socket-Statistiken.",
        points: 10,
        answers: [{ id: "a1", text: "ss", isCorrect: true }],
      },
      {
        id: "q-net-4",
        type: "single-choice",
        text: "Was bewirkt ein VLAN (Virtual LAN)?",
        explanation:
          "VLANs segmentieren ein physisches Netzwerk in logische Teilnetze auf Layer 2. Geräte in verschiedenen VLANs können nicht direkt kommunizieren (Broadcast-Domäne getrennt).",
        points: 10,
        answers: [
          {
            id: "a1",
            text: "Verschlüsselt den gesamten Netzwerkverkehr",
            isCorrect: false,
          },
          {
            id: "a2",
            text: "Segmentiert ein physisches Netzwerk in logische Teilnetze",
            isCorrect: true,
          },
          { id: "a3", text: "Erstellt einen VPN-Tunnel", isCorrect: false },
          {
            id: "a4",
            text: "Beschleunigt die Internetverbindung",
            isCorrect: false,
          },
        ],
      },
    ],
  },

  // ── AWS: Cloud-Grundlagen Quiz ──────────────────────────
  "quiz-aws-grundlagen": {
    id: "quiz-aws-grundlagen",
    title: "AWS Cloud-Grundlagen",
    description: "AWS-Services, Architektur und Best Practices",
    passingScore: 70,
    shuffleQuestions: true,
    questions: [
      {
        id: "q-aws-1",
        type: "single-choice",
        text: "Welcher AWS-Service bietet verwaltetes Container-Orchestrierung mit Kubernetes?",
        explanation:
          "Amazon EKS (Elastic Kubernetes Service) ist der verwaltete Kubernetes-Dienst von AWS. Er übernimmt die Verwaltung der Control Plane.",
        points: 10,
        answers: [
          { id: "a1", text: "Amazon ECS", isCorrect: false },
          { id: "a2", text: "Amazon EKS", isCorrect: true },
          { id: "a3", text: "AWS Lambda", isCorrect: false },
          { id: "a4", text: "AWS Fargate", isCorrect: false },
        ],
      },
      {
        id: "q-aws-2",
        type: "single-choice",
        text: "Was ist eine AWS Availability Zone?",
        explanation:
          "Eine Availability Zone ist ein oder mehrere diskrete Rechenzentren innerhalb einer AWS Region, mit redundanter Stromversorgung, Netzwerk und Konnektivität.",
        points: 10,
        answers: [
          {
            id: "a1",
            text: "Ein Land, in dem AWS verfügbar ist",
            isCorrect: false,
          },
          {
            id: "a2",
            text: "Ein oder mehrere Rechenzentren innerhalb einer Region",
            isCorrect: true,
          },
          { id: "a3", text: "Ein virtuelles Subnetz", isCorrect: false },
          { id: "a4", text: "Ein DNS-Zone-Eintrag", isCorrect: false },
        ],
      },
      {
        id: "q-aws-3",
        type: "true-false",
        text: "Amazon S3 bietet standardmäßig eine Verfügbarkeit von 99,99% und speichert Daten redundant über mindestens 3 Availability Zones.",
        explanation:
          "Richtig! S3 Standard speichert Daten automatisch über mindestens 3 AZs und bietet 99,99% Verfügbarkeit und 11 9er (99,999999999%) Haltbarkeit.",
        points: 5,
        answers: [
          { id: "a1", text: "Wahr", isCorrect: true },
          { id: "a2", text: "Falsch", isCorrect: false },
        ],
      },
      {
        id: "q-aws-4",
        type: "single-choice",
        text: "Welcher AWS-Service wird als Load Balancer für HTTP/HTTPS-Traffic auf Layer 7 eingesetzt?",
        explanation:
          "Application Load Balancer (ALB) arbeitet auf Layer 7 und kann HTTP/HTTPS-Traffic basierend auf URL-Pfaden, Hostnamen oder HTTP-Headern routen.",
        points: 10,
        answers: [
          { id: "a1", text: "Network Load Balancer (NLB)", isCorrect: false },
          {
            id: "a2",
            text: "Application Load Balancer (ALB)",
            isCorrect: true,
          },
          { id: "a3", text: "Classic Load Balancer", isCorrect: false },
          { id: "a4", text: "Gateway Load Balancer", isCorrect: false },
        ],
      },
    ],
  },

  // ── DevOps: CI/CD Quiz ──────────────────────────────────
  "quiz-devops-cicd": {
    id: "quiz-devops-cicd",
    title: "CI/CD Pipeline Grundlagen",
    description:
      "Continuous Integration, Continuous Delivery und Deployment-Strategien",
    passingScore: 70,
    shuffleQuestions: true,
    questions: [
      {
        id: "q-do-1",
        type: "single-choice",
        text: "Was ist der Hauptunterschied zwischen Continuous Delivery und Continuous Deployment?",
        explanation:
          "Bei Continuous Delivery wird automatisch bis zur Staging-Umgebung deployed, aber die Produktion erfordert manuelle Freigabe. Bei Continuous Deployment geht jede Änderung automatisch in Produktion.",
        points: 10,
        answers: [
          { id: "a1", text: "Es gibt keinen Unterschied", isCorrect: false },
          {
            id: "a2",
            text: "Delivery erfordert manuelle Produktionsfreigabe, Deployment nicht",
            isCorrect: true,
          },
          {
            id: "a3",
            text: "Delivery ist für Code, Deployment für Infrastruktur",
            isCorrect: false,
          },
          {
            id: "a4",
            text: "Deployment ist langsamer als Delivery",
            isCorrect: false,
          },
        ],
      },
      {
        id: "q-do-2",
        type: "multiple-choice",
        text: "Welche Phasen gehören typischerweise zu einer CI/CD Pipeline? (Mehrere Antworten)",
        explanation:
          "Eine CI/CD Pipeline umfasst: Build (kompilieren), Test (automatisierte Tests), und Deploy (Auslieferung). Die Kaffeepause ist leider keine offizielle Phase.",
        points: 15,
        answers: [
          { id: "a1", text: "Build", isCorrect: true },
          { id: "a2", text: "Test", isCorrect: true },
          { id: "a3", text: "Deploy", isCorrect: true },
          { id: "a4", text: "Kaffeepause", isCorrect: false },
        ],
      },
      {
        id: "q-do-3",
        type: "true-false",
        text: "Infrastructure as Code (IaC) ermöglicht es, Infrastruktur über Konfigurationsdateien zu definieren und versioniert zu verwalten.",
        explanation:
          "Richtig! IaC-Tools wie Terraform, Ansible oder Pulumi definieren Infrastruktur als Code, der versioniert, getestet und reproduzierbar deployed werden kann.",
        points: 5,
        answers: [
          { id: "a1", text: "Wahr", isCorrect: true },
          { id: "a2", text: "Falsch", isCorrect: false },
        ],
      },
    ],
  },

  // ── Database: Datenbank-Grundlagen Quiz ─────────────────
  "quiz-database-grundlagen": {
    id: "quiz-database-grundlagen",
    title: "Datenbank-Grundlagen",
    description: "SQL, NoSQL, Replikation und Backup-Strategien",
    passingScore: 70,
    shuffleQuestions: true,
    questions: [
      {
        id: "q-db-1",
        type: "single-choice",
        text: "Was ist der Hauptunterschied zwischen SQL- und NoSQL-Datenbanken?",
        explanation:
          "SQL-Datenbanken verwenden ein festes Schema mit Tabellen und Relationen. NoSQL-Datenbanken sind schemaflexibel und können Dokumente, Key-Value, Graphen oder Wide-Column speichern.",
        points: 10,
        answers: [
          { id: "a1", text: "SQL ist schneller als NoSQL", isCorrect: false },
          {
            id: "a2",
            text: "SQL hat festes Schema, NoSQL ist schemaflexibel",
            isCorrect: true,
          },
          {
            id: "a3",
            text: "NoSQL kann keine Daten speichern",
            isCorrect: false,
          },
          {
            id: "a4",
            text: "SQL ist nur für kleine Datenmengen",
            isCorrect: false,
          },
        ],
      },
      {
        id: "q-db-2",
        type: "true-false",
        text: "ACID-Eigenschaften (Atomicity, Consistency, Isolation, Durability) garantieren die Zuverlässigkeit von Datenbanktransaktionen.",
        explanation:
          "Richtig! ACID stellt sicher, dass Transaktionen atomar (ganz oder gar nicht), konsistent, isoliert und dauerhaft sind.",
        points: 5,
        answers: [
          { id: "a1", text: "Wahr", isCorrect: true },
          { id: "a2", text: "Falsch", isCorrect: false },
        ],
      },
      {
        id: "q-db-3",
        type: "single-choice",
        text: "Welche Backup-Strategie sichert nur die seit dem letzten Backup geänderten Daten?",
        explanation:
          "Ein inkrementelles Backup sichert nur die seit dem letzten (vollen oder inkrementellen) Backup geänderten Daten. Ein differentielles Backup sichert alle Änderungen seit dem letzten Voll-Backup.",
        points: 10,
        answers: [
          { id: "a1", text: "Vollbackup", isCorrect: false },
          { id: "a2", text: "Inkrementelles Backup", isCorrect: true },
          { id: "a3", text: "Differentielles Backup", isCorrect: false },
          { id: "a4", text: "Snapshot", isCorrect: false },
        ],
      },
    ],
  },

  // ── CCNA 200-301 Quiz Collection ───────────────────────────
  ...CCNA_QUIZZES,
};

// ────────────────────────────────────────────────────────────
// LEARNING PATHS
// ────────────────────────────────────────────────────────────

const NOW = Date.now();

export const DEFAULT_LEARNING_PATHS: Record<string, LearningPath> = {
  // ══════════════════════════════════════════════════════════
  // 1. FISI: Einfaches LAN aufbauen (Lab)
  // ══════════════════════════════════════════════════════════
  "lp-fisi-lan": {
    id: "lp-fisi-lan",
    title: "Lab: Einfaches LAN aufbauen",
    description:
      "Baue ein lokales Netzwerk mit Router, Switch und 3 PCs auf. Konfiguriere IP-Adressen und teste die Verbindung.",
    subject: "FISI",
    difficulty: "beginner",
    estimatedMinutes: 30,
    tags: ["LAN", "Netzwerk", "IP", "Subnetting"],
    createdAt: NOW,
    updatedAt: NOW,
    steps: [
      {
        id: "s-fisi-lan-1",
        title: "Einführung: LAN-Grundlagen",
        description:
          "Ein LAN (Local Area Network) verbindet Geräte in einem begrenzten Bereich. Die typische Topologie besteht aus einem Router (Internetzugang), einem Switch (verbindet Geräte) und Endgeräten (PCs).\n\n**Ziel:** Baue ein LAN mit 1 Router, 1 Switch und 3 PCs auf dem Canvas auf.",
        type: "info",
        order: 0,
        completed: false,
        hints: [],
      },
      {
        id: "s-fisi-lan-2",
        title: "Router platzieren und konfigurieren",
        description:
          "Platziere einen **Router** auf dem Canvas und konfiguriere seine IP-Adresse als Gateway.\n\n- IP: `192.168.1.1`\n- Subnetz: `255.255.255.0`\n- Hostname: `Router-1`",
        type: "task",
        order: 1,
        completed: false,
        hints: [
          {
            id: "h1",
            level: 1,
            text: "Wähle das Shape-Tool und suche nach 'Router' im Shape-Picker.",
            pointsDeduction: 5,
          },
          {
            id: "h2",
            level: 2,
            text: "Doppelklicke auf den Router, um die Konfiguration zu öffnen. Trage unter Netzwerk die IP 192.168.1.1 ein.",
            pointsDeduction: 10,
          },
          {
            id: "h3",
            level: 3,
            text: "Setze: IP=192.168.1.1, Subnet=255.255.255.0, Hostname=Router-1. Klicke auf Speichern.",
            pointsDeduction: 15,
          },
        ],
        validationRules: [
          {
            id: "v1",
            type: "shape-exists",
            description: "Router muss auf dem Canvas platziert sein",
            shapeType: "router",
            points: 10,
          },
          {
            id: "v2",
            type: "shape-configured",
            description: "Router-IP muss 192.168.1.1 sein",
            shapeType: "router",
            expectedConfig: { ipAddress: "192.168.1.1" },
            points: 15,
          },
        ],
      },
      {
        id: "s-fisi-lan-3",
        title: "Switch und PCs platzieren",
        description:
          "Platziere einen **Switch** und **3 Computer** auf dem Canvas.\n\nKonfiguriere die PCs:\n- PC-1: IP `192.168.1.10`, Gateway `192.168.1.1`\n- PC-2: IP `192.168.1.11`, Gateway `192.168.1.1`\n- PC-3: IP `192.168.1.12`, Gateway `192.168.1.1`",
        type: "task",
        order: 2,
        completed: false,
        hints: [
          {
            id: "h1",
            level: 1,
            text: "Suche 'Switch' und 'Computer' im Shape-Picker. Platziere sie unter dem Router.",
            pointsDeduction: 5,
          },
          {
            id: "h2",
            level: 2,
            text: "Doppelklicke jeden PC um die Konfiguration zu öffnen. Vergiss nicht das Gateway!",
            pointsDeduction: 10,
          },
          {
            id: "h3",
            level: 3,
            text: "Alle PCs benötigen Gateway 192.168.1.1 und Subnet 255.255.255.0.",
            pointsDeduction: 15,
          },
        ],
        validationRules: [
          {
            id: "v3",
            type: "shape-exists",
            description: "Switch muss platziert sein",
            shapeType: "switch",
            points: 10,
          },
          {
            id: "v4",
            type: "shape-exists",
            description: "Mindestens 3 PCs müssen platziert sein",
            shapeType: "computer",
            points: 10,
          },
        ],
      },
      {
        id: "s-fisi-lan-4",
        title: "Geräte verbinden",
        description:
          "Verbinde die Geräte mit Ethernet-Kabeln:\n\n1. Router → Switch (Port: bottom → top)\n2. Switch → PC-1\n3. Switch → PC-2\n4. Switch → PC-3\n\nVerwende das **Connection-Tool** in der Toolbar.",
        type: "task",
        order: 3,
        completed: false,
        hints: [
          {
            id: "h1",
            level: 1,
            text: "Wähle das Connection-Tool (Verbindungslinie) in der Toolbar.",
            pointsDeduction: 5,
          },
          {
            id: "h2",
            level: 2,
            text: "Klicke zuerst auf den Router, dann auf den Switch. Wiederhole für Switch→PCs.",
            pointsDeduction: 10,
          },
        ],
        validationRules: [
          {
            id: "v5",
            type: "connection-exists",
            description: "Router muss mit Switch verbunden sein",
            sourceShapeLabel: "Router",
            targetShapeLabel: "Switch",
            points: 15,
          },
        ],
      },
      {
        id: "s-fisi-lan-5",
        title: "Quiz: Netzwerk-Grundlagen",
        description:
          "Teste dein Wissen über Netzwerk-Grundlagen mit diesem Quiz.",
        type: "quiz",
        order: 4,
        completed: false,
        quizId: "quiz-fisi-netzwerk-grundlagen",
        hints: [],
      },
      {
        id: "s-fisi-lan-6",
        title: "Checkpoint: LAN-Aufbau überprüfen",
        description:
          "Abschließende Überprüfung: Alle Geräte müssen korrekt platziert, konfiguriert und verbunden sein.",
        type: "checkpoint",
        order: 5,
        completed: false,
        hints: [],
        validationRules: [
          {
            id: "v6",
            type: "shape-exists",
            description: "Router vorhanden",
            shapeType: "router",
            points: 5,
          },
          {
            id: "v7",
            type: "shape-exists",
            description: "Switch vorhanden",
            shapeType: "switch",
            points: 5,
          },
          {
            id: "v8",
            type: "shape-exists",
            description: "Computer vorhanden",
            shapeType: "computer",
            points: 5,
          },
          {
            id: "v9",
            type: "shape-configured",
            description: "Router korrekt konfiguriert",
            shapeType: "router",
            expectedConfig: { ipAddress: "192.168.1.1" },
            points: 10,
          },
        ],
      },
    ],
  },

  // ══════════════════════════════════════════════════════════
  // 2. Azure: Virtual Network aufbauen
  // ══════════════════════════════════════════════════════════
  "lp-azure-vnet": {
    id: "lp-azure-vnet",
    title: "Lab: Azure Virtual Network (VNet)",
    description:
      "Erstelle ein Azure VNet mit Subnetzen, NSG und einem Application Gateway. Lerne die Azure-Netzwerkarchitektur kennen.",
    subject: "Azure",
    difficulty: "intermediate",
    estimatedMinutes: 45,
    tags: ["Azure", "VNet", "NSG", "Cloud", "AZ-104"],
    createdAt: NOW,
    updatedAt: NOW,
    steps: [
      {
        id: "s-az-vnet-1",
        title: "Einführung: Azure Netzwerk-Grundlagen",
        description:
          "Azure Virtual Networks (VNets) ermöglichen die sichere Kommunikation zwischen Azure-Ressourcen. Jedes VNet hat Adressbereiche (z.B. 10.0.0.0/16) und kann in Subnetze unterteilt werden.\n\n**Konzepte:**\n- **VNet:** Isoliertes Netzwerk in Azure\n- **Subnet:** Teilbereich eines VNets (z.B. Frontend, Backend)\n- **NSG:** Network Security Group – Firewall-Regeln für eingehenden/ausgehenden Traffic\n- **Region:** VNets sind regionsgebunden",
        type: "info",
        order: 0,
        completed: false,
        hints: [],
      },
      {
        id: "s-az-vnet-2",
        title: "Cloud-Region und VNet platzieren",
        description:
          "Platziere eine **Cloud Region** und ein **Subnet**-Shape auf dem Canvas.\n\nDie Region repräsentiert z.B. 'West Europe'. Das Subnet ist das Frontend-Subnet.\n\n- Region-Label: `West Europe`\n- Subnet-IP: `10.0.1.0/24`",
        type: "task",
        order: 1,
        completed: false,
        hints: [
          {
            id: "h1",
            level: 1,
            text: "Suche nach 'Cloud Region' und 'Subnet' im Shape-Picker (Kategorie: Cloud).",
            pointsDeduction: 5,
          },
          {
            id: "h2",
            level: 2,
            text: "Doppelklicke die Shapes und konfiguriere Label und IP-Adressen.",
            pointsDeduction: 10,
          },
        ],
        validationRules: [
          {
            id: "v1",
            type: "shape-exists",
            description: "Cloud Region muss platziert sein",
            shapeType: "cloud-region",
            points: 10,
          },
          {
            id: "v2",
            type: "shape-exists",
            description: "Subnet muss platziert sein",
            shapeType: "subnet",
            points: 10,
          },
        ],
      },
      {
        id: "s-az-vnet-3",
        title: "Web-Server und Firewall einrichten",
        description:
          "Platziere einen **Web Server** im Frontend-Subnet und eine **Firewall** (NSG).\n\n- Web Server: IP `10.0.1.10`, Port `443`\n- Firewall: Erlaubt HTTPS (Port 443) eingehend",
        type: "task",
        order: 2,
        completed: false,
        hints: [
          {
            id: "h1",
            level: 1,
            text: "Suche 'Web Server' und 'Firewall' im Shape-Picker.",
            pointsDeduction: 5,
          },
          {
            id: "h2",
            level: 2,
            text: "Der Web Server braucht IP 10.0.1.10 und Port 443 (HTTPS).",
            pointsDeduction: 10,
          },
          {
            id: "h3",
            level: 3,
            text: "Die Firewall symbolisiert die NSG. Konfiguriere sie mit Regel: Allow HTTPS Inbound.",
            pointsDeduction: 15,
          },
        ],
        validationRules: [
          {
            id: "v3",
            type: "shape-exists",
            description: "Web Server muss platziert sein",
            shapeType: "web-server",
            points: 10,
          },
          {
            id: "v4",
            type: "shape-exists",
            description: "Firewall muss platziert sein",
            shapeType: "firewall",
            points: 10,
          },
          {
            id: "v5",
            type: "shape-configured",
            description: "Web Server korrekt konfiguriert",
            shapeType: "web-server",
            expectedConfig: { ipAddress: "10.0.1.10" },
            points: 15,
          },
        ],
      },
      {
        id: "s-az-vnet-4",
        title: "Datenbank-Server hinzufügen",
        description:
          "Füge einen **Database Server** im Backend-Subnet hinzu.\n\n- IP: `10.0.2.10`\n- Port: `3306` (MySQL)\n- Nur erreichbar vom Frontend-Subnet (nicht direkt aus dem Internet)",
        type: "task",
        order: 3,
        completed: false,
        hints: [
          {
            id: "h1",
            level: 1,
            text: "Suche 'Database Server' oder 'Database' im Shape-Picker.",
            pointsDeduction: 5,
          },
          {
            id: "h2",
            level: 2,
            text: "Konfiguriere IP 10.0.2.10, Port 3306. Verbinde Webserver → Datenbank.",
            pointsDeduction: 10,
          },
        ],
        validationRules: [
          {
            id: "v6",
            type: "shape-exists",
            description: "Database Server muss platziert sein",
            shapeType: "database-server",
            points: 10,
          },
          {
            id: "v7",
            type: "connection-exists",
            description: "Web Server muss mit Database verbunden sein",
            sourceShapeLabel: "Web Server",
            targetShapeLabel: "Database",
            points: 15,
          },
        ],
      },
      {
        id: "s-az-vnet-5",
        title: "Quiz: Azure Cloud-Grundlagen",
        description: "Teste dein Wissen über Azure-Grundlagen.",
        type: "quiz",
        order: 4,
        completed: false,
        quizId: "quiz-azure-grundlagen",
        hints: [],
      },
    ],
  },

  // ══════════════════════════════════════════════════════════
  // 3. Linux: Server-Setup & Konfiguration
  // ══════════════════════════════════════════════════════════
  "lp-linux-server": {
    id: "lp-linux-server",
    title: "Lab: Linux-Server Grundkonfiguration",
    description:
      "Richte einen Linux-Server ein: Netzwerk konfigurieren, SSH einrichten und Firewall aktivieren. Nutze das integrierte Terminal.",
    subject: "Linux",
    difficulty: "beginner",
    estimatedMinutes: 25,
    tags: ["Linux", "Server", "SSH", "Firewall", "LPIC"],
    createdAt: NOW,
    updatedAt: NOW,
    steps: [
      {
        id: "s-lx-srv-1",
        title: "Einführung: Linux-Server im Netzwerk",
        description:
          "Linux-Server bilden das Rückgrat vieler IT-Infrastrukturen. In diesem Lab lernst du:\n\n- Einen Server im Netzwerk platzieren und konfigurieren\n- Grundlegende Netzwerk-Befehle im Terminal\n- SSH-Zugang und Firewall-Grundlagen\n\n**Tipp:** Du kannst das Terminal eines Shapes öffnen, indem du es auswählst und auf 'Terminal' klickst.",
        type: "info",
        order: 0,
        completed: false,
        hints: [],
      },
      {
        id: "s-lx-srv-2",
        title: "Linux-Server platzieren",
        description:
          "Platziere einen **Server** auf dem Canvas und konfiguriere ihn:\n\n- Hostname: `web-srv-01`\n- IP: `192.168.10.10`\n- Subnetz: `255.255.255.0`\n- Gateway: `192.168.10.1`",
        type: "task",
        order: 1,
        completed: false,
        hints: [
          {
            id: "h1",
            level: 1,
            text: "Suche 'Server' im Shape-Picker.",
            pointsDeduction: 5,
          },
          {
            id: "h2",
            level: 2,
            text: "Doppelklicke den Server und trage die Netzwerkkonfiguration ein.",
            pointsDeduction: 10,
          },
        ],
        validationRules: [
          {
            id: "v1",
            type: "shape-exists",
            description: "Server muss platziert sein",
            shapeType: "server",
            points: 10,
          },
          {
            id: "v2",
            type: "shape-configured",
            description: "Server-IP muss konfiguriert sein",
            shapeType: "server",
            expectedConfig: { ipAddress: "192.168.10.10" },
            points: 15,
          },
        ],
      },
      {
        id: "s-lx-srv-3",
        title: "Netzwerk-Infrastruktur aufbauen",
        description:
          "Platziere einen **Router** (Gateway) und eine **Firewall**.\n\n- Router IP: `192.168.10.1` (Gateway)\n- Verbinde: Server → Firewall → Router",
        type: "task",
        order: 2,
        completed: false,
        hints: [
          {
            id: "h1",
            level: 1,
            text: "Platziere Router und Firewall. Der Router ist das Gateway.",
            pointsDeduction: 5,
          },
          {
            id: "h2",
            level: 2,
            text: "Verwende das Connection-Tool um Server → Firewall → Router zu verbinden.",
            pointsDeduction: 10,
          },
        ],
        validationRules: [
          {
            id: "v3",
            type: "shape-exists",
            description: "Router muss vorhanden sein",
            shapeType: "router",
            points: 10,
          },
          {
            id: "v4",
            type: "shape-exists",
            description: "Firewall muss vorhanden sein",
            shapeType: "firewall",
            points: 10,
          },
        ],
      },
      {
        id: "s-lx-srv-4",
        title: "Quiz: Linux-Grundlagen",
        description: "Teste dein Wissen über Linux-Befehle und -Konzepte.",
        type: "quiz",
        order: 3,
        completed: false,
        quizId: "quiz-linux-grundlagen",
        hints: [],
      },
    ],
  },

  // ══════════════════════════════════════════════════════════
  // 4. Docker: Container-Umgebung aufbauen
  // ══════════════════════════════════════════════════════════
  "lp-docker-basics": {
    id: "lp-docker-basics",
    title: "Lab: Docker Container-Umgebung",
    description:
      "Baue eine Container-basierte Anwendung auf: Webserver, App-Container und Datenbank mit Docker-Netzwerk.",
    subject: "Docker",
    difficulty: "intermediate",
    estimatedMinutes: 35,
    tags: ["Docker", "Container", "Networking", "Volumes"],
    createdAt: NOW,
    updatedAt: NOW,
    steps: [
      {
        id: "s-dk-1",
        title: "Einführung: Docker-Architektur",
        description:
          "Docker verwendet Container um Anwendungen isoliert zu betreiben. In diesem Lab baust du eine 3-Tier-Architektur:\n\n```\n[Nginx Reverse Proxy] → [App Container] → [Database Container]\n```\n\n**Konzepte:**\n- **Container:** Isolierte Laufzeitumgebung\n- **Image:** Unveränderliche Vorlage für Container\n- **Volume:** Persistente Datenspeicherung\n- **Network:** Virtuelle Netzwerke zwischen Containern",
        type: "info",
        order: 0,
        completed: false,
        hints: [],
      },
      {
        id: "s-dk-2",
        title: "Docker Host platzieren",
        description:
          "Platziere einen **Server** als Docker Host.\n\n- Hostname: `docker-host-01`\n- IP: `172.17.0.1` (Docker Bridge Network)",
        type: "task",
        order: 1,
        completed: false,
        hints: [
          {
            id: "h1",
            level: 1,
            text: "Suche 'Server' im Shape-Picker für den Docker Host.",
            pointsDeduction: 5,
          },
          {
            id: "h2",
            level: 2,
            text: "Konfiguriere IP 172.17.0.1 (Docker Standard-Bridge).",
            pointsDeduction: 10,
          },
        ],
        validationRules: [
          {
            id: "v1",
            type: "shape-exists",
            description: "Docker Host (Server) muss platziert sein",
            shapeType: "server",
            points: 10,
          },
        ],
      },
      {
        id: "s-dk-3",
        title: "Container-Shapes platzieren",
        description:
          "Platziere 3 **Docker Container** Shapes:\n\n1. **Nginx Proxy** – Label: `nginx-proxy`, Port: `80`\n2. **App** – Label: `app-container`, Port: `3000`\n3. **Database** – Label: `db-container`, Port: `5432` (PostgreSQL)",
        type: "task",
        order: 2,
        completed: false,
        hints: [
          {
            id: "h1",
            level: 1,
            text: "Suche 'Docker Container' oder 'Container' im Shape-Picker.",
            pointsDeduction: 5,
          },
          {
            id: "h2",
            level: 2,
            text: "Platziere 3 Container und benenne sie über Label. Konfiguriere die Ports.",
            pointsDeduction: 10,
          },
          {
            id: "h3",
            level: 3,
            text: "Container 1: nginx-proxy (Port 80), Container 2: app-container (Port 3000), Container 3: db-container (Port 5432).",
            pointsDeduction: 15,
          },
        ],
        validationRules: [
          {
            id: "v2",
            type: "shape-exists",
            description: "Docker Container müssen platziert sein",
            shapeType: "docker-container",
            points: 15,
          },
        ],
      },
      {
        id: "s-dk-4",
        title: "Container verbinden",
        description:
          "Verbinde die Container in der richtigen Reihenfolge:\n\n1. Nginx Proxy → App Container\n2. App Container → Database Container\n\nDer Proxy leitet Traffic an die App weiter, die App kommuniziert mit der Datenbank.",
        type: "task",
        order: 3,
        completed: false,
        hints: [
          {
            id: "h1",
            level: 1,
            text: "Nutze das Connection-Tool um die Container zu verbinden.",
            pointsDeduction: 5,
          },
        ],
        validationRules: [
          {
            id: "v3",
            type: "connection-exists",
            description: "Proxy muss mit App verbunden sein",
            sourceShapeLabel: "Proxy",
            targetShapeLabel: "App",
            points: 15,
          },
        ],
      },
      {
        id: "s-dk-5",
        title: "Quiz: Docker-Grundlagen",
        description: "Teste dein Wissen über Docker-Konzepte.",
        type: "quiz",
        order: 4,
        completed: false,
        quizId: "quiz-docker-grundlagen",
        hints: [],
      },
    ],
  },

  // ══════════════════════════════════════════════════════════
  // 5. Kubernetes: Cluster aufbauen
  // ══════════════════════════════════════════════════════════
  "lp-k8s-cluster": {
    id: "lp-k8s-cluster",
    title: "Lab: Kubernetes Cluster aufbauen",
    description:
      "Baue einen Kubernetes-Cluster mit Control Plane, Worker Nodes, Pods und Services auf.",
    subject: "Kubernetes",
    difficulty: "advanced",
    estimatedMinutes: 40,
    tags: ["Kubernetes", "K8s", "Cluster", "Pod", "Service"],
    createdAt: NOW,
    updatedAt: NOW,
    steps: [
      {
        id: "s-k8s-1",
        title: "Einführung: Kubernetes Architektur",
        description:
          "Ein Kubernetes-Cluster besteht aus:\n\n**Control Plane (Master):**\n- API Server – Zentrale Schnittstelle\n- etcd – Cluster-Zustandsspeicher\n- Scheduler – Pod-Zuweisung\n- Controller Manager – Soll/Ist-Abgleich\n\n**Worker Nodes:**\n- kubelet – Pod-Verwaltung\n- kube-proxy – Netzwerk-Regeln\n- Container Runtime – Container ausführen\n\n**Workloads:**\n- Pod – Kleinste Deployment-Einheit\n- Service – Stabiler Netzwerkendpunkt\n- Deployment – Deklarative Updates",
        type: "info",
        order: 0,
        completed: false,
        hints: [],
      },
      {
        id: "s-k8s-2",
        title: "Control Plane aufbauen",
        description:
          "Platziere einen **Server** als Control Plane Node.\n\n- Label: `control-plane`\n- IP: `10.0.0.10`\n- Hostname: `k8s-master`",
        type: "task",
        order: 1,
        completed: false,
        hints: [
          {
            id: "h1",
            level: 1,
            text: "Suche 'Server' im Shape-Picker für den Control-Plane-Node.",
            pointsDeduction: 5,
          },
          {
            id: "h2",
            level: 2,
            text: "Konfiguriere IP 10.0.0.10 und Label 'control-plane'.",
            pointsDeduction: 10,
          },
        ],
        validationRules: [
          {
            id: "v1",
            type: "shape-exists",
            description: "Control Plane Node muss platziert sein",
            shapeType: "server",
            points: 10,
          },
        ],
      },
      {
        id: "s-k8s-3",
        title: "Worker Nodes hinzufügen",
        description:
          "Platziere 2 **Server** als Worker Nodes und verbinde sie mit dem Control Plane.\n\n- Worker 1: IP `10.0.0.20`, Label: `worker-1`\n- Worker 2: IP `10.0.0.21`, Label: `worker-2`",
        type: "task",
        order: 2,
        completed: false,
        hints: [
          {
            id: "h1",
            level: 1,
            text: "Platziere 2 weitere Server-Shapes als Worker Nodes.",
            pointsDeduction: 5,
          },
          {
            id: "h2",
            level: 2,
            text: "Verbinde beide Worker Nodes mit dem Control Plane Node.",
            pointsDeduction: 10,
          },
        ],
        validationRules: [
          {
            id: "v2",
            type: "shape-exists",
            description: "Worker Nodes müssen platziert sein",
            shapeType: "server",
            points: 10,
          },
        ],
      },
      {
        id: "s-k8s-4",
        title: "Pods und Service deployen",
        description:
          "Platziere **Kubernetes Pods** auf den Worker Nodes und einen **Kubernetes Service** als Load Balancer.\n\n- 2-3 Kubernetes Pod Shapes\n- 1 Kubernetes Service Shape\n- Verbinde Service → Pods",
        type: "task",
        order: 3,
        completed: false,
        hints: [
          {
            id: "h1",
            level: 1,
            text: "Suche 'Kubernetes Pod' und 'Kubernetes Service' im Shape-Picker.",
            pointsDeduction: 5,
          },
          {
            id: "h2",
            level: 2,
            text: "Platziere Pods neben den Workern und den Service davor. Der Service verteilt Traffic auf die Pods.",
            pointsDeduction: 10,
          },
        ],
        validationRules: [
          {
            id: "v3",
            type: "shape-exists",
            description: "Kubernetes Pods müssen platziert sein",
            shapeType: "kubernetes-pod",
            points: 10,
          },
          {
            id: "v4",
            type: "shape-exists",
            description: "Kubernetes Service muss platziert sein",
            shapeType: "kubernetes-service",
            points: 10,
          },
        ],
      },
      {
        id: "s-k8s-5",
        title: "Quiz: Kubernetes-Grundlagen",
        description: "Teste dein Wissen über Kubernetes.",
        type: "quiz",
        order: 4,
        completed: false,
        quizId: "quiz-k8s-grundlagen",
        hints: [],
      },
    ],
  },

  // ══════════════════════════════════════════════════════════
  // 6. Security: DMZ-Netzwerk aufbauen
  // ══════════════════════════════════════════════════════════
  "lp-security-dmz": {
    id: "lp-security-dmz",
    title: "Lab: DMZ-Netzwerk aufbauen",
    description:
      "Baue ein DMZ-Netzwerk mit dualer Firewall-Architektur auf. Schütze interne Dienste vor direktem Internetzugang.",
    subject: "Security",
    difficulty: "intermediate",
    estimatedMinutes: 35,
    tags: ["Firewall", "DMZ", "Sicherheit", "Netzwerkarchitektur"],
    createdAt: NOW,
    updatedAt: NOW,
    steps: [
      {
        id: "s-sec-dmz-1",
        title: "Einführung: DMZ-Architektur",
        description:
          "Eine DMZ (Demilitarized Zone) ist ein Netzwerksegment zwischen dem internen Netzwerk und dem Internet.\n\n**Aufbau:**\n```\n[Internet] → [Äußere Firewall] → [DMZ: Webserver] → [Innere Firewall] → [Internes Netz: DB-Server]\n```\n\n**Ziel:** Öffentliche Dienste (Webserver) sind erreichbar, aber das interne Netzwerk bleibt geschützt.",
        type: "info",
        order: 0,
        completed: false,
        hints: [],
      },
      {
        id: "s-sec-dmz-2",
        title: "Internet-Gateway und äußere Firewall",
        description:
          "Platziere einen **Router** (Internet-Gateway) und eine **Firewall** (äußere Firewall).\n\n- Router: IP `203.0.113.1` (öffentliche IP)\n- Firewall: Erlaubt HTTP/HTTPS eingehend",
        type: "task",
        order: 1,
        completed: false,
        hints: [
          {
            id: "h1",
            level: 1,
            text: "Der Router repräsentiert den Internet-Zugang mit einer öffentlichen IP.",
            pointsDeduction: 5,
          },
          {
            id: "h2",
            level: 2,
            text: "Konfiguriere Router IP 203.0.113.1 und verbinde mit der Firewall.",
            pointsDeduction: 10,
          },
        ],
        validationRules: [
          {
            id: "v1",
            type: "shape-exists",
            description: "Router (Internet-Gateway) muss platziert sein",
            shapeType: "router",
            points: 10,
          },
          {
            id: "v2",
            type: "shape-exists",
            description: "Äußere Firewall muss platziert sein",
            shapeType: "firewall",
            points: 10,
          },
        ],
      },
      {
        id: "s-sec-dmz-3",
        title: "DMZ-Zone mit Webserver",
        description:
          "Platziere einen **Web Server** in der DMZ.\n\n- IP: `172.16.0.10`\n- Port: `443` (HTTPS)\n- Verbinde: Äußere Firewall → Webserver",
        type: "task",
        order: 2,
        completed: false,
        hints: [
          {
            id: "h1",
            level: 1,
            text: "Der Webserver steht in der DMZ – zwischen äußerer und innerer Firewall.",
            pointsDeduction: 5,
          },
          {
            id: "h2",
            level: 2,
            text: "Konfiguriere Web Server: IP 172.16.0.10, Port 443.",
            pointsDeduction: 10,
          },
        ],
        validationRules: [
          {
            id: "v3",
            type: "shape-exists",
            description: "Web Server muss in der DMZ platziert sein",
            shapeType: "web-server",
            points: 10,
          },
          {
            id: "v4",
            type: "shape-configured",
            description: "Web Server muss korrekt konfiguriert sein",
            shapeType: "web-server",
            expectedConfig: { ipAddress: "172.16.0.10" },
            points: 15,
          },
        ],
      },
      {
        id: "s-sec-dmz-4",
        title: "Innere Firewall und Datenbank",
        description:
          "Platziere eine zweite **Firewall** (innere Firewall) und einen **Database Server** im internen Netz.\n\n- Innere Firewall: Erlaubt nur MySQL (Port 3306) vom Webserver\n- Database: IP `10.0.0.10`, Port `3306`\n- Verbinde: Webserver → Innere Firewall → Database",
        type: "task",
        order: 3,
        completed: false,
        hints: [
          {
            id: "h1",
            level: 1,
            text: "Die innere Firewall schützt das interne Netzwerk vor der DMZ.",
            pointsDeduction: 5,
          },
          {
            id: "h2",
            level: 2,
            text: "Platziere Firewall und Database. Konfiguriere DB: IP 10.0.0.10, Port 3306.",
            pointsDeduction: 10,
          },
        ],
        validationRules: [
          {
            id: "v5",
            type: "shape-exists",
            description: "Innere Firewall muss platziert sein",
            shapeType: "firewall",
            points: 10,
          },
          {
            id: "v6",
            type: "shape-exists",
            description: "Database Server muss platziert sein",
            shapeType: "database-server",
            points: 10,
          },
        ],
      },
      {
        id: "s-sec-dmz-5",
        title: "Quiz: IT-Sicherheit",
        description: "Teste dein Wissen über IT-Sicherheitskonzepte.",
        type: "quiz",
        order: 4,
        completed: false,
        quizId: "quiz-security-grundlagen",
        hints: [],
      },
    ],
  },

  // ══════════════════════════════════════════════════════════
  // 7. AWS: 3-Tier Web-Architektur
  // ══════════════════════════════════════════════════════════
  "lp-aws-3tier": {
    id: "lp-aws-3tier",
    title: "Lab: AWS 3-Tier Architektur",
    description:
      "Baue eine hochverfügbare 3-Tier-Architektur auf AWS: Load Balancer, Application Server und Datenbank.",
    subject: "AWS",
    difficulty: "intermediate",
    estimatedMinutes: 40,
    tags: ["AWS", "ALB", "EC2", "RDS", "3-Tier"],
    createdAt: NOW,
    updatedAt: NOW,
    steps: [
      {
        id: "s-aws-1",
        title: "Einführung: AWS 3-Tier Architektur",
        description:
          "Die 3-Tier-Architektur trennt eine Anwendung in drei Schichten:\n\n1. **Presentation Tier** – Load Balancer (ALB) verteilt Traffic\n2. **Application Tier** – EC2-Instanzen verarbeiten Anfragen\n3. **Data Tier** – RDS-Datenbank speichert Daten\n\nJede Schicht lebt in einem eigenen Subnet für Isolation und Sicherheit.",
        type: "info",
        order: 0,
        completed: false,
        hints: [],
      },
      {
        id: "s-aws-2",
        title: "Load Balancer platzieren",
        description:
          "Platziere einen **Load Balancer** als Application Load Balancer (ALB).\n\n- Label: `ALB`\n- IP: `10.0.1.100`\n- Port: `443` (HTTPS)",
        type: "task",
        order: 1,
        completed: false,
        hints: [
          {
            id: "h1",
            level: 1,
            text: "Suche 'Load Balancer' im Shape-Picker (Kategorie: Netzwerk).",
            pointsDeduction: 5,
          },
          {
            id: "h2",
            level: 2,
            text: "Konfiguriere IP 10.0.1.100 und Port 443.",
            pointsDeduction: 10,
          },
        ],
        validationRules: [
          {
            id: "v1",
            type: "shape-exists",
            description: "Load Balancer muss platziert sein",
            shapeType: "loadbalancer",
            points: 10,
          },
        ],
      },
      {
        id: "s-aws-3",
        title: "Application Server einrichten",
        description:
          "Platziere 2 **Application Server** (EC2-Instanzen) hinter dem Load Balancer.\n\n- App Server 1: IP `10.0.2.10`, Port `8080`\n- App Server 2: IP `10.0.2.11`, Port `8080`\n- Verbinde: ALB → App Server 1 und ALB → App Server 2",
        type: "task",
        order: 2,
        completed: false,
        hints: [
          {
            id: "h1",
            level: 1,
            text: "Suche 'Application Server' im Shape-Picker.",
            pointsDeduction: 5,
          },
          {
            id: "h2",
            level: 2,
            text: "Platziere 2 App-Server und verbinde sie mit dem Load Balancer.",
            pointsDeduction: 10,
          },
        ],
        validationRules: [
          {
            id: "v2",
            type: "shape-exists",
            description: "Application Server müssen platziert sein",
            shapeType: "application-server",
            points: 15,
          },
          {
            id: "v3",
            type: "connection-exists",
            description: "ALB muss mit App Servern verbunden sein",
            sourceShapeLabel: "ALB",
            targetShapeLabel: "App Server",
            points: 15,
          },
        ],
      },
      {
        id: "s-aws-4",
        title: "Datenbank (RDS) hinzufügen",
        description:
          "Platziere einen **Database Server** als Amazon RDS.\n\n- IP: `10.0.3.10`\n- Port: `5432` (PostgreSQL)\n- Verbinde beide App Server mit der Datenbank",
        type: "task",
        order: 3,
        completed: false,
        hints: [
          {
            id: "h1",
            level: 1,
            text: "Suche 'Database Server' im Shape-Picker.",
            pointsDeduction: 5,
          },
          {
            id: "h2",
            level: 2,
            text: "Verbinde App Server 1 → DB und App Server 2 → DB.",
            pointsDeduction: 10,
          },
        ],
        validationRules: [
          {
            id: "v4",
            type: "shape-exists",
            description: "Database Server muss platziert sein",
            shapeType: "database-server",
            points: 10,
          },
        ],
      },
      {
        id: "s-aws-5",
        title: "Quiz: AWS Cloud-Grundlagen",
        description: "Teste dein Wissen über AWS-Services.",
        type: "quiz",
        order: 4,
        completed: false,
        quizId: "quiz-aws-grundlagen",
        hints: [],
      },
    ],
  },

  // ══════════════════════════════════════════════════════════
  // 8. Networking: VLAN-Segmentierung
  // ══════════════════════════════════════════════════════════
  "lp-networking-vlan": {
    id: "lp-networking-vlan",
    title: "Lab: VLAN-Netzwerksegmentierung",
    description:
      "Erstelle ein Netzwerk mit VLANs zur Trennung von Abteilungen. Konfiguriere Trunk- und Access-Ports.",
    subject: "Networking",
    difficulty: "intermediate",
    estimatedMinutes: 30,
    tags: ["VLAN", "Switch", "Trunk", "Segmentierung"],
    createdAt: NOW,
    updatedAt: NOW,
    steps: [
      {
        id: "s-net-vlan-1",
        title: "Einführung: VLANs",
        description:
          "VLANs (Virtual LANs) segmentieren ein physisches Netzwerk in logische Teilnetze:\n\n- **VLAN 10** – Büro (192.168.10.0/24)\n- **VLAN 20** – Server (192.168.20.0/24)\n- **VLAN 30** – Gäste (192.168.30.0/24)\n\n**Vorteile:** Sicherheit, Performance, Organisation\n\n**Trunk Port:** Überträgt Traffic mehrerer VLANs zwischen Switches\n**Access Port:** Verbindet Endgeräte mit genau einem VLAN",
        type: "info",
        order: 0,
        completed: false,
        hints: [],
      },
      {
        id: "s-net-vlan-2",
        title: "Core-Switch und Verteilung",
        description:
          "Platziere einen **Router** (Layer-3-Switch / Inter-VLAN-Routing) und 2 **Switches**.\n\n- Router: IP `192.168.1.1`\n- Switch 1: VLAN 10 (Büro) + VLAN 20 (Server)\n- Switch 2: VLAN 30 (Gäste)\n- Verbinde Router → Switch 1 (Trunk) und Router → Switch 2 (Trunk)",
        type: "task",
        order: 1,
        completed: false,
        hints: [
          {
            id: "h1",
            level: 1,
            text: "Platziere 1 Router und 2 Switches.",
            pointsDeduction: 5,
          },
          {
            id: "h2",
            level: 2,
            text: "Trunk-Verbindungen verbinden Switches mit dem Router für inter-VLAN-Routing.",
            pointsDeduction: 10,
          },
        ],
        validationRules: [
          {
            id: "v1",
            type: "shape-exists",
            description: "Router muss platziert sein",
            shapeType: "router",
            points: 10,
          },
          {
            id: "v2",
            type: "shape-exists",
            description: "Switches müssen platziert sein",
            shapeType: "switch",
            points: 10,
          },
        ],
      },
      {
        id: "s-net-vlan-3",
        title: "Endgeräte pro VLAN",
        description:
          "Platziere Endgeräte pro VLAN:\n\n- VLAN 10: 2 **Computer** (192.168.10.10, 192.168.10.11) → Switch 1\n- VLAN 20: 1 **Server** (192.168.20.10) → Switch 1\n- VLAN 30: 1 **Computer** (192.168.30.10) → Switch 2 (Gäste-WLAN)",
        type: "task",
        order: 2,
        completed: false,
        hints: [
          {
            id: "h1",
            level: 1,
            text: "Platziere PCs und Server und verbinde sie jeweils mit dem richtigen Switch.",
            pointsDeduction: 5,
          },
          {
            id: "h2",
            level: 2,
            text: "Geräte im selben VLAN können kommunizieren. Verschiedene VLANs benötigen den Router.",
            pointsDeduction: 10,
          },
        ],
        validationRules: [
          {
            id: "v3",
            type: "shape-exists",
            description: "Computer müssen platziert sein",
            shapeType: "computer",
            points: 10,
          },
          {
            id: "v4",
            type: "shape-exists",
            description: "Server muss platziert sein",
            shapeType: "server",
            points: 10,
          },
        ],
      },
      {
        id: "s-net-vlan-4",
        title: "Quiz: Netzwerk-Diagnose",
        description:
          "Teste dein Wissen über Netzwerk-Diagnose und -Troubleshooting.",
        type: "quiz",
        order: 3,
        completed: false,
        quizId: "quiz-networking-diagnose",
        hints: [],
      },
    ],
  },

  // ══════════════════════════════════════════════════════════
  // 9. Windows: Intune Endpoint Management
  // ══════════════════════════════════════════════════════════
  "lp-windows-intune": {
    id: "lp-windows-intune",
    title: "Lab: Intune Device Management",
    description:
      "Richte eine Intune-Umgebung ein: Server, Endpoints und Cloud-Anbindung. Lerne Compliance und Configuration Profiles kennen.",
    subject: "Windows",
    difficulty: "intermediate",
    estimatedMinutes: 35,
    tags: ["Intune", "MD-102", "Endpoint", "Compliance", "Autopilot"],
    createdAt: NOW,
    updatedAt: NOW,
    steps: [
      {
        id: "s-win-intune-1",
        title: "Einführung: Microsoft Intune",
        description:
          "Microsoft Intune ist ein Cloud-basierter MDM/MAM-Dienst.\n\n**Kernkonzepte:**\n- **MDM** (Mobile Device Management) – Volle Gerätekontrolle\n- **MAM** (Mobile Application Management) – Nur App-Daten schützen\n- **Compliance Policy** – PRÜFT Gerätezustand (z.B. BitLocker aktiv?)\n- **Configuration Profile** – KONFIGURIERT Geräte aktiv\n- **Autopilot** – Zero-Touch Deployment für neue Geräte\n\n**Wichtig:** Compliance ≠ Configuration!\n- Compliance → 'Ist BitLocker aktiv?' (prüft)\n- Configuration → 'BitLocker aktivieren!' (ändert)",
        type: "info",
        order: 0,
        completed: false,
        hints: [],
      },
      {
        id: "s-win-intune-2",
        title: "Cloud-Infrastruktur aufbauen",
        description:
          "Platziere einen **Cloud**-Shape (Azure/Entra ID) und einen **Server** (Intune Service).\n\n- Cloud: Label `Azure Entra ID`\n- Server: Label `Intune Service`, IP: `intune.microsoft.com`",
        type: "task",
        order: 1,
        completed: false,
        hints: [
          {
            id: "h1",
            level: 1,
            text: "Suche 'Cloud' und 'Server' im Shape-Picker.",
            pointsDeduction: 5,
          },
          {
            id: "h2",
            level: 2,
            text: "Die Cloud repräsentiert Azure Entra ID (vormals Azure AD). Verbinde sie mit dem Intune-Server.",
            pointsDeduction: 10,
          },
        ],
        validationRules: [
          {
            id: "v1",
            type: "shape-exists",
            description: "Cloud (Entra ID) muss platziert sein",
            shapeType: "cloud",
            points: 10,
          },
          {
            id: "v2",
            type: "shape-exists",
            description: "Server (Intune) muss platziert sein",
            shapeType: "server",
            points: 10,
          },
        ],
      },
      {
        id: "s-win-intune-3",
        title: "Managed Devices hinzufügen",
        description:
          "Platziere 3 **Computer** als verwaltete Endgeräte.\n\n- PC-1: `Corp-Laptop-01` (Corporate – Autopilot enrolled)\n- PC-2: `Corp-Laptop-02` (Corporate – Autopilot enrolled)\n- PC-3: `BYOD-Device-01` (BYOD – User enrolled)\n\nVerbinde alle mit dem Intune-Server.",
        type: "task",
        order: 2,
        completed: false,
        hints: [
          {
            id: "h1",
            level: 1,
            text: "Platziere 3 Computer-Shapes und benenne sie über das Label.",
            pointsDeduction: 5,
          },
          {
            id: "h2",
            level: 2,
            text: "Corporate Devices haben volle MDM-Kontrolle, BYOD nur MAM (App-Daten).",
            pointsDeduction: 10,
          },
        ],
        validationRules: [
          {
            id: "v3",
            type: "shape-exists",
            description: "Computer (Endpoints) müssen platziert sein",
            shapeType: "computer",
            points: 15,
          },
        ],
      },
      {
        id: "s-win-intune-4",
        title: "Firewall und Compliance",
        description:
          "Platziere eine **Firewall** zwischen Internet und Endgeräten.\n\nDie Firewall symbolisiert den Conditional Access: Nur compliant Geräte erhalten Zugriff auf Unternehmensressourcen.",
        type: "task",
        order: 3,
        completed: false,
        hints: [
          {
            id: "h1",
            level: 1,
            text: "Conditional Access = Nur konforme Geräte bekommen Zugang.",
            pointsDeduction: 5,
          },
        ],
        validationRules: [
          {
            id: "v4",
            type: "shape-exists",
            description: "Firewall (Conditional Access) muss platziert sein",
            shapeType: "firewall",
            points: 10,
          },
        ],
      },
      {
        id: "s-win-intune-5",
        title: "Quiz: Intune & Endpoint Management",
        description: "Teste dein Wissen über Microsoft Intune und MD-102.",
        type: "quiz",
        order: 4,
        completed: false,
        quizId: "quiz-windows-intune",
        hints: [],
      },
    ],
  },

  // ══════════════════════════════════════════════════════════
  // 10. DevOps: CI/CD Pipeline visualisieren
  // ══════════════════════════════════════════════════════════
  "lp-devops-cicd": {
    id: "lp-devops-cicd",
    title: "Lab: CI/CD Pipeline aufbauen",
    description:
      "Visualisiere eine CI/CD Pipeline: Git → Build → Test → Registry → Deploy → Kubernetes.",
    subject: "DevOps",
    difficulty: "intermediate",
    estimatedMinutes: 30,
    tags: ["CI/CD", "Pipeline", "Git", "Deploy", "IaC"],
    createdAt: NOW,
    updatedAt: NOW,
    steps: [
      {
        id: "s-do-1",
        title: "Einführung: CI/CD Pipeline",
        description:
          "Eine CI/CD Pipeline automatisiert den Weg vom Code zum Deployment:\n\n```\n[Git Push] → [Build] → [Test] → [Container Registry] → [Deploy] → [Kubernetes]\n```\n\n**CI (Continuous Integration):** Automatisches Bauen und Testen bei jedem Commit\n**CD (Continuous Delivery):** Automatisches Deployment bis Staging\n**CD (Continuous Deployment):** Automatisches Deployment bis Produktion",
        type: "info",
        order: 0,
        completed: false,
        hints: [],
      },
      {
        id: "s-do-2",
        title: "Pipeline-Stages aufbauen",
        description:
          "Platziere die Pipeline-Stages als Shapes:\n\n1. **Server** → Label: `Git Server`\n2. **Container** → Label: `CI Build`\n3. **Container** → Label: `Test Runner`\n4. **Container** → Label: `Container Registry`\n5. **Kubernetes Service** → Label: `K8s Deploy`\n\nVerbinde sie in Reihenfolge: Git → Build → Test → Registry → Deploy",
        type: "task",
        order: 1,
        completed: false,
        hints: [
          {
            id: "h1",
            level: 1,
            text: "Nutze Server und Container-Shapes für die Pipeline-Stages.",
            pointsDeduction: 5,
          },
          {
            id: "h2",
            level: 2,
            text: "Platziere sie horizontal von links nach rechts. Verbinde jeweils aufeinanderfolgend.",
            pointsDeduction: 10,
          },
          {
            id: "h3",
            level: 3,
            text: "Git-Server → CI-Build-Container → Test-Runner → Container-Registry → K8s-Service",
            pointsDeduction: 15,
          },
        ],
        validationRules: [
          {
            id: "v1",
            type: "shape-exists",
            description: "Server (Git) muss platziert sein",
            shapeType: "server",
            points: 5,
          },
          {
            id: "v2",
            type: "shape-exists",
            description: "Container müssen platziert sein",
            shapeType: "container",
            points: 10,
          },
          {
            id: "v3",
            type: "shape-exists",
            description: "Kubernetes Service muss platziert sein",
            shapeType: "kubernetes-service",
            points: 5,
          },
        ],
      },
      {
        id: "s-do-3",
        title: "Quiz: CI/CD Grundlagen",
        description: "Teste dein Wissen über CI/CD Pipelines und DevOps.",
        type: "quiz",
        order: 2,
        completed: false,
        quizId: "quiz-devops-cicd",
        hints: [],
      },
    ],
  },

  // ══════════════════════════════════════════════════════════
  // 11. Database: Replikation & Hochverfügbarkeit
  // ══════════════════════════════════════════════════════════
  "lp-database-ha": {
    id: "lp-database-ha",
    title: "Lab: Datenbank-Hochverfügbarkeit",
    description:
      "Baue eine hochverfügbare Datenbankarchitektur mit Primary/Replica und Load Balancer auf.",
    subject: "Database",
    difficulty: "intermediate",
    estimatedMinutes: 30,
    tags: ["Datenbank", "Replikation", "HA", "Backup"],
    createdAt: NOW,
    updatedAt: NOW,
    steps: [
      {
        id: "s-db-1",
        title: "Einführung: Datenbank-Hochverfügbarkeit",
        description:
          "Hochverfügbare Datenbanken nutzen Replikation:\n\n- **Primary (Master):** Schreibzugriff – alle Änderungen hier\n- **Replica (Slave):** Lesezugriff – kopiert Daten vom Primary\n- **Failover:** Bei Primary-Ausfall wird Replica zum neuen Primary\n\n**Strategien:**\n- Synchrone Replikation: Daten sofort auf Replica (konsistent, langsamer)\n- Asynchrone Replikation: Verzögerte Kopie (schneller, minimaler Datenverlust möglich)",
        type: "info",
        order: 0,
        completed: false,
        hints: [],
      },
      {
        id: "s-db-2",
        title: "Primary und Replica aufbauen",
        description:
          "Platziere 3 **Database Server**:\n\n- Primary: IP `10.0.1.10`, Port `5432`, Label: `DB Primary`\n- Replica 1: IP `10.0.1.11`, Port `5432`, Label: `DB Replica 1`\n- Replica 2: IP `10.0.1.12`, Port `5432`, Label: `DB Replica 2`\n\nVerbinde Primary → Replica 1 und Primary → Replica 2 (Replikation).",
        type: "task",
        order: 1,
        completed: false,
        hints: [
          {
            id: "h1",
            level: 1,
            text: "Suche 'Database Server' im Shape-Picker und platziere 3 Stück.",
            pointsDeduction: 5,
          },
          {
            id: "h2",
            level: 2,
            text: "Primary oben, Replicas unten. Verbinde Primary zu beiden Replicas.",
            pointsDeduction: 10,
          },
        ],
        validationRules: [
          {
            id: "v1",
            type: "shape-exists",
            description: "Database Server müssen platziert sein",
            shapeType: "database-server",
            points: 15,
          },
        ],
      },
      {
        id: "s-db-3",
        title: "Load Balancer für Lesezugriffe",
        description:
          "Platziere einen **Load Balancer** vor den Replicas.\n\nApplikationen lesen über den Load Balancer (verteilt auf Replicas), schreiben direkt zum Primary.\n\n- Verbinde: Load Balancer → Replica 1 und Load Balancer → Replica 2",
        type: "task",
        order: 2,
        completed: false,
        hints: [
          {
            id: "h1",
            level: 1,
            text: "Der Load Balancer verteilt Lese-Anfragen auf die Replicas.",
            pointsDeduction: 5,
          },
        ],
        validationRules: [
          {
            id: "v2",
            type: "shape-exists",
            description: "Load Balancer muss platziert sein",
            shapeType: "loadbalancer",
            points: 10,
          },
        ],
      },
      {
        id: "s-db-4",
        title: "Quiz: Datenbank-Grundlagen",
        description:
          "Teste dein Wissen über Datenbanken, Replikation und Backups.",
        type: "quiz",
        order: 3,
        completed: false,
        quizId: "quiz-database-grundlagen",
        hints: [],
      },
    ],
  },

  // ══════════════════════════════════════════════════════════
  // CCNA 200-301 Lernpfade
  // ══════════════════════════════════════════════════════════

  "lp-ccna-grundlagen": {
    id: "lp-ccna-grundlagen",
    title: "CCNA: Netzwerkgrundlagen & IPv4",
    description: "Grundlagen des Netzwerkens – OSI-Modell, TCP/IP, IPv4-Adressierung und Subnetting nach dem offiziellen CCNA 200-301 Handout.",
    subject: "FISI",
    difficulty: "beginner",
    estimatedMinutes: 45,
    tags: ["CCNA", "OSI", "IPv4", "Subnetting", "Netzwerkgrundlagen"],
    createdAt: NOW,
    updatedAt: NOW,
    steps: [
      {
        id: "s-ccna-g-1",
        title: "OSI-Modell & Netzwerkgeräte",
        description: "Das **OSI-Referenzmodell** hat 7 Schichten und beschreibt die Kommunikation in Netzwerken:\n\n**Layer 1 – Physical:** Kabel, Signale\n**Layer 2 – Data Link:** Ethernet, MAC-Adressen, Switches\n**Layer 3 – Network:** IP-Adressen, Router\n**Layer 4 – Transport:** TCP/UDP, Ports\n**Layer 5-7 – Session/Presentation/Application:** Anwendungsprotokoll\n\nNetzwerkgeräte:\n- **Hub:** Layer 1, kein Intelligence\n- **Switch:** Layer 2, MAC-basiertes Forwarding\n- **Router:** Layer 3, IP-basiertes Routing\n\n**Encapsulation:** Jede Schicht fügt beim Senden Header hinzu.",
        type: "info",
        order: 0,
        completed: false,
        hints: [],
      },
      {
        id: "s-ccna-g-2",
        title: "Netzwerk aufbauen",
        description: "Baue ein einfaches Netzwerk auf dem Canvas:\n\n1. Platziere einen **Router**\n2. Füge einen **Switch** hinzu\n3. Verbinde Router und Switch\n4. Füge 2 **Computer** an den Switch an\n\n**Tipp:** Alle Shapes findest du in der Sidebar unter 'Netzwerk'.",
        type: "task",
        order: 1,
        completed: false,
        hints: [
          { id: "h1", level: 1, text: "Router: Sidebar → Netzwerk → Router", pointsDeduction: 2 },
          { id: "h2", level: 1, text: "Verbindung: Klicke auf einen Verbindungspunkt und ziehe zum anderen Shape", pointsDeduction: 2 },
        ],
        requiredShapes: [
          { shapeId: "router", label: "Router vorhanden" },
          { shapeId: "switch", label: "Switch vorhanden" },
          { shapeId: "computer", label: "2 Computer vorhanden" },
        ],
      },
      {
        id: "s-ccna-g-3",
        title: "Quiz: Netzwerkgrundlagen & OSI",
        description: "Teste dein Wissen über OSI-Modell, Netzwerkgeräte und grundlegende Konzepte.",
        type: "quiz",
        order: 2,
        completed: false,
        quizId: "ccna-quiz-netzwerkgrundlagen",
        hints: [],
      },
      {
        id: "s-ccna-g-4",
        title: "IPv4 Adressierung & Subnetting",
        description: "**IPv4-Grundlagen:**\n\n- Adresslänge: 32 Bit (4 Oktette)\n- Notation: Dezimal, z.B. 192.168.1.100\n- Subnetzmaske bestimmt Netz- und Hostteil\n\n**Subnetting:**\n- /24 = 255.255.255.0 → 254 Hosts\n- /25 = 255.255.255.128 → 126 Hosts\n- /26 = 255.255.255.192 → 62 Hosts\n- /27 = 255.255.255.224 → 30 Hosts\n- /28 = 255.255.255.240 → 14 Hosts\n- /29 = 255.255.255.248 → 6 Hosts\n\n**Private Adressbereiche (RFC 1918):**\n- 10.0.0.0/8\n- 172.16.0.0/12\n- 192.168.0.0/16",
        type: "info",
        order: 3,
        completed: false,
        hints: [],
      },
      {
        id: "s-ccna-g-5",
        title: "Quiz: IPv4 Adressierung & Subnetting",
        description: "Teste dein Wissen über IPv4-Adressen, Subnetzmasken, CIDR und spezielle Adressbereiche.",
        type: "quiz",
        order: 4,
        completed: false,
        quizId: "ccna-quiz-ipv4",
        hints: [],
      },
    ],
  },

  "lp-ccna-ipv6-routing": {
    id: "lp-ccna-ipv6-routing",
    title: "CCNA: IPv6 & OSPF",
    description: "IPv6-Adressierung, NDP, SLAAC und OSPF-Grundlagen (Single und Multiple Area) nach CCNA 200-301.",
    subject: "FISI",
    difficulty: "intermediate",
    estimatedMinutes: 50,
    tags: ["CCNA", "IPv6", "OSPF", "NDP", "SLAAC", "Routing"],
    createdAt: NOW,
    updatedAt: NOW,
    steps: [
      {
        id: "s-ccna-ipv6-1",
        title: "IPv6 Grundlagen",
        description: "**IPv6** ist der Nachfolger von IPv4 und bietet einen deutlich größeren Adressraum.\n\n**Adressformat:**\n- 128 Bit lang\n- 8 Gruppen à 4 Hex-Ziffern\n- Beispiel: 2001:0db8:85a3::8a2e:0370:7334\n\n**Kürzungsregeln:**\n- Führende Nullen in Gruppen weglassen: 0db8 → db8\n- Aufeinanderfolgende Null-Gruppen einmalig durch :: ersetzen\n\n**Wichtige Adresstypen:**\n- Global Unicast: 2000::/3\n- Link-local: fe80::/10 (automatisch)\n- Loopback: ::1\n- Multicast: ff00::/8\n\n**NDP** (Neighbor Discovery Protocol) ersetzt ARP und nutzt ICMPv6.",
        type: "info",
        order: 0,
        completed: false,
        hints: [],
      },
      {
        id: "s-ccna-ipv6-2",
        title: "Quiz: IPv6 Grundlagen & OSPFv3",
        description: "Teste dein Wissen über IPv6-Adressen, NDP, SLAAC und OSPFv3.",
        type: "quiz",
        order: 1,
        completed: false,
        quizId: "ccna-quiz-ipv6",
        hints: [],
      },
      {
        id: "s-ccna-ospf-1",
        title: "OSPF Grundlagen",
        description: "**OSPF** (Open Shortest Path First) ist ein Link-State Routing Protokoll.\n\n**Eigenschaften:**\n- Verwendet Dijkstra-Algorithmus\n- Verwaltet LSDB (Link State Database)\n- Unterstützt Areas für Skalierbarkeit\n- Backbone Area muss immer Area 0 sein\n\n**Router-Typen in Multiple Area OSPF:**\n- **IR** (Internal Router): nur in einer Area\n- **ABR** (Area Border Router): verbindet Areas mit Area 0\n- **ASBR** (AS Boundary Router): verbindet OSPF mit anderen Routing-Protokollen\n\n**LSA-Typen:**\n- Type 1: Router LSA (jeder Router)\n- Type 2: Network LSA (nur DR)\n- Type 3: Summary LSA (ABR)\n- Type 5: External LSA (ASBR)",
        type: "info",
        order: 2,
        completed: false,
        hints: [],
      },
      {
        id: "s-ccna-ospf-2",
        title: "Quiz: OSPF",
        description: "Teste dein Wissen über OSPF-Grundlagen, Multiple Area OSPF, LSA-Typen und Router-Rollen.",
        type: "quiz",
        order: 3,
        completed: false,
        quizId: "ccna-quiz-ospf",
        hints: [],
      },
    ],
  },

  "lp-ccna-security": {
    id: "lp-ccna-security",
    title: "CCNA: Netzwerksicherheit",
    description: "Bedrohungen, Angriffsmethoden, Cisco Device Hardening, AAA, DHCP Snooping, DAI und ACLs nach CCNA 200-301.",
    subject: "FISI",
    difficulty: "intermediate",
    estimatedMinutes: 60,
    tags: ["CCNA", "Security", "ACL", "DHCP Snooping", "DAI", "AAA", "Spoofing"],
    createdAt: NOW,
    updatedAt: NOW,
    steps: [
      {
        id: "s-ccna-sec-1",
        title: "Netzwerkbedrohungen",
        description: "**Wichtige Begriffe:**\n- **Vulnerability:** Schwachstelle im System\n- **Exploit:** Tool zum Ausnutzen von Vulnerabilities\n- **Threat:** Aktiver Angriff\n\n**Angriffsmethoden:**\n- **Spoofing:** Gefälschte Absenderadressen (MAC, IP, Protocol)\n- **DoS/DDoS:** Überlastung von Diensten\n- **MITM:** Kommunikation abfangen/manipulieren\n- **Reconnaissance:** Informationssammlung\n\n**Malware:**\n- **Viren:** Injizieren sich in Programme\n- **Würmer:** Verbreiten sich selbständig\n- **Trojaner:** Schadcode in vertrauenswürdigen Programmen\n\n**Social Engineering:**\n- Phishing (E-Mail), Vishing (Telefon), Smishing (SMS)",
        type: "info",
        order: 0,
        completed: false,
        hints: [],
      },
      {
        id: "s-ccna-sec-2",
        title: "Quiz: Security Grundlagen",
        description: "Teste dein Wissen über Netzwerkbedrohungen, Malware und Social Engineering.",
        type: "quiz",
        order: 1,
        completed: false,
        quizId: "ccna-quiz-security",
        hints: [],
      },
      {
        id: "s-ccna-sec-3",
        title: "Device Hardening & ACLs",
        description: "**Cisco Device Hardening:**\n- `service password-encryption` → Klartextpasswörter verschlüsseln\n- `enable secret` → MD5/SHA-Hash (sicherer als `enable password`)\n- Nur SSH v2 erlauben: `ip ssh version 2`\n- VTY ACL für SSH-Zugriff: `access-class [acl-nr] in`\n\n**AAA:**\n- Authentication, Authorization, Accounting\n- Server: RADIUS (UDP, dot1x), TACACS+ (TCP Port 49)\n\n**ACL-Typen:**\n- Standard (1-99): nur Source-IP\n- Extended (100-199): Protokoll + Source/Dest-IP + Ports\n\n**ACL-Verarbeitung:** Top-Down, erste passende Regel gewinnt. Implicit Deny am Ende.",
        type: "info",
        order: 2,
        completed: false,
        hints: [],
      },
      {
        id: "s-ccna-sec-4",
        title: "Quiz: Device Hardening & AAA",
        description: "Teste dein Wissen über Cisco-Sicherheitskonfiguration, SSH und AAA-Server.",
        type: "quiz",
        order: 3,
        completed: false,
        quizId: "ccna-quiz-harden-access",
        hints: [],
      },
      {
        id: "s-ccna-sec-5",
        title: "Quiz: DHCP Snooping & DAI",
        description: "Teste dein Wissen über DHCP Snooping, Dynamic ARP Inspection und Layer-2-Schutz.",
        type: "quiz",
        order: 4,
        completed: false,
        quizId: "ccna-quiz-dhcp-snooping-dai",
        hints: [],
      },
      {
        id: "s-ccna-sec-6",
        title: "Quiz: ACLs",
        description: "Teste dein Wissen über Standard und Extended ACLs, Konfiguration und Troubleshooting.",
        type: "quiz",
        order: 5,
        completed: false,
        quizId: "ccna-quiz-acl",
        hints: [],
      },
    ],
  },

  "lp-ccna-services": {
    id: "lp-ccna-services",
    title: "CCNA: Dienste – DHCP, NAT & QoS",
    description: "DHCP-Betrieb, NAT/PAT-Konfiguration und QoS-Grundlagen nach CCNA 200-301.",
    subject: "FISI",
    difficulty: "intermediate",
    estimatedMinutes: 40,
    tags: ["CCNA", "DHCP", "NAT", "PAT", "QoS", "Dienste"],
    createdAt: NOW,
    updatedAt: NOW,
    steps: [
      {
        id: "s-ccna-svc-1",
        title: "DHCP & NAT Grundlagen",
        description: "**DHCP** (Dynamic Host Configuration Protocol):\n- DORA: Discover → Offer → Request → Ack\n- UDP Ports: 67 (Server), 68 (Client)\n- Vergibt: IP, Subnetzmaske, Gateway, DNS\n- Relay Agent: leitet DHCP-Broadcasts an entfernten Server weiter\n\n**NAT** (Network Address Translation):\n- **Static NAT:** 1:1-Zuordnung (für Server im Internet erreichbar)\n- **Dynamic NAT:** Pool öffentlicher IPs\n- **PAT/Overload:** Viele interne IPs → eine öffentliche IP (Ports)\n- Konfiguration: `ip nat inside source list [acl] interface [if] overload`\n- Verifikation: `show ip nat translations`",
        type: "info",
        order: 0,
        completed: false,
        hints: [],
      },
      {
        id: "s-ccna-svc-2",
        title: "Quiz: DHCP",
        description: "Teste dein Wissen über DHCP-Nachrichten, DORA-Ablauf und Cisco-Konfiguration.",
        type: "quiz",
        order: 1,
        completed: false,
        quizId: "ccna-quiz-dhcp",
        hints: [],
      },
      {
        id: "s-ccna-svc-3",
        title: "Quiz: NAT & PAT",
        description: "Teste dein Wissen über Static NAT, Dynamic NAT, PAT und Troubleshooting.",
        type: "quiz",
        order: 2,
        completed: false,
        quizId: "ccna-quiz-nat",
        hints: [],
      },
      {
        id: "s-ccna-svc-4",
        title: "Quiz: QoS",
        description: "Teste dein Wissen über QoS-Funktionen, DSCP, CoS, Queuing und Congestion Avoidance.",
        type: "quiz",
        order: 3,
        completed: false,
        quizId: "ccna-quiz-qos",
        hints: [],
      },
    ],
  },

  "lp-ccna-wlan": {
    id: "lp-ccna-wlan",
    title: "CCNA: WLAN Grundlagen & Konfiguration",
    description: "802.11 Standards, WLAN-Topologien, Sicherheit und WLC-Konfiguration nach CCNA 200-301.",
    subject: "FISI",
    difficulty: "intermediate",
    estimatedMinutes: 35,
    tags: ["CCNA", "WLAN", "802.11", "WLC", "LAP", "WPA2", "SSID"],
    createdAt: NOW,
    updatedAt: NOW,
    steps: [
      {
        id: "s-ccna-wlan-1",
        title: "WLAN Grundlagen",
        description: "**IEEE 802.11 Standards:**\n- 802.11b: 2,4 GHz, max 11 Mbps\n- 802.11g: 2,4 GHz, max 54 Mbps\n- 802.11n: 2,4+5 GHz, max ~600 Mbps\n- 802.11ac: 5 GHz, max 6,9 Gbps\n- 802.11ax (Wi-Fi 6): 2,4+5+6 GHz\n\n**WLAN vs Ethernet:**\n- WLAN: CSMA/CA, half-duplex\n- Ethernet: CSMA/CD, full-duplex\n\n**2,4-GHz-Band:** Non-overlapping Channels 1, 6, 11\n\n**Cisco WLAN-Geräte:**\n- Autonomous AP: eigenständig konfiguriert\n- LAP (Lightweight AP): vom WLC gesteuert\n- WLC (Wireless LAN Controller): zentrales Management\n\n**Topologien:** BSS (1 AP), ESS (mehrere APs, gleiche SSID)",
        type: "info",
        order: 0,
        completed: false,
        hints: [],
      },
      {
        id: "s-ccna-wlan-2",
        title: "Quiz: WLAN Grundlagen & Sicherheit",
        description: "Teste dein Wissen über 802.11 Standards, WLAN-Topologien, Frequenzbänder und WLC-Konfiguration.",
        type: "quiz",
        order: 1,
        completed: false,
        quizId: "ccna-quiz-wlan",
        hints: [],
      },
    ],
  },

  "lp-ccna-exam-prep": {
    id: "lp-ccna-exam-prep",
    title: "CCNA 200-301 Prüfungssimulation",
    description: "Vollständige Prüfungssimulation mit 20 Fragen aus allen CCNA-Themenbereichen. Bestehensgrenze: 82% (wie im echten Exam). Zeitlimit: 90 Minuten.",
    subject: "FISI",
    difficulty: "advanced",
    estimatedMinutes: 90,
    tags: ["CCNA", "Prüfung", "Exam", "200-301", "Zertifizierung", "Simulation"],
    createdAt: NOW,
    updatedAt: NOW,
    steps: [
      {
        id: "s-ccna-exam-1",
        title: "Prüfungshinweise",
        description: "**CCNA 200-301 Prüfungshinweise:**\n\n- **Bestehensgrenze:** 825/1000 Punkte (ca. 82%)\n- **Zeitlimit:** 120 Minuten (reale Prüfung)\n- **Fragen:** 90-110 Fragen (Mix aus Multiple Choice, Drag-Drop, Simulation)\n\n**Themengebiete (Gewichtung):**\n1. Network Fundamentals (20%)\n2. Network Access (20%)\n3. IP Connectivity (25%)\n4. IP Services (10%)\n5. Security Fundamentals (15%)\n6. Automation & Programmability (10%)\n\n**Diese Simulation** deckt alle Themenbereiche ab. Zeitlimit: 90 Minuten.\n\n**Viel Erfolg!** 🎓",
        type: "info",
        order: 0,
        completed: false,
        hints: [],
      },
      {
        id: "s-ccna-exam-2",
        title: "CCNA 200-301 Prüfungssimulation",
        description: "20 Fragen aus allen CCNA-Themenbereichen. Bestehensgrenze: 82%. Zeitlimit: 90 Minuten.",
        type: "quiz",
        order: 1,
        completed: false,
        quizId: "ccna-quiz-gesamtpruefung",
        hints: [],
      },
    ],
  },

  // ── CIS1: Grundlagen & Switching ────────────────────────
  "lp-cis1-2026": {
    id: "lp-cis1-2026",
    title: "CIS1 – Grundlagen & Switching (19.01–30.01.2026)",
    description: "Strukturierter Lernpfad für CIS-Baustein 1: Cisco Hardware/CLI, OSI-Modell, Ethernet, VLANs, VTP, DTP, Router-on-a-Stick und Subnetting Class C.",
    subject: "FISI",
    difficulty: "beginner",
    estimatedMinutes: 120,
    tags: ["CCNA", "CIS1", "Switching", "VLANs", "OSI", "Subnetting", "IOS-CLI"],
    createdAt: NOW,
    updatedAt: NOW,
    steps: [
      {
        id: "s-cis1-1",
        title: "Cisco Hardware & IOS-Grundlagen",
        description: "**Cisco Hardware-Überblick:**\n\n**Router:** Verbindet Netzwerke (Layer 3), leitet Pakete anhand IP-Adressen weiter. Interfaces: G0/0, G0/1, S0/0/0.\n**Switch:** Verbindet Hosts im LAN (Layer 2), leitet Frames anhand MAC-Adressen weiter.\n**Access Point:** WLAN-Verbindung für Endgeräte.\n\n**Cisco IOS Modi:**\n- `Router>` → User EXEC (eingeschränkt)\n- `Router#` → Privileged EXEC (vollständiger Zugriff) → `enable`\n- `Router(config)#` → Global Config → `configure terminal`\n- `Router(config-if)#` → Interface Config → `interface G0/0`\n\n**Wichtige Grundbefehle:**\n```\nshow version              # IOS-Version, Hardware\nshow ip interface brief   # Interface-Status + IP\nshow running-config       # Aktuelle Konfiguration\ncopy running-config startup-config  # Speichern\n```",
        type: "info",
        order: 0,
        completed: false,
        hints: [],
      },
      {
        id: "s-cis1-2",
        title: "Quiz: Cisco IOS CLI",
        description: "Teste dein Wissen über Cisco IOS Modi, Befehle und grundlegende Konfiguration.",
        type: "quiz",
        order: 1,
        completed: false,
        quizId: "ccna-quiz-ios-cli",
        hints: [],
      },
      {
        id: "s-cis1-3",
        title: "OSI-Modell & Ethernet",
        description: "**OSI-Referenzmodell (7 Schichten):**\n\n| Schicht | Name | Protokolle/Geräte |\n|---------|------|-------------------|\n| 7 | Application | HTTP, FTP, DNS, DHCP |\n| 6 | Presentation | SSL/TLS, Kompression |\n| 5 | Session | NetBIOS, RPC |\n| 4 | Transport | TCP (zuverlässig), UDP (schnell) |\n| 3 | Network | IP, ICMP, Router |\n| 2 | Data Link | Ethernet, MAC, Switch |\n| 1 | Physical | Kabel, Hub, Signale |\n\n**Ethernet & ARP:**\n- Ethernet-Frame enthält Quell-MAC, Ziel-MAC, EtherType, Daten\n- ARP löst IP → MAC auf (Broadcast-Anfrage)\n- CSMA/CD für Kollisionsvermeidung in Half-Duplex\n\n**TCP/IP-Modell:** 4 Schichten: Network Access, Internet, Transport, Application",
        type: "info",
        order: 2,
        completed: false,
        hints: [],
      },
      {
        id: "s-cis1-4",
        title: "Quiz: Netzwerkgrundlagen & OSI",
        description: "Teste dein Wissen über das OSI-Modell, TCP/IP, ARP und grundlegende Netzwerkgeräte.",
        type: "quiz",
        order: 3,
        completed: false,
        quizId: "ccna-quiz-netzwerkgrundlagen",
        hints: [],
      },
      {
        id: "s-cis1-5",
        title: "VLANs, Trunking, VTP & DTP",
        description: "**VLANs (Virtual LANs):**\n- Segmentieren Broadcast-Domänen ohne physische Trennung\n- Konfiguration: `vlan 10` → `name Sales`\n- Access Port: `switchport mode access` → `switchport access vlan 10`\n\n**Trunk-Ports (802.1Q):**\n- Übertragen mehrere VLANs über einen Link\n- VLAN-Tagging: 4-Byte 802.1Q-Header\n- Native VLAN (Standard VLAN 1): ungetaggt → Sicherheitsrisiko!\n\n**VTP (VLAN Trunking Protocol):**\n- Server: erstellt/ändert/löscht VLANs\n- Client: empfängt VLANs, keine lokale Änderung\n- Transparent: leitet weiter, verwaltet VLANs lokal\n- ⚠️ Risiko: höhere Revisionsnummer überschreibt VLAN-DB!\n\n**DTP (Dynamic Trunking Protocol):**\n- Verhandelt Trunk automatisch\n- Deaktivieren mit `switchport nonegotiate` (Sicherheit!)",
        type: "info",
        order: 4,
        completed: false,
        hints: [],
      },
      {
        id: "s-cis1-6",
        title: "Quiz: Switching, VLANs & Trunking",
        description: "Teste dein Wissen über VLANs, Trunk-Ports, Native VLAN und Switch-Konfiguration.",
        type: "quiz",
        order: 5,
        completed: false,
        quizId: "ccna-quiz-switching",
        hints: [],
      },
      {
        id: "s-cis1-7",
        title: "Quiz: VLAN Vertiefung (VTP, DTP, ROAS)",
        description: "Vertiefte Fragen zu VTP-Modi, DTP, Router-on-a-Stick und 802.1Q Sicherheit.",
        type: "quiz",
        order: 6,
        completed: false,
        quizId: "quiz-vlan-advanced",
        hints: [],
      },
      {
        id: "s-cis1-8",
        title: "Subnetting Class C & CIDR",
        description: "**Subnetting Class C (/24):**\n\n**Formel:** 2^n Subnetze (n = geliehene Hostbits), 2^h - 2 Hosts\n\n| Präfix | Maske | Hosts | Blockgröße |\n|--------|-------|-------|------------|\n| /25 | .128 | 126 | 128 |\n| /26 | .192 | 62 | 64 |\n| /27 | .224 | 30 | 32 |\n| /28 | .240 | 14 | 16 |\n| /29 | .248 | 6 | 8 |\n| /30 | .252 | 2 | 4 |\n\n**Magic Number:** 256 - letztes Oktett der Maske\nBeispiel /26: 256-192 = 64 → Blöcke: 0, 64, 128, 192\n\n**Netzadresse:** Erste Adresse des Blocks\n**Broadcast:** Letzte Adresse des Blocks\n**Nutzbare Hosts:** Alle dazwischen",
        type: "info",
        order: 7,
        completed: false,
        hints: [],
      },
      {
        id: "s-cis1-9",
        title: "Quiz: IPv4 Adressierung & Subnetting",
        description: "Teste dein Wissen über IPv4-Adressen, Subnetzmasken, CIDR und Subnetting-Berechnungen.",
        type: "quiz",
        order: 8,
        completed: false,
        quizId: "ccna-quiz-ipv4",
        hints: [],
      },
      {
        id: "s-cis1-10",
        title: "CIS1 Klausurvorbereitung",
        description: "25 Fragen quer durch alle CIS1-Themen: OSI, CLI, VLANs, VTP, DTP, ROAS und Subnetting.",
        type: "quiz",
        order: 9,
        completed: false,
        quizId: "ccna-quiz-cis1-klausur",
        hints: [],
      },
      {
        id: "s-cis1-11",
        title: "CIS1 abgeschlossen",
        description: "**Glückwunsch zum Abschluss von CIS1!**\n\nDu hast folgende Themen gelernt:\n\n✅ Cisco Hardware & IOS CLI\n✅ OSI-Modell & Ethernet\n✅ VLANs & Trunk-Ports\n✅ VTP & DTP\n✅ Router-on-a-Stick\n✅ Subnetting Class C\n\n**Nächster Schritt:** CIS2 – Routing & ACLs",
        type: "checkpoint",
        order: 10,
        completed: false,
        hints: [],
      },
    ],
  },

  // ── CIS2: Routing & ACLs ────────────────────────────────
  "lp-cis2-2026": {
    id: "lp-cis2-2026",
    title: "CIS2 – Routing & ACLs (02.02–21.02.2026)",
    description: "Strukturierter Lernpfad für CIS-Baustein 2: Subnetting Class B, Statisches Routing, DHCP, CDP/LLDP, RIP/RIPv2, Administrative Distanz, Floating Static Routes und ACLs.",
    subject: "FISI",
    difficulty: "intermediate",
    estimatedMinutes: 150,
    tags: ["CCNA", "CIS2", "Routing", "ACL", "DHCP", "RIP", "Subnetting", "AdminDistance"],
    createdAt: NOW,
    updatedAt: NOW,
    steps: [
      {
        id: "s-cis2-1",
        title: "Subnetting Class B & Magic Numbers",
        description: "**Subnetting Class B (172.16.0.0/16):**\n\nClass-B-Adressen haben 16 Netz- und 16 Hostbits. Subnetting im dritten und vierten Oktett.\n\n**Magic Number Methode:**\n1. Finde das 'interessante' Oktett (letztes Oktett mit gesetzten Bits in der Maske)\n2. Magic Number = 256 - Wert dieses Oktetts\n3. Zähle in Blöcken der Magic Number\n\n**Beispiel /20:**\nMaske: 255.255.240.0 → interessantes Oktett = 3. Oktett (240)\nMagic Number: 256-240 = 16\nBlöcke: 172.16.**0**.0, 172.16.**16**.0, 172.16.**32**.0 ...\n\n**VLSM:** Variable Length Subnet Masking\n- Unterschiedliche Masken im gleichen Netzwerk\n- Effiziente Adressnutzung (größte Subnetze zuerst)\n- Erfordert Classless-Protokoll (RIPv2, OSPF, EIGRP)",
        type: "info",
        order: 0,
        completed: false,
        hints: [],
      },
      {
        id: "s-cis2-2",
        title: "Quiz: Netzwerk-Segmentierung & VLSM",
        description: "Teste dein Wissen über Subnetting, VLSM und Netzwerk-Segmentierung.",
        type: "quiz",
        order: 1,
        completed: false,
        quizId: "ccna-quiz-segmentierung",
        hints: [],
      },
      {
        id: "s-cis2-3",
        title: "Statisches Routing & Routingtabelle",
        description: "**Statisches Routing:**\n\nSyntax: `ip route [Zielnetz] [Subnetzmaske] [Next-Hop | Exit-Interface]`\n\n**Beispiele:**\n```\nip route 192.168.2.0 255.255.255.0 10.0.0.1    # via Next-Hop\nip route 192.168.2.0 255.255.255.0 G0/1         # via Interface\nip route 0.0.0.0 0.0.0.0 10.0.0.1              # Default-Route\n```\n\n**Routingtabelle lesen (show ip route):**\n- `C` = Connected (AD 0)\n- `S` = Static (AD 1)\n- `R` = RIP (AD 120)\n- `O` = OSPF (AD 110)\n- `D` = EIGRP (AD 90)\n- `[AD/Metrik]` z.B. `[1/0]`\n\n**Floating Static Route:**\n```\nip route 0.0.0.0 0.0.0.0 10.0.0.2 150   # Backup, AD 150 > OSPF 110\n```",
        type: "info",
        order: 2,
        completed: false,
        hints: [],
      },
      {
        id: "s-cis2-4",
        title: "Quiz: Statisches Routing & Routingtabelle",
        description: "Teste dein Wissen über ip route-Syntax, Default-Routen, Floating Static Routes und Routingtabellen-Interpretation.",
        type: "quiz",
        order: 3,
        completed: false,
        quizId: "ccna-quiz-static-routing",
        hints: [],
      },
      {
        id: "s-cis2-5",
        title: "DHCP & CDP/LLDP",
        description: "**DHCP (Dynamic Host Configuration Protocol):**\n\nDORA-Prozess:\n1. **Discover:** Client sendet Broadcast (UDP 67)\n2. **Offer:** Server bietet IP-Adresse an\n3. **Request:** Client akzeptiert Angebot\n4. **Acknowledge:** Server bestätigt Vergabe\n\nCisco DHCP konfigurieren:\n```\nip dhcp pool OFFICE\n  network 192.168.1.0 255.255.255.0\n  default-router 192.168.1.1\n  dns-server 8.8.8.8\n  lease 7\nip dhcp excluded-address 192.168.1.1 192.168.1.10\n```\n\n**ip helper-address** leitet DHCP-Broadcasts über Subnetzgrenzen.\n\n**CDP vs. LLDP:**\n- CDP: Cisco-proprietär, Layer 2, `show cdp neighbors`\n- LLDP: IEEE 802.1AB, offen/herstellerübergreifend, `show lldp neighbors`",
        type: "info",
        order: 4,
        completed: false,
        hints: [],
      },
      {
        id: "s-cis2-6",
        title: "Quiz: DHCP",
        description: "Teste dein Wissen über DHCP-Konfiguration, DORA-Prozess und DHCP-Troubleshooting.",
        type: "quiz",
        order: 5,
        completed: false,
        quizId: "ccna-quiz-dhcp",
        hints: [],
      },
      {
        id: "s-cis2-7",
        title: "Quiz: Device Management (CDP/LLDP)",
        description: "Teste dein Wissen über CDP, LLDP, NTP, Syslog und andere Management-Protokolle.",
        type: "quiz",
        order: 6,
        completed: false,
        quizId: "ccna-quiz-device-management",
        hints: [],
      },
      {
        id: "s-cis2-8",
        title: "Dynamisches Routing: RIP/RIPv2",
        description: "**RIP (Routing Information Protocol):**\n\n**Eigenschaften:**\n- Distance-Vector-Protokoll\n- Metrik: Hop-Count (max. 15, 16 = unendlich/unreachable)\n- Update-Timer: 30 Sekunden (komplette Tabelle)\n- AD: 120\n\n**RIPv1 vs. RIPv2:**\n| Eigenschaft | RIPv1 | RIPv2 |\n|-------------|-------|-------|\n| Klassen | Classful | Classless |\n| Subnetzmaske | Nicht gesendet | Mitgesendet |\n| VLSM | Nein | Ja |\n| Multicast | Broadcast | 224.0.0.9 |\n\n**Konfiguration RIPv2:**\n```\nrouter rip\n  version 2\n  network 10.0.0.0\n  no auto-summary\n```\n\n**Loop-Verhütung:** Split Horizon, Route Poisoning, Holddown-Timer (180s), Flush-Timer (240s)",
        type: "info",
        order: 7,
        completed: false,
        hints: [],
      },
      {
        id: "s-cis2-9",
        title: "Quiz: RIP/RIPv2 & dynamisches Routing",
        description: "Teste dein Wissen über RIP-Metrik, Timer, RIPv1 vs RIPv2, VLSM und Loop-Verhütung.",
        type: "quiz",
        order: 8,
        completed: false,
        quizId: "ccna-quiz-rip",
        hints: [],
      },
      {
        id: "s-cis2-10",
        title: "Administrative Distanz & Floating Static",
        description: "**Administrative Distanz (AD) – Vertrauenswürdigkeit der Routing-Quelle:**\n\n| Quelle | AD |\n|--------|----|\n| Connected | 0 |\n| Static | 1 |\n| EIGRP intern | 90 |\n| OSPF | 110 |\n| RIP | 120 |\n| EIGRP extern | 170 |\n| Unbekannt | 255 |\n\n**Routenauswahl:** Longest Match → AD → Metrik\n\n**Floating Static Route (Backup):**\n```\n# OSPF (AD 110) ist primär\n# Floating Static als Backup (AD 150 > 110):\nip route 192.168.2.0 255.255.255.0 10.0.0.2 150\n```\nDie statische Route ist inaktiv, solange OSPF läuft. Bei OSPF-Ausfall übernimmt die Floating Static Route automatisch.",
        type: "info",
        order: 9,
        completed: false,
        hints: [],
      },
      {
        id: "s-cis2-11",
        title: "Quiz: Administrative Distanz & Floating Static",
        description: "Teste dein Wissen über die AD-Tabelle, Routenauswahl-Logik und Floating Static Routes.",
        type: "quiz",
        order: 10,
        completed: false,
        quizId: "ccna-quiz-admin-distance",
        hints: [],
      },
      {
        id: "s-cis2-12",
        title: "ACLs: Standard & Erweitert",
        description: "**Access Control Lists (ACLs):**\n\n**Standard ACL** (Nummern 1-99, 1300-1999):\n- Filtert nur Quell-IP\n- Platzierung: nah am Ziel\n```\naccess-list 10 deny 192.168.1.0 0.0.0.255\naccess-list 10 permit any\ninterface G0/0\n  ip access-group 10 out\n```\n\n**Erweiterte ACL** (100-199, 2000-2699):\n- Filtert: Quell-IP, Ziel-IP, Protokoll, Port\n- Platzierung: nah an der Quelle\n```\naccess-list 110 deny tcp 10.0.0.0 0.0.0.255 any eq 80\naccess-list 110 permit ip any any\n```\n\n**Named ACL:**\n```\nip access-list extended BLOCK_HTTP\n  deny tcp 10.0.0.0 0.0.0.255 any eq 80\n  permit ip any any\n```\n\n⚠️ **Implizites 'deny any'** am Ende jeder ACL!",
        type: "info",
        order: 11,
        completed: false,
        hints: [],
      },
      {
        id: "s-cis2-13",
        title: "Quiz: ACLs – Access Control Lists",
        description: "Teste dein Wissen über Standard-ACLs, Erweiterte ACLs, Named ACLs und Wildcard-Masken.",
        type: "quiz",
        order: 12,
        completed: false,
        quizId: "ccna-quiz-acl",
        hints: [],
      },
      {
        id: "s-cis2-14",
        title: "CIS2 Klausurvorbereitung",
        description: "25 Fragen quer durch alle CIS2-Themen: Subnetting Class B, Routing, DHCP, CDP, RIP, Admin Distance und ACLs.",
        type: "quiz",
        order: 13,
        completed: false,
        quizId: "ccna-quiz-cis2-klausur",
        hints: [],
      },
      {
        id: "s-cis2-15",
        title: "CIS2 abgeschlossen",
        description: "**Glückwunsch zum Abschluss von CIS2!**\n\nDu hast folgende Themen gelernt:\n\n✅ Subnetting Class B & Magic Numbers\n✅ Statisches Routing & Routingtabelle\n✅ DHCP-Konfiguration & DORA-Prozess\n✅ CDP & LLDP\n✅ RIP/RIPv2 & dynamisches Routing\n✅ Administrative Distanz\n✅ Floating Static Routes\n✅ ACLs Standard & Erweitert\n\n**Nächster Schritt:** CIS3 – Sicherheit & Protokolle",
        type: "checkpoint",
        order: 14,
        completed: false,
        hints: [],
      },
    ],
  },

  // ── CIS3: Sicherheit & Protokolle ───────────────────────
  "lp-cis3-2026": {
    id: "lp-cis3-2026",
    title: "CIS3 – Protokolle & Sicherheit (08.06–19.06.2026)",
    description: "Strukturierter Lernpfad für CIS-Baustein 3: ACLs Extended/Named, NAT/PAT, EtherChannel, STP/RSTP, Port Security, OSPF, EIGRP und HSRP.",
    subject: "FISI",
    difficulty: "advanced",
    estimatedMinutes: 180,
    tags: ["CCNA", "CIS3", "OSPF", "EIGRP", "NAT", "STP", "PortSecurity", "HSRP", "EtherChannel"],
    createdAt: NOW,
    updatedAt: NOW,
    steps: [
      {
        id: "s-cis3-1",
        title: "ACLs Vertiefung: Named & Extended",
        description: "**Named Extended ACLs – Vertiefung:**\n\nVorteile Named ACLs:\n- Beschreibender Name statt Nummer\n- Einzelne Einträge bearbeiten/löschen möglich\n- Sequenznummern: `ip access-list resequence`\n\n```\nip access-list extended ALLOW_WEB\n  10 permit tcp 192.168.1.0 0.0.0.255 any eq 80\n  20 permit tcp 192.168.1.0 0.0.0.255 any eq 443\n  30 deny ip any any log\n```\n\n**Wildcard-Masken:**\n- `0.0.0.0` = exakter Host (`host 192.168.1.1`)\n- `0.0.0.255` = ganzes /24 Netz\n- `255.255.255.255` = alle Hosts (`any`)\n\n**Platzierungsregel:**\n- Standard ACL: nah am Ziel\n- Extended ACL: nah an der Quelle",
        type: "info",
        order: 0,
        completed: false,
        hints: [],
      },
      {
        id: "s-cis3-2",
        title: "Quiz: ACLs (Wiederholung & Vertiefung)",
        description: "Vertiefende Fragen zu Named ACLs, Extended ACLs, Wildcard-Masken und Placement-Regeln.",
        type: "quiz",
        order: 1,
        completed: false,
        quizId: "ccna-quiz-acl",
        hints: [],
      },
      {
        id: "s-cis3-3",
        title: "NAT & PAT",
        description: "**NAT (Network Address Translation):**\n\n**Terminologie:**\n| Begriff | Bedeutung |\n|---|---|\n| inside local IP | Private IP des internen Hosts (z. B. 192.168.1.10) |\n| inside global IP | Öffentliche IP, die den Host nach außen repräsentiert |\n| outside local IP | Ziel-IP aus Sicht des inside-Netzes |\n| outside global IP | Echte öffentliche IP des Ziels |\n\n**Static NAT:** 1:1-Zuordnung, dauerhaft — **bidirektional** (von innen UND von außen erreichbar)\n```\nip nat inside source static 192.168.1.10 203.0.113.5\n```\n\n**Dynamic NAT:** Pool öffentlicher IPs (one-to-one, temporär)\n```\nip nat pool PUBLIC 203.0.113.1 203.0.113.10 netmask 255.255.255.0\nip nat inside source list 1 pool PUBLIC\n```\n\n**PAT / NAT Overload:** Viele intern → eine öffentliche IP (one-to-many)\n```\nip nat inside source list 1 interface G0/0 overload\n```\n⚠️ **`overload`-Keyword zwingend für PAT!** Ohne es → Dynamic NAT (one-to-one)\n\n**Interface-Markierung:**\n```\ninterface G0/0  → ip nat outside   (Richtung Internet)\ninterface G0/1  → ip nat inside    (Richtung LAN)\n```\n\n⚠️ **Vor Konfigurationsänderungen:** `clear ip nat translation *` — sonst können bestehende Einträge nicht gelöscht werden!",
        type: "info",
        order: 2,
        completed: false,
        hints: [],
      },
      {
        id: "s-cis3-4",
        title: "Quiz: NAT & PAT",
        description: "Teste dein Wissen über Static NAT, Dynamic NAT, PAT/Overload und die Konfiguration.",
        type: "quiz",
        order: 3,
        completed: false,
        quizId: "ccna-quiz-nat",
        hints: [],
      },
      {
        id: "s-cis3-5",
        title: "EtherChannel (LACP & PAgP)",
        description: "**EtherChannel:** Bündelt 2–8 physische Links zu einem logischen Link\n\n**Vorteile:**\n- Höhere Bandbreite (aggregiert)\n- Redundanz (ein Port down → andere übernehmen)\n- STP sieht nur einen Link (kein Blockieren)\n\n**Protokolle & Modi:**\n| Protokoll | Modus A | Modus B | Channel? |\n|---|---|---|---|\n| PAgP (Cisco) | desirable | desirable | ✅ JA |\n| PAgP (Cisco) | desirable | auto | ✅ JA |\n| **PAgP (Cisco)** | **auto** | **auto** | ❌ **KEIN Channel!** |\n| LACP (IEEE) | active | active | ✅ JA |\n| LACP (IEEE) | active | passive | ✅ JA |\n| **LACP (IEEE)** | **passive** | **passive** | ❌ **KEIN Channel!** |\n\n⚠️ **Prüfungsfalle:** `auto+auto` (PAgP) und `passive+passive` (LACP) bauen keinen Channel auf — beide Seiten warten passiv!\n\n**Konfiguration:**\n```\ninterface range G0/0-3\n  channel-group 1 mode active   # LACP active\ninterface Port-channel 1\n  switchport mode trunk\n```\n\n**Anforderungen:** Alle Ports müssen identische Speed, Duplex, Mode, native VLAN und allowed VLANs haben. LACP funktioniert nur mit **full-duplex**.",
        type: "info",
        order: 4,
        completed: false,
        hints: [],
      },
      {
        id: "s-cis3-6",
        title: "Quiz: EtherChannel (LACP & PAgP)",
        description: "Teste dein Wissen über EtherChannel-Konfiguration, LACP, PAgP und Anforderungen.",
        type: "quiz",
        order: 5,
        completed: false,
        quizId: "ccna-quiz-etherchannel",
        hints: [],
      },
      {
        id: "s-cis3-7",
        title: "STP/RSTP, PortFast & BPDU-Guard",
        description: "**STP (Spanning Tree Protocol 802.1D):**\n- Verhindert Layer-2-Loops in redundanten Netzwerken\n- Root Bridge: niedrigste Bridge-ID (Priorität + MAC)\n- Port-Zustände: Blocking → Listening (15s) → Learning (15s) → Forwarding\n\n**RSTP (802.1w):** Rapid Spanning Tree\n- Konvergiert in Sekunden (statt 30-50s bei STP)\n- Neue Port-Rollen: Alternate Port (Backup für Root Port)\n\n**PortFast:**\n- Überspringt STP-Listening/Learning → sofort Forwarding\n- Nur für Access-Ports mit Endgeräten!\n```\nspanning-tree portfast\n```\n\n**BPDU-Guard:**\n- Deaktiviert Port (err-disable) bei BPDU-Empfang\n- Schützt PortFast-Ports vor versehentlichem Switch-Anschluss\n```\nspanning-tree bpduguard enable\n```",
        type: "info",
        order: 6,
        completed: false,
        hints: [],
      },
      {
        id: "s-cis3-8",
        title: "Quiz: STP & RSTP",
        description: "Teste dein Wissen über STP, Root Bridge, Port-Zustände, RSTP und PortFast/BPDU-Guard.",
        type: "quiz",
        order: 7,
        completed: false,
        quizId: "ccna-quiz-stp",
        hints: [],
      },
      {
        id: "s-cis3-9",
        title: "Quiz: Port Security",
        description: "Teste dein Wissen über Port Security, Sticky MAC, Violation-Modi und 802.1X.",
        type: "quiz",
        order: 8,
        completed: false,
        quizId: "ccna-quiz-port-security",
        hints: [],
      },
      {
        id: "s-cis3-10",
        title: "OSPF Grundlagen & Konfiguration",
        description: "**OSPF (Open Shortest Path First):**\n\n**Eigenschaften:**\n- Link-State-Protokoll, Dijkstra SPF-Algorithmus\n- ⚠️ **IP-Protokoll 89** (kein TCP, kein UDP!) — Prüfungsfalle!\n- AD: 110, Metrik: **Cost = 10⁸ / Bandbreite (bps)**\n  - FastEthernet (100 Mbps): Cost = **1**\n  - GigabitEthernet (1 Gbps): Cost = **1** (identisch! Prüfungsfalle)\n  - 10 Mbps: Cost = 10\n- Keine Hop-Begrenzung, schnelle Konvergenz durch LSAs\n\n**OSPF verwaltet 3 Tabellen:**\n1. Neighbor Table (Hello-Protokoll)\n2. LSDB — Link State Database (vollständige Topologie)\n3. Routing Table (Dijkstra-Ergebnis)\n\n**Konfiguration:**\n```\nrouter ospf 1\n  network 10.0.0.0 0.0.0.255 area 0      ← Wildcard-Maske!\n  network 192.168.1.0 0.0.0.255 area 0\n  passive-interface G0/1                  ← keine OSPF-Hellos\n```\n⚠️ **`network`-Befehl nutzt Wildcard-Maske** (nicht Subnetzmaske!)\n\n**Neighbor-Zustände — Prüfungsfalle:**\n- **Two-Way** = Router sieht sich gegenseitig in Hello-Paketen ≠ Adjacency!\n- **Full** = LSDB vollständig synchronisiert = echte Adjacency\n\n**DR/BDR (Multi-Access-Netze):**\n- DR/BDR werden per Wahl bestimmt (höchste Priority → DR)\n- ⚠️ **Non-preemptive:** Neuer Router mit höherer Priority verdrängt DR nicht!\n\n**OSPF Areas:**\n- Area 0 = Backbone (alle anderen Areas müssen verbunden sein)\n- ABR = Area Border Router (verbindet Areas)\n- ASBR = AS Boundary Router (redistributiert externe Routen)\n\n**Router-ID:** Manuell > Loopback-IP > höchste Interface-IP",
        type: "info",
        order: 9,
        completed: false,
        hints: [],
      },
      {
        id: "s-cis3-11",
        title: "Quiz: OSPF",
        description: "Teste dein Wissen über OSPF-Grundlagen, Areas, LSA-Typen, Router-Rollen und Konfiguration.",
        type: "quiz",
        order: 10,
        completed: false,
        quizId: "ccna-quiz-ospf",
        hints: [],
      },
      {
        id: "s-cis3-12",
        title: "EIGRP Grundlagen",
        description: "**EIGRP (Enhanced IGRP):**\n\n**Eigenschaften:**\n- Advanced Distance-Vector (Hybrid)\n- Algorithmus: DUAL (Diffusing Update Algorithm)\n- AD: 90 intern / 170 extern\n- Multicast: 224.0.0.10\n- IP-Protokoll: 88\n\n**Konfiguration:**\n```\nrouter eigrp 100\n  network 10.0.0.0 0.0.0.255\n  network 192.168.1.0 0.0.0.255\n```\n\n**DUAL-Konzepte:**\n- **Successor:** Beste Route (in Routing-Tabelle)\n- **Feasible Successor:** Backup-Route (erfüllt FC)\n- **Feasibility Condition:** RD(FS) < FD(Successor)\n- **FD:** Gesamtmetrik vom Router zum Ziel\n- **RD:** Metrik des Nachbarn zum Ziel\n\n**Vorteil:** Sofortige Umschaltung auf FS ohne Neuberechnung!",
        type: "info",
        order: 11,
        completed: false,
        hints: [],
      },
      {
        id: "s-cis3-13",
        title: "Quiz: EIGRP",
        description: "Teste dein Wissen über EIGRP, DUAL-Algorithmus, Successor/Feasible Successor und Konfiguration.",
        type: "quiz",
        order: 12,
        completed: false,
        quizId: "ccna-quiz-eigrp",
        hints: [],
      },
      {
        id: "s-cis3-14",
        title: "HSRP & FHRP",
        description: "**FHRP (First Hop Redundancy Protocols):**\n\nProblem: Hosts haben einen statischen Default-Gateway. Fällt dieser Router aus → Konnektivitätsverlust.\n\n**HSRP (Hot Standby Router Protocol):**\n- Cisco-proprietär, UDP-Port 1985\n- Virtuelle MAC: `0000.0c07.ac**XX**` (HSRPv1)\n- Active Router: höchste Priorität (Standard: 100)\n- Hello: 3s, Hold: 10s\n- ⚠️ **Preemption standardmäßig DEAKTIVIERT** — muss explizit aktiviert werden!\n\n**VRRP (Virtual Router Redundancy Protocol):**\n- Offener Standard (RFC 2338)\n- ⚠️ **IP-Protokoll 112** (kein UDP!) — Prüfungsfalle!\n- Virtuelle MAC: `0000.5e00.01**XX**`\n- ⚠️ **Preemption standardmäßig AKTIVIERT**\n\n**GLBP (Gateway Load Balancing Protocol):**\n- Cisco-proprietär + echtes Load Balancing\n- **AVG** (Active Virtual Gateway): vergibt virtuelle MACs\n- **AVF** (Active Virtual Forwarder): leitet Traffic weiter (bis 4 Router)\n- Virtuelle MAC: `0007.b400.**XX**`\n\n**Protokoll-Übersicht:**\n| Protokoll | Typ | Preemption | Transport | Virt. MAC |\n|---|---|---|---|---|\n| HSRP | Cisco | OFF default | UDP 1985 | 0000.0c07.acXX |\n| VRRP | Offen | ON default | IP Proto 112 | 0000.5e00.01XX |\n| GLBP | Cisco | OFF default | UDP 3222 | 0007.b400.XX |\n\n**Konfiguration HSRP:**\n```\ninterface G0/0\n  ip address 192.168.1.2 255.255.255.0\n  standby 1 ip 192.168.1.1      # virtuelle IP\n  standby 1 priority 110        # höher = Active\n  standby 1 preempt             # Preemption aktivieren!\n```",
        type: "info",
        order: 13,
        completed: false,
        hints: [],
      },
      {
        id: "s-cis3-15",
        title: "Quiz: FHRP (HSRP / VRRP / GLBP)",
        description: "Teste dein Wissen über HSRP, VRRP, GLBP und Gateway-Redundanz.",
        type: "quiz",
        order: 14,
        completed: false,
        quizId: "ccna-quiz-fhrp",
        hints: [],
      },
      {
        id: "s-cis3-16",
        title: "CIS3 Klausurvorbereitung",
        description: "25 Fragen quer durch alle CIS3-Themen: ACLs, NAT/PAT, EtherChannel, STP, OSPF, EIGRP, HSRP und Port Security.",
        type: "quiz",
        order: 15,
        completed: false,
        quizId: "ccna-quiz-cis3-klausur",
        hints: [],
      },
      {
        id: "s-cis3-17",
        title: "CIS3 abgeschlossen – CCNA fertig!",
        description: "**Glückwunsch zum Abschluss von CIS3!**\n\nDu hast alle drei CIS-Bausteine abgeschlossen:\n\n✅ **CIS1:** Cisco Hardware, CLI, OSI, VLANs, Switching, Subnetting\n✅ **CIS2:** Routing, DHCP, CDP/LLDP, RIP, Admin Distance, ACLs\n✅ **CIS3:** NAT/PAT, EtherChannel, STP/RSTP, Port Security, OSPF, EIGRP, HSRP\n\n**Nächster Schritt:** CCNA 200-301 Prüfungssimulation für die finale Vorbereitung!",
        type: "checkpoint",
        order: 16,
        completed: false,
        hints: [],
      },
    ],
  },
};
