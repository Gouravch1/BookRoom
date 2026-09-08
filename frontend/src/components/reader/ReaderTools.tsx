"use client";

import { BookMarked, Highlighter, StickyNote, Bot, FileText, Layers } from "lucide-react";
import { cn } from "@/lib/utils";

interface Tool {
  id: string;
  icon: React.ReactNode;
  label: string;
  comingSoon: boolean;
}

const tools: Tool[] = [
  {
    id: "contents",
    icon: <Layers className="w-4 h-4" />,
    label: "Contents",
    comingSoon: false,
  },
  {
    id: "highlight",
    icon: <Highlighter className="w-4 h-4" />,
    label: "Highlight",
    comingSoon: false,
  },
  {
    id: "note",
    icon: <StickyNote className="w-4 h-4" />,
    label: "Note",
    comingSoon: true,
  },
  {
    id: "ask-ai",
    icon: <Bot className="w-4 h-4" />,
    label: "Ask AI",
    comingSoon: true,
  },
  {
    id: "explain",
    icon: <FileText className="w-4 h-4" />,
    label: "Explain",
    comingSoon: true,
  },
  {
    id: "summarize",
    icon: <BookMarked className="w-4 h-4" />,
    label: "Summarize",
    comingSoon: true,
  },
];

export function ReaderTools() {
  return (
    <div className="flex flex-col border-l border-stone-200 bg-white w-14 shrink-0">
      <div className="flex flex-col py-3 gap-0.5">
        {tools.map((tool) => (
          <button
            key={tool.id}
            title={tool.comingSoon ? `${tool.label} — coming soon` : tool.label}
            disabled={tool.comingSoon}
            className={cn(
              "flex flex-col items-center gap-1 py-2.5 px-1 text-[9px] font-medium transition-colors",
              tool.comingSoon
                ? "text-stone-300 cursor-default"
                : "text-stone-500 hover:text-stone-900 hover:bg-stone-50 cursor-pointer"
            )}
            id={`reader-tool-${tool.id}`}
          >
            {tool.icon}
            <span className="leading-tight text-center">{tool.label}</span>
            {tool.comingSoon && (
              <span className="text-[8px] text-stone-300 leading-none">soon</span>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
