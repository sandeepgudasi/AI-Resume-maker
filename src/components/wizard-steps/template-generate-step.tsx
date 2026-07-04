import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { StepHeader } from "./roles-step";
import { TEMPLATES, type TemplateId } from "@/lib/resume-constants";
import type { OptimizedResume } from "@/lib/resume-types";
import { ResumePreview } from "@/components/resume-preview";
import { generateLatex } from "@/lib/latex-generator";
import { Check, Download, FileCode2, FileText, Loader2 } from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";

type ResumePdf = InstanceType<typeof import("jspdf").jsPDF>;

export function TemplateStep({
  optimized,
  targetRoles,
  currentTemplate,
}: {
  optimized: OptimizedResume | null;
  targetRoles: string[];
  currentTemplate: TemplateId;
}) {
  const { id } = useParams({ from: "/resume/$id/wizard/$step" });
  const qc = useQueryClient();
  const [preview, setPreview] = useState<TemplateId>(currentTemplate);

  const setTemplate = useMutation({
    mutationFn: async (template: TemplateId) => {
      const { error } = await supabase
        .from("resumes")
        .update({ template })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["resume", id] }),
  });

  if (!optimized) {
    return (
      <div>
        <StepHeader
          eyebrow="Step 11"
          title="Template selection."
          sub="Run AI optimization first, then come back here to pick a template."
        />
      </div>
    );
  }

  return (
    <div>
      <StepHeader
        eyebrow="Step 11"
        title="Pick a template."
        sub="All six are ATS-safe. Click to preview — the export uses the same layout."
      />
      <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {TEMPLATES.map((t) => {
          const selected = preview === t.id;
          return (
            <button
              key={t.id}
              onClick={() => {
                setPreview(t.id);
                setTemplate.mutate(t.id);
              }}
              className={`group flex items-start justify-between gap-3 rounded-2xl border p-5 text-left transition ${
                selected
                  ? "border-primary/60 bg-primary/10 shadow-elegant"
                  : "border-border bg-surface hover:border-primary/40"
              }`}
            >
              <div>
                <div className="font-display text-2xl">{t.name}</div>
                <div className="mt-1 text-xs text-muted-foreground">
                  {t.description}
                </div>
              </div>
              {selected && (
                <div className="grid h-6 w-6 place-items-center rounded-full bg-primary text-primary-foreground">
                  <Check className="h-3.5 w-3.5" />
                </div>
              )}
            </button>
          );
        })}
      </div>

      <div className="mt-10 overflow-hidden rounded-3xl border border-border bg-muted/40 p-6">
        <div className="mb-3 flex items-center justify-between text-xs">
          <span className="font-mono uppercase tracking-widest text-muted-foreground">
            Live preview · {preview}
          </span>
        </div>
        <div className="max-h-[720px] overflow-auto rounded-xl">
          <div style={{ transform: "scale(0.85)", transformOrigin: "top center" }}>
            <ResumePreview data={optimized} targetRoles={targetRoles} template={preview} />
          </div>
        </div>
      </div>
    </div>
  );
}

