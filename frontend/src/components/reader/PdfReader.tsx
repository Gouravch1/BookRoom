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

  // ─── Handle highlight color chosen from toolbar ───────────────────────────────
  const handleColorSelect = useCallback(
    async (color: HighlightColor) => {
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
        note: null,
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

  // ─── Click detection on highlighted text through the text layer ───────────────
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleClick = (e: MouseEvent) => {
      // If user made an active text selection, do not trigger highlight click
      const currentSelection = window.getSelection();
      if (
        currentSelection &&
        !currentSelection.isCollapsed &&
        currentSelection.toString().trim()
      ) {
        return;
      }

      let targetNode: Node | null = e.target as Node;
      let pageEl: HTMLElement | null = null;
      let pageNumber: number | null = null;

      while (targetNode && targetNode !== container) {
        if (targetNode instanceof HTMLElement) {
          const attr = targetNode.getAttribute("data-page-number");
          if (attr !== null) {
            const parsed = parseInt(attr, 10);
            if (!isNaN(parsed)) {
              pageEl = targetNode;
              pageNumber = parsed;
              break;
            }
          }
        }
        targetNode = targetNode.parentNode;
      }

      if (!pageEl || pageNumber === null) return;

      const pageRect = pageEl.getBoundingClientRect();
      const clickX = (e.clientX - pageRect.left) / pageRect.width;
      const clickY = (e.clientY - pageRect.top) / pageRect.height;

      // Check if click coordinates fall within any highlight rect on this page
      const matched = highlights.find(
        (h) =>
          h.pageNumber === pageNumber &&
          h.rectangles.some(
            (r) =>
              clickX >= r.x &&
              clickX <= r.x + r.width &&
              clickY >= r.y &&
              clickY <= r.y + r.height
          )
      );

      if (matched) {
        setSelection(null);
        clearSelection();
        setContextMenu({
          highlightId: matched.id,
          position: { x: e.clientX, y: e.clientY },
        });
      }
    };

    container.addEventListener("click", handleClick);
    return () => {
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

  // Limit base width to avoid oversized rendering; scale multiplied on top
  const baseWidth = containerWidth > 0 ? Math.min(containerWidth - 32, 900) : 600;
  const pageWidth = Math.round(baseWidth * scale);

  return (
    <>
      <div
        ref={containerRef}
        className="flex-1 overflow-auto bg-stone-100 flex flex-col items-center py-6 px-4 min-h-0"
        id="pdf-reader-container"
      >
        <Document
          file={pdfUrl}
          onLoadSuccess={({ numPages }) => onPageCountLoaded(numPages)}
          onLoadError={onLoadError}
          loading={
            <div className="flex flex-col items-center justify-center gap-3 py-20 text-stone-400">
              <Loader2 className="w-8 h-8 animate-spin" />
              <p className="text-sm">Loading document…</p>
            </div>
          }
          error={
            <div className="flex flex-col items-center justify-center gap-2 py-20">
              <p className="text-sm text-red-600 font-medium">
                Failed to load PDF.
              </p>
              <p className="text-xs text-stone-400">
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

