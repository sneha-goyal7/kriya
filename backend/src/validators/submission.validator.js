import { z } from "zod";

export const submissionSchema = z.object({
  format: z.enum(["github", "url", "document"]),
  content: z.string().min(1, "Content is required"),
  studentNote: z.string().optional(),
}).superRefine((val, ctx) => {
  if (val.format === "github" || val.format === "url") {
    try {
      new URL(val.content);
    } catch (e) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Must be a valid URL",
        path: ["content"]
      });
    }
  }
});
