"use client";

import { BookMarked, Highlighter, StickyNote, Bot, FileText, Layers } from "lucide-react";

interface ReaderToolsProps {
  activePanel?: "highlights" | "notes" | null;
  onTogglePanel?: (panel: "highlights" | "notes") => void;
  onOpenAiChat?: () => void;
  onExplainPage?: () => void;
}

export function ReaderTools({
  activePanel = null,
  onTogglePanel,
  onOpenAiChat,
  onExplainPage,
}: ReaderToolsProps) {
  return (
    <div
      className="flex flex-col w-14 shrink-0 select-none"
      style={{
        borderLeft: "1px solid var(--border-subtle)",
        background: "var(--bg-surface)",
      }}
    >
      <div className="flex flex-col py-3 gap-0.5">

        {/* Contents — coming soon */}
        <button
          key="contents"
          id="reader-tool-contents"
          title="Contents — coming soon"
          disabled
          className="flex flex-col items-center gap-1 py-2.5 px-1 text-[9px] font-medium relative"
          style={{
            color: "var(--text-muted)",
            background: "transparent",
            borderRight: "2px solid transparent",
            cursor: "default",
          }}
        >
          <Layers className="w-4 h-4" />
          <span className="leading-tight text-center">Contents</span>
          <span className="text-[8px] leading-none" style={{ color: "var(--text-muted)" }}>soon</span>
        </button>

        {/* Highlights */}
        <button
          key="highlight"
          id="reader-tool-highlight"
          title="Highlights"
          onClick={() => onTogglePanel?.("highlights")}
          className="flex flex-col items-center gap-1 py-2.5 px-1 text-[9px] font-medium transition-all duration-200 relative"
          style={{
            color: activePanel === "highlights" ? "var(--accent)" : "var(--text-secondary)",
            background: activePanel === "highlights" ? "var(--accent-dim)" : "transparent",
            borderRight: activePanel === "highlights" ? "2px solid var(--accent)" : "2px solid transparent",
            cursor: "pointer",
          }}
        >
          <Highlighter className="w-4 h-4" />
          <span className="leading-tight text-center">Highlight</span>
        </button>

        {/* Notes */}
        <button
          key="note"
          id="reader-tool-note"
          title="Notes"
          onClick={() => onTogglePanel?.("notes")}
          className="flex flex-col items-center gap-1 py-2.5 px-1 text-[9px] font-medium transition-all duration-200 relative"
          style={{
            color: activePanel === "notes" ? "var(--accent)" : "var(--text-secondary)",
            background: activePanel === "notes" ? "var(--accent-dim)" : "transparent",
            borderRight: activePanel === "notes" ? "2px solid var(--accent)" : "2px solid transparent",
            cursor: "pointer",
          }}
        >
          <StickyNote className="w-4 h-4" />
          <span className="leading-tight text-center">Notes</span>
        </button>

        {/* Divider */}
        <div
          className="mx-2 my-1"
          style={{ height: 1, background: "var(--border-subtle)" }}
        />

        {/* Ask AI — now active */}
        <button
          key="ask-ai"
          id="reader-tool-ask-ai"
          title="AI Chat"
          onClick={onOpenAiChat}
          className="flex flex-col items-center gap-1 py-2.5 px-1 text-[9px] font-medium transition-all duration-200 relative"
          style={{
            color: "var(--emerald)",
            background: "transparent",
            borderRight: "2px solid transparent",
            cursor: "pointer",
          }}
        >
          <Bot className="w-4 h-4" />
          <span className="leading-tight text-center">Ask AI</span>
        </button>

        {/* Explain Page — now active */}
        <button
          key="explain"
          id="reader-tool-explain"
          title="Explain this page"
          onClick={onExplainPage}
          className="flex flex-col items-center gap-1 py-2.5 px-1 text-[9px] font-medium transition-all duration-200 relative"
          style={{
            color: "#a78bfa",
            background: "transparent",
            borderRight: "2px solid transparent",
            cursor: "pointer",
          }}
        >
          <FileText className="w-4 h-4" />
          <span className="leading-tight text-center">Explain</span>
        </button>

        {/* Summarize — coming soon (no backend endpoint) */}
        <button
          key="summarize"
          id="reader-tool-summarize"
          title="Summarize — coming soon"
          disabled
          className="flex flex-col items-center gap-1 py-2.5 px-1 text-[9px] font-medium relative"
          style={{
            color: "var(--text-muted)",
            background: "transparent",
            borderRight: "2px solid transparent",
            cursor: "default",
          }}
        >
          <BookMarked className="w-4 h-4" />
          <span className="leading-tight text-center">Summarize</span>
          <span className="text-[8px] leading-none" style={{ color: "var(--text-muted)" }}>soon</span>
        </button>

      </div>
    </div>
  );
}
