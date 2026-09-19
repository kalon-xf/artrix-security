"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { SuperhumanMission, SuperhumanTaskStatus, WorkspaceDashboardData } from "@/lib/types";

type Notice = { kind: "idle" | "loading" | "success" | "error"; message?: string };

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(path, {
    ...init,
    headers: { "content-type": "application/json", ...(init?.headers ?? {}) }
  });
  const body = await response.json();
  if (!response.ok) throw new Error(body.error ?? "Request failed.");
  return body as T;
}

const taskTone: Record<SuperhumanTaskStatus, string> = {
  completed: "border-signal/40 bg-signal/10 text-signal",
  awaiting_approval: "border-amber-400/40 bg-amber-400/10 text-amber-300",
  running: "border-electric/40 bg-electric/10 text-electric",
  pending: "border-line bg-white/5 text-slate-300",
  blocked: "border-rose-400/30 bg-rose-400/10 text-rose-300"
};

function pretty(value: string) {
  return value.replaceAll("_", " ");
}

export function SuperhumanConsole() {
  const [workspace, setWorkspace] = useState<WorkspaceDashboardData | null>(null);
  const [missions, setMissions] = useState<SuperhumanMission[]>([]);
  const [assetId, setAssetId] = useState("");
  const [objective, setObjective] = useState("Map the approved attack surface and prioritize evidence-backed hypotheses for human validation.");
  const [notice, setNotice] = useState<Notice>({ kind: "idle" });

  const load = useCallback(async () => {
    try {
      const [workspaceData, missionData] = await Promise.all([
        request<WorkspaceDashboardData>("/api/workspace"),
        request<{ missions: SuperhumanMission[] }>("/api/superhuman")
      ]);
      setWorkspace(workspaceData);
      setMissions(missionData.missions);
      setAssetId((current) => current || workspaceData.assets[0]?.id || "");
    } catch (error) {
      setNotice({ kind: "error", message: error instanceof Error ? error.message : "Superhuman workspace is unavailable." });
    }
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => { void load(); }, 0);
    return () => window.clearTimeout(timer);
  }, [load]);

  const activeMission = missions[0];
  const selectedAsset = useMemo(() => workspace?.assets.find((asset) => asset.id === assetId), [assetId, workspace]);

  async function startMission() {
    if (!workspace || !assetId) return;
    setNotice({ kind: "loading", message: "Verifying six authorization facts and building the evidence graph…" });
    try {
      await request<{ mission: SuperhumanMission }>("/api/superhuman", {
        method: "POST",
        body: JSON.stringify({ scopeId: workspace.scope.id, assetId, objective })
      });
      await load();
      setNotice({ kind: "success", message: "Mission reached its human checkpoint. No vulnerability has been claimed and no exploit action was executed." });
    } catch (error) {
      setNotice({ kind: "error", message: error instanceof Error ? error.message : "Mission could not start." });
    }
  }

  async function approveValidationPlan() {
    if (!activeMission) return;
    setNotice({ kind: "loading", message: "Recording the security lead decision…" });
    try {
      await request(`/api/superhuman/${activeMission.id}/approve`, {
        method: "POST",
        body: JSON.stringify({ rationale: "Approved for non-destructive validation using researcher-owned test accounts." })
      });
      await load();
      setNotice({ kind: "success", message: "The bounded validation plan is approved. The candidate hypothesis remains unvalidated until evidence is reviewed." });
    } catch (error) {
      setNotice({ kind: "error", message: error instanceof Error ? error.message : "Approval could not be recorded." });
    }
  }

  return (
    <div className="space-y-7">
      <section className="overflow-hidden rounded-2xl border border-signal/30 bg-[radial-gradient(circle_at_top_right,rgba(62,230,169,.14),transparent_35%),linear-gradient(135deg,rgba(10,20,33,.98),rgba(5,11,20,.98))] p-6 md:p-8">
        <div className="flex flex-wrap items-start justify-between gap-5">
          <div className="max-w-3xl">
            <p className="font-mono text-xs uppercase tracking-[0.24em] text-signal">AIFIX3R Superhuman · planner v0.1</p>
            <h1 className="mt-3 text-3xl font-black text-white md:text-5xl">An evidence brain for authorized bug bounty.</h1>
            <p className="mt-4 text-sm leading-6 text-slate-300 md:text-base">It converts approved scope into a persistent task graph, runs only typed discovery manifests, recalls evidence-linked memory, and stops at a human checkpoint before validation or impact claims.</p>
          </div>
          <div className="grid min-w-52 gap-2 rounded-xl border border-white/10 bg-black/20 p-4 font-mono text-xs">
            <span className="text-slate-500">CONTROL STATE</span>
            <span className="text-signal">● AUTHORIZATION FIRST</span>
            <span className="text-electric">● EVIDENCE GROUNDED</span>
            <span className="text-amber-300">● HUMAN APPROVAL</span>
          </div>
        </div>
      </section>

      <section className="grid gap-5 lg:grid-cols-[.82fr_1.18fr]">
        <article className="rounded-xl border border-line bg-panel/80 p-5">
          <p className="font-mono text-xs uppercase tracking-wider text-electric">Mission control</p>
          <h2 className="mt-2 text-xl font-bold text-white">Start from approved scope</h2>
          {!workspace ? <p className="mt-4 text-sm text-slate-400">Loading the local authorized workspace…</p> : <div className="mt-5 space-y-4">
            <label className="block text-sm text-slate-300">
              Approved asset
              <select value={assetId} onChange={(event) => setAssetId(event.target.value)} className="mt-2 w-full rounded-lg border border-line bg-ink px-3 py-3 text-sm text-white outline-none focus:border-signal">
                {workspace.assets.map((asset) => <option key={asset.id} value={asset.id}>{asset.hostname} · {asset.environment}</option>)}
              </select>
            </label>
            <label className="block text-sm text-slate-300">
              Evidence objective
              <textarea value={objective} onChange={(event) => setObjective(event.target.value)} rows={4} maxLength={500} className="mt-2 w-full resize-none rounded-lg border border-line bg-ink px-3 py-3 text-sm leading-6 text-white outline-none focus:border-signal" />
            </label>
            <div className="grid grid-cols-2 gap-3 rounded-lg border border-line/80 bg-black/15 p-3 text-xs">
              <div><span className="block text-slate-500">Scope</span><span className="mt-1 block font-semibold text-signal">{workspace.scope.authorizationStatus}</span></div>
              <div><span className="block text-slate-500">Target</span><span className="mt-1 block truncate font-semibold text-white">{selectedAsset?.hostname ?? "—"}</span></div>
              <div><span className="block text-slate-500">Rate ceiling</span><span className="mt-1 block text-white">{workspace.scope.rateLimitPerMinute}/min</span></div>
              <div><span className="block text-slate-500">Timeout</span><span className="mt-1 block text-white">{workspace.scope.timeoutSeconds}s</span></div>
            </div>
            <button type="button" onClick={() => void startMission()} disabled={!assetId || objective.trim().length < 12 || notice.kind === "loading"} className="w-full rounded-lg bg-signal px-4 py-3 text-sm font-black text-ink transition hover:bg-[#7cf7ca] disabled:cursor-not-allowed disabled:opacity-50">Verify gate &amp; start mission</button>
            <p className="text-xs leading-5 text-slate-500">Local demo: synthetic <code>.test</code> assets only. The planner cannot submit a terminal command.</p>
          </div>}
          {notice.message && <p className={`mt-4 rounded-lg border px-3 py-2 text-sm ${notice.kind === "error" ? "border-rose-400/30 bg-rose-400/10 text-rose-200" : notice.kind === "success" ? "border-signal/30 bg-signal/10 text-signal" : "border-electric/30 bg-electric/10 text-electric"}`}>{notice.message}</p>}
        </article>

        <article className="rounded-xl border border-line bg-panel/80 p-5">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div><p className="font-mono text-xs uppercase tracking-wider text-electric">Authorization gate</p><h2 className="mt-2 text-xl font-bold text-white">Six facts or zero execution</h2></div>
            {activeMission && <span className="rounded-full border border-amber-400/30 bg-amber-400/10 px-3 py-1 text-xs font-bold uppercase text-amber-300">{pretty(activeMission.status)}</span>}
          </div>
          {!activeMission ? <div className="mt-8 rounded-xl border border-dashed border-line p-8 text-center text-sm text-slate-400">Start a mission to produce an authorization snapshot, evidence graph, and human decision point.</div> : <div className="mt-5 grid gap-3 sm:grid-cols-2">
            {activeMission.authorizationGate.map((fact) => <div key={fact.key} className={`rounded-lg border p-3 ${fact.satisfied ? "border-signal/25 bg-signal/5" : "border-rose-400/25 bg-rose-400/5"}`}>
              <div className="flex items-center gap-2"><span className={fact.satisfied ? "text-signal" : "text-rose-300"}>{fact.satisfied ? "✓" : "×"}</span><h3 className="text-sm font-bold text-white">{fact.label}</h3></div>
              <p className="mt-2 text-xs leading-5 text-slate-400">{fact.detail}</p>
            </div>)}
          </div>}
        </article>
      </section>

      {activeMission && <>
        <section className="rounded-xl border border-line bg-panel/80 p-5">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div><p className="font-mono text-xs uppercase tracking-wider text-electric">Persistent task graph</p><h2 className="mt-2 text-xl font-bold text-white">Mission reasoning you can inspect</h2><p className="mt-2 max-w-3xl text-sm text-slate-400">{activeMission.objective}</p></div>
            <span className="font-mono text-xs text-slate-500">{activeMission.tasks.filter((task) => task.status === "completed").length}/{activeMission.tasks.length} nodes complete</span>
          </div>
          <div className="mt-6 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            {activeMission.tasks.map((task, index) => <article key={task.id} className="relative rounded-lg border border-line bg-black/15 p-4">
              <div className="flex items-center justify-between gap-2"><span className="font-mono text-[11px] text-slate-500">NODE {String(index + 1).padStart(2, "0")} · PHASE {task.phase}</span><span className={`rounded-full border px-2 py-1 text-[10px] font-bold uppercase ${taskTone[task.status]}`}>{pretty(task.status)}</span></div>
              <h3 className="mt-3 text-sm font-bold text-white">{task.title}</h3>
              <p className="mt-2 text-xs leading-5 text-slate-400">{task.rationale}</p>
              <div className="mt-3 flex flex-wrap gap-2 font-mono text-[10px] text-slate-500"><span>{task.kind}</span>{task.evidenceIds.length > 0 && <span>· {task.evidenceIds.length} evidence</span>}{task.approvalRequired && <span>· human gate</span>}</div>
            </article>)}
          </div>
        </section>

        <section className="grid gap-5 lg:grid-cols-2">
          <article className="rounded-xl border border-line bg-panel/80 p-5">
            <p className="font-mono text-xs uppercase tracking-wider text-electric">Evidence memory</p>
            <h2 className="mt-2 text-xl font-bold text-white">Recall with provenance</h2>
            <div className="mt-5 space-y-3">{activeMission.memories.map((memory) => <div key={memory.id} className="rounded-lg border border-line bg-black/15 p-4"><div className="flex justify-between gap-3 font-mono text-[10px] uppercase text-slate-500"><span>{pretty(memory.grounding)}</span><span>{Math.round(memory.similarity * 100)}% relevance</span></div><p className="mt-2 text-sm leading-6 text-slate-300">{memory.content}</p><p className="mt-2 truncate font-mono text-[10px] text-electric">source:{memory.sourceId}</p></div>)}</div>
          </article>
          <article className="rounded-xl border border-line bg-panel/80 p-5">
            <p className="font-mono text-xs uppercase tracking-wider text-electric">Candidate hypotheses</p>
            <h2 className="mt-2 text-xl font-bold text-white">No evidence, no claim</h2>
            <div className="mt-5 space-y-3">{activeMission.hypotheses.map((hypothesis) => <div key={hypothesis.id} className="rounded-lg border border-amber-400/25 bg-amber-400/5 p-4"><div className="flex flex-wrap items-center justify-between gap-2"><h3 className="text-sm font-bold text-white">{hypothesis.title}</h3><span className="font-mono text-xs text-amber-300">{Math.round(hypothesis.confidence * 100)}% candidate</span></div><p className="mt-2 text-sm leading-6 text-slate-300">{hypothesis.summary}</p><p className="mt-3 text-xs font-bold uppercase tracking-wider text-slate-500">Missing evidence</p><ul className="mt-2 space-y-1 text-xs leading-5 text-slate-400">{hypothesis.missingEvidence.map((item) => <li key={item}>• {item}</li>)}</ul></div>)}</div>
          </article>
        </section>

        <section className="grid gap-5 lg:grid-cols-[1.2fr_.8fr]">
          <article className="rounded-xl border border-amber-400/30 bg-amber-400/5 p-5"><p className="font-mono text-xs uppercase tracking-wider text-amber-300">Human decision required</p><h2 className="mt-2 text-xl font-bold text-white">Approve the bounded validation plan</h2><p className="mt-3 text-sm leading-6 text-slate-300">{activeMission.nextAction}</p><button type="button" onClick={() => void approveValidationPlan()} disabled={activeMission.status !== "awaiting_human_approval" || notice.kind === "loading"} className="mt-5 rounded-lg border border-amber-300/50 bg-amber-300 px-4 py-2 text-sm font-black text-ink transition hover:bg-amber-200 disabled:cursor-not-allowed disabled:opacity-40">{activeMission.status === "ready_for_validation" ? "Validation plan approved" : "Approve validation plan"}</button></article>
          <article className="rounded-xl border border-line bg-panel/80 p-5"><p className="font-mono text-xs uppercase tracking-wider text-rose-300">Hard guardrails</p><ul className="mt-4 space-y-2 text-xs leading-5 text-slate-400">{activeMission.guardrails.map((guardrail) => <li key={guardrail} className="flex gap-2"><span className="text-rose-300">■</span><span>{guardrail}</span></li>)}</ul></article>
        </section>
      </>}
    </div>
  );
}
