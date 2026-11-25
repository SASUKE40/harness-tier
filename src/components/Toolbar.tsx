import {
  ArrowUpDown,
  Check,
  Download,
  ExternalLink,
  Eye,
  EyeOff,
  Inbox,
  Plus,
  RotateCcw,
} from "lucide-react";
import {
  SORT_PRESET_DEFINITIONS,
  isSortPresetId,
  type SortPresetId,
} from "../types";

interface ToolbarProps {
  sortPreset: SortPresetId;
  showScores: boolean;
  showUnranked: boolean;
  unrankedCount: number;
  isExporting: boolean;
  exportSuccess: boolean;
  onSelectSortPreset: (preset: SortPresetId) => void;
  onToggleScores: () => void;
  onToggleUnranked: () => void;
  onOpenAddModal: () => void;
  onExportPng: () => void;
  onReset: () => void;
}

export function Toolbar({
  sortPreset,
  showScores,
  showUnranked,
  unrankedCount,
  isExporting,
  exportSuccess,
  onSelectSortPreset,
  onToggleScores,
  onToggleUnranked,
  onOpenAddModal,
  onExportPng,
  onReset,
}: ToolbarProps) {
  const activePreset = SORT_PRESET_DEFINITIONS.find((p) => p.id === sortPreset);

  return (
    <header className="toolbar">
      <div className="toolbar-left">
        <h1 className="toolbar-title">AI Coding Harness Tier List</h1>
        <a
          href="https://frontierharness.org/"
          target="_blank"
          rel="noopener noreferrer"
          className="toolbar-source-link"
          title="Benchmark source: FrontierHarness Eval v1.1 (All models · 62 tasks)"
        >
          <span>FrontierHarness v1.1</span>
          <ExternalLink size={11} />
        </a>
      </div>

      <div className="toolbar-actions" role="toolbar" aria-label="Tier list controls">
        <label
          className="toolbar-select-wrap"
          title={activePreset?.description ?? "Sort tier list by benchmark metric"}
        >
          <ArrowUpDown size={13} className="toolbar-select-icon" />
          <select
            className="toolbar-select"
            aria-label="Sort harnesses by benchmark metric"
            value={sortPreset}
            onChange={(e) => {
              if (isSortPresetId(e.target.value)) {
                onSelectSortPreset(e.target.value);
              }
            }}
          >
            {SORT_PRESET_DEFINITIONS.map((preset) => (
              <option key={preset.id} value={preset.id}>
                {preset.label}
              </option>
            ))}
          </select>
        </label>

        <button
          type="button"
          className={`toolbar-btn${showScores ? " is-active" : ""}`}
          onClick={onToggleScores}
          aria-pressed={showScores}
          title={showScores ? "Hide scores" : "Show scores"}
        >
          {showScores ? <Eye size={14} /> : <EyeOff size={14} />}
          <span>Scores</span>
        </button>

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
          title="Reset tier list to current preset placements"
        >
          <RotateCcw size={14} />
          <span>Reset</span>
        </button>
      </div>
    </header>
  );
}
