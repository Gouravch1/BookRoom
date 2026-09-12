"use client";

import { useState, useEffect } from "react";
import { bookService } from "@/services/book.service";
import { getApiErrorMessage } from "@/lib/api-client";
import { toast } from "@/components/ui/toaster";
import { X, AlertCircle } from "lucide-react";

interface EditBookDialogProps {
  open: boolean;
  onClose: () => void;
  bookId: number;
  initialTitle: string;
  initialAuthor: string;
  onUpdated: () => void;
}

export function EditBookDialog({
  open,
  onClose,
  bookId,
  initialTitle,
  initialAuthor,
  onUpdated,
}: EditBookDialogProps) {
  const [title, setTitle] = useState(initialTitle);
  const [author, setAuthor] = useState(initialAuthor);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (open) {
      setTitle(initialTitle);
      setAuthor(initialAuthor);
      setError("");
    }
  }, [open, initialTitle, initialAuthor]);

  if (!open) return null;

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) { setError("Title is required."); return; }
    setIsLoading(true);
    setError("");
    try {
      await bookService.updateBook(bookId, { title: title.trim(), author: author.trim() || undefined });
      toast({ title: "Book updated" });
      onUpdated();
      onClose();
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  }

  const inputStyle = {
    background: "var(--bg-base)",
    border: "1px solid var(--border-default)",
    borderRadius: "var(--radius-md)",
    color: "var(--text-primary)",
    height: "40px",
    padding: "0 12px",
    fontSize: "14px",
    width: "100%",
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 backdrop-blur-sm"
        style={{ background: "rgba(0,0,0,0.7)" }}
        onClick={onClose}
      />

      {/* Dialog */}
      <div
        className="relative rounded-2xl w-full max-w-md p-6 animate-scale-in"
        style={{
          background: "var(--bg-card)",
          border: "1px solid var(--border-default)",
          boxShadow: "0 24px 64px rgba(0,0,0,0.6)",
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-semibold text-base" style={{ color: "var(--text-primary)" }}>
            Edit book details
          </h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-200"
            style={{ background: "var(--bg-hover)", color: "var(--text-muted)" }}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSave} className="flex flex-col gap-4">
          {/* Title */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium" style={{ color: "var(--text-secondary)" }}>
              Title
            </label>
            <input
              id="edit-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              style={inputStyle}
            />
          </div>

          {/* Author */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium" style={{ color: "var(--text-secondary)" }}>
              Author
            </label>
            <input
              id="edit-author"
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
              placeholder="Optional"
              style={{ ...inputStyle, color: author ? "var(--text-primary)" : undefined }}
            />
          </div>

          {/* Error */}
          {error && (
            <div
              className="flex items-start gap-2 rounded-xl px-3 py-2.5 text-sm"
              style={{
                background: "var(--red-dim)",
                border: "1px solid rgba(248,113,113,0.2)",
                color: "var(--red)",
              }}
            >
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              {error}
            </div>
          )}

          {/* Buttons */}
          <div className="flex gap-2 justify-end mt-1">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200"
              style={{
                background: "var(--bg-raised)",
                border: "1px solid var(--border-default)",
                color: "var(--text-secondary)",
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200"
              style={{
                background: isLoading ? "var(--bg-hover)" : "var(--accent)",
                color: isLoading ? "var(--text-muted)" : "#0e0e0f",
                cursor: isLoading ? "not-allowed" : "pointer",
              }}
            >
              {isLoading ? "Saving…" : "Save changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
