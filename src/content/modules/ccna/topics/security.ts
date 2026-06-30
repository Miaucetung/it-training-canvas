// ============================================================
// CCNA Topic: Network Security
// ============================================================

import type { Concept, Topic } from "@/lib/content/types";

export const CONCEPT_SECURITY_FUNDAMENTALS: Concept = {
  id: "security-fundamentals",
  title: "Netzwerksicherheit Grundlagen",
  appliesTo: ["ccna", "comptia-security-plus"],
  tags: ["security", "cia-triad", "threats", "vulnerabilities", "networking"],
  content: `
## Netzwerksicherheit Grundlagen

### CIA-Triad
| Ziel | Beschreibung | Bedrohung |
|------|-------------|-----------|
| **C**onfidentiality | Nur Berechtigte können Daten lesen | Sniffing, MitM |
| **I**ntegrity | Daten wurden nicht verändert | Tampering, Replay |
| **A**vailability | Dienst ist erreichbar | DoS/DDoS, Ausfälle |

### Angriffs-Typen
| Angriff | Beschreibung |
|---------|-------------|
| Reconnaissance | Informationssammlung (nmap, OSINT) |
| Phishing / Spear-Phishing | Täuschungs-E-Mails |
| Man-in-the-Middle (MitM) | Abfangen der Kommunikation |
| DoS / DDoS | Überlastung eines Dienstes |
| SQL Injection | Einschleusen von SQL-Code |
| Brute Force | Passwörter durch Ausprobieren knacken |

### Defense-in-Depth
Mehrere Sicherheitsschichten: Perimeter → Netzwerk → Host → Anwendung → Daten

### AAA-Framework
| Komponente | Funktion |
|-----------|---------|
| **A**uthentication | Wer bist du? (Identitätsnachweis) |
| **A**uthorization | Was darfst du? (Zugriffsrechte) |
| **A**ccounting | Was hast du getan? (Protokollierung) |

### Cisco AAA (TACACS+ / RADIUS)
- **TACACS+** (Cisco-proprietär): Trennt Auth/Author/Accounting, TCP 49, verschlüsselt
- **RADIUS** (offen): Kombiniert Auth+Author, UDP 1812/1813

### TACACS+ vs. RADIUS — Detaillierter Vergleich
| Merkmal | TACACS+ | RADIUS |
|---------|---------|--------|
| **Transport** | TCP Port 49 | UDP Port 1812 (Auth), 1813 (Accounting) |
| **Entwickler** | Cisco (proprietär) | RFC-Standard (offen) |
| **Verschlüsselung** | Gesamter Payload (vollständig) | Nur Passwort-Feld |
| **AAA-Trennung** | Vollständig getrennt (Auth / Author / Accounting) | Auth + Author kombiniert; Accounting separat |
| **Primärer Einsatz** | **Device-Administration** (CLI-Zugriff auf Router/Switch) | **Network Access** (WLAN-Clients, 802.1X, VPN) |
| **Fehlermeldungen** | Detailliert (separate Author-Antwort pro Befehl) | Begrenzt (Access-Accept / Access-Reject) |
| **Command Authorization** | Ja — granulare Befehlserlaubnis pro Benutzer | Nein — nicht unterstützt |

> **Merkregel**: **TACACS+ → Terminal (CLI/Device-Admin)**, **RADIUS → Remote-Access (WLAN/VPN/802.1X)**
  `.trim(),
};

export const CONCEPT_ACL_STANDARD: Concept = {
  id: "acl-standard",
  title: "Standard ACLs",
  appliesTo: ["ccna"],
  tags: ["security", "acl", "standard-acl", "filtering", "layer-3"],
  content: `
## Standard ACLs (1–99, 1300–1999)

:::kernidee
Eine ACL ist eine **von oben nach unten abgearbeitete Regelliste mit First-Match**: Der erste passende Eintrag entscheidet, alle folgenden werden ignoriert. Am Ende steht ein **unsichtbares \`deny any\`** — was keine \`permit\`-Regel trifft, fällt durch. Deshalb sind **Reihenfolge** (spezifisch vor allgemein) und **mindestens eine permit-Regel** alles.
:::

:::merke
**Standard ACL = nahe ans Ziel, Extended ACL = nahe an die Quelle.** Standard filtert nur die Quell-IP — zu früh platziert würde sie *alle* Verbindungen dieser Quelle kappen. Extended kann genau matchen, also darf (und soll) sie unerwünschten Verkehr früh verwerfen.
:::

### Wesentlich
- Filtern **nur** anhand der **Quell-IP**.
- Kein Schutz vor spezifischen Diensten (kein Port-Match möglich).
- **Platzierung: nahe am Ziel**, da sonst alle anderen Verbindungen der Quelle ebenfalls blockiert würden.

### Konfiguration (nummeriert)
\`\`\`
R1(config)# access-list 10 deny 192.168.1.50 0.0.0.0
R1(config)# access-list 10 permit 192.168.1.0 0.0.0.255
R1(config)# access-list 10 deny any log

R1(config)# interface GigabitEthernet0/1
R1(config-if)# ip access-group 10 out
\`\`\`

### Wildcard-Maske vs. Subnetzmaske
- 0 = prüfen, 1 = ignorieren (Inverse zur Subnetzmaske)
- /24 → Wildcard \`0.0.0.255\`
- Einzelhost → \`host 192.168.1.50\` oder \`192.168.1.50 0.0.0.0\`

### Verifikation
\`\`\`
R1# show access-lists 10
R1# show ip interface GigabitEthernet0/1 | include access list
\`\`\`

:::check Eine ACL enthält nur \`access-list 10 deny host 192.168.1.50\`. Was passiert mit allen anderen Hosts?
**Alle werden blockiert.** Nach dem expliziten \`deny\` greift das unsichtbare \`deny any\` am Listenende — es gibt keine einzige \`permit\`-Regel. Korrekt wäre, nach dem deny ein \`permit any\` (bzw. \`permit 192.168.1.0 0.0.0.255\`) zu ergänzen.
:::
  `.trim(),
};

