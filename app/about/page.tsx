import Link from "next/link";

export default function AboutPage() {
  return (
    <section className="mx-auto max-w-5xl px-5 py-20 md:py-28">
      <p className="font-mono text-sm uppercase tracking-[0.2em] text-signal">About Artrix</p>
      <h1 className="mt-5 text-4xl font-black text-white md:text-6xl">A better operating system for authorized security work.</h1>
      <div className="mt-8 space-y-6 text-lg leading-8 text-slate-300">
        <p>Artrix is being built for India’s security researchers, consultancies, startups, engineering teams, and clients who need a clear path from security testing to verified remediation.</p>
        <p>We believe strong security work is not only about finding issues. It is about authorization, evidence, responsible communication, practical fixes, and proving that risk has actually been reduced.</p>
      </div>
      <div className="mt-10 rounded-xl border border-signal/30 bg-signal/5 p-6">
        <p className="font-semibold text-white">Our operating principle</p>
        <p className="mt-2 text-slate-300">Authorized security testing only. Every engagement needs clear ownership, approved scope, safe limits, and an audit trail.</p>
        <Link href="/contact" className="mt-5 inline-block font-bold text-signal hover:underline">Talk to Artrix about your assessment →</Link>
      </div>
    </section>
  );
}
