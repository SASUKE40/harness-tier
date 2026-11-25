import {
  Check,
  Download,
  ExternalLink,
  Inbox,
  Plus,
  RotateCcw,
} from "lucide-react";

interface ToolbarProps {
  showUnranked: boolean;
  unrankedCount: number;
  isExporting: boolean;
  exportSuccess: boolean;
  onToggleUnranked: () => void;
  onOpenAddModal: () => void;
  onExportPng: () => void;
  onReset: () => void;
}

export function Toolbar({
  showUnranked,
  unrankedCount,
  isExporting,
  exportSuccess,
  onToggleUnranked,
  onOpenAddModal,
  onExportPng,
  onReset,
}: ToolbarProps) {
  return (
    <header className="toolbar">
      <div className="toolbar-left">
        <h1 className="toolbar-title">AI Coding Harness Tier List</h1>
        <a
          href="https://frontierharness.org/"
          target="_blank"
          rel="noopener noreferrer"
          className="toolbar-source-link"
          title="Benchmark source: FrontierHarness Eval v1.1"
        >
          <span>FrontierHarness v1.1</span>
          <ExternalLink size={11} />
        </a>
      </div>

      <div className="toolbar-actions" role="toolbar" aria-label="Tier list controls">
        <button
          type="button"
          className={`toolbar-btn${showUnranked ? " is-active" : ""}`}
          onClick={onToggleUnranked}
          aria-pressed={showUnranked}
          title="Toggle unranked harnesses tray"
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
