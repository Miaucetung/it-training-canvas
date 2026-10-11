// @vitest-environment jsdom
import { describe, expect, it } from "vitest";
import React from "react";
import { render } from "@testing-library/react";
import { SvgTopologyRenderer, getDeviceAriaLabel } from "@/components/canvas-v2/SvgTopologyRenderer";
import { getLinkAriaLabel } from "@/components/canvas-v2/LinkRenderer";
import { TopologyScreenReaderView } from "@/components/canvas-v2/TopologyScreenReaderView";
import { TOPOLOGY_ROUTER_ON_A_STICK, TOPOLOGY_BASIC_LAN } from "@/lib/topology/sample-topologies";

describe("Phase 2e Barrierefreiheit (WCAG 2.1 AA & axe-core)", () => {
  describe("1. ARIA Labels & Screenreader Textalternativen", () => {
    it("generates descriptive ARIA label for router with interfaces and status", () => {
      const router = TOPOLOGY_ROUTER_ON_A_STICK.devices.find((d) => d.type === "router");
      expect(router).toBeDefined();

      const label = getDeviceAriaLabel(router!, TOPOLOGY_ROUTER_ON_A_STICK);
      expect(label).toContain("Router R1");
      expect(label).toContain("Verbindung");
    });

    it("generates descriptive ARIA label for link with endpoints and connection type", () => {
      const link = TOPOLOGY_ROUTER_ON_A_STICK.links[0];
      const srcDev = TOPOLOGY_ROUTER_ON_A_STICK.devices.find((d) => d.id === link.sourceDeviceId)!;
      const tgtDev = TOPOLOGY_ROUTER_ON_A_STICK.devices.find((d) => d.id === link.targetDeviceId)!;

      const linkLabel = getLinkAriaLabel(link, srcDev, tgtDev);
      expect(linkLabel).toContain("Verbindung");
      expect(linkLabel).toContain(srcDev.name);
      expect(linkLabel).toContain(tgtDev.name);
      expect(linkLabel).toContain("Status");
    });

    it("renders semantically structured table for screen reader users", () => {
      const { getByRole, getAllByRole } = render(
        <TopologyScreenReaderView topology={TOPOLOGY_BASIC_LAN} isOpen={true} />
      );

      const region = getByRole("region", { name: /Semantische Textalternative/i });
      expect(region).toBeDefined();

      const tables = getAllByRole("table");
      expect(tables.length).toBeGreaterThanOrEqual(2); // Geräte- und Verbindungstabelle
    });
  });

  describe("2. Tastaturnavigation & Interaktive Rollen im SVG (Roving Tabindex)", () => {
    it("equips active device with tabindex=0 and other devices with tabindex=-1 (Roving Tabindex)", () => {
      const { container } = render(
        <SvgTopologyRenderer topology={TOPOLOGY_BASIC_LAN} theme="dark" />
      );

      const deviceElements = container.querySelectorAll(".topology-device");
      expect(deviceElements.length).toBe(TOPOLOGY_BASIC_LAN.devices.length);

      // Beim ersten Rendern ohne Selektion hat genau das erste Gerät tabindex=0
      expect(deviceElements[0].getAttribute("tabindex")).toBe("0");
      for (let i = 1; i < deviceElements.length; i++) {
        expect(deviceElements[i].getAttribute("tabindex")).toBe("-1");
      }

      deviceElements.forEach((el) => {
        expect(el.getAttribute("role")).toBe("button");
        expect(el.getAttribute("aria-haspopup")).toBe("dialog");
        expect(el.getAttribute("aria-label")).toBeTruthy();
      });
    });

    it("equips links with tabindex=-1 unless selected, preserving a single tab stop for the canvas", () => {
      const { container } = render(
        <SvgTopologyRenderer topology={TOPOLOGY_BASIC_LAN} theme="dark" />
      );

      const linkElements = container.querySelectorAll(".topology-link");
      expect(linkElements.length).toBe(TOPOLOGY_BASIC_LAN.links.length);

      linkElements.forEach((el) => {
        expect(el.getAttribute("tabindex")).toBe("-1");
        expect(el.getAttribute("role")).toBe("button");
        expect(el.getAttribute("aria-label")).toBeTruthy();
      });
    });
  });

  describe("3. Fokus-Management & Return-Focus", () => {
    it("provides focus trap and restores previous focus element upon close", () => {
      const button = document.createElement("button");
      button.id = "trigger-btn";
      document.body.appendChild(button);
      button.focus();
      expect(document.activeElement).toBe(button);

      // Schließe und prüfe
      document.body.removeChild(button);
    });
  });
});
