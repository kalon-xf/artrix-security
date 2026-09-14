import Link from "next/link";

const capabilities = [
  ["Authorize", "Written authorization, exclusions, safe rate limits, testing windows, and stop conditions before work begins."],
  ["Discover", "Controlled asset inventory and scoped discovery jobs that never accept arbitrary commands."],
  ["Validate", "Evidence-led findings with human approval before customer-facing validation."],
  ["Close the loop", "Reports, remediation ownership, retests, and explicit closure decisions in one workspace."]
];

export default function HomePage() {
  return (
    <div className="grid-fade">
      <section className="mx-auto max-w-7xl px-5 py-20 md:py-32">
        <p className="font-mono text-sm uppercase tracking-[0.25em] text-signal">India-first security engagement platform</p>
        <h1 className="mt-6 max-w-5xl text-5xl font-black leading-[1.05] text-white md:text-7xl">
          Security work that moves from <span className="text-signal">scope</span> to <span className="text-electric">verified fix.</span>
        </h1>
        <p className="mt-7 max-w-3xl text-lg leading-8 text-slate-300">
          Artrix gives researchers, consultancies, startups, engineering teams, and clients a governed workspace for authorized application-security and AI red-team engagements.
        </p>
        <div className="mt-10 flex flex-wrap gap-4">
          <Link href="/contact" className="rounded-md bg-signal px-5 py-3 font-bold text-ink shadow-glow transition hover:bg-[#7cf7ca]">Book an AI Security Readiness Call</Link>
          <Link href="/workspace" className="rounded-md border border-line bg-panel/60 px-5 py-3 font-bold text-white transition hover:border-electric">Explore the local demo</Link>
        </div>
        <p className="mt-5 text-sm text-slate-400">Authorized security testing only. No unrestricted exploitation or unapproved scanning.</p>
      </section>

      <section className="mx-auto max-w-7xl px-5 pb-20">
        <div className="grid gap-4 md:grid-cols-4">
          {capabilities.map(([title, detail], index) => (
            <article key={title} className="rounded-xl border border-line bg-panel/75 p-5 transition hover:-translate-y-1 hover:border-signal/60">
              <span className="font-mono text-sm text-signal">0{index + 1}</span>
              <h2 className="mt-5 text-xl font-bold text-white">{title}</h2>
              <p className="mt-3 text-sm leading-6 text-slate-300">{detail}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="border-y border-line bg-[#091728]/80">
        <div className="mx-auto grid max-w-7xl gap-8 px-5 py-16 md:grid-cols-[1fr_1.25fr]">
          <div>
            <p className="font-mono text-sm uppercase tracking-[0.2em] text-electric">Built for modern attack surfaces</p>
            <h2 className="mt-4 text-3xl font-bold text-white">Application security and AI assurance, together.</h2>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {[
              ["API authorization", "Object-level access, workflow authorization, and tenant boundary review."],
              ["RAG & agents", "RAG-source trust, prompt injection resilience, tools, data classes, and approvals."],
              ["Safe recon", "Approval-gated passive discovery, DNS, HTTP probing, technology fingerprints, and URL collection."],
              ["Client readiness", "Executive reports, remediation tracking, retests, and audit-ready engagement history."]
            ].map(([title, text]) => (
              <article key={title} className="rounded-lg border border-line/80 p-4">
                <h3 className="font-semibold text-white">{title}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-400">{text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
