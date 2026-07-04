import { Link, useNavigate, useParams, useRouterState } from "@tanstack/react-router";
import { ChevronLeft, ChevronRight, Check, Loader2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

export const WIZARD_STEPS = [
  { id: "roles", label: "Target roles" },
  { id: "personal", label: "Personal info" },
  { id: "experience", label: "Experience" },
  { id: "projects", label: "Projects" },
  { id: "skills", label: "Skills" },
  { id: "education", label: "Education" },
  { id: "certificates", label: "Certificates" },
  { id: "review", label: "Review" },
  { id: "optimize", label: "AI optimize" },
  { id: "ats", label: "ATS analysis" },
  { id: "template", label: "Template" },
  { id: "generate", label: "Generate" },
] as const;

export type WizardStepId = (typeof WIZARD_STEPS)[number]["id"];

export function WizardShell({
  children,
  saving,
  savedAt,
  canGoNext = true,
  onNext,
  nextLabel,
}: {
  children: React.ReactNode;
  saving?: boolean;
  savedAt?: Date | null;
  canGoNext?: boolean;
  onNext?: () => void | Promise<void>;
  nextLabel?: string;
}) {
  const { id, step } = useParams({ from: "/resume/$id/wizard/$step" });
  const navigate = useNavigate();
  const currentIndex = WIZARD_STEPS.findIndex((s) => s.id === step);
  const progress = ((currentIndex + 1) / WIZARD_STEPS.length) * 100;
  const prev = WIZARD_STEPS[currentIndex - 1];
  const next = WIZARD_STEPS[currentIndex + 1];

  const go = async (dir: "prev" | "next") => {
    if (dir === "next" && onNext) await onNext();
    const target = dir === "prev" ? prev : next;
    if (target)
      navigate({
        to: "/resume/$id/wizard/$step",
        params: { id, step: target.id },
      });
  };

  return (
    <div className="min-h-screen app-aurora bg-background">
      {/* Progress bar */}
      <div className="sticky top-0 z-40 glass-strong">

        <div className="mx-auto max-w-5xl px-6 py-4">
          <div className="flex items-center justify-between gap-4">
            <Link
              to="/dashboard"
              className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition hover:text-foreground"
            >
              <ChevronLeft className="h-4 w-4" /> Dashboard
            </Link>
            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              {saving ? (
                <span className="inline-flex items-center gap-1.5">
                  <Loader2 className="h-3 w-3 animate-spin" /> Saving…
                </span>
              ) : savedAt ? (
                <span className="inline-flex items-center gap-1.5">
                  <Check className="h-3 w-3 text-success" /> Saved{" "}
                  {formatDistanceToNow(savedAt, { addSuffix: true })}
                </span>
              ) : null}
              <span className="font-mono">
                {currentIndex + 1} / {WIZARD_STEPS.length}
              </span>
            </div>
          </div>
          <div className="mt-3 h-1 overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-gradient-primary transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="mt-3 flex gap-1 overflow-x-auto">
            {WIZARD_STEPS.map((s, i) => {
              const done = i < currentIndex;
              const active = i === currentIndex;
              return (
                <Link
                  key={s.id}
                  to="/resume/$id/wizard/$step"
                  params={{ id, step: s.id }}
                  className={`whitespace-nowrap rounded-full px-3 py-1 text-[11px] font-medium transition ${
                    active
                      ? "bg-primary text-primary-foreground"
                      : done
                        ? "text-primary-glow"
                        : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {s.label}
                </Link>
              );
            })}
          </div>
        </div>
      </div>

      <main className="mx-auto max-w-3xl px-6 py-12">{children}</main>

      {/* Footer nav */}
      <div className="sticky bottom-0 z-30 glass-strong">
        <div className="mx-auto flex max-w-3xl items-center justify-between gap-4 px-6 py-4">
          <button
            onClick={() => go("prev")}
            disabled={!prev}
            className="inline-flex items-center gap-2 rounded-full border border-border bg-surface px-5 py-2.5 text-sm font-medium text-foreground transition hover:bg-accent disabled:opacity-40"
          >
            <ChevronLeft className="h-4 w-4" /> Back
          </button>
          <button
            onClick={() => go("next")}
            disabled={!next || !canGoNext}
            className="inline-flex items-center gap-2 rounded-full bg-gradient-primary px-6 py-2.5 text-sm font-medium text-primary-foreground shadow-elegant transition-transform hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:translate-y-0"
          >
            {nextLabel ?? "Continue"} <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

// referenced for typing side-effect
export const _routerStateFn = useRouterState;
