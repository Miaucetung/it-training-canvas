import { describe, it, expect } from "vitest";
import { ccnaQuestions } from "@/data/ccnaQuestions";
import { ccnaQuestionsClassified } from "@/data/ccnaQuestionsClassified";
import { classifyOption, isCliBlockKind, splitCliOption } from "@/lib/cli-option";

const norm = (s: string) => s.replace(/\s+/g, " ").trim();
const allOptions = (list: Array<{ id: string; options: string[] }>) => list.flatMap((q) => q.options.map((text, index) => ({ id: q.id, index, text })));
const exam = allOptions(ccnaQuestions);
const classified = allOptions(ccnaQuestionsClassified);
const optionOf = (id: string, letter: string) => ccnaQuestions.find((q) => q.id === id)!.options["ABCDEFG".indexOf(letter)];

describe("splitCliOption: Zeichenerhalt (reine Anzeigefunktion)", () => {
  for (const [name, list] of [
    ["ccnaQuestions", exam],
    ["ccnaQuestionsClassified", classified],
  ] as const) {
    it(`${name}: zusammengesetzte Zeilen ergeben für jede erkannte Option genau den Originaltext`, () => {
      const violations: string[] = [];
      let blocks = 0;
      for (const o of list) {
        const lines = splitCliOption(o.text);
        if (!lines) continue;
        blocks++;
        const joined = o.text.includes("\n") ? lines.join("\n") : lines.join(" ");
        if (norm(joined) !== norm(o.text)) violations.push(`${o.id} Option ${o.index}`);
        if (lines.some((l) => l.trim() === "")) violations.push(`${o.id} Option ${o.index}: leere Zeile`);
      }
      expect(violations).toEqual([]);
      expect(blocks).toBeGreaterThan(250);
    });
  }

  it("Prüfungspool: genau 280 erkannte Optionen (157 Mehrfach-Prompts, 111 Konfiguration, 8 show-Ausgabe, 4 mit Umbruch)", () => {
    const kinds = exam.map((o) => classifyOption(o.text).kind);
    const count = (k: string) => kinds.filter((x) => x === k).length;
    expect(count("mehrzeilig mit Prompts")).toBe(157);
    expect(count("Konfiguration ohne Prompt")).toBe(111);
    expect(count("show-Ausgabe")).toBe(8);
    expect(count("Zeilenumbruch bereits im Text")).toBe(4);
    expect(exam.filter((o) => splitCliOption(o.text) !== null)).toHaveLength(280);
  });

  it("Prüfungspool: 912 Einzelbefehle und alle übrigen Optionen liefern null (bleiben unverändert)", () => {
    const singles = exam.filter((o) => classifyOption(o.text).kind === "Einzelbefehl");
    expect(singles).toHaveLength(912);
    const others = exam.filter((o) => !isCliBlockKind(classifyOption(o.text).kind));
    expect(others).toHaveLength(912 + 3321);
    expect(others.every((o) => splitCliOption(o.text) === null)).toBe(true);
  });

  it("klassifizierter Pool: 284 erkannte Optionen, 911 Einzelbefehle", () => {
    expect(classified.filter((o) => splitCliOption(o.text) !== null)).toHaveLength(284);
    expect(classified.filter((o) => classifyOption(o.text).kind === "Einzelbefehl")).toHaveLength(911);
  });
});

describe("splitCliOption: Zerlegung typischer Fälle", () => {
  it("Mehrfach-Prompts: neue Zeile vor jedem Prompt", () => {
    expect(splitCliOption(optionOf("q0446", "A"))).toEqual(["R3(config)#interface fastethernet 0/0", "R3(config-if)#ip ospf priority 0"]);
    expect(splitCliOption(optionOf("q0904", "C"))).toEqual(["R1(config-if)#ip address 10.10.10.1 255.255.255.248", "R2(config-if)#ip address 10.10.10.4 255.255.255.248"]);
  });

  it("Prompt mit mehreren Befehlen: Befehlsanfänge trennen, switchport ... vlan bleibt zusammen", () => {
    expect(splitCliOption(optionOf("q0109", "A"))).toEqual([
      "R7# interface FastEthernet1/0",
      "ip address 10.88.31.127 255.255.255.192",
      "R8# interface FastEthernet0/0",
      "ip address 10.19.63.95 255.255.255.240",
      "R9# interface FastEthernet1/1",
      "ip address 10.23.98.159 255.255.255.224",
    ]);
    expect(splitCliOption(optionOf("q1050", "A"))).toContain("Switch(config-if)#switchport trunk encapsulation dot1q");
  });

  it("Konfiguration ohne Prompt: Zeile je Befehl, „no switchport“ und „!“ eigene Zeilen", () => {
    expect(splitCliOption(optionOf("q0014", "A"))).toEqual(["interface e0/0", "description to XX-AXXX:XXXXX", "ip address 10.2.1.3 255.255.255.252"]);
    expect(splitCliOption(optionOf("q0200", "C"))).toEqual(["interface port-channel 10", "no switchport", "ip address 172.16.0.1 255.255.255.0"]);
    expect(splitCliOption(optionOf("q0306", "A"))).toContain("!");
  });

  it("show-Ausgabe: Gateway-Zeile und eine Zeile je Route", () => {
    expect(splitCliOption(optionOf("q0942", "B"))).toEqual(["Gateway of last resort is 172.16.1.1 to network 0.0.0.0", "o E2 10.0.0.0/8 [110/5] via 192.168.1.1, 0:01:00, Ethernet0"]);
    expect(splitCliOption(optionOf("q0493", "A"))).toEqual(["S 192.168.0.0/20 [1/0] via 10.1.1.1"]);
  });

  it("vorhandene Umbrüche (q0846) bleiben als Zeilen erhalten", () => {
    expect(splitCliOption(optionOf("q0846", "A"))).toEqual(["switchport mode trunk", "switchport trunk native vlan 321", "switchport trunk allowed vlan 100,200,300"]);
  });

  it("Einzelbefehle und normale Antwortsätze: null", () => {
    expect(splitCliOption("no shutdown")).toBeNull();
    expect(splitCliOption("R1(config)#ip route 0.0.0.0 0.0.0.0 10.0.0.1")).toBeNull();
    expect(splitCliOption("The router forwards the packet to the next hop.")).toBeNull();
    expect(splitCliOption("")).toBeNull();
  });

  it("Tippfehler im Original bleiben sichtbar und unkorrigiert", () => {
    expect(splitCliOption(optionOf("q0487", "A"))).toContain("R2(config)#intergface gi0/0");
    expect(splitCliOption(optionOf("q0584", "D"))!.join(" ")).toContain("passwordcisco123");
  });
});
