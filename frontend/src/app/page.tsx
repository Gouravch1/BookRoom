import Link from "next/link";
import { BookOpen, Lock, BookMarked, Zap } from "lucide-react";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "BookRoom — Your Private Reading Library",
  description:
    "Upload your PDFs, track reading progress, and read in a focused personal environment. Private by design.",
};

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-stone-50 flex flex-col">
      {/* Nav */}
      <nav className="border-b border-stone-200 bg-white/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-6 flex items-center justify-between h-14">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-blue-600 rounded-md flex items-center justify-center">
              <BookOpen className="w-3.5 h-3.5 text-white" />
            </div>
             <span className="font-semibold text-gray-900 tracking-tight">BookRoom</span>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="text-sm text-stone-600 hover:text-stone-900 transition-colors font-medium"
            >
              Sign in
            </Link>
            <Link
              href="/register"
               className="text-sm bg-blue-600 text-white px-4 py-1.5 rounded-md hover:bg-blue-700 transition-colors font-medium"
              id="landing-get-started"
            >
              Get started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <main className="flex-1">
         <div className="max-w-5xl mx-auto px-4 sm:px-6 py-20 sm:py-28">
          <div className="max-w-2xl">
             <div className="inline-flex items-center gap-1.5 rounded-full bg-stone-100 border border-stone-200 px-3 py-1 text-xs text-stone-600 font-medium mb-6">
               <Lock className="w-3 h-3" />
               Completely private
             </div>
            <h1 className="text-4xl sm:text-5xl font-semibold text-gray-900 leading-tight tracking-tight mb-5">
               Your personal<br />
               <span className="text-blue-600">reading library.</span>
            </h1>
               <p className="text-lg text-gray-500 leading-relaxed mb-8 max-w-lg">
              Upload your PDFs. Read at your pace. Your books are only ever visible to you — never to anyone else.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/register"
                 className="bg-blue-600 text-white px-6 py-2.5 rounded-md hover:bg-blue-700 transition-colors text-sm font-medium"
              >
                Start reading for free
              </Link>
              <Link
                href="/login"
                 className="border border-gray-200 text-gray-700 px-6 py-2.5 rounded-md hover:bg-gray-100 transition-colors text-sm font-medium"
              >
                Sign in
              </Link>
            </div>
          </div>
        </div>

        {/* Features */}
        <div className="border-t border-stone-200 bg-white">
          <div className="max-w-5xl mx-auto px-6 py-16">
         <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
              <div className="flex flex-col gap-3">
               <div className="w-9 h-9 rounded-lg bg-blue-100 flex items-center justify-center">
                  <Lock className="w-4 h-4 text-stone-600" />
                </div>
                <h3 className="font-semibold text-stone-900">Fully private</h3>
                <p className="text-sm text-stone-500 leading-relaxed">
                  Your uploads are yours alone. Other users can never see, access, or read your books.
                </p>
              </div>
              <div className="flex flex-col gap-3">
               <div className="w-9 h-9 rounded-lg bg-blue-100 flex items-center justify-center">
                  <BookMarked className="w-4 h-4 text-stone-600" />
                </div>
                <h3 className="font-semibold text-stone-900">Resume reading</h3>
                <p className="text-sm text-stone-500 leading-relaxed">
                  Reading progress is saved automatically. Pick up exactly where you left off.
                </p>
              </div>
              <div className="flex flex-col gap-3">
               <div className="w-9 h-9 rounded-lg bg-blue-100 flex items-center justify-center">
                  <Zap className="w-4 h-4 text-stone-600" />
                </div>
                <h3 className="font-semibold text-stone-900">Built to grow</h3>
                <p className="text-sm text-stone-500 leading-relaxed">
                  AI reading assistant, highlights, notes, and more — coming to your reading room.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      <footer className="border-t border-stone-200 py-6 text-center text-xs text-stone-400">
        BookRoom · Private by design
      </footer>
    </div>
  );
}
