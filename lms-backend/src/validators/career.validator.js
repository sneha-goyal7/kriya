import { z } from "zod";

export const updateProfileSchema = z.object({
  dreamRole: z.string().min(2, "Dream role must be at least 2 characters"),
  currentLevel: z.enum(["beginner", "intermediate", "advanced"], {
    required_error: "Current level is required",
  }),
  currentSkills: z.array(z.string()).default([]),
  preferredLearningStyle: z.enum(["visual", "hands-on", "reading", "mixed"]).default("mixed"),
  targetTimelineMonths: z.number().min(1).max(60).default(6),
});
export const createSkillSchema = z.object({
  name: z.string().min(1, "Skill name is required").trim(),
  category: z.enum(["frontend", "backend", "fullstack", "devops", "design", "soft-skill", "other"]),
  description: z.string().optional(),
  prerequisites: z.array(z.string()).optional(),
});

export const createEmployerSchema = z.object({
  companyName: z.string().min(2, "Company name is required").trim(),
  industry: z.string().min(2, "Industry is required").trim(),
  size: z.enum(["1-10", "11-50", "51-200", "201-500", "500+", "Enterprise"]),
  website: z.string().url("Must be a valid URL").optional().or(z.literal("")),
});
