"use client";

import { useState, useRef } from "react";
import { motion, useInView, AnimatePresence } from "framer-motion";
import Link from "next/link";
import {
  Network,
  FileSearch,
  Brain,
  GitBranch,
  Eye,
  Search,
  ChevronDown,
  ArrowRight,
  Star,
  Menu,
  X,
  Upload,
  CheckCircle,
  Shield,
  Zap,
  Lock,
  BookOpen,
  Users,
  Map,
} from "lucide-react";

// ─── Tokens ────────────────────────────────────────────────────────────────
const G = "#c9a227";       // Revelation Gold
const GB = "#e8c84a";      // Gold bright
const GD = "rgba(201,162,39,0.12)"; // Gold dim
const GB2 = "rgba(201,162,39,0.25)"; // Gold border
const BG = "#050911";      // Background
const CARD = "#0b1120";    // Card surface
const CARD2 = "#0f1929";   // Card surface 2
const TEXT = "#f0ebe0";    // Primary text
const MUTED = "#8a8070";   // Muted text
const MUTED2 = "#5a5548";  // Dimmer muted

// ─── Animation Variants ────────────────────────────────────────────────────
const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] } },
};

const fadeIn = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.6 } },
};

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.11 } },
};

const staggerFast = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.07 } },
};


// ─── Grid Background ───────────────────────────────────────────────────────
function GridBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
      <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="grid" width="48" height="48" patternUnits="userSpaceOnUse">
            <path d="M 48 0 L 0 0 0 48" fill="none" stroke={G} strokeWidth="0.3" opacity="0.2" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid)" />
      </svg>
      {/* Radial fade overlay */}
      <div
        className="absolute inset-0"
        style={{
          background: `radial-gradient(ellipse 70% 70% at 50% 50%, transparent 0%, ${BG} 75%)`,
        }}
      />
    </div>
  );
}

// ─── Section wrapper with scroll-triggered animation ──────────────────────
function Section({
  children,
  className = "",
  id,
}: {
  children: React.ReactNode;
  className?: string;
  id?: string;
}) {
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  return (
    <motion.section
      ref={ref}
      id={id}
      variants={stagger}
      initial="hidden"
      animate={inView ? "visible" : "hidden"}
      className={className}
    >
      {children}
    </motion.section>
  );
}

// ─── Pill label ────────────────────────────────────────────────────────────
function Pill({ children }: { children: React.ReactNode }) {
  return (
    <motion.span
      variants={fadeUp}
      className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold tracking-widest uppercase"
      style={{ background: GD, color: G, border: `1px solid ${GB2}` }}
    >
      {children}
    </motion.span>
  );
}

// ─── Data ──────────────────────────────────────────────────────────────────
const NAV_LINKS = [
  { label: "Features", href: "#features" },
  { label: "How It Works", href: "#how-it-works" },
  { label: "Use Cases", href: "#use-cases" },
  { label: "FAQ", href: "#faq" },
];

const FEATURES = [
  {
    icon: <Network size={26} />,
    tag: "Canvas",
    title: "The Trestleboard",
    desc: "An infinite visual canvas for mapping connections between documents, entities, and symbols. Pan, zoom, snap-to-grid, and build your research graph with full undo/redo history.",
  },
  {
    icon: <Brain size={26} />,
    tag: "AI",
    title: "The Overseer",
    desc: "Your dedicated AI research companion. Ask questions, request analyses, and receive scholarly insights from your documents—powered by OpenAI or Anthropic via your own API key.",
  },
  {
    icon: <FileSearch size={26} />,
    tag: "Storage",
    title: "The Archives",
    desc: "A private, browser-local document library. Upload PDFs, images, and text files stored securely in IndexedDB—zero server uploads, zero data exposure.",
  },
  {
    icon: <Search size={26} />,
    tag: "Analysis",
    title: "Entity Extraction",
    desc: "AI automatically identifies and classifies people, lodges, locations, dates, symbols, and concepts across your documents with contextual Masonic awareness.",
  },
  {
    icon: <Eye size={26} />,
    tag: "Symbols",
    title: "Symbol Recognition",
    desc: "Specialized analysis for Freemasonic iconography—the Square and Compasses, Eye of Providence, pillars, and more—with historical context and ritual significance.",
  },
  {
    icon: <GitBranch size={26} />,
    tag: "Connections",
    title: "Connection Discovery",
    desc: "Cross-reference multiple documents simultaneously to surface hidden relationships, shared members, temporal patterns, and symbolic lineages invisible to manual reading.",
  },
];

const STEPS = [
  {
    num: "01",
    icon: <Upload size={20} />,
    title: "Upload Your Archives",
    desc: "Add PDFs, images, text files, or JSON exports to your private local library. Scanned lodge records, typed manuscripts, and digital research are all supported.",
  },
  {
    num: "02",
    icon: <Brain size={20} />,
    title: "AI Extracts the Knowledge",
    desc: "The Overseer analyzes your documents, identifying named entities and classifying relationships between people, places, symbols, and organizations with Masonic expertise.",
  },
  {
    num: "03",
    icon: <Map size={20} />,
    title: "Map the Connections",
    desc: "Pin documents and entities onto The Trestleboard canvas. Draw connections, annotate relationships, and construct a living visual knowledge graph.",
  },
  {
    num: "04",
    icon: <Zap size={20} />,
    title: "Discover Hidden Insights",
    desc: "Query your entire knowledge base in natural language. Cross-reference archives, trace symbolic lineages, and surface patterns that would take years to find manually.",
  },
];

