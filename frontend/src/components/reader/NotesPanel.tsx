"use client";

import { useMemo, useState, useEffect } from "react";
import type { Highlight, HighlightColor } from "@/types/highlight";
import { StickyNote, Highlighter, X, ExternalLink, Trash2 } from "lucide-react";
import { getHighlightColorStyle } from "./HighlightOverlay";

interface NotesPanelProps {
  highlights: Highlight[];
  isOpen: boolean;
  activeTab?: "highlights" | "notes";
  onTabChange?: (tab: "highlights" | "notes") => void;
  currentPage?: number;
  onClose: () => void;
  onSelectHighlight: (highlight: Highlight) => void;
  onDeleteHighlight?: (highlightId: number) => void;
  onDeleteNote?: (highlightId: number) => void;
}

export function NotesPanel({
  highlights,
  isOpen,
  activeTab: controlledTab,
  onTabChange,
  currentPage,
  onClose,
  onSelectHighlight,
  onDeleteHighlight,
  onDeleteNote,
}: NotesPanelProps) {
  const [internalTab, setInternalTab] = useState<"highlights" | "notes">("highlights");
  const tab = controlledTab ?? internalTab;

  useEffect(() => {
    if (controlledTab) {
      setInternalTab(controlledTab);
    }
  }, [controlledTab]);

  const handleTabClick = (nextTab: "highlights" | "notes") => {
    setInternalTab(nextTab);
    if (onTabChange) onTabChange(nextTab);
  };

  const allHighlights = useMemo(() => {
    return [...highlights].sort((a, b) => {
      if (a.pageNumber !== b.pageNumber) return a.pageNumber - b.pageNumber;
      return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    });
  }, [highlights]);

  const notesOnly = useMemo(() => {
    return allHighlights.filter((h) => h.note && h.note.trim() !== "");
  }, [allHighlights]);

  if (!isOpen) return null;

  const handleCardClick = (highlight: Highlight) => {
    onSelectHighlight(highlight);
    if (typeof window !== "undefined" && window.innerWidth < 640) {
      onClose();
    }
  };

  // ─── Shared tab + content rendering ──────────────────────────────────────────
  const panelContent = (
    <>
      {/* Panel Header */}
      <div
        className="px-4 pt-3.5 pb-2 border-b shrink-0"
        style={{
          borderColor: "var(--border-default)",
          background: "var(--bg-raised)",
        }}
      >
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
            Annotations
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close panel"
            className="p-1.5 rounded-lg transition-colors"
            style={{ color: "var(--text-muted)", background: "var(--bg-hover)" }}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div
          className="flex items-center p-0.5 rounded-lg text-xs font-medium"
          style={{ background: "var(--bg-hover)" }}
        >
          {(["highlights", "notes"] as const).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => handleTabClick(t)}
              className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-md transition-all"
              style={{
                background: tab === t ? "var(--bg-card)" : "transparent",
                color: tab === t ? "var(--text-primary)" : "var(--text-muted)",
                fontWeight: tab === t ? 600 : 400,
              }}
            >
              {t === "highlights" ? (
                <Highlighter className="w-3.5 h-3.5" style={{ color: "var(--accent)" }} />
              ) : (
                <StickyNote className="w-3.5 h-3.5" style={{ color: "var(--accent)" }} />
              )}
              <span className="capitalize">{t}</span>
              <span
                className="text-[10px] px-1.5 rounded-full font-bold"
                style={{
                  background: tab === t ? "var(--accent-dim)" : "var(--bg-raised)",
                  color: tab === t ? "var(--accent)" : "var(--text-muted)",
                }}
              >
                {t === "highlights" ? allHighlights.length : notesOnly.length}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Panel Body */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2.5">
        {tab === "highlights" ? (
          allHighlights.length === 0 ? (
            <EmptyState icon={<Highlighter className="w-6 h-6" style={{ color: "var(--text-muted)" }} />} title="No highlights yet" desc="Select any text in the PDF to highlight important passages." />
          ) : (
            allHighlights.map((highlight) => (
              <HighlightCard
                key={highlight.id}
                highlight={highlight}
                isCurrentPage={currentPage === highlight.pageNumber}
                onCardClick={handleCardClick}
                onDelete={onDeleteHighlight}
              />
            ))
          )
        ) : notesOnly.length === 0 ? (
          <EmptyState icon={<StickyNote className="w-6 h-6" style={{ color: "var(--text-muted)" }} />} title="No notes yet" desc="Highlight text first, then tap it to attach your thoughts." />
        ) : (
          notesOnly.map((note) => (
            <NoteCard
              key={note.id}
              note={note}
              isCurrentPage={currentPage === note.pageNumber}
              onCardClick={handleCardClick}
              onDeleteNote={onDeleteNote}
            />
          ))
        )}
      </div>
    </>
  );

  return (
    <>
      {/* ── Mobile: bottom-sheet modal (does NOT cover the reader controls bar) ── */}
      <div className="sm:hidden">
        {/* Backdrop */}
        <div
          className="fixed inset-0 z-[150] animate-in fade-in duration-150"
          style={{ background: "rgba(0,0,0,0.6)" }}
          onClick={onClose}
          aria-hidden="true"
        />
        {/* Bottom sheet — stops at 75vh so controls bar is still visible */}
        <aside
          className="fixed inset-x-0 bottom-0 z-[160] flex flex-col rounded-t-2xl overflow-hidden animate-in slide-in-from-bottom duration-250 select-none"
          style={{
            maxHeight: "75vh",
            background: "var(--bg-surface)",
            border: "1px solid var(--border-default)",
            borderBottom: "none",
            boxShadow: "0 -16px 48px rgba(0,0,0,0.5)",
          }}
          aria-label="Highlights & Notes Panel"
          id="reader-annotations-panel"
        >
          {panelContent}
        </aside>
      </div>

      {/* ── Desktop: right side panel (inline, no overlay) ── */}
      <aside
        className="hidden sm:flex sm:flex-col sm:relative sm:w-80 lg:w-88 shrink-0 select-none"
        style={{
          borderLeft: "1px solid var(--border-subtle)",
          background: "var(--bg-surface)",
          height: "100%",
        }}
        aria-label="Highlights & Notes Panel"
        id="reader-annotations-panel-desktop"
      >
        {panelContent}
      </aside>
    </>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function EmptyState({ icon, title, desc }: { icon: React.ReactNode; title: string; desc: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-14 px-4 text-center">
      <div
        className="w-12 h-12 rounded-2xl flex items-center justify-center mb-3"
        style={{ background: "var(--bg-raised)", border: "1px solid var(--border-subtle)" }}
      >
        {icon}
      </div>
      <p className="text-sm font-medium mb-1" style={{ color: "var(--text-secondary)" }}>
        {title}
      </p>
      <p className="text-xs leading-relaxed max-w-xs" style={{ color: "var(--text-muted)" }}>
        {desc}
      </p>
    </div>
  );
}

function HighlightCard({
  highlight,
  isCurrentPage,
  onCardClick,
  onDelete,
}: {
  highlight: Highlight;
  isCurrentPage: boolean;
  onCardClick: (h: Highlight) => void;
  onDelete?: (id: number) => void;
}) {
  const colorStyle = highlight.color ? getHighlightColorStyle(highlight.color) : null;
  const hasNote = Boolean(highlight.note && highlight.note.trim() !== "");

  return (
    <div
      id={`highlight-card-${highlight.id}`}
      onClick={() => onCardClick(highlight)}
      className="group relative p-3 rounded-xl border transition-all cursor-pointer"
      style={{
        background: isCurrentPage ? "rgba(232,160,69,0.08)" : "var(--bg-card)",
        borderColor: isCurrentPage ? "rgba(232,160,69,0.3)" : "var(--border-subtle)",
        boxShadow: isCurrentPage ? "0 0 0 1px rgba(232,160,69,0.2)" : "none",
      }}
    >
      <div className="flex items-center justify-between mb-1.5">
        <div className="flex items-center gap-1.5">
          <span
            className="text-[10px] font-semibold tracking-wide uppercase px-1.5 py-0.5 rounded"
            style={{
              background: isCurrentPage ? "var(--accent-dim)" : "var(--bg-hover)",
              color: isCurrentPage ? "var(--accent)" : "var(--text-muted)",
            }}
          >
            Page {highlight.pageNumber}
          </span>
          {highlight.color && (
            <span
              className="w-2.5 h-2.5 rounded-full inline-block shrink-0"
              style={{
                backgroundColor: (colorStyle?.backgroundColor as string) ?? "transparent",
                border: "2px solid rgba(255,255,255,0.15)",
              }}
            />
          )}
        </div>
        <div className="flex items-center gap-1">
          {onDelete && (
            <button
              type="button"
              title="Delete highlight"
              onClick={(e) => { e.stopPropagation(); onDelete(highlight.id); }}
              className="p-1 rounded transition-colors"
              style={{ color: "var(--text-muted)" }}
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
          <span className="text-[10px] flex items-center gap-0.5" style={{ color: "var(--text-muted)" }}>
            Jump <ExternalLink className="w-2.5 h-2.5" />
          </span>
        </div>
      </div>

      <p className="text-xs leading-relaxed line-clamp-3" style={{ color: "var(--text-secondary)" }}>
        {highlight.selectedText}
      </p>

      {hasNote && (
        <div
          className="mt-2 pt-2 flex items-start gap-1.5 text-xs rounded px-2 py-1.5"
          style={{
            borderTop: "1px solid var(--border-subtle)",
            background: "var(--accent-dim)",
          }}
        >
          <StickyNote className="w-3 h-3 mt-0.5 shrink-0" style={{ color: "var(--accent)" }} />
          <p className="line-clamp-2 text-[11px] leading-snug" style={{ color: "var(--text-secondary)" }}>
            {highlight.note}
          </p>
        </div>
      )}
    </div>
  );
}

function NoteCard({
  note,
  isCurrentPage,
  onCardClick,
  onDeleteNote,
}: {
  note: Highlight;
  isCurrentPage: boolean;
  onCardClick: (h: Highlight) => void;
  onDeleteNote?: (id: number) => void;
}) {
  const colorStyle = note.color ? getHighlightColorStyle(note.color) : null;

  return (
    <div
      id={`note-card-${note.id}`}
      onClick={() => onCardClick(note)}
      className="group relative p-3 rounded-xl border transition-all cursor-pointer"
      style={{
        background: isCurrentPage ? "rgba(232,160,69,0.08)" : "var(--bg-card)",
        borderColor: isCurrentPage ? "rgba(232,160,69,0.3)" : "var(--border-subtle)",
        boxShadow: isCurrentPage ? "0 0 0 1px rgba(232,160,69,0.2)" : "none",
      }}
    >
      <div className="flex items-center justify-between mb-1.5">
        <div className="flex items-center gap-1.5">
          <span
            className="text-[10px] font-semibold tracking-wide uppercase px-1.5 py-0.5 rounded"
            style={{
              background: isCurrentPage ? "var(--accent-dim)" : "var(--bg-hover)",
              color: isCurrentPage ? "var(--accent)" : "var(--text-muted)",
            }}
          >
            Page {note.pageNumber}
          </span>
          {note.color && (
            <span
              className="w-2.5 h-2.5 rounded-full inline-block shrink-0"
              style={{
                backgroundColor: (colorStyle?.backgroundColor as string) ?? "transparent",
                border: "2px solid rgba(255,255,255,0.15)",
              }}
            />
          )}
        </div>
        <div className="flex items-center gap-1">
          {onDeleteNote && (
            <button
              type="button"
              title="Remove note"
              onClick={(e) => { e.stopPropagation(); onDeleteNote(note.id); }}
              className="p-1 rounded transition-colors"
              style={{ color: "var(--text-muted)" }}
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
          <span className="text-[10px] flex items-center gap-0.5" style={{ color: "var(--text-muted)" }}>
            Jump <ExternalLink className="w-2.5 h-2.5" />
          </span>
        </div>
      </div>

      {note.selectedText && (
        <div className="border-l-2 pl-2 my-1.5" style={{ borderColor: "var(--accent)" }}>
          <p className="text-[11px] italic line-clamp-2 leading-snug" style={{ color: "var(--text-muted)", fontFamily: "var(--font-serif)" }}>
            &ldquo;{note.selectedText}&rdquo;
          </p>
        </div>
      )}

      <p className="text-xs leading-relaxed whitespace-pre-wrap break-words" style={{ color: "var(--text-secondary)" }}>
        {note.note}
      </p>
    </div>
  );
}
