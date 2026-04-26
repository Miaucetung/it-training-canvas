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

---

## Gamification Coverage & Testing

### Coverage-Schwellen (vitest.config.ts)

| Metrik | Mindestwert | Aktuell (gesamt) |
|--------|-------------|------------------|
| Lines | 85% | ~96% |
| Functions | 85% | ~91% |
| Branches | 70% | ~92% |

**Ziele für `src/lib/gamification/state/`:**

| Datei | Lines | Branches | Funcs | Ziel |
|-------|-------|----------|-------|------|
| `achievement-engine.ts` | 100% | 94.2% | 100% | Branches >90% ✅ |
| `progress-store.ts` | 100% | 92.85% | 100% | ✅ |
| `streak-engine.ts` | 100% | 100% | 100% | ✅ |
| `xp-engine.ts` | 100% | 90.9% | 100% | ✅ |

### Coverage lokal ausführen

```bash
npm run test:coverage          # Einmalig, generiert /coverage/index.html
npm run test:watch             # Watch-Modus während Entwicklung
```

Der HTML-Report unter `coverage/index.html` zeigt rote/gelbe Markierungen für
nicht-abgedeckte Branches direkt in der Datei-Ansicht.

### Dateien bewusst nicht auf 100%

| Datei | Abgedeckt | Begründung |
|-------|-----------|------------|
| `lib/gamification/index.ts` | 0% | Barrel-Export, keine Logik |
| `lib/gamification/types.ts` | 0% | Nur TypeScript-Typen, keine Laufzeit-Logik |
| `lib/gamification/notifications.ts` | 0% | UI-Hilfsfunktion, im Coverage-Scope enthalten aber React-Kontext nötig |
| `lib/content/module-catalog.ts` | 0% | Lazy-loaded, nur in UI-Context aufrufbar |
| `xp-engine.ts` lines 49,69 | 95% | Defensive Null-Guards in unreachable Branches |

### Wie schreibe ich einen Integration-Test?

Integration-Tests testen den kompletten Pfad **User-Action → Event → Engine → Persistenz**
ohne React-Rendering, ohne echtes LocalStorage und ohne echte Timer.

```typescript
// src/__tests__/gamification/integration.test.ts

describe('Mein Feature', () => {
  // ── Setup ────────────────────────────────────────────────
  // Fake localStorage via in-memory Map
  const mockStorage = createMockStorage();
  vi.stubGlobal('localStorage', mockStorage);

  // Fake clock auf einen festen Tag setzen
  setClock({ now: () => 1704067200000, today: () => '2024-01-01' });

  afterEach(() => {
    gamificationBus.unsubscribeAll(); // keine Subscriber-Leaks zwischen Tests
    resetClock();                     // Clock zurücksetzen
    vi.unstubAllGlobals();            // localStorage wiederherstellen
  });

  // ── Der eigentliche Test ─────────────────────────────────
  it('XP wird korrekt vergeben', () => {
    const store = new LocalStorageProgressStore();
    let state = store.load(); // startet leer (Fake-Storage ist leer)

    // 1. Event durch die komplette Pipeline schicken
    const event: GamificationEvent = {
      id: 'topic-1',
      type: 'topic_completed',
      timestamp: Date.now(),
      payload: { topicId: 'subnetting', moduleId: 'ccna', estimatedMinutes: 10 },
    };
    let s = applyXpEvent(state, event);   // XP berechnen
    s = updateStreak(s, event);           // Streak aktualisieren
    s = checkAllAchievements(s, event);   // Achievements prüfen

    // Event in History aufnehmen und speichern
    s = { ...s, eventHistory: [...s.eventHistory, { id: event.id, type: event.type, timestamp: event.timestamp, payload: event.payload }] };
    store.save(s);

    // 2. Erwartungen prüfen
    expect(s.xpTotal).toBe(50);           // TOPIC_COMPLETED = 50 XP
    expect(s.streak.currentStreak).toBe(1);

    // 3. Persistenz verifizieren: Reload muss identisch sein
    const reloaded = store.load();
    expect(reloaded.xpTotal).toBe(50);
  });
});
```

**Was du in Integration-Tests NICHT tust:**
- `vi.mock` auf die Engine selbst — du nutzt die echten Module
- Echte Timer (nutze `setClock()` aus `@/lib/gamification/clock`)
- `window.localStorage` direkt — nutze `vi.stubGlobal('localStorage', createMockStorage())`
- React-Komponenten rendern — das ist Aufgabe der UI-Smoke-Tests in `src/__tests__/components/`

**Wenn ein Integration-Test einen Bug aufdeckt:** STOPP. Nicht still fixen.
Den Bug im PR beschreiben, separate Fix-PR erstellen.

