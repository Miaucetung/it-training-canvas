import fs from "node:fs";
import path from "node:path";
import { ccnaQuestions } from "../../src/data/ccnaQuestions.ts";

const pdfReport = JSON.parse(fs.readFileSync(".local/pdf_comparison_report.json", "utf-8"));
const qMap = new Map(ccnaQuestions.map((q) => [q.id, q]));

let md = "# Fachliche und inhaltliche Befunde in CCNA-Prüfungsfragen\n\n";
md += "**Status:** Dokumentation inhaltlicher Auffälligkeiten (Gemäß Projektauftrag nicht verändert)\n";
md += "**Datum:** 14. Oktober 2026\n";
md += "**Referenz-Dokument:** `00-FragenBeantwortetKomplett200_301.pdf` (590 Seiten)\n\n";
md += "---\n\n";

md += "## 1. Fachliche Auffälligkeiten in Routing-Tabellen, Exhibits und Fragen\n\n";
md += "Diese Fragen enthalten technische Widersprüche in den Cisco IOS CLI-Ausgaben oder Diagrammen:\n\n";

const anomalies = [
  {
    id: "q0466",
    title: "Routing-Tabelle mit Mehrfachbelegung & unerreichbarem Next-Hop",
    issue: "1. FastEthernet0/2 hat zwei directly connected Subnetze (10.10.10.8/30 und 10.10.12.0/30) ohne Subinterfaces/Secondary IPs.\n2. OSPF-Route via Next-Hop 10.10.10.1 nutzt FastEthernet0/1, an dem direkt das Netz 10.10.4.0/30 anliegt (Next-Hop gehört nicht zum Subnetz des Interfaces).\n3. Topologie-Grafik zeigt Router1/Router2 und Site A/B ohne jegliche Schnittstellen- oder Subnetzbeschriftung."
  },
  {
    id: "q0368",
    title: "Drei directly connected Netze an FastEthernet0/2 & fehlendes Interface-Netz",
    issue: "1. FastEthernet0/2 ist dreifach als directly connected belegt: 10.10.8.0/30, 10.10.12.0/30 und 10.10.4.0/30.\n2. OSPF-Route nutzt FastEthernet0/1 mit Next-Hop 10.10.10.5, aber FastEthernet0/1 hat kein directly connected Netz in der Tabelle.\n3. Topologie-Grafik hat keine Interface-Beschriftung."
  },
  {
    id: "q0386",
    title: "Drei /24-Subnetze an FastEthernet0/0 & unangebundenes FastEthernet0/1",
    issue: "1. Drei separate /24-Subnetze (192.168.12.0/24, 192.168.13.0/24, 192.168.14.0/24) sind alle an FastEthernet0/0 direkt angebunden.\n2. Next-Hops 192.168.14.3 und 192.168.15.5 nutzen FastEthernet0/1, für das kein direkt verbundenes Netz existiert."
  },
  {
    id: "q0387",
    title: "Drei /24-Subnetze an FastEthernet0/0 (Parallele Frage zu q0386)",
    issue: "Identische CLI-Routingtabelle wie q0386 mit denselben Interface-Widersprüchen."
  },
  {
    id: "q0456",
    title: "Zieladresse 10.10.8.14 in Routingtabelle nicht vorhanden",
    issue: "Frage fragt nach Subnetzmaske für Ziel 10.10.8.14. Tabelle enthält nur 10.0.0.0/28, 10.0.10.0/24, 10.10.10.0/24 und Default Route. Lösung ist als /28 markiert und 10.0.0.0/28 hervorgehoben, matcht das Ziel jedoch nicht."
  },
  {
    id: "q0101",
    title: "Tippfehler im Fragetext, fehlendes Interface fa0/1 & MAC-Verstümmelung",
    issue: "1. Fragetext nennt 'HO router' statt 'HQ1 router'.\n2. Topologie-Grafik beschriftet Interface fa0/1 nicht.\n3. Option C verstümmelt die MAC C601.420F.2007 bei der EUI-64-Generierung zu C601:42FF:FE0F:7/64."
  }
];

for (const a of anomalies) {
  const q = qMap.get(a.id);
  md += `### ${a.id.toUpperCase()}: ${a.title}\n`;
  if (q) {
    md += `- **Fragetext:** ${q.prompt || q.question || q.text}\n`;
    if (q.exhibit) {
      const exhibits = Array.isArray(q.exhibit) ? q.exhibit : [q.exhibit];
      const cli = exhibits.find((e) => e.type === "cli");
      if (cli) {
        md += `- **CLI-Exhibit:**\n\`\`\`text\n${cli.content}\n\`\`\`\n`;
      }
    }
  }
  md += `- **Befund:** ${a.issue.replace(/\n/g, "\n  ")}\n\n`;
}

md += "---\n\n";
md += "## 2. Abweichende Antwort- und Lösungsbuchstaben (31 Fälle im Vergleich zur Referenz-PDF)\n\n";
md += "In der Referenz-PDF `00-FragenBeantwortetKomplett200_301.pdf` sind die richtigen Antworten farblich (meist grün) hinterlegt. Bei folgenden 31 Fragen weicht die in der App hinterlegte Lösung davon ab:\n\n";
md += "| Fragen-ID | PDF-Seite | App-Lösung | PDF-Lösung (grün) | Fragetext |\n";
md += "| :--- | :---: | :---: | :---: | :--- |\n";

for (const d of pdfReport.discrepancies) {
  const q = qMap.get(d.qid);
  const text = (q ? q.prompt || q.question || q.text : "").replace(/\|/g, "/").replace(/\n/g, " ").slice(0, 100);
  const appSol = d.app_text.replace(/Lösung:\s*/, "");
  const pdfSol = d.pdf_text.replace(/PDF grün hervorgehoben:\s*/, "");
  md += `| ${d.qid} | ${d.page} | ${appSol} | ${pdfSol} | ${text}... |\n`;
}

md += "\n---\n\n";
md += "## 3. Einlesefehler / Abweichende Optionenanzahl (23 Fälle im Vergleich zur Referenz-PDF)\n\n";
md += "Bei diesen 23 Fragen weicht die Anzahl der Antwortoptionen zwischen App und PDF ab (z. B. durch unvollständigen Import oder zusammengefasste Optionen):\n\n";
md += "| Fragen-ID | PDF-Seite | Optionen App | Optionen PDF | Abweichung | Fragetext |\n";
md += "| :--- | :---: | :---: | :---: | :--- | :--- |\n";

for (const e of pdfReport.ingestion_errors) {
  const q = qMap.get(e.qid);
  const text = (q ? q.prompt || q.question || q.text : "").replace(/\|/g, "/").replace(/\n/g, " ").slice(0, 90);
  md += `| ${e.qid} | ${e.page} | ${e.app_text} | ${e.pdf_text} | ${e.details} | ${text}... |\n`;
}

const targetPath = path.resolve("docs/fragen-darstellung/INHALTLICHE-BEFUNDE.md");
fs.writeFileSync(targetPath, md, "utf-8");
console.log(`Erfolgreich geschrieben: ${targetPath}`);