export const CONCEPT_ACL_EXTENDED: Concept = {
  id: "acl-extended",
  title: "Extended ACLs",
  appliesTo: ["ccna", "az-104"],
  tags: ["security", "acl", "extended-acl", "filtering", "layer-3", "layer-4"],
  relatedConceptIds: ["azure-nsg"],
  content: `
## Extended ACLs (100–199, 2000–2699)

### Wesentlich
- Filtern auf **Quell- und Ziel-IP**, **Protokoll** (TCP/UDP/ICMP/IP), **Port**, **TCP-Flags**, **DSCP**.
- **Platzierung: nahe an der Quelle** — ungewollter Traffic wird früh verworfen.

### Konfiguration (nummeriert)
\`\`\`
R1(config)# access-list 110 deny tcp 192.168.1.0 0.0.0.255 any eq 23
R1(config)# access-list 110 permit tcp 192.168.1.0 0.0.0.255 any eq 80
R1(config)# access-list 110 permit tcp 192.168.1.0 0.0.0.255 any eq 443
R1(config)# access-list 110 permit ip any any

R1(config)# interface GigabitEthernet0/0
R1(config-if)# ip access-group 110 in
\`\`\`

### Wichtige Operatoren
| Operator | Bedeutung |
|---------|----------|
| \`eq\`   | Port equals |
| \`neq\`  | Port not equals |
| \`gt\` / \`lt\` | Port größer/kleiner |
| \`range\` | Port-Bereich (z.B. \`range 8080 8090\`) |
| \`established\` | TCP ACK/RST gesetzt — Rückverkehr |

### Hinweis
Für komplexere TCP-Stateful-Filterung wird **Reflexive ACL** oder **Zone-Based Firewall (ZBFW)** statt einfacher Extended-ACLs eingesetzt.
  `.trim(),
};

export const CONCEPT_ACL_NAMED: Concept = {
  id: "acl-named",
  title: "Named ACLs & Editierbarkeit",
  appliesTo: ["ccna"],
  tags: ["security", "acl", "named-acl", "filtering"],
  content: `
## Named ACLs

### Vorteile gegenüber nummerierten ACLs
- Sprechende Namen (\`BLOCK-TELNET\` statt \`110\`).
- **Sequenznummern** ermöglichen gezieltes Einfügen/Löschen einzelner ACEs ohne ACL-Neubau.
- Wahlweise Standard- oder Extended-Modus.

### Beispiel: Extended Named ACL
\`\`\`
R1(config)# ip access-list extended DMZ-POLICY
R1(config-ext-nacl)# 10 permit tcp any host 172.16.10.10 eq 80
R1(config-ext-nacl)# 20 permit tcp any host 172.16.10.10 eq 443
R1(config-ext-nacl)# 30 deny ip 172.16.10.0 0.0.0.255 192.168.50.0 0.0.0.255
R1(config-ext-nacl)# 40 permit icmp 192.168.50.0 0.0.0.255 172.16.10.0 0.0.0.255
R1(config-ext-nacl)# 50 permit ip any any
\`\`\`

### Einzelne Zeile nachträglich einfügen / löschen
\`\`\`
R1(config)# ip access-list extended DMZ-POLICY
R1(config-ext-nacl)# 25 deny tcp any host 172.16.10.10 eq 22
R1(config-ext-nacl)# no 40
\`\`\`

### Sequenznummern neu vergeben
\`\`\`
R1# show access-lists DMZ-POLICY
R1(config)# ip access-list resequence DMZ-POLICY 100 10
\`\`\`
  `.trim(),
};

