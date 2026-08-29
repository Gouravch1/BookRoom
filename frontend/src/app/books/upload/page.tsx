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
      <div className="min-h-screen bg-stone-50 flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-stone-300 border-t-stone-700 rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) return null;

  return (
    <div className="min-h-screen bg-stone-50 flex flex-col">
      {/* Minimal header */}
      <header className="border-b border-stone-200 bg-white/95 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 flex items-center justify-between h-14">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-stone-900 rounded-md flex items-center justify-center">
              <BookOpen className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="font-semibold text-stone-900 tracking-tight">BookRoom</span>
          </div>
          <Link
            href="/library"
            className="flex items-center gap-1.5 text-sm text-stone-500 hover:text-stone-900 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Library
          </Link>
        </div>
      </header>

      <main className="flex-1 max-w-2xl mx-auto w-full px-4 sm:px-6 py-10">
        <div className="mb-7">
          <h1 className="text-2xl font-semibold text-stone-900 mb-1">
            Upload a book
          </h1>
          <p className="text-sm text-stone-500">
            Upload a PDF to your private library. Only you will be able to read
            it.
          </p>
        </div>

        <div className="bg-white rounded-xl border border-stone-200 p-6 shadow-sm">
          <UploadBookForm />
        </div>
      </main>
    </div>
  );
}
