# TESTING.md — Leitfaden für Modul-Tests

Dieses Dokument erklärt, wie Tests für ein neues Content-Modul geschrieben werden.
Als Beispiel dient ein fiktives `comptia-network-plus`-Modul.

---

## Voraussetzungen

- Node.js 20+
- `npm install` ausgeführt
- `vitest` und `@vitest/coverage-v8` sind bereits als devDependencies installiert

## Befehle

```bash
npm test               # Alle Tests einmalig ausführen
npm run test:watch     # Watch-Modus (bei Dateiänderung neu starten)
npm run test:coverage  # Tests + Coverage-Report in /coverage/
```

---

## Ordnerstruktur für Tests

Tests liegen in `src/__tests__/content/`. Eine neue Test-Datei pro Bereich:

```
src/__tests__/
  setup.ts                           # Registry-Reset (wird von vitest.config.ts geladen)
  content/
    content-registry.test.ts         # ✅ vorhanden
    content-loader.test.ts           # ✅ vorhanden
    adapters.test.ts                 # ✅ vorhanden
    cross-references.test.ts         # ✅ vorhanden
    validators.test.ts               # ✅ vorhanden
```

Für ein neues Modul schreibst du **eine Test-Datei**: `validators.test.ts` enthält bereits Modul-Validierungslogik — erweiterst du diese, oder du erstellst eine dedizierte Datei:

```
src/__tests__/content/modules/
  comptia-network-plus.test.ts
```

---

## Schritt-für-Schritt: Neues Modul absichern

### 1. Hilfsfunktion: `makeValidModule()`

Definiere in deiner Test-Datei eine Factory, die ein **minimal valides Modul** erzeugt.
Diese Factory ist die Basis für alle Fehlerfälle — du änderst gezielt ein Feld.

```typescript
import { describe, it, expect } from 'vitest';
import type { CertificationModule } from '@/lib/content/types';
import { validateModule } from '@/lib/content/validators';

function makeValidModule(overrides: Partial<CertificationModule> = {}): unknown {
  const base: CertificationModule = {
    id: 'comptia-network-plus',
    metadata: {
      title: 'CompTIA Network+',
      vendor: 'comptia',
      slug: 'comptia-network-plus',   // muss gleich id sein!
      certificationCode: 'N10-009',
      level: 'associate',
      description: 'Herstellerneutrales Netzwerk-Fundament',
      tags: ['networking', 'comptia'],
      estimatedHours: 80,
      prerequisites: [],
      language: 'de',
    },
    topics: [
      {
        id: 'network-plus-fundamentals',
        title: 'Netzwerkgrundlagen',
        description: 'OSI-Modell, Protokolle, Medien',
        conceptIds: ['np-osi-model'],
        quizIds: [],
        exerciseIds: [],
        estimatedMinutes: 90,
        tags: ['osi', 'fundamentals'],
      },
    ],
    concepts: {
      'np-osi-model': {
        id: 'np-osi-model',
        title: 'OSI-Modell (Network+)',
        content: '## OSI\nDas OSI-Modell hat 7 Schichten.',
        appliesTo: ['comptia-network-plus'],
        tags: ['osi', 'networking'],
      },
    },
    learningPath: {
      id: 'network-plus-path',
      title: 'Network+ Lernpfad',
      description: 'Strukturierter Weg zur Network+-Zertifizierung',
      steps: [],
      certificationTarget: 'N10-009',
    },
    quizzes: {},
    exercises: [],
  };

  return { ...base, ...overrides };
}
```

> **Warum `unknown` zurückgeben?** Die `validateModule()`-Funktion akzeptiert `unknown`,
> weil sie der Einstiegspunkt für externe/unbekannte Daten ist. So kannst du gezielt
> kaputte Objekte übergeben, ohne TypeScript-Fehler in den Tests.

---

### 2. Happy-Path-Test: Modul ist valide

```typescript
describe('CompTIA Network+ Modul', () => {
  it('valides Modul besteht die Validierung', () => {
    const result = validateModule(makeValidModule());
    expect(result.id).toBe('comptia-network-plus');
    expect(result.topics).toHaveLength(1);
  });
});
```

---

### 3. Pflicht-Fehlerfälle

Jedes neue Modul **muss** diese Fehlerfälle abdecken:

```typescript
describe('Schema-Fehler', () => {
  it('schlägt fehl wenn id fehlt', () => {
    const bad = makeValidModule();
    delete (bad as Record<string, unknown>)['id'];
    expect(() => validateModule(bad)).toThrow(/id/i);
  });

  it('schlägt fehl wenn topics leer ist', () => {
    const bad = makeValidModule({ topics: [] });
    expect(() => validateModule(bad))
      .toThrow(/mindestens 1 Topic/i);
  });

  it('schlägt fehl bei doppelten Topic-IDs', () => {
    const topic = (makeValidModule() as CertificationModule).topics[0];
    const bad = makeValidModule({ topics: [topic, topic] });
    expect(() => validateModule(bad))
      .toThrow(/Duplikat.*Topic-IDs/i);
  });

  it('schlägt fehl wenn metadata.slug ≠ id', () => {
    const bad = makeValidModule();
    ((bad as CertificationModule).metadata as unknown as Record<string, unknown>)['slug'] = 'wrong-slug';
    expect(() => validateModule(bad))
      .toThrow(/slug.*id/i);
  });

  it('schlägt fehl bei unbekannten Prerequisites', () => {
    const bad = makeValidModule();
    (bad as CertificationModule).topics[0].prerequisiteTopicIds = ['does-not-exist'];
    expect(() => validateModule(bad))
      .toThrow(/unbekannte.*prerequisite/i);
  });
});
```

