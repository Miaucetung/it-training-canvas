export type Tool =
  | "pen"
  | "eraser"
  | "rectangle"
  | "circle"
  | "line"
  | "arrow"
  | "text"
  | "select"
  | "shape"
  | "connection";

export type PenWidth = "thin" | "normal" | "thick";

export type TextSize = "small" | "medium" | "large" | "xlarge";

export type FontFamily = "IBM Plex Sans" | "IBM Plex Mono" | "Arial";

export type GridSize = "small" | "medium" | "large" | "xlarge";

export type GridPattern = "lines" | "dots" | "dashed";

export interface Point {
  x: number;
  y: number;
}

// Connection Point für Shape-Verbindungen
export interface ConnectionPoint {
  id: string;
  position: "top" | "right" | "bottom" | "left" | "center";
  offsetX: number; // Offset vom Shape-Zentrum (0-1)
  offsetY: number; // Offset vom Shape-Zentrum (0-1)
}

// Shape-bezogene Typen
export type ShapeCategory =
  | "network"
  | "cloud"
  | "server"
  | "storage"
  | "security"
  | "containers"
  | "arrows"
  | "diagrams"
  | "azure"
  | "aws"
  | "infrastructure";

export interface ShapeDefinition {
  id: string;
  name: string;
  category: ShapeCategory;
  icon: string;
  color: string;
  width: number;
  height: number;
  svgPath: string;
  label?: string;
}

export interface DrawingObject {
  id: string;
  type: Tool;
  color: string;
  width: number;
  points?: Point[];
  startPoint?: Point;
  endPoint?: Point;
  text?: string;
  fontSize?: number;
  fontFamily?: FontFamily;
  selected?: boolean;
  // Shape-spezifische Eigenschaften
  shapeId?: string;
  shapeWidth?: number;
  shapeHeight?: number;
  svgPath?: string;
  label?: string;
  // Neue Features
  rotation?: number; // Rotation in Grad (0-360)
  groupId?: string; // Gruppen-ID für gruppierte Objekte
  shadow?: boolean; // Schatten aktiviert
  shadowColor?: string; // Schatten-Farbe
  shadowBlur?: number; // Schatten-Unschärfe
  connectionPoints?: ConnectionPoint[]; // Verbindungspunkte
  connections?: { fromPoint: string; toObjectId: string; toPoint: string }[]; // Verbindungen zu anderen Shapes
  // Interaktive Properties (für Simulation)
  properties?: Record<string, any>; // Dynamische Properties für verschiedene Shape-Typen
  layer?: "background" | "default" | "foreground"; // Layer für Z-Index Kontrolle
  locked?: boolean; // Gesperrt für Bearbeitung
  visible?: boolean; // Sichtbarkeit
  // Phase 2: Shape States & Configuration
  status?: "running" | "stopped" | "error" | "pending" | "warning"; // Betriebsstatus
  config?: ShapeConfig; // Konfiguration (IP, Port, etc.)
  terminalHistory?: TerminalCommand[]; // Terminal-Verlauf
}

// Shape Configuration für verschiedene Gerätetypen
export interface ShapeConfig {
  // Netzwerk-Konfiguration
  ipAddress?: string;
  subnetMask?: string;
  gateway?: string;
  dns?: string[];
  mac?: string;
  hostname?: string;
  // Port-Konfiguration
  ports?: {
    port: number;
    protocol: string;
    service: string;
    status: "open" | "closed" | "filtered";
  }[];
  // Cloud-Konfiguration
  region?: string;
  instanceType?: string;
  storage?: number;
  cpu?: number;
  memory?: number;
  os?: string;
  // Container-Konfiguration
  image?: string;
  containerPort?: number;
  environment?: Record<string, string>;
  // Allgemeine Konfiguration
  description?: string;
  tags?: string[];

  // Phase 6: Advanced Networking
  interfaces?: NetworkInterface[];
  routingTable?: RoutingTable;
  arpTable?: ARPTable;
  vlans?: VLANConfig[];
  dhcpServer?: DHCPServerConfig;
  dnsServer?: DNSServerConfig;
  acls?: ACLConfig[];
  natConfig?: NATConfig;
  stpConfig?: STPConfig;
}

// Terminal Command History
export interface TerminalCommand {
  id: string;
  timestamp: number;
  command: string;
  output: string;
  exitCode: number;
}

