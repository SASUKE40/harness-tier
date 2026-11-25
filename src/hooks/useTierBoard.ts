import { useCallback, useEffect, useState } from "react";
import { arrayMove } from "@dnd-kit/sortable";
import {
  ALL_CONTAINER_IDS,
  DEFAULT_SORT_PRESET,
  isSortPresetId,
  type ContainerId,
  type HarnessItem,
  type SortPresetId,
  type TierBoardState,
} from "../types";
import {
  createBoardStateForPreset,
  createMonogramDataUrl,
  getIconPath,
} from "../data/harnesses";

const STORAGE_KEY = "harness-tier-list:v2";
const PREFS_KEY = "harness-tier-list:prefs:v2";

interface StoredPrefs {
  showScores: boolean;
  showUnranked: boolean;
  sortPreset: SortPresetId;
}

function loadPrefs(): StoredPrefs {
  try {
    const raw = window.localStorage.getItem(PREFS_KEY);
    if (!raw) {
      return {
        showScores: true,
        showUnranked: false,
        sortPreset: DEFAULT_SORT_PRESET,
      };
    }
    const parsed = JSON.parse(raw) as Partial<StoredPrefs>;
    return {
      showScores: typeof parsed.showScores === "boolean" ? parsed.showScores : true,
      showUnranked: typeof parsed.showUnranked === "boolean" ? parsed.showUnranked : false,
      sortPreset: isSortPresetId(parsed.sortPreset)
        ? parsed.sortPreset
        : DEFAULT_SORT_PRESET,
    };
  } catch {
    return {
      showScores: true,
      showUnranked: false,
      sortPreset: DEFAULT_SORT_PRESET,
    };
  }
}

function loadBoardState(preset: SortPresetId): TierBoardState {
  const defaults = createBoardStateForPreset(preset);
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

function mergeCustomItemsIntoPreset(
  prevBoard: TierBoardState,
  preset: SortPresetId,
): TierBoardState {
  const fresh = createBoardStateForPreset(preset);
  const nextItems: Record<string, HarnessItem> = { ...fresh.items };
  const nextTiers: Record<ContainerId, string[]> = {
    S: [...fresh.tiers.S],
    A: [...fresh.tiers.A],
    B: [...fresh.tiers.B],
    C: [...fresh.tiers.C],
    D: [...fresh.tiers.D],
    F: [...fresh.tiers.F],
    unranked: [...fresh.tiers.unranked],
  };

  for (const containerId of ALL_CONTAINER_IDS) {
    for (const itemId of prevBoard.tiers[containerId]) {
      const item = prevBoard.items[itemId];
      if (item?.isCustom) {
        nextItems[itemId] = item;
        nextTiers[containerId].push(itemId);
      }
    }
  }

  return { tiers: nextTiers, items: nextItems };
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
  const [prefs, setPrefs] = useState<StoredPrefs>(() => loadPrefs());
  const [board, setBoard] = useState<TierBoardState>(() =>
    loadBoardState(prefs.sortPreset),
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

  const applySortPreset = useCallback((preset: SortPresetId) => {
    setPrefs((prev) => ({ ...prev, sortPreset: preset }));
    setBoard((prev) => mergeCustomItemsIntoPreset(prev, preset));
  }, []);

  const resetToDefault = useCallback(() => {
    setBoard(createBoardStateForPreset(prefs.sortPreset));
  }, [prefs.sortPreset]);

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
    sortPreset: prefs.sortPreset,
    showScores: prefs.showScores,
    showUnranked: prefs.showUnranked,
    moveAcrossContainers,
    reorderWithinContainer,
    restoreBoardSnapshot,
    applySortPreset,
    resetToDefault,
    toggleScores,
    toggleUnranked,
    addCustomHarness,
    removeCustomHarness,
  };
}
