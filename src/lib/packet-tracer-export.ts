// Packet-Tracer-Export für Lab-Szenarien.
// Das proprietäre .pkt-Format ist verschlüsselt — der praxistaugliche Weg:
// ein ZIP mit fertigen IOS-Konfigurationsskripten pro Gerät (in die
// PT-CLI einfügbar) plus README mit Topologie-Aufbauanleitung.

import { downloadZip, type ZipEntry } from "./zip-writer";

export interface PtCommand {
  cmd: string;
  explanation: string;
}

export interface PtCommandBlock {
  device: string;
  mode: string;
  modeLabel: string;
  commands: PtCommand[];
}

export interface PtLabStep {
  title: string;
  blocks: PtCommandBlock[];
}

export interface PtLab {
  id: string;
  title: string;
  subtitle: string;
  difficulty: string;
  duration: string;
  topology: {
    description: string;
    devices: Array<{ type: string; label: string; count: number }>;
    connections: string[];
    hint: string;
  };
  steps: PtLabStep[];
  verifyCommands: Array<{ cmd: string; expected: string; explanation?: string }>;
}

const RULE = "═".repeat(60);

/** Geräte, die in PT über den Desktop-Tab statt CLI konfiguriert werden */
function isEndDevice(device: string): boolean {
  return /^(pc|laptop|server|printer|tablet|smartphone)/i.test(device.trim());
}

function buildDeviceScript(lab: PtLab, device: string): string {
  const lines: string[] = [
    `! ${RULE}`,
    `! ${device} — ${lab.title}`,
    `! Lab: ${lab.id} · ${lab.difficulty} · ${lab.duration}`,
    `! `,
    `! Verwendung in Cisco Packet Tracer:`,
    `!   1. Gerät "${device}" anklicken → Tab "CLI"`,
    `!   2. Diesen kompletten Block kopieren und in die CLI einfügen`,
    `!   ("!"-Zeilen sind IOS-Kommentare und werden ignoriert)`,
    `! ${RULE}`,
    ``,
  ];

  for (const step of lab.steps) {
    const blocks = step.blocks.filter((b) => b.device === device);
    if (blocks.length === 0) continue;
    lines.push(`! ─── ${step.title} ───`);
    for (const block of blocks) {
      for (const c of block.commands) {
        lines.push(c.cmd);
      }
    }
    lines.push(``);
  }

  return lines.join("\n");
}

function buildEndDeviceNotes(lab: PtLab, devices: string[]): string {
  const lines: string[] = [
    `${RULE}`,
    `Endgeräte-Konfiguration — ${lab.title}`,
    `${RULE}`,
    ``,
    `PCs/Endgeräte werden in Packet Tracer NICHT über die CLI`,
    `konfiguriert, sondern über:`,
    `  Gerät anklicken → Tab "Desktop" → "IP Configuration"`,
    ``,
  ];

  for (const device of devices) {
    const cmds: string[] = [];
    for (const step of lab.steps) {
      for (const block of step.blocks.filter((b) => b.device === device)) {
        for (const c of block.commands) {
          cmds.push(`  ${block.modeLabel} ${c.cmd}`);
          if (c.explanation) cmds.push(`      → ${c.explanation}`);
        }
      }
    }
    if (cmds.length > 0) {
      lines.push(`── ${device} ${"─".repeat(Math.max(0, 50 - device.length))}`);
      lines.push(...cmds, ``);
    }
  }

  return lines.join("\n");
}

function buildReadme(lab: PtLab, cliDevices: string[], endDevices: string[]): string {
  const lines: string[] = [
    `${RULE}`,
    `${lab.title}`,
    `${lab.subtitle} · ${lab.difficulty} · ca. ${lab.duration}`,
    `${RULE}`,
    ``,
    `TOPOLOGIE`,
    `─────────`,
    lab.topology.description,
    ``,
    `Geräte (im PT-Gerätebereich unten links auswählen):`,
    ...lab.topology.devices.map(
      (d) => `  • ${d.count}× ${d.type} — ${d.label}`,
    ),
    ``,
    `Verkabelung (Kabel-Werkzeug, Blitz-Symbol = Auto-Kabelwahl):`,
    ...lab.topology.connections.map((c) => `  • ${c}`),
    ``,
    `Hinweis: ${lab.topology.hint}`,
    ``,
    `AUFBAU IN PACKET TRACER`,
    `───────────────────────`,
    `  1. Neues leeres PT-Projekt anlegen`,
    `  2. Geräte laut Liste oben platzieren und beschriften`,
    `  3. Verkabelung laut Liste herstellen`,
    ...(cliDevices.length > 0
      ? [
          `  4. Pro Netzwerkgerät: CLI-Tab öffnen und das zugehörige`,
          `     Skript aus diesem ZIP einfügen:`,
          ...cliDevices.map((d) => `       • ${d}.ios.txt`),
        ]
      : []),
    ...(endDevices.length > 0
      ? [
          `  5. Endgeräte über Desktop-Tab konfigurieren —`,
          `     Details in Endgeraete.txt`,
        ]
      : []),
    ``,
    `VERIFIKATION`,
    `────────────`,
    ...lab.verifyCommands.flatMap((v) => [
      `  ${v.cmd}`,
      `    erwartet: ${v.expected}`,
      ...(v.explanation ? [`    (${v.explanation})`] : []),
    ]),
    ``,
    `Erstellt mit ajti.online — CCNA Trainingsumgebung`,
  ];

  return lines.join("\n");
}

export function exportLabForPacketTracer(lab: PtLab): void {
  const allDevices = [
    ...new Set(
      lab.steps.flatMap((s) => s.blocks.map((b) => b.device)),
    ),
  ];
  const cliDevices = allDevices.filter((d) => !isEndDevice(d));
  const endDevices = allDevices.filter((d) => isEndDevice(d));

  const entries: ZipEntry[] = [
    { name: "README.txt", content: buildReadme(lab, cliDevices, endDevices) },
    ...cliDevices.map((d) => ({
      name: `${d}.ios.txt`,
      content: buildDeviceScript(lab, d),
    })),
  ];
  if (endDevices.length > 0) {
    entries.push({
      name: "Endgeraete.txt",
      content: buildEndDeviceNotes(lab, endDevices),
    });
  }

  downloadZip(entries, `${lab.id}-packet-tracer.zip`);
}
