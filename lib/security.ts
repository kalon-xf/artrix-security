import { z } from "zod";
import { safeJobTypes } from "@/lib/types";

export const safeJobTypeSchema = z.enum(safeJobTypes);

export const safeJobRequestSchema = z.object({
  scopeId: z.string().min(1).max(120),
  assetId: z.string().min(1).max(120),
  type: safeJobTypeSchema
});

const hostnamePattern = /^(?=.{1,253}$)(?!-)[a-z0-9-]{1,63}(?<!-)(\.(?!-)[a-z0-9-]{1,63}(?<!-))+$/;

export function normalizeHostname(input: string): string {
  const trimmed = input.trim().toLowerCase().replace(/^\*\./, "");
  let hostname = trimmed;
  try {
    hostname = new URL(trimmed.includes("://") ? trimmed : `https://${trimmed}`).hostname;
  } catch {
    // Treat plain hostname input as a hostname candidate.
  }
  hostname = hostname.replace(/\.$/, "");
  if (!hostnamePattern.test(hostname) || hostname.includes("..")) {
    throw new Error("The target must be a valid hostname.");
  }
  return hostname;
}

export function isTargetWithinRoot(target: string, rootDomain: string): boolean {
  const hostname = normalizeHostname(target);
  const root = normalizeHostname(rootDomain);
  return hostname === root || hostname.endsWith(`.${root}`);
}

export function isExcluded(target: string, exclusions: string[]): boolean {
  return exclusions.some((excluded) => {
    try {
      return isTargetWithinRoot(target, excluded);
    } catch {
      return false;
    }
  });
}
