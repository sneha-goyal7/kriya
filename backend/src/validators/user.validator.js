import { z } from "zod";

export const teachingApplicationSchema = z.object({
  linkedIn: z.string().url("Must be a valid LinkedIn URL").optional().or(z.literal("")),
  yearsExperience: z.number().min(0, "Years of experience cannot be negative").max(50),
  expertise: z.array(z.string()).min(1, "At least one area of expertise is required").max(10),
  sampleWork: z.string().url("Must be a valid URL").optional().or(z.literal("")),
});

export const reviewApplicationSchema = z.object({
  isApproved: z.boolean({ required_error: "isApproved must be a boolean" }),
});

export const updateProfileSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").optional(),
  avatar: z.string().url("Avatar must be a valid URL").optional().or(z.literal("")),
});
