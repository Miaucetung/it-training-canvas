# Phase 1 Konzept-Dokument: VLAN Vertiefung

**Modul**: `vlan-advanced` · **Topic-Datei**: `src/content/modules/ccna/topics/vlan-advanced.ts`  
**Zielzertifikat**: CCNA 200-301 · **Blueprint**: 2.1, 2.2, 3.3  
**Sprache**: Deutsch (Cisco CLI bleibt Englisch)  
**Stand**: Phase 1 abgeschlossen → Phase 2 bereit

---

## 1. Scope & Ziele

### Was dieses Modul leisten soll

`vlan-advanced.ts` ist das dedizierte Tiefenwissens-Modul für VLANs innerhalb des CCNA-Lernpfads.  
`switching-vlans.ts` bleibt zuständig für Layer-2-Mechanik-Breite (MAC-Learning, STP, EtherChannel-Überblick).

**Lernziele nach Abschluss aller Themen:**

1. 802.1Q-Frame-Aufbau Byte für Byte erklären (TPID, PCP, DEI, VID)
2. Access-, Trunk- und Voice-VLAN-Ports konfigurieren und verifizieren
3. Alle VLAN-Typen (Default, Data, Voice, Management, Native) unterscheiden
4. Inter-VLAN-Routing mit ROAS und L3-Switch-SVI konfigurieren (inkl. `ip routing`)
5. VTP-Risiken beschreiben; DTP deaktivieren
6. VLAN-Hopping (DTP) und Double-Tagging-Angriff erklären + Gegenmaßnahmen nennen
7. Vollständige VLAN-Härtungs-Checkliste anwenden
8. Eine Schritt-für-Schritt-VLAN-Konfiguration von Null aufbauen (Kapitelabschluss-Lab)

---

## 2. Content-Status: vlan-advanced.ts (Ist-Stand)

### 2.1 Existierende Concepts (9 Einträge)

| # | Concept-ID | Titel | Status | Blueprint |
|---|-----------|-------|--------|-----------|
| 1 | `vlan-broadcast-problem` | Broadcast-Domäne — Problem & Lösung | ✅ Vollständig | 2.1 |
| 2 | `dot1q-tagging` | 802.1Q Tagging — Frame-Aufbau Byte für Byte | ✅ Vollständig | 2.1 |
| 3 | `vlan-port-typen` | Access Port, Trunk Port & Voice VLAN | ✅ Vollständig | 2.1 |
| 4 | `vlan-typen` | VLAN-Typen — Default/Data/Voice/Management/Native | ✅ Vollständig | 2.1 |
| 5 | `inter-vlan-routing` | Inter-VLAN Routing — ROAS vs. L3-Switch | ✅ Vollständig | 3.3 |
| 6 | `vtp-dtp` | VTP & DTP — Automatisierung mit Risiken | ✅ Vollständig | 2.1 |
| 7 | `vlan-sicherheit` | VLAN Hopping & Sicherheitsmaßnahmen | ✅ Vollständig | 2.1 |
| 8 | `vlan-advanced-guide` | Lernguide: Anker → Praxis-Szenario → Selbsttest | ✅ Vollständig | 2.1 |
| 9 | `vlan-simulator` | VLAN-Simulator (Interactive Tool) | ⚠️ **Stub** | 2.1 |

> **Hinweis Voice VLAN**: Concept 3 (`vlan-port-typen`) deckt Voice VLAN bereits vollständig ab  
> (CLI-Konfiguration, CoS 5, CDP, mls qos trust). Das Template `tpl-edu-vlan-trunk-ris`  
> bekommt eine Voice-VLAN-Zone zur visuellen Verstärkung dieses Inhalts (→ Abschnitt 5).

### 2.2 Topic-Metadaten (Ist-Stand)

```ts
quizIds:     []          // ← LEER → muss befüllt werden
conceptIds:  9 Einträge  // vollständig, nur vlan-simulator ist Stub
estimatedMinutes: 150
prerequisiteTopicIds: ["switching-vlans", "networking-fundamentals"]
```

