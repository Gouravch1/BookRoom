"use client";

import { useCallback, useRef, useState } from "react";
import { UploadCloud, FileText, X } from "lucide-react";

interface PdfDropzoneProps {
  onFileSelected: (file: File) => void;
  selectedFile: File | null;
  onClear: () => void;
}

export function PdfDropzone({ onFileSelected, selectedFile, onClear }: PdfDropzoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [dragError, setDragError] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const validateAndSelect = useCallback(
    (file: File) => {
      setDragError("");
      if (file.type !== "application/pdf") {
        setDragError("Only PDF files are supported.");
        return;
      }
      if (file.size > 100 * 1024 * 1024) {
        setDragError("File must be under 100 MB.");
        return;
      }
      onFileSelected(file);
    },
    [onFileSelected]
  );

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) validateAndSelect(file);
  }

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) validateAndSelect(file);
    e.target.value = "";
  }

  const sizeMB = selectedFile
    ? (selectedFile.size / (1024 * 1024)).toFixed(1)
    : null;

  return (
    <div>
      {selectedFile ? (
        <div
          className="flex items-center gap-3 rounded-xl px-4 py-3 animate-scale-in"
          style={{
            background: "var(--accent-dim)",
            border: "1px solid rgba(232,160,69,0.25)",
          }}
        >
          <div
            className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
            style={{ background: "rgba(232,160,69,0.15)" }}
          >
            <FileText className="w-5 h-5" style={{ color: "var(--accent)" }} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate" style={{ color: "var(--text-primary)" }}>
              {selectedFile.name}
            </p>
            <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>
              {sizeMB} MB · PDF
            </p>
          </div>
          <button
            type="button"
            onClick={onClear}
            className="p-1.5 rounded-lg transition-all duration-200"
            style={{ color: "var(--text-muted)" }}
            aria-label="Remove file"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <div
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          onClick={() => inputRef.current?.click()}
          className="relative flex flex-col items-center justify-center gap-4 rounded-2xl border-2 border-dashed cursor-pointer transition-all duration-200 py-12 px-6"
          style={{
            borderColor: isDragging ? "var(--accent)" : "var(--border-default)",
            background: isDragging ? "var(--accent-dim)" : "var(--bg-raised)",
          }}
        >
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-200"
            style={{
              background: isDragging ? "rgba(232,160,69,0.15)" : "var(--bg-hover)",
              border: `1px solid ${isDragging ? "rgba(232,160,69,0.3)" : "var(--border-default)"}`,
            }}
          >
            <UploadCloud
              className="w-7 h-7 transition-colors duration-200"
              style={{ color: isDragging ? "var(--accent)" : "var(--text-muted)" }}
            />
          </div>
          <div className="text-center">
            <p className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>
              Drop your PDF here, or{" "}
              <span style={{ color: "var(--accent)" }}>browse</span>
            </p>
            <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>
              PDF files up to 100 MB
            </p>
          </div>
          <input
            ref={inputRef}
            type="file"
            accept="application/pdf"
            onChange={handleInputChange}
            className="hidden"
            id="pdf-file-input"
          />
        </div>
      )}
      {dragError && (
        <p className="text-xs mt-2" style={{ color: "var(--red)" }}>
          {dragError}
        </p>
      )}
    </div>
  );
}
