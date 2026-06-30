# Original-Prompt: ACL Wildcard Block-Alignment (Vertiefung)

> Diese Datei wird unverändert im Repo abgelegt unter
> `apps/ccna/docs/prompts/acl-wildcard-alignment-original-prompt.md`
> Vor jedem Phasen-Stopp gilt: **Lies diese Datei erneut, bevor du fortfährst.**
> Scope-Reduktion ist nur erlaubt, wenn sie hier explizit benannt und mir gemeldet wird.

## Kontext

Modul: ACL (Teil der Phase Wireless/ACL, nach Subnetting).
Bestehender ACL-Drill (`ACL-Drill`-Komponente) hat bereits einen Trainingsmodus
"IP-Bereich" (Wildcard, Lesen, Schreiben, Bereiche, Named & Advanced — gegen die Uhr).
Beobachtetes Problem in der Praxis: Anwender berechnen Wildcard-Bereiche korrekt
in der Größe, ignorieren aber **Block-Ausrichtung** (z.B. `permit 192.168.20.46
0.0.0.31` statt `permit 192.168.20.32 0.0.0.31`). Das Konzept "Block-Ausrichtung"
fehlt aktuell als eigenständiger Lerninhalt — nur das Endergebnis ("falsch/richtig")
wird im Drill angezeigt, nicht das WARUM.

## Ziel dieser Vertiefung

Ein neues Concept **"Wildcard Block-Ausrichtung"** im ACL-Modul, das die Lücke
zwischen "ich kenne die Blockgröße" und "ich weiß, wo der Block beginnen darf"
schließt. Kein neues Topic, sondern eine Erweiterung des bestehenden ACL-Topics
(gleiche Stufe wie die VLAN-Vertiefung als didaktischer Referenzstandard).

## Pflichtinhalte (analog VLAN-Vertiefungs-Verdichtungsgrad)

### 1. Erklärtext (300–500 Wörter, eigene Formulierung, kein Copy-Paste aus Chat)

Muss folgende Punkte abdecken:
- Warum Wildcard-Bits = "egal"-Bits sind und was der Router mit gesetzten
  "egal"-Bits in der angegebenen Adresse tatsächlich macht (rundet auf
  Blockanfang ab)
- Formel: Blockgröße = Wildcard + 1
- Regel: Startadresse mod Blockgröße = 0 (Teilbarkeitsprobe als Haupttrick,
  ohne Binär-Pflicht)
- Trailing-Zeros-Trick (Binärdarstellung, Nullen von rechts zählen = max.
  mögliche Blockgröße ab dieser Zahl)
- Greedy-Zerlegung einer beliebigen Range in minimale, lückenlose Blöcke
  (von unten beginnend, jeweils größtmöglichen ausgerichteten Block wählen)
- Kurzer Hinweis auf Weg B (Subnetz-Permit + Rand-Deny) als Alternative,
  mit Einordnung wann das sinnvoller ist als Weg A

### 2. Mindestens 2 vollständig durchgerechnete Beispiele

- Ein "falsches" Beispiel wie im Screenshot (192.168.20.46–95 über 3 Zeilen,
  inkl. Aufschlüsselung warum Zeile 1 und 2 falsch ausgerichtet sind)
- Ein zweites Beispiel mit anderer Range/anderem Subnetz, das die korrekte
  Zerlegung von Grund auf zeigt (nicht nur Korrektur eines Fehlers)

### 3. Block-Grenzen-Referenztabelle

Wildcard → Blockgröße → gültige Startwerte (0–255), analog zur Tabelle aus
diesem Chat. Als statische Tabelle im Content, nicht als Diagramm.

### 4. Statisches Diagramm (1 Stück, SVG, im bestehenden Diagramm-Stil des Moduls)

Zeigt: Zahlenstrahl mit Block-Highlight, gewünschte vs. tatsächliche Range,
und die Binär-Aufschlüsselung (welche Bits "egal" sind). Orientierung am
Diagramm-Stil der VLAN- und Subnetting-Module (gleiche Komponenten/Farbsystem
wiederverwenden, kein neuer Diagrammtyp).

### 5. Erweiterung des bestehenden ACL-Drills (IP-Bereich-Modus)

