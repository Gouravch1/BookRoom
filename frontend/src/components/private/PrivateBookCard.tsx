"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { BookResponse } from "@/types/book";
import { bookService } from "@/services/book.service";
import { getApiErrorMessage } from "@/lib/api-client";
import { toast } from "@/components/ui/toaster";
import { EditBookDialog } from "@/components/library/EditBookDialog";
import {
  BookOpen,
  Trash2,
  Pencil,
  FileText,
  BookMarked,
  MoreVertical,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface PrivateBookCardProps {
  book: BookResponse;
  onDeleted: (id: number) => void;
  onUpdated: () => void;
}

export function PrivateBookCard({
  book,
  onDeleted,
  onUpdated,
}: PrivateBookCardProps) {
  const router = useRouter();
  const [editOpen, setEditOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  async function handleDelete() {
    if (
      !confirm(
        `Delete "${book.title}" permanently? This cannot be undone.`
      )
    )
      return;
    setIsDeleting(true);
    try {
      await bookService.deleteBook(book.id);
      onDeleted(book.id);
      toast({ title: "Book deleted" });
    } catch (err) {
      toast({
        title: "Error",
        description: getApiErrorMessage(err),
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <>
      <div
        className="group relative flex flex-col rounded-xl overflow-hidden transition-all duration-300"
        style={{
          background: "var(--bg-card)",
          border: "1px solid var(--border-subtle)",
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
          className="relative aspect-[3/4] overflow-hidden cursor-pointer"
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

          {/* Private badge */}
          <div className="absolute top-2 left-2">
            <span
              className="text-[9px] font-bold px-2 py-0.5 rounded-full"
              style={{
                background: "rgba(232,160,69,0.18)",
                color: "var(--accent)",
                border: "1px solid rgba(232,160,69,0.3)",
                backdropFilter: "blur(8px)",
              }}
            >
              Private
            </span>
          </div>

          {/* Hover overlay */}
          <div
            className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200"
            style={{
              background: "rgba(14,14,15,0.6)",
              backdropFilter: "blur(4px)",
            }}
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
              Read
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
              id={`read-private-book-${book.id}`}
            >
              <BookOpen className="w-2.5 h-2.5" />
              Read
            </button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  className="h-7 w-7 rounded-lg flex items-center justify-center shrink-0 transition-all duration-200"
                  style={{
                    background: "var(--bg-hover)",
                    border: "1px solid var(--border-subtle)",
                  }}
                  id={`private-book-menu-${book.id}`}
                >
                  <MoreVertical
                    className="w-3 h-3"
                    style={{ color: "var(--text-muted)" }}
                  />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setEditOpen(true)}>
                  <Pencil className="w-3.5 h-3.5" />
                  Edit details
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="text-red-400 focus:bg-red-500/10 focus:text-red-400"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  {isDeleting ? "Deleting…" : "Delete book"}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      <EditBookDialog
        open={editOpen}
        onClose={() => setEditOpen(false)}
        bookId={book.id}
        initialTitle={book.title}
        initialAuthor={book.author ?? ""}
        onUpdated={onUpdated}
      />
    </>
  );
}
