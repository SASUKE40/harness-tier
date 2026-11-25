import {
  DEFAULT_SORT_PRESET,
  type ContainerId,
  type HarnessItem,
  type SortPresetId,
  type TierBoardState,
  type TierId,
} from "../types";

interface FrontierHarnessMetrics {
  label: string;
  passRate: string;
  passRank: number;
  passTier: TierId;
  costPerPass: string;
  costPerPassRank: number;
  costPerPassTier: TierId;
  avgCost: string;
  avgCostRank: number;
  avgCostTier: TierId;
  timePerPass: string;
  timePerPassRank: number;
  timePerPassTier: TierId;
}

interface HarnessCatalogEntry {
  id: string;
  name: string;
  iconFile: string;
  originalTier?: TierId;
  originalScore?: string;
  originalOrder?: number;
  frontierHarness?: FrontierHarnessMetrics;
}

// Benchmark metrics sourced from https://frontierharness.org/ (FrontierHarness Eval v1.1, All models: 5 models x 62 tasks x 4 attempts)
const HARNESS_CATALOG: readonly HarnessCatalogEntry[] = [
  // Benchmarked on FrontierHarness Eval v1.1 (22 harnesses)
  {
    id: "zcode",
    name: "ZCode",
    iconFile: "zcode.svg",
    frontierHarness: {
      label: "ZCode",
      passRate: "61.9%",
      passRank: 1,
      passTier: "S",
      costPerPass: "$1.06",
      costPerPassRank: 5,
      costPerPassTier: "A",
      avgCost: "$0.659",
      avgCostRank: 9,
      avgCostTier: "A",
      timePerPass: "57m 08s",
      timePerPassRank: 5,
      timePerPassTier: "A",
    },
  },
  {
    id: "codex",
    name: "Codex",
    iconFile: "codex.svg",
    originalTier: "C",
    originalScore: "-9.0",
    originalOrder: 14,
    frontierHarness: {
      label: "Codex CLI",
      passRate: "61.1%",
      passRank: 2,
      passTier: "S",
      costPerPass: "$0.937",
      costPerPassRank: 1,
      costPerPassTier: "S",
      avgCost: "$0.573",
      avgCostRank: 4,
      avgCostTier: "S",
      timePerPass: "43m 48s",
      timePerPassRank: 2,
      timePerPassTier: "S",
    },
  },
  {
    id: "kimi-cli",
    name: "Kimi CLI",
    iconFile: "kimi-cli.svg",
    originalTier: "C",
    originalScore: "-7.0",
    originalOrder: 9,
    frontierHarness: {
      label: "KimiCode",
      passRate: "60.2%",
      passRank: 3,
      passTier: "A",
      costPerPass: "$1.09",
      costPerPassRank: 6,
      costPerPassTier: "A",
      avgCost: "$0.653",
      avgCostRank: 7,
      avgCostTier: "A",
      timePerPass: "56m 04s",
      timePerPassRank: 4,
      timePerPassTier: "A",
    },
  },
  {
    id: "grok-build",
    name: "Grok Build",
    iconFile: "grok-build.svg",
    originalTier: "C",
    originalScore: "-9.0",
    originalOrder: 15,
    frontierHarness: {
      label: "Grok Build",
      passRate: "60.0%",
      passRank: 4,
      passTier: "A",
      costPerPass: "$1.20",
      costPerPassRank: 13,
      costPerPassTier: "C",
      avgCost: "$0.723",
      avgCostRank: 16,
      avgCostTier: "C",
      timePerPass: "1h 00m",
      timePerPassRank: 11,
      timePerPassTier: "C",
    },
  },
  {
    id: "hermes",
    name: "Hermes",
    iconFile: "hermes.png",
    originalTier: "S",
    originalScore: "-1.5",
    originalOrder: 3,
    frontierHarness: {
      label: "Hermes Agent",
      passRate: "59.9%",
      passRank: 5,
      passTier: "A",
      costPerPass: "$1.16",
      costPerPassRank: 11,
      costPerPassTier: "B",
      avgCost: "$0.692",
      avgCostRank: 13,
      avgCostTier: "B",
      timePerPass: "58m 26s",
      timePerPassRank: 8,
      timePerPassTier: "B",
    },
  },
  {
    id: "alma",
    name: "Alma",
    iconFile: "alma.png",
    frontierHarness: {
      label: "Alma",
      passRate: "59.7%",
      passRank: 6,
      passTier: "A",
      costPerPass: "$1.22",
      costPerPassRank: 14,
      costPerPassTier: "C",
      avgCost: "$0.731",
      avgCostRank: 17,
      avgCostTier: "C",
      timePerPass: "57m 08s",
      timePerPassRank: 6,
      timePerPassTier: "A",
    },
  },
  {
    id: "claude-code",
    name: "Claude Code",
    iconFile: "claude-code.svg",
    originalTier: "C",
    originalScore: "-10.5",
    originalOrder: 18,
    frontierHarness: {
      label: "Claude Code",
      passRate: "58.9%",
      passRank: 7,
      passTier: "B",
      costPerPass: "$1.55",
      costPerPassRank: 21,
      costPerPassTier: "F",
      avgCost: "$0.915",
      avgCostRank: 22,
      avgCostTier: "F",
      timePerPass: "1h 10m",
      timePerPassRank: 22,
      timePerPassTier: "F",
    },
  },
  {
    id: "mini-swe-agent",
    name: "mini-SWE-agent",
    iconFile: "mini-swe-agent.png",
    frontierHarness: {
      label: "mini-SWE-agent",
      passRate: "58.6%",
      passRank: 8,
      passTier: "B",
      costPerPass: "$1.29",
      costPerPassRank: 17,
      costPerPassTier: "D",
      avgCost: "$0.757",
      avgCostRank: 19,
      avgCostTier: "D",
      timePerPass: "59m 32s",
      timePerPassRank: 10,
      timePerPassTier: "B",
    },
  },
  {
    id: "cline",
    name: "Cline",
    iconFile: "cline.svg",
    originalTier: "C",
    originalScore: "-11.0",
    originalOrder: 20,
    frontierHarness: {
      label: "Cline CLI",
      passRate: "57.7%",
      passRank: 9,
      passTier: "C",
      costPerPass: "$1.19",
      costPerPassRank: 12,
      costPerPassTier: "C",
      avgCost: "$0.689",
      avgCostRank: 11,
      avgCostTier: "B",
      timePerPass: "1h 01m",
      timePerPassRank: 13,
      timePerPassTier: "C",
    },
  },
  {
    id: "maka",
    name: "Maka",
    iconFile: "maka.png",
    frontierHarness: {
      label: "Maka",
      passRate: "57.7%",
      passRank: 10,
      passTier: "C",
      costPerPass: "$1.13",
      costPerPassRank: 8,
      costPerPassTier: "B",
      avgCost: "$0.654",
      avgCostRank: 8,
      avgCostTier: "A",
      timePerPass: "57m 30s",
      timePerPassRank: 7,
      timePerPassTier: "A",
    },
  },
  {
    id: "pi",
    name: "pi",
    iconFile: "pi.svg",
    originalTier: "S",
    originalScore: "-1.5",
    originalOrder: 1,
    frontierHarness: {
      label: "Pi",
      passRate: "57.7%",
      passRank: 11,
      passTier: "C",
      costPerPass: "$0.976",
      costPerPassRank: 2,
      costPerPassTier: "S",
      avgCost: "$0.563",
      avgCostRank: 2,
      avgCostTier: "S",
      timePerPass: "54m 01s",
      timePerPassRank: 3,
      timePerPassTier: "A",
    },
  },
  {
    id: "dsh-minimal",
    name: "DSH Minimal",
    iconFile: "dsh-minimal.svg",
    frontierHarness: {
      label: "DSH Minimal",
      passRate: "57.4%",
      passRank: 12,
      passTier: "C",
      costPerPass: "$1.15",
      costPerPassRank: 10,
      costPerPassTier: "B",
      avgCost: "$0.661",
      avgCostRank: 10,
      avgCostTier: "A",
      timePerPass: "1h 03m",
      timePerPassRank: 15,
      timePerPassTier: "D",
    },
  },
  {
    id: "opencode",
    name: "opencode",
    iconFile: "opencode.svg",
    originalTier: "S",
    originalScore: "-2.0",
    originalOrder: 4,
    frontierHarness: {
      label: "OpenCode v1",
      passRate: "57.4%",
      passRank: 13,
      passTier: "C",
      costPerPass: "$1.12",
      costPerPassRank: 7,
      costPerPassTier: "B",
      avgCost: "$0.646",
      avgCostRank: 5,
      avgCostTier: "A",
      timePerPass: "1h 02m",
      timePerPassRank: 14,
      timePerPassTier: "C",
    },
  },
  {
    id: "oh-my-pi",
    name: "Oh My Pi",
    iconFile: "oh-my-pi.png",
    originalTier: "B",
    originalScore: "-4.0",
    originalOrder: 6,
    frontierHarness: {
      label: "Oh My Pi",
      passRate: "57.3%",
      passRank: 14,
      passTier: "C",
      costPerPass: "$0.983",
      costPerPassRank: 4,
      costPerPassTier: "S",
      avgCost: "$0.564",
      avgCostRank: 3,
      avgCostTier: "S",
      timePerPass: "59m 13s",
      timePerPassRank: 9,
      timePerPassTier: "B",
    },
  },
  {
    id: "opencode-v2",
    name: "OpenCode v2",
    iconFile: "opencode-v2.svg",
    frontierHarness: {
      label: "OpenCode v2",
      passRate: "57.3%",
      passRank: 15,
      passTier: "C",
      costPerPass: "$0.978",
      costPerPassRank: 3,
      costPerPassTier: "S",
      avgCost: "$0.561",
      avgCostRank: 1,
      avgCostTier: "S",
      timePerPass: "43m 43s",
      timePerPassRank: 1,
      timePerPassTier: "S",
    },
  },
  {
    id: "github-copilot",
    name: "GitHub Copilot",
    iconFile: "github-copilot.svg",
    originalTier: "C",
    originalScore: "-8.5",
    originalOrder: 12,
    frontierHarness: {
      label: "GitHub Copilot",
      passRate: "56.9%",
      passRank: 16,
      passTier: "C",
      costPerPass: "$1.38",
      costPerPassRank: 20,
      costPerPassTier: "D",
      avgCost: "$0.787",
      avgCostRank: 20,
      avgCostTier: "D",
      timePerPass: "1h 04m",
      timePerPassRank: 16,
      timePerPassTier: "D",
    },
  },
  {
    id: "minimax-cli",
    name: "MiniMax CLI",
    iconFile: "minimax-cli.png",
    originalTier: "S",
    originalScore: "-1.5",
    originalOrder: 2,
    frontierHarness: {
      label: "MiniMax Code",
      passRate: "56.8%",
      passRank: 17,
      passTier: "C",
      costPerPass: "$1.14",
      costPerPassRank: 9,
      costPerPassTier: "B",
      avgCost: "$0.647",
      avgCostRank: 6,
      avgCostTier: "A",
      timePerPass: "1h 00m",
      timePerPassRank: 12,
      timePerPassTier: "C",
    },
  },
  {
    id: "dsh-creator",
    name: "DSH Creator",
    iconFile: "dsh-creator.svg",
    frontierHarness: {
      label: "DSH Creator",
      passRate: "56.1%",
      passRank: 18,
      passTier: "D",
      costPerPass: "$1.27",
      costPerPassRank: 16,
      costPerPassTier: "D",
      avgCost: "$0.713",
      avgCostRank: 15,
      avgCostTier: "C",
      timePerPass: "1h 07m",
      timePerPassRank: 20,
      timePerPassTier: "F",
    },
  },
  {
    id: "dsh-code",
    name: "DSH Code",
    iconFile: "dsh-code.svg",
    frontierHarness: {
      label: "DSH Code",
      passRate: "55.2%",
      passRank: 19,
      passTier: "D",
      costPerPass: "$1.32",
      costPerPassRank: 18,
      costPerPassTier: "D",
      avgCost: "$0.732",
      avgCostRank: 18,
      avgCostTier: "C",
      timePerPass: "1h 06m",
      timePerPassRank: 18,
      timePerPassTier: "D",
    },
  },
  {
    id: "antigravity-cli",
    name: "Antigravity CLI",
    iconFile: "antigravity-cli.svg",
    originalTier: "D",
    originalScore: "-13.0",
    originalOrder: 24,
    frontierHarness: {
      label: "Antigravity CLI",
      passRate: "55.0%",
      passRank: 20,
      passTier: "D",
      costPerPass: "$1.63",
      costPerPassRank: 22,
      costPerPassTier: "F",
      avgCost: "$0.897",
      avgCostRank: 21,
      avgCostTier: "F",
      timePerPass: "1h 06m",
      timePerPassRank: 19,
      timePerPassTier: "D",
    },
  },
  {
    id: "dsh-standard",
    name: "DSH Standard",
    iconFile: "dsh-standard.svg",
    frontierHarness: {
      label: "DSH Standard",
      passRate: "55.0%",
      passRank: 21,
      passTier: "D",
      costPerPass: "$1.27",
      costPerPassRank: 15,
      costPerPassTier: "D",
      avgCost: "$0.697",
      avgCostRank: 14,
      avgCostTier: "B",
      timePerPass: "1h 05m",
      timePerPassRank: 17,
      timePerPassTier: "D",
    },
  },
  {
    id: "exo",
    name: "Exo",
    iconFile: "exo.svg",
    frontierHarness: {
      label: "Exo",
      passRate: "50.6%",
      passRank: 22,
      passTier: "F",
      costPerPass: "$1.36",
      costPerPassRank: 19,
      costPerPassTier: "D",
      avgCost: "$0.691",
      avgCostRank: 12,
      avgCostTier: "B",
      timePerPass: "1h 07m",
      timePerPassRank: 21,
      timePerPassTier: "F",
    },
  },

  // Additional harnesses from the original reference catalog (not yet evaluated on FrontierHarness Eval v1.1)
  { id: "fx", name: "fx", iconFile: "fx.svg", originalTier: "A", originalScore: "-1.5", originalOrder: 5 },
  { id: "openclaw", name: "OpenClaw", iconFile: "openclaw.svg", originalTier: "B", originalScore: "-5.0", originalOrder: 7 },
  { id: "qwen-code", name: "Qwen Code", iconFile: "qwen-code.png", originalTier: "B", originalScore: "-5.5", originalOrder: 8 },
  { id: "goose", name: "goose", iconFile: "goose.png", originalTier: "C", originalScore: "-8.0", originalOrder: 10 },
  { id: "crush", name: "crush", iconFile: "crush.png", originalTier: "C", originalScore: "-8.5", originalOrder: 11 },
  { id: "aider", name: "aider", iconFile: "aider.png", originalTier: "C", originalScore: "-9.0", originalOrder: 13 },
  { id: "zed", name: "Zed", iconFile: "zed.png", originalTier: "C", originalScore: "-10.5", originalOrder: 16 },
  { id: "orca", name: "Orca", iconFile: "orca.svg", originalTier: "C", originalScore: "-10.5", originalOrder: 17 },
  { id: "factory-droid", name: "Factory Droid", iconFile: "factory-droid.svg", originalTier: "C", originalScore: "-10.5", originalOrder: 19 },
  { id: "warp", name: "Warp", iconFile: "warp.png", originalTier: "D", originalScore: "-11.5", originalOrder: 21 },
  { id: "windsurf", name: "Windsurf", iconFile: "windsurf.svg", originalTier: "D", originalScore: "-11.5", originalOrder: 22 },
  { id: "t3-code", name: "T3 Code", iconFile: "t3-code.svg", originalTier: "D", originalScore: "-12.0", originalOrder: 23 },
  { id: "kiro", name: "Kiro", iconFile: "kiro.svg", originalTier: "D", originalScore: "-13.5", originalOrder: 25 },
  { id: "devin", name: "Devin", iconFile: "devin.svg", originalTier: "F", originalScore: "-16.5", originalOrder: 26 },
  { id: "openhands", name: "OpenHands", iconFile: "openhands.png", originalTier: "F", originalScore: "-17.5", originalOrder: 27 },
  { id: "amp", name: "Amp", iconFile: "amp.svg", originalTier: "F", originalScore: "-19.0", originalOrder: 28 },
  { id: "trae", name: "TRAE", iconFile: "trae.svg", originalTier: "F", originalScore: "-25.0", originalOrder: 29 },
  { id: "cursor", name: "Cursor", iconFile: "cursor.svg", originalTier: "F", originalScore: "-27.0", originalOrder: 30 },
] as const;

