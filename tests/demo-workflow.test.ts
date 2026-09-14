import { afterAll, beforeEach, describe, expect, it } from "vitest";
import {
  addDemoAsset,
  approveDemoScope,
  createDemoClient,
  createDemoEngagement,
  createDemoOrganization,
  createDemoRemediation,
  createDemoScope,
  getWorkspaceDashboard,
  queueSafeDemoJob,
  recordDemoAiTest,
  recordDemoRetest,
  seedDemo,
  validateDemoFinding
} from "../lib/demo-store";

const originalNodeEnv = process.env["NODE_ENV"];
const originalDemoMode = process.env["ARTRIX_DEMO_MODE"];

beforeEach(() => {
  process.env["NODE_ENV"] = "development";
  process.env["ARTRIX_DEMO_MODE"] = "true";
  seedDemo();
});

afterAll(() => {
  process.env["NODE_ENV"] = originalNodeEnv;
  process.env["ARTRIX_DEMO_MODE"] = originalDemoMode;
});

describe("development-only authorized workflow", () => {
  it("requires an approved synthetic scope before a safe job can complete", () => {
    const organization = createDemoOrganization({ name: "Demo Consulting" });
    const client = createDemoClient({
      name: "Synthetic Customer",
      contactName: "Security Owner",
      contactEmail: "owner@example.test"
    });
    const engagement = createDemoEngagement({
      clientId: client.id,
      name: "Synthetic API review",
      startsOn: "2026-09-14",
      endsOn: "2026-10-14"
    });
    const scope = createDemoScope({
      engagementId: engagement.id,
      rootDomains: ["customer.example.test"],
      exclusions: ["admin.customer.example.test"],
      allowedTestTypes: ["passive_subdomain_discovery"],
      rateLimitPerMinute: 20,
      timeoutSeconds: 120,
      testingWindow: "Demo window",
      emergencyContact: "owner@example.test",
      stopConditions: ["Customer stop request"]
    });

    expect(organization.name).toBe("Demo Consulting");
    expect(() => addDemoAsset({
      scopeId: scope.id,
      hostname: "api.customer.example.test",
      kind: "api",
      environment: "staging",
      priority: "high"
    })).toThrow(/approved/i);

    approveDemoScope(scope.id);
    const asset = addDemoAsset({
      scopeId: scope.id,
      hostname: "api.customer.example.test",
      kind: "api",
      environment: "staging",
      priority: "high"
    });

    const job = queueSafeDemoJob({
      scopeId: scope.id,
      assetId: asset.id,
      type: "passive_subdomain_discovery"
    });

    expect(job.status).toBe("completed");
    expect(job.summary).toMatch(/No network request or shell command/);
  });

  it("records validation, remediation, retest, and benign AI results", () => {
    const dashboard = getWorkspaceDashboard();
    const finding = validateDemoFinding(dashboard.findings[0].id);
    const remediation = createDemoRemediation({
      findingId: finding.id,
      title: "Review authorization policy",
      owner: "Engineering Owner",
      dueDate: "2026-10-01"
    });
    const retest = recordDemoRetest({
      findingId: finding.id,
      result: "pass",
      notes: "Synthetic fix verification."
    });
    const aiTest = recordDemoAiTest({
      systemName: "Demo Agent",
      testCase: "Benign prompt-boundary test",
      category: "prompt_injection",
      result: "pass",
      mitigation: "Require human approval for sensitive tool actions."
    });

    expect(remediation.findingId).toBe(finding.id);
    expect(retest.result).toBe("pass");
    expect(aiTest.result).toBe("pass");
    expect(getWorkspaceDashboard().findings[0].status).toBe("retest_passed");
  });
});
