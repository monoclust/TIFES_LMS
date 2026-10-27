import "server-only";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { hashInvitationToken, createInvitationToken } from "@/lib/invitation-token";
import { prisma } from "@/lib/db";
import type { Actor } from "@/lib/access-control";

const invitationRoleSchema = z.enum(["INSTITUTION_COORDINATOR", "STUDENT", "MENTOR", "INSTRUCTOR", "INSTITUTION_VIEWER"]);
const invitationInputSchema = z.object({
  institutionId: z.string().min(1),
  email: z.string().trim().toLowerCase().email().max(254),
  role: invitationRoleSchema,
});

const accountSetupSchema = z.object({
  token: z.string().min(20).max(200),
  name: z.string().trim().min(2).max(160),
  password: z.string().min(12).max(128),
});

export async function createInstitutionInvitation(actor: Actor, rawInput: unknown) {
  const input = invitationInputSchema.parse(rawInput);
  const membership = actor.memberships.find((item) => item.institutionId === input.institutionId && item.isActive);
  const isPlatformAdmin = actor.platformRole === "SUPER_ADMIN";
  const isCoordinator = membership?.role === "INSTITUTION_COORDINATOR";
  if (!isPlatformAdmin && !isCoordinator) throw new Error("FORBIDDEN");
  if (input.role === "INSTITUTION_COORDINATOR" && !isPlatformAdmin) throw new Error("FORBIDDEN");

  const institution = await prisma.institution.findUnique({ where: { id: input.institutionId }, select: { id: true, status: true } });
  if (!institution || institution.status !== "ACTIVE") throw new Error("INSTITUTION_UNAVAILABLE");

  const token = createInvitationToken();
  const expiresAt = new Date(Date.now() + 48 * 60 * 60 * 1000);
  const invitation = await prisma.invitation.create({
    data: {
      institutionId: input.institutionId,
      email: input.email,
      role: input.role,
      tokenHash: token.tokenHash,
      expiresAt,
      invitedByUserId: actor.userId,
    },
    select: { id: true, expiresAt: true },
  });
  const baseUrl = process.env.AUTH_URL;
  if (!baseUrl) throw new Error("AUTH_URL_NOT_CONFIGURED");
  const inviteUrl = new URL("/accept-invitation", baseUrl);
  inviteUrl.searchParams.set("token", token.rawToken);
  return { invitationId: invitation.id, inviteUrl: inviteUrl.toString(), expiresAt };
}

export async function inspectInvitation(rawToken: string) {
  if (!rawToken || rawToken.length > 200) return null;
  const invitation = await prisma.invitation.findUnique({
    where: { tokenHash: hashInvitationToken(rawToken) },
    include: { institution: { select: { name: true, status: true } } },
  });
  if (!invitation || invitation.status !== "PENDING" || invitation.expiresAt <= new Date() || invitation.institution.status !== "ACTIVE") return null;
  return {
    email: invitation.email,
    role: invitation.role,
    institutionName: invitation.institution.name,
    expiresAt: invitation.expiresAt,
  };
}

export async function acceptInstitutionInvitation(rawInput: unknown) {
  const input = accountSetupSchema.parse(rawInput);
  const tokenHash = hashInvitationToken(input.token);
  const passwordHash = await bcrypt.hash(input.password, 12);
  return prisma.$transaction(async (tx) => {
    const invitation = await tx.invitation.findUnique({
      where: { tokenHash },
      include: { institution: { select: { id: true, name: true, status: true } } },
    });
    if (!invitation || invitation.status !== "PENDING" || invitation.expiresAt <= new Date() || invitation.institution.status !== "ACTIVE") {
      throw new Error("INVITATION_INVALID");
    }

    const existingUser = await tx.user.findUnique({ where: { email: invitation.email } });
    let user;
    if (existingUser) {
      if (existingUser.status !== "INVITED" || existingUser.passwordHash) throw new Error("ACCOUNT_ALREADY_EXISTS");
      user = await tx.user.update({
        where: { id: existingUser.id },
        data: { name: input.name, passwordHash, status: "ACTIVE", accountSetupAt: new Date(), authVersion: { increment: 1 } },
      });
    } else {
      user = await tx.user.create({
        data: { name: input.name, email: invitation.email, passwordHash, status: "ACTIVE", accountSetupAt: new Date() },
      });
    }

    if (invitation.role === "STUDENT") {
      const student = await tx.studentRecord.findFirst({
        where: { institutionId: invitation.institutionId, email: { equals: invitation.email, mode: "insensitive" } },
        select: { id: true, linkedUserId: true },
      });
      if (!student || (student.linkedUserId && student.linkedUserId !== user.id)) throw new Error("STUDENT_RECORD_NOT_LINKABLE");
      await tx.studentRecord.update({ where: { id: student.id }, data: { linkedUserId: user.id } });
    }

    await tx.membership.create({
      data: { institutionId: invitation.institutionId, userId: user.id, role: invitation.role, isActive: true },
    });
    await tx.auditLog.create({
      data: {
        institutionId: invitation.institutionId,
        actorUserId: user.id,
        action: "INVITATION_ACCEPTED",
        targetType: "Invitation",
        targetId: invitation.id,
        safeMetadata: { role: invitation.role },
      },
    });
    await tx.invitation.update({
      where: { id: invitation.id },
      data: { status: "ACCEPTED", acceptedAt: new Date() },
    });
    return { userId: user.id, institutionName: invitation.institution.name, role: invitation.role };
  });
}
