import { describe, expect, it } from "vitest";
import {
  networkTopologySchema,
  topologyDeviceSchema,
  topologyLinkSchema,
} from "@/types/topology";
import {
  migrateLegacyCanvasToTopology,
  migrateLegacyConnectionToLink,
  migrateLegacyShapeToDevice,
  migrateLocalStorageCanvasToV2,
  getBackupKeys,
  pruneBackups,
  safeSetItem,
  restoreBackupSnapshot,
  V1_STORAGE_KEY,
  V2_STORAGE_KEY,
} from "@/lib/topology/migration";
import {
  BUILT_IN_CCNA_TOPOLOGIES,
  generateBenchmarkTopology,
  TOPOLOGY_BASIC_LAN,
  TOPOLOGY_OSPF,
  TOPOLOGY_ROUTER_ON_A_STICK,
  TOPOLOGY_STP_TRIANGLE,
} from "@/lib/topology/sample-topologies";
import { CanvasConnection, DrawingObject } from "@/lib/types";
import { updateAnnotation, deleteAnnotation } from "@/lib/topology/topology-operations";

describe("Network Topology Schema & Validation (2.0)", () => {
  it("validates all built-in CCNA topologies with Zod schema", () => {
    for (const topo of BUILT_IN_CCNA_TOPOLOGIES) {
      const parsed = networkTopologySchema.safeParse(topo);
      expect(parsed.success, `Topology ${topo.id} failed validation: ${parsed.error?.message}`).toBe(true);
    }
  });

  it("validates Basic LAN topology properties", () => {
    expect(TOPOLOGY_BASIC_LAN.devices).toHaveLength(5);
    expect(TOPOLOGY_BASIC_LAN.links).toHaveLength(4);
    const router = TOPOLOGY_BASIC_LAN.devices.find((d) => d.type === "router");
    expect(router).toBeDefined();
    expect(router?.interfaces[0].ip).toBe("192.168.1.1/24");
  });

  it("validates STP Triangle with blocking link", () => {
    const blockingLink = TOPOLOGY_STP_TRIANGLE.links.find(
      (l) => l.status === "stp-blocking"
    );
    expect(blockingLink).toBeDefined();
    expect(blockingLink?.label).toContain("BLK");
  });

  it("validates Router-on-a-Stick with VLANs and Subinterfaces", () => {
    expect(TOPOLOGY_ROUTER_ON_A_STICK.vlans).toHaveLength(2);
    const trunkLink = TOPOLOGY_ROUTER_ON_A_STICK.links.find(
      (l) => l.linkType === "trunk"
    );
    expect(trunkLink).toBeDefined();
    expect(trunkLink?.vlansAllowed).toEqual([10, 20]);
  });

  it("generates and validates a 50-device, 80-link benchmark topology", () => {
    const bench = generateBenchmarkTopology(50, 80);
    expect(bench.devices).toHaveLength(50);
    expect(bench.links).toHaveLength(80);

    const parsed = networkTopologySchema.safeParse(bench);
    expect(parsed.success, parsed.error?.message).toBe(true);
  });
});

