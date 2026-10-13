import { escapeHtml } from "@/lib/escape";
import type { LabScenario } from "./types";

/**
 * Exportiert das Topologie-SVG als gestochen scharfes PNG mit 2x Device Pixel Ratio.
 */
export async function exportTopologyAsPng(
  svgElement: SVGSVGElement,
  filename = "topology.png",
): Promise<void> {
  const serializer = new XMLSerializer();
  let svgString = serializer.serializeToString(svgElement);

  // Stelle sicher, dass XMLNS-Namespace vorhanden ist
  if (!svgString.match(/^<svg[^>]+xmlns="http:\/\/www\.w3\.org\/2000\/svg"/)) {
    svgString = svgString.replace(
      /^<svg/,
      '<svg xmlns="http://www.w3.org/2000/svg"',
    );
  }

  const svgBlob = new Blob([svgString], {
    type: "image/svg+xml;charset=utf-8",
  });
  const url = URL.createObjectURL(svgBlob);

  const img = new Image();
  await new Promise<void>((resolve, reject) => {
    img.onload = () => resolve();
    img.onerror = reject;
    img.src = url;
  });

  const bbox = svgElement.viewBox.baseVal;
  const width = bbox?.width || svgElement.clientWidth || 800;
  const height = bbox?.height || svgElement.clientHeight || 500;

  // 2x Retina Skalierung
  const scale = 2;
  const canvas = document.createElement("canvas");
  canvas.width = width * scale;
  canvas.height = height * scale;

  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  // Dunkler oder heller Hintergrund für Bildexport
  ctx.fillStyle = "#090d16";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
  URL.revokeObjectURL(url);

  canvas.toBlob((blob) => {
    if (!blob) return;
    const downloadUrl = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = downloadUrl;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(downloadUrl);
  }, "image/png");
}

/**
 * Exportiert das Topologie-SVG direkt als skalierbare Vektordatei (.svg) in Druckqualität.
 */
