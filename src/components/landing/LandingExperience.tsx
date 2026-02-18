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
    icon: PanelsTopLeft,
    title: "Structured Canvas",
    description:
      "Map documents, notes, and ideas on an infinite canvas designed for analytical structure instead of visual clutter.",
  },
  {
    icon: BotMessageSquare,
    title: "Analytical Dialogue",
    description:
      "Interrogate your material with AI to move from raw references toward coherent interpretation and usable conclusions.",
  },
  {
    icon: FileStack,
    title: "Scalable Source Viewer",
    description:
      "Open PDFs and source files as first-class study objects with smooth zoom, navigation, and pin-to-canvas composition.",
  },
  {
    icon: Waypoints,
    title: "Connection Logic",
    description:
      "Connections are validated with explicit semantics so your graph reflects reasoning structure, not guesswork.",
  },
  {
    icon: ScanSearch,
    title: "Pattern Exploration",
    description:
      "Trace motifs, entities, and ideas across the graph, then bring discoveries back into context for deeper synthesis.",
  },
  {
    icon: Crosshair,
    title: "Refined Research UX",
    description:
      "A focused, modern interface with disciplined spacing and responsive controls built for long-form analytical work.",
  },
];

const workflowSteps = [
  {
    title: "Gather",
    text: "Collect source materials, open them in context, and pin the most meaningful fragments to your canvas.",
  },
  {
    title: "Distill",
    text: "Extract entities, themes, and relationships to transform scattered information into structured knowledge.",
  },
  {
    title: "Illuminate",
    text: "Use scoped AI analysis to clarify narratives, surface implications, and produce reports that support confident decisions.",
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

          <div className="mt-10 rounded-2xl border border-border/70 bg-card/75 p-4 text-left shadow-2xl backdrop-blur-sm md:p-5">
            <div className="mb-3 flex items-center justify-between">
              <div className="text-sm font-semibold">Workspace Preview</div>
              <div className="rounded-md border border-border bg-background px-2 py-1 text-[10px] uppercase tracking-wide text-muted-foreground">
                Live Canvas
              </div>
            </div>
            <div className="grid gap-3 md:grid-cols-12">
              <div className="rounded-lg border border-border bg-background p-3 md:col-span-7">
                <div className="mb-2 text-xs font-semibold text-foreground">Pinned Source Material</div>
                <div className="h-28 rounded-md border border-border/70 bg-muted/20" />
              </div>
              <div className="grid gap-3 md:col-span-5">
                <div className="rounded-lg border border-border bg-background p-3">
                  <div className="text-xs font-semibold">Concepts</div>
                  <p className="mt-1 text-[11px] text-muted-foreground">Themes, symbols, people, places</p>
                </div>
                <div className="rounded-lg border border-border bg-background p-3">
                  <div className="text-xs font-semibold">Insights</div>
                  <p className="mt-1 text-[11px] text-muted-foreground">Structured relationships + interpretation</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <div className="mx-auto mt-14 h-px w-full max-w-6xl bg-border/60" />

        <section className="mx-auto mt-14 max-w-6xl">
          <h2 className="text-center text-2xl font-semibold tracking-tight md:text-3xl">Core capabilities</h2>
          <p className="mx-auto mt-2 max-w-[62ch] text-center text-sm text-muted-foreground md:text-base">
            A modern system for transforming archival material into interpretable models and communicable outcomes.
          </p>

          <div className="mt-8 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {featureCards.map((feature) => {
              const Icon = feature.icon;
              return (
                <article
                  key={feature.title}
                  className="group rounded-xl border border-border/70 bg-card/70 p-4 transition-all hover:-translate-y-0.5 hover:border-primary/35 hover:shadow-xl"
                >
                  <div className="mb-3 inline-flex h-8 w-8 items-center justify-center rounded-md border border-border bg-background">
                    <Icon className="h-4 w-4 text-primary" strokeWidth={2.2} />
                  </div>
                  <h3 className="text-sm font-semibold tracking-tight">{feature.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{feature.description}</p>
                </article>
              );
            })}
          </div>
        </section>

        <div className="mx-auto mt-14 h-px w-full max-w-6xl bg-border/60" />

        <section className="mx-auto mt-14 max-w-6xl">
          <h2 className="text-center text-2xl font-semibold tracking-tight md:text-3xl">Workflow</h2>
          <p className="mx-auto mt-2 max-w-[56ch] text-center text-sm text-muted-foreground md:text-base">
            A clear path from source material to synthesis, interpretation, and delivery.
          </p>
          <div className="mt-8 grid gap-3 md:grid-cols-3">
            {workflowSteps.map((step, index) => (
              <article key={step.title} className="rounded-xl border border-border/70 bg-card/70 p-4">
                <div className="mb-3 inline-flex h-6 min-w-6 items-center justify-center rounded-md border border-primary/35 bg-primary/10 px-1.5 text-[11px] font-semibold text-primary">
                  0{index + 1}
                </div>
                <h3 className="text-sm font-semibold tracking-tight">{step.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{step.text}</p>
              </article>
            ))}
          </div>
        </section>

        <div className="mx-auto mt-14 h-px w-full max-w-6xl bg-border/60" />

        <section className="mx-auto mt-14 max-w-4xl rounded-2xl border border-border/70 bg-card/70 p-6 text-center shadow-xl md:p-8">
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