export const CONCEPT_ACL_TROUBLESHOOTING: Concept = {
  id: "acl-troubleshooting",
  title: "ACL-Troubleshooting",
  appliesTo: ["ccna"],
  tags: ["security", "acl", "troubleshooting"],
  content: `
## Typische ACL-Fehler

| Symptom | Ursache | Diagnose |
|---------|--------|----------|
| Alles wird blockiert | Implizites \`deny any\` greift | \`show access-lists\` Hit-Counter prüfen |
| Falsche Richtung gewählt | \`in\` vs. \`out\` vertauscht | \`show ip interface <int>\` |
| Falsche Wildcard | Wildcard statt Subnetzmaske notiert | ACE prüfen, Maske invertieren |
| Reihenfolge falsch | Spezifische Regel **nach** allgemeiner | ACE-Reihenfolge umstellen |
| Stateful-Verhalten erwartet | Extended ACL ist stateless | \`established\`-Keyword oder ZBFW |

### Diagnosebefehle
\`\`\`
R1# show access-lists
R1# show ip interface GigabitEthernet0/0 | include access list
R1# debug ip packet detail 110     ! VORSICHT: Performance!
\`\`\`

### Beispiel-Output: Hit-Counter
\`\`\`
R1# show access-lists DMZ-POLICY
Extended IP access list DMZ-POLICY
    10 permit tcp any host 172.16.10.10 eq www (1284 matches)
    20 permit tcp any host 172.16.10.10 eq 443 (8771 matches)
    30 deny ip 172.16.10.0 0.0.0.255 192.168.50.0 0.0.0.255 (12 matches)
    40 permit icmp 192.168.50.0 0.0.0.255 172.16.10.0 0.0.0.255 (3 matches)
    50 permit ip any any (45120 matches)
\`\`\`

### Best Practices
- ACLs immer mit \`log\` auf den letzten \`deny\` versehen, um Fehlblockaden zu erkennen.
- Vor Änderung: \`show access-lists\` und Konfiguration sichern.
- Bei kritischen Pfaden Test-Traffic mit \`extended ping\` von der Quelle aussenden.
  `.trim(),
};

