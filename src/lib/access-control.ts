export type InstitutionRole =
  | "INSTITUTION_COORDINATOR"
  | "STUDENT"
  | "MENTOR"
  | "INSTRUCTOR"
  | "INSTITUTION_VIEWER";

export type Actor = {
  userId: string;
  platformRole?: "SUPER_ADMIN" | null;
  memberships: Array<{
    id: string;
    institutionId: string;
    role: InstitutionRole;
    isActive: boolean;
  }>;
};

export type ResourceScope = {
  institutionId: string;
  studentUserId?: string | null;
  assignedMentorMembershipId?: string | null;
  instructorMembershipId?: string | null;
  allowedStudentUserIds?: string[];
};

export type Action =
  | "institution:read"
  | "institution:manage"
  | "student:read"
  | "student:manage"
  | "class:read"
  | "class:manage"
  | "submission:read"
  | "submission:write"
  | "review:write"
  | "report:read"
  | "audit:read";

const activeMemberships = (actor: Actor, institutionId: string) =>
  actor.memberships.filter((membership) => membership.isActive && membership.institutionId === institutionId);

export function canAccessInstitution(actor: Actor, institutionId: string): boolean {
  if (actor.platformRole === "SUPER_ADMIN") return true;
  return activeMemberships(actor, institutionId).length > 0;
}

/** Pure policy function. Call only after loading the actor from a trusted server-side session. */
export function canPerform(actor: Actor, action: Action, resource: ResourceScope): boolean {
  if (actor.platformRole === "SUPER_ADMIN") return true;

  const memberships = activeMemberships(actor, resource.institutionId);
  if (memberships.length === 0) return false;

  const hasRole = (roles: InstitutionRole[]) => memberships.some((membership) => roles.includes(membership.role));
  const isStudentOwner = resource.studentUserId != null && resource.studentUserId === actor.userId && hasRole(["STUDENT"]);
  const assignedMentor = resource.assignedMentorMembershipId != null && memberships.some(
    (membership) => membership.role === "MENTOR" && membership.id === resource.assignedMentorMembershipId,
  );
  const assignedInstructor = resource.instructorMembershipId != null && memberships.some(
    (membership) => membership.role === "INSTRUCTOR" && membership.id === resource.instructorMembershipId,
  );
  const isEnrolledStudent = hasRole(["STUDENT"]) && resource.allowedStudentUserIds?.includes(actor.userId) === true;

  switch (action) {
    case "institution:read":
      return hasRole(["INSTITUTION_COORDINATOR", "INSTITUTION_VIEWER"]);
    case "institution:manage":
      return false;
    case "student:read":
      return isStudentOwner || hasRole(["INSTITUTION_COORDINATOR", "INSTITUTION_VIEWER"]);
    case "student:manage":
      return hasRole(["INSTITUTION_COORDINATOR"]);
    case "class:read":
      return hasRole(["INSTITUTION_COORDINATOR", "INSTITUTION_VIEWER"]) || assignedInstructor || isEnrolledStudent;
    case "class:manage":
      return hasRole(["INSTITUTION_COORDINATOR"]) || assignedInstructor;
    case "submission:read":
      return isStudentOwner || assignedMentor || hasRole(["INSTITUTION_COORDINATOR", "INSTITUTION_VIEWER"]);
    case "submission:write":
      return isStudentOwner;
    case "review:write":
      return assignedMentor;
    case "report:read":
      return hasRole(["INSTITUTION_COORDINATOR", "INSTITUTION_VIEWER"]);
    case "audit:read":
      return hasRole(["INSTITUTION_COORDINATOR"]);
    default: {
      const exhaustive: never = action;
      return exhaustive;
    }
  }
}
