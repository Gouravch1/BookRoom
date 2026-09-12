import type { Metadata } from "next";
import { RegisterForm } from "@/components/auth/RegisterForm";
import { BookOpen } from "lucide-react";

export const metadata: Metadata = {
  title: "Create Account — BookRoom",
  description: "Create your BookRoom reading library account.",
};

export default function RegisterPage() {
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
        <div
          className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] rounded-full pointer-events-none"
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
            "A room without books is like a body without a soul."
          </p>
          <p className="text-sm font-medium" style={{ color: "var(--accent)" }}>
            — Marcus Tullius Cicero
          </p>
          <p className="mt-6 text-sm" style={{ color: "var(--text-muted)" }}>
            Join BookRoom. Build your soul.
          </p>
        </div>

        <p className="text-xs relative z-10" style={{ color: "var(--text-muted)" }}>
          Your library. Your rules. Always private.
        </p>
      </div>

      {/* Right panel — form */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-12">
        <RegisterForm />
      </div>
    </div>
  );
}