export const CONCEPT_ACL_WILDCARD_ALIGNMENT: Concept = {
  id: "acl-wildcard-alignment",
  title: "Wildcard Block-Ausrichtung",
  appliesTo: ["ccna"],
  tags: ["security", "acl", "wildcard", "block-alignment", "subnetting"],
  relatedConceptIds: ["subnetting-drill"],
  content: `
## Wildcard Block-Ausrichtung

:::kernidee
Eine Wildcard-Maske teilt jedes Bit in „muss passen" (0) und „**egal**" (1). Der Router prüft nur die 0-Bits — die egal-Bits in deiner angegebenen Adresse **ignoriert** er und behandelt sie intern als 0. Eine Zeile beschreibt damit nie „ab dieser Adresse", sondern immer einen **festen, ausgerichteten Block**, der am nächsten Vielfachen der Blockgröße **unterhalb** deiner Zahl beginnt. Wer die Größe richtig, aber die Startadresse falsch wählt, trifft deshalb einen **ganz anderen Bereich** — ohne Fehlermeldung.
:::

### Vom „egal-Bit" zum Block

Die gesetzten Wildcard-Bits sind Platzhalter: Innerhalb eines Blocks dürfen sie jeden Wert annehmen. Daraus folgt direkt die **Blockgröße**:

\`\`\`
Blockgröße = Wildcard-Wert (im interessanten Oktett) + 1
\`\`\`

\`0.0.0.31\` → 31 + 1 = **32 Adressen**, \`0.0.0.15\` → **16**, \`0.0.0.0\` → **1** (ein Host).

Entscheidend ist aber nicht nur die Größe, sondern **wo der Block beginnen darf**. Ein 32er-Block kann nur bei 0, 32, 64, 96 … starten — niemals bei 46. Gibst du \`192.168.20.46 0.0.0.31\` an, **rundet der Router auf .32 ab** (er nullt die fünf egal-Bits) und deine Zeile deckt heimlich \`.32–.63\` statt der gewünschten \`.46–.77\`.

### Die Teilbarkeitsprobe — was „mod" eigentlich heißt

\`mod\` ist nur der **Rest, der beim Teilen übrig bleibt** — sonst nichts:

- \`46 ÷ 32\` → 32 passt **1×** in 46, es bleiben **14** übrig → \`46 mod 32 = 14\`.
- \`64 ÷ 32\` → 32 passt **2×** in 64, es bleibt **0** übrig → \`64 mod 32 = 0\`.

Dahinter steckt eine einzige Frage: **Ist die Startadresse ein glattes Vielfaches der Blockgröße?** Ein 32er-Block darf nur bei **0, 32, 64, 96, 128 …** beginnen — genau den Vielfachen von 32. Nur dort geht die Teilung glatt auf (Rest 0).

- **64** = 32 × 2 → Rest 0 → liegt auf einer Blockgrenze → **ausgerichtet** ✅
- **46** ist *kein* Vielfaches von 32 — es liegt **mitten** zwischen 32 und 64. Rest 14 heißt „14 Schritte hinter der letzten Grenze (32)" → **nicht ausgerichtet**, der Router rutscht auf 32 zurück ❌

:::merke
**Ganz ohne Rechnen:** Zähl in Blockgröße-Schritten hoch — bei Größe 32 also **0, 32, 64, 96 …** Taucht deine Startadresse in dieser Liste auf, ist sie **ausgerichtet**. Liegt sie dazwischen (z. B. 46 zwischen 32 und 64), rundet der Router auf den Wert **darunter** (32) ab.
:::

### Trailing-Zeros-Trick (maximale Blockgröße ab einer Zahl)

Schreibe die Startzahl binär und zähle die **Nullen von rechts**: So viele Verdopplungen ist der größte ausgerichtete Block, der dort beginnen darf.

\`\`\`
48 = 0011 0000  → 4 Nullen rechts → max. Block 2⁴ = 16  (Start 48 ✓)
46 = 0010 1110  → 1 Null  rechts → max. Block 2¹ = 2   (Start 46 ✓ nur für Größe 2)
64 = 0100 0000  → 6 Nullen rechts → max. Block 2⁶ = 64
\`\`\`

### Greedy-Zerlegung einer Range in minimale Blöcke

Von der **untersten** Adresse aus jeweils den **größtmöglichen ausgerichteten Block** wählen, der nicht über das Ziel hinausragt — dann weiterspringen. Das ergibt automatisch die wenigsten, lückenlosen Zeilen:

1. Größte Blockgröße = kleinerer Wert aus *Trailing-Zeros der Startzahl* und *was noch in die Range passt*.
2. Block notieren, Start um die Blockgröße erhöhen, wiederholen, bis das Ende erreicht ist.

### Rechenweg Schritt für Schritt (zum Mitrechnen)

Vom Ziel zu den fertigen Permit-Zeilen ist es **immer dieselbe Schleife**. Beispiel: \`192.168.40.8\` bis \`192.168.40.39\`.

**Pro Block, von der untersten Adresse aus:**
1. **Größte Blockgröße \`g\` finden** (Kandidaten 1, 2, 4, 8, 16, 32 …), für die **beide** Proben stimmen:
   - Ausrichtung: \`Start mod g = 0\`
   - Passt noch: \`Start + g − 1 ≤ Ende\`
2. **Wildcard = g − 1**
3. Zeile schreiben: \`permit <Start> 0.0.0.<g−1>\`
4. **Neuer Start = Start + g** → zurück zu Schritt 1, bis der Start über dem Ende liegt.

| Start | Proben (von groß nach klein durchprobieren) | g | Wildcard | Zeile |
|-------|---------------------------------------------|---|----------|-------|
| 8 | g=16? \`8 mod 16 = 8\` ✗ — g=8? \`8 mod 8 = 0\` ✓ und \`8+7 = 15 ≤ 39\` ✓ | **8** | 7 | \`permit 192.168.40.8 0.0.0.7\` |
| 16 | g=16? \`16 mod 16 = 0\` ✓ und \`16+15 = 31 ≤ 39\` ✓ | **16** | 15 | \`permit 192.168.40.16 0.0.0.15\` |
| 32 | g=32? \`32+31 = 63 > 39\` ✗ — g=16? \`32+15 = 47 > 39\` ✗ — g=8? \`32 mod 8 = 0\` ✓ und \`32+7 = 39 ≤ 39\` ✓ | **8** | 7 | \`permit 192.168.40.32 0.0.0.7\` |

Neuer Start nach Schritt 3 wäre \`40\` > \`39\` → **fertig**. Ergebnis:

\`\`\`
permit 192.168.40.8  0.0.0.7     ! .8–.15
permit 192.168.40.16 0.0.0.15    ! .16–.31
permit 192.168.40.32 0.0.0.7     ! .32–.39
\`\`\`

:::merke
Zwei Proben pro Schritt, mehr nicht: **(1) \`Start mod g = 0\`** (sitzt der Block sauber?) und **(2) \`Start + g − 1 ≤ Ende\`** (ragt er nicht über das Ziel hinaus?). Die größte Blockgröße \`g\`, die **beide** besteht, gewinnt — dann \`Wildcard = g − 1\` und \`Start += g\`.
:::

:::tipp
**Weg B als Alternative:** Statt die Range selbst zu zerlegen (Weg A), das **ganze Subnetz erlauben und nur die Ränder per \`deny\` ausschneiden** (\`deny\` der Blöcke davor/danach, dann \`permit <subnetz>\`). Lohnt sich, wenn der gewünschte Bereich **fast das ganze** Subnetz umfasst — dann sind die Rand-Blöcke kürzer als die vielen Permit-Blöcke aus Weg A.
:::

:::slide:acl-block-alignment:::

## Beispiel 1 — der klassische Fehler (.46 – .95)

Ziel: nur \`192.168.20.46\` bis \`192.168.20.95\` erlauben. Häufiger (falscher) Versuch:

\`\`\`
permit 192.168.20.46 0.0.0.31    ! Größe 32
permit 192.168.20.78 0.0.0.15    ! Größe 16
permit 192.168.20.94 0.0.0.1     ! Größe 2
\`\`\`

Teilbarkeitsprobe Zeile für Zeile:

| Zeile | Start | Blockgröße | Start mod Größe | ausgerichtet? | Router deckt real |
|-------|-------|-----------|-----------------|---------------|-------------------|
| 1 | 46 | 32 | 46 mod 32 = **14** | ❌ rundet auf 32 | \`.32–.63\` |
| 2 | 78 | 16 | 78 mod 16 = **14** | ❌ rundet auf 64 | \`.64–.79\` |
| 3 | 94 | 2 | 94 mod 2 = **0** | ✅ | \`.94–.95\` |

→ Tatsächlich erlaubt: \`.32–.79\` **und** \`.94–.95\`. Gegenüber dem Ziel \`.46–.95\` ist das **zu viel** (\`.32–.45\`) **und es fehlt** (\`.80–.93\`). Die Größen stimmten — nur die Ausrichtung nicht.

**Korrekte Zerlegung** (Greedy von .46 aufwärts):

\`\`\`
permit 192.168.20.46 0.0.0.1     ! .46–.47   (46 mod 2  = 0 ✓)
permit 192.168.20.48 0.0.0.15    ! .48–.63   (48 mod 16 = 0 ✓)
permit 192.168.20.64 0.0.0.31    ! .64–.95   (64 mod 32 = 0 ✓)
\`\`\`

## Beispiel 2 — von Grund auf zerlegen (172.16.5.32 – .111)

Ziel: \`172.16.5.32\` bis \`172.16.5.111\` (80 Adressen). Greedy von .32:

| Schritt | Start | Trailing-Zeros → max. Block | passt in Ziel? | gewählter Block | Zeile |
|---------|-------|-----------------------------|----------------|-----------------|-------|
| 1 | 32 | 32 | .32–.63 ✓ | **32** | \`permit 172.16.5.32 0.0.0.31\` |
| 2 | 64 | 64 (zu groß) → 32 | .64–.95 ✓ | **32** | \`permit 172.16.5.64 0.0.0.31\` |
| 3 | 96 | 32 (zu groß) → 16 | .96–.111 ✓ | **16** | \`permit 172.16.5.96 0.0.0.15\` |

Ergebnis — drei saubere, ausgerichtete Zeilen:

\`\`\`
permit 172.16.5.32 0.0.0.31      ! .32–.63
permit 172.16.5.64 0.0.0.31      ! .64–.95
permit 172.16.5.96 0.0.0.15      ! .96–.111
\`\`\`

In Schritt 2 darf der 64er-Block nicht genommen werden (\`.64–.127\` ragt über .111 hinaus); in Schritt 3 kein 32er (\`.96–.127\` zu groß) — daher 16.

## Block-Grenzen-Referenztabelle

| Wildcard (letztes Oktett) | Blockgröße | Gültige Startwerte (Vielfache) |
|---------------------------|-----------|--------------------------------|
| \`0.0.0.0\` | 1 | 0–255 (jede Adresse) |
| \`0.0.0.1\` | 2 | 0, 2, 4, … 254 (gerade) |
| \`0.0.0.3\` | 4 | 0, 4, 8, … 252 |
| \`0.0.0.7\` | 8 | 0, 8, 16, … 248 |
| \`0.0.0.15\` | 16 | 0, 16, 32, … 240 |
| \`0.0.0.31\` | 32 | 0, 32, 64, 96, 128, 160, 192, 224 |
| \`0.0.0.63\` | 64 | 0, 64, 128, 192 |
| \`0.0.0.127\` | 128 | 0, 128 |
| \`0.0.0.255\` | 256 | 0 (ganzes Oktett) |

:::check Ist \`permit 10.0.0.80 0.0.0.31\` ausgerichtet — und welchen Bereich trifft die Zeile wirklich?
Blockgröße = 31 + 1 = 32. Probe: \`80 mod 32 = 16\` ≠ 0 → **nicht ausgerichtet**. Der Router rundet auf das nächste Vielfache von 32 unterhalb 80 = **64** und deckt real \`.64–.95\` (nicht \`.80–.111\`). Korrekt ausgerichtet wäre Start \`.64\` oder \`.96\`.
:::

> Das Blockgrößen-Prinzip kennst du aus dem Subnetting (dort als Subnetz-Schrittweite) — hier in der gespiegelten Wildcard-Logik. Vertiefung: [[subnetting-drill]].
  `.trim(),
};

