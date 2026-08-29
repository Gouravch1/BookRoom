"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";
import { Loader2 } from "lucide-react";

// Use CDN worker compatible with pdfjs-dist version
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.mjs`;

interface PdfReaderProps {
  pdfUrl: string;
  currentPage: number;
  scale: number;
  onPageCountLoaded: (total: number) => void;
  onLoadError: (error: Error) => void;
}

export function PdfReader({
  pdfUrl,
  currentPage,
  scale,
  onPageCountLoaded,
  onLoadError,
}: PdfReaderProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState<number>(0);

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
            <p className="text-sm text-red-600 font-medium">Failed to load PDF.</p>
            <p className="text-xs text-stone-400">
              The file may be unavailable or your session may have expired.
            </p>
          </div>
        }
      >
        <Page
          pageNumber={currentPage}
          width={pageWidth}
          renderTextLayer={true}
          renderAnnotationLayer={true}
          className="shadow-lg rounded-sm overflow-hidden"
          loading={
            <div
              className="bg-white rounded shadow-lg flex items-center justify-center animate-pulse"
              style={{ width: pageWidth, height: Math.round(pageWidth * 1.414) }}
            >
              <Loader2 className="w-6 h-6 text-stone-300 animate-spin" />
            </div>
          }
        />
      </Document>
    </div>
  );
}
