import { useState, useCallback } from "react";
import { NetworkTopology } from "@/types/topology";

export const MAX_HISTORY_STEPS = 30;

export interface TopologyHistoryState {
  past: NetworkTopology[];
  present: NetworkTopology;
  future: NetworkTopology[];
}

export function useTopologyHistory(initialTopology: NetworkTopology) {
  const [history, setHistory] = useState<TopologyHistoryState>({
    past: [],
    present: initialTopology,
    future: [],
  });

  const canUndo = history.past.length > 0;
  const canRedo = history.future.length > 0;

  const undo = useCallback(() => {
    setHistory((curr) => {
      if (curr.past.length === 0) return curr;
      const previous = curr.past[curr.past.length - 1];
      const newPast = curr.past.slice(0, curr.past.length - 1);
      return {
        past: newPast,
        present: previous,
        future: [curr.present, ...curr.future],
      };
    });
  }, []);

  const redo = useCallback(() => {
    setHistory((curr) => {
      if (curr.future.length === 0) return curr;
      const next = curr.future[0];
      const newFuture = curr.future.slice(1);
      return {
        past: [...curr.past, curr.present],
        present: next,
        future: newFuture,
      };
    });
  }, []);

  const setTopology = useCallback(
    (
      newOrFn: NetworkTopology | ((prev: NetworkTopology) => NetworkTopology),
      recordHistory: boolean = true
    ) => {
      setHistory((curr) => {
        const next = typeof newOrFn === "function" ? newOrFn(curr.present) : newOrFn;
        if (next === curr.present) return curr;

        if (!recordHistory) {
          return {
            ...curr,
            present: next,
          };
        }

        const newPast = [...curr.past, curr.present].slice(-MAX_HISTORY_STEPS);
        return {
          past: newPast,
          present: next,
          future: [],
        };
      });
    },
    []
  );

  const resetTopology = useCallback((newInitial: NetworkTopology) => {
    setHistory({
      past: [],
      present: newInitial,
      future: [],
    });
  }, []);

  return {
    topology: history.present,
    setTopology,
    undo,
    redo,
    canUndo,
    canRedo,
    resetTopology,
    historyLength: history.past.length,
  };
}
