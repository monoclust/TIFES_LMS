import "dotenv/config";
import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";
import { z } from "zod";

const prisma = new PrismaClient();
const envSchema = z.object({
  BOOTSTRAP_ADMIN_EMAIL: z.string().trim().toLowerCase().email().max(254),
  BOOTSTRAP_ADMIN_PASSWORD: z.string().min(16).max(128),
  BOOTSTRAP_ADMIN_NAME: z.string().trim().min(2).max(160).default("Techievo Administrator"),
});

async function main() {
  const parsed = envSchema.safeParse(process.env);
  if (!parsed.success) {
    throw new Error("Set BOOTSTRAP_ADMIN_EMAIL, BOOTSTRAP_ADMIN_NAME and a BOOTSTRAP_ADMIN_PASSWORD of at least 16 characters in the environment.");
  }
  const { BOOTSTRAP_ADMIN_EMAIL: email, BOOTSTRAP_ADMIN_PASSWORD: password, BOOTSTRAP_ADMIN_NAME: name } = parsed.data;
  const existing = await prisma.user.findUnique({ where: { email }, select: { id: true } });
  if (existing) throw new Error("An account with that email already exists. Bootstrap refuses to overwrite existing users.");
  const passwordHash = await bcrypt.hash(password, 12);
  const user = await prisma.user.create({
    data: { email, name, passwordHash, status: "ACTIVE", platformRole: "SUPER_ADMIN", accountSetupAt: new Date() },
    select: { id: true, email: true, platformRole: true },
  });
  await prisma.auditLog.create({
    data: { actorUserId: user.id, action: "PLATFORM_ADMIN_BOOTSTRAPPED", targetType: "User", targetId: user.id, safeMetadata: { platformRole: user.platformRole } },
  });
  process.stdout.write("Initial platform administrator created: " + user.email + "\n");
  process.stdout.write("Remove bootstrap credentials from the environment after this one-time operation.\n");
}

main()
  .catch((error: unknown) => {
    process.stderr.write((error instanceof Error ? error.message : "Bootstrap failed") + "\n");
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