const ICON_FILE_BY_ID: Record<string, string> = Object.fromEntries(
  HARNESS_CATALOG.map((entry) => [entry.id, entry.iconFile]),
);

export function getIconPath(id: string): string {
  const base = import.meta.env.BASE_URL || "./";
  const normalizedBase = base.endsWith("/") ? base : `${base}/`;
  const file = ICON_FILE_BY_ID[id] ?? `${id}.png`;
  return `${normalizedBase}icons/${file}`;
}

function buildFrontierDetails(fh: FrontierHarnessMetrics): string {
  return `${fh.label} · Pass rate: ${fh.passRate} (#${fh.passRank}) · Cost/pass: ${fh.costPerPass} (#${fh.costPerPassRank}) · Avg cost: ${fh.avgCost} (#${fh.avgCostRank}) · Time/pass: ${fh.timePerPass} (#${fh.timePerPassRank})`;
}

interface PresetPlacement {
  container: ContainerId;
  order: number;
  name: string;
  score: string | null;
  details: string;
}

function getPlacementForPreset(
  entry: HarnessCatalogEntry,
  preset: SortPresetId,
  catalogIndex: number,
): PresetPlacement {
  const fh = entry.frontierHarness;

  switch (preset) {
    case "fh-pass-rate":
      if (fh) {
        return {
          container: fh.passTier,
          order: fh.passRank,
          name: fh.label,
          score: fh.passRate,
          details: buildFrontierDetails(fh),
        };
      }
      return {
        container: "unranked",
        order: 100 + catalogIndex,
        name: entry.name,
        score: null,
        details: `${entry.name} · Not benchmarked on FrontierHarness Eval v1.1`,
      };

    case "fh-cost-per-pass":
      if (fh) {
        return {
          container: fh.costPerPassTier,
          order: fh.costPerPassRank,
          name: fh.label,
          score: fh.costPerPass,
          details: buildFrontierDetails(fh),
        };
      }
      return {
        container: "unranked",
        order: 100 + catalogIndex,
        name: entry.name,
        score: null,
        details: `${entry.name} · Not benchmarked on FrontierHarness Eval v1.1`,
      };

    case "fh-avg-cost":
      if (fh) {
        return {
          container: fh.avgCostTier,
          order: fh.avgCostRank,
          name: fh.label,
          score: fh.avgCost,
          details: buildFrontierDetails(fh),
        };
      }
      return {
        container: "unranked",
        order: 100 + catalogIndex,
        name: entry.name,
        score: null,
        details: `${entry.name} · Not benchmarked on FrontierHarness Eval v1.1`,
      };

    case "fh-time-per-pass":
      if (fh) {
        return {
          container: fh.timePerPassTier,
          order: fh.timePerPassRank,
          name: fh.label,
          score: fh.timePerPass,
          details: buildFrontierDetails(fh),
        };
      }
      return {
        container: "unranked",
        order: 100 + catalogIndex,
        name: entry.name,
        score: null,
        details: `${entry.name} · Not benchmarked on FrontierHarness Eval v1.1`,
      };

    case "original":
      if (entry.originalTier && entry.originalOrder !== undefined) {
        return {
          container: entry.originalTier,
          order: entry.originalOrder,
          name: entry.name,
          score: entry.originalScore ?? null,
          details: fh ? buildFrontierDetails(fh) : entry.name,
        };
      }
      return {
        container: "unranked",
        order: 100 + catalogIndex,
        name: fh?.label ?? entry.name,
        score: fh?.passRate ?? null,
        details: fh ? buildFrontierDetails(fh) : entry.name,
      };

    default: {
      const exhaustiveCheck: never = preset;
      return exhaustiveCheck;
    }
  }
}

