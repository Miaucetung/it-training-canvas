# Fest eingetragene Tailwind-Farbklassen (Text und Flächen)

Erzeugt von `scripts/audit/hardcoded-colors.audit.ts` (nur lesend). Es wurde nichts ersetzt.

## Erfassung

- Gesucht werden Klassen `text-*`, `bg-*`, `from-*`, `via-*`, `to-*` mit Farbpalette und Stufe (`text-zinc-500`, `bg-sky-500/10`, `dark:text-gray-300`, `hover:bg-purple-600` …) sowie `text-white`, `bg-black` usw. und beliebige Hex-Werte (`bg-[#0f172a]`). Varianten (`dark:`, `hover:`, `md:` …) zählen mit.
- Nicht gesucht werden Token-Klassen (`text-muted-foreground`, `bg-card`, `text-accent-primary-fg`, `bg-status-*` …) und `border-*`/`ring-*`/`fill-*`/`stroke-*`.
- Durchsucht werden alle `.tsx`/`.ts`/`.css` unter `src/` außer `__tests__`. Ein Treffer ist keine Fehlerliste: manche Stellen sind gewollt (Terminal-Blöcke bewusst dunkel, Statusfarben wie `text-green-500`); entschieden wird danach.

## Zusammenfassung

5174 Klassen in 89 Dateien; davon Canvas-Code (`src/components/canvas-v2/`, `src/lib/topology/`): 771 in 8 Dateien (nur aufgelistet, Gemini arbeitet dort), übrige App: 4403 in 81 Dateien.

| Präfix | Treffer |
|---|---:|
| `text-*` | 2802 |
| `bg-*` | 2301 |
| `from-*` | 32 |
| `to-*` | 31 |
| `bg-[#…]` | 5 |
| `via-*` | 3 |

| Farbfamilie | Treffer |
|---|---:|
| slate | 2411 |
| white | 488 |
| indigo | 350 |
| amber | 289 |
| emerald | 288 |
| red | 228 |
| sky | 225 |
| cyan | 158 |
| zinc | 137 |
| green | 122 |
| violet | 88 |
| blue | 72 |
| rose | 64 |
| gray | 64 |
| black | 53 |
| purple | 49 |
| orange | 42 |
| teal | 17 |
| yellow | 14 |
| pink | 6 |
| fuchsia | 4 |

## Übersicht: übrige App (nach Trefferzahl)

| Datei | Treffer |
|---|---:|
| src/components/IPv6CalculatorDialog.tsx | 374 |
| src/components/LabScenariosDialog.tsx | 295 |
| src/components/VlanSimulatorDialog.tsx | 249 |
| src/components/TopicDetailPanel.tsx | 235 |
| src/components/SubnettingDrillDialog.tsx | 162 |
| src/components/ExamPrepDialog.tsx | 159 |
| src/components/FloatingToolbar.tsx | 153 |
| src/components/RoutingSimulatorDialog.tsx | 150 |
| src/components/ShapeConfigDialog.tsx | 128 |
| src/components/SubnetSegmentationTool.tsx | 123 |
| src/components/VerkabelungTrainerDialog.tsx | 111 |
| src/components/ShareExportDialog.tsx | 110 |
| src/tools/SubnettingDrillQuiz.tsx | 103 |
| src/components/StpSimulatorDialog.tsx | 98 |
| src/components/TemplateGallery.tsx | 97 |
| src/components/AclDrillDialog.tsx | 93 |
| src/components/QuizDialog.tsx | 90 |
| src/components/TopicListPanel.tsx | 87 |
| src/components/CliGlossaryDialog.tsx | 74 |
| src/components/OsiSimulatorDialog.tsx | 71 |
| src/components/OspfWildcardDrillDialog.tsx | 64 |
| src/components/RoutingDrillDialog.tsx | 62 |
| src/components/AnnotationLayer.tsx | 57 |
| src/components/navigation/MobileNavDrawer.tsx | 56 |
| src/components/ShapePropertiesPanel.tsx | 56 |
| src/components/ConnectionPropertiesPanel.tsx | 51 |
| src/components/PingScenarioDialog.tsx | 51 |
| src/components/PacketFlowVisualizer.tsx | 50 |
| src/components/ProgressTracker.tsx | 50 |
| src/components/navigation/AppHeader.tsx | 49 |
| src/App.tsx | 47 |
| src/components/LearningPathEditor.tsx | 45 |
| src/components/AuthDialog.tsx | 42 |
| src/components/DragDropTrainerDialog.tsx | 40 |
| src/components/TopologieExplorerDialog.tsx | 40 |
| src/components/PrioritizedLearningDialog.tsx | 39 |
| src/components/ShapePicker.tsx | 39 |
| src/components/labs/LabAddressingTable.tsx | 34 |
| src/components/AccountDialog.tsx | 32 |
| src/components/markdown-render.tsx | 32 |
| src/components/OnboardingTour.tsx | 32 |
| src/components/IPv4SubnetTableDialog.tsx | 31 |
| src/components/SimulationControls.tsx | 30 |
| src/lib/types.ts | 30 |
| src/components/MetricsDashboard.tsx | 29 |
| src/components/TerminalEmulator.tsx | 29 |
| src/components/HintPanel.tsx | 27 |
| src/components/SetPasswordDialog.tsx | 26 |
| src/components/SelectionToolbar.tsx | 25 |
| src/components/CostCalculator.tsx | 24 |
| src/components/TopologyValidator.tsx | 24 |
| src/components/labs/ProfessionalTopologyDiagram.tsx | 23 |
| src/components/PDUInspector.tsx | 19 |
| src/components/KeyboardShortcutsDialog.tsx | 16 |
| src/components/PresentationsDialog.tsx | 15 |
| src/components/CanvasContextMenu.tsx | 14 |
| src/components/RouterOnAStickDialog.tsx | 14 |
| src/components/AuthMenu.tsx | 12 |
| src/components/Canvas.tsx | 10 |
| src/components/exhibits/CLIExhibit.tsx | 9 |
| src/components/dashboard/TodayPracticeSection.tsx | 8 |
| src/tools/SubnettingCheatsheet.tsx | 8 |
| src/components/dashboard/CcnaDashboard.tsx | 7 |
| src/components/dashboard/TopologyHero.tsx | 6 |
| src/components/SlideEmbed.tsx | 6 |
| src/components/Callout.tsx | 5 |
| src/components/dashboard/LearningPathSection.tsx | 4 |
| src/components/MiniMap.tsx | 4 |
| src/components/exhibits/TableExhibit.tsx | 2 |
| src/components/exhibits/TopologyExhibit.tsx | 2 |
| src/components/LessonSummaryCard.tsx | 2 |
| src/components/ui/alert.tsx | 2 |
| src/components/ui/scroll-area.tsx | 2 |
| src/components/dashboard/BlueprintDomainsGrid.tsx | 1 |
| src/components/dashboard/CommandPalette.tsx | 1 |
| src/components/labs/security.tsx | 1 |
| src/components/navigation/AppBreadcrumbs.tsx | 1 |
| src/components/ui/alert-dialog.tsx | 1 |
| src/components/ui/cisco-terminal.tsx | 1 |
| src/components/ui/dialog.tsx | 1 |
| src/components/ui/sheet.tsx | 1 |

## Übersicht: Canvas-Code (nur aufgelistet)

| Datei | Treffer |
|---|---:|
| src/components/canvas-v2/DeviceConfigDialog.tsx | 188 |
| src/components/canvas-v2/CanvasV2Container.tsx | 175 |
| src/components/canvas-v2/DevicePalette.tsx | 134 |
| src/components/canvas-v2/TopologyStorageDialog.tsx | 123 |
| src/components/canvas-v2/ConnectDialog.tsx | 54 |
| src/components/canvas-v2/TopologyScreenReaderView.tsx | 50 |
| src/components/canvas-v2/TopologyLegend.tsx | 27 |
| src/components/canvas-v2/DeviceContextMenu.tsx | 20 |

## Einzelne Stellen (Datei, Zeile, Klassen)

### src/components/IPv6CalculatorDialog.tsx

- 147: `bg-slate-500`
- 156: `bg-purple-500`
- 165: `bg-slate-500`
- 175: `bg-orange-500`
- 184: `bg-sky-500`
- 193: `bg-emerald-500`
- 202: `bg-indigo-500`
- 210: `bg-slate-400`
- 526: `bg-slate-800` `bg-white`
- 529: `text-slate-500` `text-slate-400`
- 534: `text-white` `text-slate-900`
- 554: `text-emerald-300` `text-emerald-700`
- 559: `text-slate-500` `text-slate-400`
- 611: `bg-indigo-500/10` `text-indigo-300` `bg-indigo-50` `text-indigo-700`
- 621: `text-slate-300` `text-slate-700`
- 631: `bg-slate-800` `text-white` `bg-white` `text-slate-900`
- 635: `bg-indigo-600` `hover:bg-indigo-700` `text-white`
- 640: `text-red-500`
- 647: `bg-slate-800/60` `bg-slate-50`
- 651: `text-white`
- 656: `text-slate-400` `text-slate-500`
- 662: `text-slate-300` `text-slate-600`
- 682: `bg-slate-800/60` `bg-slate-50`
- 685: `text-slate-300` `text-slate-700`
- 692: `text-slate-500` `text-slate-400`
- 697: `text-indigo-300` `text-indigo-700`
- 704: `text-slate-500` `text-slate-400`
- 709: `text-emerald-300` `text-emerald-700`
- 718: `bg-amber-500/10` `text-amber-300` `bg-amber-50` `text-amber-700`
- 730: `bg-slate-800/40` `bg-slate-50`
- 733: `text-slate-400` `text-slate-600`
- 742: `text-slate-400` `hover:text-indigo-300` `hover:bg-indigo-500/10` `text-slate-600` `hover:text-indigo-700` `hover:bg-indigo-50`
- 801: `bg-slate-800/60`
- 802: `bg-slate-50`
- 803: `text-slate-400` `text-slate-500`
- 804: `text-white` `text-slate-900`
- 805: `text-amber-300` `text-amber-700`
- 806: `bg-amber-500/20` `bg-amber-100`
- 807: `text-cyan-300` `text-cyan-700`
- 808: `bg-cyan-500/25` `bg-cyan-100`
- 840: `bg-slate-900/50` `bg-white`
- 854: `bg-cyan-500/10` `bg-cyan-50` `bg-slate-800/60` `bg-slate-50`
- 877: `bg-amber-500/10` `bg-amber-50`
- 889: `text-slate-400`
- 929: `bg-slate-900` `text-white` `bg-white` `text-slate-900`
- 941: `bg-slate-900` `text-white` `bg-white` `text-slate-900`
- 945: `text-red-400`
- 960: `text-slate-400` `hover:text-amber-300` `text-slate-500` `hover:text-amber-700`
- 1098: `bg-slate-900/40` `bg-white`
- 1175: `bg-slate-900` `bg-white`
- 1215: `bg-amber-500/10` `text-amber-200` `bg-amber-50` `text-amber-900`
- 1227: `text-amber-300` `text-amber-800`
- 1325: `bg-cyan-500/10` `text-cyan-300` `bg-cyan-50` `text-cyan-700`
- 1334: `text-slate-300` `text-slate-700`
- 1344: `bg-slate-800` `text-white` `bg-white` `text-slate-900`
- 1348: `bg-cyan-600` `hover:bg-cyan-700` `text-white`
- 1353: `text-red-500`
- 1365: `bg-slate-800` `hover:bg-slate-700/80` `bg-slate-50` `hover:bg-slate-100`
- 1368: `text-white` `bg-cyan-500` `bg-slate-500`
- 1374: `text-slate-300` `text-slate-700`
- 1379: `text-cyan-300` `text-cyan-700`
- 1385: `text-slate-500` `text-slate-400`
- 1392: `bg-slate-800/40` `text-slate-400` `bg-white` `text-slate-600`
- 1401: `bg-cyan-500/10` `bg-cyan-50`
- 1404: `text-cyan-300` `text-cyan-700`
- 1409: `text-white` `text-slate-900`
- 1414: `text-slate-400` `text-slate-500`
- 1425: `bg-slate-800/40` `bg-slate-50`
- 1428: `text-slate-400` `text-slate-600`
- 1439: `text-slate-400` `hover:text-cyan-300` `hover:bg-cyan-500/10` `text-slate-600` `hover:text-cyan-700` `hover:bg-cyan-50`
- 1510: `bg-emerald-500/10` `text-emerald-300` `bg-emerald-50` `text-emerald-700`
- 1524: `text-slate-400` `text-slate-600`
- 1537: `bg-slate-800` `hover:bg-emerald-500/10` `text-slate-400` `hover:text-emerald-300` `bg-slate-50` `hover:bg-emerald-50` `text-slate-600` `hover:text-emerald-700`
- 1544: `text-emerald-500` `text-emerald-600`
- 1557: `text-slate-300` `text-slate-700`
- 1565: `bg-slate-800` `text-white` `bg-white` `text-slate-900`
- 1570: `text-slate-300` `text-slate-700`
- 1580: `bg-slate-800` `text-white` `bg-white` `text-slate-900`
- 1587: `bg-emerald-600` `hover:bg-emerald-700` `text-white`
- 1591: `text-red-500`
- 1596: `bg-slate-800/60` `bg-slate-50`
- 1621: `text-slate-400` `text-slate-600`
- 1634: `bg-slate-800` `bg-slate-100`
- 1636: `text-slate-400` `text-slate-500`
- 1641: `text-slate-400` `text-slate-500`
- 1658: `text-slate-600` `text-slate-400`
- 1663: `text-emerald-300` `text-emerald-700`
- 1675: `bg-amber-500/10` `text-amber-300` `bg-amber-50` `text-amber-700`
- 1765: `bg-amber-500/20` `text-amber-300` `bg-amber-100` `text-amber-700` `text-slate-500` `hover:text-slate-300` `hover:text-slate-700`
- 1772: `text-emerald-400` `text-emerald-600` `text-amber-400` `text-amber-600`
- 1781: `bg-slate-800/60` `bg-slate-50`
- 1785: `bg-amber-500/20` `text-amber-300` `bg-amber-100` `text-amber-700`
- 1792: `text-white` `text-slate-900`
- 1798: `bg-slate-900` `bg-white`
- 1801: `text-indigo-300` `text-indigo-700`
- 1819: `bg-emerald-500/20` `text-emerald-300`
- 1820: `bg-emerald-50` `text-emerald-700`
- 1823: `bg-red-500/20` `text-red-300`
- 1824: `bg-red-50` `text-red-700`
- 1827: `text-slate-600`
- 1828: `text-slate-400`
- 1831: `bg-amber-500/20` `text-amber-300`
- 1832: `bg-amber-50` `text-amber-700`
- 1835: `text-slate-400` `hover:bg-slate-700` `hover:text-slate-200`
- 1836: `text-slate-600` `hover:bg-slate-100`
- 1856: `bg-slate-900` `text-white` `bg-white` `text-slate-900` `disabled:bg-slate-50`
- 1865: `text-slate-500` `hover:text-slate-300` `text-slate-400` `hover:text-slate-600`
- 1873: `bg-slate-800` `text-slate-400` `bg-slate-100` `text-slate-600`
- 1882: `bg-emerald-500/10` `bg-emerald-50` `bg-red-500/10` `bg-red-50`
- 1888: `text-emerald-400` `text-emerald-500`
- 1894: `text-red-400` `text-red-500`
- 1899: `text-emerald-300` `text-emerald-700` `text-red-300` `text-red-700`
- 1905: `text-slate-400` `text-slate-600`
- 1918: `bg-amber-600` `hover:bg-amber-700` `text-white`
- 1926: `bg-amber-600` `hover:bg-amber-700` `text-white`
- 1950: `bg-slate-800/60` `bg-slate-50`
- 1951: `text-slate-400` `text-slate-500`
- 1952: `text-white` `text-slate-900`
- 1953: `text-indigo-300` `text-indigo-700`
- 2005: `bg-indigo-500/25` `bg-indigo-50`
- 2006: `hover:bg-slate-700/50` `hover:bg-white`
- 2017: `bg-indigo-500/30` `text-indigo-200` `bg-indigo-100` `text-indigo-800`
- 2018: `bg-slate-700/50` `text-slate-500` `bg-slate-100` `text-slate-400`
- 2034: `bg-indigo-500/10` `bg-indigo-50`
- 2043: `bg-indigo-500/30` `text-indigo-200` `bg-indigo-100` `text-indigo-800`
- 2044: `bg-slate-800` `text-slate-500` `bg-white` `text-slate-400`
- 2075: `bg-slate-900` `text-white` `bg-white` `text-slate-900`
- 2080: `text-slate-400` `hover:text-indigo-300` `text-slate-500` `hover:text-indigo-700`
- 2119: `bg-indigo-500/25` `text-indigo-200` `bg-indigo-100` `text-indigo-700`
- 2120: `bg-slate-700/40` `text-slate-500` `bg-slate-100` `text-slate-400`
- 2141: `bg-slate-900/40` `bg-white`
- 2152: `text-indigo-300` `text-indigo-700`
- 2153: `text-slate-600` `text-slate-400`
- 2171: `bg-slate-800/40` `text-slate-400` `bg-slate-50` `text-slate-500`
- 2203: `text-indigo-300`
- 2204: `text-indigo-700`
- 2210: `text-cyan-300`
- 2211: `text-cyan-700`
- 2217: `text-emerald-300`
- 2218: `text-emerald-700`
- 2224: `text-amber-300`
- 2225: `text-amber-700`
- 2231: `text-violet-300`
- 2232: `text-violet-700`
- 2242: `bg-black/60`
- 2246: `bg-slate-900` `bg-white`
- 2251: `bg-slate-800/50` `bg-slate-50`
- 2253: `bg-indigo-500`
- 2254: `text-white`
- 2258: `text-white` `text-slate-900`
- 2263: `text-slate-400` `text-slate-500`
- 2271: `text-slate-400` `hover:text-white` `hover:bg-slate-700` `text-slate-500` `hover:text-slate-900` `hover:bg-slate-100`
- 2285: `text-slate-500` `hover:text-slate-300` `hover:text-slate-700`

### src/components/LabScenariosDialog.tsx

