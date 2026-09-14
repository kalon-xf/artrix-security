import { NextResponse } from "next/server";
import { requireDemoActor, requireRole } from "@/lib/auth";
import { approveDemoScope } from "@/lib/demo-store";
import { enforceSameOrigin, errorResponse } from "@/lib/route-utils";

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    enforceSameOrigin(request);
    const actor = requireDemoActor();
    requireRole(actor, ["organization_owner", "security_lead"]);
    const { id } = await context.params;
    const scope = approveDemoScope(id);
    return NextResponse.json({ scope });
  } catch (error) {
    return errorResponse(error);
  }
}
