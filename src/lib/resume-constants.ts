export const TARGET_ROLES = [
  // Engineering
  "Software Engineer",
  "Frontend Engineer",
  "Backend Engineer",
  "Full Stack Engineer",
  "Mobile Engineer",
  "DevOps Engineer",
  "Site Reliability Engineer",
  "QA Engineer",
  "Cloud Engineer",
  "Security Engineer",
  // Data & AI
  "AI Engineer",
  "Generative AI Engineer",
  "Machine Learning Engineer",
  "LLM Engineer",
  "NLP Engineer",
  "Data Scientist",
  "Data Analyst",
  "Data Engineer",
  "Analytics Engineer",
  "RAG Engineer",
  "Prompt Engineer",
  // Language-specific
  "Python Developer",
  "Java Developer",
  "JavaScript Developer",
  // Product & Design
  "Product Manager",
  "Associate Product Manager",
  "UX Designer",
  "UI Designer",
  "Product Designer",
  // Business
  "Business Analyst",
  "Project Manager",
  "Marketing Manager",
  "Digital Marketing Specialist",
  "Sales Executive",
  "Customer Success Manager",
  "HR Manager",
  "Financial Analyst",
  "Operations Manager",
  "Consultant",
] as const;

export type TargetRole = (typeof TARGET_ROLES)[number] | (string & {});

export const AUDIENCE_PRESETS = [
  {
    id: "student",
    label: "Student / Intern",
    desc: "In college or looking for your first internship. Projects + coursework lead.",
  },
  {
    id: "early_career",
    label: "Early Career (0–3 yrs)",
    desc: "New grad or a couple of years in. Experience + projects balanced.",
  },
  {
    id: "mid_level",
    label: "Mid-level (3–7 yrs)",
    desc: "Established IC. Impact, ownership, and metrics take the lead.",
  },
  {
    id: "senior",
    label: "Senior / Lead (7+ yrs)",
    desc: "Senior IC, tech lead, or manager. Scope, leadership, and outcomes.",
  },
  {
    id: "switcher",
    label: "Career Switcher",
    desc: "Changing fields. Transferable skills and relevant projects up front.",
  },
] as const;

export type AudiencePresetId = (typeof AUDIENCE_PRESETS)[number]["id"];

export const SKILL_CATEGORIES: Record<string, string[]> = {
  Programming: ["Python", "Java", "C++", "C#", "JavaScript", "TypeScript", "SQL", "Go", "Rust", "Kotlin", "Swift", "PHP", "Ruby"],
  "AI / ML": [
    "Machine Learning",
    "Deep Learning",
    "TensorFlow",
    "PyTorch",
    "LangChain",
    "Prompt Engineering",
    "OpenAI",
    "Hugging Face",
    "RAG",
    "Vector Search",
    "Fine-tuning",
    "Embeddings",
  ],
  Frontend: ["React", "Next.js", "Vue", "Angular", "Svelte", "Tailwind CSS", "HTML", "CSS", "Redux"],
  Backend: ["Node.js", "Express", "FastAPI", "Flask", "Django", "Spring Boot", ".NET", "gRPC", "GraphQL", "REST APIs"],
  Databases: ["PostgreSQL", "MySQL", "MongoDB", "Redis", "Elasticsearch", "SQLite", "DynamoDB", "Firestore"],
  Cloud: ["AWS", "Azure", "GCP", "Vercel", "Cloudflare", "Netlify"],
  DevOps: ["Docker", "Kubernetes", "Git", "GitHub Actions", "Linux", "Terraform", "CI/CD", "Jenkins", "Ansible"],
  "Product & Design": ["Figma", "Sketch", "Adobe XD", "User Research", "Wireframing", "Prototyping", "Design Systems", "Roadmapping", "A/B Testing"],
  Analytics: ["Excel", "Tableau", "Power BI", "Looker", "Google Analytics", "Mixpanel", "Amplitude", "dbt", "Airflow"],
  Marketing: ["SEO", "SEM", "Content Strategy", "Email Marketing", "HubSpot", "Salesforce", "Google Ads", "Meta Ads"],
  "Business & Soft": ["Stakeholder Management", "Agile", "Scrum", "Communication", "Leadership", "Public Speaking", "Negotiation"],
};

export const TEMPLATES = [
  { id: "classic", name: "Classic LaTeX", description: "Serif, centered header, hrule sections — the standard LaTeX résumé look." },
  { id: "modern", name: "Modern", description: "Clean, single-column, recruiter-friendly." },
  { id: "professional", name: "Professional", description: "Balanced two-tone with sidebar accents." },
  { id: "minimal", name: "Minimal", description: "Whitespace-first, monochromatic." },
  { id: "bigtech", name: "Big Tech", description: "Dense, keyword-rich, FAANG style." },
  { id: "startup", name: "Startup", description: "Bold, opinionated, achievement-led." },
] as const;


export type TemplateId = (typeof TEMPLATES)[number]["id"];
