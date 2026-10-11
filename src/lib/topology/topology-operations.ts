import {
  LinkType,
  NetworkTopology,
  TopologyAnnotation,
  TopologyDevice,
  TopologyLink,
} from "@/types/topology";

export const DEFAULT_GRID_SIZE = 20;

export interface InterfaceOption {
  id: string;
  name: string;
  status: "up" | "down" | "admin-down";
  ip?: string;
  isOccupied: boolean;
  occupiedByLinkId?: string;
}

/**
 * Erzeugt standardmäßige Schnittstellen für einen gegebenen CCNA-Gerätetyp.
 */
export function getDefaultInterfacesForType(type: TopologyDevice["type"]): TopologyDevice["interfaces"] {
  switch (type) {
    case "router":
      return [
        { id: "if-gi0-0-0", name: "Gi0/0/0", status: "up", description: "WAN/P2P Interface (Routed)" },
        { id: "if-gi0-0-1", name: "Gi0/0/1", status: "up", description: "LAN Gateway (Routed)" },
        { id: "if-gi0-0-2", name: "Gi0/0/2", status: "up", description: "SFP WAN Combo Port" },
        { id: "if-lo0", name: "Lo0", status: "up", ip: "1.1.1.1/32", description: "OSPF Router ID" },
      ];
    case "switch-l2":
      return [
        { id: "if-gi0-1", name: "Gi0/1", status: "up", description: "Access / Trunk Port" },
        { id: "if-gi0-2", name: "Gi0/2", status: "up", description: "Access / Trunk Port" },
        { id: "if-gi0-3", name: "Gi0/3", status: "up", description: "Access / Trunk Port" },
        { id: "if-gi0-4", name: "Gi0/4", status: "up", description: "Access / Trunk Port" },
        { id: "if-gi0-23", name: "Gi0/23", status: "up", description: "Uplink Port" },
        { id: "if-gi0-24", name: "Gi0/24", status: "up", description: "Uplink Port" },
        { id: "if-vlan1", name: "Vlan1", status: "up", description: "Management SVI" },
      ];
    case "switch-l3":
      return [
        { id: "if-gi1-0-1", name: "Gi1/0/1", status: "up", description: "Routed / Switchport" },
        { id: "if-gi1-0-2", name: "Gi1/0/2", status: "up", description: "Routed / Switchport" },
        { id: "if-gi1-0-3", name: "Gi1/0/3", status: "up", description: "Routed / Switchport" },
        { id: "if-vlan10", name: "Vlan10", status: "up", description: "SVI Gateway VLAN 10" },
        { id: "if-vlan20", name: "Vlan20", status: "up", description: "SVI Gateway VLAN 20" },
        { id: "if-lo0", name: "Lo0", status: "up", description: "Loopback Management" },
      ];
    case "pc":
      return [
        { id: "if-eth0", name: "eth0", status: "up", description: "Gigabit Ethernet NIC" },
        { id: "if-wlan0", name: "wlan0", status: "up", description: "802.11 Wi-Fi Adapter" },
      ];
    case "server":
      return [
        { id: "if-eth0", name: "eth0", status: "up", description: "Primary Production LAN" },
        { id: "if-eth1", name: "eth1", status: "up", description: "Secondary / Storage SAN" },
      ];
    case "access-point":
      return [
        { id: "if-eth0", name: "GigabitEthernet0", status: "up", description: "PoE Uplink to Switch" },
        { id: "if-radio0", name: "Radio0", status: "up", description: "2.4 GHz 802.11ax WLAN" },
        { id: "if-radio1", name: "Radio1", status: "up", description: "5 GHz 802.11ax WLAN" },
      ];
    case "wlc":
      return [
        { id: "if-mgmt", name: "GigabitEthernet1", status: "up", description: "Service Port (OOB Mgmt)" },
        { id: "if-data", name: "GigabitEthernet2", status: "up", description: "Distribution Trunk (CAPWAP)" },
        { id: "if-red", name: "GigabitEthernet3", status: "up", description: "Redundancy Port (HA SSO)" },
      ];
    case "firewall":
      return [
        { id: "if-inside", name: "GigabitEthernet1/1", status: "up", description: "Inside (LAN)" },
        { id: "if-outside", name: "GigabitEthernet1/2", status: "up", description: "Outside (Internet/WAN)" },
        { id: "if-dmz", name: "GigabitEthernet1/3", status: "up", description: "DMZ Zone" },
        { id: "if-mgmt", name: "Management1/1", status: "up", description: "OOB Management" },
      ];
    case "cloud":
      return [
        { id: "if-isp0", name: "GigabitEthernet0/0", status: "up", description: "ISP Gateway" },
        { id: "if-isp1", name: "GigabitEthernet0/1", status: "up", description: "Customer WAN Handoff" },
      ];
    default:
      return [{ id: "if-eth0", name: "eth0", status: "up" }];
  }
}