export const CONCEPT_PORT_SECURITY: Concept = {
  id: "port-security",
  title: "Port Security & Layer-2-Sicherheit",
  appliesTo: ["ccna"],
  tags: [
    "security",
    "networking",
    "layer-2",
    "port-security",
    "dhcp-snooping",
    "dai",
  ],
  content: `
## Port Security

:::kernidee
Port Security bindet einen Access-Port an **bekannte MAC-Adressen** — so kann niemand einfach das PC-Kabel abziehen und sein eigenes Gerät (oder einen Mini-Switch) anstecken. Die **Violation-Aktion** entscheidet, was bei einem Fremdgerät passiert. \`sticky\` lernt die erlaubte MAC automatisch und schreibt sie in die running-config (also \`wr\` nicht vergessen).
:::

Begrenzt MAC-Adressen auf einem Access-Port.

### Konfiguration
\`\`\`
SW(config-if)# switchport mode access
SW(config-if)# switchport port-security
SW(config-if)# switchport port-security maximum 2
SW(config-if)# switchport port-security mac-address sticky
SW(config-if)# switchport port-security violation shutdown  ! default

SW# show port-security interface GigabitEthernet0/1
\`\`\`

### Violation-Modi
| Modus | Aktion |
|-------|--------|
| shutdown | Port geht in err-disabled (Standard) |
| restrict | Verwirft Frames, erhöht Counter, keine Abschaltung |
| protect | Verwirft Frames, kein Counter, keine Abschaltung |

:::falle
Im Default-Modus **shutdown** geht der Port bei Verletzung in **err-disabled** — und bleibt dort, bis er manuell (\`shutdown\`/\`no shutdown\`) oder per \`errdisable recovery\` zurückgeholt wird. „Port ist tot nach Gerätetausch" ist meist genau das. \`protect\` vs. \`restrict\`: beide blockieren, aber nur **restrict** zählt/loggt.
:::

### DHCP Snooping (Wiederholung)
Verhindert Rogue-DHCP-Server → Details im DHCP-Topic

### Dynamic ARP Inspection (DAI)
- Validiert ARP-Pakete anhand der DHCP-Snooping-Binding-Tabelle
- Verhindert ARP-Spoofing
\`\`\`
SW(config)# ip arp inspection vlan 10,20
SW(config-if)# ip arp inspection trust   ! Uplink-Ports
\`\`\`

### 802.1X (Port-basierte Authentifizierung)
- **Supplicant**: Endgerät (802.1X-Client)
- **Authenticator**: Switch-Port
- **Authentication Server**: RADIUS-Server
- Port ist gesperrt bis Authentifizierung erfolgreich
  `.trim(),
};

