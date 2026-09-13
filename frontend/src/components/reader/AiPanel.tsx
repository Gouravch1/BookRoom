"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import {
  Sparkles,
  Lightbulb,
  FileText,
  MessageCircle,
  X,
  Loader2,
  AlertCircle,
  Send,
  ChevronRight,
} from "lucide-react";
import { aiService } from "@/services/ai.service";
import { getApiErrorMessage } from "@/lib/api-client";

// ─── Types ────────────────────────────────────────────────────────────────────

export type AiPanelMode =
  | "explain-selection"
  | "summarize-selection"
  | "explain-page"
  | "chat";

export interface AiPanelState {
  mode: AiPanelMode;
  /** Selected text (for selection modes) */
  context?: string;
  /** Page number (for page mode) */
  pageNumber?: number;
  bookId?: number;
}

interface AiPanelProps {
  isOpen: boolean;
  initialState?: AiPanelState;
  onClose: () => void;
}

// ─── Chat message type ────────────────────────────────────────────────────────

interface ChatMessage {
  role: "user" | "ai";
  text: string;
}

// ─── Mode metadata ────────────────────────────────────────────────────────────

const MODE_META: Record<
  AiPanelMode,
  { title: string; Icon: React.ElementType; iconColor: string }
> = {
  "explain-selection": {
    title: "Explain Selection",
    Icon: Lightbulb,
    iconColor: "#e8a045",
  },
  "summarize-selection": {
    title: "Summarize Selection",
    Icon: FileText,
    iconColor: "#a78bfa",
  },
  "explain-page": {
    title: "Explain Page",
    Icon: Sparkles,
    iconColor: "#e8a045",
  },
  chat: {
    title: "AI Chat",
    Icon: MessageCircle,
    iconColor: "#34d399",
  },
};

// ─── Single-response panel (explain / summarize / explain-page) ───────────────

