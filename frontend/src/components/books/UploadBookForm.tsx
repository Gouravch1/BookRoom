"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { bookService } from "@/services/book.service";
import { libraryService } from "@/services/library.service";
import { getApiErrorMessage } from "@/lib/api-client";
import { PdfDropzone } from "@/components/books/PdfDropzone";
import { ArrowLeft, CheckCircle, Loader2, AlertCircle } from "lucide-react";

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

    const progressInterval = setInterval(() => {
      setUploadProgress((p) => Math.min(p + 10, 85));
    }, 300);

    try {
      const uploaded = await bookService.uploadBook({
        file,
        title: title.trim(),
        author: author.trim() || undefined,
      });

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

  const inputStyle = {
    background: "var(--bg-base)",
    border: "1px solid var(--border-default)",
    borderRadius: "var(--radius-md)",
    color: "var(--text-primary)",
    height: "44px",
    padding: "0 16px",
    fontSize: "14px",
    width: "100%",
  };

  if (success) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center gap-4 animate-scale-in">
        <div
          className="w-16 h-16 rounded-2xl flex items-center justify-center"
          style={{
            background: "var(--emerald-dim)",
            border: "1px solid rgba(52,211,153,0.3)",
            boxShadow: "0 0 30px rgba(52,211,153,0.15)",
          }}
        >
          <CheckCircle className="w-8 h-8" style={{ color: "var(--emerald)" }} />
        </div>
        <div>
          <h2 className="font-serif text-2xl mb-1" style={{ color: "var(--text-primary)" }}>
            Book uploaded!
          </h2>
          <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
            Redirecting to your library…
          </p>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      {/* File */}
      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium" style={{ color: "var(--text-secondary)" }}>
          PDF File
        </label>
        <PdfDropzone
          selectedFile={file}
          onFileSelected={setFile}
          onClear={() => setFile(null)}
        />
      </div>

      {/* Title */}
      <div className="flex flex-col gap-2">
        <label
          htmlFor="book-title"
          className="text-sm font-medium"
          style={{ color: "var(--text-secondary)" }}
        >
          Title <span style={{ color: "var(--accent)" }}>*</span>
        </label>
        <input
          id="book-title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Enter book title"
          required
          style={inputStyle}
        />
      </div>

      {/* Author */}
      <div className="flex flex-col gap-2">
        <label
          htmlFor="book-author"
          className="text-sm font-medium"
          style={{ color: "var(--text-secondary)" }}
        >
          Author{" "}
          <span className="text-xs font-normal" style={{ color: "var(--text-muted)" }}>
            (optional)
          </span>
        </label>
        <input
          id="book-author"
          value={author}
          onChange={(e) => setAuthor(e.target.value)}
          placeholder="e.g. George Orwell"
          style={inputStyle}
        />
      </div>

      {/* Progress */}
      {isLoading && (
        <div className="flex flex-col gap-2 animate-fade-in">
          <div
            className="h-1.5 w-full rounded-full overflow-hidden"
            style={{ background: "var(--bg-hover)" }}
          >
            <div
              className="h-full rounded-full transition-all duration-300"
              style={{
                width: `${uploadProgress}%`,
                background: "linear-gradient(90deg, var(--accent-hover), var(--accent))",
              }}
            />
          </div>
          <p className="text-xs text-center" style={{ color: "var(--text-muted)" }}>
            Uploading… {uploadProgress}%
          </p>
        </div>
      )}

      {/* Error */}
      {error && (
        <div
          className="flex items-start gap-2.5 rounded-xl px-4 py-3 text-sm animate-scale-in"
          style={{
            background: "var(--red-dim)",
            border: "1px solid rgba(248,113,113,0.2)",
            color: "var(--red)",
          }}
        >
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          {error}
        </div>
      )}

      {/* Buttons */}
      <div className="flex gap-3 pt-1">
        <Link href="/library" className="flex-1">
          <button
            type="button"
            className="w-full h-11 rounded-xl text-sm font-medium transition-all duration-200"
            style={{
              background: "var(--bg-raised)",
              border: "1px solid var(--border-default)",
              color: "var(--text-secondary)",
            }}
          >
            <span className="flex items-center justify-center gap-1.5">
              <ArrowLeft className="w-4 h-4" />
              Cancel
            </span>
          </button>
        </Link>
        <button
          type="submit"
          disabled={isLoading || !file}
          id="upload-submit"
          className="flex-1 h-11 rounded-xl text-sm font-semibold transition-all duration-200 flex items-center justify-center gap-2"
          style={{
            background: isLoading || !file ? "var(--bg-hover)" : "var(--accent)",
            color: isLoading || !file ? "var(--text-muted)" : "#0e0e0f",
            cursor: isLoading || !file ? "not-allowed" : "pointer",
            boxShadow: isLoading || !file ? "none" : "0 4px 16px var(--accent-glow)",
          }}
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Uploading…
            </>
          ) : (
            "Upload Book"
          )}
        </button>
      </div>
    </form>
  );
}
