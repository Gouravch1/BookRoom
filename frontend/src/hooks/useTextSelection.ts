"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import type { HighlightRectangle } from "@/types/highlight";

export interface SelectionState {
  selectedText: string;
  selectionRects: HighlightRectangle[];
  selectedPage: number;
  /** Viewport position for the toolbar (fixed positioning) */
  toolbarPosition: { x: number; y: number };
}

interface UseTextSelectionOptions {
  /** Ref to the scrollable PDF reader container */
  containerRef: React.RefObject<HTMLDivElement | null>;
  /** Called when a valid selection is detected */
  onSelection: (state: SelectionState) => void;
  /** Called when selection is cleared */
  onClear: () => void;
}

/**
 * Normalizes a DOMRect relative to a page container rect into [0,1] coordinates.
 * Returns null if the rect has no area or is outside the page.
 */
function normalizeRect(
  rect: DOMRect,
  pageRect: DOMRect
): HighlightRectangle | null {
  const x = (rect.left - pageRect.left) / pageRect.width;
  const y = (rect.top - pageRect.top) / pageRect.height;
  const width = rect.width / pageRect.width;
  const height = rect.height / pageRect.height;

  // Filter out zero-size rects
  if (width < 0.001 || height < 0.001) return null;

  return {
    x: Math.max(0, Math.min(1, x)),
    y: Math.max(0, Math.min(1, y)),
    width: Math.max(0, Math.min(1, width)),
    height: Math.max(0, Math.min(1, height)),
  };
}

/**
 * Walks up from a DOM node to find the nearest ancestor
 * that has a [data-page-number] attribute.
 * Returns the element and parsed page number, or null.
 */
function findPageContainer(
  node: Node | null
): { el: HTMLElement; pageNumber: number } | null {
  let current: Node | null = node;
  while (current && current !== document.body) {
    if (current instanceof HTMLElement) {
      const attr = current.getAttribute("data-page-number");
      if (attr !== null) {
        const pageNumber = parseInt(attr, 10);
        if (!isNaN(pageNumber)) {
          return { el: current, pageNumber };
        }
      }
    }
    current = current.parentNode;
  }
  return null;
}

export function useTextSelection({
  containerRef,
  onSelection,
  onClear,
}: UseTextSelectionOptions) {
  // Track if we're currently showing a toolbar so mouseup doesn't re-fire
  const isToolbarVisibleRef = useRef(false);

  const handleMouseUp = useCallback(
    (e: MouseEvent) => {
      // Minimal delay so the browser finalises the selection range
      setTimeout(() => {
        const selection = window.getSelection();

        if (!selection || selection.isCollapsed) {
          if (!isToolbarVisibleRef.current) {
            onClear();
          }
          return;
        }

        const rawText = selection.toString();
        if (!rawText.trim()) {
          onClear();
          return;
        }

        if (selection.rangeCount === 0) {
          onClear();
          return;
        }

        const range = selection.getRangeAt(0);

        // Find the page container by walking up from the anchor node
        const pageInfo = findPageContainer(range.startContainer);
        if (!pageInfo) {
          // Selection is outside a PDF page — ignore
          return;
        }

        const { el: pageEl, pageNumber } = pageInfo;
        const pageRect = pageEl.getBoundingClientRect();

        // Collect all client rects for the selection
        const clientRects = Array.from(range.getClientRects());
        const normalized: HighlightRectangle[] = [];

        for (const rect of clientRects) {
          const nr = normalizeRect(rect, pageRect);
          if (nr) normalized.push(nr);
        }

        if (normalized.length === 0) {
          onClear();
          return;
        }

        // Position the toolbar above the selection's last rect (or use mouse pos)
        const lastRect = clientRects[clientRects.length - 1];
        const toolbarX = lastRect
          ? lastRect.left + lastRect.width / 2
          : e.clientX;
        const toolbarY = clientRects[0]
          ? clientRects[0].top - 8
          : e.clientY - 8;

        isToolbarVisibleRef.current = true;
        onSelection({
          selectedText: rawText.trim(),
          selectionRects: normalized,
          selectedPage: pageNumber,
          toolbarPosition: { x: toolbarX, y: toolbarY },
        });
      }, 50);
    },
    [onSelection, onClear]
  );

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    container.addEventListener("mouseup", handleMouseUp);
    return () => {
      container.removeEventListener("mouseup", handleMouseUp);
    };
  }, [containerRef, handleMouseUp]);

  const clearSelection = useCallback(() => {
    isToolbarVisibleRef.current = false;
    window.getSelection()?.removeAllRanges();
    onClear();
  }, [onClear]);

  return { clearSelection, isToolbarVisibleRef };
}
