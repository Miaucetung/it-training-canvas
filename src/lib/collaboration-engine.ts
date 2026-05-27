import { IT_SHAPES } from "./shapes";
import type {
  Annotation,
  AnnotationReply,
  AnnotationType,
  CanvasConnection,
  CanvasTemplate,
  CollaborationSession,
  CollaborationUser,
  DrawingObject,
  ExportOptions,
  SessionPermissions,
  ShareLink,
  TemplateCategory,
} from "./types";

// ============================================================
// Collaboration Engine — Local-first with BroadcastChannel sync
// ============================================================

type CollabEventType =
  | "user-joined"
  | "user-left"
  | "cursor-moved"
  | "annotation-added"
  | "annotation-updated"
  | "annotation-deleted"
  | "canvas-updated";

interface CollabEvent {
  type: CollabEventType;
  userId: string;
  payload: unknown;
  timestamp: number;
}

type CollabListener = (event: CollabEvent) => void;

let broadcastChannel: BroadcastChannel | null = null;
const listeners: Set<CollabListener> = new Set();

export function initCollaboration(sessionId: string): BroadcastChannel | null {
  try {
    broadcastChannel = new BroadcastChannel(`it-canvas-collab-${sessionId}`);
    broadcastChannel.onmessage = (ev: MessageEvent<CollabEvent>) => {
      listeners.forEach((fn) => fn(ev.data));
    };
    return broadcastChannel;
  } catch {
    return null;
  }
}

export function destroyCollaboration() {
  broadcastChannel?.close();
  broadcastChannel = null;
  listeners.clear();
}

export function onCollabEvent(fn: CollabListener) {
  listeners.add(fn);
  return () => {
    listeners.delete(fn);
  };
}

export function broadcastEvent(event: CollabEvent) {
  broadcastChannel?.postMessage(event);
}

// ============================================================
// User Management
// ============================================================

export function createLocalUser(
  name: string,
  color: string,
): CollaborationUser {
  return {
    id: crypto.randomUUID(),
    name,
    color,
    lastSeen: Date.now(),
    isOnline: true,
  };
}

export function createSession(
  host: CollaborationUser,
  canvasId: string,
): CollaborationSession {
  return {
    id: crypto.randomUUID(),
    hostId: host.id,
    users: [host],
    createdAt: Date.now(),
    canvasId,
    permissions: {
      canEdit: true,
      canAnnotate: true,
      canChat: true,
      canExport: true,
    },
  };
}

// ============================================================
// Annotation Helpers
// ============================================================

const ANNOTATION_ICONS: Record<AnnotationType, string> = {
  comment: "💬",
  arrow: "➡️",
  highlight: "🔆",
  callout: "📌",
  question: "❓",
  warning: "⚠️",
};

export function getAnnotationIcon(type: AnnotationType): string {
  return ANNOTATION_ICONS[type];
}

export function createAnnotation(
  type: AnnotationType,
  x: number,
  y: number,
  text: string,
  author: string,
  authorColor: string,
  targetObjectId?: string,
): Annotation {
  const now = Date.now();
  return {
    id: crypto.randomUUID(),
    type,
    x,
    y,
    text,
    author,
    authorColor,
    createdAt: now,
    updatedAt: now,
    resolved: false,
    targetObjectId,
    replies: [],
  };
}

export function addReply(
  annotation: Annotation,
  text: string,
  author: string,
  authorColor: string,
): Annotation {
  const reply: AnnotationReply = {
    id: crypto.randomUUID(),
    text,
    author,
    authorColor,
    createdAt: Date.now(),
  };
  return {
    ...annotation,
    replies: [...annotation.replies, reply],
    updatedAt: Date.now(),
  };
}

// ============================================================
// Share Link Generation
// ============================================================

export function generateShareLink(
  canvasId: string,
  createdBy: string,
  permissions: SessionPermissions,
  options?: { expiresInHours?: number; password?: string; maxAccess?: number },
): ShareLink {
  const now = Date.now();
  return {
    id: crypto.randomUUID().replace(/-/g, "").slice(0, 12),
    canvasId,
    createdBy,
    createdAt: now,
    expiresAt: options?.expiresInHours
      ? now + options.expiresInHours * 3600_000
      : undefined,
    permissions,
    password: options?.password,
    accessCount: 0,
    maxAccess: options?.maxAccess,
  };
}

export function getShareUrl(shareLink: ShareLink): string {
  return `${window.location.origin}${window.location.pathname}?share=${shareLink.id}`;
}

export function isShareLinkValid(link: ShareLink): boolean {
  if (link.expiresAt && Date.now() > link.expiresAt) return false;
  if (link.maxAccess && link.accessCount >= link.maxAccess) return false;
  return true;
}

// ============================================================
// Export Helpers
// ============================================================

export function getExportFilename(
  subjectName: string,
  format: ExportOptions["format"],
): string {
  const date = new Date().toISOString().slice(0, 10);
  const safe = subjectName.replace(/[^a-zA-Z0-9-_]/g, "_");
  return `IT-Canvas_${safe}_${date}.${format}`;
}

export function generateExportMetadata(
  subjects: string[],
  objectCount: number,
  connectionCount: number,
): Record<string, unknown> {
  return {
    exportedAt: new Date().toISOString(),
    tool: "IT-Training-Canvas",
    version: "1.0.0",
    subjects,
    stats: {
      objects: objectCount,
      connections: connectionCount,
    },
  };
}

// ============================================================
// Template Helpers
// ============================================================

export function createTemplate(
  name: string,
  description: string,
  category: TemplateCategory,
  objects: DrawingObject[],
  connections: CanvasConnection[],
  author: string,
  tags: string[] = [],
  difficulty: CanvasTemplate["difficulty"] = "beginner",
  estimatedTime?: string,
): CanvasTemplate {
  const now = Date.now();
  return {
    id: crypto.randomUUID(),
    name,
    description,
    category,
    author,
    createdAt: now,
    updatedAt: now,
    tags,
    difficulty,
    objects,
    connections,
    estimatedTime,
    downloads: 0,
    rating: 0,
  };
}

// Helper to create a shape DrawingObject for templates
function tplShape(
  id: string,
  shapeId: string,
  x: number,
  y: number,
  w: number,
  h: number,
  color: string,
  label: string,
): DrawingObject {
  const shapeDef = IT_SHAPES.find((s) => s.id === shapeId);
  return {
    id,
    type: "shape",
    color,
    width: 2,
    startPoint: { x, y },
    endPoint: { x: x + w, y: y + h },
    shapeId,
    shapeWidth: w,
    shapeHeight: h,
    svgPath: shapeDef?.svgPath,
    label,
    rotation: 0,
    layer: "default",
    locked: false,
    visible: true,
  };
}

// Helper: Begleittext (Annotation) für didaktische Vorlagen
function tplText(
  id: string,
  x: number,
  y: number,
  text: string,
  color: string = "#1E293B",
  fontSize: number = 14,
): DrawingObject {
  return {
    id,
    type: "text",
    color,
    width: 1,
    startPoint: { x, y },
    text,
    fontSize,
    fontFamily: "IBM Plex Sans",
    layer: "foreground",
    locked: false,
    visible: true,
  };
}