// ============================================================
// Phase 3: Learning Engine Types
// ============================================================

// Lernpfad (Learning Path)
export interface LearningPath {
  id: string;
  title: string;
  description: string;
  subject: string;
  steps: LearningStep[];
  createdAt: number;
  updatedAt: number;
  difficulty: "beginner" | "intermediate" | "advanced";
  estimatedMinutes: number;
  tags: string[];
}

export interface LearningStep {
  id: string;
  title: string;
  description: string;
  type: "info" | "task" | "quiz" | "checkpoint";
  order: number;
  completed: boolean;
  // Für task-Steps: welche Shapes müssen platziert/konfiguriert werden
  requiredShapes?: RequiredShape[];
  // Für quiz-Steps: Referenz auf Quiz
  quizId?: string;
  // Hinweise für diesen Step
  hints: Hint[];
  // Validierungsregeln
  validationRules?: ValidationRule[];
}

export interface RequiredShape {
  shapeId: string; // Shape-Typ aus dem ShapePicker
  label?: string;
  requiredConfig?: Partial<ShapeConfig>;
  requiredStatus?: DrawingObject["status"];
  requiredConnections?: { targetShapeId: string; connectionType: string }[];
}

// Quiz-System
export interface Quiz {
  id: string;
  title: string;
  description: string;
  questions: Question[];
  passingScore: number; // 0-100
  moduleId?: string;
  timeLimit?: number; // Sekunden, optional
  shuffleQuestions: boolean;
}

export interface Question {
  id: string;
  type:
    | "single-choice"
    | "multiple-choice"
    | "text-input"
    | "drag-drop"
    | "true-false";
  text: string;
  explanation: string;
  points: number;
  answers: Answer[];
  imageUrl?: string;
  blueprint?: string;
}

export interface Answer {
  id: string;
  text: string;
  isCorrect: boolean;
}

// Validierung & Scoring
export interface ValidationRule {
  id: string;
  type:
    | "shape-exists"
    | "shape-configured"
    | "connection-exists"
    | "status-check"
    | "custom";
  description: string;
  // Parameter je nach Typ
  shapeType?: string;
  expectedConfig?: Partial<ShapeConfig>;
  expectedStatus?: string;
  sourceShapeLabel?: string;
  targetShapeLabel?: string;
  connectionType?: string;
  customValidator?: string; // Name der Custom-Validierungsfunktion
  points: number;
}

export interface ValidationResult {
  ruleId: string;
  passed: boolean;
  message: string;
  points: number;
}

export interface ScoreResult {
  totalPoints: number;
  maxPoints: number;
  percentage: number;
  passed: boolean;
  results: ValidationResult[];
  completedAt: number;
}

// Hint-System
export interface Hint {
  id: string;
  level: 1 | 2 | 3; // 1 = leichter Hinweis, 3 = fast Lösung
  text: string;
  pointsDeduction: number; // Punktabzug wenn Hinweis genutzt
}

// Progress Tracking
export interface UserProgress {
  pathId: string;
  currentStepIndex: number;
  completedSteps: string[]; // Step-IDs
  quizScores: Record<string, ScoreResult>; // Quiz-ID -> Score
  hintsUsed: Record<string, string[]>; // Step-ID -> Hint-IDs used
  startedAt: number;
  lastActivityAt: number;
  totalTimeSpent: number; // Sekunden
  overallScore: number;
}

// ============================================================
// Phase 6: Advanced Networking Types
// ============================================================

// Routing Table
export interface RoutingTableEntry {
  destination: string; // Network address (e.g., "192.168.1.0")
  netmask: string; // Subnet mask (e.g., "255.255.255.0")
  nextHop: string; // Next hop IP or "directly connected"
  interface: string; // Interface name (e.g., "eth0", "Gi0/0")
  metric: number; // Route metric (lower = preferred)
  protocol: "static" | "connected" | "ospf" | "rip" | "bgp";
}

export interface RoutingTable {
  entries: RoutingTableEntry[];
}

// ARP Table
export interface ARPEntry {
  ipAddress: string;
  macAddress: string;
  interface: string;
  type: "dynamic" | "static";
  age: number; // Age in seconds
}

export interface ARPTable {
  entries: ARPEntry[];
}

