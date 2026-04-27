// ============================================================
// AZ-900 Topic 5: Azure Storage Services
// Domain 2: Azure Architecture and Services (~35-40%)
// Outline: "Describe Azure storage services"
// Sources: learn.microsoft.com/azure/storage/blobs,
//          learn.microsoft.com/azure/storage/files,
//          learn.microsoft.com/azure/storage/common/storage-redundancy,
//          learn.microsoft.com/azure/databox,
//          learn.microsoft.com/azure/migrate
// ============================================================

import type { Concept, Topic } from "@/lib/content/types";
import type { Quiz, Question } from "@/lib/types";

// ── Concepts ─────────────────────────────────────────────────

export const CONCEPT_AZURE_STORAGE_TYPES: Concept = {
  id: "azure-storage-types",
  title: "Azure Storage-Dienste: Blob, Files, Queue, Table, Disk",
  appliesTo: ["az-900", "az-104"],
  tags: ["azure", "storage", "blob", "files", "queue", "table", "disk", "iaas", "paas"],
  content: `
## Azure Storage Account und Storage-Typen

Ein **Azure Storage Account** ist der Einstiegspunkt für alle Azure-Speicherdienste.
Pro Storage Account können Blob, Files, Queue und Table Storage gleichzeitig genutzt
werden. Jedes Storage Account hat einen global eindeutigen Namen.

### 1. Azure Blob Storage

Blob Storage ist Azures Object Storage für unstrukturierte Daten:

- Dokumente, Bilder, Videos, Backups, Log-Dateien, VM-Disk-Images
- Zugriff über HTTP/HTTPS (REST-API, SDKs, AzCopy)
- Keine Ordnerstruktur im klassischen Sinn — nur Container + Blob-Name
- Drei Blob-Typen:
  - **Block Blobs**: Dateien (das ist der Normalfall — Dokumente, Bilder, etc.)
  - **Append Blobs**: Log-Dateien (nur Anhängen, kein Überschreiben)
  - **Page Blobs**: VM-Disks (random read/write optimiert)

**Access-Tiers für Block Blobs** (Prüfungsrelevant):

| Tier | Zugriffsfrequenz | Min. Aufbewahrung | Early Deletion Fee | Zugriffskosten |
|------|-----------------|-------------------|--------------------|----------------|
| **Hot** | Häufig | Keine | Keine | Niedrigste |
| **Cool** | Selten (≥ 30 Tage) | 30 Tage | Anteilig für fehlende Tage | Mittlere |
| **Cold** | Sehr selten (≥ 90 Tage) | 90 Tage | Anteilig für fehlende Tage | Höhere |
| **Archive** | Extrem selten (≥ 180 Tage) | 180 Tage | Anteilig für fehlende Tage | Höchste + Rehydrierung |

**Early Deletion Fee (Frühzeitige Löschgebühr)**: Wenn ein Blob im Cool, Cold oder
Archive-Tier gelöscht, verschoben oder in den Hot-Tier umgestuft wird, bevor die
Mindestaufbewahrungszeit abgelaufen ist, fällt eine anteilige Gebühr für die restlichen
Tage an. Hot-Tier hat keine Mindestaufbewahrung — keine Early Deletion Fee.

Beispiel: Ein Blob liegt seit 10 Tagen im Cool-Tier und wird gelöscht.
→ Cool hat 30 Tage Mindestaufbewahrung → es fallen Gebühren für 20 noch ausstehende Tage an.

> **Cold-Tier-Hinweis**: Der Cold-Tier wurde 2023 eingeführt und ist in manchen
> älteren Lernmaterialien noch nicht enthalten. Aktuelle AZ-900-Prüfungen kennen
> vier Tiers: Hot, Cool, Cold, Archive.

**Archive-Rehydrierung**: Daten im Archive-Tier sind nicht direkt zugreifbar —
sie müssen erst "rehydriert" (in Hot oder Cool verschoben) werden. Das dauert
je nach Rehydrierungspriorität Stunden bis zu einem Tag.

### 2. Azure Files

Azure Files ist ein vollständig verwalteter Cloud-Dateispeicher:
- Unterstützt SMB (3.0/2.1) und NFS-Protokolle
- Einbindbar als Netzlaufwerk unter Windows, Linux und macOS
- **Azure File Sync**: Synchronisiert On-Premises-Windows-Server-Dateien mit
  Azure Files (Cloud-Tiering: selten genutzte Dateien werden automatisch nach
  Azure ausgelagert, erscheinen aber weiterhin lokal als Dateisystem)
- Einsatz: Migrieren von On-Premises-Dateiservern, geteilte Konfigurationsdateien
  für mehrere VMs, Lift-and-Shift von Anwendungen, die SMB-Shares brauchen

### 3. Azure Queue Storage

Queue Storage ist ein Nachrichten-Warteschlangendienst:
- Speichert Millionen von Nachrichten (bis zu 64 KB pro Nachricht)
- Entkopplung von Anwendungskomponenten (Producer/Consumer-Muster)
- Nachrichten bleiben bis zu 7 Tage in der Queue
- Einsatz: Asynchrone Verarbeitung, Task-Queues, Entkopplung von Microservices

### 4. Azure Table Storage

Table Storage ist ein NoSQL-Schlüssel-Wert-Speicher:
- Speichert strukturierte, nicht-relationale Daten
- Keine feste Schema — flexible Datensätze
- Günstig für sehr große Datenmengen mit einfachen Abfragen
- Prüfungshinweis: Für komplexere NoSQL-Anforderungen bietet Azure Cosmos DB
  mehr Features (Multi-Modell, globale Replikation, niedrigere Latenz)

### 5. Azure Disk Storage

Azure Disk Storage sind verwaltete Block-Disks für Azure VMs:

| Disk-Typ | Technologie | Einsatz |
|----------|-------------|---------|
| Ultra Disk | NVMe SSD | Datenbankserver, extrem I/O-intensiv |
| Premium SSD v2 | NVMe SSD | Produktions-Workloads, flexible IOPS |
| Premium SSD | SSD | Produktions-VMs, Standard |
| Standard SSD | SSD | Webserver, Dev/Test |
| Standard HDD | HDD | Backup, Archiv, nicht-kritische Workloads |

Hinweis: Der Disk-Typ beeinflusst den VM-SLA (Premium SSD Voraussetzung für 99,9%+).
  `.trim(),
};

