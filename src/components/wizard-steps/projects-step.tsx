import type { ResumeData, PersonalProject } from "@/lib/resume-types";
import { StepHeader } from "./roles-step";
import {
  IconAddBtn,
  SectionTitle,
  TextInput,
  TextArea,
  ChipInput,
} from "./experience-step";
import { Trash2 } from "lucide-react";

const uid = () => Math.random().toString(36).slice(2, 10);

export function ProjectsStep({
  data,
  update,
}: {
  data: ResumeData;
  update: (u: (d: ResumeData) => ResumeData) => void;
}) {
  const add = () =>
    update((d) => ({
      ...d,
      personalProjects: [
        ...d.personalProjects,
        {
          id: uid(),
          name: "",
          description: "",
          technologies: [],
          contribution: "",
        } satisfies PersonalProject,
      ],
    }));

  return (
    <div>
      <StepHeader
        eyebrow="Step 04"
        title="Personal projects."
        sub="Just drop project names — AI will craft the description, tech stack, and achievement bullets packed with ATS keywords. (Industry experience stays manual to keep it authentic.)"
      />

      <div className="mt-8 space-y-5">
        <SectionTitle
          title={`${data.personalProjects.length} project${data.personalProjects.length === 1 ? "" : "s"}`}
          action={<IconAddBtn onClick={add}>Add project</IconAddBtn>}
        />
        {data.personalProjects.length === 0 && (
          <div className="rounded-2xl border border-dashed border-border bg-surface/50 p-10 text-center text-sm text-muted-foreground">
            No projects yet. Even one strong project can move the ATS needle.
          </div>
        )}
        {data.personalProjects.map((p) => (
          <div key={p.id} className="rounded-2xl border border-border bg-surface p-5">
            <div className="flex items-start justify-between">
              <div className="font-display text-xl">{p.name || "New project"}</div>
              <button
                onClick={() =>
                  update((d) => ({
                    ...d,
                    personalProjects: d.personalProjects.filter((x) => x.id !== p.id),
                  }))
                }
                className="text-muted-foreground hover:text-destructive"
                aria-label="Remove"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <TextInput
                  label="Project name"
                  value={p.name}
                  onChange={(v) => patch(p.id, { name: v })}
                  placeholder="e.g. Real-time Chat App, Movie Recommender, Portfolio Site"
                />
              </div>
              <TextInput
                label="GitHub link"
                optional
                value={p.github ?? ""}
                onChange={(v) => patch(p.id, { github: v })}
              />
              <TextInput
                label="Live link"
                optional
                value={p.liveLink ?? ""}
                onChange={(v) => patch(p.id, { liveLink: v })}
              />
            </div>
            <p className="mt-3 text-xs text-muted-foreground">
              AI will generate the description, technologies, and bullets from the name during optimization.
            </p>
          </div>
        ))}
      </div>
    </div>
  );

  function patch(id: string, patch: Partial<PersonalProject>) {
    update((d) => ({
      ...d,
      personalProjects: d.personalProjects.map((x) =>
        x.id === id ? { ...x, ...patch } : x,
      ),
    }));
  }
}
