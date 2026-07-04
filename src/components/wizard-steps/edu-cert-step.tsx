import type { ResumeData, Education, Certificate } from "@/lib/resume-types";
import { StepHeader } from "./roles-step";
import { IconAddBtn, SectionTitle, TextInput } from "./experience-step";
import { Trash2 } from "lucide-react";

const uid = () => Math.random().toString(36).slice(2, 10);

export function EducationStep({
  data,
  update,
}: {
  data: ResumeData;
  update: (u: (d: ResumeData) => ResumeData) => void;
}) {
  const add = () =>
    update((d) => ({
      ...d,
      education: [
        ...d.education,
        {
          id: uid(),
          degree: "",
          branch: "",
          college: "",
          university: "",
          score: "",
          startYear: "",
          endYear: "",
        } satisfies Education,
      ],
    }));

  return (
    <div>
      <StepHeader
        eyebrow="Step 06"
        title="Education."
        sub="Most recent first. Include CGPA or percentage — recruiters at big AI shops still filter on it."
      />
      <div className="mt-8 space-y-4">
        <SectionTitle
          title={`${data.education.length} record${data.education.length === 1 ? "" : "s"}`}
          action={<IconAddBtn onClick={add}>Add education</IconAddBtn>}
        />
        {data.education.map((e) => (
          <div key={e.id} className="rounded-2xl border border-border bg-surface p-5">
            <div className="flex items-start justify-between">
              <div className="font-display text-xl">
                {e.degree || "New education"}
              </div>
              <button
                onClick={() =>
                  update((d) => ({
                    ...d,
                    education: d.education.filter((x) => x.id !== e.id),
                  }))
                }
                className="text-muted-foreground hover:text-destructive"
                aria-label="Remove"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <TextInput label="Degree" value={e.degree} onChange={(v) => set(e.id, { degree: v })} placeholder="B.Tech" />
              <TextInput label="Branch" value={e.branch} onChange={(v) => set(e.id, { branch: v })} placeholder="Computer Science" />
              <TextInput label="College" value={e.college} onChange={(v) => set(e.id, { college: v })} />
              <TextInput label="University" value={e.university} onChange={(v) => set(e.id, { university: v })} />
              <TextInput label="CGPA / Percentage" value={e.score} onChange={(v) => set(e.id, { score: v })} placeholder="8.7 CGPA" />
              <div className="grid grid-cols-2 gap-3">
                <TextInput label="Start year" value={e.startYear} onChange={(v) => set(e.id, { startYear: v })} placeholder="2020" />
                <TextInput label="End year" value={e.endYear} onChange={(v) => set(e.id, { endYear: v })} placeholder="2024" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  function set(id: string, patch: Partial<Education>) {
    update((d) => ({
      ...d,
      education: d.education.map((x) => (x.id === id ? { ...x, ...patch } : x)),
    }));
  }
}

export function CertificatesStep({
  data,
  update,
}: {
  data: ResumeData;
  update: (u: (d: ResumeData) => ResumeData) => void;
}) {
  const add = () =>
    update((d) => ({
      ...d,
      certificates: [
        ...d.certificates,
        { id: uid(), name: "", organization: "", issueDate: "" } satisfies Certificate,
      ],
    }));
  return (
    <div>
      <StepHeader
        eyebrow="Step 07"
        title="Certifications."
        sub="AWS ML Specialty, DeepLearning.AI, Coursera GenAI — anything credentialed."
      />
      <div className="mt-8 space-y-4">
        <SectionTitle
          title={`${data.certificates.length} certificate${data.certificates.length === 1 ? "" : "s"}`}
          action={<IconAddBtn onClick={add}>Add certificate</IconAddBtn>}
        />
        {data.certificates.map((c) => (
          <div key={c.id} className="rounded-2xl border border-border bg-surface p-5">
            <div className="flex items-start justify-between">
              <div className="font-display text-xl">{c.name || "New certificate"}</div>
              <button
                onClick={() =>
                  update((d) => ({
                    ...d,
                    certificates: d.certificates.filter((x) => x.id !== c.id),
                  }))
                }
                className="text-muted-foreground hover:text-destructive"
                aria-label="Remove"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <TextInput label="Certificate name" value={c.name} onChange={(v) => set(c.id, { name: v })} />
              <TextInput label="Organization" value={c.organization} onChange={(v) => set(c.id, { organization: v })} />
              <TextInput label="Issue date" value={c.issueDate} onChange={(v) => set(c.id, { issueDate: v })} placeholder="Mar 2025" />
              <TextInput label="Credential ID" optional value={c.credentialId ?? ""} onChange={(v) => set(c.id, { credentialId: v })} />
              <div className="sm:col-span-2">
                <TextInput label="Credential URL" optional value={c.credentialUrl ?? ""} onChange={(v) => set(c.id, { credentialUrl: v })} />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  function set(id: string, patch: Partial<Certificate>) {
    update((d) => ({
      ...d,
      certificates: d.certificates.map((x) => (x.id === id ? { ...x, ...patch } : x)),
    }));
  }
}
