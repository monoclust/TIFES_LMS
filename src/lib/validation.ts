import { z } from "zod";

const optionalEmail = z.union([z.string().trim().email().max(254), z.literal("")]).optional();

export const studentImportRowSchema = z.object({
  studentCode: z.string().trim().min(1, "Student ID is required").max(64),
  name: z.string().trim().min(1, "Student name is required").max(160),
  email: optionalEmail,
  phone: z.union([z.string().trim().max(32), z.literal("")]).optional(),
});

export type StudentImportRow = z.infer<typeof studentImportRowSchema>;

export const studentImportSchema = z.array(studentImportRowSchema).min(1).max(5000);

export const repositorySubmissionSchema = z.object({
  repositoryUrl: z.string().trim().url().max(2048).refine((value) => {
    try {
      const url = new URL(value);
      const segments = url.pathname.split("/").filter(Boolean);
      return url.protocol === "https:" && url.hostname === "github.com" && !url.username && !url.password && segments.length >= 2 && segments[0] !== "settings";
    } catch {
      return false;
    }
  }, "Enter an HTTPS GitHub repository URL (github.com/owner/repository)."),
  notes: z.string().trim().max(5000).optional(),
});

export type RepositorySubmissionInput = z.infer<typeof repositorySubmissionSchema>;

export const institutionCreateSchema = z.object({
  name: z.string().trim().min(2).max(180),
  slug: z.string().trim().toLowerCase().min(2).max(80).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Use lowercase letters, numbers and single hyphens."),
  code: z.string().trim().max(40).optional(),
  type: z.enum(["SCHOOL", "COLLEGE", "TRAINING_INSTITUTE", "OTHER"]).default("OTHER"),
  address: z.string().trim().max(2000).optional(),
  contactName: z.string().trim().max(160).optional(),
  contactEmail: z.union([z.string().trim().email().max(254), z.literal("")]).optional(),
  contactPhone: z.string().trim().max(32).optional(),
  academicYear: z.string().trim().max(32).optional(),
  timezone: z.string().trim().min(1).max(80).default("Asia/Kolkata"),
});
