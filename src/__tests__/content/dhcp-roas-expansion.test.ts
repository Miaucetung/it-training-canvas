/**
 * DHCP & RoaS Expansion — Integration Tests
 *
 * Covers the targeted CCNA content expansion:
 *   - dhcp-nat Topic: 7 neue Flagship-Concepts (3 → 10)
 *   - ccna-quiz-dhcp: 25 Fragen, ccna-quiz-roas: 10 Fragen
 *   - inter-vlan-routing Doppel-ID-Fix (overview vs. roas)
 *   - 2 neue DHCP-Labs (Relay spiegelt das PT-Lab)
 *   - 2 Intra-CCNA Cross-Reference-Bridges + findRelatedConcepts-Symmetrie
 */

import { describe, it, expect, beforeEach } from "vitest";
import { contentRegistry } from "@/lib/content/content-registry";
import {
  CONCEPT_BRIDGES,
  findRelatedConcepts,
} from "@/lib/content/cross-references";

import ccnaModule from "@/content/modules/ccna";
import {
  TOPIC_DHCP_NAT,
  TOPIC_NAT,
  TOPIC_DNS,
  DHCP_NAT_CONCEPTS,
} from "@/content/modules/ccna/topics/dhcp-nat";
import { TOPIC_VLAN_ADVANCED } from "@/content/modules/ccna/topics/vlan-advanced";
import { CONCEPT_INTER_VLAN_ROUTING_ROAS } from "@/content/modules/ccna/topics/vlan-advanced";
import { CONCEPT_INTER_VLAN_ROUTING_OVERVIEW } from "@/content/modules/ccna/topics/routing-ospf";
import { CCNA_QUIZZES, QUIZ_DHCP, QUIZ_ROAS } from "@/lib/ccna-quiz-content";
import { LABS } from "@/components/LabScenariosDialog";

const NEW_DHCP_CONCEPTS = [
  "dhcp-dora",
  "dhcp-lease",
  "dhcp-options",
  "dhcp-apipa",
  "dhcp-relay",
  "dhcp-troubleshoot",
  "dhcp-snooping",
];

beforeEach(() => {
  // setup.ts leert die Registry vor jedem Test → CCNA neu registrieren
  contentRegistry.register(ccnaModule);
});

describe("dhcp-nat Topic: 7 neue Flagship-Concepts", () => {
  // Seit der Themen-Granularisierung (bessere Auffindbarkeit im Themen-Katalog)
  // haben DNS und NAT eigene Topics ("dns", "nat") statt im dhcp-nat-Topic zu
  // stecken. Die Concepts selbst bleiben unverändert und lösen weiterhin über
  // die gemeinsame DHCP_NAT_CONCEPTS-Registry auf.
  it("Topic hat genau 9 conceptIds (DNS/NAT haben eigene Topics)", () => {
    expect(TOPIC_DHCP_NAT.conceptIds).toHaveLength(9);
    expect(TOPIC_DHCP_NAT.conceptIds).not.toContain("dns");
    expect(TOPIC_DHCP_NAT.conceptIds).not.toContain("nat");
  });

  it("dns und nat resolven weiterhin im Modul, über eigene Topics verlinkt", () => {
    expect(ccnaModule.concepts["dns"]).toBeDefined();
    expect(ccnaModule.concepts["nat"]).toBeDefined();
    expect(TOPIC_DNS.conceptIds).toContain("dns");
    expect(TOPIC_NAT.conceptIds).toContain("nat");
  });

  it("alle 7 neuen DHCP-Concepts sind im Topic referenziert", () => {
    for (const id of NEW_DHCP_CONCEPTS) {
      expect(TOPIC_DHCP_NAT.conceptIds).toContain(id);
    }
  });

  it("jede conceptId resolved in der CONCEPTS-Map und im Modul", () => {
    for (const id of TOPIC_DHCP_NAT.conceptIds) {
      expect(DHCP_NAT_CONCEPTS[id], `map: ${id}`).toBeDefined();
      expect(ccnaModule.concepts[id], `module: ${id}`).toBeDefined();
    }
  });

  it("keine doppelten conceptIds im dhcp-nat Topic", () => {
    const set = new Set(TOPIC_DHCP_NAT.conceptIds);
    expect(set.size).toBe(TOPIC_DHCP_NAT.conceptIds.length);
  });

  it("jedes neue Concept erfüllt den Flagship-Standard (Lernziele + Fehler + IOS)", () => {
    for (const id of NEW_DHCP_CONCEPTS) {
      const c = DHCP_NAT_CONCEPTS[id]!;
      expect(c.content.length, `${id} content length`).toBeGreaterThan(800);
      expect(c.content, `${id} Lernziele`).toContain("Lernziele");
      expect(c.content, `${id} Prüfungsfallen`).toMatch(/Häufige Fehler|Prüfungsfallen/);
      expect(c.content, `${id} IOS-Codeblock`).toContain("```");
    }
  });
});

describe("inter-vlan-routing Doppel-ID-Fix", () => {
  it("overview und roas haben distinkte IDs", () => {
    expect(CONCEPT_INTER_VLAN_ROUTING_OVERVIEW.id).toBe("inter-vlan-routing-overview");
    expect(CONCEPT_INTER_VLAN_ROUTING_ROAS.id).toBe("inter-vlan-routing-roas");
    expect(CONCEPT_INTER_VLAN_ROUTING_OVERVIEW.id).not.toBe(
      CONCEPT_INTER_VLAN_ROUTING_ROAS.id,
    );
  });

  it("die alte kollidierende ID inter-vlan-routing existiert nicht mehr", () => {
    expect(ccnaModule.concepts["inter-vlan-routing"]).toBeUndefined();
  });

  it("beide Varianten sind im Modul auflösbar (keine wird überschrieben)", () => {
    expect(ccnaModule.concepts["inter-vlan-routing-overview"]).toBeDefined();
    expect(ccnaModule.concepts["inter-vlan-routing-roas"]).toBeDefined();
  });

  it("RoaS-Concept enthält die zentralen IOS-Marker", () => {
    const c = CONCEPT_INTER_VLAN_ROUTING_ROAS.content;
    expect(c).toContain("encapsulation dot1q");
    expect(c).toContain("no ip address");
    expect(c).toContain("ip routing"); // L3-Switch-Vergleich
    expect(c).toContain("Lernziele");
  });
});

