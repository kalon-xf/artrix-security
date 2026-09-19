import { NextResponse } from "next/server";
import { requireDemoActor, requireRole } from "@/lib/auth";
import { approveDemoSuperhumanMission } from "@/lib/demo-store";
import { enforceSameOrigin, errorResponse } from "@/lib/route-utils";
import { superhumanApprovalRequestSchema } from "@/lib/security";

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    enforceSameOrigin(request);
    const actor = requireDemoActor();
    requireRole(actor, ["organization_owner", "security_lead"]);
    const { id } = await context.params;
    const body: unknown = await request.json();
    const { rationale } = superhumanApprovalRequestSchema.parse(body);
    return NextResponse.json({ mission: approveDemoSuperhumanMission(id, rationale) });
  } catch (error) {
    return errorResponse(error);
  }
}