/**
 * Erzeugt ein neues Netzwerkgerät mit Standardwerten.
 */
export function createNewDevice(
  type: TopologyDevice["type"],
  x: number,
  y: number,
  customName?: string
): TopologyDevice {
  const shortId = Math.random().toString(36).substring(2, 7);
  const typePrefix =
    type === "router"
      ? "R"
      : type === "switch-l2"
        ? "SW"
        : type === "switch-l3"
          ? "MLS"
          : type === "pc"
            ? "PC"
            : type === "server"
              ? "SRV"
              : type === "access-point"
                ? "AP"
                : type === "wlc"
                  ? "WLC"
                  : type === "firewall"
                    ? "FW"
                    : type === "cloud"
                      ? "CLOUD"
                      : "DEV";

  const name = customName || `${typePrefix}-${shortId.toUpperCase()}`;

  return {
    id: `dev-${shortId}`,
    name,
    type,
    x,
    y,
    width: 60,
    height: 60,
    interfaces: getDefaultInterfacesForType(type),
    status: "active",
    config: {
      hostname: name,
    },
  };
}

/**
 * Ermittelt alle Interfaces eines Geräts inklusive Information über Belegung durch existierende Links.
 */
export function getDeviceInterfaceOptions(
  device: TopologyDevice,
  links: TopologyLink[]
): InterfaceOption[] {
  return device.interfaces.map((iface) => {
    const occupyingLink = links.find(
      (l) =>
        (l.sourceDeviceId === device.id && l.sourceInterfaceId === iface.id) ||
        (l.targetDeviceId === device.id && l.targetInterfaceId === iface.id)
    );

    return {
      id: iface.id,
      name: iface.name,
      status: iface.status,
      ip: iface.ip,
      isOccupied: Boolean(occupyingLink),
      occupiedByLinkId: occupyingLink?.id,
    };
  });
}

/**
 * Validiert die Verbindung zwischen zwei Geräten und Interfaces:
 * - Ein Interface kann nur einmal belegt werden.
 * - Serial nur zwischen Routern.
 * - Wireless nur zwischen AP und Endgerät (PC). WLC hat keinen Funk!
 * - Ethernet für alle Geräte mit Ethernet-Ports.
 */
