# Audit-Skripte (Claude, Phase 1)

Alle Skripte sind rein lesend. Sie laufen NICHT in `npm test` (eigene Konfiguration, Endung `.audit.ts`).

    npx vitest run -c scripts/audit/vitest.audit.config.ts --disableConsoleIntercept   # alle *.audit.ts
    node scripts/audit/contrast.mjs                                                   # WCAG-Kontrast neu berechnen

| Skript | Prüft |
|---|---|
| labs.audit.ts | Anzahl Labs, Duplikate, Kategorien, LABS_ORDERED |
| lab-topology-dump.audit.ts | Geräte/Links/IPs der 4 Lab-Topologien + CLI-Zeilen der Labs |
| cli-and-subnet.audit.ts | CLI-Generator-Ausgaben, Subnetzrechner-Grenzfälle, EtherChannel-Matrix, Link-Regeln |
| blueprint.audit.ts | Lektion → Blueprint-Bereich |
| data-counts.audit.ts | Anzahl Fragen / Drag-and-Drop |
| contrast.mjs | Tabelle in docs/redesign-konzept.md gegen src/index.css |

## Browser-Audit (question-rendering.mjs)

Die Skripte steuern die Dialoge über `window.__auditApp`, `__examPrepState`, `__quizDialogState`, `__dragDropState`, `__prioritizedLearningState` und `__AUDIT_NO_SHUFFLE__` (`src/lib/audit-hooks.ts`). Diese Hooks gibt es nur im Dev-Server (`npm run dev`, Port über `PORT` einstellbar, Standard 5000) oder in einem Build mit `VITE_AUDIT_HOOKS=1`; der Produktionsbuild enthält sie nicht (Test `src/__tests__/build/audit-hooks-bundle.test.ts`).

| Skript | Zweck |
|---|---|
| analyze-overlaps.mjs | wertet `.local/rendering_audit_results.json` aus (Label-Überlappungen in Exhibits: Anzahl, betroffene Fragen, häufigste Paare); nur lesend |
| generate-inhaltliche-befunde.mjs | erzeugt `docs/fragen-darstellung/INHALTLICHE-BEFUNDE.md` aus `.local/pdf_comparison_report.json` und `ccnaQuestions.ts`; schreibt die Datei neu (Aufruf: `node --experimental-strip-types …`) |
| test-phase2-verification.mjs | prüft im Dev-Server (Standard-Port 5000, per `BASE_URL`/`APP_URL` anpassbar; Hooks aktiv) Phase-2-Korrekturen: CLI-Hervorhebung erst nach Prüfen, Platzhalter-Hinweis, leere Exhibits |

## Dev-Server-Port

`vite.config.ts` liest den Port aus `PORT` (Standard 5000). Feste Zuordnung: **Claude Code 5000, Gemini 5001**. Die Skripte nutzen `BASE_URL` (a11y-sweep, svg-label-contrast) bzw. `APP_URL` (übrige e2e-Skripte); Beispiel für den zweiten Port: `PORT=5001 npm run dev` und `BASE_URL=http://localhost:5001 node scripts/e2e/a11y-sweep.mjs`.