---

## 3. Gap-Analyse & Action Items

| Gap | Priorität | Action | Datei |
|-----|-----------|--------|-------|
| Kein Quiz | ⭐⭐⭐ | `QUIZ_VLAN_ADVANCED` erstellen (15 Fragen) | `ccna-quiz-content.ts` |
| `vlan-simulator` ist Stub | ⭐⭐⭐ | Stub durch vollständiges Interactive-Tool-Concept ersetzen | `vlan-advanced.ts` |
| `quizIds` leer | ⭐⭐⭐ | `QUIZ_VLAN_ADVANCED` eintragen + `quizIds` befüllen | `vlan-advanced.ts` |
| Kein Packet-Walk im Simulator | ⭐⭐ | Tab 5 in `VlanSimulatorDialog.tsx` hinzufügen | `VlanSimulatorDialog.tsx` |
| Template Voice-VLAN-Zone fehlt | ⭐⭐ | Shapes + Zone zu `tpl-edu-vlan-trunk-ris` hinzufügen | `collaboration-engine.ts` |
| Template VLAN-Hopping fehlt | ⭐⭐ | Neues Template `tpl-edu-vlan-hopping` erstellen | `collaboration-engine.ts` |
| Thema 12: Lab-Brücke fehlt | ⭐⭐ | Neues Concept `vlan-lab-bruecke` hinzufügen | `vlan-advanced.ts` |

> **Nicht in Scope** (per Entscheidung): MLS/CEF/FIB (CCNP), VTP v3 Deep-Dive (ausreichend in Concept 6), EtherChannel-Template (→ deepdive-roadmap.md Tier 2), DAI-Annotation (→ Security-Modul)

---

## 4. Quiz: QUIZ_VLAN_ADVANCED

### 4.1 Rahmendaten

| Parameter | Wert |
|-----------|------|
| Export-Konstante | `QUIZ_VLAN_ADVANCED` |
| Anzahl Fragen | 15 |
| Punkte pro Frage | 10 |
| Gesamt-Punkte | 150 |
| Blueprint-Verteilung | 2.1 (11Q), 3.3 (3Q), 2.2 (1Q) |
| Typen-Mix | 9× single-choice, 3× multiple-choice, 2× true-false, 1× text-input |
| Eintrag in Topic | `vlan-advanced.ts` → `TOPIC_VLAN_ADVANCED.quizIds: ["quiz-vlan-advanced"]` |

### 4.2 Fragenspezifikation

#### F01 — TPID-Wert (single, Blueprint 2.1, leicht)
**Frage**: Was bedeutet der Wert `0x8100` im Ethernet-Frame?  
**Richtig**: Der Frame enthält einen 802.1Q-Tag (TPID = Tag Protocol Identifier)  
**Distraktoren**: IPv6-Frame; Management-Traffic; Native-VLAN-Marker  
**Erklärung**: `0x8100` ist der IEEE-standardisierte TPID-Wert. Jeder Switch der diesen Wert liest, weiß: Die nächsten 2 Byte sind TCI (PCP+DEI+VID), nicht Ethertype.

#### F02 — VID-Breite und VLAN-Anzahl (single, 2.1, leicht)
**Frage**: Wie viele Bits hat das VID-Feld im 802.1Q-Tag, und wie viele VLANs sind damit theoretisch möglich?  
**Richtig**: 12 Bits → 4096 VLANs (0 und 4095 reserviert → 4094 nutzbar)  
**Distraktoren**: 8 Bit / 256; 10 Bit / 1024; 16 Bit / 65536  
**Erklärung**: 2^12 = 4096. VID 0 (Prioritäts-Only) und VID 4095 (IEEE-reserviert) sind nicht nutzbar.

