import { MarketingPage } from "@/components/marketing-page";

export default function ServicesPage() {
  return <MarketingPage
    eyebrow="Artrix services"
    title="Clear, governed security reviews for products that need to earn trust."
    description="From web applications and APIs to RAG systems and autonomous agents, Artrix combines technical depth with an evidence-led engagement process."
    outcomes={["A confirmed authorization and rules-of-engagement record", "Prioritized findings with business impact and practical remediation", "Executive and technical reports ready for client and engineering teams", "Retest evidence and an explicit closure decision"]}
    methodology={["Agree client, scope, exclusions, test types, rate limits, and emergency contact.", "Map assets and attack surface with approved, controlled methods.", "Validate meaningful signals with human review and safe evidence handling.", "Track remediation and retest before closing the engagement."]}
    deliverable="A professional engagement record from authorization through verification—not just a list of vulnerabilities."
  />;
}
