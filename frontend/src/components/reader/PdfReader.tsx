"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { Document, pdfjs } from "react-pdf";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";
import { Loader2 } from "lucide-react";
import type { Highlight, HighlightColor } from "@/types/highlight";
import { usePdfHighlights } from "@/hooks/usePdfHighlights";
import { useTextSelection } from "@/hooks/useTextSelection";
import type { SelectionState } from "@/hooks/useTextSelection";
import { PdfPage } from "./PdfPage";
import { HighlightToolbar } from "./HighlightToolbar";
import { HighlightContextMenu } from "./HighlightContextMenu";

// Use CDN worker compatible with pdfjs-dist version
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.mjs`;

interface PdfReaderProps {
  pdfUrl: string;
  bookId: number;
  currentPage: number;
  scale: number;
  focusedHighlightId?: number | null;
  onClearFocusedHighlight?: () => void;
  highlights?: Highlight[];
  addHighlight?: (request: import("@/types/highlight").CreateHighlightRequest) => Promise<Highlight | null>;
  removeHighlight?: (highlightId: number) => Promise<void>;
  changeColor?: (highlightId: number, color: HighlightColor) => Promise<void>;
  updateNote?: (highlightId: number, note: string | null) => Promise<Highlight | null>;
  onPageCountLoaded: (total: number) => void;
  onLoadError: (error: Error) => void;
}

export function PdfReader({
  pdfUrl,
  bookId,
  currentPage,
  scale,
  focusedHighlightId,
  onClearFocusedHighlight,
  highlights: propHighlights,
  addHighlight: propAddHighlight,
  removeHighlight: propRemoveHighlight,
  changeColor: propChangeColor,
  updateNote: propUpdateNote,
  onPageCountLoaded,
  onLoadError,
}: PdfReaderProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState<number>(0);

  // ─── Highlights Hook (fallback if not passed from parent) ───────────────────
  const internalHighlights = usePdfHighlights(bookId);
  const highlights = propHighlights ?? internalHighlights.highlights;
  const addHighlight = propAddHighlight ?? internalHighlights.addHighlight;
  const removeHighlight = propRemoveHighlight ?? internalHighlights.removeHighlight;
  const changeColor = propChangeColor ?? internalHighlights.changeColor;
  const updateNote = propUpdateNote ?? internalHighlights.updateNote;

  // ─── Context menu state (for existing highlights & notes) ───────────────────
  const [contextMenu, setContextMenu] = useState<{
    highlightId: number;
    position: { x: number; y: number };
  } | null>(null);

  // Keep active highlight synced with state
  const activeHighlight = contextMenu
    ? highlights.find((h) => h.id === contextMenu.highlightId) || null
    : null;

  // ─── Text selection & new highlight toolbar ──────────────────────────────────
  const [selection, setSelection] = useState<SelectionState | null>(null);

  const handleSelection = useCallback((state: SelectionState) => {
    setContextMenu(null); // close context menu if open
    setSelection(state);
  }, []);

  const handleClearSelection = useCallback(() => {
    setSelection(null);
  }, []);

  const { clearSelection } = useTextSelection({
    containerRef: containerRef as React.RefObject<HTMLDivElement | null>,
    onSelection: handleSelection,
    onClear: handleClearSelection,
  });

  // ─── Handle highlight color (and optional note) chosen from toolbar ───────────
  const handleColorSelect = useCallback(
    async (color: HighlightColor, note?: string | null) => {
      if (!selection) return;
      const { selectedText, selectionRects, selectedPage } = selection;

      // Close toolbar immediately for responsiveness
      setSelection(null);
      clearSelection();

      await addHighlight({
        bookId,
        pageNumber: selectedPage,
        selectedText,
        color,
        note: note?.trim() || null,
        rectangles: selectionRects,
      });
    },
    [selection, addHighlight, bookId, clearSelection]
  );


  // ─── Handle click on existing highlight / note marker ─────────────────────────
  const handleHighlightClick = useCallback(
    (highlight: Highlight, position: { x: number; y: number }) => {
      // Close the new-highlight toolbar first
      setSelection(null);
      clearSelection();
      setContextMenu({ highlightId: highlight.id, position });
    },
    [clearSelection]
  );

  // ─── Focus & scroll to highlight when selected from NotesPanel ───────────────
  useEffect(() => {
    if (!focusedHighlightId) return;
    const target = highlights.find((h) => h.id === focusedHighlightId);
    if (!target || target.pageNumber !== currentPage) return;

    const timer = setTimeout(() => {
      const anchor =
        document.getElementById(`highlight-anchor-${focusedHighlightId}`) ||
        document.getElementById(`highlight-note-marker-${focusedHighlightId}`) ||
        document.getElementById(`highlight-group-${focusedHighlightId}`);

      if (anchor) {
        anchor.scrollIntoView({ behavior: "smooth", block: "center" });
        const rect = anchor.getBoundingClientRect();
        setContextMenu({
          highlightId: target.id,
          position: {
            x: Math.max(160, Math.min(window.innerWidth - 160, rect.left + rect.width / 2)),
            y: rect.top,
          },
        });
      }
    }, 150);

    return () => clearTimeout(timer);
  }, [focusedHighlightId, highlights, currentPage]);

  // ─── Click & Touch detection on highlighted text through the text layer ───────
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let touchStart: { x: number; y: number; time: number } | null = null;

    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 1) {
        touchStart = {
          x: e.touches[0].clientX,
          y: e.touches[0].clientY,
          time: Date.now(),
        };
      }
    };

    const checkPointHit = (clientX: number, clientY: number, targetNode: Node | null) => {
      let pageEl: HTMLElement | null = null;
      let pageNumber: number | null = null;
      let curr = targetNode;

      while (curr && curr !== container) {
        if (curr instanceof HTMLElement) {
          const attr = curr.getAttribute("data-page-number");
          if (attr !== null) {
            const parsed = parseInt(attr, 10);
            if (!isNaN(parsed)) {
              pageEl = curr;
              pageNumber = parsed;
              break;
            }
          }
        }
        curr = curr.parentNode;
      }

      if (!pageEl || pageNumber === null) return false;

      const pageRect = pageEl.getBoundingClientRect();
      const clickX = (clientX - pageRect.left) / pageRect.width;
      const clickY = (clientY - pageRect.top) / pageRect.height;

      // Touch tolerance padding (~14px vertically, ~8px horizontally)
      const tolY = 14 / pageRect.height;
      const tolX = 8 / pageRect.width;

      const matched = highlights.find(
        (h) =>
          h.pageNumber === pageNumber &&
          h.rectangles.some(
            (r) =>
              clickX >= r.x - tolX &&
              clickX <= r.x + r.width + tolX &&
              clickY >= r.y - tolY &&
              clickY <= r.y + r.height + tolY
          )
      );

      if (matched) {
        setSelection(null);
        clearSelection();
        setContextMenu({
          highlightId: matched.id,
          position: { x: clientX, y: clientY },
        });
        return true;
      }
      return false;
    };

    const handleTouchEnd = (e: TouchEvent) => {
      if (!touchStart || e.changedTouches.length === 0) return;
      const touch = e.changedTouches[0];
      const dx = touch.clientX - touchStart.x;
      const dy = touch.clientY - touchStart.y;
      const duration = Date.now() - touchStart.time;
      touchStart = null;

      // Only treat as tap if finger didn't drag/scroll
      if (Math.hypot(dx, dy) < 10 && duration < 400) {
        setTimeout(() => {
          checkPointHit(touch.clientX, touch.clientY, e.target as Node);
        }, 30);
      }
    };

    const handleClick = (e: MouseEvent) => {
      const currentSelection = window.getSelection();
      if (
        currentSelection &&
        !currentSelection.isCollapsed &&
        currentSelection.toString().trim()
      ) {
        return;
      }

      checkPointHit(e.clientX, e.clientY, e.target as Node);
    };

    container.addEventListener("touchstart", handleTouchStart, { passive: true });
    container.addEventListener("touchend", handleTouchEnd);
    container.addEventListener("click", handleClick);

    return () => {
      container.removeEventListener("touchstart", handleTouchStart);
      container.removeEventListener("touchend", handleTouchEnd);
      container.removeEventListener("click", handleClick);
    };
  }, [highlights, clearSelection]);

  // ─── Responsive container width ──────────────────────────────────────────────
  const updateWidth = useCallback(() => {
    if (containerRef.current) {
      setContainerWidth(containerRef.current.clientWidth);
    }
  }, []);

  useEffect(() => {
    updateWidth();
    const observer = new ResizeObserver(updateWidth);
    if (containerRef.current) observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, [updateWidth]);

  // ─── Disable Native Context Menu, Copy, Cut, Drag & Shortcuts ───────────────
  useEffect(() => {
    const isEditingInput = () => {
      const el = document.activeElement;
      return Boolean(
        el &&
          (el.tagName === "INPUT" ||
            el.tagName === "TEXTAREA" ||
            el.getAttribute("contenteditable") === "true")
      );
    };

    const handleCopy = (e: ClipboardEvent) => {
      if (isEditingInput()) return;
      e.preventDefault();
      if (e.clipboardData) e.clipboardData.clearData();
    };

    const handleCut = (e: ClipboardEvent) => {
      if (isEditingInput()) return;
      e.preventDefault();
    };

    const handleDragStart = (e: DragEvent) => {
      if (isEditingInput()) return;
      e.preventDefault();
    };

    const handleContextMenu = (e: MouseEvent) => {
      if (isEditingInput()) return;
      // Completely suppress the browser's right-click context menu (which has "Copy")
      e.preventDefault();
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (isEditingInput()) return;

      // Prevent Ctrl+C, Cmd+C, Ctrl+X, Cmd+X, Ctrl+A, Cmd+A, Ctrl+P, Cmd+P, Ctrl+Insert
      if (
        (e.ctrlKey || e.metaKey) &&
        (e.key === "c" ||
          e.key === "C" ||
          e.key === "x" ||
          e.key === "X" ||
          e.key === "a" ||
          e.key === "A" ||
          e.key === "p" ||
          e.key === "P" ||
          e.key === "Insert")
      ) {
        e.preventDefault();
        e.stopPropagation();
      }
    };

    window.addEventListener("copy", handleCopy, true);
    window.addEventListener("cut", handleCut, true);
    window.addEventListener("dragstart", handleDragStart, true);
    window.addEventListener("contextmenu", handleContextMenu, true);
    window.addEventListener("keydown", handleKeyDown, true);

    return () => {
      window.removeEventListener("copy", handleCopy, true);
      window.removeEventListener("cut", handleCut, true);
      window.removeEventListener("dragstart", handleDragStart, true);
      window.removeEventListener("contextmenu", handleContextMenu, true);
      window.removeEventListener("keydown", handleKeyDown, true);
    };
  }, []);

  // Limit base width to avoid oversized rendering; scale multiplied on top
  const baseWidth = containerWidth > 0 ? Math.min(containerWidth - 32, 900) : 600;
  const pageWidth = Math.round(baseWidth * scale);

  return (
    <>
      <div
        ref={containerRef}
        className="flex-1 overflow-auto flex flex-col items-center py-6 px-4 min-h-0 overscroll-contain"
        style={{
          background: "#111113",
          WebkitOverflowScrolling: "touch",
        }}
        id="pdf-reader-container"
        onContextMenu={(e) => e.preventDefault()}
      >
        <Document
          file={pdfUrl}
          onLoadSuccess={({ numPages }) => onPageCountLoaded(numPages)}
          onLoadError={onLoadError}
          loading={
            <div className="flex flex-col items-center justify-center gap-3 py-20">
              <Loader2 className="w-8 h-8 animate-spin" style={{ color: "var(--accent)" }} />
              <p className="text-sm" style={{ color: "var(--text-muted)" }}>Loading document…</p>
            </div>
          }
          error={
            <div className="flex flex-col items-center justify-center gap-2 py-20">
              <p className="text-sm font-medium" style={{ color: "var(--red)" }}>
                Failed to load PDF.
              </p>
              <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                The file may be unavailable or your session may have expired.
              </p>
            </div>
          }
        >
          <PdfPage
            pageNumber={currentPage}
            width={pageWidth}
            highlights={highlights}
            focusedHighlightId={focusedHighlightId}
            onHighlightClick={handleHighlightClick}
            activeSelectionRects={
              selection && selection.selectedPage === currentPage
                ? selection.selectionRects
                : undefined
            }
          />
        </Document>
      </div>

      {/* Floating toolbar — appears when user selects text */}
      {selection && (
        <HighlightToolbar
          position={selection.toolbarPosition}
          onColorSelect={handleColorSelect}
          onDismiss={() => {
            setSelection(null);
            clearSelection();
          }}
        />
      )}


      {/* Context menu / Note Popover — appears when user clicks highlight or note marker */}
      {activeHighlight && contextMenu && (
        <HighlightContextMenu
          highlight={activeHighlight}
          position={contextMenu.position}
          onDelete={(id) => {
            removeHighlight(id);
            setContextMenu(null);
          }}
          onChangeColor={changeColor}
          onUpdateNote={updateNote}
          onClose={() => {
            setContextMenu(null);
            if (onClearFocusedHighlight) onClearFocusedHighlight();
          }}
        />
      )}
    </>
  );
}

