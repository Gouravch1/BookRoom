"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { LibraryBookResponse } from "@/types/library";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
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
      <div className="group relative flex flex-col bg-white border border-stone-200 rounded-xl overflow-hidden hover:border-stone-300 hover:shadow-md transition-all duration-200">
        {/* Cover / thumbnail */}
        <div className="relative aspect-[3/4] bg-stone-100 overflow-hidden">
          {item.coverUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={item.coverUrl}
              alt={item.title}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center gap-2 bg-gradient-to-br from-stone-100 to-stone-200">
              <FileText className="w-10 h-10 text-stone-300" />
              <span className="text-xs text-stone-400 font-medium text-center px-3 leading-tight">
                {item.title}
              </span>
            </div>
          )}

          {/* Badges container */}
          <div className="absolute top-2 left-2 flex flex-col gap-1 items-start">
            {isOwned && (
              <span className="bg-stone-900/80 text-white text-[10px] font-medium px-1.5 py-0.5 rounded-full backdrop-blur-sm">
                Yours
              </span>
            )}
            {isCompleted && (
              <span className="bg-emerald-600/90 text-white text-[10px] font-semibold px-2 py-0.5 rounded-full backdrop-blur-sm flex items-center gap-1 shadow-sm">
                <CheckCircle2 className="w-3 h-3" />
                Completed
              </span>
            )}
          </div>
        </div>

        {/* Info */}
        <div className="p-3 flex flex-col gap-2 flex-1">
          <div>
            <h3 className="text-sm font-semibold text-stone-900 leading-snug line-clamp-2">
              {item.title}
            </h3>
            {item.author && (
              <p className="text-xs text-stone-500 mt-0.5 truncate">{item.author}</p>
            )}
          </div>

          {/* Progress */}
          {totalPages > 0 && (
            <div className="flex flex-col gap-1">
              <Progress
                value={isCompleted ? 100 : progress}
                className={`h-1.5 ${isCompleted ? "[&>div]:bg-emerald-600" : ""}`}
              />
              <div className="flex justify-between text-[10px] text-stone-500">
                {isCompleted ? (
                  <>
                    <span className="font-medium text-emerald-600 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> Completed
                    </span>
                    <span className="font-semibold text-emerald-600">100%</span>
                  </>
                ) : (
                  <>
                    <span>
                      {hasStarted ? `Page ${currentPage}` : "Not started"}
                    </span>
                    <span>{Math.round(progress)}%</span>
                  </>
                )}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center gap-1.5 mt-auto pt-1">
            {isCompleted ? (
              <Button
                size="sm"
                variant="outline"
                className="flex-1 h-8 text-xs font-medium border-stone-300 hover:bg-stone-100 text-stone-800"
                onClick={() => router.push(`/reader/${item.bookId}?reset=1`)}
                id={`read-again-${item.bookId}`}
              >
                <RotateCcw className="w-3 h-3 mr-1 text-stone-500" />
                Read Again
              </Button>
            ) : (
              <Button
                size="sm"
                className="flex-1 h-8 text-xs"
                onClick={() => router.push(`/reader/${item.bookId}`)}
                id={`read-book-${item.bookId}`}
              >
                <BookOpen className="w-3 h-3 mr-1" />
                {hasStarted ? "Continue" : "Start Reading"}
              </Button>
            )}

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 shrink-0"
                  id={`book-menu-${item.bookId}`}
                >
                  <MoreVertical className="w-3.5 h-3.5" />
                </Button>
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
                      className="text-red-600 focus:bg-red-50 focus:text-red-700"
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
                  className={isOwned ? "" : "text-red-600 focus:bg-red-50 focus:text-red-700"}
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
