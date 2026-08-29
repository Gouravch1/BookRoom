"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { bookService } from "@/services/book.service";
import { libraryService } from "@/services/library.service";
import { getApiErrorMessage } from "@/lib/api-client";
import { PdfDropzone } from "@/components/books/PdfDropzone";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, CheckCircle, Loader2 } from "lucide-react";

export function UploadBookForm() {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!file) { setError("Please select a PDF file."); return; }
    if (!title.trim()) { setError("Title is required."); return; }

    setIsLoading(true);
    setUploadProgress(0);

    // Simulate progress for UX
    const progressInterval = setInterval(() => {
      setUploadProgress((p) => Math.min(p + 10, 85));
    }, 300);

    try {
      const uploaded = await bookService.uploadBook({
        file,
        title: title.trim(),
        author: author.trim() || undefined,
      });

      // Add to own library automatically
      try {
        await libraryService.addToLibrary(uploaded.id);
      } catch {
        // if already in library, ignore
      }

      clearInterval(progressInterval);
      setUploadProgress(100);
      setSuccess(true);

      setTimeout(() => {
        router.push("/library");
      }, 1200);
    } catch (err) {
      clearInterval(progressInterval);
      setUploadProgress(0);
      setError(getApiErrorMessage(err));
      setIsLoading(false);
    }
  }

  if (success) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center gap-3">
        <div className="w-14 h-14 rounded-full bg-green-50 flex items-center justify-center">
          <CheckCircle className="w-7 h-7 text-green-600" />
        </div>
        <h2 className="text-lg font-semibold text-stone-900">Book uploaded!</h2>
        <p className="text-sm text-stone-500">Redirecting to your library…</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      {/* File */}
      <div className="flex flex-col gap-2">
        <Label>PDF File</Label>
        <PdfDropzone
          selectedFile={file}
          onFileSelected={setFile}
          onClear={() => setFile(null)}
        />
      </div>

      {/* Title */}
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="book-title">Title <span className="text-red-500">*</span></Label>
        <Input
          id="book-title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Enter book title"
          required
        />
      </div>

      {/* Author */}
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="book-author">Author</Label>
        <Input
          id="book-author"
          value={author}
          onChange={(e) => setAuthor(e.target.value)}
          placeholder="Optional"
        />
      </div>

      {/* Upload progress */}
      {isLoading && (
        <div className="flex flex-col gap-1.5">
          <div className="h-1.5 w-full rounded-full bg-stone-100 overflow-hidden">
            <div
              className="h-full bg-stone-700 rounded-full transition-all duration-300"
              style={{ width: `${uploadProgress}%` }}
            />
          </div>
          <p className="text-xs text-stone-500 text-center">
            Uploading… {uploadProgress}%
          </p>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="rounded-md bg-red-50 border border-red-200 px-3 py-2 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="flex gap-2">
        <Link href="/library" className="flex-1">
          <Button type="button" variant="outline" className="w-full">
            <ArrowLeft className="w-4 h-4" />
            Cancel
          </Button>
        </Link>
        <Button
          type="submit"
          disabled={isLoading || !file}
          className="flex-1"
          id="upload-submit"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Uploading…
            </>
          ) : (
            "Upload Book"
          )}
        </Button>
      </div>
    </form>
  );
}