#### F03 — Native VLAN bei ungetaggtem Frame (single, 2.1, mittel)
**Frage**: Ein ungetaggter Frame kommt auf einem konfigurierten Cisco-Trunk-Port an. In welchem VLAN wird er behandelt?  
**Richtig**: Im Native VLAN des Trunk-Ports  
**Distraktoren**: Wird verworfen; VLAN 1 (Default VLAN); allen VLANs  
**Erklärung**: Das Native VLAN ist das einzige VLAN, das auf Trunk-Ports ungetaggt übertragen wird. Standard ist VLAN 1, aber es ist konfigurierbar.

#### F04 — Double-Tagging Gegenmaßnahmen (multiple, 2.1, mittel) [2 auswählen]
**Frage**: Welche zwei Maßnahmen verhindern Double-Tagging-Angriffe wirksam?  
**Richtig**: (1) Native VLAN auf unbenutztes, isoliertes VLAN setzen (z.B. 999); (2) `vlan dot1q tag native` aktivieren  
**Distraktoren**: VTP Transparent Mode; DTP auf Trunk-Ports deaktivieren (schützt vor DTP-Angriff, nicht Double-Tagging)  
**Erklärung**: Double-Tagging exploitet das Native VLAN. Lösung: entweder kein Host im Native VLAN, oder alle Frames auf Trunk inkl. Native VLAN taggen.

#### F05 — DTP vollständig deaktivieren (single, 2.1, leicht)
**Frage**: Welche Befehls-Kombination verhindert zuverlässig, dass ein Cisco-Port Trunk wird?  
**Richtig**: `switchport mode access` + `switchport nonegotiate`  
**Distraktoren**: `switchport mode dynamic auto`; `no vtp mode`; `spanning-tree portfast` allein  
**Erklärung**: `nonegotiate` deaktiviert DTP-Pakete. `mode access` stellt explizit Access-Modus ein. Beides zusammen ist Best Practice.

#### F06 — VLAN 1 löschbar? (true-false, 2.1, leicht)
**Frage**: VLAN 1 kann auf Cisco-IOS-Switches gelöscht werden.  
**Richtig**: Falsch  
**Erklärung**: VLAN 1 ist das Default VLAN und kann weder gelöscht noch umbenannt werden. Best Practice: ungenutzt lassen und alle Ports in dedizierte VLANs verschieben.

#### F07 — ip routing auf L3-Switch (single, 3.3, mittel)
**Frage**: Du konfigurierst SVIs auf einem Cisco Catalyst 3650 — aber Hosts in VLAN 10 können VLAN 20 nicht erreichen. Was fehlt höchstwahrscheinlich?  
**Richtig**: `ip routing` (muss auf L3-Switches explizit aktiviert werden)  
**Distraktoren**: `no shutdown` auf SVIs; `switchport trunk allowed vlan 10,20`; `spanning-tree mode rapid-pvst`  
**Erklärung**: Häufigster Lab-Fehler. SVIs können ohne `ip routing` erstellt werden — Routing findet aber trotzdem nicht statt.

#### F08 — Native VLAN Befehl (single, 2.1, leicht)
**Frage**: Welcher IOS-Befehl setzt das Native VLAN eines Trunk-Ports auf VLAN 999?  
**Richtig**: `switchport trunk native vlan 999`  
**Distraktoren**: `switchport native vlan 999`; `vlan 999 native`; `encapsulation dot1q 999 native`  
**Erklärung**: Vollständige Syntax: `switchport trunk native vlan <id>` — im Interface-Config-Mode.

#### F09 — Voice-VLAN-Port Eigenschaften (multiple, 2.1, mittel) [2 auswählen]
**Frage**: Was gilt für einen Cisco-Port mit konfiguriertem Voice VLAN?  
**Richtig**: (1) Der Port bleibt im Access-Modus (wird kein Trunk); (2) Data-Frames werden ungetaggt übertragen  
**Distraktoren**: Er wird automatisch zum Trunk-Port; VoIP-Frames erhalten CoS 3  
**Erklärung**: Voice-VLAN-Port = Access-Port + "mini-Trunk" für genau 2 VLANs. Data ungetaggt; Voice mit CoS **5** (nicht 3) getaggt.

