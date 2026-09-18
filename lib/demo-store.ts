import { randomUUID } from "crypto";
import { assertDemoMode } from "@/lib/env";
import { isExcluded, isTargetWithinRoot, normalizeHostname } from "@/lib/security";
import {
  approveSuperhumanValidation,
  buildSuperhumanMission,
  evaluateSuperhumanGate,
  selectDiscoveryJob
} from "@/lib/superhuman";
import type {
  DemoAiTestRun,
  DemoAsset,
  DemoAuditLog,
  DemoClient,
  DemoEngagement,
  DemoEvidence,
  DemoFinding,
  DemoJob,
  DemoRemediationTask,
  DemoRetest,
  DemoScope,
  SafeJobType,
  Severity,
  SuperhumanMission,
  WorkspaceDashboardData
} from "@/lib/types";

type DemoState = {
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
  superhumanMissions: SuperhumanMission[];
  auditLogs: DemoAuditLog[];
};

declare global {
  var __artrixDemoState: DemoState | undefined;
}

function now(): string {
  return new Date().toISOString();
}

function audit(state: DemoState, action: string, subjectType: string, subjectId: string, detail: string) {
  state.auditLogs.unshift({
    id: randomUUID(),
    action,
    subjectType,
    subjectId,
    actorRole: "security_lead",
    createdAt: now(),
    detail
  });
}

function createSeedState(): DemoState {
  const state: DemoState = {
    organization: { id: "org_demo", name: "Artrix Demo Security Lab" },
    client: {
      id: "client_demo",
      name: "Northstar Retail (synthetic)",
      contactName: "Client Security Owner",
      contactEmail: "security-owner@example.test"
    },
    engagement: {
      id: "engagement_demo",
      clientId: "client_demo",
      name: "API and AI readiness review (demo)",
      status: "active",
      startsOn: "2026-09-14",
      endsOn: "2026-10-14"
    },
    scope: {
      id: "scope_demo",
      engagementId: "engagement_demo",
      status: "approved",
      rootDomains: ["demo.artrix.test"],
      exclusions: ["admin.demo.artrix.test"],
      allowedTestTypes: [
        "passive_subdomain_discovery",
        "dns_resolution",
        "permitted_http_probing",
        "technology_fingerprinting",
        "approved_url_collection"
      ],
      rateLimitPerMinute: 20,
      timeoutSeconds: 120,
      testingWindow: "Weekdays 09:00–18:00 IST (demo)",
      emergencyContact: "security-owner@example.test",
      stopConditions: ["Unexpected availability impact", "Customer request to stop", "Evidence of sensitive data exposure"],
      authorizationStatus: "approved"
    },
    assets: [{
      id: "asset_demo_api",
      scopeId: "scope_demo",
      hostname: "api.demo.artrix.test",
      kind: "api",
      environment: "staging",
      scopeStatus: "in_scope",
      source: "Written authorization inventory",
      priority: "high"
    }],
    jobs: [],
    evidence: [],
    findings: [{
      id: "finding_demo_authorization",
      engagementId: "engagement_demo",
      title: "Synthetic workflow finding awaiting reviewer validation",
      severity: "medium",
      status: "needs_validation",
      businessImpact: "Demo-only record used to exercise human validation and reporting workflows.",
      remediation: "Confirm expected authorization checks and capture a controlled retest decision.",
      references: ["OWASP API Security Top 10 (reference only)"],
      evidenceIds: [],
      createdAt: now()
    }],
    remediationTasks: [],
    retests: [],
    aiTestRuns: [],
    superhumanMissions: [],
    auditLogs: []
  };
  audit(state, "authorization.approved", "scope", state.scope.id, "Demo written authorization and scope were approved.");
  audit(state, "finding.created", "finding", "finding_demo_authorization", "Synthetic finding created; human validation is required.");
  return state;
}

function state(): DemoState {
  assertDemoMode();
  if (!globalThis.__artrixDemoState) {
    globalThis.__artrixDemoState = createSeedState();
  }
  return globalThis.__artrixDemoState;
}

export function seedDemo(): WorkspaceDashboardData {
  globalThis.__artrixDemoState = createSeedState();
  return getWorkspaceDashboard();
}

