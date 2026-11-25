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

const STORAGE_KEY = "harness-tier-list:v5";
const PREFS_KEY = "harness-tier-list:prefs:v5";

interface StoredPrefs {
  showUnranked: boolean;
}

function loadPrefs(): StoredPrefs {
  try {
    const raw = window.localStorage.getItem(PREFS_KEY);
    if (!raw) {
      return { showUnranked: false };
    }
    const parsed = JSON.parse(raw) as Partial<StoredPrefs>;
    return {
      showUnranked: typeof parsed.showUnranked === "boolean" ? parsed.showUnranked : false,
    };
  } catch {
    return { showUnranked: false };
  }
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
    for (const [id, item] of Object.entries(defaults.items)) {
      nextItems[id] = item;
    }

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
  iconDataOrUrl: string | null;
  accentColor: string;
  targetContainer: ContainerId;
}

export function useTierBoard() {
  const [board, setBoard] = useState<TierBoardState>(() => loadBoardState());
  const [prefs, setPrefs] = useState<StoredPrefs>(() => loadPrefs());

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
    setBoard(createDefaultBoardState());
  }, []);

  const toggleUnranked = useCallback(() => {
    setPrefs((prev) => ({ ...prev, showUnranked: !prev.showUnranked }));
  }, []);

  const addCustomHarness = useCallback((input: AddHarnessInput) => {
    const trimmedName = input.name.trim();
    if (!trimmedName) return;
    const id = `custom-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
    const icon =
      input.iconDataOrUrl?.trim() ||
      createMonogramDataUrl(trimmedName, input.accentColor);

    const newItem: HarnessItem = {
      id,
      name: trimmedName,
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
    showUnranked: prefs.showUnranked,
    moveAcrossContainers,
    reorderWithinContainer,
    restoreBoardSnapshot,
    resetToDefault,
    toggleUnranked,
    addCustomHarness,
    removeCustomHarness,
  };
}
