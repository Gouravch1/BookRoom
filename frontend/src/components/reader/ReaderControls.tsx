"use client";

import { ChevronLeft, ChevronRight, ZoomIn, ZoomOut, Maximize2, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";

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
    <div className="border-t border-stone-200 bg-white py-2 px-4 flex items-center justify-between gap-2 flex-wrap">
      {/* Page navigation */}
      <div className="flex items-center gap-1.5">
        <Button
          variant="ghost"
          size="icon"
          onClick={onPrev}
          disabled={currentPage <= 1}
          className="h-8 w-8"
          id="prev-page"
          aria-label="Previous page"
        >
          <ChevronLeft className="w-4 h-4" />
        </Button>
        <span className="text-sm text-stone-600 tabular-nums min-w-[5rem] text-center">
          {currentPage}
          {totalPages > 0 && <span className="text-stone-400"> / {totalPages}</span>}
        </span>

        {isLastPage ? (
          <Button
            size="sm"
            onClick={onFinish}
            className="h-8 px-2.5 text-xs font-medium bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm transition-all"
            id="finish-book-btn"
            title="Mark book as finished"
          >
            <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
            Finish Book
          </Button>
        ) : (
          <Button
            variant="ghost"
            size="icon"
            onClick={onNext}
            disabled={isLastPage}
            className="h-8 w-8"
            id="next-page"
            aria-label="Next page"
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        )}
      </div>

      {/* Zoom + fullscreen */}
      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="icon"
          onClick={onZoomOut}
          disabled={scale <= 0.5}
          className="h-8 w-8"
          aria-label="Zoom out"
        >
          <ZoomOut className="w-4 h-4" />
        </Button>
        <span className="text-xs text-stone-500 tabular-nums w-10 text-center">{pct}%</span>
        <Button
          variant="ghost"
          size="icon"
          onClick={onZoomIn}
          disabled={scale >= 2.5}
          className="h-8 w-8"
          aria-label="Zoom in"
        >
          <ZoomIn className="w-4 h-4" />
        </Button>
        <div className="w-px h-4 bg-stone-200 mx-1" />
        <Button
          variant="ghost"
          size="icon"
          onClick={onFullscreen}
          className="h-8 w-8"
          aria-label="Toggle fullscreen"
        >
          <Maximize2 className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