describe("Legacy Canvas to NetworkTopology Migration", () => {
  it("migrates legacy router and switch shapes correctly", () => {
    const legacyRouter: DrawingObject = {
      id: "legacy-r1",
      type: "shape",
      color: "#10B981",
      width: 2,
      shapeId: "router",
      label: "Core-Router",
      startPoint: { x: 100, y: 150 },
      shapeWidth: 80,
      shapeHeight: 60,
      config: {
        ipAddress: "192.168.1.1",
        subnetMask: "255.255.255.0",
        gateway: "192.168.1.254",
        mac: "00:11:22:33:44:55",
      },
    };

    const device = migrateLegacyShapeToDevice(legacyRouter);
    expect(device).not.toBeNull();
    expect(device?.id).toBe("legacy-r1");
    expect(device?.name).toBe("Core-Router");
    expect(device?.type).toBe("router");
    expect(device?.x).toBe(100);
    expect(device?.y).toBe(150);
    expect(device?.interfaces[0].ip).toContain("192.168.1.1");
    expect(device?.config?.defaultGateway).toBe("192.168.1.254");

    const parsed = topologyDeviceSchema.safeParse(device);
    expect(parsed.success).toBe(true);
  });

  it("migrates legacy connections to topology links", () => {
    const legacyConn: CanvasConnection = {
      id: "conn-123",
      sourceShapeId: "legacy-r1",
      sourcePort: "right",
      targetShapeId: "legacy-sw1",
      targetPort: "left",
      connectionType: "ethernet",
      status: "active",
      animated: true,
      label: "Gi0/1",
      bandwidth: "1 Gbps",
    };

    const link = migrateLegacyConnectionToLink(legacyConn);
    expect(link.id).toBe("conn-123");
    expect(link.sourceDeviceId).toBe("legacy-r1");
    expect(link.targetDeviceId).toBe("legacy-sw1");
    expect(link.linkType).toBe("ethernet");
    expect(link.status).toBe("up");
    expect(link.animated).toBe(true);

    const parsed = topologyLinkSchema.safeParse(link);
    expect(parsed.success).toBe(true);
  });

  it("migrates a full legacy canvas without data loss", () => {
    const objects: DrawingObject[] = [
      {
        id: "obj-r1",
        type: "shape",
        color: "#10B981",
        width: 2,
        shapeId: "router",
        label: "R1",
        startPoint: { x: 50, y: 50 },
      },
      {
        id: "obj-sw1",
        type: "shape",
        color: "#3B82F6",
        width: 2,
        shapeId: "switch",
        label: "SW1",
        startPoint: { x: 200, y: 50 },
      },
      {
        id: "zone-dmz",
        type: "rectangle",
        color: "#EF4444",
        width: 2,
        label: "DMZ 172.16.1.0/24",
        startPoint: { x: 10, y: 10 },
        endPoint: { x: 300, y: 200 },
      },
    ];

    const connections: CanvasConnection[] = [
      {
        id: "conn-1",
        sourceShapeId: "obj-r1",
        sourcePort: "right",
        targetShapeId: "obj-sw1",
        targetPort: "left",
        connectionType: "ethernet",
        status: "active",
      },
    ];

    const topology = migrateLegacyCanvasToTopology(objects, connections, {
      name: "Test Migrierte Topologie",
    });

    expect(topology.version).toBe("2.0");
    expect(topology.name).toBe("Test Migrierte Topologie");
    expect(topology.devices).toHaveLength(2);
    expect(topology.links).toHaveLength(1);
    expect(topology.subnetZones).toHaveLength(1);
    expect(topology.subnetZones?.[0].cidr).toContain("172.16.1.0/24");

    const validated = networkTopologySchema.safeParse(topology);
    expect(validated.success).toBe(true);
  });

  it("migrates all drawing object types (pen, text, arrow, line, circle) losslessly into annotations", () => {
    const mixedObjects: DrawingObject[] = [
      {
        id: "pen-1",
        type: "pen",
        color: "#F59E0B",
        width: 3,
        startPoint: { x: 10, y: 10 },
        points: [
          { x: 10, y: 10 },
          { x: 20, y: 25 },
          { x: 30, y: 30 },
        ],
      },
      {
        id: "text-note",
        type: "text",
        color: "#ffffff",
        width: 1,
        text: "Wichtige Konfiguration: no shutdown",
        fontSize: 16,
        fontFamily: "IBM Plex Mono",
        startPoint: { x: 100, y: 80 },
      },
      {
        id: "arrow-flow",
        type: "arrow",
        color: "#10B981",
        width: 2,
        label: "Next-Hop 10.0.0.2",
        startPoint: { x: 150, y: 50 },
        endPoint: { x: 250, y: 50 },
      },
      {
        id: "line-divider",
        type: "line",
        color: "#64748B",
        width: 1,
        startPoint: { x: 50, y: 200 },
        endPoint: { x: 500, y: 200 },
      },
      {
        id: "circle-highlight",
        type: "circle",
        color: "#EC4899",
        width: 2,
        label: "Broadcast-Domäne",
        startPoint: { x: 300, y: 100 },
        endPoint: { x: 420, y: 220 },
      },
    ];

    const topology = migrateLegacyCanvasToTopology(mixedObjects, [], {
      name: "Topologie mit Annotationen",
    });

    expect(topology.annotations).toBeDefined();
    expect(topology.annotations).toHaveLength(5);

    const types = topology.annotations?.map((a) => a.type);
    expect(types).toContain("freehand");
    expect(types).toContain("text");
    expect(types).toContain("arrow");
    expect(types).toContain("line");
    expect(types).toContain("circle");

    const validated = networkTopologySchema.safeParse(topology);
    expect(validated.success).toBe(true);
  });
});