- 98: `text-cyan-400` `bg-cyan-400/10`
- 99: `text-emerald-400` `bg-emerald-400/10`
- 100: `text-amber-400` `bg-amber-400/10`
- 101: `text-rose-400` `bg-rose-400/10`
- 110: `text-slate-300` `hover:text-white` `hover:bg-slate-700/80`
- 120: `text-emerald-400`
- 121: `text-emerald-400`
- 140: `bg-slate-950/80`
- 142: `bg-slate-900`
- 144: `text-emerald-400`
- 145: `text-white`
- 148: `text-cyan-400/90` `bg-cyan-950/60`
- 156: `text-slate-400` `hover:text-white` `hover:bg-slate-800`
- 169: `hover:bg-slate-900/60`
- 172: `text-slate-600`
- 175: `text-emerald-300` `selection:bg-emerald-800` `selection:text-white`
- 180: `text-slate-400`
- 792: `bg-black/75`
- 800: `bg-slate-950` `text-slate-100`
- 801: `bg-slate-900` `text-slate-100`
- 805: `bg-slate-950/90`
- 807: `bg-violet-500/15` `text-violet-400`
- 814: `text-white`
- 819: `bg-amber-500/20` `text-amber-300`
- 824: `bg-violet-500/20` `text-violet-300`
- 827: `bg-slate-800` `text-slate-300`
- 830: `bg-sky-950` `text-sky-300`
- 836: `text-slate-400`
- 853: `bg-cyan-950/70` `text-cyan-300`
- 854: `bg-slate-800` `text-slate-400` `hover:text-slate-200`
- 859: `text-cyan-400`
- 869: `bg-amber-500/20` `text-amber-300`
- 870: `bg-slate-800` `text-slate-300` `hover:text-white`
- 875: `text-amber-400` `text-slate-400`
- 882: `bg-slate-800` `hover:bg-slate-700` `text-slate-300` `hover:text-white`
- 892: `bg-slate-800` `hover:bg-slate-700` `text-slate-300` `hover:text-white`
- 901: `text-rose-300` `hover:text-white` `bg-rose-950/60` `hover:bg-rose-900/60`
- 910: `text-slate-400` `hover:text-slate-200`
- 917: `bg-slate-800` `text-violet-500`
- 922: `bg-slate-800`
- 928: `bg-slate-800/80` `text-slate-300`
- 931: `text-emerald-400`
- 937: `bg-slate-800`
- 943: `text-slate-300` `hover:text-white` `bg-slate-800` `hover:bg-slate-700`
- 948: `text-emerald-400`
- 949: `text-emerald-400`
- 963: `text-cyan-300` `bg-cyan-950/60` `hover:bg-cyan-900/60`
- 974: `text-rose-300` `hover:text-white` `bg-rose-950/40` `hover:bg-rose-900/40`
- 985: `text-slate-400` `hover:text-white` `hover:bg-slate-800`
- 992: `bg-slate-800`
- 997: `text-slate-400` `hover:text-white` `hover:bg-slate-800`
- 1007: `bg-slate-950`
- 1014: `bg-violet-600` `text-white`
- 1015: `bg-slate-900` `text-slate-400` `hover:text-slate-200`
- 1026: `bg-violet-600` `text-white`
- 1027: `bg-slate-900` `text-slate-400` `hover:text-slate-200`
- 1039: `bg-slate-950/50`
- 1044: `bg-slate-900/40`
- 1049: `text-slate-400`
- 1056: `bg-slate-900` `text-slate-100`
- 1061: `text-slate-400` `hover:text-white`
- 1078: `bg-violet-600` `text-white`
- 1079: `bg-slate-800/80` `text-slate-400` `hover:text-slate-200` `hover:bg-slate-800`
- 1093: `bg-slate-800` `text-slate-300`
- 1102: `text-slate-400` `hover:text-slate-200`
- 1107: `bg-slate-800` `text-violet-500`
- 1142: `bg-violet-600/15`
- 1143: `hover:bg-slate-800/40`
- 1154: `text-white` `text-slate-200` `group-hover:text-white`
- 1166: `hover:text-emerald-400`
- 1171: `text-emerald-400` `text-slate-600` `hover:text-slate-400`
- 1177: `text-slate-400`
- 1190: `text-slate-400` `bg-slate-800/80`
- 1193: `text-violet-300/80` `bg-violet-950/60`
- 1208: `bg-slate-900/60`
- 1221: `text-slate-400`
- 1222: `text-violet-400`
- 1226: `text-slate-400`
- 1231: `text-slate-400`
- 1237: `text-sky-300` `hover:text-sky-200`
- 1249: `text-white`
- 1252: `text-slate-300`
- 1263: `bg-emerald-500/15` `text-emerald-300`
- 1264: `bg-slate-800` `text-slate-300` `hover:text-white` `hover:bg-slate-700`
- 1269: `text-emerald-400` `text-slate-400`
- 1288: `bg-slate-800` `text-slate-300`
- 1291: `bg-slate-800` `text-slate-300`
- 1294: `bg-slate-800` `text-slate-300`
- 1297: `bg-slate-800` `text-slate-300`
- 1312: `bg-cyan-400`
- 1313: `text-slate-300`
- 1322: `bg-indigo-500/20` `text-indigo-200` `hover:bg-indigo-500/30`
- 1329: `bg-slate-900`
- 1334: `text-slate-300` `hover:bg-slate-800` `disabled:text-slate-600`
- 1339: `text-slate-300`
- 1344: `text-slate-300` `hover:bg-slate-800` `disabled:text-slate-600`
- 1356: `bg-cyan-500/20` `text-cyan-300` `bg-slate-800` `text-slate-400` `hover:text-slate-200`
- 1367: `bg-cyan-500/20` `text-cyan-300`
- 1368: `bg-slate-800` `text-slate-400` `hover:text-slate-200`
- 1402: `bg-slate-950/60`
- 1413: `bg-slate-900`
- 1414: `text-slate-200`
- 1418: `text-emerald-300` `hover:bg-slate-800`
- 1426: `text-emerald-300` `hover:bg-slate-800`
- 1438: `bg-slate-950/60`
- 1444: `text-slate-300`
- 1445: `text-cyan-500`
- 1450: `bg-amber-950/30` `text-amber-200/90`
- 1451: `text-amber-400`
- 1453: `text-amber-300`
- 1464: `from-indigo-950/40` `to-slate-900`
- 1466: `bg-indigo-400`
- 1467: `text-indigo-300`
- 1472: `bg-slate-900/60`
- 1473: `text-indigo-400`
- 1476: `text-slate-300`
- 1480: `bg-slate-900/60`
- 1481: `text-emerald-400`
- 1484: `text-slate-300`
- 1496: `bg-emerald-500/20` `text-emerald-300`
- 1499: `text-white`
- 1503: `text-slate-400`
- 1511: `bg-slate-800` `text-slate-300`
- 1514: `text-white`
- 1527: `bg-emerald-950/20`
- 1529: `bg-emerald-500/20` `text-emerald-300`
- 1532: `text-white`
- 1541: `bg-slate-950/80`
- 1545: `text-emerald-300`
- 1549: `text-slate-300`
- 1551: `text-emerald-400`
- 1562: `bg-slate-950/50`
- 1564: `bg-slate-800` `text-slate-300`
- 1567: `text-white`
- 1576: `bg-slate-900`
- 1578: `text-cyan-300`
- 1581: `text-slate-400`
- 1596: `from-indigo-950/40` `to-slate-900`
- 1598: `bg-indigo-400`
- 1599: `text-indigo-300`
- 1604: `bg-slate-900/60`
- 1605: `text-indigo-400`
- 1608: `text-slate-300`
- 1612: `bg-slate-900/60`
- 1613: `text-emerald-400`
- 1616: `text-slate-300`
- 1625: `bg-cyan-950/20`
- 1628: `bg-cyan-500/20` `text-cyan-300`
- 1631: `text-white`
- 1635: `text-cyan-300/80`
- 1640: `text-slate-300`
- 1653: `bg-slate-900/90`
- 1655: `bg-cyan-500/15` `text-cyan-400`
- 1659: `text-white`
- 1662: `text-slate-400`
- 1676: `bg-slate-950/70`
- 1678: `text-slate-300`
- 1679: `text-cyan-500`
- 1687: `bg-amber-950/40` `text-amber-200`
- 1688: `text-amber-400`
- 1690: `text-amber-300`
- 1697: `bg-slate-950`
- 1718: `bg-emerald-500/20` `text-emerald-300`
- 1721: `text-white`
- 1725: `text-slate-400`
- 1733: `bg-slate-800` `text-slate-300`
- 1736: `text-white`
- 1749: `bg-emerald-950/20`
- 1751: `bg-emerald-500/20` `text-emerald-300`
- 1754: `text-white`
- 1763: `bg-slate-950/80`
- 1767: `text-emerald-300`
- 1771: `text-slate-300`
- 1773: `text-emerald-400`
- 1782: `bg-slate-950/50`
- 1784: `bg-slate-800` `text-slate-300`
- 1787: `text-white`
- 1796: `bg-slate-900`
- 1798: `text-cyan-300`
- 1801: `text-slate-400`
- 1817: `bg-slate-800` `hover:bg-slate-700` `text-slate-200`
- 1831: `bg-violet-600` `hover:bg-violet-500` `text-white`

### src/components/VlanSimulatorDialog.tsx

- 96: `text-slate-400` `text-slate-600`
- 100: `text-slate-300` `text-slate-700`
- 103: `bg-indigo-600` `bg-slate-600` `bg-slate-300`
- 105: `bg-white`
- 119: `bg-slate-800` `bg-white`
- 122: `text-slate-400` `text-slate-500`
- 129: `bg-slate-800` `bg-slate-50`
- 132: `text-white` `text-slate-900`
- 133: `text-slate-400` `text-slate-500`
- 135: `text-slate-300` `text-slate-600`
- 136: `bg-slate-900` `text-slate-300` `bg-slate-100` `text-slate-700`
- 137: `text-slate-500`
- 141: `text-slate-500`
- 149: `bg-amber-900/20` `text-amber-300` `bg-amber-50` `text-amber-800`
- 496: `bg-slate-800` `bg-slate-50`
- 497: `text-slate-300` `text-slate-700`
- 521: `bg-indigo-600` `text-white` `hover:bg-indigo-500`
- 525: `text-slate-400` `hover:text-slate-200` `text-slate-500` `hover:text-slate-700`
- 530: `bg-slate-800` `bg-slate-100`
- 535: `bg-indigo-600` `text-white` `text-slate-400` `hover:text-slate-200` `text-slate-500` `hover:text-slate-700`
- 548: `text-slate-500` `text-slate-400`
- 559: `bg-slate-700` `bg-green-50`
- 561: `text-green-300` `text-green-800`
- 562: `text-slate-400` `text-slate-500`
- 577: `bg-slate-700` `bg-slate-100`
- 674: `text-slate-500` `text-slate-400`
- 728: `bg-white`
- 742: `text-slate-500` `text-slate-400`
- 750: `text-slate-400` `text-slate-500`
- 777: `bg-slate-800/80` `bg-indigo-50/60`
- 778: `text-white` `text-slate-900`
- 785: `text-slate-400` `text-slate-600`
- 789: `bg-slate-700` `text-slate-200` `bg-white` `text-slate-700`
- 799: `text-slate-400` `text-slate-600`
- 805: `bg-slate-700` `text-slate-200` `bg-white` `text-slate-700`
- 811: `text-slate-400` `text-slate-600`
- 815: `bg-slate-700` `text-slate-200` `bg-white` `text-slate-700`
- 825: `text-slate-400` `text-slate-600`
- 829: `bg-slate-700` `text-slate-200` `bg-white` `text-slate-700`
- 839: `text-slate-400` `text-slate-600`
- 858: `text-slate-400` `text-slate-600`
- 862: `bg-slate-700` `text-slate-200` `bg-white` `text-slate-700`
- 880: `text-slate-300` `text-slate-600`
- 893: `bg-slate-900` `text-slate-300` `bg-slate-100` `text-slate-700`
- 894: `text-slate-500`
- 909: `bg-slate-800/60` `bg-white`
- 910: `text-white` `text-slate-900`
- 912: `bg-red-500/20` `text-red-400` `bg-amber-500/20` `text-amber-400` `bg-green-500/20` `text-green-400`
- 922: `bg-red-900/30` `text-red-300` `bg-red-50` `text-red-700`
- 924: `bg-amber-900/30` `text-amber-300` `bg-amber-50` `text-amber-800`
- 925: `bg-slate-700/60` `text-slate-300` `bg-slate-50` `text-slate-600`
- 941: `bg-indigo-600` `text-white` `text-slate-300` `hover:bg-slate-700` `text-slate-700` `hover:bg-slate-50`
- 947: `bg-indigo-600` `text-white` `text-slate-300` `hover:bg-slate-700` `text-slate-700` `hover:bg-slate-50`
- 954: `bg-slate-900` `text-slate-300` `bg-slate-100` `text-slate-700`
- 1033: `text-slate-400` `text-slate-600`
- 1055: `bg-slate-900` `bg-slate-100`
- 1057: `from-slate-500` `to-slate-400`
- 1058: `text-slate-400` `text-slate-500`
- 1059: `text-slate-400` `text-slate-500`
- 1067: `text-white`
- 1083: `bg-red-900/40` `text-red-300` `hover:bg-red-800/40` `bg-red-100` `text-red-700` `hover:bg-red-200`
- 1084: `bg-indigo-600` `text-white` `hover:bg-indigo-500`
- 1091: `text-slate-400` `hover:text-slate-200` `text-slate-500` `hover:text-slate-700`
- 1096: `text-slate-400` `text-slate-600`
- 1102: `text-slate-300` `text-slate-700`
- 1111: `text-slate-300` `text-slate-700`
- 1112: `text-slate-500` `text-slate-400`
- 1224: `text-amber-600` `bg-amber-50`
- 1226: `text-slate-400` `bg-slate-800`
- 1227: `text-slate-500` `bg-white`
- 1238: `bg-slate-600` `bg-slate-300`
- 1255: `bg-indigo-500`
- 1257: `bg-slate-600` `hover:bg-slate-500`
- 1258: `bg-slate-300` `hover:bg-slate-400`
- 1267: `bg-slate-800` `bg-slate-50`
- 1273: `bg-indigo-900` `text-indigo-300` `bg-indigo-100` `text-indigo-700`
- 1280: `text-slate-100` `text-slate-800`
- 1287: `text-slate-300` `text-slate-600`
- 1297: `bg-amber-900/30` `text-amber-300`
- 1298: `bg-amber-50` `text-amber-800`
- 1300: `bg-slate-700/50` `text-slate-400`
- 1301: `bg-white` `text-slate-500`
- 1307: `text-amber-300` `text-amber-700`
- 1326: `bg-slate-800` `text-slate-600`
- 1327: `bg-slate-100` `text-slate-400`
- 1329: `bg-slate-700` `text-slate-200` `hover:bg-slate-600`
- 1330: `bg-slate-200` `text-slate-700` `hover:bg-slate-300`
- 1341: `bg-slate-800` `text-slate-600`
- 1342: `bg-slate-100` `text-slate-400`
- 1343: `bg-indigo-600` `text-white` `hover:bg-indigo-700`
- 1353: `bg-green-900/30` `text-green-300` `bg-green-50` `text-green-700`
- 1386: `bg-slate-900` `text-white` `bg-white` `text-slate-900`
- 1393: `text-slate-400` `text-slate-500`
- 1400: `hover:bg-slate-700` `text-slate-400` `hover:bg-slate-100` `text-slate-500`
- 1414: `text-indigo-300` `text-indigo-700`
- 1415: `text-slate-400` `hover:text-slate-200` `text-slate-500` `hover:text-slate-700`

### src/components/TopicDetailPanel.tsx

- 234: `bg-slate-900` `bg-white`
- 250: `text-slate-400` `hover:text-white` `hover:bg-slate-700`
- 251: `text-slate-500` `hover:text-slate-900` `hover:bg-slate-100`
- 260: `text-white` `text-slate-900`
- 286: `text-slate-400` `hover:text-rose-300` `hover:bg-slate-700`
- 287: `text-slate-500` `hover:text-rose-700` `hover:bg-slate-100`
- 305: `text-slate-400` `hover:text-sky-300` `hover:bg-slate-700`
- 306: `text-slate-500` `hover:text-sky-700` `hover:bg-slate-100`
- 317: `text-slate-400` `hover:text-white` `hover:bg-slate-700`
- 318: `text-slate-500` `hover:text-slate-900` `hover:bg-slate-100`
- 330: `text-slate-400` `text-slate-600`
- 345: `bg-emerald-500/15` `text-emerald-300`
- 346: `bg-emerald-50` `text-emerald-800`
- 348: `text-slate-200` `hover:bg-slate-800`
- 349: `text-slate-700` `hover:bg-slate-50`
- 365: `bg-indigo-500/10` `hover:bg-indigo-500/20` `text-indigo-200`
- 366: `bg-indigo-50` `hover:bg-indigo-100` `text-indigo-800`
- 372: `bg-indigo-500/30` `text-indigo-200`
- 373: `bg-indigo-100` `text-indigo-700`
- 388: `text-indigo-300` `text-indigo-600`
- 404: `bg-indigo-500/10` `hover:bg-indigo-500/20` `text-indigo-200`
- 405: `bg-indigo-50` `hover:bg-indigo-100` `text-indigo-800`
- 411: `bg-indigo-500/30` `text-indigo-200`
- 412: `bg-indigo-100` `text-indigo-700`
- 426: `text-indigo-300` `text-indigo-600`
- 442: `bg-emerald-500/10` `hover:bg-emerald-500/20` `text-emerald-200`
- 443: `bg-emerald-50` `hover:bg-emerald-100` `text-emerald-800`
- 449: `bg-emerald-500/30` `text-emerald-200`
- 450: `bg-emerald-100` `text-emerald-700`
- 464: `text-emerald-300` `text-emerald-600`
- 480: `bg-cyan-500/10` `hover:bg-cyan-500/20` `text-cyan-200`
- 481: `bg-cyan-50` `hover:bg-cyan-100` `text-cyan-800`
- 487: `bg-cyan-500/30` `text-cyan-200`
- 488: `bg-cyan-100` `text-cyan-700`
- 500: `text-cyan-300` `text-cyan-600`
- 516: `bg-violet-500/10` `hover:bg-violet-500/20` `text-violet-200`
- 517: `bg-violet-50` `hover:bg-violet-100` `text-violet-800`
- 522: `bg-violet-500/30` `text-violet-200` `bg-violet-100` `text-violet-700`
- 533: `text-violet-300` `text-violet-600`
- 548: `bg-purple-500/10` `hover:bg-purple-500/20` `text-purple-200`
- 549: `bg-purple-50` `hover:bg-purple-100` `text-purple-800`
- 555: `bg-purple-500/30` `text-purple-200`
- 556: `bg-purple-100` `text-purple-700`
- 570: `text-purple-300` `text-purple-600`
- 586: `bg-amber-500/10` `hover:bg-amber-500/20` `text-amber-200`
- 587: `bg-amber-50` `hover:bg-amber-100` `text-amber-800`
- 593: `bg-amber-500/30` `text-amber-200`
- 594: `bg-amber-100` `text-amber-700`
- 608: `text-amber-300` `text-amber-600`
- 624: `bg-sky-500/10` `hover:bg-sky-500/20` `text-sky-200`
- 625: `bg-sky-50` `hover:bg-sky-100` `text-sky-800`
- 631: `bg-sky-500/30` `text-sky-200`
- 632: `bg-sky-100` `text-sky-700`
- 646: `text-sky-300` `text-sky-600`
- 662: `bg-indigo-500/10` `hover:bg-indigo-500/20` `text-indigo-200`
- 663: `bg-indigo-50` `hover:bg-indigo-100` `text-indigo-800`
- 669: `bg-indigo-500/30` `text-indigo-200`
- 670: `bg-indigo-100` `text-indigo-700`
- 682: `text-indigo-300` `text-indigo-600`
- 698: `bg-sky-500/10` `hover:bg-sky-500/20` `text-sky-200`
- 699: `bg-sky-50` `hover:bg-sky-100` `text-sky-800`
- 705: `bg-sky-500/30` `text-sky-200`
- 706: `bg-sky-100` `text-sky-700`
- 718: `text-sky-300` `text-sky-600`
- 741: `bg-orange-500/10` `hover:bg-orange-500/20` `text-orange-200`
- 742: `bg-orange-50` `hover:bg-orange-100` `text-orange-800`
- 748: `bg-orange-500/30` `text-orange-200`
- 749: `bg-orange-100` `text-orange-700`
- 760: `text-orange-400/70` `text-orange-600/70`
- 767: `text-orange-300` `text-orange-600`
- 786: `bg-violet-500/10` `hover:bg-violet-500/20` `text-violet-200`
- 787: `bg-violet-50` `hover:bg-violet-100` `text-violet-800`
- 793: `bg-violet-500/30` `text-violet-200`
- 794: `bg-violet-100` `text-violet-700`
- 807: `text-violet-300` `text-violet-600`
- 822: `text-indigo-400` `text-indigo-500`
- 845: `bg-slate-800/60`
- 846: `bg-slate-50`
- 853: `bg-indigo-500/20` `text-indigo-300`
- 854: `bg-indigo-100` `text-indigo-600`
- 862: `text-white` `text-slate-900`
- 921: `bg-slate-800/40` `bg-slate-50`
- 928: `text-slate-200` `hover:bg-slate-800` `text-slate-700` `hover:bg-white`
- 939: `text-amber-300` `hover:bg-amber-500/10` `text-amber-800` `hover:bg-amber-50`
- 955: `text-indigo-300` `hover:bg-indigo-500/10` `text-indigo-700` `hover:bg-indigo-50`
- 975: `text-amber-400` `text-amber-500`
- 993: `bg-amber-500/10`
- 994: `bg-amber-50`
- 999: `text-amber-200` `text-amber-800`
- 1004: `text-slate-500`
- 1025: `bg-slate-800` `text-slate-400`
- 1026: `bg-white` `text-slate-600`
- 1048: `text-amber-400` `hover:bg-amber-500/10`
- 1049: `text-amber-700` `hover:bg-amber-50`
- 1056: `text-emerald-400` `text-emerald-600` `text-red-400` `text-red-600`
- 1074: `text-emerald-400` `text-emerald-500`
- 1091: `bg-emerald-500/10`
- 1092: `bg-emerald-50`
- 1098: `text-emerald-300` `text-emerald-700`
- 1106: `text-slate-400` `text-slate-600`

