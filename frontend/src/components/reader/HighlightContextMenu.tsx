"use client";

import { useEffect, useRef, useState } from "react";
import type { Highlight, HighlightColor } from "@/types/highlight";
import { getHighlightColorStyle } from "./HighlightOverlay";
import { StickyNote, Pencil, Trash2, Check, X, CornerDownLeft } from "lucide-react";

const COLORS: { color: HighlightColor; label: string }[] = [
  { color: "YELLOW", label: "Yellow" },
  { color: "GREEN",  label: "Green" },
  { color: "RED",    label: "Red" },
  { color: "BLUE",   label: "Blue" },
  { color: "PINK",   label: "Pink" },
  { color: "ORANGE", label: "Orange" },
  { color: "BLACK",  label: "Black" },
];

interface HighlightContextMenuProps {
  highlight: Highlight;
  position: { x: number; y: number };
  onDelete: (highlightId: number) => void;
  onChangeColor: (highlightId: number, color: HighlightColor) => void;
  onUpdateNote: (highlightId: number, note: string | null) => void;
  onClose: () => void;
}

/**
 * Floating context menu (desktop) and Bottom Sheet (mobile)
 * that appears when tapping an existing highlight or note marker.
 * Provides instant, smooth note viewing/editing, note clearing, color changing, and highlight removal.
 */
