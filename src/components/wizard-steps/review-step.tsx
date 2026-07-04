import type { ResumeData } from "@/lib/resume-types";
import { StepHeader } from "./roles-step";
import { Link, useParams } from "@tanstack/react-router";
import { Pencil } from "lucide-react";

export function ReviewStep({ data }: { data: ResumeData; update: unknown }) {
  const { id } = useParams({ from: "/resume/$id/wizard/$step" });
  const sections: Array<{ step: string; title: string; body: React.ReactNode }> = [
    {
      step: "roles",
      title: "Target roles",
      body:
        data.targetRoles.length === 0 ? (
          <Empty msg="No roles selected" />
        ) : (
          <div className="flex gap-2">
            {data.targetRoles.map((r) => (
              <span
                key={r}
                className="rounded-full border border-primary/40 bg-primary/10 px-3 py-1 text-sm text-primary-glow"
              >
                {r}
              </span>
            ))}
          </div>
        ),
    },
    {
      step: "personal",
      title: "Personal info",
      body: (
        <div className="text-sm text-foreground/80">
          <div className="font-display text-2xl text-foreground">
            {data.personal.fullName || "—"}
          </div>
          <div className="mt-1 font-mono text-xs text-muted-foreground">
            {[data.personal.email, data.personal.phone, data.personal.location]
              .filter(Boolean)
              .join(" · ") || "—"}
          </div>
        </div>
      ),
    },
    {
      step: "experience",
      title:
        data.experienceLevel === "fresher" ? "Internships" : "Companies",
      body:
        data.experienceLevel === "fresher" ? (
          data.internships.length === 0 ? (
            <Empty msg="No internships" />
          ) : (
            <ul className="space-y-2 text-sm">
              {data.internships.map((i) => (
                <li key={i.id}>
                  <span className="font-medium">{i.role || "Role"}</span> ·{" "}
                  <span className="text-muted-foreground">{i.company}</span>
                </li>
              ))}
            </ul>
          )
        ) : data.companies.length === 0 ? (
          <Empty msg="No companies" />
        ) : (
          <ul className="space-y-2 text-sm">
            {data.companies.map((c) => (
              <li key={c.id}>
                <span className="font-medium">{c.title || "Title"}</span> ·{" "}
                <span className="text-muted-foreground">{c.name}</span>
              </li>
            ))}
          </ul>
        ),
    },
    {
      step: "projects",
      title: "Projects",
      body:
        data.personalProjects.length === 0 ? (
          <Empty msg="No projects" />
        ) : (
          <ul className="space-y-2 text-sm">
            {data.personalProjects.map((p) => (
              <li key={p.id}>
                <span className="font-medium">{p.name || "Project"}</span>
                {p.technologies.length > 0 && (
                  <span className="ml-2 text-muted-foreground">
                    {p.technologies.slice(0, 3).join(", ")}
                  </span>
                )}
              </li>
            ))}
          </ul>
        ),
    },
    {
      step: "skills",
      title: "Skills",
      body:
        data.skills.length === 0 ? (
          <Empty msg="No skills" />
        ) : (
          <div className="flex flex-wrap gap-1.5">
            {data.skills.map((s) => (
              <span
                key={s}
                className="rounded-md border border-border bg-background px-2 py-0.5 font-mono text-xs text-muted-foreground"
              >
                {s}
              </span>
            ))}
          </div>
        ),
    },
    {
      step: "education",
      title: "Education",
      body:
        data.education.length === 0 ? (
          <Empty msg="No education" />
        ) : (
          <ul className="space-y-2 text-sm">
            {data.education.map((e) => (
              <li key={e.id}>
                <span className="font-medium">
                  {e.degree} {e.branch && `— ${e.branch}`}
                </span>{" "}
                · <span className="text-muted-foreground">{e.college}</span>
              </li>
            ))}
          </ul>
        ),
    },
    {
      step: "certificates",
      title: "Certificates",
      body:
        data.certificates.length === 0 ? (
          <Empty msg="No certificates" />
        ) : (
          <ul className="space-y-2 text-sm">
            {data.certificates.map((c) => (
              <li key={c.id}>
                <span className="font-medium">{c.name}</span> ·{" "}
                <span className="text-muted-foreground">{c.organization}</span>
              </li>
            ))}
          </ul>
        ),
    },
  ];

  return (
    <div>
      <StepHeader
        eyebrow="Step 08"
        title="Review everything."
        sub="Fix anything that isn't right. Next up: AI cleans your bullets, generates a summary, and scores for ATS."
      />
      <div className="mt-10 space-y-4">
        {sections.map((s) => (
          <div key={s.step} className="rounded-2xl border border-border bg-surface p-6">
            <div className="flex items-center justify-between">
              <div className="font-mono text-xs uppercase tracking-widest text-primary-glow">
                {s.title}
              </div>
              <Link
                to="/resume/$id/wizard/$step"
                params={{ id, step: s.step }}
                className="inline-flex items-center gap-1 text-xs text-muted-foreground transition hover:text-foreground"
              >
                <Pencil className="h-3 w-3" /> Edit
              </Link>
            </div>
            <div className="mt-3">{s.body}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function Empty({ msg }: { msg: string }) {
  return <div className="text-sm text-muted-foreground">{msg}</div>;
}
