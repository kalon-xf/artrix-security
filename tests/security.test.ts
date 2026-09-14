import { describe, expect, it } from "vitest";
import { isExcluded, isTargetWithinRoot, normalizeHostname } from "../lib/security";

describe("scope verification", () => {
  it("normalizes hostnames before comparison", () => {
    expect(normalizeHostname("HTTPS://API.DEMO.ARTRIX.TEST/path")).toBe("api.demo.artrix.test");
  });

  it("allows an approved root and its subdomains", () => {
    expect(isTargetWithinRoot("api.demo.artrix.test", "demo.artrix.test")).toBe(true);
    expect(isTargetWithinRoot("demo.artrix.test", "demo.artrix.test")).toBe(true);
  });

  it("rejects lookalike domains", () => {
    expect(isTargetWithinRoot("demo.artrix.test.attacker.test", "demo.artrix.test")).toBe(false);
  });

  it("honors exclusions", () => {
    expect(isExcluded("admin.demo.artrix.test", ["admin.demo.artrix.test"])).toBe(true);
  });
});
