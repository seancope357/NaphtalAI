"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { createBrowserClient } from "@supabase/ssr";
import {
  ArrowRightFromLine,
  Eye,
  EyeOff,
  Fingerprint,
  LockKeyhole,
  MailCheck,
  MoveLeft,
  Brain,
  Loader2,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

import type { Database } from "@/database.types";

type AuthMode = "signin" | "signup";

const DEFAULT_NEXT_PATH = "/canvas";

function sanitizeNextPath(value: string | null): string {
  if (!value) return DEFAULT_NEXT_PATH;
  if (!value.startsWith("/") || value.startsWith("//")) return DEFAULT_NEXT_PATH;
  return value;
}

function resolveMode(value: string | null): AuthMode {
  return value === "signup" ? "signup" : "signin";
}

function buildEmailRedirect(nextPath: string): string | undefined {
  if (typeof window === "undefined") return undefined;
  const redirectUrl = new URL("/auth/callback", window.location.origin);
  redirectUrl.searchParams.set("next", nextPath);
  return redirectUrl.toString();
}

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  return "Unable to complete that request right now.";
}

// ─── Logo ─────────────────────────────────────────────────────────────────────

function NaphtalLogo({ size = 32, className = "" }: { size?: number; className?: string }) {
  return (
    <Image
      src="/NaphtalAI-Logo.svg"
      alt="NaphtalAI Logo"
      width={size}
      height={size}
      className={[
        "[filter:brightness(0)_saturate(100%)_invert(36%)_sepia(98%)_saturate(456%)_hue-rotate(199deg)_brightness(97%)_contrast(101%)]",
        "dark:[filter:brightness(0)_invert(1)]",
        className,
      ].join(" ")}
      priority
    />
  );
}

// ─── Field ────────────────────────────────────────────────────────────────────