export function exportTopologyAsSvg(
  svgElement: SVGSVGElement,
  filename = "topology.svg",
): void {
  const serializer = new XMLSerializer();
  let svgString = serializer.serializeToString(svgElement);

  if (!svgString.match(/^<svg[^>]+xmlns="http:\/\/www\.w3\.org\/2000\/svg"/)) {
    svgString = svgString.replace(
      /^<svg/,
      '<svg xmlns="http://www.w3.org/2000/svg"',
    );
  }

  const blob = new Blob([svgString], {
    type: "image/svg+xml;charset=utf-8",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Druckt oder exportiert das Lab als professionelles Handout im Querformat A4.
 * Unterstützt wahlweise den Modus mit Lösung oder als Aufgaben-Handout ohne Lösung.
 */
export function printLabHandoutPdf(
  lab: LabScenario,
  svgElement?: SVGSVGElement | null,
  options: { withoutSolution?: boolean } = {},
): void {
  const { withoutSolution = false } = options;
  const printWindow = window.open("", "_blank", "width=1200,height=850");
  if (!printWindow) return;

  let svgHtml = "";
  if (svgElement) {
    const serializer = new XMLSerializer();
    svgHtml = serializer.serializeToString(svgElement);
  }

  const addressingRows = lab.structuredTopology?.addressingTable
    ? lab.structuredTopology.addressingTable
        .map(
          (entry) => `
        <tr>
          <td><strong>${escapeHtml(entry.device)}</strong></td>
          <td class="mono font-bold">${escapeHtml(entry.interface)}</td>
          <td class="mono">${escapeHtml(entry.ip)}</td>
          <td class="mono">${escapeHtml(entry.subnetMask)}</td>
          <td class="mono">${escapeHtml(entry.defaultGateway || "N/A")}</td>
          <td>${entry.vlan ? `<span class="badge">VLAN ${escapeHtml(entry.vlan)}</span> ` : ""}${escapeHtml(entry.description || "")}</td>
        </tr>`,
        )
        .join("")
    : "";

  printWindow.document.write(`
<!DOCTYPE html>
<html lang="de">
<head>
  <meta charset="UTF-8" />
  <title>${escapeHtml(lab.title)} — Cisco CCNA Lab Handout</title>
  <style>
    @page {
      size: A4 landscape;
      margin: 10mm;
    }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      font-size: 10px;
      line-height: 1.45;
      color: #0f172a;
      background: #ffffff;
      padding: 0;
    }
    .mono { font-family: 'IBM Plex Mono', ui-monospace, Menlo, Consolas, monospace; }
    .font-bold { font-weight: 700; }
    .header-bar {
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
      border-bottom: 2px solid #0284c7;
      padding-bottom: 6px;
      margin-bottom: 8px;
    }
    .title { font-size: 16px; font-weight: 800; color: #0369a1; }
    .subtitle { font-size: 11px; color: #475569; margin-top: 1px; }
    .meta-pills { display: flex; gap: 6px; }
    .badge {
      display: inline-block;
      padding: 2px 6px;
      border-radius: 4px;
      background: #e0f2fe;
      color: #0369a1;
      font-weight: 700;
      font-size: 9px;
      border: 1px solid #bae6fd;
    }
    .grid-2col {
      display: grid;
      grid-template-columns: 1.15fr 0.85fr;
      gap: 12px;
      align-items: start;
    }
    .card {
      border: 1px solid #cbd5e1;
      border-radius: 6px;
      padding: 8px;
      margin-bottom: 8px;
      background: #ffffff;
    }
    .card-title {
      font-size: 11px;
      font-weight: 700;
      color: #1e293b;
      margin-bottom: 5px;
      text-transform: uppercase;
      letter-spacing: 0.03em;
    }
    .svg-container {
      width: 100%;
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 6px;
      padding: 4px;
      margin-bottom: 8px;
    }
    .svg-container svg { width: 100%; height: auto; max-height: 240px; display: block; }
    table {
      width: 100%;
      border-collapse: collapse;
      font-size: 9px;
      margin-top: 4px;
    }
    th {
      background: #f1f5f9;
      color: #334155;
      font-weight: 700;
      text-align: left;
      padding: 4px 6px;
      border-bottom: 1px solid #cbd5e1;
    }
    td {
      padding: 3.5px 6px;
      border-bottom: 1px solid #e2e8f0;
    }
    .step-box {
      border: 1px solid #e2e8f0;
      border-radius: 4px;
      padding: 6px 8px;
      margin-bottom: 6px;
      background: #f8fafc;
    }
    .step-title { font-weight: 700; font-size: 10px; color: #0f172a; margin-bottom: 3px; }
    .cmd-box {
      background: #0f172a;
      color: #38bdf8;
      font-family: monospace;
      font-size: 8.5px;
      padding: 4px 6px;
      border-radius: 3px;
      margin-top: 2px;
      white-space: pre-wrap;
    }
    .notes-box {
      min-height: 80px;
      border: 1px dashed #94a3b8;
      border-radius: 4px;
      padding: 6px;
      background: #fafafa;
      color: #64748b;
      font-size: 9px;
      margin-top: 6px;
    }
    .footer {
      margin-top: 8px;
      padding-top: 4px;
      border-top: 1px solid #cbd5e1;
      display: flex;
      justify-content: space-between;
      font-size: 8px;
      color: #64748b;
    }
  </style>
</head>
<body>
  <div class="header-bar">
    <div>
      <div class="title">${escapeHtml(lab.title)}</div>
      <div class="subtitle">${escapeHtml(lab.subtitle)}</div>
    </div>
    <div class="meta-pills">
      <span class="badge">CCNA 200-301</span>
      <span class="badge">${escapeHtml(lab.difficulty)}</span>
      <span class="badge">⏱ ${escapeHtml(lab.duration)}</span>
      <span class="badge" style="background:#fef3c7;color:#92400e;border-color:#fde68a;">
        ${withoutSolution ? "Aufgabenblatt (ohne Lösung)" : "Musterlösung"}
      </span>
    </div>
  </div>

  <div class="grid-2col">
    <!-- Linke Spalte: Topologie & Adressierungstabelle -->
    <div>
      <div class="card">
        <div class="card-title">① Netzwerk-Topologie (Cisco Press Format)</div>
        <div class="svg-container">
          ${svgHtml || `<p style="padding:10px;text-align:center;">${escapeHtml(lab.topology.description)}</p>`}
        </div>
      </div>

      ${
        addressingRows
          ? `
      <div class="card">
        <div class="card-title">② Adressierungstabelle</div>
        <table>
          <thead>
            <tr>
              <th>Gerät</th>
              <th>Interface</th>
              <th>IP-Adresse</th>
              <th>Subnetzmaske</th>
              <th>Gateway</th>
              <th>VLAN / Zweck</th>
            </tr>
          </thead>
          <tbody>
            ${addressingRows}
          </tbody>
        </table>
      </div>`
          : ""
      }
    </div>

    <!-- Rechte Spalte: Aufgabenstellung & CLI Schritte -->
    <div>
      ${
        lab.context
          ? `
      <div class="card" style="border-left: 3px solid #0284c7;">
        <div class="card-title">Didaktischer Kontext & Ziel</div>
        <p><strong>Problem:</strong> ${escapeHtml(lab.context.problem)}</p>
        <p style="margin-top:3px;"><strong>Lernziel:</strong> ${escapeHtml(lab.context.purpose)}</p>
      </div>`
          : ""
      }

      <div class="card">
        <div class="card-title">
          ${withoutSolution ? "③ Aufgabenstellung & Verifikationsziele" : "③ CLI-Konfigurationsschritte"}
        </div>
        ${
          withoutSolution
            ? `
          <div style="font-size:9.5px;color:#334155;margin-bottom:8px;">
            Bauen Sie die Topologie in Cisco Packet Tracer auf und konfigurieren Sie die Geräte anhand der Adressierungstabelle so, dass folgende Verifikationstests erfolgreich sind:
          </div>
          ${lab.verifyCommands
            .map(
              (v) => `
            <div style="margin-bottom:4px;padding:3px 6px;background:#f0fdf4;border:1px solid #bbf7d0;border-radius:4px;">
              <code style="font-weight:700;color:#166534;">$ ${escapeHtml(v.cmd)}</code>
              <div style="color:#15803d;font-size:8.5px;">→ Erwartet: ${escapeHtml(v.expected)}</div>
            </div>`,
            )
            .join("")}
          <div class="card-title" style="margin-top:10px;">Notizen & Konfigurationsentwurf:</div>
          <div class="notes-box">
            Hier Befehle notieren:
          </div>
        `
            : lab.steps
                .map(
                  (step, idx) => `
          <div class="step-box">
            <div class="step-title">Schritt ${idx + 1}: ${escapeHtml(step.title)}</div>
            ${step.blocks
              .map(
                (block) => `
              <div style="margin-top:3px;">
                <span class="font-bold">${escapeHtml(block.device)}</span> <span style="color:#64748b;font-size:8px;">(${escapeHtml(block.modeLabel)})</span>
                <div class="cmd-box">${escapeHtml(block.commands.map((c) => c.cmd).join("\n"))}</div>
              </div>`,
              )
              .join("")}
          </div>`,
                )
                .join("")
        }
      </div>
    </div>
  </div>

  <div class="footer">
    <span>CCNA 200-301 Lab System &middot; ccna.ajti.online</span>
    <span>Dokument erzeugt am ${new Date().toLocaleDateString("de-DE")}</span>
    <span>Seite 1 von 1 (A4 Querformat)</span>
  </div>

  <script>
    window.onload = function() { window.print(); };
  </script>
</body>
</html>`);
  printWindow.document.close();
}