export const CONCEPT_AZURE_STORAGE_REDUNDANCY: Concept = {
  id: "azure-storage-redundancy",
  title: "Azure Storage-Redundanz: LRS, ZRS, GRS, GZRS",
  appliesTo: ["az-900", "az-104"],
  tags: ["azure", "storage", "redundancy", "lrs", "zrs", "grs", "gzrs", "disaster-recovery"],
  content: `
## Azure Storage-Redundanzoptionen

Azure Storage repliziert immer mehrere Kopien deiner Daten für Ausfallsicherheit.
Die Redundanzoptionen unterscheiden sich in Schutzumfang und Kosten.

### Primärregion-Redundanz

| Option | Abkürzung | Kopien | Schutz vor |
|--------|-----------|--------|-----------|
| Locally Redundant Storage | **LRS** | 3× im selben DC | Hardware-Ausfall im DC |
| Zone-Redundant Storage | **ZRS** | 3× über Availability Zones | DC-Ausfall (AZ-Ausfall) |

**LRS**: Günstigste Option. 3 Kopien synchron im selben Rechenzentrum.
Kein Schutz bei DC-Ausfall (Brand, Überflutung des Gebäudes).

**ZRS**: 3 Kopien synchron über 3 Availability Zones. Schützt auch gegen
DC-Ausfall. Nur in Regionen mit Availability Zones verfügbar.

### Georedundanz (Primär + Sekundär-Region)

Georedundante Optionen replizieren Daten asynchron in die gepaarte Region
(oder eine konfigurierbare Region). Die Sekundärregion liegt mindestens
300 Meilen entfernt.

| Option | Abkürzung | Primärregion | Sekundärregion | Lesen im Failover |
|--------|-----------|-------------|----------------|-----------------|
| Geo-Redundant Storage | **GRS** | LRS (3× 1 DC) | LRS in Pair-Region | Nur nach Failover |
| Geo-Zone-Redundant Storage | **GZRS** | ZRS (3 AZs) | LRS in Pair-Region | Nur nach Failover |
| Read-Access GRS | **RA-GRS** | LRS | LRS in Pair-Region | Immer lesbar |
| Read-Access GZRS | **RA-GZRS** | ZRS | LRS in Pair-Region | Immer lesbar |

**GRS**: Kombiniert LRS in der Primärregion mit async Replikation in die gepaarte
Region. Im Failover-Fall sind die Daten in der Sekundärregion verfügbar.

**GZRS** (empfohlene Option für kritische Daten): ZRS in der Primärregion
(schützt gegen AZ-Ausfall) + Replikation in die Sekundärregion (schützt gegen
regionalen Ausfall).

**RA-GRS**: Wie GRS, aber der Sekundärendpunkt ist immer lesbar — auch ohne
Failover. Sinnvoll für Anwendungen mit globalen Lesezugriffen.

### Redundanz-Auswahlhilfe

\`\`\`
Brauche ich Geo-Redundanz (regionaler Ausfall)?
  Nein → Brauche ich AZ-Schutz?
    Nein → LRS (günstig, 1 DC)
    Ja  → ZRS (AZ-resistent)
  Ja  → Brauche ich AZ-Schutz in der Primärregion?
    Nein → GRS oder RA-GRS (wenn Sekundär-Lesen nötig)
    Ja  → GZRS oder RA-GZRS (empfohlen für kritische Workloads)
\`\`\`

### RPO und Georedundanz

Bei Georedundanz ist die asynchrone Replikation kein Echtzeit-Spiegel.
Der **Recovery Point Objective (RPO)** bei GRS/GZRS beträgt weniger als 15 Minuten
für die meisten Daten (Microsoft-Zielvorgabe), aber eine bestimmte Garantie
wird nicht vertraglich zugesagt. Bei einem Failover können die jüngsten
Schreibvorgänge verloren gehen.
  `.trim(),
};

