import { describe, expect, it } from "vitest";
import { institutionCreateSchema, repositorySubmissionSchema, studentImportRowSchema, studentImportSchema } from "../src/lib/validation";

describe("student import validation", () => {
  it("trims valid roster fields", () => {
    expect(studentImportRowSchema.parse({ studentCode: " S-001 ", name: " Ava Rao ", email: "ava@example.com" })).toMatchObject({ studentCode: "S-001", name: "Ava Rao", email: "ava@example.com" });
  });
  it("rejects missing student codes and malformed email addresses", () => {
    expect(studentImportRowSchema.safeParse({ studentCode: "", name: "Ava", email: "bad-email" }).success).toBe(false);
  });
  it("enforces a bounded import batch", () => {
    expect(studentImportSchema.safeParse([]).success).toBe(false);
    expect(studentImportSchema.safeParse([{ studentCode: "S-1", name: "Ava" }]).success).toBe(true);
  });
});

describe("repository submission validation", () => {
  it("accepts HTTPS GitHub repository URLs", () => {
    expect(repositorySubmissionSchema.safeParse({ repositoryUrl: "https://github.com/acme/project" }).success).toBe(true);
  });
  it("rejects non-GitHub hosts, HTTP and credential-bearing URLs", () => {
    for (const repositoryUrl of [
      "http://github.com/acme/project",
      "https://example.com/acme/project",
      "https://user:password@github.com/acme/project",
      "javascript:alert(1)",
    ]) {
      expect(repositorySubmissionSchema.safeParse({ repositoryUrl }).success).toBe(false);
    }
  });
});

describe("institution input validation", () => {
  it("normalizes slugs and defaults timezone to IST", () => {
    expect(institutionCreateSchema.parse({ name: "Techievo Demo", slug: "Techievo-Demo" })).toMatchObject({ slug: "techievo-demo", timezone: "Asia/Kolkata" });
  });
  it("rejects slugs that could create ambiguous routes", () => {
    expect(institutionCreateSchema.safeParse({ name: "Demo", slug: "../demo" }).success).toBe(false);
  });
});
