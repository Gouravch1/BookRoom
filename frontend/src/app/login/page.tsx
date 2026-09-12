import type { Metadata } from "next";
import { LoginForm } from "@/components/auth/LoginForm";
import { BookOpen } from "lucide-react";

export const metadata: Metadata = {
  title: "Sign In — BookRoom",
  description: "Sign in to your BookRoom reading library.",
};

export default function LoginPage() {
  return (
    <div
      className="min-h-screen flex"
      style={{ background: "var(--bg-base)" }}
    >
      {/* Left panel — decorative (hidden on mobile) */}
      <div
        className="hidden lg:flex lg:w-1/2 relative flex-col justify-between p-12 overflow-hidden"
        style={{
          background: "var(--bg-surface)",
          borderRight: "1px solid var(--border-subtle)",
        }}
      >
        {/* Glow */}
        <div
          className="absolute top-[-10%] left-[-10%] w-[600px] h-[600px] rounded-full pointer-events-none"
          style={{
            background:
              "radial-gradient(circle, rgba(232,160,69,0.07) 0%, transparent 70%)",
            filter: "blur(60px)",
          }}
        />

        {/* Logo */}
        <div className="flex items-center gap-2.5 relative z-10">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center"
            style={{
              background: "var(--accent)",
              boxShadow: "0 4px 12px var(--accent-glow)",
            }}
          >
            <BookOpen className="w-4.5 h-4.5" style={{ color: "#0e0e0f" }} />
          </div>
          <span
            className="font-semibold text-lg tracking-tight"
            style={{ color: "var(--text-primary)" }}
          >
            BookRoom
          </span>
        </div>

        {/* Quote */}
        <div className="relative z-10">
          <p
            className="font-serif italic text-3xl leading-snug mb-4"
            style={{ color: "var(--text-primary)" }}
          >
            "There is no friend as loyal as a book."
          </p>
          <p className="text-sm font-medium" style={{ color: "var(--accent)" }}>
            — Ernest Hemingway
          </p>
        </div>

        {/* Bottom tag */}
        <p className="text-xs relative z-10" style={{ color: "var(--text-muted)" }}>
          Private by design. Built for readers.
        </p>
      </div>

      {/* Right panel — form */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-12">
        <LoginForm />
      </div>
    </div>
  );
}
