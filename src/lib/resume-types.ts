import type { TargetRole, TemplateId } from "./resume-constants";

export interface PersonalInfo {
  fullName: string;
  professionalTitle?: string;
  phone: string;
  email: string;
  location: string;
  linkedin: string;
  github: string;
  portfolio?: string;
}

export interface Internship {
  id: string;
  company: string;
  role: string;
  startDate: string;
  endDate: string;
  responsibilities: string;
  technologies: string[];
  projectName?: string;
}

export interface PersonalProject {
  id: string;
  name: string;
  description: string;
  technologies: string[];
  github?: string;
  liveLink?: string;
  contribution: string;
}

export interface CompanyProject {
  id: string;
  name: string;
  domain?: string;
  client?: string;
  technologies: string[];
}

export interface Company {
  id: string;
  name: string;
  title: string;
  startDate: string;
  endDate: string;
  currentlyWorking: boolean;
  projects: CompanyProject[];
  responsibilities: string;
}

export interface Education {
  id: string;
  degree: string;
  branch: string;
  college: string;
  university: string;
  score: string;
  startYear: string;
  endYear: string;
}

export interface Certificate {
  id: string;
  name: string;
  organization: string;
  issueDate: string;
  credentialId?: string;
  credentialUrl?: string;
}

export type ExperienceLevel = "fresher" | "experienced";

export type AudiencePreset =
  | "student"
  | "early_career"
  | "mid_level"
  | "senior"
  | "switcher";

export interface ResumeData {
  targetRoles: TargetRole[];
  audiencePreset?: AudiencePreset;
  personal: PersonalInfo;
  experienceLevel: ExperienceLevel;
  totalExperience?: string;
  hasInternships?: boolean;
  internships: Internship[];
  personalProjects: PersonalProject[];
  companies: Company[];
  skills: string[];
  education: Education[];
  certificates: Certificate[];
}

export interface OptimizedResume {
  summary: string;
  personal: PersonalInfo;
  skills: string[];
  education: Education[];
  certificates: Certificate[];
  experience: Array<{
    company: string;
    title: string;
    startDate: string;
    endDate: string;
    bullets: string[];
    technologies: string[];
  }>;
  projects: Array<{
    name: string;
    description: string;
    bullets: string[];
    technologies: string[];
    github?: string;
    liveLink?: string;
  }>;
}

export interface AtsBreakdown {
  keywordMatch: number;
  skillsMatch: number;
  experienceMatch: number;
  projectQuality: number;
  formatting: number;
  readability: number;
  actionVerbs: number;
  matchedKeywords: string[];
  missingKeywords: string[];
  recommendedSkills: string[];
  suggestions: string[];
}

export const emptyResumeData = (): ResumeData => ({
  targetRoles: [],
  audiencePreset: "early_career",
  personal: {
    fullName: "",
    phone: "",
    email: "",
    location: "",
    linkedin: "",
    github: "",
  },
  experienceLevel: "fresher",
  internships: [],
  personalProjects: [],
  companies: [],
  skills: [],
  education: [],
  certificates: [],
});

export interface StoredResume {
  id: string;
  title: string;
  target_roles: string[];
  data: ResumeData;
  optimized_data: OptimizedResume | null;
  ats_score: number | null;
  ats_breakdown: AtsBreakdown | null;
  template: TemplateId;
  latex_source: string | null;
  status: string;
  created_at: string;
  updated_at: string;
}