### src/components/SubnettingDrillDialog.tsx

- 444: `bg-indigo-500/25` `text-indigo-200`
- 445: `bg-indigo-100` `text-indigo-700`
- 447: `bg-slate-700/40` `text-slate-300`
- 448: `bg-slate-100` `text-slate-600`
- 465: `bg-indigo-500/20` `text-indigo-300` `bg-indigo-100` `text-indigo-700`
- 470: `text-slate-300` `text-slate-700`
- 492: `from-indigo-500/10` `to-violet-500/5`
- 493: `from-indigo-50` `to-violet-50/60`
- 497: `text-indigo-400` `text-indigo-600`
- 498: `text-indigo-200` `text-indigo-800`
- 518: `bg-slate-900/50` `bg-white/70`
- 519: `text-slate-400` `text-slate-500`
- 521: `text-indigo-300` `text-indigo-600`
- 523: `text-slate-400` `text-slate-500`
- 528: `text-indigo-200` `text-indigo-700` `text-slate-400` `text-slate-500`
- 532: `text-slate-300` `text-slate-600`
- 560: `text-emerald-500` `text-rose-500`
- 571: `bg-slate-800` `bg-slate-100`
- 573: `bg-violet-500`
- 579: `text-slate-500`
- 585: `text-slate-400` `hover:text-white` `text-slate-500` `hover:text-slate-900`
- 594: `bg-slate-800` `text-violet-300` `bg-violet-50` `text-violet-900`
- 599: `text-slate-400` `text-slate-600`
- 608: `text-slate-300` `text-slate-700`
- 622: `text-rose-400`
- 629: `text-slate-300` `text-slate-700`
- 643: `text-rose-400`
- 650: `text-slate-300` `text-slate-700`
- 664: `text-rose-400`
- 670: `bg-slate-800/60` `bg-slate-50`
- 671: `text-slate-300` `text-slate-700`
- 678: `text-slate-400` `text-slate-600`
- 682: `text-emerald-500` `text-rose-500`
- 708: `bg-emerald-500/10` `text-emerald-300`
- 709: `bg-emerald-50` `text-emerald-700`
- 710: `bg-rose-500/10` `text-rose-300`
- 711: `bg-rose-50` `text-rose-700`
- 723: `bg-violet-500/10` `text-violet-200`
- 724: `bg-violet-50` `text-violet-800`
- 736: `bg-violet-600` `hover:bg-violet-500` `text-white`
- 745: `bg-violet-600` `hover:bg-violet-500` `text-white`
- 754: `bg-violet-600` `hover:bg-violet-500` `text-white`
- 798: `bg-slate-900` `text-slate-100`
- 799: `bg-white` `text-slate-900`
- 866: `text-slate-300` `text-slate-700`
- 872: `text-emerald-500` `text-rose-500`
- 903: `bg-indigo-600` `text-white`
- 904: `bg-indigo-600` `text-white`
- 906: `text-slate-400` `hover:text-white` `hover:bg-slate-700`
- 907: `text-slate-600` `hover:text-slate-900` `hover:bg-slate-100`
- 919: `bg-black/60`
- 928: `bg-slate-900`
- 929: `bg-white`
- 941: `bg-indigo-500/20` `text-indigo-300` `bg-indigo-100` `text-indigo-600`
- 948: `text-white` `text-slate-900`
- 952: `text-slate-400` `text-slate-500`
- 957: `bg-slate-800` `bg-slate-100`
- 966: `text-slate-400` `hover:text-white` `hover:bg-slate-700`
- 967: `text-slate-500` `hover:text-slate-900` `hover:bg-slate-100`
- 983: `text-slate-500`
- 992: `text-slate-400` `hover:text-white`
- 993: `text-slate-500` `hover:text-slate-900`
- 1001: `bg-slate-800` `bg-slate-100`
- 1003: `bg-indigo-500`
- 1015: `bg-slate-800` `text-indigo-300`
- 1016: `bg-indigo-50` `text-indigo-900`
- 1031: `text-slate-400` `text-slate-600`
- 1091: `bg-emerald-500/10` `text-emerald-300`
- 1092: `bg-emerald-50` `text-emerald-700`
- 1094: `bg-rose-500/10` `text-rose-300`
- 1095: `bg-rose-50` `text-rose-700`
- 1116: `bg-indigo-500/10` `text-indigo-200`
- 1117: `bg-indigo-50` `text-indigo-800`
- 1132: `bg-indigo-600` `hover:bg-indigo-500` `text-white`
- 1141: `bg-indigo-600` `hover:bg-indigo-500` `text-white`
- 1150: `bg-indigo-600` `hover:bg-indigo-500` `text-white`

### src/components/ExamPrepDialog.tsx

- 105: `bg-blue-100` `text-blue-700` `dark:bg-blue-900/50` `dark:text-blue-300`
- 106: `bg-purple-100` `text-purple-700` `dark:bg-purple-900/50` `dark:text-purple-300`
- 107: `bg-cyan-100` `text-cyan-700` `dark:bg-cyan-900/50` `dark:text-cyan-300`
- 108: `bg-yellow-100` `text-yellow-700` `dark:bg-yellow-900/50` `dark:text-yellow-300`
- 109: `bg-indigo-100` `text-indigo-700` `dark:bg-indigo-900/50` `dark:text-indigo-300`
- 110: `bg-red-100` `text-red-700` `dark:bg-red-900/50` `dark:text-red-300`
- 111: `bg-fuchsia-100` `text-fuchsia-700` `dark:bg-fuchsia-900/50` `dark:text-fuchsia-300`
- 112: `bg-teal-100` `text-teal-700` `dark:bg-teal-900/50` `dark:text-teal-300`
- 113: `bg-zinc-100` `text-zinc-600` `dark:bg-zinc-700` `dark:text-zinc-300`
- 140: `bg-zinc-800` `text-zinc-200`
- 141: `bg-white` `text-zinc-800`
- 151: `bg-sky-900/40` `text-sky-200`
- 152: `bg-sky-50` `text-sky-900`
- 155: `bg-zinc-700/50`
- 156: `bg-zinc-50`
- 161: `bg-green-900/40` `text-green-200`
- 162: `bg-green-50` `text-green-900`
- 166: `bg-red-900/40` `text-red-200`
- 167: `bg-red-50` `text-red-900`
- 169: `bg-zinc-700/50` `bg-zinc-50`
- 183: `bg-amber-100` `text-amber-700` `dark:bg-amber-900/50` `dark:text-amber-300`
- 206: `bg-zinc-800/60` `text-zinc-400`
- 207: `bg-zinc-100` `text-zinc-600`
- 210: `text-zinc-500`
- 219: `bg-zinc-900` `bg-white`
- 239: `bg-sky-500` `text-white`
- 241: `bg-zinc-600` `text-zinc-300`
- 242: `bg-zinc-200` `text-zinc-600`
- 249: `text-green-500`
- 252: `text-red-500`
- 264: `bg-green-900/30` `text-green-300`
- 265: `bg-green-50` `text-green-700`
- 267: `bg-red-900/30` `text-red-300`
- 268: `bg-red-50` `text-red-700`
- 323: `text-green-500` `text-red-500`
- 330: `text-green-500` `text-red-500`
- 333: `text-zinc-400` `text-zinc-500`
- 345: `bg-zinc-700` `bg-zinc-200`
- 347: `bg-green-500` `bg-red-500`
- 355: `text-zinc-300` `text-zinc-600`
- 363: `text-zinc-300` `text-zinc-700`
- 368: `bg-zinc-700` `bg-zinc-200`
- 370: `bg-green-500` `bg-red-500`
- 391: `text-zinc-300` `hover:bg-zinc-700`
- 392: `text-zinc-700` `hover:bg-zinc-100`
- 585: `bg-zinc-900` `text-zinc-100` `bg-white` `text-zinc-900`
- 586: `bg-zinc-800` `bg-zinc-50`
- 602: `text-sky-500`
- 606: `text-zinc-400` `text-zinc-500`
- 624: `bg-red-100` `text-red-700` `dark:bg-red-900/40` `dark:text-red-400`
- 626: `bg-zinc-700` `text-zinc-200`
- 627: `bg-zinc-200` `text-zinc-700`
- 637: `hover:bg-zinc-700` `hover:bg-zinc-200`
- 647: `bg-zinc-700` `bg-zinc-200`
- 649: `bg-sky-500`
- 664: `bg-zinc-800` `bg-zinc-50`
- 668: `text-sky-500`
- 672: `text-green-500`
- 677: `text-orange-500`
- 679: `text-purple-500`
- 693: `text-zinc-400` `text-zinc-600`
- 702: `bg-zinc-800` `text-zinc-200`
- 703: `bg-white` `text-zinc-900`
- 809: `text-zinc-300` `hover:bg-zinc-700`
- 810: `text-zinc-700` `hover:bg-zinc-100`
- 821: `bg-sky-500` `text-white` `hover:bg-sky-600` `disabled:bg-slate-300` `disabled:text-slate-500` `dark:disabled:bg-slate-700` `dark:disabled:text-slate-400`
- 828: `text-zinc-400` `text-zinc-500`
- 840: `text-zinc-300` `hover:bg-zinc-700`
- 841: `text-zinc-700` `hover:bg-zinc-100`
- 849: `bg-green-500` `text-white` `hover:bg-green-600`

### src/components/FloatingToolbar.tsx

- 157: `bg-slate-900/90` `text-slate-400` `hover:text-white`
- 158: `bg-white/90` `text-slate-500` `hover:text-slate-900`
- 169: `bg-slate-900/90`
- 170: `bg-white/90`
- 187: `text-slate-400` `hover:text-white` `hover:bg-slate-800`
- 188: `text-slate-600` `hover:text-slate-900` `hover:bg-slate-100`
- 206: `bg-slate-800`
- 212: `text-slate-500`
- 226: `bg-slate-500` `bg-slate-200`
- 238: `text-slate-400` `hover:text-white` `hover:bg-slate-800`
- 239: `text-slate-600` `hover:text-slate-900` `hover:bg-slate-100`
- 249: `bg-slate-800`
- 254: `text-slate-500`
- 265: `bg-slate-500` `bg-slate-200`
- 277: `hover:bg-slate-800`
- 278: `hover:bg-slate-100`
- 296: `bg-slate-900`
- 301: `text-slate-300`
- 312: `text-slate-300`
- 345: `text-slate-400` `hover:text-white` `hover:bg-slate-800`
- 346: `text-slate-600` `hover:text-slate-900` `hover:bg-slate-100`
- 364: `bg-slate-900`
- 375: `text-white`
- 377: `text-slate-400` `hover:text-white` `hover:bg-slate-800`
- 378: `text-slate-600` `hover:text-slate-900` `hover:bg-slate-100`
- 422: `text-slate-400` `hover:text-white` `hover:bg-slate-800`
- 423: `text-slate-600` `hover:text-slate-900` `hover:bg-slate-100`
- 435: `bg-slate-900`
- 451: `text-white`
- 453: `text-slate-400` `hover:text-white` `hover:bg-slate-800`
- 454: `text-slate-600` `hover:text-slate-900` `hover:bg-slate-100`
- 476: `bg-slate-500` `bg-slate-200`
- 492: `text-slate-400` `hover:text-white` `hover:bg-slate-800` `disabled:text-slate-600`
- 493: `text-slate-600` `hover:text-slate-900` `hover:bg-slate-100` `disabled:text-slate-300`
- 502: `bg-slate-800`
- 506: `text-slate-500`
- 521: `text-slate-400` `hover:text-white` `hover:bg-slate-800` `disabled:text-slate-600`
- 522: `text-slate-600` `hover:text-slate-900` `hover:bg-slate-100` `disabled:text-slate-300`
- 531: `bg-slate-800`
- 535: `text-slate-500`
- 545: `bg-slate-500` `bg-slate-200`
- 559: `text-white`
- 561: `text-slate-400` `hover:text-white` `hover:bg-slate-800`
- 562: `text-slate-600` `hover:text-slate-900` `hover:bg-slate-100`
- 572: `bg-slate-800`
- 587: `text-slate-400` `hover:text-white` `hover:bg-slate-800`
- 588: `text-slate-600` `hover:text-slate-900` `hover:bg-slate-100`
- 599: `bg-slate-900`
- 604: `text-slate-300`
- 616: `text-white`
- 618: `text-slate-400` `hover:text-white` `hover:bg-slate-800`
- 619: `text-slate-600` `hover:text-slate-900` `hover:bg-slate-100`
- 639: `text-slate-300`
- 650: `text-white`
- 652: `text-slate-400` `hover:text-white` `hover:bg-slate-800`
- 653: `text-slate-600` `hover:text-slate-900` `hover:bg-slate-100`
- 670: `text-slate-300`
- 678: `text-slate-400`
- 679: `text-slate-500`
- 705: `bg-slate-500` `bg-slate-200`
- 719: `text-slate-400` `hover:text-white` `hover:bg-slate-800`
- 720: `text-slate-600` `hover:text-slate-900` `hover:bg-slate-100`
- 733: `bg-slate-900`
- 744: `text-slate-500`
- 759: `bg-slate-500` `bg-slate-200`
- 803: `text-slate-400` `hover:text-white` `hover:bg-slate-800`
- 804: `text-slate-600` `hover:text-slate-900` `hover:bg-slate-100`
- 813: `bg-slate-800`
- 830: `text-slate-400` `hover:text-white` `hover:bg-slate-800`
- 831: `text-slate-600` `hover:text-slate-900` `hover:bg-slate-100`
- 840: `bg-slate-800`
- 844: `text-slate-500`
- 861: `text-slate-500` `hover:text-slate-300` `hover:bg-slate-800`
- 862: `text-slate-400` `hover:text-slate-700` `hover:bg-slate-100`
- 870: `bg-slate-800`

### src/components/RoutingSimulatorDialog.tsx

- 325: `bg-black/60`
- 330: `bg-slate-900` `text-slate-100` `bg-white` `text-slate-900`
- 337: `bg-slate-900` `bg-white`
- 343: `bg-sky-500/20` `text-sky-300` `bg-sky-100` `text-sky-700`
- 355: `hover:bg-slate-500/20`
- 363: `bg-slate-900/95` `bg-white/95`
- 381: `bg-sky-500` `text-white`
- 382: `bg-sky-600` `text-white`
- 384: `hover:bg-slate-800` `text-slate-300`
- 385: `hover:bg-slate-100` `text-slate-700`
- 431: `text-slate-400` `text-slate-600`
- 432: `bg-slate-800/60` `bg-slate-50`
- 511: `bg-slate-800` `hover:bg-slate-700` `bg-slate-200` `hover:bg-slate-300`
- 519: `bg-sky-500` `hover:bg-sky-400` `text-white` `bg-sky-600` `hover:bg-sky-700`
- 529: `bg-slate-800` `hover:bg-slate-700` `bg-slate-200` `hover:bg-slate-300`
- 540: `bg-slate-800` `hover:bg-slate-700` `bg-slate-200` `hover:bg-slate-300`
- 554: `text-sky-300` `text-sky-700`
- 583: `bg-amber-500/20` `text-amber-200` `bg-amber-100` `text-amber-900`
- 667: `text-slate-400` `text-slate-600`
- 672: `text-emerald-300`
- 673: `text-emerald-700`
- 675: `text-slate-200`
- 676: `text-slate-800`
- 726: `text-slate-400` `text-slate-600`
- 727: `bg-slate-800/60` `bg-slate-50`
- 820: `bg-slate-950` `text-slate-200` `bg-slate-900` `text-slate-100`
- 821: `text-slate-400`
- 822: `text-slate-400`
- 824: `text-emerald-400`
- 829: `text-emerald-400`
- 837: `bg-slate-800` `hover:bg-slate-700` `bg-slate-200` `hover:bg-slate-300`
- 843: `bg-sky-500` `hover:bg-sky-400` `text-white` `bg-sky-600` `hover:bg-sky-700`
- 851: `bg-slate-800` `hover:bg-slate-700` `bg-slate-200` `hover:bg-slate-300`
- 857: `bg-slate-800` `hover:bg-slate-700` `bg-slate-200` `hover:bg-slate-300`
- 872: `text-slate-400` `text-slate-600`
- 873: `bg-slate-800/60` `bg-slate-50`
- 899: `bg-slate-800`
- 900: `bg-white`
- 902: `bg-slate-900/50`
- 903: `bg-slate-100/50`
- 911: `text-amber-300` `text-amber-700`
- 924: `bg-emerald-500/10` `bg-emerald-50`
- 969: `bg-slate-900/60` `bg-white`
- 988: `text-slate-400` `text-slate-600`
- 989: `bg-slate-800/60` `bg-slate-50`
- 1015: `bg-sky-500` `text-white`
- 1016: `bg-sky-600` `text-white`
- 1019: `bg-emerald-500/30` `text-emerald-200`
- 1020: `bg-emerald-100` `text-emerald-800`
- 1022: `bg-slate-700` `text-slate-400`
- 1023: `bg-slate-200` `text-slate-600`
- 1116: `bg-rose-500/10` `text-rose-200` `bg-rose-50` `text-rose-800`
- 1129: `bg-slate-800` `hover:bg-slate-700` `bg-slate-200` `hover:bg-slate-300`
- 1138: `bg-sky-500` `hover:bg-sky-400` `text-white` `bg-sky-600` `hover:bg-sky-700`
- 1146: `bg-slate-800` `hover:bg-slate-700` `bg-slate-200` `hover:bg-slate-300`
- 1169: `text-slate-400` `text-slate-600`
- 1170: `bg-slate-800/60` `bg-slate-50`
- 1211: `bg-slate-800` `bg-white`
- 1227: `bg-slate-800` `bg-white`
- 1244: `bg-slate-800` `hover:bg-slate-700` `bg-slate-200` `hover:bg-slate-300`
- 1352: `bg-emerald-500/10`
- 1353: `bg-emerald-50`
- 1377: `bg-slate-900` `bg-slate-100`

### src/components/ShapeConfigDialog.tsx

