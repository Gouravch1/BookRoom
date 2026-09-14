"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { BookResponse } from "@/types/book";
import { libraryService } from "@/services/library.service";
import { getApiErrorMessage } from "@/lib/api-client";
import { toast } from "@/components/ui/toaster";
import {
  BookOpen,
  BookPlus,
  FileText,
  CheckCircle2,
  Languages,
  BookMarked,
} from "lucide-react";

interface FreeBookCardProps {
  book: BookResponse;
  inLibrary?: boolean;
}

export function FreeBookCard({ book, inLibrary: initialInLibrary = false }: FreeBookCardProps) {
  const router = useRouter();
  const [inLibrary, setInLibrary] = useState(initialInLibrary);
  const [isAdding, setIsAdding] = useState(false);

  async function handleAddToLibrary(e: React.MouseEvent) {
    e.stopPropagation();
    if (inLibrary || isAdding) return;
    setIsAdding(true);
    try {
      await libraryService.addToLibrary(book.id);
      setInLibrary(true);
      toast({ title: "Added to library", description: `"${book.title}" is now in your library.` });
    } catch (err) {
      const msg = getApiErrorMessage(err);
      // 409 = already in library — treat as success
      if (msg.includes("already") || msg.includes("409") || msg.includes("exists")) {
        setInLibrary(true);
        toast({ title: "Already in library" });
      } else {
        toast({ title: "Error", description: msg, variant: "destructive" });
      }
    } finally {
      setIsAdding(false);
    }
  }

  return (
    <div
      className="group relative flex flex-col rounded-xl overflow-hidden transition-all duration-300"
      style={{
        background: "var(--bg-card)",
        border: "1px solid var(--border-subtle)",
        cursor: "pointer",
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLElement).style.border =
          "1px solid var(--border-default)";
        (e.currentTarget as HTMLElement).style.transform = "translateY(-2px)";
        (e.currentTarget as HTMLElement).style.boxShadow =
          "0 12px 32px rgba(0,0,0,0.4)";
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLElement).style.border =
          "1px solid var(--border-subtle)";
        (e.currentTarget as HTMLElement).style.transform = "translateY(0)";
        (e.currentTarget as HTMLElement).style.boxShadow = "none";
      }}
    >
      {/* Cover */}
      <div
        className="relative aspect-[3/4] overflow-hidden"
        onClick={() => router.push(`/reader/${book.id}`)}
      >
        {book.coverUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={book.coverUrl}
            alt={book.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
          />
        ) : (
          <div
            className="w-full h-full flex flex-col items-center justify-center gap-2 px-3"
            style={{
              background:
                "linear-gradient(135deg, var(--bg-raised) 0%, var(--bg-hover) 100%)",
            }}
          >
            <FileText
              className="w-9 h-9 shrink-0"
              style={{ color: "var(--text-muted)" }}
            />
            <span
              className="text-[10px] font-medium text-center leading-snug line-clamp-3"
              style={{ color: "var(--text-muted)" }}
            >
              {book.title}
            </span>
          </div>
        )}

        {/* Badges */}
        <div className="absolute top-2 left-2 flex flex-col gap-1 items-start">
          <span
            className="text-[9px] font-bold px-2 py-0.5 rounded-full"
            style={{
              background: "rgba(52,211,153,0.18)",
              color: "var(--emerald)",
              border: "1px solid rgba(52,211,153,0.3)",
              backdropFilter: "blur(8px)",
            }}
          >
            Free
          </span>
          {book.language && (
            <span
              className="text-[9px] font-medium px-1.5 py-0.5 rounded-full flex items-center gap-0.5"
              style={{
                background: "rgba(255,255,255,0.08)",
                color: "var(--text-muted)",
                backdropFilter: "blur(8px)",
              }}
            >
              <Languages className="w-2 h-2" />
              {book.language}
            </span>
          )}
        </div>

        {/* Hover overlay */}
        <div
          className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200"
          style={{ background: "rgba(14,14,15,0.6)", backdropFilter: "blur(4px)" }}
        >
          <div
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold"
            style={{
              background: "var(--accent)",
              color: "#0e0e0f",
              boxShadow: "0 4px 16px var(--accent-glow)",
            }}
          >
            <BookOpen className="w-3.5 h-3.5" />
            Read now
          </div>
        </div>
      </div>

      {/* Info */}
      <div className="p-3 flex flex-col gap-2 flex-1">
        <div>
          <h3
            className="text-xs font-semibold leading-snug line-clamp-2"
            style={{ color: "var(--text-primary)" }}
          >
            {book.title}
          </h3>
          {book.author && (
            <p
              className="text-[10px] mt-0.5 truncate"
              style={{ color: "var(--text-muted)" }}
            >
              {book.author}
            </p>
          )}
          {book.totalPages && (
            <p
              className="text-[9px] mt-1 flex items-center gap-0.5"
              style={{ color: "var(--text-muted)" }}
            >
              <BookMarked className="w-2.5 h-2.5" />
              {book.totalPages} pages
            </p>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1 mt-auto pt-1">
          <button
            className="flex-1 h-7 rounded-lg text-[10px] font-semibold flex items-center justify-center gap-1 transition-all duration-200"
            style={{
              background: "var(--accent-dim)",
              color: "var(--accent)",
              border: "1px solid rgba(232,160,69,0.2)",
            }}
            onClick={() => router.push(`/reader/${book.id}`)}
            id={`read-free-book-${book.id}`}
          >
            <BookOpen className="w-2.5 h-2.5" />
            Read
          </button>

          <button
            className="h-7 px-2 rounded-lg text-[10px] font-medium flex items-center justify-center gap-1 transition-all duration-200 shrink-0"
            style={{
              background: inLibrary ? "var(--emerald-dim)" : "var(--bg-hover)",
              color: inLibrary ? "var(--emerald)" : "var(--text-secondary)",
              border: `1px solid ${inLibrary ? "rgba(52,211,153,0.3)" : "var(--border-subtle)"}`,
              cursor: inLibrary ? "default" : isAdding ? "wait" : "pointer",
              opacity: isAdding ? 0.7 : 1,
            }}
            onClick={handleAddToLibrary}
            disabled={inLibrary || isAdding}
            id={`add-library-${book.id}`}
            title={inLibrary ? "In your library" : "Add to library"}
          >
            {inLibrary ? (
              <CheckCircle2 className="w-3 h-3" />
            ) : (
              <BookPlus className="w-3 h-3" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
