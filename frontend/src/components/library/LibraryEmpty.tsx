"use client";

import Link from "next/link";
import { Upload, BookOpen } from "lucide-react";

export function LibraryEmpty() {
  return (
    <div className="flex flex-col items-center justify-center py-24 px-4 text-center animate-fade-up">
      {/* Glow ring icon */}
      <div className="relative mb-7">
        <div
          className="w-20 h-20 rounded-2xl flex items-center justify-center"
          style={{
            background: "var(--accent-dim)",
            border: "1px solid rgba(232,160,69,0.2)",
            boxShadow: "0 0 40px var(--accent-glow)",
          }}
        >
          <BookOpen className="w-9 h-9" style={{ color: "var(--accent)" }} />
        </div>
      </div>

      <h2
        className="font-serif text-2xl sm:text-3xl mb-3"
        style={{ color: "var(--text-primary)" }}
      >
        Your library awaits
      </h2>
      <p
        className="text-sm sm:text-base max-w-xs mb-8 leading-relaxed"
        style={{ color: "var(--text-secondary)" }}
      >
        Upload your first PDF and start building your private reading sanctuary.
      </p>

      <Link href="/books/upload">
        <button
          id="upload-first-book"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold transition-all duration-200"
          style={{
            background: "var(--accent)",
            color: "#0e0e0f",
            boxShadow: "0 4px 20px var(--accent-glow)",
          }}
        >
          <Upload className="w-4 h-4" />
          Upload your first book
        </button>
      </Link>
    </div>
  );
}
