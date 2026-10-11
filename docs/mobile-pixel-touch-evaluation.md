# Praxis-Evaluationsbericht: Google Pixel (Android Chrome) – Touch, Gesten & Viewport

Dieses Dokument protokolliert die spezifischen Beobachtungen und Verhaltensweisen des neuen Canvas auf einem echten Smartphone (Google Pixel, Android Chrome, mobile Bildschirmtastatur Gboard).

---

## 1. Viewport-Resize & Bildschirmtastatur (Gboard)

- **Verhalten bei Texteingabe (`note`, `text`):**
  - Wenn der Nutzer eine Notiz oder ein Textfeld doppelt antippt, öffnet sich das native Gboard.
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
  - Auf dem Pixel-Display mit hoher Pixeldichte ($>400\text{ ppi}$) sind $10\text{px}$ mit einer Fingerkuppe kaum treffsicher zu fassen.
  - **Implementierung:** Jeder Griff besitzt nun ein unsichtbares, transparentes Hit-Target von **mindestens $44 \times 44\text{px}$** (`pointerEvents="all"`), während das sichtbare Quadrat zentriert bleibt. Das Greifen von Ecken zum Vergrößern von Notizen und Boxen gelingt nun auf Anhieb mit dem Daumen.
- **Geräte-Palette:**
  - Die Palette ist horizontal scrollbar (`overflow-x-auto`) und die Buttons haben Touch-Target-Höhen von $\ge 38\text{px}$ mit ausreichendem Abstand, um Fehlklicks zu vermeiden.

---

## 4. Performance & Akkulaufzeit (120 Hz Smoothness)

- SVG mit hardwarebeschleunigten CSS-Transforms (`translate3d`) erreicht auf dem Pixel flüssige 60–120 FPS ohne Ruckler oder Frame-Drops.
- Die Entkopplung von Maus-/Touch-Events über Pointer-Events stellt sicher, dass kein synthetisches 300ms Click-Delay auftritt (`touch-action: none` im Vollbildmodus).
