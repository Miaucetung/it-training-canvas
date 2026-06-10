# App-Upgrade Musterprompt

Dieses Dokument ist ein Prompt-Template für Claude Code, um eine bestehende Lern-/Quiz-App systematisch auf Produktionsqualität zu bringen. Basiert auf dem CCNA-Trainingsprojekt (ajti).

---

## Prompt (kopieren und anpassen)

```
Du bist Code-Assistent für dieses Projekt. Führe einen systematischen Qualitäts-Upgrade durch.
Stack: [STACK EINTRAGEN — z.B. React 19, TypeScript, Vite, Tailwind, shadcn/ui, Supabase]
Sprache: [UI-Sprache — z.B. Deutsch]
Deployment: [z.B. Docker → Kubernetes / Vercel / Cloudflare Pages]

Gehe die folgenden Punkte der Reihe nach durch. Warte nach jedem Block auf Bestätigung.

---

## BLOCK 1 — Bewertung & Bestandsaufnahme

1. Lies CLAUDE.md, package.json und die wichtigsten Komponenten.
2. Gib eine ehrliche Bewertung (1–10) mit Tabelle:
   - Was funktioniert gut
   - Was fehlt oder ist gebrochen
   - Grösste Risiken für Nutzer
3. Priorisiere: Was hat den grössten Lerneffekt für Nutzer?

---

## BLOCK 2 — Content-Integration

Falls die App Quiz-/Lernfragen aus einer JSON-Datei oder einem externen Fetch lädt:
- Prüfe ob der Fetch tatsächlich funktioniert (404? leer?)
- Falls statische Daten vorhanden: ersetze den Fetch durch direkten Import
- Falls kein Content vorhanden: frage nach der Datenquelle

Falls eine grosse Content-Datei (>200 KB) statisch importiert wird:
- Wechsle zu dynamischem Import in useEffect:
  ```typescript
  useEffect(() => {
    import("@/lib/content-file").then(({ DATA }) => {
      setState(prev => Object.keys(prev).length === 0 ? DATA : prev);
    });
  }, []);
  ```
- Füge in vite.config.ts manualChunks hinzu:
  ```typescript
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('content-file')) return 'app-content';
          if (id.includes('@supabase')) return 'vendor-supabase';
        }
      }
    }
  }
  ```

---

## BLOCK 3 — Supabase Auth (optional, non-breaking)

Implementiere Auth so dass die App OHNE Login weiterläuft (localStorage bleibt primär).
Eingeloggte Nutzer bekommen Cloud-Sync als Upgrade.

Schritte:
1. Erstelle src/lib/supabase.ts mit createClient
2. Erstelle src/hooks/useAuth.ts:
   - getSession() on mount
   - onAuthStateChange listener
   - PASSWORD_RECOVERY event → isRecoveryMode: boolean
3. Erstelle src/hooks/useProgressSync.ts:
   - On sign-in: fetch remote progress, merge (remote wins), push local-only entries
   - Debounced 2s push bei Änderungen
   - prevUserId ref verhindert Re-Sync
4. Erstelle src/components/AuthDialog.tsx:
   - Tabs: Anmelden / Registrieren
   - Passwort-vergessen Link → Reset-View (Passwort-Feld verschwindet)
   - Zurück-Button im Reset-View
   - translateError() für deutsche Fehlermeldungen
5. Erstelle src/components/SetPasswordDialog.tsx:
   - Wird gezeigt wenn isRecoveryMode === true (nach Klick auf Recovery-E-Mail)
   - supabase.auth.updateUser({ password }) nach Bestätigung
6. Supabase SQL Migration:
   ```sql
   create table user_progress (
     id uuid primary key default gen_random_uuid(),
     user_id uuid references auth.users on delete cascade,
     path_id text not null,
     data jsonb not null default '{}',
     updated_at timestamptz default now(),
     unique(user_id, path_id)
   );
   alter table user_progress enable row level security;
   create policy "own data" on user_progress
     using (auth.uid() = user_id) with check (auth.uid() = user_id);
   ```
7. .env.production (committed, anon key ist public by design):
   ```
   VITE_SUPABASE_URL=https://xxx.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJ...
   ```
8. vitest.config.ts env-Block für CI:
   ```typescript
   env: {
     VITE_SUPABASE_URL: "https://placeholder.supabase.co",
     VITE_SUPABASE_ANON_KEY: "test-anon-key",
   }
   ```

---

## BLOCK 4 — Lernmodi (falls Quiz-App)

Implementiere drei Modi im Prüfungssimulator:

**Lernmodus:** Frage für Frage, sofortiges Feedback + Erklärung nach Antwort

**Prüfungsmodus:**
- Konstante: `const EXAM_TIME_SECONDS = 120 * 60`
- setInterval alle 1000ms, auto-submit bei t <= 1
- Timer rot wenn timeLeft < 600 (unter 10 Min)
- Kein Feedback während der Session, alle Ergebnisse am Ende

**Schwächen-Drill (SRS):**
- localStorage Key für falsch beantwortete Fragen-IDs
- Bei falscher Antwort: ID hinzufügen → speichern
- Bei richtiger Antwort: ID entfernen → speichern (Frage gemeistert)
- Drill-Button disabled wenn keine Schwächefragen vorhanden
- Niemals alert() — immer toast() aus sonner

---

## BLOCK 5 — Dead-Code-Audit

Führe folgende Checks durch und liste Findings mit Datei + Zeile:

```bash
# Ungenutzte Imports in src/
grep -r "from 'gsap'\|from 'three'\|from 'd3'\|from 'lottie-react'" src/