export const CONCEPT_AZURE_DATA_MOVEMENT: Concept = {
  id: "azure-data-movement",
  title: "Datenmigration: AzCopy, Storage Explorer, Azure Migrate, Data Box",
  appliesTo: ["az-900"],
  tags: ["azure", "storage", "azcopy", "migration", "data-box", "azure-migrate", "file-sync"],
  content: `
## Daten nach Azure bewegen

Azure bietet verschiedene Werkzeuge je nach Datenmenge, Netzwerkbandbreite
und Migrationsziel.

### AzCopy

AzCopy ist ein Kommandozeilen-Tool für den Transfer von Blobs und Dateien:
- Hochperformant, unterstützt parallele Uploads/Downloads
- Läuft auf Windows, Linux, macOS
- Authentifizierung via SAS-Token oder Microsoft Entra ID
- Typische Nutzung: Skripte, CI/CD-Pipelines, Massen-Datenmigrationen
- Kann auch zwischen zwei Storage Accounts kopieren (Server-side copy)

Beispiel-Befehl (konzeptionell):
\`\`\`
azcopy copy 'C:\\Daten\\*' 'https://myaccount.blob.core.windows.net/container'
\`\`\`

### Azure Storage Explorer

Storage Explorer ist eine grafische Desktop-Applikation:
- Windows, macOS, Linux
- Drag-and-Drop für Blob, Files, Queues, Tables
- Geeignet für: manuelle Verwaltung, einmalige Dateitransfers, Debugging

### Azure File Sync

Azure File Sync synchronisiert On-Premises Windows Server mit Azure Files:
- **Cloud-Tiering**: Selten genutzte Dateien werden automatisch nach Azure
  ausgelagert, erscheinen aber lokal als normaler Dateisystemzugriff (ähnlich
  wie ein Offline-Attribut bei alten Windows-Offline-Ordnern)
- Mehrere Server können dieselbe Azure Files Share synchronisieren
- Einsatz: Migration von Dateiservern in die Cloud, Backup, Zentralisierung
  verteilter Standort-Dateien

### Azure Migrate

Azure Migrate ist das Migrations-Hub für die Verlagerung von On-Premises
Workloads nach Azure:
- **Discovery und Assessment**: Analysiert On-Premises-VMs (VMware, Hyper-V,
  physische Server) und empfiehlt Azure VM-Größen + Kostenabschätzung
- **Server Migration**: Repliziert und migriert VMs nach Azure (Lift-and-Shift)
- **Database Migration**: Migriert Datenbanken zu Azure SQL, Cosmos DB, etc.
- **Web App Migration**: Bewertet ASP.NET-Apps für Azure App Service Migration

Azure Migrate ist kein dauerhafter Dienst, sondern ein Migrations-Werkzeug.

### Azure Data Box

Azure Data Box löst das "Large Dataset"-Problem: Was tun, wenn Petabytes
an Daten zu übertragen sind, aber die Netzwerkbandbreite nicht ausreicht?

| Produkt | Kapazität | Übertragungsrichtung |
|---------|-----------|---------------------|
| **Data Box Disk** | Bis zu 35 TB (5 SSDs × 8 TB) | On-Premises → Azure |
| **Data Box** | 80 TB nutzbar | On-Premises → Azure |
| **Data Box Heavy** | 770 TB nutzbar | On-Premises → Azure |

**Ablauf**:
1. Microsoft schickt das verschlüsselte Gerät zu dir
2. Du kopierst Daten auf das Gerät (lokal, über Netzwerk)
3. Du schickst das Gerät zurück an Microsoft
4. Microsoft importiert die Daten in dein Azure Storage
5. Das Gerät wird sicher gelöscht

**Wann Data Box statt Netzwerktransfer?**
Als Faustregel: Wenn der Netzwerktransfer länger als 10 Tage dauern würde,
ist Data Box schneller und oft günstiger als Bandbreite zu bezahlen.

**Data Box Prüfungsfalle**: Data Box ist für den *Import* von On-Premises nach Azure
konzipiert (nicht umgekehrt als primärer Einsatz). Es gibt "Data Box Export"
für Fälle, wo Daten aus Azure zu On-Premises müssen (z.B. für Compliance-Audits).
  `.trim(),
};