export function validateLinkConnection(
  sourceDevice: TopologyDevice,
  targetDevice: TopologyDevice,
  sourceInterfaceId: string,
  targetInterfaceId: string,
  linkType: LinkType,
  existingLinks: TopologyLink[]
): { valid: boolean; error?: string } {
  if (sourceDevice.id === targetDevice.id) {
    return { valid: false, error: "Ein Gerät kann nicht mit sich selbst verbunden werden." };
  }

  // 1. Interface Belegung prüfen
  const sourceIfaceOccupied = existingLinks.some(
    (l) =>
      (l.sourceDeviceId === sourceDevice.id && l.sourceInterfaceId === sourceInterfaceId) ||
      (l.targetDeviceId === sourceDevice.id && l.targetInterfaceId === sourceInterfaceId)
  );

  const srcIface = sourceDevice.interfaces.find((i) => i.id === sourceInterfaceId);
  const tgtIface = targetDevice.interfaces.find((i) => i.id === targetInterfaceId);

  if (sourceIfaceOccupied) {
    const ifName = srcIface?.name || sourceInterfaceId;
    return {
      valid: false,
      error: `Interface '${ifName}' auf ${sourceDevice.name} ist bereits durch eine andere Verbindung belegt.`,
    };
  }

  const targetIfaceOccupied = existingLinks.some(
    (l) =>
      (l.sourceDeviceId === targetDevice.id && l.sourceInterfaceId === targetInterfaceId) ||
      (l.targetDeviceId === targetDevice.id && l.targetInterfaceId === targetInterfaceId)
  );

  if (targetIfaceOccupied) {
    const ifName = tgtIface?.name || targetInterfaceId;
    return {
      valid: false,
      error: `Interface '${ifName}' auf ${targetDevice.name} ist bereits durch eine andere Verbindung belegt.`,
    };
  }

  // 2. Link-Typ Restriktionen prüfen
  if (linkType === "serial") {
    const allowedSerial = (t: string) => t === "router" || t === "cloud";
    if (!allowedSerial(sourceDevice.type) || !allowedSerial(targetDevice.type)) {
      return {
        valid: false,
        error: "Serielle WAN-Verbindungen (Cisco Serial) sind nur zwischen zwei Routern zulässig.",
      };
    }
  }

  if (linkType === "wireless") {
    // WLC Sperre mit didaktischer Begründung
    if (sourceDevice.type === "wlc" || targetDevice.type === "wlc") {
      return {
        valid: false,
        error: "Ein Cisco WLC besitzt keine Funkschnittstelle. Er wird per Ethernet/Trunk angebunden und steuert APs über das CAPWAP-Tunnelprotokoll.",
      };
    }

    const isSourceAp = sourceDevice.type === "access-point";
    const isTargetAp = targetDevice.type === "access-point";

    if (!isSourceAp && !isTargetAp) {
      return {
        valid: false,
        error: "Drahtlose Verbindungen (WLAN) erfordern einen Access Point (AP) als Basisstation.",
      };
    }

    if (isSourceAp && isTargetAp) {
      return {
        valid: false,
        error: "Zwei Access Points können nicht direkt per Wireless verbunden werden. APs werden per Ethernet an den Switch angebunden.",
      };
    }

    const clientDev = isSourceAp ? targetDevice : sourceDevice;
    if (clientDev.type !== "pc") {
      return {
        valid: false,
        error: "Wireless-Links sind nur zwischen einem Access Point und Endgeräten (PC/Laptop) zulässig. Netzwerkgeräte werden per Ethernet verkabelt.",
      };
    }
  }

  // Physische Schnittstellen-Plausibilität: Radio vs Ethernet
  if (linkType === "ethernet" || linkType === "trunk" || linkType === "etherchannel") {
    if (srcIface?.name.startsWith("Radio") || tgtIface?.name.startsWith("Radio")) {
      return {
        valid: false,
        error: "Ethernet-Kabel können nicht an eine Funkschnittstelle (Radio) angeschlossen werden. Bitte den kabelgebundenen Port 'GigabitEthernet0' wählen.",
      };
    }
  }

  return { valid: true };
}

/**
 * Erzeugt einen neuen TopologyLink nach erfolgreicher Validierung.
 */
export function createNewLink(
  sourceDeviceId: string,
  targetDeviceId: string,
  sourceInterfaceId: string,
  targetInterfaceId: string,
  linkType: LinkType = "ethernet",
  label?: string
): TopologyLink {
  const shortId = Math.random().toString(36).substring(2, 7);
  return {
    id: `link-${shortId}`,
    sourceDeviceId,
    targetDeviceId,
    sourceInterfaceId,
    targetInterfaceId,
    linkType,
    status: "up",
    label,
    bandwidth: linkType === "serial" ? "1.544 Mbps (T1)" : "1 Gbps",
  };
}

/**
 * Verschiebt ein Gerät in der Topologie mit optionalem Raster-Einrasten (Snap-to-Grid).
 */
export function moveDeviceInTopology(
  topology: NetworkTopology,
  deviceId: string,
  newX: number,
  newY: number,
  snapGridSize: number = 0
): NetworkTopology {
  const x = snapGridSize > 1 ? Math.round(newX / snapGridSize) * snapGridSize : Math.round(newX);
  const y = snapGridSize > 1 ? Math.round(newY / snapGridSize) * snapGridSize : Math.round(newY);

  return {
    ...topology,
    devices: topology.devices.map((d) => (d.id === deviceId ? { ...d, x, y } : d)),
    metadata: {
      ...topology.metadata,
      updatedAt: new Date().toISOString(),
    },
  };
}