export function GenerateStep({
  optimized,
  targetRoles,
  template,
  title,
}: {
  optimized: OptimizedResume | null;
  targetRoles: string[];
  template: TemplateId;
  title: string;
}) {
  const { id } = useParams({ from: "/resume/$id/wizard/$step" });
  const qc = useQueryClient();
  const printRef = useRef<HTMLDivElement>(null);
  const [busy, setBusy] = useState<"pdf" | "tex" | null>(null);

  if (!optimized) {
    return (
      <div>
        <StepHeader
          eyebrow="Step 12"
          title="Generate."
          sub="Run AI optimization first."
        />
      </div>
    );
  }

  const safeName = (title || "resume").replace(/[^a-z0-9]+/gi, "_").toLowerCase();

  const downloadTex = async () => {
    setBusy("tex");
    try {
      const latex = generateLatex(optimized, targetRoles, template);
      await supabase.from("resumes").update({ latex_source: latex }).eq("id", id);
      qc.invalidateQueries({ queryKey: ["resume", id] });
      const blob = new Blob([latex], { type: "application/x-tex" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${safeName}.tex`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success("LaTeX downloaded");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed");
    } finally {
      setBusy(null);
    }
  };

  const downloadPdf = async () => {
    setBusy("pdf");
    try {
      const { jsPDF } = await import("jspdf");
      const pdf = buildResumePdf(new jsPDF({ unit: "pt", format: "letter" }), {
        optimized,
        targetRoles,
        template,
      });
      pdf.save(`${safeName}.pdf`);
      toast.success("PDF downloaded");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed");
    } finally {
      setBusy(null);
    }
  };

  return (
    <div>
      <StepHeader
        eyebrow="Step 12"
        title="Your resume is ready."
        sub="Download the polished PDF for applications, and grab the LaTeX source for future edits or Overleaf."
      />
      <div className="mt-10 grid gap-3 sm:grid-cols-2">
        <button
          onClick={downloadPdf}
          disabled={busy !== null}
          className="group flex items-center gap-4 rounded-2xl border border-border bg-surface p-6 text-left transition hover:border-primary/40 hover:shadow-elegant disabled:opacity-60"
        >
          <div className="grid h-12 w-12 place-items-center rounded-xl bg-gradient-primary text-primary-foreground shadow-glow">
            {busy === "pdf" ? (
              <Loader2 className="h-6 w-6 animate-spin" />
            ) : (
              <FileText className="h-6 w-6" />
            )}
          </div>
          <div>
            <div className="font-display text-2xl">Download PDF</div>
            <div className="text-xs text-muted-foreground">Recruiter-ready · A4/Letter</div>
          </div>
          <Download className="ml-auto h-5 w-5 text-muted-foreground transition group-hover:text-foreground" />
        </button>
        <button
          onClick={downloadTex}
          disabled={busy !== null}
          className="group flex items-center gap-4 rounded-2xl border border-border bg-surface p-6 text-left transition hover:border-primary/40 hover:shadow-elegant disabled:opacity-60"
        >
          <div className="grid h-12 w-12 place-items-center rounded-xl border border-border bg-background text-primary-glow">
            {busy === "tex" ? (
              <Loader2 className="h-6 w-6 animate-spin" />
            ) : (
              <FileCode2 className="h-6 w-6" />
            )}
          </div>
          <div>
            <div className="font-display text-2xl">Download LaTeX</div>
            <div className="text-xs text-muted-foreground">.tex source · edit in Overleaf</div>
          </div>
          <Download className="ml-auto h-5 w-5 text-muted-foreground transition group-hover:text-foreground" />
        </button>
      </div>

      <div className="mt-10 overflow-hidden rounded-3xl border border-border bg-muted/40 p-6">
        <div className="mb-3 flex items-center justify-between text-xs">
          <span className="font-mono uppercase tracking-widest text-muted-foreground">
            Final preview · {template}
          </span>
        </div>
        <div className="max-h-[840px] overflow-auto rounded-xl">
          <ResumePreview
            data={optimized}
            targetRoles={targetRoles}
            template={template}
            printRef={printRef}
          />
        </div>
      </div>
    </div>
  );
}

function buildResumePdf(
  pdf: ResumePdf,
  {
    optimized,
    targetRoles,
    template,
  }: { optimized: OptimizedResume; targetRoles: string[]; template: TemplateId },
) {
  const pageW = pdf.internal.pageSize.getWidth();
  const pageH = pdf.internal.pageSize.getHeight();
  const margin = template === "classic" ? 54 : 50;
  const contentW = pageW - margin * 2;
  const baseFont = template === "modern" || template === "minimal" || template === "bigtech" ? "helvetica" : "times";
  const primary = template === "modern" ? "#4f46e5" : template === "startup" ? "#b45309" : "#111111";
  const title = optimized.personal.professionalTitle || targetRoles.join(" / ");
  let y = margin;

  const setColor = (hex: string) => pdf.setTextColor(hex);
  const clean = (value?: string | null) =>
    (value || "")
      .replace(/[•·]/g, "-")
      .replace(/[—–]/g, "-")
      .replace(/\s+/g, " ")
      .trim();
  const lineHeight = (size: number, factor = 1.28) => size * factor;
  const addPageIfNeeded = (needed = 36) => {
    if (y + needed <= pageH - margin) return;
    pdf.addPage();
    y = margin;
  };
  const drawText = (
    text: string,
    x: number,
    maxW: number,
    size = 10.5,
    style: "normal" | "bold" | "italic" | "bolditalic" = "normal",
    color = "#111111",
  ) => {
    const value = clean(text);
    if (!value) return;
    pdf.setFont(baseFont, style);
    pdf.setFontSize(size);
    setColor(color);
    const lines = pdf.splitTextToSize(value, maxW) as string[];
    lines.forEach((line) => {
      addPageIfNeeded(lineHeight(size));
      pdf.text(line, x, y);
      y += lineHeight(size);
    });
  };
  const drawCentered = (text: string, size: number, style: "normal" | "bold" = "normal", color = "#111111") => {
    const value = clean(text);
    if (!value) return;
    pdf.setFont(baseFont, style);
    pdf.setFontSize(size);
    setColor(color);
    pdf.text(value, pageW / 2, y, { align: "center", maxWidth: contentW });
    y += lineHeight(size, 1.12);
  };
  const drawSection = (label: string) => {
    addPageIfNeeded(38);
    y += 6;
    pdf.setFont(baseFont, "bold");
    pdf.setFontSize(11.5);
    setColor(primary);
    pdf.text(label.toUpperCase(), margin, y);
    pdf.setDrawColor(primary);
    pdf.setLineWidth(0.7);
    pdf.line(margin, y + 4, pageW - margin, y + 4);
    y += 17;
  };
  const drawRow = (left: string, right?: string) => {
    addPageIfNeeded(24);
    pdf.setFont(baseFont, "bold");
    pdf.setFontSize(10.6);
    setColor("#111111");
    pdf.text(clean(left), margin, y, { maxWidth: contentW - 150 });
    if (right) {
      pdf.setFont(baseFont, "normal");
      pdf.setFontSize(10.2);
      setColor("#444444");
      pdf.text(clean(right), pageW - margin, y, { align: "right", maxWidth: 145 });
    }
    y += 13;
  };
  const drawBullet = (text: string) => {
    const value = clean(text);
    if (!value) return;
    pdf.setFont(baseFont, "normal");
    pdf.setFontSize(10.2);
    setColor("#111111");
    const lines = pdf.splitTextToSize(value, contentW - 18) as string[];
    lines.forEach((line, index) => {
      addPageIfNeeded(14);
      pdf.text(index === 0 ? "-" : "", margin + 6, y);
      pdf.text(line, margin + 18, y);
      y += 12.8;
    });
  };

  pdf.setProperties({
    title: `${clean(optimized.personal.fullName) || "Resume"} Resume`,
    subject: "ATS-ready resume",
    creator: "ResumeForge AI",
  });

  drawCentered(optimized.personal.fullName || "Resume", template === "classic" ? 20 : 21, "bold", primary);
  drawCentered(title, 10.5, "normal", "#333333");
  drawCentered(
    [
      optimized.personal.email,
      optimized.personal.phone,
      optimized.personal.location,
      optimized.personal.linkedin,
      optimized.personal.github,
      optimized.personal.portfolio,
    ]
      .filter(Boolean)
      .join(" | "),
    9.5,
    "normal",
    "#444444",
  );

  drawSection("Summary");
  drawText(optimized.summary, margin, contentW, 10.4);

  if (optimized.skills.length) {
    drawSection("Technical Skills");
    drawText(optimized.skills.join(", "), margin, contentW, 10.2);
  }

  if (optimized.experience.length) {
    drawSection("Experience");
    optimized.experience.forEach((experience) => {
      drawRow(`${experience.title} - ${experience.company}`, `${experience.startDate} - ${experience.endDate}`);
      experience.bullets.forEach(drawBullet);
      if (experience.technologies.length) drawText(`Tech: ${experience.technologies.join(", ")}`, margin + 18, contentW - 18, 9.4, "italic", "#444444");
      y += 4;
    });
  }

  if (optimized.projects.length) {
    drawSection("Projects");
    optimized.projects.forEach((project) => {
      drawRow(project.name, project.github || project.liveLink);
      drawText(project.description, margin, contentW, 10.1, "italic", "#333333");
      project.bullets.forEach(drawBullet);
      if (project.technologies.length) drawText(`Tech: ${project.technologies.join(", ")}`, margin + 18, contentW - 18, 9.4, "italic", "#444444");
      y += 4;
    });
  }

  if (optimized.education.length) {
    drawSection("Education");
    optimized.education.forEach((education) => {
      drawRow(`${education.degree}${education.branch ? `, ${education.branch}` : ""}`, `${education.startYear} - ${education.endYear}`);
      drawText(
        [education.college, education.university, education.score].filter(Boolean).join(", "),
        margin,
        contentW,
        10.1,
        "normal",
        "#333333",
      );
      y += 2;
    });
  }

  if (optimized.certificates.length) {
    drawSection("Certifications");
    optimized.certificates.forEach((certificate) => {
      drawRow(`${certificate.name} - ${certificate.organization}`, certificate.issueDate);
    });
  }

  return pdf;
}