export function HighlightContextMenu({
  highlight,
  position,
  onDelete,
  onChangeColor,
  onUpdateNote,
  onClose,
}: HighlightContextMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const hasNote = Boolean(highlight.note && highlight.note.trim() !== "");
  const [isEditingNote, setIsEditingNote] = useState(false);
  const [isAddingNote, setIsAddingNote] = useState(false);
  const [draftNote, setDraftNote] = useState(highlight.note || "");
  const [isSaving, setIsSaving] = useState(false);

  // Initialize immediately based on window width so there is NO layout jump on mobile
  const [isMobile, setIsMobile] = useState(() =>
    typeof window !== "undefined" ? window.innerWidth < 768 : false
  );

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const isNearTop = position.y < 160;
  const clampedX = Math.max(
    170,
    Math.min(
      position.x,
      typeof window !== "undefined" ? window.innerWidth - 170 : position.x
    )
  );

  // Sync draftNote if highlight prop changes
  useEffect(() => {
    setDraftNote(highlight.note || "");
  }, [highlight.note]);

  // Focus textarea when editing/adding note
  useEffect(() => {
    if ((isEditingNote || isAddingNote) && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [isEditingNote, isAddingNote]);

  // Dismiss on outside click (desktop only, mobile has backdrop)
  useEffect(() => {
    if (isMobile) return;
    const handlePointerDown = (e: PointerEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    document.addEventListener("pointerdown", handlePointerDown, false);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown, false);
    };
  }, [onClose, isMobile]);

  // Dismiss on Escape
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [onClose]);

  const handleSaveNote = async () => {
    const trimmed = draftNote.trim();
    setIsSaving(true);
    try {
      await onUpdateNote(highlight.id, trimmed || null);
      setIsEditingNote(false);
      setIsAddingNote(false);
    } finally {
      setIsSaving(false);
    }
  };

  const handleClearNote = async () => {
    setIsSaving(true);
    try {
      await onUpdateNote(highlight.id, null);
      setIsEditingNote(false);
      setIsAddingNote(false);
    } finally {
      setIsSaving(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
      e.preventDefault();
      handleSaveNote();
    }
  };

  const content = (
    <div className="select-text">
      {/* Selected text snippet preview */}
      {highlight.selectedText && (
        <div
          style={{
            padding: "4px 8px 8px",
            borderBottom: "1px solid var(--border-subtle)",
            marginBottom: 10,
          }}
        >
          <p
            style={{
              fontSize: 12,
              lineHeight: 1.4,
              fontStyle: "italic",
              color: "var(--text-muted)",
              margin: 0,
              overflow: "hidden",
              textOverflow: "ellipsis",
              display: "-webkit-box",
              WebkitLineClamp: 3,
              WebkitBoxOrient: "vertical",
            }}
          >
            &ldquo;{highlight.selectedText}&rdquo;
          </p>
        </div>
      )}

      {/* ─── Note Section ────────────────────────────────────────── */}
      {hasNote && !isEditingNote ? (
        <div
          style={{
            backgroundColor: "var(--accent-dim)",
            border: "1px solid rgba(232,160,69,0.25)",
            borderRadius: 10,
            padding: "10px 12px",
            marginBottom: 10,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: 6,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
              <StickyNote className="w-3.5 h-3.5" style={{ color: "var(--accent)" }} />
              <span style={{ fontSize: 11, fontWeight: 700, color: "var(--accent)", textTransform: "uppercase", letterSpacing: "0.04em" }}>
                Note
              </span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
              <button
                type="button"
                id="note-edit-btn"
                title="Edit note"
                onClick={() => {
                  setDraftNote(highlight.note || "");
                  setIsEditingNote(true);
                }}
                className="px-2.5 py-1 rounded-md text-xs font-semibold flex items-center gap-1 transition-colors"
                style={{
                  color: "var(--text-secondary)",
                  backgroundColor: "var(--bg-hover)",
                }}
              >
                <Pencil className="w-3 h-3" />
                <span>Edit</span>
              </button>
              <button
                type="button"
                id="note-clear-btn"
                title="Clear note only (keep highlight)"
                onClick={handleClearNote}
                disabled={isSaving}
                className="px-2 py-1 rounded-md text-xs font-semibold transition-colors"
                style={{
                  color: "var(--red)",
                  backgroundColor: "transparent",
                }}
              >
                Clear
              </button>
            </div>
          </div>
          <p
            style={{
              fontSize: 13,
              lineHeight: 1.5,
              color: "var(--text-primary)",
              margin: 0,
              whiteSpace: "pre-wrap",
              wordBreak: "break-word",
              userSelect: "text",
              WebkitUserSelect: "text",
            }}
          >
            {highlight.note}
          </p>
        </div>
      ) : isEditingNote || isAddingNote ? (
        <div
          style={{
            backgroundColor: "var(--bg-hover)",
            border: "1px solid var(--border-default)",
            borderRadius: 10,
            padding: "10px",
            marginBottom: 10,
            display: "flex",
            flexDirection: "column",
            gap: 8,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
            <StickyNote className="w-3.5 h-3.5" style={{ color: "var(--accent)" }} />
            <span style={{ fontSize: 12, fontWeight: 600, color: "var(--text-primary)" }}>
              {isEditingNote ? "Edit Note" : "Add Note"}
            </span>
          </div>

          <textarea
            ref={textareaRef}
            id="note-edit-textarea"
            value={draftNote}
            onChange={(e) => setDraftNote(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type your note here..."
            rows={3}
            style={{
              width: "100%",
              fontSize: 14, // 14px prevents mobile auto-zoom
              lineHeight: 1.4,
              color: "var(--text-primary)",
              backgroundColor: "var(--bg-base)",
              border: "1px solid var(--border-default)",
              borderRadius: 8,
              padding: "8px 10px",
              outline: "none",
              resize: "none",
              boxSizing: "border-box",
              fontFamily: "inherit",
              userSelect: "text",
              WebkitUserSelect: "text",
            }}
          />

          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <span style={{ fontSize: 10, color: "var(--text-muted)", display: "flex", alignItems: "center", gap: 2 }}>
              <span>Ctrl+Enter</span>
              <CornerDownLeft className="w-2.5 h-2.5" />
            </span>
            <div style={{ display: "flex", gap: 8 }}>
              <button
                type="button"
                onClick={() => {
                  setIsEditingNote(false);
                  setIsAddingNote(false);
                  setDraftNote(highlight.note || "");
                }}
                className="px-3 py-1.5 rounded-lg text-xs font-medium"
                style={{
                  color: "var(--text-secondary)",
                  backgroundColor: "transparent",
                }}
              >
                Cancel
              </button>
              <button
                type="button"
                id="note-save-edit-btn"
                disabled={isSaving}
                onClick={handleSaveNote}
                className="px-4 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-transform active:scale-95"
                style={{
                  color: "#0e0e0f",
                  backgroundColor: "var(--accent)",
                }}
              >
                <Check className="w-3.5 h-3.5" />
                <span>{isSaving ? "Saving..." : "Save"}</span>
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* Has no note yet: provide option to add note to this highlight */
        <div style={{ marginBottom: 10 }}>
          <button
            type="button"
            id="highlight-context-add-note-btn"
            onClick={() => setIsAddingNote(true)}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-semibold transition-all active:scale-98"
            style={{
              color: "var(--accent)",
              backgroundColor: "var(--accent-dim)",
              border: "1px solid rgba(232,160,69,0.3)",
            }}
          >
            <StickyNote className="w-4 h-4" />
            <span>Add Note to Highlight</span>
          </button>
        </div>
      )}

      {/* ─── Color section ────────────────────────────────────────── */}
      <div style={{ padding: "4px 2px 2px" }}>
        <p
          style={{
            fontSize: 10,
            fontWeight: 700,
            color: "var(--text-muted)",
            textTransform: "uppercase",
            letterSpacing: "0.06em",
            marginBottom: 8,
          }}
        >
          {highlight.color ? "Change Color" : "Highlight Color"}
        </p>
        <div style={{ display: "flex", gap: 10, marginBottom: 8, overflowX: "auto", paddingBottom: 2 }}>
          {COLORS.map(({ color, label }) => {
            const style = getHighlightColorStyle(color);
            const bg = (style.backgroundColor as string) ?? "transparent";
            const isActive = highlight.color === color;
            return (
              <button
                key={color}
                id={`highlight-context-color-${color.toLowerCase()}`}
                title={label}
                aria-label={`Change to ${label}`}
                onClick={() => {
                  onChangeColor(highlight.id, color);
                  onClose();
                }}
                className="transition-transform active:scale-90"
                style={{
                  width: isMobile ? 32 : 22,
                  height: isMobile ? 32 : 22,
                  borderRadius: "50%",
                  border: isActive
                    ? "2.5px solid var(--accent)"
                    : "1.5px solid rgba(255,255,255,0.15)",
                  backgroundColor: bg.replace(/[\d.]+\)$/, "0.85)"),
                  cursor: "pointer",
                  transform: isActive ? "scale(1.15)" : "scale(1)",
                  flexShrink: 0,
                }}
              />
            );
          })}
        </div>
      </div>

      {/* Separator */}
      <div
        style={{ height: 1, backgroundColor: "var(--border-subtle)", margin: "8px 0" }}
      />

      {/* Delete entire highlight */}
      <button
        id="highlight-context-delete"
        role="menuitem"
        onClick={() => {
          onDelete(highlight.id);
          onClose();
        }}
        className="w-full flex items-center gap-2 py-2 px-2.5 rounded-lg text-xs font-semibold transition-colors hover:bg-red-500/10 active:scale-98"
        style={{
          color: "var(--red)",
          background: "none",
          border: "none",
          textAlign: "left",
          cursor: "pointer",
        }}
      >
        <Trash2 className="w-3.5 h-3.5" />
        <span>Delete Highlight &amp; Notes</span>
      </button>
    </div>
  );

  // ─── Mobile Bottom Sheet Modal ────────────────────────────────────────────
  if (isMobile) {
    return (
      <>
        {/* Backdrop — sits above NotesPanel (z-150) */}
        <div
          className="fixed inset-0 z-[190] animate-in fade-in duration-150"
          style={{ background: "rgba(0,0,0,0.65)" }}
          onClick={onClose}
        />
        {/* Sheet — smooth slide in from bottom, NO select-none so user can touch & type freely */}
        <div
          ref={menuRef}
          role="dialog"
          aria-label="Highlight & Note options"
          className="fixed inset-x-0 bottom-0 max-h-[85vh] overflow-y-auto rounded-t-2xl p-4 z-[200] animate-in slide-in-from-bottom duration-200"
          style={{
            background: "var(--bg-card)",
            border: "1px solid var(--border-default)",
            borderBottom: "none",
            boxShadow: "0 -16px 48px rgba(0,0,0,0.6)",
            paddingBottom: "max(1.25rem, env(safe-area-inset-bottom, 0px))",
          }}
        >
          {/* Top header */}
          <div
            className="flex items-center justify-between pb-2 mb-2"
            style={{ borderBottom: "1px solid var(--border-subtle)" }}
          >
            <span
              className="text-[11px] font-bold uppercase tracking-wider"
              style={{ color: "var(--text-muted)" }}
            >
              Highlight &amp; Note
            </span>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg transition-colors"
              style={{ color: "var(--text-muted)", background: "var(--bg-hover)" }}
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          {content}
        </div>
      </>
    );
  }

  // ─── Desktop Floating Popover ─────────────────────────────────────────────
  return (
    <div
      ref={menuRef}
      role="dialog"
      aria-label="Highlight & Note options"
      style={{
        position: "fixed",
        left: clampedX,
        top: isNearTop ? position.y + 12 : position.y - 8,
        transform: isNearTop ? "translate(-50%, 0)" : "translate(-50%, -100%)",
        zIndex: 9998,
        backgroundColor: "var(--bg-card)",
        border: "1px solid var(--border-default)",
        borderRadius: 12,
        padding: "10px",
        boxShadow: "0 16px 48px rgba(0,0,0,0.6), 0 4px 12px rgba(0,0,0,0.4)",
        minWidth: 260,
        maxWidth: 320,
      }}
      onMouseDown={(e) => {
        if ((e.target as HTMLElement).tagName !== "TEXTAREA") {
          e.stopPropagation();
        }
      }}
    >
      {/* Arrow */}
      <div
        style={{
          position: "absolute",
          ...(isNearTop
            ? {
                top: -5,
                left: "50%",
                transform: "translateX(-50%)",
                width: 0,
                height: 0,
                borderLeft: "5px solid transparent",
                borderRight: "5px solid transparent",
                borderBottom: "5px solid #1a1a1d",
                filter: "drop-shadow(0 -1px 1px rgba(0,0,0,0.3))",
              }
            : {
                bottom: -5,
                left: "50%",
                transform: "translateX(-50%)",
                width: 0,
                height: 0,
                borderLeft: "5px solid transparent",
                borderRight: "5px solid transparent",
                borderTop: "5px solid #1a1a1d",
                filter: "drop-shadow(0 1px 1px rgba(0,0,0,0.3))",
              }),
        }}
      />
      {content}
    </div>
  );
}
