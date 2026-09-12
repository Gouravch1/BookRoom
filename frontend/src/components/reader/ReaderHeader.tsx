"use client";

import Link from "next/link";
import { ArrowLeft, BookOpen, Highlighter } from "lucide-react";
import type { ReaderBookResponse } from "@/types/reader";
import type { ReadingProgressResponse } from "@/types/reader";

interface ReaderHeaderProps {
  book: ReaderBookResponse;
  progress: ReadingProgressResponse | null;
  currentPage: number;
  highlightsCount?: number;
  activePanel?: "highlights" | "notes" | null;
  onTogglePanel?: (panel: "highlights" | "notes") => void;
}

export function ReaderHeader({
  book,
  progress,
  currentPage,
  highlightsCount,
  activePanel = null,
  onTogglePanel,
}: ReaderHeaderProps) {
  const total = book.totalPages ?? 0;
  const pct = total > 0 ? Math.round((currentPage / total) * 100) : 0;

  return (
    <header
      className="sticky top-0 z-30 glass"
      style={{ borderBottom: "1px solid var(--border-subtle)" }}
    >
      <div className="flex items-center gap-2 sm:gap-3 px-3 sm:px-4 h-12">
        {/* Back */}
        <Link
          href="/library"
          className="flex items-center gap-1.5 text-sm shrink-0 transition-colors"
          style={{ color: "var(--text-muted)" }}
          id="back-to-library"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="hidden sm:inline">Library</span>
        </Link>

        <div
          className="w-px h-4 shrink-0"
          style={{ background: "var(--border-default)" }}
        />

        {/* Book info */}
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <BookOpen className="w-4 h-4 shrink-0" style={{ color: "var(--text-muted)" }} />
          <div className="min-w-0">
            <p
              className="text-sm font-medium truncate leading-tight"
              style={{ color: "var(--text-primary)" }}
            >
              {book.title}
            </p>
            {book.author && (
              <p className="text-xs truncate" style={{ color: "var(--text-muted)" }}>
                {book.author}
              </p>
            )}
          </div>
        </div>

        {/* Progress bar (desktop) */}
        {total > 0 && (
          <div className="hidden md:flex items-center gap-3 shrink-0">
            <div
              className="w-20 lg:w-28 h-1 rounded-full overflow-hidden"
              style={{ background: "var(--bg-hover)" }}
            >
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${pct}%`,
                  background: "linear-gradient(90deg, var(--accent-hover), var(--accent))",
                }}
              />
            </div>
            <span
              className="text-xs tabular-nums whitespace-nowrap"
              style={{ color: "var(--text-muted)" }}
            >
              {currentPage} / {total}
            </span>
          </div>
        )}

        {/* Notes/Highlights button */}
        {onTogglePanel && (
          <button
            type="button"
            id="reader-toggle-notes-btn"
            onClick={() =>
              onTogglePanel(activePanel === "notes" ? "highlights" : "notes")
            }
            title="View Highlights & Notes"
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 shrink-0"
            style={{
              background: activePanel !== null ? "rgba(232,160,69,0.15)" : "var(--bg-raised)",
              color: activePanel !== null ? "var(--accent)" : "var(--text-secondary)",
              border: `1px solid ${activePanel !== null ? "rgba(232,160,69,0.3)" : "var(--border-default)"}`,
            }}
          >
            <Highlighter className="w-3.5 h-3.5" style={{ color: "var(--accent)" }} />
            <span className="font-semibold hidden xs:inline">Notes</span>
            {highlightsCount !== undefined && highlightsCount > 0 && (
              <span
                className="text-[10px] font-bold px-1.5 py-0.5 rounded-full"
                style={{ background: "var(--accent-dim)", color: "var(--accent)" }}
              >
                {highlightsCount}
              </span>
            )}
          </button>
        )}
      </div>
    </header>
  );
}
