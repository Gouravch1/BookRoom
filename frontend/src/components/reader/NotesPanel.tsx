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

  // Filtered lists
  const allHighlights = useMemo(() => {
    return [...highlights].sort((a, b) => {
      if (a.pageNumber !== b.pageNumber) {
        return a.pageNumber - b.pageNumber;
      }
      return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    });
  }, [highlights]);

  const notesOnly = useMemo(() => {
    return allHighlights.filter((h) => h.note && h.note.trim() !== "");
  }, [allHighlights]);

  if (!isOpen) return null;

  return (
    <aside
      className="w-80 md:w-88 border-l border-stone-200 bg-white flex flex-col h-full shrink-0 shadow-lg md:shadow-none z-30 transition-all select-none"
      aria-label="Highlights & Notes Panel"
      id="reader-annotations-panel"
    >
      {/* Panel Header */}
      <div className="px-4 pt-3.5 pb-2 border-b border-stone-200 bg-stone-50/70">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-stone-800">
            Annotations
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close panel"
            className="p-1 rounded-md text-stone-400 hover:text-stone-700 hover:bg-stone-200/60 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center p-0.5 rounded-lg bg-stone-200/60 text-xs font-medium">
          <button
            type="button"
            onClick={() => handleTabClick("highlights")}
            className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-md transition-all ${
              tab === "highlights"
                ? "bg-white text-stone-900 shadow-xs font-semibold"
                : "text-stone-600 hover:text-stone-900"
            }`}
          >
            <Highlighter className="w-3.5 h-3.5 text-amber-600" />
            <span>Highlights</span>
            <span
              className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                tab === "highlights"
                  ? "bg-amber-100 text-amber-800 font-bold"
                  : "bg-stone-300/70 text-stone-600"
              }`}
            >
              {allHighlights.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => handleTabClick("notes")}
            className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-md transition-all ${
              tab === "notes"
                ? "bg-white text-stone-900 shadow-xs font-semibold"
                : "text-stone-600 hover:text-stone-900"
            }`}
          >
            <StickyNote className="w-3.5 h-3.5 text-amber-600" />
            <span>Notes</span>
            <span
              className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                tab === "notes"
                  ? "bg-amber-100 text-amber-800 font-bold"
                  : "bg-stone-300/70 text-stone-600"
              }`}
            >
              {notesOnly.length}
            </span>
          </button>
        </div>
      </div>

      {/* Panel Body: Highlights or Notes */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2.5">
        {tab === "highlights" ? (
          allHighlights.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 px-4 text-center text-stone-400">
              <div className="w-12 h-12 rounded-2xl bg-stone-100 flex items-center justify-center mb-3">
                <Highlighter className="w-6 h-6 text-stone-300" />
              </div>
              <p className="text-sm font-medium text-stone-600 mb-1">
                No highlights yet
              </p>
              <p className="text-xs text-stone-400 leading-relaxed max-w-xs">
                Select any text in the PDF to highlight important passages with your favorite color.
              </p>
            </div>
          ) : (
            allHighlights.map((highlight) => {
              const isCurrentPage = currentPage === highlight.pageNumber;
              const colorStyle = highlight.color
                ? getHighlightColorStyle(highlight.color)
                : null;
              const hasNote = Boolean(highlight.note && highlight.note.trim() !== "");

              return (
                <div
                  key={highlight.id}
                  id={`highlight-card-${highlight.id}`}
                  onClick={() => onSelectHighlight(highlight)}
                  className={`group relative p-3 rounded-lg border transition-all cursor-pointer text-left ${
                    isCurrentPage
                      ? "bg-amber-50/40 border-amber-200/90 shadow-xs ring-1 ring-amber-300/40"
                      : "bg-white border-stone-200/90 hover:border-stone-300 hover:shadow-xs"
                  }`}
                >
                  {/* Top card metadata */}
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-1.5">
                      <span
                        className={`text-[10px] font-semibold tracking-wide uppercase px-1.5 py-0.5 rounded ${
                          isCurrentPage
                            ? "bg-amber-100 text-amber-900"
                            : "bg-stone-100 text-stone-600"
                        }`}
                      >
                        Page {highlight.pageNumber}
                      </span>

                      {/* Color indicator pill */}
                      {highlight.color && (
                        <span
                          className="text-[10px] font-medium px-1.5 py-0.5 rounded-full border border-black/10 flex items-center gap-1"
                          style={{
                            backgroundColor:
                              (colorStyle?.backgroundColor as string) ?? "transparent",
                          }}
                        >
                          <span className="capitalize text-stone-700">
                            {highlight.color.toLowerCase()}
                          </span>
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      {onDeleteHighlight && (
                        <button
                          type="button"
                          title="Delete highlight"
                          onClick={(e) => {
                            e.stopPropagation();
                            onDeleteHighlight(highlight.id);
                          }}
                          className="p-1 rounded text-stone-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      )}
                      <span className="text-[10px] text-stone-400 flex items-center gap-0.5">
                        Jump <ExternalLink className="w-2.5 h-2.5" />
                      </span>
                    </div>
                  </div>

                  {/* Selected text */}
                  {highlight.selectedText && (
                    <p className="text-xs text-stone-800 font-normal line-clamp-3 leading-snug">
                      &ldquo;{highlight.selectedText}&rdquo;
                    </p>
                  )}

                  {/* Attached note preview if exists */}
                  {hasNote && (
                    <div className="mt-2 pt-2 border-t border-stone-100 flex items-start gap-1.5 text-amber-900/80 bg-amber-50/50 px-2 py-1 rounded">
                      <StickyNote className="w-3 h-3 text-amber-600 shrink-0 mt-0.5" />
                      <p className="text-[11px] leading-tight line-clamp-2">
                        {highlight.note}
                      </p>
                    </div>
                  )}
                </div>
              );
            })
          )
        ) : (
          /* Notes Tab View */
          notesOnly.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 px-4 text-center text-stone-400">
              <div className="w-12 h-12 rounded-2xl bg-stone-100 flex items-center justify-center mb-3">
                <StickyNote className="w-6 h-6 text-stone-300" />
              </div>
              <p className="text-sm font-medium text-stone-600 mb-1">
                No notes yet
              </p>
              <p className="text-xs text-stone-400 leading-relaxed max-w-xs">
                Highlight text in the PDF first, then click on it to attach your thoughts and notes.
              </p>
            </div>
          ) : (
            notesOnly.map((note) => {
              const isCurrentPage = currentPage === note.pageNumber;
              const colorStyle = note.color
                ? getHighlightColorStyle(note.color)
                : null;

              return (
                <div
                  key={note.id}
                  id={`note-card-${note.id}`}
                  onClick={() => onSelectHighlight(note)}
                  className={`group relative p-3 rounded-lg border transition-all cursor-pointer text-left ${
                    isCurrentPage
                      ? "bg-amber-50/40 border-amber-200/90 shadow-xs ring-1 ring-amber-300/40"
                      : "bg-white border-stone-200/90 hover:border-stone-300 hover:shadow-xs"
                  }`}
                >
                  {/* Top card metadata */}
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-1.5">
                      <span
                        className={`text-[10px] font-semibold tracking-wide uppercase px-1.5 py-0.5 rounded ${
                          isCurrentPage
                            ? "bg-amber-100 text-amber-900"
                            : "bg-stone-100 text-stone-600"
                        }`}
                      >
                        Page {note.pageNumber}
                      </span>

                      {/* Color dot if highlight has a color */}
                      {note.color && (
                        <span
                          className="w-2.5 h-2.5 rounded-full inline-block border border-black/10 shrink-0"
                          style={{
                            backgroundColor:
                              (colorStyle?.backgroundColor as string) ?? "transparent",
                          }}
                          title={`Color: ${note.color.toLowerCase()}`}
                        />
                      )}
                    </div>

                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      {onDeleteNote && (
                        <button
                          type="button"
                          title="Remove note"
                          onClick={(e) => {
                            e.stopPropagation();
                            onDeleteNote(note.id);
                          }}
                          className="p-1 rounded text-stone-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      )}
                      <span className="text-[10px] text-stone-400 flex items-center gap-0.5">
                        Jump <ExternalLink className="w-2.5 h-2.5" />
                      </span>
                    </div>
                  </div>

                  {/* Selected text quotation */}
                  {note.selectedText && (
                    <div className="border-l-2 border-amber-300/70 pl-2 my-1.5">
                      <p className="text-[11px] font-serif italic text-stone-500 line-clamp-2 leading-snug">
                        &ldquo;{note.selectedText}&rdquo;
                      </p>
                    </div>
                  )}

                  {/* Note content */}
                  <p className="text-xs text-stone-800 font-normal leading-relaxed whitespace-pre-wrap break-words">
                    {note.note}
                  </p>
                </div>
              );
            })
          )
        )}
      </div>
    </aside>
  );
}
