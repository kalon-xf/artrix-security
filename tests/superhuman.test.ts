import { afterAll, beforeEach, describe, expect, it } from "vitest";
import {
  approveDemoSuperhumanMission,
  getWorkspaceDashboard,
  seedDemo,
  startDemoSuperhumanMission
} from "../lib/demo-store";
import { superhumanMissionRequestSchema } from "../lib/security";
import { evaluateSuperhumanGate, selectDiscoveryJob } from "../lib/superhuman";

const mutableEnv = process.env as Record<string, string | undefined>;
const originalNodeEnv = mutableEnv["NODE_ENV"];
const originalDemoMode = mutableEnv["ARTRIX_DEMO_MODE"];

beforeEach(() => {
  mutableEnv["NODE_ENV"] = "development";
  mutableEnv["ARTRIX_DEMO_MODE"] = "true";
  seedDemo();
});

afterAll(() => {
  mutableEnv["NODE_ENV"] = originalNodeEnv;
  mutableEnv["ARTRIX_DEMO_MODE"] = originalDemoMode;
});

describe("AIFIX3R Superhuman safety contract", () => {
  it("blocks when any authorization fact is missing", () => {
    const workspace = getWorkspaceDashboard();
    const draftScope = { ...workspace.scope, status: "draft" as const, authorizationStatus: "pending" as const };
    const jobType = selectDiscoveryJob(draftScope);
    const gate = evaluateSuperhumanGate(draftScope, workspace.assets[0], jobType);

    expect(gate).toHaveLength(6);
    expect(gate.find((fact) => fact.key === "current_explicit_authorization")?.satisfied).toBe(false);
    expect(gate.every((fact) => fact.satisfied)).toBe(false);
  });

  it("creates an evidence-grounded graph and stops at human approval", () => {
    const workspace = getWorkspaceDashboard();
    const mission = startDemoSuperhumanMission({
      scopeId: workspace.scope.id,
      assetId: workspace.assets[0].id,
      objective: "Map the approved attack surface and prioritize evidence-backed hypotheses."
    });

    expect(mission.authorizationGate.every((fact) => fact.satisfied)).toBe(true);
    expect(mission.status).toBe("awaiting_human_approval");
    expect(mission.tasks).toHaveLength(8);
    expect(mission.tasks.find((task) => task.kind === "human_checkpoint")?.status).toBe("awaiting_approval");
    expect(mission.hypotheses[0]).toMatchObject({ status: "candidate", requiresHumanValidation: true });
    expect(mission.hypotheses[0].confidence).toBeLessThan(0.5);
    expect(mission.hypotheses[0].evidenceIds.length).toBeGreaterThan(0);
    expect(mission.memories.every((memory) => Boolean(memory.sourceId))).toBe(true);
    expect(JSON.stringify(mission)).not.toContain('"command"');
  });

  it("records plan approval without falsely validating the hypothesis", () => {
    const workspace = getWorkspaceDashboard();
    const mission = startDemoSuperhumanMission({
      scopeId: workspace.scope.id,
      assetId: workspace.assets[0].id,
      objective: "Prepare a bounded authorization review with traceable evidence."
    });
    const approved = approveDemoSuperhumanMission(mission.id, "Approved for researcher-owned control comparisons.");

    expect(approved.status).toBe("ready_for_validation");
    expect(approved.approvedAt).toBeTruthy();
    expect(approved.hypotheses[0].status).toBe("candidate");
    expect(approved.memories[0]).toMatchObject({ kind: "decision", grounding: "human_decision" });
    expect(approved.nextAction).toMatch(/researcher-owned accounts/i);
  });

  it("rejects model- or browser-supplied command fields", () => {
    expect(() => superhumanMissionRequestSchema.parse({
      scopeId: "scope_demo",
      assetId: "asset_demo_api",
      objective: "Map the approved attack surface safely.",
      command: "arbitrary input"
    })).toThrow();
  });

  it("never auto-selects controlled template validation", () => {
    const workspace = getWorkspaceDashboard();
    const validationOnlyScope = { ...workspace.scope, allowedTestTypes: ["controlled_template_check" as const] };
    expect(selectDiscoveryJob(validationOnlyScope)).toBeUndefined();
  });
});
