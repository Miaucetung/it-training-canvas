import {
  DrawingObject,
  CanvasConnection,
  ShapeConfig,
  Annotation,
  SubjectData,
} from "@/lib/types";
import {
  DeviceType,
  LinkType,
  LinkStatus,
  NetworkTopology,
  TopologyDevice,
  TopologyInterface,
  TopologyLink,
  TopologySubnetZone,
  TopologyAnnotation,
  networkTopologySchema,
} from "@/types/topology";

// ============================================================================
// Legacy Canvas → NetworkTopology Migration Engine
// ============================================================================

const LEGACY_SHAPE_TO_DEVICE_TYPE: Record<string, DeviceType> = {
  router: "router",
  switch: "switch-l2",
  "switch-l2": "switch-l2",
  "switch-l3": "switch-l3",
  loadbalancer: "switch-l3",
  computer: "pc",
  pc: "pc",
  client: "pc",
  workstation: "pc",
  server: "server",
  "web-server": "server",
  "database-server": "server",
  firewall: "firewall",
  "access-point": "access-point",
  ap: "access-point",
  wlc: "wlc",
  cloud: "cloud",
  gateway: "router",
};

const LEGACY_CONNECTION_TYPE_MAP: Record<string, LinkType> = {
  ethernet: "ethernet",
  fiber: "ethernet",
  serial: "serial",
  trunk: "trunk",
  etherchannel: "etherchannel",
  wifi: "wireless",
  wireless: "wireless",
  vpn: "serial",
};

export function migrateLegacyShapeToDevice(obj: DrawingObject): TopologyDevice | null {
  if (obj.type !== "shape") return null;

  const shapeId = (obj.shapeId || "router").toLowerCase();
  const deviceType: DeviceType = LEGACY_SHAPE_TO_DEVICE_TYPE[shapeId] || "router";

  const x = obj.startPoint ? obj.startPoint.x : 0;
  const y = obj.startPoint ? obj.startPoint.y : 0;
  const width = obj.shapeWidth || 80;
  const height = obj.shapeHeight || 60;

  // Extract IP / Interface configuration from legacy config object
  const interfaces: TopologyInterface[] = [];
  const cfg = obj.config as (ShapeConfig & { network?: Record<string, any> }) | undefined;
  const ipAddress = cfg?.ipAddress || cfg?.network?.ipAddress;
  const subnetMask = cfg?.subnetMask || cfg?.network?.subnetMask;
  const macAddress = cfg?.mac || cfg?.network?.macAddress || cfg?.network?.mac;
  const gateway = cfg?.gateway || cfg?.network?.gateway;
  const dnsServers = cfg?.dns
    ? (Array.isArray(cfg.dns) ? cfg.dns : [cfg.dns])
    : (cfg?.network?.dns ? (Array.isArray(cfg.network.dns) ? cfg.network.dns : [cfg.network.dns]) : undefined);

  if (ipAddress) {
    interfaces.push({
      id: "if-primary",
      name: deviceType === "router" ? "Gi0/0/0" : deviceType === "pc" ? "eth0" : "Vlan1",
      ip: ipAddress + (subnetMask ? ` (${subnetMask})` : ""),
      mac: macAddress,
      status: "up",
    });
  } else {
    // Generate standard default interface for the device type
    interfaces.push({
      id: "if-default",
      name: deviceType === "router" ? "Gi0/0/0" : deviceType === "pc" ? "eth0" : "Gi0/1",
      status: "up",
    });
  }

  return {
    id: obj.id,
    name: obj.label || `${deviceType.toUpperCase()}-${obj.id.slice(-4)}`,
    type: deviceType,
    x,
    y,
    width,
    height,
    interfaces,
    status: obj.status === "error" ? "error" : obj.status === "warning" ? "warning" : "active",
    label: obj.label,
    config: {
      hostname: obj.label || `${deviceType.toUpperCase()}-${obj.id.slice(-4)}`,
      defaultGateway: gateway,
      dnsServers: dnsServers,
    },
  };
}

export function migrateLegacyConnectionToLink(conn: CanvasConnection): TopologyLink {
  const linkType: LinkType =
    LEGACY_CONNECTION_TYPE_MAP[(conn.connectionType || "").toLowerCase()] || "ethernet";

  const status: LinkStatus =
    conn.status === "error"
      ? "down"
      : conn.status === "inactive"
        ? "down"
        : "up";

  return {
    id: conn.id,
    sourceDeviceId: conn.sourceShapeId,
    sourceInterfaceId: conn.sourcePort || "port-src",
    targetDeviceId: conn.targetShapeId,
    targetInterfaceId: conn.targetPort || "port-tgt",
    linkType,
    status,
    label: conn.label,
    bandwidth: conn.bandwidth || "1 Gbps",
    animated: conn.animated ?? false,
  };
}

