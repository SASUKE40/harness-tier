import type { CSSProperties } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { X } from "lucide-react";
import type { HarnessItem } from "../types";

interface HarnessTileContentProps {
  item: HarnessItem;
  showScores: boolean;
  isOverlay?: boolean;
  onRemoveCustom?: (id: string) => void;
}

export function HarnessTileContent({
  item,
  showScores,
  isOverlay = false,
  onRemoveCustom,
}: HarnessTileContentProps) {
  return (
    <div
      className={`harness-tile-inner${isOverlay ? " is-overlay" : ""}`}
      title={item.details ?? item.name}
    >
      {item.isCustom && !isOverlay && onRemoveCustom && (
        <button
          type="button"
          className="harness-remove-btn"
          title={`Remove ${item.name}`}
          aria-label={`Remove ${item.name}`}
          onPointerDown={(e) => e.stopPropagation()}
          onClick={(e) => {
            e.stopPropagation();
            onRemoveCustom(item.id);
          }}
        >
          <X size={11} strokeWidth={2.5} />
        </button>
      )}

      {showScores && (
        <span className="harness-score" aria-label={item.score ? `Score ${item.score}` : undefined}>
          {item.score ?? "\u00A0"}
        </span>
      )}

      <div className="harness-icon-frame" data-harness-icon>
        <img
          src={item.icon}
          alt={item.name}
          className="harness-icon"
          draggable={false}
          loading="eager"
          decoding="async"
        />
      </div>

      <span className="harness-label">{item.name}</span>
    </div>
  );
}

interface SortableHarnessTileProps {
  item: HarnessItem;
  showScores: boolean;
  onRemoveCustom?: (id: string) => void;
}

export function SortableHarnessTile({
  item,
  showScores,
  onRemoveCustom,
}: SortableHarnessTileProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.id });

  const style: CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`harness-tile${isDragging ? " is-dragging" : ""}`}
      data-harness-tile={item.id}
      {...attributes}
      {...listeners}
    >
      <HarnessTileContent
        item={item}
        showScores={showScores}
        onRemoveCustom={onRemoveCustom}
      />
    </div>
  );
}
