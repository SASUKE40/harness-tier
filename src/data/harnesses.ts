import type { ContainerId, HarnessItem, TierBoardState } from "../types";

interface DefaultHarnessSeed {
  id: string;
  name: string;
  container: ContainerId;
  iconFile: string;
}

// Ordered using FrontierHarness Eval v1.1 results (https://frontierharness.org/) plus custom tier placements
const DEFAULT_HARNESS_SEEDS: readonly DefaultHarnessSeed[] = [
  // S tier
  { id: "zcode", name: "ZCode", container: "S", iconFile: "zcode.svg" },
  { id: "codex", name: "Codex", container: "S", iconFile: "codex.svg" },

  // A tier
  { id: "kimi-cli", name: "KimiCode", container: "A", iconFile: "kimi-cli.svg" },
  { id: "grok-build", name: "Grok Build", container: "A", iconFile: "grok-build.svg" },
  { id: "hermes", name: "Hermes Agent", container: "A", iconFile: "hermes.png" },
  { id: "alma", name: "Alma", container: "A", iconFile: "alma.png" },
  { id: "cursor", name: "Cursor", container: "A", iconFile: "cursor.svg" },

  // B tier
  { id: "claude-code", name: "Claude Code", container: "B", iconFile: "claude-code.svg" },
  { id: "mini-swe-agent", name: "mini-SWE-agent", container: "B", iconFile: "mini-swe-agent.png" },

  // C tier
  { id: "cline", name: "Cline", container: "C", iconFile: "cline.svg" },
  { id: "maka", name: "Maka", container: "C", iconFile: "maka.png" },
  { id: "pi", name: "Pi", container: "C", iconFile: "pi.svg" },
  { id: "deepseek-harness", name: "DeepSeek Harness", container: "C", iconFile: "deepseek-harness.svg" },
  { id: "opencode", name: "OpenCode v1", container: "C", iconFile: "opencode.svg" },
  { id: "oh-my-pi", name: "Oh My Pi", container: "C", iconFile: "oh-my-pi.png" },
  { id: "opencode-v2", name: "OpenCode v2", container: "C", iconFile: "opencode-v2.svg" },
  { id: "github-copilot", name: "GitHub Copilot", container: "C", iconFile: "github-copilot.svg" },
  { id: "minimax-cli", name: "MiniMax Code", container: "C", iconFile: "minimax-cli.png" },
  { id: "zed", name: "Zed", container: "C", iconFile: "zed.png" },
  { id: "orca", name: "Orca", container: "C", iconFile: "orca.svg" },

  // D tier
  { id: "qwen-code", name: "Qwen Code", container: "D", iconFile: "qwen-code.png" },
  { id: "amp", name: "Amp", container: "D", iconFile: "amp.svg" },

  // F tier
  { id: "t3-code", name: "T3 Code", container: "F", iconFile: "t3-code.svg" },
  { id: "devin", name: "Devin", container: "F", iconFile: "devin.svg" },
  { id: "trae", name: "TRAE", container: "F", iconFile: "trae.svg" },
  { id: "openclaw", name: "OpenClaw", container: "F", iconFile: "openclaw.svg" },
  { id: "antigravity-cli", name: "Antigravity", container: "F", iconFile: "antigravity-cli.svg" },

  // Unranked tray
  { id: "fx", name: "fx", container: "unranked", iconFile: "fx.svg" },
  { id: "goose", name: "goose", container: "unranked", iconFile: "goose.png" },
  { id: "crush", name: "crush", container: "unranked", iconFile: "crush.png" },
  { id: "aider", name: "aider", container: "unranked", iconFile: "aider.png" },
  { id: "factory-droid", name: "Factory Droid", container: "unranked", iconFile: "factory-droid.svg" },
  { id: "warp", name: "Warp", container: "unranked", iconFile: "warp.png" },
  { id: "windsurf", name: "Windsurf", container: "unranked", iconFile: "windsurf.svg" },
  { id: "kiro", name: "Kiro", container: "unranked", iconFile: "kiro.svg" },
  { id: "openhands", name: "OpenHands", container: "unranked", iconFile: "openhands.png" },
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
    tiers[seed.container].push(seed.id);
    items[seed.id] = {
      id: seed.id,
      name: seed.name,
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
