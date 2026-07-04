import { createOpenAICompatible } from "@ai-sdk/openai-compatible";
import { generateText, Output, NoObjectGeneratedError } from "ai";
import { z } from "zod";
import { createServerFn } from "@tanstack/react-start";

function extractJSON(raw: string | undefined): unknown {
  if (!raw) throw new Error("Empty AI response");
  let cleaned = raw
    .replace(/^```json\s*/im, "")
    .replace(/^```\s*/im, "")
    .replace(/```\s*$/im, "")
    .trim();
  if (!cleaned.startsWith("{") && !cleaned.startsWith("[")) {
    const objStart = cleaned.indexOf("{");
    const arrStart = cleaned.indexOf("[");
    const isArray = arrStart !== -1 && (objStart === -1 || arrStart < objStart);
    const start = isArray ? arrStart : objStart;
    const end = isArray ? cleaned.lastIndexOf("]") : cleaned.lastIndexOf("}");
    if (start === -1 || end <= start) throw new Error("No JSON in response");
    cleaned = cleaned.slice(start, end + 1);
  }
  try {
    return JSON.parse(cleaned);
  } catch {
    cleaned = cleaned
      .replace(/,\s*}/g, "}")
      .replace(/,\s*]/g, "]")
      .replace(/[\x00-\x1F\x7F]/g, "");
    return JSON.parse(cleaned);
  }
}
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

// ---------- schemas ----------

const OptimizedSchema = z.object({
  summary: z.string(),
  experience: z.array(
    z.object({
      company: z.string(),
      title: z.string(),
      startDate: z.string(),
      endDate: z.string(),
      bullets: z.array(z.string()),
      technologies: z.array(z.string()),
    }),
  ),
  projects: z.array(
    z.object({
      name: z.string(),
      description: z.string(),
      bullets: z.array(z.string()),
      technologies: z.array(z.string()),
      github: z.string().nullable(),
      liveLink: z.string().nullable(),
    }),
  ),
  recommendedSkills: z.array(z.string()),
});

const AtsSchema = z.object({
  overall: z.number(),
  keywordMatch: z.number(),
  skillsMatch: z.number(),
  experienceMatch: z.number(),
  projectQuality: z.number(),
  formatting: z.number(),
  readability: z.number(),
  actionVerbs: z.number(),
  matchedKeywords: z.array(z.string()),
  missingKeywords: z.array(z.string()),
  recommendedSkills: z.array(z.string()),
  suggestions: z.array(z.string()),
});

// ---------- provider ----------

function gateway() {
  const key = process.env.LOVABLE_API_KEY;
  if (!key) throw new Error("Missing LOVABLE_API_KEY");
  return createOpenAICompatible({
    name: "lovable",
    baseURL: "https://ai.gateway.lovable.dev/v1",
    supportsStructuredOutputs: false,
    headers: {
      "Lovable-API-Key": key,
      "X-Lovable-AIG-SDK": "vercel-ai-sdk",
    },
  });
}

// ---------- optimize ----------

export const optimizeResume = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z.object({ resumeId: z.string().uuid() }).parse(input),
  )
  .handler(async ({ data, context }) => {
    const { data: row, error } = await context.supabase
      .from("resumes")
      .select("data, target_roles")
      .eq("id", data.resumeId)
      .single();
    if (error || !row) throw new Error(error?.message ?? "Not found");
    const resumeData = row.data as unknown as Record<string, unknown>;
    const targetRoles = row.target_roles as string[];
    const preset = (resumeData.audiencePreset as string) ?? "early_career";

    const presetGuidance: Record<string, string> = {
      student:
        "The candidate is a STUDENT or seeking their first internship. Lead with academic projects, coursework, hackathons, and any teaching-assistant / open-source work. Do not invent employment history. Keep tone eager and precise; metrics can be scoped to project impact (users, accuracy, latency).",
      early_career:
        "The candidate is EARLY CAREER (0-3 years). Balance experience bullets with strong personal/side projects. Emphasize learning velocity, shipped features, and measurable outcomes.",
      mid_level:
        "The candidate is MID-LEVEL (3-7 years). Lead with ownership, cross-team impact, and quantified outcomes. Downweight coursework. Use senior IC language.",
      senior:
        "The candidate is SENIOR / LEAD (7+ years). Emphasize scope, architecture decisions, mentorship, business impact, and org-level outcomes. Executive-adjacent tone.",
      switcher:
        "The candidate is a CAREER SWITCHER. Foreground transferable skills, relevant projects, and any bridging work (courses, certifications, freelance). Reframe past experience through the lens of the target roles without fabrication.",
    };

    const prompt = `You are a senior technical resume writer working across engineering, data/AI, product, design, and business roles.
The user is targeting these two roles: ${targetRoles.join(" and ")}.
${presetGuidance[preset] ?? presetGuidance.early_career}

Given the user's raw resume data (JSON below), produce optimized content:
- summary: 3-4 punchy sentences tailored to the target roles and career stage above. NEVER fabricate credentials, employers, or years of experience. Use concrete details from their data.
- experience: for each company/internship, rewrite responsibilities as 3-5 strong ATS bullets. Each bullet MUST start with a powerful action verb (Built, Architected, Shipped, Led, Reduced, Automated, Deployed, Optimized, Scaled, Designed, Launched, Owned, Delivered). Include metrics ONLY when the user hinted at them; do NOT invent numbers. Copy technologies/tools from the user's data. This is real industry work — stay faithful to what they wrote.
- projects: these are PERSONAL/side projects. The user may have only given a project name (description, technologies, contribution may be empty). In that case FULLY GENERATE a realistic 1-2 sentence description, a strong industry-standard tech stack (5-8 technologies) that fits the project name and target roles, and 3-4 achievement-style bullets loaded with ATS keywords, action verbs, and plausible impact metrics (users, latency ms, accuracy %, throughput). Buzzwords and quantified outcomes are encouraged here to maximize ATS score. Preserve github and liveLink if provided (null otherwise). If the user DID provide description/contribution, respect it and only polish.
- recommendedSkills: 5-8 additional skills the user should consider adding for the target roles, based on gaps.

Return only valid JSON matching the schema.

USER DATA:
${JSON.stringify(resumeData)}`;

    const model = gateway()("google/gemini-3-flash-preview");
    let output: z.infer<typeof OptimizedSchema>;
    try {
      const res = await generateText({
        model,
        output: Output.object({ schema: OptimizedSchema }),
        prompt,
      });
      output = res.output;
    } catch (err) {
      if (NoObjectGeneratedError.isInstance(err)) {
        try {
          output = OptimizedSchema.parse(extractJSON(err.text));
        } catch {
          throw new Error("AI optimization returned invalid output. Please try again.");
        }
      } else {
        throw err;
      }
    }

    const optimized_data = {
      summary: output.summary,
      personal: (resumeData as { personal: unknown }).personal,
      skills: (resumeData as { skills: unknown }).skills,
      education: (resumeData as { education: unknown }).education,
      certificates: (resumeData as { certificates: unknown }).certificates,
      experience: output.experience,
      projects: output.projects.map((p) => ({
        ...p,
        github: p.github ?? undefined,
        liveLink: p.liveLink ?? undefined,
      })),
    };

    await context.supabase
      .from("resumes")
      .update({ optimized_data: optimized_data as unknown as never, status: "optimized" })
      .eq("id", data.resumeId);

    return { success: true, recommendedSkills: output.recommendedSkills };
  });

// ---------- ATS analysis ----------

export const analyzeAts = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z.object({ resumeId: z.string().uuid() }).parse(input),
  )
  .handler(async ({ data, context }) => {
    const { data: row, error } = await context.supabase
      .from("resumes")
      .select("optimized_data, target_roles")
      .eq("id", data.resumeId)
      .single();
    if (error || !row) throw new Error(error?.message ?? "Not found");
    if (!row.optimized_data) throw new Error("Run AI optimization first");

    const prompt = `You are an ATS (Applicant Tracking System) analyzer for resumes across engineering, data/AI, product, design, and business roles.
The candidate is targeting: ${(row.target_roles as string[]).join(" and ")}.

Analyze this optimized resume and return a strict JSON score object. All scores are 0-100 integers.
- overall: weighted composite; if content is rich and keyword-aligned, this SHOULD land above 90.
- keywordMatch: how well resume keywords match what recruiters search for these roles.
- skillsMatch, experienceMatch, projectQuality, formatting, readability, actionVerbs.
- matchedKeywords: keywords already present and helpful (max 20).
- missingKeywords: role-critical keywords that are absent (max 12).
- recommendedSkills: skills to add (max 8).
- suggestions: 3-6 actionable improvements (concise imperatives).

RESUME JSON:
${JSON.stringify(row.optimized_data)}`;

    const model = gateway()("google/gemini-3-flash-preview");
    let output: z.infer<typeof AtsSchema>;
    try {
      const res = await generateText({
        model,
        output: Output.object({ schema: AtsSchema }),
        prompt,
      });
      output = res.output;
    } catch (err) {
      if (NoObjectGeneratedError.isInstance(err)) {
        try {
          output = AtsSchema.parse(extractJSON(err.text));
        } catch {
          throw new Error("ATS analysis returned invalid output. Please try again.");
        }
      } else {
        throw err;
      }
    }

    const breakdown = {
      keywordMatch: output.keywordMatch,
      skillsMatch: output.skillsMatch,
      experienceMatch: output.experienceMatch,
      projectQuality: output.projectQuality,
      formatting: output.formatting,
      readability: output.readability,
      actionVerbs: output.actionVerbs,
      matchedKeywords: output.matchedKeywords,
      missingKeywords: output.missingKeywords,
      recommendedSkills: output.recommendedSkills,
      suggestions: output.suggestions,
    };

    await context.supabase
      .from("resumes")
      .update({
        ats_score: output.overall,
        ats_breakdown: breakdown as unknown as never,
        status: "scored",
      })
      .eq("id", data.resumeId);

    await context.supabase.from("ats_history").insert({
      resume_id: data.resumeId,
      user_id: context.userId,
      score: output.overall,
      breakdown: breakdown as unknown as never,
    });

    return { score: output.overall, breakdown };
  });
