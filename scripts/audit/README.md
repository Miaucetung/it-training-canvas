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