- 268: `bg-slate-900` `bg-white`
- 274: `text-blue-500`
- 277: `text-sky-500`
- 280: `text-purple-500`
- 283: `text-cyan-500`
- 286: `text-slate-500`
- 292: `text-green-500`
- 293: `text-slate-500`
- 294: `text-red-500`
- 295: `text-amber-500`
- 296: `text-orange-500`
- 385: `bg-slate-800`
- 392: `bg-slate-800`
- 397: `bg-green-500`
- 403: `bg-slate-500`
- 409: `bg-red-500`
- 415: `bg-amber-500`
- 421: `bg-orange-500`
- 438: `bg-slate-800`
- 454: `bg-slate-800`
- 474: `bg-slate-800`
- 492: `bg-slate-800`
- 505: `bg-slate-800`
- 518: `bg-slate-800`
- 531: `bg-slate-800`
- 551: `bg-slate-800`
- 568: `bg-slate-800`
- 575: `bg-slate-800`
- 600: `bg-slate-800`
- 607: `bg-slate-800`
- 648: `bg-slate-800`
- 667: `bg-slate-800`
- 686: `bg-slate-800`
- 699: `bg-slate-800`
- 706: `bg-slate-800`
- 736: `bg-slate-800`
- 753: `bg-slate-800`
- 780: `bg-slate-800`
- 801: `bg-slate-800`
- 811: `bg-slate-800`
- 818: `bg-slate-800`
- 833: `bg-slate-800`
- 849: `bg-slate-800` `bg-slate-100`
- 871: `bg-slate-700`
- 878: `bg-slate-800`
- 883: `bg-green-500`
- 889: `bg-red-500`
- 895: `bg-amber-500`
- 905: `text-red-500` `hover:text-red-400`
- 928: `bg-slate-800`
- 929: `bg-slate-50`
- 940: `text-green-500`
- 942: `text-red-500`
- 944: `text-slate-500`
- 967: `bg-slate-700`
- 988: `bg-slate-700`
- 1018: `bg-slate-700`
- 1027: `bg-slate-800`
- 1056: `bg-slate-700`
- 1065: `bg-slate-800`
- 1095: `bg-slate-700`
- 1104: `bg-slate-800`
- 1129: `bg-slate-700`
- 1160: `bg-slate-800`
- 1174: `bg-slate-800`
- 1188: `bg-slate-800`
- 1227: `text-slate-400` `text-slate-600`
- 1241: `bg-slate-800` `bg-slate-50`
- 1254: `text-red-500`
- 1293: `bg-slate-800`
- 1307: `bg-slate-800`
- 1345: `bg-slate-800` `bg-slate-50`
- 1359: `text-red-500`
- 1412: `bg-slate-800`
- 1420: `bg-slate-800`
- 1428: `bg-slate-800`
- 1436: `bg-slate-800`
- 1492: `bg-slate-800`
- 1493: `bg-slate-50`
- 1501: `text-red-500`
- 1580: `bg-slate-800`
- 1602: `bg-slate-800`
- 1624: `bg-slate-800`
- 1643: `bg-slate-800`
- 1652: `bg-slate-800`
- 1677: `bg-slate-800`
- 1720: `bg-slate-800` `bg-slate-50`
- 1733: `text-red-500`
- 1771: `bg-slate-800`
- 1778: `bg-slate-800`
- 1800: `bg-slate-800`
- 1807: `bg-slate-800`
- 1828: `bg-slate-800`
- 1845: `bg-slate-800`
- 1890: `bg-slate-800` `bg-slate-50`
- 1900: `bg-green-600`
- 1901: `bg-red-600`
- 1917: `text-red-500`
- 1989: `bg-slate-800`
- 2008: `bg-slate-800`
- 2032: `bg-slate-800`
- 2041: `bg-slate-800`
- 2064: `bg-slate-800`
- 2081: `bg-slate-800`
- 2125: `bg-slate-800` `bg-slate-50`
- 2138: `text-red-500`
- 2204: `bg-slate-800`
- 2213: `bg-slate-800`
- 2235: `bg-slate-800` `bg-slate-100`
- 2248: `bg-slate-800`
- 2249: `bg-blue-50`
- 2274: `bg-slate-800` `bg-slate-50`
- 2285: `text-green-500`
- 2287: `text-red-500`
- 2289: `text-amber-500`
- 2291: `text-blue-500`
- 2314: `text-red-400`

### src/components/SubnetSegmentationTool.tsx

- 258: `bg-slate-700/20`
- 268: `text-slate-500` `text-slate-400`
- 276: `text-slate-500` `text-slate-400`
- 281: `text-slate-500` `text-slate-400`
- 317: `text-white` `text-slate-900`
- 318: `text-slate-400` `text-slate-500`
- 319: `bg-slate-800` `bg-white`
- 320: `bg-slate-900/50` `bg-slate-50`
- 322: `bg-slate-700` `text-white` `bg-white` `text-slate-900`
- 401: `bg-slate-800/50` `bg-indigo-50`
- 403: `bg-indigo-500/20` `bg-indigo-100`
- 419: `bg-slate-800` `bg-slate-100`
- 435: `bg-indigo-600` `text-white`
- 437: `text-slate-400` `hover:text-white`
- 438: `text-slate-600` `hover:text-slate-900`
- 462: `bg-slate-700` `text-slate-300` `bg-slate-100` `text-slate-600`
- 482: `bg-indigo-600` `text-white`
- 484: `bg-slate-700` `text-slate-300` `hover:bg-slate-600`
- 485: `bg-slate-100` `text-slate-700` `hover:bg-slate-200`
- 497: `bg-slate-700` `text-white` `bg-white` `text-slate-900`
- 517: `bg-indigo-500/20` `hover:bg-indigo-500/30` `text-indigo-300` `bg-indigo-50` `hover:bg-indigo-100` `text-indigo-700`
- 526: `bg-slate-800` `bg-slate-50`
- 535: `hover:bg-slate-800/50` `hover:bg-slate-50`
- 550: `bg-slate-700` `text-white` `bg-white` `text-slate-900`
- 561: `bg-slate-700` `text-white` `bg-white` `text-slate-900`
- 571: `bg-slate-700` `text-white` `bg-white` `text-slate-900`
- 577: `text-slate-500` `hover:text-red-400` `hover:bg-red-500/10` `text-slate-400` `hover:text-red-500` `hover:bg-red-50`
- 592: `bg-indigo-600` `hover:bg-indigo-700` `text-white`
- 599: `bg-red-500/10` `text-red-300` `bg-red-50` `text-red-700`
- 609: `bg-indigo-500/10` `text-slate-300` `bg-indigo-50` `text-slate-700`
- 610: `text-indigo-200` `text-indigo-800`
- 647: `bg-slate-800/50` `bg-slate-50`
- 655: `bg-slate-800/30` `bg-slate-50`
- 665: `bg-white` `bg-slate-800/20` `bg-slate-50/50`
- 676: `text-emerald-400` `text-emerald-700`
- 679: `text-red-400` `text-red-600`
- 680: `text-indigo-300` `text-indigo-700`
- 692: `bg-slate-800/50` `hover:bg-slate-800` `bg-slate-50` `hover:bg-slate-100`
- 697: `bg-indigo-500/20` `text-indigo-300` `bg-indigo-100` `text-indigo-700`
- 709: `bg-emerald-500/20` `text-emerald-300` `bg-emerald-50` `text-emerald-700` `bg-slate-700` `hover:bg-slate-600` `text-slate-300` `bg-slate-100` `hover:bg-slate-200` `text-slate-700`
- 715: `text-slate-300` `bg-slate-950/50` `text-slate-700` `bg-slate-50`

### src/components/VerkabelungTrainerDialog.tsx

- 159: `text-slate-300` `text-slate-700`
- 166: `bg-indigo-600` `text-white`
- 167: `bg-slate-700` `text-slate-300` `hover:bg-slate-600` `bg-slate-100` `text-slate-700` `hover:bg-slate-200`
- 173: `text-slate-500` `text-slate-400`
- 176: `text-slate-400` `text-slate-600`
- 215: `bg-green-900/40` `text-green-300` `bg-green-50` `text-green-700`
- 216: `bg-red-900/40` `text-red-300` `bg-red-50` `text-red-700`
- 225: `bg-slate-700` `text-slate-200` `hover:bg-slate-600` `bg-slate-100` `text-slate-700` `hover:bg-slate-200`
- 228: `bg-indigo-600` `text-white` `hover:bg-indigo-500`
- 231: `text-slate-400` `hover:text-slate-200` `text-slate-500` `hover:text-slate-700`
- 236: `bg-slate-800` `bg-slate-50`
- 237: `text-slate-300` `text-slate-700`
- 240: `text-slate-400` `text-slate-500`
- 242: `text-slate-300` `text-slate-700`
- 256: `text-slate-400` `text-slate-600`
- 268: `bg-slate-800` `bg-white`
- 270: `text-slate-200` `text-slate-800`
- 271: `text-slate-500`
- 272: `text-slate-500`
- 280: `bg-slate-800` `bg-white`
- 284: `text-white` `text-slate-900`
- 285: `text-slate-400` `text-slate-500`
- 290: `bg-slate-900` `bg-slate-50`
- 291: `text-slate-300` `text-slate-700`
- 294: `text-slate-400` `text-slate-500`
- 300: `text-slate-300` `text-slate-700`
- 301: `text-slate-400` `text-slate-600`
- 305: `bg-amber-900/30` `text-amber-300` `bg-amber-50` `text-amber-800`
- 321: `text-slate-400` `text-slate-600`
- 327: `bg-slate-700` `bg-slate-100`
- 329: `text-slate-200` `text-slate-700`
- 340: `bg-indigo-900/40` `bg-indigo-50`
- 341: `hover:bg-slate-700/50` `hover:bg-slate-50`
- 344: `text-indigo-300` `text-indigo-700`
- 345: `text-slate-300` `text-slate-600`
- 346: `text-slate-300` `text-slate-600`
- 347: `text-slate-300` `text-slate-600`
- 348: `text-slate-400` `text-slate-500`
- 354: `bg-slate-800` `text-slate-300` `bg-slate-50` `text-slate-600`
- 383: `bg-slate-900` `text-white` `bg-white` `text-slate-900`
- 390: `text-slate-400` `text-slate-500`
- 397: `hover:bg-slate-700` `text-slate-400` `hover:bg-slate-100` `text-slate-500`
- 411: `text-indigo-300` `text-indigo-700`
- 412: `text-slate-400` `hover:text-slate-200` `text-slate-500` `hover:text-slate-700`

### src/components/ShareExportDialog.tsx

- 165: `bg-black/60`
- 169: `bg-slate-900` `bg-white`
- 177: `text-blue-500`
- 179: `text-white` `text-slate-900`
- 186: `hover:bg-slate-800` `text-slate-400` `hover:bg-slate-100` `text-slate-500`
- 206: `text-blue-500`
- 207: `text-slate-500` `hover:text-slate-300` `text-slate-400` `hover:text-slate-600`
- 222: `bg-slate-800/50` `bg-slate-50`
- 226: `text-white` `text-slate-900`
- 231: `text-slate-500` `text-slate-400`
- 238: `text-white` `text-slate-900`
- 243: `text-slate-500` `text-slate-400`
- 250: `text-white` `text-slate-900`
- 255: `text-slate-500` `text-slate-400`
- 265: `text-slate-300` `text-slate-700`
- 281: `bg-blue-500/10`
- 293: `text-blue-500`
- 295: `text-slate-500`
- 296: `text-slate-400`
- 301: `text-slate-200` `text-slate-700`
- 305: `text-amber-500`
- 311: `text-slate-500` `text-slate-400`
- 325: `text-slate-300` `text-slate-700`
- 340: `hover:bg-slate-800` `hover:bg-slate-50`
- 357: `text-slate-300` `text-slate-600`
- 368: `text-slate-300` `text-slate-600`
- 381: `bg-blue-500` `text-white`
- 383: `bg-slate-800` `text-slate-400` `hover:text-slate-200`
- 384: `bg-slate-100` `text-slate-500` `hover:text-slate-700`
- 403: `bg-blue-500` `hover:bg-blue-600` `text-white`
- 414: `bg-slate-800/30` `bg-slate-50`
- 417: `text-slate-200` `text-slate-700`
- 425: `text-slate-400` `text-slate-500`
- 446: `bg-blue-500/20` `text-blue-400`
- 448: `bg-slate-800` `text-slate-500`
- 449: `bg-slate-200` `text-slate-400`
- 462: `text-slate-400` `text-slate-500`
- 474: `bg-slate-900` `text-slate-200`
- 475: `bg-white` `text-slate-700`
- 481: `text-slate-400` `text-slate-500`
- 494: `bg-slate-900` `text-slate-200`
- 495: `bg-white` `text-slate-700`
- 503: `bg-emerald-500` `hover:bg-emerald-600` `text-white`
- 514: `text-slate-200` `text-slate-700`
- 524: `bg-slate-800/30`
- 525: `bg-slate-50`
- 530: `text-slate-300` `text-slate-600`
- 535: `text-slate-500` `text-slate-400`
- 560: `bg-emerald-500/20` `text-emerald-400`
- 562: `hover:bg-slate-700` `text-slate-400`
- 563: `hover:bg-slate-200` `text-slate-500`
- 575: `hover:bg-slate-700` `text-slate-500` `hover:text-red-400` `hover:bg-slate-200` `text-slate-400` `hover:text-red-500`
- 588: `bg-blue-500/10` `text-blue-300` `bg-blue-50` `text-blue-600`

### src/tools/SubnettingDrillQuiz.tsx

- 229: `text-gray-900` `dark:text-gray-100`
- 232: `text-gray-500` `dark:text-gray-400`
- 239: `text-gray-600` `dark:text-gray-300` `hover:bg-gray-50` `dark:hover:bg-gray-800`
- 249: `bg-gray-50` `dark:bg-gray-900`
- 250: `text-gray-500` `dark:text-gray-400`
- 253: `bg-white` `dark:bg-gray-800`
- 255: `text-gray-800` `dark:text-gray-200`
- 261: `text-gray-500` `dark:text-gray-400`
- 267: `text-gray-400` `dark:text-gray-500`
- 280: `text-blue-600` `dark:text-blue-400`
- 281: `text-gray-700` `dark:text-gray-300`
- 293: `text-gray-400` `dark:text-gray-500`
- 300: `text-gray-500` `dark:text-gray-400`
- 303: `text-gray-700` `dark:text-gray-300`
- 309: `text-green-600` `dark:text-green-400`
- 319: `text-green-600` `dark:text-green-400`
- 321: `text-yellow-600` `dark:text-yellow-400`
- 322: `text-red-500` `dark:text-red-400`
- 330: `text-orange-500` `dark:text-orange-400`
- 335: `text-purple-500` `dark:text-purple-400`
- 349: `bg-blue-600` `text-white`
- 350: `text-gray-500` `dark:text-gray-400` `hover:bg-gray-50` `dark:hover:bg-gray-800`
- 364: `bg-white` `dark:bg-gray-900`
- 367: `bg-blue-50` `dark:bg-blue-950`
- 368: `text-blue-600` `dark:text-blue-400`
- 378: `text-gray-600` `dark:text-gray-400`
- 379: `text-gray-900` `dark:text-gray-100`
- 381: `text-blue-500` `dark:text-blue-400`
- 385: `text-gray-500` `dark:text-gray-400`
- 391: `text-gray-600` `dark:text-gray-400`
- 394: `text-gray-900` `dark:text-gray-100`
- 397: `text-gray-500` `dark:text-gray-400`
- 414: `hover:bg-blue-50` `dark:hover:bg-blue-950` `text-gray-800` `dark:text-gray-200`
- 417: `bg-green-50` `dark:bg-green-950` `text-green-700` `dark:text-green-300`
- 420: `bg-red-50` `dark:bg-red-950` `text-red-700` `dark:text-red-300`
- 423: `text-gray-400` `dark:text-gray-600`
- 430: `text-green-500`
- 433: `text-red-500`
- 447: `bg-green-50` `dark:bg-green-950`
- 448: `bg-orange-50` `dark:bg-orange-950`
- 454: `text-green-700` `dark:text-green-300`
- 455: `text-orange-700` `dark:text-orange-300`
- 460: `text-gray-700` `dark:text-gray-300`
- 465: `text-gray-500` `dark:text-gray-400`
- 479: `bg-blue-600` `hover:bg-blue-700`
- 480: `text-white`
- 498: `text-gray-400` `dark:text-gray-600` `hover:text-gray-600`
- 499: `dark:hover:text-gray-400`

### src/components/StpSimulatorDialog.tsx

- 216: `bg-slate-800/40` `bg-slate-50`
- 404: `bg-slate-800/40` `bg-white`
- 417: `bg-slate-900` `text-slate-100`
- 418: `bg-white` `text-slate-900`
- 428: `text-yellow-500`
- 437: `hover:bg-slate-700` `text-slate-300`
- 438: `hover:bg-slate-100` `text-slate-700`
- 448: `bg-cyan-500/5` `text-cyan-100`
- 449: `bg-cyan-50` `text-cyan-900`
- 507: `bg-slate-800/40` `bg-slate-50`
- 514: `bg-cyan-500/30` `hover:bg-cyan-500/50` `text-cyan-100` `bg-cyan-100` `hover:bg-cyan-200` `text-cyan-900`
- 523: `hover:bg-slate-700` `hover:bg-slate-100`
- 564: `bg-black/20`
- 598: `bg-slate-800/40` `bg-white`
- 605: `text-slate-400` `text-slate-600`
- 671: `bg-slate-800/40` `bg-slate-50`
- 678: `bg-amber-500/30` `hover:bg-amber-500/50` `text-amber-100` `bg-amber-100` `hover:bg-amber-200` `text-amber-900`
- 687: `hover:bg-slate-700` `hover:bg-slate-100`
- 699: `text-emerald-300` `text-emerald-600`
- 703: `bg-slate-700` `bg-slate-200`
- 705: `from-red-500` `via-amber-500` `to-emerald-500`
- 721: `text-emerald-300` `text-emerald-600`
- 725: `bg-slate-700` `bg-slate-200`
- 727: `from-cyan-400` `to-emerald-500`
- 740: `bg-cyan-500/10` `bg-cyan-50`
- 756: `bg-slate-800/40` `bg-white`
- 763: `text-slate-400` `text-slate-600`
- 854: `bg-slate-800/40` `bg-slate-50`
- 893: `bg-cyan-500/30` `text-cyan-100`
- 894: `bg-cyan-100` `text-cyan-900`
- 896: `hover:bg-slate-700`
- 897: `hover:bg-slate-100`
- 907: `bg-red-500/30` `text-red-100`
- 908: `bg-red-100` `text-red-900`
- 910: `hover:bg-slate-700`
- 911: `hover:bg-slate-100`
- 920: `bg-slate-900` `bg-slate-800` `text-green-400`
- 945: `bg-slate-900/50` `bg-white`
- 949: `text-green-400` `text-green-700`
- 980: `bg-black/60`
- 985: `bg-slate-900` `text-slate-100` `bg-white` `text-slate-900`
- 992: `bg-slate-900` `bg-white`
- 998: `bg-cyan-500/20` `text-cyan-300` `bg-cyan-100` `text-cyan-700`
- 1013: `hover:bg-slate-500/20`
- 1022: `bg-slate-900` `bg-white`
- 1035: `text-cyan-300`
- 1036: `text-cyan-700`

### src/components/TemplateGallery.tsx

- 304: `bg-black/70`
- 307: `bg-slate-900` `text-white` `bg-white` `text-slate-900`
- 316: `bg-slate-950/60` `bg-slate-50/80`
- 320: `text-amber-500`
- 324: `text-white` `text-slate-900`
- 331: `bg-slate-800` `text-slate-300` `bg-slate-100` `text-slate-600`
- 342: `bg-amber-500/20` `text-amber-400`
- 343: `bg-emerald-600` `hover:bg-emerald-500` `text-white`
- 358: `hover:bg-slate-800` `text-slate-400` `hover:text-white`
- 359: `hover:bg-slate-100` `text-slate-500` `hover:text-black`
- 372: `bg-emerald-500/5` `bg-emerald-50/50`
- 377: `text-slate-400` `text-slate-500`
- 387: `bg-slate-900` `text-slate-200`
- 388: `bg-white` `text-slate-700`
- 394: `text-slate-400` `text-slate-500`
- 405: `bg-slate-900` `text-slate-200`
- 406: `bg-white` `text-slate-700`
- 418: `text-slate-400` `text-slate-500`
- 428: `bg-slate-900` `text-slate-200`
- 429: `bg-white` `text-slate-700`
- 436: `text-slate-400` `text-slate-500`
- 446: `bg-slate-900` `text-slate-200`
- 447: `bg-white` `text-slate-700`
- 453: `bg-emerald-500` `hover:bg-emerald-600` `text-white`
- 460: `text-slate-500` `text-slate-400`
- 475: `bg-slate-800`
- 476: `bg-slate-50`
- 481: `text-slate-500` `text-slate-400`
- 487: `text-slate-200` `text-slate-700`
- 498: `bg-slate-800` `text-slate-300`
- 499: `bg-white` `text-slate-600`
- 519: `bg-slate-800` `text-slate-300`
- 520: `bg-white` `text-slate-600`
- 534: `text-slate-500` `text-slate-400`
- 555: `bg-slate-900/60`
- 556: `bg-white`
- 566: `bg-slate-800/50` `bg-slate-50`
- 573: `bg-slate-900` `bg-white`
- 577: `text-slate-200` `text-slate-800`
- 582: `bg-amber-500/15` `text-amber-400`
- 589: `text-slate-400` `text-slate-500`
- 606: `text-slate-500` `text-slate-400`
- 612: `text-slate-500` `text-slate-400`
- 621: `text-slate-600` `text-slate-400`
- 636: `bg-slate-800` `text-slate-400`
- 637: `bg-slate-100` `text-slate-500`
- 654: `bg-blue-500` `hover:bg-blue-600` `text-white`

