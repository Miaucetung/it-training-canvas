import {
  addAnnotationToTopology,
  createNewAnnotation,
  createNewDevice,
  createNewLink,
  deleteAnnotationFromTopology,
  deleteDeviceFromTopology,
  deleteLinkFromTopology,
  getDeviceInterfaceOptions,
  moveAnnotationInTopology,
  moveDeviceInTopology,
  smoothFreehandPoints,
  snapToGrid,
  updateAnnotationInTopology,
  validateLinkConnection,
} from "@/lib/topology/topology-operations";
import { NetworkTopology } from "@/types/topology";
import { describe, expect, it } from "vitest";

describe("Topology Operations (2d-1 Geräte und Links)", () => {
  const baseTopology: NetworkTopology = {
    version: "2.0",
    id: "test-topo",
    name: "Test Topology",
    devices: [],
    links: [],
  };

  it("creates a new device with appropriate default interfaces for its CCNA role", () => {
    const router = createNewDevice("router", 100, 150);
    expect(router.type).toBe("router");
    expect(router.x).toBe(100);
    expect(router.y).toBe(150);
    expect(router.interfaces.map((i) => i.name)).toContain("Gi0/0/0");
    expect(router.interfaces.map((i) => i.name)).toContain("Lo0");

    const switchDev = createNewDevice("switch-l2", 200, 250);
    expect(switchDev.type).toBe("switch-l2");
    expect(switchDev.interfaces.map((i) => i.name)).toContain("Gi0/1");
    expect(switchDev.interfaces.map((i) => i.name)).toContain("Vlan1");

    const ap = createNewDevice("access-point", 300, 350);
    expect(ap.type).toBe("access-point");
    expect(ap.interfaces.map((i) => i.name)).toContain("Radio0");
  });

  it("prevents connecting a device to itself", () => {
    const r1 = createNewDevice("router", 100, 100);
    const result = validateLinkConnection(
      r1,
      r1,
      r1.interfaces[0].id,
      r1.interfaces[1].id,
      "ethernet",
      [],
    );
    expect(result.valid).toBe(false);
    expect(result.error).toContain("nicht mit sich selbst");
  });

  it("prevents occupying an already occupied interface", () => {
    const r1 = createNewDevice("router", 100, 100);
    const r2 = createNewDevice("router", 300, 100);
    const r3 = createNewDevice("router", 500, 100);

    const link1 = createNewLink(
      r1.id,
      r2.id,
      r1.interfaces[0].id,
      r2.interfaces[0].id,
      "ethernet",
    );

    // Try to reuse r1's first interface for r3
    const result = validateLinkConnection(
      r1,
      r3,
      r1.interfaces[0].id,
      r3.interfaces[0].id,
      "ethernet",
      [link1],
    );

    expect(result.valid).toBe(false);
    expect(result.error).toContain(
      "bereits durch eine andere Verbindung belegt",
    );

    // Using r1's second free interface should succeed
    const validResult = validateLinkConnection(
      r1,
      r3,
      r1.interfaces[1].id,
      r3.interfaces[0].id,
      "ethernet",
      [link1],
    );
    expect(validResult.valid).toBe(true);
  });

  it("validates Link-Type constraints: Serial only allowed between Routers", () => {
    const r1 = createNewDevice("router", 100, 100);
    const r2 = createNewDevice("router", 300, 100);
    const sw = createNewDevice("switch-l2", 200, 300);

    // Router to Router with Serial -> Valid
    const r2r = validateLinkConnection(
      r1,
      r2,
      r1.interfaces[0].id,
      r2.interfaces[0].id,
      "serial",
      [],
    );
    expect(r2r.valid).toBe(true);

    // Router to Switch with Serial -> Invalid!
    const r2sw = validateLinkConnection(
      r1,
      sw,
      r1.interfaces[0].id,
      sw.interfaces[0].id,
      "serial",
      [],
    );
    expect(r2sw.valid).toBe(false);
    expect(r2sw.error).toContain("nur zwischen zwei Routern zulässig");
  });

  it("validates Link-Type constraints: Wireless requires AP and End-Device, forbids WLC", () => {
    const pc = createNewDevice("pc", 100, 100);
    const router = createNewDevice("router", 300, 100);
    const ap = createNewDevice("access-point", 200, 200);
    const wlc = createNewDevice("wlc", 400, 200);

    // PC to Router with Wireless -> Invalid!
    const invalidWireless = validateLinkConnection(
      pc,
      router,
      pc.interfaces[0].id,
      router.interfaces[0].id,
      "wireless",
      []
    );
    expect(invalidWireless.valid).toBe(false);
    expect(invalidWireless.error).toContain(
      "Access Point (AP) als Basisstation"
    );

    // AP to WLC with Wireless -> Invalid! (WLC has no radio interfaces, CAPWAP over Ethernet)
    const wlcWireless = validateLinkConnection(
      ap,
      wlc,
      ap.interfaces[1].id,
      wlc.interfaces[0].id,
      "wireless",
      []
    );
    expect(wlcWireless.valid).toBe(false);
    expect(wlcWireless.error).toContain("WLC besitzt keine Funkschnittstelle");

    // PC (wlan0) to AP (Radio0) with Wireless -> Valid!
    const wlanPort = pc.interfaces.find((i) => i.name.toLowerCase().includes("wlan"))!;
    const apRadio = ap.interfaces.find((i) => i.name.toLowerCase().includes("radio"))!;
    const validWireless = validateLinkConnection(
      pc,
      ap,
      wlanPort.id,
      apRadio.id,
      "wireless",
      []
    );
    expect(validWireless.valid).toBe(true);
  });

  it("correctly identifies occupied vs available interfaces on a device", () => {
    const sw = createNewDevice("switch-l2", 100, 100);
    const pc = createNewDevice("pc", 100, 300);
    const link = createNewLink(
      sw.id,
      pc.id,
      sw.interfaces[0].id,
      pc.interfaces[0].id,
      "ethernet",
    );

    const options = getDeviceInterfaceOptions(sw, [link]);
    expect(options[0].isOccupied).toBe(true);
    expect(options[0].occupiedByLinkId).toBe(link.id);
    expect(options[1].isOccupied).toBe(false);
  });

  it("cascading delete removes device and all its associated links", () => {
    const r1 = createNewDevice("router", 100, 100);
    const r2 = createNewDevice("router", 300, 100);
    const r3 = createNewDevice("router", 200, 300);

    const l1 = createNewLink(
      r1.id,
      r2.id,
      r1.interfaces[0].id,
      r2.interfaces[0].id,
    );
    const l2 = createNewLink(
      r1.id,
      r3.id,
      r1.interfaces[1].id,
      r3.interfaces[0].id,
    );
    const l3 = createNewLink(
      r2.id,
      r3.id,
      r2.interfaces[1].id,
      r3.interfaces[1].id,
    );

    let topo: NetworkTopology = {
      ...baseTopology,
      devices: [r1, r2, r3],
      links: [l1, l2, l3],
    };

    // Delete r1 -> l1 and l2 must be removed, but l3 (r2 <-> r3) must remain intact!
    topo = deleteDeviceFromTopology(topo, r1.id);

    expect(topo.devices.map((d) => d.id)).not.toContain(r1.id);
    expect(topo.devices.map((d) => d.id)).toHaveLength(2);
    expect(topo.links.map((l) => l.id)).toEqual([l3.id]);
  });

  it("deleting a single link leaves devices intact", () => {
    const r1 = createNewDevice("router", 100, 100);
    const r2 = createNewDevice("router", 300, 100);
    const l1 = createNewLink(
      r1.id,
      r2.id,
      r1.interfaces[0].id,
      r2.interfaces[0].id,
    );

    let topo: NetworkTopology = {
      ...baseTopology,
      devices: [r1, r2],
      links: [l1],
    };

    topo = deleteLinkFromTopology(topo, l1.id);
    expect(topo.links).toHaveLength(0);
    expect(topo.devices).toHaveLength(2);
  });

  it("moves device and supports snap-to-grid", () => {
    const r1 = createNewDevice("router", 100, 100);
    let topo: NetworkTopology = { ...baseTopology, devices: [r1] };

    // Move without grid
    topo = moveDeviceInTopology(topo, r1.id, 137.4, 189.6, 0);
    expect(topo.devices[0].x).toBe(137);
    expect(topo.devices[0].y).toBe(190);

    // Move with snap to grid (gridSize = 20)
    topo = moveDeviceInTopology(topo, r1.id, 137.4, 189.6, 20);
    expect(topo.devices[0].x).toBe(140);
    expect(topo.devices[0].y).toBe(180);
  });

  it("snapToGrid snaps numbers cleanly to multiples of gridSize", () => {
    expect(snapToGrid(42, 20)).toBe(40);
    expect(snapToGrid(53, 20)).toBe(60);
    expect(snapToGrid(105, 50)).toBe(100);
  });
});

