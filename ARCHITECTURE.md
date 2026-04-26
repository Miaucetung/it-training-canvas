# ARCHITECTURE.md — Wie man ein neues Lernmodul hinzufügt

## Überblick

Die App verwendet eine zweistufige Content-Architektur:

1. **Generische Kern-Types** (`src/lib/content/types.ts`) — Framework-Logik, nie modul-spezifisch
2. **Modul-Verzeichnisse** (`src/content/modules/<id>/`) — gesamter Inhalt eines Zertifizierungsmoduls

Bestehende Komponenten (`QuizDialog`, `LearningPathEditor`, `ProgressTracker`) werden **nicht verändert**. Die Adapter-Schicht übersetzt die neuen Typen in die alten.

---

## Ordnerstruktur

```
src/
├── content/
│   ├── modules/
│   │   ├── ccna/                  ← CCNA-Modul (fertig)
│   │   │   ├── index.ts           ← Modul-Definition + Registrierung
│   │   │   └── topics/            ← Pro Thema eine Datei
│   │   │       ├── networking-fundamentals.ts
│   │   │       ├── ipv4-addressing.ts
│   │   │       ├── ipv6.ts
│   │   │       ├── switching-vlans.ts
│   │   │       ├── routing-ospf.ts
│   │   │       ├── dhcp-nat.ts
│   │   │       ├── security.ts
│   │   │       └── wlan.ts
│   │   └── az-900/                ← AZ-900 Stub (2 Topics als Demo)
│   │       └── index.ts
│   └── _shared/                   ← Konzepte, die mehrere Module teilen
│       └── networking/
│           ├── osi-model.ts       ← CONCEPT_OSI_MODEL, etc.
│           └── subnetting.ts      ← CONCEPT_SUBNETTING, etc.
└── lib/
    └── content/
        ├── types.ts               ← Alle generischen Typen
        ├── content-registry.ts    ← Singleton-Registry für Module
        ├── content-loader.ts      ← Dynamisches Laden per import()
        ├── cross-references.ts    ← Konzept-Verknüpfungen zwischen Modulen
        ├── module-catalog.ts      ← Landing-Page-Metadaten
        └── adapters.ts            ← Übersetzt CertificationModule → Quiz/LearningPath
```

---

## Ein neues Modul in 5 Schritten hinzufügen

### Schritt 1 — Ordner anlegen

```
src/content/modules/<modul-id>/
├── index.ts
└── topics/
    └── topic-name.ts
```

Beispiel für CompTIA Network+:

```
src/content/modules/comptia-network-plus/
├── index.ts
└── topics/
    ├── network-fundamentals.ts
    ├── network-implementations.ts
    └── ...
```

---

### Schritt 2 — Topics erstellen

Jede Topic-Datei exportiert:

- `Concept`-Objekte (Lerninhalt als Markdown)
- Ein `Topic`-Objekt (Struktur)
- Ein `Record<string, Concept>` (alle Konzepte dieser Topic)

```typescript
// src/content/modules/comptia-network-plus/topics/network-fundamentals.ts

import type { Topic, Concept } from "@/lib/content/types";

export const CONCEPT_OSI_COMPTIA: Concept = {
  id: "osi-model", // gleiche ID wie CCNA → geteiltes Konzept
  title: "OSI Model",
  appliesTo: ["ccna", "comptia-network-plus"],
  tags: ["networking", "osi", "layer"],
  content: `## OSI Model ...`,
};

export const TOPIC_NETWORK_FUNDAMENTALS: Topic = {
  id: "network-fundamentals",
  title: "Network Fundamentals",
  description: "...",
  conceptIds: ["osi-model"],
  quizIds: ["comptia-quiz-fundamentals"],
  exerciseIds: [],
  estimatedMinutes: 90,
  tags: ["networking", "fundamentals"],
};

export const NETWORK_FUNDAMENTALS_CONCEPTS: Record<string, Concept> = {
  "osi-model": CONCEPT_OSI_COMPTIA,
};
```

**Tipp**: Teile existierende Konzepte aus `src/content/_shared/` statt zu duplizieren.

---

### Schritt 3 — Modul-Index erstellen

```typescript
// src/content/modules/comptia-network-plus/index.ts

import type { CertificationModule } from "@/lib/content/types";
import { contentRegistry } from "@/lib/content/content-registry";
import {
  TOPIC_NETWORK_FUNDAMENTALS,
  NETWORK_FUNDAMENTALS_CONCEPTS,
} from "./topics/network-fundamentals";
// ... weitere imports

