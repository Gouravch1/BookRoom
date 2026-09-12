"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { getApiErrorMessage } from "@/lib/api-client";
import { BookOpen, Eye, EyeOff, ArrowRight, AlertCircle } from "lucide-react";

export function RegisterForm() {
  const { register } = useAuth();
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (password.length < 7) {
      setError("Password must be at least 7 characters.");
      return;
    }
    setIsLoading(true);
    try {
      await register(name.trim(), email.trim(), password);
      router.push("/library");
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  }

  const inputStyle = {
    background: "var(--bg-raised)",
    border: "1px solid var(--border-default)",
    borderRadius: "var(--radius-md)",
    color: "var(--text-primary)",
  };

  return (
    <div className="w-full max-w-sm animate-fade-up">
      {/* Mobile logo */}
      <div className="flex items-center gap-2.5 mb-10 lg:hidden">
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center"
          style={{ background: "var(--accent)", boxShadow: "0 4px 12px var(--accent-glow)" }}
        >
          <BookOpen className="w-4 h-4" style={{ color: "#0e0e0f" }} />
        </div>
        <span className="font-semibold tracking-tight" style={{ color: "var(--text-primary)" }}>
          BookRoom
        </span>
      </div>

      {/* Header */}
      <div className="mb-8">
        <h1
          className="font-serif text-3xl mb-2"
          style={{ color: "var(--text-primary)" }}
        >
          Create your library
        </h1>
        <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
          Join BookRoom and start reading privately
        </p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {/* Name */}
        <div className="flex flex-col gap-2">
          <label htmlFor="name" className="text-sm font-medium" style={{ color: "var(--text-secondary)" }}>
            Full name
          </label>
          <input
            id="name"
            type="text"
            autoComplete="name"
            placeholder="Jane Doe"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="h-11 px-4 text-sm w-full"
            style={inputStyle}
          />
        </div>

        {/* Email */}
        <div className="flex flex-col gap-2">
          <label htmlFor="email" className="text-sm font-medium" style={{ color: "var(--text-secondary)" }}>
            Email
          </label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="h-11 px-4 text-sm w-full"
            style={inputStyle}
          />
        </div>

        {/* Password */}
        <div className="flex flex-col gap-2">
          <label htmlFor="password" className="text-sm font-medium" style={{ color: "var(--text-secondary)" }}>
            Password
          </label>
          <div className="relative">
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              autoComplete="new-password"
              placeholder="Min. 7 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="h-11 px-4 pr-11 text-sm w-full"
              style={inputStyle}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 transition-colors"
              style={{ color: "var(--text-muted)" }}
              tabIndex={-1}
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div
            className="flex items-start gap-2.5 rounded-xl px-4 py-3 text-sm animate-scale-in"
            style={{
              background: "var(--red-dim)",
              border: "1px solid rgba(248,113,113,0.2)",
              color: "var(--red)",
            }}
          >
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            {error}
          </div>
        )}

        {/* Submit */}
        <button
          type="submit"
          disabled={isLoading}
          id="register-submit"
          className="h-11 rounded-xl text-sm font-semibold transition-all duration-200 flex items-center justify-center gap-2 mt-1"
          style={{
            background: isLoading ? "var(--bg-hover)" : "var(--accent)",
            color: isLoading ? "var(--text-secondary)" : "#0e0e0f",
            cursor: isLoading ? "not-allowed" : "pointer",
            boxShadow: isLoading ? "none" : "0 4px 16px var(--accent-glow)",
          }}
        >
          {isLoading ? (
            <>
              <span
                className="w-4 h-4 border-2 rounded-full animate-spin"
                style={{ borderColor: "var(--text-muted)", borderTopColor: "var(--text-secondary)" }}
              />
              Creating account…
            </>
          ) : (
            <>
              Create account
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </form>

      <p className="text-sm text-center mt-7" style={{ color: "var(--text-muted)" }}>
        Already have an account?{" "}
        <Link
          href="/login"
          className="font-medium transition-colors"
          style={{ color: "var(--accent)" }}
        >
          Sign in
        </Link>
      </p>
    </div>
  );
}
