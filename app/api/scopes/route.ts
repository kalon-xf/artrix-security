import { NextResponse } from "next/server";
import { z } from "zod";
import { requireDemoActor, requireRole } from "@/lib/auth";
import { createDemoScope } from "@/lib/demo-store";
import { safeJobTypeSchema } from "@/lib/security";
import { enforceSameOrigin, errorResponse } from "@/lib/route-utils";

const domainList = z.array(z.string().trim().min(3).max(253)).max(100);
const schema = z.object({
  engagementId: z.string().min(1).max(120),
  rootDomains: domainList.min(1),
  exclusions: domainList,
  allowedTestTypes: z.array(safeJobTypeSchema).min(1).max(6),
  rateLimitPerMinute: z.coerce.number().int().min(1).max(600),
  timeoutSeconds: z.coerce.number().int().min(5).max(3600),
  testingWindow: z.string().trim().min(3).max(400),
  emergencyContact: z.string().trim().email().max(254),
  stopConditions: z.array(z.string().trim().min(3).max(300)).min(1).max(20)
});

export async function POST(request: Request) {
  try {
    enforceSameOrigin(request);
    const actor = requireDemoActor();
    requireRole(actor, ["organization_owner", "security_lead"]);
    const scope = createDemoScope(schema.parse(await request.json()));
    return NextResponse.json({ scope }, { status: 201 });
  } catch (error) {
    return errorResponse(error);
  }
}
