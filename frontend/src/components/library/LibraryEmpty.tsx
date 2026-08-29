"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { BookOpen, Upload } from "lucide-react";

export function LibraryEmpty() {
  return (
    <div className="flex flex-col items-center justify-center py-24 px-4 text-center">
      <div className="w-16 h-16 rounded-2xl bg-stone-100 flex items-center justify-center mb-5">
        <BookOpen className="w-8 h-8 text-stone-300" />
      </div>
      <h2 className="text-xl font-semibold text-stone-800 mb-2">
        Your library is empty
      </h2>
      <p className="text-stone-500 text-sm max-w-xs mb-6">
        Upload your first PDF to start building your personal reading collection.
      </p>
      <Link href="/books/upload">
        <Button id="upload-first-book">
          <Upload className="w-4 h-4" />
          Upload your first book
        </Button>
      </Link>
    </div>
  );
}