describe("Topology Annotation Operations (2d-2 Annotationen)", () => {
  const baseTopology: NetworkTopology = {
    version: "2.0",
    id: "test-topo-annotations",
    name: "Annotation Test Topology",
    devices: [],
    links: [],
    annotations: [],
  };

  it("creates valid default annotations for each supported type", () => {
    const textAnn = createNewAnnotation("text", 100, 100, { text: "CCNA VLAN 10" });
    expect(textAnn.type).toBe("text");
    expect(textAnn.text).toBe("CCNA VLAN 10");
    expect(textAnn.fontSize).toBe(14);

    const noteAnn = createNewAnnotation("note", 200, 150, { text: "Prüfungsrelevant: OSPF Dead Timer = 40s" });
    expect(noteAnn.type).toBe("note");
    expect(noteAnn.width).toBe(150);
    expect(noteAnn.height).toBe(100);

    const boxAnn = createNewAnnotation("box", 50, 50);
    expect(boxAnn.type).toBe("box");
    expect(boxAnn.width).toBe(140);
    expect(boxAnn.height).toBe(90);

    const lineAnn = createNewAnnotation("line", 10, 20);
    expect(lineAnn.type).toBe("line");
    expect(lineAnn.endX).toBe(110);
    expect(lineAnn.endY).toBe(80);

    const arrowAnn = createNewAnnotation("arrow", 10, 20);
    expect(arrowAnn.type).toBe("arrow");
    expect(arrowAnn.color).toBe("#10B981");

    const freehandAnn = createNewAnnotation("freehand", 30, 40);
    expect(freehandAnn.type).toBe("freehand");
    expect(freehandAnn.points).toEqual([{ x: 30, y: 40 }]);
  });

  it("adds, updates and deletes annotations in topology with metadata update", () => {
    const ann = createNewAnnotation("note", 100, 100, { text: "Stammnotiz" });
    let topo = addAnnotationToTopology(baseTopology, ann);
    expect(topo.annotations).toHaveLength(1);
    expect(topo.annotations![0].text).toBe("Stammnotiz");

    // Update (z.B. Umlaut-Textedit)
    topo = updateAnnotationInTopology(topo, ann.id, { text: "Überarbeitete Notiz mit Umlauten: äöüß" });
    expect(topo.annotations![0].text).toBe("Überarbeitete Notiz mit Umlauten: äöüß");

    // Delete
    topo = deleteAnnotationFromTopology(topo, ann.id);
    expect(topo.annotations).toHaveLength(0);
  });

  it("moves annotations including box, lines, and freehand points with and without grid", () => {
    const line = createNewAnnotation("line", 100, 100, { endX: 200, endY: 150 });
    const freehand = createNewAnnotation("freehand", 0, 0, {
      points: [
        { x: 10, y: 10 },
        { x: 20, y: 30 },
      ],
    });

    let topo = addAnnotationToTopology(baseTopology, line);
    topo = addAnnotationToTopology(topo, freehand);

    // Move without grid (+15, +25)
    topo = moveAnnotationInTopology(topo, line.id, 15, 25, 0);
    const movedLine = topo.annotations!.find((a) => a.id === line.id)!;
    expect(movedLine.x).toBe(115);
    expect(movedLine.y).toBe(125);
    expect(movedLine.endX).toBe(215);
    expect(movedLine.endY).toBe(175);

    // Move freehand
    topo = moveAnnotationInTopology(topo, freehand.id, 20, 20, 0);
    const movedFreehand = topo.annotations!.find((a) => a.id === freehand.id)!;
    expect(movedFreehand.points).toEqual([
      { x: 30, y: 30 },
      { x: 40, y: 50 },
    ]);
  });

  it("smooths freehand points to eliminate jitter and average points", () => {
    const jitteryPoints = [
      { x: 10, y: 10 },
      { x: 10.5, y: 10.5 }, // micro-jitter (< tolerance 2)
      { x: 20, y: 20 },
      { x: 30, y: 30 },
      { x: 40, y: 40 },
    ];
    const smoothed = smoothFreehandPoints(jitteryPoints, 2);
    expect(smoothed.length).toBeLessThan(jitteryPoints.length);
    expect(smoothed[0]).toEqual({ x: 10, y: 10 });
    expect(smoothed[smoothed.length - 1]).toEqual({ x: 40, y: 40 });
  });
});