describe("Quizze: DHCP (25) und RoaS (10)", () => {
  const hasCorrect = (q: { answers: { isCorrect: boolean }[] }) =>
    q.answers.some((a) => a.isCorrect);

  it("ccna-quiz-dhcp hat genau 25 Fragen", () => {
    expect(QUIZ_DHCP.questions).toHaveLength(25);
  });

  it("ccna-quiz-roas hat genau 10 Fragen", () => {
    expect(QUIZ_ROAS.questions).toHaveLength(10);
  });

  it("jede DHCP- und RoaS-Frage hat mindestens eine korrekte Antwort", () => {
    for (const q of [...QUIZ_DHCP.questions, ...QUIZ_ROAS.questions]) {
      expect(hasCorrect(q), `Frage ohne Lösung: ${q.text}`).toBe(true);
    }
  });

  it("Frage-IDs sind innerhalb jedes Quiz eindeutig", () => {
    for (const quiz of [QUIZ_DHCP, QUIZ_ROAS]) {
      const ids = quiz.questions.map((q) => q.id);
      expect(new Set(ids).size).toBe(ids.length);
    }
  });

  it("ccna-quiz-roas ist in CCNA_QUIZZES registriert", () => {
    expect(CCNA_QUIZZES["ccna-quiz-roas"]).toBeDefined();
    expect(CCNA_QUIZZES["ccna-quiz-roas"]).toBe(QUIZ_ROAS);
  });

  it("vlan-advanced Topic verlinkt ccna-quiz-roas", () => {
    expect(TOPIC_VLAN_ADVANCED.quizIds).toContain("ccna-quiz-roas");
  });
});

describe("Neue DHCP-Labs", () => {
  it("dhcp-relay und dhcp-troubleshoot-lab existieren", () => {
    const ids = LABS.map((l) => l.id);
    expect(ids).toContain("dhcp-relay");
    expect(ids).toContain("dhcp-troubleshoot-lab");
  });

  it("dhcp-relay spiegelt das PT-Lab (FSG57, VLAN 51/61/71, helper-address)", () => {
    const lab = LABS.find((l) => l.id === "dhcp-relay")!;
    const blob = JSON.stringify(lab);
    expect(blob).toContain("FSG57");
    expect(blob).toContain("geheim!");
    expect(blob).toContain("encapsulation dot1q 51");
    expect(blob).toContain("ip helper-address 192.168.2.11");
    expect(blob).toContain("192.168.2.11"); // zentraler DHCP-Server
    // alle drei VLANs vertreten
    for (const v of ["51", "61", "71"]) expect(blob).toContain(v);
  });

  it("dhcp-troubleshoot-lab adressiert die drei Fehlerklassen", () => {
    const lab = LABS.find((l) => l.id === "dhcp-troubleshoot-lab")!;
    const blob = JSON.stringify(lab);
    expect(blob).toMatch(/169\.254/);            // APIPA-Symptom
    expect(blob).toMatch(/helper-address/);       // Fehler 1
    expect(blob).toMatch(/excluded-address|Gateway/); // Fehler 2
    expect(blob).toMatch(/interface vlan 1|Vlan1/i);  // Fehler 3 (SVI down)
  });

  it("jedes Lab hat Topologie, Steps und Verify-Befehle", () => {
    for (const id of ["dhcp-relay", "dhcp-troubleshoot-lab"]) {
      const lab = LABS.find((l) => l.id === id)!;
      expect(lab.topology.devices.length).toBeGreaterThan(0);
      expect(lab.topology.connections.length).toBeGreaterThan(0);
      expect(lab.steps.length).toBeGreaterThan(0);
      expect(lab.verifyCommands.length).toBeGreaterThan(0);
    }
  });
});

describe("Intra-CCNA Cross-Reference-Bridges", () => {
  it("beide neuen Bridges existieren (dhcp-relay ↔ roas / vlans)", () => {
    const has = (src: string, tgt: string) =>
      CONCEPT_BRIDGES.some(
        (b) => b.sourceConceptId === src && b.targetConceptId === tgt,
      );
    expect(has("dhcp-relay", "inter-vlan-routing-roas")).toBe(true);
    expect(has("dhcp-relay", "vlans")).toBe(true);
  });

  it("findRelatedConcepts(dhcp-relay) liefert roas und vlans", () => {
    const related = findRelatedConcepts("dhcp-relay", "ccna").map(
      (r) => r.concept.id,
    );
    expect(related).toContain("inter-vlan-routing-roas");
    expect(related).toContain("vlans");
  });

  it("findRelatedConcepts gibt das Concept NICHT als Verweis auf sich selbst zurück", () => {
    for (const id of ["vlans", "inter-vlan-routing-roas", "dhcp-relay"]) {
      const related = findRelatedConcepts(id, "ccna").map((r) => r.concept.id);
      expect(related).not.toContain(id);
    }
  });

  it("vlans verweist (rückwärts) auf dhcp-relay", () => {
    const related = findRelatedConcepts("vlans", "ccna").map((r) => r.concept.id);
    expect(related).toContain("dhcp-relay");
  });
});