export function getWorkspaceDashboard(): WorkspaceDashboardData {
  const current = state();
  const closedRetests = current.retests.filter((retest) => retest.result === "pass");
  const findingsWithTasks = current.findings.filter((finding) => current.remediationTasks.some((task) => task.findingId === finding.id));
  return {
    organization: current.organization,
    client: current.client,
    engagement: current.engagement,
    scope: current.scope,
    assets: current.assets,
    jobs: current.jobs,
    evidence: current.evidence,
    findings: current.findings,
    remediationTasks: current.remediationTasks,
    retests: current.retests,
    aiTestRuns: current.aiTestRuns,
    auditLogs: current.auditLogs,
    metrics: {
      activeEngagements: current.engagement.status === "active" ? 1 : 0,
      scopedAssets: current.assets.filter((asset) => asset.scopeStatus === "in_scope").length,
      completedJobs: current.jobs.filter((job) => job.status === "completed").length,
      findingsNeedingValidation: current.findings.filter((finding) => finding.status === "needs_validation").length,
      remediationProgress: `${findingsWithTasks.length}/${current.findings.length || 1}`,
      retestPassRate: current.retests.length ? `${Math.round((closedRetests.length / current.retests.length) * 100)}%` : "—",
      aiTestCoverage: current.aiTestRuns.length
    }
  };
}

export function queueSafeDemoJob(input: { scopeId: string; assetId: string; type: SafeJobType }): DemoJob {
  const current = state();
  const scope = current.scope;
  const asset = current.assets.find((item) => item.id === input.assetId && item.scopeId === input.scopeId);
  if (!asset) throw new Error("The selected asset was not found in this scope.");
  if (scope.status !== "approved" || scope.authorizationStatus !== "approved") {
    throw new Error("No job can execute until written authorization and scope approval are complete.");
  }
  if (!scope.allowedTestTypes.includes(input.type)) {
    throw new Error("This job type is not approved for the selected scope.");
  }
  if (asset.scopeStatus !== "in_scope" || !scope.rootDomains.some((root) => isTargetWithinRoot(asset.hostname, root)) || isExcluded(asset.hostname, scope.exclusions)) {
    throw new Error("The selected asset is out of scope or excluded.");
  }

  const job: DemoJob = {
    id: randomUUID(),
    scopeId: scope.id,
    assetId: asset.id,
    type: input.type,
    status: "queued",
    createdAt: now(),
    evidenceIds: []
  };
  current.jobs.unshift(job);
  audit(current, "job.queued", "job", job.id, `Approved manifest queued for ${input.type}; no shell command accepted.`);

  // This local-demo processor deliberately simulates parsing. It never invokes tools,
  // opens network connections, or executes a command.
  job.status = "completed";
  job.completedAt = now();
  job.summary = "Demo-only manifest completed. No network request or shell command was executed.";
  const evidence: DemoEvidence = {
    id: randomUUID(),
    subjectType: "job",
    subjectId: job.id,
    title: "Safe job manifest result",
    summary: "Synthetic parsed evidence generated by the local demo. Production workers must use signed manifests and approved allowlisted tools.",
    sanitized: true,
    createdAt: now()
  };
  current.evidence.unshift(evidence);
  job.evidenceIds.push(evidence.id);
  audit(current, "job.completed", "job", job.id, "Demo manifest completed with sanitized synthetic evidence.");
  return job;
}

export function validateDemoFinding(id: string): DemoFinding {
  const current = state();
  const finding = current.findings.find((item) => item.id === id);
  if (!finding) throw new Error("Finding not found.");
  if (!["draft", "needs_validation"].includes(finding.status)) {
    throw new Error("Only a draft or needs-validation finding can be validated.");
  }
  finding.status = "validated";
  finding.validatedAt = now();
  const evidence: DemoEvidence = {
    id: randomUUID(),
    subjectType: "finding",
    subjectId: finding.id,
    title: "Reviewer validation note",
    summary: "Human reviewer recorded validation in the local demo. This is not a real customer finding.",
    sanitized: true,
    createdAt: now()
  };
  current.evidence.unshift(evidence);
  finding.evidenceIds.push(evidence.id);
  audit(current, "finding.validated", "finding", finding.id, "Human validation recorded.");
  return finding;
}

export function createDemoFinding(input: { title: string; severity: Severity; businessImpact: string; remediation: string }): DemoFinding {
  const current = state();
  const finding: DemoFinding = {
    id: randomUUID(),
    engagementId: current.engagement.id,
    title: input.title,
    severity: input.severity,
    status: "needs_validation",
    businessImpact: input.businessImpact,
    remediation: input.remediation,
    references: [],
    evidenceIds: [],
    createdAt: now()
  };
  current.findings.unshift(finding);
  audit(current, "finding.created", "finding", finding.id, "Finding created as needs-validation.");
  return finding;
}

