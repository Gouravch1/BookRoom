"use client";

import { useEffect, useRef, useState } from "react";
import type { HighlightColor } from "@/types/highlight";
import { getHighlightColorStyle } from "./HighlightOverlay";
import { StickyNote, Check, X, CornerDownLeft } from "lucide-react";

const COLORS: { color: HighlightColor; label: string }[] = [
  { color: "YELLOW", label: "Yellow" },
  { color: "GREEN",  label: "Green" },
  { color: "RED",    label: "Red" },
  { color: "BLUE",   label: "Blue" },
  { color: "PINK",   label: "Pink" },
  { color: "ORANGE", label: "Orange" },
  { color: "BLACK",  label: "Black" },
];

interface HighlightToolbarProps {
  /** Viewport-relative position for the toolbar */
  position: { x: number; y: number };
  onColorSelect: (color: HighlightColor, note?: string | null) => void;
  onDismiss: () => void;
}

/**
 * Floating toolbar that appears near a text selection on desktop,
 * and docks cleanly on mobile devices.
 * Supports 1-tap instant color highlighting OR adding a note + highlight together.
 */
export function HighlightToolbar({
  position,
  onColorSelect,
  onDismiss,
}: HighlightToolbarProps) {
  const ref = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const [isComposingNote, setIsComposingNote] = useState(false);
  const [selectedColor, setSelectedColor] = useState<HighlightColor>("YELLOW");
  const [draftNote, setDraftNote] = useState("");

  const [isMobile, setIsMobile] = useState(() =>
    typeof window !== "undefined" ? window.innerWidth < 768 : false
  );

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Position clamping for desktop floating toolbar
  const isNearTop = position.y < 140;
  const clampedX = Math.max(
    180,
    Math.min(
      position.x,
      typeof window !== "undefined" ? window.innerWidth - 180 : position.x
    )
  );

  // Auto-focus textarea when note composer opens
  useEffect(() => {
    if (isComposingNote && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [isComposingNote]);

  // Dismiss on outside click / tap (when not actively composing a note)
  const mountTimeRef = useRef(Date.now());
  useEffect(() => {
    mountTimeRef.current = Date.now();
    const handlePointerDown = (e: PointerEvent) => {
      if (Date.now() - mountTimeRef.current < 400) return;
      if (ref.current && !ref.current.contains(e.target as Node)) {
        onDismiss();
      }
    };
    document.addEventListener("pointerdown", handlePointerDown, false);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown, false);
    };
  }, [onDismiss]);

  // Dismiss on Escape
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onDismiss();
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [onDismiss]);

  const handleSaveWithNote = () => {
    onColorSelect(selectedColor, draftNote.trim() || null);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
      e.preventDefault();
      handleSaveWithNote();
    }
  };

  // ─── Mobile Note Composer Modal (Bottom Sheet) ───────────────────────────
  if (isMobile && isComposingNote) {
    return (
      <>
        {/* Backdrop */}
        <div
          className="fixed inset-0 z-[190] animate-in fade-in duration-150"
          style={{ background: "rgba(0,0,0,0.65)" }}
          onClick={() => setIsComposingNote(false)}
        />
        {/* Composer Sheet */}
        <div
          ref={ref}
          role="dialog"
          aria-label="Add note to highlight"
          className="fixed inset-x-0 bottom-0 max-h-[85vh] rounded-t-2xl p-4 z-[200] animate-in slide-in-from-bottom duration-200"
          style={{
            background: "var(--bg-card)",
            border: "1px solid var(--border-default)",
            borderBottom: "none",
            boxShadow: "0 -16px 48px rgba(0,0,0,0.6)",
            paddingBottom: "max(1rem, env(safe-area-inset-bottom, 0px))",
          }}
        >
          {/* Header */}
          <div
            className="flex items-center justify-between pb-2 mb-3"
            style={{ borderBottom: "1px solid var(--border-subtle)" }}
          >
            <div className="flex items-center gap-2">
              <StickyNote className="w-4 h-4" style={{ color: "var(--accent)" }} />
              <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--text-primary)" }}>
                Add Note to Passage
              </span>
            </div>
            <button
              type="button"
              onClick={() => setIsComposingNote(false)}
              className="p-1.5 rounded-lg transition-colors"
              style={{ color: "var(--text-muted)", background: "var(--bg-hover)" }}
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Color selector */}
          <div className="mb-3">
            <p className="text-[11px] font-medium mb-1.5" style={{ color: "var(--text-muted)" }}>
              Highlight Color
            </p>
            <div className="flex items-center gap-2 overflow-x-auto py-1">
              {COLORS.map(({ color, label }) => {
                const style = getHighlightColorStyle(color);
                const bg = (style.backgroundColor as string) ?? "transparent";
                const isCurrent = selectedColor === color;
                return (
                  <button
                    key={color}
                    type="button"
                    title={label}
                    onClick={() => setSelectedColor(color)}
                    className="w-7 h-7 rounded-full transition-transform shrink-0 flex items-center justify-center"
                    style={{
                      backgroundColor: bg.replace(/[\d.]+\)$/, "0.9)"),
                      border: isCurrent ? "2.5px solid var(--accent)" : "2px solid rgba(255,255,255,0.15)",
                      transform: isCurrent ? "scale(1.15)" : "scale(1)",
                    }}
                  >
                    {isCurrent && <Check className="w-3 h-3 text-stone-900 stroke-[3]" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Note Input */}
          <div className="mb-3">
            <textarea
              ref={textareaRef}
              id="mobile-highlight-note-input"
              value={draftNote}
              onChange={(e) => setDraftNote(e.target.value)}
              placeholder="Write your note or thoughts here..."
              rows={3}
              className="w-full text-sm rounded-xl p-3 outline-none resize-none"
              style={{
                background: "var(--bg-base)",
                border: "1px solid var(--border-default)",
                color: "var(--text-primary)",
              }}
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsComposingNote(false)}
              className="px-3 py-2 rounded-xl text-xs font-medium transition-colors"
              style={{ color: "var(--text-secondary)", background: "var(--bg-hover)" }}
            >
              Cancel
            </button>
            <button
              type="button"
              id="mobile-save-highlight-note-btn"
              onClick={handleSaveWithNote}
              className="px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-transform active:scale-95"
              style={{
                background: "var(--accent)",
                color: "#0e0e0f",
              }}
            >
              <Check className="w-3.5 h-3.5" />
              <span>Save Note</span>
            </button>
          </div>
        </div>
      </>
    );
  }

  // ─── Mobile Top Bar (Directly below Header at top-12) ────────────────────
  if (isMobile) {
    return (
      <div
        ref={ref}
        role="toolbar"
        aria-label="Highlight toolbar"
        className="fixed top-12 left-0 right-0 w-full px-3 py-2 z-[99999] select-none animate-in slide-in-from-top duration-150"
        style={{
          background: "var(--bg-card)",
          borderBottom: "1px solid var(--border-default)",
          boxShadow: "0 8px 32px rgba(0,0,0,0.5)",
        }}
      >
        <div className="flex items-center justify-between gap-2 max-w-lg mx-auto">
          {/* Colors */}
          <div className="flex items-center gap-2 overflow-x-auto py-0.5 scrollbar-none">
            {COLORS.map(({ color, label }) => {
              const style = getHighlightColorStyle(color);
              const bg = (style.backgroundColor as string) ?? "transparent";
              return (
                <button
                  key={color}
                  id={`highlight-color-${color.toLowerCase()}`}
                  title={label}
                  aria-label={`Highlight ${label}`}
                  onClick={() => onColorSelect(color, null)}
                  className="w-7 h-7 rounded-full border-2 border-stone-200/80 active:scale-90 transition-transform shrink-0 shadow-xs"
                  style={{
                    backgroundColor: bg.replace(/[\d.]+\)$/, "0.9)"),
                  }}
                />
              );
            })}
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {/* Note button -> Opens clean note composer */}
            <button
              id="highlight-toolbar-add-note"
              type="button"
              onClick={() => setIsComposingNote(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold active:scale-95 shrink-0 transition-all"
              style={{
                background: "var(--accent-dim)",
                border: "1px solid rgba(232,160,69,0.3)",
                color: "var(--accent)",
              }}
            >
              <StickyNote className="w-3.5 h-3.5" />
              <span>Note</span>
            </button>

            {/* Close button */}
            <button
              type="button"
              onClick={onDismiss}
              aria-label="Close highlight toolbar"
              className="p-1 rounded-full shrink-0 transition-colors"
              style={{ color: "var(--text-muted)" }}
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ─── Desktop Floating Arrow Toolbar ───────────────────────────────────────
  return (
    <div
      ref={ref}
      role="toolbar"
      aria-label="Highlight toolbar"
      style={{
        position: "fixed",
        left: clampedX,
        top: isNearTop ? position.y + 12 : position.y - 8,
        transform: isNearTop ? "translate(-50%, 0)" : "translate(-50%, -100%)",
        zIndex: 9999,
      }}
      onMouseDown={(e) => {
        if ((e.target as HTMLElement).tagName !== "TEXTAREA") {
          e.preventDefault();
        }
      }}
    >
      {/* Arrow pointing to selection */}
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
                borderTop: "5px solid #1a1a1d",
                filter: "drop-shadow(0 1px 1px rgba(0,0,0,0.15))",
              }),
        }}
      />

      <div
        style={{
          backgroundColor: "#1a1a1d",
          border: "1px solid rgba(255,255,255,0.12)",
          borderRadius: 12,
          padding: isComposingNote ? "10px" : "6px 8px",
          boxShadow: "0 12px 36px rgba(0,0,0,0.6), 0 2px 8px rgba(0,0,0,0.4)",
          minWidth: isComposingNote ? 280 : "auto",
        }}
      >
        {isComposingNote ? (
          /* Desktop Note Composer */
          <div className="flex flex-col gap-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <StickyNote className="w-3.5 h-3.5 text-amber-500" />
                <span className="text-xs font-semibold" style={{ color: "var(--text-primary)" }}>
                  Add Note
                </span>
              </div>
              <button
                type="button"
                onClick={() => setIsComposingNote(false)}
                className="text-stone-400 hover:text-stone-200"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Colors */}
            <div className="flex items-center gap-1.5">
              {COLORS.map(({ color, label }) => {
                const style = getHighlightColorStyle(color);
                const bg = (style.backgroundColor as string) ?? "transparent";
                const isCurrent = selectedColor === color;
                return (
                  <button
                    key={color}
                    type="button"
                    title={label}
                    onClick={() => setSelectedColor(color)}
                    style={{
                      width: 18,
                      height: 18,
                      borderRadius: "50%",
                      backgroundColor: bg.replace(/[\d.]+\)$/, "0.9)"),
                      border: isCurrent ? "2px solid var(--accent)" : "1.5px solid rgba(255,255,255,0.2)",
                      cursor: "pointer",
                      transform: isCurrent ? "scale(1.2)" : "scale(1)",
                      transition: "transform 0.1s",
                    }}
                  />
                );
              })}
            </div>

            <textarea
              ref={textareaRef}
              value={draftNote}
              onChange={(e) => setDraftNote(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Write a note..."
              rows={2}
              style={{
                width: "100%",
                fontSize: 12,
                color: "var(--text-primary)",
                backgroundColor: "#111113",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: 6,
                padding: "6px 8px",
                outline: "none",
                resize: "none",
                boxSizing: "border-box",
                fontFamily: "inherit",
              }}
            />

            <div className="flex items-center justify-between">
              <span className="text-[10px] text-stone-500 flex items-center gap-1">
                <span>Ctrl+Enter</span>
                <CornerDownLeft className="w-2.5 h-2.5" />
              </span>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setIsComposingNote(false)}
                  className="px-2 py-1 text-xs text-stone-400 hover:text-stone-200"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  id="desktop-save-highlight-note-btn"
                  onClick={handleSaveWithNote}
                  className="px-3 py-1 text-xs font-semibold rounded-md flex items-center gap-1"
                  style={{
                    background: "var(--accent)",
                    color: "#0e0e0f",
                  }}
                >
                  <Check className="w-3 h-3" />
                  <span>Save</span>
                </button>
              </div>
            </div>
          </div>
        ) : (
          /* Desktop Simple Color Toolbar */
          <div className="flex items-center gap-1.5 select-none">
            <span
              style={{
                fontSize: 10,
                fontWeight: 600,
                color: "#78716c",
                textTransform: "uppercase",
                letterSpacing: "0.05em",
                marginRight: 2,
              }}
            >
              Highlight
            </span>

            {COLORS.map(({ color, label }) => {
              const style = getHighlightColorStyle(color);
              const bg = (style.backgroundColor as string) ?? "transparent";
              return (
                <button
                  key={color}
                  id={`highlight-color-${color.toLowerCase()}`}
                  title={label}
                  aria-label={`Highlight ${label}`}
                  onClick={() => onColorSelect(color, null)}
                  style={{
                    width: 22,
                    height: 22,
                    borderRadius: "50%",
                    border: "2px solid rgba(0,0,0,0.08)",
                    backgroundColor: bg.replace(/[\d.]+\)$/, "0.85)"),
                    cursor: "pointer",
                    transition: "transform 0.1s ease, box-shadow 0.1s ease",
                    flexShrink: 0,
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLElement).style.transform = "scale(1.2)";
                    (e.currentTarget as HTMLElement).style.boxShadow =
                      "0 0 0 2px rgba(0,0,0,0.12)";
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLElement).style.transform = "scale(1)";
                    (e.currentTarget as HTMLElement).style.boxShadow = "none";
                  }}
                />
              );
            })}

            <div
              style={{
                width: 1,
                height: 18,
                backgroundColor: "rgba(255,255,255,0.12)",
                margin: "0 3px",
              }}
            />

            {/* Note button -> smoothly opens note composer */}
            <button
              id="highlight-toolbar-add-note"
              type="button"
              onClick={() => setIsComposingNote(true)}
              title="Add note to this highlight"
              style={{
                display: "flex",
                alignItems: "center",
                gap: 5,
                padding: "4px 8px",
                borderRadius: 6,
                backgroundColor: "rgba(232,160,69,0.15)",
                border: "1px solid rgba(232,160,69,0.3)",
                color: "var(--accent)",
                fontSize: 12,
                fontWeight: 600,
                cursor: "pointer",
                transition: "all 0.15s ease",
                flexShrink: 0,
              }}
            >
              <StickyNote className="w-3.5 h-3.5" />
              <span>Note</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
