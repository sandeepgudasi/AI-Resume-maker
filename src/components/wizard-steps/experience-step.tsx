import type { ResumeData, Internship, Company, CompanyProject } from "@/lib/resume-types";
import { StepHeader } from "./roles-step";
import { Plus, Trash2, Briefcase, GraduationCap } from "lucide-react";

const uid = () => Math.random().toString(36).slice(2, 10);

export function ExperienceStep({
  data,
  update,
}: {
  data: ResumeData;
  update: (u: (d: ResumeData) => ResumeData) => void;
}) {
  return (
    <div>
      <StepHeader
        eyebrow="Step 03"
        title="Your experience."
        sub="Fresher? Add internships. Experienced? Add companies and projects. Write naturally — AI cleans it up."
      />

      <div className="mt-8 grid gap-3 sm:grid-cols-2">
        {(["fresher", "experienced"] as const).map((lvl) => {
          const active = data.experienceLevel === lvl;
          const Icon = lvl === "fresher" ? GraduationCap : Briefcase;
          return (
            <button
              key={lvl}
              onClick={() => update((d) => ({ ...d, experienceLevel: lvl }))}
              className={`rounded-2xl border p-5 text-left transition ${
                active
                  ? "border-primary/60 bg-primary/10 shadow-elegant"
                  : "border-border bg-surface hover:border-primary/40"
              }`}
            >
              <Icon
                className={`h-5 w-5 ${active ? "text-primary-glow" : "text-muted-foreground"}`}
              />
              <div className="mt-3 font-display text-2xl capitalize">{lvl}</div>
              <div className="mt-1 text-xs text-muted-foreground">
                {lvl === "fresher"
                  ? "Student or recent grad. Internships + personal projects."
                  : "Working professional. Company roles + projects."}
              </div>
            </button>
          );
        })}
      </div>

      {data.experienceLevel === "fresher" ? (
        <FresherPath data={data} update={update} />
      ) : (
        <ExperiencedPath data={data} update={update} />
      )}
    </div>
  );
}

function FresherPath({
  data,
  update,
}: {
  data: ResumeData;
  update: (u: (d: ResumeData) => ResumeData) => void;
}) {
  const addInternship = () =>
    update((d) => ({
      ...d,
      hasInternships: true,
      internships: [
        ...d.internships,
        {
          id: uid(),
          company: "",
          role: "",
          startDate: "",
          endDate: "",
          responsibilities: "",
          technologies: [],
        },
      ],
    }));

  return (
    <div className="mt-10 space-y-6">
      <div className="rounded-2xl border border-border bg-surface p-5">
        <div className="text-sm font-medium">Have you done any internships?</div>
        <div className="mt-3 flex gap-2">
          {[
            { v: true, l: "Yes" },
            { v: false, l: "No" },
          ].map((o) => (
            <button
              key={o.l}
              onClick={() =>
                update((d) => ({
                  ...d,
                  hasInternships: o.v,
                  internships: o.v ? d.internships : [],
                }))
              }
              className={`rounded-full border px-5 py-2 text-sm transition ${
                data.hasInternships === o.v
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-background text-foreground hover:bg-accent"
              }`}
            >
              {o.l}
            </button>
          ))}
        </div>
      </div>

      {data.hasInternships && (
        <div className="space-y-4">
          <SectionTitle
            title="Internships"
            action={
              <IconAddBtn onClick={addInternship}>Add internship</IconAddBtn>
            }
          />
          {data.internships.map((i) => (
            <InternshipCard
              key={i.id}
              internship={i}
              onChange={(patch) =>
                update((d) => ({
                  ...d,
                  internships: d.internships.map((x) =>
                    x.id === i.id ? { ...x, ...patch } : x,
                  ),
                }))
              }
              onRemove={() =>
                update((d) => ({
                  ...d,
                  internships: d.internships.filter((x) => x.id !== i.id),
                }))
              }
            />
          ))}
        </div>
      )}
    </div>
  );
}

