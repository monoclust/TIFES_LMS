"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { acceptInstitutionInvitation } from "@/lib/invitation-service";

const formSchema = z.object({
  token: z.string().min(20).max(200),
  name: z.string().trim().min(2).max(160),
  password: z.string().min(12).max(128),
  confirmPassword: z.string().min(12).max(128),
}).refine((value) => value.password === value.confirmPassword, { path: ["confirmPassword"], message: "Passwords do not match." });

export async function completeAccountSetup(formData: FormData) {
  const parsed = formSchema.safeParse({
    token: String(formData.get("token") ?? ""),
    name: String(formData.get("name") ?? ""),
    password: String(formData.get("password") ?? ""),
    confirmPassword: String(formData.get("confirmPassword") ?? ""),
  });
  if (!parsed.success) redirect("/account-setup?error=invalid-input");
  try {
    await acceptInstitutionInvitation(parsed.data);
  } catch {
    redirect("/account-setup?error=setup-failed");
  }
  redirect("/login?setup=complete");
}
