import type { OptimizedResume } from "@/lib/resume-types";
import type { TemplateId } from "@/lib/resume-constants";

// HTML preview that visually mirrors the LaTeX layout. Also used for PDF export via html2canvas + jsPDF.
// The "classic" template is tuned to closely resemble the standard LaTeX
// (Latin Modern / Computer Modern) serif look used by reference resumes.
export function ResumePreview({

  data,
  targetRoles,
  template,
  printRef,
}: {
  data: OptimizedResume;
  targetRoles: string[];
  template: TemplateId;
  printRef?: React.RefObject<HTMLDivElement | null>;
}) {
  const styles = TEMPLATE_STYLES[template];
  const p = data.personal;
  const title = p.professionalTitle || targetRoles.join(" / ");

  return (
    <div
      ref={printRef}
      id="resume-preview"
      className="mx-auto"
      style={{
        width: "816px", // 8.5in @ 96dpi
        minHeight: "1056px",
        padding: styles.padding,
        fontFamily: styles.fontFamily,
        fontSize: styles.fontSize,
        lineHeight: 1.4,
        background: "#ffffff",
        color: "#111111",
      }}
    >
      <div style={{ textAlign: styles.headerAlign as "center" | "left" }}>
        <div
          style={{
            fontSize: styles.nameSize,
            fontWeight: 700,
            color: styles.primary,
            letterSpacing: "-0.02em",
          }}
        >
          {p.fullName}
        </div>
        <div style={{ fontSize: 14, marginTop: 4, color: "#333" }}>{title}</div>
        <div style={{ fontSize: 11, marginTop: 6, color: "#555" }}>
          {[p.email, p.phone, p.location, p.linkedin, p.github, p.portfolio]
            .filter(Boolean)
            .join("  |  ")}

        </div>
      </div>

      <Section title="Summary" styles={styles}>
        <p>{data.summary}</p>
      </Section>

      {data.skills.length > 0 && (
        <Section title="Technical Skills" styles={styles}>
          <p style={{ lineHeight: 1.6 }}>{data.skills.join(" • ")}</p>
        </Section>
      )}

      {data.experience.length > 0 && (
        <Section title="Experience" styles={styles}>
          {data.experience.map((e, i) => (
            <div key={i} style={{ marginBottom: 12 }}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  fontWeight: 600,
                }}
              >
                <span>{e.title}</span>
                <span style={{ fontWeight: 400, color: "#555" }}>
                  {e.startDate} — {e.endDate}
                </span>
              </div>
              <div style={{ fontStyle: "italic", color: "#333" }}>{e.company}</div>
              <ul
                style={{
                  margin: "6px 0 0 20px",
                  padding: 0,
                  listStyle: "disc",
                }}
              >
                {e.bullets.map((b, j) => (
                  <li key={j} style={{ marginBottom: 3 }}>
                    {b}
                  </li>
                ))}
              </ul>
              {e.technologies.length > 0 && (
                <div style={{ marginTop: 4, fontSize: 10.5, color: "#666" }}>
                  <em>Tech: {e.technologies.join(", ")}</em>
                </div>
              )}
            </div>
          ))}
        </Section>
      )}

      {data.projects.length > 0 && (
        <Section title="Projects" styles={styles}>
          {data.projects.map((pr, i) => (
            <div key={i} style={{ marginBottom: 12 }}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  fontWeight: 600,
                }}
              >
                <span>{pr.name}</span>
                {pr.github && (
                  <span style={{ fontWeight: 400, color: "#555", fontSize: 10.5 }}>
                    {pr.github}
                  </span>
                )}
              </div>
              <div style={{ fontStyle: "italic", color: "#333" }}>
                {pr.description}
              </div>
              <ul style={{ margin: "6px 0 0 20px", padding: 0, listStyle: "disc" }}>
                {pr.bullets.map((b, j) => (
                  <li key={j} style={{ marginBottom: 3 }}>
                    {b}
                  </li>
                ))}
              </ul>
              {pr.technologies.length > 0 && (
                <div style={{ marginTop: 4, fontSize: 10.5, color: "#666" }}>
                  <em>Tech: {pr.technologies.join(", ")}</em>
                </div>
              )}
            </div>
          ))}
        </Section>
      )}

      {data.education.length > 0 && (
        <Section title="Education" styles={styles}>
          {data.education.map((e, i) => (
            <div key={i} style={{ marginBottom: 8 }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontWeight: 600 }}>
                <span>
                  {e.degree}
                  {e.branch && `, ${e.branch}`}
                </span>
                <span style={{ fontWeight: 400, color: "#555" }}>
                  {e.startYear} — {e.endYear}
                </span>
              </div>
              <div style={{ color: "#333" }}>
                {e.college}
                {e.university && `, ${e.university}`}
                {e.score && ` • ${e.score}`}
              </div>
            </div>
          ))}
        </Section>
      )}

      {data.certificates.length > 0 && (
        <Section title="Certifications" styles={styles}>
          {data.certificates.map((c, i) => (
            <div key={i} style={{ marginBottom: 6 }}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  fontWeight: 600,
                }}
              >
                <span>
                  {c.name} — <span style={{ fontWeight: 400 }}>{c.organization}</span>
                </span>
                {c.issueDate && (
                  <span style={{ fontWeight: 400, color: "#555" }}>{c.issueDate}</span>
                )}
              </div>
            </div>
          ))}
        </Section>
      )}
    </div>
  );
}

