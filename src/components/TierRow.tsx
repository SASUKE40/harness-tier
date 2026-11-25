import { useDroppable } from "@dnd-kit/core";
import { SortableContext, rectSortingStrategy } from "@dnd-kit/sortable";
import {
  toDroppableId,
  type HarnessItem,
  type TierDefinition,
} from "../types";
import { SortableHarnessTile } from "./HarnessTile";

interface TierRowProps {
  tier: TierDefinition;
  itemIds: string[];
  itemsById: Record<string, HarnessItem>;
  showScores: boolean;
  isActiveDropTarget: boolean;
  isDraggingAny: boolean;
  onRemoveCustom: (id: string) => void;
}

export function TierRow({
  tier,
  itemIds,
  itemsById,
  showScores,
  isActiveDropTarget,
  isDraggingAny,
  onRemoveCustom,
}: TierRowProps) {
  const { setNodeRef } = useDroppable({
    id: toDroppableId(tier.id),
  });

  return (
    <div
      className={`tier-row${isActiveDropTarget ? " is-drop-target" : ""}`}
      data-tier-row={tier.id}
    >
      <div
        className="tier-label-cell"
        data-tier-label={tier.id}
        style={{ backgroundColor: tier.color }}
      >
        <span className="tier-label-text">{tier.label}</span>
      </div>

      <div
        ref={setNodeRef}
        className="tier-items-cell"
        data-tier-dropzone={tier.id}
      >
        <SortableContext items={itemIds} strategy={rectSortingStrategy}>
          {itemIds.map((id) => {
            const item = itemsById[id];
            if (!item) return null;
            return (
              <SortableHarnessTile
                key={item.id}
                item={item}
                showScores={showScores}
                onRemoveCustom={onRemoveCustom}
              />
            );
          })}
        </SortableContext>

        {itemIds.length === 0 && (
          <div className={`tier-empty-hint${isDraggingAny ? " is-visible" : ""}`}>
            Drop harness here
          </div>
        )}
      </div>
    </div>
  );
}