const USE_CASES = [
  {
    icon: <BookOpen size={22} />,
    audience: "Lodge Historians",
    title: "Preserve and Illuminate Lodge Records",
    desc: "Digitize decades of meeting minutes, membership rolls, and correspondence. Build a living history of your lodge with connections to the broader Masonic tradition.",
    points: [
      "Parse handwritten and scanned documents",
      "Track member lineages across generations",
      "Map lodge events to historical context",
    ],
  },
  {
    icon: <Search size={22} />,
    audience: "Academic Researchers",
    title: "Cross-Reference Primary Sources at Scale",
    desc: "Analyze multiple archives simultaneously. Identify common figures, trace ritual evolution, and establish citation-grade provenance across vast document collections.",
    points: [
      "Multi-document entity cross-referencing",
      "Symbol and ritual evolution mapping",
      "Source tracking with full context",
    ],
  },
  {
    icon: <Users size={22} />,
    audience: "Personal Study",
    title: "Build Your Private Knowledge Base",
    desc: "Explore symbolism, understand degrees, and connect ritual teachings to their historical roots with an AI companion that guides your Masonic journey.",
    points: [
      "AI-guided symbolic interpretation",
      "Personalized research pathways",
      "Fully private and offline by default",
    ],
  },
];

const TESTIMONIALS = [
  {
    quote:
      "NaphtalAI transformed how I research lodge history. What used to take weeks of manual cross-referencing now surfaces in minutes on the canvas.",
    name: "Brother J. Whitmore",
    title: "Senior Warden, Lodge 441",
    rating: 5,
  },
  {
    quote:
      "The entity extraction is remarkably accurate for Masonic texts. It correctly identifies ritual terminology and symbolic references that generic AI tools miss entirely.",
    name: "Dr. A. Pemberton",
    title: "Masonic Historian, Oxford",
    rating: 5,
  },
  {
    quote:
      "Privacy-first architecture was the deciding factor. My research stays on my machine. The visual knowledge graph is unlike anything else available for this field.",
    name: "M. Harrington",
    title: "Independent Researcher",
    rating: 5,
  },
];

const FAQS = [
  {
    q: "What is NaphtalAI?",
    a: "NaphtalAI is an AI-powered research platform for Freemasonic studies. It combines a visual knowledge graph canvas (The Trestleboard), a private document archive (The Archives), and an AI research assistant (The Overseer) to help researchers explore historical texts, extract entities, and map symbolic connections.",
  },
  {
    q: "What document formats are supported?",
    a: "NaphtalAI supports PDF, TXT, JSON, JPG, PNG, and CSV files. You can upload scanned lodge documents, typed manuscripts, meeting minutes, images of symbols, and structured data exports from other research tools.",
  },
  {
    q: "Where is my data stored? Is it private?",
    a: "Your documents are stored locally in your browser's IndexedDB—nothing is uploaded to any external server. This privacy-first design means your research remains entirely under your control. Canvas states are also saved locally.",
  },
  {
    q: "Which AI providers does NaphtalAI support?",
    a: "NaphtalAI supports both OpenAI and Anthropic. You supply your own API key through the Overseer settings panel. This gives you full model control and direct billing—NaphtalAI does not proxy or store your key.",
  },
  {
    q: "What is The Trestleboard?",
    a: "The Trestleboard is NaphtalAI's infinite canvas—named after the master's plan board used in Freemasonry. It's where you build your visual knowledge graph, placing documents and entities as nodes and drawing connections between them. It supports pan/zoom, snap-to-grid, and 50-step undo/redo.",
  },
  {
    q: "Is there a cost to use NaphtalAI?",
    a: "The NaphtalAI platform is free to use. The only cost is the API usage from your chosen provider (OpenAI or Anthropic), billed directly through their platforms. No subscription is required.",
  },
  {
    q: "Can I collaborate with other researchers?",
    a: "Real-time multi-user collaboration is planned for a future release using Supabase. Currently, you can export your canvas as an image and share findings manually. We're actively building the collaboration layer.",
  },
  {
    q: "Does NaphtalAI require an internet connection?",
    a: "The application itself runs in your browser and document storage is local-first. An internet connection is only required when making AI analysis requests to your chosen provider (OpenAI or Anthropic).",
  },
];

