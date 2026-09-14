"use client";

import { useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { AppHeader } from "@/components/shared/AppHeader";
import { UploadBookForm } from "@/components/books/UploadBookForm";

function UploadPageContent() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const fromParam = searchParams.get("from");

  const isAdmin = user?.role === "ADMIN";
  const isFromAdmin = fromParam === "admin" && isAdmin;
  const redirectTo = isFromAdmin
    ? "/admin"
    : fromParam === "private"
    ? "/private"
    : "/library";

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
          style={{
            borderColor: "var(--border-strong)",
            borderTopColor: "var(--accent)",
          }}
        />
      </div>
    );
  }

  if (!isAuthenticated) return null;

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ background: "var(--bg-base)" }}
    >
      <AppHeader />

      <main className="flex-1 max-w-2xl mx-auto w-full px-4 sm:px-6 py-10">
        <div className="mb-8 animate-fade-up">
          <h1
            className="font-serif text-3xl sm:text-4xl mb-2"
            style={{ color: "var(--text-primary)" }}
          >
            {isFromAdmin ? "Publish a Free Book" : "Upload a book"}
          </h1>
          <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
            {isFromAdmin
              ? "Publish a new book to the public Free Books feed for all BookRoom readers."
              : "Upload a PDF to your private collection. Only you will be able to read it."}
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
          <UploadBookForm redirectTo={redirectTo} />
        </div>
      </main>
    </div>
  );
}

export default function UploadPage() {
  return (
    <Suspense
      fallback={
        <div
          className="min-h-screen flex items-center justify-center"
          style={{ background: "var(--bg-base)" }}
        >
          <div
            className="w-7 h-7 border-2 rounded-full animate-spin"
            style={{
              borderColor: "var(--border-strong)",
              borderTopColor: "var(--accent)",
            }}
          />
        </div>
      }
    >
      <UploadPageContent />
    </Suspense>
  );
}
