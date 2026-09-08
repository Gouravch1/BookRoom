"use client";

import type { Highlight, HighlightColor } from "@/types/highlight";

/** Returns translucent background style for a highlight color */
export function getHighlightColorStyle(color: HighlightColor): React.CSSProperties {
  switch (color) {
    case "YELLOW":
      return { backgroundColor: "rgba(250, 204, 21, 0.40)" };
    case "GREEN":
      return { backgroundColor: "rgba(74, 222, 128, 0.35)" };
    case "RED":
      return { backgroundColor: "rgba(248, 113, 113, 0.40)" };
    case "BLUE":
      return { backgroundColor: "rgba(96, 165, 250, 0.35)" };
    case "PINK":
      return { backgroundColor: "rgba(244, 114, 182, 0.40)" };
    case "ORANGE":
      return { backgroundColor: "rgba(251, 146, 60, 0.40)" };
    case "BLACK":
      return { backgroundColor: "rgba(0, 0, 0, 0.18)" };
    default:
      return { backgroundColor: "rgba(250, 204, 21, 0.40)" };
  }
}

interface HighlightOverlayProps {
  highlights: Highlight[];
  pageNumber: number;
  /** Called when the user clicks on a highlight rect */
  onHighlightClick?: (highlight: Highlight, position: { x: number; y: number }) => void;
}

/**
 * Renders highlight rectangles for a single PDF page.
 * Must be positioned inside a `position: relative` page container.
 * Uses percentage-based positioning so it automatically scales with zoom.
 */
export function HighlightOverlay({
  highlights,
  pageNumber,
  onHighlightClick,
}: HighlightOverlayProps) {
  const pageHighlights = highlights.filter((h) => h.pageNumber === pageNumber);

  if (pageHighlights.length === 0) return null;

  return (
    <div
      aria-hidden="true"
      style={{
        position: "absolute",
        inset: 0,
        // pointer-events none by default; individual rects override if interactive
        pointerEvents: "none",
        zIndex: 2,
      }}
    >
      {pageHighlights.map((highlight) =>
        highlight.rectangles.map((rect, rectIndex) => (
          <div
            key={`${highlight.id}-${rectIndex}`}
            onClick={
              onHighlightClick
                ? (e) => {
                    e.stopPropagation();
                    onHighlightClick(highlight, { x: e.clientX, y: e.clientY });
                  }
                : undefined
            }
            style={{
              position: "absolute",
              left: `${rect.x * 100}%`,
              top: `${rect.y * 100}%`,
              width: `${rect.width * 100}%`,
              height: `${rect.height * 100}%`,
              borderRadius: "2px",
              mixBlendMode: "multiply",
              // Allow clicking on existing highlights; text selection still works
              // because the text layer sits above this overlay via z-index
              pointerEvents: onHighlightClick ? "auto" : "none",
              cursor: onHighlightClick ? "pointer" : "default",
              transition: "background-color 0.15s ease",
              ...getHighlightColorStyle(highlight.color),
            }}
            title={highlight.selectedText ?? undefined}
          />
        ))
      )}
    </div>
  );
}
