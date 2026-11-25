import { useCallback, useEffect, useState } from "react";
import { arrayMove } from "@dnd-kit/sortable";
import {
  ALL_CONTAINER_IDS,
  type ContainerId,
  type HarnessItem,
  type TierBoardState,
} from "../types";
import {
  createDefaultBoardState,
  createMonogramDataUrl,
  getIconPath,
} from "../data/harnesses";

const STORAGE_KEY = "harness-tier-list:v1";
const PREFS_KEY = "harness-tier-list:prefs:v1";

interface StoredPrefs {
  showScores: boolean;
  showUnranked: boolean;
}

function loadBoardState(): TierBoardState {
  const defaults = createDefaultBoardState();
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaults;
    const parsed: unknown = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") return defaults;

    const candidate = parsed as Partial<TierBoardState>;
    if (!candidate.tiers || !candidate.items) return defaults;

    const nextItems: Record<string, HarnessItem> = {};
    // Preserve built-in items with fresh relative icon paths
    for (const [id, item] of Object.entries(defaults.items)) {
      nextItems[id] = item;
    }
    // Restore valid custom items
    for (const [id, item] of Object.entries(candidate.items)) {
      if (
        item &&
        typeof item === "object" &&
        typeof item.id === "string" &&
        typeof item.name === "string" &&
        typeof item.icon === "string"
      ) {
        if (item.isCustom) {
          nextItems[id] = {
            id: item.id,
            name: item.name,
            score: typeof item.score === "string" ? item.score : null,
            icon: item.icon,
            isCustom: true,
          };
        } else if (defaults.items[id]) {
          nextItems[id] = {
            ...defaults.items[id],
            icon: getIconPath(id),
          };
        }
      }
    }

    const seen = new Set<string>();
    const nextTiers: Record<ContainerId, string[]> = {
      S: [],
      A: [],
      B: [],
      C: [],
      D: [],
      F: [],
      unranked: [],
    };

    for (const containerId of ALL_CONTAINER_IDS) {
      const list = candidate.tiers[containerId];
      if (!Array.isArray(list)) continue;
      for (const itemId of list) {
        if (typeof itemId === "string" && nextItems[itemId] && !seen.has(itemId)) {
          seen.add(itemId);
          nextTiers[containerId].push(itemId);
        }
      }
    }

    // Ensure any newly introduced default items aren't lost
    for (const containerId of ALL_CONTAINER_IDS) {
      for (const itemId of defaults.tiers[containerId]) {
        if (!seen.has(itemId)) {
          seen.add(itemId);
          nextTiers[containerId].push(itemId);
        }
      }
    }

    return { tiers: nextTiers, items: nextItems };
  } catch {
    return defaults;
  }
}

function loadPrefs(initialUnrankedCount: number): StoredPrefs {
  try {
    const raw = window.localStorage.getItem(PREFS_KEY);
    if (!raw) {
      return { showScores: true, showUnranked: initialUnrankedCount > 0 };
    }
    const parsed = JSON.parse(raw) as Partial<StoredPrefs>;
    return {
      showScores: typeof parsed.showScores === "boolean" ? parsed.showScores : true,
      showUnranked:
        typeof parsed.showUnranked === "boolean"
          ? parsed.showUnranked || initialUnrankedCount > 0
          : initialUnrankedCount > 0,
    };
  } catch {
    return { showScores: true, showUnranked: initialUnrankedCount > 0 };
  }
}

export function findContainerForItem(
  tiers: Record<ContainerId, string[]>,
  itemId: string,
): ContainerId | null {
  for (const containerId of ALL_CONTAINER_IDS) {
    if (tiers[containerId].includes(itemId)) {
      return containerId;
    }
  }
  return null;
}

export interface AddHarnessInput {
  name: string;
  score: string | null;
  iconDataOrUrl: string | null;
  accentColor: string;
  targetContainer: ContainerId;
}