#### F10 — VTP Transparent Mode (single, 2.1, mittel)
**Frage**: In welchem VTP-Modus werden VLANs lokal gespeichert UND VTP-Advertisements durchgeleitet, ohne die eigene Datenbank zu ändern?  
**Richtig**: VTP Transparent  
**Distraktoren**: VTP Server; VTP Client; VTP Off (VTPv3)  
**Erklärung**: Transparent: lokale VLAN-DB, leitet VTP-Pakete weiter ohne zu synchronisieren. Sicherste Wahl in VTP-v1/v2-Umgebungen.

#### F11 — ROAS Hauptnachteil (single, 3.3, mittel)
**Frage**: Was ist der hauptsächliche Performance-Nachteil von Router-on-a-Stick?  
**Richtig**: Der einzige Trunk-Link zwischen Router und Switch wird zum Engpass (alles über einen physischen Link)  
**Distraktoren**: Router unterstützt kein 802.1Q; Subinterfaces haben keine IP-Adressen; `ip routing` auf Switch nötig  
**Erklärung**: Bei 20 VLANs läuft aller Inter-VLAN-Traffic über einen Link. L3-Switch-SVI routet in Hardware (Wire-Speed).

#### F12 — DTP-Aushandlung (single, 2.1, mittel)
**Frage**: Port A ist `dynamic auto`, Port B ist `dynamic desirable`. Was ist das Ergebnis?  
**Richtig**: Ein Trunk wird ausgehandelt  
**Distraktoren**: Beide bleiben Access; Port geht in err-disabled; CDP-Fehlermeldung  
**Erklärung**: `desirable` initiiert aktiv, `auto` akzeptiert → Trunk. `auto` + `auto` = kein Trunk.

#### F13 — Double-Tagging Unidirektionalität (single, 2.1, schwer)
**Frage**: Warum ist ein Double-Tagging-Angriff unidirektional?  
**Richtig**: Das Zielgerät antwortet über seinen normalen Gateway — Antwortframes kommen nicht über den Angriffspfad zurück  
**Distraktoren**: 802.1Q erlaubt nur einen Tag; der zweite Switch re-taggt; nur ein Frame kann gesendet werden  
**Erklärung**: Der Angreifer sendet einen Frame ins Ziel-VLAN, aber die Antwort läuft über normale IP-Routing-Pfade. Ohne Zugang zum Ziel-VLAN empfängt der Angreifer die Antwort nie.

#### F14 — TCI-Felder (multiple, 2.1, mittel) [3 auswählen]
**Frage**: Welche drei Felder enthält der TCI-Teil des 802.1Q-Tags?  
**Richtig**: PCP (Priority Code Point); DEI (Drop Eligible Indicator); VID (VLAN Identifier)  
**Distraktoren**: TPID (gehört zum ersten 2-Byte-Feld, nicht TCI); FCS  
**Erklärung**: TCI = 2 Byte: PCP (3 Bit) + DEI (1 Bit) + VID (12 Bit). TPID ist separat (vorhergehende 2 Byte).

#### F15 — Native VLAN Best Practice (single, 2.1, mittel)
**Frage**: Was empfiehlt Cisco als Best Practice für das Native VLAN auf Trunk-Ports?  
**Richtig**: Ein dediziertes, unbenutztes VLAN (z.B. 999) ohne zugewiesene Hosts  
**Distraktoren**: VLAN 1 (Standard-Empfehlung); gleiches wie Management VLAN; `no switchport trunk native vlan`  
**Erklärung**: Native VLAN ohne Hosts = kein Angreifer kann dort sitzen → Double-Tagging wirkungslos.

---

## 5. Template-Spec: tpl-edu-vlan-trunk-ris Erweiterung (Voice-VLAN-Zone)

**Ziel**: Concept 3 (`vlan-port-typen`, Voice-VLAN-Abschnitt) wird durch eine visuelle Annotation im Canvas-Template verstärkt. Kein neues Template — Erweiterung des bestehenden.

