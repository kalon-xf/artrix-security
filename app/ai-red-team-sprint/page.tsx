import { MarketingPage } from "@/components/marketing-page";

export default function AiRedTeamSprintPage() {
  return <MarketingPage
    eyebrow="AI red-team sprint"
    title="Assess the security boundaries of your AI product before they become business risk."
    description="A focused, authorized review of models, RAG sources, agents, tools, approvals, permissions, and sensitive-data paths."
    outcomes={["AI system inventory and attack-surface map", "Benign prompt injection and indirect-injection test cases", "RAG source-trust and tool-permission review", "Mitigation plan and retest-ready findings"]}
    methodology={["Document the model, agent roles, tools, RAG sources, data classes, and human approval points.", "Agree benign test cases and test environment boundaries.", "Record pass, partial pass, or fail with evidence and mitigation.", "Prioritize safeguards and verify them after remediation."]}
    deliverable="An AI Red-Team report that turns AI security risks into actionable engineering controls."
  />;
}