export function migrateLegacyDrawingObjectToAnnotation(
  obj: DrawingObject
): TopologyAnnotation | null {
  if (
    obj.type === "shape" ||
    obj.type === "connection" ||
    obj.type === "select" ||
    obj.type === "eraser"
  ) {
    return null;
  }

  const startX = obj.startPoint?.x ?? (obj.points?.[0]?.x ?? 0);
  const startY = obj.startPoint?.y ?? (obj.points?.[0]?.y ?? 0);

  if (obj.type === "pen") {
    return {
      id: obj.id,
      type: "freehand",
      x: startX,
      y: startY,
      points: obj.points?.map((p) => ({ x: p.x, y: p.y })),
      color: obj.color,
      strokeWidth: obj.width,
    };
  }

  if (obj.type === "text") {
    return {
      id: obj.id,
      type: "text",
      x: startX,
      y: startY,
      text: obj.text || obj.label || "",
      color: obj.color,
      fontSize: obj.fontSize,
      fontFamily: obj.fontFamily,
    };
  }

  if (obj.type === "line") {
    return {
      id: obj.id,
      type: "line",
      x: startX,
      y: startY,
      endX: obj.endPoint?.x ?? startX,
      endY: obj.endPoint?.y ?? startY,
      color: obj.color,
      strokeWidth: obj.width,
      text: obj.label,
    };
  }

  if (obj.type === "arrow") {
    return {
      id: obj.id,
      type: "arrow",
      x: startX,
      y: startY,
      endX: obj.endPoint?.x ?? startX,
      endY: obj.endPoint?.y ?? startY,
      color: obj.color,
      strokeWidth: obj.width,
      text: obj.label,
    };
  }

  if (obj.type === "circle") {
    const endX = obj.endPoint?.x ?? startX + 50;
    const endY = obj.endPoint?.y ?? startY + 50;
    return {
      id: obj.id,
      type: "circle",
      x: Math.min(startX, endX),
      y: Math.min(startY, endY),
      width: Math.abs(endX - startX),
      height: Math.abs(endY - startY),
      color: obj.color,
      strokeWidth: obj.width,
      text: obj.label,
    };
  }

  if (obj.type === "rectangle") {
    const endX = obj.endPoint?.x ?? startX + 100;
    const endY = obj.endPoint?.y ?? startY + 60;
    return {
      id: obj.id,
      type: "box",
      x: Math.min(startX, endX),
      y: Math.min(startY, endY),
      width: Math.abs(endX - startX),
      height: Math.abs(endY - startY),
      color: obj.color,
      strokeWidth: obj.width,
      text: obj.label,
    };
  }

  return null;
}

export function migrateCollaborationAnnotationToTopology(
  ann: Annotation
): TopologyAnnotation {
  return {
    id: ann.id,
    type: "note",
    x: ann.x,
    y: ann.y,
    width: ann.width,
    height: ann.height,
    text: ann.text,
    color: ann.authorColor,
    author: ann.author,
    targetDeviceId: ann.targetObjectId,
    createdAt: new Date(ann.createdAt).toISOString(),
  };
}