### Zu ergänzende Shapes in `collaboration-engine.ts`

```ts
// ── Ergänzungen zu tpl-edu-vlan-trunk-ris ──────────────────
// Alle nachfolgenden Objekte werden in das objects[]-Array eingefügt

// Voice-VLAN-Zone Hintergrund (orange, rechts von VLAN-Zonen SW1)
tplRect("ris-zone-voice", 490, 420, 140, 110, "#FED7AA"),   // Amber-100

// IP-Phone Shape
tplShape("ris-phone1", "server", 510, 450, 55, 55, "#F97316", "IP-Phone"),

// PC hinter dem IP-Phone
tplShape("ris-pc-voice", "computer", 575, 450, 55, 55, "#94A3B8", "PC (hinter Phone)"),

// Labels
tplText("ris-l-voice",  492, 425, "Voice VLAN 100", "#92400E", 11),
tplText("ris-l-voice2", 492, 438, "Data VLAN 10",   "#92400E", 10),
tplText("ris-tip-voice", 60, 614,
  "Voice VLAN: switchport voice vlan 100  |  mls qos trust device cisco-phone",
  "#334155", 12),

// Verbindung: SW1 → IP-Phone (Access + Voice VLAN)
tplConn("ris-c7", "ris-sw1", "ris-phone1",
  "Gi0/4 Access VLAN10 + Voice VLAN100", "#F97316"),
```

> **Hinweis**: Kein `tplShape("server", ...)` für IP-Phone verwenden wenn kein Telefon-Shape existiert — dann `"computer"` mit anderem Label nehmen. Shape-Bibliothek in `ShapePicker.tsx` vor der Implementierung prüfen.

---

## 6. Template-Spec: tpl-edu-vlan-hopping (neu)

**ID**: `tpl-edu-vlan-hopping`  
**Titel**: VLAN-Hopping: Double-Tagging Attack  
**Kategorie**: `"education"`  
**Tags**: `["VLAN", "Security", "Double-Tagging", "VLAN-Hopping", "Native-VLAN", "Didaktik"]`  
**Difficulty**: `"intermediate"`  
**estimatedTime**: `"15 min"`

### Topologie

```
[Angreifer-PC VLAN 1]──────[SW1 Trunk]──────[SW2]──────[Ziel-Server VLAN 20]
      │                         │
 Doppelter Tag                  │ Äußerer Tag VLAN1 entfernt
 [Tag VLAN1][Tag VLAN20]   →   [Tag VLAN20] durchgeleitet
```

### Shapes-Liste

