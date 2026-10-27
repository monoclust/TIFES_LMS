import "server-only";
import { institutionCreateSchema } from "@/lib/validation";
import { prisma } from "@/lib/db";
import type { Actor } from "@/lib/access-control";

export async function createInstitution(actor: Actor, rawInput: unknown) {
  if (actor.platformRole !== "SUPER_ADMIN") throw new Error("FORBIDDEN");
  const input = institutionCreateSchema.parse(rawInput);
  const existing = await prisma.institution.findFirst({
    where: { OR: [{ slug: input.slug }, ...(input.code ? [{ code: input.code }] : [])] },
    select: { id: true },
  });
  if (existing) throw new Error("INSTITUTION_IDENTIFIER_EXISTS");

  return prisma.$transaction(async (tx) => {
    const institution = await tx.institution.create({
      data: {
        name: input.name,
        slug: input.slug,
        code: input.code ?? null,
        type: input.type,
        address: input.address || null,
        contactName: input.contactName || null,
        contactEmail: input.contactEmail || null,
        contactPhone: input.contactPhone || null,
        academicYear: input.academicYear || null,
        timezone: input.timezone,
      },
    });
    await tx.auditLog.create({
      data: {
        institutionId: institution.id,
        actorUserId: actor.userId,
        action: "INSTITUTION_CREATED",
        targetType: "Institution",
        targetId: institution.id,
        safeMetadata: { slug: institution.slug, type: institution.type },
      },
    });
    return institution;
  });
}

export async function listInstitutions(actor: Actor, search = "") {
  if (actor.platformRole !== "SUPER_ADMIN") throw new Error("FORBIDDEN");
  const query = search.trim().slice(0, 100);
  return prisma.institution.findMany({
    where: query ? {
      OR: [
        { name: { contains: query, mode: "insensitive" } },
        { slug: { contains: query, mode: "insensitive" } },
        { code: { contains: query, mode: "insensitive" } },
      ],
    } : undefined,
    orderBy: [{ createdAt: "desc" }],
    take: 100,
    select: {
      id: true, name: true, slug: true, code: true, type: true, status: true,
      academicYear: true, createdAt: true,
      _count: { select: { students: true, memberships: true, batches: true } },
    },
  });
}