Nach einer falschen Antwort im Drill: zusätzlich zur bestehenden
"Nicht korrekt"-Anzeige (zu viel erlaubt / nicht erlaubt) soll bei
Alignment-Fehlern (Startadresse nicht durch Blockgröße teilbar) ein
spezifischer Hinweistext erscheinen, der die Teilbarkeitsprobe nennt
(z.B. "46 ÷ 32 = Rest 14 → nicht ausgerichtet, Block beginnt bei 32").
Kein neuer Hint-Typ für andere Fehlerarten (z.B. komplett falsche
Wildcard-Größe) — nur für den Alignment-Fall.

### 6. Quiz-Erweiterung

5–8 neue Fragen, ausschließlich zu Block-Ausrichtung (nicht zu ACL-Grundlagen
allgemein, die sind bereits abgedeckt). Mischung aus:
- "Ist diese Zeile ausgerichtet? Ja/Nein + warum" (Multiple Choice)
- "Welche Blockgröße braucht diese Wildcard?" (Multiple Choice)
- Mindestens 2 Fragen mit Greedy-Zerlegung einer Range in mehrere Zeilen
  (Reihenfolge der korrekten Permit-Zeilen als Drag & Drop oder Matching,
  falls die App diesen Fragetyp bereits unterstützt — sonst Multiple Choice
  als Fallback und das im PR explizit vermerken)

### 7. Cross-Reference

Verweis auf das bestehende Subnetting-Modul (Blockgrößen-Konzept ist dort
in anderem Kontext — Subnetzgrößen statt Wildcard-Bereiche — bereits
eingeführt). Cross-Reference muss über das bestehende cross-references-System
aus `_shared/` laufen, nicht hardcodiert.

## Nicht im Scope

- Kein neuer ACL-Drill-Modus (nur Erweiterung des bestehenden IP-Bereich-Modus)
- Keine Änderung an Named-ACL- oder Advanced-Modus
- Kein Refactoring der bestehenden Drill-Bewertungslogik über den
  Alignment-Hinweis hinaus
- Keine neue Diagrammkomponente — bestehende Komponenten wiederverwenden

## Reihenfolge der Arbeit (STRIKT)

1. Bestandsaufnahme: bestehendes ACL-Topic, Drill-Komponente, vorhandene
   Diagramm-/Quiz-Patterns sichten. Mir berichten, bevor Inhalt geschrieben wird.
2. Diesen Original-Prompt als Datei im Repo ablegen
   (`apps/ccna/docs/prompts/acl-wildcard-alignment-original-prompt.md`)
3. Erklärtext + Beispiele + Tabelle schreiben → mir zur Durchsicht zeigen
4. Diagramm bauen
5. Drill-Hinweistext implementieren
6. Quiz-Fragen schreiben
7. Cross-Reference eintragen

Bei jedem Stopp-Punkt zwischen den Schritten: vor Fortsetzung erneut diesen
Prompt aus der Datei lesen, nicht aus dem Gesprächsverlauf rekonstruieren.

## Definition of Done

- [ ] Erklärtext vorhanden, 300–500 Wörter, eigene Formulierung
- [ ] Mindestens 2 vollständig durchgerechnete Beispiele (eines davon neu,
      nicht nur Fehlerkorrektur)
- [ ] Block-Grenzen-Referenztabelle als Content-Tabelle vorhanden
- [ ] 1 statisches SVG-Diagramm im bestehenden Modul-Stil
- [ ] Drill-Hinweistext für Alignment-Fehler im IP-Bereich-Modus implementiert
- [ ] 5–8 neue Quiz-Fragen, ausschließlich zu Block-Ausrichtung
- [ ] Cross-Reference zu Subnetting-Modul über `_shared/`-System eingetragen
- [ ] Original-Prompt-Datei im Repo abgelegt
- [ ] Granulare Commits (mind. 1 pro Punkt oben, deutsche Commit-Messages)
- [ ] `npx vitest run` grün
- [ ] `npm run build` grün
- [ ] PR-Beschreibung mit Vorher-Nachher-Tabelle pro Punkt der DoD-Liste

Kein Punkt der DoD-Liste darf bei der Fertigmeldung stillschweigend fehlen.
Falls ein Punkt aus technischen Gründen nicht umsetzbar ist (z.B. Drag & Drop
nicht unterstützt), das explizit im PR benennen statt kommentarlos auslassen.
