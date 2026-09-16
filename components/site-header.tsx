import Link from "next/link";

const links = [
  { href: "/services", label: "Services" },
  { href: "/ai-red-team-sprint", label: "AI Red-Team" },
  { href: "/api-authorization-security-review", label: "API Security" },
  { href: "/rag-agent-security-review", label: "RAG & Agents" },
  { href: "/about", label: "About" }
];

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-line/70 bg-ink/90 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-5 py-4">
        <Link href="/" className="group flex items-center gap-3" aria-label="Artrix home">
          <span className="grid h-9 w-9 place-items-center rounded-lg border border-signal/60 bg-signal/10 font-mono text-lg font-black text-signal shadow-glow transition group-hover:bg-signal/20">
            A
          </span>
          <span>
            <span className="block text-sm font-bold tracking-[0.25em] text-white">ARTRIX</span>
            <span className="block text-[10px] tracking-wider text-slate-400">FIND. PROVE. FIX. VERIFY.</span>
          </span>
        </Link>
        <nav className="hidden items-center gap-5 text-sm text-slate-300 lg:flex" aria-label="Primary navigation">
          {links.map((link) => (
            <Link key={link.href} href={link.href} className="transition hover:text-signal">
              {link.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-3">
          <Link href="/workspace" className="hidden text-sm text-slate-300 hover:text-white sm:inline">
            Workspace
          </Link>
          <Link href="/scans" className="hidden text-sm text-slate-300 hover:text-white sm:inline">
            Scan console
          </Link>
          <Link href="/contact" className="rounded-md bg-signal px-3 py-2 text-sm font-bold text-ink transition hover:bg-[#7cf7ca]">
            Book a readiness call
          </Link>
        </div>
      </div>
    </header>
  );
}
