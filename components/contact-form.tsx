"use client";

import { FormEvent, useState } from "react";

export function ContactForm() {
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("sending");
    const form = new FormData(event.currentTarget);
    const response = await fetch("/api/contact", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(Object.fromEntries(form))
    });
    setStatus(response.ok ? "sent" : "error");
  }

  return (
    <form onSubmit={submit} className="grid gap-5 rounded-xl border border-line bg-panel/80 p-6 shadow-glow" aria-label="Assessment request form">
      <div className="grid gap-5 sm:grid-cols-2">
        <label className="grid gap-2 text-sm font-medium text-slate-200">Name
          <input required name="name" autoComplete="name" className="rounded-md border border-line bg-ink px-3 py-2 text-white outline-none focus:border-signal" />
        </label>
        <label className="grid gap-2 text-sm font-medium text-slate-200">Work email
          <input required type="email" name="email" autoComplete="email" className="rounded-md border border-line bg-ink px-3 py-2 text-white outline-none focus:border-signal" />
        </label>
      </div>
      <label className="grid gap-2 text-sm font-medium text-slate-200">Company
        <input required name="company" autoComplete="organization" className="rounded-md border border-line bg-ink px-3 py-2 text-white outline-none focus:border-signal" />
      </label>
      <label className="grid gap-2 text-sm font-medium text-slate-200">What do you want assessed?
        <textarea required name="message" rows={5} maxLength={4000} className="rounded-md border border-line bg-ink px-3 py-2 text-white outline-none focus:border-signal" placeholder="Tell us about your application, API, RAG system, agent, or security goal." />
      </label>
      <label className="flex gap-3 text-sm text-slate-300">
        <input required type="checkbox" name="authorized" className="mt-1 accent-[#47f0b5]" />
        <span>I confirm I am requesting only authorized security testing and can provide written authorization.</span>
      </label>
      <button disabled={status === "sending"} className="rounded-md bg-signal px-4 py-3 font-bold text-ink disabled:opacity-50">
        {status === "sending" ? "Sending…" : "Request an assessment"}
      </button>
      {status === "sent" && <p role="status" className="text-sm text-signal">Thank you. Your request was accepted for follow-up.</p>}
      {status === "error" && <p role="alert" className="text-sm text-red-300">We could not submit the request. Please try again.</p>}
    </form>
  );
}