export function migrateLegacyCanvasToTopology(
  objects: DrawingObject[],
  connections: CanvasConnection[],
  topologyMeta?: {
    id?: string;
    name?: string;
    description?: string;
    annotations?: Annotation[];
  }
): NetworkTopology {
  const devices: TopologyDevice[] = [];
  const subnetZones: TopologySubnetZone[] = [];
  const annotations: TopologyAnnotation[] = [];
  const unmapped: unknown[] = [];

  // Striktes CIDR-Regex für eindeutige Subnetz-Zonen (z. B. "192.168.1.0/24" oder "10.0.0.0/8")
  const cidrRegex = /\b(\d{1,3}\.){3}\d{1,3}\/\d{1,2}\b/;

  for (const obj of objects) {
    if (obj.type === "shape") {
      const device = migrateLegacyShapeToDevice(obj);
      if (device) {
        devices.push(device);
      } else {
        unmapped.push({ reason: "Unbekannter oder fehlerhafter Shape-Typ", original: obj });
      }
    } else if (obj.type === "rectangle" && obj.startPoint && obj.endPoint) {
      const label = (obj.label || "").trim();
      const match = label.match(cidrRegex);

      if (match) {
        // Eindeutige Subnetz-Zone mit validem CIDR-Präfix
        const x = Math.min(obj.startPoint.x, obj.endPoint.x);
        const y = Math.min(obj.startPoint.y, obj.endPoint.y);
        const width = Math.abs(obj.endPoint.x - obj.startPoint.x);
        const height = Math.abs(obj.endPoint.y - obj.startPoint.y);
        subnetZones.push({
          id: obj.id,
          name: label, // Originaltext vollständig erhalten
          cidr: match[0],
          color: obj.color || "#3B82F6",
          x,
          y,
          width,
          height,
        });
      } else {
        // Nicht eindeutig als Subnetz-Zone identifizierbar → verlustfrei als Box-Annotation erhalten!
        const ann = migrateLegacyDrawingObjectToAnnotation(obj);
        if (ann) {
          annotations.push(ann);
        } else {
          unmapped.push({ reason: "Rechteck-Annotation konnte nicht konvertiert werden", original: obj });
        }
      }
    } else {
      // Alle anderen Zeichenobjekte (Text, Pen, Pfeile, Linien, Kreise)
      const ann = migrateLegacyDrawingObjectToAnnotation(obj);
      if (ann) {
        annotations.push(ann);
      } else {
        // Objekt ohne Mapping (z. B. Werkzeug-Marker wie select/eraser oder beschädigte Objekte)
        if (obj.type !== "select" && obj.type !== "eraser") {
          unmapped.push({ reason: "Objekt-Typ nicht direkt abbildbar", original: obj });
        }
      }
    }
  }

  // Kollaborations-Notizen einbetten
  if (topologyMeta?.annotations) {
    for (const ca of topologyMeta.annotations) {
      try {
        annotations.push(migrateCollaborationAnnotationToTopology(ca));
      } catch (err) {
        unmapped.push({ reason: "Fehler beim Konvertieren von Kollaborations-Notiz", original: ca, error: String(err) });
      }
    }
  }

  // Links validieren: Endpunkte prüfen
  const deviceIdSet = new Set(devices.map((d) => d.id));
  const links: TopologyLink[] = [];

  for (const conn of connections) {
    if (deviceIdSet.has(conn.sourceShapeId) && deviceIdSet.has(conn.targetShapeId)) {
      links.push(migrateLegacyConnectionToLink(conn));
    } else {
      // Isolierte oder herrenlose Verbindung wird im unmapped Layer aufbewahrt
      unmapped.push({
        reason: "Verbindung referenziert nicht mehr existente Geräte (Dangling Link)",
        original: conn,
      });
    }
  }

  return {
    id: topologyMeta?.id || `topology-${Date.now()}`,
    name: topologyMeta?.name || "Migrierte Topologie",
    description: topologyMeta?.description || "Automatisch aus dem bestehenden Canvas migriert",
    version: "2.0",
    devices,
    links,
    subnetZones: subnetZones.length > 0 ? subnetZones : undefined,
    annotations: annotations.length > 0 ? annotations : undefined,
    unmapped: unmapped.length > 0 ? unmapped : undefined,
    metadata: {
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      author: "Migration-Engine",
    },
  };
}

// ============================================================================
// Idempotente LocalStorage-Migration: canvas-app-data → canvas-topology-v2
// ============================================================================

export const V1_STORAGE_KEY = "canvas-app-data";
export const V2_STORAGE_KEY = "canvas-topology-v2";

export interface MigrationConflict {
  subjectKey: string;
  v1LastModified?: number;
  v2UpdatedAt?: string;
  backupKey: string;
  message: string;
}

export interface MigrationResult {
  success: boolean;
  migratedCount: number;
  topologies: Record<string, NetworkTopology>;
  skippedBecauseCurrent: boolean;
  conflicts: MigrationConflict[];
  backupCreated?: string;
  errors: string[];
}

