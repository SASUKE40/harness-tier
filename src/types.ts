export type TierId = "S" | "A" | "B" | "C" | "D" | "F";

export type ContainerId = TierId | "unranked";

export interface TierDefinition {
  id: TierId;
  label: string;
  color: string;
}

export interface HarnessItem {
  id: string;
  name: string;
  icon: string;
  isCustom?: boolean;
}

export interface TierBoardState {
  tiers: Record<ContainerId, string[]>;
  items: Record<string, HarnessItem>;
}

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
