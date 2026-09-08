"use client";

import { useEffect, useRef, useState } from "react";
import type { Highlight, HighlightColor } from "@/types/highlight";
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

interface HighlightContextMenuProps {
  highlight: Highlight;
  position: { x: number; y: number };
  onDelete: (highlightId: number) => void;
  onChangeColor: (highlightId: number, color: HighlightColor) => void;
  onClose: () => void;
}

/**
 * Small floating context menu that appears when clicking an existing highlight.
 * Provides delete and color-change options.
 */
export function HighlightContextMenu({
  highlight,
  position,
  onDelete,
  onChangeColor,
  onClose,
}: HighlightContextMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null);
  const isNearTop = position.y < 130;

  // Dismiss on outside click
  useEffect(() => {
    const handlePointerDown = (e: PointerEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    document.addEventListener("pointerdown", handlePointerDown, true);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown, true);
    };
  }, [onClose]);

  // Dismiss on Escape
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [onClose]);

  return (
    <div
      ref={menuRef}
      role="menu"
      aria-label="Highlight options"
      style={{
        position: "fixed",
        left: position.x,
        top: isNearTop ? position.y + 12 : position.y - 8,
        transform: isNearTop ? "translate(-50%, 0)" : "translate(-50%, -100%)",
        zIndex: 9998,
        backgroundColor: "white",
        border: "1px solid #e7e5e4",
        borderRadius: 10,
        padding: "4px",
        boxShadow: "0 4px 20px rgba(0,0,0,0.14), 0 1px 4px rgba(0,0,0,0.08)",
        minWidth: 160,
      }}
      // Prevent mousedown from clearing selection or losing focus
      onMouseDown={(e) => e.stopPropagation()}
    >
      {/* Arrow */}
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
                filter: "drop-shadow(0 1px 1px rgba(0,0,0,0.12))",
              }),
        }}
      />

      {/* Color section */}
      <div style={{ padding: "4px 8px 2px" }}>
        <p
          style={{
            fontSize: 9,
            fontWeight: 600,
            color: "#a8a29e",
            textTransform: "uppercase",
            letterSpacing: "0.05em",
            marginBottom: 6,
          }}
        >
          Change color
        </p>
        <div style={{ display: "flex", gap: 6, marginBottom: 4 }}>
          {COLORS.map(({ color, label }) => {
            const style = getHighlightColorStyle(color);
            const bg = (style.backgroundColor as string) ?? "transparent";
            const isActive = highlight.color === color;
            return (
              <button
                key={color}
                id={`highlight-context-color-${color.toLowerCase()}`}
                title={label}
                aria-label={`Change to ${label}`}
                onClick={() => {
                  onChangeColor(highlight.id, color);
                  onClose();
                }}
                style={{
                  width: 20,
                  height: 20,
                  borderRadius: "50%",
                  border: isActive
                    ? "2.5px solid #44403c"
                    : "2px solid rgba(0,0,0,0.1)",
                  backgroundColor: bg.replace(/[\d.]+\)$/, "0.85)"),
                  cursor: "pointer",
                  transition: "transform 0.1s",
                  flexShrink: 0,
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLElement).style.transform =
                    "scale(1.15)";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.transform = "scale(1)";
                }}
              />
            );
          })}
        </div>
      </div>

      {/* Separator */}
      <div
        style={{ height: 1, backgroundColor: "#f5f5f4", margin: "2px 0" }}
      />

      {/* Delete */}
      <button
        id="highlight-context-delete"
        role="menuitem"
        onClick={() => {
          onDelete(highlight.id);
          onClose();
        }}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          width: "100%",
          padding: "6px 8px",
          fontSize: 13,
          color: "#ef4444",
          background: "none",
          border: "none",
          borderRadius: 6,
          cursor: "pointer",
          textAlign: "left",
          transition: "background 0.1s",
        }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLElement).style.backgroundColor = "#fff1f2";
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLElement).style.backgroundColor = "transparent";
        }}
      >
        <svg
          width="13"
          height="13"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <polyline points="3 6 5 6 21 6" />
          <path d="M19 6l-1 14H6L5 6" />
          <path d="M10 11v6M14 11v6" />
          <path d="M9 6V4h6v2" />
        </svg>
        Remove highlight
      </button>
    </div>
  );
}
