import { NextResponse } from "next/server";
import { z } from "zod";
import { requireDemoActor, requireRole } from "@/lib/auth";
import { recordDemoAiTest } from "@/lib/demo-store";
import { enforceSameOrigin, errorResponse } from "@/lib/route-utils";

const schema = z.object({
  systemName: z.string().trim().min(2).max(160),
  testCase: z.string().trim().min(3).max(1000),
  category: z.enum(["prompt_injection", "indirect_prompt_injection", "rag_source_trust", "tool_permissions", "sensitive_data", "human_approval"]),
  result: z.enum(["pass", "partial_pass", "fail"]),
  mitigation: z.string().trim().min(3).max(2000)
});

export async function POST(request: Request) {
  try {
    enforceSameOrigin(request);
    const actor = requireDemoActor();
    requireRole(actor, ["organization_owner", "security_lead", "researcher"]);
    const result = recordDemoAiTest(schema.parse(await request.json()));
    return NextResponse.json({ result }, { status: 201 });
  } catch (error) {
    return errorResponse(error);
  }
}
