import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Sparkles,
  Target,
  FileCode2,
  Gauge,
  BrainCircuit,
  Download,
  CheckCircle2,
} from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { TARGET_ROLES } from "@/lib/resume-constants";

import { redirect } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/")({
  ssr: false,
  beforeLoad: async () => {
    const { data } = await supabase.auth.getUser();
    if (data.user) throw redirect({ to: "/dashboard" });
    throw redirect({ to: "/auth" });
  },
  component: Landing,
});

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, delay: i * 0.06, ease: [0.22, 1, 0.36, 1] as const },
  }),
};

function Landing() {
  return (
    <div className="min-h-screen app-aurora bg-background">
      <SiteHeader />
      <Hero />
      <Marquee />
      <Features />
      <HowItWorks />
      <RolesSection />
      <Cta />
      <Footer />
    </div>
  );
}

function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0 bg-gradient-hero" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-primary/40 to-transparent" />
      <div className="relative mx-auto max-w-6xl px-6 pb-24 pt-20 md:pt-32">
        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate="show"
          className="mx-auto max-w-3xl text-center"
        >
          <span className="inline-flex items-center gap-2 rounded-full border border-border bg-surface/60 px-3 py-1 font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground backdrop-blur">
            <span className="h-1.5 w-1.5 rounded-full bg-highlight" />
            Students · Early career · Senior pros
          </span>
          <h1 className="mt-8 font-display text-6xl leading-[0.95] tracking-tight text-balance md:text-8xl">
            The resume the{" "}
            <span className="italic text-primary-glow">recruiter's ATS</span>{" "}
            actually reads.
          </h1>
          <p className="mx-auto mt-8 max-w-2xl text-lg text-muted-foreground text-balance">
            ResumeForge AI turns your projects, coursework, and experience into a
            recruiter-ready resume — tuned to your career stage, optimized for
            two target roles, scored against the ATS, and exported as polished
            PDF and clean LaTeX.
          </p>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
            <Link
              to="/auth"
              search={{ mode: "signup" }}
              className="group inline-flex items-center gap-2 rounded-full bg-gradient-primary px-6 py-3 text-sm font-medium text-primary-foreground shadow-elegant transition-transform hover:-translate-y-0.5"
            >
              Build my resume
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
            <a
              href="#how"
              className="inline-flex items-center gap-2 rounded-full border border-border bg-surface/60 px-6 py-3 text-sm font-medium text-foreground backdrop-blur transition hover:bg-accent"
            >
              See how it works
            </a>
          </div>
          <p className="mt-6 font-mono text-xs uppercase tracking-widest text-muted-foreground">
            No credit card · No resume upload · 90+ ATS score target
          </p>
        </motion.div>

        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate="show"
          custom={2}
          className="relative mx-auto mt-20 max-w-5xl"
        >
          <div className="absolute -inset-4 -z-10 rounded-3xl bg-gradient-mesh opacity-60 blur-2xl" />
          <div className="overflow-hidden rounded-2xl glass-panel shadow-elegant">
            <ResumePreviewMock />
          </div>
        </motion.div>
      </div>
    </section>
  );
}