### src/components/AclDrillDialog.tsx

- 131: `bg-slate-900` `bg-white`
- 132: `text-white` `text-slate-900`
- 133: `text-slate-400` `text-slate-500`
- 134: `bg-slate-800/60` `bg-slate-50`
- 139: `bg-slate-950` `text-emerald-300`
- 140: `bg-slate-900` `text-emerald-300`
- 196: `bg-indigo-600` `text-white`
- 198: `text-slate-400` `hover:bg-slate-700` `hover:text-white`
- 199: `text-slate-600` `hover:bg-slate-100`
- 242: `bg-emerald-500/10` `text-emerald-300` `bg-emerald-50` `text-emerald-700`
- 243: `bg-rose-500/10` `text-rose-300` `bg-rose-50` `text-rose-700`
- 285: `bg-slate-950/40` `bg-white`
- 292: `text-emerald-300` `text-emerald-700`
- 307: `text-rose-300` `text-rose-700`
- 316: `text-emerald-300` `text-emerald-700`
- 329: `bg-black/60`
- 341: `bg-indigo-500/20` `text-indigo-300` `bg-indigo-100` `text-indigo-600`
- 351: `text-slate-400` `hover:bg-slate-700` `text-slate-500` `hover:bg-slate-100`
- 360: `bg-slate-800` `bg-slate-100`
- 375: `text-emerald-500`
- 377: `text-orange-500`
- 378: `text-violet-500`
- 391: `bg-indigo-500/10` `bg-indigo-50`
- 392: `text-indigo-300` `text-indigo-700`
- 396: `text-slate-300` `text-slate-700`
- 417: `text-indigo-300` `text-indigo-700`
- 427: `text-slate-300` `text-slate-700`
- 438: `bg-slate-950/40` `bg-white`
- 471: `text-slate-300` `text-slate-600`
- 472: `text-rose-500`
- 498: `text-slate-500`
- 525: `bg-amber-500/10` `text-amber-300` `bg-amber-50` `text-amber-700`
- 537: `text-emerald-300` `text-emerald-700`
- 548: `text-emerald-300` `text-emerald-700`
- 564: `bg-slate-950/60` `text-slate-200` `bg-white` `text-slate-800`
- 566: `text-slate-500` `text-slate-400`
- 569: `text-amber-300` `text-amber-700`
- 580: `bg-emerald-500/10`
- 581: `bg-rose-500/10`
- 582: `bg-indigo-500/10`
- 606: `bg-emerald-500/10`
- 607: `bg-rose-500/10`
- 608: `bg-indigo-500/10`
- 627: `bg-indigo-600` `text-white` `hover:bg-indigo-500`
- 632: `bg-indigo-600` `text-white` `hover:bg-indigo-500`

### src/components/QuizDialog.tsx

- 67: `bg-slate-900` `bg-white`
- 69: `text-white` `text-slate-900`
- 70: `text-slate-400` `text-slate-500`
- 71: `bg-slate-800/50` `bg-slate-50`
- 294: `bg-black/50`
- 302: `bg-green-500/20`
- 303: `text-green-400`
- 306: `bg-red-500/20`
- 307: `text-red-400`
- 332: `bg-slate-700` `bg-slate-200`
- 365: `text-green-400`
- 366: `text-red-400`
- 399: `bg-slate-700` `bg-slate-200`
- 401: `bg-green-500` `bg-red-500`
- 425: `text-green-400`
- 427: `text-red-400`
- 432: `text-green-400` `text-red-400`
- 449: `bg-indigo-500` `text-white` `hover:bg-indigo-600`
- 467: `bg-slate-800` `text-slate-300` `hover:bg-slate-700` `bg-slate-100` `text-slate-700` `hover:bg-slate-200`
- 496: `bg-black/50`
- 512: `text-red-400`
- 517: `hover:bg-slate-700/50`
- 524: `bg-slate-800` `bg-slate-100`
- 526: `bg-indigo-500`
- 555: `bg-slate-800` `text-slate-300` `hover:bg-slate-700` `bg-slate-100` `text-slate-700` `hover:bg-slate-200`
- 576: `bg-indigo-500`
- 578: `bg-green-500/60`
- 580: `bg-amber-500/50`
- 582: `bg-slate-700`
- 583: `bg-slate-300`
- 596: `bg-amber-500` `hover:bg-amber-600` `text-white`
- 607: `text-amber-400`
- 613: `text-white`
- 614: `bg-amber-500` `hover:bg-amber-600` `bg-green-500` `hover:bg-green-600`
- 623: `bg-indigo-500` `text-white` `hover:bg-indigo-600`
- 662: `bg-slate-800` `bg-slate-50`
- 668: `bg-indigo-500/15` `text-indigo-300`
- 673: `bg-green-500/15` `text-green-300`
- 674: `bg-green-500/10` `text-green-400`
- 675: `bg-red-500/15` `text-red-300`
- 676: `text-slate-500` `text-slate-400`
- 682: `text-green-400`
- 683: `text-red-400`
- 735: `bg-slate-800/60` `text-slate-400`
- 736: `bg-slate-100` `text-slate-600`
- 739: `text-slate-500`
- 780: `bg-indigo-500`
- 787: `text-white`
- 813: `bg-green-500/10`
- 814: `bg-red-500/10`
- 817: `text-green-400` `text-red-400`
- 820: `text-slate-300` `text-slate-700`

### src/components/TopicListPanel.tsx

- 174: `text-slate-400`
- 184: `bg-red-500/20`
- 185: `text-red-400`
- 187: `text-red-400`
- 188: `text-slate-500`
- 241: `bg-slate-800/50` `hover:bg-slate-800/80`
- 242: `bg-white`
- 248: `from-indigo-400` `to-indigo-600`
- 255: `from-indigo-500/35` `to-indigo-500/10` `text-indigo-300`
- 256: `bg-indigo-100` `text-indigo-600`
- 266: `text-white` `text-slate-900`
- 275: `text-slate-400`
- 276: `text-slate-500`
- 285: `text-slate-500`
- 289: `text-slate-500`
- 293: `text-slate-500`
- 307: `text-indigo-400` `text-indigo-500`
- 317: `bg-slate-700` `text-slate-400`
- 318: `bg-slate-100` `text-slate-500`
- 333: `from-slate-900` `via-slate-900`
- 334: `from-slate-50` `to-white`
- 342: `bg-slate-800/40`
- 343: `bg-white`
- 356: `from-indigo-500/40` `to-indigo-500/10`
- 357: `text-indigo-300`
- 363: `from-white` `via-indigo-100` `to-indigo-300`
- 364: `text-slate-900`
- 371: `text-slate-400` `text-slate-600`
- 393: `bg-slate-900/60` `text-slate-300`
- 394: `bg-slate-50` `text-slate-600`
- 421: `bg-slate-800/50` `text-slate-300` `hover:text-amber-300`
- 422: `bg-white` `text-slate-600` `hover:text-amber-600`
- 425: `text-amber-400` `text-amber-500`
- 437: `text-slate-500` `text-slate-400`
- 447: `bg-slate-800/50` `text-slate-100` `placeholder:text-slate-500`
- 448: `bg-white` `text-slate-900` `placeholder:text-slate-400`
- 455: `text-slate-500` `hover:text-slate-300` `text-slate-400` `hover:text-slate-600`
- 473: `bg-indigo-500/25` `text-indigo-200`
- 474: `bg-indigo-100` `text-indigo-700`
- 476: `bg-slate-800/40` `text-slate-400` `hover:text-slate-200`
- 477: `bg-white` `text-slate-500` `hover:text-slate-700`
- 492: `text-slate-500` `text-slate-400`
- 520: `text-indigo-300/90` `bg-slate-900/70`
- 521: `text-indigo-600` `bg-slate-50/80`
- 543: `text-slate-500` `text-slate-400`
- 556: `text-slate-500`
- 557: `text-slate-400`

### src/components/CliGlossaryDialog.tsx

- 36: `bg-emerald-500/20` `text-emerald-300`
- 37: `bg-emerald-50` `text-emerald-700`
- 39: `text-slate-400` `hover:bg-slate-700` `hover:text-slate-200`
- 40: `text-slate-500` `hover:bg-slate-100` `hover:text-slate-700`
- 76: `bg-black/60`
- 81: `bg-slate-900` `text-slate-100` `bg-white` `text-slate-900`
- 98: `hover:bg-slate-500/20`
- 106: `bg-slate-900` `bg-white`
- 109: `bg-slate-800` `bg-slate-50`
- 139: `bg-cyan-500/20` `text-cyan-100`
- 140: `bg-cyan-100` `text-cyan-900`
- 142: `text-slate-400` `hover:bg-slate-800`
- 143: `text-slate-600` `hover:bg-slate-100`
- 158: `bg-amber-500/20` `text-amber-200`
- 159: `bg-amber-100` `text-amber-900`
- 161: `text-amber-500/80` `hover:bg-amber-500/10`
- 162: `text-amber-700` `hover:bg-amber-50`
- 187: `bg-amber-500/10` `hover:bg-amber-500/15`
- 188: `bg-amber-50` `hover:bg-amber-100`
- 190: `bg-slate-800/40` `hover:bg-slate-800/70`
- 191: `bg-slate-50` `hover:bg-slate-100`
- 198: `text-amber-300` `text-amber-800`
- 199: `text-cyan-300` `text-cyan-700`
- 205: `bg-slate-700` `text-slate-300` `bg-slate-200` `text-slate-600`
- 212: `bg-amber-500/20` `text-amber-300` `bg-amber-100` `text-amber-800`
- 213: `bg-indigo-500/20` `text-indigo-300` `bg-indigo-50` `text-indigo-700`
- 219: `bg-amber-500/25` `text-amber-200` `bg-amber-200` `text-amber-900`
- 229: `bg-slate-950` `text-slate-300` `bg-slate-900` `text-slate-100`
- 241: `text-amber-400` `text-amber-700`
- 246: `text-amber-400/90` `text-amber-700`
- 262: `text-slate-400` `text-slate-500`

### src/components/OsiSimulatorDialog.tsx

- 466: `bg-black/60`
- 472: `bg-slate-900` `text-slate-100`
- 473: `bg-white` `text-slate-900`
- 480: `bg-slate-900` `bg-white`
- 487: `bg-purple-500/20` `text-purple-300`
- 488: `bg-purple-100` `text-purple-700`
- 505: `hover:bg-slate-500/20`
- 515: `bg-slate-900/95`
- 516: `bg-white/95`
- 528: `bg-purple-500` `text-white`
- 530: `hover:bg-slate-800`
- 531: `hover:bg-slate-100`
- 540: `bg-emerald-500` `text-white`
- 542: `hover:bg-slate-800`
- 543: `hover:bg-slate-100`
- 550: `bg-slate-500/30`
- 556: `bg-cyan-500/30` `hover:bg-cyan-500/50` `text-cyan-100`
- 557: `bg-cyan-100` `hover:bg-cyan-200` `text-cyan-900`
- 568: `hover:bg-slate-700`
- 569: `hover:bg-slate-100`
- 597: `bg-slate-900` `text-slate-100`
- 598: `bg-white` `text-slate-900`
- 614: `bg-slate-800/40` `bg-slate-50`
- 641: `bg-slate-900`
- 642: `bg-white`
- 682: `bg-cyan-500/10`
- 683: `bg-cyan-50`
- 703: `bg-slate-800/40` `bg-slate-50`
- 729: `bg-slate-700` `text-slate-100` `bg-slate-200` `text-slate-900`
- 821: `bg-blue-500/5`
- 822: `bg-blue-50`
- 827: `text-blue-300` `text-blue-700`
- 839: `bg-orange-500/5`
- 840: `bg-orange-50`
- 845: `text-orange-300` `text-orange-700`
- 871: `bg-slate-800` `text-slate-300`
- 872: `bg-slate-100` `text-slate-700`
- 921: `bg-slate-800` `bg-slate-100`
- 936: `bg-slate-800` `bg-slate-100`
- 955: `bg-slate-950` `text-green-400`
- 956: `bg-slate-900` `text-green-400`
- 969: `bg-violet-500/5` `text-violet-100`
- 970: `bg-violet-50` `text-violet-900`

### src/components/OspfWildcardDrillDialog.tsx

- 78: `bg-slate-900` `bg-white`
- 79: `text-white` `text-slate-900`
- 80: `text-slate-400` `text-slate-500`
- 81: `bg-slate-800/60` `bg-slate-50`
- 84: `bg-slate-950` `text-emerald-300`
- 85: `bg-slate-900` `text-emerald-300`
- 144: `bg-indigo-600` `text-white`
- 146: `text-slate-400` `hover:bg-slate-700` `hover:text-white`
- 147: `text-slate-600` `hover:bg-slate-100`
- 165: `bg-black/60`
- 177: `bg-indigo-500/20` `text-indigo-300` `bg-indigo-100` `text-indigo-600`
- 184: `bg-slate-800` `bg-slate-100`
- 192: `text-slate-400` `hover:bg-slate-700` `text-slate-500` `hover:bg-slate-100`
- 203: `text-emerald-500`
- 205: `text-orange-500`
- 206: `text-violet-500`
- 217: `bg-slate-950/60` `bg-white`
- 218: `text-indigo-400`
- 234: `bg-emerald-500/10`
- 235: `bg-rose-500/10`
- 236: `bg-indigo-500/10`
- 254: `bg-emerald-500/10` `text-emerald-300` `bg-emerald-50` `text-emerald-700`
- 255: `bg-rose-500/10` `text-rose-300` `bg-rose-50` `text-rose-700`
- 279: `text-slate-500`
- 298: `bg-emerald-500/10` `text-emerald-300` `bg-emerald-50` `text-emerald-700`
- 299: `bg-rose-500/10` `text-rose-300` `bg-rose-50` `text-rose-700`
- 309: `text-emerald-300` `text-emerald-700`
- 328: `bg-indigo-600` `text-white` `hover:bg-indigo-500`
- 336: `bg-indigo-600` `text-white` `hover:bg-indigo-500`

### src/components/RoutingDrillDialog.tsx

- 69: `bg-slate-900` `bg-white`
- 70: `text-white` `text-slate-900`
- 71: `text-slate-400` `text-slate-500`
- 72: `bg-slate-800/60` `bg-slate-50`
- 75: `bg-slate-950` `text-emerald-300`
- 76: `bg-slate-900` `text-emerald-300`
- 131: `bg-indigo-600` `text-white`
- 133: `text-slate-400` `hover:bg-slate-700` `hover:text-white`
- 134: `text-slate-600` `hover:bg-slate-100`
- 146: `bg-black/60`
- 158: `bg-indigo-500/20` `text-indigo-300` `bg-indigo-100` `text-indigo-600`
- 165: `bg-slate-800` `bg-slate-100`
- 172: `text-slate-400` `hover:bg-slate-700` `text-slate-500` `hover:bg-slate-100`
- 183: `text-emerald-500`
- 185: `text-orange-500`
- 186: `text-violet-500`
- 201: `text-slate-500`
- 219: `bg-emerald-500/10` `text-emerald-300` `bg-emerald-50` `text-emerald-700`
- 220: `bg-rose-500/10` `text-rose-300` `bg-rose-50` `text-rose-700`
- 230: `text-emerald-300` `text-emerald-700`
- 245: `bg-emerald-500/10`
- 246: `bg-rose-500/10`
- 247: `bg-indigo-500/10`
- 256: `text-indigo-400`
- 273: `bg-emerald-500/10` `text-emerald-300` `bg-emerald-50` `text-emerald-700`
- 274: `bg-rose-500/10` `text-rose-300` `bg-rose-50` `text-rose-700`
- 296: `bg-indigo-600` `text-white` `hover:bg-indigo-500`
- 304: `bg-indigo-600` `text-white` `hover:bg-indigo-500`

### src/components/AnnotationLayer.tsx

- 191: `bg-slate-900/95`
- 192: `bg-white/95`
- 196: `text-slate-400` `text-slate-500`
- 208: `hover:bg-slate-800`
- 209: `hover:bg-slate-100`
- 224: `bg-slate-700` `bg-slate-300`
- 228: `text-slate-400` `text-slate-500`
- 235: `bg-emerald-500/20` `text-emerald-400`
- 237: `hover:bg-slate-800` `text-slate-500`
- 238: `hover:bg-slate-100`
- 246: `bg-slate-700` `bg-slate-300`
- 251: `hover:bg-slate-800` `text-slate-400` `hover:bg-slate-100` `text-slate-500`
- 306: `bg-slate-900`
- 307: `bg-white`
- 317: `text-white`
- 323: `text-slate-200` `text-slate-700`
- 328: `text-slate-500` `text-slate-400`
- 341: `text-emerald-400` `text-slate-500` `hover:text-emerald-400` `text-slate-400` `hover:text-emerald-500`
- 353: `text-slate-500` `hover:text-red-400` `text-slate-400` `hover:text-red-500`
- 370: `bg-slate-800` `text-slate-200`
- 371: `bg-slate-50` `text-slate-700`
- 378: `text-slate-500` `text-slate-400`
- 395: `text-white`
- 403: `text-slate-300` `text-slate-600`
- 408: `text-slate-600` `text-slate-400`
- 420: `text-slate-400` `text-slate-600`
- 448: `bg-slate-800` `text-slate-200`
- 449: `bg-slate-50` `text-slate-700`
- 455: `bg-blue-500` `text-white` `hover:bg-blue-600`

### src/components/navigation/MobileNavDrawer.tsx

- 143: `bg-black/60`
- 225: `text-indigo-400`
- 236: `text-emerald-400`
- 270: `text-sky-400`
- 279: `bg-sky-500/10` `text-sky-400` `hover:bg-sky-500/20`
- 282: `text-sky-400`
- 285: `bg-sky-500/20` `text-sky-300`
- 299: `text-indigo-400`
- 302: `bg-indigo-500/20` `text-indigo-300`
- 315: `text-amber-400`
- 326: `text-rose-400`
- 334: `text-teal-400`
- 346: `text-sky-400`
- 359: `text-emerald-400`
- 372: `text-purple-400`
- 385: `text-amber-400`
- 404: `text-cyan-400`
- 425: `text-emerald-400`
- 448: `text-teal-400`
- 457: `bg-teal-400`
- 468: `text-violet-400`
- 471: `bg-violet-500/20` `text-violet-700` `dark:text-violet-300`
- 480: `bg-violet-500/10` `hover:bg-violet-500/20`
- 483: `text-violet-400`
- 493: `text-violet-400`
- 501: `text-amber-400`
- 511: `text-amber-400`
- 523: `text-sky-400`
- 535: `text-emerald-400`
- 547: `text-indigo-400`
- 559: `text-cyan-400`
- 571: `text-teal-400`
- 583: `text-emerald-400`
- 595: `text-indigo-400`
- 607: `text-yellow-400`
- 619: `text-amber-400`
- 631: `text-violet-400`
- 643: `text-rose-400`
- 656: `text-amber-400`
- 659: `bg-amber-400`
- 687: `text-sky-400`
- 713: `text-blue-400`
- 730: `text-cyan-400`
- 749: `text-teal-400`
- 758: `bg-teal-400`
- 778: `text-pink-400`
- 787: `bg-pink-400`
- 807: `text-purple-400`
- 833: `text-cyan-400`

### src/components/ShapePropertiesPanel.tsx

