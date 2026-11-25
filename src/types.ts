export type TierId = "S" | "A" | "B" | "C" | "D" | "F";

export type ContainerId = TierId | "unranked";

export type SortPresetId =
  | "fh-pass-rate"
  | "fh-cost-per-pass"
  | "fh-avg-cost"
  | "fh-time-per-pass"
  | "original";

export interface SortPresetDefinition {
  id: SortPresetId;
  label: string;
  description: string;
}

export interface TierDefinition {
  id: TierId;
  label: string;
  color: string;
}

export interface HarnessItem {
  id: string;
  name: string;
  score: string | null;
  icon: string;
  details?: string;
  isCustom?: boolean;
}

export interface TierBoardState {
  tiers: Record<ContainerId, string[]>;
  items: Record<string, HarnessItem>;
}

export const DEFAULT_SORT_PRESET: SortPresetId = "fh-pass-rate";

export const SORT_PRESET_DEFINITIONS: readonly SortPresetDefinition[] = [
  {
    id: "fh-pass-rate",
    label: "Pass Rate (v1.1)",
    description: "FrontierHarness Eval v1.1 · All models pass rate (higher is better)",
  },
  {
    id: "fh-cost-per-pass",
    label: "Cost / Pass (v1.1)",
    description: "FrontierHarness Eval v1.1 · All models cost per pass (lower is better)",
  },
  {
    id: "fh-avg-cost",
    label: "Avg Cost (v1.1)",
    description: "FrontierHarness Eval v1.1 · All models average cost per task (lower is better)",
  },
  {
    id: "fh-time-per-pass",
    label: "Speed (v1.1)",
    description: "FrontierHarness Eval v1.1 · All models time per pass (faster is better)",
  },
  {
    id: "original",
    label: "Original Tier List",
    description: "Original 30-harness reference tier list",
  },
] as const;

export const TIER_DEFINITIONS: readonly TierDefinition[] = [
  { id: "S", label: "S", color: "#ff7f7f" },
  { id: "A", label: "A", color: "#ffbf7f" },
  { id: "B", label: "B", color: "#ffdf7f" },
  { id: "C", label: "C", color: "#ffff7f" },
  { id: "D", label: "D", color: "#bfff7f" },
  { id: "F", label: "F", color: "#7fff7f" },
] as const;

export const TIER_IDS: readonly TierId[] = ["S", "A", "B", "C", "D", "F"] as const;

export const ALL_CONTAINER_IDS: readonly ContainerId[] = [
  "S",
  "A",
  "B",
  "C",
  "D",
  "F",
  "unranked",
] as const;

export function isSortPresetId(value: unknown): value is SortPresetId {
  if (typeof value !== "string") return false;
  switch (value) {
    case "fh-pass-rate":
    case "fh-cost-per-pass":
    case "fh-avg-cost":
    case "fh-time-per-pass":
    case "original":
      return true;
    default:
      return false;
  }
}

export function toDroppableId(containerId: ContainerId): string {
  return `container:${containerId}`;
}

export function fromDroppableId(id: string): ContainerId | null {
  if (!id.startsWith("container:")) return null;
  const raw = id.slice("container:".length);
  switch (raw) {
    case "S":
    case "A":
    case "B":
    case "C":
    case "D":
    case "F":
    case "unranked":
      return raw;
    default:
      return null;
  }
}