function InternshipCard({
  internship,
  onChange,
  onRemove,
}: {
  internship: Internship;
  onChange: (patch: Partial<Internship>) => void;
  onRemove: () => void;
}) {
  return (
    <div className="rounded-2xl border border-border bg-surface p-5">
      <div className="flex items-start justify-between">
        <div className="font-display text-xl">
          {internship.role || "New internship"}
        </div>
        <button
          onClick={onRemove}
          className="text-muted-foreground transition hover:text-destructive"
          aria-label="Remove"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <TextInput
          label="Company"
          value={internship.company}
          onChange={(v) => onChange({ company: v })}
        />
        <TextInput
          label="Role"
          value={internship.role}
          onChange={(v) => onChange({ role: v })}
        />
        <TextInput
          label="Start date"
          value={internship.startDate}
          onChange={(v) => onChange({ startDate: v })}
          placeholder="Jun 2024"
        />
        <TextInput
          label="End date"
          value={internship.endDate}
          onChange={(v) => onChange({ endDate: v })}
          placeholder="Aug 2024"
        />
        <TextInput
          label="Project name"
          optional
          value={internship.projectName ?? ""}
          onChange={(v) => onChange({ projectName: v })}
        />
        <ChipInput
          label="Technologies"
          values={internship.technologies}
          onChange={(v) => onChange({ technologies: v })}
        />
        <div className="sm:col-span-2">
          <TextArea
            label="Responsibilities"
            value={internship.responsibilities}
            onChange={(v) => onChange({ responsibilities: v })}
            placeholder="Write naturally — AI turns this into ATS bullets later."
            rows={4}
          />
        </div>
      </div>
    </div>
  );
}

function ExperiencedPath({
  data,
  update,
}: {
  data: ResumeData;
  update: (u: (d: ResumeData) => ResumeData) => void;
}) {
  const options = ["<1 Year", "1 Year", "2 Years", "3 Years", "4 Years", "5+ Years", "10+ Years"];
  const addCompany = () =>
    update((d) => ({
      ...d,
      companies: [
        ...d.companies,
        {
          id: uid(),
          name: "",
          title: "",
          startDate: "",
          endDate: "",
          currentlyWorking: false,
          projects: [],
          responsibilities: "",
        },
      ],
    }));

  return (
    <div className="mt-10 space-y-6">
      <div className="rounded-2xl border border-border bg-surface p-5">
        <div className="text-sm font-medium">Total experience</div>
        <div className="mt-3 flex flex-wrap gap-2">
          {options.map((o) => (
            <button
              key={o}
              onClick={() => update((d) => ({ ...d, totalExperience: o }))}
              className={`rounded-full border px-4 py-1.5 text-sm transition ${
                data.totalExperience === o
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-background text-foreground hover:bg-accent"
              }`}
            >
              {o}
            </button>
          ))}
        </div>
      </div>
      <SectionTitle
        title="Companies"
        action={<IconAddBtn onClick={addCompany}>Add company</IconAddBtn>}
      />
      {data.companies.map((c) => (
        <CompanyCard
          key={c.id}
          company={c}
          onChange={(patch) =>
            update((d) => ({
              ...d,
              companies: d.companies.map((x) => (x.id === c.id ? { ...x, ...patch } : x)),
            }))
          }
          onRemove={() =>
            update((d) => ({
              ...d,
              companies: d.companies.filter((x) => x.id !== c.id),
            }))
          }
        />
      ))}
    </div>
  );
}

