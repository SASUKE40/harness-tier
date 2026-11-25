import { useEffect, useState, type ChangeEvent, type FormEvent } from "react";
import { Upload, X } from "lucide-react";
import {
  ALL_CONTAINER_IDS,
  type ContainerId,
} from "../types";
import type { AddHarnessInput } from "../hooks/useTierBoard";
import { createMonogramDataUrl } from "../data/harnesses";

const ACCENT_PALETTE = [
  "#2563eb",
  "#7c3aed",
  "#db2777",
  "#dc2626",
  "#ea580c",
  "#16a34a",
  "#0891b2",
  "#374151",
] as const;

interface AddHarnessModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (input: AddHarnessInput) => void;
}

export function AddHarnessModal({
  isOpen,
  onClose,
  onAdd,
}: AddHarnessModalProps) {
  const [name, setName] = useState("");
  const [score, setScore] = useState("");
  const [iconUrl, setIconUrl] = useState("");
  const [uploadedDataUrl, setUploadedDataUrl] = useState<string | null>(null);
  const [accentColor, setAccentColor] = useState<string>(ACCENT_PALETTE[0]);
  const [targetContainer, setTargetContainer] = useState<ContainerId>("unranked");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const previewIcon =
    uploadedDataUrl ||
    iconUrl.trim() ||
    createMonogramDataUrl(name || "AI", accentColor);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setError("Please select an image file.");
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      setError("Image must be under 2 MB.");
      return;
    }
    setError(null);
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        setUploadedDataUrl(reader.result);
        setIconUrl("");
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) {
      setError("Harness name is required.");
      return;
    }
    onAdd({
      name: trimmed,
      score: score.trim() || null,
      iconDataOrUrl: uploadedDataUrl || iconUrl.trim() || null,
      accentColor,
      targetContainer,
    });
    setName("");
    setScore("");
    setIconUrl("");
    setUploadedDataUrl(null);
    setTargetContainer("unranked");
    setError(null);
    onClose();
  };

  return (
    <div
      className="modal-backdrop"
      role="dialog"
      aria-modal="true"
      aria-labelledby="add-harness-title"
      onClick={onClose}
    >
      <div className="modal-panel" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 id="add-harness-title" className="modal-title">
            Add Custom Harness
          </h2>
          <button
            type="button"
            className="modal-close-btn"
            onClick={onClose}
            aria-label="Close modal"
          >
            <X size={16} />
          </button>
        </div>

        <form className="modal-form" onSubmit={handleSubmit}>
          <div className="modal-preview-row">
            <div className="modal-preview-tile">
              {score.trim() && (
                <span className="harness-score">{score.trim()}</span>
              )}
              <div className="harness-icon-frame">
                <img
                  src={previewIcon}
                  alt={name || "Preview"}
                  className="harness-icon"
                />
              </div>
              <span className="harness-label">{name.trim() || "New Harness"}</span>
            </div>

            <div className="modal-fields-col">
              <label className="form-field">
                <span className="form-label">Name *</span>
                <input
                  type="text"
                  className="form-input"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    if (error) setError(null);
                  }}
                  placeholder="e.g. Roo Code"
                  maxLength={32}
                  autoFocus
                />
              </label>

              <div className="form-row-2">
                <label className="form-field">
                  <span className="form-label">Score (optional)</span>
                  <input
                    type="text"
                    className="form-input"
                    value={score}
                    onChange={(e) => setScore(e.target.value)}
                    placeholder="e.g. -6.5"
                    maxLength={12}
                  />
                </label>

                <label className="form-field">
                  <span className="form-label">Place in</span>
                  <select
                    className="form-input"
                    value={targetContainer}
                    onChange={(e) =>
                      setTargetContainer(e.target.value as ContainerId)
                    }
                  >
                    {ALL_CONTAINER_IDS.map((id) => (
                      <option key={id} value={id}>
                        {id === "unranked" ? "Unranked" : `Tier ${id}`}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
            </div>
          </div>

          <div className="form-field">
            <span className="form-label">Icon (optional — defaults to monogram)</span>
            <div className="icon-source-row">
              <input
                type="url"
                className="form-input"
                value={iconUrl}
                onChange={(e) => {
                  setIconUrl(e.target.value);
                  setUploadedDataUrl(null);
                }}
                placeholder="https://example.com/logo.png"
              />
              <label className="upload-btn">
                <Upload size={14} />
                <span>Upload</span>
                <input
                  type="file"
                  accept="image/*"
                  className="sr-only"
                  onChange={handleFileChange}
                />
              </label>
            </div>
          </div>

          {!uploadedDataUrl && !iconUrl.trim() && (
            <div className="form-field">
              <span className="form-label">Badge Color</span>
              <div className="color-swatches">
                {ACCENT_PALETTE.map((hex) => (
                  <button
                    key={hex}
                    type="button"
                    className={`color-swatch${accentColor === hex ? " is-selected" : ""}`}
                    style={{ backgroundColor: hex }}
                    onClick={() => setAccentColor(hex)}
                    aria-label={`Select color ${hex}`}
                  />
                ))}
              </div>
            </div>
          )}

          {error && <p className="form-error">{error}</p>}

          <div className="modal-footer">
            <button type="button" className="modal-btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="modal-btn-primary">
              Add Harness
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
