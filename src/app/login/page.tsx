"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createBrowserClient } from "@supabase/ssr";
import { motion } from "framer-motion";
import { ArrowLeft, Eye, EyeOff } from "lucide-react";

const G = "oklch(0.7264 0.0581 66.6967)";
const GB = "oklch(0.7982 0.0243 82.1078)";
const GD = "oklch(0.7264 0.0581 66.6967 / 0.12)";
const GB2 = "oklch(0.7264 0.0581 66.6967 / 0.25)";
const BG = "oklch(0.2747 0.0139 57.6523)";
const CARD = "oklch(0.3237 0.0155 59.0603)";
const TEXT = "oklch(0.9239 0.0190 83.0636)";
const MUTED = "oklch(0.7982 0.0243 82.1078)";


export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [supabase, setSupabase] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    const client = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    setSupabase(client);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supabase) return;
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        setSuccess("Check your email to confirm your account.");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        router.push("/canvas");
      }
    } catch (err: any) {
      setError(err.message || "An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden"
      style={{ backgroundColor: BG }}
    >
      {/* Background grid */}
      <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
        <svg width="100%" height="100%">
          <defs>
            <pattern id="grid" width="48" height="48" patternUnits="userSpaceOnUse">
              <path d="M 48 0 L 0 0 0 48" fill="none" stroke={G} strokeWidth="0.3" opacity="0.18" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
        <div className="absolute inset-0" style={{ background: `radial-gradient(ellipse 70% 70% at 50% 50%, transparent 0%, ${BG} 75%)` }} />
      </div>

      {/* Ambient glow */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full pointer-events-none"
        style={{ background: `radial-gradient(circle, rgba(201,162,39,0.06) 0%, transparent 70%)` }}
        aria-hidden="true"
      />

      {/* Back to home */}
      <Link
        href="/"
        className="absolute top-6 left-6 flex items-center gap-2 text-sm transition-colors z-10"
        style={{ color: MUTED }}
        onMouseEnter={(e) => (e.currentTarget.style.color = TEXT)}
        onMouseLeave={(e) => (e.currentTarget.style.color = MUTED)}
      >
        <ArrowLeft size={15} />
        Back to home
      </Link>

      {/* Card */}
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10 w-full max-w-sm rounded-xl p-8"
        style={{ background: CARD, border: `1px solid ${GB2}` }}
      >
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <img src="/NaphtalAI-Logo.svg" width={64} height={64} alt="NaphtalAI" className="object-contain" />
          <span
            className="mt-3 text-xl font-semibold"
            style={{ fontFamily: "var(--font-display, Spectral, serif)", color: TEXT }}
          >
            Naphtal<span style={{ color: G }}>AI</span>
          </span>
          <p className="mt-1 text-xs tracking-widest uppercase" style={{ color: MUTED }}>
            Lux e Tenebris
          </p>
        </div>

        {/* Mode toggle */}
        <div
          className="flex rounded-lg p-1 mb-6"
          style={{ background: BG, border: `1px solid ${GB2}` }}
        >
          {(["signin", "signup"] as const).map((m) => (
            <button
              key={m}
              onClick={() => { setMode(m); setError(null); setSuccess(null); }}
              className="flex-1 py-2 text-sm font-medium rounded-md transition-all"
              style={{
                background: mode === m ? GD : "transparent",
                color: mode === m ? G : MUTED,
                border: mode === m ? `1px solid ${GB2}` : "1px solid transparent",
              }}
            >
              {m === "signin" ? "Sign In" : "Create Account"}
            </button>
          ))}
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium mb-1.5" style={{ color: MUTED }}>
              Email address
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="brother@lodge.com"
              className="w-full px-3.5 py-2.5 rounded-md text-sm outline-none transition-all"
              style={{ background: BG, border: `1px solid ${GB2}`, color: TEXT, caretColor: G }}
              onFocus={(e) => (e.currentTarget.style.borderColor = G)}
              onBlur={(e) => (e.currentTarget.style.borderColor = GB2)}
            />
          </div>

          <div>
            <label className="block text-xs font-medium mb-1.5" style={{ color: MUTED }}>
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-3.5 py-2.5 pr-10 rounded-md text-sm outline-none transition-all"
                style={{ background: BG, border: `1px solid ${GB2}`, color: TEXT, caretColor: G }}
                onFocus={(e) => (e.currentTarget.style.borderColor = G)}
                onBlur={(e) => (e.currentTarget.style.borderColor = GB2)}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2"
                style={{ color: MUTED }}
                tabIndex={-1}
              >
                {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </div>

          {/* Error / success */}
          {error && (
            <p className="text-xs px-3 py-2 rounded-md" style={{ background: "rgba(185,28,28,0.1)", border: "1px solid rgba(185,28,28,0.3)", color: "#f87171" }}>
              {error}
            </p>
          )}
          {success && (
            <p className="text-xs px-3 py-2 rounded-md" style={{ background: GD, border: `1px solid ${GB2}`, color: G }}>
              {success}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 rounded-md font-semibold text-sm transition-all disabled:opacity-60"
            style={{ background: G, color: "#000" }}
            onMouseEnter={(e) => { if (!loading) e.currentTarget.style.background = GB; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = G; }}
          >
            {loading ? "Please wait…" : mode === "signin" ? "Enter the Archives" : "Begin Your Journey"}
          </button>
        </form>

        <p className="mt-6 text-center text-xs" style={{ color: MUTED }}>
          By continuing, you agree to our{" "}
          <a href="#" className="underline" style={{ color: G }}>Terms</a>
          {" "}and{" "}
          <a href="#" className="underline" style={{ color: G }}>Privacy Policy</a>.
        </p>
      </motion.div>
    </div>
  );
}
