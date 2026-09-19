import type { WorkspaceDashboardData } from "@/lib/types";

export const reportKinds = [
  "executive_summary",
  "technical",
  "hackerone",
  "bugcrowd",
  "ai_red_team",
  "api_authorization",
  "retest",
  "rules_of_engagement"
] as const;

export type ReportKind = (typeof reportKinds)[number];

function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (character) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;"
  })[character] ?? character);
}

export function buildReport(data: WorkspaceDashboardData, type: ReportKind) {
  const findingLines = data.findings.map((finding) =>
    `- **[${finding.severity.toUpperCase()}] ${finding.title}** — ${finding.status}\n  - Business impact: ${finding.businessImpact}\n  - Remediation: ${finding.remediation}`
  ).join("\n") || "- No findings recorded.";

  const aiLines = data.aiTestRuns.map((run) =>
    `- **${run.category}** on ${run.systemName}: ${run.result}. Mitigation: ${run.mitigation}`
  ).join("\n") || "- No AI test runs recorded.";

  const retestLines = data.retests.map((retest) =>
    `- ${retest.result}: ${retest.notes}`
  ).join("\n") || "- No retests recorded.";

  const title = {
    executive_summary: "Executive Security Assessment Summary",
    technical: "Technical Security Assessment Report",
    hackerone: "HackerOne-Style Finding Report",
    bugcrowd: "Bugcrowd-Style Finding Report",
    ai_red_team: "AI Red-Team Assessment Report",
    api_authorization: "API Authorization Security Review",
    retest: "Retest Report",
    rules_of_engagement: "Client Authorization & Rules of Engagement"
  }[type];

  const markdown = `# ${title}

## Engagement

- Organization: ${data.organization.name}
- Client: ${data.client.name}
- Engagement: ${data.engagement.name}
- Dates: ${data.engagement.startsOn} to ${data.engagement.endsOn}
- Scope status: ${data.scope.status}
- Authorization status: ${data.scope.authorizationStatus}
- Approved roots: ${data.scope.rootDomains.join(", ")}
- Exclusions: ${data.scope.exclusions.join(", ")}
- Allowed test types: ${data.scope.allowedTestTypes.join(", ")}

## Methodology

Artrix applies an authorization-first methodology: written approval, explicit scope and exclusions, controlled rate limits, human validation of findings, evidence-led reporting, remediation tracking, and retest before closure.

## Findings

${findingLines}

## AI red-team coverage

${aiLines}

## Retest status

${retestLines}

## Legal and handling statement

This report concerns explicitly authorized testing only. Evidence is sanitized for sharing; raw artifacts require approved protected storage and retention controls.
`;

  const html = `<!doctype html><html><head><meta charset="utf-8"><title>${escapeHtml(title)}</title><style>body{font-family:Arial,sans-serif;line-height:1.55;color:#102035;max-width:920px;margin:48px auto;padding:0 24px}h1,h2{color:#0a7660}pre{white-space:pre-wrap;font-family:inherit}</style></head><body><pre>${escapeHtml(markdown)}</pre></body></html>`;

  return { title, markdown, html };
}