- 171: `bg-slate-800`
- 172: `bg-white`
- 190: `bg-slate-800`
- 191: `bg-white`
- 207: `bg-slate-800`
- 208: `bg-white`
- 223: `bg-slate-800`
- 224: `bg-white`
- 231: `bg-slate-800`
- 268: `bg-slate-800`
- 269: `bg-white`
- 284: `bg-slate-800`
- 285: `bg-white`
- 303: `bg-slate-900/95`
- 304: `bg-white/95`
- 312: `bg-slate-800/50`
- 313: `bg-slate-50`
- 325: `text-white` `text-slate-900`
- 333: `text-slate-400` `text-slate-500`
- 344: `bg-amber-500/20` `text-amber-400`
- 355: `hover:bg-slate-700` `hover:bg-slate-200`
- 412: `text-red-500` `hover:bg-red-500/10`
- 428: `text-slate-400` `text-slate-500`
- 462: `bg-slate-800`
- 468: `text-slate-400` `text-slate-500`
- 504: `bg-slate-800`
- 505: `bg-white`
- 512: `bg-slate-800`
- 528: `hover:bg-slate-700`
- 542: `hover:bg-slate-700`
- 580: `bg-slate-700`
- 589: `text-slate-300` `text-slate-700`
- 611: `text-slate-400`
- 612: `text-slate-600`
- 617: `text-red-500`
- 626: `text-slate-500`
- 627: `text-slate-400`
- 643: `bg-slate-700`
- 648: `text-slate-400` `text-slate-500`
- 671: `text-slate-400`
- 672: `text-slate-500`
- 696: `text-slate-400`
- 697: `text-slate-500`
- 713: `text-slate-500` `text-slate-400`
- 716: `hover:text-slate-300`
- 719: `bg-slate-800/50`

### src/components/ConnectionPropertiesPanel.tsx

- 85: `bg-slate-900/95`
- 86: `bg-white/95`
- 94: `bg-slate-800/50`
- 95: `bg-slate-50`
- 103: `text-green-500`
- 105: `text-red-500`
- 106: `text-slate-500`
- 113: `text-white` `text-slate-900`
- 121: `text-slate-400` `text-slate-500`
- 134: `hover:bg-slate-700` `hover:bg-slate-200`
- 158: `text-slate-500` `text-slate-400`
- 167: `text-blue-500` `text-slate-400`
- 177: `text-slate-500` `text-slate-400`
- 195: `text-amber-500`
- 201: `text-blue-400`
- 207: `text-blue-400`
- 220: `text-blue-400`
- 226: `text-blue-400`
- 256: `bg-slate-800`
- 257: `bg-white`
- 264: `bg-slate-800`
- 297: `bg-slate-800`
- 298: `bg-white`
- 305: `bg-slate-800`
- 335: `bg-slate-800`
- 336: `bg-white`
- 353: `bg-slate-800`
- 354: `bg-white`
- 371: `bg-slate-800`
- 372: `bg-white`
- 392: `bg-slate-800`
- 393: `bg-white`
- 400: `bg-slate-800`
- 405: `bg-blue-500`
- 412: `bg-orange-500`
- 420: `bg-yellow-500`
- 426: `bg-red-500`
- 432: `bg-cyan-500`
- 438: `bg-purple-500`
- 446: `bg-slate-700`
- 501: `bg-slate-800`
- 502: `bg-white`
- 520: `bg-slate-700`
- 525: `text-red-500` `hover:bg-red-500/10`

### src/components/PingScenarioDialog.tsx

- 125: `bg-slate-900` `text-white`
- 128: `text-cyan-400`
- 136: `text-slate-400`
- 138: `bg-slate-800`
- 141: `bg-slate-800`
- 151: `text-slate-500`
- 153: `text-slate-400`
- 155: `bg-slate-800`
- 158: `bg-slate-800`
- 171: `bg-cyan-600` `hover:bg-cyan-500` `text-white`
- 213: `bg-slate-800`
- 225: `bg-slate-800`
- 235: `text-slate-400`
- 245: `text-slate-400`
- 260: `bg-red-500/10`
- 261: `text-red-400`
- 263: `text-red-300`
- 264: `text-red-200/70`
- 273: `bg-emerald-500/10`
- 277: `text-emerald-400`
- 280: `text-emerald-300`
- 284: `text-emerald-200/70`
- 293: `bg-red-500/10`
- 294: `text-red-400`
- 296: `text-red-300`
- 299: `text-red-200/70`
- 339: `bg-red-500`
- 341: `bg-emerald-500`
- 342: `bg-slate-700`
- 349: `bg-cyan-500/10` `text-cyan-300`
- 351: `bg-emerald-500/10` `text-emerald-300`
- 353: `bg-red-500/10` `text-red-300`
- 354: `bg-slate-800` `text-slate-400`
- 383: `bg-cyan-500/5`
- 384: `bg-red-500/10`
- 388: `text-white`
- 390: `text-slate-400`
- 397: `text-emerald-400`
- 400: `text-red-400`
- 414: `text-slate-300` `text-red-200`
- 427: `bg-slate-800/50`
- 428: `text-slate-500`
- 429: `text-slate-200`

### src/components/PacketFlowVisualizer.tsx

- 49: `bg-slate-900` `bg-white`
- 51: `text-white` `text-slate-900`
- 52: `text-slate-400` `text-slate-500`
- 53: `bg-slate-800/50` `bg-slate-50`
- 54: `bg-slate-800` `bg-slate-50`
- 145: `text-green-400`
- 147: `text-red-400`
- 148: `text-amber-400`
- 149: `text-blue-400`
- 152: `bg-slate-600` `bg-slate-300`
- 158: `text-emerald-400`
- 159: `text-blue-400`
- 160: `text-purple-400`
- 161: `text-amber-400`
- 172: `text-cyan-400`
- 186: `text-cyan-400`
- 194: `hover:bg-slate-700/30`
- 201: `hover:bg-slate-700/30`
- 256: `bg-red-500/20` `text-red-300` `hover:bg-red-500/30`
- 264: `bg-cyan-500/20` `text-cyan-300` `hover:bg-cyan-500/30`
- 272: `bg-indigo-500/20` `text-indigo-300` `hover:bg-slate-700/30`
- 387: `hover:bg-slate-800/30`
- 392: `text-green-400`
- 398: `text-red-400`
- 415: `bg-green-500/10` `text-green-400` `bg-red-500/10` `text-red-400`
- 433: `bg-cyan-500/10`
- 443: `bg-slate-700`
- 445: `bg-slate-700`
- 455: `bg-slate-700/50`
- 469: `text-amber-400`
- 485: `hover:bg-cyan-500/20` `text-cyan-400` `text-cyan-600`
- 502: `text-red-400`
- 527: `hover:text-red-400`

### src/components/ProgressTracker.tsx

- 53: `bg-slate-900` `bg-white`
- 55: `text-white` `text-slate-900`
- 56: `text-slate-400` `text-slate-500`
- 57: `bg-slate-800/50` `bg-slate-50`
- 237: `text-indigo-400`
- 242: `hover:bg-slate-700/30`
- 257: `text-indigo-400`
- 262: `bg-slate-800` `bg-slate-200`
- 265: `from-indigo-500` `to-purple-500`
- 306: `bg-indigo-500/10`
- 307: `bg-indigo-50`
- 309: `hover:bg-slate-800/30`
- 317: `bg-green-500/20`
- 319: `bg-indigo-500/20`
- 321: `bg-slate-800`
- 322: `bg-slate-100`
- 328: `text-green-400`
- 332: `bg-indigo-500`
- 345: `text-green-400`
- 347: `text-indigo-300`
- 356: `text-green-400`
- 393: `bg-indigo-500/20` `text-indigo-300` `hover:bg-indigo-500/30`
- 403: `bg-green-500/20` `text-green-300` `hover:bg-green-500/30`
- 430: `bg-indigo-500/20` `text-indigo-300` `hover:bg-indigo-500/30`
- 441: `bg-amber-500/20` `text-amber-300`
- 442: `hover:text-amber-300`
- 482: `text-green-400`
- 485: `text-red-400`
- 496: `text-green-400`
- 498: `text-red-300`
- 534: `text-amber-400`
- 539: `text-green-400`
- 540: `text-red-400`
- 558: `text-amber-400`
- 569: `from-indigo-500` `to-purple-500` `text-white`

### src/components/navigation/AppHeader.tsx

- 330: `text-sky-500`
- 353: `text-teal-500`
- 374: `text-violet-400`
- 376: `bg-violet-500/15` `text-violet-700` `dark:text-violet-300`
- 397: `text-amber-500`
- 642: `text-indigo-400`
- 673: `text-sky-500`
- 679: `bg-sky-500/15` `text-sky-400`
- 694: `text-indigo-500`
- 700: `bg-indigo-500/15` `text-indigo-400`
- 720: `text-amber-500`
- 735: `text-rose-500`
- 766: `text-sky-400`
- 783: `text-emerald-400`
- 800: `text-purple-400`
- 817: `text-amber-400`
- 840: `text-cyan-400`
- 871: `text-emerald-400`
- 881: `bg-emerald-400`
- 901: `text-teal-400`
- 913: `bg-teal-400`
- 943: `text-amber-400`
- 956: `text-sky-400`
- 969: `text-emerald-400`
- 982: `text-indigo-400`
- 995: `text-cyan-400`
- 1014: `text-amber-400`
- 1027: `text-violet-400`
- 1040: `text-rose-400`
- 1062: `text-teal-400`
- 1076: `text-emerald-400`
- 1085: `bg-emerald-400`
- 1095: `text-indigo-400`
- 1108: `text-yellow-400`
- 1122: `text-amber-400`
- 1125: `bg-amber-400`
- 1149: `text-sky-400`
- 1179: `text-blue-400`
- 1200: `text-cyan-400`
- 1223: `text-teal-400`
- 1232: `bg-teal-400`
- 1253: `text-pink-400`
- 1262: `bg-pink-400`
- 1283: `text-purple-400`
- 1310: `text-cyan-400`

### src/App.tsx

- 1410: `bg-slate-900` `text-white`
- 1632: `bg-slate-900/90`
- 1637: `bg-slate-700` `text-white`
- 1646: `text-slate-400` `hover:text-indigo-300`
- 1671: `bg-slate-900/80`
- 1678: `bg-cyan-500/30` `text-cyan-200`
- 1679: `text-slate-400` `hover:text-cyan-300` `hover:bg-cyan-500/10`
- 1688: `bg-cyan-500/30` `text-cyan-200`
- 1689: `text-slate-400` `hover:text-cyan-300` `hover:bg-cyan-500/10`
- 1700: `bg-cyan-600/90` `hover:bg-cyan-500` `text-white`
- 1750: `bg-slate-900/80` `bg-white/80`
- 1755: `text-slate-500` `text-slate-400`
- 1762: `text-slate-300` `text-slate-600`
- 1774: `bg-indigo-500/20` `text-indigo-300` `hover:bg-indigo-500/30`
- 1775: `bg-indigo-50` `text-indigo-700` `hover:bg-indigo-100`
- 1784: `bg-slate-800` `text-slate-300` `hover:bg-slate-700`
- 1785: `bg-slate-50` `text-slate-700` `hover:bg-slate-100`
- 1794: `bg-slate-800` `text-slate-300` `hover:bg-slate-700`
- 1795: `bg-slate-50` `text-slate-700` `hover:bg-slate-100`
- 2100: `bg-black/70`
- 2137: `bg-black/70`

### src/components/LearningPathEditor.tsx

- 103: `bg-slate-900` `bg-white`
- 105: `text-white` `text-slate-900`
- 106: `text-slate-400` `text-slate-500`
- 107: `bg-slate-800` `bg-slate-50`
- 108: `bg-slate-800/50` `bg-slate-50`
- 253: `bg-black/50`
- 266: `bg-indigo-500/20`
- 267: `text-indigo-400`
- 279: `text-red-400`
- 288: `bg-indigo-500` `text-white` `hover:bg-indigo-600`
- 294: `hover:bg-slate-700/50`
- 318: `bg-indigo-500/20` `text-indigo-300`
- 319: `hover:bg-slate-700/30`
- 322: `bg-slate-700/50`
- 342: `hover:bg-slate-700/30`
- 394: `hover:text-indigo-400`
- 526: `hover:text-red-400`
- 546: `bg-indigo-500/20` `text-indigo-300` `hover:bg-indigo-500/30`
- 604: `hover:bg-slate-700/30`
- 611: `hover:bg-slate-700/30`
- 618: `text-red-400` `hover:bg-red-500/10`
- 635: `bg-indigo-500/20` `text-indigo-300`
- 636: `hover:bg-slate-700/30`
- 678: `text-amber-400`
- 684: `hover:text-indigo-400`
- 700: `bg-amber-500/20` `text-amber-400`
- 720: `text-red-400` `hover:text-red-300`
- 737: `text-green-400`
- 742: `hover:text-indigo-400`
- 819: `text-red-400` `hover:text-red-300`

### src/components/AuthDialog.tsx

- 24: `bg-zinc-900` `text-zinc-100`
- 25: `bg-white` `text-zinc-900`
- 29: `bg-zinc-800` `text-zinc-100`
- 30: `bg-white` `text-zinc-900`
- 68: `bg-black/60`
- 77: `hover:bg-zinc-700` `hover:bg-zinc-100`
- 94: `text-sky-400`
- 95: `text-sky-600`
- 97: `text-zinc-500` `hover:text-zinc-300`
- 98: `text-zinc-400` `hover:text-zinc-600`
- 110: `text-zinc-400` `text-zinc-500`
- 127: `text-zinc-400` `text-zinc-500`
- 134: `text-zinc-500` `hover:text-sky-400` `text-zinc-400` `hover:text-sky-600`
- 153: `bg-red-900/30` `text-red-300` `bg-red-50` `text-red-600`
- 159: `bg-green-900/30` `text-green-300` `bg-green-50` `text-green-700`
- 167: `bg-sky-600` `text-white` `hover:bg-sky-500`
- 176: `text-zinc-500` `hover:text-zinc-300` `text-zinc-400` `hover:text-zinc-600`
- 181: `text-zinc-500` `text-zinc-400`

### src/components/DragDropTrainerDialog.tsx

- 42: `bg-slate-900` `bg-white`
- 43: `text-slate-200` `text-slate-800`
- 44: `text-slate-400` `text-slate-500`
- 46: `bg-slate-800` `text-slate-200`
- 47: `bg-white` `text-slate-700`
- 48: `bg-slate-800/50` `bg-slate-50`
- 118: `bg-black/60`
- 121: `bg-slate-800/50` `bg-slate-50`
- 137: `bg-slate-950` `text-slate-200`
- 166: `text-green-500`
- 168: `text-red-500`
- 207: `bg-green-500/10` `text-green-600` `dark:text-green-400`
- 208: `bg-red-500/10` `text-red-600` `dark:text-red-400`
- 228: `bg-green-500/10` `text-green-600` `dark:text-green-400`
- 229: `bg-amber-500/10` `text-amber-700` `dark:text-amber-300`
- 235: `text-slate-300` `text-slate-600`
- 262: `bg-indigo-500` `text-white` `hover:bg-indigo-600` `disabled:bg-slate-300` `disabled:text-slate-500` `dark:disabled:bg-slate-700` `dark:disabled:text-slate-400`

### src/components/TopologieExplorerDialog.tsx

- 345: `bg-black/60`
- 350: `bg-slate-900` `text-slate-100` `bg-white` `text-slate-900`
- 356: `bg-slate-900` `bg-white`
- 367: `hover:bg-slate-500/20`
- 388: `bg-cyan-500/20` `text-cyan-100`
- 389: `bg-cyan-50` `text-cyan-900`
- 391: `hover:bg-slate-800`
- 392: `hover:bg-slate-50`
- 406: `bg-slate-800/40` `bg-slate-50`
- 415: `bg-emerald-500/30` `bg-emerald-100`
- 416: `hover:bg-slate-700` `hover:bg-slate-100`
- 427: `bg-red-500/30` `text-red-100`
- 428: `hover:bg-slate-700` `hover:bg-slate-100`
- 436: `text-red-300` `text-red-600`
- 445: `bg-emerald-500/5` `bg-emerald-50`
- 447: `text-emerald-200` `text-emerald-800`
- 453: `text-emerald-400` `text-emerald-600`
- 460: `bg-amber-500/5` `bg-amber-50`
- 462: `text-amber-200` `text-amber-800`
- 468: `text-amber-400` `text-amber-600`
- 478: `bg-slate-800/40` `bg-slate-50`

### src/components/PrioritizedLearningDialog.tsx

- 111: `bg-slate-900` `bg-white`
- 113: `text-white` `text-slate-900`
- 114: `text-slate-400` `text-slate-500`
- 115: `bg-slate-800/50` `bg-slate-50`
- 222: `bg-black/60`
- 233: `text-indigo-500`
- 243: `hover:bg-slate-700/50`
- 254: `text-indigo-500`
- 259: `text-orange-500`
- 280: `bg-indigo-500/15` `text-indigo-300`
- 281: `bg-indigo-50` `text-indigo-700`
- 283: `text-slate-500`
- 284: `text-slate-400`
- 304: `bg-indigo-500/20` `text-indigo-300`
- 305: `bg-indigo-50` `text-indigo-700`
- 306: `hover:bg-slate-700/20`
- 316: `bg-indigo-500/20` `text-indigo-300`
- 317: `bg-indigo-50` `text-indigo-700`
- 318: `hover:bg-slate-700/20`
- 342: `bg-indigo-500/10` `text-indigo-500` `hover:bg-indigo-500/20`
- 352: `bg-orange-500/10` `text-orange-500` `hover:bg-orange-500/20`
- 368: `text-slate-600` `hover:text-slate-400` `text-slate-400` `hover:text-slate-600`

### src/components/ShapePicker.tsx

- 76: `bg-slate-800/50` `hover:bg-slate-700/50`
- 77: `bg-white` `hover:bg-slate-50`
- 90: `text-slate-400` `text-slate-600`
- 99: `bg-slate-800`
- 105: `text-slate-400` `text-slate-500`
- 120: `bg-slate-900`
- 121: `bg-white`
- 134: `text-white` `text-slate-900`
- 146: `text-slate-400` `hover:text-white` `hover:bg-slate-800`
- 147: `text-slate-600` `hover:text-slate-900`
- 160: `text-slate-500` `text-slate-400`
- 171: `bg-slate-800/50` `text-slate-200` `placeholder:text-slate-500`
- 193: `text-white`
- 195: `text-slate-400` `hover:text-white` `hover:bg-slate-800`
- 196: `text-slate-600` `hover:text-slate-900` `hover:bg-slate-100`
- 213: `bg-slate-800`
- 230: `text-slate-500` `text-slate-400`
- 255: `text-slate-500` `text-slate-400`
- 268: `text-slate-500` `bg-slate-800/30`
- 269: `text-slate-400` `bg-slate-50`

### src/components/labs/LabAddressingTable.tsx

- 34: `bg-white` `text-slate-800`
- 35: `bg-slate-900/90` `text-slate-200`
- 43: `bg-slate-100/80` `text-slate-700`
- 44: `bg-slate-950/80` `text-slate-300`
- 48: `bg-cyan-400`
- 53: `text-slate-400`
- 65: `bg-slate-50` `text-slate-600`
- 66: `bg-slate-950/40` `text-slate-400`
- 91: `bg-sky-100/90` `text-sky-950`
- 92: `bg-sky-950/50` `text-sky-200`
- 94: `hover:bg-slate-100/70`
- 95: `hover:bg-slate-800/40`
- 104: `bg-sky-500/20` `text-sky-400`
- 105: `text-slate-200`
- 111: `text-cyan-400`
- 114: `text-emerald-400`
- 117: `text-slate-400`
- 120: `text-slate-400`
- 123: `text-slate-300`
- 125: `bg-slate-800` `text-indigo-300`
- 143: `bg-amber-50` `text-amber-900` `bg-amber-950/20` `text-amber-200`

### src/components/AccountDialog.tsx

- 31: `bg-zinc-900` `text-zinc-100`
- 32: `bg-white` `text-zinc-900`
- 36: `bg-zinc-800` `text-zinc-100`
- 37: `bg-white` `text-zinc-900`
- 39: `text-zinc-500` `text-zinc-400`
- 40: `bg-zinc-700` `bg-zinc-100`
- 112: `bg-black/60`
- 119: `hover:bg-zinc-700` `hover:bg-zinc-100`
- 132: `bg-emerald-700` `text-white` `bg-emerald-100` `text-emerald-700`
- 144: `text-zinc-400` `text-zinc-500`
- 160: `bg-sky-600` `text-white` `hover:bg-sky-500`
- 198: `bg-zinc-800` `bg-zinc-100`
- 200: `from-indigo-500` `to-sky-500`
- 216: `text-red-300` `hover:bg-red-900/30` `text-red-600` `hover:bg-red-50`