---

### 4. Cross-Reference-Test

Wenn dein Modul Cross-References zu anderen Modulen definiert, teste sie:

```typescript
import { findRelatedConcepts } from '@/lib/content/cross-references';

describe('Cross-References Network+', () => {
  it('findet Subnetting-Konzept aus _shared', () => {
    // Subnetting ist in _shared definiert und für ccna + az-900 relevant
    // Wenn Network+ appliesTo: ['ccna'] aufnehmen würde, käme es hier vor
    const results = findRelatedConcepts('subnetting', 'comptia-network-plus');
    // Network+ hat noch keinen Bridge — leeres Array ist korrekt
    expect(results).toEqual([]);
  });

  it('gibt leeres Array für unbekannte Konzepte', () => {
    const results = findRelatedConcepts('does-not-exist', 'comptia-network-plus');
    expect(results).toEqual([]);
  });
});
```

> Um echte Cross-References zu erstellen, füge `ConceptBridge`-Einträge in
> `src/lib/content/cross-references.ts` hinzu.

---

### 5. Adapter-Test

Stelle sicher, dass deine Topics korrekt in Quiz- und LearningPath-Format konvertiert werden:

```typescript
import { extractQuizzes, extractLearningPaths } from '@/lib/content/adapters';

describe('Adapter Network+', () => {
  it('extractQuizzes gibt leeres Objekt zurück wenn keine Quizzes vorhanden', () => {
    const module = validateModule(makeValidModule());
    const quizzes = extractQuizzes(module);
    expect(quizzes).toEqual({});
  });

  it('extractLearningPaths gibt Pfad zurück wenn vorhanden', () => {
    const module = validateModule(makeValidModule());
    const paths = extractLearningPaths(module);
    // Unser Stub hat einen leeren LearningPath
    expect(paths).toHaveLength(1);
    expect(paths[0].id).toBe('network-plus-path');
  });
});
```

---

### 6. Registry-Isolation verstehen

> **Wichtig:** Die Registry ist ein Singleton. Wenn Modul-Dateien importiert werden,
> registrieren sie sich automatisch (Side-Effect am Datei-Ende). Zwischen Tests
> wird die Registry zurückgesetzt via `_resetForTesting()`.

Diese Reset-Logik ist in `src/__tests__/setup.ts` definiert und läuft automatisch
`beforeEach` / `afterEach`. Du musst nichts weiter tun — aber **du darfst nicht**
auf Registry-Zustand aus einem anderen Test bauen.

```typescript
// ❌ FALSCH — vertraut auf Zustand aus vorherigem Test
it('findet das zuvor geladene Modul', () => {
  const m = contentRegistry.getModuleSync('comptia-network-plus');
  expect(m).toBeDefined(); // kann fehlschlagen!
});

// ✅ RICHTIG — Modul selbst laden/registrieren
it('findet das Modul nach explizitem Laden', async () => {
  await loadModule('comptia-network-plus');
  const m = contentRegistry.getModuleSync('comptia-network-plus');
  expect(m).toBeDefined();
});
```

---

## Checkliste für ein neues Modul

Bevor ein neues Modul in `main` gemerged wird, müssen folgende Tests grün sein:

- [ ] `validateModule(MEIN_MODUL)` wirft keine Fehler
- [ ] `validateModule({ ...MEIN_MODUL, topics: [] })` wirft Fehler
- [ ] `validateModule({ ...MEIN_MODUL, topics: [t, t] })` wirft Fehler bei Duplikaten
- [ ] `validateModule({ ...MEIN_MODUL, topics: [{ ...t, prerequisiteTopicIds: ['x'] }] })` wirft Fehler
- [ ] `loadModule('mein-modul-id')` resolves erfolgreich
- [ ] `loadModule('mein-modul-id')` zweimal aufgerufen → kein doppelter Registry-Eintrag
- [ ] `extractQuizzes()` + `extractLearningPaths()` laufen fehlerfrei
- [ ] Cross-References: wenn ConceptBridges hinzugefügt, `findRelatedConcepts()` testen

---

## Coverage-Ziel

```bash
npm run test:coverage
```

Ziel: **>85% Lines** auf `src/lib/content/` und `src/content/`.

Aktueller Stand (nach CCNA + AZ-900 + Tests):

| Bereich | Lines | Branches | Funktionen |
|---------|-------|----------|------------|
| `src/lib/content/` | 88.49% | 86.53% | 86.44% |
| `src/content/modules/` | 100% | 100% | 100% |
| `src/content/_shared/` | 100% | 100% | 100% |
| **Gesamt** | **92.16%** | **86.53%** | **86.44%** |

---

## Häufige Fallstricke

| Problem | Ursache | Lösung |
|---------|---------|--------|
| `"Module already registered"` Warning | Modul-Datei auto-registriert sich + `loadModule()` auch | Erwartet, kein Bug |
| Test schlägt fehl weil Registry voll | Fehlende Reset-Isolation | Sicherstellen, dass `setup.ts` in `vitest.config.ts` eingetragen ist |
| `validateModule` wirft unerwarteten Fehler | `slug` stimmt nicht mit `id` überein | `metadata.slug === module.id` ist Pflicht |
| TypeScript-Fehler in Test-Datei | `any` benutzt | `unknown` + Type-Guards oder `as CertificationModule` |

---

*Stand: CCNA + AZ-900 vollständig implementiert, 76 Tests, 92% Coverage.*
