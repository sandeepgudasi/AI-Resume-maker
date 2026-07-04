import { createFileRoute, Navigate, useNavigate } from "@tanstack/react-router";
import { useResume } from "@/lib/resume-hooks";
import { useAutoSaveResumeData } from "@/lib/resume-hooks";
import { WizardShell, WIZARD_STEPS, type WizardStepId } from "@/components/wizard-shell";
import { RolesStep } from "@/components/wizard-steps/roles-step";
import { PersonalStep } from "@/components/wizard-steps/personal-step";
import { ExperienceStep } from "@/components/wizard-steps/experience-step";
import { ProjectsStep } from "@/components/wizard-steps/projects-step";
import { SkillsStep } from "@/components/wizard-steps/skills-step";
import { EducationStep, CertificatesStep } from "@/components/wizard-steps/edu-cert-step";
import { ReviewStep } from "@/components/wizard-steps/review-step";
import { OptimizeStep, AtsStep } from "@/components/wizard-steps/optimize-ats-step";
import { TemplateStep, GenerateStep } from "@/components/wizard-steps/template-generate-step";
import type { TemplateId } from "@/lib/resume-constants";

export const Route = createFileRoute("/resume/$id/wizard/$step")({
  component: WizardRoute,
});

function WizardRoute() {
  const { id, step } = Route.useParams();
  const navigate = useNavigate();
  const { data: resume, isLoading, error } = useResume(id);
  const { data, update, saving, savedAt } = useAutoSaveResumeData(id, resume?.data);

  const validStep = WIZARD_STEPS.find((s) => s.id === step);
  if (!validStep) return <Navigate to="/resume/$id/wizard/$step" params={{ id, step: "roles" }} />;

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background text-muted-foreground">
        Loading resume…
      </div>
    );
  }
  if (error || !resume) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background text-destructive">
        Resume not found.
      </div>
    );
  }

  const canGoNext = validateStep(step as WizardStepId, data, resume.optimized_data);

  return (
    <WizardShell saving={saving} savedAt={savedAt} canGoNext={canGoNext}>
      {step === "roles" && <RolesStep data={data} update={update} />}
      {step === "personal" && <PersonalStep data={data} update={update} />}
      {step === "experience" && <ExperienceStep data={data} update={update} />}
      {step === "projects" && <ProjectsStep data={data} update={update} />}
      {step === "skills" && <SkillsStep data={data} update={update} />}
      {step === "education" && <EducationStep data={data} update={update} />}
      {step === "certificates" && <CertificatesStep data={data} update={update} />}
      {step === "review" && <ReviewStep data={data} update={update} />}
      {step === "optimize" && <OptimizeStep data={data} update={update} />}
      {step === "ats" && (
        <AtsStep breakdown={resume.ats_breakdown} score={resume.ats_score} />
      )}
      {step === "template" && (
        <TemplateStep
          optimized={resume.optimized_data}
          targetRoles={resume.target_roles}
          currentTemplate={(resume.template as TemplateId) ?? "classic"}
        />
      )}
      {step === "generate" && (
        <GenerateStep
          optimized={resume.optimized_data}
          targetRoles={resume.target_roles}
          template={(resume.template as TemplateId) ?? "classic"}
          title={resume.title}
        />
      )}
    </WizardShell>
  );

  // helper closures use `navigate` when needed later
  void navigate;
}

function validateStep(
  step: WizardStepId,
  data: import("@/lib/resume-types").ResumeData,
  optimized: import("@/lib/resume-types").OptimizedResume | null,
): boolean {
  switch (step) {
    case "roles":
      return data.targetRoles.length === 2;
    case "personal":
      return !!(
        data.personal.fullName &&
        data.personal.email &&
        data.personal.phone &&
        data.personal.location &&
        data.personal.linkedin &&
        data.personal.github
      );
    case "skills":
      return data.skills.length >= 3;
    case "education":
      return data.education.length > 0;
    case "optimize":
    case "ats":
    case "template":
      return !!optimized;
    default:
      return true;
  }
}
