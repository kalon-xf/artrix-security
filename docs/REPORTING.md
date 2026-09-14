# Reporting

Artrix provides Markdown and PDF-ready HTML generators for:

- Executive summary
- Technical assessment report
- HackerOne-style finding report
- Bugcrowd-style finding report
- AI Red-Team report
- API Authorization Security Review report
- Retest report
- Client Authorization & Rules of Engagement agreement

Generated reports always include the engagement scope, dates, methodology, findings, evidence references, risk ratings, business impact, remediation, and retest status. The current demo exposes safe generated output only; production persistence requires the `reports` table and protected evidence storage.