// Interface Configuration
export interface NetworkInterface {
  name: string; // e.g., "eth0", "Gi0/0", "FastEthernet0/1"
  ipAddress?: string;
  subnetMask?: string;
  macAddress: string;
  status: "up" | "down" | "admin-down";
  speed: "10" | "100" | "1000" | "10000" | "auto"; // Mbps
  duplex: "half" | "full" | "auto";
  vlan?: number; // Access VLAN
  trunkVlans?: number[]; // Allowed VLANs on trunk
  mode?: "access" | "trunk";
  description?: string;
  mtu: number;
}

// VLAN Configuration
export interface VLANConfig {
  id: number; // 1-4094
  name: string;
  status: "active" | "suspended";
}

// DHCP Server Configuration
export interface DHCPPool {
  name: string;
  network: string; // e.g., "192.168.1.0"
  netmask: string;
  defaultGateway: string;
  dnsServers: string[];
  leaseTime: number; // Seconds
  rangeStart: string;
  rangeEnd: string;
  excludedAddresses: string[];
}

export interface DHCPLease {
  ipAddress: string;
  macAddress: string;
  hostname: string;
  expiresAt: number;
  leaseType: "dynamic" | "static";
}

export interface DHCPServerConfig {
  enabled: boolean;
  pools: DHCPPool[];
  leases: DHCPLease[];
}

// DNS Record Types
export interface DNSRecord {
  name: string; // e.g., "www.example.com"
  type: "A" | "AAAA" | "CNAME" | "MX" | "NS" | "PTR" | "TXT";
  value: string; // IP or hostname
  ttl: number;
}

export interface DNSServerConfig {
  enabled: boolean;
  domain: string;
  records: DNSRecord[];
  forwarders: string[];
}

// ACL (Access Control List)
export interface ACLRule {
  id: number; // Rule number (lower = checked first)
  action: "permit" | "deny";
  protocol: "ip" | "tcp" | "udp" | "icmp" | "any";
  sourceIp: string; // IP or "any" or CIDR
  sourcePort?: string; // Port number, range "80-443", or "any"
  destinationIp: string;
  destinationPort?: string;
  description?: string;
  hitCount: number;
}

export interface ACLConfig {
  name: string;
  rules: ACLRule[];
  appliedTo?: { interface: string; direction: "in" | "out" }[];
}

// NAT Configuration
export interface NATRule {
  id: number;
  type: "static" | "dynamic" | "pat";
  insideLocal: string; // Inside local IP
  insideGlobal: string; // Inside global IP (public)
  outsideLocal?: string;
  outsideGlobal?: string;
  protocol?: "tcp" | "udp";
  insidePort?: number;
  outsidePort?: number;
  description?: string;
}

export interface NATConfig {
  enabled: boolean;
  insideInterface: string;
  outsideInterface: string;
  rules: NATRule[];
  translations: NATTranslation[];
}

export interface NATTranslation {
  insideLocal: string;
  insideGlobal: string;
  protocol?: string;
  insidePort?: number;
  outsidePort?: number;
  timestamp: number;
}

// STP (Spanning Tree Protocol)
export interface STPConfig {
  enabled: boolean;
  priority: number; // 0-61440, default 32768, step 4096
  bridgeId: string; // priority + MAC
  rootBridgeId?: string;
  rootCost?: number;
  portStates: Record<string, STPPortState>;
}

export interface STPPortState {
  interface: string;
  state: "disabled" | "blocking" | "listening" | "learning" | "forwarding";
  cost: number;
  role: "root" | "designated" | "alternate" | "backup" | "disabled";
  priority: number;
}

// Cable Types
export type CableType =
  | "straight-through"
  | "crossover"
  | "fiber"
  | "serial"
  | "console"
  | "rollover";

// PDU (Protocol Data Unit) for packet inspection
export interface PDUFrame {
  layer: "L1" | "L2" | "L3" | "L4" | "L7";
  name: string;
  fields: PDUField[];
}

export interface PDUField {
  name: string;
  value: string;
  size?: string; // e.g., "6 bytes"
  description?: string;
}

export interface PDUInspection {
  traceId: string;
  stepIndex: number;
  frames: PDUFrame[];
  rawData?: string; // Hex representation
}

// ============================================================
// Phase 4: Simulation Types
// ============================================================

// Network Simulation
export interface NetworkSimConfig {
  latencyMs: number; // Netzwerklatenz in ms
  packetLossPercent: number; // Paketverlust in %
  bandwidthMbps: number; // Bandbreite in Mbps
  jitterMs: number; // Jitter in ms
}

