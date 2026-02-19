"use client";

import Link from "next/link";
import Image from "next/image";
import {
  ArrowRightFromLine,
  BotMessageSquare,
  Crosshair,
  FileStack,
  Fingerprint,
  LockKeyhole,
  PanelsTopLeft,
  ScanSearch,
  Waypoints,
  Brain,
  Zap,
  ChevronRight,
  Shield,
  Sparkles,
  Network,
  FileText,
  Sun,
  Moon,
} from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

// ─── Data ─────────────────────────────────────────────────────────────────────

const featureCards = [
  {
    icon: ScanSearch,
    color: "#a78bfa",
    title: "Corpus Intelligence",
    description:
      "Analyze rituals, lodge records, correspondence, and investigative documents in one scoped AI workspace.",
  },
  {
    icon: FileStack,
    color: "#60a5fa",
    title: "Source-First Evidence",
    description:
      "Every claim remains linked to original PDFs, images, and extracted passages for transparent verification.",
  },
  {
    icon: Waypoints,
    color: "#34d399",
    title: "Citation-Locked Graph",
    description:
      "Connections are anchored to source material so relationships stay defensible instead of speculative.",
  },
  {
    icon: BotMessageSquare,
    color: "#e8622a",
    title: "AI Research Copilot",
    description:
      "Interrogate sources, compare interpretations, and preserve your reasoning chain across sessions.",
  },
  {
    icon: PanelsTopLeft,
    color: "#fbbf24",
    title: "Presentation Builder",
    description:
      "Transform validated findings into report outlines and slide narratives without losing citation context.",
  },
  {
    icon: Crosshair,
    color: "#f87171",
    title: "Report-Ready Outputs",
    description:
      "Produce briefs and decks with structured sections, source notes, and page-level reference trails.",
  },
];

const workflowSteps = [
  {
    number: "01",
    icon: FileStack,
    color: "#60a5fa",
    title: "Ingest + Tag",
    text: "Upload source material, map context on the canvas, and assign clear evidentiary labels.",
  },
  {
    number: "02",
    icon: Brain,
    color: "#e8622a",
    title: "Analyze + Validate",
    text: "Run AI extraction and reasoning passes while tying links and findings to source anchors.",
  },
  {
    number: "03",
    icon: Sparkles,
    color: "#fbbf24",
    title: "Present + Deliver",
    text: "Generate research reports and slide decks that keep citations attached to every conclusion.",
  },
];

const trustBadges = [
  { icon: Fingerprint, label: "Private by default" },
  { icon: LockKeyhole, label: "Structured reasoning graph" },
  { icon: Shield, label: "Source-bound citations" },
  { icon: Network, label: "Citation-locked exports" },
];

// ─── Logo Component ────────────────────────────────────────────────────────────

function NaphtalLogo({ size = 32, className = "" }: { size?: number; className?: string }) {
  return (
    <Image
      src="/NaphtalAI-Logo.svg"
      alt="NaphtalAI Logo"
      width={size}
      height={size}
      className={[
        // Light mode: blue tint
        "[filter:brightness(0)_saturate(100%)_invert(36%)_sepia(98%)_saturate(456%)_hue-rotate(199deg)_brightness(97%)_contrast(101%)]",
        // Dark mode: white
        "dark:[filter:brightness(0)_invert(1)]",
        className,
      ].join(" ")}
      priority
    />
  );
}

// ─── Theme Toggle ─────────────────────────────────────────────────────────────

