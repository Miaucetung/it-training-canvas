# Anleitung zur Nutzung der IT-Training-Canvas App

Willkommen zur IT-Training-Canvas App! Diese Anleitung erklärt die grundlegende Nutzung der Anwendung.

## 1. Start der Anwendung

1. Stelle sicher, dass alle Abhängigkeiten installiert sind:
   ```bash
   npm install
   ```
2. Starte die App im Entwicklungsmodus:
   ```bash
   npm run dev
   ```
3. Öffne deinen Browser und gehe zu [http://localhost:5173](http://localhost:5173).

## 2. Überblick über die Benutzeroberfläche

- **Canvas:** Hauptbereich zum Zeichnen und Bearbeiten von Netzwerkdiagrammen.
- **Sidebar:** Werkzeuge, Vorlagen und Einstellungen.
- **Toolbar:** Schnelle Aktionen wie Rückgängig, Wiederholen, Speichern, Exportieren.
- **Minimap:** Übersicht über das gesamte Canvas.

## 3. Grundfunktionen

### Netzwerkdiagramm erstellen
1. Ziehe Netzwerkkomponenten (z.B. Router, Switches) aus der Sidebar auf das Canvas.
2. Verbinde Komponenten durch Ziehen von Verbindungslinien.
3. Konfiguriere Eigenschaften über das Eigenschaften-Panel.

### Simulation starten
1. Das Simulations-Panel erscheint unten mittig im Fenster, sobald mindestens zwei Netzwerkobjekte korrekt verbunden sind. Dort findest du einen Play-Button (▶️), mit dem du die Simulation startest. Das Panel enthält außerdem weitere Steuerelemente wie Pause, Stopp und Geschwindigkeit.
   
   **Hinweis:** Falls das Panel nicht sichtbar ist, prüfe, ob du mindestens zwei Netzwerkobjekte mit einer Verbindung auf dem Canvas platziert hast. Das Panel wird nur angezeigt, wenn eine Simulation möglich ist.

   **Achtung:** Manche Vorlagen oder Szenarien unterstützen keine Simulation. In diesem Fall erscheint das Simulations-Panel nicht, auch wenn Netzwerkobjekte vorhanden sind.
2. Beobachte, wie Pakete durch das Netzwerk fließen.
3. Analysiere die Ergebnisse im Dashboard.

### Speichern und Exportieren
- Speichere dein Projekt über das Menü „Datei > Speichern“.
- Exportiere das Diagramm als Bild oder JSON-Datei.

## 4. Weitere Funktionen

- **Quiz & Lernpfade:** Interaktive Lernmodule und Quizfragen.
- **Präsentationsmodus:** Zeige dein Netzwerk im Präsentationsmodus.
- **Teilen:** Exportiere oder teile dein Projekt mit anderen.

## 5. Tastenkürzel (Beispiele)
- `Strg + Z`: Rückgängig
- `Strg + Y`: Wiederholen
- `Entf`: Löschen eines Elements

## 6. Hilfe & Support
- Bei Fragen siehe die Datei `README.md` oder kontaktiere das Entwicklerteam.

Viel Erfolg beim Arbeiten mit der IT-Training-Canvas App!