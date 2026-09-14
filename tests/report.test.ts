import { describe, expect, it } from "vitest";
import { buildReport } from "../lib/report";
import type { WorkspaceDashboardData } from "../lib/types";

const dashboard: WorkspaceDashboardData = {
  organization: { id: "org", name: "Demo Org" },
  client: { id: "client", name: "Synthetic Client", contactName: "Owner", contactEmail: "owner@example.test" },
  engagement: { id: "eng", clientId: "client", name: "Demo Engagement", status: "active", startsOn: "2026-09-14", endsOn: "2026-10-14" },
  scope: { id: "scope", engagementId: "eng", status: "approved", rootDomains: ["demo.example.test"], exclusions: [], allowedTestTypes: ["dns_resolution"], rateLimitPerMinute: 20, timeoutSeconds: 60, testingWindow: "demo", emergencyContact: "owner@example.test", stopConditions: [], authorizationStatus: "approved" },
  assets: [], jobs: [], evidence: [], remediationTasks: [], retests: [], aiTestRuns: [], auditLogs: [],
  findings: [{ id: "f", engagementId: "eng", title: "Synthetic finding", severity: "low", status: "validated", businessImpact: "Demo", remediation: "Fix", references: [], evidenceIds: [], createdAt: "2026-09-14T00:00:00.000Z" }],
  metrics: { activeEngagements: 1, scopedAssets: 0, completedJobs: 0, findingsNeedingValidation: 0, remediationProgress: "0/1", retestPassRate: "—", aiTestCoverage: 0 }
};

describe("report generation", () => {
  it("includes scope and findings in a technical report", () => {
    const report = buildReport(dashboard, "technical");
    expect(report.markdown).toContain("demo.example.test");
    expect(report.markdown).toContain("Synthetic finding");
    expect(report.html).toContain("Technical Security Assessment Report");
  });
});
