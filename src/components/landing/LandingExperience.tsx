import Link from "next/link";
import {
  ArrowRight,
  Brain,
  FileSearch,
  GitBranch,
  Lock,
  Network,
  Search,
  ShieldCheck,
  Sparkles,
  Workflow,
} from "lucide-react";

const featureCards = [
  {
    icon: Network,
    title: "Visual Research Canvas",
    description:
      "Map documents, notes, and entities on a structured infinite canvas with strict connection rules and semantic links.",
  },
  {
    icon: Brain,
    title: "Agentic Analysis",
    description:
      "Run guided analysis modes that extract entities, connect evidence, and generate readable findings from selected context.",
  },
  {
    icon: FileSearch,
    title: "Scalable PDF Workflow",
    description:
      "Open and inspect PDFs as first-class assets with zoom, page navigation, and pin-to-canvas composition.",
  },
  {
    icon: GitBranch,
    title: "Structured Link Logic",
    description:
      "Connections are validated and enriched with semantic metadata so downstream report generation stays grounded.",
  },
  {
    icon: Search,
    title: "Knowledge Retrieval",
    description:
      "Search entities and graph context quickly, then pull any result back into the workspace for deeper analysis.",
  },
  {
    icon: Workflow,
    title: "Production-Ready UX",
    description:
      "Dense, modern workspace ergonomics with responsive paneling, consistent card systems, and interaction-first controls.",
  },
];

const workflowSteps = [
  {
    title: "Ingest",
    text: "Upload source files, open them in the viewer, and pin key evidence directly to the canvas.",
  },
  {
    title: "Structure",
    text: "Extract entities and build explicit relationships so your information model stays interpretable.",
  },
  {
    title: "Synthesize",
    text: "Use the AI assistant on scoped node selections to produce findings, briefs, and presentation-ready outputs.",
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
              <Sparkles className="h-3.5 w-3.5 text-primary" />
            </div>
            <span className="text-sm font-semibold tracking-tight">NaphtalAI</span>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href="/login"
              className="inline-flex h-9 items-center rounded-md border border-border bg-card px-3 text-sm font-medium text-foreground transition-colors hover:bg-accent"
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
            Modern intelligence workbench for evidence-driven research
          </h1>

          <p className="mx-auto mt-5 max-w-[65ch] text-sm text-muted-foreground md:text-base">
            NaphtalAI turns fragmented archives into a structured, navigable knowledge graph. Ingest
            documents, connect evidence, and collaborate with AI in a workspace designed for serious
            analysis.
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/login?next=/canvas"
              className="inline-flex h-10 items-center gap-2 rounded-md bg-primary px-4 text-sm font-semibold text-primary-foreground transition hover:brightness-110"
            >
              Start Investigating
              <ArrowRight className="h-4 w-4" />
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
              <ShieldCheck className="h-3.5 w-3.5 text-primary" />
              Private by default
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Lock className="h-3.5 w-3.5 text-primary" />
              Auth-gated workspace
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
                <div className="mb-2 text-xs font-semibold text-foreground">Pinned PDF Evidence</div>
                <div className="h-28 rounded-md border border-border/70 bg-muted/20" />
              </div>
              <div className="grid gap-3 md:col-span-5">
                <div className="rounded-lg border border-border bg-background p-3">
                  <div className="text-xs font-semibold">Entities</div>
                  <p className="mt-1 text-[11px] text-muted-foreground">People, locations, organizations</p>
                </div>
                <div className="rounded-lg border border-border bg-background p-3">
                  <div className="text-xs font-semibold">Connections</div>
                  <p className="mt-1 text-[11px] text-muted-foreground">Semantic relationships + confidence</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <div className="mx-auto mt-14 h-px w-full max-w-6xl bg-border/60" />

        <section className="mx-auto mt-14 max-w-6xl">
          <h2 className="text-center text-2xl font-semibold tracking-tight md:text-3xl">Core capabilities</h2>
          <p className="mx-auto mt-2 max-w-[62ch] text-center text-sm text-muted-foreground md:text-base">
            Structured sections, consistent card sizing, and clean interaction density built for modern
            research workflows.
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
                    <Icon className="h-4 w-4 text-primary" />
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
            A clear, step-based process from evidence intake to AI-assisted deliverables.
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
          <h2 className="text-2xl font-semibold tracking-tight md:text-3xl">Ready to modernize your research stack?</h2>
          <p className="mx-auto mt-3 max-w-[58ch] text-sm text-muted-foreground md:text-base">
            Sign in to access the full canvas workspace, entity graph, and AI-assisted analysis pipeline.
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