function Field({
  id,
  label,
  type,
  value,
  onChange,
  placeholder,
  autoComplete,
  required,
  minLength,
  rightSlot,
}: {
  id: string;
  label: string;
  type: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  autoComplete?: string;
  required?: boolean;
  minLength?: number;
  rightSlot?: React.ReactNode;
}) {
  const [focused, setFocused] = useState(false);

  return (
    <div>
      <label
        htmlFor={id}
        className="mb-1.5 block text-[10px] font-semibold uppercase tracking-[0.12em]"
        style={{ color: "rgba(255,255,255,0.35)" }}
      >
        {label}
      </label>
      <div className="relative">
        <input
          id={id}
          type={type}
          autoComplete={autoComplete}
          required={required}
          minLength={minLength}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholder={placeholder}
          className="h-10 w-full rounded-lg px-3 text-sm outline-none transition-all"
          style={{
            background: "rgba(255,255,255,0.04)",
            border: focused
              ? "1px solid rgba(232,98,42,0.55)"
              : "1px solid rgba(255,255,255,0.09)",
            boxShadow: focused ? "0 0 0 3px rgba(232,98,42,0.1)" : "none",
            color: "rgba(255,255,255,0.82)",
          }}
        />
        {rightSlot && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">{rightSlot}</div>
        )}
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function LoginPage() {
  const router = useRouter();

  const supabase = useMemo(() => {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!url || !anonKey) return null;
    return createBrowserClient<Database>(url, anonKey);
  }, []);

  const [mode, setMode] = useState<AuthMode>("signin");
  const [nextPath, setNextPath] = useState(DEFAULT_NEXT_PATH);
  const [callbackError, setCallbackError] = useState<string | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [magicLinkLoading, setMagicLinkLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setNextPath(sanitizeNextPath(params.get("next")));
    setMode(resolveMode(params.get("mode")));
    setCallbackError(params.get("error"));
  }, []);

  const clearFeedback = () => {
    setError(null);
    setSuccess(null);
    setCallbackError(null);
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    clearFeedback();

    if (!supabase) {
      setError("Missing Supabase configuration. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.");
      return;
    }

    setLoading(true);
    try {
      if (mode === "signin") {
        const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
        if (signInError) throw signInError;
        router.replace(nextPath);
        router.refresh();
        return;
      }

      const emailRedirectTo = buildEmailRedirect(nextPath);
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: emailRedirectTo ? { emailRedirectTo } : undefined,
      });

      if (signUpError) throw signUpError;

      if (data.session) {
        router.replace(nextPath);
        router.refresh();
        return;
      }

      setSuccess("Account created. Confirm your email to finish sign-up.");
    } catch (submitError) {
      setError(getErrorMessage(submitError));
    } finally {
      setLoading(false);
    }
  };

  const handleMagicLink = async () => {
    clearFeedback();

    if (!email) {
      setError("Enter your email first, then request a magic link.");
      return;
    }

    if (!supabase) {
      setError("Missing Supabase configuration. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.");
      return;
    }

    setMagicLinkLoading(true);
    try {
      const emailRedirectTo = buildEmailRedirect(nextPath);
      const { error: otpError } = await supabase.auth.signInWithOtp({
        email,
        options: {
          ...(emailRedirectTo ? { emailRedirectTo } : {}),
          shouldCreateUser: mode === "signup",
        },
      });

      if (otpError) throw otpError;
      setSuccess("Magic link sent. Check your inbox to continue.");
    } catch (otpSubmitError) {
      setError(getErrorMessage(otpSubmitError));
    } finally {
      setMagicLinkLoading(false);
    }
  };

  const activeError = error ?? callbackError;

  return (
    <div
      className="relative min-h-screen overflow-hidden"
      style={{ background: "#0a0a0c", color: "rgba(255,255,255,0.82)" }}
    >
      {/* Ambient background */}
      <div className="pointer-events-none fixed inset-0 z-0">
        <div
          className="absolute"
          style={{
            width: "800px",
            height: "600px",
            top: "-150px",
            left: "50%",
            transform: "translateX(-50%)",
            background: "radial-gradient(ellipse at center, rgba(232,98,42,0.08) 0%, transparent 70%)",
          }}
        />
        <div
          className="absolute"
          style={{
            width: "500px",
            height: "500px",
            bottom: "-100px",
            left: "-100px",
            background: "radial-gradient(ellipse at center, rgba(96,165,250,0.04) 0%, transparent 70%)",
          }}
        />
        {/* Grid */}
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)",
            backgroundSize: "48px 48px",
          }}
        />
      </div>

      {/* Header */}
      <header className="relative z-10 mx-auto flex h-14 w-full max-w-6xl items-center justify-between px-4 md:px-8">
        <Link
          href="/landing"
          className="inline-flex items-center gap-2 rounded-lg px-3 py-1.5 text-[12px] font-medium transition-all"
          style={{
            background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(255,255,255,0.08)",
            color: "rgba(255,255,255,0.4)",
          }}
          onMouseEnter={(e: React.MouseEvent<HTMLAnchorElement>) => {
            (e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.75)";
            (e.currentTarget as HTMLElement).style.borderColor = "rgba(255,255,255,0.15)";
          }}
          onMouseLeave={(e: React.MouseEvent<HTMLAnchorElement>) => {
            (e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.4)";
            (e.currentTarget as HTMLElement).style.borderColor = "rgba(255,255,255,0.08)";
          }}
        >
          <MoveLeft className="h-3.5 w-3.5" strokeWidth={2.2} />
          Back to landing
        </Link>

        {/* Brand in header */}
        <div className="flex items-center gap-2.5">
          <NaphtalLogo size={22} className="opacity-70" />
          <span className="hidden font-mono text-[12px] font-bold text-white sm:block">
            NaphtalAI
          </span>
        </div>
      </header>

      {/* Main */}
      <main className="relative z-10 mx-auto flex min-h-[calc(100vh-3.5rem)] w-full max-w-5xl items-center justify-center px-4 pb-10 md:px-8">
        <div
          className="w-full overflow-hidden rounded-2xl"
          style={{
            background: "rgba(255,255,255,0.025)",
            border: "1px solid rgba(255,255,255,0.08)",
            boxShadow: "0 40px 80px rgba(0,0,0,0.55)",
          }}
        >
          <div className="grid md:grid-cols-[1.1fr,1fr]">

            {/* ── Left Info Panel ── */}
            <section
              className="hidden flex-col p-8 md:flex"
              style={{ borderRight: "1px solid rgba(255,255,255,0.06)" }}
            >
              {/* Top gradient line */}
              <div
                className="absolute top-0 left-0 right-0 h-px"
                style={{
                  background: "linear-gradient(90deg, transparent, rgba(232,98,42,0.4), transparent)",
                }}
              />

              {/* Badge */}
              <div
                className="inline-flex w-fit items-center gap-2 rounded-full px-3 py-1"
                style={{
                  background: "rgba(232,98,42,0.1)",
                  border: "1px solid rgba(232,98,42,0.25)",
                }}
              >
                <ShieldCheck className="h-3 w-3" style={{ color: "#e8622a" }} strokeWidth={2.2} />
                <span
                  className="text-[10px] font-semibold uppercase tracking-[0.15em]"
                  style={{ color: "#e8622a" }}
                >
                  Research Access
                </span>
              </div>

              {/* Logo + Headline */}
              <div className="mt-6 flex items-center gap-4">
                <NaphtalLogo size={40} className="opacity-85" />
                <div>
                  <h1
                    className="text-[22px] font-bold tracking-tight leading-tight"
                    style={{ color: "rgba(255,255,255,0.9)" }}
                  >
                    NaphtalAI
                  </h1>
                  <p
                    className="text-[9px] uppercase tracking-[0.18em] font-semibold mt-0.5"
                    style={{ color: "rgba(232,98,42,0.75)" }}
                  >
                    Research Agent
                  </p>
                </div>
              </div>

              <p className="mt-5 max-w-[40ch] text-sm leading-relaxed" style={{ color: "rgba(255,255,255,0.38)" }}>
                Secure sign-in for your research workspace. Continue to your canvas, PDF evidence stack, and graph-driven analysis tools.
              </p>

              {/* Feature list */}
              <div className="mt-8 flex flex-col gap-3">
                {[
                  {
                    icon: Fingerprint,
                    color: "#a78bfa",
                    title: "Session-safe redirects",
                    desc: "You return exactly to the route you requested after auth.",
                  },
                  {
                    icon: MailCheck,
                    color: "#34d399",
                    title: "Password + magic link",
                    desc: "Use credentials or switch to one-click email access any time.",
                  },
                  {
                    icon: LockKeyhole,
                    color: "#60a5fa",
                    title: "Private by default",
                    desc: "Workspace routes stay protected until a valid session exists.",
                  },
                ].map(({ icon: Icon, color, title, desc }) => (
                  <article
                    key={title}
                    className="flex items-start gap-3 rounded-xl p-3"
                    style={{
                      background: "rgba(255,255,255,0.025)",
                      border: "1px solid rgba(255,255,255,0.06)",
                    }}
                  >
                    <div
                      className="mt-0.5 w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
                      style={{
                        background: `${color}14`,
                        border: `1px solid ${color}28`,
                      }}
                    >
                      <Icon className="h-3.5 w-3.5" style={{ color }} strokeWidth={2.2} />
                    </div>
                    <div>
                      <p className="text-[12px] font-semibold" style={{ color: "rgba(255,255,255,0.75)" }}>
                        {title}
                      </p>
                      <p className="mt-0.5 text-[11px] leading-relaxed" style={{ color: "rgba(255,255,255,0.32)" }}>
                        {desc}
                      </p>
                    </div>
                  </article>
                ))}
              </div>

              {/* Bottom decoration */}
              <div className="mt-auto pt-8 flex items-center gap-3">
                <div
                  className="h-px flex-1"
                  style={{ background: "rgba(255,255,255,0.06)" }}
                />
                <div className="flex items-center gap-1.5 px-2 py-1 rounded-full"
                  style={{
                    background: "rgba(52,211,153,0.08)",
                    border: "1px solid rgba(52,211,153,0.18)",
                  }}
                >
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-[9px] font-medium tracking-widest uppercase" style={{ color: "rgba(52,211,153,0.8)" }}>
                    Secure
                  </span>
                </div>
                <div
                  className="h-px flex-1"
                  style={{ background: "rgba(255,255,255,0.06)" }}
                />
              </div>
            </section>

            {/* ── Right Form Panel ── */}
            <section className="p-6 sm:p-8">
              {/* Form header */}
              <div className="mb-7">
                <div className="flex items-center gap-2 mb-3">
                  <div
                    className="w-7 h-7 rounded-lg flex items-center justify-center"
                    style={{
                      background: "linear-gradient(135deg, rgba(232,98,42,0.25) 0%, rgba(232,98,42,0.08) 100%)",
                      border: "1px solid rgba(232,98,42,0.3)",
                      boxShadow: "0 0 10px rgba(232,98,42,0.15)",
                    }}
                  >
                    <Brain className="h-3.5 w-3.5 text-[#e8622a]" strokeWidth={2} />
                  </div>
                  <span
                    className="text-[10px] font-semibold uppercase tracking-[0.15em]"
                    style={{ color: "rgba(232,98,42,0.8)" }}
                  >
                    NaphtalAI Access
                  </span>
                </div>
                <h2
                  className="text-2xl font-bold tracking-tight"
                  style={{ color: "rgba(255,255,255,0.92)" }}
                >
                  {mode === "signin" ? "Welcome back" : "Create your account"}
                </h2>
                <p className="mt-1 text-[11px]" style={{ color: "rgba(255,255,255,0.28)" }}>
                  Destination after auth:{" "}
                  <span style={{ color: "rgba(232,98,42,0.7)", fontFamily: "monospace" }}>
                    {nextPath}
                  </span>
                </p>
              </div>

              {/* Mode switcher */}
              <div
                className="relative mb-6 flex rounded-lg p-0.5"
                style={{
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(255,255,255,0.07)",
                }}
              >
                {/* Sliding indicator */}
                <div
                  className="absolute top-0.5 bottom-0.5 w-[calc(50%-2px)] rounded-md transition-all duration-200"
                  style={{
                    left: mode === "signin" ? "2px" : "calc(50% + 1px)",
                    background: "linear-gradient(135deg, rgba(232,98,42,0.22) 0%, rgba(232,98,42,0.1) 100%)",
                    border: "1px solid rgba(232,98,42,0.3)",
                    boxShadow: "0 0 8px rgba(232,98,42,0.12)",
                  }}
                />
                <button
                  type="button"
                  onClick={() => { setMode("signin"); clearFeedback(); }}
                  className="relative flex-1 h-9 rounded-md text-[12px] font-semibold transition-colors z-10"
                  style={{ color: mode === "signin" ? "#e8622a" : "rgba(255,255,255,0.35)" }}
                >
                  Sign in
                </button>
                <button
                  type="button"
                  onClick={() => { setMode("signup"); clearFeedback(); }}
                  className="relative flex-1 h-9 rounded-md text-[12px] font-semibold transition-colors z-10"
                  style={{ color: mode === "signup" ? "#e8622a" : "rgba(255,255,255,0.35)" }}
                >
                  Create account
                </button>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                <Field
                  id="email"
                  label="Email address"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={setEmail}
                  placeholder="researcher@domain.com"
                />

                <Field
                  id="password"
                  label="Password"
                  type={showPassword ? "text" : "password"}
                  autoComplete={mode === "signin" ? "current-password" : "new-password"}
                  required
                  minLength={8}
                  value={password}
                  onChange={setPassword}
                  placeholder="Minimum 8 characters"
                  rightSlot={
                    <button
                      type="button"
                      onClick={() => setShowPassword((v) => !v)}
                      className="transition-colors"
                      style={{ color: "rgba(255,255,255,0.3)" }}
                      onMouseEnter={(e) => (e.currentTarget.style.color = "rgba(255,255,255,0.65)")}
                      onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(255,255,255,0.3)")}
                      aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" strokeWidth={2.2} />
                      ) : (
                        <Eye className="h-4 w-4" strokeWidth={2.2} />
                      )}
                    </button>
                  }
                />

                {/* Error banner */}
                {activeError && (
                  <div
                    className="rounded-lg px-3 py-2.5 text-[12px] leading-relaxed"
                    style={{
                      background: "rgba(239,68,68,0.08)",
                      border: "1px solid rgba(239,68,68,0.25)",
                      color: "#fca5a5",
                    }}
                    role="alert"
                  >
                    {activeError}
                  </div>
                )}

                {/* Success banner */}
                {success && (
                  <div
                    className="rounded-lg px-3 py-2.5 text-[12px] leading-relaxed"
                    style={{
                      background: "rgba(52,211,153,0.08)",
                      border: "1px solid rgba(52,211,153,0.25)",
                      color: "#6ee7b7",
                    }}
                    role="status"
                  >
                    {success}
                  </div>
                )}

                {/* Primary CTA */}
                <button
                  type="submit"
                  disabled={loading}
                  className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-lg text-sm font-semibold text-white transition-all"
                  style={{
                    background: loading
                      ? "rgba(232,98,42,0.4)"
                      : "linear-gradient(135deg, #e8622a 0%, #d4521f 100%)",
                    boxShadow: loading ? "none" : "0 4px 16px rgba(232,98,42,0.35)",
                    opacity: loading ? 0.8 : 1,
                    cursor: loading ? "not-allowed" : "pointer",
                  }}
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Processing…
                    </>
                  ) : (
                    <>
                      {mode === "signin" ? "Continue to workspace" : "Create account"}
                      <ArrowRightFromLine className="h-3.5 w-3.5" strokeWidth={2.2} />
                    </>
                  )}
                </button>
              </form>

              {/* Divider */}
              <div className="my-4 flex items-center gap-3">
                <div className="flex-1 h-px" style={{ background: "rgba(255,255,255,0.07)" }} />
                <span className="text-[10px] uppercase tracking-widest" style={{ color: "rgba(255,255,255,0.2)" }}>
                  or
                </span>
                <div className="flex-1 h-px" style={{ background: "rgba(255,255,255,0.07)" }} />
              </div>

              {/* Magic link */}
              <button
                type="button"
                onClick={handleMagicLink}
                disabled={magicLinkLoading}
                className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-lg text-[12px] font-medium transition-all"
                style={{
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(255,255,255,0.09)",
                  color: "rgba(255,255,255,0.5)",
                  cursor: magicLinkLoading ? "not-allowed" : "pointer",
                  opacity: magicLinkLoading ? 0.7 : 1,
                }}
                onMouseEnter={(e) => {
                  if (!magicLinkLoading) {
                    e.currentTarget.style.background = "rgba(255,255,255,0.07)";
                    e.currentTarget.style.borderColor = "rgba(255,255,255,0.16)";
                    e.currentTarget.style.color = "rgba(255,255,255,0.75)";
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "rgba(255,255,255,0.04)";
                  e.currentTarget.style.borderColor = "rgba(255,255,255,0.09)";
                  e.currentTarget.style.color = "rgba(255,255,255,0.5)";
                }}
              >
                {magicLinkLoading ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    Sending magic link…
                  </>
                ) : (
                  <>
                    <MailCheck className="h-3.5 w-3.5" style={{ color: "#34d399" }} strokeWidth={2.2} />
                    Send magic link instead
                  </>
                )}
              </button>

              {/* Footer note */}
              <p
                className="mt-5 text-center text-[10px] leading-relaxed"
                style={{ color: "rgba(255,255,255,0.2)" }}
              >
                By continuing you agree to the NaphtalAI terms and privacy expectations for authenticated research workspaces.
              </p>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}