```ts
// Header
tplText("vhop-h1", 60, 25, "VLAN-Hopping: Double-Tagging Attack", "#991B1B", 18),
tplText("vhop-h2", 60, 50,
  "Angreifer in Native VLAN (1) sendet doppelt-getaggten Frame → erreicht VLAN 20 ohne Routing",
  "#475569", 12),

// Warnung-Banner
tplRect("vhop-warn", 50, 70, 700, 30, "#FEE2E2"),
tplText("vhop-warn-t", 55, 82,
  "⚠️  Funktioniert NUR wenn: Native VLAN = Angreifer-VLAN  |  Gegenmaßnahme: Native VLAN 999 (unused)",
  "#991B1B", 12),

// Angreifer-Zone (rot)
tplRect("vhop-zone-a", 40, 115, 130, 80, "#FECACA"),
tplShape("vhop-attacker", "computer", 65, 130, 65, 65, "#EF4444", "Angreifer\nVLAN 1"),
tplText("vhop-al1", 50, 120, "VLAN 1 (Native)", "#991B1B", 10),

// SW1
tplShape("vhop-sw1", "switch", 270, 130, 90, 70, "#10B981", "SW1"),

// Trunk-Link Annotation (Schritt 1 + Schritt 2)
tplRect("vhop-step1", 180, 210, 210, 40, "#FEF3C7"),
tplText("vhop-s1a", 185, 217, "① Frame kommt an: [Tag VL1][Tag VL20]", "#92400E", 11),
tplText("vhop-s1b", 185, 230, "② SW1 entfernt äußeren Tag (Native VLAN 1)", "#92400E", 11),

// SW2
tplShape("vhop-sw2", "switch", 490, 130, 90, 70, "#10B981", "SW2"),

// Ziel-Zone (grau)
tplRect("vhop-zone-t", 640, 115, 130, 80, "#F1F5F9"),
tplShape("vhop-target", "server", 660, 130, 65, 65, "#64748B", "Ziel-Server\nVLAN 20"),
tplText("vhop-tl1", 650, 120, "VLAN 20", "#1D4ED8", 10),

// Schritt 3 Annotation
tplRect("vhop-step3", 430, 210, 230, 40, "#DBEAFE"),
tplText("vhop-s3a", 435, 217, "③ SW2 sieht [Tag VL20] → leitet an VLAN 20 weiter", "#1D4ED8", 11),
tplText("vhop-s3b", 435, 230, "④ Angreifer hat VLAN 20 erreicht — ohne Routing!", "#1D4ED8", 11),

// Unidirektional-Hinweis
tplRect("vhop-uni", 50, 270, 700, 30, "#F0FDF4"),
tplText("vhop-uni-t", 55, 282,
  "⚠️  UNIDIREKTIONAL: Antwortframes kommen über normalen Gateway zurück (nicht über Angriffspfad)",
  "#166534", 12),

// Gegenmaßnahmen-Box
tplRect("vhop-cm", 50, 315, 700, 80, "#EFF6FF"),
tplText("vhop-cm-h", 55, 322, "Gegenmaßnahmen:", "#1E293B", 13),
tplText("vhop-cm1", 55, 337,
  "switchport trunk native vlan 999   (999 = unbenutztes VLAN, kein Host)",
  "#334155", 11),
tplText("vhop-cm2", 55, 352,
  "vlan dot1q tag native               (Native VLAN auch taggen)",
  "#334155", 11),
tplText("vhop-cm3", 55, 367,
  "switchport trunk allowed vlan remove 1   (VLAN 1 vom Trunk entfernen)",
  "#334155", 11),

// Verbindungen
tplConn("vhop-c1", "vhop-attacker", "vhop-sw1",
  "[Tag VL1][Tag VL20]", "#EF4444", { animated: true }),
tplConn("vhop-c2", "vhop-sw1", "vhop-sw2",
  "[Tag VL20] (nach Entfernung äußerer Tag)", "#F59E0B", { animated: true }),
tplConn("vhop-c3", "vhop-sw2", "vhop-target",
  "VLAN 20 Zustellung", "#3B82F6", { animated: true }),
```

> Prüfen ob `tplConn` ein 5. options-Argument für `animated` unterstützt — falls nicht, weglassen oder `collaboration-engine.ts` entsprechend anpassen.

---

## 7. Concept-Spec: vlan-simulator (Stub ersetzen)

Der bestehende Stub in `VLAN_ADVANCED_CONCEPTS` wird durch ein vollständiges Concept ersetzt:

```ts
export const CONCEPT_VLAN_SIMULATOR: Concept = {
  id: "vlan-simulator",
  title: "Interaktiver VLAN-Simulator — Frame-Walk & Konfigurationsübung",
  appliesTo: ["ccna"],
  tags: ["vlan", "simulator", "interactive", "802.1q", "trunk", "frame-walk"],
  content: `
## 🎯 CCNA-Prüfungsrelevanz: ⭐⭐⭐ | Exam Topic: 2.1 | ⏱️ 20 Min

---

## Was der Simulator zeigt

Der VLAN-Simulator (Button unten) hat 5 Tabs:

| Tab | Funktion |
|-----|---------|
| **Topologie** | Switch + PCs, Konnektivitätstest per Klick |
| **VLAN-Konfig** | Access- und Trunk-Ports konfigurieren |
| **Trunk-Konfig** | Native VLAN, Allowed VLANs |
| **802.1Q Frame** | Tag-Felder interaktiv — TPID/PCP/DEI/VID |
| **Packet-Walk** | Schritt-für-Schritt durch Trunk: Tag hinzufügen → übertragen → entfernen |

