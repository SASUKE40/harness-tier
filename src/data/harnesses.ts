import type { ContainerId, HarnessItem, TierBoardState, TierId } from "../types";

interface DefaultHarnessSeed {
  id: string;
  name: string;
  score: string;
  tier: TierId;
  iconFile: string;
}

const DEFAULT_HARNESS_SEEDS: readonly DefaultHarnessSeed[] = [
  // S tier
  { id: "pi", name: "pi", score: "-1.5", tier: "S", iconFile: "pi.svg" },
  { id: "minimax-cli", name: "MiniMax CLI", score: "-1.5", tier: "S", iconFile: "minimax-cli.png" },
  { id: "hermes", name: "Hermes", score: "-1.5", tier: "S", iconFile: "hermes.png" },
  { id: "opencode", name: "opencode", score: "-2.0", tier: "S", iconFile: "opencode.svg" },

  // A tier
  { id: "fx", name: "fx", score: "-1.5", tier: "A", iconFile: "fx.svg" },

  // B tier
  { id: "oh-my-pi", name: "Oh My Pi", score: "-4.0", tier: "B", iconFile: "oh-my-pi.png" },
  { id: "openclaw", name: "OpenClaw", score: "-5.0", tier: "B", iconFile: "openclaw.svg" },
  { id: "qwen-code", name: "Qwen Code", score: "-5.5", tier: "B", iconFile: "qwen-code.png" },

  // C tier
  { id: "kimi-cli", name: "Kimi CLI", score: "-7.0", tier: "C", iconFile: "kimi-cli.svg" },
  { id: "goose", name: "goose", score: "-8.0", tier: "C", iconFile: "goose.png" },
  { id: "crush", name: "crush", score: "-8.5", tier: "C", iconFile: "crush.png" },
  { id: "github-copilot", name: "GitHub Copilot", score: "-8.5", tier: "C", iconFile: "github-copilot.svg" },
  { id: "aider", name: "aider", score: "-9.0", tier: "C", iconFile: "aider.png" },
  { id: "codex", name: "Codex", score: "-9.0", tier: "C", iconFile: "codex.svg" },
  { id: "grok-build", name: "Grok Build", score: "-9.0", tier: "C", iconFile: "grok-build.svg" },
  { id: "zed", name: "Zed", score: "-10.5", tier: "C", iconFile: "zed.png" },
  { id: "orca", name: "Orca", score: "-10.5", tier: "C", iconFile: "orca.svg" },
  { id: "claude-code", name: "Claude Code", score: "-10.5", tier: "C", iconFile: "claude-code.svg" },
  { id: "factory-droid", name: "Factory Droid", score: "-10.5", tier: "C", iconFile: "factory-droid.svg" },
  { id: "cline", name: "Cline", score: "-11.0", tier: "C", iconFile: "cline.svg" },

  // D tier
  { id: "warp", name: "Warp", score: "-11.5", tier: "D", iconFile: "warp.png" },
  { id: "windsurf", name: "Windsurf", score: "-11.5", tier: "D", iconFile: "windsurf.svg" },
  { id: "t3-code", name: "T3 Code", score: "-12.0", tier: "D", iconFile: "t3-code.svg" },
  { id: "antigravity-cli", name: "Antigravity CLI", score: "-13.0", tier: "D", iconFile: "antigravity-cli.svg" },
  { id: "kiro", name: "Kiro", score: "-13.5", tier: "D", iconFile: "kiro.svg" },

  // F tier
  { id: "devin", name: "Devin", score: "-16.5", tier: "F", iconFile: "devin.svg" },
  { id: "openhands", name: "OpenHands", score: "-17.5", tier: "F", iconFile: "openhands.png" },
  { id: "amp", name: "Amp", score: "-19.0", tier: "F", iconFile: "amp.svg" },
  { id: "trae", name: "TRAE", score: "-25.0", tier: "F", iconFile: "trae.svg" },
  { id: "cursor", name: "Cursor", score: "-27.0", tier: "F", iconFile: "cursor.svg" },
] as const;

const ICON_FILE_BY_ID: Record<string, string> = Object.fromEntries(
  DEFAULT_HARNESS_SEEDS.map((seed) => [seed.id, seed.iconFile]),
);

export function getIconPath(id: string): string {
  const base = import.meta.env.BASE_URL || "./";
  const normalizedBase = base.endsWith("/") ? base : `${base}/`;
  const file = ICON_FILE_BY_ID[id] ?? `${id}.png`;
  return `${normalizedBase}icons/${file}`;
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
    '<svg xmlns="http://www.w3.org/2000/svg" width="256" height="256" viewBox="0 0 128 128">',
    `<rect width="128" height="128" rx="24" fill="${accentHex}"/>`,
    '<rect x="2" y="2" width="124" height="124" rx="22" fill="none" stroke="rgba(255,255,255,0.16)" stroke-width="2"/>',
    `<text x="64" y="66" text-anchor="middle" dominant-baseline="central" fill="#ffffff" font-family="-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,sans-serif" font-size="48" font-weight="700">${escaped}</text>`,
    "</svg>",
  ].join("");

  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}