export const CONCEPT_SECURITY_GUIDE: Concept = {
  id: "security-guide",
  title: "Lernguide: Netzwerksicherheit",
  appliesTo: ["ccna"],
  tags: ["security", "acl", "port-security", "defense-in-depth", "guide"],
  content: `
## Lernziele
- Extended Named ACLs konfigurieren und an den richtigen Interfaces in der richtigen Richtung anwenden
- Das Defense-in-Depth-Konzept mit mindestens 4 Sicherheitsebenen beschreiben
- Port Security auf einem Switch-Access-Port aktivieren und Violation-Modi unterscheiden
- AAA mit TACACS+ vs. RADIUS vergleichen
- DHCP Snooping und Dynamic ARP Inspection (DAI) konfigurieren

## Praxis-Szenario
Die "MedData GmbH" (Medizinische Softwarelösungen, 150 Mitarbeiter) betreibt eine DMZ mit einem öffentlich erreichbaren Webserver (172.16.10.10/24) und ein internes Netz (192.168.50.0/24). Der Cisco ISR 4351 verbindet beide Zonen. Im Rahmen eines "Defense-in-Depth"-Konzepts soll eine Extended ACL namens "DMZ-POLICY" eingerichtet werden: HTTP (Port 80) und HTTPS (Port 443) aus dem Internet zur DMZ erlauben; alle anderen Verbindungen aus der DMZ in das interne Netz blockieren; ICMP aus dem internen Netz zur DMZ erlauben.

## Canvas-Übung
**Aufgabe:** Erstelle eine Topologie mit drei Zonen: Internet (simulierter ISP-Router), DMZ (Webserver 172.16.10.10), internes Netz (Switch + 3 PCs, 192.168.50.0/24). Der Cisco ISR 4351 verbindet alle drei Zonen über separate Interfaces. Beschrifte das DMZ-Interface mit der ACL-Richtung (inbound oder outbound) und zeige den ACL-Regeltext als Notiz.
**Ziel:** Die korrekte Platzierung einer Extended ACL zwischen DMZ und internem Netz demonstrieren.
**Tipps:** Extended ACLs gehören nah an die Quelle. Prüfe die Richtung: "in" bedeutet der Traffic kommt vom angeschlossenen Netz Richtung Router; "out" bedeutet der Traffic verlässt den Router in das angeschlossene Netz.

## Verständnisfragen
1. Warum wird eine Standard-ACL immer nah am Ziel platziert, eine Extended ACL dagegen nah an der Quelle?
2. Was bedeutet das implizite "deny all" am Ende jeder ACL — und wie kann man es sichtbar machen?
3. Was ist der Unterschied zwischen TACACS+ und RADIUS in Bezug auf Transport-Protokoll und Verschlüsselung?
*(Antworten im Quiz verfügbar)*

## Häufige Fehler & Fallstricke
- ⚠️ **ACL-Richtung (in vs. out) falsch gesetzt:** \`ip access-group ACL-NAME in\` filtert Traffic, der am Interface eingeht (vom angeschlossenen Netz Richtung Router). \`out\` filtert Traffic, der das Interface verlässt. Eine falsche Richtung kann das komplette Netz sperren.
- ⚠️ **Standard-ACL nah an der Quelle platziert:** Standard-ACLs filtern nur anhand der Quell-IP. Nah an der Quelle platziert blockieren sie unter Umständen den Zugriff auf alle anderen Netze, nicht nur auf das gewünschte Ziel.
- ⚠️ **Implizites deny-all nicht bedacht:** Jede ACL endet mit einem unsichtbaren \`deny any any\`. Wer vergisst, am Ende ein \`permit ip any any\` hinzuzufügen (bei Extended ACLs), sperrt den gesamten restlichen Traffic.
  `.trim(),
};