### src/components/markdown-render.tsx

- 10: `text-white` `text-slate-900`
- 17: `text-slate-100` `text-slate-800`
- 24: `text-slate-300` `text-slate-700`
- 31: `text-slate-300` `text-slate-600`
- 38: `text-white` `text-slate-900`
- 46: `text-slate-300` `text-slate-600`
- 53: `text-slate-300` `text-slate-600`
- 63: `bg-slate-900` `text-slate-200` `bg-slate-100` `text-slate-800`
- 69: `bg-slate-700` `text-indigo-300` `bg-slate-100` `text-indigo-700`
- 77: `bg-slate-900` `bg-slate-100`
- 84: `text-slate-400` `text-slate-500`
- 95: `bg-slate-700` `bg-slate-100`
- 101: `text-slate-200` `text-slate-700`
- 108: `text-slate-300` `text-slate-600`

### src/components/OnboardingTour.tsx

- 23: `text-indigo-400`
- 32: `text-slate-400`
- 40: `text-cyan-400`
- 48: `text-slate-300`
- 59: `bg-cyan-500/30` `text-cyan-200`
- 70: `text-slate-300`
- 81: `text-emerald-400`
- 91: `text-slate-400`
- 93: `bg-slate-700/50`
- 145: `bg-slate-950/80`
- 146: `bg-slate-900`
- 150: `text-slate-400` `hover:text-white` `hover:bg-slate-800`
- 157: `text-white`
- 160: `text-slate-200`
- 165: `bg-cyan-500/10` `text-cyan-200`
- 177: `bg-cyan-400`
- 179: `bg-cyan-400/50`
- 180: `bg-slate-700`
- 192: `text-slate-400` `hover:text-white`
- 202: `bg-slate-800` `text-slate-200`
- 210: `bg-cyan-600` `hover:bg-cyan-500` `text-white`
- 217: `bg-cyan-600` `hover:bg-cyan-500` `text-white`

### src/components/IPv4SubnetTableDialog.tsx

- 24: `bg-zinc-900` `text-zinc-100`
- 25: `bg-white` `text-zinc-900`
- 26: `bg-zinc-800` `text-zinc-300` `bg-zinc-100` `text-zinc-600`
- 28: `text-zinc-500` `text-zinc-400`
- 40: `bg-sky-500/20` `text-sky-300`
- 41: `bg-sky-100` `text-sky-700`
- 43: `text-zinc-400` `hover:text-zinc-200` `hover:bg-zinc-800`
- 44: `text-zinc-500` `hover:text-zinc-700` `hover:bg-zinc-100`
- 57: `bg-black/50`
- 69: `hover:bg-zinc-700` `hover:bg-zinc-100`
- 99: `text-sky-400` `text-sky-600`
- 134: `text-sky-400` `text-sky-600`
- 161: `bg-sky-500/10` `text-sky-300`
- 162: `bg-sky-50` `text-sky-700`

### src/components/SimulationControls.tsx

- 116: `text-green-500`
- 118: `text-amber-500`
- 120: `text-red-500`
- 122: `text-blue-500`
- 133: `bg-slate-900/95`
- 134: `bg-white/95`
- 166: `text-green-500` `hover:text-green-400`
- 176: `text-red-500` `hover:text-red-400`
- 198: `text-slate-400` `text-slate-500`
- 212: `bg-slate-700` `bg-slate-200`
- 222: `bg-slate-800`
- 229: `bg-slate-800`
- 242: `text-slate-500` `text-slate-400`
- 249: `bg-slate-800`
- 256: `bg-slate-800`
- 271: `bg-slate-800`
- 278: `bg-slate-800`
- 311: `bg-slate-700` `bg-slate-200`
- 327: `bg-slate-800/50` `bg-slate-100`
- 338: `text-slate-400` `text-slate-500`
- 345: `text-slate-200` `text-slate-700`

### src/lib/types.ts

- 739: `from-sky-500` `to-blue-600`
- 748: `from-indigo-500` `to-purple-600`
- 757: `from-blue-500` `to-cyan-500`
- 766: `from-orange-500` `to-yellow-500`
- 775: `from-yellow-500` `to-orange-500`
- 784: `from-blue-400` `to-blue-600`
- 793: `from-blue-600` `to-indigo-600`
- 802: `from-emerald-500` `to-teal-500`
- 811: `from-red-500` `to-pink-500`
- 820: `from-blue-500` `to-yellow-500`
- 829: `from-violet-500` `to-purple-600`
- 838: `from-sky-500` `to-blue-600`
- 847: `from-amber-500` `to-orange-500`
- 857: `from-sky-700` `to-blue-800`
- 866: `from-red-600` `to-red-800`

### src/components/MetricsDashboard.tsx

- 175: `bg-slate-900` `bg-white`
- 177: `text-white` `text-slate-900`
- 178: `text-slate-400` `text-slate-500`
- 179: `bg-slate-800/50` `bg-slate-50`
- 264: `bg-black/50`
- 275: `bg-purple-500/20`
- 276: `text-purple-400`
- 290: `bg-green-500/20` `text-green-300`
- 291: `hover:text-white`
- 302: `hover:bg-slate-700/50`
- 372: `bg-indigo-500/10`
- 373: `bg-indigo-50`
- 374: `hover:bg-slate-800/30`
- 380: `bg-green-500`
- 382: `bg-red-500`
- 384: `bg-slate-500`
- 385: `bg-amber-500`
- 415: `bg-green-500`
- 417: `bg-red-500`
- 418: `bg-slate-500`
- 548: `bg-slate-800/50` `bg-slate-50`
- 551: `text-slate-500` `text-slate-400`

### src/components/TerminalEmulator.tsx

- 998: `bg-slate-950`
- 999: `bg-slate-900`
- 1003: `bg-slate-800`
- 1005: `text-green-500`
- 1006: `text-white`
- 1013: `bg-green-500`
- 1014: `bg-slate-500`
- 1015: `bg-red-500`
- 1025: `text-slate-400` `hover:text-white`
- 1039: `text-slate-400` `hover:text-white`
- 1048: `text-slate-400` `hover:text-white`
- 1057: `text-green-400`
- 1060: `text-slate-500`
- 1070: `text-cyan-400`
- 1071: `text-slate-500`
- 1072: `text-blue-400`
- 1073: `text-slate-500`
- 1074: `text-white`
- 1081: `text-slate-300` `text-red-400`
- 1093: `bg-slate-900`
- 1094: `text-cyan-400`
- 1095: `text-slate-500`
- 1096: `text-blue-400`
- 1097: `text-slate-500`
- 1103: `text-white`

### src/components/HintPanel.tsx

- 21: `bg-slate-900` `bg-white`
- 23: `text-white` `text-slate-900`
- 24: `text-slate-400` `text-slate-500`
- 25: `bg-slate-800/50` `bg-slate-50`
- 48: `bg-green-500/10`
- 50: `text-green-400`
- 54: `bg-amber-500/10`
- 56: `text-amber-400`
- 60: `bg-red-500/10`
- 62: `text-red-400`
- 71: `text-amber-400`
- 90: `text-amber-400`
- 100: `text-red-400`
- 104: `hover:bg-slate-700/30`
- 139: `bg-slate-700`
- 140: `bg-slate-200`
- 168: `text-amber-400`
- 178: `bg-amber-500/20` `text-amber-300` `hover:bg-amber-500/30`
- 184: `hover:bg-slate-700/30`
- 196: `hover:text-amber-400`
- 197: `text-slate-600`

### src/components/SetPasswordDialog.tsx

- 19: `bg-zinc-900` `text-zinc-100`
- 20: `bg-white` `text-zinc-900`
- 24: `bg-zinc-800` `text-zinc-100`
- 25: `bg-white` `text-zinc-900`
- 48: `bg-black/50`
- 54: `hover:bg-zinc-700` `hover:bg-zinc-100`
- 62: `bg-green-900/30` `text-green-300` `bg-green-50` `text-green-700`
- 68: `text-zinc-400` `text-zinc-500`
- 84: `text-zinc-400` `text-zinc-500`
- 99: `bg-red-900/30` `text-red-300` `bg-red-50` `text-red-600`
- 107: `bg-sky-600` `text-white` `hover:bg-sky-500`

### src/components/SelectionToolbar.tsx

- 63: `bg-slate-900/95`
- 64: `bg-white/95`
- 78: `text-red-500` `hover:text-red-400` `hover:bg-red-500/10`
- 92: `hover:bg-slate-700` `hover:bg-slate-100`
- 106: `hover:bg-slate-700` `hover:bg-slate-100`
- 117: `bg-slate-700` `bg-slate-200`
- 128: `hover:bg-slate-700` `hover:bg-slate-100`
- 141: `hover:bg-slate-700` `hover:bg-slate-100`
- 152: `bg-slate-700` `bg-slate-200`
- 163: `text-amber-500`
- 164: `hover:bg-slate-700` `hover:bg-slate-100`
- 179: `hover:bg-slate-700` `hover:bg-slate-100`
- 195: `hover:bg-slate-700` `hover:bg-slate-100`
- 202: `bg-slate-800`

### src/components/CostCalculator.tsx

- 26: `bg-slate-900` `bg-white`
- 28: `text-white` `text-slate-900`
- 29: `text-slate-400` `text-slate-500`
- 30: `bg-slate-800/50` `bg-slate-50`
- 31: `bg-slate-800` `bg-slate-50`
- 135: `text-amber-400`
- 136: `text-blue-400`
- 137: `text-red-400`
- 138: `text-slate-400`
- 161: `bg-black/50`
- 172: `bg-green-500/20`
- 173: `text-green-400`
- 187: `hover:text-indigo-400`
- 194: `hover:bg-slate-700/50`
- 246: `bg-slate-700/50`
- 271: `text-red-400` `hover:bg-red-500/10`
- 365: `hover:text-white` `hover:bg-slate-700/50`

### src/components/TopologyValidator.tsx

- 69: `text-red-500`
- 71: `text-amber-500`
- 72: `text-blue-500`
- 84: `bg-slate-800/40` `hover:bg-slate-800`
- 85: `bg-slate-50` `hover:bg-slate-100`
- 94: `text-slate-200` `text-slate-800`
- 108: `text-slate-400` `text-slate-600`
- 124: `bg-slate-900`
- 131: `text-white`
- 137: `bg-amber-500` `hover:bg-amber-600`
- 144: `text-slate-400`
- 152: `text-emerald-500`
- 156: `text-slate-100` `text-slate-800`
- 164: `text-slate-400` `text-slate-600`
- 178: `text-red-500`
- 193: `text-amber-500`
- 208: `text-blue-500`

### src/components/labs/ProfessionalTopologyDiagram.tsx

- 35: `bg-indigo-500/15` `text-indigo-300`
- 42: `bg-blue-500/15` `text-blue-300`
- 49: `bg-amber-500/15` `text-amber-300`
- 56: `bg-emerald-500/15` `text-emerald-300`
- 63: `bg-violet-500/15` `text-violet-300`
- 70: `bg-rose-500/15` `text-rose-300`
- 77: `bg-slate-500/15` `text-slate-300`
- 103: `bg-slate-50/80` `text-slate-900`
- 104: `bg-slate-950/90` `text-slate-100`
- 592: `bg-slate-100/90` `text-slate-700`
- 593: `bg-slate-900/90` `text-slate-300`
- 596: `text-slate-400`

### src/components/PDUInspector.tsx

- 22: `bg-slate-600`
- 23: `bg-blue-600`
- 24: `bg-green-600`
- 25: `bg-orange-600`
- 26: `bg-red-600`
- 90: `bg-slate-900` `text-slate-100`
- 91: `bg-white` `text-slate-900`
- 127: `bg-slate-800` `bg-slate-50`
- 130: `text-blue-500`
- 132: `text-green-500`
- 147: `text-white`
- 148: `bg-slate-600`
- 167: `bg-slate-800/50` `bg-slate-50`
- 205: `bg-slate-800/30` `bg-slate-50/50`

### src/components/KeyboardShortcutsDialog.tsx

- 84: `bg-slate-900`
- 88: `text-white`
- 99: `text-slate-300` `text-slate-700`
- 113: `text-slate-400` `text-slate-600`
- 125: `bg-slate-800` `text-slate-300`
- 126: `bg-slate-100` `text-slate-700`
- 136: `text-slate-500`
- 137: `text-slate-400`
- 157: `text-slate-500`
- 158: `text-slate-400`
- 165: `bg-slate-800` `bg-slate-100`

### src/components/PresentationsDialog.tsx

- 49: `bg-slate-900`
- 51: `text-white`
- 52: `from-indigo-500` `to-purple-600`
- 53: `text-white`
- 57: `text-slate-400`
- 66: `text-slate-600`
- 67: `text-slate-400`
- 79: `bg-slate-800/50`
- 89: `text-white`
- 96: `text-white`
- 99: `text-slate-400`
- 126: `text-slate-400` `hover:text-red-400` `hover:bg-red-500/20`

### src/components/CanvasContextMenu.tsx

- 306: `bg-slate-900`
- 307: `bg-white`
- 319: `bg-slate-700` `bg-slate-200`
- 340: `text-red-400` `hover:bg-red-500/20`
- 341: `text-red-600` `hover:bg-red-50`
- 343: `text-slate-200` `hover:bg-slate-800`
- 344: `text-slate-700` `hover:bg-slate-100`
- 353: `text-slate-500` `text-slate-400`

### src/components/RouterOnAStickDialog.tsx

- 17: `bg-black/70`
- 25: `bg-slate-900` `bg-white`
- 37: `text-white` `text-slate-900`
- 40: `text-slate-400` `text-slate-500`
- 48: `text-slate-400` `hover:bg-slate-700` `hover:text-white` `text-slate-500` `hover:bg-slate-100`
- 57: `bg-slate-100` `bg-[#0B1120]`

### src/components/AuthMenu.tsx

- 26: `text-sky-400` `hover:bg-sky-500/10`
- 27: `text-sky-800` `hover:bg-sky-50`
- 42: `text-emerald-400` `hover:bg-zinc-700`
- 43: `text-emerald-600` `hover:bg-emerald-50`
- 49: `bg-emerald-700` `text-white` `bg-emerald-100` `text-emerald-700`

### src/components/Canvas.tsx

- 1637: `bg-slate-800` `text-slate-300`
- 1638: `bg-white` `text-slate-700`
- 1708: `text-slate-400` `text-slate-600`
- 1721: `bg-slate-800/80` `text-slate-400`
- 1722: `bg-white/80` `text-slate-600`

### src/components/exhibits/CLIExhibit.tsx

- 6: `bg-green-900/40`
- 9: `text-gray-200`
- 11: `text-gray-400`
- 13: `text-green-400`
- 15: `text-blue-400`
- 17: `text-yellow-400`
- 19: `text-red-400`
- 31: `bg-gray-900` `dark:bg-gray-950`

### src/components/dashboard/TodayPracticeSection.tsx

- 104: `bg-violet-500/10` `hover:bg-violet-500/20` `text-violet-700` `hover:text-violet-900` `dark:text-violet-300` `dark:hover:text-white`
- 106: `text-violet-600` `dark:text-violet-400`

### src/tools/SubnettingCheatsheet.tsx

- 143: `text-emerald-600` `dark:text-emerald-400`
- 144: `text-rose-600` `dark:text-rose-400`
- 164: `text-rose-500`
- 215: `text-white`
- 323: `bg-amber-50` `dark:bg-amber-500/10`

### src/components/dashboard/CcnaDashboard.tsx

- 201: `bg-amber-500` `text-slate-950`
- 209: `bg-slate-950` `text-white` `hover:bg-slate-800`
- 250: `bg-amber-500/10` `text-amber-500`

### src/components/dashboard/TopologyHero.tsx

- 253: `bg-amber-500/10` `text-amber-500`
- 271: `bg-emerald-500`
- 579: `bg-emerald-500/10` `text-emerald-600` `dark:text-emerald-400`

### src/components/SlideEmbed.tsx

- 33: `bg-[#080b12]`
- 38: `bg-slate-800/70` `text-slate-300` `bg-slate-800` `text-slate-200`

### src/components/Callout.tsx

- 61: `bg-sky-50` `dark:bg-sky-500/10`
- 66: `bg-sky-500/10`
- 149: `text-slate-200` `text-slate-700`

### src/components/dashboard/LearningPathSection.tsx

- 28: `text-emerald-600` `dark:text-emerald-400`
- 29: `text-amber-600` `dark:text-amber-400`

### src/components/MiniMap.tsx

- 175: `bg-slate-800/80`
- 176: `bg-white/80`
- 184: `text-slate-400`
- 185: `text-slate-500`

### src/components/exhibits/TableExhibit.tsx

- 33: `even:bg-gray-50` `dark:even:bg-gray-900`

### src/components/exhibits/TopologyExhibit.tsx

- 299: `text-gray-400` `dark:text-gray-500`

### src/components/LessonSummaryCard.tsx

- 67: `text-green-600` `dark:text-green-400`

### src/components/ui/alert.tsx

- 12: `bg-sky-50` `dark:bg-sky-500/10`

### src/components/ui/scroll-area.tsx

- 52: `bg-slate-600/70` `hover:bg-slate-500`

### src/components/dashboard/BlueprintDomainsGrid.tsx

- 138: `text-emerald-500`

### src/components/dashboard/CommandPalette.tsx

- 355: `bg-black/60`

### src/components/labs/security.tsx

- 1916: `bg-slate-950`

### src/components/navigation/AppBreadcrumbs.tsx

- 82: `text-sky-400`

### src/components/ui/alert-dialog.tsx

- 39: `bg-black/50`

### src/components/ui/cisco-terminal.tsx

- 186: `selection:text-white`

### src/components/ui/dialog.tsx

- 39: `bg-black/60`

### src/components/ui/sheet.tsx

- 37: `bg-black/60`

### src/components/canvas-v2/DeviceConfigDialog.tsx (Canvas, nur aufgelistet)

