import { z } from "zod";

export const createCourseSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters").max(100),
  description: z.string().min(10, "Description must be at least 10 characters"),
  category: z.string().optional(),
});

export const submitCourseSchema = z.object({
  approvalDocs: z.string().url("approvalDocs must be a valid URL"),
});

export const reviewCourseSchema = z.object({
  status: z.enum(["published", "rejected"], {
    errorMap: () => ({ message: "Status must be 'published' or 'rejected'" }),
  }),
  rejectionReason: z.string().optional(),
}).refine(data => data.status === "rejected" ? !!data.rejectionReason : true, {
  message: "Rejection reason is required when status is rejected",
  path: ["rejectionReason"],
});
