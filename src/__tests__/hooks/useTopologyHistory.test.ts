// @vitest-environment jsdom
import { describe, expect, it } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useTopologyHistory } from "@/hooks/useTopologyHistory";
import { NetworkTopology } from "@/types/topology";

describe("useTopologyHistory Hook (Undo/Redo)", () => {
  const initial: NetworkTopology = {
    version: "2.0",
    id: "init",
    name: "Initial",
    devices: [],
    links: [],
  };

  it("initializes with initial topology and empty history", () => {
    const { result } = renderHook(() => useTopologyHistory(initial));
    expect(result.current.topology.id).toBe("init");
    expect(result.current.canUndo).toBe(false);
    expect(result.current.canRedo).toBe(false);
  });

  it("pushes new states and enables undo", () => {
    const { result } = renderHook(() => useTopologyHistory(initial));

    const step1: NetworkTopology = { ...initial, name: "Step 1" };
    act(() => {
      result.current.setTopology(step1);
    });

    expect(result.current.topology.name).toBe("Step 1");
    expect(result.current.canUndo).toBe(true);
    expect(result.current.canRedo).toBe(false);

    // Undo back to initial
    act(() => {
      result.current.undo();
    });

    expect(result.current.topology.name).toBe("Initial");
    expect(result.current.canUndo).toBe(false);
    expect(result.current.canRedo).toBe(true);

    // Redo back to step 1
    act(() => {
      result.current.redo();
    });

    expect(result.current.topology.name).toBe("Step 1");
    expect(result.current.canUndo).toBe(true);
    expect(result.current.canRedo).toBe(false);
  });

  it("clears future redo stack when a new mutation happens after undo", () => {
    const { result } = renderHook(() => useTopologyHistory(initial));

    act(() => {
      result.current.setTopology({ ...initial, name: "Step 1" });
    });
    act(() => {
      result.current.setTopology({ ...initial, name: "Step 2" });
    });
    act(() => {
      result.current.undo();
    });

    expect(result.current.topology.name).toBe("Step 1");
    expect(result.current.canRedo).toBe(true);

    // Now push step 3 instead
    act(() => {
      result.current.setTopology({ ...initial, name: "Step 3" });
    });

    expect(result.current.topology.name).toBe("Step 3");
    expect(result.current.canRedo).toBe(false); // Redo cleared
  });

  it("supports unrecorded updates (e.g. live drag moves)", () => {
    const { result } = renderHook(() => useTopologyHistory(initial));

    act(() => {
      result.current.setTopology({ ...initial, name: "Dragging" }, false);
    });

    expect(result.current.topology.name).toBe("Dragging");
    expect(result.current.canUndo).toBe(false); // Not recorded in past
  });
});
