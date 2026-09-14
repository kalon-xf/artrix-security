import { NextResponse } from "next/server";
import { requireDemoActor, requireRole } from "@/lib/auth";
import { validateDemoFinding } from "@/lib/demo-store";
import { enforceSameOrigin, errorResponse } from "@/lib/route-utils";

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    enforceSameOrigin(request);
    const actor = requireDemoActor();
    requireRole(actor, ["organization_owner", "security_lead"]);
    const { id } = await context.params;
    return NextResponse.json({ finding: validateDemoFinding(id) });
  } catch (error) {
    return errorResponse(error);
  }
}
