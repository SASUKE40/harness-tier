import {
  Check,
  Download,
  Eye,
  EyeOff,
  Inbox,
  Plus,
  RotateCcw,
} from "lucide-react";

interface ToolbarProps {
  showScores: boolean;
  showUnranked: boolean;
  unrankedCount: number;
  isExporting: boolean;
  exportSuccess: boolean;
  onToggleScores: () => void;
  onToggleUnranked: () => void;
  onOpenAddModal: () => void;
  onExportPng: () => void;
  onReset: () => void;
}

export function Toolbar({
  showScores,
  showUnranked,
  unrankedCount,
  isExporting,
  exportSuccess,
  onToggleScores,
  onToggleUnranked,
  onOpenAddModal,
  onExportPng,
  onReset,
}: ToolbarProps) {
  return (
    <header className="toolbar">
      <div className="toolbar-left">
        <h1 className="toolbar-title">AI Coding Harness Tier List</h1>
      </div>

      <div className="toolbar-actions" role="toolbar" aria-label="Tier list controls">
        <button
          type="button"
          className={`toolbar-btn${showScores ? " is-active" : ""}`}
          onClick={onToggleScores}
          aria-pressed={showScores}
          title={showScores ? "Hide numeric scores" : "Show numeric scores"}
        >
          {showScores ? <Eye size={14} /> : <EyeOff size={14} />}
          <span>Scores</span>
        </button>

        <button
          type="button"
          className={`toolbar-btn${showUnranked ? " is-active" : ""}`}
          onClick={onToggleUnranked}
          aria-pressed={showUnranked}
          title="Toggle unranked tray"
        >
          <Inbox size={14} />
          <span>
            Unranked{unrankedCount > 0 ? ` (${unrankedCount})` : ""}
          </span>
        </button>

        <button
          type="button"
          className="toolbar-btn"
          onClick={onOpenAddModal}
          title="Add custom harness"
        >
          <Plus size={14} />
          <span>Add</span>
        </button>

        <button
          type="button"
          className="toolbar-btn"
          onClick={onExportPng}
          disabled={isExporting}
          title="Export tier board as PNG"
        >
          {exportSuccess ? <Check size={14} /> : <Download size={14} />}
          <span>{isExporting ? "Exporting..." : exportSuccess ? "Saved" : "Export PNG"}</span>
        </button>

        <button
          type="button"
          className="toolbar-btn toolbar-btn-reset"
          onClick={onReset}
          title="Reset tier list to default placements"
        >
          <RotateCcw size={14} />
          <span>Reset</span>
        </button>
      </div>
    </header>
  );
}
