import type { ResumeData } from "@/lib/resume-types";
import { SKILL_CATEGORIES } from "@/lib/resume-constants";
import { StepHeader } from "./roles-step";
import { Plus, X } from "lucide-react";
import { useState } from "react";

export function SkillsStep({
  data,
  update,
}: {
  data: ResumeData;
  update: (u: (d: ResumeData) => ResumeData) => void;
}) {
  const [custom, setCustom] = useState("");
  const toggle = (s: string) =>
    update((d) => ({
      ...d,
      skills: d.skills.includes(s) ? d.skills.filter((x) => x !== s) : [...d.skills, s],
    }));

  return (
    <div>
      <StepHeader
        eyebrow="Step 05"
        title="Your technical skills."
        sub="Tap to add. We already know these matter most for AI roles — pick the ones you can defend in an interview."
      />

      <div className="mt-8 rounded-2xl border border-border bg-surface p-5">
        <div className="mb-2 flex items-center justify-between">
          <div className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
            Selected · {data.skills.length}
          </div>
        </div>
        {data.skills.length === 0 ? (
          <div className="py-6 text-center text-sm text-muted-foreground">
            No skills yet.
          </div>
        ) : (
          <div className="flex flex-wrap gap-1.5">
            {data.skills.map((s) => (
              <span
                key={s}
                className="inline-flex items-center gap-1.5 rounded-md border border-primary/40 bg-primary/10 px-2.5 py-1 font-mono text-xs text-primary-glow"
              >
                {s}
                <button onClick={() => toggle(s)} className="opacity-70 hover:opacity-100">
                  <X className="h-3 w-3" />
                </button>
              </span>
            ))}
          </div>
        )}
        <div className="mt-4 flex gap-2">
          <input
            className="flex-1 rounded-lg border border-border bg-background px-3.5 py-2 text-sm outline-none focus:border-primary"
            placeholder="Add a custom skill…"
            value={custom}
            onChange={(e) => setCustom(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && custom.trim()) {
                e.preventDefault();
                toggle(custom.trim());
                setCustom("");
              }
            }}
          />
          <button
            onClick={() => {
              if (custom.trim()) {
                toggle(custom.trim());
                setCustom("");
              }
            }}
            className="inline-flex items-center gap-1 rounded-lg border border-border bg-background px-3 text-sm hover:bg-accent"
          >
            <Plus className="h-3.5 w-3.5" /> Add
          </button>
        </div>
      </div>

      <div className="mt-8 space-y-6">
        {Object.entries(SKILL_CATEGORIES).map(([cat, list]) => (
          <div key={cat}>
            <div className="font-mono text-xs uppercase tracking-widest text-primary-glow">
              {cat}
            </div>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {list.map((s) => {
                const on = data.skills.includes(s);
                return (
                  <button
                    key={s}
                    onClick={() => toggle(s)}
                    className={`rounded-md border px-2.5 py-1 font-mono text-xs transition ${
                      on
                        ? "border-primary bg-primary/15 text-primary-glow"
                        : "border-border bg-surface text-muted-foreground hover:border-primary/40 hover:text-foreground"
                    }`}
                  >
                    {s}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