interface Styles {
  padding: string;
  fontFamily: string;
  fontSize: number;
  nameSize: number;
  primary: string;
  headerAlign: string;
  sectionStyle: "hr" | "hr-color" | "caps" | "plain" | "amber";
}

const TEMPLATE_STYLES: Record<TemplateId, Styles> = {
  modern: {
    padding: "48px 48px",
    fontFamily: "Inter, Helvetica, Arial, sans-serif",
    fontSize: 11.5,
    nameSize: 30,
    primary: "#5B4FE9",
    headerAlign: "center",
    sectionStyle: "hr-color",
  },
  classic: {
    padding: "56px 64px",
    fontFamily:
      "'Latin Modern Roman', 'CMU Serif', 'Computer Modern', 'Times New Roman', Georgia, serif",
    fontSize: 11,
    nameSize: 28,
    primary: "#000",
    headerAlign: "center",
    sectionStyle: "hr",
  },

  professional: {
    padding: "48px 56px",
    fontFamily: "Georgia, 'Times New Roman', serif",
    fontSize: 11.5,
    nameSize: 28,
    primary: "#111827",
    headerAlign: "left",
    sectionStyle: "caps",
  },
  minimal: {
    padding: "64px 72px",
    fontFamily: "Inter, Helvetica, Arial, sans-serif",
    fontSize: 11,
    nameSize: 24,
    primary: "#111",
    headerAlign: "left",
    sectionStyle: "plain",
  },
  bigtech: {
    padding: "36px 40px",
    fontFamily: "Helvetica, Arial, sans-serif",
    fontSize: 10.5,
    nameSize: 26,
    primary: "#111",
    headerAlign: "center",
    sectionStyle: "caps",
  },
  startup: {
    padding: "48px 52px",
    fontFamily: "Inter, Helvetica, Arial, sans-serif",
    fontSize: 11.5,
    nameSize: 32,
    primary: "#F59E0B",
    headerAlign: "left",
    sectionStyle: "amber",
  },
};

function Section({
  title,
  styles,
  children,
}: {
  title: string;
  styles: Styles;
  children: React.ReactNode;
}) {
  const headerStyle: React.CSSProperties = {
    marginTop: 20,
    marginBottom: 8,
    fontSize: 14,
    fontWeight: 700,
    color: styles.sectionStyle === "hr-color" || styles.sectionStyle === "amber" ? styles.primary : "#111",
    textTransform:
      styles.sectionStyle === "caps" || styles.sectionStyle === "amber"
        ? ("uppercase" as const)
        : ("none" as const),
    letterSpacing: styles.sectionStyle === "caps" ? "0.05em" : "0",
    borderBottom:
      styles.sectionStyle === "hr" ||
      styles.sectionStyle === "hr-color" ||
      styles.sectionStyle === "caps"
        ? `1px solid ${styles.primary}`
        : "none",
    paddingBottom: 3,
  };
  return (
    <div>
      <div style={headerStyle}>{title}</div>
      <div style={{ fontSize: styles.fontSize }}>{children}</div>
    </div>
  );
}
