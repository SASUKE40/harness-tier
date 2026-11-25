import { useCallback, useEffect, useRef, useState, type RefObject } from "react";
import {
  DndContext,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
  closestCenter,
  defaultDropAnimationSideEffects,
  getFirstCollision,
  pointerWithin,
  rectIntersection,
  useSensor,
  useSensors,
  type CollisionDetection,
  type DragEndEvent,
  type DragOverEvent,
  type DragStartEvent,
  type DropAnimation,
  type UniqueIdentifier,
} from "@dnd-kit/core";
import { sortableKeyboardCoordinates } from "@dnd-kit/sortable";
import {
  TIER_DEFINITIONS,
  fromDroppableId,
  toDroppableId,
  type ContainerId,
  type TierBoardState,
} from "../types";
import { findContainerForItem } from "../hooks/useTierBoard";
import { HarnessTileContent } from "./HarnessTile";
import { TierRow } from "./TierRow";
import { UnrankedTray } from "./UnrankedTray";

interface TierBoardProps {
  board: TierBoardState;
  boardRef: RefObject<HTMLDivElement | null>;
  showScores: boolean;
  showUnranked: boolean;
  onMoveAcrossContainers: (
    itemId: string,
    fromContainer: ContainerId,
    toContainer: ContainerId,
    targetIndex: number,
  ) => void;
  onReorderWithinContainer: (
    containerId: ContainerId,
    activeId: string,
    overId: string,
  ) => void;
  onRestoreSnapshot: (snapshot: TierBoardState) => void;
  onRemoveCustom: (itemId: string) => void;
}

const dropAnimation: DropAnimation = {
  sideEffects: defaultDropAnimationSideEffects({
    styles: {
      active: {
        opacity: "0.35",
      },
    },
  }),
};