function ResumePreviewMock() {
  return (
    <div className="grid gap-0 md:grid-cols-[1.4fr_1fr]">
      <div className="border-b border-border bg-surface-elevated p-8 md:border-b-0 md:border-r">
        <div className="flex items-center justify-between">
          <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
            preview · modern template
          </span>
          <div className="flex gap-1.5">
            <span className="h-2 w-2 rounded-full bg-muted" />
            <span className="h-2 w-2 rounded-full bg-muted" />
            <span className="h-2 w-2 rounded-full bg-primary" />
          </div>
        </div>
        <div className="mt-6">
          <div className="font-display text-3xl leading-tight">Priya Nair</div>
          <div className="mt-1 text-sm text-muted-foreground">
            Product Manager · Business Analyst
          </div>
          <div className="mt-2 font-mono text-[10px] text-muted-foreground">
            priya@mail.com · linkedin.com/in/priya · priya.dev
          </div>
        </div>
        <hr className="my-5 border-border" />
        <p className="text-[13px] leading-relaxed text-foreground/80">
          Product Manager with 4 years shipping B2B SaaS. Led a checkout
          redesign that lifted conversion 22% and drove $1.4M ARR. Fluent in
          discovery, roadmapping, and cross-functional delivery with design
          and engineering.
        </p>
        <div className="mt-5 space-y-3">
          {[
            "Owned roadmap for billing platform serving 12k merchants",
            "Ran 30+ user interviews to reframe onboarding flow",
            "Partnered with data team to instrument North-Star metric",
          ].map((b) => (
            <div key={b} className="flex gap-2 text-[13px]">
              <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-primary" />
              <span className="text-foreground/80">{b}</span>
            </div>
          ))}
        </div>
        <div className="mt-6 flex flex-wrap gap-1.5">
          {["Roadmapping", "SQL", "Figma", "A/B Testing", "Jira", "Amplitude"].map((s) => (
            <span
              key={s}
              className="rounded-md border border-border bg-background px-2 py-0.5 font-mono text-[10px] text-muted-foreground"
            >
              {s}
            </span>
          ))}
        </div>
      </div>
      <div className="space-y-4 p-8">
        <div className="rounded-xl border border-border bg-background p-4">
          <div className="flex items-center justify-between">
            <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
              ATS Score
            </span>
            <span className="rounded-full bg-success/20 px-2 py-0.5 font-mono text-[10px] text-success">
              excellent
            </span>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="font-display text-6xl leading-none text-primary-glow">
              94
            </span>
            <span className="text-muted-foreground">/ 100</span>
          </div>
          <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-gradient-primary"
              style={{ width: "94%" }}
            />
          </div>
        </div>
        {[
          { label: "Keyword match", value: 96 },
          { label: "Skills match", value: 92 },
          { label: "Action verbs", value: 98 },
          { label: "Readability", value: 90 },
        ].map((row) => (
          <div key={row.label}>
            <div className="flex justify-between text-[11px] text-muted-foreground">
              <span>{row.label}</span>
              <span className="font-mono text-foreground">{row.value}</span>
            </div>
            <div className="mt-1.5 h-1 overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-primary/70"
                style={{ width: `${row.value}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function Marquee() {
  const items = [
    "Student",
    "Intern",
    "New Grad",
    "Career Switcher",
    "Software Engineer",
    "Product Manager",
    "Data Analyst",
    "Designer",
    "Marketing",
    "Consultant",
    "DevOps",
    "AI / ML",
    "Senior IC",
    "Tech Lead",
  ];
  return (
    <div className="border-y border-border bg-surface/40">
      <div className="mx-auto max-w-6xl overflow-hidden px-6 py-6">
        <div className="flex items-center gap-10 font-mono text-xs uppercase tracking-widest text-muted-foreground">
          <span className="shrink-0 text-foreground/60">
            works for every career stage ·
          </span>
          <div className="flex gap-8 overflow-hidden">
            {items.concat(items).map((s, i) => (
              <span key={i} className="whitespace-nowrap">
                {s}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function Features() {
  const items = [
    {
      icon: Target,
      title: "Dual-role targeting",
      body: "Pick exactly two roles you're going after — engineering, product, data, design, or business. Every bullet and keyword aligns to both.",
    },
    {
      icon: BrainCircuit,
      title: "AI-rewritten bullets",
      body: "Describe what you did in plain language. AI rewrites it into ATS-safe, action-verb-led bullets tuned to your career stage — no fabrication.",
    },
    {
      icon: Gauge,
      title: "Transparent ATS score",
      body: "Seven-dimension breakdown: keyword match, skills, formatting, readability, and more. Not a black box.",
    },
    {
      icon: FileCode2,
      title: "LaTeX + PDF export",
      body: "Six professional templates rendered via LaTeX. Download clean .tex source alongside the PDF.",
    },
    {
      icon: Sparkles,
      title: "No template hunting",
      body: "Guided workflow, no upload required. From blank slate to recruiter-ready in under 20 minutes.",
    },
    {
      icon: CheckCircle2,
      title: "Auto-saved & revisable",
      body: "Every keystroke saved to your dashboard. Duplicate, edit, and re-score anytime.",
    },
  ];
  return (
    <section id="features" className="mx-auto max-w-6xl px-6 py-32">
      <div className="max-w-2xl">
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-primary-glow">
          Features
        </p>
        <h2 className="mt-4 font-display text-5xl md:text-6xl">
          Built for every stage of your career.
        </h2>
        <p className="mt-5 text-lg text-muted-foreground">
          Whether it's your first internship or your seventh senior role, the
          workflow adapts. A structured process that turns raw career data into
          a resume that clears ATS filters and reads well to humans.
        </p>
      </div>
      <div className="mt-16 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {items.map((it, i) => (
          <motion.div
            key={it.title}
            variants={fadeUp}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-80px" }}
            custom={i}
            className="group relative overflow-hidden rounded-2xl glass p-6 transition-all hover:-translate-y-0.5 hover:shadow-elegant"
          >
            <div className="mb-6 grid h-10 w-10 place-items-center rounded-xl border border-border bg-background text-primary-glow transition group-hover:border-primary/40">
              <it.icon className="h-5 w-5" />
            </div>
            <h3 className="font-display text-2xl">{it.title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              {it.body}
            </p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

function HowItWorks() {
  const steps = [
    { n: "01", title: "Pick your stage & two roles", body: "Student, early-career, mid-level, senior, or switcher — plus the two roles you're targeting." },
    { n: "02", title: "Fill the guided form", body: "Personal info, experience, projects, skills, education, certificates. Auto-saved as you go." },
    { n: "03", title: "AI optimizes your content", body: "Summary generated. Bullets rewritten with strong verbs. Missing keywords surfaced." },
    { n: "04", title: "See your ATS score", body: "Seven-dimension breakdown with matched vs missing keywords and concrete suggestions." },
    { n: "05", title: "Pick a template", body: "Six ATS-safe LaTeX layouts. Live preview before you export." },
    { n: "06", title: "Download PDF + LaTeX", body: "Get the polished PDF and the .tex source. Iterate anytime from your dashboard." },
  ];
  return (
    <section id="how" className="relative border-y border-border bg-surface/40">
      <div className="mx-auto max-w-6xl px-6 py-32">
        <div className="max-w-2xl">
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-primary-glow">
            How it works
          </p>
          <h2 className="mt-4 font-display text-5xl md:text-6xl">
            Six steps. One resume that lands.
          </h2>
        </div>
        <div className="mt-16 grid gap-x-8 gap-y-10 md:grid-cols-2 lg:grid-cols-3">
          {steps.map((s, i) => (
            <motion.div
              key={s.n}
              variants={fadeUp}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, margin: "-80px" }}
              custom={i}
              className="relative border-l border-border pl-6"
            >
              <span className="absolute -left-[7px] top-1.5 h-3 w-3 rounded-full border border-primary bg-background" />
              <p className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground">
                Step {s.n}
              </p>
              <h3 className="mt-2 font-display text-3xl">{s.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{s.body}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function RolesSection() {
  return (
    <section id="roles" className="mx-auto max-w-6xl px-6 py-32">
      <div className="max-w-2xl">
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-primary-glow">
          Roles we optimize for
        </p>
        <h2 className="mt-4 font-display text-5xl md:text-6xl">
          40+ roles. Or bring your own.
        </h2>
        <p className="mt-5 text-muted-foreground">
          Curated keyword corpora across engineering, data, product, design,
          and business. Pick any two — or type in a role we haven't listed.
        </p>
      </div>
      <div className="mt-12 flex flex-wrap gap-2">
        {TARGET_ROLES.map((role) => (
          <span
            key={role}
            className="rounded-full glass px-4 py-2 text-sm text-foreground transition hover:-translate-y-0.5 hover:text-primary-glow"
          >
            {role}
          </span>
        ))}
      </div>
    </section>
  );
}

function Cta() {
  return (
    <section className="mx-auto max-w-6xl px-6 pb-32">
      <div className="relative overflow-hidden rounded-3xl glass-panel p-12 md:p-20">
        <div className="pointer-events-none absolute inset-0 bg-gradient-hero opacity-80" />
        <div className="relative max-w-2xl">
          <h2 className="font-display text-5xl md:text-6xl">
            Your next role is one <span className="italic text-primary-glow">strong resume</span>{" "}
            away.
          </h2>
          <p className="mt-5 text-muted-foreground">
            Build it in under 20 minutes. Optimize for two roles. Score above 90.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              to="/auth"
              search={{ mode: "signup" }}
              className="group inline-flex items-center gap-2 rounded-full bg-gradient-primary px-6 py-3 text-sm font-medium text-primary-foreground shadow-elegant transition-transform hover:-translate-y-0.5"
            >
              Create free account
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
            <Link
              to="/auth"
              className="inline-flex items-center gap-2 rounded-full border border-border bg-surface/60 px-6 py-3 text-sm font-medium text-foreground backdrop-blur transition hover:bg-accent"
            >
              I already have an account
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="border-t border-border">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-6 py-10 text-sm text-muted-foreground md:flex-row">
        <div className="flex items-center gap-2">
          <span className="grid h-6 w-6 place-items-center rounded-md bg-gradient-primary">
            <Sparkles className="h-3 w-3 text-primary-foreground" />
          </span>
          <span className="font-display text-lg text-foreground">ResumeForge AI</span>
        </div>
        <p className="font-mono text-xs uppercase tracking-widest">
          © {new Date().getFullYear()} · Built for anyone who's job-hunting
        </p>
      </div>
    </footer>
  );
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const _unused = Download;
