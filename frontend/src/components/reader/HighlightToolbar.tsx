"use client";

import { useEffect, useRef } from "react";
import type { HighlightColor } from "@/types/highlight";
import { getHighlightColorStyle } from "./HighlightOverlay";

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
 * Dismisses when clicking outside.
 */
export function HighlightToolbar({
  position,
  onColorSelect,
  onDismiss,
}: HighlightToolbarProps) {
  const ref = useRef<HTMLDivElement>(null);

  // Dismiss on outside click
  useEffect(() => {
    const handlePointerDown = (e: PointerEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        onDismiss();
      }
    };
    // Use capture phase so we get it before anything else
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

  return (
    <div
      ref={ref}
      role="toolbar"
      aria-label="Highlight color picker"
      style={{
        position: "fixed",
        // Center the toolbar above the selection
        left: position.x,
        top: position.y,
        transform: "translate(-50%, -100%)",
        zIndex: 9999,
      }}
      // Prevent mousedown from clearing the browser selection
      onMouseDown={(e) => e.preventDefault()}
    >
      {/* Arrow pointing down */}
      <div
        style={{
          position: "absolute",
          bottom: -5,
          left: "50%",
          transform: "translateX(-50%)",
          width: 0,
          height: 0,
          borderLeft: "5px solid transparent",
          borderRight: "5px solid transparent",
          borderTop: "5px solid white",
          filter: "drop-shadow(0 1px 1px rgba(0,0,0,0.15))",
        }}
      />
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 4,
          backgroundColor: "white",
          border: "1px solid #e7e5e4",
          borderRadius: 10,
          padding: "6px 10px",
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
            marginRight: 4,
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
      </div>
    </div>
  );
}
