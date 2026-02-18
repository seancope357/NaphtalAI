"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { createBrowserClient } from "@supabase/ssr";
import {
  ArrowLeft,
  ArrowRight,
  Eye,
  EyeOff,
  Lock,
  Mail,
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
    <div className="relative min-h-screen overflow-hidden bg-background text-foreground">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(900px_560px_at_0%_0%,rgba(56,189,248,0.15),transparent_60%),radial-gradient(840px_560px_at_100%_0%,rgba(59,130,246,0.12),transparent_60%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(148,163,184,0.07)_1px,transparent_1px),linear-gradient(to_bottom,rgba(148,163,184,0.07)_1px,transparent_1px)] bg-[size:44px_44px]" />
      </div>

      <header className="relative z-10 mx-auto flex h-12 w-full max-w-6xl items-center px-4 md:px-8">
        <Link
          href="/"
          className="inline-flex items-center gap-2 rounded-md border border-border/70 bg-background/75 px-3 py-1.5 text-xs font-medium text-muted-foreground transition hover:border-border hover:text-foreground"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to landing
        </Link>
      </header>

      <main className="relative z-10 mx-auto flex min-h-[calc(100vh-3rem)] w-full max-w-6xl items-center px-4 pb-8 md:px-8 md:pb-12">
        <div className="grid w-full overflow-hidden rounded-2xl border border-border/70 bg-card/75 shadow-2xl backdrop-blur-sm md:grid-cols-[1.08fr,1fr]">
          <section className="hidden border-r border-border/60 bg-background/65 p-8 md:flex md:flex-col">
            <p className="inline-flex w-fit items-center gap-2 rounded-full border border-primary/25 bg-primary/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-primary">
              Research Access
            </p>
            <h1 className="mt-5 max-w-[15ch] text-3xl font-semibold leading-tight tracking-tight">
              Secure sign-in for the modern research workspace
            </h1>
            <p className="mt-4 max-w-[46ch] text-sm text-muted-foreground">
              Continue to your canvas, PDF evidence stack, and graph-driven analysis tools with a cleaner,
              faster authentication flow.
            </p>

            <div className="mt-8 grid gap-3">
              <article className="rounded-lg border border-border/70 bg-card/80 p-3">
                <div className="flex items-center gap-2 text-sm font-semibold">
                  <ShieldCheck className="h-4 w-4 text-primary" />
                  Session-safe redirects
                </div>
                <p className="mt-1 text-xs text-muted-foreground">You return exactly to the route you requested after auth.</p>
              </article>
              <article className="rounded-lg border border-border/70 bg-card/80 p-3">
                <div className="flex items-center gap-2 text-sm font-semibold">
                  <Mail className="h-4 w-4 text-primary" />
                  Password + magic link
                </div>
                <p className="mt-1 text-xs text-muted-foreground">Use credentials or switch to one-click email access any time.</p>
              </article>
              <article className="rounded-lg border border-border/70 bg-card/80 p-3">
                <div className="flex items-center gap-2 text-sm font-semibold">
                  <Lock className="h-4 w-4 text-primary" />
                  Private by default
                </div>
                <p className="mt-1 text-xs text-muted-foreground">Workspace routes stay protected until a valid Supabase session exists.</p>
              </article>
            </div>
          </section>

          <section className="p-5 sm:p-7 md:p-8">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.12em] text-primary">
                  <Sparkles className="h-3.5 w-3.5" />
                  NaphtalAI Access
                </p>
                <h2 className="mt-2 text-2xl font-semibold tracking-tight">
                  {mode === "signin" ? "Welcome back" : "Create your account"}
                </h2>
                <p className="mt-1 text-xs text-muted-foreground">Next destination: {nextPath}</p>
              </div>
            </div>

            <div className="mb-5 grid grid-cols-2 gap-2 rounded-lg border border-border/70 bg-background/70 p-1">
              <button
                type="button"
                onClick={() => {
                  setMode("signin");
                  clearFeedback();
                }}
                className={`h-9 rounded-md text-sm font-medium transition ${
                  mode === "signin"
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Sign in
              </button>
              <button
                type="button"
                onClick={() => {
                  setMode("signup");
                  clearFeedback();
                }}
                className={`h-9 rounded-md text-sm font-medium transition ${
                  mode === "signup"
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Create account
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="mb-1.5 block text-xs font-medium text-muted-foreground" htmlFor="email">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  className="h-10 w-full rounded-md border border-border/80 bg-background px-3 text-sm outline-none transition focus:border-primary"
                  placeholder="researcher@domain.com"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-medium text-muted-foreground" htmlFor="password">
                  Password
                </label>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete={mode === "signin" ? "current-password" : "new-password"}
                    required
                    minLength={8}
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    className="h-10 w-full rounded-md border border-border/80 bg-background px-3 pr-10 text-sm outline-none transition focus:border-primary"
                    placeholder="Minimum 8 characters"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((current) => !current)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition hover:text-foreground"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {activeError ? (
                <p className="rounded-md border border-red-500/40 bg-red-500/10 px-3 py-2 text-xs text-red-300" role="alert">
                  {activeError}
                </p>
              ) : null}

              {success ? (
                <p className="rounded-md border border-primary/35 bg-primary/10 px-3 py-2 text-xs text-primary" role="status">
                  {success}
                </p>
              ) : null}

              <button
                type="submit"
                disabled={loading}
                className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-md bg-primary px-4 text-sm font-semibold text-primary-foreground transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {loading ? "Processing..." : mode === "signin" ? "Continue to workspace" : "Create account"}
                {!loading ? <ArrowRight className="h-4 w-4" /> : null}
              </button>
            </form>

            <div className="mt-4">
              <button
                type="button"
                onClick={handleMagicLink}
                disabled={magicLinkLoading}
                className="inline-flex h-10 w-full items-center justify-center rounded-md border border-border/80 bg-background px-4 text-sm font-medium text-foreground transition hover:bg-accent disabled:cursor-not-allowed disabled:opacity-70"
              >
                {magicLinkLoading ? "Sending magic link..." : "Send magic link instead"}
              </button>
            </div>

            <p className="mt-4 text-center text-[11px] leading-relaxed text-muted-foreground">
              By continuing, you agree to the NaphtalAI terms and privacy expectations for authenticated
              research workspaces.
            </p>
          </section>
        </div>
      </main>
    </div>
  );
}