export const CONCEPT_AZURE_STORAGE_GUIDE: Concept = {
  id: "azure-storage-guide",
  title: "Lernguide: Azure Storage",
  appliesTo: ["az-900"],
  tags: ["azure", "storage", "guide", "blob", "redundancy", "migration"],
  content: `
## Lernziele

- Die fünf Azure Storage-Typen und ihre Anwendungsfälle unterscheiden
- Blob-Access-Tiers (Hot/Cool/Cold/Archive) und ihre Kosten-Zugriffsfrequenz-Abwägung erklären
- LRS, ZRS, GRS, GZRS voneinander abgrenzen und für Szenarien auswählen
- AzCopy, Storage Explorer und Azure File Sync in ihren Anwendungsfällen einordnen
- Azure Migrate als Assessment- und Migrations-Werkzeug erklären
- Data Box als Offline-Bulk-Migrationslösung beschreiben

## Praxis-Szenario

Die "Hafen Logistics KG" betreibt ihre IT On-Premises und plant die Migration:

- **Archiv-Videomaterial** (150 TB, wird einmal jährlich für Revisionen benötigt):
  → Azure Blob Storage, Archive-Tier. Kein Internetzugang — Data Box für den
  initialen Upload der 150 TB.

- **Tagesoperative Dokumentenablage** (täglich genutzt, 2 TB):
  → Azure Blob Storage, Hot-Tier. AzCopy für tägliche Batch-Uploads.

- **Fileserver-Migration** (Windows Server 2019, 50 Mitarbeiter greifen auf
  SMB-Freigabe zu, 3 TB Daten):
  → Azure Files mit Azure File Sync. On-Premises-Server bleibt bestehen,
  Daten synchronisieren in die Cloud.

- **Kunden-Buchungsdaten** (kritisch, 99,99% DR-Anforderung):
  → Azure Blob Storage mit GZRS-Redundanz (ZRS in Primärregion +
  geo-redundante Replikation).

## Typische Prüfungsfallen

- ⚠️ **"Löschen aus Cool/Cold/Archive ist immer kostenlos"** — FALSCH.
  Cool (30T), Cold (90T) und Archive (180T) haben Mindestaufbewahrungszeiten.
  Frühzeitiges Löschen oder Tierwechsel löst eine **Early Deletion Fee** für
  die restlichen Tage aus. Nur Hot hat keine Mindestaufbewahrung.

- ⚠️ **"Archive-Daten sind sofort abrufbar"** — FALSCH. Archive-Tier erfordert
  Rehydrierung (Stunden, je nach Priorität). Für sofortigen Zugriff: Hot oder Cool.

- ⚠️ **"GRS = Echtzeit-Spiegel der Sekundärregion"** — FALSCH. GRS repliziert
  asynchron. Im Normalbetrieb ist der Sekundärendpunkt NICHT lesbar (außer RA-GRS).

- ⚠️ **"Azure Table Storage = Azure Cosmos DB"** — FALSCH. Table Storage ist ein
  einfacher NoSQL-Schlüssel-Wert-Speicher. Cosmos DB ist ein umfangreicher
  Multi-Modell-NoSQL-Dienst mit globalem Multi-Master und garantierten Latenzen.
  Cosmos DB ist teurer, leistungsfähiger und für komplexere Szenarien.

- ⚠️ **"Data Box ist ein Cloud-Dienst"** — FALSCH. Data Box ist ein physisches
  Gerät, das Microsoft zu dir schickt. Es ist eine "Offline"-Migrationslösung.

- ⚠️ **"AzCopy = Azure Storage Explorer"** — Beide übertragen Daten, aber AzCopy
  ist ein CLI-Tool für Skripte/Automatisierung, Storage Explorer ist eine GUI
  für manuelle Verwaltung.
  `.trim(),
};

