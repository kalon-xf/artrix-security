"use client";

import { useCallback, useEffect, useState } from "react";
import { authorizedMethodology } from "@/lib/methodology";
import type { WorkspaceDashboardData } from "@/lib/types";

type State = { kind: "idle" | "loading" | "success" | "error"; message?: string };

async function request(path: string, init?: RequestInit) {
  const response = await fetch(path, {
    ...init,
    headers: { "content-type": "application/json", ...(init?.headers ?? {}) }
  });
  const body = await response.json();
  if (!response.ok) throw new Error(body.error ?? "Request failed.");
  return body;
}

export function ScanConsole() {
  const [workspace, setWorkspace] = useState<WorkspaceDashboardData | null>(null);
  const [assetId, setAssetId] = useState("");
  const [state, setState] = useState<State>({ kind: "idle" });

  const load = useCallback(async () => {
    try {
      const data = await request("/api/workspace");
      setWorkspace(data);
      setAssetId((current) => current || data.assets[0]?.id || "");
    } catch (error) {
      setState({ kind: "error", message: error instanceof Error ? error.message : "Local workspace unavailable." });
    }
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => { void load(); }, 0);
    return () => window.clearTimeout(timer);
  }, [load]);

  async function queueSafeRun() {
    if (!workspace || !assetId) return;
    setState({ kind: "loading", message: "Checking scope and queuing the permitted discovery manifest…" });
    try {
      await request("/api/jobs", {
        method: "POST",
        body: JSON.stringify({ scopeId: workspace.scope.id, assetId, type: "passive_subdomain_discovery" })
      });
      await load();
      setState({ kind: "success", message: "Approved safe discovery job queued. The local worker may only execute an allowlisted manifest." });
    } catch (error) {
      setState({ kind: "error", message: error instanceof Error ? error.message : "Job could not be queued." });
    }
  }

  const telemetry = workspace?.auditLogs.slice(0, 5) ?? [];

  return (
    <div className="space-y-7">
      <section className="rounded-xl border border-signal/30 bg-signal/5 p-5">
        <p className="font-mono text-xs uppercase tracking-wider text-signal">Self-hosted authorized testing console</p>
        <div className="mt-3 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black text-white">Scan control, not an unrestricted scanner.</h1>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-300">Artrix keeps target data on your infrastructure. Jobs begin only after written authorization and an approved scope; no free-form terminal commands or unapproved targets are accepted.</p>
          </div>
          <span className="rounded-full border border-signal/40 px-3 py-1 text-xs font-bold text-signal">Loopback-first runtime</span>
        </div>
      </section>

      <section className="grid gap-5 lg:grid-cols-[1.15fr_.85fr]">
        <article className="rounded-xl border border-line bg-panel/80 p-5">
          <p className="font-mono text-xs uppercase tracking-wider text-electric">Authorized run</p>
          <h2 className="mt-2 text-xl font-bold text-white">Queue a governed discovery manifest</h2>
          {!workspace ? <p className="mt-4 text-sm text-slate-400">Loading the local demo workspace…</p> : <>
            <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
              <div><dt className="text-slate-400">Authorization</dt><dd className="mt-1 font-semibold text-signal">{workspace.scope.authorizationStatus}</dd></div>
              <div><dt className="text-slate-400">Rate limit</dt><dd className="mt-1 text-slate-200">{workspace.scope.rateLimitPerMinute} requests/minute</dd></div>
              <div><dt className="text-slate-400">Timeout</dt><dd className="mt-1 text-slate-200">{workspace.scope.timeoutSeconds} seconds</dd></div>
              <div><dt className="text-slate-400">Exclusions</dt><dd className="mt-1 text-slate-200">{workspace.scope.exclusions.join(", ")}</dd></div>
            </dl>
            <label className="mt-5 block text-sm font-semibold text-slate-200">Approved asset
              <select value={assetId} onChange={(event) => setAssetId(event.target.value)} className="mt-2 block w-full rounded-md border border-line bg-ink px-3 py-2 text-sm text-white">
                {workspace.assets.filter((asset) => asset.scopeStatus === "in_scope").map((asset) => <option key={asset.id} value={asset.id}>{asset.hostname} · {asset.environment}</option>)}
              </select>
            </label>
            <button onClick={() => void queueSafeRun()} disabled={state.kind === "loading" || workspace.scope.authorizationStatus !== "approved" || !assetId} className="mt-4 rounded-md bg-signal px-4 py-2.5 text-sm font-bold text-ink transition hover:bg-[#7cf7ca] disabled:cursor-not-allowed disabled:opacity-50">Queue safe discovery</button>
          </>}
          {state.kind !== "idle" && <p role={state.kind === "error" ? "alert" : "status"} className={`mt-4 text-sm ${state.kind === "error" ? "text-red-300" : state.kind === "success" ? "text-signal" : "text-slate-300"}`}>{state.message}</p>}
        </article>

        <article className="rounded-xl border border-line bg-panel/80 p-5">
          <p className="font-mono text-xs uppercase tracking-wider text-electric">Provider & telemetry posture</p>
          <h2 className="mt-2 text-xl font-bold text-white">Private by design</h2>
          <ul className="mt-4 space-y-3 text-sm text-slate-300">
            <li><span className="font-semibold text-white">Model providers:</span> configuration is environment-managed; keys are never returned to the browser.</li>
            <li><span className="font-semibold text-white">Telemetry:</span> local audit events are available now; authenticated WebSocket streaming is a production milestone.</li>
            <li><span className="font-semibold text-white">Integrations:</span> notifications are planned behind organization-level opt-in and secret storage.</li>
          </ul>
          <div className="mt-5 rounded-lg border border-line/80 bg-ink/50 p-3">
            <p className="font-mono text-xs text-slate-400">RECENT LOCAL EVENTS</p>
            <div className="mt-3 space-y-2">{telemetry.length ? telemetry.map((event) => <div key={event.id} className="text-xs text-slate-300"><span className="text-electric">{event.action}</span> · {event.detail}</div>) : <p className="text-xs text-slate-500">No events recorded.</p>}</div>
          </div>
        </article>
      </section>

      <section className="rounded-xl border border-line bg-panel/80 p-5">
        <div className="flex flex-wrap items-end justify-between gap-3"><div><p className="font-mono text-xs uppercase tracking-wider text-electric">22-phase methodology</p><h2 className="mt-2 text-xl font-bold text-white">Evidence-led, human-governed assurance</h2></div><p className="text-sm text-slate-400">Phase selection and execution policy are upcoming worker controls.</p></div>
        <ol className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-3">{authorizedMethodology.map(([number, title, description]) => <li key={number} className="rounded-lg border border-line/80 p-4"><p className="font-mono text-xs text-signal">{number}</p><h3 className="mt-2 font-semibold text-white">{title}</h3><p className="mt-2 text-sm leading-6 text-slate-400">{description}</p></li>)}</ol>
      </section>
    </div>
  );
}