---

## Empfohlene Übungsreihenfolge

1. **Tab Topologie** → Teste Konnektivität ohne VLAN-Konfiguration: Was passiert?
2. **Tab VLAN-Konfig** → Setze Port 1+2 auf VLAN 10, Port 3+4 auf VLAN 20
3. **Tab Trunk-Konfig** → Native VLAN 999, Allowed VLANs 10,20
4. **Tab 802.1Q Frame** → Klicke auf TPID, PCP, VID — lerne die Bit-Bedeutung
5. **Tab Packet-Walk** → Klicke "Senden" und beobachte den Frame-Tag Schritt für Schritt

---

## Lernkontrolle nach dem Simulator

- Welches VLAN bekommt ein ungetaggter Frame auf dem Trunk-Port?
- Was ändert sich im Frame-Header wenn der Switch den Frame auf den Trunk weiterleitet?
- Warum kann PC in VLAN 10 nicht direkt mit PC in VLAN 20 kommunizieren?
  `.trim(),
};
```

---

## 8. Simulator-Spec: VlanSimulatorDialog — neuer Tab "Packet-Walk"

**Datei**: `src/components/VlanSimulatorDialog.tsx`  
**Position**: Tab 5 (nach den 4 bestehenden Tabs)  
**Label**: `"Packet-Walk"`

### Funktionsbeschreibung

Ein animierter Step-by-Step-Walkthrough wie ein Frame durch das Netz wandert:

```
[Schritt 1] PC_A (VLAN 10) sendet Frame (ungetaggt intern)
     ↓
[Schritt 2] SW1 empfängt Frame — erkennt Quell-VLAN 10
     ↓
[Schritt 3] Weiterleitung via Trunk → 802.1Q-Tag wird hinzugefügt [VID=10, CoS=0]
     ↓
[Schritt 4] SW2 empfängt getaggten Frame — liest VID=10
     ↓
[Schritt 5] SW2 leitet an Access-Port (VLAN 10) weiter — Tag wird entfernt
     ↓
[Schritt 6] Ziel-PC empfängt Frame (ungetaggt)
```

### State-Modell

```ts
type PacketWalkStep = {
  step: number;
  description: string;
  location: "pc-a" | "sw1-in" | "trunk" | "sw2-in" | "pc-b";
  frameState: "untagged" | "tagged-vlan10" | "tagged-vlan20";
  highlightColor: string;
};
```

### UI-Anforderungen

- "Schritt vor / zurück" Navigation (keine Autoplay-Pflicht)
- Frame-Visualisierung: zeigt Tag-Status (kein Tag / Tag-Felder sichtbar)
- Aktive Komponente im Topologie-Diagramm hervorgehoben (CSS-Klasse)
- Textbox: Erklärung was in diesem Schritt passiert

---

## 9. Concept-Spec: vlan-lab-bruecke (Thema 12 — neues Concept)

**ID**: `vlan-lab-bruecke`  
**Typ**: Lab / Praktische Übung (kein `interactive-tool`)  
**Position**: Am Ende von `conceptIds`, nach `vlan-simulator`

> ⚠️ **Hinweis**: "Lab-Brücke (Thema 12)" wurde vom User als "wie im Prompt spezifiziert" bezeichnet. Die nachfolgende Spec ist eine deduzierte Best-Practice-Version. Falls abweichend von der Originalspezifikation: bitte vor Phase-2-Start korrigieren.

### Inhalt

Das Concept ist ein geführtes Kapitelabschluss-Lab: Lernende konfigurieren ein komplettes VLAN-Setup von Null auf einem simulierten Netz mit 2 Switches + 1 Router.

**Szenario**: Neues Bürogebäude, 3 Abteilungen (Sales/IT/Mgmt), 1 IP-Phone-Arbeitsplatz, 1 Server-VLAN.

