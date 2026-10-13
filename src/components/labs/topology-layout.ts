// Gemeinsame Layout-Geometrie für das Lab-Topologiediagramm.
// Renderer (ProfessionalTopologyDiagram) und Kollisionstest nutzen dieselben Funktionen.

/** Position eines Port-Labels relativ zum Gerät, entlang der Linie plus seitlicher Versatz. */
export function getPortLabelPos(
  fromX: number,
  fromY: number,
  toX: number,
  toY: number,
  offset = 48,
  sideOffset = 12,
) {
  const dx = toX - fromX;
  const dy = toY - fromY;
  const dist = Math.hypot(dx, dy) || 1;
  const ux = dx / dist;
  const uy = dy / dist;

  // Normalenvektor für seitlichen Offset (verhindert Überlagerung mit der Linie)
  const nx = -uy;
  const ny = ux;

  return {
    x: fromX + ux * offset + nx * sideOffset,
    y: fromY + uy * offset + ny * sideOffset,
  };
}

export const portLabelWidth = (port: string) => Math.max(34, port.length * 6.5 + 10);
export const ipLabelWidth = (ip?: string) => (ip ? ip.length * 6.2 + 8 : 0);
export const subnetLabelWidth = (label: string) => label.length * 6.8 + 12;
export const deviceNameWidth = (name: string) => name.length * 8.4 + 16;
export const deviceModelWidth = (model?: string) => (model ? model.length * 6 : 0);
