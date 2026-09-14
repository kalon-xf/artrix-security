"use client";

import { useEffect, useState } from "react";
import type { WorkspaceDashboardData } from "@/lib/types";

type ActionState = { kind: "idle" | "loading" | "success" | "error"; message?: string };

function Metric({ label, value }: { label: string; value: string | number }) {
  return <article className="rounded-lg border border-line bg-panel/70 p-4"><p className="text-xs uppercase tracking-wider text-slate-400">{label}</p><p className="mt-2 text-2xl font-black text-white">{value}</p></article>;
}

export function WorkspaceDashboard() {
  const [data, setData] = useState<WorkspaceDashboardData | null>(null);
  const [state, setState] = useState<ActionState>({ kind: "idle" });

  async function request(path: string, init?: RequestInit) {
    const response = await fetch(path, {
      ...init,
      headers: { "content-type": "application/json", ...(init?.headers ?? {}) }
    });
    const payload = await response.json();
    if (!response.ok) throw new Error(payload.error ?? "Request failed.");
    return payload;
  }

  async function refresh() {
    try {
      const payload = await request("/api/workspace");
      setData(payload);
    } catch (error) {
      setState({ kind: "error", message: error instanceof Error ? error.message : "Workspace unavailable." });
    }
  }

  useEffect(() => { void refresh(); }, []);

  async function run(label: string, operation: () => Promise<void>) {
    setState({ kind: "loading", message: label });
    try {
      await operation();
      await refresh();
      setState({ kind: "success", message: `${label} complete.` });
    } catch (error) {
      setState({ kind: "error", message: error instanceof Error ? error.message : "Action failed." });
    }
  }

  if (!data) {
    return (
      <div className="rounded-xl border border-line bg-panel/80 p-8">
        <h2 className="text-xl font-bold text-white">Local demo workspace</h2>
        <p className="mt-3 text-slate-300">Enable <code className="rounded bg-ink px-1.5 py-0.5 text-signal">ARTRIX_DEMO_MODE=true</code> in <code className="rounded bg-ink px-1.5 py-0.5 text-signal">.env.local</code>, then run the app with <code className="rounded bg-ink px-1.5 py-0.5 text-signal">npm run dev</code>.</p>
        {state.kind === "error" && <p role="alert" className="mt-4 text-sm text-red-300">{state.message}</p>}
      </div>
    );
  }

  const validationFinding = data.findings.find((finding) => finding.status === "needs_validation");
  const remediationFinding = data.findings.find((finding) => finding.status === "validated") ?? data.findings[0];
  const retestFinding = data.findings.find((finding) => finding.status === "validated") ?? data.findings[0];

  return (
    <div className="space-y-7">
      <section className="rounded-xl border border-signal/30 bg-signal/5 p-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="font-mono text-xs uppercase tracking-wider text-signal">Development-only synthetic demo</p>
            <h2 className="mt-1 text-xl font-bold text-white">{data.engagement.name}</h2>
            <p className="mt-1 text-sm text-slate-300">{data.client.name} · Scope: {data.scope.rootDomains.join(", ")}</p>
          </div>
          <span className="rounded-full border border-signal/40 px-3 py-1 text-xs font-bold text-signal">{data.scope.authorizationStatus} authorization</span>
        </div>
      </section>

      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Metric label="Active engagements" value={data.metrics.activeEngagements} />
        <Metric label="In-scope assets" value={data.metrics.scopedAssets} />
        <Metric label="Completed jobs" value={data.metrics.completedJobs} />
        <Metric label="Needs validation" value={data.metrics.findingsNeedingValidation} />
        <Metric label="Remediation progress" value={data.metrics.remediationProgress} />
        <Metric label="Retest pass rate" value={data.metrics.retestPassRate} />
        <Metric label="AI tests recorded" value={data.metrics.aiTestCoverage} />
        <Metric label="Audit events" value={data.auditLogs.length} />
      </section>

      <section className="grid gap-5 lg:grid-cols-2">
        <article className="rounded-xl border border-line bg-panel/80 p-5">
          <p className="font-mono text-xs uppercase tracking-wider text-electric">Scope gate</p>
          <h2 className="mt-2 text-lg font-bold text-white">Approved before work starts</h2>
          <dl className="mt-4 grid gap-3 text-sm">
            <div><dt className="text-slate-400">Allowed jobs</dt><dd className="mt-1 text-slate-200">{data.scope.allowedTestTypes.join(", ")}</dd></div>
            <div><dt className="text-slate-400">Exclusions</dt><dd className="mt-1 text-slate-200">{data.scope.exclusions.join(", ")}</dd></div>
            <div><dt className="text-slate-400">Limits</dt><dd className="mt-1 text-slate-200">{data.scope.rateLimitPerMinute}/minute · {data.scope.timeoutSeconds}s timeout</dd></div>
          </dl>
        </article>
        <article className="rounded-xl border border-line bg-panel/80 p-5">
          <p className="font-mono text-xs uppercase tracking-wider text-electric">Safe workflow demo</p>
          <h2 className="mt-2 text-lg font-bold text-white">Run the governed sequence</h2>
          <div className="mt-4 flex flex-wrap gap-2">
            <button disabled={state.kind === "loading"} onClick={() => run("Safe discovery job", async () => { await request("/api/jobs", { method: "POST", body: JSON.stringify({ scopeId: data.scope.id, assetId: data.assets[0]?.id, type: "passive_subdomain_discovery" }) }); })} className="rounded-md border border-electric/50 px-3 py-2 text-sm font-bold text-electric hover:bg-electric/10 disabled:opacity-50">Queue safe discovery</button>
            {validationFinding && <button disabled={state.kind === "loading"} onClick={() => run("Finding validation", async () => { await request(`/api/findings/${validationFinding.id}/validate`, { method: "POST", body: "{}" }); })} className="rounded-md border border-signal/50 px-3 py-2 text-sm font-bold text-signal hover:bg-signal/10 disabled:opacity-50">Validate finding</button>}
            {remediationFinding && <button disabled={state.kind === "loading"} onClick={() => run("Remediation assignment", async () => { await request("/api/remediation", { method: "POST", body: JSON.stringify({ findingId: remediationFinding.id, title: "Review and implement authorization control", owner: "Engineering owner", dueDate: "2026-10-01" }) }); })} className="rounded-md border border-line px-3 py-2 text-sm font-bold text-white hover:border-signal disabled:opacity-50">Assign remediation</button>}
            {retestFinding && <button disabled={state.kind === "loading"} onClick={() => run("Retest recording", async () => { await request("/api/retests", { method: "POST", body: JSON.stringify({ findingId: retestFinding.id, result: "pass", notes: "Synthetic fix verification for local demo." }) }); })} className="rounded-md border border-line px-3 py-2 text-sm font-bold text-white hover:border-signal disabled:opacity-50">Record retest</button>}
            <button disabled={state.kind === "loading"} onClick={() => run("AI test result", async () => { await request("/api/ai/test-runs", { method: "POST", body: JSON.stringify({ systemName: "Demo support agent", testCase: "Benign prompt injection boundary check", category: "prompt_injection", result: "pass", mitigation: "Require tool approval and filter untrusted content." }) }); })} className="rounded-md border border-line px-3 py-2 text-sm font-bold text-white hover:border-signal disabled:opacity-50">Record AI test</button>
          </div>
          {state.kind !== "idle" && <p role={state.kind === "error" ? "alert" : "status"} className={`mt-4 text-sm ${state.kind === "error" ? "text-red-300" : state.kind === "success" ? "text-signal" : "text-slate-300"}`}>{state.message}</p>}
        </article>
      </section>

      <section className="grid gap-5 lg:grid-cols-2">
        <article className="rounded-xl border border-line bg-panel/80 p-5">
          <h2 className="text-lg font-bold text-white">Findings</h2>
          <div className="mt-4 space-y-3">
            {data.findings.map((finding) => <div key={finding.id} className="rounded-lg border border-line/80 p-3"><div className="flex items-center justify-between gap-3"><p className="font-semibold text-slate-100">{finding.title}</p><span className="rounded-full bg-slate-800 px-2 py-1 text-xs text-signal">{finding.status}</span></div><p className="mt-2 text-sm text-slate-400">{finding.severity} · {finding.businessImpact}</p></div>)}
          </div>
        </article>
        <article className="rounded-xl border border-line bg-panel/80 p-5">
          <h2 className="text-lg font-bold text-white">Job and evidence trail</h2>
          <div className="mt-4 space-y-3">
            {data.jobs.length === 0 && <p className="text-sm text-slate-400">No safe jobs have been queued yet.</p>}
            {data.jobs.map((job) => <div key={job.id} className="rounded-lg border border-line/80 p-3"><p className="font-semibold text-slate-100">{job.type}</p><p className="mt-1 text-sm text-slate-400">{job.status} · {job.summary ?? "Awaiting safe manifest processing"}</p></div>)}
            {data.evidence.slice(0, 3).map((item) => <div key={item.id} className="rounded-lg border border-line/80 p-3"><p className="font-semibold text-slate-100">{item.title}</p><p className="mt-1 text-sm text-slate-400">{item.summary}</p></div>)}
          </div>
        </article>
      </section>

      <section className="rounded-xl border border-line bg-panel/80 p-5">
        <h2 className="text-lg font-bold text-white">Audit log</h2>
        <ol className="mt-4 grid gap-3 md:grid-cols-2">
          {data.auditLogs.slice(0, 6).map((entry) => <li key={entry.id} className="rounded-lg border border-line/80 p-3"><p className="font-mono text-xs text-electric">{entry.action}</p><p className="mt-1 text-sm text-slate-200">{entry.detail}</p><p className="mt-2 text-xs text-slate-500">{new Date(entry.createdAt).toLocaleString()}</p></li>)}
        </ol>
      </section>
    </div>
  );
}
