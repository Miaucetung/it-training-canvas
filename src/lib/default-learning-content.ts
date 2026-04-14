// ============================================================
// Default Learning Paths, Quizzes & Lab Scenarios
// Content sourced from azure-learning-app, md102-learning-app,
// linux-lpic-learning & homelab-academy
// ============================================================

import type { LearningPath, Quiz } from "./types";

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
};
