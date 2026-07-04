import { TARGET_ROLES, AUDIENCE_PRESETS, type AudiencePresetId } from "@/lib/resume-constants";
import type { ResumeData } from "@/lib/resume-types";
import { Check, Plus, X } from "lucide-react";
import { useState } from "react";

export function RolesStep({
  data,
  update,
}: {
  data: ResumeData;
  update: (u: (d: ResumeData) => ResumeData) => void;
}) {
  const [custom, setCustom] = useState("");

  const toggle = (role: string) => {
    update((d) => {
      const has = d.targetRoles.includes(role);
      if (has) return { ...d, targetRoles: d.targetRoles.filter((r) => r !== role) };
      if (d.targetRoles.length >= 2) return d;
      return { ...d, targetRoles: [...d.targetRoles, role] };
    });
  };

  const addCustom = () => {
    const v = custom.trim();
    if (!v) return;
    if (data.targetRoles.includes(v) || data.targetRoles.length >= 2) return;
    update((d) => ({ ...d, targetRoles: [...d.targetRoles, v] }));
    setCustom("");
  };

  const setPreset = (id: AudiencePresetId) =>
    update((d) => ({ ...d, audiencePreset: id }));

  // Show curated roles + any custom ones the user already picked
  const displayRoles = [
    ...TARGET_ROLES,
    ...data.targetRoles.filter((r) => !(TARGET_ROLES as readonly string[]).includes(r)),
  ];

  return (
    <div>
      <StepHeader
        eyebrow="Step 01"
        title="Who are you and what are you targeting?"
        sub="Pick your career stage and the two roles you're going after. Everything downstream — bullets, keywords, ATS scoring — adapts to your choices."
      />

      {/* Audience preset */}
      <div className="mt-10">
        <p className="mb-3 font-mono text-xs uppercase tracking-widest text-muted-foreground">
          Career stage
        </p>
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {AUDIENCE_PRESETS.map((p) => {
            const selected = (data.audiencePreset ?? "early_career") === p.id;
            return (
              <button
                key={p.id}
                onClick={() => setPreset(p.id)}
                className={`rounded-2xl border p-4 text-left transition-all ${
                  selected
                    ? "border-primary/60 bg-primary/10 shadow-elegant"
                    : "border-border bg-surface hover:border-primary/40 hover:bg-accent/40"
                }`}
              >
                <div className="font-display text-lg leading-tight">{p.label}</div>
                <div className="mt-1 text-xs text-muted-foreground">{p.desc}</div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Target roles */}
      <div className="mt-10">
        <div className="mb-3 flex items-center justify-between">
          <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
            Target roles · pick exactly two
          </p>
          <span className="font-mono text-xs text-muted-foreground">
            {data.targetRoles.length} / 2
          </span>
        </div>

        <div className="grid gap-2 sm:grid-cols-2">
          {displayRoles.map((role) => {
            const idx = data.targetRoles.indexOf(role);
            const selected = idx !== -1;
            const full = data.targetRoles.length >= 2 && !selected;
            return (
              <button
                key={role}
                onClick={() => toggle(role)}
                disabled={full}
                className={`group flex items-center justify-between rounded-2xl border p-4 text-left transition-all ${
                  selected
                    ? "border-primary/60 bg-primary/10 shadow-elegant"
                    : full
                      ? "border-border bg-surface/40 opacity-50"
                      : "border-border bg-surface hover:border-primary/40 hover:bg-accent/40"
                }`}
              >
                <div>
                  <div className="font-display text-xl">{role}</div>
                  {selected && (
                    <div className="mt-1 font-mono text-[10px] uppercase tracking-widest text-primary-glow">
                      Priority {idx + 1}
                    </div>
                  )}
                </div>
                <div
                  className={`grid h-6 w-6 place-items-center rounded-full border transition ${
                    selected
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border"
                  }`}
                >
                  {selected ? (
                    <Check className="h-3.5 w-3.5" />
                  ) : (
                    <X className="h-3 w-3 opacity-0" />
                  )}
                </div>
              </button>
            );
          })}
        </div>

        {/* Custom role */}
        <div className="mt-4 flex gap-2">
          <input
            value={custom}
            onChange={(e) => setCustom(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                addCustom();
              }
            }}
            placeholder="Don't see your role? Type it here (e.g. Solutions Architect)"
            disabled={data.targetRoles.length >= 2}
            className="flex-1 rounded-xl border border-border bg-surface px-4 py-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/30 disabled:opacity-50"
          />
          <button
            onClick={addCustom}
            disabled={!custom.trim() || data.targetRoles.length >= 2}
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-primary px-4 py-3 text-sm font-medium text-primary-foreground shadow-elegant transition disabled:opacity-40"
          >
            <Plus className="h-4 w-4" />
            Add
          </button>
        </div>
      </div>
    </div>
  );
}

export function StepHeader({
  eyebrow,
  title,
  sub,
}: {
  eyebrow: string;
  title: string;
  sub?: string;
}) {
  return (
    <div>
      <p className="font-mono text-xs uppercase tracking-[0.2em] text-primary-glow">
        {eyebrow}
      </p>
      <h1 className="mt-3 font-display text-5xl leading-tight">{title}</h1>
      {sub && (
        <p className="mt-4 max-w-2xl text-muted-foreground text-balance">{sub}</p>
      )}
    </div>
  );
}
