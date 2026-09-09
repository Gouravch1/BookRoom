"use client";

import { useEffect, useState, useCallback, use } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { useReader } from "@/hooks/useReader";
import { usePdfHighlights } from "@/hooks/usePdfHighlights";
import { ReaderHeader } from "@/components/reader/ReaderHeader";
import { ReaderControls } from "@/components/reader/ReaderControls";
import { ReaderTools } from "@/components/reader/ReaderTools";
import { highlightService } from "@/services/highlight.service";
import { NotesPanel } from "@/components/reader/NotesPanel";
import dynamic from "next/dynamic";
import { Button } from "@/components/ui/button";
import { ArrowLeft, BookOpen, Loader2 } from "lucide-react";
import Link from "next/link";
import { Toaster as SonnerToaster } from "sonner";
import type { Highlight } from "@/types/highlight";

const PdfReader = dynamic(
  () => import("@/components/reader/PdfReader").then((m) => m.PdfReader),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    ),
  }
);

const ZOOM_STEP = 0.15;
const MIN_SCALE = 0.5;
const MAX_SCALE = 2.5;
const DEFAULT_SCALE = 1.0;

interface ReaderPageProps {
  params: Promise<{ bookId: string }>;
}

export default function ReaderPage({ params }: ReaderPageProps) {
  const { bookId: bookIdStr } = use(params);
  const bookId = parseInt(bookIdStr, 10);

  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const router = useRouter();

  const {
    book,
    progress,
    currentPage,
    isLoading,
    error,
    errorStatus,
    initialize,
    navigatePage,
  } = useReader(bookId);

  // Unified highlights state (single source of truth for PDF overlay & Notes panel)
  const {
    highlights,
    addHighlight,
    removeHighlight,
    changeColor,
    updateNote,
  } = usePdfHighlights(bookId);

  const [scale, setScale] = useState(DEFAULT_SCALE);
  const [pdfTotalPages, setPdfTotalPages] = useState(0);
  const [activePanel, setActivePanel] = useState<"highlights" | "notes" | null>(null);
  const [focusedHighlightId, setFocusedHighlightId] = useState<number | null>(null);

  // Auth guard
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.replace("/login");
    }
  }, [authLoading, isAuthenticated, router]);

  // Initialize reader & prefetch highlights in parallel when authenticated
  useEffect(() => {
    if (isAuthenticated && !isNaN(bookId)) {
      initialize();
      highlightService.prefetchHighlights(bookId);
    }
  }, [isAuthenticated, bookId, initialize]);

  const handleZoomIn = useCallback(() => {
    setScale((s) => Math.min(s + ZOOM_STEP, MAX_SCALE));
  }, []);

  const handleZoomOut = useCallback(() => {
    setScale((s) => Math.max(s - ZOOM_STEP, MIN_SCALE));
  }, []);

  const handleFullscreen = useCallback(() => {
    const el = document.getElementById("reader-fullscreen-target");
    if (!el) return;
    if (!document.fullscreenElement) {
      el.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen();
    }
  }, []);

  const handlePageCountLoaded = useCallback(
    (total: number) => {
      setPdfTotalPages(total);
    },
    []
  );

  const handlePdfLoadError = useCallback((err: Error) => {
    console.error("PDF load error:", err);
  }, []);

  // Jump to page & focus highlight when clicked in Highlights or Notes panel
  const handleSelectHighlight = useCallback(
    (highlight: Highlight) => {
      navigatePage(highlight.pageNumber);
      setFocusedHighlightId(highlight.id);
    },
    [navigatePage]
  );

  const handleTogglePanel = useCallback((panel: "highlights" | "notes") => {
    setActivePanel((curr) => (curr === panel ? null : panel));
  }, []);


  const totalPages = book?.totalPages ?? pdfTotalPages;

  // Loading — auth check
  if (authLoading) {
    return (
      <div className="min-h-screen bg-stone-100 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-stone-300" />
      </div>
    );
  }

  if (!isAuthenticated) return null;

  // Loading — reader data
  if (isLoading) {
    return (
      <div className="min-h-screen bg-stone-100 flex flex-col items-center justify-center gap-3 text-stone-500">
        <div className="w-12 h-12 rounded-2xl bg-white shadow-sm flex items-center justify-center mb-2">
          <BookOpen className="w-6 h-6 text-stone-400" />
        </div>
        <Loader2 className="w-5 h-5 animate-spin" />
        <p className="text-sm">Opening your reading room…</p>
      </div>
    );
  }

  // Error states
  if (error) {
    return (
      <div className="min-h-screen bg-stone-100 flex flex-col items-center justify-center gap-4 p-6 text-center">
        <div className="w-12 h-12 rounded-2xl bg-white shadow-sm flex items-center justify-center">
          <BookOpen className="w-6 h-6 text-stone-300" />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-stone-800 mb-1">
            {errorStatus === 403
              ? "Access denied"
              : errorStatus === 404
              ? "Book not found"
              : "Unable to open this book"}
          </h2>
          <p className="text-sm text-stone-500 max-w-xs">
            {errorStatus === 403
              ? "You don't have permission to read this book."
              : errorStatus === 404
              ? "This book doesn't exist or has been removed."
              : error}
          </p>
        </div>
        <Link href="/library">
          <Button variant="outline">
            <ArrowLeft className="w-4 h-4" />
            Back to Library
          </Button>
        </Link>
      </div>
    );
  }

  if (!book) return null;

  return (
    <div
      id="reader-fullscreen-target"
      className="h-screen flex flex-col bg-stone-100 overflow-hidden"
    >
      <SonnerToaster richColors position="top-right" />

      {/* Header */}
      <ReaderHeader book={book} progress={progress} currentPage={currentPage} />

      {/* Body: PDF + Notes panel + sidebar tools */}
      <div className="flex-1 flex min-h-0 relative overflow-hidden">
        {/* PDF viewer */}
        <PdfReader
          pdfUrl={book.pdfUrl}
          bookId={bookId}
          currentPage={currentPage}
          scale={scale}
          focusedHighlightId={focusedHighlightId}
          onClearFocusedHighlight={() => setFocusedHighlightId(null)}
          highlights={highlights}
          addHighlight={addHighlight}
          removeHighlight={removeHighlight}
          changeColor={changeColor}
          updateNote={updateNote}
          onPageCountLoaded={handlePageCountLoaded}
          onLoadError={handlePdfLoadError}
        />

        {/* Highlights & Notes Panel */}
        <NotesPanel
          highlights={highlights}
          isOpen={activePanel !== null}
          activeTab={activePanel ?? "highlights"}
          onTabChange={(tab) => setActivePanel(tab)}
          currentPage={currentPage}
          onClose={() => setActivePanel(null)}
          onSelectHighlight={handleSelectHighlight}
          onDeleteHighlight={removeHighlight}
          onDeleteNote={(id) => updateNote(id, null)}
        />

        {/* Tools sidebar (desktop) */}
        <div className="hidden sm:flex">
          <ReaderTools
            activePanel={activePanel}
            onTogglePanel={handleTogglePanel}
          />
        </div>
      </div>

      {/* Bottom controls */}
      <ReaderControls
        currentPage={currentPage}
        totalPages={totalPages}
        scale={scale}
        onPrev={() => navigatePage(currentPage - 1)}
        onNext={() => navigatePage(currentPage + 1)}
        onZoomIn={handleZoomIn}
        onZoomOut={handleZoomOut}
        onFullscreen={handleFullscreen}
      />
    </div>
  );
}