export function createBoardStateForPreset(
  preset: SortPresetId = DEFAULT_SORT_PRESET,
): TierBoardState {
  const buckets: Record<ContainerId, Array<{ id: string; order: number }>> = {
    S: [],
    A: [],
    B: [],
    C: [],
    D: [],
    F: [],
    unranked: [],
  };
  const items: Record<string, HarnessItem> = {};

  HARNESS_CATALOG.forEach((entry, idx) => {
    const placement = getPlacementForPreset(entry, preset, idx);
    buckets[placement.container].push({ id: entry.id, order: placement.order });
    items[entry.id] = {
      id: entry.id,
      name: placement.name,
      score: placement.score,
      icon: getIconPath(entry.id),
      details: placement.details,
    };
  });

  const tiers: Record<ContainerId, string[]> = {
    S: buckets.S.sort((a, b) => a.order - b.order).map((x) => x.id),
    A: buckets.A.sort((a, b) => a.order - b.order).map((x) => x.id),
    B: buckets.B.sort((a, b) => a.order - b.order).map((x) => x.id),
    C: buckets.C.sort((a, b) => a.order - b.order).map((x) => x.id),
    D: buckets.D.sort((a, b) => a.order - b.order).map((x) => x.id),
    F: buckets.F.sort((a, b) => a.order - b.order).map((x) => x.id),
    unranked: buckets.unranked.sort((a, b) => a.order - b.order).map((x) => x.id),
  };

  return { tiers, items };
}

