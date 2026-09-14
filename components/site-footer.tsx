import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="border-t border-line/70 bg-[#07101c]">
      <div className="mx-auto grid max-w-7xl gap-6 px-5 py-10 text-sm text-slate-400 md:grid-cols-[1fr_auto]">
        <div>
          <p className="font-bold tracking-[0.2em] text-slate-100">ARTRIX</p>
          <p className="mt-2 max-w-xl">Find. Prove. Fix. Verify. A professional workspace for authorized application-security and AI red-team engagements.</p>
          <p className="mt-3 text-xs font-medium text-signal">Authorized security testing only.</p>
        </div>
        <div className="flex flex-wrap gap-x-5 gap-y-2 md:justify-end">
          <Link href="/contact" className="hover:text-signal">Request an assessment</Link>
          <Link href="/services" className="hover:text-signal">Services</Link>
          <Link href="/workspace" className="hover:text-signal">Local demo</Link>
        </div>
      </div>
    </footer>
  );
}