/**
 * Löscht ein Gerät und entfernt automatisch alle kaskadierenden Links.
 */
export function deleteDeviceFromTopology(
  topology: NetworkTopology,
  deviceId: string
): NetworkTopology {
  return {
    ...topology,
    devices: topology.devices.filter((d) => d.id !== deviceId),
    links: topology.links.filter(
      (l) => l.sourceDeviceId !== deviceId && l.targetDeviceId !== deviceId
    ),
    metadata: {
      ...topology.metadata,
      updatedAt: new Date().toISOString(),
    },
  };
}

/**
 * Löscht einen Link aus der Topologie.
 */
export function deleteLinkFromTopology(
  topology: NetworkTopology,
  linkId: string
): NetworkTopology {
  return {
    ...topology,
    links: topology.links.filter((l) => l.id !== linkId),
    metadata: {
      ...topology.metadata,
      updatedAt: new Date().toISOString(),
    },
  };
}

/**
 * Fügt ein neues Gerät zur Topologie hinzu.
 */
export function addDeviceToTopology(
  topology: NetworkTopology,
  device: TopologyDevice
): NetworkTopology {
  return {
    ...topology,
    devices: [...topology.devices, device],
    metadata: {
      ...topology.metadata,
      updatedAt: new Date().toISOString(),
    },
  };
}

/**
 * Fügt einen neuen Link zur Topologie hinzu.
 */
export function addLinkToTopology(
  topology: NetworkTopology,
  link: TopologyLink
): NetworkTopology {
  return {
    ...topology,
    links: [...topology.links, link],
    metadata: {
      ...topology.metadata,
      updatedAt: new Date().toISOString(),
    },
  };
}

/**
 * Rastet einen Wert am Raster ein.
 */
export function snapToGrid(value: number, gridSize: number = DEFAULT_GRID_SIZE): number {
  if (gridSize <= 1) return value;
  return Math.round(value / gridSize) * gridSize;
}

// ────────────────────────────────────────────────────────────────────────────
// Annotationen (Schritt 2d-2)
// ────────────────────────────────────────────────────────────────────────────

/**
 * Erzeugt eine neue Annotation mit Defaultwerten je nach Typ.
 */
