import { MarketingPage } from "@/components/marketing-page";

export default function RagAgentSecurityReviewPage() {
  return <MarketingPage
    eyebrow="RAG and agent security review"
    title="Secure the route from untrusted content to agent action."
    description="Review RAG ingestion, retrieval, tool boundaries, agent permissions, data handling, and human-in-the-loop controls for authorized customer systems."
    outcomes={["RAG source trust and ingestion-boundary review", "Agent capability, permission, and approval map", "Benign test cases for prompt injection and sensitive-data exposure", "Mitigation roadmap and retest evidence"]}
    methodology={["Inventory sources, embeddings, retrieval flow, agents, tools, approvals, and sensitive data.", "Threat-model unsafe content and tool-use boundaries.", "Run agreed benign test cases and document outcomes.", "Verify fixes with a controlled retest decision."]}
    deliverable="A RAG and Agent Security Review report with clear ownership for every mitigation."
  />;
}
