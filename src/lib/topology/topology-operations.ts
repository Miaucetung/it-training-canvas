import {
  LinkType,
  NetworkTopology,
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
        { id: "if-gi0-0-0", name: "Gi0/0/0", status: "up", description: "WAN/P2P Interface" },
        { id: "if-gi0-0-1", name: "Gi0/0/1", status: "up", description: "LAN Gateway" },
        { id: "if-lo0", name: "Lo0", status: "up", ip: "1.1.1.1/32", description: "OSPF Router ID" },
      ];
    case "switch-l2":
      return [
        { id: "if-gi0-1", name: "Gi0/1", status: "up" },
        { id: "if-gi0-2", name: "Gi0/2", status: "up" },
        { id: "if-fa0-1", name: "Fa0/1", status: "up" },
        { id: "if-fa0-2", name: "Fa0/2", status: "up" },
        { id: "if-fa0-3", name: "Fa0/3", status: "up" },
        { id: "if-vlan1", name: "Vlan1", status: "up", description: "Management SVI" },
      ];
    case "switch-l3":
      return [
        { id: "if-gi0-1", name: "Gi0/1", status: "up" },
        { id: "if-gi0-2", name: "Gi0/2", status: "up" },
        { id: "if-gi0-3", name: "Gi0/3", status: "up" },
        { id: "if-vlan10", name: "Vlan10", status: "up", description: "SVI Gateway 10" },
        { id: "if-vlan20", name: "Vlan20", status: "up", description: "SVI Gateway 20" },
      ];
    case "pc":
      return [{ id: "if-eth0", name: "eth0", status: "up" }];
    case "server":
      return [{ id: "if-eth0", name: "eth0", status: "up" }];
    case "access-point":
      return [
        { id: "if-eth0", name: "GigabitEthernet0", status: "up", description: "PoE Uplink to Switch" },
        { id: "if-radio0", name: "Radio0", status: "up", description: "2.4 GHz / 5 GHz WLAN" },
      ];
    case "wlc":
      return [
        { id: "if-mgmt", name: "Management", status: "up" },
        { id: "if-data", name: "Data-Port-1", status: "up" },
      ];
    case "firewall":
      return [
        { id: "if-inside", name: "GigabitEthernet0/0", status: "up", description: "Inside (LAN)" },
        { id: "if-outside", name: "GigabitEthernet0/1", status: "up", description: "Outside (Internet)" },
        { id: "if-dmz", name: "GigabitEthernet0/2", status: "up", description: "DMZ" },
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
 * - Wireless nur mit AP oder WLC.
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

  if (sourceIfaceOccupied) {
    const ifName = sourceDevice.interfaces.find((i) => i.id === sourceInterfaceId)?.name || sourceInterfaceId;
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
    const ifName = targetDevice.interfaces.find((i) => i.id === targetInterfaceId)?.name || targetInterfaceId;
    return {
      valid: false,
      error: `Interface '${ifName}' auf ${targetDevice.name} ist bereits durch eine andere Verbindung belegt.`,
    };
  }

  // 2. Link-Typ Restriktionen prüfen
  if (linkType === "serial") {
    if (sourceDevice.type !== "router" || targetDevice.type !== "router") {
      return {
        valid: false,
        error: "Serielle WAN-Verbindungen (Cisco Serial) sind nur zwischen zwei Routern zulässig.",
      };
    }
  }

  if (linkType === "wireless") {
    const hasApOrWlc =
      sourceDevice.type === "access-point" ||
      sourceDevice.type === "wlc" ||
      targetDevice.type === "access-point" ||
      targetDevice.type === "wlc";

    if (!hasApOrWlc) {
      return {
        valid: false,
        error: "Drahtlose Verbindungen erfordern mindestens einen Access Point (AP) oder Wireless Controller (WLC).",
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