export function TierBoard({
  board,
  boardRef,
  showScores,
  showUnranked,
  onMoveAcrossContainers,
  onReorderWithinContainer,
  onRestoreSnapshot,
  onRemoveCustom,
}: TierBoardProps) {
  const [activeId, setActiveId] = useState<string | null>(null);
  const [overContainerId, setOverContainerId] = useState<ContainerId | null>(null);
  const snapshotRef = useRef<TierBoardState | null>(null);
  const lastOverIdRef = useRef<UniqueIdentifier | null>(null);
  const recentlyMovedToNewContainer = useRef(false);

  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      recentlyMovedToNewContainer.current = false;
    });
    return () => cancelAnimationFrame(frame);
  }, [board.tiers]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 4,
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 140,
        tolerance: 6,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const resolveContainer = useCallback(
    (id: UniqueIdentifier | null): ContainerId | null => {
      if (id === null) return null;
      const str = String(id);
      const direct = fromDroppableId(str);
      if (direct) return direct;
      return findContainerForItem(board.tiers, str);
    },
    [board.tiers],
  );

  const collisionDetectionStrategy: CollisionDetection = useCallback(
    (args) => {
      const pointerCollisions = pointerWithin(args);
      const intersections =
        pointerCollisions.length > 0 ? pointerCollisions : rectIntersection(args);

      let overId = getFirstCollision(intersections, "id");

      if (overId !== null) {
        const overContainer = fromDroppableId(String(overId));
        if (overContainer) {
          const containerItems = board.tiers[overContainer];
          if (containerItems.length > 0) {
            // Check if pointer is directly inside an item in this container first
            const itemHits = pointerCollisions.filter(
              (c) => fromDroppableId(String(c.id)) === null && containerItems.includes(String(c.id)),
            );
            if (itemHits.length > 0 && itemHits[0]) {
              overId = itemHits[0].id;
            } else {
              // If pointer is in the empty trailing area past the last item, append to the container
              const pointer = args.pointerCoordinates;
              const lastItemId = containerItems[containerItems.length - 1];
              const lastRect = lastItemId
                ? args.droppableRects.get(lastItemId)
                : undefined;
              const isPastLast =
                pointer &&
                lastRect &&
                (pointer.y > lastRect.bottom ||
                  (pointer.y >= lastRect.top - 12 && pointer.x > lastRect.right));

              if (!isPastLast) {
                const closestInContainer = closestCenter({
                  ...args,
                  droppableContainers: args.droppableContainers.filter(
                    (c) => containerItems.includes(String(c.id)),
                  ),
                });
                if (closestInContainer[0]) {
                  overId = closestInContainer[0].id;
                }
              }
            }
          }
        }

        lastOverIdRef.current = overId;
        return [{ id: overId }];
      }

      if (recentlyMovedToNewContainer.current && lastOverIdRef.current !== null) {
        return [{ id: lastOverIdRef.current }];
      }

      const fallback = closestCenter(args);
      if (fallback.length > 0 && fallback[0]) {
        lastOverIdRef.current = fallback[0].id;
      }
      return fallback;
    },
    [board.tiers],
  );

  const handleDragStart = (event: DragStartEvent) => {
    const id = String(event.active.id);
    setActiveId(id);
    setOverContainerId(findContainerForItem(board.tiers, id));
    snapshotRef.current = {
      items: { ...board.items },
      tiers: {
        S: [...board.tiers.S],
        A: [...board.tiers.A],
        B: [...board.tiers.B],
        C: [...board.tiers.C],
        D: [...board.tiers.D],
        F: [...board.tiers.F],
        unranked: [...board.tiers.unranked],
      },
    };
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over) {
      setOverContainerId(null);
      return;
    }

    const activeItemId = String(active.id);
    const overId = String(over.id);

    const activeContainer = resolveContainer(activeItemId);
    const overContainer = resolveContainer(overId);

    if (!activeContainer || !overContainer) return;
    setOverContainerId(overContainer);

    if (activeContainer === overContainer) return;

    const overItems = board.tiers[overContainer];
    let targetIndex: number;

    if (fromDroppableId(overId) !== null) {
      targetIndex = overItems.length;
    } else {
      const overIndex = overItems.indexOf(overId);
      const activeRect = active.rect.current.translated;
      const isAfterOverItem =
        activeRect !== null &&
        activeRect.left + activeRect.width / 2 >
          over.rect.left + over.rect.width / 2;

      targetIndex =
        overIndex >= 0
          ? overIndex + (isAfterOverItem ? 1 : 0)
          : overItems.length;
    }

    recentlyMovedToNewContainer.current = true;
    onMoveAcrossContainers(activeItemId, activeContainer, overContainer, targetIndex);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);
    setOverContainerId(null);
    snapshotRef.current = null;

    if (!over) return;

    const activeItemId = String(active.id);
    const overId = String(over.id);

    const activeContainer = resolveContainer(activeItemId);
    const overContainer = resolveContainer(overId);

    if (!activeContainer || !overContainer) return;

    if (activeContainer !== overContainer) {
      const destItems = board.tiers[overContainer];
      const overIndex = destItems.indexOf(overId);
      const targetIndex = overIndex >= 0 ? overIndex : destItems.length;
      onMoveAcrossContainers(activeItemId, activeContainer, overContainer, targetIndex);
      return;
    }

    if (overId === toDroppableId(activeContainer)) {
      const list = board.tiers[activeContainer];
      const lastItem = list[list.length - 1];
      if (lastItem && lastItem !== activeItemId) {
        onReorderWithinContainer(activeContainer, activeItemId, lastItem);
      }
      return;
    }

    if (activeItemId !== overId) {
      onReorderWithinContainer(activeContainer, activeItemId, overId);
    }
  };

  const handleDragCancel = () => {
    if (snapshotRef.current) {
      onRestoreSnapshot(snapshotRef.current);
    }
    snapshotRef.current = null;
    setActiveId(null);
    setOverContainerId(null);
  };

  const activeItem = activeId ? board.items[activeId] : null;

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={collisionDetectionStrategy}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
      onDragCancel={handleDragCancel}
    >
      <div
        ref={boardRef}
        id="tier-board"
        className="tier-board"
        role="region"
        aria-label="Tier list board"
      >
        {TIER_DEFINITIONS.map((tier) => (
          <TierRow
            key={tier.id}
            tier={tier}
            itemIds={board.tiers[tier.id]}
            itemsById={board.items}
            showScores={showScores}
            isActiveDropTarget={activeId !== null && overContainerId === tier.id}
            isDraggingAny={activeId !== null}
            onRemoveCustom={onRemoveCustom}
          />
        ))}
      </div>

      {showUnranked && (
        <UnrankedTray
          itemIds={board.tiers.unranked}
          itemsById={board.items}
          showScores={showScores}
          isActiveDropTarget={activeId !== null && overContainerId === "unranked"}
          onRemoveCustom={onRemoveCustom}
        />
      )}

      <DragOverlay dropAnimation={dropAnimation}>
        {activeItem ? (
          <div className="harness-tile-overlay">
            <HarnessTileContent
              item={activeItem}
              showScores={showScores}
              isOverlay
            />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
