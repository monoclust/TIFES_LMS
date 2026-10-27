import { NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentActor } from "@/lib/current-actor";
import { createInstitutionInvitation } from "@/lib/invitation-service";

const requestSchema = z.object({
  institutionId: z.string().min(1),
  email: z.string().trim().toLowerCase().email().max(254),
  role: z.enum(["INSTITUTION_COORDINATOR", "STUDENT", "MENTOR", "INSTRUCTOR", "INSTITUTION_VIEWER"]),
});

export async function POST(request: Request) {
  const actor = await getCurrentActor();
  if (!actor) return NextResponse.json({ error: "Authentication required." }, { status: 401 });

  const body = await request.json().catch(() => null);
  const parsed = requestSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid invitation details." }, { status: 400 });

  try {
    const invitation = await createInstitutionInvitation(actor, parsed.data);
    return NextResponse.json({
      invitationId: invitation.invitationId,
      inviteUrl: invitation.inviteUrl,
      expiresAt: invitation.expiresAt.toISOString(),
      delivery: "not-sent",
    }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "";
    if (message === "FORBIDDEN") return NextResponse.json({ error: "You do not have permission to invite this role." }, { status: 403 });
    if (message === "INSTITUTION_UNAVAILABLE") return NextResponse.json({ error: "The institution is unavailable." }, { status: 404 });
    if (message === "AUTH_URL_NOT_CONFIGURED") return NextResponse.json({ error: "Invitation links are not configured on this deployment." }, { status: 503 });
    return NextResponse.json({ error: "The invitation could not be created." }, { status: 500 });
  }
}
