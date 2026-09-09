"use client";

import { useState } from "react";
import type { Highlight, HighlightColor, HighlightRectangle } from "@/types/highlight";
import { StickyNote } from "lucide-react";

/** Returns translucent background style for a highlight color */
export function getHighlightColorStyle(color: HighlightColor | null | undefined): React.CSSProperties {
  if (!color) {
    return {
      backgroundColor: "transparent",
      borderBottom: "2px dashed rgba(217, 119, 6, 0.55)",
    };
  }
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

interface NoteMarkerProps {
  highlight: Highlight;
  lastRect: HighlightRectangle;
  onClick: (position: { x: number; y: number }) => void;
}

function NoteMarker({ highlight, lastRect, onClick }: NoteMarkerProps) {
  const [isHovered, setIsHovered] = useState(false);

  // Position at the right edge of the last line of the selection
  const leftPercent = Math.min(98.5, (lastRect.x + lastRect.width) * 100);
  const topPercent = (lastRect.y + lastRect.height / 2) * 100;

  return (
    <div
      style={{
        position: "absolute",
        left: `${leftPercent}%`,
        top: `${topPercent}%`,
        transform: "translate(2px, -50%)",
        zIndex: 10,
        pointerEvents: "auto",
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <button
        type="button"
        id={`highlight-note-marker-${highlight.id}`}
        aria-label="View note"
        onClick={(e) => {
          e.stopPropagation();
          onClick({ x: e.clientX, y: e.clientY });
        }}
        style={{
          width: 18,
          height: 18,
          borderRadius: "50%",
          backgroundColor: "#fef3c7",
          border: "1.5px solid #d97706",
          color: "#92400e",
          boxShadow: "0 1px 3px rgba(0,0,0,0.14)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
          padding: 0,
          transition: "transform 0.15s ease, background-color 0.15s ease",
          transform: isHovered ? "scale(1.2)" : "scale(1)",
        }}
      >
        <StickyNote style={{ width: 10, height: 10, fill: "#fde68a" }} />
      </button>

      {/* Hover preview tooltip */}
      {isHovered && highlight.note && (
        <div
          style={{
            position: "absolute",
            bottom: "calc(100% + 5px)",
            left: "50%",
            transform: "translateX(-50%)",
            backgroundColor: "#1c1917",
            color: "#f5f5f4",
            padding: "5px 8px",
            borderRadius: 6,
            fontSize: 11,
            lineHeight: 1.35,
            maxWidth: 200,
            width: "max-content",
            pointerEvents: "none",
            boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
            zIndex: 30,
            textAlign: "left",
          }}
        >
          <p style={{ margin: "0 0 2px", fontWeight: 600, fontSize: 9, textTransform: "uppercase", color: "#fbbf24", letterSpacing: "0.05em" }}>
            Note
          </p>
          <p style={{ margin: 0, overflow: "hidden", textOverflow: "ellipsis", display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical" }}>
            {highlight.note}
          </p>
        </div>
      )}
    </div>
  );
}

interface HighlightOverlayProps {
  highlights: Highlight[];
  pageNumber: number;
  focusedHighlightId?: number | null;
  /** Called when the user clicks on a highlight rect or its note marker */
  onHighlightClick?: (highlight: Highlight, position: { x: number; y: number }) => void;
}

/**
 * Renders highlight rectangles and subtle note indicators for a single PDF page.
 * Must be positioned inside a `position: relative` page container.
 * Uses percentage-based positioning so it automatically scales with zoom.
 */
export function HighlightOverlay({
  highlights,
  pageNumber,
  focusedHighlightId,
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
      {pageHighlights.map((highlight) => {
        const hasNote = Boolean(highlight.note && highlight.note.trim() !== "");
        const isFocused = focusedHighlightId === highlight.id;
        const lastRect = highlight.rectangles[highlight.rectangles.length - 1];

        return (
          <div key={highlight.id} id={`highlight-group-${highlight.id}`}>
            {highlight.rectangles.map((rect, rectIndex) => (
              <div
                key={`${highlight.id}-${rectIndex}`}
                id={rectIndex === 0 ? `highlight-anchor-${highlight.id}` : undefined}
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
                  mixBlendMode: highlight.color ? "multiply" : "normal",
                  pointerEvents: onHighlightClick ? "auto" : "none",
                  cursor: onHighlightClick ? "pointer" : "default",
                  transition: "background-color 0.15s ease, box-shadow 0.2s ease",
                  boxShadow: isFocused
                    ? "0 0 0 3px rgba(245, 158, 11, 0.7), 0 0 12px rgba(245, 158, 11, 0.5)"
                    : "none",
                  ...getHighlightColorStyle(highlight.color),
                }}
                title={highlight.selectedText ?? undefined}
              />
            ))}

            {/* Subtle note indicator badge if highlight contains a note */}
            {hasNote && lastRect && (
              <NoteMarker
                highlight={highlight}
                lastRect={lastRect}
                onClick={(pos) => {
                  if (onHighlightClick) {
                    onHighlightClick(highlight, pos);
                  }
                }}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

