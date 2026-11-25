import { TIER_DEFINITIONS, type TierBoardState } from "../types";

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`Failed to load icon: ${src}`));
    img.src = src;
  });
}

function wrapTextLines(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number,
): string[] {
  const words = text.split(/\s+/).filter(Boolean);
  if (words.length <= 1) return [text];

  const lines: string[] = [];
  let current = words[0] ?? "";
  for (let i = 1; i < words.length; i++) {
    const word = words[i] ?? "";
    const candidate = `${current} ${word}`;
    if (ctx.measureText(candidate).width <= maxWidth) {
      current = candidate;
    } else {
      lines.push(current);
      current = word;
    }
  }
  if (current) lines.push(current);
  return lines.slice(0, 3);
}

export async function exportTierBoardToPng(
  boardElement: HTMLElement,
  boardState: TierBoardState,
  showScores: boolean,
): Promise<void> {
  const boardRect = boardElement.getBoundingClientRect();
  const width = Math.round(boardRect.width);
  const height = Math.round(boardRect.height);
  const dpr = 2;

  const canvas = document.createElement("canvas");
  canvas.width = width * dpr;
  canvas.height = height * dpr;
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    throw new Error("Unable to initialize 2D canvas context");
  }

  ctx.scale(dpr, dpr);
  ctx.fillStyle = "#141414";
  ctx.fillRect(0, 0, width, height);

  const fontFamily =
    '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif';

  // Preload all icons currently on the tier board (S..F)
  const visibleIds = TIER_DEFINITIONS.flatMap((tier) => boardState.tiers[tier.id]);
  const loadedIcons = new Map<string, HTMLImageElement>();
  await Promise.all(
    visibleIds.map(async (id) => {
      const item = boardState.items[id];
      if (!item) return;
      try {
        const img = await loadImage(item.icon);
        loadedIcons.set(id, img);
      } catch {
        // Skip broken external custom icons rather than failing the whole export
      }
    }),
  );

  for (const tier of TIER_DEFINITIONS) {
    const rowEl = boardElement.querySelector<HTMLElement>(
      `[data-tier-row="${tier.id}"]`,
    );
    const labelEl = boardElement.querySelector<HTMLElement>(
      `[data-tier-label="${tier.id}"]`,
    );
    if (!rowEl || !labelEl) continue;

    const rowRect = rowEl.getBoundingClientRect();
    const labelRect = labelEl.getBoundingClientRect();
    const rx = rowRect.left - boardRect.left;
    const ry = rowRect.top - boardRect.top;
    const rw = rowRect.width;
    const rh = rowRect.height;

    const lx = labelRect.left - boardRect.left;
    const lw = labelRect.width;

    // Row content background
    ctx.fillStyle = "#141414";
    ctx.fillRect(rx, ry, rw, rh);

    // Colored tier label column
    ctx.fillStyle = tier.color;
    ctx.fillRect(lx, ry, lw, rh);

    // Tier letter
    const labelFontSize = Math.min(58, Math.max(30, lw * 0.31));
    ctx.fillStyle = "#000000";
    ctx.font = `400 ${labelFontSize}px ${fontFamily}`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(tier.label, lx + lw / 2, ry + rh / 2 + 1);

    // Subtle 1px divider between colored column and dark content area
    ctx.fillStyle = "#000000";
    ctx.fillRect(lx + lw, ry, 1, rh);

    // Horizontal divider at bottom of row on the dark side
    ctx.fillStyle = "#000000";
    ctx.fillRect(lx + lw, ry + rh - 1, rw - lw, 1);

    // Draw each tile using its exact DOM coordinates
    for (const itemId of boardState.tiers[tier.id]) {
      const item = boardState.items[itemId];
      const tileEl = rowEl.querySelector<HTMLElement>(
        `[data-harness-tile="${itemId}"]`,
      );
      if (!item || !tileEl) continue;

      const tileRect = tileEl.getBoundingClientRect();
      const tx = tileRect.left - boardRect.left;
      const centerX = tx + tileRect.width / 2;

      const iconEl = tileEl.querySelector<HTMLElement>("[data-harness-icon]");
      if (iconEl) {
        const iconRect = iconEl.getBoundingClientRect();
        const ix = iconRect.left - boardRect.left;
        const iy = iconRect.top - boardRect.top;
        const img = loadedIcons.get(itemId);
        if (img) {
          ctx.drawImage(img, ix, iy, iconRect.width, iconRect.height);
        }

        if (showScores && item.score) {
          ctx.fillStyle = "#7a7a7a";
          ctx.font = `400 11px ${fontFamily}`;
          ctx.textAlign = "center";
          ctx.textBaseline = "bottom";
          ctx.fillText(item.score, centerX, iy - 5);
        }

        ctx.fillStyle = "#ededed";
        ctx.font = `400 12.5px ${fontFamily}`;
        ctx.textAlign = "center";
        ctx.textBaseline = "top";
        const lines = wrapTextLines(ctx, item.name, 84);
        const startY = iy + iconRect.height + 6;
        lines.forEach((line, index) => {
          ctx.fillText(line, centerX, startY + index * 15);
        });
      }
    }
  }

  const blob = await new Promise<Blob | null>((resolve) =>
    canvas.toBlob(resolve, "image/png"),
  );
  if (!blob) {
    throw new Error("Failed to encode tier board PNG");
  }

  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "harness-tier-list.png";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
