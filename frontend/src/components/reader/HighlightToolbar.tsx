"use client";

import { useEffect, useRef, useState } from "react";
import type { HighlightColor } from "@/types/highlight";
import { getHighlightColorStyle } from "./HighlightOverlay";
import { StickyNote, Info } from "lucide-react";
import { toast as sonnerToast } from "sonner";

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
  onColorSelect: (color: HighlightColor) => void;
  onDismiss: () => void;
}

/**
 * Floating toolbar that appears near a text selection.
 * Lets the user pick a highlight color.
 * Notes require text to be highlighted first.
 */
export function HighlightToolbar({
  position,
  onColorSelect,
  onDismiss,
}: HighlightToolbarProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [showHint, setShowHint] = useState(false);

  // Position clamping so toolbar doesn't go offscreen
  const isNearTop = position.y < 120;
  const clampedX = Math.max(
    160,
    Math.min(
      position.x,
      typeof window !== "undefined" ? window.innerWidth - 160 : position.x
    )
  );

  // Dismiss on outside click
  useEffect(() => {
    const handlePointerDown = (e: PointerEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        onDismiss();
      }
    };
    document.addEventListener("pointerdown", handlePointerDown, true);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown, true);
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

  const handleDisabledNoteClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setShowHint(true);
    sonnerToast.info("Please highlight the passage first to attach a note.", {
      description: "Select any highlight color to highlight the text, then click it to add your note.",
    });
    setTimeout(() => setShowHint(false), 3000);
  };

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
      onMouseDown={(e) => e.preventDefault()}
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
                filter: "drop-shadow(0 1px 1px rgba(0,0,0,0.15))",
              }),
        }}
      />

      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 5,
          backgroundColor: "white",
          border: "1px solid #e7e5e4",
          borderRadius: 10,
          padding: "5px 8px",
          boxShadow:
            "0 4px 16px rgba(0,0,0,0.12), 0 1px 4px rgba(0,0,0,0.08)",
          userSelect: "none",
        }}
      >
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
              onClick={() => onColorSelect(color)}
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
            backgroundColor: "#e7e5e4",
            margin: "0 3px",
          }}
        />

        {/* Note button — disabled on unhighlighted text with hint */}
        <div style={{ position: "relative" }}>
          <button
            id="highlight-toolbar-add-note"
            type="button"
            onClick={handleDisabledNoteClick}
            title="Highlight text first to attach a note"
            style={{
              display: "flex",
              alignItems: "center",
              gap: 5,
              padding: "4px 8px",
              borderRadius: 6,
              border: "1px dashed #d6d3d1",
              backgroundColor: "#f5f5f4",
              color: "#78716c",
              fontSize: 12,
              fontWeight: 500,
              cursor: "pointer",
              transition: "all 0.15s ease",
              flexShrink: 0,
            }}
            onMouseEnter={() => setShowHint(true)}
            onMouseLeave={() => setShowHint(false)}
          >
            <StickyNote className="w-3.5 h-3.5 text-amber-600/70" />
            <span>Note</span>
          </button>

          {/* Hint Tooltip Bubble */}
          {showHint && (
            <div
              style={{
                position: "absolute",
                bottom: "calc(100% + 8px)",
                left: "50%",
                transform: "translateX(-50%)",
                backgroundColor: "#1c1917",
                color: "#f5f5f4",
                padding: "6px 10px",
                borderRadius: 6,
                fontSize: 11,
                lineHeight: 1.3,
                whiteSpace: "nowrap",
                pointerEvents: "none",
                boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
                zIndex: 40,
                display: "flex",
                alignItems: "center",
                gap: 5,
              }}
            >
              <Info className="w-3 h-3 text-amber-400 shrink-0" />
              <span>Please highlight the text first to add a note</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
