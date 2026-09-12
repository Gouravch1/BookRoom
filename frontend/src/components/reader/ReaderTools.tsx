"use client";

import { BookMarked, Highlighter, StickyNote, Bot, FileText, Layers } from "lucide-react";

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
    label: "Notes",
    comingSoon: false,
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

interface ReaderToolsProps {
  activePanel?: "highlights" | "notes" | null;
  onTogglePanel?: (panel: "highlights" | "notes") => void;
}

export function ReaderTools({ activePanel = null, onTogglePanel }: ReaderToolsProps) {
  return (
    <div
      className="flex flex-col w-14 shrink-0 select-none"
      style={{
        borderLeft: "1px solid var(--border-subtle)",
        background: "var(--bg-surface)",
      }}
    >
      <div className="flex flex-col py-3 gap-0.5">
        {tools.map((tool) => {
          const isHighlight = tool.id === "highlight";
          const isNote = tool.id === "note";
          const isActive =
            (isHighlight && activePanel === "highlights") ||
            (isNote && activePanel === "notes");

          const handleClick = () => {
            if (isHighlight) onTogglePanel?.("highlights");
            if (isNote) onTogglePanel?.("notes");
          };

          return (
            <button
              key={tool.id}
              title={tool.comingSoon ? `${tool.label} — coming soon` : tool.label}
              disabled={tool.comingSoon}
              onClick={isHighlight || isNote ? handleClick : undefined}
              className="flex flex-col items-center gap-1 py-2.5 px-1 text-[9px] font-medium transition-all duration-200 relative"
              style={{
                color: tool.comingSoon
                  ? "var(--text-muted)"
                  : isActive
                  ? "var(--accent)"
                  : "var(--text-secondary)",
                background: isActive ? "var(--accent-dim)" : "transparent",
                borderRight: isActive ? "2px solid var(--accent)" : "2px solid transparent",
                cursor: tool.comingSoon ? "default" : "pointer",
              }}
              id={`reader-tool-${tool.id}`}
            >
              {tool.icon}
              <span className="leading-tight text-center">{tool.label}</span>
              {tool.comingSoon && (
                <span
                  className="text-[8px] leading-none"
                  style={{ color: "var(--text-muted)" }}
                >
                  soon
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