export function migrateLocalStorageCanvasToV2(options?: {
  storage?: Storage;
  force?: boolean;
}): MigrationResult {
  const storage =
    options?.storage || (typeof window !== "undefined" ? window.localStorage : null);
  const result: MigrationResult = {
    success: false,
    migratedCount: 0,
    topologies: {},
    skippedBecauseCurrent: false,
    conflicts: [],
    errors: [],
  };

  if (!storage) {
    result.errors.push("LocalStorage ist in dieser Umgebung nicht verfügbar");
    return result;
  }

  try {
    const rawV1 = storage.getItem(V1_STORAGE_KEY);
    if (!rawV1) {
      // Keine Altdaten vorhanden → fehlerfrei beenden
      result.success = true;
      return result;
    }

    let parsedV1: Record<string, SubjectData>;
    try {
      parsedV1 = JSON.parse(rawV1);
    } catch (parseErr) {
      result.errors.push(`Ungültiges JSON in ${V1_STORAGE_KEY}: ${(parseErr as Error).message}`);
      return result;
    }

    // Vorhandene V2-Daten für Idempotenz und Konfliktprüfung laden
    const rawV2 = storage.getItem(V2_STORAGE_KEY);
    let existingV2: Record<string, NetworkTopology> = {};
    if (rawV2) {
      try {
        existingV2 = JSON.parse(rawV2);
      } catch {
        existingV2 = {};
      }
    }

    const migratedTopologies: Record<string, NetworkTopology> = { ...existingV2 };
    let hasChanges = false;

    for (const [subjectKey, subjectData] of Object.entries(parsedV1)) {
      if (!subjectData || typeof subjectData !== "object") continue;

      const canvasState = subjectData.canvasState;
      const objects = Array.isArray(canvasState?.objects) ? canvasState.objects : [];
      const connections = Array.isArray(canvasState?.connections) ? canvasState.connections : [];

      if (objects.length === 0 && connections.length === 0) continue;

      const topoId = `topology-${subjectKey.toLowerCase()}`;
      const existing = existingV2[subjectKey];

      // Idempotenz- und Konflikt-Prüfung:
      if (existing && existing.metadata?.updatedAt && subjectData.lastModified) {
        const v2Time = new Date(existing.metadata.updatedAt).getTime();
        const v1Time = subjectData.lastModified;

        // Fall 1: V2 ist bereits auf demselben oder neueren Stand wie V1 -> Skip
        if (!options?.force && v2Time >= v1Time) {
          continue;
        }

        // Fall 2: V2 wurde eigenständig in V2 bearbeitet (Author nicht reine Migration oder v2Time weicht ab)
        // UND V1 wurde ebenfalls editiert -> Konflikt!
        const wasEditedInV2 = existing.metadata.author !== "Migration-Engine";
        if (!options?.force && wasEditedInV2 && v1Time > v2Time) {
          // KONFLIKT-REGEL: Niemals stillschweigend überschreiben!
          // Sicherungskopie von V2 erstellen
          const backupKey = `${V2_STORAGE_KEY}-backup-${Date.now()}`;
          try {
            storage.setItem(backupKey, JSON.stringify(existingV2));
            result.backupCreated = backupKey;
          } catch (backupErr) {
            console.warn("Konnte automatisches V2-Backup nicht schreiben:", backupErr);
          }

          result.conflicts.push({
            subjectKey,
            v1LastModified: v1Time,
            v2UpdatedAt: existing.metadata.updatedAt,
            backupKey,
            message: `Konflikt bei Fach '${subjectKey}': Sowohl v1 als auch v2 enthalten separate Änderungen. V2 wurde geschützt und nicht überschrieben.`,
          });
          continue; // V2 wird ohne explizites 'force' nicht überschrieben!
        }
      }

      try {
        const topology = migrateLegacyCanvasToTopology(objects, connections, {
          id: topoId,
          name: `${subjectKey} Topologie`,
          description: `Aus Fach ${subjectKey} verlustfrei migriert`,
        });

        if (topology.metadata && subjectData.lastModified) {
          topology.metadata.updatedAt = new Date(subjectData.lastModified).toISOString();
        }

        // Zod Runtime-Validierung
        const validated = networkTopologySchema.safeParse(topology);
        if (validated.success) {
          migratedTopologies[subjectKey] = validated.data;
          result.migratedCount++;
          hasChanges = true;
        } else {
          result.errors.push(
            `Validierungsfehler für ${subjectKey}: ${validated.error.message}`
          );
        }
      } catch (itemErr) {
        result.errors.push(
          `Fehler bei Migration von ${subjectKey}: ${(itemErr as Error).message}`
        );
      }
    }

    if (hasChanges) {
      storage.setItem(V2_STORAGE_KEY, JSON.stringify(migratedTopologies));
    } else {
      result.skippedBecauseCurrent = true;
    }

    result.topologies = migratedTopologies;
    result.success = result.errors.length === 0;
    return result;
  } catch (globalErr) {
    result.errors.push(`Migrations-Engine Ausnahme: ${(globalErr as Error).message}`);
    return result;
  }
}
