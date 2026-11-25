import { useDroppable } from "@dnd-kit/core";
import { SortableContext, rectSortingStrategy } from "@dnd-kit/sortable";
import { toDroppableId, type HarnessItem } from "../types";
import { SortableHarnessTile } from "./HarnessTile";

interface UnrankedTrayProps {
  itemIds: string[];
  itemsById: Record<string, HarnessItem>;
  showScores: boolean;
  isActiveDropTarget: boolean;
  onRemoveCustom: (id: string) => void;
}

export function UnrankedTray({
  itemIds,
  itemsById,
  showScores,
  isActiveDropTarget,
  onRemoveCustom,
}: UnrankedTrayProps) {
  const { setNodeRef } = useDroppable({
    id: toDroppableId("unranked"),
  });

  return (
    <section
      className={`unranked-tray${isActiveDropTarget ? " is-drop-target" : ""}`}
      aria-label="Unranked harnesses"
      data-tier-row="unranked"
    >
      <div className="unranked-header">
        <span className="unranked-title">Unranked</span>
        <span className="unranked-count">{itemIds.length}</span>
      </div>

      <div
        ref={setNodeRef}
        className="unranked-items"
        data-tier-dropzone="unranked"
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
          <div className="unranked-empty">
            Drag harnesses here to park them off the tier board
          </div>
        )}
      </div>
    </section>
  );
}
