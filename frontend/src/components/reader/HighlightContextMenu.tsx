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
 * Floating context menu that appears when clicking an existing highlight or note marker.
 * Provides note viewing/editing, note clearing, color changing, and highlight removal.
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

  // Dismiss on outside click
  useEffect(() => {
    const handlePointerDown = (e: PointerEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    document.addEventListener("pointerdown", handlePointerDown, true);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown, true);
    };
  }, [onClose]);

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
        backgroundColor: "white",
        border: "1px solid #e7e5e4",
        borderRadius: 12,
        padding: "8px",
        boxShadow: "0 10px 25px -5px rgba(0,0,0,0.18), 0 8px 10px -6px rgba(0,0,0,0.1)",
        minWidth: 260,
        maxWidth: 320,
      }}
      // Prevent mousedown from clearing selection or losing focus
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
                borderBottom: "5px solid white",
                filter: "drop-shadow(0 -1px 1px rgba(0,0,0,0.1))",
              }
            : {
                bottom: -5,
                left: "50%",
                transform: "translateX(-50%)",
                width: 0,
                height: 0,
                borderLeft: "5px solid transparent",
                borderRight: "5px solid transparent",
                borderTop: "5px solid white",
                filter: "drop-shadow(0 1px 1px rgba(0,0,0,0.12))",
              }),
        }}
      />

      {/* Selected text snippet preview */}
      {highlight.selectedText && (
        <div
          style={{
            padding: "4px 8px 6px",
            borderBottom: "1px solid #f5f5f4",
            marginBottom: 6,
          }}
        >
          <p
            style={{
              fontSize: 11,
              fontStyle: "italic",
              color: "#78716c",
              margin: 0,
              overflow: "hidden",
              textOverflow: "ellipsis",
              display: "-webkit-box",
              WebkitLineClamp: 2,
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
            backgroundColor: "#fefce8",
            border: "1px solid #fef08a",
            borderRadius: 8,
            padding: "8px 10px",
            marginBottom: 8,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: 4,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
              <StickyNote className="w-3.5 h-3.5 text-amber-600" />
              <span style={{ fontSize: 11, fontWeight: 600, color: "#854d0e" }}>
                Note
              </span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 2 }}>
              <button
                type="button"
                id="note-edit-btn"
                title="Edit note"
                onClick={() => {
                  setDraftNote(highlight.note || "");
                  setIsEditingNote(true);
                }}
                style={{
                  padding: "3px 6px",
                  fontSize: 11,
                  fontWeight: 500,
                  color: "#78716c",
                  backgroundColor: "transparent",
                  border: "none",
                  borderRadius: 4,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: 3,
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLElement).style.backgroundColor = "rgba(0,0,0,0.05)";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.backgroundColor = "transparent";
                }}
              >
                <Pencil className="w-3 h-3" />
                Edit
              </button>
              <button
                type="button"
                id="note-clear-btn"
                title="Clear note only (keep highlight)"
                onClick={handleClearNote}
                disabled={isSaving}
                style={{
                  padding: "3px 6px",
                  fontSize: 11,
                  fontWeight: 500,
                  color: "#ef4444",
                  backgroundColor: "transparent",
                  border: "none",
                  borderRadius: 4,
                  cursor: "pointer",
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLElement).style.backgroundColor = "#fee2e2";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.backgroundColor = "transparent";
                }}
              >
                Clear Note
              </button>
            </div>
          </div>
          <p
            style={{
              fontSize: 12,
              lineHeight: 1.4,
              color: "#1c1917",
              margin: 0,
              whiteSpace: "pre-wrap",
              wordBreak: "break-word",
            }}
          >
            {highlight.note}
          </p>
        </div>
      ) : isEditingNote || isAddingNote ? (
        <div
          style={{
            backgroundColor: "#fafaf9",
            border: "1px solid #e7e5e4",
            borderRadius: 8,
            padding: "8px",
            marginBottom: 8,
            display: "flex",
            flexDirection: "column",
            gap: 6,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
            <StickyNote className="w-3.5 h-3.5 text-amber-600" />
            <span style={{ fontSize: 11, fontWeight: 600, color: "#44403c" }}>
              {isEditingNote ? "Edit Note" : "Add Note"}
            </span>
          </div>

          <textarea
            ref={textareaRef}
            id="note-edit-textarea"
            value={draftNote}
            onChange={(e) => setDraftNote(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Write your note here..."
            rows={3}
            style={{
              width: "100%",
              fontSize: 12,
              lineHeight: 1.4,
              color: "#1c1917",
              backgroundColor: "white",
              border: "1px solid #d6d3d1",
              borderRadius: 6,
              padding: "6px 8px",
              outline: "none",
              resize: "none",
              boxSizing: "border-box",
              fontFamily: "inherit",
            }}
          />

          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <span style={{ fontSize: 9, color: "#a8a29e", display: "flex", alignItems: "center", gap: 2 }}>
              <span>Ctrl+Enter</span>
              <CornerDownLeft className="w-2.5 h-2.5" />
            </span>
            <div style={{ display: "flex", gap: 4 }}>
              <button
                type="button"
                onClick={() => {
                  setIsEditingNote(false);
                  setIsAddingNote(false);
                  setDraftNote(highlight.note || "");
                }}
                style={{
                  padding: "4px 8px",
                  fontSize: 11,
                  fontWeight: 500,
                  color: "#57534e",
                  backgroundColor: "transparent",
                  border: "none",
                  borderRadius: 4,
                  cursor: "pointer",
                }}
              >
                Cancel
              </button>
              <button
                type="button"
                id="note-save-edit-btn"
                disabled={isSaving}
                onClick={handleSaveNote}
                style={{
                  padding: "4px 10px",
                  fontSize: 11,
                  fontWeight: 600,
                  color: "white",
                  backgroundColor: "#1c1917",
                  border: "none",
                  borderRadius: 4,
                  cursor: "pointer",
                }}
              >
                {isSaving ? "Saving..." : "Save"}
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* Has no note yet: provide option to add note to this highlight */
        <div style={{ marginBottom: 6 }}>
          <button
            type="button"
            id="highlight-context-add-note-btn"
            onClick={() => setIsAddingNote(true)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              width: "100%",
              padding: "6px 8px",
              fontSize: 12,
              fontWeight: 500,
              color: "#44403c",
              backgroundColor: "#fafaf9",
              border: "1px solid #e7e5e4",
              borderRadius: 6,
              cursor: "pointer",
              transition: "background-color 0.1s",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.backgroundColor = "#f5f5f4";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.backgroundColor = "#fafaf9";
            }}
          >
            <StickyNote className="w-3.5 h-3.5 text-amber-600" />
            <span>Add Note to Highlight</span>
          </button>
        </div>
      )}

      {/* ─── Color section ────────────────────────────────────────── */}
      <div style={{ padding: "4px 8px 2px" }}>
        <p
          style={{
            fontSize: 9,
            fontWeight: 600,
            color: "#a8a29e",
            textTransform: "uppercase",
            letterSpacing: "0.05em",
            marginBottom: 6,
          }}
        >
          {highlight.color ? "Change color" : "Add highlight color"}
        </p>
        <div style={{ display: "flex", gap: 6, marginBottom: 4 }}>
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
                style={{
                  width: 20,
                  height: 20,
                  borderRadius: "50%",
                  border: isActive
                    ? "2.5px solid #44403c"
                    : "2px solid rgba(0,0,0,0.1)",
                  backgroundColor: bg.replace(/[\d.]+\)$/, "0.85)"),
                  cursor: "pointer",
                  transition: "transform 0.1s",
                  flexShrink: 0,
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLElement).style.transform = "scale(1.15)";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.transform = "scale(1)";
                }}
              />
            );
          })}
        </div>
      </div>

      {/* Separator */}
      <div
        style={{ height: 1, backgroundColor: "#f5f5f4", margin: "4px 0" }}
      />

      {/* Delete entire highlight */}
      <button
        id="highlight-context-delete"
        role="menuitem"
        onClick={() => {
          onDelete(highlight.id);
          onClose();
        }}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          width: "100%",
          padding: "6px 8px",
          fontSize: 12,
          color: "#ef4444",
          background: "none",
          border: "none",
          borderRadius: 6,
          cursor: "pointer",
          textAlign: "left",
          transition: "background 0.1s",
        }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLElement).style.backgroundColor = "#fff1f2";
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLElement).style.backgroundColor = "transparent";
        }}
      >
        <Trash2 className="w-3.5 h-3.5" />
        <span>Remove Highlight &amp; Annotation</span>
      </button>
    </div>
  );
}