function SingleResponsePanel({
  state,
}: {
  state: AiPanelState;
}) {
  const [status, setStatus] = useState<"loading" | "success" | "error">(
    "loading"
  );
  const [result, setResult] = useState<string>("");
  const [errorMsg, setErrorMsg] = useState<string>("");

  useEffect(() => {
    let cancelled = false;
    setStatus("loading");
    setResult("");
    setErrorMsg("");

    const run = async () => {
      try {
        let res: { response: string };
        if (state.mode === "explain-selection" && state.context) {
          res = await aiService.explainText(state.context);
        } else if (state.mode === "summarize-selection" && state.context) {
          res = await aiService.summarizeText(state.context);
        } else if (
          state.mode === "explain-page" &&
          state.bookId !== undefined &&
          state.pageNumber !== undefined
        ) {
          res = await aiService.explainPage(state.bookId, state.pageNumber);
        } else {
          throw new Error("Invalid AI panel state");
        }

        if (cancelled) return;

        if (!res.response || !res.response.trim()) {
          setStatus("error");
          setErrorMsg("The AI returned an empty response. Please try again.");
        } else {
          setResult(res.response);
          setStatus("success");
        }
      } catch (err) {
        if (cancelled) return;
        setStatus("error");
        setErrorMsg(getApiErrorMessage(err));
      }
    };

    run();
    return () => {
      cancelled = true;
    };
  }, [state]);

  return (
    <div className="flex flex-col flex-1 min-h-0">
      {/* Context block */}
      {state.context && (
        <div
          className="mx-4 mt-3 mb-0 px-3 py-2 rounded-lg text-xs"
          style={{
            background: "rgba(232,160,69,0.08)",
            border: "1px solid rgba(232,160,69,0.18)",
            color: "var(--text-secondary)",
            fontStyle: "italic",
            lineHeight: 1.5,
          }}
        >
          <span
            className="text-[10px] font-semibold uppercase tracking-wider not-italic block mb-1"
            style={{ color: "var(--accent)" }}
          >
            Selected text
          </span>
          <span className="line-clamp-3">&ldquo;{state.context}&rdquo;</span>
        </div>
      )}

      {state.mode === "explain-page" && state.pageNumber !== undefined && (
        <div
          className="mx-4 mt-3 mb-0 px-3 py-2 rounded-lg text-xs flex items-center gap-2"
          style={{
            background: "rgba(232,160,69,0.08)",
            border: "1px solid rgba(232,160,69,0.18)",
          }}
        >
          <Sparkles className="w-3 h-3 shrink-0" style={{ color: "var(--accent)" }} />
          <span style={{ color: "var(--text-secondary)" }}>
            Explaining{" "}
            <span className="font-semibold" style={{ color: "var(--accent)" }}>
              Page {state.pageNumber}
            </span>
          </span>
        </div>
      )}

      {/* Result area */}
      <div className="flex-1 overflow-y-auto px-4 py-4 min-h-0">
        {status === "loading" && (
          <div className="flex flex-col items-center justify-center gap-3 py-10">
            <div className="relative">
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center"
                style={{ background: "var(--accent-dim)" }}
              >
                <Sparkles
                  className="w-5 h-5"
                  style={{ color: "var(--accent)" }}
                />
              </div>
              <Loader2
                className="w-4 h-4 animate-spin absolute -bottom-0.5 -right-0.5"
                style={{ color: "var(--accent)" }}
              />
            </div>
            <p className="text-xs" style={{ color: "var(--text-muted)" }}>
              AI is thinking…
            </p>
          </div>
        )}

        {status === "error" && (
          <div
            className="flex flex-col items-start gap-2 rounded-xl p-4"
            style={{
              background: "var(--red-dim)",
              border: "1px solid rgba(248,113,113,0.25)",
            }}
          >
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" style={{ color: "var(--red)" }} />
              <span
                className="text-xs font-semibold"
                style={{ color: "var(--red)" }}
              >
                Something went wrong
              </span>
            </div>
            <p className="text-xs" style={{ color: "var(--text-secondary)" }}>
              {errorMsg}
            </p>
          </div>
        )}

        {status === "success" && (
          <div
            className="text-sm leading-relaxed whitespace-pre-wrap animate-fade-in"
            style={{ color: "var(--text-primary)" }}
          >
            {result}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Chat panel ───────────────────────────────────────────────────────────────

function ChatPanel() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = useCallback(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  const handleSend = useCallback(async () => {
    const text = input.trim();
    if (!text || isLoading) return;

    setInput("");
    setMessages((prev) => [...prev, { role: "user", text }]);
    setIsLoading(true);

    try {
      const res = await aiService.chat(text);
      const aiText =
        res.response?.trim() || "The AI returned an empty response.";
      setMessages((prev) => [...prev, { role: "ai", text: aiText }]);
    } catch (err) {
      const errMsg = getApiErrorMessage(err);
      setMessages((prev) => [
        ...prev,
        { role: "ai", text: `⚠️ ${errMsg}` },
      ]);
    } finally {
      setIsLoading(false);
      setTimeout(() => textareaRef.current?.focus(), 50);
    }
  }, [input, isLoading]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleSend();
      }
    },
    [handleSend]
  );

  return (
    <div className="flex flex-col flex-1 min-h-0">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 min-h-0 flex flex-col gap-3">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center gap-3 py-8 text-center">
            <div
              className="w-12 h-12 rounded-2xl flex items-center justify-center"
              style={{ background: "var(--accent-dim)" }}
            >
              <MessageCircle
                className="w-6 h-6"
                style={{ color: "var(--emerald)" }}
              />
            </div>
            <div>
              <p
                className="text-sm font-medium"
                style={{ color: "var(--text-primary)" }}
              >
                Ask me anything
              </p>
              <p
                className="text-xs mt-1 max-w-[180px]"
                style={{ color: "var(--text-muted)" }}
              >
                This is a general AI assistant — not specific to this book yet.
              </p>
            </div>
          </div>
        )}

        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className="max-w-[85%] rounded-xl px-3 py-2 text-sm leading-relaxed whitespace-pre-wrap animate-fade-in"
              style={
                msg.role === "user"
                  ? {
                      background: "var(--accent-dim)",
                      border: "1px solid rgba(232,160,69,0.25)",
                      color: "var(--text-primary)",
                    }
                  : {
                      background: "var(--bg-raised)",
                      border: "1px solid var(--border-default)",
                      color: "var(--text-primary)",
                    }
              }
            >
              {msg.role === "ai" && (
                <span
                  className="flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider mb-1"
                  style={{ color: "var(--emerald)" }}
                >
                  <Sparkles className="w-2.5 h-2.5" />
                  AI
                </span>
              )}
              {msg.text}
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex justify-start">
            <div
              className="rounded-xl px-3 py-2 flex items-center gap-2"
              style={{
                background: "var(--bg-raised)",
                border: "1px solid var(--border-default)",
              }}
            >
              <Loader2
                className="w-3.5 h-3.5 animate-spin"
                style={{ color: "var(--emerald)" }}
              />
              <span className="text-xs" style={{ color: "var(--text-muted)" }}>
                Thinking…
              </span>
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div
        className="px-3 pb-3 pt-2 shrink-0"
        style={{ borderTop: "1px solid var(--border-subtle)" }}
      >
        <div
          className="flex items-end gap-2 rounded-xl p-2"
          style={{
            background: "var(--bg-raised)",
            border: "1px solid var(--border-default)",
          }}
        >
          <textarea
            ref={textareaRef}
            id="ai-chat-input"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask anything… (Enter to send, Shift+Enter for newline)"
            rows={1}
            className="flex-1 text-sm resize-none outline-none min-h-[20px] max-h-[100px]"
            style={{
              background: "transparent",
              border: "none !important",
              boxShadow: "none !important",
              color: "var(--text-primary)",
              lineHeight: 1.5,
            }}
            disabled={isLoading}
          />
          <button
            id="ai-chat-send-btn"
            type="button"
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 transition-all duration-150 disabled:opacity-30"
            style={{
              background: input.trim() && !isLoading ? "var(--emerald)" : "var(--bg-hover)",
              color: input.trim() && !isLoading ? "#0e0e0f" : "var(--text-muted)",
            }}
          >
            <Send className="w-3.5 h-3.5" />
          </button>
        </div>
        <p className="text-[10px] mt-1.5 text-center" style={{ color: "var(--text-muted)" }}>
          General AI — not book-specific yet
        </p>
      </div>
    </div>
  );
}

