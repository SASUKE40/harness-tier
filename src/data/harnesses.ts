import type { ContainerId, HarnessItem, TierBoardState, TierId } from "../types";

interface DefaultHarnessSeed {
  id: string;
  name: string;
  score: string;
  tier: TierId;
}

const DEFAULT_HARNESS_SEEDS: readonly DefaultHarnessSeed[] = [
  // S tier
  { id: "pi", name: "pi", score: "-1.5", tier: "S" },
  { id: "minimax-cli", name: "MiniMax CLI", score: "-1.5", tier: "S" },
  { id: "hermes", name: "Hermes", score: "-1.5", tier: "S" },
  { id: "opencode", name: "opencode", score: "-2.0", tier: "S" },

  // A tier
  { id: "fx", name: "fx", score: "-1.5", tier: "A" },

  // B tier
  { id: "oh-my-pi", name: "Oh My Pi", score: "-4.0", tier: "B" },
  { id: "openclaw", name: "OpenClaw", score: "-5.0", tier: "B" },
  { id: "qwen-code", name: "Qwen Code", score: "-5.5", tier: "B" },

  // C tier
  { id: "kimi-cli", name: "Kimi CLI", score: "-7.0", tier: "C" },
  { id: "goose", name: "goose", score: "-8.0", tier: "C" },
  { id: "crush", name: "crush", score: "-8.5", tier: "C" },
  { id: "github-copilot", name: "GitHub Copilot", score: "-8.5", tier: "C" },
  { id: "aider", name: "aider", score: "-9.0", tier: "C" },
  { id: "codex", name: "Codex", score: "-9.0", tier: "C" },
  { id: "grok-build", name: "Grok Build", score: "-9.0", tier: "C" },
  { id: "zed", name: "Zed", score: "-10.5", tier: "C" },
  { id: "orca", name: "Orca", score: "-10.5", tier: "C" },
  { id: "claude-code", name: "Claude Code", score: "-10.5", tier: "C" },
  { id: "factory-droid", name: "Factory Droid", score: "-10.5", tier: "C" },
  { id: "cline", name: "Cline", score: "-11.0", tier: "C" },

  // D tier
  { id: "warp", name: "Warp", score: "-11.5", tier: "D" },
  { id: "windsurf", name: "Windsurf", score: "-11.5", tier: "D" },
  { id: "t3-code", name: "T3 Code", score: "-12.0", tier: "D" },
  { id: "antigravity-cli", name: "Antigravity CLI", score: "-13.0", tier: "D" },
  { id: "kiro", name: "Kiro", score: "-13.5", tier: "D" },

  // F tier
  { id: "devin", name: "Devin", score: "-16.5", tier: "F" },
  { id: "openhands", name: "OpenHands", score: "-17.5", tier: "F" },
  { id: "amp", name: "Amp", score: "-19.0", tier: "F" },
  { id: "trae", name: "TRAE", score: "-25.0", tier: "F" },
  { id: "cursor", name: "Cursor", score: "-27.0", tier: "F" },
] as const;

export function getIconPath(id: string): string {
  const base = import.meta.env.BASE_URL || "./";
  const normalizedBase = base.endsWith("/") ? base : `${base}/`;
  return `${normalizedBase}icons/${id}.png`;
}

export function createDefaultBoardState(): TierBoardState {
  const tiers: Record<ContainerId, string[]> = {
    S: [],
    A: [],
    B: [],
    C: [],
    D: [],
    F: [],
    unranked: [],
  };
  const items: Record<string, HarnessItem> = {};

  for (const seed of DEFAULT_HARNESS_SEEDS) {
    tiers[seed.tier].push(seed.id);
    items[seed.id] = {
      id: seed.id,
      name: seed.name,
      score: seed.score,
      icon: getIconPath(seed.id),
    };
  }

  return { tiers, items };
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
    '<svg xmlns="http://www.w3.org/2000/svg" width="128" height="128" viewBox="0 0 128 128">',
    `<rect width="128" height="128" rx="24" fill="${accentHex}"/>`,
    '<rect x="2" y="2" width="124" height="124" rx="22" fill="none" stroke="rgba(255,255,255,0.16)" stroke-width="2"/>',
    `<text x="64" y="66" text-anchor="middle" dominant-baseline="central" fill="#ffffff" font-family="-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,sans-serif" font-size="48" font-weight="700">${escaped}</text>`,
    "</svg>",
  ].join("");

  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}
