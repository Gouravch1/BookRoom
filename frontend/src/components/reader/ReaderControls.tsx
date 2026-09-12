"use client";

import { ChevronLeft, ChevronRight, ZoomIn, ZoomOut, Maximize2, CheckCircle2 } from "lucide-react";

interface ReaderControlsProps {
  currentPage: number;
  totalPages: number;
  scale: number;
  onPrev: () => void;
  onNext: () => void;
  onFinish?: () => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onFullscreen: () => void;
}

function IconBtn({
  onClick,
  disabled,
  id,
  label,
  children,
}: {
  onClick?: () => void;
  disabled?: boolean;
  id?: string;
  label?: string;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      id={id}
      aria-label={label}
      className="w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-200 disabled:opacity-30"
      style={{
        background: "var(--bg-hover)",
        color: "var(--text-secondary)",
        border: "1px solid var(--border-subtle)",
      }}
    >
      {children}
    </button>
  );
}

export function ReaderControls({
  currentPage,
  totalPages,
  scale,
  onPrev,
  onNext,
  onFinish,
  onZoomIn,
  onZoomOut,
  onFullscreen,
}: ReaderControlsProps) {
  const pct = Math.round(scale * 100);
  const isLastPage = totalPages > 0 && currentPage >= totalPages;

  return (
    <div
      className="py-2.5 px-3 sm:px-4 flex items-center justify-between gap-2 shrink-0 z-20 select-none"
      style={{
        borderTop: "1px solid var(--border-subtle)",
        background: "var(--bg-surface)",
        paddingBottom: "max(0.625rem, env(safe-area-inset-bottom, 0px))",
      }}
    >
      {/* Page navigation */}
      <div className="flex items-center gap-1.5 sm:gap-2">
        <IconBtn
          onClick={onPrev}
          disabled={currentPage <= 1}
          id="prev-page"
          label="Previous page"
        >
          <ChevronLeft className="w-4 h-4" />
        </IconBtn>

        <span
          className="text-xs sm:text-sm font-medium tabular-nums min-w-[4rem] sm:min-w-[5rem] text-center"
          style={{ color: "var(--text-secondary)" }}
        >
          {currentPage}
          {totalPages > 0 && (
            <span style={{ color: "var(--text-muted)" }}> / {totalPages}</span>
          )}
        </span>

        <IconBtn
          onClick={onNext}
          disabled={isLastPage}
          id="next-page"
          label="Next page"
        >
          <ChevronRight className="w-4 h-4" />
        </IconBtn>

        {/* Finish Book button appears alongside the next arrow when on the last page */}
        {isLastPage && (
          <button
            onClick={onFinish}
            id="finish-book-btn"
            title="Mark book as finished"
            className="h-8 px-2.5 sm:px-3 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all duration-200 animate-in fade-in zoom-in-95 shrink-0"
            style={{
              background: "var(--emerald-dim)",
              color: "var(--emerald)",
              border: "1px solid rgba(52,211,153,0.3)",
            }}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span className="hidden xs:inline">Finish Book</span>
            <span className="xs:hidden">Finish</span>
          </button>
        )}
      </div>

      {/* Zoom + fullscreen */}
      <div className="flex items-center gap-1">
        <IconBtn onClick={onZoomOut} disabled={scale <= 0.5} label="Zoom out">
          <ZoomOut className="w-4 h-4" />
        </IconBtn>
        <span
          className="text-xs tabular-nums w-9 sm:w-10 text-center font-medium"
          style={{ color: "var(--text-muted)" }}
        >
          {pct}%
        </span>
        <IconBtn onClick={onZoomIn} disabled={scale >= 2.5} label="Zoom in">
          <ZoomIn className="w-4 h-4" />
        </IconBtn>
        <div
          className="w-px h-4 mx-0.5 sm:mx-1"
          style={{ background: "var(--border-default)" }}
        />
        <IconBtn onClick={onFullscreen} label="Toggle fullscreen">
          <Maximize2 className="w-4 h-4" />
        </IconBtn>
      </div>
    </div>
  );
}