describe("Idempotent LocalStorage Migration (canvas-app-data → canvas-topology-v2)", () => {
  class MockStorage implements Storage {
    private store: Record<string, string> = {};
    get length(): number {
      return Object.keys(this.store).length;
    }
    clear(): void {
      this.store = {};
    }
    getItem(key: string): string | null {
      return this.store[key] ?? null;
    }
    key(index: number): string | null {
      return Object.keys(this.store)[index] ?? null;
    }
    removeItem(key: string): void {
      delete this.store[key];
    }
    setItem(key: string, value: string): void {
      this.store[key] = value;
    }
  }

  it("migrates from canvas-app-data into canvas-topology-v2 without touching canvas-app-data", () => {
    const mockStorage = new MockStorage();
    const legacyData = {
      CCNA: {
        name: "CCNA",
        lastModified: 1700000000000,
        canvasState: {
          objects: [
            {
              id: "r1",
              type: "shape",
              shapeId: "router",
              label: "Core-R1",
              color: "#10B981",
              width: 2,
              startPoint: { x: 100, y: 100 },
            },
            {
              id: "sw1",
              type: "shape",
              shapeId: "switch",
              label: "Dist-SW1",
              color: "#3B82F6",
              width: 2,
              startPoint: { x: 250, y: 100 },
            },
          ],
          connections: [
            {
              id: "c1",
              sourceShapeId: "r1",
              targetShapeId: "sw1",
              connectionType: "ethernet",
              status: "active",
            },
          ],
        },
      },
    };

    mockStorage.setItem(V1_STORAGE_KEY, JSON.stringify(legacyData));

    // Execute migration
    const res1 = migrateLocalStorageCanvasToV2({ storage: mockStorage });
    expect(res1.success).toBe(true);
    expect(res1.migratedCount).toBe(1);

    // canvas-app-data MUST be untouched
    expect(mockStorage.getItem(V1_STORAGE_KEY)).toBe(JSON.stringify(legacyData));

    // canvas-topology-v2 MUST be created and contain CCNA
    const v2Raw = mockStorage.getItem(V2_STORAGE_KEY);
    expect(v2Raw).not.toBeNull();
    const v2Data = JSON.parse(v2Raw!);
    expect(v2Data.CCNA).toBeDefined();
    expect(v2Data.CCNA.version).toBe("2.0");
    expect(v2Data.CCNA.devices).toHaveLength(2);
    expect(v2Data.CCNA.links).toHaveLength(1);

    // Idempotency: Running a second time does not duplicate or re-write unnecessarily
    const res2 = migrateLocalStorageCanvasToV2({ storage: mockStorage });
    expect(res2.success).toBe(true);
    expect(res2.skippedBecauseCurrent).toBe(true);
    expect(res2.migratedCount).toBe(0);
  });

  it("handles corrupted JSON and malformed data gracefully without throwing", () => {
    const mockStorage = new MockStorage();
    mockStorage.setItem(V1_STORAGE_KEY, "{ invalid json !!!");

    const res = migrateLocalStorageCanvasToV2({ storage: mockStorage });
    expect(res.success).toBe(false);
    expect(res.errors.length).toBeGreaterThan(0);
    expect(res.errors[0]).toContain("Ungültiges JSON");
  });

  it("preserves unmapped objects and handles rectangles strictly based on CIDR", () => {
    const objects: DrawingObject[] = [
      {
        id: "rect-plain",
        type: "rectangle",
        color: "#6B7280",
        width: 1,
        label: "Notizblock / Gruppierung ohne CIDR",
        startPoint: { x: 10, y: 10 },
        endPoint: { x: 100, y: 100 },
      },
      {
        id: "rect-cidr",
        type: "rectangle",
        color: "#3B82F6",
        width: 2,
        label: "Management LAN (192.168.100.0/24)",
        startPoint: { x: 200, y: 200 },
        endPoint: { x: 400, y: 400 },
      },
      {
        id: "corrupt-object",
        type: "unknown-legacy" as any,
        color: "#000",
        width: 1,
      },
    ];

    const danglingConn: CanvasConnection = {
      id: "dangling-1",
      sourceShapeId: "non-existent-1",
      sourcePort: "p1",
      targetShapeId: "non-existent-2",
      targetPort: "p2",
      connectionType: "ethernet",
      status: "active",
    };

    const topo = migrateLegacyCanvasToTopology(objects, [danglingConn]);

    // 1. Only the rectangle with valid CIDR becomes a subnetZone, original label is preserved in name
    expect(topo.subnetZones).toHaveLength(1);
    expect(topo.subnetZones?.[0].cidr).toBe("192.168.100.0/24");
    expect(topo.subnetZones?.[0].name).toBe("Management LAN (192.168.100.0/24)");

    // 2. The plain rectangle without CIDR becomes a box annotation with original text preserved
    const boxAnn = topo.annotations?.find((a) => a.id === "rect-plain");
    expect(boxAnn).toBeDefined();
    expect(boxAnn?.type).toBe("box");
    expect(boxAnn?.text).toBe("Notizblock / Gruppierung ohne CIDR");

    // 3. Corrupt object and dangling link are stored in unmapped without data loss
    expect(topo.unmapped).toBeDefined();
    expect(topo.unmapped?.length).toBeGreaterThanOrEqual(2);
  });

  it("detects conflict when both v1 and v2 have divergent local edits and creates a non-destructive backup", () => {
    const mockStorage = new MockStorage();

    // Setup: Existing V2 that was edited by user in V2
    const existingV2 = {
      CCNA: {
        id: "topology-ccna",
        name: "CCNA Topologie",
        version: "2.0",
        devices: [],
        links: [],
        metadata: {
          updatedAt: new Date(1000).toISOString(),
          author: "User-In-V2-Editor", // User edited in V2
        },
      },
    };
    mockStorage.setItem(V2_STORAGE_KEY, JSON.stringify(existingV2));

    // Setup: V1 also updated afterwards
    const legacyV1 = {
      CCNA: {
        lastModified: 2000, // Newer than V2
        canvasState: {
          objects: [
            {
              id: "r1",
              type: "shape",
              shapeId: "router",
              label: "New-Router-From-V1",
              color: "#10B981",
              width: 2,
              startPoint: { x: 50, y: 50 },
            },
          ],
          connections: [],
        },
      },
    };
    mockStorage.setItem(V1_STORAGE_KEY, JSON.stringify(legacyV1));

    // Migration attempt without force
    const res = migrateLocalStorageCanvasToV2({ storage: mockStorage });

    // Conflict detected: V2 is NOT overwritten!
    expect(res.conflicts).toHaveLength(1);
    expect(res.conflicts[0].subjectKey).toBe("CCNA");
    expect(res.backupCreated).toBeDefined();

    // V2 still contains user's original data
    const currentV2 = JSON.parse(mockStorage.getItem(V2_STORAGE_KEY)!);
    expect(currentV2.CCNA.metadata.author).toBe("User-In-V2-Editor");

    // A non-destructive backup key was created
    const backupRaw = mockStorage.getItem(res.backupCreated!);
    expect(backupRaw).not.toBeNull();
  });

  it("limits backup snapshots to MAX_BACKUPS (3) and deletes older backups", () => {
    const mockStorage = new MockStorage();
    // Simulate 4 sequential backups
    mockStorage.setItem(`${V2_STORAGE_KEY}-backup-1000`, '{"snap": 1}');
    mockStorage.setItem(`${V2_STORAGE_KEY}-backup-2000`, '{"snap": 2}');
    mockStorage.setItem(`${V2_STORAGE_KEY}-backup-3000`, '{"snap": 3}');
    mockStorage.setItem(`${V2_STORAGE_KEY}-backup-4000`, '{"snap": 4}');

    // Prune to 3
    pruneBackups(mockStorage, 3);
    const keys = getBackupKeys(mockStorage);

    expect(keys).toHaveLength(3);
    // Oldest (1000) must have been removed
    expect(mockStorage.getItem(`${V2_STORAGE_KEY}-backup-1000`)).toBeNull();
    expect(mockStorage.getItem(`${V2_STORAGE_KEY}-backup-2000`)).not.toBeNull();
    expect(mockStorage.getItem(`${V2_STORAGE_KEY}-backup-3000`)).not.toBeNull();
    expect(mockStorage.getItem(`${V2_STORAGE_KEY}-backup-4000`)).not.toBeNull();
  });

  it("catches QuotaExceededError gracefully without unhandled crash and notifies user", () => {
    const mockStorage = new MockStorage();
    // Force quota error on setItem
    mockStorage.setItem = () => {
      const err = new DOMException("The quota has been exceeded", "QuotaExceededError");
      throw err;
    };

    const res = safeSetItem(mockStorage, "test-key", "some-data");
    expect(res.success).toBe(false);
    expect(res.quotaExceeded).toBe(true);
    expect(res.error).toContain("Speicherlimit im Browser (localStorage Quota) erreicht");
  });

  it("restores backup snapshot correctly into V2_STORAGE_KEY", () => {
    const mockStorage = new MockStorage();
    const backupKey = `${V2_STORAGE_KEY}-backup-12345`;
    mockStorage.setItem(backupKey, JSON.stringify({ restored: true }));

    const restored = restoreBackupSnapshot(backupKey, mockStorage);
    expect(restored).toBe(true);

    const activeV2 = JSON.parse(mockStorage.getItem(V2_STORAGE_KEY)!);
    expect(activeV2.restored).toBe(true);
  });

  it("verifies that migrated v1 annotations are fully editable (move, edit text, resize, delete) without data loss", () => {
    // 1. Ausgangssituation: Legacy v1 Canvas mit Text, Pen (Freihand), Box und Collaboration Note
    const legacyObjects: DrawingObject[] = [
      {
        id: "v1-txt-1",
        type: "text",
        text: "Legacy IP Plan: 192.168.0.0/16",
        color: "#F59E0B",
        width: 1,
        startPoint: { x: 50, y: 100 },
      },
      {
        id: "v1-free-1",
        type: "pen",
        color: "#EC4899",
        width: 3,
        startPoint: { x: 10, y: 10 },
        points: [
          { x: 10, y: 10 },
          { x: 25, y: 30 },
          { x: 40, y: 20 },
        ],
      },
      {
        id: "v1-box-1",
        type: "rectangle",
        color: "#3B82F6",
        width: 2,
        label: "Rechenzentrum Rack A",
        startPoint: { x: 300, y: 100 },
        endPoint: { x: 450, y: 250 },
      },
    ];

    const legacyMeta = {
      annotations: [
        {
          id: "v1-note-1",
          type: "comment" as const,
          text: "Wichtig: VLAN 10 und 20 konfigurieren!",
          author: "Admin",
          authorColor: "#10B981",
          x: 200,
          y: 150,
          width: 160,
          height: 120,
          createdAt: 1000,
          updatedAt: 1000,
          resolved: false,
          replies: [],
        },
      ],
    };

    // Migration zu Topology v2
    const topo = migrateLegacyCanvasToTopology(legacyObjects, [], legacyMeta);
    expect(topo.annotations).toBeDefined();
    expect(topo.annotations).toHaveLength(4);

    // 2. Editierbarkeit 1: Text verschieben und neuen Inhalt setzen
    let updatedTopo = updateAnnotation(topo, "v1-txt-1", {
      x: 120,
      y: 180,
      text: "Aktualisierter Plan: 10.0.0.0/8",
    });
    const editedTxt = updatedTopo.annotations?.find((a) => a.id === "v1-txt-1");
    expect(editedTxt?.x).toBe(120);
    expect(editedTxt?.y).toBe(180);
    expect(editedTxt?.text).toBe("Aktualisierter Plan: 10.0.0.0/8");

    // 3. Editierbarkeit 2: Notiz skalieren und Text erweitern
    updatedTopo = updateAnnotation(updatedTopo, "v1-note-1", {
      width: 220,
      height: 160,
      text: "VLAN 10, 20 und 30 (DMZ) aktiv!",
    });
    const editedNote = updatedTopo.annotations?.find((a) => a.id === "v1-note-1");
    expect(editedNote?.width).toBe(220);
    expect(editedNote?.height).toBe(160);
    expect(editedNote?.text).toContain("VLAN 10, 20 und 30 (DMZ) aktiv!");

    // 4. Editierbarkeit 3: Freihand-Pfad verschieben
    const origPoints = editedNote ? updatedTopo.annotations?.find((a) => a.id === "v1-free-1")?.points : undefined;
    expect(origPoints).toHaveLength(3);

    // 5. Editierbarkeit 4: Box löschen
    updatedTopo = deleteAnnotation(updatedTopo, "v1-box-1");
    expect(updatedTopo.annotations).toHaveLength(3);
    expect(updatedTopo.annotations?.find((a) => a.id === "v1-box-1")).toBeUndefined();

    // 6. Schema-Validierung der bearbeiteten Topologie
    const parsed = networkTopologySchema.safeParse(updatedTopo);
    expect(parsed.success, parsed.error?.message).toBe(true);
  });
});