- 176: `bg-black/70`
- 182: `bg-slate-900` `text-white`
- 183: `bg-white` `text-slate-900`
- 192: `bg-slate-900/60` `bg-slate-50`
- 196: `bg-sky-500/20` `text-sky-400`
- 200: `text-sky-400` `text-sky-700`
- 212: `text-slate-400` `hover:text-white` `hover:bg-slate-800`
- 213: `text-slate-500` `hover:text-black` `hover:bg-slate-100`
- 225: `bg-slate-950/40` `bg-slate-100/50`
- 232: `text-sky-400` `text-sky-700`
- 233: `text-slate-400` `hover:text-slate-200` `text-slate-600` `hover:text-slate-900`
- 243: `text-sky-400` `text-sky-700`
- 244: `text-slate-400` `hover:text-slate-200` `text-slate-600` `hover:text-slate-900`
- 255: `text-sky-400` `text-sky-700`
- 256: `text-slate-400` `hover:text-slate-200` `text-slate-600` `hover:text-slate-900`
- 267: `text-sky-400` `text-sky-700`
- 268: `text-slate-400` `hover:text-slate-200` `text-slate-600` `hover:text-slate-900`
- 282: `text-slate-300` `text-slate-700`
- 291: `bg-slate-800` `text-white`
- 292: `bg-white` `text-slate-900`
- 299: `text-slate-300` `text-slate-700`
- 308: `bg-slate-800` `text-white`
- 309: `bg-white` `text-slate-900`
- 317: `text-slate-300` `text-slate-700`
- 326: `bg-slate-800` `text-white`
- 327: `bg-white` `text-slate-900`
- 334: `bg-amber-500/15` `text-amber-200`
- 335: `text-amber-400`
- 337: `text-amber-300`
- 343: `text-amber-200/80`
- 353: `text-slate-300` `text-slate-700`
- 362: `bg-slate-800` `text-white`
- 363: `bg-white` `text-slate-900`
- 374: `bg-slate-800/60` `bg-slate-50`
- 378: `text-sky-400` `text-sky-700`
- 381: `text-slate-400` `text-slate-600`
- 389: `text-sky-500`
- 399: `text-slate-400`
- 405: `bg-amber-500/15` `text-amber-200`
- 406: `text-amber-300`
- 407: `text-amber-400`
- 412: `text-amber-300`
- 415: `text-amber-200/80`
- 426: `bg-slate-800/60` `bg-slate-50`
- 431: `text-sky-400`
- 445: `bg-emerald-500/20` `text-emerald-300`
- 446: `bg-red-500/20` `text-red-300`
- 458: `text-slate-400`
- 469: `bg-slate-900` `text-white`
- 470: `bg-white` `text-slate-900`
- 485: `text-slate-400`
- 498: `bg-slate-900` `text-white`
- 499: `bg-white` `text-slate-900`
- 505: `text-slate-400`
- 518: `bg-slate-900` `text-white`
- 519: `bg-white` `text-slate-900`
- 530: `text-slate-400`
- 540: `bg-slate-900` `text-white`
- 541: `bg-white` `text-slate-900`
- 557: `text-slate-400`
- 572: `bg-slate-900` `text-white`
- 573: `bg-white` `text-slate-900`
- 578: `text-slate-400`
- 595: `bg-slate-900` `text-white`
- 596: `bg-white` `text-slate-900`
- 608: `text-slate-400`
- 628: `bg-slate-900` `text-white`
- 629: `bg-white` `text-slate-900`
- 642: `text-slate-400`
- 658: `bg-slate-900` `text-white`
- 659: `bg-white` `text-slate-900`
- 684: `text-sky-400`
- 692: `text-sky-400` `hover:text-sky-300` `bg-sky-500/15`
- 703: `bg-slate-800` `bg-slate-50`
- 706: `text-sky-400`
- 717: `bg-slate-900` `text-white`
- 718: `bg-white` `text-slate-900`
- 724: `text-red-400` `hover:bg-red-500/20`
- 739: `text-purple-400`
- 746: `text-purple-400` `hover:text-purple-300` `bg-purple-500/15`
- 757: `bg-slate-800` `bg-slate-50`
- 760: `text-purple-400`
- 771: `bg-slate-900` `text-white`
- 772: `bg-white` `text-slate-900`
- 778: `text-red-400` `hover:bg-red-500/20`
- 802: `bg-sky-500` `text-white`
- 804: `bg-slate-800` `text-slate-300` `hover:bg-slate-700`
- 805: `bg-slate-100` `text-slate-700` `hover:bg-slate-200`
- 815: `bg-slate-700` `hover:bg-slate-600` `text-white`
- 819: `text-emerald-400`
- 830: `text-emerald-400` `selection:bg-emerald-800` `selection:text-white` `bg-[#0B0F19]`
- 831: `text-slate-500`
- 843: `bg-slate-900/60` `bg-slate-50`
- 850: `bg-slate-800` `hover:bg-slate-700` `text-slate-300`
- 851: `bg-slate-100` `hover:bg-slate-200` `text-slate-700`
- 858: `bg-sky-700` `hover:bg-sky-600` `text-white`

### src/components/canvas-v2/CanvasV2Container.tsx (Canvas, nur aufgelistet)

- 1255: `bg-slate-950` `text-slate-100` `bg-slate-50` `text-slate-900`
- 1267: `bg-slate-900/90`
- 1268: `bg-white/90`
- 1273: `text-sky-400` `text-sky-700`
- 1283: `bg-slate-800` `text-white`
- 1284: `bg-white` `text-slate-900`
- 1327: `bg-slate-800` `bg-slate-100`
- 1338: `bg-sky-700` `text-white`
- 1340: `text-slate-400` `hover:text-white`
- 1341: `text-slate-600` `hover:text-slate-900`
- 1354: `bg-slate-800` `text-sky-300`
- 1355: `bg-white` `text-sky-800`
- 1370: `bg-slate-800` `bg-slate-100`
- 1377: `bg-sky-700` `text-white`
- 1378: `text-slate-400` `hover:text-white` `text-slate-600` `hover:text-slate-900`
- 1387: `bg-sky-700` `text-white`
- 1388: `text-slate-400` `hover:text-white` `text-slate-600` `hover:text-slate-900`
- 1400: `bg-sky-500/20` `text-sky-300`
- 1402: `text-slate-300` `hover:bg-slate-800`
- 1403: `text-slate-600` `hover:bg-slate-100`
- 1414: `text-slate-300` `hover:bg-slate-800`
- 1415: `text-slate-600` `hover:bg-slate-100`
- 1430: `text-slate-200` `hover:bg-slate-800` `bg-slate-800/50`
- 1431: `text-slate-700` `hover:bg-slate-100` `bg-slate-50`
- 1447: `bg-amber-500/15` `text-amber-300`
- 1449: `text-slate-300` `hover:bg-slate-800`
- 1450: `text-slate-700` `hover:bg-slate-100`
- 1456: `text-amber-400`
- 1461: `text-emerald-500`
- 1462: `text-emerald-300` `text-emerald-800`
- 1474: `text-slate-300` `hover:bg-slate-800`
- 1475: `text-slate-700` `hover:bg-slate-100`
- 1480: `text-sky-400`
- 1492: `text-slate-300` `hover:bg-slate-800` `text-slate-600` `hover:bg-slate-100`
- 1504: `text-slate-300` `hover:bg-slate-800` `text-slate-600` `hover:bg-slate-100`
- 1516: `bg-slate-800` `bg-slate-100`
- 1522: `text-slate-400` `hover:text-white` `text-slate-700` `hover:text-slate-950`
- 1530: `bg-indigo-600` `text-white`
- 1566: `bg-amber-500/15` `text-amber-200`
- 1568: `text-amber-400`
- 1569: `text-amber-400`
- 1575: `bg-sky-600` `hover:bg-sky-500` `text-white`
- 1596: `bg-amber-600` `hover:bg-amber-500` `text-white`
- 1607: `bg-sky-500/20` `text-sky-200`
- 1616: `text-sky-300` `hover:text-white`
- 1625: `bg-indigo-500/20` `text-indigo-200`
- 1634: `text-indigo-300` `hover:text-white`
- 1716: `bg-slate-900/98` `text-white`
- 1717: `bg-white/98` `text-slate-900`
- 1725: `text-sky-400`
- 1727: `text-slate-400`
- 1745: `bg-slate-950` `text-white`
- 1746: `bg-slate-50` `text-slate-900`
- 1753: `text-slate-400` `hover:text-white`
- 1759: `bg-sky-500` `hover:bg-sky-400` `text-white`
- 1778: `bg-slate-900/80` `text-slate-300`
- 1779: `bg-white/80` `text-slate-700`
- 1783: `text-sky-400`
- 1787: `text-sky-400`
- 1791: `text-amber-400`
- 1796: `text-emerald-400`
- 1807: `bg-slate-900/98` `text-white`
- 1808: `bg-white/98` `text-slate-900`
- 1813: `text-sky-400`
- 1827: `bg-emerald-500/20` `text-emerald-300` `hover:bg-emerald-500/30`
- 1840: `bg-emerald-500/20` `text-emerald-300` `hover:bg-emerald-500/30`
- 1849: `bg-sky-500/20` `text-sky-300` `hover:bg-sky-500/30`
- 1857: `text-red-400` `hover:bg-red-500/20`
- 1868: `text-slate-400`
- 1876: `bg-slate-800/80` `bg-slate-50`
- 1880: `text-sky-400` `text-sky-700`
- 1884: `bg-amber-500/20` `text-amber-300` `bg-amber-100` `text-amber-800`
- 1891: `text-slate-300` `text-slate-800`
- 1892: `text-slate-300` `text-slate-800`
- 1893: `text-slate-300` `text-slate-800`
- 1895: `text-slate-400` `text-slate-600`
- 1900: `bg-emerald-500/20` `text-emerald-300` `bg-emerald-100` `text-emerald-800`
- 1905: `text-indigo-400` `text-indigo-700`
- 1918: `text-slate-400`
- 1919: `text-green-400`
- 1925: `bg-amber-500/10` `text-amber-300`
- 1934: `bg-slate-800/90` `text-green-400`
- 1941: `bg-black/90` `text-slate-300`
- 1946: `bg-slate-900` `text-amber-300`

### src/components/canvas-v2/DevicePalette.tsx (Canvas, nur aufgelistet)

- 151: `bg-slate-900/95` `text-white`
- 152: `bg-white/95` `text-slate-900`
- 165: `bg-sky-700` `text-white`
- 167: `bg-slate-800/80` `text-slate-300` `hover:text-white` `hover:bg-slate-700`
- 168: `bg-slate-100` `text-slate-700` `hover:text-black` `hover:bg-slate-200`
- 184: `bg-indigo-600` `text-white`
- 186: `bg-slate-800/80` `text-slate-300` `hover:text-white` `hover:bg-slate-700`
- 187: `bg-slate-100` `text-slate-700` `hover:text-black` `hover:bg-slate-200`
- 195: `bg-slate-700/60`
- 206: `bg-amber-600` `text-white`
- 208: `bg-slate-800/80` `text-slate-300` `hover:text-white` `hover:bg-slate-700`
- 209: `bg-slate-100` `text-slate-700` `hover:text-black` `hover:bg-slate-200`
- 224: `bg-sky-700` `text-white`
- 226: `bg-slate-800/80` `text-slate-300` `hover:text-white` `hover:bg-slate-700`
- 227: `bg-slate-100` `text-slate-700` `hover:text-black` `hover:bg-slate-200`
- 242: `bg-emerald-600` `text-white`
- 244: `bg-slate-800/80` `text-slate-300` `hover:text-white` `hover:bg-slate-700`
- 245: `bg-slate-100` `text-slate-700` `hover:text-black` `hover:bg-slate-200`
- 260: `bg-slate-600` `text-white`
- 262: `bg-slate-800/80` `text-slate-300` `hover:text-white` `hover:bg-slate-700`
- 263: `bg-slate-100` `text-slate-700` `hover:text-black` `hover:bg-slate-200`
- 278: `bg-emerald-600` `text-white`
- 280: `bg-slate-800/80` `text-slate-300` `hover:text-white` `hover:bg-slate-700`
- 281: `bg-slate-100` `text-slate-700` `hover:text-black` `hover:bg-slate-200`
- 296: `bg-purple-600` `text-white`
- 298: `bg-slate-800/80` `text-slate-300` `hover:text-white` `hover:bg-slate-700`
- 299: `bg-slate-100` `text-slate-700` `hover:text-black` `hover:bg-slate-200`
- 314: `bg-pink-600` `text-white`
- 316: `bg-slate-800/80` `text-slate-300` `hover:text-white` `hover:bg-slate-700`
- 317: `bg-slate-100` `text-slate-700` `hover:text-black` `hover:bg-slate-200`
- 326: `bg-black/20`
- 344: `bg-slate-700/60`
- 349: `text-slate-400` `text-slate-700`
- 372: `bg-sky-500/25` `text-sky-200`
- 374: `bg-slate-800/70` `text-slate-300` `hover:bg-slate-700/80`
- 375: `bg-slate-50` `text-slate-700` `hover:bg-slate-100`
- 388: `bg-slate-700/60`
- 399: `text-slate-200` `hover:bg-slate-800`
- 400: `text-slate-800` `hover:bg-slate-100`
- 401: `text-slate-600`
- 415: `text-slate-200` `hover:bg-slate-800`
- 416: `text-slate-800` `hover:bg-slate-100`
- 417: `text-slate-600`
- 430: `bg-emerald-500/20` `text-emerald-300`
- 431: `bg-emerald-100` `text-emerald-800`
- 433: `text-slate-400` `hover:bg-slate-800` `hover:text-slate-200`
- 434: `text-slate-600` `hover:bg-slate-100` `hover:text-slate-900`
- 448: `bg-red-500/20` `hover:bg-red-500/30` `text-red-300`
- 449: `bg-red-100` `hover:bg-red-200` `text-red-800`

### src/components/canvas-v2/TopologyStorageDialog.tsx (Canvas, nur aufgelistet)

- 194: `bg-black/70`
- 200: `bg-slate-900` `text-white`
- 201: `bg-white` `text-slate-900`
- 210: `bg-slate-900/60` `bg-slate-50`
- 214: `bg-sky-500/20` `text-sky-400`
- 218: `text-sky-400`
- 230: `text-slate-400` `hover:text-white` `hover:bg-slate-800`
- 231: `text-slate-500` `hover:text-black` `hover:bg-slate-100`
- 243: `bg-slate-950/40` `bg-slate-100/50`
- 250: `text-sky-400`
- 251: `text-slate-400` `hover:text-slate-200`
- 261: `text-sky-400`
- 262: `text-slate-400` `hover:text-slate-200`
- 272: `text-sky-400`
- 273: `text-slate-400` `hover:text-slate-200`
- 283: `text-sky-400`
- 284: `text-slate-400` `hover:text-slate-200`
- 294: `text-sky-400`
- 295: `text-slate-400` `hover:text-slate-200`
- 308: `text-sky-400`
- 316: `bg-slate-800/80`
- 317: `bg-white`
- 323: `text-sky-400`
- 324: `bg-sky-500/15` `text-sky-300`
- 328: `text-slate-300`
- 331: `text-slate-400`
- 348: `bg-sky-500` `hover:bg-sky-400` `text-white`
- 365: `bg-slate-800/60` `bg-slate-50`
- 368: `text-sky-400`
- 378: `bg-slate-900` `text-white`
- 379: `bg-white` `text-slate-900`
- 385: `bg-sky-500` `hover:bg-sky-400` `text-white`
- 393: `text-red-400` `text-emerald-400`
- 403: `text-slate-400`
- 407: `text-slate-500`
- 417: `bg-slate-800/80`
- 418: `bg-white`
- 423: `text-slate-400`
- 431: `bg-sky-500/20` `hover:bg-sky-500/30` `text-sky-300`
- 437: `text-red-400` `hover:bg-red-500/20`
- 458: `bg-slate-800/60` `bg-slate-50`
- 462: `bg-emerald-500/20` `text-emerald-400`
- 466: `text-slate-400`
- 472: `bg-emerald-600` `hover:bg-emerald-500` `text-white`
- 481: `bg-slate-800/60` `bg-slate-50`
- 485: `bg-sky-500/20` `text-sky-400`
- 489: `text-slate-400`
- 495: `bg-sky-600` `hover:bg-sky-500` `text-white`
- 504: `bg-slate-800/60` `bg-slate-50`
- 508: `bg-purple-500/20` `text-purple-400`
- 512: `text-slate-400`
- 519: `bg-purple-600` `hover:bg-purple-500` `text-white`
- 529: `bg-slate-800/40` `bg-slate-50`
- 532: `text-slate-300`
- 539: `text-sky-500`
- 548: `text-sky-500`
- 553: `text-slate-400`
- 564: `text-slate-300`
- 567: `bg-sky-500` `hover:bg-sky-400` `text-white`
- 584: `text-slate-200` `bg-[#0B0F19]`
- 585: `bg-slate-50` `text-slate-900`
- 591: `bg-red-500/15` `text-red-300`
- 598: `bg-emerald-500/15` `text-emerald-300`
- 605: `text-slate-400`
- 610: `bg-sky-500` `hover:bg-sky-400` `text-white`
- 621: `text-slate-400`
- 626: `bg-emerald-500/10` `text-emerald-300`
- 627: `text-emerald-400`
- 630: `text-emerald-300/80`
- 640: `bg-amber-500/15` `text-amber-200`
- 642: `text-amber-300`
- 643: `text-amber-400`
- 646: `text-amber-100`
- 649: `text-amber-200/80`

### src/components/canvas-v2/ConnectDialog.tsx (Canvas, nur aufgelistet)

- 90: `bg-black/70`
- 99: `bg-slate-900` `text-white`
- 100: `bg-white` `text-slate-900`
- 106: `bg-sky-500/20` `text-sky-400`
- 111: `text-slate-400`
- 119: `text-slate-400` `hover:text-white` `hover:bg-slate-800` `text-slate-500` `hover:text-black` `hover:bg-slate-100`
- 132: `text-slate-300`
- 133: `text-sky-400`
- 140: `bg-slate-800` `text-white`
- 141: `bg-slate-50` `text-slate-900`
- 154: `text-slate-300`
- 155: `text-sky-400`
- 162: `bg-slate-800` `text-white`
- 163: `bg-slate-50` `text-slate-900`
- 176: `text-slate-300`
- 194: `bg-sky-500/20` `text-sky-300`
- 196: `bg-slate-800/60` `text-slate-400` `hover:text-white`
- 197: `bg-slate-100` `text-slate-600` `hover:text-black`
- 208: `text-slate-300`
- 218: `bg-slate-800` `text-white`
- 219: `bg-slate-50` `text-slate-900`
- 226: `bg-red-500/15` `text-red-300`
- 227: `text-red-400`
- 239: `bg-slate-800` `text-slate-300` `hover:bg-slate-700`
- 240: `bg-slate-200` `text-slate-700` `hover:bg-slate-300`
- 250: `bg-sky-500` `hover:bg-sky-400` `text-white`
- 251: `bg-slate-800` `text-slate-500`

### src/components/canvas-v2/TopologyScreenReaderView.tsx (Canvas, nur aufgelistet)

- 39: `bg-slate-900` `text-slate-100`
- 40: `bg-white` `text-slate-800`
- 47: `text-sky-400`
- 50: `text-slate-400`
- 57: `hover:bg-slate-800` `text-slate-400` `hover:text-white`
- 67: `text-sky-400`
- 78: `bg-slate-800/70` `text-slate-300` `bg-slate-100` `text-slate-700`
- 93: `hover:bg-slate-800/30` `hover:bg-slate-50`
- 96: `text-sky-300`
- 104: `bg-red-500/20` `text-red-300`
- 106: `bg-amber-500/20` `text-amber-300`
- 107: `bg-emerald-500/20` `text-emerald-300`
- 123: `text-slate-500`
- 131: `text-slate-400`
- 134: `text-slate-400`
- 149: `text-sky-400`
- 160: `bg-slate-800/70` `text-slate-300` `bg-slate-100` `text-slate-700`
- 179: `hover:bg-slate-800/30` `hover:bg-slate-50`
- 188: `text-sky-300`
- 195: `bg-red-500/20` `text-red-300`
- 197: `bg-amber-500/20` `text-amber-300`
- 198: `bg-emerald-500/20` `text-emerald-300`
- 204: `text-slate-400`
- 217: `text-sky-400`
- 222: `bg-emerald-500/15` `text-emerald-300`
- 231: `bg-amber-500/15` `text-amber-200`
- 233: `text-amber-300`
- 234: `text-amber-400`
- 238: `text-amber-200/80`
- 257: `bg-black/75`

### src/components/canvas-v2/TopologyLegend.tsx (Canvas, nur aufgelistet)

- 20: `bg-slate-900/95` `text-slate-200`
- 21: `bg-white/95` `text-slate-800`
- 25: `text-sky-400`
- 31: `text-slate-400` `hover:text-white`
- 42: `text-slate-400`
- 78: `text-slate-400`
- 80: `bg-emerald-500`
- 109: `text-slate-400`
- 112: `bg-blue-900` `text-blue-200`
- 116: `bg-emerald-900` `text-emerald-200`
- 120: `bg-orange-950` `text-orange-200`
- 129: `text-sky-400`
- 132: `text-slate-300`
- 133: `bg-slate-800`
- 134: `bg-slate-800`
- 135: `bg-slate-800`
- 136: `bg-slate-800`
- 137: `bg-slate-800`
- 138: `bg-slate-800`
- 139: `bg-slate-800`
- 140: `bg-slate-800`

### src/components/canvas-v2/DeviceContextMenu.tsx (Canvas, nur aufgelistet)

- 49: `bg-slate-900/98` `text-white`
- 50: `bg-white/98` `text-slate-900`
- 54: `text-sky-400`
- 57: `text-slate-400` `hover:text-white`
- 69: `hover:bg-slate-800` `text-slate-200` `hover:bg-slate-100` `text-slate-800`
- 72: `text-sky-400`
- 82: `hover:bg-slate-800` `text-slate-200` `hover:bg-slate-100` `text-slate-800`
- 85: `text-emerald-400`
- 94: `text-red-400` `hover:bg-red-500/15`
- 96: `text-red-400`
