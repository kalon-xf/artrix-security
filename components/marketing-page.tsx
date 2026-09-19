import Link from "next/link";

type MarketingPageProps = {
  eyebrow: string;
  title: string;
  description: string;
  outcomes: string[];
  methodology: string[];
  deliverable: string;
};

export function MarketingPage({ eyebrow, title, description, outcomes, methodology, deliverable }: MarketingPageProps) {
  return (
    <div className="grid-fade">
      <section className="mx-auto max-w-7xl px-5 py-20 md:py-28">
        <p className="font-mono text-sm uppercase tracking-[0.2em] text-signal">{eyebrow}</p>
        <h1 className="mt-5 max-w-4xl text-4xl font-black leading-tight text-white md:text-6xl">{title}</h1>
        <p className="mt-6 max-w-3xl text-lg leading-8 text-slate-300">{description}</p>
        <div className="mt-9 flex flex-wrap gap-3">
          <Link href="/contact" className="rounded-md bg-signal px-5 py-3 font-bold text-ink hover:bg-[#7cf7ca]">Book an AI Security Readiness Call</Link>
          <Link href="/workspace" className="rounded-md border border-line px-5 py-3 font-semibold text-slate-100 hover:border-electric">View the workspace</Link>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-6 px-5 pb-20 md:grid-cols-2">
        <article className="rounded-xl border border-line bg-panel/80 p-7">
          <h2 className="text-xl font-bold text-white">What you receive</h2>
          <ul className="mt-5 space-y-3 text-slate-300">
            {outcomes.map((outcome) => <li key={outcome} className="flex gap-3"><span className="text-signal">◆</span><span>{outcome}</span></li>)}
          </ul>
        </article>
        <article className="rounded-xl border border-line bg-panel/80 p-7">
          <h2 className="text-xl font-bold text-white">How the review works</h2>
          <ol className="mt-5 space-y-3 text-slate-300">
            {methodology.map((step, index) => <li key={step} className="flex gap-3"><span className="font-mono text-signal">0{index + 1}</span><span>{step}</span></li>)}
          </ol>
        </article>
        <article className="rounded-xl border border-electric/40 bg-electric/5 p-7 md:col-span-2">
          <p className="font-mono text-xs uppercase tracking-wider text-electric">Primary deliverable</p>
          <p className="mt-2 text-lg font-semibold text-white">{deliverable}</p>
          <p className="mt-4 text-sm text-slate-400">Every review begins with written authorization, clear scope, test windows, exclusions, rate limits, and stop conditions.</p>
        </article>
      </section>
    </div>
  );
}
