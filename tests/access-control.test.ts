import { describe, expect, it } from "vitest";
import { canAccessInstitution, canPerform, type Actor, type ResourceScope } from "../src/lib/access-control";

const coordinator: Actor = { userId: "coord-1", memberships: [{ id: "m-coord-a", institutionId: "inst-a", role: "INSTITUTION_COORDINATOR", isActive: true }] };
const student: Actor = { userId: "student-1", memberships: [{ id: "m-student-a", institutionId: "inst-a", role: "STUDENT", isActive: true }] };
const mentor: Actor = { userId: "mentor-1", memberships: [{ id: "m-mentor-a", institutionId: "inst-a", role: "MENTOR", isActive: true }] };
const inactiveCoordinator: Actor = { userId: "coord-2", memberships: [{ id: "m-coord-inactive", institutionId: "inst-a", role: "INSTITUTION_COORDINATOR", isActive: false }] };
const resource: ResourceScope = { institutionId: "inst-a", studentUserId: "student-1", assignedMentorMembershipId: "m-mentor-a" };

describe("institution boundaries", () => {
  it("allows active members only within their institution", () => {
    expect(canAccessInstitution(coordinator, "inst-a")).toBe(true);
    expect(canAccessInstitution(coordinator, "inst-b")).toBe(false);
  });
  it("denies inactive memberships", () => {
    expect(canAccessInstitution(inactiveCoordinator, "inst-a")).toBe(false);
    expect(canPerform(inactiveCoordinator, "student:read", resource)).toBe(false);
  });
  it("grants global access only to a platform admin", () => {
    const admin: Actor = { userId: "admin-1", platformRole: "SUPER_ADMIN", memberships: [] };
    expect(canAccessInstitution(admin, "inst-b")).toBe(true);
    expect(canPerform(admin, "institution:manage", { institutionId: "inst-b" })).toBe(true);
  });
});

describe("resource authorization", () => {
  it("allows students to read and submit only their own work", () => {
    expect(canPerform(student, "submission:read", resource)).toBe(true);
    expect(canPerform(student, "submission:write", resource)).toBe(true);
    expect(canPerform({ ...student, userId: "student-2" }, "submission:read", resource)).toBe(false);
  });
  it("allows only the assigned mentor to write a review", () => {
    expect(canPerform(mentor, "review:write", resource)).toBe(true);
    expect(canPerform({ ...mentor, memberships: [{ ...mentor.memberships[0], id: "m-mentor-other" }] }, "review:write", resource)).toBe(false);
  });
  it("keeps coordinators from finalizing through the mentor-only review action", () => {
    expect(canPerform(coordinator, "review:write", resource)).toBe(false);
    expect(canPerform(coordinator, "student:manage", resource)).toBe(true);
  });
  it("does not let institution viewers perform management actions", () => {
    const viewer: Actor = { userId: "viewer-1", memberships: [{ id: "m-viewer-a", institutionId: "inst-a", role: "INSTITUTION_VIEWER", isActive: true }] };
    expect(canPerform(viewer, "report:read", resource)).toBe(true);
    expect(canPerform(viewer, "student:manage", resource)).toBe(false);
    expect(canPerform(viewer, "audit:read", resource)).toBe(false);
  });
  it("requires the server-loaded enrollment list for student class access", () => {
    const classResource = { institutionId: "inst-a", allowedStudentUserIds: ["student-1"] };
    expect(canPerform(student, "class:read", classResource)).toBe(true);
    expect(canPerform({ ...student, userId: "student-2" }, "class:read", classResource)).toBe(false);
  });
});