export const CONCEPT_802_1X: Concept = {
  id: "802.1x-authentication",
  title: "802.1X Port-Based Network Access Control",
  appliesTo: ["ccna"],
  tags: ["security", "802.1x", "dot1x", "authentication", "radius", "eap", "nac"],
  content: `
## 802.1X – Portbasierte Netzwerkzugangskontrolle

### Was ist 802.1X?
IEEE 802.1X ist ein Standard für **portbasierte Netzwerkzugangskontrolle (NAC)**. Ein Switch-Port oder WLAN-Interface bleibt gesperrt, bis sich das Endgerät erfolgreich authentifiziert hat. Erst dann wird der Port geöffnet und Netzwerkzugang gewährt.

### Die drei Rollen (EAP-Dreieck)

| Rolle | Gerät | Aufgabe |
|-------|-------|---------|
| **Supplicant** | Endgerät (PC, Smartphone) | Hat 802.1X-Client-Software, initiiert Authentifizierung |
| **Authenticator** | Switch oder WLAN-AP | Leitet EAP-Pakete zwischen Supplicant und Auth-Server weiter; öffnet/sperrt Port |
| **Authentication Server** | RADIUS-Server (z.B. Cisco ISE) | Prüft Identität und sendet Access-Accept oder Access-Reject |

### Authentifizierungs-Ablauf
\`\`\`
Supplicant       Authenticator (Switch)    Authentication Server (RADIUS)
     |                    |                          |
     |--- EAPOL-Start --→|                          |
     |←-- EAP-Request ---| (Identity)               |
     |--- EAP-Response →→|→→ RADIUS Access-Request →|
     |                   |←← RADIUS Access-Accept ←-|
     |←-- EAP-Success ---|                          |
     |  (Port öffnet)    |                          |
\`\`\`

### Wichtige Begriffe
| Begriff | Erklärung |
|---------|----------|
| **EAP** | Extensible Authentication Protocol — Framework für verschiedene Auth-Methoden |
| **EAPOL** | EAP over LAN — Layer-2-Protokoll zwischen Supplicant und Authenticator |
| **RADIUS** | Authentifizierungsprotokoll zwischen Authenticator und Auth-Server (UDP 1812/1813) |
| **MAB** | MAC Authentication Bypass — für Geräte ohne 802.1X-Client (z.B. Drucker) |
| **Guest VLAN** | VLAN für Geräte, die 802.1X nicht unterstützen |
| **Auth-Fail VLAN** | VLAN für Geräte, die die Authentifizierung nicht bestehen |

### EAP-Methoden (Prüfungsrelevant)
| Methode | Authentifizierung | Sicherheit |
|---------|------------------|-----------|
| **EAP-TLS** | Zertifikate (Client + Server) | Sehr hoch — beidseitige Zertifikate |
| **PEAP** | Server-Zertifikat + Username/Passwort | Hoch — in WPA2-Enterprise üblich |
| **EAP-FAST** | Protected Access Credential (PAC) | Hoch — Cisco-proprietär |

### Cisco IOS Konfiguration (802.1X auf Switch-Port)
\`\`\`
SW1(config)# aaa new-model
SW1(config)# aaa authentication dot1x default group radius
SW1(config)# dot1x system-auth-control
SW1(config)# radius server ISE
SW1(config-radius-server)# address ipv4 192.168.100.10 auth-port 1812 acct-port 1813
SW1(config-radius-server)# key SecretKey123

SW1(config)# interface GigabitEthernet0/1
SW1(config-if)# switchport mode access
SW1(config-if)# dot1x port-control auto     ! auto = 802.1X aktiviert
SW1(config-if)# authentication host-mode single-host

! Verifikation
SW1# show dot1x all
SW1# show authentication sessions
\`\`\`

### Port-Control-Modi
| Modus | Verhalten |
|-------|----------|
| **force-authorized** | Port immer offen (802.1X deaktiviert) — Standard |
| **force-unauthorized** | Port immer gesperrt |
| **auto** | 802.1X aktiv — Port öffnet nur nach erfolgreicher Auth |

### Zusammenfassung: Wo wird 802.1X eingesetzt?
- **Kabelgebunden**: Switchports in Unternehmensnetzwerken (Büros, Konferenzräume)
- **WLAN**: WPA2-Enterprise / WPA3-Enterprise nutzt 802.1X + EAP
- Alternativ zur MAC-basierten Port-Security (sicherer, weil nicht fälschbar)
  `.trim(),
};