export interface SimulationScenario {
  id: string;
  name: string;
  description: string;
  type: "network" | "cloud" | "security" | "container";
  requiredShapes: string[];
  networkConfig: NetworkSimConfig;
  expectedResult: string;
}

// Packet Flow
export interface PacketFlowStep {
  id: string;
  fromShapeId: string;
  toShapeId: string;
  connectionId: string;
  protocol: string;
  layer: "L2" | "L3" | "L4" | "L7"; // OSI Layer
  data: Record<string, string>;
  timestamp: number;
  duration: number; // ms
  status: "pending" | "in-transit" | "delivered" | "dropped" | "timeout";
}

export interface PacketFlowTrace {
  id: string;
  name: string;
  steps: PacketFlowStep[];
  startedAt: number;
  completedAt?: number;
  sourceShapeId: string;
  targetShapeId: string;
  protocol: string;
  success: boolean;
}

// Cloud Cost Calculator
export interface CloudResource {
  id: string;
  shapeId: string; // Reference to canvas shape
  provider: "aws" | "azure" | "gcp" | "on-premise";
  service: string; // e.g. "EC2", "Azure VM", "S3"
  tier: string; // e.g. "t3.micro", "Standard_B2s"
  region: string;
  monthlyCostUsd: number;
  hourlyCostUsd: number;
  specs: {
    vcpu?: number;
    memoryGb?: number;
    storageGb?: number;
    networkGbps?: number;
  };
}

export interface CostEstimate {
  resources: CloudResource[];
  totalMonthlyCost: number;
  totalYearlyCost: number;
  currency: string;
  lastUpdated: number;
}

// Metrics & Monitoring
export interface MetricDataPoint {
  timestamp: number;
  value: number;
}

export interface ShapeMetrics {
  shapeId: string;
  cpu: MetricDataPoint[];
  memory: MetricDataPoint[];
  networkIn: MetricDataPoint[];
  networkOut: MetricDataPoint[];
  diskRead: MetricDataPoint[];
  diskWrite: MetricDataPoint[];
  latency: MetricDataPoint[];
  requestsPerSec: MetricDataPoint[];
  errorRate: MetricDataPoint[];
}

// Import-freie Connection-Definition für CanvasState
export interface CanvasConnection {
  id: string;
  sourceShapeId: string;
  sourcePort: string;
  targetShapeId: string;
  targetPort: string;
  connectionType: string;
  status: "active" | "inactive" | "error";
  animated?: boolean;
  bidirectional?: boolean;
  label?: string;
  color?: string;
  protocol?: string;
  bandwidth?: string;
  cableType?: CableType;
}

export interface CanvasState {
  objects: DrawingObject[];
  connections: CanvasConnection[];
  history: DrawingObject[][];
  historyIndex: number;
}

export interface SubjectData {
  name: string;
  canvasState: CanvasState;
  lastModified: number;
}

export interface AppState {
  subjects: Record<string, SubjectData>;
  currentSubject: string;
  tool: Tool;
  color: string;
  penWidth: PenWidth;
  textSize: TextSize;
  fontFamily: FontFamily;
  theme: "light" | "dark";
}

export const PEN_WIDTHS: Record<PenWidth, number> = {
  thin: 2,
  normal: 4,
  thick: 8,
};

export const TEXT_SIZES: Record<TextSize, number> = {
  small: 14,
  medium: 20,
  large: 32,
  xlarge: 48,
};

export const GRID_SIZES: Record<GridSize, number> = {
  small: 10,
  medium: 20,
  large: 40,
  xlarge: 80,
};

export const PRESET_COLORS = [
  "#000000",
  "#FFFFFF",
  "#EF4444",
  "#F59E0B",
  "#10B981",
  "#3B82F6",
  "#8B5CF6",
  "#EC4899",
  "#06B6D4",
  "#84CC16",
];

export const GRID_COLOR_PRESETS = [
  { name: "Light Gray", color: "oklch(0.92 0 0)", accent: "oklch(0.88 0 0)" },
  { name: "Medium Gray", color: "oklch(0.8 0 0)", accent: "oklch(0.7 0 0)" },
  {
    name: "Blue",
    color: "oklch(0.85 0.05 250)",
    accent: "oklch(0.75 0.08 250)",
  },
  {
    name: "Green",
    color: "oklch(0.85 0.05 150)",
    accent: "oklch(0.75 0.08 150)",
  },
  {
    name: "Purple",
    color: "oklch(0.85 0.05 300)",
    accent: "oklch(0.75 0.08 300)",
  },
  {
    name: "Orange",
    color: "oklch(0.85 0.05 50)",
    accent: "oklch(0.75 0.08 50)",
  },
];

