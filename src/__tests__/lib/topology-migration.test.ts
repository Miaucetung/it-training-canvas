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
});
