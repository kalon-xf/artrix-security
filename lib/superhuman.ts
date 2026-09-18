import { randomUUID } from "crypto";
import { isExcluded, isTargetWithinRoot } from "@/lib/security";
import type {
  DemoAsset,
  DemoScope,
  SafeJobType,
  SuperhumanGateFact,
  SuperhumanHypothesis,
  SuperhumanMemory,
  SuperhumanMission,
  SuperhumanTask
} from "@/lib/types";

export const SUPERHUMAN_NAME = "AIFIX3R Superhuman" as const;
export const SUPERHUMAN_PLANNER_VERSION = "0.1.0";

export const superhumanGuardrails = [
  "Deny execution unless all six authorization facts pass.",
  "Accept typed allowlisted manifests only; never accept a shell command from a model or browser.",
  "Treat retrieved patterns and model output as hypotheses, never as proof.",
  "Cite sanitized evidence for every observation and stop when required evidence is missing.",
  "Require a human decision before validation, impact claims, reporting, or consequential actions.",
  "Stop on unexpected sensitive data, cross-tenant effects, availability impact, or scope uncertainty."
] as const;

const preferredDiscoveryJobs: SafeJobType[] = [
  "passive_subdomain_discovery",
  "dns_resolution",
  "permitted_http_probing",
  "technology_fingerprinting",
  "approved_url_collection"
];

export function selectDiscoveryJob(scope: DemoScope): SafeJobType | undefined {
  return preferredDiscoveryJobs.find((jobType) => scope.allowedTestTypes.includes(jobType));
}

export function evaluateSuperhumanGate(scope: DemoScope, asset: DemoAsset | undefined, jobType: SafeJobType | undefined): SuperhumanGateFact[] {
  const registered = Boolean(asset && asset.scopeId === scope.id);
  const authorized = scope.status === "approved" && scope.authorizationStatus === "approved";
  const inScope = Boolean(
    asset &&
    asset.scopeStatus === "in_scope" &&
    scope.rootDomains.some((root) => isTargetWithinRoot(asset.hostname, root)) &&
    !isExcluded(asset.hostname, scope.exclusions)
  );
  const permitted = Boolean(jobType && scope.allowedTestTypes.includes(jobType));
  const bounded = scope.rateLimitPerMinute > 0 && scope.timeoutSeconds > 0 && Boolean(scope.testingWindow.trim());

  return [
    { key: "registered_target", label: "Registered target", satisfied: registered, detail: registered ? "Asset belongs to the selected approved scope." : "Asset is not registered in this scope." },
    { key: "current_explicit_authorization", label: "Current explicit authorization", satisfied: authorized, detail: authorized ? "Written authorization and scope approval are active." : "Written authorization or scope approval is missing." },
    { key: "in_scope_asset", label: "In-scope asset", satisfied: inScope, detail: inScope ? "Hostname is inside an approved root and is not excluded." : "Asset is outside the approved boundary or excluded." },
    { key: "permitted_technique", label: "Permitted technique", satisfied: permitted, detail: permitted && jobType ? `${jobType} is allowlisted by this scope.` : "No permitted discovery technique is available." },
    { key: "non_destructive_plan", label: "Non-destructive plan", satisfied: permitted, detail: permitted ? "The plan uses a bounded discovery manifest and creates no exploit action." : "A safe typed plan could not be selected." },
    { key: "rate_and_time_limits", label: "Rate, time, and window limits", satisfied: bounded, detail: bounded ? `${scope.rateLimitPerMinute}/min, ${scope.timeoutSeconds}s timeout, ${scope.testingWindow}.` : "Rate, timeout, or testing-window limits are incomplete." }
  ];
}

type BuildMissionInput = {
  engagementId: string;
  scope: DemoScope;
  asset: DemoAsset;
  objective: string;
  createdAt: string;
  jobType: SafeJobType;
  jobId: string;
  evidenceIds: string[];
};