export const GRID_COLOR_PRESETS_DARK = [
  { name: "Dark Gray", color: "oklch(0.25 0 0)", accent: "oklch(0.3 0 0)" },
  { name: "Medium Gray", color: "oklch(0.35 0 0)", accent: "oklch(0.45 0 0)" },
  { name: "Blue", color: "oklch(0.3 0.05 250)", accent: "oklch(0.4 0.08 250)" },
  {
    name: "Green",
    color: "oklch(0.3 0.05 150)",
    accent: "oklch(0.4 0.08 150)",
  },
  {
    name: "Purple",
    color: "oklch(0.3 0.05 300)",
    accent: "oklch(0.4 0.08 300)",
  },
  { name: "Orange", color: "oklch(0.3 0.05 50)", accent: "oklch(0.4 0.08 50)" },
];

// IT-Training Subjects mit Farben und Icons
export interface SubjectConfig {
  id: string;
  name: string;
  icon: string;
  color: string;
  gradient: string;
  description: string;
  category: "certification" | "cloud" | "system" | "development" | "security";
}

export const SUBJECT_CONFIGS: Record<string, SubjectConfig> = {
  CCNA: {
    id: "CCNA",
    name: "CCNA 200-301",
    icon: "WifiHigh",
    color: "#1BA0D7",
    gradient: "from-sky-500 to-blue-600",
    description: "Cisco Certified Network Associate",
    category: "certification",
  },
  FISI: {
    id: "FISI",
    name: "FISI",
    icon: "Certificate",
    color: "#6366F1",
    gradient: "from-indigo-500 to-purple-600",
    description: "Fachinformatiker Systemintegration",
    category: "certification",
  },
  Azure: {
    id: "Azure",
    name: "Microsoft Azure",
    icon: "MicrosoftAzureLogo",
    color: "#0078D4",
    gradient: "from-blue-500 to-cyan-500",
    description: "Cloud Computing & Services",
    category: "cloud",
  },
  AWS: {
    id: "AWS",
    name: "Amazon AWS",
    icon: "AmazonLogo",
    color: "#FF9900",
    gradient: "from-orange-500 to-yellow-500",
    description: "Amazon Web Services",
    category: "cloud",
  },
  Linux: {
    id: "Linux",
    name: "Linux",
    icon: "LinuxLogo",
    color: "#FCC624",
    gradient: "from-yellow-500 to-orange-500",
    description: "Linux Administration",
    category: "system",
  },
  Docker: {
    id: "Docker",
    name: "Docker",
    icon: "Cube",
    color: "#2496ED",
    gradient: "from-blue-400 to-blue-600",
    description: "Container & Virtualization",
    category: "system",
  },
  Kubernetes: {
    id: "Kubernetes",
    name: "Kubernetes",
    icon: "GitBranch",
    color: "#326CE5",
    gradient: "from-blue-600 to-indigo-600",
    description: "Container Orchestration",
    category: "system",
  },
  Networking: {
    id: "Networking",
    name: "Networking",
    icon: "WifiHigh",
    color: "#10B981",
    gradient: "from-emerald-500 to-teal-500",
    description: "Network Infrastructure",
    category: "system",
  },
  Security: {
    id: "Security",
    name: "IT Security",
    icon: "ShieldCheck",
    color: "#EF4444",
    gradient: "from-red-500 to-pink-500",
    description: "Cybersecurity & Protection",
    category: "security",
  },
  Python: {
    id: "Python",
    name: "Python",
    icon: "Code",
    color: "#3776AB",
    gradient: "from-blue-500 to-yellow-500",
    description: "Python Programming",
    category: "development",
  },
  DevOps: {
    id: "DevOps",
    name: "DevOps",
    icon: "Infinity",
    color: "#7C3AED",
    gradient: "from-violet-500 to-purple-600",
    description: "CI/CD & Automation",
    category: "development",
  },
  Windows: {
    id: "Windows",
    name: "Windows Server",
    icon: "WindowsLogo",
    color: "#00A4EF",
    gradient: "from-sky-500 to-blue-600",
    description: "Windows Administration",
    category: "system",
  },
  Database: {
    id: "Database",
    name: "Databases",
    icon: "Database",
    color: "#F59E0B",
    gradient: "from-amber-500 to-orange-500",
    description: "SQL & NoSQL Systems",
    category: "development",
  },
  // ── Catalog-sourced modules (Phase 6c) ─────────────────────
  "AZ-900": {
    id: "AZ-900",
    name: "AZ-900 Fundamentals",
    icon: "MicrosoftAzureLogo",
    color: "#005BA1",
    gradient: "from-sky-700 to-blue-800",
    description: "Azure Fundamentals · Catalog",
    category: "certification",
  },
  NetworkPlus: {
    id: "NetworkPlus",
    name: "CompTIA Network+",
    icon: "WifiHigh",
    color: "#C8202D",
    gradient: "from-red-600 to-red-800",
    description: "N10-009 · Catalog Stub",
    category: "certification",
  },
};