export function useTierBoard() {
  const [board, setBoard] = useState<TierBoardState>(() => loadBoardState());
  const [prefs, setPrefs] = useState<StoredPrefs>(() =>
    loadPrefs(board.tiers.unranked.length),
  );

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(board));
    } catch {
      // Ignore storage quota errors cleanly
    }
  }, [board]);

  useEffect(() => {
    try {
      window.localStorage.setItem(PREFS_KEY, JSON.stringify(prefs));
    } catch {
      // Ignore storage quota errors cleanly
    }
  }, [prefs]);

  const moveAcrossContainers = useCallback(
    (
      itemId: string,
      fromContainer: ContainerId,
      toContainer: ContainerId,
      targetIndex: number,
    ) => {
      if (fromContainer === toContainer) return;
      setBoard((prev) => {
        const sourceList = prev.tiers[fromContainer];
        const destList = prev.tiers[toContainer];
        if (!sourceList.includes(itemId)) return prev;

        const nextSource = sourceList.filter((id) => id !== itemId);
        const clampedIndex = Math.max(0, Math.min(targetIndex, destList.length));
        const nextDest = [
          ...destList.slice(0, clampedIndex),
          itemId,
          ...destList.slice(clampedIndex),
        ];

        return {
          ...prev,
          tiers: {
            ...prev.tiers,
            [fromContainer]: nextSource,
            [toContainer]: nextDest,
          },
        };
      });
    },
    [],
  );

  const reorderWithinContainer = useCallback(
    (containerId: ContainerId, activeId: string, overId: string) => {
      if (activeId === overId) return;
      setBoard((prev) => {
        const list = prev.tiers[containerId];
        const oldIndex = list.indexOf(activeId);
        const newIndex = list.indexOf(overId);
        if (oldIndex === -1 || newIndex === -1 || oldIndex === newIndex) {
          return prev;
        }
        return {
          ...prev,
          tiers: {
            ...prev.tiers,
            [containerId]: arrayMove(list, oldIndex, newIndex),
          },
        };
      });
    },
    [],
  );

  const restoreBoardSnapshot = useCallback((snapshot: TierBoardState) => {
    setBoard(snapshot);
  }, []);

  const resetToDefault = useCallback(() => {
    const fresh = createDefaultBoardState();
    setBoard(fresh);
  }, []);

  const toggleScores = useCallback(() => {
    setPrefs((prev) => ({ ...prev, showScores: !prev.showScores }));
  }, []);

  const toggleUnranked = useCallback(() => {
    setPrefs((prev) => ({ ...prev, showUnranked: !prev.showUnranked }));
  }, []);

  const addCustomHarness = useCallback((input: AddHarnessInput) => {
    const trimmedName = input.name.trim();
    if (!trimmedName) return;
    const trimmedScore = input.score?.trim() || null;
    const id = `custom-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
    const icon =
      input.iconDataOrUrl?.trim() ||
      createMonogramDataUrl(trimmedName, input.accentColor);

    const newItem: HarnessItem = {
      id,
      name: trimmedName,
      score: trimmedScore,
      icon,
      isCustom: true,
    };

    setBoard((prev) => ({
      items: { ...prev.items, [id]: newItem },
      tiers: {
        ...prev.tiers,
        [input.targetContainer]: [...prev.tiers[input.targetContainer], id],
      },
    }));

    if (input.targetContainer === "unranked") {
      setPrefs((prev) => ({ ...prev, showUnranked: true }));
    }
  }, []);

  const removeCustomHarness = useCallback((itemId: string) => {
    setBoard((prev) => {
      const target = prev.items[itemId];
      if (!target?.isCustom) return prev;
      const nextItems = { ...prev.items };
      delete nextItems[itemId];
      const nextTiers = { ...prev.tiers };
      for (const containerId of ALL_CONTAINER_IDS) {
        nextTiers[containerId] = nextTiers[containerId].filter((id) => id !== itemId);
      }
      return { items: nextItems, tiers: nextTiers };
    });
  }, []);

  return {
    board,
    showScores: prefs.showScores,
    showUnranked: prefs.showUnranked,
    moveAcrossContainers,
    reorderWithinContainer,
    restoreBoardSnapshot,
    resetToDefault,
    toggleScores,
    toggleUnranked,
    addCustomHarness,
    removeCustomHarness,
  };
}
