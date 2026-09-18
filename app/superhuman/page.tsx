import type { Metadata } from "next";
import { SuperhumanConsole } from "@/components/superhuman-console";

export const metadata: Metadata = {
  title: "AIFIX3R Superhuman",
  description: "Evidence-grounded, human-controlled orchestration for authorized bug-bounty work."
};

export default function SuperhumanPage() {
  return <main className="mx-auto max-w-7xl px-5 py-10 md:py-14"><SuperhumanConsole /></main>;
}
