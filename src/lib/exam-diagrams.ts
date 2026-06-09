// SVG-Diagramme für den Prüfungsbereich — eingebettet als Strings.
// Rendering über dangerouslySetInnerHTML (kontrollierter Inhalt, kein User-Input).

export const EXAM_DIAGRAMS: Record<string, string> = {

  "osi-model": `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 440 290" style="width:100%;max-width:440px;display:block;margin:0 auto">
  <rect width="440" height="290" fill="#f8fafc" rx="8"/>
  <text x="220" y="18" text-anchor="middle" font-family="system-ui,sans-serif" font-size="12" font-weight="700" fill="#475569">OSI-Modell vs. TCP/IP-Modell</text>
  <text x="105" y="32" text-anchor="middle" font-family="system-ui,sans-serif" font-size="10" fill="#94a3b8">OSI (7 Schichten)</text>
  <text x="330" y="32" text-anchor="middle" font-family="system-ui,sans-serif" font-size="10" fill="#94a3b8">TCP/IP (4 Schichten)</text>
  <rect x="10" y="37" width="195" height="28" fill="#0284c7" rx="3"/><text x="107" y="55" text-anchor="middle" font-family="monospace" font-size="11" fill="white">7 — Application</text>
  <rect x="10" y="68" width="195" height="28" fill="#0ea5e9" rx="3"/><text x="107" y="86" text-anchor="middle" font-family="monospace" font-size="11" fill="white">6 — Presentation</text>
  <rect x="10" y="99" width="195" height="28" fill="#38bdf8" rx="3"/><text x="107" y="117" text-anchor="middle" font-family="monospace" font-size="11" fill="#1e293b">5 — Session</text>
  <rect x="10" y="130" width="195" height="28" fill="#16a34a" rx="3"/><text x="107" y="148" text-anchor="middle" font-family="monospace" font-size="11" fill="white">4 — Transport</text>
  <rect x="10" y="161" width="195" height="28" fill="#ca8a04" rx="3"/><text x="107" y="179" text-anchor="middle" font-family="monospace" font-size="11" fill="white">3 — Network</text>
  <rect x="10" y="192" width="195" height="28" fill="#ea580c" rx="3"/><text x="107" y="210" text-anchor="middle" font-family="monospace" font-size="11" fill="white">2 — Data Link</text>
  <rect x="10" y="223" width="195" height="28" fill="#dc2626" rx="3"/><text x="107" y="241" text-anchor="middle" font-family="monospace" font-size="11" fill="white">1 — Physical</text>
  <rect x="235" y="37" width="195" height="90" fill="#dbeafe" rx="3" stroke="#93c5fd" stroke-width="1"/>
  <text x="332" y="86" text-anchor="middle" font-family="system-ui,sans-serif" font-size="12" fill="#1e3a8a" font-weight="600">Application</text>
  <text x="332" y="102" text-anchor="middle" font-family="system-ui,sans-serif" font-size="9" fill="#3b82f6">HTTP · DNS · SMTP · FTP</text>
  <rect x="235" y="130" width="195" height="28" fill="#dcfce7" rx="3" stroke="#86efac" stroke-width="1"/>
  <text x="332" y="148" text-anchor="middle" font-family="system-ui,sans-serif" font-size="12" fill="#14532d" font-weight="600">Transport (TCP / UDP)</text>
  <rect x="235" y="161" width="195" height="28" fill="#fef9c3" rx="3" stroke="#fde047" stroke-width="1"/>
  <text x="332" y="179" text-anchor="middle" font-family="system-ui,sans-serif" font-size="12" fill="#713f12" font-weight="600">Internet (IP)</text>
  <rect x="235" y="192" width="195" height="59" fill="#fed7aa" rx="3" stroke="#fdba74" stroke-width="1"/>
  <text x="332" y="225" text-anchor="middle" font-family="system-ui,sans-serif" font-size="12" fill="#7c2d12" font-weight="600">Network Access</text>
  <text x="332" y="242" text-anchor="middle" font-family="system-ui,sans-serif" font-size="9" fill="#9a3412">Ethernet · Wi-Fi · MAC · Frames</text>
  <text x="220" y="278" text-anchor="middle" font-family="system-ui,sans-serif" font-size="10" fill="#94a3b8">PDU: Data → Segment → Packet → Frame → Bits</text>
</svg>`,

  "admin-distance": `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 268" style="width:100%;max-width:320px;display:block;margin:0 auto">
  <rect width="320" height="268" fill="#f8fafc" rx="8"/>
  <text x="160" y="18" text-anchor="middle" font-family="system-ui,sans-serif" font-size="12" font-weight="700" fill="#1e293b">Administrative Distance (AD)</text>
  <rect x="10" y="26" width="300" height="22" fill="#1e293b" rx="3"/>
  <text x="130" y="41" text-anchor="middle" font-family="monospace" font-size="11" font-weight="700" fill="white">Protokoll</text>
  <text x="265" y="41" text-anchor="middle" font-family="monospace" font-size="11" font-weight="700" fill="white">AD</text>
  <rect x="10" y="48" width="300" height="22" fill="#dcfce7" rx="2"/>
  <text x="130" y="63" text-anchor="middle" font-family="monospace" font-size="11" fill="#14532d">Connected (direkt verbunden)</text>
  <text x="265" y="63" text-anchor="middle" font-family="monospace" font-size="12" font-weight="700" fill="#14532d">0</text>
  <rect x="10" y="70" width="300" height="22" fill="#f0fdf4" rx="2"/>
  <text x="130" y="85" text-anchor="middle" font-family="monospace" font-size="11" fill="#1e293b">Static Route</text>
  <text x="265" y="85" text-anchor="middle" font-family="monospace" font-size="12" font-weight="700" fill="#1e293b">1</text>
  <rect x="10" y="92" width="300" height="22" fill="#f0fdf4" rx="2"/>
  <text x="130" y="107" text-anchor="middle" font-family="monospace" font-size="11" fill="#1e293b">EIGRP intern</text>
  <text x="265" y="107" text-anchor="middle" font-family="monospace" font-size="12" font-weight="700" fill="#1e293b">90</text>
  <rect x="10" y="114" width="300" height="22" fill="#fef9c3" rx="2"/>
  <text x="130" y="129" text-anchor="middle" font-family="monospace" font-size="11" fill="#713f12">OSPF</text>
  <text x="265" y="129" text-anchor="middle" font-family="monospace" font-size="12" font-weight="700" fill="#713f12">110</text>
  <rect x="10" y="136" width="300" height="22" fill="#fef9c3" rx="2"/>
  <text x="130" y="151" text-anchor="middle" font-family="monospace" font-size="11" fill="#713f12">IS-IS</text>
  <text x="265" y="151" text-anchor="middle" font-family="monospace" font-size="12" font-weight="700" fill="#713f12">115</text>
  <rect x="10" y="158" width="300" height="22" fill="#fff7ed" rx="2"/>
  <text x="130" y="173" text-anchor="middle" font-family="monospace" font-size="11" fill="#9a3412">RIP</text>
  <text x="265" y="173" text-anchor="middle" font-family="monospace" font-size="12" font-weight="700" fill="#9a3412">120</text>
  <rect x="10" y="180" width="300" height="22" fill="#fee2e2" rx="2"/>
  <text x="130" y="195" text-anchor="middle" font-family="monospace" font-size="11" fill="#991b1b">EIGRP extern</text>
  <text x="265" y="195" text-anchor="middle" font-family="monospace" font-size="12" font-weight="700" fill="#991b1b">170</text>
  <rect x="10" y="202" width="300" height="22" fill="#fce7f3" rx="2"/>
  <text x="130" y="217" text-anchor="middle" font-family="monospace" font-size="11" fill="#831843">iBGP</text>
  <text x="265" y="217" text-anchor="middle" font-family="monospace" font-size="12" font-weight="700" fill="#831843">200</text>
  <rect x="10" y="232" width="300" height="28" fill="#e2e8f0" rx="4"/>
  <text x="160" y="243" text-anchor="middle" font-family="system-ui,sans-serif" font-size="10" fill="#475569">Niedrigste AD gewinnt bei gleichem Prefix.</text>
  <text x="160" y="255" text-anchor="middle" font-family="system-ui,sans-serif" font-size="10" fill="#475569">AD 255 = unzuverlässig, wird nie genutzt.</text>
</svg>`,

  "stp-topology": `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 380 240" style="width:100%;max-width:380px;display:block;margin:0 auto">
  <rect width="380" height="240" fill="#f8fafc" rx="8"/>
  <text x="190" y="18" text-anchor="middle" font-family="system-ui,sans-serif" font-size="12" font-weight="700" fill="#1e293b">Spanning Tree — Root Bridge &amp; Ports</text>
  <!-- Root Bridge -->
  <rect x="130" y="28" width="120" height="40" fill="#0284c7" rx="6"/>
  <text x="190" y="46" text-anchor="middle" font-family="monospace" font-size="11" fill="white" font-weight="700">Root Bridge</text>
  <text x="190" y="60" text-anchor="middle" font-family="monospace" font-size="9" fill="#bae6fd">Priorität 0 / niedrigste MAC</text>
  <!-- DP labels on Root -->
  <text x="148" y="78" text-anchor="middle" font-family="monospace" font-size="9" fill="#16a34a">DP</text>
  <text x="232" y="78" text-anchor="middle" font-family="monospace" font-size="9" fill="#16a34a">DP</text>
  <!-- Lines Root → SW2 and Root → SW3 -->
  <line x1="155" y1="68" x2="90" y2="135" stroke="#64748b" stroke-width="2"/>
  <line x1="225" y1="68" x2="290" y2="135" stroke="#64748b" stroke-width="2"/>
  <!-- SW2 -->
  <rect x="30" y="135" width="120" height="36" fill="#64748b" rx="6"/>
  <text x="90" y="153" text-anchor="middle" font-family="monospace" font-size="11" fill="white">SW2</text>
  <text x="90" y="165" text-anchor="middle" font-family="monospace" font-size="9" fill="#cbd5e1">Root Port →</text>
  <!-- SW3 -->
  <rect x="230" y="135" width="120" height="36" fill="#64748b" rx="6"/>
  <text x="290" y="153" text-anchor="middle" font-family="monospace" font-size="11" fill="white">SW3</text>
  <text x="290" y="165" text-anchor="middle" font-family="monospace" font-size="9" fill="#cbd5e1">← Root Port</text>
  <!-- SW2 → SW3 link with Blocked Port -->
  <line x1="150" y1="155" x2="230" y2="155" stroke="#dc2626" stroke-width="2" stroke-dasharray="6,3"/>
  <!-- Port labels -->
  <text x="162" y="148" text-anchor="middle" font-family="monospace" font-size="9" fill="#16a34a">DP</text>
  <text x="218" y="148" text-anchor="middle" font-family="monospace" font-size="9" fill="#dc2626">BP</text>
  <!-- Blocked Port indicator -->
  <circle cx="220" cy="155" r="7" fill="#fee2e2" stroke="#dc2626" stroke-width="1.5"/>
  <text x="220" y="159" text-anchor="middle" font-family="monospace" font-size="9" fill="#dc2626">✕</text>
  <!-- Legend -->
  <rect x="10" y="190" width="360" height="42" fill="#f1f5f9" rx="4"/>
  <circle cx="25" cy="205" r="5" fill="#16a34a"/>
  <text x="35" y="209" font-family="system-ui,sans-serif" font-size="10" fill="#1e293b">DP = Designated Port (Forwarding)</text>
  <circle cx="25" cy="222" r="5" fill="#dc2626"/>
  <text x="35" y="226" font-family="system-ui,sans-serif" font-size="10" fill="#1e293b">BP = Blocked Port — verhindert Loop</text>
  <text x="200" y="209" font-family="system-ui,sans-serif" font-size="10" fill="#1e293b">RP = Root Port (Weg zur Root Bridge)</text>
</svg>`,

  "stp-states": `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 380 210" style="width:100%;max-width:380px;display:block;margin:0 auto">
  <rect width="380" height="210" fill="#f8fafc" rx="8"/>
  <text x="190" y="18" text-anchor="middle" font-family="system-ui,sans-serif" font-size="12" font-weight="700" fill="#1e293b">STP Port-Zustände (802.1D)</text>
  <!-- States -->
  <rect x="10" y="28" width="72" height="36" fill="#dc2626" rx="5"/>
  <text x="46" y="44" text-anchor="middle" font-family="monospace" font-size="10" fill="white" font-weight="700">Blocking</text>
  <text x="46" y="57" text-anchor="middle" font-family="monospace" font-size="8" fill="#fecaca">kein Traffic</text>
  <line x1="82" y1="46" x2="108" y2="46" stroke="#94a3b8" stroke-width="2" marker-end="url(#arr)"/>
  <rect x="108" y="28" width="72" height="36" fill="#ea580c" rx="5"/>
  <text x="144" y="44" text-anchor="middle" font-family="monospace" font-size="10" fill="white" font-weight="700">Listening</text>
  <text x="144" y="57" text-anchor="middle" font-family="monospace" font-size="8" fill="#fed7aa">15 Sek</text>
  <line x1="180" y1="46" x2="206" y2="46" stroke="#94a3b8" stroke-width="2" marker-end="url(#arr)"/>
  <rect x="206" y="28" width="72" height="36" fill="#ca8a04" rx="5"/>
  <text x="242" y="44" text-anchor="middle" font-family="monospace" font-size="10" fill="white" font-weight="700">Learning</text>
  <text x="242" y="57" text-anchor="middle" font-family="monospace" font-size="8" fill="#fef08a">15 Sek</text>
  <line x1="278" y1="46" x2="304" y2="46" stroke="#94a3b8" stroke-width="2" marker-end="url(#arr)"/>
  <rect x="304" y="28" width="72" height="36" fill="#16a34a" rx="5"/>
  <text x="340" y="44" text-anchor="middle" font-family="monospace" font-size="10" fill="white" font-weight="700">Forwarding</text>
  <text x="340" y="57" text-anchor="middle" font-family="monospace" font-size="8" fill="#bbf7d0">Traffic OK</text>
  <!-- Arrow marker -->
  <defs><marker id="arr" markerWidth="6" markerHeight="6" refX="3" refY="3" orient="auto"><path d="M0,0 L6,3 L0,6Z" fill="#94a3b8"/></marker></defs>
  <!-- Detail rows -->
  <rect x="10" y="80" width="360" height="120" fill="#f1f5f9" rx="4"/>
  <text x="20" y="97" font-family="system-ui,sans-serif" font-size="10" font-weight="700" fill="#dc2626">Blocking:</text>
  <text x="90" y="97" font-family="system-ui,sans-serif" font-size="10" fill="#475569">BPDU wird empfangen, kein Daten-Traffic, kein MAC-Lernen</text>
  <text x="20" y="113" font-family="system-ui,sans-serif" font-size="10" font-weight="700" fill="#ea580c">Listening:</text>
  <text x="90" y="113" font-family="system-ui,sans-serif" font-size="10" fill="#475569">BPDUs senden/empfangen, Topologie berechnen (15s)</text>
  <text x="20" y="129" font-family="system-ui,sans-serif" font-size="10" font-weight="700" fill="#ca8a04">Learning:</text>
  <text x="90" y="129" font-family="system-ui,sans-serif" font-size="10" fill="#475569">MAC-Adressen lernen, noch kein User-Traffic (15s)</text>
  <text x="20" y="145" font-family="system-ui,sans-serif" font-size="10" font-weight="700" fill="#16a34a">Forwarding:</text>
  <text x="90" y="145" font-family="system-ui,sans-serif" font-size="10" fill="#475569">Normaler Betrieb — Traffic wird weitergeleitet</text>
  <line x1="10" y1="155" x2="370" y2="155" stroke="#cbd5e1" stroke-width="1"/>
  <text x="190" y="169" text-anchor="middle" font-family="system-ui,sans-serif" font-size="10" fill="#64748b">PortFast: überspringt Listening + Learning → sofort Forwarding</text>
  <text x="190" y="183" text-anchor="middle" font-family="system-ui,sans-serif" font-size="10" fill="#64748b">Konvergenzzeit ohne PortFast: 30 Sekunden (15s + 15s)</text>
  <text x="190" y="197" text-anchor="middle" font-family="system-ui,sans-serif" font-size="10" fill="#0284c7">RSTP (802.1w): kein Listening, Learning &lt;1s, schnelle Konvergenz</text>
</svg>`,

  "ospf-cost": `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 380 220" style="width:100%;max-width:380px;display:block;margin:0 auto">
  <rect width="380" height="220" fill="#f8fafc" rx="8"/>
  <text x="190" y="18" text-anchor="middle" font-family="system-ui,sans-serif" font-size="12" font-weight="700" fill="#1e293b">OSPF Interface Cost</text>
  <!-- Formula box -->
  <rect x="10" y="26" width="360" height="44" fill="#eff6ff" rx="4" stroke="#93c5fd" stroke-width="1.5"/>
  <text x="190" y="44" text-anchor="middle" font-family="monospace" font-size="14" font-weight="700" fill="#1d4ed8">Cost = 10⁸ ÷ Bandbreite (bps)</text>
  <text x="190" y="62" text-anchor="middle" font-family="system-ui,sans-serif" font-size="10" fill="#3b82f6">Referenzbandbreite Standard: 100 Mbps = 10⁸ bps</text>
  <!-- Table -->
  <rect x="10" y="78" width="360" height="24" fill="#1e293b" rx="3"/>
  <text x="100" y="94" text-anchor="middle" font-family="monospace" font-size="11" font-weight="700" fill="white">Interface</text>
  <text x="220" y="94" text-anchor="middle" font-family="monospace" font-size="11" font-weight="700" fill="white">Bandbreite</text>
  <text x="330" y="94" text-anchor="middle" font-family="monospace" font-size="11" font-weight="700" fill="white">Cost</text>
  <rect x="10" y="102" width="360" height="22" fill="#fee2e2" rx="2"/>
  <text x="100" y="117" text-anchor="middle" font-family="monospace" font-size="11" fill="#991b1b">Serial (T1)</text>
  <text x="220" y="117" text-anchor="middle" font-family="monospace" font-size="11" fill="#991b1b">1,544 Mbps</text>
  <text x="330" y="117" text-anchor="middle" font-family="monospace" font-size="12" font-weight="700" fill="#dc2626">64</text>
  <rect x="10" y="124" width="360" height="22" fill="#fef9c3" rx="2"/>
  <text x="100" y="139" text-anchor="middle" font-family="monospace" font-size="11" fill="#713f12">Ethernet</text>
  <text x="220" y="139" text-anchor="middle" font-family="monospace" font-size="11" fill="#713f12">10 Mbps</text>
  <text x="330" y="139" text-anchor="middle" font-family="monospace" font-size="12" font-weight="700" fill="#ca8a04">10</text>
  <rect x="10" y="146" width="360" height="22" fill="#fef3c7" rx="2"/>
  <text x="100" y="161" text-anchor="middle" font-family="monospace" font-size="11" fill="#92400e">FastEthernet</text>
  <text x="220" y="161" text-anchor="middle" font-family="monospace" font-size="11" fill="#92400e">100 Mbps</text>
  <text x="330" y="161" text-anchor="middle" font-family="monospace" font-size="13" font-weight="700" fill="#d97706">1 ⚠</text>
  <rect x="10" y="168" width="360" height="22" fill="#fef3c7" rx="2"/>
  <text x="100" y="183" text-anchor="middle" font-family="monospace" font-size="11" fill="#92400e">GigabitEthernet</text>
  <text x="220" y="183" text-anchor="middle" font-family="monospace" font-size="11" fill="#92400e">1000 Mbps</text>
  <text x="330" y="183" text-anchor="middle" font-family="monospace" font-size="13" font-weight="700" fill="#d97706">1 ⚠</text>
  <rect x="10" y="198" width="360" height="16" fill="#fef9c3" rx="2"/>
  <text x="190" y="210" text-anchor="middle" font-family="system-ui,sans-serif" font-size="10" fill="#92400e">⚠ FE und GE haben beide Cost=1 mit Standard-Referenzbandbreite → kein Unterschied!</text>
</svg>`,

  "ospf-dr-bdr": `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 380 230" style="width:100%;max-width:380px;display:block;margin:0 auto">
  <rect width="380" height="230" fill="#f8fafc" rx="8"/>
  <text x="190" y="18" text-anchor="middle" font-family="system-ui,sans-serif" font-size="12" font-weight="700" fill="#1e293b">OSPF: DR / BDR auf Broadcast-Netz</text>
  <!-- Segment line -->
  <rect x="30" y="90" width="320" height="6" fill="#94a3b8" rx="3"/>
  <text x="190" y="112" text-anchor="middle" font-family="system-ui,sans-serif" font-size="10" fill="#64748b">Ethernet Broadcast-Segment (Multicast 224.0.0.5/6)</text>
  <!-- DR -->
  <rect x="150" y="28" width="80" height="56" fill="#0284c7" rx="6"/>
  <text x="190" y="50" text-anchor="middle" font-family="monospace" font-size="11" fill="white" font-weight="700">DR</text>
  <text x="190" y="64" text-anchor="middle" font-family="monospace" font-size="9" fill="#bae6fd">Designated</text>
  <text x="190" y="76" text-anchor="middle" font-family="monospace" font-size="9" fill="#bae6fd">Router</text>
  <line x1="190" y1="84" x2="190" y2="90" stroke="#0284c7" stroke-width="2"/>
  <!-- BDR -->
  <rect x="270" y="28" width="80" height="56" fill="#16a34a" rx="6"/>
  <text x="310" y="50" text-anchor="middle" font-family="monospace" font-size="11" fill="white" font-weight="700">BDR</text>
  <text x="310" y="64" text-anchor="middle" font-family="monospace" font-size="9" fill="#bbf7d0">Backup DR</text>
  <text x="310" y="76" text-anchor="middle" font-family="monospace" font-size="9" fill="#bbf7d0">Priorität 2.</text>
  <line x1="310" y1="84" x2="310" y2="90" stroke="#16a34a" stroke-width="2"/>
  <!-- DROther 1 -->
  <rect x="30" y="28" width="80" height="56" fill="#94a3b8" rx="6"/>
  <text x="70" y="48" text-anchor="middle" font-family="monospace" font-size="11" fill="white">DROther</text>
  <text x="70" y="62" text-anchor="middle" font-family="monospace" font-size="9" fill="#e2e8f0">R3</text>
  <line x1="70" y1="84" x2="70" y2="90" stroke="#94a3b8" stroke-width="2"/>
  <!-- DROther 2 below -->
  <rect x="150" y="130" width="80" height="56" fill="#94a3b8" rx="6"/>
  <text x="190" y="152" text-anchor="middle" font-family="monospace" font-size="11" fill="white">DROther</text>
  <text x="190" y="166" text-anchor="middle" font-family="monospace" font-size="9" fill="#e2e8f0">R4</text>
  <line x1="190" y1="96" x2="190" y2="130" stroke="#94a3b8" stroke-width="2"/>
  <!-- Info -->
  <rect x="10" y="196" width="360" height="28" fill="#eff6ff" rx="4"/>
  <text x="190" y="208" text-anchor="middle" font-family="system-ui,sans-serif" font-size="10" fill="#1d4ed8">DR-Wahl: höchste Priorität (Standard 1) → höchste Router-ID</text>
  <text x="190" y="220" text-anchor="middle" font-family="system-ui,sans-serif" font-size="10" fill="#1d4ed8">DR/BDR ist nicht preemptiv — Neustart nötig für Neuwahl</text>
</svg>`,

  "nat-pat": `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 420 230" style="width:100%;max-width:420px;display:block;margin:0 auto">
  <rect width="420" height="230" fill="#f8fafc" rx="8"/>
  <text x="210" y="18" text-anchor="middle" font-family="system-ui,sans-serif" font-size="12" font-weight="700" fill="#1e293b">NAT Overload / PAT — Port Address Translation</text>
  <!-- Inside cloud -->
  <rect x="10" y="26" width="130" height="88" fill="#dbeafe" rx="6" stroke="#93c5fd" stroke-width="1.5"/>
  <text x="75" y="42" text-anchor="middle" font-family="system-ui,sans-serif" font-size="10" font-weight="700" fill="#1d4ed8">Inside (Privat)</text>
  <text x="75" y="58" text-anchor="middle" font-family="monospace" font-size="10" fill="#1e40af">192.168.1.10:1025</text>
  <text x="75" y="73" text-anchor="middle" font-family="monospace" font-size="10" fill="#1e40af">192.168.1.11:2000</text>
  <text x="75" y="88" text-anchor="middle" font-family="monospace" font-size="10" fill="#1e40af">192.168.1.12:3500</text>
  <!-- NAT Router -->
  <rect x="160" y="46" width="100" height="48" fill="#1e293b" rx="6"/>
  <text x="210" y="65" text-anchor="middle" font-family="monospace" font-size="10" fill="white" font-weight="700">NAT Router</text>
  <text x="210" y="79" text-anchor="middle" font-family="monospace" font-size="9" fill="#94a3b8">ip nat inside</text>
  <text x="210" y="90" text-anchor="middle" font-family="monospace" font-size="9" fill="#94a3b8">source list overload</text>
  <!-- Arrows -->
  <line x1="140" y1="70" x2="160" y2="70" stroke="#64748b" stroke-width="2" marker-end="url(#ar2)"/>
  <line x1="260" y1="70" x2="280" y2="70" stroke="#64748b" stroke-width="2" marker-end="url(#ar2)"/>
  <defs><marker id="ar2" markerWidth="6" markerHeight="6" refX="3" refY="3" orient="auto"><path d="M0,0 L6,3 L0,6Z" fill="#64748b"/></marker></defs>
  <!-- Outside -->
  <rect x="280" y="26" width="130" height="88" fill="#dcfce7" rx="6" stroke="#86efac" stroke-width="1.5"/>
  <text x="345" y="42" text-anchor="middle" font-family="system-ui,sans-serif" font-size="10" font-weight="700" fill="#14532d">Outside (Öffentlich)</text>
  <text x="345" y="58" text-anchor="middle" font-family="monospace" font-size="10" fill="#166534">203.0.113.1:10001</text>
  <text x="345" y="73" text-anchor="middle" font-family="monospace" font-size="10" fill="#166534">203.0.113.1:10002</text>
  <text x="345" y="88" text-anchor="middle" font-family="monospace" font-size="10" fill="#166534">203.0.113.1:10003</text>
  <!-- Translation table -->
  <rect x="10" y="124" width="400" height="20" fill="#1e293b" rx="3"/>
  <text x="130" y="138" text-anchor="middle" font-family="monospace" font-size="10" font-weight="700" fill="white">Inside Local</text>
  <text x="280" y="138" text-anchor="middle" font-family="monospace" font-size="10" font-weight="700" fill="white">Inside Global (PAT)</text>
  <rect x="10" y="144" width="400" height="18" fill="#eff6ff" rx="2"/>
  <text x="130" y="157" text-anchor="middle" font-family="monospace" font-size="10" fill="#1e40af">192.168.1.10:1025</text>
  <text x="280" y="157" text-anchor="middle" font-family="monospace" font-size="10" fill="#166534">203.0.113.1:10001</text>
  <rect x="10" y="162" width="400" height="18" fill="#f0fdf4" rx="2"/>
  <text x="130" y="175" text-anchor="middle" font-family="monospace" font-size="10" fill="#1e40af">192.168.1.11:2000</text>
  <text x="280" y="175" text-anchor="middle" font-family="monospace" font-size="10" fill="#166534">203.0.113.1:10002</text>
  <rect x="10" y="180" width="400" height="18" fill="#eff6ff" rx="2"/>
  <text x="130" y="193" text-anchor="middle" font-family="monospace" font-size="10" fill="#1e40af">192.168.1.12:3500</text>
  <text x="280" y="193" text-anchor="middle" font-family="monospace" font-size="10" fill="#166534">203.0.113.1:10003</text>
  <text x="210" y="220" text-anchor="middle" font-family="system-ui,sans-serif" font-size="10" fill="#64748b">Viele private IPs teilen EINE öffentliche IP — unterschieden durch Port-Nummer</text>
</svg>`,

  "fhrp": `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 220" style="width:100%;max-width:400px;display:block;margin:0 auto">
  <rect width="400" height="220" fill="#f8fafc" rx="8"/>
  <text x="200" y="18" text-anchor="middle" font-family="system-ui,sans-serif" font-size="12" font-weight="700" fill="#1e293b">HSRP / VRRP — First Hop Redundancy</text>
  <!-- Virtual IP -->
  <rect x="140" y="28" width="120" height="40" fill="#7c3aed" rx="6"/>
  <text x="200" y="46" text-anchor="middle" font-family="monospace" font-size="11" fill="white" font-weight="700">Virtual IP</text>
  <text x="200" y="60" text-anchor="middle" font-family="monospace" font-size="10" fill="#ddd6fe">10.0.0.1 (VIP)</text>
  <!-- Active Router -->
  <rect x="20" y="100" width="120" height="50" fill="#0284c7" rx="6"/>
  <text x="80" y="120" text-anchor="middle" font-family="monospace" font-size="11" fill="white" font-weight="700">Active</text>
  <text x="80" y="134" text-anchor="middle" font-family="monospace" font-size="9" fill="#bae6fd">R1 — 10.0.0.2</text>
  <text x="80" y="146" text-anchor="middle" font-family="monospace" font-size="9" fill="#bae6fd">hält die VIP</text>
  <!-- Standby Router -->
  <rect x="260" y="100" width="120" height="50" fill="#64748b" rx="6"/>
  <text x="320" y="120" text-anchor="middle" font-family="monospace" font-size="11" fill="white" font-weight="700">Standby</text>
  <text x="320" y="134" text-anchor="middle" font-family="monospace" font-size="9" fill="#cbd5e1">R2 — 10.0.0.3</text>
  <text x="320" y="146" text-anchor="middle" font-family="monospace" font-size="9" fill="#cbd5e1">übernimmt bei Ausfall</text>
  <!-- Lines -->
  <line x1="160" y1="68" x2="100" y2="100" stroke="#7c3aed" stroke-width="2"/>
  <line x1="240" y1="68" x2="320" y2="100" stroke="#64748b" stroke-width="2"/>
  <line x1="140" y1="125" x2="260" y2="125" stroke="#94a3b8" stroke-width="1.5" stroke-dasharray="4,3"/>
  <text x="200" y="120" text-anchor="middle" font-family="system-ui,sans-serif" font-size="9" fill="#64748b">Hellos</text>
  <!-- Clients -->
  <rect x="10" y="168" width="370" height="42" fill="#f1f5f9" rx="4"/>
  <text x="200" y="183" text-anchor="middle" font-family="system-ui,sans-serif" font-size="10" font-weight="700" fill="#1e293b">Clients konfigurieren 10.0.0.1 als Default-Gateway</text>
  <text x="200" y="197" text-anchor="middle" font-family="system-ui,sans-serif" font-size="10" fill="#475569">HSRP: Preemption OFF by default | VRRP: Preemption ON by default</text>
  <text x="200" y="209" text-anchor="middle" font-family="system-ui,sans-serif" font-size="10" fill="#475569">VRRP-Protokoll: IP-Protokoll 112 (kein UDP/TCP!)</text>
</svg>`,

  "vlan-trunk": `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 420 230" style="width:100%;max-width:420px;display:block;margin:0 auto">
  <rect width="420" height="230" fill="#f8fafc" rx="8"/>
  <text x="210" y="18" text-anchor="middle" font-family="system-ui,sans-serif" font-size="12" font-weight="700" fill="#1e293b">802.1Q VLAN Trunking</text>
  <!-- SW1 -->
  <rect x="10" y="80" width="100" height="80" fill="#1e293b" rx="6"/>
  <text x="60" y="115" text-anchor="middle" font-family="monospace" font-size="11" fill="white" font-weight="700">SW1</text>
  <rect x="20" y="122" width="30" height="16" fill="#0284c7" rx="2"/>
  <text x="35" y="134" text-anchor="middle" font-family="monospace" font-size="9" fill="white">V10</text>
  <rect x="58" y="122" width="30" height="16" fill="#dc2626" rx="2"/>
  <text x="73" y="134" text-anchor="middle" font-family="monospace" font-size="9" fill="white">V20</text>
  <text x="60" y="153" text-anchor="middle" font-family="monospace" font-size="9" fill="#94a3b8">Trunk Port</text>
  <!-- Trunk link -->
  <rect x="120" y="102" width="180" height="16" fill="#e2e8f0" rx="2"/>
  <!-- VLAN frames on trunk -->
  <rect x="128" y="104" width="40" height="12" fill="#0284c7" rx="2"/>
  <text x="148" y="114" text-anchor="middle" font-family="monospace" font-size="8" fill="white">Tag 10</text>
  <rect x="178" y="104" width="40" height="12" fill="#dc2626" rx="2"/>
  <text x="198" y="114" text-anchor="middle" font-family="monospace" font-size="8" fill="white">Tag 20</text>
  <rect x="228" y="104" width="40" height="12" fill="#0284c7" rx="2"/>
  <text x="248" y="114" text-anchor="middle" font-family="monospace" font-size="8" fill="white">Tag 10</text>
  <text x="210" y="95" text-anchor="middle" font-family="system-ui,sans-serif" font-size="9" fill="#64748b">802.1Q Trunk (mehrere VLANs)</text>
  <!-- SW2 -->
  <rect x="310" y="80" width="100" height="80" fill="#1e293b" rx="6"/>
  <text x="360" y="115" text-anchor="middle" font-family="monospace" font-size="11" fill="white" font-weight="700">SW2</text>
  <rect x="320" y="122" width="30" height="16" fill="#0284c7" rx="2"/>
  <text x="335" y="134" text-anchor="middle" font-family="monospace" font-size="9" fill="white">V10</text>
  <rect x="358" y="122" width="30" height="16" fill="#dc2626" rx="2"/>
  <text x="373" y="134" text-anchor="middle" font-family="monospace" font-size="9" fill="white">V20</text>
  <text x="360" y="153" text-anchor="middle" font-family="monospace" font-size="9" fill="#94a3b8">Trunk Port</text>
  <!-- Access ports on SW1 -->
  <rect x="10" y="178" width="44" height="28" fill="#0284c7" rx="4"/>
  <text x="32" y="194" text-anchor="middle" font-family="monospace" font-size="9" fill="white">PC-A</text>
  <text x="32" y="205" text-anchor="middle" font-family="monospace" font-size="8" fill="#bae6fd">VLAN10</text>
  <rect x="66" y="178" width="44" height="28" fill="#dc2626" rx="4"/>
  <text x="88" y="194" text-anchor="middle" font-family="monospace" font-size="9" fill="white">PC-B</text>
  <text x="88" y="205" text-anchor="middle" font-family="monospace" font-size="8" fill="#fecaca">VLAN20</text>
  <!-- Access ports on SW2 -->
  <rect x="310" y="178" width="44" height="28" fill="#0284c7" rx="4"/>
  <text x="332" y="194" text-anchor="middle" font-family="monospace" font-size="9" fill="white">PC-C</text>
  <text x="332" y="205" text-anchor="middle" font-family="monospace" font-size="8" fill="#bae6fd">VLAN10</text>
  <rect x="366" y="178" width="44" height="28" fill="#dc2626" rx="4"/>
  <text x="388" y="194" text-anchor="middle" font-family="monospace" font-size="9" fill="white">PC-D</text>
  <text x="388" y="205" text-anchor="middle" font-family="monospace" font-size="8" fill="#fecaca">VLAN20</text>
  <text x="210" y="222" text-anchor="middle" font-family="system-ui,sans-serif" font-size="10" fill="#64748b">Native VLAN wird ohne Tag übertragen — muss auf beiden Seiten gleich sein!</text>
</svg>`,

  "etherchannel": `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 380 200" style="width:100%;max-width:380px;display:block;margin:0 auto">
  <rect width="380" height="200" fill="#f8fafc" rx="8"/>
  <text x="190" y="18" text-anchor="middle" font-family="system-ui,sans-serif" font-size="12" font-weight="700" fill="#1e293b">EtherChannel / Port-Channel</text>
  <!-- SW1 -->
  <rect x="10" y="60" width="100" height="90" fill="#1e293b" rx="6"/>
  <text x="60" y="80" text-anchor="middle" font-family="monospace" font-size="11" fill="white" font-weight="700">SW1</text>
  <text x="60" y="96" text-anchor="middle" font-family="monospace" font-size="9" fill="#94a3b8">Gi0/0</text>
  <text x="60" y="112" text-anchor="middle" font-family="monospace" font-size="9" fill="#94a3b8">Gi0/1</text>
  <text x="60" y="128" text-anchor="middle" font-family="monospace" font-size="9" fill="#94a3b8">Gi0/2</text>
  <text x="60" y="144" text-anchor="middle" font-family="monospace" font-size="9" fill="#94a3b8">Gi0/3</text>
  <!-- SW2 -->
  <rect x="270" y="60" width="100" height="90" fill="#1e293b" rx="6"/>
  <text x="320" y="80" text-anchor="middle" font-family="monospace" font-size="11" fill="white" font-weight="700">SW2</text>
  <text x="320" y="96" text-anchor="middle" font-family="monospace" font-size="9" fill="#94a3b8">Gi0/0</text>
  <text x="320" y="112" text-anchor="middle" font-family="monospace" font-size="9" fill="#94a3b8">Gi0/1</text>
  <text x="320" y="128" text-anchor="middle" font-family="monospace" font-size="9" fill="#94a3b8">Gi0/2</text>
  <text x="320" y="144" text-anchor="middle" font-family="monospace" font-size="9" fill="#94a3b8">Gi0/3</text>
  <!-- Bundled links -->
  <line x1="110" y1="93" x2="270" y2="93" stroke="#0284c7" stroke-width="2"/>
  <line x1="110" y1="109" x2="270" y2="109" stroke="#0284c7" stroke-width="2"/>
  <line x1="110" y1="125" x2="270" y2="125" stroke="#0284c7" stroke-width="2"/>
  <line x1="110" y1="141" x2="270" y2="141" stroke="#0284c7" stroke-width="2"/>
  <!-- Bundle bracket -->
  <rect x="140" y="82" width="100" height="72" fill="none" stroke="#7c3aed" stroke-width="2" rx="4" stroke-dasharray="4,2"/>
  <text x="190" y="125" text-anchor="middle" font-family="monospace" font-size="10" fill="#7c3aed" font-weight="700">Port-Channel</text>
  <text x="190" y="138" text-anchor="middle" font-family="monospace" font-size="9" fill="#7c3aed">4× 1 Gbps = 4 Gbps</text>
  <!-- Protocol table -->
  <rect x="10" y="162" width="360" height="32" fill="#eff6ff" rx="4"/>
  <text x="90" y="174" text-anchor="middle" font-family="monospace" font-size="10" font-weight="700" fill="#1d4ed8">LACP</text>
  <text x="90" y="186" text-anchor="middle" font-family="monospace" font-size="9" fill="#3b82f6">active / passive</text>
  <text x="190" y="174" text-anchor="middle" font-family="monospace" font-size="10" font-weight="700" fill="#7c3aed">PAgP</text>
  <text x="190" y="186" text-anchor="middle" font-family="monospace" font-size="9" fill="#7c3aed">desirable / auto</text>
  <text x="310" y="174" text-anchor="middle" font-family="monospace" font-size="10" font-weight="700" fill="#64748b">Static</text>
  <text x="310" y="186" text-anchor="middle" font-family="monospace" font-size="9" fill="#64748b">on / on (kein Protokoll)</text>
</svg>`,

  "longest-prefix": `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 220" style="width:100%;max-width:400px;display:block;margin:0 auto">
  <rect width="400" height="220" fill="#f8fafc" rx="8"/>
  <text x="200" y="18" text-anchor="middle" font-family="system-ui,sans-serif" font-size="12" font-weight="700" fill="#1e293b">Longest Prefix Match</text>
  <text x="200" y="34" text-anchor="middle" font-family="system-ui,sans-serif" font-size="10" fill="#64748b">Zieladresse: 192.168.1.37</text>
  <!-- Header -->
  <rect x="10" y="42" width="380" height="22" fill="#1e293b" rx="3"/>
  <text x="100" y="57" text-anchor="middle" font-family="monospace" font-size="11" font-weight="700" fill="white">Route</text>
  <text x="220" y="57" text-anchor="middle" font-family="monospace" font-size="11" font-weight="700" fill="white">Prefix-Länge</text>
  <text x="330" y="57" text-anchor="middle" font-family="monospace" font-size="11" font-weight="700" fill="white">Passt?</text>
  <!-- Row 1 - default -->
  <rect x="10" y="64" width="380" height="26" fill="#fef9c3" rx="2"/>
  <text x="100" y="81" text-anchor="middle" font-family="monospace" font-size="11" fill="#713f12">0.0.0.0/0</text>
  <text x="220" y="81" text-anchor="middle" font-family="monospace" font-size="11" fill="#713f12">/0 (alle IPs)</text>
  <text x="330" y="81" text-anchor="middle" font-family="monospace" font-size="11" fill="#16a34a">✓ Ja</text>
  <!-- Row 2 - /16 -->
  <rect x="10" y="90" width="380" height="26" fill="#fef3c7" rx="2"/>
  <text x="100" y="107" text-anchor="middle" font-family="monospace" font-size="11" fill="#92400e">192.168.0.0/16</text>
  <text x="220" y="107" text-anchor="middle" font-family="monospace" font-size="11" fill="#92400e">/16 (breiter)</text>
  <text x="330" y="107" text-anchor="middle" font-family="monospace" font-size="11" fill="#16a34a">✓ Ja</text>
  <!-- Row 3 - /24 -->
  <rect x="10" y="116" width="380" height="26" fill="#dcfce7" rx="2"/>
  <text x="100" y="133" text-anchor="middle" font-family="monospace" font-size="11" fill="#14532d">192.168.1.0/24</text>
  <text x="220" y="133" text-anchor="middle" font-family="monospace" font-size="11" fill="#14532d">/24</text>
  <text x="330" y="133" text-anchor="middle" font-family="monospace" font-size="11" fill="#16a34a">✓ Ja</text>
  <!-- Row 4 - /28 winner -->
  <rect x="10" y="142" width="380" height="26" fill="#0284c7" rx="2"/>
  <text x="100" y="159" text-anchor="middle" font-family="monospace" font-size="11" fill="white" font-weight="700">192.168.1.32/28</text>
  <text x="220" y="159" text-anchor="middle" font-family="monospace" font-size="11" fill="white">/28 (spezifisch)</text>
  <text x="330" y="159" text-anchor="middle" font-family="monospace" font-size="12" fill="#bae6fd" font-weight="700">★ GEWÄHLT</text>
  <!-- Explanation -->
  <rect x="10" y="178" width="380" height="34" fill="#eff6ff" rx="4"/>
  <text x="200" y="193" text-anchor="middle" font-family="system-ui,sans-serif" font-size="10" font-weight="700" fill="#1d4ed8">Regel: Längster (spezifischster) Prefix gewinnt IMMER.</text>
  <text x="200" y="207" text-anchor="middle" font-family="system-ui,sans-serif" font-size="10" fill="#3b82f6">/28 schlägt /24 schlägt /16 schlägt /0 — unabhängig von AD oder Metrik.</text>
</svg>`,

  "dhcp-dora": `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 230" style="width:100%;max-width:400px;display:block;margin:0 auto">
  <rect width="400" height="230" fill="#f8fafc" rx="8"/>
  <text x="200" y="18" text-anchor="middle" font-family="system-ui,sans-serif" font-size="12" font-weight="700" fill="#1e293b">DHCP — DORA-Prozess</text>
  <!-- Client -->
  <rect x="20" y="28" width="80" height="36" fill="#1e293b" rx="5"/>
  <text x="60" y="46" text-anchor="middle" font-family="monospace" font-size="11" fill="white">Client</text>
  <text x="60" y="60" text-anchor="middle" font-family="monospace" font-size="9" fill="#94a3b8">0.0.0.0</text>
  <line x1="60" y1="64" x2="60" y2="210" stroke="#cbd5e1" stroke-width="1.5" stroke-dasharray="3,3"/>
  <!-- Server -->
  <rect x="300" y="28" width="80" height="36" fill="#0284c7" rx="5"/>
  <text x="340" y="46" text-anchor="middle" font-family="monospace" font-size="11" fill="white">DHCP Server</text>
  <text x="340" y="60" text-anchor="middle" font-family="monospace" font-size="9" fill="#bae6fd">192.168.1.1</text>
  <line x1="340" y1="64" x2="340" y2="210" stroke="#cbd5e1" stroke-width="1.5" stroke-dasharray="3,3"/>
  <!-- D: Discover -->
  <line x1="60" y1="78" x2="330" y2="78" stroke="#dc2626" stroke-width="2" marker-end="url(#ar3)"/>
  <rect x="100" y="66" width="200" height="16" fill="white"/>
  <text x="200" y="78" text-anchor="middle" font-family="monospace" font-size="10" fill="#dc2626" font-weight="700">D: DHCPDISCOVER (Broadcast)</text>
  <!-- O: Offer -->
  <line x1="330" y1="108" x2="70" y2="108" stroke="#16a34a" stroke-width="2" marker-end="url(#ar4)"/>
  <rect x="100" y="96" width="200" height="16" fill="white"/>
  <text x="200" y="108" text-anchor="middle" font-family="monospace" font-size="10" fill="#16a34a" font-weight="700">O: DHCPOFFER (Unicast/Bcast)</text>
  <!-- R: Request -->
  <line x1="60" y1="138" x2="330" y2="138" stroke="#ca8a04" stroke-width="2" marker-end="url(#ar3)"/>
  <rect x="100" y="126" width="200" height="16" fill="white"/>
  <text x="200" y="138" text-anchor="middle" font-family="monospace" font-size="10" fill="#ca8a04" font-weight="700">R: DHCPREQUEST (Broadcast)</text>
  <!-- A: Ack -->
  <line x1="330" y1="168" x2="70" y2="168" stroke="#0284c7" stroke-width="2" marker-end="url(#ar4)"/>
  <rect x="100" y="156" width="200" height="16" fill="white"/>
  <text x="200" y="168" text-anchor="middle" font-family="monospace" font-size="10" fill="#0284c7" font-weight="700">A: DHCPACK (mit IP + Options)</text>
  <defs>
    <marker id="ar3" markerWidth="6" markerHeight="6" refX="3" refY="3" orient="auto"><path d="M0,0 L6,3 L0,6Z" fill="#dc2626"/></marker>
    <marker id="ar4" markerWidth="6" markerHeight="6" refX="3" refY="3" orient="auto"><path d="M0,0 L6,3 L0,6Z" fill="#16a34a"/></marker>
  </defs>
  <text x="200" y="196" text-anchor="middle" font-family="system-ui,sans-serif" font-size="10" fill="#64748b">DHCP: UDP Port 67 (Server), Port 68 (Client)</text>
  <text x="200" y="210" text-anchor="middle" font-family="system-ui,sans-serif" font-size="10" fill="#64748b">Options: IP-Adresse, Subnetzmaske, Gateway, DNS, Lease-Time</text>
</svg>`,
};