**Schritte**:
1. VLANs anlegen (10, 20, 30, 100/Voice, 99/Mgmt, 999/Native)
2. Access-Ports zuweisen
3. Trunk konfigurieren (mit Native VLAN 999, allowed VLANs)
4. Voice VLAN konfigurieren (Port 5: Data VLAN 10 + Voice VLAN 100)
5. Management SVI aufsetzen (VLAN 99 + ip default-gateway)
6. Router-on-a-Stick konfigurieren (Subinterfaces Gi0/0.10/.20/.30/.99)
7. Konnektivität testen (`ping`, `show interfaces trunk`, `show vlan brief`)
8. Sicherheits-Härtung anwenden (nonegotiate, native VLAN ändern, unused ports shutdown)

**Verifikationsbefehle** (als ausklappbare Lösung am Ende):
- `show vlan brief`
- `show interfaces trunk`
- `show interfaces GigabitEthernet 0/5 switchport`
- `show ip route`

---

## 10. Dateien-Übersicht (Phase 2)

| Datei | Änderung | Aufwand |
|-------|----------|---------|
| `src/lib/ccna-quiz-content.ts` | `QUIZ_VLAN_ADVANCED` neu (15 Fragen) | 🔴 Groß |
| `src/content/modules/ccna/topics/vlan-advanced.ts` | `quizIds` befüllen, `vlan-simulator` Stub ersetzen, `vlan-lab-bruecke` Concept hinzufügen, `conceptIds` erweitern | 🟡 Mittel |
| `src/lib/collaboration-engine.ts` | `tpl-edu-vlan-trunk-ris` Shapes erweitern, `tpl-edu-vlan-hopping` neu | 🟡 Mittel |
| `src/components/VlanSimulatorDialog.tsx` | Tab 5 "Packet-Walk" implementieren | 🔴 Groß |

**Dateien die NICHT angefasst werden:**  
`switching-vlans.ts`, `ccna/index.ts`, alle Test-Dateien (nur bei Quiz-Erweiterung anpassen falls Snapshot-Tests existieren)

---

## 11. Implementierungsreihenfolge (Phase 2)

```
Schritt 1  →  QUIZ_VLAN_ADVANCED in ccna-quiz-content.ts (15 Fragen)
Schritt 2  →  vlan-advanced.ts: quizIds befüllen + vlan-simulator Stub ersetzen
Schritt 3  →  vlan-advanced.ts: vlan-lab-bruecke Concept hinzufügen + conceptIds
Schritt 4  →  collaboration-engine.ts: Voice-VLAN-Zone zu tpl-edu-vlan-trunk-ris
Schritt 5  →  collaboration-engine.ts: tpl-edu-vlan-hopping Template komplett
Schritt 6  →  VlanSimulatorDialog.tsx: Tab 5 Packet-Walk
Schritt 7  →  tsc clean + vitest (Ziel: 266/266 oder +Δ falls neue Tests)
Schritt 8  →  git commit feat(ccna): VLAN Vertiefung vollständig
```

### Akzeptanzkriterien

- [ ] `QUIZ_VLAN_ADVANCED` exportiert, 15 Fragen, alle mit `blueprint`-Feld
- [ ] `TOPIC_VLAN_ADVANCED.quizIds` enthält `"quiz-vlan-advanced"`
- [ ] `vlan-simulator` Concept hat vollständigen Content (kein "Stub"-Text)
- [ ] `vlan-lab-bruecke` in `conceptIds` und `VLAN_ADVANCED_CONCEPTS`
- [ ] `tpl-edu-vlan-trunk-ris` zeigt Voice-VLAN-Zone mit IP-Phone-Shape
- [ ] `tpl-edu-vlan-hopping` in TemplateGallery unter Kategorie `"education"`, Tag `"Security"`
- [ ] VlanSimulatorDialog Tab 5 "Packet-Walk" rendert ohne Fehler
- [ ] `tsc` fehlerfrei
- [ ] `vitest` mindestens 266/266
