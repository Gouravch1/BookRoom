"use client";

import { useCallback, useRef, useState } from "react";
import { UploadCloud, FileText, X } from "lucide-react";
import { cn } from "@/lib/utils";

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
        <div className="flex items-center gap-3 rounded-xl border border-stone-200 bg-stone-50 px-4 py-3">
          <div className="w-10 h-10 rounded-lg bg-stone-200 flex items-center justify-center shrink-0">
            <FileText className="w-5 h-5 text-stone-600" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-stone-900 truncate">{selectedFile.name}</p>
            <p className="text-xs text-stone-500">{sizeMB} MB · PDF</p>
          </div>
          <button
            type="button"
            onClick={onClear}
            className="text-stone-400 hover:text-stone-700 transition-colors p-1"
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
          className={cn(
            "relative flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed cursor-pointer transition-all duration-200 py-10 px-6",
            isDragging
              ? "border-stone-500 bg-stone-50"
              : "border-stone-200 hover:border-stone-400 hover:bg-stone-50"
          )}
        >
          <div className="w-12 h-12 rounded-xl bg-stone-100 flex items-center justify-center">
            <UploadCloud className="w-6 h-6 text-stone-400" />
          </div>
          <div className="text-center">
            <p className="text-sm font-medium text-stone-700">
              Drop your PDF here, or{" "}
              <span className="text-stone-900 underline underline-offset-2">browse</span>
            </p>
            <p className="text-xs text-stone-400 mt-1">PDF files up to 100 MB</p>
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
        <p className="text-xs text-red-600 mt-1.5">{dragError}</p>
      )}
    </div>
  );
}
