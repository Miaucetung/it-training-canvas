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

// Helper to create a CanvasConnection for templates
function tplConn(
  id: string,
  sourceId: string,
  targetId: string,
  label: string,
  color: string,
  options?: { animated?: boolean; protocol?: string },
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
