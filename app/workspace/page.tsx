import { WorkspaceDashboard } from "@/components/workspace-dashboard";

export default function WorkspacePage() {
  return (
    <section className="mx-auto max-w-7xl px-5 py-10 md:py-14">
      <div className="mb-8">
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-signal">Artrix workspace</p>
        <h1 className="mt-3 text-3xl font-black text-white md:text-4xl">Authorized engagement control plane</h1>
        <p className="mt-3 max-w-3xl text-slate-300">The local demo shows the intended workflow. It is disabled unless development-only demo mode is explicitly enabled.</p>
      </div>
      <WorkspaceDashboard />
    </section>
  );
}
