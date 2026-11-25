import { useCallback, useRef, useState } from "react";
import { useTierBoard } from "./hooks/useTierBoard";
import { Toolbar } from "./components/Toolbar";
import { TierBoard } from "./components/TierBoard";
import { AddHarnessModal } from "./components/AddHarnessModal";
import { exportTierBoardToPng } from "./utils/exportPng";

export default function App() {
  const {
    board,
    showUnranked,
    moveAcrossContainers,
    reorderWithinContainer,
    restoreBoardSnapshot,
    resetToDefault,
    toggleUnranked,
    addCustomHarness,
    removeCustomHarness,
  } = useTierBoard();

  const boardRef = useRef<HTMLDivElement | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [exportSuccess, setExportSuccess] = useState(false);
  const [exportError, setExportError] = useState<string | null>(null);

  const handleExportPng = useCallback(async () => {
    const el = boardRef.current;
    if (!el || isExporting) return;
    setIsExporting(true);
    setExportError(null);
    try {
      await exportTierBoardToPng(el, board);
      setExportSuccess(true);
      window.setTimeout(() => setExportSuccess(false), 1800);
    } catch (err) {
      setExportError(
        err instanceof Error ? err.message : "Could not export PNG.",
      );
    } finally {
      setIsExporting(false);
    }
  }, [board, isExporting]);

  return (
    <div className="app-shell">
      <div className="app-container">
        <Toolbar
          showUnranked={showUnranked}
          unrankedCount={board.tiers.unranked.length}
          isExporting={isExporting}
          exportSuccess={exportSuccess}
          onToggleUnranked={toggleUnranked}
          onOpenAddModal={() => setIsAddModalOpen(true)}
          onExportPng={handleExportPng}
          onReset={resetToDefault}
        />

        {exportError && (
          <div className="status-banner" role="alert">
            {exportError}
          </div>
        )}

        <main>
          <TierBoard
            board={board}
            boardRef={boardRef}
            showUnranked={showUnranked}
            onMoveAcrossContainers={moveAcrossContainers}
            onReorderWithinContainer={reorderWithinContainer}
            onRestoreSnapshot={restoreBoardSnapshot}
            onRemoveCustom={removeCustomHarness}
          />
        </main>
      </div>

      <AddHarnessModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAdd={addCustomHarness}
      />
    </div>
  );
}
