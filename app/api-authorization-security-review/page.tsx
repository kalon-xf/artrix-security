import { MarketingPage } from "@/components/marketing-page";

export default function ApiAuthorizationSecurityReviewPage() {
  return <MarketingPage
    eyebrow="API authorization security review"
    title="Make sure every user, tenant, and workflow can access only what it should."
    description="Artrix reviews authorization controls across APIs and business workflows with written scope, safe testing controls, and developer-ready evidence."
    outcomes={["Object-level and function-level authorization coverage", "Tenant-isolation and workflow-authorization analysis", "Clear proof, impact, remediation guidance, and retest status", "HackerOne/Bugcrowd-style finding exports where appropriate"]}
    methodology={["Confirm API inventory, test identities, permitted environments, and exclusions.", "Map privileged actions and access-control assumptions.", "Safely validate only approved scenarios and collect sanitized evidence.", "Track remediation owners, due dates, and retest outcomes."]}
    deliverable="An API Authorization Security Review report tailored to engineering and leadership audiences."
  />;
}