export function createDefaultBoardState(): TierBoardState {
  return createBoardStateForPreset(DEFAULT_SORT_PRESET);
}

export function createMonogramDataUrl(name: string, accentHex: string): string {
  const cleaned = name.trim();
  const words = cleaned.split(/\s+/).filter(Boolean);
  let initials = "?";
  if (words.length >= 2) {
    initials = `${words[0]?.[0] ?? ""}${words[1]?.[0] ?? ""}`.toUpperCase();
  } else if (cleaned.length >= 2) {
    initials = cleaned.slice(0, 2).toUpperCase();
  } else if (cleaned.length === 1) {
    initials = cleaned.toUpperCase();
  }

  const escaped = initials
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

  const svg = [
    '<svg xmlns="http://www.w3.org/2000/svg" width="256" height="256" viewBox="0 0 128 128">',
    `<rect width="128" height="128" rx="24" fill="${accentHex}"/>`,
    '<rect x="2" y="2" width="124" height="124" rx="22" fill="none" stroke="rgba(255,255,255,0.16)" stroke-width="2"/>',
    `<text x="64" y="66" text-anchor="middle" dominant-baseline="central" fill="#ffffff" font-family="-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,sans-serif" font-size="48" font-weight="700">${escaped}</text>`,
    "</svg>",
  ].join("");

  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}
