import type { OptimizedResume } from "./resume-types";
import type { TemplateId } from "./resume-constants";

/** LaTeX escape */
function esc(s: string | undefined | null): string {
  if (!s) return "";
  return s
    .replace(/\\/g, "\\textbackslash{}")
    .replace(/&/g, "\\&")
    .replace(/%/g, "\\%")
    .replace(/\$/g, "\\$")
    .replace(/#/g, "\\#")
    .replace(/_/g, "\\_")
    .replace(/\{/g, "\\{")
    .replace(/\}/g, "\\}")
    .replace(/~/g, "\\textasciitilde{}")
    .replace(/\^/g, "\\textasciicircum{}");
}

const PREAMBLES: Record<TemplateId, string> = {
  modern: `\\documentclass[11pt,letterpaper]{article}
\\usepackage[margin=0.6in]{geometry}
\\usepackage[hidelinks]{hyperref}
\\usepackage{enumitem}
\\usepackage{titlesec}
\\usepackage{xcolor}
\\definecolor{primary}{HTML}{5B4FE9}
\\titleformat{\\section}{\\Large\\bfseries\\color{primary}}{}{0em}{}[\\vspace{-6pt}\\hrule\\vspace{2pt}]
\\pagestyle{empty}
\\setlist[itemize]{leftmargin=*,itemsep=1pt,parsep=0pt}`,
  classic: `\\documentclass[11pt,letterpaper]{article}
\\usepackage[margin=0.75in]{geometry}
\\usepackage[hidelinks]{hyperref}
\\usepackage{enumitem}
\\usepackage{titlesec}
\\titleformat{\\section}{\\Large\\scshape}{}{0em}{}[\\vspace{-4pt}\\hrule]
\\pagestyle{empty}
\\setlist[itemize]{leftmargin=*,itemsep=1pt,parsep=0pt}`,
  professional: `\\documentclass[11pt,letterpaper]{article}
\\usepackage[margin=0.7in]{geometry}
\\usepackage[hidelinks]{hyperref}
\\usepackage{enumitem}
\\usepackage{titlesec}
\\usepackage{xcolor}
\\definecolor{accent}{HTML}{111827}
\\titleformat{\\section}{\\large\\bfseries\\color{accent}\\MakeUppercase}{}{0em}{}[\\vspace{-6pt}\\hrule\\vspace{2pt}]
\\pagestyle{empty}
\\setlist[itemize]{leftmargin=*,itemsep=1pt,parsep=0pt}`,
  minimal: `\\documentclass[11pt,letterpaper]{article}
\\usepackage[margin=0.85in]{geometry}
\\usepackage[hidelinks]{hyperref}
\\usepackage{enumitem}
\\usepackage{titlesec}
\\titleformat{\\section}{\\normalsize\\bfseries}{}{0em}{}
\\pagestyle{empty}
\\setlist[itemize]{leftmargin=*,itemsep=2pt,parsep=0pt}`,
  bigtech: `\\documentclass[10pt,letterpaper]{article}
\\usepackage[margin=0.5in]{geometry}
\\usepackage[hidelinks]{hyperref}
\\usepackage{enumitem}
\\usepackage{titlesec}
\\titleformat{\\section}{\\normalsize\\bfseries\\MakeUppercase}{}{0em}{}[\\vspace{-6pt}\\hrule\\vspace{2pt}]
\\pagestyle{empty}
\\setlist[itemize]{leftmargin=*,itemsep=0pt,parsep=0pt}`,
  startup: `\\documentclass[11pt,letterpaper]{article}
\\usepackage[margin=0.65in]{geometry}
\\usepackage[hidelinks]{hyperref}
\\usepackage{enumitem}
\\usepackage{titlesec}
\\usepackage{xcolor}
\\definecolor{primary}{HTML}{F59E0B}
\\titleformat{\\section}{\\Large\\bfseries\\color{primary}}{}{0em}{}
\\pagestyle{empty}
\\setlist[itemize]{leftmargin=*,itemsep=1pt,parsep=0pt}`,
};

export function generateLatex(
  resume: OptimizedResume,
  targetRoles: string[],
  template: TemplateId,
): string {
  const p = resume.personal;
  const contacts = [
    p.email,
    p.phone,
    p.location,
    p.linkedin,
    p.github,
    p.portfolio,
  ]
    .filter(Boolean)
    .map((c) => esc(c!))
    .join(" $\\bullet$ ");

  const experience = resume.experience
    .map(
      (e) => `\\vspace{4pt}
\\textbf{${esc(e.title)}} \\hfill ${esc(e.startDate)} -- ${esc(e.endDate)} \\\\
\\textit{${esc(e.company)}}${e.technologies.length ? ` \\hfill \\small ${esc(e.technologies.join(", "))}` : ""}
\\begin{itemize}
${e.bullets.map((b) => `\\item ${esc(b)}`).join("\n")}
\\end{itemize}`,
    )
    .join("\n\n");

  const projects = resume.projects
    .map(
      (pr) => `\\vspace{4pt}
\\textbf{${esc(pr.name)}}${pr.github ? ` \\hfill \\small ${esc(pr.github)}` : ""} \\\\
\\textit{${esc(pr.description)}}${pr.technologies.length ? ` \\hfill \\small ${esc(pr.technologies.join(", "))}` : ""}
\\begin{itemize}
${pr.bullets.map((b) => `\\item ${esc(b)}`).join("\n")}
\\end{itemize}`,
    )
    .join("\n\n");

  const education = resume.education
    .map(
      (e) => `\\textbf{${esc(e.degree)}${e.branch ? `, ${esc(e.branch)}` : ""}} \\hfill ${esc(e.startYear)} -- ${esc(e.endYear)} \\\\
${esc(e.college)}${e.university ? `, ${esc(e.university)}` : ""}${e.score ? ` \\hfill ${esc(e.score)}` : ""} \\\\`,
    )
    .join("\n\\vspace{4pt}\n");

  const certificates = resume.certificates
    .map(
      (c) =>
        `\\textbf{${esc(c.name)}} -- ${esc(c.organization)}${c.issueDate ? ` \\hfill ${esc(c.issueDate)}` : ""} \\\\`,
    )
    .join("\n");

  const skills = resume.skills.length
    ? `\\section{Technical Skills}
${esc(resume.skills.join(" $\\bullet$ "))}`
    : "";

  const title = p.professionalTitle || targetRoles.join(" / ");

  return `${PREAMBLES[template]}

\\begin{document}
\\begin{center}
{\\Huge \\bfseries ${esc(p.fullName)}}\\\\[4pt]
{\\large ${esc(title)}}\\\\[4pt]
{\\small ${contacts}}
\\end{center}

\\section{Summary}
${esc(resume.summary)}

${skills}

${experience ? `\\section{Experience}\n${experience}` : ""}

${projects ? `\\section{Projects}\n${projects}` : ""}

${education ? `\\section{Education}\n${education}` : ""}

${certificates ? `\\section{Certifications}\n${certificates}` : ""}

\\end{document}
`;
}