// ─── Mode switcher pill ───────────────────────────────────────────────────────

const MODES: { mode: AiPanelMode; label: string; Icon: React.ElementType }[] = [
  { mode: "chat", label: "Chat", Icon: MessageCircle },
];

// ─── Main AiPanel ─────────────────────────────────────────────────────────────

export function AiPanel({ isOpen, initialState, onClose }: AiPanelProps) {
  const [activeState, setActiveState] = useState<AiPanelState | undefined>(
    initialState
  );

  // When a new initial state arrives from outside, adopt it (new AI action)
  useEffect(() => {
    if (initialState) {
      setActiveState(initialState);
    }
  }, [initialState]);

  // When panel opens fresh with no state, default to chat
  useEffect(() => {
    if (isOpen && !activeState) {
      setActiveState({ mode: "chat" });
    }
  }, [isOpen, activeState]);

  const mode = activeState?.mode ?? "chat";
  const { title, Icon, iconColor } = MODE_META[mode];

  return (
    <>
      {/* Backdrop (mobile only) */}
      {isOpen && (
        <div
          className="fixed inset-0 z-[39] sm:hidden"
          style={{ background: "rgba(0,0,0,0.5)" }}
          onClick={onClose}
        />
      )}

      {/* Panel */}
      <div
        id="ai-panel"
        className="flex flex-col shrink-0 overflow-hidden transition-all duration-300"
        style={{
          width: isOpen ? "clamp(280px, 28vw, 360px)" : "0px",
          borderLeft: isOpen ? "1px solid var(--border-subtle)" : "none",
          background: "var(--bg-surface)",
          opacity: isOpen ? 1 : 0,
          pointerEvents: isOpen ? "auto" : "none",
        }}
        aria-hidden={!isOpen}
      >
        {isOpen && (
          <>
            {/* Header */}
            <div
              className="flex items-center justify-between px-4 py-3 shrink-0"
              style={{ borderBottom: "1px solid var(--border-subtle)" }}
            >
              <div className="flex items-center gap-2">
                <div
                  className="w-6 h-6 rounded-md flex items-center justify-center"
                  style={{ background: "var(--accent-dim)" }}
                >
                  <Icon className="w-3.5 h-3.5" style={{ color: iconColor }} />
                </div>
                <span
                  className="text-sm font-semibold"
                  style={{ color: "var(--text-primary)" }}
                >
                  {title}
                </span>
              </div>

              <div className="flex items-center gap-1">
                {/* Switch to chat shortcut (only shown in non-chat modes) */}
                {mode !== "chat" && (
                  <button
                    type="button"
                    title="Switch to AI Chat"
                    onClick={() => setActiveState({ mode: "chat" })}
                    className="flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-medium transition-colors"
                    style={{
                      color: "var(--text-muted)",
                      background: "var(--bg-raised)",
                      border: "1px solid var(--border-subtle)",
                    }}
                  >
                    <MessageCircle className="w-3 h-3" />
                    <span>Chat</span>
                    <ChevronRight className="w-2.5 h-2.5" />
                  </button>
                )}
                <button
                  type="button"
                  id="ai-panel-close"
                  onClick={onClose}
                  aria-label="Close AI panel"
                  className="w-7 h-7 rounded-lg flex items-center justify-center transition-colors"
                  style={{
                    color: "var(--text-muted)",
                    background: "var(--bg-raised)",
                  }}
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Body */}
            {mode === "chat" ? (
              <ChatPanel />
            ) : activeState ? (
              <SingleResponsePanel key={JSON.stringify(activeState)} state={activeState} />
            ) : null}

            {/* Footer modes for quick switching */}
            {mode !== "chat" && (
              <div
                className="shrink-0 px-4 py-2 flex items-center gap-2"
                style={{ borderTop: "1px solid var(--border-subtle)" }}
              >
                {MODES.map(({ mode: m, label, Icon: Ic }) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => setActiveState({ mode: m })}
                    className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[10px] font-medium transition-all"
                    style={{
                      color: "var(--text-secondary)",
                      background: "var(--bg-raised)",
                      border: "1px solid var(--border-subtle)",
                    }}
                  >
                    <Ic className="w-3 h-3" />
                    {label}
                  </button>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </>
  );
}
