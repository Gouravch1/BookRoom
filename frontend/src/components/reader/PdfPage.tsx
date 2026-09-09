"use client";

import { useRef } from "react";
import { Page } from "react-pdf";
import { Loader2 } from "lucide-react";
import type { Highlight, HighlightColor } from "@/types/highlight";
import { HighlightOverlay } from "./HighlightOverlay";

interface PdfPageProps {
  pageNumber: number;
  width: number;
  highlights: Highlight[];
  focusedHighlightId?: number | null;
  onHighlightClick: (highlight: Highlight, position: { x: number; y: number }) => void;
  onHighlightColorChange?: (highlightId: number, color: HighlightColor) => void;
}

/**
 * Wraps a react-pdf <Page> with:
 * - a `data-page-number` attribute for selection detection
 * - `position: relative` so HighlightOverlay can be positioned inside it
 * - HighlightOverlay rendered as a sibling of the PDF canvas/text layers
 */
export function PdfPage({
  pageNumber,
  width,
  highlights,
  focusedHighlightId,
  onHighlightClick,
}: PdfPageProps) {
  const pageRef = useRef<HTMLDivElement>(null);

  return (
    <div
      ref={pageRef}
      data-page-number={pageNumber}
      style={{
        position: "relative",
        display: "inline-block",
        lineHeight: 0, // Prevent extra space below canvas
      }}
    >
      <Page
        pageNumber={pageNumber}
        width={width}
        renderTextLayer={true}
        renderAnnotationLayer={true}
        className="shadow-lg rounded-sm overflow-hidden"
        loading={
          <div
            className="bg-white rounded shadow-lg flex items-center justify-center animate-pulse"
            style={{ width, height: Math.round(width * 1.414) }}
          >
            <Loader2 className="w-6 h-6 text-stone-300 animate-spin" />
          </div>
        }
      />

      {/* Highlight overlay — rendered on top of the canvas, below text layer */}
      <HighlightOverlay
        highlights={highlights}
        pageNumber={pageNumber}
        focusedHighlightId={focusedHighlightId}
        onHighlightClick={onHighlightClick}
      />
    </div>
  );
}

