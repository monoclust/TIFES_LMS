import "server-only";
import { auth } from "../../auth";
import { prisma } from "@/lib/db";
import type { Actor } from "@/lib/access-control";

export async function getCurrentActor(): Promise<Actor | null> {
  const session = await auth();
  if (!session?.user?.id || !session.user.authenticated || session.user.status !== "ACTIVE") return null;
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      platformRole: true,
      status: true,
      memberships: { select: { id: true, institutionId: true, role: true, isActive: true } },
    },
  });
  if (!user || user.status !== "ACTIVE") return null;
  return {
    userId: user.id,
    platformRole: user.platformRole,
    memberships: user.memberships.map((membership) => ({
      id: membership.id,
      institutionId: membership.institutionId,
      role: membership.role,
      isActive: membership.isActive,
    })),
  };
}

export async function requireCurrentActor(): Promise<Actor> {
  const actor = await getCurrentActor();
  if (!actor) throw new Error("UNAUTHENTICATED");
  return actor;
}