// ── Quiz ─────────────────────────────────────────────────────

const AZURE_STORAGE_QUESTIONS: Question[] = [
  {
    id: "az900-storage-q1",
    type: "single-choice",
    points: 10,
    text: "Die 'Mediathek Rhein GmbH' speichert Archiv-Videos, die durchschnittlich einmal im Jahr für Audits abgerufen werden. Die Daten sollen so günstig wie möglich gespeichert werden, und ein Zugriff mit einigen Stunden Verzögerung ist akzeptabel. Welcher Blob-Tier ist geeignet?",
    explanation: "Der Archive-Tier ist für extrem selten abgerufene Daten mit der niedrigsten Speicherkosten. Daten im Archive-Tier sind offline und müssen erst rehydriert werden (Stunden). Da eine Verzögerung akzeptabel ist und die Zugriffshäufigkeit sehr gering, ist Archive die kostengünstigste und richtige Wahl.",
    answers: [
      { id: "a", text: "Hot — niedrigste Zugriffskosten, schnellster Zugriff", isCorrect: false },
      { id: "b", text: "Cool — günstiger als Hot, 30 Tage Mindestaufbewahrung", isCorrect: false },
      { id: "c", text: "Cold — sehr selten genutzter Tier, 90 Tage Mindestaufbewahrung", isCorrect: false },
      { id: "d", text: "Archive — niedrigste Speicherkosten, Rehydrierung nötig", isCorrect: true },
    ],
  },
  {
    id: "az900-storage-q2",
    type: "single-choice",
    points: 10,
    text: "Ein Unternehmen benötigt maximalen Schutz für kritische Daten: Schutz gegen DC-Ausfall innerhalb der Region UND gegen einen vollständigen Ausfall der primären Azure-Region. Welche Redundanzoption bietet beides?",
    explanation: "GZRS (Geo-Zone-Redundant Storage) kombiniert ZRS in der Primärregion (Schutz gegen DC-/AZ-Ausfall) mit asynchroner Replikation in die gepaarte Region (Schutz gegen regionalen Ausfall). LRS und ZRS schützen nur lokal. GRS nutzt LRS (kein AZ-Schutz) in der Primärregion.",
    answers: [
      { id: "a", text: "LRS — 3 Kopien im selben Rechenzentrum", isCorrect: false },
      { id: "b", text: "ZRS — 3 Kopien über Availability Zones verteilt", isCorrect: false },
      { id: "c", text: "GRS — LRS in Primärregion + Replikation in Sekundärregion", isCorrect: false },
      { id: "d", text: "GZRS — ZRS in Primärregion + Replikation in Sekundärregion", isCorrect: true },
    ],
  },
  {
    id: "az900-storage-q3",
    type: "single-choice",
    points: 10,
    text: "Welcher Azure-Speicherdienst ist für die gemeinsame Nutzung von Dateien über SMB-Protokoll zwischen mehreren Azure VMs konzipiert?",
    explanation: "Azure Files ist der verwaltete Dateispeicher, der SMB 3.0/2.1 und NFS unterstützt. Mehrere VMs können dieselbe Azure Files Share gleichzeitig einbinden. Blob Storage ist Object Storage (kein SMB). Disk Storage sind individuelle VM-Disks (nicht geteilt).",
    answers: [
      { id: "a", text: "Azure Blob Storage — skalierbarster Speicher für alle Dateiarten", isCorrect: false },
      { id: "b", text: "Azure Disk Storage — hochperformante Block-Disks für VMs", isCorrect: false },
      { id: "c", text: "Azure Files — verwaltete SMB/NFS-Dateifreigabe für mehrere Nutzer", isCorrect: true },
      { id: "d", text: "Azure Queue Storage — Nachrichten-Warteschlange zwischen Diensten", isCorrect: false },
    ],
  },
  {
    id: "az900-storage-q4",
    type: "single-choice",
    points: 10,
    text: "Ein Unternehmen möchte 800 TB an Produktionsdaten nach Azure migrieren. Die Internetanbindung erlaubt maximal 1 Gbps Upload. Welche Option ist für diesen Datentransfer am praktischsten?",
    explanation: "800 TB bei 1 Gbps: 800 TB / (1 Gbps / 8 * 3600 * 24) ≈ 74 Tage Netzwerktransfer. Azure Data Box Heavy (770 TB) würde den Großteil in einem Durchgang abdecken. Microsoft schickt das physische Gerät, du kopierst lokal, schickst es zurück — deutlich schneller als 74 Tage Online-Transfer.",
    answers: [
      { id: "a", text: "AzCopy mit parallelen Uploads und maximaler Bandbreite", isCorrect: false },
      { id: "b", text: "Azure ExpressRoute — maximale Netzwerkbandbreite für Migrationen", isCorrect: false },
      { id: "c", text: "Azure Data Box Heavy — physisches Offline-Migrations-Gerät für große Datenmengen", isCorrect: true },
      { id: "d", text: "Azure Migrate — geeignet für Bulk-Datenmigration", isCorrect: false },
    ],
  },
  {
    id: "az900-storage-q5",
    type: "single-choice",
    points: 10,
    text: "Was ist Azure File Sync, und wofür wird es eingesetzt?",
    explanation: "Azure File Sync synchronisiert einen Windows Server On-Premises mit Azure Files. Das Cloud-Tiering-Feature lagert selten genutzte Dateien automatisch in Azure aus, die aber weiterhin als lokale Dateien sichtbar bleiben. Der On-Premises-Server bleibt als Einstiegspunkt bestehen — schrittweise Migration ohne erzwungenen Cut-Over.",
    answers: [
      { id: "a", text: "Ein Tool zum Synchronisieren von Azure Blob Storage zwischen zwei Storage Accounts", isCorrect: false },
      { id: "b", text: "Ein Dienst zum Synchronisieren eines Windows Server On-Premises mit Azure Files, mit Cloud-Tiering", isCorrect: true },
      { id: "c", text: "Eine Funktion, die Dateien automatisch zwischen Hot und Archive wechselt", isCorrect: false },
      { id: "d", text: "Ein Replikationsdienst für Azure Files zwischen zwei Azure-Regionen", isCorrect: false },
    ],
  },
  {
    id: "az900-storage-q6",
    type: "single-choice",
    points: 10,
    text: "Das Entwicklungsteam hat eine neue Version einer Webanwendung in einem Azure Blob Storage Container bereitgestellt. Ein Hotfix muss sofort live, und die Assets sollen weltweit mit minimaler Latenz ausgeliefert werden. Welches Tool wird für den schnellen, skriptbaren Upload der neuen Dateien eingesetzt?",
    explanation: "AzCopy ist das Kommandozeilen-Tool für hochperformante, skriptbare Dateiübertragungen zu Azure Storage. Es ist für Pipelines, CI/CD und Automatisierung ausgelegt. Azure Storage Explorer wäre die grafische Alternative für manuelle Transfers, nicht für automatisierte Deployments.",
    answers: [
      { id: "a", text: "Azure Storage Explorer — grafische Oberfläche für Uploads", isCorrect: false },
      { id: "b", text: "AzCopy — Kommandozeilen-Tool für performante, skriptbare Dateiübertragungen", isCorrect: true },
      { id: "c", text: "Azure Data Box — physisches Offline-Transfer-Gerät", isCorrect: false },
      { id: "d", text: "Azure Migrate — Migrations-Hub für Workloads", isCorrect: false },
    ],
  },
  {
    id: "az900-storage-q7",
    type: "multiple-choice",
    points: 15,
    text: "Welche ZWEI der folgenden Aussagen zu GRS (Geo-Redundant Storage) sind korrekt? (Wähle 2)",
    explanation: "GRS repliziert asynchron (nicht synchron) in die gepaarte Region (B korrekt). Im Normalbetrieb ist der Sekundärendpunkt NICHT lesbar — nur nach einem Failover oder bei RA-GRS (C korrekt). LRS in der Primärregion bedeutet 3 Kopien im selben DC (nicht über AZs — das wäre GZRS).",
    answers: [
      { id: "a", text: "GRS repliziert synchron in Echtzeit in die Sekundärregion", isCorrect: false },
      { id: "b", text: "GRS nutzt LRS (3 Kopien im selben DC) als Primärregion-Redundanz", isCorrect: true },
      { id: "c", text: "Bei Standard-GRS (nicht RA-GRS) ist der Sekundärendpunkt im Normalbetrieb nicht lesbar", isCorrect: true },
      { id: "d", text: "GRS schützt gegen den gleichzeitigen Ausfall aller Availability Zones in der Primärregion", isCorrect: false },
    ],
  },
  {
    id: "az900-storage-q8",
    type: "single-choice",
    points: 10,
    text: "Welcher Blob-Typ ist speziell für Anwendungen optimiert, die Daten nur anhängen (append), niemals überschreiben — wie z.B. Log-Dateien?",
    explanation: "Append Blobs sind für Szenarien optimiert, in denen nur Daten angehängt werden und bestehende Inhalte nicht verändert werden — typisch für Log-Dateien, Audit-Trails, Event-Streams. Block Blobs sind für allgemeine Dateien. Page Blobs sind für VM-Disks (random read/write).",
    answers: [
      { id: "a", text: "Block Blob — für allgemeine Dateien und Objekte", isCorrect: false },
      { id: "b", text: "Page Blob — optimiert für random read/write Zugriffe", isCorrect: false },
      { id: "c", text: "Append Blob — optimiert für reine Anhänge-Operationen", isCorrect: true },
      { id: "d", text: "Archive Blob — für selten genutzte, langfristige Speicherung", isCorrect: false },
    ],
  },
  {
    id: "az900-storage-q9",
    type: "single-choice",
    points: 10,
    text: "Ein Unternehmen möchte seine On-Premises-VMware-VMs nach Azure migrieren. Zuerst soll eine Analyse der aktuellen Umgebung erfolgen, um den Ressourcenbedarf zu bewerten und Azure VM-Größen zu empfehlen. Welcher Azure-Dienst übernimmt diese Discovery und Assessment-Phase?",
    explanation: "Azure Migrate ist das zentrale Hub für On-Premises-Migrationen. Es enthält Assessment-Tools, die VMware-, Hyper-V- und physische Server analysieren, Azure VM-Größen empfehlen und Kostenabschätzungen liefern. Data Box ist für Daten-Offline-Transfer, AzCopy für Datei-Transfer.",
    answers: [
      { id: "a", text: "Azure Data Box — physisches Gerät für VM-Migration", isCorrect: false },
      { id: "b", text: "Azure Site Recovery — für DR, nicht Assessment", isCorrect: false },
      { id: "c", text: "Azure Migrate — Discovery, Assessment und Migration von On-Premises-Workloads", isCorrect: true },
      { id: "d", text: "AzCopy — für den Transfer von VM-Disk-Images", isCorrect: false },
    ],
  },
  {
    id: "az900-storage-q10",
    type: "single-choice",
    points: 10,
    text: "Ein Blob wird nach 15 Tagen aus dem Cool-Tier gelöscht. Was passiert aus Kostensicht?",
    explanation: "Cool-Tier hat eine Mindestaufbewahrungsdauer von 30 Tagen. Wird ein Blob vor Ablauf dieser Frist gelöscht (oder in einen anderen Tier verschoben), fällt eine 'Early Deletion Fee' für die verbleibenden Tage an — hier 15 Tage. Hot-Tier hat keine Mindestaufbewahrung und damit keine Early Deletion Fee. Archive hat 180 Tage Mindestaufbewahrung.",
    answers: [
      { id: "a", text: "Keine Gebühren — beim Löschen wird die Speichergebühr sofort beendet", isCorrect: false },
      { id: "b", text: "Early Deletion Fee für die verbleibenden 15 Tage der Mindestaufbewahrungszeit", isCorrect: true },
      { id: "c", text: "Eine Strafgebühr, die dem doppelten Monatspreis des Cool-Tiers entspricht", isCorrect: false },
      { id: "d", text: "Das Blob wird automatisch in den Hot-Tier verschoben statt gelöscht", isCorrect: false },
    ],
  },
];

