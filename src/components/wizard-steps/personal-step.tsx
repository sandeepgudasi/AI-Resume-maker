import type { ResumeData, PersonalInfo } from "@/lib/resume-types";
import { StepHeader } from "./roles-step";

const fields: Array<{
  key: keyof PersonalInfo;
  label: string;
  placeholder: string;
  type?: string;
  required?: boolean;
  optional?: boolean;
  full?: boolean;
}> = [
  { key: "fullName", label: "Full name", placeholder: "Aarav Sharma", required: true, full: true },
  {
    key: "professionalTitle",
    label: "Professional title",
    placeholder: "e.g. Software Engineer, Product Manager, Marketing Specialist",
    optional: true,
    full: true,
  },
  { key: "email", label: "Email", placeholder: "aarav@mail.com", type: "email", required: true },
  { key: "phone", label: "Phone", placeholder: "+91 98765 43210", required: true },
  { key: "location", label: "Location", placeholder: "Bengaluru, India", required: true },
  {
    key: "linkedin",
    label: "LinkedIn URL",
    placeholder: "linkedin.com/in/you",
    required: true,
  },
  { key: "github", label: "GitHub URL", placeholder: "github.com/you", required: true },
  {
    key: "portfolio",
    label: "Portfolio",
    placeholder: "your.dev",
    optional: true,
  },
];

export function PersonalStep({
  data,
  update,
}: {
  data: ResumeData;
  update: (u: (d: ResumeData) => ResumeData) => void;
}) {
  const set = (k: keyof PersonalInfo, v: string) =>
    update((d) => ({ ...d, personal: { ...d.personal, [k]: v } }));

  return (
    <div>
      <StepHeader
        eyebrow="Step 02"
        title="Your contact details."
        sub="We use these for the header. No professional summary here — AI writes that for you later."
      />
      <div className="mt-10 grid gap-4 sm:grid-cols-2">
        {fields.map((f) => (
          <label key={f.key} className={f.full ? "sm:col-span-2" : ""}>
            <div className="mb-1.5 flex items-center gap-2 text-xs">
              <span className="font-medium text-muted-foreground">{f.label}</span>
              {f.optional && (
                <span className="font-mono text-[10px] uppercase text-muted-foreground/60">
                  optional
                </span>
              )}
            </div>
            <input
              className="w-full rounded-xl border border-border bg-surface px-4 py-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/30"
              placeholder={f.placeholder}
              type={f.type ?? "text"}
              value={data.personal[f.key] ?? ""}
              onChange={(e) => set(f.key, e.target.value)}
              required={f.required}
            />
          </label>
        ))}
      </div>
    </div>
  );
}