function CompanyCard({
  company,
  onChange,
  onRemove,
}: {
  company: Company;
  onChange: (patch: Partial<Company>) => void;
  onRemove: () => void;
}) {
  const addProject = () =>
    onChange({
      projects: [
        ...company.projects,
        { id: uid(), name: "", technologies: [] } satisfies CompanyProject,
      ],
    });
  return (
    <div className="rounded-2xl border border-border bg-surface p-5">
      <div className="flex items-start justify-between">
        <div className="font-display text-xl">{company.name || "New company"}</div>
        <button
          onClick={onRemove}
          className="text-muted-foreground transition hover:text-destructive"
          aria-label="Remove"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <TextInput label="Company" value={company.name} onChange={(v) => onChange({ name: v })} />
        <TextInput label="Job title" value={company.title} onChange={(v) => onChange({ title: v })} />
        <TextInput
          label="Start date"
          value={company.startDate}
          onChange={(v) => onChange({ startDate: v })}
          placeholder="Aug 2022"
        />
        <TextInput
          label="End date"
          value={company.endDate}
          onChange={(v) => onChange({ endDate: v })}
          placeholder={company.currentlyWorking ? "Present" : "Jul 2024"}
          disabled={company.currentlyWorking}
        />
        <label className="col-span-full flex items-center gap-2 text-sm text-muted-foreground">
          <input
            type="checkbox"
            checked={company.currentlyWorking}
            onChange={(e) =>
              onChange({
                currentlyWorking: e.target.checked,
                endDate: e.target.checked ? "Present" : "",
              })
            }
            className="h-4 w-4 accent-primary"
          />
          I currently work here
        </label>
        <div className="sm:col-span-2">
          <TextArea
            label="Responsibilities"
            value={company.responsibilities}
            onChange={(v) => onChange({ responsibilities: v })}
            placeholder="e.g. Developed FastAPI services powering an internal RAG assistant used by 1200+ analysts…"
            rows={5}
          />
        </div>
      </div>

      <div className="mt-6 rounded-xl border border-dashed border-border p-4">
        <div className="flex items-center justify-between">
          <div className="text-sm font-medium">Projects at this company</div>
          <IconAddBtn onClick={addProject}>Add project</IconAddBtn>
        </div>
        <div className="mt-3 space-y-3">
          {company.projects.map((p) => (
            <div
              key={p.id}
              className="grid gap-3 rounded-lg bg-background p-3 sm:grid-cols-2"
            >
              <TextInput
                label="Project name"
                value={p.name}
                onChange={(v) =>
                  onChange({
                    projects: company.projects.map((x) =>
                      x.id === p.id ? { ...x, name: v } : x,
                    ),
                  })
                }
              />
              <TextInput
                label="Domain"
                optional
                value={p.domain ?? ""}
                onChange={(v) =>
                  onChange({
                    projects: company.projects.map((x) =>
                      x.id === p.id ? { ...x, domain: v } : x,
                    ),
                  })
                }
              />
              <TextInput
                label="Client"
                optional
                value={p.client ?? ""}
                onChange={(v) =>
                  onChange({
                    projects: company.projects.map((x) =>
                      x.id === p.id ? { ...x, client: v } : x,
                    ),
                  })
                }
              />
              <ChipInput
                label="Technologies"
                values={p.technologies}
                onChange={(v) =>
                  onChange({
                    projects: company.projects.map((x) =>
                      x.id === p.id ? { ...x, technologies: v } : x,
                    ),
                  })
                }
              />
              <div className="sm:col-span-2 flex justify-end">
                <button
                  onClick={() =>
                    onChange({
                      projects: company.projects.filter((x) => x.id !== p.id),
                    })
                  }
                  className="text-xs text-muted-foreground hover:text-destructive"
                >
                  Remove project
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// -------------- shared small inputs ----------------

export function TextInput({
  label,
  value,
  onChange,
  placeholder,
  optional,
  disabled,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  optional?: boolean;
  disabled?: boolean;
}) {
  return (
    <label>
      <div className="mb-1.5 flex items-center gap-2 text-xs">
        <span className="font-medium text-muted-foreground">{label}</span>
        {optional && (
          <span className="font-mono text-[10px] uppercase text-muted-foreground/60">
            optional
          </span>
        )}
      </div>
      <input
        className="w-full rounded-lg border border-border bg-background px-3.5 py-2.5 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/30 disabled:opacity-60"
        value={value}
        placeholder={placeholder}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value)}
      />
    </label>
  );
}

export function TextArea({
  label,
  value,
  onChange,
  placeholder,
  rows = 3,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  rows?: number;
}) {
  return (
    <label>
      <div className="mb-1.5 text-xs font-medium text-muted-foreground">{label}</div>
      <textarea
        rows={rows}
        className="w-full resize-none rounded-lg border border-border bg-background px-3.5 py-2.5 text-sm leading-relaxed outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/30"
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
      />
    </label>
  );
}

export function ChipInput({
  label,
  values,
  onChange,
  placeholder = "Type + Enter",
}: {
  label: string;
  values: string[];
  onChange: (v: string[]) => void;
  placeholder?: string;
}) {
  return (
    <label>
      <div className="mb-1.5 text-xs font-medium text-muted-foreground">{label}</div>
      <div className="flex flex-wrap items-center gap-1.5 rounded-lg border border-border bg-background px-2.5 py-2">
        {values.map((v) => (
          <span
            key={v}
            className="inline-flex items-center gap-1 rounded-md border border-border bg-surface px-2 py-0.5 font-mono text-[11px]"
          >
            {v}
            <button
              type="button"
              onClick={() => onChange(values.filter((x) => x !== v))}
              className="text-muted-foreground hover:text-destructive"
            >
              ×
            </button>
          </span>
        ))}
        <input
          className="min-w-[100px] flex-1 bg-transparent p-1 text-sm outline-none"
          placeholder={placeholder}
          onKeyDown={(e) => {
            const t = e.currentTarget;
            if ((e.key === "Enter" || e.key === ",") && t.value.trim()) {
              e.preventDefault();
              const v = t.value.trim();
              if (!values.includes(v)) onChange([...values, v]);
              t.value = "";
            }
          }}
        />
      </div>
    </label>
  );
}

export function SectionTitle({
  title,
  action,
}: {
  title: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between">
      <div className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
        {title}
      </div>
      {action}
    </div>
  );
}

export function IconAddBtn({
  children,
  onClick,
}: {
  children: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      type="button"
      className="inline-flex items-center gap-1.5 rounded-full border border-border bg-surface px-3 py-1.5 text-xs font-medium text-foreground transition hover:border-primary/40 hover:bg-accent"
    >
      <Plus className="h-3.5 w-3.5" /> {children}
    </button>
  );
}
