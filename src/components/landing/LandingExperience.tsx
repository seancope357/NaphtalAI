import Link from "next/link";
import {
  ArrowRightFromLine,
  BotMessageSquare,
  Crosshair,
  Diamond,
  FileStack,
  Fingerprint,
  LockKeyhole,
  PanelsTopLeft,
  ScanSearch,
  Waypoints,
} from "lucide-react";
import { ModeToggle } from "@/components/mode-toggle";

const featureCards = [
  {
    icon: ScanSearch,
    title: "Freemasonic Corpus Intelligence",
    description:
      "Analyze rituals, lodge records, correspondence, and investigative documents in one scoped AI workspace.",
  },
  {
    icon: FileStack,
    title: "Source-First Evidence Layer",
    description:
      "Every claim remains linked to original PDFs, images, and extracted passages for transparent verification.",
  },
  {
    icon: Waypoints,
    title: "Citation-Locked Connection Graph",
    description:
      "Connections are anchored to source material so relationships stay defensible instead of speculative.",
  },
  {
    icon: BotMessageSquare,
    title: "AI Research Copilot",
    description:
      "Interrogate sources, compare interpretations, and preserve your reasoning chain across sessions.",
  },
  {
    icon: PanelsTopLeft,
    title: "Presentation Builder",
    description:
      "Transform validated findings into report outlines and slide narratives without losing citation context.",
  },
  {
    icon: Crosshair,
    title: "Report-Ready Outputs",
    description:
      "Produce briefs and decks with structured sections, source notes, and page-level reference trails.",
  },
];

const workflowSteps = [
  {
    title: "Ingest + Tag",
    text: "Upload source material, map context on the canvas, and assign clear evidentiary labels.",
  },
  {
    title: "Analyze + Validate",
    text: "Run AI extraction and reasoning passes while tying links and findings to source anchors.",
  },
  {
    title: "Present + Deliver",
    text: "Generate research reports and slide decks that keep citations attached to every conclusion.",
  },
];