function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  if (!mounted) {
    return (
      <div className="h-8 w-8 rounded-md border border-white/[0.08] bg-white/[0.04]" />
    );
  }

  return (
    <button
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      className="h-8 w-8 rounded-md flex items-center justify-center transition-all border"
      style={{
        background: "rgba(255,255,255,0.04)",
        borderColor: "rgba(255,255,255,0.09)",
        color: "rgba(255,255,255,0.45)",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = "rgba(232,98,42,0.1)";
        e.currentTarget.style.borderColor = "rgba(232,98,42,0.3)";
        e.currentTarget.style.color = "#e8622a";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = "rgba(255,255,255,0.04)";
        e.currentTarget.style.borderColor = "rgba(255,255,255,0.09)";
        e.currentTarget.style.color = "rgba(255,255,255,0.45)";
      }}
      aria-label="Toggle theme"
    >
      {theme === "dark" ? (
        <Sun className="h-3.5 w-3.5" strokeWidth={2} />
      ) : (
        <Moon className="h-3.5 w-3.5" strokeWidth={2} />
      )}
    </button>
  );
}

// ─── Main Component ────────────────────────────────────────────────────────────

export default function LandingExperience() {
  return (
    <div
      className="relative min-h-screen overflow-x-hidden"
      style={{ background: "#0a0a0c", color: "rgba(255,255,255,0.82)" }}
    >
      {/* Ambient background glow */}
      <div className="pointer-events-none fixed inset-0 z-0">
        <div
          className="absolute"
          style={{
            width: "900px",
            height: "600px",
            top: "-200px",
            left: "50%",
            transform: "translateX(-50%)",
            background:
              "radial-gradient(ellipse at center, rgba(232,98,42,0.09) 0%, transparent 70%)",
          }}
        />
        <div
          className="absolute"
          style={{
            width: "600px",
            height: "600px",
            bottom: "0",
            right: "-100px",
            background:
              "radial-gradient(ellipse at center, rgba(96,165,250,0.05) 0%, transparent 70%)",
          }}
        />
        {/* Subtle grid */}
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px)",
            backgroundSize: "48px 48px",
          }}
        />
      </div>

      {/* ── Navigation ── */}
      <header
        className="sticky top-0 z-50"
        style={{
          background: "rgba(10,10,12,0.85)",
          backdropFilter: "blur(20px)",
          borderBottom: "1px solid rgba(255,255,255,0.06)",
        }}
      >
        {/* Top accent line */}
        <div
          className="absolute top-0 left-0 right-0 h-px"
          style={{
            background:
              "linear-gradient(90deg, transparent 0%, rgba(232,98,42,0.5) 50%, transparent 100%)",
          }}
        />

        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 md:px-8">
          {/* Logo + Brand */}
          <div className="flex items-center gap-3">
            <NaphtalLogo size={30} />
            <div>
              <span className="font-mono font-bold text-sm text-white tracking-tight">
                NaphtalAI
              </span>
              <span
                className="ml-2 text-[9px] uppercase tracking-[0.15em] font-medium"
                style={{ color: "rgba(232,98,42,0.75)" }}
              >
                Research Agent
              </span>
            </div>
          </div>

          {/* Nav links */}
          <nav className="hidden items-center gap-6 md:flex">
            {["Features", "Workflow", "Use Cases"].map((item) => (
              <a
                key={item}
                href={`#${item.toLowerCase().replace(" ", "-")}`}
                className="text-[13px] font-medium transition-colors"
                style={{ color: "rgba(255,255,255,0.4)" }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.color = "rgba(255,255,255,0.85)")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.color = "rgba(255,255,255,0.4)")
                }
              >
                {item}
              </a>
            ))}
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Link
              href="/login"
              className="hidden h-8 items-center rounded-md px-3 text-[12px] font-medium transition-all sm:inline-flex"
              style={{
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.09)",
                color: "rgba(255,255,255,0.55)",
              }}
              onMouseEnter={(e: React.MouseEvent<HTMLAnchorElement>) => {
                (e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.85)";
                (e.currentTarget as HTMLElement).style.borderColor = "rgba(255,255,255,0.18)";
              }}
              onMouseLeave={(e: React.MouseEvent<HTMLAnchorElement>) => {
                (e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.55)";
                (e.currentTarget as HTMLElement).style.borderColor = "rgba(255,255,255,0.09)";
              }}
            >
              Sign In
            </Link>
            <Link
              href="/login?next=/canvas"
              className="h-8 inline-flex items-center gap-1.5 rounded-md px-3 text-[12px] font-semibold text-white transition-all"
              style={{
                background: "linear-gradient(135deg, #e8622a 0%, #d4521f 100%)",
                boxShadow: "0 2px 12px rgba(232,98,42,0.35)",
              }}
            >
              Open Workspace
              <ChevronRight className="h-3 w-3" strokeWidth={2.5} />
            </Link>
          </div>
        </div>
      </header>

      {/* ── Hero Section ── */}
      <main className="relative z-10">
        <section className="mx-auto max-w-7xl px-4 pb-20 pt-20 text-center md:px-8 md:pt-28">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 rounded-full px-3 py-1 mb-6"
            style={{
              background: "rgba(232,98,42,0.1)",
              border: "1px solid rgba(232,98,42,0.25)",
            }}
          >
            <div className="w-1.5 h-1.5 rounded-full bg-[#e8622a] animate-pulse" />
            <span className="text-[10px] uppercase tracking-[0.18em] font-semibold"
              style={{ color: "#e8622a" }}>
              Research Intelligence Platform
            </span>
          </div>

          {/* Headline with logo */}
          <div className="flex flex-col items-center gap-6 mb-6">
            <NaphtalLogo size={72} className="opacity-90" />
            <h1
              className="max-w-[18ch] text-5xl font-bold leading-[1.1] tracking-tight md:text-7xl"
              style={{ color: "rgba(255,255,255,0.95)" }}
            >
              Build clarity from{" "}
              <span
                className="relative"
                style={{
                  background: "linear-gradient(135deg, #e8622a 0%, #f97316 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                complex source material.
              </span>
            </h1>
          </div>

          <p
            className="mx-auto max-w-[62ch] text-base leading-relaxed md:text-lg"
            style={{ color: "rgba(255,255,255,0.42)" }}
          >
            NaphtalAI turns dense documents into connected context. Structure relationships, test
            interpretations, and generate outputs that are defensible, clear, and presentation-ready.
          </p>

          {/* CTA Buttons */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/login?next=/canvas"
              className="inline-flex h-11 items-center gap-2 rounded-lg px-5 text-sm font-semibold text-white transition-all hover:brightness-110 active:scale-[0.98]"
              style={{
                background: "linear-gradient(135deg, #e8622a 0%, #d4521f 100%)",
                boxShadow: "0 4px 20px rgba(232,98,42,0.4)",
              }}
            >
              Enter the Research Workspace
              <ArrowRightFromLine className="h-4 w-4" strokeWidth={2.2} />
            </Link>
            <Link
              href="/login"
              className="inline-flex h-11 items-center rounded-lg px-5 text-sm font-semibold transition-all"
              style={{
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.1)",
                color: "rgba(255,255,255,0.6)",
              }}
            >
              Sign In
            </Link>
          </div>

          {/* Trust badges */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            {trustBadges.map(({ icon: Icon, label }) => (
              <span
                key={label}
                className="inline-flex items-center gap-2 text-[12px]"
                style={{ color: "rgba(255,255,255,0.3)" }}
              >
                <Icon className="h-3.5 w-3.5" style={{ color: "rgba(232,98,42,0.7)" }} strokeWidth={2.2} />
                {label}
              </span>
            ))}
          </div>

          {/* Workspace Preview Mockup */}
          <div
            className="mx-auto mt-14 max-w-5xl rounded-2xl text-left"
            style={{
              background: "rgba(255,255,255,0.025)",
              border: "1px solid rgba(255,255,255,0.08)",
              boxShadow: "0 40px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.04) inset",
            }}
          >
            {/* Mock titlebar */}
            <div
              className="flex items-center justify-between px-4 py-3 rounded-t-2xl"
              style={{
                borderBottom: "1px solid rgba(255,255,255,0.06)",
                background: "rgba(255,255,255,0.02)",
              }}
            >
              <div className="flex items-center gap-2">
                <div className="flex gap-1.5">
                  {["#f87171", "#fbbf24", "#34d399"].map((c) => (
                    <div key={c} className="w-2.5 h-2.5 rounded-full" style={{ background: c, opacity: 0.6 }} />
                  ))}
                </div>
                <span className="text-[11px] font-medium ml-2" style={{ color: "rgba(255,255,255,0.25)" }}>
                  NaphtalAI Research Workspace
                </span>
              </div>
              <div
                className="px-2 py-0.5 rounded text-[9px] uppercase tracking-wider font-medium"
                style={{
                  background: "rgba(52,211,153,0.1)",
                  border: "1px solid rgba(52,211,153,0.2)",
                  color: "#34d399",
                }}
              >
                Live Canvas
              </div>
            </div>

            {/* Mock three-panel layout */}
            <div className="grid grid-cols-12 gap-0 min-h-[240px] rounded-b-2xl overflow-hidden">
              {/* Left panel - Archives */}
              <div
                className="col-span-3 p-3 flex flex-col gap-2"
                style={{ borderRight: "1px solid rgba(255,255,255,0.05)" }}
              >
                <div className="flex items-center gap-2 mb-1">
                  <div
                    className="w-5 h-5 rounded flex items-center justify-center"
                    style={{ background: "rgba(232,98,42,0.15)", border: "1px solid rgba(232,98,42,0.25)" }}
                  >
                    <FileStack className="w-2.5 h-2.5" style={{ color: "#e8622a" }} />
                  </div>
                  <span className="text-[10px] font-mono font-bold" style={{ color: "rgba(255,255,255,0.6)" }}>
                    The Archives
                  </span>
                </div>
                {["lodge-records-1920.pdf", "correspondence.pdf", "ritual-analysis.txt", "members-1930.csv"].map(
                  (f, i) => {
                    const colors = ["#f87171", "#f87171", "#60a5fa", "#34d399"];
                    return (
                      <div
                        key={f}
                        className="flex items-center gap-2 px-2 py-1.5 rounded-lg"
                        style={{
                          background: i === 0 ? "rgba(255,255,255,0.05)" : "transparent",
                          border: i === 0 ? `1px solid ${colors[i]}20` : "1px solid transparent",
                        }}
                      >
                        <div
                          className="w-4 h-4 rounded flex-shrink-0"
                          style={{ background: `${colors[i]}15`, border: `1px solid ${colors[i]}25` }}
                        />
                        <span className="text-[9px] truncate" style={{ color: "rgba(255,255,255,0.4)" }}>
                          {f}
                        </span>
                      </div>
                    );
                  }
                )}
              </div>

              {/* Center - Canvas */}
              <div
                className="col-span-6 relative flex items-center justify-center"
                style={{ background: "rgba(0,0,0,0.2)" }}
              >
                {/* Dot grid */}
                <div
                  className="absolute inset-0"
                  style={{
                    backgroundImage: "radial-gradient(rgba(255,255,255,0.08) 1px, transparent 1px)",
                    backgroundSize: "24px 24px",
                  }}
                />
                {/* Mock canvas nodes */}
                <div className="relative flex flex-col items-center gap-3">
                  <div
                    className="px-4 py-2 rounded-lg text-[11px] font-medium"
                    style={{
                      background: "rgba(232,98,42,0.12)",
                      border: "1px solid rgba(232,98,42,0.3)",
                      color: "#e8622a",
                      boxShadow: "0 0 16px rgba(232,98,42,0.15)",
                    }}
                  >
                    Lodge Records 1920
                  </div>
                  <div className="flex gap-3">
                    <div
                      className="px-3 py-1.5 rounded-lg text-[10px]"
                      style={{
                        background: "rgba(96,165,250,0.1)",
                        border: "1px solid rgba(96,165,250,0.2)",
                        color: "#60a5fa",
                      }}
                    >
                      John Smith · Person
                    </div>
                    <div
                      className="px-3 py-1.5 rounded-lg text-[10px]"
                      style={{
                        background: "rgba(167,139,250,0.1)",
                        border: "1px solid rgba(167,139,250,0.2)",
                        color: "#a78bfa",
                      }}
                    >
                      Chapter 33 · Org
                    </div>
                  </div>
                  {/* Connecting lines */}
                  <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ top: 0, left: 0 }}>
                    <line x1="50%" y1="36" x2="30%" y2="80" stroke="rgba(232,98,42,0.3)" strokeWidth="1" strokeDasharray="3,3" />
                    <line x1="50%" y1="36" x2="70%" y2="80" stroke="rgba(232,98,42,0.3)" strokeWidth="1" strokeDasharray="3,3" />
                  </svg>
                </div>
              </div>

              {/* Right panel - NaphtalAI Research Agent */}
              <div
                className="col-span-3 p-3 flex flex-col gap-2"
                style={{ borderLeft: "1px solid rgba(255,255,255,0.05)" }}
              >
                <div className="flex items-center gap-2 mb-1">
                  <div
                    className="w-5 h-5 rounded flex items-center justify-center"
                    style={{ background: "rgba(232,98,42,0.15)", border: "1px solid rgba(232,98,42,0.25)" }}
                  >
                    <Brain className="w-2.5 h-2.5" style={{ color: "#e8622a" }} />
                  </div>
                  <div>
                    <span className="text-[10px] font-mono font-bold" style={{ color: "rgba(255,255,255,0.6)" }}>
                      NaphtalAI
                    </span>
                    <span className="block text-[7px] uppercase tracking-widest" style={{ color: "rgba(232,98,42,0.6)" }}>
                      Research Agent
                    </span>
                  </div>
                </div>
                <div
                  className="p-2 rounded-lg text-[9px] leading-relaxed"
                  style={{
                    background: "rgba(255,255,255,0.03)",
                    border: "1px solid rgba(255,255,255,0.06)",
                    borderLeft: "2px solid rgba(232,98,42,0.4)",
                    color: "rgba(255,255,255,0.5)",
                  }}
                >
                  Based on the 1920 records, John Smith appears in 14 lodge meetings with cross-references to Chapter 33 correspondence…
                </div>
                <div
                  className="p-2 rounded-lg text-[9px]"
                  style={{
                    background: "rgba(232,98,42,0.08)",
                    border: "1px solid rgba(232,98,42,0.18)",
                    color: "rgba(255,255,255,0.5)",
                  }}
                >
                  Summarize the relationship between these entities
                </div>
                <div
                  className="mt-auto h-6 rounded flex items-center justify-center gap-1"
                  style={{
                    background: "rgba(232,98,42,0.1)",
                    border: "1px solid rgba(232,98,42,0.2)",
                  }}
                >
                  <span className="text-[8px]" style={{ color: "rgba(232,98,42,0.6)" }}>Ask a question…</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── Divider ── */}
        <div
          className="mx-auto max-w-5xl h-px"
          style={{ background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.08), transparent)" }}
        />

        {/* ── Features Section ── */}
        <section id="features" className="mx-auto max-w-7xl px-4 py-20 md:px-8">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 rounded-full px-3 py-1 mb-4"
              style={{
                background: "rgba(232,98,42,0.08)",
                border: "1px solid rgba(232,98,42,0.2)",
              }}
            >
              <Sparkles className="w-3 h-3" style={{ color: "#e8622a" }} strokeWidth={2} />
              <span className="text-[10px] uppercase tracking-[0.18em] font-semibold" style={{ color: "#e8622a" }}>
                Platform Capabilities
              </span>
            </div>
            <h2 className="text-3xl font-bold tracking-tight md:text-4xl" style={{ color: "rgba(255,255,255,0.9)" }}>
              Everything you need to{" "}
              <span style={{
                background: "linear-gradient(135deg, #e8622a 0%, #f97316 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}>
                investigate at depth
              </span>
            </h2>
            <p className="mt-4 max-w-[58ch] mx-auto text-sm md:text-base" style={{ color: "rgba(255,255,255,0.38)" }}>
              NaphtalAI keeps every interpretation connected to its source material so exports stay defensible.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {featureCards.map((feature) => {
              const Icon = feature.icon;
              return (
                <article
                  key={feature.title}
                  className="group relative rounded-2xl p-5 transition-all duration-200 cursor-default"
                  style={{
                    background: "rgba(255,255,255,0.025)",
                    border: "1px solid rgba(255,255,255,0.07)",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = "rgba(255,255,255,0.04)";
                    e.currentTarget.style.borderColor = `${feature.color}30`;
                    e.currentTarget.style.transform = "translateY(-2px)";
                    e.currentTarget.style.boxShadow = `0 12px 32px rgba(0,0,0,0.3), 0 0 0 1px ${feature.color}18 inset`;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "rgba(255,255,255,0.025)";
                    e.currentTarget.style.borderColor = "rgba(255,255,255,0.07)";
                    e.currentTarget.style.transform = "translateY(0)";
                    e.currentTarget.style.boxShadow = "none";
                  }}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div
                      className="w-9 h-9 rounded-xl flex items-center justify-center"
                      style={{
                        background: `${feature.color}14`,
                        border: `1px solid ${feature.color}28`,
                      }}
                    >
                      <Icon className="h-4 w-4" style={{ color: feature.color }} strokeWidth={2.2} />
                    </div>
                    <span
                      className="text-[9px] uppercase tracking-wider font-semibold px-2 py-0.5 rounded-full"
                      style={{
                        background: `${feature.color}12`,
                        border: `1px solid ${feature.color}22`,
                        color: feature.color,
                      }}
                    >
                      Source-bound
                    </span>
                  </div>
                  <h3 className="text-sm font-semibold tracking-tight mb-2" style={{ color: "rgba(255,255,255,0.85)" }}>
                    {feature.title}
                  </h3>
                  <p className="text-[13px] leading-relaxed" style={{ color: "rgba(255,255,255,0.38)" }}>
                    {feature.description}
                  </p>
                </article>
              );
            })}
          </div>
        </section>

        {/* ── Divider ── */}
        <div
          className="mx-auto max-w-5xl h-px"
          style={{ background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.08), transparent)" }}
        />

        {/* ── How It Works ── */}
        <section id="workflow" className="mx-auto max-w-7xl px-4 py-20 md:px-8">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 rounded-full px-3 py-1 mb-4"
              style={{
                background: "rgba(232,98,42,0.08)",
                border: "1px solid rgba(232,98,42,0.2)",
              }}
            >
              <Zap className="w-3 h-3" style={{ color: "#e8622a" }} strokeWidth={2} />
              <span className="text-[10px] uppercase tracking-[0.18em] font-semibold" style={{ color: "#e8622a" }}>
                The Workflow
              </span>
            </div>
            <h2 className="text-3xl font-bold tracking-tight md:text-4xl" style={{ color: "rgba(255,255,255,0.9)" }}>
              From raw material to{" "}
              <span style={{
                background: "linear-gradient(135deg, #e8622a 0%, #f97316 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}>
                cited deliverables
              </span>
            </h2>
          </div>

          <div className="grid gap-4 md:grid-cols-3 relative">
            {/* Connector line */}
            <div
              className="hidden md:block absolute top-10 left-[calc(16.67%+16px)] right-[calc(16.67%+16px)] h-px"
              style={{ background: "linear-gradient(90deg, rgba(232,98,42,0.3), rgba(232,98,42,0.1), rgba(232,98,42,0.3))" }}
            />

            {workflowSteps.map((step, index) => {
              const Icon = step.icon;
              return (
                <article
                  key={step.title}
                  className="relative rounded-2xl p-6"
                  style={{
                    background: "rgba(255,255,255,0.025)",
                    border: "1px solid rgba(255,255,255,0.07)",
                  }}
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center"
                      style={{
                        background: `${step.color}14`,
                        border: `1px solid ${step.color}28`,
                      }}
                    >
                      <Icon className="w-5 h-5" style={{ color: step.color }} strokeWidth={2} />
                    </div>
                    <span
                      className="font-mono text-2xl font-bold"
                      style={{ color: "rgba(255,255,255,0.08)" }}
                    >
                      {step.number}
                    </span>
                  </div>
                  <h3 className="text-base font-semibold tracking-tight mb-2" style={{ color: "rgba(255,255,255,0.85)" }}>
                    {step.title}
                  </h3>
                  <p className="text-[13px] leading-relaxed" style={{ color: "rgba(255,255,255,0.38)" }}>
                    {step.text}
                  </p>
                  {index < workflowSteps.length - 1 && (
                    <div
                      className="md:hidden mt-4 flex items-center justify-center"
                      style={{ color: "rgba(232,98,42,0.3)" }}
                    >
                      <ChevronRight className="w-4 h-4" />
                    </div>
                  )}
                </article>
              );
            })}
          </div>
        </section>

        {/* ── Divider ── */}
        <div
          className="mx-auto max-w-5xl h-px"
          style={{ background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.08), transparent)" }}
        />

        {/* ── Final CTA ── */}
        <section className="mx-auto max-w-4xl px-4 py-20 text-center md:px-8">
          <div
            className="rounded-3xl px-8 py-14 relative overflow-hidden"
            style={{
              background: "rgba(232,98,42,0.07)",
              border: "1px solid rgba(232,98,42,0.18)",
              boxShadow: "0 0 80px rgba(232,98,42,0.06) inset",
            }}
          >
            {/* Corner glow */}
            <div
              className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-32 pointer-events-none"
              style={{
                background: "radial-gradient(ellipse at center top, rgba(232,98,42,0.2) 0%, transparent 70%)",
              }}
            />

            <div className="relative">
              <NaphtalLogo size={48} className="mx-auto mb-6 opacity-80" />
              <h2
                className="text-3xl font-bold tracking-tight md:text-4xl mb-4"
                style={{ color: "rgba(255,255,255,0.9)" }}
              >
                Ready to move from accumulation to clarity?
              </h2>
              <p
                className="mx-auto max-w-[55ch] text-sm leading-relaxed md:text-base mb-8"
                style={{ color: "rgba(255,255,255,0.4)" }}
              >
                Sign in to use the full workspace and turn raw source material into structured analysis you can act on.
              </p>
              <div className="flex flex-wrap items-center justify-center gap-3">
                <Link
                  href="/login?next=/canvas"
                  className="inline-flex h-11 items-center gap-2 rounded-xl px-6 text-sm font-semibold text-white transition-all hover:brightness-110 active:scale-[0.98]"
                  style={{
                    background: "linear-gradient(135deg, #e8622a 0%, #d4521f 100%)",
                    boxShadow: "0 4px 20px rgba(232,98,42,0.4)",
                  }}
                >
                  Enter the Workspace
                  <ArrowRightFromLine className="h-4 w-4" strokeWidth={2.2} />
                </Link>
                <Link
                  href="/login?mode=signup&next=/canvas"
                  className="inline-flex h-11 items-center rounded-xl px-6 text-sm font-semibold transition-all"
                  style={{
                    background: "rgba(255,255,255,0.04)",
                    border: "1px solid rgba(255,255,255,0.12)",
                    color: "rgba(255,255,255,0.6)",
                  }}
                >
                  Create Account
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* ── Footer ── */}
        <footer
          className="border-t py-8"
          style={{ borderColor: "rgba(255,255,255,0.06)" }}
        >
          <div className="mx-auto max-w-7xl px-4 md:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <NaphtalLogo size={22} className="opacity-60" />
              <span className="font-mono text-[12px] font-semibold" style={{ color: "rgba(255,255,255,0.35)" }}>
                NaphtalAI Research Agent
              </span>
            </div>
            <p className="text-[11px]" style={{ color: "rgba(255,255,255,0.2)" }}>
              Research Intelligence Platform · Source-bound by design
            </p>
          </div>
        </footer>
      </main>
    </div>
  );
}