export const DEFAULT_SUBJECTS = ["CCNA", "FISI", "Azure", "AWS", "Linux"];

export const CATEGORY_LABELS: Record<SubjectConfig["category"], string> = {
  certification: "Zertifizierung",
  cloud: "Cloud",
  system: "Systeme",
  development: "Entwicklung",
  security: "Security",
};

// ============================================================
// Phase 5: Collaboration Types
// ============================================================

export type AnnotationType =
  | "comment"
  | "arrow"
  | "highlight"
  | "callout"
  | "question"
  | "warning";

export interface Annotation {
  id: string;
  type: AnnotationType;
  x: number;
  y: number;
  width?: number;
  height?: number;
  text: string;
  author: string;
  authorColor: string;
  createdAt: number;
  updatedAt: number;
  resolved: boolean;
  targetObjectId?: string;
  replies: AnnotationReply[];
}

export interface AnnotationReply {
  id: string;
  text: string;
  author: string;
  authorColor: string;
  createdAt: number;
}

export interface CollaborationUser {
  id: string;
  name: string;
  color: string;
  avatar?: string;
  cursorX?: number;
  cursorY?: number;
  activeSubject?: string;
  lastSeen: number;
  isOnline: boolean;
}

export interface CollaborationSession {
  id: string;
  hostId: string;
  users: CollaborationUser[];
  createdAt: number;
  canvasId: string;
  permissions: SessionPermissions;
}

export interface SessionPermissions {
  canEdit: boolean;
  canAnnotate: boolean;
  canChat: boolean;
  canExport: boolean;
}

export interface ShareLink {
  id: string;
  canvasId: string;
  createdBy: string;
  createdAt: number;
  expiresAt?: number;
  permissions: SessionPermissions;
  password?: string;
  accessCount: number;
  maxAccess?: number;
}

export type ExportFormat = "json" | "png" | "svg" | "pdf" | "pptx";

export interface ExportOptions {
  format: ExportFormat;
  includeAnnotations: boolean;
  includeMetadata: boolean;
  quality: "low" | "medium" | "high";
  selectedSubjects?: string[];
  watermark?: string;
}

export interface CanvasTemplate {
  id: string;
  name: string;
  description: string;
  category: TemplateCategory;
  thumbnail?: string;
  author: string;
  createdAt: number;
  updatedAt: number;
  tags: string[];
  difficulty: "beginner" | "intermediate" | "advanced";
  objects: DrawingObject[];
  connections: CanvasConnection[];
  estimatedTime?: string;
  downloads: number;
  rating: number;
}

export type TemplateCategory =
  | "network"
  | "cloud"
  | "security"
  | "devops"
  | "database"
  | "kubernetes"
  | "education"
  | "general";

export const TEMPLATE_CATEGORY_LABELS: Record<TemplateCategory, string> = {
  network: "Netzwerk",
  cloud: "Cloud-Architektur",
  security: "Sicherheit",
  devops: "DevOps/CI-CD",
  database: "Datenbank",
  kubernetes: "Kubernetes",
  education: "Didaktik / Lehrkonzept",
  general: "Allgemein",
};

export const COLLABORATOR_COLORS = [
  "#EF4444",
  "#F97316",
  "#EAB308",
  "#22C55E",
  "#06B6D4",
  "#3B82F6",
  "#8B5CF6",
  "#EC4899",
];
