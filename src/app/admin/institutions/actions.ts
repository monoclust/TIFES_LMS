"use server";

import { redirect } from "next/navigation";
import { getCurrentActor } from "@/lib/current-actor";
import { createInstitution } from "@/lib/institution-service";

export async function createInstitutionAction(formData: FormData) {
  const actor = await getCurrentActor();
  if (!actor) redirect("/login");
  if (actor.platformRole !== "SUPER_ADMIN") redirect("/access-denied");

  const input = {
    name: String(formData.get("name") ?? ""),
    slug: String(formData.get("slug") ?? ""),
    code: String(formData.get("code") ?? ""),
    type: String(formData.get("type") ?? "OTHER"),
    address: String(formData.get("address") ?? ""),
    contactName: String(formData.get("contactName") ?? ""),
    contactEmail: String(formData.get("contactEmail") ?? ""),
    contactPhone: String(formData.get("contactPhone") ?? ""),
    academicYear: String(formData.get("academicYear") ?? ""),
    timezone: String(formData.get("timezone") ?? "Asia/Kolkata"),
  };
  try {
    await createInstitution(actor, input);
  } catch (error) {
    const message = error instanceof Error ? error.message : "";
    if (message === "INSTITUTION_IDENTIFIER_EXISTS") redirect("/admin/institutions?error=duplicate");
    if (message === "FORBIDDEN") redirect("/access-denied");
    redirect("/admin/institutions?error=invalid");
  }
  redirect("/admin/institutions?created=1");
}
