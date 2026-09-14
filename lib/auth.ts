import { assertDemoMode } from "@/lib/env";
import type { Role } from "@/lib/types";

export type Actor = {
  id: string;
  organizationId: string;
  role: Role;
  displayName: string;
};

/**
 * Production authentication must resolve a signed session from the configured provider.
 * This intentionally exposes no production fallback credentials.
 */
export function requireDemoActor(): Actor {
  assertDemoMode();
  return {
    id: "demo-security-lead",
    organizationId: "org_demo",
    role: "security_lead",
    displayName: "Demo Security Lead"
  };
}

export function hasAnyRole(actor: Actor, allowed: Role[]): boolean {
  return allowed.includes(actor.role);
}

export function requireRole(actor: Actor, allowed: Role[]): void {
  if (!hasAnyRole(actor, allowed)) {
    throw new Error("You do not have permission to perform this action.");
  }
}
