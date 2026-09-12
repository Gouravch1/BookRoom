"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { UploadBookForm } from "@/components/books/UploadBookForm";
import { BookOpen, ArrowLeft } from "lucide-react";

export default function UploadPage() {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.replace("/login");
    }
  }, [authLoading, isAuthenticated, router]);

  if (authLoading) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ background: "var(--bg-base)" }}
      >
        <div
          className="w-7 h-7 border-2 rounded-full animate-spin"
          style={{ borderColor: "var(--border-strong)", borderTopColor: "var(--accent)" }}
        />
      </div>
    );
  }

  if (!isAuthenticated) return null;

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "var(--bg-base)" }}>
      {/* Header */}
      <header
        className="glass sticky top-0 z-10"
        style={{ borderBottom: "1px solid var(--border-subtle)" }}
      >
        <div className="max-w-2xl mx-auto px-4 sm:px-6 flex items-center justify-between h-14">
          <div className="flex items-center gap-2.5">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ background: "var(--accent)", boxShadow: "0 3px 10px var(--accent-glow)" }}
            >
              <BookOpen className="w-4 h-4" style={{ color: "#0e0e0f" }} />
            </div>
            <span className="font-semibold tracking-tight" style={{ color: "var(--text-primary)" }}>
              BookRoom
            </span>
          </div>
          <Link
            href="/library"
            className="flex items-center gap-1.5 text-sm font-medium transition-colors"
            style={{ color: "var(--text-secondary)" }}
          >
            <ArrowLeft className="w-4 h-4" />
            Library
          </Link>
        </div>
      </header>

      <main className="flex-1 max-w-2xl mx-auto w-full px-4 sm:px-6 py-10">
        <div className="mb-8 animate-fade-up">
          <h1
            className="font-serif text-3xl sm:text-4xl mb-2"
            style={{ color: "var(--text-primary)" }}
          >
            Upload a book
          </h1>
          <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
            Upload a PDF to your private library. Only you will be able to read it.
          </p>
        </div>

        <div
          className="rounded-2xl p-6 sm:p-8 animate-fade-up"
          style={{
            background: "var(--bg-card)",
            border: "1px solid var(--border-subtle)",
            animationDelay: "60ms",
          }}
        >
          <UploadBookForm />
        </div>
      </main>
    </div>
  );
}