export function buildSuperhumanMission(input: BuildMissionInput): SuperhumanMission {
  const missionId = randomUUID();
  const gate = evaluateSuperhumanGate(input.scope, input.asset, input.jobType);
  const gatePassed = gate.every((fact) => fact.satisfied);
  const taskIds = Array.from({ length: 8 }, () => randomUUID());
  const evidenceGrounded = input.evidenceIds.length > 0;

  const tasks: SuperhumanTask[] = [
    {
      id: taskIds[0], phase: "01", title: "Authorization checkpoint", kind: "authorization_gate",
      status: gatePassed ? "completed" : "blocked", dependsOn: [], approvalRequired: false, evidenceIds: [],
      rationale: "All six authorization facts must pass before the mission can progress."
    },
    {
      id: taskIds[1], phase: "02–03", title: "Build bounded attack-surface plan", kind: "planning",
      status: gatePassed ? "completed" : "blocked", dependsOn: [taskIds[0]], approvalRequired: false, evidenceIds: [],
      rationale: "Select the smallest allowlisted discovery action for the approved asset."
    },
    {
      id: taskIds[2], phase: "03–07", title: "Execute approved discovery manifest", kind: "safe_job",
      status: gatePassed ? "completed" : "blocked", dependsOn: [taskIds[1]], approvalRequired: false,
      jobType: input.jobType, evidenceIds: input.evidenceIds,
      rationale: `The worker receives job ${input.jobId}; it never receives a model-authored command.`
    },
    {
      id: taskIds[3], phase: "20", title: "Normalize and sanitize evidence", kind: "evidence",
      status: evidenceGrounded ? "completed" : "blocked", dependsOn: [taskIds[2]], approvalRequired: false,
      evidenceIds: input.evidenceIds, rationale: "Convert tool output into traceable, sanitized observations."
    },
    {
      id: taskIds[4], phase: "20", title: "Recall relevant patterns and decisions", kind: "memory",
      status: evidenceGrounded ? "completed" : "blocked", dependsOn: [taskIds[3]], approvalRequired: false,
      evidenceIds: input.evidenceIds, rationale: "Retrieve only evidence-linked memory; similarity never upgrades a claim to fact."
    },
    {
      id: taskIds[5], phase: "20", title: "Form falsifiable hypotheses", kind: "analysis",
      status: evidenceGrounded ? "completed" : "blocked", dependsOn: [taskIds[4]], approvalRequired: false,
      evidenceIds: input.evidenceIds, rationale: "Separate observations, assumptions, missing evidence, and confidence."
    },
    {
      id: taskIds[6], phase: "21", title: "Human-approved validation plan", kind: "human_checkpoint",
      status: evidenceGrounded ? "awaiting_approval" : "blocked", dependsOn: [taskIds[5]], approvalRequired: true,
      evidenceIds: input.evidenceIds, rationale: "A security lead must approve a non-destructive validation plan before any deeper check."
    },
    {
      id: taskIds[7], phase: "22", title: "Report, remediate, retest, and learn", kind: "reporting",
      status: "blocked", dependsOn: [taskIds[6]], approvalRequired: true, evidenceIds: [],
      rationale: "Only human-validated findings can enter reporting and long-term memory."
    }
  ];

  const memories: SuperhumanMemory[] = input.evidenceIds.map((evidenceId, index) => ({
    id: randomUUID(),
    kind: "evidence",
    content: "Sanitized discovery evidence is available for bounded analysis; it does not prove a vulnerability.",
    sourceId: evidenceId,
    similarity: Math.max(0.74, 0.92 - index * 0.04),
    grounding: "verified_observation"
  }));

  const hypotheses: SuperhumanHypothesis[] = evidenceGrounded ? [{
    id: randomUUID(),
    title: "Candidate authorization-boundary review",
    summary: "The approved discovery result identifies an application surface that may warrant a researcher-led authorization review. No vulnerability or impact is asserted.",
    status: "candidate",
    confidence: 0.24,
    evidenceIds: input.evidenceIds,
    missingEvidence: [
      "Researcher-owned low-privilege and control accounts",
      "Expected authorization policy for the selected workflow",
      "A non-destructive control comparison approved by the security lead"
    ],
    requiresHumanValidation: true
  }] : [];

  return {
    id: missionId,
    name: SUPERHUMAN_NAME,
    plannerVersion: SUPERHUMAN_PLANNER_VERSION,
    engagementId: input.engagementId,
    scopeId: input.scope.id,
    assetId: input.asset.id,
    objective: input.objective,
    status: gatePassed && evidenceGrounded ? "awaiting_human_approval" : "blocked",
    authorizationGate: gate,
    tasks,
    memories,
    hypotheses,
    guardrails: [...superhumanGuardrails],
    stopConditions: input.scope.stopConditions,
    nextAction: gatePassed && evidenceGrounded
      ? "A security lead must review the evidence, missing prerequisites, and bounded validation plan."
      : "Resolve the blocked authorization or evidence gate before continuing.",
    createdAt: input.createdAt
  };
}

export function approveSuperhumanValidation(mission: SuperhumanMission, approvedAt: string): SuperhumanMission {
  if (mission.status !== "awaiting_human_approval") {
    throw new Error("Only a mission awaiting human approval can advance.");
  }
  const checkpoint = mission.tasks.find((task) => task.kind === "human_checkpoint");
  if (!checkpoint || checkpoint.status !== "awaiting_approval") {
    throw new Error("The human validation checkpoint is not ready for approval.");
  }
  checkpoint.status = "completed";
  mission.status = "ready_for_validation";
  mission.approvedAt = approvedAt;
  mission.nextAction = "Run only the approved non-destructive validation with researcher-owned accounts, then attach sanitized evidence for independent review.";
  mission.memories.unshift({
    id: randomUUID(),
    kind: "decision",
    content: "A security lead approved the bounded validation plan. This decision does not validate the candidate hypothesis.",
    sourceId: checkpoint.id,
    similarity: 1,
    grounding: "human_decision"
  });
  return mission;
}