# Ungenutzte Komponenten (exportiert aber nie importiert)
# Für jede Komponente in src/components/:
grep -r "ComponentName" src/ | grep -v "ComponentName.tsx"

# console.log/warn/error (ausser in Error-Handlers)
grep -rn "console\." src/ --include="*.ts" --include="*.tsx"

# Packages ohne Import
# package.json dependencies durchgehen, für jeden:
grep -r "from 'package-name'" src/
```

Dann:
- Lösche tote Komponenten-Dateien
- Deinstalliere Packages mit 0 Imports: `npm uninstall pkg1 pkg2 ...`
- console.log in Error-Handlers BEHALTEN (try/catch, EventBus etc.)
- Build-Verifikation nach jeder Deinstallation: `npm run build`

---

## BLOCK 6 — Content-Qualität

Falls die App Quiz-Fragen enthält, lies alle NEUEN oder ungetesteten Quizze durch:

Prüfe je Frage:
1. Ist die als korrekt markierte Antwort tatsächlich korrekt?
2. Ist die Erklärung fachlich präzise (keine missverständlichen Timer-Reihenfolgen, keine falschen AD-Werte)?
3. Sind die Distraktoren (falsche Antworten) plausibel aber eindeutig falsch?
4. Gibt es doppelte Fragen-IDs? (`grep -c "id: uid()" file.ts`)

Häufige Fehlerquellen:
- Administrative Distanz: Connected=0, Static=1, EIGRP=90, OSPF=110, RIP=120, ExtEIGRP=170, Unknown=255
- Timer-Reihenfolgen: Start-Zeitpunkt vs. Dauer nicht verwechseln
- Protokoll-Details: Multicast-Adressen, Port-Nummern, RFC-Nummern

---

## BLOCK 7 — CI/CD-Härtung

Prüfe .github/workflows/:
- Werden Secrets korrekt als GitHub Secrets übergeben (nicht hardcoded)?
- Gibt es einen separaten Test-Job vor dem Build?
- Nutzt vitest.config.ts den `env`-Block für Test-Env-Vars?
- Ist `coverage/` in .gitignore?

Falls Kubernetes-Deployment:
- kubectl rollout status mit --timeout
- Immer `no-cache: true` beim Docker-Build im CI

---

## BLOCK 8 — Abschluss-Bewertung

Gib eine aktualisierte Bewertung (1–10) mit:
- Was sich seit Block 1 verbessert hat
- Verbleibende Lücken (ehrlich, nicht schönreden)
- Konkrete nächste Schritte nach Priorität

Dann: commit + push mit aussagekräftiger Commit-Message.
```

---

## Checkliste nach Abschluss

- [ ] `npm run build` fehlerfrei
- [ ] `npm test` grün (inkl. CI-Env-Vars in vitest.config.ts)
- [ ] Keine ungenutzten Dependencies in package.json
- [ ] Keine toten Komponenten-Dateien
- [ ] Auth funktioniert ohne Login (localStorage bleibt primär)
- [ ] Password-Reset-Flow vollständig (E-Mail senden + neues Passwort setzen)
- [ ] Bundle: grosse Content-Dateien lazy geladen
- [ ] Quiz-Content fachlich geprüft
- [ ] Alle alert() durch toast() ersetzt
- [ ] .env.production committed (anon keys sind public by design)
- [ ] coverage/ in .gitignore

## Typische Rating-Sprünge

| Von | Auf | Massnahmen |
|-----|-----|------------|
| 5–6 | 7 | Content-Integration, CI grün, keine 404-Fehler |
| 7 | 8 | Supabase Auth, Bundle-Splitting, Dead-Code-Audit |
| 8 | 9 | Content-Qualität geprüft, alle Modi implementiert, vollständiger Auth-Flow |
| 9 | 10 | Mobile UX, PWA/Offline, Lernstatistik-Dashboard |
