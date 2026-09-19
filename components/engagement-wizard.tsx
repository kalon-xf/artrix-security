"use client";

import { FormEvent, useState } from "react";

type Props = { onComplete: () => Promise<void> };

async function post(path: string, body: Record<string, unknown>) {
  const response = await fetch(path, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body)
  });
  const payload = await response.json();
  if (!response.ok) throw new Error(payload.error ?? "The demo action failed.");
  return payload;
}

export function EngagementWizard({ onComplete }: Props) {
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("loading");
    const form = new FormData(event.currentTarget);
    const value = (key: string) => String(form.get(key) ?? "").trim();
    const rootDomain = value("rootDomain").toLowerCase();

    try {
      const organization = await post("/api/organizations", { name: value("organizationName") });
      const client = await post("/api/clients", {
        name: value("clientName"),
        contactName: value("contactName"),
        contactEmail: value("contactEmail")
      });
      const engagement = await post("/api/engagements", {
        clientId: client.client.id,
        name: value("engagementName"),
        startsOn: value("startsOn"),
        endsOn: value("endsOn")
      });
      const scope = await post("/api/scopes", {
        engagementId: engagement.engagement.id,
        rootDomains: [rootDomain],
        exclusions: [`admin.${rootDomain}`],
        allowedTestTypes: ["passive_subdomain_discovery", "dns_resolution", "permitted_http_probing", "technology_fingerprinting", "approved_url_collection"],
        rateLimitPerMinute: 20,
        timeoutSeconds: 120,
        testingWindow: "Weekdays 09:00–18:00 IST (synthetic demo)",
        emergencyContact: value("contactEmail"),
        stopConditions: ["Unexpected availability impact", "Client stop request", "Unexpected sensitive-data exposure"]
      });
      await post(`/api/scopes/${scope.scope.id}/approve`, {});
      await post("/api/assets", {
        scopeId: scope.scope.id,
        hostname: `api.${rootDomain}`,
        kind: "api",
        environment: "staging",
        priority: "high"
      });
      setMessage(`Created a synthetic engagement for ${organization.organization.name}.`);
      setStatus("success");
      await onComplete();
    } catch (error) {
      setStatus("error");
      setMessage(error instanceof Error ? error.message : "The demo workflow could not be created.");
    }
  }

  return (
    <details className="rounded-xl border border-line bg-panel/80 p-5">
      <summary className="cursor-pointer text-lg font-bold text-white">Create a fresh synthetic demo engagement</summary>
      <p className="mt-3 text-sm text-slate-400">This resets only in-memory local demo data. Use a <code className="rounded bg-ink px-1.5 py-0.5 text-signal">.test</code> domain; no network scan or tool execution occurs.</p>
      <form onSubmit={submit} className="mt-5 grid gap-4 md:grid-cols-2">
        <label className="grid gap-1 text-sm text-slate-300">Organization<input required name="organizationName" defaultValue="Artrix Demo Consultancy" className="rounded border border-line bg-ink px-3 py-2 text-white" /></label>
        <label className="grid gap-1 text-sm text-slate-300">Client<input required name="clientName" defaultValue="Synthetic Client" className="rounded border border-line bg-ink px-3 py-2 text-white" /></label>
        <label className="grid gap-1 text-sm text-slate-300">Security contact<input required name="contactName" defaultValue="Security Owner" className="rounded border border-line bg-ink px-3 py-2 text-white" /></label>
        <label className="grid gap-1 text-sm text-slate-300">Contact email<input required type="email" name="contactEmail" defaultValue="owner@example.test" className="rounded border border-line bg-ink px-3 py-2 text-white" /></label>
        <label className="grid gap-1 text-sm text-slate-300">Engagement<input required name="engagementName" defaultValue="API and AI readiness review" className="rounded border border-line bg-ink px-3 py-2 text-white" /></label>
        <label className="grid gap-1 text-sm text-slate-300">Synthetic root domain<input required name="rootDomain" defaultValue="client.example.test" pattern=".*\.test" title="Use a .test domain in the local demo." className="rounded border border-line bg-ink px-3 py-2 text-white" /></label>
        <label className="grid gap-1 text-sm text-slate-300">Start date<input required type="date" name="startsOn" defaultValue="2026-09-14" className="rounded border border-line bg-ink px-3 py-2 text-white" /></label>
        <label className="grid gap-1 text-sm text-slate-300">End date<input required type="date" name="endsOn" defaultValue="2026-10-14" className="rounded border border-line bg-ink px-3 py-2 text-white" /></label>
        <div className="md:col-span-2">
          <button disabled={status === "loading"} className="rounded-md bg-signal px-4 py-2 font-bold text-ink disabled:opacity-50">{status === "loading" ? "Creating…" : "Create approved demo workflow"}</button>
          {status !== "idle" && <p role={status === "error" ? "alert" : "status"} className={`mt-3 text-sm ${status === "error" ? "text-red-300" : "text-signal"}`}>{message}</p>}
        </div>
      </form>
    </details>
  );
}