export const QUIZ_AZURE_STORAGE: Quiz = {
  id: "az900-quiz-azure-storage",
  title: "Quiz: Azure Storage Services",
  description: "Blob Storage, Azure Files, Redundanz (LRS/ZRS/GRS/GZRS), AzCopy, Azure Migrate, Data Box",
  passingScore: 70,
  shuffleQuestions: true,
  timeLimit: 600,
  questions: AZURE_STORAGE_QUESTIONS,
};

// ── Topic ─────────────────────────────────────────────────────

export const TOPIC_AZURE_STORAGE: Topic = {
  id: "azure-storage",
  title: "Azure Storage Services",
  description:
    "Blob Storage (Tiers: Hot/Cool/Cold/Archive), Azure Files, Queue, Table, Disk Storage. Redundanz: LRS, ZRS, GRS, GZRS. Datenmigration: AzCopy, File Sync, Azure Migrate, Data Box.",
  conceptIds: [
    "azure-storage-types",
    "azure-storage-redundancy",
    "azure-data-movement",
    "azure-storage-guide",
  ],
  quizIds: ["az900-quiz-azure-storage"],
  exerciseIds: [],
  prerequisiteTopicIds: ["azure-architecture"],
  estimatedMinutes: 75,
  tags: ["azure", "storage", "blob", "files", "redundancy", "migration"],
};

export const AZURE_STORAGE_CONCEPTS: Record<string, Concept> = {
  "azure-storage-types": CONCEPT_AZURE_STORAGE_TYPES,
  "azure-storage-redundancy": CONCEPT_AZURE_STORAGE_REDUNDANCY,
  "azure-data-movement": CONCEPT_AZURE_DATA_MOVEMENT,
  "azure-storage-guide": CONCEPT_AZURE_STORAGE_GUIDE,
};
