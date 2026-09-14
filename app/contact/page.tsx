import { ContactForm } from "@/components/contact-form";

export default function ContactPage() {
  return (
    <section className="mx-auto grid max-w-6xl gap-10 px-5 py-20 md:grid-cols-[0.9fr_1.1fr] md:py-28">
      <div>
        <p className="font-mono text-sm uppercase tracking-[0.2em] text-signal">Start with authorization</p>
        <h1 className="mt-5 text-4xl font-black leading-tight text-white md:text-5xl">Book an AI Security Readiness Call.</h1>
        <p className="mt-6 text-lg leading-8 text-slate-300">Tell us what you want to assess. We will start by aligning the system owner, written authorization, scope, exclusions, and safe testing plan.</p>
        <p className="mt-8 text-sm font-medium text-signal">Authorized security testing only.</p>
      </div>
      <ContactForm />
    </section>
  );
}