export const CONCEPT_SECURITY_PROGRAM: Concept = {
  id: "security-program",
  title: "Security-Programme und Sicherheitsrichtlinien",
  appliesTo: ["ccna"],
  tags: ["security", "policy", "cvss", "incident-response", "vulnerability", "risk"],
  content: `
## Security-Programme und Sicherheitsrichtlinien

### Grundbegriffe: Vulnerability – Threat – Risk
| Begriff | Definition | Beispiel |
|---------|-----------|----------|
| **Vulnerability** | Schwachstelle in einem System oder Prozess | Ungepatchtes Betriebssystem |
| **Threat** | Potenzielle Bedrohung, die eine Vulnerability ausnutzen kann | Malware-Angriff |
| **Exploit** | Werkzeug oder Technik zum Ausnutzen einer Vulnerability | Metasploit-Modul |
| **Risk** | Wahrscheinlichkeit × Schadensausmaß einer Bedrohung | Hohe Wahrscheinlichkeit + hoher Schaden = kritisch |

### CVSS – Common Vulnerability Scoring System
- Industriestandard zur Bewertung von Sicherheitslücken (**0.0 – 10.0**)
- **Basis-Metriken**: Attack Vector, Attack Complexity, Privileges Required, User Interaction, CIA-Impact

| CVSS-Score | Klassifikation |
|-----------|---------------|
| 0.0 | None |
| 0.1 – 3.9 | Low |
| 4.0 – 6.9 | Medium |
| 7.0 – 8.9 | High |
| 9.0 – 10.0 | Critical |

### Sicherheitsrichtlinien (Security Policies)
| Richtlinie | Inhalt |
|-----------|-------|
| **AUP** (Acceptable Use Policy) | Erlaubte und verbotene Nutzung von IT-Ressourcen |
| **Password Policy** | Mindestlänge, Komplexität, Ablaufintervall, Wiederverwendung |
| **Data Classification Policy** | Vertraulich / Intern / Öffentlich |
| **Incident Response Policy** | Verfahren bei Sicherheitsvorfällen |
| **BYOD Policy** | Regeln für private Geräte im Unternehmensnetz |

### Passwort-Richtlinien (Best Practices)
- Mindestlänge: **12 Zeichen** (empfohlen)
- Komplexität: Groß-/Kleinbuchstaben, Zahlen, Sonderzeichen
- Kein Wiederverwenden von Passwörtern (Password-History)
- **MFA** (Multi-Faktor-Authentifizierung) als zusätzliche Schicht
- Cisco IOS: \`security passwords min-length 12\`

### Security Awareness Training
- Ziel: Mitarbeiter als **„Human Firewall"** schulen
- Themen: Phishing-Erkennung, Social Engineering, sichere Passwortverwaltung, Datenschutz
- Regelmäßige Wiederholung (mind. jährlich) + Phishing-Simulationen

### Incident Response – 6 Phasen (NIST SP 800-61)
| Phase | Name | Beschreibung |
|-------|------|-------------|
| 1 | **Preparation** | IR-Plan erstellen, Tools bereitstellen, Team schulen |
| 2 | **Identification** | Vorfall erkennen, klassifizieren, Schwere beurteilen |
| 3 | **Containment** | Ausbreitung stoppen (kurzfristig: Isolation; langfristig: Clean-up) |
| 4 | **Eradication** | Ursache beseitigen (Malware entfernen, Patches einspielen) |
| 5 | **Recovery** | Systeme wiederherstellen, Normalbetrieb verifizieren |
| 6 | **Lessons Learned** | Post-Incident-Review, Dokumentation, Prozessverbesserung |

> **Merkhilfe**: **P-I-C-E-R-L**

### Schwachstellen-Management
- **Vulnerability Scanning**: Automatisierte Suche nach Schwachstellen (z.B. Nessus, OpenVAS)
- **Penetration Testing**: Autorisierter simulierter Angriff
- **Patch Management**: Regelmäßiges Einspielen von Security-Patches
- **CVE** (Common Vulnerabilities and Exposures): Standardisierte Kennung für Schwachstellen
  `.trim(),
};

export const TOPIC_SECURITY: Topic = {
  id: "security",
  title: "Netzwerksicherheit",
  description:
    "CIA-Triad, Angriffstypen, ACLs, Port-Security, DHCP Snooping, DAI, 802.1X und Security-Programme — Netzwerke absichern.",
  conceptIds: [
    "security-fundamentals",
    "acl-standard",
    "acl-extended",
    "acl-named",
    "acl-troubleshooting",
    "acl-wildcard-alignment",
    "port-security",
    "802.1x-authentication",
    "security-program",
    "security-guide",
  ],
  quizIds: [
    "ccna-quiz-security",
    "ccna-quiz-harden-access",
    "ccna-quiz-dhcp-snooping-dai",
    "ccna-quiz-acl",
  ],
  exerciseIds: ["exercise-acl-dmz"],
  prerequisiteTopicIds: ["routing-ospf", "switching-vlans"],
  estimatedMinutes: 150,
  tags: ["security", "acl", "port-security"],
};

export const SECURITY_CONCEPTS: Record<string, Concept> = {
  "security-fundamentals": CONCEPT_SECURITY_FUNDAMENTALS,
  "acl-standard": CONCEPT_ACL_STANDARD,
  "acl-extended": CONCEPT_ACL_EXTENDED,
  "acl-named": CONCEPT_ACL_NAMED,
  "acl-troubleshooting": CONCEPT_ACL_TROUBLESHOOTING,
  "acl-wildcard-alignment": CONCEPT_ACL_WILDCARD_ALIGNMENT,
  "port-security": CONCEPT_PORT_SECURITY,
  "802.1x-authentication": CONCEPT_802_1X,
  "security-program": CONCEPT_SECURITY_PROGRAM,
  "security-guide": CONCEPT_SECURITY_GUIDE,
};