export default function LandingExperience() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-background text-foreground">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(1200px_620px_at_12%_-20%,rgba(59,130,246,0.16),transparent_60%),radial-gradient(900px_520px_at_100%_0%,rgba(14,165,233,0.12),transparent_62%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(148,163,184,0.08)_1px,transparent_1px),linear-gradient(to_bottom,rgba(148,163,184,0.08)_1px,transparent_1px)] bg-[size:44px_44px]" />
      </div>

      <header className="sticky top-0 z-20 border-b border-border/60 bg-background/80 backdrop-blur-xl">
        <div className="mx-auto flex h-12 max-w-7xl items-center justify-between px-4 md:px-8">
          <div className="flex items-center gap-2.5">
            <div className="grid h-7 w-7 place-items-center rounded-md border border-border bg-card shadow-sm">
              <Diamond className="h-3.5 w-3.5 text-primary" strokeWidth={2.2} />
            </div>
            <span className="text-sm font-semibold tracking-tight">NaphtalAI</span>
          </div>
          <div className="flex items-center gap-2">
            <ModeToggle className="border-border bg-card text-foreground hover:bg-accent" />
            <Link
              href="/login"
              className="hidden h-9 items-center rounded-md border border-border bg-card px-3 text-sm font-medium text-foreground transition-colors hover:bg-accent sm:inline-flex"
            >
              Sign In
            </Link>
            <Link
              href="/login?next=/canvas"
              className="inline-flex h-9 items-center rounded-md bg-primary px-3 text-sm font-medium text-primary-foreground transition hover:brightness-110"
            >
              Open Workspace
            </Link>
          </div>
        </div>
      </header>

      <main className="relative mx-auto max-w-7xl px-4 pb-20 pt-12 md:px-8 md:pt-14">
        <section className="mx-auto max-w-5xl text-center">
          <p className="inline-flex items-center gap-2 rounded-full border border-primary/25 bg-primary/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-primary">
            Research Intelligence Platform
          </p>

          <h1 className="mx-auto mt-5 max-w-[18ch] text-4xl font-semibold leading-tight tracking-tight text-balance md:text-6xl">
            Build clarity from complex source material.
          </h1>

          <p className="mx-auto mt-5 max-w-[65ch] text-sm text-muted-foreground md:text-base">
            NaphtalAI turns dense documents into connected context. Structure relationships, test
            interpretations, and generate outputs that are defensible, clear, and presentation-ready.
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/login?next=/canvas"
              className="inline-flex h-10 items-center gap-2 rounded-md bg-primary px-4 text-sm font-semibold text-primary-foreground transition hover:brightness-110"
            >
              Enter the Research Workspace
              <ArrowRightFromLine className="h-4 w-4" strokeWidth={2.2} />
            </Link>
            <Link
              href="/login"
              className="inline-flex h-10 items-center rounded-md border border-border bg-card px-4 text-sm font-semibold text-foreground transition hover:bg-accent"
            >
              View Auth Flow
            </Link>
          </div>

          <div className="mt-7 flex flex-wrap items-center justify-center gap-6 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1.5">
              <Fingerprint className="h-3.5 w-3.5 text-primary" strokeWidth={2.2} />
              Private by default
            </span>
            <span className="inline-flex items-center gap-1.5">
              <LockKeyhole className="h-3.5 w-3.5 text-primary" strokeWidth={2.2} />
              Structured reasoning graph
            </span>
          </div>

          <div className="mt-10 rounded-2xl border border-border/70 bg-card/95 p-4 text-left shadow-2xl backdrop-blur-sm md:p-5">
            <div className="mb-3 flex items-center justify-between">
              <div className="text-sm font-semibold">Workspace Preview</div>
              <div className="rounded-md border border-border bg-background px-2 py-1 text-[10px] uppercase tracking-wide text-muted-foreground">
                Live Canvas
              </div>
            </div>
            <div className="grid gap-3 md:grid-cols-12">
              <div className="rounded-lg border border-border bg-card p-3 md:col-span-7">
                <div className="mb-2 text-xs font-semibold text-foreground">Pinned Source Material</div>
                <div className="h-28 rounded-md border border-border/70 bg-muted/20" />
              </div>
              <div className="grid gap-3 md:col-span-5">
                <div className="rounded-lg border border-border bg-card p-3">
                  <div className="text-xs font-semibold">Concepts</div>
                  <p className="mt-1 text-[11px] text-muted-foreground">Themes, symbols, people, places</p>
                </div>
                <div className="rounded-lg border border-border bg-card p-3">
                  <div className="text-xs font-semibold">Insights</div>
                  <p className="mt-1 text-[11px] text-muted-foreground">Structured relationships + interpretation</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <div className="mx-auto mt-14 h-px w-full max-w-6xl bg-border/60" />

        <section className="mx-auto mt-14 max-w-6xl">
          <div className="rounded-2xl border border-border/70 bg-card/95 p-5 shadow-2xl backdrop-blur-sm md:p-8">
            <div className="grid gap-6 lg:grid-cols-12">
              <div className="lg:col-span-4">
                <p className="inline-flex items-center gap-2 rounded-full border border-primary/25 bg-primary/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-primary">
                  AI-Powered Freemasonic Research
                </p>
                <h2 className="mt-4 text-2xl font-semibold tracking-tight md:text-3xl">
                  From source material to cited reports and presentation decks
                </h2>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground md:text-base">
                  Build investigations with modern AI tooling while preserving scholarly rigor. NaphtalAI
                  keeps every interpretation connected to its source material so exports stay defensible.
                </p>
                <div className="mt-4 grid gap-2 text-xs text-muted-foreground">
                  <div className="rounded-md border border-border/70 bg-card/90 px-3 py-2">
                    Citation rule: every generated claim must reference source evidence.
                  </div>
                  <div className="rounded-md border border-border/70 bg-card/90 px-3 py-2">
                    Reports and slide outputs inherit source links from the canvas graph.
                  </div>
                </div>
              </div>

              <div className="lg:col-span-8">
                <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                  {featureCards.map((feature) => {
                    const Icon = feature.icon;
                    return (
                      <article
                        key={feature.title}
                        className="group rounded-xl border border-border/70 bg-card/95 p-4 transition-all hover:-translate-y-0.5 hover:border-primary/35 hover:shadow-xl"
                      >
                        <div className="mb-3 flex items-center justify-between">
                          <div className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-border bg-card">
                            <Icon className="h-4 w-4 text-primary" strokeWidth={2.2} />
                          </div>
                          <span className="rounded-md border border-primary/25 bg-primary/10 px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-primary">
                            Source-bound
                          </span>
                        </div>
                        <h3 className="text-sm font-semibold tracking-tight">{feature.title}</h3>
                        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{feature.description}</p>
                      </article>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="mt-8 rounded-xl border border-border/70 bg-card/95 p-4 md:p-5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h3 className="text-sm font-semibold tracking-tight md:text-base">Citation Guardrails Workflow</h3>
                <span className="rounded-md border border-primary/25 bg-primary/10 px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-primary">
                  Always cited sources
                </span>
              </div>
              <div className="mt-4 grid gap-3 md:grid-cols-3">
                {workflowSteps.map((step, index) => (
                  <article key={step.title} className="rounded-lg border border-border/70 bg-card/95 p-4">
                    <div className="mb-3 inline-flex h-6 min-w-6 items-center justify-center rounded-md border border-primary/35 bg-primary/10 px-1.5 text-[11px] font-semibold text-primary">
                      0{index + 1}
                    </div>
                    <h4 className="text-sm font-semibold tracking-tight">{step.title}</h4>
                    <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{step.text}</p>
                  </article>
                ))}
              </div>
            </div>
          </div>
        </section>

        <div className="mx-auto mt-14 h-px w-full max-w-6xl bg-border/60" />

        <section className="mx-auto mt-14 max-w-4xl rounded-2xl border border-border/70 bg-card/95 p-6 text-center shadow-xl md:p-8">
          <h2 className="text-2xl font-semibold tracking-tight md:text-3xl">Ready to move from accumulation to clarity?</h2>
          <p className="mx-auto mt-3 max-w-[58ch] text-sm text-muted-foreground md:text-base">
            Sign in to use the full workspace and turn raw source material into structured analysis you can act on.
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/login?next=/canvas"
              className="inline-flex h-10 items-center rounded-md bg-primary px-4 text-sm font-semibold text-primary-foreground transition hover:brightness-110"
            >
              Continue to Auth
            </Link>
            <Link
              href="/login?mode=signup&next=/canvas"
              className="inline-flex h-10 items-center rounded-md border border-border bg-background px-4 text-sm font-semibold transition hover:bg-accent"
            >
              Create account
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
}