// Helper: Hervorhebungs-Rechteck (z. B. Subnetz-Bereich, Schicht-Hülle)
function tplRect(
  id: string,
  x: number,
  y: number,
  w: number,
  h: number,
  color: string,
): DrawingObject {
  return {
    id,
    type: "rectangle",
    color,
    width: 2,
    startPoint: { x, y },
    endPoint: { x: x + w, y: y + h },
    layer: "background",
    locked: false,
    visible: true,
  };
}

// Helper to create a CanvasConnection for templates
function tplConn(
  id: string,
  sourceId: string,
  targetId: string,
  label: string,
  color: string,
  options?: { animated?: boolean; protocol?: string; labelOffsetY?: number },
): CanvasConnection {
  return {
    id,
    sourceShapeId: sourceId,
    sourcePort: "default",
    targetShapeId: targetId,
    targetPort: "default",
    connectionType: "ethernet",
    status: "active",
    animated: options?.animated ?? false,
    label,
    labelOffsetY: options?.labelOffsetY,
    color,
    protocol: options?.protocol,
  };
}

// Built-in starter templates
export const BUILT_IN_TEMPLATES: CanvasTemplate[] = [
  {
    id: "tpl-basic-lan",
    name: "Einfaches LAN",
    description:
      "Grundlegendes lokales Netzwerk mit Router, Switch und 3 Clients. Ideal für Einsteiger.",
    category: "network",
    author: "System",
    createdAt: 0,
    updatedAt: 0,
    tags: ["LAN", "Grundlagen", "Netzwerk"],
    difficulty: "beginner",
    objects: [
      tplShape("tpl-router1", "router", 400, 100, 80, 80, "#3B82F6", "Router"),
      tplShape("tpl-switch1", "switch", 400, 260, 80, 80, "#10B981", "Switch"),
      tplShape("tpl-pc1", "computer", 200, 420, 70, 70, "#6366F1", "PC 1"),
      tplShape("tpl-pc2", "computer", 400, 420, 70, 70, "#6366F1", "PC 2"),
      tplShape("tpl-pc3", "computer", 600, 420, 70, 70, "#6366F1", "PC 3"),
    ],
    connections: [
      tplConn("tpl-c1", "tpl-router1", "tpl-switch1", "Trunk", "#3B82F6"),
      tplConn("tpl-c2", "tpl-switch1", "tpl-pc1", "Eth0", "#10B981"),
      tplConn("tpl-c3", "tpl-switch1", "tpl-pc2", "Eth1", "#10B981"),
      tplConn("tpl-c4", "tpl-switch1", "tpl-pc3", "Eth2", "#10B981"),
    ],
    estimatedTime: "10 min",
    downloads: 0,
    rating: 4.5,
  },
  {
    id: "tpl-aws-3tier",
    name: "AWS 3-Tier Architektur",
    description:
      "Klassische 3-Schicht Cloud-Architektur mit Load Balancer, App-Servern und Datenbank.",
    category: "cloud",
    author: "System",
    createdAt: 0,
    updatedAt: 0,
    tags: ["AWS", "Cloud", "3-Tier", "Load Balancer"],
    difficulty: "intermediate",
    objects: [
      tplShape("tpl-inet", "cloud", 400, 40, 90, 70, "#64748B", "Internet"),
      tplShape("tpl-alb", "loadbalancer", 400, 170, 80, 80, "#F97316", "ALB"),
      tplShape(
        "tpl-app1",
        "server",
        260,
        320,
        70,
        70,
        "#3B82F6",
        "App Server 1",
      ),
      tplShape(
        "tpl-app2",
        "server",
        540,
        320,
        70,
        70,
        "#3B82F6",
        "App Server 2",
      ),
      tplShape(
        "tpl-rds",
        "database",
        400,
        470,
        80,
        80,
        "#8B5CF6",
        "RDS Database",
      ),
    ],
    connections: [
      tplConn("tpl-c5", "tpl-inet", "tpl-alb", "HTTPS", "#64748B", {
        animated: true,
        protocol: "HTTPS",
      }),
      tplConn("tpl-c6", "tpl-alb", "tpl-app1", "Port 8080", "#F97316"),
      tplConn("tpl-c7", "tpl-alb", "tpl-app2", "Port 8080", "#F97316"),
      tplConn("tpl-c8", "tpl-app1", "tpl-rds", "SQL 3306", "#8B5CF6", {
        protocol: "TCP",
      }),
      tplConn("tpl-c9", "tpl-app2", "tpl-rds", "SQL 3306", "#8B5CF6", {
        protocol: "TCP",
      }),
    ],
    estimatedTime: "20 min",
    downloads: 0,
    rating: 4.8,
  },
  {
    id: "tpl-k8s-cluster",
    name: "Kubernetes Cluster",
    description:
      "K8s-Cluster mit Control Plane, Worker Nodes, Pods und Services.",
    category: "kubernetes",
    author: "System",
    createdAt: 0,
    updatedAt: 0,
    tags: ["Kubernetes", "K8s", "Container", "Orchestrierung"],
    difficulty: "advanced",
    objects: [
      tplShape("tpl-cp", "server", 400, 60, 90, 80, "#3B82F6", "Control Plane"),
      tplShape(
        "tpl-w1",
        "server",
        200,
        220,
        80,
        70,
        "#10B981",
        "Worker Node 1",
      ),
      tplShape(
        "tpl-w2",
        "server",
        400,
        220,
        80,
        70,
        "#10B981",
        "Worker Node 2",
      ),
      tplShape(
        "tpl-w3",
        "server",
        600,
        220,
        80,
        70,
        "#10B981",
        "Worker Node 3",
      ),
      tplShape("tpl-pod1", "container", 180, 370, 60, 60, "#F59E0B", "Pod A"),
      tplShape("tpl-pod2", "container", 280, 370, 60, 60, "#F59E0B", "Pod B"),
      tplShape("tpl-pod3", "container", 480, 370, 60, 60, "#F59E0B", "Pod C"),
      tplShape(
        "tpl-svc",
        "loadbalancer",
        400,
        500,
        80,
        70,
        "#EC4899",
        "Service (LB)",
      ),
    ],
    connections: [
      tplConn("tpl-c10", "tpl-cp", "tpl-w1", "kubelet", "#3B82F6", {
        animated: true,
      }),
      tplConn("tpl-c11", "tpl-cp", "tpl-w2", "kubelet", "#3B82F6", {
        animated: true,
      }),
      tplConn("tpl-c12", "tpl-cp", "tpl-w3", "kubelet", "#3B82F6", {
        animated: true,
      }),
      tplConn("tpl-c13", "tpl-w1", "tpl-pod1", "", "#10B981"),
      tplConn("tpl-c14", "tpl-w1", "tpl-pod2", "", "#10B981"),
      tplConn("tpl-c15", "tpl-w2", "tpl-pod3", "", "#10B981"),
      tplConn("tpl-c16", "tpl-svc", "tpl-pod1", "", "#EC4899", {
        animated: true,
      }),
      tplConn("tpl-c17", "tpl-svc", "tpl-pod3", "", "#EC4899", {
        animated: true,
      }),
    ],
    estimatedTime: "30 min",
    downloads: 0,
    rating: 4.7,
  },
  {
    id: "tpl-dmz",
    name: "DMZ-Netzwerk mit Firewall",
    description:
      "Segmentiertes Netzwerk mit DMZ, interner Zone und zwei Firewalls.",
    category: "security",
    author: "System",
    createdAt: 0,
    updatedAt: 0,
    tags: ["DMZ", "Firewall", "Sicherheit", "Segmentierung"],
    difficulty: "intermediate",
    objects: [
      tplShape("tpl-ext", "cloud", 400, 40, 90, 70, "#EF4444", "Internet"),
      tplShape(
        "tpl-fw1",
        "firewall",
        400,
        160,
        80,
        70,
        "#EF4444",
        "Ext. Firewall",
      ),
      tplShape(
        "tpl-web",
        "server",
        250,
        290,
        70,
        70,
        "#F97316",
        "Webserver (DMZ)",
      ),
      tplShape(
        "tpl-mail",
        "server",
        550,
        290,
        70,
        70,
        "#F97316",
        "Mailserver (DMZ)",
      ),
      tplShape(
        "tpl-fw2",
        "firewall",
        400,
        410,
        80,
        70,
        "#22C55E",
        "Int. Firewall",
      ),
      tplShape(
        "tpl-db",
        "database",
        400,
        540,
        80,
        70,
        "#8B5CF6",
        "Datenbank (Intern)",
      ),
    ],
    connections: [
      tplConn("tpl-c18", "tpl-ext", "tpl-fw1", "Untrusted", "#EF4444", {
        animated: true,
      }),
      tplConn("tpl-c19", "tpl-fw1", "tpl-web", "HTTP/S", "#F97316", {
        protocol: "HTTPS",
      }),
      tplConn("tpl-c20", "tpl-fw1", "tpl-mail", "SMTP", "#F97316", {
        protocol: "SMTP",
      }),
      tplConn("tpl-c21", "tpl-web", "tpl-fw2", "API", "#22C55E"),
      tplConn("tpl-c22", "tpl-fw2", "tpl-db", "SQL", "#8B5CF6", {
        protocol: "TCP",
      }),
    ],
    estimatedTime: "15 min",
    downloads: 0,
    rating: 4.6,
  },
  {
    id: "tpl-cicd",
    name: "CI/CD Pipeline",
    description:
      "DevOps-Pipeline von Git über Build/Test bis zum Deployment auf Kubernetes.",
    category: "devops",
    author: "System",
    createdAt: 0,
    updatedAt: 0,
    tags: ["CI/CD", "Pipeline", "DevOps", "Git", "Jenkins"],
    difficulty: "intermediate",
    objects: [
      tplShape("tpl-git", "server", 100, 200, 70, 70, "#F97316", "Git Repo"),
      tplShape("tpl-ci", "server", 280, 200, 70, 70, "#3B82F6", "CI Server"),
      tplShape("tpl-test", "server", 460, 200, 70, 70, "#EAB308", "Test Stage"),
      tplShape(
        "tpl-reg",
        "database",
        460,
        350,
        70,
        70,
        "#8B5CF6",
        "Container Registry",
      ),
      tplShape("tpl-stage", "server", 640, 200, 70, 70, "#10B981", "Staging"),
      tplShape("tpl-prod", "server", 820, 200, 70, 70, "#22C55E", "Production"),
    ],
    connections: [
      tplConn("tpl-c23", "tpl-git", "tpl-ci", "Push", "#F97316", {
        animated: true,
      }),
      tplConn("tpl-c24", "tpl-ci", "tpl-test", "Build", "#3B82F6", {
        animated: true,
      }),
      tplConn("tpl-c25", "tpl-test", "tpl-reg", "Image", "#EAB308"),
      tplConn("tpl-c26", "tpl-test", "tpl-stage", "Deploy", "#10B981", {
        animated: true,
      }),
      tplConn("tpl-c27", "tpl-stage", "tpl-prod", "Promote", "#22C55E", {
        animated: true,
      }),
    ],
    estimatedTime: "20 min",
    downloads: 0,
    rating: 4.9,
  },

  // ============================================================
  // Didaktische Vorlagen (für Dozenten / Selbststudium)
  // Jede Vorlage erklärt ein Konzept visuell und ist sofort
  // einsetzbar im Unterricht — Begleittexte sind direkt im Canvas.
  // ============================================================

  {
    id: "tpl-edu-warum-subnetting",
    name: "Warum Subnetting? (Vorher / Nachher)",
    description:
      "Direkter Vergleich: ein flaches /24 mit einer großen Broadcast-Domain gegenüber drei segmentierten /27-Subnetzen mit Router. Zeigt visuell warum Subnetting Performance, Sicherheit und Verwaltbarkeit verbessert.",
    category: "education",
    author: "System",
    createdAt: 0,
    updatedAt: 0,
    tags: ["Subnetting", "Broadcast", "Sicherheit", "Didaktik"],
    difficulty: "beginner",
    objects: [
      // Linke Seite — flat /24
      tplRect("edu-sn-zone-flat", 40, 80, 440, 320, "#FCA5A5"),
      tplText("edu-sn-h1", 60, 60, "VORHER: Ein flaches /24", "#B91C1C", 18),
      tplText("edu-sn-h1b", 60, 100, "192.168.1.0/24 — 1 Broadcast-Domain", "#7F1D1D", 12),
      tplShape("edu-sn-sw1", "switch", 220, 160, 80, 50, "#10B981", "Switch"),
      tplShape("edu-sn-pc1a", "computer", 70, 280, 60, 60, "#6366F1", ".10"),
      tplShape("edu-sn-pc1b", "computer", 150, 280, 60, 60, "#6366F1", ".11"),
      tplShape("edu-sn-pc1c", "computer", 230, 280, 60, 60, "#6366F1", ".12"),
      tplShape("edu-sn-pc1d", "computer", 310, 280, 60, 60, "#6366F1", ".13"),
      tplShape("edu-sn-pc1e", "computer", 390, 280, 60, 60, "#6366F1", ".14"),
      tplText("edu-sn-bad1", 60, 380, "× Jeder Broadcast erreicht ALLE Hosts", "#B91C1C", 12),
      tplText("edu-sn-bad2", 60, 400, "× Keine Trennung HR / Buchhaltung / Gäste", "#B91C1C", 12),
      tplText("edu-sn-bad3", 60, 420, "× Ein infizierter Host gefährdet alle", "#B91C1C", 12),

      // Rechte Seite — segmentiert /27
      tplRect("edu-sn-zone-a", 540, 100, 180, 180, "#86EFAC"),
      tplRect("edu-sn-zone-b", 740, 100, 180, 180, "#93C5FD"),
      tplRect("edu-sn-zone-c", 640, 360, 180, 180, "#FDE68A"),
      tplText("edu-sn-h2", 560, 60, "NACHHER: Drei /27-Subnetze + Router", "#15803D", 18),
      tplShape("edu-sn-r2", "router", 720, 290, 80, 60, "#3B82F6", "Gateway"),
      tplText("edu-sn-zoneA-l", 560, 90, "HR  192.168.1.0/27", "#15803D", 11),
      tplText("edu-sn-zoneB-l", 760, 90, "Buchhaltung  /27", "#1D4ED8", 11),
      tplText("edu-sn-zoneC-l", 660, 350, "Gäste-WLAN  /27", "#A16207", 11),
      tplShape("edu-sn-pcA1", "computer", 560, 180, 50, 50, "#15803D", "HR"),
      tplShape("edu-sn-pcA2", "computer", 640, 180, 50, 50, "#15803D", "HR"),
      tplShape("edu-sn-pcB1", "computer", 760, 180, 50, 50, "#1D4ED8", "Buch"),
      tplShape("edu-sn-pcB2", "computer", 840, 180, 50, 50, "#1D4ED8", "Buch"),
      tplShape("edu-sn-pcC1", "smartphone", 660, 440, 50, 60, "#A16207", "Gast"),
      tplShape("edu-sn-pcC2", "smartphone", 740, 440, 50, 60, "#A16207", "Gast"),
      tplText("edu-sn-good1", 560, 580, "✓ Broadcasts bleiben lokal pro Subnetz", "#15803D", 12),
      tplText("edu-sn-good2", 560, 600, "✓ ACLs auf dem Router trennen Bereiche", "#15803D", 12),
      tplText("edu-sn-good3", 560, 620, "✓ Sauberes Logging & Troubleshooting", "#15803D", 12),
    ],
    connections: [
      tplConn("edu-sn-c1", "edu-sn-sw1", "edu-sn-pc1a", "", "#10B981"),
      tplConn("edu-sn-c2", "edu-sn-sw1", "edu-sn-pc1b", "", "#10B981"),
      tplConn("edu-sn-c3", "edu-sn-sw1", "edu-sn-pc1c", "", "#10B981"),
      tplConn("edu-sn-c4", "edu-sn-sw1", "edu-sn-pc1d", "", "#10B981"),
      tplConn("edu-sn-c5", "edu-sn-sw1", "edu-sn-pc1e", "", "#10B981"),
      tplConn("edu-sn-c6", "edu-sn-r2", "edu-sn-pcA1", "VLAN10", "#15803D"),
      tplConn("edu-sn-c7", "edu-sn-r2", "edu-sn-pcB1", "VLAN20", "#1D4ED8"),
      tplConn("edu-sn-c8", "edu-sn-r2", "edu-sn-pcC1", "VLAN30", "#A16207"),
    ],
    estimatedTime: "10 min",
    downloads: 0,
    rating: 5.0,
  },

  {
    id: "tpl-edu-ping-arp",
    name: "Ping & ARP — Schritt für Schritt",
    description:
      "Was passiert beim ersten ping zwischen zwei Hosts? Visualisiert die vier Schritte ARP-Request, ARP-Reply, ICMP Echo Request, ICMP Echo Reply mit eigenen Verbindungen je Schritt.",
    category: "education",
    author: "System",
    createdAt: 0,
    updatedAt: 0,
    tags: ["Ping", "ICMP", "ARP", "Layer 2", "Layer 3"],
    difficulty: "beginner",
    objects: [
      tplText("edu-p-h", 40, 40, "Ping 192.168.1.20 — der erste Versuch", "#0F172A", 18),
      tplText("edu-p-h2", 40, 70, "PC-A weiß die IP, aber NICHT die MAC. → erst ARP, dann ICMP.", "#475569", 12),
      tplShape("edu-p-pcA", "computer", 80, 200, 80, 80, "#3B82F6", "PC-A 192.168.1.10"),
      tplShape("edu-p-sw", "switch", 440, 220, 100, 50, "#10B981", "Switch"),
      tplShape("edu-p-pcB", "computer", 820, 200, 80, 80, "#8B5CF6", "PC-B 192.168.1.20"),

      tplText("edu-p-s1", 200, 130, "1) ARP-Request — Broadcast: »Wer hat .20?«", "#B91C1C", 12),
      tplText("edu-p-s2", 200, 320, "2) ARP-Reply — Unicast: »Ich (MAC bb:bb…)«", "#15803D", 12),
      tplText("edu-p-s3", 200, 410, "3) ICMP Echo Request (Type 8)", "#1D4ED8", 12),
      tplText("edu-p-s4", 200, 470, "4) ICMP Echo Reply (Type 0) — Antwortzeit = RTT", "#1D4ED8", 12),

      tplText("edu-p-note1", 40, 560, "Merkhilfe: ARP nutzt Layer 2 (MAC), ICMP nutzt Layer 3 (IP).", "#334155", 13),
      tplText("edu-p-note2", 40, 580, "Im selben Subnetz redet Host direkt mit Host — kein Router nötig.", "#334155", 13),
      tplText("edu-p-note3", 40, 600, "ARP-Eintrag wird gecached (arp -a). Cache-Timeout typ. 4 h.", "#334155", 13),
    ],
    connections: [
      tplConn("edu-p-c1", "edu-p-pcA", "edu-p-sw", "1) ARP-Req (Broadcast FF:FF:FF:FF:FF:FF)", "#EF4444", { animated: true }),
      tplConn("edu-p-c2", "edu-p-sw", "edu-p-pcB", "ARP-Req fluten", "#EF4444", { animated: true }),
      tplConn("edu-p-c3", "edu-p-pcB", "edu-p-pcA", "2) ARP-Reply (Unicast)", "#22C55E", { animated: true }),
      tplConn("edu-p-c4", "edu-p-pcA", "edu-p-pcB", "3) ICMP Echo Request", "#3B82F6", { animated: true, protocol: "ICMP" }),
      tplConn("edu-p-c5", "edu-p-pcB", "edu-p-pcA", "4) ICMP Echo Reply", "#3B82F6", { animated: true, protocol: "ICMP" }),
    ],
    estimatedTime: "10 min",
    downloads: 0,
    rating: 5.0,
  },

  {
    id: "tpl-edu-ttl-traceroute",
    name: "Hop-by-Hop & TTL (traceroute)",
    description:
      "Veranschaulicht TTL-Dekrementierung: Ein Paket startet mit TTL=64 und verliert pro Router 1. traceroute setzt TTL gezielt auf 1, 2, 3 … um jeden Hop sichtbar zu machen.",
    category: "education",
    author: "System",
    createdAt: 0,
    updatedAt: 0,
    tags: ["TTL", "Routing", "Traceroute", "Layer 3"],
    difficulty: "intermediate",
    objects: [
      tplText("edu-t-h", 40, 40, "TTL — warum traceroute funktioniert", "#0F172A", 18),
      tplText("edu-t-h2", 40, 68, "Jeder Router dekrementiert TTL um 1. Erreicht TTL 0 → ICMP \"Time Exceeded\".", "#475569", 12),

      tplShape("edu-t-pc", "computer", 40, 200, 80, 80, "#3B82F6", "PC TTL=64"),
      tplShape("edu-t-r1", "router", 220, 210, 80, 60, "#10B981", "R1"),
      tplShape("edu-t-r2", "router", 400, 210, 80, 60, "#10B981", "R2"),
      tplShape("edu-t-r3", "router", 580, 210, 80, 60, "#10B981", "R3"),
      tplShape("edu-t-r4", "router", 760, 210, 80, 60, "#10B981", "R4"),
      tplShape("edu-t-srv", "server", 940, 200, 80, 80, "#8B5CF6", "Ziel"),

      tplText("edu-t-ttl0", 50, 300, "TTL=64", "#0F172A", 12),
      tplText("edu-t-ttl1", 230, 300, "TTL=63", "#0F172A", 12),
      tplText("edu-t-ttl2", 410, 300, "TTL=62", "#0F172A", 12),
      tplText("edu-t-ttl3", 590, 300, "TTL=61", "#0F172A", 12),
      tplText("edu-t-ttl4", 770, 300, "TTL=60", "#0F172A", 12),

      tplText("edu-t-tr", 40, 380, "traceroute-Trick:", "#B45309", 14),
      tplText("edu-t-tr1", 40, 405, "Probe 1 → TTL=1 → R1 antwortet \"Time Exceeded\"  (Hop 1 sichtbar)", "#B45309", 12),
      tplText("edu-t-tr2", 40, 425, "Probe 2 → TTL=2 → R2 antwortet → Hop 2 sichtbar", "#B45309", 12),
      tplText("edu-t-tr3", 40, 445, "Probe 3 → TTL=3 → R3 antwortet → Hop 3 sichtbar  …", "#B45309", 12),

      tplText("edu-t-warn", 40, 510, "Praxisrelevanz: Routing-Loops lassen TTL gegen 0 laufen → Schutz vor unendlichen Schleifen.", "#334155", 12),
      tplText("edu-t-warn2", 40, 530, "Linux startet typ. mit TTL 64, Windows mit 128 — Indikator beim Reverse-Engineering von Hops.", "#334155", 12),
    ],
    connections: [
      tplConn("edu-t-c1", "edu-t-pc", "edu-t-r1", "", "#3B82F6", { animated: true }),
      tplConn("edu-t-c2", "edu-t-r1", "edu-t-r2", "", "#3B82F6", { animated: true }),
      tplConn("edu-t-c3", "edu-t-r2", "edu-t-r3", "", "#3B82F6", { animated: true }),
      tplConn("edu-t-c4", "edu-t-r3", "edu-t-r4", "", "#3B82F6", { animated: true }),
      tplConn("edu-t-c5", "edu-t-r4", "edu-t-srv", "", "#3B82F6", { animated: true }),
    ],
    estimatedTime: "10 min",
    downloads: 0,
    rating: 4.9,
  },

  {
    id: "tpl-edu-osi-encapsulation",
    name: "OSI-Encapsulation (Header pro Schicht)",
    description:
      "Sichtbar machen, was beim Senden mit den Daten passiert: pro Schicht wird ein Header angeklebt (Daten → Segment → Paket → Frame → Bits). Kernkonzept für CCNA/Net+.",
    category: "education",
    author: "System",
    createdAt: 0,
    updatedAt: 0,
    tags: ["OSI", "Encapsulation", "Header", "CCNA"],
    difficulty: "beginner",
    objects: [
      tplText("edu-osi-h", 40, 40, "Encapsulation — wie aus Daten ein Frame wird", "#0F172A", 18),
      tplText("edu-osi-h2", 40, 68, "Sender (oben → unten) hängt Header an. Empfänger entkapselt in umgekehrter Reihenfolge.", "#475569", 12),

      // 5 Schichten als Bänder
      tplRect("edu-osi-l7-bg", 40, 110, 940, 60, "#FBBF24"),
      tplText("edu-osi-l7", 60, 145, "L7 Anwendung — z. B. HTTP-GET /index.html", "#78350F", 14),

      tplRect("edu-osi-l4-bg", 40, 185, 940, 60, "#60A5FA"),
      tplText("edu-osi-l4", 60, 220, "L4 Transport — TCP-Header [SrcPort 51322 | DstPort 80 | Seq | Ack | Flags] + Daten = Segment", "#1E3A8A", 13),

      tplRect("edu-osi-l3-bg", 40, 260, 940, 60, "#34D399"),
      tplText("edu-osi-l3", 60, 295, "L3 Internet — IP-Header [Src 10.0.0.5 | Dst 93.184.216.34 | TTL | Proto=TCP] + Segment = Paket", "#065F46", 13),

      tplRect("edu-osi-l2-bg", 40, 335, 940, 60, "#F472B6"),
      tplText("edu-osi-l2", 60, 370, "L2 Verbindung — Ethernet-Header [Src-MAC | Dst-MAC | EtherType=0x0800] + Paket + FCS = Frame", "#831843", 13),

      tplRect("edu-osi-l1-bg", 40, 410, 940, 60, "#9CA3AF"),
      tplText("edu-osi-l1", 60, 445, "L1 Bitübertragung — Frame als 0/1 auf Kabel, Funk oder Lichtwellenleiter", "#1F2937", 13),

      // Pfeil-Hinweise
      tplText("edu-osi-arrow", 1000, 280, "▼ Encapsulation", "#0F172A", 14),
      tplText("edu-osi-arrow2", 1000, 305, "▲ Decapsulation", "#0F172A", 14),

      tplText("edu-osi-tip1", 40, 510, "Merksatz: »Daten — Segment — Paket — Frame — Bits«.", "#334155", 13),
      tplText("edu-osi-tip2", 40, 532, "Jeder Header trägt Adressen seiner Schicht: L4=Ports, L3=IPs, L2=MACs.", "#334155", 13),
      tplText("edu-osi-tip3", 40, 554, "Switches arbeiten auf L2, Router auf L3, Firewalls L3/L4 (Stateful) bis L7 (NGFW).", "#334155", 13),
    ],
    connections: [],
    estimatedTime: "10 min",
    downloads: 0,
    rating: 5.0,
  },

  {
    id: "tpl-edu-tcp-handshake",
    name: "TCP 3-Way-Handshake",
    description:
      "Visualisiert den Verbindungsaufbau zwischen Client und Server mit SYN, SYN-ACK, ACK inkl. Sequenznummern. Basis für jedes TCP-Verständnis (HTTPS, SSH, RDP).",
    category: "education",
    author: "System",
    createdAt: 0,
    updatedAt: 0,
    tags: ["TCP", "Handshake", "Layer 4", "Verbindung"],
    difficulty: "beginner",
    objects: [
      tplText("edu-tcp-h", 40, 40, "TCP 3-Way-Handshake — verbindungsorientierter Aufbau", "#0F172A", 18),
      tplText("edu-tcp-h2", 40, 68, "Vor dem ersten Datenbyte synchronisieren Client und Server Sequenznummern.", "#475569", 12),

      tplShape("edu-tcp-c", "computer", 80, 220, 90, 90, "#3B82F6", "Client"),
      tplShape("edu-tcp-s", "server", 820, 220, 90, 90, "#8B5CF6", "Server :443"),

      tplText("edu-tcp-1", 220, 180, "1) SYN — Seq=x, Flags: SYN", "#B91C1C", 13),
      tplText("edu-tcp-1b", 220, 200, "Client: »Ich möchte sprechen.«", "#B91C1C", 11),

      tplText("edu-tcp-2", 220, 280, "2) SYN-ACK — Seq=y, Ack=x+1, Flags: SYN, ACK", "#15803D", 13),
      tplText("edu-tcp-2b", 220, 300, "Server: »OK — du hast x gesendet, ich starte mit y.«", "#15803D", 11),

      tplText("edu-tcp-3", 220, 380, "3) ACK — Seq=x+1, Ack=y+1, Flags: ACK", "#1D4ED8", 13),
      tplText("edu-tcp-3b", 220, 400, "Client: »Bestätigt — Verbindung steht.«", "#1D4ED8", 11),

      tplText("edu-tcp-state", 40, 480, "Zustände: CLOSED → SYN_SENT → ESTABLISHED (Client)", "#334155", 12),
      tplText("edu-tcp-state2", 40, 500, "         CLOSED → LISTEN → SYN_RCVD → ESTABLISHED (Server)", "#334155", 12),
      tplText("edu-tcp-tip", 40, 540, "Nach dem Handshake fließen Daten in beide Richtungen mit Bestätigung & Reihenfolge.", "#334155", 13),
      tplText("edu-tcp-tip2", 40, 562, "UDP überspringt all das → schneller, aber unzuverlässig (DNS, VoIP, Gaming).", "#334155", 13),
    ],
    connections: [
      tplConn("edu-tcp-c1", "edu-tcp-c", "edu-tcp-s", "SYN", "#EF4444", { animated: true, protocol: "TCP" }),
      tplConn("edu-tcp-c2", "edu-tcp-s", "edu-tcp-c", "SYN-ACK", "#22C55E", { animated: true, protocol: "TCP" }),
      tplConn("edu-tcp-c3", "edu-tcp-c", "edu-tcp-s", "ACK", "#3B82F6", { animated: true, protocol: "TCP" }),
    ],
    estimatedTime: "10 min",
    downloads: 0,
    rating: 5.0,
  },

  {
    id: "tpl-edu-dhcp-dora",
    name: "DHCP — DORA-Prozess",
    description:
      "Wie ein Client automatisch eine IP bekommt: Discover, Offer, Request, Acknowledge — jeweils mit Quell-/Ziel-Adressen, weil bei Discover noch keine eigene IP existiert.",
    category: "education",
    author: "System",
    createdAt: 0,
    updatedAt: 0,
    tags: ["DHCP", "DORA", "Auto-Konfiguration"],
    difficulty: "beginner",
    objects: [
      tplText("edu-dh-h", 40, 40, "DHCP DORA — automatische IP-Vergabe", "#0F172A", 18),
      tplText("edu-dh-h2", 40, 68, "Merksatz: D-O-R-A → Discover, Offer, Request, Acknowledge.", "#475569", 12),

      tplShape("edu-dh-c", "computer", 80, 230, 90, 90, "#3B82F6", "Client (kein IP)"),
      tplShape("edu-dh-srv", "dhcp-server", 820, 230, 90, 90, "#10B981", "DHCP-Server"),

      tplText("edu-dh-1", 230, 170, "1) DISCOVER — UDP 68→67", "#B91C1C", 13),
      tplText("edu-dh-1b", 230, 190, "Src 0.0.0.0 → Dst 255.255.255.255 (Broadcast)", "#B91C1C", 11),

      tplText("edu-dh-2", 230, 260, "2) OFFER — »Ich biete 192.168.10.45 an, Lease 24 h«", "#15803D", 13),
      tplText("edu-dh-2b", 230, 280, "Optionen: Subnetz, Gateway, DNS-Server", "#15803D", 11),

      tplText("edu-dh-3", 230, 350, "3) REQUEST — »Ich nehme die Offer von Server X«", "#1D4ED8", 13),
      tplText("edu-dh-3b", 230, 370, "Wieder Broadcast — andere Server merken: ich war's nicht", "#1D4ED8", 11),

      tplText("edu-dh-4", 230, 440, "4) ACK — »Bestätigt, IP ist deine«", "#A16207", 13),
      tplText("edu-dh-4b", 230, 460, "Client setzt IP, Maske, GW, DNS und startet Lease-Timer", "#A16207", 11),

      tplText("edu-dh-tip1", 40, 540, "Subnetz-übergreifend: Router braucht ip helper-address (DHCP-Relay).", "#334155", 13),
      tplText("edu-dh-tip2", 40, 562, "Lease-Erneuerung bei T1 (50 %), Rebinding bei T2 (87,5 %), Verlust bei 100 %.", "#334155", 13),
      tplText("edu-dh-tip3", 40, 584, "Häufiger Fehler: zwei DHCP-Server im selben Segment → konkurrierende Offers.", "#334155", 13),
    ],
    connections: [
      tplConn("edu-dh-c1", "edu-dh-c", "edu-dh-srv", "DISCOVER", "#EF4444", { animated: true, protocol: "UDP" }),
      tplConn("edu-dh-c2", "edu-dh-srv", "edu-dh-c", "OFFER", "#22C55E", { animated: true, protocol: "UDP" }),
      tplConn("edu-dh-c3", "edu-dh-c", "edu-dh-srv", "REQUEST", "#3B82F6", { animated: true, protocol: "UDP" }),
      tplConn("edu-dh-c4", "edu-dh-srv", "edu-dh-c", "ACK", "#F59E0B", { animated: true, protocol: "UDP" }),
    ],
    estimatedTime: "10 min",
    downloads: 0,
    rating: 5.0,
  },

  // ── QW-5a: VLAN + Trunk + Router-on-a-Stick ────────────────
  {
    id: "tpl-edu-vlan-trunk-ris",
    name: "VLAN + Trunk + Router-on-a-Stick",
    description:
      "Drei VLANs (Sales/IT/Mgmt), 802.1Q-Trunk zwischen zwei Switches und Inter-VLAN-Routing über einen Router mit Subinterfaces (Router-on-a-Stick). CCNA Blueprint 2.1.",
    category: "education",
    author: "System",
    createdAt: 0,
    updatedAt: 0,
    tags: ["VLAN", "Trunk", "802.1Q", "Router-on-a-Stick", "Inter-VLAN", "Didaktik"],
    difficulty: "beginner",
    objects: [
      // Header
      tplText("ris-h1", 60, 30, "Router-on-a-Stick — Inter-VLAN Routing", "#1E293B", 18),
      tplText("ris-h2", 60, 55, "R1 terminiert alle 3 VLANs via Subinterfaces (Gi0/0.10 / .20 / .30)", "#475569", 12),

      // Router
      tplShape("ris-r1", "router", 390, 90, 80, 80, "#F59E0B", "R1 (RoaS)"),
      tplText("ris-r1-sub", 340, 180, "Gi0/0.10  .20  .30", "#B45309", 11),

      // Switches
      tplShape("ris-sw1", "switch", 230, 290, 90, 70, "#10B981", "SW1"),
      tplShape("ris-sw2", "switch", 550, 290, 90, 70, "#10B981", "SW2"),

      // VLAN-Zone Hintergründe (SW1-Seite)
      tplRect("ris-zone10", 50, 420, 130, 110, "#BFDBFE"),
      tplRect("ris-zone20", 200, 420, 130, 110, "#BBF7D0"),
      tplRect("ris-zone30", 350, 420, 130, 110, "#DDD6FE"),

      // PCs an SW1
      tplShape("ris-pc10",  "computer", 85,  450, 65, 65, "#3B82F6", "PC-Sales"),
      tplShape("ris-pc20",  "computer", 235, 450, 65, 65, "#10B981", "PC-IT"),
      tplShape("ris-pc30",  "computer", 385, 450, 65, 65, "#8B5CF6", "PC-Mgmt"),

      // VLAN-Labels
      tplText("ris-l10", 58,  425, "VLAN 10 — Sales", "#1D4ED8", 11),
      tplText("ris-l20", 208, 425, "VLAN 20 — IT", "#15803D", 11),
      tplText("ris-l30", 358, 425, "VLAN 30 — Mgmt", "#6D28D9", 11),
      tplText("ris-l10b", 58,  438, "192.168.10.0/24", "#1D4ED8", 10),
      tplText("ris-l20b", 208, 438, "192.168.20.0/24", "#15803D", 10),
      tplText("ris-l30b", 358, 438, "192.168.30.0/24", "#6D28D9", 10),

      // PC an SW2
      tplShape("ris-pc10b", "computer", 545, 450, 65, 65, "#3B82F6", "PC2-Sales"),
      tplText("ris-l10c", 525, 435, "VLAN 10", "#1D4ED8", 10),

      // Voice-VLAN-Zone
      tplRect("ris-zone-voice", 490, 420, 145, 110, "#FED7AA"),
      tplText("ris-l-voice",  492, 425, "Voice VLAN 100", "#92400E", 11),
      tplText("ris-l-voice2", 492, 438, "Data  VLAN 10",  "#92400E", 10),
      tplShape("ris-phone1", "server",   510, 450, 55, 55, "#F97316", "IP-Phone"),
      tplShape("ris-pcv1",   "computer", 575, 450, 55, 55, "#94A3B8", "PC (hinter Phone)"),

      // Hinweis
      tplText("ris-tip1", 60, 570, "Trunk-Port: switchport mode trunk  |  switchport trunk allowed vlan 10,20,30,100", "#334155", 12),
      tplText("ris-tip2", 60, 588, "Access-Port: switchport mode access  |  switchport access vlan <ID>", "#334155", 12),
      tplText("ris-tip3", 60, 606, "Router: interface Gi0/0.10  |  encapsulation dot1Q 10  |  ip address 192.168.10.1 255.255.255.0", "#334155", 12),
      tplText("ris-tip4", 60, 622, "Voice VLAN: switchport voice vlan 100  |  mls qos trust device cisco-phone", "#92400E", 12),
    ],
    connections: [
      tplConn("ris-c1", "ris-r1",    "ris-sw1",   "Gi0/0 Trunk 802.1Q",              "#F59E0B"),
      tplConn("ris-c2", "ris-sw1",   "ris-sw2",   "Trunk 802.1Q (Gi0/24)",           "#F59E0B"),
      tplConn("ris-c3", "ris-sw1",   "ris-pc10",  "Gi0/1 Access VLAN10",             "#3B82F6"),
      tplConn("ris-c4", "ris-sw1",   "ris-pc20",  "Gi0/2 Access VLAN20",             "#10B981"),
      tplConn("ris-c5", "ris-sw1",   "ris-pc30",  "Gi0/3 Access VLAN30",             "#8B5CF6"),
      tplConn("ris-c6", "ris-sw2",   "ris-pc10b", "Gi0/1 Access VLAN10",             "#3B82F6"),
      tplConn("ris-c7", "ris-sw1",   "ris-phone1","Gi0/4 Access VLAN10 + Voice 100", "#F97316"),
    ],
    estimatedTime: "20 min",
    downloads: 0,
    rating: 4.9,
  },

  // ── tpl-edu-vlan-hopping: VLAN-Hopping Double-Tagging Attack ──
  {
    id: "tpl-edu-vlan-hopping",
    name: "VLAN-Hopping: Double-Tagging Attack",
    description:
      "Visualisiert den Double-Tagging-Angriff: Angreifer im Native VLAN sendet doppelt-getaggten Frame, überwindet VLAN-Grenzen ohne Routing. Zeigt Angriffsschritte und Gegenmaßnahmen. CCNA Blueprint 2.1.",
    category: "education",
    author: "System",
    createdAt: 0,
    updatedAt: 0,
    tags: ["VLAN", "Security", "Double-Tagging", "VLAN-Hopping", "Native-VLAN", "Didaktik"],
    difficulty: "intermediate",
    objects: [
      // ── Zone 1: Titel + Untertitel ──────────────────────────────────
      tplText("vhop-h1", 60, 20,
        "VLAN-Hopping: Double-Tagging Attack", "#991B1B", 18),
      tplText("vhop-h2", 60, 44,
        "Angreifer in Native VLAN sendet doppelt-getaggten Frame → erreicht VLAN 20 ohne Routing",
        "#475569", 12),

      // ── Zone 2: Warnungs-Banner ──────────────────────────────────────
      tplRect("vhop-warn", 50, 58, 740, 28, "#EF4444"),
      tplText("vhop-warn-t", 58, 77,
        "⚠️  Funktioniert NUR wenn Native VLAN = Angreifer-VLAN  |  Gegenmaßnahme: Native VLAN 999 (keine Hosts)",
        "#991B1B", 11),

      // ── Zone 3: Topologie — vier Shapes horizontal ──────────────────
      // Angreifer-Zone: Hintergrund-Rechteck (VLAN 1 Native)
      tplRect("vhop-zone-a", 45, 96, 158, 124, "#EF4444"),
      tplText("vhop-al1", 53, 110, "VLAN 1 (Native)", "#EF4444", 10),
      tplShape("vhop-attacker", "computer", 71, 120, 70, 70, "#EF4444", "Angreifer"),

      // SW1 (kein Zonen-Hintergrund — Switch im freien Raum)
      tplShape("vhop-sw1", "switch", 255, 120, 90, 70, "#10B981", "SW1"),

      // SW2
      tplShape("vhop-sw2", "switch", 445, 120, 90, 70, "#10B981", "SW2"),

      // Ziel-Zone: Hintergrund-Rechteck (VLAN 20)
      tplRect("vhop-zone-t", 612, 96, 165, 124, "#3B82F6"),
      tplText("vhop-tl1", 620, 110, "VLAN 20", "#3B82F6", 10),
      tplShape("vhop-target", "server", 635, 120, 65, 65, "#64748B", "Ziel-Server"),

      // ── Zone 4: Schritt-Erklärungen unter SW1 und SW2 ───────────────
      // Unter SW1 (x=255–345, Boxmitte ~300)
      tplRect("vhop-step1", 50, 236, 350, 60, "#F59E0B"),
      tplText("vhop-s1a", 58, 254, "① Frame an SW1: [Tag VL1][Tag VL20]", "#92400E", 11),
      tplText("vhop-s1b", 58, 272, "② SW1 entfernt äußeren Tag (Native VLAN 1)", "#92400E", 11),

      // Unter SW2 (x=445–535, Boxmitte ~490)
      tplRect("vhop-step3", 408, 236, 375, 60, "#38BDF8"),
      tplText("vhop-s3a", 416, 254, "③ SW2 sieht [Tag VL20] → leitet an VLAN 20 weiter", "#1D4ED8", 11),
      tplText("vhop-s3b", 416, 272, "④ Angreifer hat VLAN 20 erreicht — ohne Routing!", "#1D4ED8", 11),

      // ── Zone 5: Unidirektional-Hinweis ──────────────────────────────
      tplRect("vhop-uni", 50, 308, 740, 28, "#22C55E"),
      tplText("vhop-uni-t", 58, 327,
        "⚠️  UNIDIREKTIONAL: Antwortframes kommen über normalen Gateway zurück (nicht über den Angriffspfad)",
        "#166534", 11),

      // ── Zone 6: Gegenmaßnahmen-Block ────────────────────────────────
      tplRect("vhop-cm", 50, 348, 740, 112, "#6366F1"),
      tplText("vhop-cm-h",  58, 365, "Gegenmaßnahmen:", "#E2E8F0", 13),
      tplText("vhop-cm1",  58, 387,
        "switchport trunk native vlan 999   (999 = unbenutztes VLAN ohne Hosts)",
        "#94A3B8", 11),
      tplText("vhop-cm2",  58, 407,
        "vlan dot1q tag native               (Native VLAN wird ebenfalls getaggt)",
        "#94A3B8", 11),
      tplText("vhop-cm3",  58, 427,
        "switchport trunk allowed vlan remove 1   (VLAN 1 vom Trunk entfernen)",
        "#94A3B8", 11),
    ],
    connections: [
      tplConn("vhop-c1", "vhop-attacker", "vhop-sw1",
        "[VL1][VL20] doppelt getaggt", "#EF4444", { animated: true, labelOffsetY: 55 }),
      tplConn("vhop-c2", "vhop-sw1", "vhop-sw2",
        "[VL20] äußerer Tag entfernt", "#F59E0B", { animated: true, labelOffsetY: 55 }),
      tplConn("vhop-c3", "vhop-sw2", "vhop-target",
        "[VL20] Zustellung", "#3B82F6", { animated: true, labelOffsetY: 55 }),
    ],
    estimatedTime: "15 min",
    downloads: 0,
    rating: 4.9,
  },

  // ── QW-5b: STP Root Bridge Election ────────────────────────
  {
    id: "tpl-edu-stp-root-bridge",
    name: "STP Root Bridge Election",
    description:
      "Drei Switches mit unterschiedlicher Bridge Priority. Zeigt Bridge-ID-Aufbau (Priority + VLAN-Extension + MAC), Port-Rollen (RP/DP/BLK) und die vollständige Tiebreaker-Reihenfolge. CCNA Blueprint 2.5.",
    category: "education",
    author: "System",
    createdAt: 0,
    updatedAt: 0,
    tags: ["STP", "Spanning Tree", "Root Bridge", "RSTP", "Port-Rolle", "Didaktik"],
    difficulty: "intermediate",
    objects: [
      // Header
      tplText("stp-h1", 60, 25,  "STP Root Bridge Election (IEEE 802.1D)", "#1E293B", 18),
      tplText("stp-h2", 60, 50,  "Niedrigste Bridge-ID gewinnt → Priority (4 Bit) + VLAN-Extension (12 Bit) + MAC-Adresse (48 Bit)", "#475569", 12),

      // Root-Zone Hintergrund
      tplRect("stp-zone-root", 310, 90, 200, 130, "#D1FAE5"),
      tplText("stp-root-badge", 325, 97, "✓ ROOT BRIDGE", "#065F46", 13),

      // Switches
      tplShape("stp-sw1", "switch", 355, 110, 100, 80, "#10B981", "SW1"),
      tplShape("stp-sw2", "switch", 130, 340, 100, 80, "#3B82F6", "SW2"),
      tplShape("stp-sw3", "switch", 590, 340, 100, 80, "#3B82F6", "SW3"),

      // Bridge-ID Annotationen
      tplText("stp-bid1",  265, 200, "Bridge-ID: 4096.1.AA:BB:CC:DD:EE:01", "#065F46", 11),
      tplText("stp-bid1b", 265, 214, "Priority 4096 (manuell gesetzt)  ← gewinnt", "#065F46", 11),
      tplText("stp-bid2",  30,  430, "Bridge-ID: 32768.1.11:22:33:44:55:02", "#1D4ED8", 11),
      tplText("stp-bid2b", 30,  444, "Priority 32768 (Default, PVST VLAN 1)", "#1D4ED8", 11),
      tplText("stp-bid3",  490, 430, "Bridge-ID: 32768.1.AA:BB:CC:DD:EE:03", "#1D4ED8", 11),
      tplText("stp-bid3b", 490, 444, "Priority 32768 (Default, PVST VLAN 1)", "#1D4ED8", 11),

      // Port-Rollen Labels (nahe der Verbindungen)
      tplText("stp-pr1",  270, 255, "DP",  "#065F46", 13),   // SW1-Seite → SW2
      tplText("stp-pr2",  430, 255, "DP",  "#065F46", 13),   // SW1-Seite → SW3
      tplText("stp-pr3",  185, 310, "RP",  "#1D4ED8", 13),   // SW2 → Root
      tplText("stp-pr4",  590, 310, "RP",  "#1D4ED8", 13),   // SW3 → Root
      tplText("stp-pr5",  300, 400, "DP",  "#10B981", 13),   // SW2 → SW3 Designated
      tplText("stp-pr6",  480, 400, "BLK", "#EF4444", 13),   // SW3 → SW2 Blocked

      // Tiebreaker Erklärung
      tplRect("stp-tbox", 60, 500, 740, 120, "#F1F5F9"),
      tplText("stp-tb0", 75, 510, "Port-Rollen-Entscheidung (Tiebreaker-Reihenfolge wenn Priority gleich):", "#0F172A", 13),
      tplText("stp-tb1", 75, 530, "1. Niedrigster Root Path Cost (Summe der Link-Kosten zum Root)  — Kosten nach IEEE 802.1D-1998:", "#334155", 12),
      tplText("stp-tb2", 75, 546, "   10 Mbps = 100  |  100 Mbps = 19  |  1 Gbps = 4  |  10 Gbps = 2", "#334155", 12),
      tplText("stp-tb3", 75, 562, "2. Niedrigste Sender-Bridge-ID  →  3. Niedrigste Sender-Port-Priority  →  4. Niedrigste Port-Nummer", "#334155", 12),
      tplText("stp-tb4", 75, 582, "SW3 Gi0/2 → SW2: Path Cost 4+4=8 > direkter Pfad 4 → BLK  (kein weiterer Nutzen, würde Loop erzeugen)", "#7C3AED", 12),
      tplText("stp-tb5", 75, 598, "Cisco-Befehl: spanning-tree vlan 1 priority 4096", "#0F172A", 13),
    ],
    connections: [
      tplConn("stp-c1", "stp-sw1", "stp-sw2", "Cost 4 (1 Gbps)", "#10B981"),
      tplConn("stp-c2", "stp-sw1", "stp-sw3", "Cost 4 (1 Gbps)", "#10B981"),
      tplConn("stp-c3", "stp-sw2", "stp-sw3", "Cost 4 (1 Gbps) — BLK", "#EF4444"),
    ],
    estimatedTime: "25 min",
    downloads: 0,
    rating: 4.9,
  },
];

export function searchTemplates(
  templates: CanvasTemplate[],
  query: string,
  category?: TemplateCategory,
  difficulty?: CanvasTemplate["difficulty"],
): CanvasTemplate[] {
  const q = query.toLowerCase();
  return templates.filter((t) => {
    if (category && t.category !== category) return false;
    if (difficulty && t.difficulty !== difficulty) return false;
    if (!q) return true;
    return (
      t.name.toLowerCase().includes(q) ||
      t.description.toLowerCase().includes(q) ||
      t.tags.some((tag) => tag.toLowerCase().includes(q))
    );
  });
}