export function createDemoRemediation(input: { findingId: string; owner: string; dueDate: string; title: string }): DemoRemediationTask {
  const current = state();
  const finding = current.findings.find((item) => item.id === input.findingId);
  if (!finding) throw new Error("Finding not found.");
  const task: DemoRemediationTask = {
    id: randomUUID(),
    findingId: finding.id,
    title: input.title,
    owner: input.owner,
    dueDate: input.dueDate,
    priority: finding.severity === "critical" || finding.severity === "high" ? "high" : "medium",
    status: "open",
    comments: ["Task created by demo security lead."]
  };
  current.remediationTasks.unshift(task);
  audit(current, "remediation.created", "remediation_task", task.id, `Remediation assigned to ${task.owner}.`);
  return task;
}

export function recordDemoRetest(input: { findingId: string; result: "pass" | "partial_pass" | "fail"; notes: string }): DemoRetest {
  const current = state();
  const finding = current.findings.find((item) => item.id === input.findingId);
  if (!finding) throw new Error("Finding not found.");
  const retest: DemoRetest = { id: randomUUID(), findingId: finding.id, result: input.result, notes: input.notes, createdAt: now() };
  current.retests.unshift(retest);
  if (input.result === "pass") finding.status = "retest_passed";
  audit(current, "retest.recorded", "retest", retest.id, `Retest result recorded: ${input.result}.`);
  return retest;
}

export function recordDemoAiTest(input: {
  systemName: string;
  testCase: string;
  category: DemoAiTestRun["category"];
  result: DemoAiTestRun["result"];
  mitigation: string;
}): DemoAiTestRun {
  const current = state();
  const run: DemoAiTestRun = { id: randomUUID(), ...input, createdAt: now() };
  current.aiTestRuns.unshift(run);
  const evidence: DemoEvidence = {
    id: randomUUID(),
    subjectType: "ai_test",
    subjectId: run.id,
    title: "AI test-case result",
    summary: "Benign local-demo AI assessment result. No live payloads or third-party instructions were used.",
    sanitized: true,
    createdAt: now()
  };
  current.evidence.unshift(evidence);
  audit(current, "ai_test.recorded", "ai_test_run", run.id, `Recorded benign ${run.category} test result.`);
  return run;
}

export function getDemoSuperhumanMissions(): SuperhumanMission[] {
  return state().superhumanMissions;
}

export function startDemoSuperhumanMission(input: {
  scopeId: string;
  assetId: string;
  objective: string;
}): SuperhumanMission {
  const current = state();
  const objective = input.objective.trim();
  if (objective.length < 12 || objective.length > 500) throw new Error("Mission objective must be between 12 and 500 characters.");
  if (input.scopeId !== current.scope.id) throw new Error("Scope not found.");
  const asset = current.assets.find((item) => item.id === input.assetId && item.scopeId === input.scopeId);
  if (!asset) throw new Error("The selected asset was not found in this scope.");
  const jobType = selectDiscoveryJob(current.scope);
  const gate = evaluateSuperhumanGate(current.scope, asset, jobType);
  const missingFacts = gate.filter((fact) => !fact.satisfied);
  if (!jobType || missingFacts.length > 0) {
    const detail = missingFacts.map((fact) => fact.label).join(", ") || "Permitted discovery technique";
    audit(current, "superhuman.blocked", "scope", current.scope.id, `Mission blocked; missing authorization facts: ${detail}.`);
    throw new Error(`Superhuman mission blocked. Resolve: ${detail}.`);
  }

  const job = queueSafeDemoJob({ scopeId: current.scope.id, assetId: asset.id, type: jobType });
  const mission = buildSuperhumanMission({
    engagementId: current.engagement.id,
    scope: current.scope,
    asset,
    objective,
    createdAt: now(),
    jobType,
    jobId: job.id,
    evidenceIds: job.evidenceIds
  });
  current.superhumanMissions.unshift(mission);
  audit(current, "superhuman.mission_started", "superhuman_mission", mission.id, "Evidence-grounded mission reached the human validation checkpoint.");
  return mission;
}

export function approveDemoSuperhumanMission(id: string, rationale: string): SuperhumanMission {
  const current = state();
  const mission = current.superhumanMissions.find((item) => item.id === id);
  if (!mission) throw new Error("Superhuman mission not found.");
  const approved = approveSuperhumanValidation(mission, now());
  audit(current, "superhuman.validation_plan_approved", "superhuman_mission", mission.id, `Security lead approved the bounded validation plan; the candidate remains unvalidated. Rationale: ${rationale}`);
  return approved;
}


function requireSyntheticDemoHostname(value: string): string {
  const hostname = normalizeHostname(value);
  if (!hostname.endsWith(".test")) {
    throw new Error("The local demo accepts synthetic .test domains only.");
  }
  return hostname;
}

