"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { LibraryBookResponse } from "@/types/library";
import {
  BookOpen,
  Trash2,
  MoreVertical,
  Pencil,
  FileText,
  CheckCircle2,
  RotateCcw,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { getApiErrorMessage } from "@/lib/api-client";
import { libraryService } from "@/services/library.service";
import { bookService } from "@/services/book.service";
import { toast } from "@/components/ui/toaster";
import { EditBookDialog } from "@/components/library/EditBookDialog";

interface LibraryBookCardProps {
  item: LibraryBookResponse;
  isOwned: boolean;
  onRemoved: (bookId: number) => void;
  onUpdated: () => void;
}

export function LibraryBookCard({
  item,
  isOwned,
  onRemoved,
  onUpdated,
}: LibraryBookCardProps) {
  const router = useRouter();
  const [isRemoving, setIsRemoving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [editOpen, setEditOpen] = useState(false);

  const progress = item.progressPercent ?? 0;
  const currentPage = item.currentPage ?? 0;
  const totalPages = item.totalPages ?? 0;

  const isCompleted =
    totalPages > 0 &&
    (progress >= 100 || (currentPage >= totalPages && progress >= 99));

  const hasStarted =
    item.lastReadAt !== null || currentPage > 1 || progress > 0;

  async function handleRemove() {
    setIsRemoving(true);
    try {
      await libraryService.removeFromLibrary(item.bookId);
      onRemoved(item.bookId);
      toast({ title: "Removed from library" });
    } catch (err) {
      toast({ title: "Error", description: getApiErrorMessage(err), variant: "destructive" });
    } finally {
      setIsRemoving(false);
    }
  }

  async function handleDelete() {
    if (!confirm(`Delete "${item.title}" permanently? This cannot be undone.`)) return;
    setIsDeleting(true);
    try {
      await bookService.deleteBook(item.bookId);
      onRemoved(item.bookId);
      toast({ title: "Book deleted" });
    } catch (err) {
      toast({ title: "Error", description: getApiErrorMessage(err), variant: "destructive" });
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <>
      <div
        className="group relative flex flex-col rounded-xl overflow-hidden transition-all duration-300 cursor-pointer"
        style={{
          background: "var(--bg-card)",
          border: "1px solid var(--border-subtle)",
        }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLElement).style.border = "1px solid var(--border-default)";
          (e.currentTarget as HTMLElement).style.transform = "translateY(-2px)";
          (e.currentTarget as HTMLElement).style.boxShadow = "0 12px 32px rgba(0,0,0,0.4)";
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLElement).style.border = "1px solid var(--border-subtle)";
          (e.currentTarget as HTMLElement).style.transform = "translateY(0)";
          (e.currentTarget as HTMLElement).style.boxShadow = "none";
        }}
      >
        {/* Cover */}
        <div
          className="relative aspect-[3/4] overflow-hidden"
          onClick={() => router.push(`/reader/${item.bookId}`)}
        >
          {item.coverUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={item.coverUrl}
              alt={item.title}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
            />
          ) : (
            <div
              className="w-full h-full flex flex-col items-center justify-center gap-2"
              style={{
                background: "linear-gradient(135deg, var(--bg-raised) 0%, var(--bg-hover) 100%)",
              }}
            >
              <FileText className="w-9 h-9" style={{ color: "var(--text-muted)" }} />
              <span
                className="text-[10px] font-medium text-center px-3 leading-snug line-clamp-3"
                style={{ color: "var(--text-muted)" }}
              >
                {item.title}
              </span>
            </div>
          )}

          {/* Badges */}
          <div className="absolute top-2 left-2 flex flex-col gap-1 items-start">
            {isOwned && (
              <span
                className="text-[9px] font-bold px-2 py-0.5 rounded-full"
                style={{
                  background: "rgba(232,160,69,0.18)",
                  color: "var(--accent)",
                  border: "1px solid rgba(232,160,69,0.3)",
                  backdropFilter: "blur(8px)",
                }}
              >
                Yours
              </span>
            )}
            {isCompleted && (
              <span
                className="text-[9px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1"
                style={{
                  background: "var(--emerald-dim)",
                  color: "var(--emerald)",
                  border: "1px solid rgba(52,211,153,0.3)",
                  backdropFilter: "blur(8px)",
                }}
              >
                <CheckCircle2 className="w-2.5 h-2.5" />
                Done
              </span>
            )}
          </div>

          {/* Hover overlay read prompt */}
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
              {isCompleted ? "Read again" : hasStarted ? "Continue" : "Start reading"}
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
              {item.title}
            </h3>
            {item.author && (
              <p className="text-[10px] mt-0.5 truncate" style={{ color: "var(--text-muted)" }}>
                {item.author}
              </p>
            )}
          </div>

          {/* Progress bar */}
          {totalPages > 0 && (
            <div className="flex flex-col gap-1">
              <div
                className="h-1 rounded-full overflow-hidden w-full"
                style={{ background: "var(--bg-hover)" }}
              >
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${isCompleted ? 100 : progress}%`,
                    background: isCompleted
                      ? "var(--emerald)"
                      : "linear-gradient(90deg, var(--accent-hover), var(--accent))",
                  }}
                />
              </div>
              <div className="flex justify-between text-[9px]" style={{ color: "var(--text-muted)" }}>
                {isCompleted ? (
                  <span style={{ color: "var(--emerald)" }}>Completed</span>
                ) : (
                  <span>{hasStarted ? `Pg ${currentPage}` : "Not started"}</span>
                )}
                <span>{Math.round(progress)}%</span>
              </div>
            </div>
          )}

          {/* Actions row */}
          <div className="flex items-center gap-1 mt-auto pt-1">
            <button
              className="flex-1 h-7 rounded-lg text-[10px] font-semibold flex items-center justify-center gap-1 transition-all duration-200"
              style={{
                background: isCompleted ? "var(--bg-hover)" : "var(--accent-dim)",
                color: isCompleted ? "var(--text-secondary)" : "var(--accent)",
                border: `1px solid ${isCompleted ? "var(--border-default)" : "rgba(232,160,69,0.2)"}`,
              }}
              onClick={() =>
                router.push(
                  isCompleted
                    ? `/reader/${item.bookId}?reset=1`
                    : `/reader/${item.bookId}`
                )
              }
              id={`read-book-${item.bookId}`}
            >
              {isCompleted ? (
                <>
                  <RotateCcw className="w-2.5 h-2.5" />
                  Re-read
                </>
              ) : (
                <>
                  <BookOpen className="w-2.5 h-2.5" />
                  {hasStarted ? "Continue" : "Read"}
                </>
              )}
            </button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  className="h-7 w-7 rounded-lg flex items-center justify-center shrink-0 transition-all duration-200"
                  style={{ background: "var(--bg-hover)", border: "1px solid var(--border-subtle)" }}
                  id={`book-menu-${item.bookId}`}
                >
                  <MoreVertical className="w-3 h-3" style={{ color: "var(--text-muted)" }} />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {hasStarted && (
                  <>
                    <DropdownMenuItem
                      onClick={() => router.push(`/reader/${item.bookId}?reset=1`)}
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      Restart from page 1
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                  </>
                )}
                {isOwned && (
                  <>
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
                    <DropdownMenuSeparator />
                  </>
                )}
                <DropdownMenuItem
                  onClick={handleRemove}
                  disabled={isRemoving}
                  className={isOwned ? "" : "text-red-400 focus:bg-red-500/10 focus:text-red-400"}
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  {isRemoving ? "Removing…" : "Remove from library"}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      {isOwned && (
        <EditBookDialog
          open={editOpen}
          onClose={() => setEditOpen(false)}
          bookId={item.bookId}
          initialTitle={item.title}
          initialAuthor={item.author ?? ""}
          onUpdated={onUpdated}
        />
      )}
    </>
  );
}
