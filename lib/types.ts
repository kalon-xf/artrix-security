export const roles = [
  "platform_admin",
  "organization_owner",
  "security_lead",
  "researcher",
  "client_viewer",
  "remediation_member"
] as const;

export type Role = (typeof roles)[number];

export const safeJobTypes = [
  "passive_subdomain_discovery",
  "dns_resolution",
  "permitted_http_probing",
  "technology_fingerprinting",
  "approved_url_collection",
  "controlled_template_check"
] as const;

export type SafeJobType = (typeof safeJobTypes)[number];
export type JobStatus = "queued" | "running" | "completed" | "failed" | "cancelled";
export type FindingStatus = "draft" | "needs_validation" | "validated" | "reported" | "accepted" | "fixed" | "retest_passed" | "closed";
export type Severity = "critical" | "high" | "medium" | "low" | "informational";

export type DemoClient = {
  id: string;
  name: string;
  contactName: string;
  contactEmail: string;
};

export type DemoEngagement = {
  id: string;
  clientId: string;
  name: string;
  status: "active" | "closed";
  startsOn: string;
  endsOn: string;
};

export type DemoScope = {
  id: string;
  engagementId: string;
  status: "draft" | "approved" | "expired";
  rootDomains: string[];
  exclusions: string[];
  allowedTestTypes: SafeJobType[];
  rateLimitPerMinute: number;
  timeoutSeconds: number;
  testingWindow: string;
  emergencyContact: string;
  stopConditions: string[];
  authorizationStatus: "pending" | "approved" | "rejected";
};

export type DemoAsset = {
  id: string;
  scopeId: string;
  hostname: string;
  kind: "root_domain" | "subdomain" | "url" | "api";
  environment: "development" | "staging" | "production";
  scopeStatus: "in_scope" | "out_of_scope";
  source: string;
  priority: "high" | "medium" | "low";
};

export type DemoEvidence = {
  id: string;
  subjectType: "job" | "finding" | "retest" | "ai_test";
  subjectId: string;
  title: string;
  summary: string;
  sanitized: true;
  createdAt: string;
};

export type DemoJob = {
  id: string;
  scopeId: string;
  assetId: string;
  type: SafeJobType;
  status: JobStatus;
  createdAt: string;
  completedAt?: string;
  summary?: string;
  evidenceIds: string[];
};

export type DemoFinding = {
  id: string;
  engagementId: string;
  title: string;
  severity: Severity;
  status: FindingStatus;
  businessImpact: string;
  remediation: string;
  references: string[];
  evidenceIds: string[];
  createdAt: string;
  validatedAt?: string;
};

export type DemoRemediationTask = {
  id: string;
  findingId: string;
  title: string;
  owner: string;
  dueDate: string;
  priority: "high" | "medium" | "low";
  status: "open" | "in_progress" | "ready_for_retest" | "done";
  comments: string[];
};

export type DemoRetest = {
  id: string;
  findingId: string;
  result: "pass" | "partial_pass" | "fail";
  notes: string;
  createdAt: string;
};

export type DemoAiTestRun = {
  id: string;
  systemName: string;
  testCase: string;
  category: "prompt_injection" | "indirect_prompt_injection" | "rag_source_trust" | "tool_permissions" | "sensitive_data" | "human_approval";
  result: "pass" | "partial_pass" | "fail";
  mitigation: string;
  createdAt: string;
};

export type DemoAuditLog = {
  id: string;
  action: string;
  subjectType: string;
  subjectId: string;
  actorRole: Role;
  createdAt: string;
  detail: string;
};

export type WorkspaceDashboardData = {
  organization: { id: string; name: string };
  client: DemoClient;
  engagement: DemoEngagement;
  scope: DemoScope;
  assets: DemoAsset[];
  jobs: DemoJob[];
  evidence: DemoEvidence[];
  findings: DemoFinding[];
  remediationTasks: DemoRemediationTask[];
  retests: DemoRetest[];
  aiTestRuns: DemoAiTestRun[];
  auditLogs: DemoAuditLog[];
  metrics: {
    activeEngagements: number;
    scopedAssets: number;
    completedJobs: number;
    findingsNeedingValidation: number;
    remediationProgress: string;
    retestPassRate: string;
    aiTestCoverage: number;
  };
};