export function createDemoOrganization(input: { name: string }) {
  const current = state();
  current.organization = { id: randomUUID(), name: input.name };
  audit(current, "organization.created", "organization", current.organization.id, "Synthetic local-demo organization created.");
  return current.organization;
}

export function createDemoClient(input: { name: string; contactName: string; contactEmail: string }): DemoClient {
  const current = state();
  current.client = { id: randomUUID(), ...input };
  audit(current, "client.created", "client", current.client.id, "Synthetic client workspace created.");
  return current.client;
}

export function createDemoEngagement(input: { clientId: string; name: string; startsOn: string; endsOn: string }): DemoEngagement {
  const current = state();
  if (input.clientId !== current.client.id) throw new Error("Client not found.");
  current.engagement = { id: randomUUID(), ...input, status: "active" };
  current.scope = {
    id: randomUUID(),
    engagementId: current.engagement.id,
    status: "draft",
    rootDomains: [],
    exclusions: [],
    allowedTestTypes: [],
    rateLimitPerMinute: 20,
    timeoutSeconds: 120,
    testingWindow: "Set before approval",
    emergencyContact: current.client.contactEmail,
    stopConditions: [],
    authorizationStatus: "pending"
  };
  current.assets = [];
  current.jobs = [];
  current.evidence = [];
  current.findings = [];
  current.remediationTasks = [];
  current.retests = [];
  current.aiTestRuns = [];
  current.superhumanMissions = [];
  audit(current, "engagement.created", "engagement", current.engagement.id, "Synthetic engagement created with a draft scope.");
  return current.engagement;
}

export function createDemoScope(input: {
  engagementId: string;
  rootDomains: string[];
  exclusions: string[];
  allowedTestTypes: SafeJobType[];
  rateLimitPerMinute: number;
  timeoutSeconds: number;
  testingWindow: string;
  emergencyContact: string;
  stopConditions: string[];
}): DemoScope {
  const current = state();
  if (input.engagementId !== current.engagement.id) throw new Error("Engagement not found.");
  if (input.rootDomains.length === 0) throw new Error("A scope must include at least one approved root domain.");
  current.scope = {
    id: randomUUID(),
    engagementId: input.engagementId,
    status: "draft",
    rootDomains: input.rootDomains.map(requireSyntheticDemoHostname),
    exclusions: input.exclusions.map(requireSyntheticDemoHostname),
    allowedTestTypes: input.allowedTestTypes,
    rateLimitPerMinute: input.rateLimitPerMinute,
    timeoutSeconds: input.timeoutSeconds,
    testingWindow: input.testingWindow,
    emergencyContact: input.emergencyContact,
    stopConditions: input.stopConditions,
    authorizationStatus: "pending"
  };
  current.assets = [];
  audit(current, "scope.created", "scope", current.scope.id, "Draft scope created; written authorization is still pending.");
  return current.scope;
}

export function approveDemoScope(id: string): DemoScope {
  const current = state();
  if (id !== current.scope.id) throw new Error("Scope not found.");
  if (current.scope.rootDomains.length === 0 || current.scope.allowedTestTypes.length === 0) {
    throw new Error("A scope must contain approved targets and allowed test types before approval.");
  }
  current.scope.status = "approved";
  current.scope.authorizationStatus = "approved";
  audit(current, "scope.approved", "scope", current.scope.id, "Written authorization and scope approval recorded in local demo.");
  return current.scope;
}

export function addDemoAsset(input: {
  scopeId: string;
  hostname: string;
  kind: DemoAsset["kind"];
  environment: DemoAsset["environment"];
  priority: DemoAsset["priority"];
}): DemoAsset {
  const current = state();
  if (input.scopeId !== current.scope.id) throw new Error("Scope not found.");
  if (current.scope.status !== "approved" || current.scope.authorizationStatus !== "approved") {
    throw new Error("Assets can be used for jobs only after the scope is approved.");
  }
  const hostname = requireSyntheticDemoHostname(input.hostname);
  if (!current.scope.rootDomains.some((root) => isTargetWithinRoot(hostname, root)) || isExcluded(hostname, current.scope.exclusions)) {
    throw new Error("The asset is not inside the approved scope or is explicitly excluded.");
  }
  const asset: DemoAsset = {
    id: randomUUID(),
    scopeId: current.scope.id,
    hostname,
    kind: input.kind,
    environment: input.environment,
    scopeStatus: "in_scope",
    source: "Local demo asset inventory",
    priority: input.priority
  };
  current.assets.unshift(asset);
  audit(current, "asset.created", "asset", asset.id, "In-scope synthetic asset added to the inventory.");
  return asset;
}
