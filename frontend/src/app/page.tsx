import Link from "next/link";
import { BookOpen, Lock, BookMarked, Zap, ArrowRight, Star } from "lucide-react";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "BookRoom — Your Private Reading Sanctuary",
  description:
    "Upload your PDFs, track reading progress, and read in a focused personal environment. Private by design. Beautifully crafted.",
};

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col overflow-hidden" style={{ background: "var(--bg-base)" }}>
      {/* ── NAV ── */}
      <nav
        className="glass sticky top-0 z-50"
        style={{ borderBottom: "1px solid var(--border-subtle)" }}
      >
        <div className="max-w-6xl mx-auto px-5 sm:px-8 flex items-center justify-between h-15">
          {/* Logo */}
          <div className="flex items-center gap-2.5">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ background: "var(--accent)", boxShadow: "0 4px 12px var(--accent-glow)" }}
            >
              <BookOpen className="w-4 h-4" style={{ color: "#0e0e0f" }} />
            </div>
            <span
              className="font-semibold tracking-tight text-base"
              style={{ color: "var(--text-primary)" }}
            >
              BookRoom
            </span>
          </div>

          {/* Nav links */}
          <div className="flex items-center gap-2">
            <Link
              href="/login"
              className="text-sm px-4 py-2 rounded-lg font-medium transition-colors duration-200"
              style={{ color: "var(--text-secondary)" }}
            >
              Sign in
            </Link>
            <Link
              href="/register"
              className="text-sm px-4 py-2 rounded-lg font-semibold transition-all duration-200 flex items-center gap-1.5"
              style={{ background: "var(--accent)", color: "#0e0e0f" }}
              id="landing-get-started"
            >
              Get started
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </nav>

      {/* ── HERO ── */}
      <main className="flex-1 relative">
        {/* Background glow orbs */}
        <div
          className="absolute top-[-10%] left-[20%] w-[600px] h-[600px] rounded-full pointer-events-none"
          style={{
            background: "radial-gradient(circle, rgba(232,160,69,0.06) 0%, transparent 70%)",
            filter: "blur(40px)",
          }}
        />
        <div
          className="absolute top-[20%] right-[-5%] w-[400px] h-[400px] rounded-full pointer-events-none"
          style={{
            background: "radial-gradient(circle, rgba(232,160,69,0.04) 0%, transparent 70%)",
            filter: "blur(40px)",
          }}
        />

        <div className="max-w-6xl mx-auto px-5 sm:px-8 pt-20 sm:pt-28 pb-16 sm:pb-20">
          {/* Badge */}
          <div className="animate-fade-up flex mb-7">
            <div
              className="inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 text-xs font-semibold"
              style={{
                background: "var(--accent-dim)",
                color: "var(--accent)",
                border: "1px solid rgba(232,160,69,0.25)",
              }}
            >
              <Lock className="w-3 h-3" />
              Completely private — always
            </div>
          </div>

          {/* Headline */}
          <div className="animate-fade-up" style={{ animationDelay: "60ms" }}>
            <h1
              className="font-serif text-5xl sm:text-6xl md:text-7xl leading-[1.08] tracking-tight mb-6 max-w-3xl"
              style={{ color: "var(--text-primary)" }}
            >
              Your books.
              <br />
              <span className="text-gradient">Your sanctuary.</span>
              <br />
              Nobody else's.
            </h1>
          </div>

          {/* Subheadline */}
          <p
            className="animate-fade-up text-lg sm:text-xl max-w-xl leading-relaxed mb-10"
            style={{ color: "var(--text-secondary)", animationDelay: "120ms" }}
          >
            Upload your PDFs. Read without distraction. Every word stays private —
            no sharing, no exposure, no compromise.
          </p>

          {/* CTAs */}
          <div
            className="animate-fade-up flex flex-wrap gap-3 mb-16 sm:mb-20"
            style={{ animationDelay: "180ms" }}
          >
            <Link
              href="/register"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold transition-all duration-200"
              style={{
                background: "var(--accent)",
                color: "#0e0e0f",
                boxShadow: "0 4px 20px var(--accent-glow)",
              }}
            >
              Start reading — it's free
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/login"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-medium transition-all duration-200"
              style={{
                background: "var(--bg-raised)",
                color: "var(--text-primary)",
                border: "1px solid var(--border-default)",
              }}
            >
              Sign in
            </Link>
          </div>

          {/* Social proof / quote strip */}
          <div
            className="animate-fade-up border-t pt-10"
            style={{ borderColor: "var(--border-subtle)", animationDelay: "240ms" }}
          >
            <p
              className="font-serif italic text-2xl sm:text-3xl leading-snug max-w-2xl mb-3"
              style={{ color: "var(--text-primary)" }}
            >
              "A reader lives a thousand lives before he dies. The man who never reads lives only one."
            </p>
            <p className="text-sm font-medium" style={{ color: "var(--accent)" }}>
              — George R.R. Martin
            </p>
          </div>
        </div>

        {/* ── FEATURES ── */}
        <div
          className="border-t"
          style={{ borderColor: "var(--border-subtle)", background: "var(--bg-surface)" }}
        >
          <div className="max-w-6xl mx-auto px-5 sm:px-8 py-16 sm:py-20">
            <p
              className="text-xs font-semibold tracking-widest uppercase mb-10"
              style={{ color: "var(--text-muted)" }}
            >
              Why BookRoom
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 stagger-children">
              {[
                {
                  icon: Lock,
                  title: "Radically private",
                  body: "Your uploads are yours alone. Other users can never see, access, browse, or read your books. Ever.",
                },
                {
                  icon: BookMarked,
                  title: "Intelligent progress",
                  body: "Your reading position is saved as you turn each page. Come back days later and pick up right where you stopped.",
                },
                {
                  icon: Zap,
                  title: "Built to grow with you",
                  body: "AI reading assistant, smart highlights, rich notes, and more — landing in your reading room soon.",
                },
              ].map(({ icon: Icon, title, body }) => (
                <div key={title} className="flex flex-col gap-4">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center"
                    style={{ background: "var(--accent-dim)", border: "1px solid rgba(232,160,69,0.15)" }}
                  >
                    <Icon className="w-5 h-5" style={{ color: "var(--accent)" }} />
                  </div>
                  <div>
                    <h3
                      className="font-semibold text-base mb-1.5"
                      style={{ color: "var(--text-primary)" }}
                    >
                      {title}
                    </h3>
                    <p className="text-sm leading-relaxed" style={{ color: "var(--text-secondary)" }}>
                      {body}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── QUOTE BANNER ── */}
        <div
          className="relative overflow-hidden"
          style={{ background: "var(--bg-base)", borderTop: "1px solid var(--border-subtle)" }}
        >
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: "radial-gradient(ellipse at center, rgba(232,160,69,0.05) 0%, transparent 70%)",
            }}
          />
          <div className="max-w-6xl mx-auto px-5 sm:px-8 py-16 sm:py-20 relative text-center">
            <div className="flex justify-center mb-4 gap-1">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-4 h-4 fill-current" style={{ color: "var(--accent)" }} />
              ))}
            </div>
            <p
              className="font-serif italic text-2xl sm:text-4xl leading-tight max-w-3xl mx-auto mb-4"
              style={{ color: "var(--text-primary)" }}
            >
              "Not all those who wander are lost — but your bookmarks will be, unless you use BookRoom."
            </p>
            <p className="text-sm font-medium" style={{ color: "var(--text-muted)" }}>
              Your reading progress, always remembered.
            </p>
          </div>
        </div>

        {/* ── FINAL CTA ── */}
        <div
          className="border-t"
          style={{ borderColor: "var(--border-subtle)", background: "var(--bg-surface)" }}
        >
          <div className="max-w-6xl mx-auto px-5 sm:px-8 py-14 sm:py-16 flex flex-col sm:flex-row items-center justify-between gap-6">
            <div>
              <h2
                className="font-serif text-2xl sm:text-3xl mb-1"
                style={{ color: "var(--text-primary)" }}
              >
                Ready to build your library?
              </h2>
              <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
                Free forever. No credit card required.
              </p>
            </div>
            <Link
              href="/register"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold whitespace-nowrap transition-all duration-200"
              style={{
                background: "var(--accent)",
                color: "#0e0e0f",
                boxShadow: "0 4px 20px var(--accent-glow)",
              }}
            >
              Create your library
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </main>

      {/* ── FOOTER ── */}
      <footer
        className="py-6 text-center text-xs"
        style={{ borderTop: "1px solid var(--border-subtle)", color: "var(--text-muted)" }}
      >
        BookRoom · Private by design · {new Date().getFullYear()}
      </footer>
    </div>
  );
}