export function createNewAnnotation(
  type: TopologyAnnotation["type"],
  x: number,
  y: number,
  options?: Partial<TopologyAnnotation>
): TopologyAnnotation {
  const id = `ann-${type}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;

  const base: TopologyAnnotation = {
    id,
    type,
    x,
    y,
    createdAt: new Date().toISOString(),
    ...options,
  };

  switch (type) {
    case "text":
      return {
        ...base,
        text: options?.text ?? "Neuer Text",
        fontSize: options?.fontSize ?? 14,
        color: options?.color ?? "#38BDF8",
      };
    case "note":
      return {
        ...base,
        text: options?.text ?? "Wichtige Notiz...",
        width: options?.width ?? 150,
        height: options?.height ?? 100,
        color: options?.color ?? "#F59E0B",
        fillColor: options?.fillColor ?? "#FEF3C7",
      };
    case "box":
      return {
        ...base,
        width: options?.width ?? 140,
        height: options?.height ?? 90,
        color: options?.color ?? "#64748B",
        strokeWidth: options?.strokeWidth ?? 2,
        fillColor: options?.fillColor ?? "transparent",
      };
    case "circle":
      return {
        ...base,
        width: options?.width ?? 110,
        height: options?.height ?? 110,
        color: options?.color ?? "#EC4899",
        strokeWidth: options?.strokeWidth ?? 2,
        fillColor: options?.fillColor ?? "transparent",
      };
    case "line":
      return {
        ...base,
        endX: options?.endX ?? x + 100,
        endY: options?.endY ?? y + 60,
        color: options?.color ?? "#64748B",
        strokeWidth: options?.strokeWidth ?? 2,
      };
    case "arrow":
      return {
        ...base,
        endX: options?.endX ?? x + 100,
        endY: options?.endY ?? y + 60,
        color: options?.color ?? "#10B981",
        strokeWidth: options?.strokeWidth ?? 2,
      };
    case "freehand":
      return {
        ...base,
        points: options?.points ?? [{ x, y }],
        color: options?.color ?? "#F59E0B",
        strokeWidth: options?.strokeWidth ?? 3,
      };
    default:
      return base;
  }
}

/**
 * Fügt eine Annotation zur Topologie hinzu.
 */
export function addAnnotationToTopology(
  topology: NetworkTopology,
  annotation: TopologyAnnotation
): NetworkTopology {
  return {
    ...topology,
    annotations: [...(topology.annotations || []), annotation],
    metadata: {
      ...topology.metadata,
      updatedAt: new Date().toISOString(),
    },
  };
}

/**
 * Aktualisiert eine Annotation in der Topologie.
 */
export function updateAnnotationInTopology(
  topology: NetworkTopology,
  id: string,
  updates: Partial<TopologyAnnotation>
): NetworkTopology {
  return {
    ...topology,
    annotations: (topology.annotations || []).map((ann) =>
      ann.id === id ? { ...ann, ...updates } : ann
    ),
    metadata: {
      ...topology.metadata,
      updatedAt: new Date().toISOString(),
    },
  };
}

/**
 * Löscht eine Annotation aus der Topologie.
 */
export function deleteAnnotationFromTopology(
  topology: NetworkTopology,
  id: string
): NetworkTopology {
  return {
    ...topology,
    annotations: (topology.annotations || []).filter((ann) => ann.id !== id),
    metadata: {
      ...topology.metadata,
      updatedAt: new Date().toISOString(),
    },
  };
}

/**
 * Verschiebt eine Annotation in der Topologie.
 */
export function moveAnnotationInTopology(
  topology: NetworkTopology,
  id: string,
  dx: number,
  dy: number,
  gridSize: number = 0
): NetworkTopology {
  return {
    ...topology,
    annotations: (topology.annotations || []).map((ann) => {
      if (ann.id !== id) return ann;

      let newX = ann.x + dx;
      let newY = ann.y + dy;
      if (gridSize > 1) {
        newX = snapToGrid(newX, gridSize);
        newY = snapToGrid(newY, gridSize);
      }

      const moved: TopologyAnnotation = {
        ...ann,
        x: newX,
        y: newY,
      };

      if (ann.endX !== undefined && ann.endY !== undefined) {
        let newEndX = ann.endX + dx;
        let newEndY = ann.endY + dy;
        if (gridSize > 1) {
          newEndX = snapToGrid(newEndX, gridSize);
          newEndY = snapToGrid(newEndY, gridSize);
        }
        moved.endX = newEndX;
        moved.endY = newEndY;
      }

      if (ann.points && ann.points.length > 0) {
        moved.points = ann.points.map((p) => ({
          x: Math.round(p.x + dx),
          y: Math.round(p.y + dy),
        }));
      }

      return moved;
    }),
    metadata: {
      ...topology.metadata,
      updatedAt: new Date().toISOString(),
    },
  };
}

/**
 * Glättet Freihand-Punkte für saubere, unzittrige Vektorlinien.
 */
export function smoothFreehandPoints(
  points: Array<{ x: number; y: number }>,
  tolerance: number = 2
): Array<{ x: number; y: number }> {
  if (points.length <= 2) return points;

  // 1. Zunächst Punkte zusammenfassen, die extrem nah beieinander liegen (< tolerance)
  const filtered: Array<{ x: number; y: number }> = [points[0]];
  for (let i = 1; i < points.length; i++) {
    const prev = filtered[filtered.length - 1];
    const curr = points[i];
    const dist = Math.hypot(curr.x - prev.x, curr.y - prev.y);
    if (dist >= tolerance || i === points.length - 1) {
      filtered.push(curr);
    }
  }

  if (filtered.length <= 2) return filtered;

  // 2. 3-Punkt gleitender Mittelwert (Moving Average Smoothing)
  const smoothed: Array<{ x: number; y: number }> = [filtered[0]];
  for (let i = 1; i < filtered.length - 1; i++) {
    const p0 = filtered[i - 1];
    const p1 = filtered[i];
    const p2 = filtered[i + 1];
    smoothed.push({
      x: Math.round((p0.x + 2 * p1.x + p2.x) / 4),
      y: Math.round((p0.y + 2 * p1.y + p2.y) / 4),
    });
  }
  smoothed.push(filtered[filtered.length - 1]);

  return smoothed;
}
