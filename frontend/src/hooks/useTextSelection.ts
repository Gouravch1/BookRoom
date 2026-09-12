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
  // Track if we're currently showing a toolbar so mouseup/touchend doesn't re-fire
  const isToolbarVisibleRef = useRef(false);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  // Flag to avoid closing the toolbar when we programmatically clear the DOM selection
  const isProgrammaticClearRef = useRef(false);
  const lastTouchTimeRef = useRef(0);

  const checkSelection = useCallback(
    (fallbackPos?: { x: number; y: number }) => {
      const selection = window.getSelection();

      if (!selection || selection.isCollapsed) {
        if (!isToolbarVisibleRef.current && !isProgrammaticClearRef.current) {
          onClear();
        }
        return;
      }

      const rawText = selection.toString();
      if (!rawText.trim()) {
        if (!isProgrammaticClearRef.current) onClear();
        return;
      }

      if (selection.rangeCount === 0) {
        if (!isProgrammaticClearRef.current) onClear();
        return;
      }

      const range = selection.getRangeAt(0);

      // Find the page container by walking up from anchor, commonAncestor, or endContainer
      let pageInfo =
        findPageContainer(range.startContainer) ||
        findPageContainer(range.commonAncestorContainer) ||
        findPageContainer(range.endContainer);

      // Fallback: if not found by tree walk, query the visible page container directly
      if (!pageInfo && containerRef.current) {
        const fallbackPageEl = containerRef.current.querySelector<HTMLElement>("[data-page-number]");
        if (fallbackPageEl) {
          const parsed = parseInt(fallbackPageEl.getAttribute("data-page-number") || "1", 10);
          pageInfo = { el: fallbackPageEl, pageNumber: isNaN(parsed) ? 1 : parsed };
        }
      }

      if (!pageInfo) {
        return;
      }

      const { el: pageEl, pageNumber } = pageInfo;
      const pageRect = pageEl.getBoundingClientRect();

      // Collect all client rects for the selection
      let clientRects = Array.from(range.getClientRects()).filter(
        (r) => r.width > 0.5 && r.height > 0.5
      );
      if (clientRects.length === 0) {
        const bRect = range.getBoundingClientRect();
        if (bRect && bRect.width > 0.5 && bRect.height > 0.5) {
          clientRects = [bRect];
        }
      }

      const normalized: HighlightRectangle[] = [];
      for (const rect of clientRects) {
        const nr = normalizeRect(rect, pageRect);
        if (nr) normalized.push(nr);
      }

      if (normalized.length === 0) {
        if (!isProgrammaticClearRef.current) onClear();
        return;
      }

      // Position the toolbar above the selection's last rect (or fallback)
      const lastRect = clientRects[clientRects.length - 1];
      const toolbarX = lastRect
        ? lastRect.left + lastRect.width / 2
        : fallbackPos?.x ?? (typeof window !== "undefined" ? window.innerWidth / 2 : 200);
      const toolbarY = clientRects[0]
        ? clientRects[0].top - 8
        : fallbackPos?.y ?? 100;

      isToolbarVisibleRef.current = true;
      onSelection({
        selectedText: rawText.trim(),
        selectionRects: normalized,
        selectedPage: pageNumber,
        toolbarPosition: { x: toolbarX, y: toolbarY },
      });

      // Clear DOM selection so Edge mini-menu ("Copy / Search with Bing") on desktop
      // and Android Chrome's "Touch to Search" Google bar on mobile NEVER appear!
      isProgrammaticClearRef.current = true;
      try {
        selection.removeAllRanges();
      } catch {
        // ignore
      }
      setTimeout(() => {
        isProgrammaticClearRef.current = false;
      }, 300);
    },
    [onSelection, onClear, containerRef]
  );

  const handleMouseDown = useCallback(
    (e: MouseEvent) => {
      // Ignore synthetic mousedown fired right after touch on mobile phones
      if (Date.now() - lastTouchTimeRef.current < 800) return;
      if (e.button !== 0) return;
      if (isToolbarVisibleRef.current && !isProgrammaticClearRef.current) {
        isToolbarVisibleRef.current = false;
        onClear();
      }
    },
    [onClear]
  );

  const handleMouseUp = useCallback(
    (e: MouseEvent) => {
      // Ignore synthetic mouseup fired right after touch on mobile phones
      if (Date.now() - lastTouchTimeRef.current < 800) return;
      setTimeout(() => {
        checkSelection({ x: e.clientX, y: e.clientY });
      }, 50);
    },
    [checkSelection]
  );

  const handleTouchEnd = useCallback(() => {
    lastTouchTimeRef.current = Date.now();
    // Allow touch selection to finalize before checking
    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    debounceTimerRef.current = setTimeout(() => {
      checkSelection();
    }, 120);
  }, [checkSelection]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    container.addEventListener("mousedown", handleMouseDown);
    window.addEventListener("mouseup", handleMouseUp);
    window.addEventListener("touchend", handleTouchEnd, { passive: true });

    return () => {
      container.removeEventListener("mousedown", handleMouseDown);
      window.removeEventListener("mouseup", handleMouseUp);
      window.removeEventListener("touchend", handleTouchEnd);
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    };
  }, [containerRef, handleMouseDown, handleMouseUp, handleTouchEnd]);

  const clearSelection = useCallback(() => {
    isToolbarVisibleRef.current = false;
    isProgrammaticClearRef.current = true;
    try {
      window.getSelection()?.removeAllRanges();
    } catch {
      // ignore
    }
    setTimeout(() => {
      isProgrammaticClearRef.current = false;
    }, 50);
    onClear();
  }, [onClear]);

  return { clearSelection, isToolbarVisibleRef };
}