const COMPTIA_NETWORK_PLUS: CertificationModule = {
  id: "comptia-network-plus",
  vendor: "comptia",
  title: "CompTIA Network+",
  subtitle: "N10-009 Certification",
  description: "...",
  difficulty: "intermediate",
  examCode: "N10-009",
  estimatedHours: 20,
  topics: [TOPIC_NETWORK_FUNDAMENTALS],
  concepts: { ...NETWORK_FUNDAMENTALS_CONCEPTS },
  quizzes: COMPTIA_QUIZZES,
  exercises: {},
  learningPaths: {},
  metadata: {
    slug: "comptia-network-plus",
    tagline: "...",
    objectives: ["..."],
    targetAudience: ["..."],
    previewImageUrl: "/assets/modules/comptia-network-plus-preview.png",
    priceCents: 0,
    lastUpdated: "2026-01-01",
    certificationBody: "CompTIA",
    featured: false,
    categories: ["networking", "comptia", "certification"],
  },
};

// Auto-registrierung beim Import — kein manueller Aufruf nötig
contentRegistry.register(COMPTIA_NETWORK_PLUS);

export default COMPTIA_NETWORK_PLUS;
```

---

### Schritt 4 — Module Loader eintragen

In `src/lib/content/content-loader.ts` eine Zeile hinzufügen:

```typescript
const MODULE_FACTORIES: Record<string, ModuleFactory> = {
  ccna: () => import("@/content/modules/ccna/index"),
  "az-900": () => import("@/content/modules/az-900/index"),
  // NEU:
  "comptia-network-plus": () =>
    import("@/content/modules/comptia-network-plus/index"),
};
```

**Das ist die einzige Änderung außerhalb des eigenen Modul-Ordners.**

---

### Schritt 5 — (Optional) Catalog-Preview aktualisieren

In `src/lib/content/module-catalog.ts` den `CATALOG_PREVIEW`-Array um das neue Modul erweitern (für statisches Rendering / SEO).

---

## Konzepte zwischen Modulen teilen

### Shared Concepts aus `_shared/`

Wenn ein Konzept (z.B. OSI-Modell) in mehreren Modulen identisch ist:

```typescript
// In deiner Topic-Datei:
import { CONCEPT_OSI_MODEL } from "@/content/_shared/networking/osi-model";

export const MY_CONCEPTS: Record<string, Concept> = {
  "osi-model": CONCEPT_OSI_MODEL, // kein Duplikat!
};
```

### Cross-References (Concept Bridges)

Wenn zwei Module dasselbe Konzept unter verschiedenen Namen kennen (z.B. CCNA-VLAN ↔ Azure VNet-Subnet):

```typescript
// In src/lib/content/cross-references.ts die CONCEPT_BRIDGES erweitern:
{
  sourceConceptId: 'vlans',
  sourceModuleId: 'ccna',
  targetConceptId: 'vnet-subnet',
  targetModuleId: 'az-104',
  bridgeNote: 'VLANs in Cisco-Netzwerken entsprechen in Azure den VNet-Subnetzen.',
},
```

---

## Architektur-Prinzipien

| Prinzip                       | Beschreibung                                                              |
| ----------------------------- | ------------------------------------------------------------------------- |
| **Kein Core-Code ändern**     | Neues Modul = nur neuer Ordner + 1 Zeile in content-loader.ts             |
| **Generische Types**          | Komponenten importieren nur `@/lib/content/types`, nie Modul-spezifisches |
| **Adapter-Pattern**           | `adapters.ts` übersetzt in alte Quiz/LearningPath-Typen                   |
| **ContentProvider-Interface** | Alle Modul-Daten hinter Interface → CMS/Backend austauschbar              |
| **Concept-Tagging**           | Gemeinsame Tags ermöglichen `findRelatedConcepts()`                       |
| **Auto-Registrierung**        | `contentRegistry.register()` im Modul-Index — kein manuelles Wiring       |

---

## ContentProvider — CMS/Backend anbinden

Das `ContentProvider`-Interface in `types.ts` ermöglicht das Austauschen der lokalen TS-Dateien:

```typescript
// Heute: statische TS-Daten (LocalContentProvider)
const provider: ContentProvider = {
  getModule: (id) => loadModule(id),
  listModules: () => contentRegistry.listModules(),
  ...
};

// Morgen: REST-API oder Strapi/Contentful
const provider: ContentProvider = {
  getModule: (id) => fetch(`/api/modules/${id}`).then(r => r.json()),
  listModules: () => fetch('/api/modules').then(r => r.json()),
  ...
};
```

Komponenten erhalten den Provider per Context — keine Code-Änderungen nötig.

---

## Dateien, die bei jedem neuen Modul NICHT geändert werden

- `src/lib/types.ts` — bestehende App-Typen
- `src/components/*` — alle UI-Komponenten
- `src/lib/content/types.ts` — generische Content-Typen
- `src/lib/content/content-registry.ts` — Registry selbst
- `src/lib/content/adapters.ts` — Adapter-Logik

Einzig **content-loader.ts** (eine Zeile) und optional **module-catalog.ts** (Eintrag im Preview-Array) werden angepasst.
