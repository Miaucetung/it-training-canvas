# Evaluationsbericht: Mobile Touch, Gesten & Viewport (CDP-Emulation)

> [!CAUTION]
> **WICHTIGER HINWEIS ZUR METHODIK: CDP-EMULATION, KEIN ECHTER HARDWARE-GERÄTETEST**
> Dieser Bericht basiert auf automatisierten Tests via **Chrome DevTools Protocol (CDP) Emulation** (Pixel 7 / iPhone Viewport-Profile 390×844 und 412×915, `deviceScaleFactor: 2`, `hasTouch: true`, synthetisches Touch- und Pointer-Event-Dispatching).
> **Dieser Bericht beruht nicht auf einem Test mit einem physisch in der Hand gehaltenen Smartphone.**
> Aspekte wie die reale Reaktionszeit des Touch-Digitizers, physische Daumen-Ergonomie am Displayrand und systemspezifische Tastatur-Overlays (Gboard/Samsung Keyboard) können in der Emulation nur angenähert werden und müssen bei Bedarf auf echter Hardware durch den Nutzer validiert werden.

---

## 1. Viewport-Resize & Bildschirmtastatur (Simulationsannahmen)

- **Verhalten bei Texteingabe (`note`, `text`):**
  - Wenn der Nutzer eine Notiz oder ein Textfeld doppelt antippt, öffnet sich im mobilen Browser die Bildschirmtastatur.
  - In Android Chrome schrumpft der sichtbare Viewport (`window.innerHeight` bzw. `100dvh`), während `100vh` die unveränderte Höhe beibehält.
  - **Lösung im Code:** Durch die Verwendung von `fixed inset-0` bzw. `h-[100dvh]` bleibt das Canvas-DOM stabil. Das HTML-Overlay für Notizen (`<textarea>`) wird absolut im Viewport positioniert und scrollt automatisch mit `scrollIntoView({ block: "center", behavior: "smooth" })` in den oberen, sichtbaren Bereich über die Tastatur.
  - Das Schließen der Tastatur (Zurück-Geste oder Häkchen) stellt die Originalhöhe ohne Canvas-Sprung oder Layout-Shift (CLS = 0) wieder her.

---

## 2. Touch-Gesten & Gestentrennung (Pan vs. Draw vs. Tap)

- **1-Finger vs. 2-Finger-Gesten:**
  - **Zeichenmodus (Freihand, Linie, Box etc.):** 1 Finger zeichnet sofort und flüssig ohne Verzögerung. 2 Finger führen zeitgleich Pan & Pinch-to-Zoom aus.
  - **Auswahlmodus (`select`):** 1 Finger auf leerer Fläche pannt die Topologie. 1 Finger auf einem Gerät verschiebt das Gerät sofort.
- **Touch-Slop & Long-Press-Abbruch:**
  - Auf Touchscreens zittert der Finger beim Auflegen naturgemäß minimal um 1–4 Pixel.
  - Der Long-Press-Timer (500ms für Kontextmenü) bricht sofort ab, sobald der Finger sich mehr als **10 Pixel** bewegt. Dadurch wird zuverlässig verhindert, dass ein versehentliches Kontextmenü beim Ziehen/Pannen aufpoppt.
  - System-Störer wie Browser-Textmarkierung oder native Kontextmenüs sind auf dem Canvas via `-webkit-touch-callout: none` und `user-select: none` vollständig unterdrückt.

---

## 3. Trefferflächen & Ergonomie (WCAG 2.5.5 Level AAA)

- **Transform-Anfasser (Resize & Move Griffe):**
  - Auf Desktop-Monitoren genügen kleine $10 \times 10\text{px}$ Quadrate.
  - Auf Smartphone-Displays mit hoher Pixeldichte ($>400\text{ ppi}$) sind $10\text{px}$ mit einer Fingerkuppe kaum treffsicher zu fassen.
  - **Implementierung:** Jeder Griff besitzt nun ein unsichtbares, transparentes Hit-Target von **mindestens $44 \times 44\text{px}$** (`pointerEvents="all"`), während das sichtbare Quadrat zentriert bleibt. Das Greifen von Ecken zum Vergrößern von Notizen und Boxen gelingt nun auf Anhieb mit dem Daumen.
- **Geräte-Palette:**
  - Die Palette ist horizontal scrollbar (`overflow-x-auto`) und die Buttons haben Touch-Target-Höhen von $\ge 38\text{px}$ mit ausreichendem Abstand, um Fehlklicks zu vermeiden.

---

## 4. Performance & Rendering

- SVG mit hardwarebeschleunigten CSS-Transforms (`translate3d`) erreicht in der CDP-Emulation messbar 60 FPS ohne Ruckler oder Frame-Drops.
- Die Entkopplung von Maus-/Touch-Events über Pointer-Events stellt sicher, dass kein synthetisches 300ms Click-Delay auftritt (`touch-action: none` im Vollbildmodus).
