import { useNavigate, useParams } from "@tanstack/react-router";
import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { StepHeader } from "./roles-step";
import { optimizeResume, analyzeAts } from "@/lib/ai.functions";
import { useServerFn } from "@tanstack/react-start";
import { Loader2, Sparkles, CheckCircle2, Zap, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import type { ResumeData, AtsBreakdown } from "@/lib/resume-types";
import { useQueryClient } from "@tanstack/react-query";

export function OptimizeStep({ data }: { data: ResumeData; update: unknown }) {
  const { id } = useParams({ from: "/resume/$id/wizard/$step" });
  const navigate = useNavigate();
  const qc = useQueryClient();
  const optimize = useServerFn(optimizeResume);
  const [done, setDone] = useState(false);

  const mutation = useMutation({
    mutationFn: () => optimize({ data: { resumeId: id } }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["resume", id] });
      setDone(true);
      toast.success("Resume optimized. On to ATS scoring.");
    },
    onError: (e) =>
      toast.error(e instanceof Error ? e.message : "AI failed. Try again."),
  });

  const readiness = readinessOf(data);

  return (
    <div>
      <StepHeader
        eyebrow="Step 09"
        title="AI optimization."
        sub="Our model rewrites your responsibilities into strong ATS bullets, generates a professional summary, and preserves every fact."
      />

      <div className="mt-10 grid gap-4 sm:grid-cols-3">
        {[
          { icon: Sparkles, label: "Summary generated" },
          { icon: Zap, label: "Bullets rewritten" },
          { icon: CheckCircle2, label: "Keywords aligned" },
        ].map((c) => (
          <div
            key={c.label}
            className="flex items-center gap-3 rounded-2xl border border-border bg-surface p-4"
          >
            <div className="grid h-9 w-9 place-items-center rounded-lg bg-primary/10 text-primary-glow">
              <c.icon className="h-4 w-4" />
            </div>
            <div className="text-sm font-medium">{c.label}</div>
          </div>
        ))}
      </div>

      {readiness.warnings.length > 0 && (
        <div className="mt-6 rounded-2xl border border-highlight/40 bg-highlight/10 p-5">
          <div className="flex items-start gap-3">
            <AlertCircle className="mt-0.5 h-5 w-5 text-highlight" />
            <div>
              <div className="text-sm font-medium text-foreground">
                Heads up — this might hurt your ATS score
              </div>
              <ul className="mt-2 space-y-1 text-sm text-foreground/80">
                {readiness.warnings.map((w) => (
                  <li key={w}>• {w}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      <div className="mt-10 flex flex-col items-center rounded-3xl border border-border bg-surface p-10 text-center">
        {mutation.isPending ? (
          <>
            <div className="relative">
              <div className="absolute inset-0 animate-ping rounded-full bg-primary/40" />
              <div className="relative grid h-16 w-16 place-items-center rounded-full bg-gradient-primary shadow-glow">
                <Loader2 className="h-7 w-7 animate-spin text-primary-foreground" />
              </div>
            </div>
            <div className="mt-6 font-display text-3xl">Optimizing…</div>
            <p className="mt-2 max-w-md text-sm text-muted-foreground">
              This usually takes 15–30 seconds. AI is rewriting bullets,
              generating a summary, and aligning keywords for your target
              roles.
            </p>
          </>
        ) : done ? (
          <>
            <div className="grid h-16 w-16 place-items-center rounded-full bg-success/20">
              <CheckCircle2 className="h-8 w-8 text-success" />
            </div>
            <div className="mt-6 font-display text-3xl">Done.</div>
            <p className="mt-2 max-w-md text-sm text-muted-foreground">
              Your resume is optimized. Next, let's score it against the ATS.
            </p>
            <button
              onClick={() =>
                navigate({
                  to: "/resume/$id/wizard/$step",
                  params: { id, step: "ats" },
                })
              }
              className="mt-6 inline-flex items-center gap-2 rounded-full bg-gradient-primary px-6 py-3 text-sm font-medium text-primary-foreground shadow-elegant"
            >
              Continue to ATS analysis
            </button>
          </>
        ) : (
          <>
            <div className="grid h-16 w-16 place-items-center rounded-full bg-gradient-primary shadow-glow">
              <Sparkles className="h-7 w-7 text-primary-foreground" />
            </div>
            <div className="mt-6 font-display text-3xl">Ready to optimize.</div>
            <p className="mt-2 max-w-md text-sm text-muted-foreground">
              Every fact stays factual. We only sharpen the wording and
              structure for ATS parsers.
            </p>
            <button
              onClick={() => mutation.mutate()}
              className="mt-6 inline-flex items-center gap-2 rounded-full bg-gradient-primary px-6 py-3 text-sm font-medium text-primary-foreground shadow-elegant transition-transform hover:-translate-y-0.5"
            >
              Run AI optimization
            </button>
          </>
        )}
      </div>
    </div>
  );
}

function readinessOf(d: ResumeData) {
  const warnings: string[] = [];
  if (d.targetRoles.length < 2) warnings.push("Pick exactly two target roles.");
  if (!d.personal.fullName) warnings.push("Full name is missing.");
  if (d.skills.length < 6) warnings.push("Add more technical skills (aim for 12+).");
  const hasExperience =
    (d.experienceLevel === "fresher" &&
      (d.internships.length > 0 || d.personalProjects.length > 0)) ||
    (d.experienceLevel === "experienced" && d.companies.length > 0);
  if (!hasExperience)
    warnings.push("Add at least one internship, project, or company role.");
  if (d.education.length === 0) warnings.push("Add at least one education record.");
  return { warnings };
}

// ---------- ATS step ----------

export function AtsStep({
  breakdown,
  score,
}: {
  breakdown: AtsBreakdown | null;
  score: number | null;
}) {
  const { id } = useParams({ from: "/resume/$id/wizard/$step" });
  const qc = useQueryClient();
  const analyze = useServerFn(analyzeAts);
  const mutation = useMutation({
    mutationFn: () => analyze({ data: { resumeId: id } }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["resume", id] });
      toast.success("ATS analysis complete");
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Failed"),
  });

  if (!breakdown || score == null) {
    return (
      <div>
        <StepHeader
          eyebrow="Step 10"
          title="ATS analysis."
          sub="Score your optimized resume across 7 dimensions and see which keywords are missing."
        />
        <div className="mt-10 flex flex-col items-center rounded-3xl border border-border bg-surface p-10 text-center">
          <div className="grid h-16 w-16 place-items-center rounded-full bg-gradient-primary shadow-glow">
            <Zap className="h-7 w-7 text-primary-foreground" />
          </div>
          <div className="mt-6 font-display text-3xl">Ready to score.</div>
          <button
            onClick={() => mutation.mutate()}
            disabled={mutation.isPending}
            className="mt-6 inline-flex items-center gap-2 rounded-full bg-gradient-primary px-6 py-3 text-sm font-medium text-primary-foreground shadow-elegant transition-transform hover:-translate-y-0.5 disabled:opacity-70"
          >
            {mutation.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
            {mutation.isPending ? "Analyzing…" : "Run ATS analysis"}
          </button>
        </div>
      </div>
    );
  }

  const scoreColor =
    score >= 90 ? "text-success" : score >= 75 ? "text-highlight" : "text-destructive";

  const rows = [
    { label: "Keyword match", value: breakdown.keywordMatch },
    { label: "Skills match", value: breakdown.skillsMatch },
    { label: "Experience match", value: breakdown.experienceMatch },
    { label: "Project quality", value: breakdown.projectQuality },
    { label: "Formatting", value: breakdown.formatting },
    { label: "Readability", value: breakdown.readability },
    { label: "Action verbs", value: breakdown.actionVerbs },
  ];

  return (
    <div>
      <StepHeader
        eyebrow="Step 10"
        title="Your ATS score."
        sub="Transparent breakdown. Keep iterating until you land above 90."
      />
      <div className="mt-10 grid gap-6 md:grid-cols-[1.1fr_1fr]">
        <div className="rounded-3xl border border-border bg-surface p-8 text-center">
          <div className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
            Overall ATS score
          </div>
          <div className={`mt-4 font-display text-8xl leading-none ${scoreColor}`}>
            {score}
          </div>
          <div className="mt-1 text-muted-foreground">/ 100</div>
          <div className="mt-6 h-2 overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-gradient-primary transition-all duration-1000"
              style={{ width: `${score}%` }}
            />
          </div>
          <button
            onClick={() => mutation.mutate()}
            disabled={mutation.isPending}
            className="mt-6 inline-flex items-center gap-2 rounded-full border border-border bg-background px-4 py-2 text-xs font-medium text-foreground transition hover:bg-accent disabled:opacity-60"
          >
            {mutation.isPending && <Loader2 className="h-3 w-3 animate-spin" />}
            Re-analyze
          </button>
        </div>
        <div className="space-y-3 rounded-3xl border border-border bg-surface p-6">
          {rows.map((r) => (
            <div key={r.label}>
              <div className="flex items-center justify-between text-sm">
                <span className="text-foreground">{r.label}</span>
                <span className="font-mono text-muted-foreground">{r.value}</span>
              </div>
              <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-primary/80"
                  style={{ width: `${r.value}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <KeywordCard title="Matched keywords" items={breakdown.matchedKeywords} good />
        <KeywordCard title="Missing keywords" items={breakdown.missingKeywords} />
      </div>

      {breakdown.suggestions.length > 0 && (
        <div className="mt-6 rounded-3xl border border-border bg-surface p-6">
          <div className="font-mono text-xs uppercase tracking-widest text-primary-glow">
            Suggestions
          </div>
          <ul className="mt-3 space-y-2 text-sm">
            {breakdown.suggestions.map((s, i) => (
              <li key={i} className="flex gap-2">
                <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                <span>{s}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

function KeywordCard({
  title,
  items,
  good,
}: {
  title: string;
  items: string[];
  good?: boolean;
}) {
  return (
    <div className="rounded-2xl border border-border bg-surface p-5">
      <div className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
        {title} · {items.length}
      </div>
      <div className="mt-3 flex flex-wrap gap-1.5">
        {items.length === 0 ? (
          <span className="text-sm text-muted-foreground">None</span>
        ) : (
          items.map((k) => (
            <span
              key={k}
              className={`rounded-md border px-2 py-0.5 font-mono text-xs ${
                good
                  ? "border-success/40 bg-success/10 text-success"
                  : "border-highlight/40 bg-highlight/10 text-highlight"
              }`}
            >
              {k}
            </span>
          ))
        )}
      </div>
    </div>
  );
}