// ─── FAQ Item ──────────────────────────────────────────────────────────────
function FAQItem({ q, a, index }: { q: string; a: string; index: number }) {
  const [open, setOpen] = useState(false);
  return (
    <motion.div
      variants={fadeUp}
      custom={index}
      className="border-b"
      style={{ borderColor: GB2 }}
    >
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between py-5 text-left gap-4 focus:outline-none group"
        aria-expanded={open}
      >
        <span
          className="font-medium text-base leading-snug transition-colors"
          style={{ color: open ? G : TEXT, fontFamily: "var(--font-display, Spectral, serif)" }}
        >
          {q}
        </span>
        <motion.div
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ duration: 0.25 }}
          className="shrink-0"
          style={{ color: G }}
        >
          <ChevronDown size={18} />
        </motion.div>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            key="answer"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            style={{ overflow: "hidden" }}
          >
            <p className="pb-5 text-sm leading-relaxed" style={{ color: MUTED }}>
              {a}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────────
export default function LandingPage() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [email, setEmail] = useState("");

  return (
    <div
      className="min-h-screen w-full"
      style={{ backgroundColor: BG, color: TEXT, fontFamily: "var(--font-sans, Inter, sans-serif)" }}
    >
      {/* ── Navigation ── */}
      <header
        className="fixed top-0 left-0 right-0 z-50"
        style={{ borderBottom: `1px solid ${GB2}`, background: `rgba(5,9,17,0.85)`, backdropFilter: "blur(18px)" }}
      >
        <nav className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-8 h-8 shrink-0">
              <img src="/NaphtalAI-Logo.svg" width={32} height={32} alt="NaphtalAI" className="w-8 h-8 object-contain" />
            </div>
            <span
              className="text-lg font-semibold tracking-tight"
              style={{ fontFamily: "var(--font-display, Spectral, serif)", color: TEXT }}
            >
              Naphtal<span style={{ color: G }}>AI</span>
            </span>
          </Link>

          {/* Desktop links */}
          <ul className="hidden md:flex items-center gap-8">
            {NAV_LINKS.map((l) => (
              <li key={l.label}>
                <a
                  href={l.href}
                  className="text-sm transition-colors"
                  style={{ color: MUTED }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = TEXT)}
                  onMouseLeave={(e) => (e.currentTarget.style.color = MUTED)}
                >
                  {l.label}
                </a>
              </li>
            ))}
          </ul>

          {/* Desktop CTA */}
          <div className="hidden md:flex items-center gap-3">
            <Link
              href="/login"
              className="text-sm px-4 py-2 rounded-md transition-colors"
              style={{ color: MUTED }}
              onMouseEnter={(e) => (e.currentTarget.style.color = TEXT)}
              onMouseLeave={(e) => (e.currentTarget.style.color = MUTED)}
            >
              Sign In
            </Link>
            <Link
              href="/canvas"
              className="text-sm px-5 py-2 rounded-md font-medium transition-all"
              style={{ background: G, color: "#000" }}
              onMouseEnter={(e) => (e.currentTarget.style.background = GB)}
              onMouseLeave={(e) => (e.currentTarget.style.background = G)}
            >
              Open Research
            </Link>
          </div>

          {/* Mobile menu toggle */}
          <button
            className="md:hidden p-2 rounded-md"
            style={{ color: MUTED }}
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </nav>

        {/* Mobile menu */}
        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25 }}
              style={{ overflow: "hidden", background: CARD, borderBottom: `1px solid ${GB2}` }}
            >
              <div className="px-6 py-4 flex flex-col gap-4">
                {NAV_LINKS.map((l) => (
                  <a
                    key={l.label}
                    href={l.href}
                    className="text-sm py-1"
                    style={{ color: MUTED }}
                    onClick={() => setMobileOpen(false)}
                  >
                    {l.label}
                  </a>
                ))}
                <hr style={{ borderColor: GB2 }} />
                <Link
                  href="/canvas"
                  className="text-sm px-5 py-2.5 rounded-md font-medium text-center"
                  style={{ background: G, color: "#000" }}
                  onClick={() => setMobileOpen(false)}
                >
                  Open Research
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* ── Hero ── */}
      <section
        className="relative min-h-screen flex flex-col items-center justify-center pt-16 overflow-hidden"
        style={{ background: `radial-gradient(ellipse 90% 80% at 50% 10%, rgba(201,162,39,0.06) 0%, ${BG} 65%)` }}
      >
        <GridBackground />

        {/* Ambient glow */}
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full pointer-events-none"
          style={{ background: `radial-gradient(circle, rgba(201,162,39,0.07) 0%, transparent 70%)` }}
          aria-hidden="true"
        />

        <div className="relative z-10 max-w-5xl mx-auto px-6 flex flex-col items-center text-center gap-8">
          {/* Eyebrow */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold tracking-widest uppercase"
            style={{ background: GD, color: G, border: `1px solid ${GB2}` }}
          >
            <span className="w-1.5 h-1.5 rounded-full inline-block" style={{ background: G }} />
            AI-Powered Freemasonic Research
          </motion.div>

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="text-5xl sm:text-6xl lg:text-7xl font-bold leading-[1.08] tracking-tight"
            style={{ fontFamily: "var(--font-display, Spectral, serif)", color: TEXT }}
          >
            Illuminate the Craft.{" "}
            <span style={{ color: G }}>Unlock Ancient Knowledge.</span>
          </motion.h1>

          {/* Subheadline */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.35 }}
            className="max-w-2xl text-lg sm:text-xl leading-relaxed"
            style={{ color: MUTED }}
          >
            NaphtalAI is a visual research engine for Freemasonic scholarship—combining AI entity
            extraction, symbolic analysis, and an infinite knowledge-graph canvas to surface
            connections hidden across centuries of documents.
          </motion.p>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.5 }}
            className="flex flex-col sm:flex-row items-center gap-4"
          >
            <Link
              href="/canvas"
              className="group flex items-center gap-2 px-7 py-3.5 rounded-md font-semibold text-base transition-all"
              style={{ background: G, color: "#000" }}
              onMouseEnter={(e) => (e.currentTarget.style.background = GB)}
              onMouseLeave={(e) => (e.currentTarget.style.background = G)}
            >
              Begin Your Research
              <ArrowRight size={18} className="transition-transform group-hover:translate-x-0.5" />
            </Link>
            <a
              href="#features"
              className="flex items-center gap-2 px-7 py-3.5 rounded-md font-medium text-base transition-all"
              style={{ border: `1px solid ${GB2}`, color: TEXT }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = G; e.currentTarget.style.color = G; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = GB2; e.currentTarget.style.color = TEXT; }}
            >
              Explore Features
            </a>
          </motion.div>

          {/* Social proof */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.75 }}
            className="flex items-center gap-6 text-xs"
            style={{ color: MUTED2 }}
          >
            <span className="flex items-center gap-1.5">
              <CheckCircle size={13} style={{ color: G }} /> Privacy-first · local storage
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle size={13} style={{ color: G }} /> No subscription required
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle size={13} style={{ color: G }} /> OpenAI &amp; Anthropic
            </span>
          </motion.div>
        </div>

        {/* Hero SVG Compass */}
        <motion.div
          initial={{ opacity: 0, scale: 0.85 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.2, delay: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="relative z-10 mt-16 mb-8"
        >
          <div className="relative">
            {/* Glow ring behind symbol */}
            <div
              className="absolute inset-0 rounded-full"
              style={{
                background: `radial-gradient(circle, rgba(201,162,39,0.12) 0%, transparent 70%)`,
                transform: "scale(1.3)",
              }}
              aria-hidden="true"
            />
            <img src="/NaphtalAI-Logo.svg" width={280} height={280} alt="NaphtalAI" className="relative z-10 object-contain" />
          </div>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2, duration: 1 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
          style={{ color: MUTED2 }}
        >
          <span className="text-xs tracking-widest uppercase">Explore</span>
          <motion.div
            animate={{ y: [0, 6, 0] }}
            transition={{ repeat: Infinity, duration: 1.8, ease: "easeInOut" }}
          >
            <ChevronDown size={16} />
          </motion.div>
        </motion.div>
      </section>

      {/* ── Problem / Solution ── */}
      <Section
        id="problem"
        className="py-24 px-6 max-w-7xl mx-auto"
      >
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Problem */}
          <div>
            <motion.div variants={fadeUp}>
              <Pill>The Research Challenge</Pill>
            </motion.div>
            <motion.h2
              variants={fadeUp}
              className="mt-6 text-3xl sm:text-4xl font-bold leading-tight"
              style={{ fontFamily: "var(--font-display, Spectral, serif)" }}
            >
              Freemasonic knowledge is vast,{" "}
              <span style={{ color: MUTED }}>fragmented, and difficult to navigate.</span>
            </motion.h2>
            <div className="mt-8 space-y-5">
              {[
                {
                  title: "Archives scattered across centuries",
                  desc: "Lodge records, ritual texts, and historical documents exist in disconnected formats—handwritten, scanned, typed—with no unified system.",
                },
                {
                  title: "Manual cross-referencing is prohibitive",
                  desc: "Finding connections between figures, symbols, and events across dozens of documents takes weeks or months of painstaking manual work.",
                },
                {
                  title: "Symbolic context requires specialist knowledge",
                  desc: "Masonic symbolism and esoteric references demand deep domain expertise that generic research tools simply don't possess.",
                },
              ].map((item, i) => (
                <motion.div key={i} variants={fadeUp} className="flex gap-4">
                  <div className="mt-1 w-5 h-5 shrink-0 rounded-full flex items-center justify-center" style={{ background: "rgba(185,28,28,0.15)", border: "1px solid rgba(185,28,28,0.3)" }}>
                    <span className="w-1.5 h-1.5 rounded-full bg-red-600" />
                  </div>
                  <div>
                    <p className="font-medium text-sm" style={{ color: TEXT }}>{item.title}</p>
                    <p className="text-sm mt-1 leading-relaxed" style={{ color: MUTED }}>{item.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Solution */}
          <motion.div
            variants={fadeUp}
            className="rounded-xl p-8 relative overflow-hidden"
            style={{ background: CARD, border: `1px solid ${GB2}` }}
          >
            <div
              className="absolute top-0 right-0 w-48 h-48 rounded-full pointer-events-none"
              style={{ background: `radial-gradient(circle, rgba(201,162,39,0.08) 0%, transparent 70%)`, transform: "translate(30%, -30%)" }}
              aria-hidden="true"
            />
            <Pill>The NaphtalAI Solution</Pill>
            <h3
              className="mt-5 text-2xl font-bold leading-snug"
              style={{ fontFamily: "var(--font-display, Spectral, serif)" }}
            >
              One unified intelligence layer for all your Masonic research
            </h3>
            <div className="mt-7 space-y-5">
              {[
                {
                  icon: <Upload size={16} />,
                  title: "Unify your archives",
                  desc: "Upload any file format into a single private local library—PDFs, images, text, and structured data.",
                },
                {
                  icon: <Brain size={16} />,
                  title: "AI with Masonic domain expertise",
                  desc: "The Overseer understands Freemasonic terminology, ritual context, and symbolic significance out of the box.",
                },
                {
                  icon: <Network size={16} />,
                  title: "Visual connection mapping",
                  desc: "The Trestleboard canvas turns invisible relationships into a living, interactive knowledge graph you can explore and annotate.",
                },
              ].map((item, i) => (
                <div key={i} className="flex gap-4">
                  <div
                    className="mt-0.5 w-8 h-8 shrink-0 rounded-md flex items-center justify-center"
                    style={{ background: GD, border: `1px solid ${GB2}`, color: G }}
                  >
                    {item.icon}
                  </div>
                  <div>
                    <p className="font-medium text-sm" style={{ color: TEXT }}>{item.title}</p>
                    <p className="text-sm mt-0.5 leading-relaxed" style={{ color: MUTED }}>{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </Section>

      {/* ── Features ── */}
      <section
        id="features"
        className="py-24"
        style={{ background: `linear-gradient(to bottom, ${BG}, ${CARD} 50%, ${BG})` }}
      >
        <Section className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <motion.div variants={fadeUp} className="flex justify-center">
              <Pill>Platform Features</Pill>
            </motion.div>
            <motion.h2
              variants={fadeUp}
              className="mt-5 text-3xl sm:text-4xl lg:text-5xl font-bold leading-tight"
              style={{ fontFamily: "var(--font-display, Spectral, serif)" }}
            >
              Every tool a Masonic researcher needs
            </motion.h2>
            <motion.p
              variants={fadeUp}
              className="mt-4 text-lg max-w-2xl mx-auto"
              style={{ color: MUTED }}
            >
              Six purpose-built capabilities working in concert—from document ingestion to visual knowledge mapping.
            </motion.p>
          </div>

          <motion.div
            variants={stagger}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {FEATURES.map((f, i) => (
              <motion.div
                key={i}
                variants={fadeUp}
                className="group relative rounded-xl p-7 transition-all duration-300 overflow-hidden"
                style={{ background: BG, border: `1px solid ${GB2}` }}
                onMouseEnter={(e) => (e.currentTarget.style.borderColor = G)}
                onMouseLeave={(e) => (e.currentTarget.style.borderColor = GB2)}
              >
                {/* Corner glow on hover */}
                <div
                  className="absolute top-0 right-0 w-32 h-32 rounded-full pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity"
                  style={{ background: `radial-gradient(circle, rgba(201,162,39,0.1) 0%, transparent 70%)`, transform: "translate(40%, -40%)" }}
                  aria-hidden="true"
                />

                {/* Tag */}
                <div className="flex items-center justify-between mb-5">
                  <div
                    className="w-11 h-11 rounded-lg flex items-center justify-center"
                    style={{ background: GD, border: `1px solid ${GB2}`, color: G }}
                  >
                    {f.icon}
                  </div>
                  <span
                    className="text-xs px-2.5 py-1 rounded-full font-medium tracking-wide"
                    style={{ background: GD, color: G }}
                  >
                    {f.tag}
                  </span>
                </div>

                <h3
                  className="text-lg font-semibold mb-2 transition-colors"
                  style={{ fontFamily: "var(--font-display, Spectral, serif)", color: TEXT }}
                >
                  {f.title}
                </h3>
                <p className="text-sm leading-relaxed" style={{ color: MUTED }}>
                  {f.desc}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </Section>
      </section>

      {/* ── How It Works ── */}
      <Section id="how-it-works" className="py-24 max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <motion.div variants={fadeUp} className="flex justify-center">
            <Pill>How It Works</Pill>
          </motion.div>
          <motion.h2
            variants={fadeUp}
            className="mt-5 text-3xl sm:text-4xl lg:text-5xl font-bold"
            style={{ fontFamily: "var(--font-display, Spectral, serif)" }}
          >
            From archive to insight in four steps
          </motion.h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 relative">
          {/* Connector line (desktop) */}
          <div
            className="hidden lg:block absolute top-10 left-[12.5%] right-[12.5%] h-px"
            style={{ background: `linear-gradient(to right, transparent, ${GB2} 20%, ${GB2} 80%, transparent)` }}
            aria-hidden="true"
          />

          {STEPS.map((s, i) => (
            <motion.div key={i} variants={fadeUp} className="relative flex flex-col items-center text-center gap-4">
              {/* Step circle */}
              <div
                className="relative w-20 h-20 rounded-full flex items-center justify-center z-10"
                style={{ background: CARD, border: `2px solid ${GB2}` }}
              >
                <div style={{ color: G }}>{s.icon}</div>
                {/* Step number badge */}
                <div
                  className="absolute -top-2 -right-2 w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold"
                  style={{ background: G, color: "#000" }}
                >
                  {i + 1}
                </div>
              </div>

              <div>
                <h3
                  className="font-semibold text-base mb-2"
                  style={{ fontFamily: "var(--font-display, Spectral, serif)", color: TEXT }}
                >
                  {s.title}
                </h3>
                <p className="text-sm leading-relaxed" style={{ color: MUTED }}>
                  {s.desc}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </Section>

      {/* ── Use Cases ── */}
      <section
        id="use-cases"
        className="py-24"
        style={{ background: `linear-gradient(to bottom, ${BG}, ${CARD2} 50%, ${BG})` }}
      >
        <Section className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <motion.div variants={fadeUp} className="flex justify-center">
              <Pill>Who It's For</Pill>
            </motion.div>
            <motion.h2
              variants={fadeUp}
              className="mt-5 text-3xl sm:text-4xl lg:text-5xl font-bold"
              style={{ fontFamily: "var(--font-display, Spectral, serif)" }}
            >
              Built for every Masonic scholar
            </motion.h2>
            <motion.p
              variants={fadeUp}
              className="mt-4 text-lg max-w-xl mx-auto"
              style={{ color: MUTED }}
            >
              Whether you guard lodge records, pursue academic scholarship, or study the Craft for personal growth.
            </motion.p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {USE_CASES.map((uc, i) => (
              <motion.div
                key={i}
                variants={fadeUp}
                className="rounded-xl overflow-hidden"
                style={{ border: `1px solid ${GB2}`, background: BG }}
              >
                {/* Card header */}
                <div className="px-7 pt-7 pb-5" style={{ borderBottom: `1px solid ${GB2}` }}>
                  <div
                    className="w-11 h-11 rounded-lg flex items-center justify-center mb-4"
                    style={{ background: GD, border: `1px solid ${GB2}`, color: G }}
                  >
                    {uc.icon}
                  </div>
                  <span className="text-xs font-semibold tracking-widest uppercase" style={{ color: G }}>
                    {uc.audience}
                  </span>
                  <h3
                    className="mt-2 text-xl font-bold leading-snug"
                    style={{ fontFamily: "var(--font-display, Spectral, serif)", color: TEXT }}
                  >
                    {uc.title}
                  </h3>
                </div>
                <div className="px-7 pt-5 pb-7">
                  <p className="text-sm leading-relaxed mb-5" style={{ color: MUTED }}>
                    {uc.desc}
                  </p>
                  <ul className="space-y-2">
                    {uc.points.map((pt, j) => (
                      <li key={j} className="flex items-start gap-2.5 text-sm" style={{ color: MUTED }}>
                        <CheckCircle size={14} className="mt-0.5 shrink-0" style={{ color: G }} />
                        {pt}
                      </li>
                    ))}
                  </ul>
                </div>
              </motion.div>
            ))}
          </div>
        </Section>
      </section>

      {/* ── Testimonials ── */}
      <Section id="testimonials" className="py-24 max-w-7xl mx-auto px-6">
        <div className="text-center mb-14">
          <motion.div variants={fadeUp} className="flex justify-center">
            <Pill>Early Voices</Pill>
          </motion.div>
          <motion.h2
            variants={fadeUp}
            className="mt-5 text-3xl sm:text-4xl font-bold"
            style={{ fontFamily: "var(--font-display, Spectral, serif)" }}
          >
            What researchers are saying
          </motion.h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-7">
          {TESTIMONIALS.map((t, i) => (
            <motion.div
              key={i}
              variants={fadeUp}
              className="rounded-xl p-7 flex flex-col gap-5 relative overflow-hidden"
              style={{ background: CARD, border: `1px solid ${GB2}` }}
            >
              {/* Large quote mark */}
              <span
                className="absolute top-4 right-6 text-7xl leading-none font-serif pointer-events-none select-none"
                style={{ color: GD, fontFamily: "Georgia, serif" }}
                aria-hidden="true"
              >
                "
              </span>

              {/* Stars */}
              <div className="flex gap-1">
                {Array.from({ length: t.rating }).map((_, j) => (
                  <Star key={j} size={14} fill={G} style={{ color: G }} />
                ))}
              </div>

              <p className="text-sm leading-relaxed flex-1" style={{ color: MUTED }}>
                "{t.quote}"
              </p>

              <div className="flex items-center gap-3 pt-2" style={{ borderTop: `1px solid ${GB2}` }}>
                <div
                  className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold"
                  style={{ background: GD, border: `1px solid ${GB2}`, color: G }}
                >
                  {t.name[0]}
                </div>
                <div>
                  <p className="text-sm font-medium" style={{ color: TEXT }}>{t.name}</p>
                  <p className="text-xs" style={{ color: MUTED2 }}>{t.title}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </Section>

      {/* ── Mission ── */}
      <section
        className="py-28 relative overflow-hidden"
        style={{ background: CARD }}
      >
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: `radial-gradient(ellipse 60% 80% at 50% 50%, rgba(201,162,39,0.05) 0%, transparent 70%)`,
          }}
          aria-hidden="true"
        />
        <Section className="max-w-3xl mx-auto px-6 text-center">
          <motion.div variants={fadeUp} className="flex justify-center">
            <Pill>Our Mission</Pill>
          </motion.div>
          <motion.h2
            variants={fadeUp}
            className="mt-6 text-3xl sm:text-4xl lg:text-5xl font-bold leading-snug"
            style={{ fontFamily: "var(--font-display, Spectral, serif)" }}
          >
            Preserving Masonic knowledge for the generations ahead
          </motion.h2>
          <motion.p
            variants={fadeUp}
            className="mt-6 text-lg leading-relaxed"
            style={{ color: MUTED }}
          >
            Centuries of Masonic knowledge—ritual texts, lodge histories, philosophical treatises, and correspondence—risk being lost to time, fragmentation, and inaccessibility. NaphtalAI exists to apply the most powerful analytical tools of our age to the preservation and exploration of this legacy, placing deep research capability in the hands of every brother, scholar, and seeker.
          </motion.p>
          <motion.div variants={fadeUp} className="mt-10">
            <div className="w-16 h-px mx-auto" style={{ background: G }} />
          </motion.div>
          <motion.blockquote
            variants={fadeUp}
            className="mt-8 text-xl italic font-medium"
            style={{ fontFamily: "var(--font-display, Spectral, serif)", color: G }}
          >
            "Lux e Tenebris"
          </motion.blockquote>
          <motion.p variants={fadeUp} className="mt-1 text-sm" style={{ color: MUTED2 }}>
            Light from Darkness — a guiding principle
          </motion.p>
        </Section>
      </section>

      {/* ── Stats Banner ── */}
      <section style={{ background: BG, borderTop: `1px solid ${GB2}`, borderBottom: `1px solid ${GB2}` }}>
        <Section className="max-w-7xl mx-auto px-6 py-12">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 text-center">
            {[
              { value: "6+", label: "Core Research Modules" },
              { value: "50", label: "Step Undo/Redo History" },
              { value: "6", label: "Supported File Formats" },
              { value: "100%", label: "Local-First Privacy" },
            ].map((s, i) => (
              <motion.div key={i} variants={fadeUp} className="flex flex-col gap-1">
                <span className="text-4xl font-bold" style={{ fontFamily: "var(--font-display, Spectral, serif)", color: G }}>
                  {s.value}
                </span>
                <span className="text-sm" style={{ color: MUTED }}>{s.label}</span>
              </motion.div>
            ))}
          </div>
        </Section>
      </section>

      {/* ── FAQ ── */}
      <Section id="faq" className="py-24 max-w-3xl mx-auto px-6">
        <div className="text-center mb-14">
          <motion.div variants={fadeUp} className="flex justify-center">
            <Pill>FAQ</Pill>
          </motion.div>
          <motion.h2
            variants={fadeUp}
            className="mt-5 text-3xl sm:text-4xl font-bold"
            style={{ fontFamily: "var(--font-display, Spectral, serif)" }}
          >
            Common questions
          </motion.h2>
        </div>

        <div>
          {FAQS.map((faq, i) => (
            <FAQItem key={i} q={faq.q} a={faq.a} index={i} />
          ))}
        </div>
      </Section>

      {/* ── CTA Banner ── */}
      <section
        className="py-24 relative overflow-hidden"
        style={{ background: CARD, borderTop: `1px solid ${GB2}` }}
      >
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ background: `radial-gradient(ellipse 50% 90% at 50% 50%, rgba(201,162,39,0.07) 0%, transparent 70%)` }}
          aria-hidden="true"
        />
        <GridBackground />

        <Section className="relative max-w-3xl mx-auto px-6 text-center">
          <motion.div variants={fadeUp} className="flex justify-center">
            <Pill>Get Started</Pill>
          </motion.div>
          <motion.h2
            variants={fadeUp}
            className="mt-6 text-3xl sm:text-4xl lg:text-5xl font-bold"
            style={{ fontFamily: "var(--font-display, Spectral, serif)" }}
          >
            Begin your research today
          </motion.h2>
          <motion.p
            variants={fadeUp}
            className="mt-4 text-lg"
            style={{ color: MUTED }}
          >
            NaphtalAI is available now. No subscription, no data exposure—just bring your documents and your API key.
          </motion.p>

          {/* Email capture */}
          <motion.form
            variants={fadeUp}
            onSubmit={(e) => e.preventDefault()}
            className="mt-10 flex flex-col sm:flex-row gap-3 justify-center max-w-md mx-auto"
          >
            <input
              type="email"
              placeholder="Enter your email for updates"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="flex-1 px-4 py-3 rounded-md text-sm outline-none transition-all"
              style={{
                background: BG,
                border: `1px solid ${GB2}`,
                color: TEXT,
                caretColor: G,
              }}
              onFocus={(e) => (e.currentTarget.style.borderColor = G)}
              onBlur={(e) => (e.currentTarget.style.borderColor = GB2)}
            />
            <button
              type="submit"
              className="px-6 py-3 rounded-md font-semibold text-sm transition-all"
              style={{ background: G, color: "#000" }}
              onMouseEnter={(e) => (e.currentTarget.style.background = GB)}
              onMouseLeave={(e) => (e.currentTarget.style.background = G)}
            >
              Notify Me
            </button>
          </motion.form>

          <motion.div variants={fadeUp} className="mt-6 flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/canvas"
              className="group flex items-center justify-center gap-2 px-8 py-3.5 rounded-md font-semibold text-base transition-all"
              style={{ background: G, color: "#000" }}
              onMouseEnter={(e) => (e.currentTarget.style.background = GB)}
              onMouseLeave={(e) => (e.currentTarget.style.background = G)}
            >
              Open the Research Platform
              <ArrowRight size={18} className="transition-transform group-hover:translate-x-0.5" />
            </Link>
            <Link
              href="/login"
              className="flex items-center justify-center gap-2 px-8 py-3.5 rounded-md font-medium text-base transition-all"
              style={{ border: `1px solid ${GB2}`, color: TEXT }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = G; e.currentTarget.style.color = G; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = GB2; e.currentTarget.style.color = TEXT; }}
            >
              Create an Account
            </Link>
          </motion.div>

          {/* Trust badges */}
          <motion.div
            variants={fadeUp}
            className="mt-10 flex flex-wrap items-center justify-center gap-6 text-xs"
            style={{ color: MUTED2 }}
          >
            <span className="flex items-center gap-1.5">
              <Shield size={13} style={{ color: G }} /> Local-first storage
            </span>
            <span className="flex items-center gap-1.5">
              <Lock size={13} style={{ color: G }} /> Your API key, your control
            </span>
            <span className="flex items-center gap-1.5">
              <Zap size={13} style={{ color: G }} /> No subscription required
            </span>
          </motion.div>
        </Section>
      </section>

      {/* ── Footer ── */}
      <footer style={{ background: BG, borderTop: `1px solid ${GB2}` }}>
        <div className="max-w-7xl mx-auto px-6 py-16">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
            {/* Brand */}
            <div className="md:col-span-2">
              <Link href="/" className="flex items-center gap-3">
                <img src="/NaphtalAI-Logo.svg" width={36} height={36} alt="NaphtalAI" className="object-contain" />
                <span
                  className="text-xl font-semibold"
                  style={{ fontFamily: "var(--font-display, Spectral, serif)" }}
                >
                  Naphtal<span style={{ color: G }}>AI</span>
                </span>
              </Link>
              <p className="mt-4 text-sm leading-relaxed max-w-xs" style={{ color: MUTED }}>
                An AI-powered research engine for Freemasonic scholarship. Illuminate centuries of knowledge through entity extraction, symbolic analysis, and visual connection mapping.
              </p>
              <p className="mt-4 text-xs italic" style={{ color: MUTED2, fontFamily: "var(--font-display, Spectral, serif)" }}>
                "Lux e Tenebris"
              </p>
            </div>

            {/* Platform */}
            <div>
              <h4 className="text-sm font-semibold mb-4 tracking-wide" style={{ color: TEXT }}>Platform</h4>
              <ul className="space-y-3">
                {[
                  { label: "The Trestleboard", href: "/canvas" },
                  { label: "The Archives", href: "/canvas" },
                  { label: "The Overseer", href: "/canvas" },
                  { label: "Entity Graph", href: "/canvas" },
                ].map((l) => (
                  <li key={l.label}>
                    <Link href={l.href} className="text-sm transition-colors" style={{ color: MUTED }}
                      onMouseEnter={(e) => (e.currentTarget.style.color = G)}
                      onMouseLeave={(e) => (e.currentTarget.style.color = MUTED)}
                    >
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Legal */}
            <div>
              <h4 className="text-sm font-semibold mb-4 tracking-wide" style={{ color: TEXT }}>Legal & Support</h4>
              <ul className="space-y-3">
                {[
                  { label: "Privacy Policy", href: "#" },
                  { label: "Terms of Service", href: "#" },
                  { label: "Contact Us", href: "#" },
                  { label: "Documentation", href: "#" },
                ].map((l) => (
                  <li key={l.label}>
                    <Link href={l.href} className="text-sm transition-colors" style={{ color: MUTED }}
                      onMouseEnter={(e) => (e.currentTarget.style.color = G)}
                      onMouseLeave={(e) => (e.currentTarget.style.color = MUTED)}
                    >
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Bottom bar */}
          <div
            className="mt-12 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs"
            style={{ borderTop: `1px solid ${GB2}`, color: MUTED2 }}
          >
            <span>&copy; {new Date().getFullYear()} NaphtalAI. All rights reserved.</span>
            <span className="flex items-center gap-1.5">
              Built with{" "}
              <span style={{ color: G }}>Next.js · Framer Motion · @xyflow/react</span>
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}
