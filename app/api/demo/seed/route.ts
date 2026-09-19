import { NextResponse } from "next/server";
import { requireDemoActor, requireRole } from "@/lib/auth";
import { seedDemo } from "@/lib/demo-store";
import { enforceSameOrigin, errorResponse } from "@/lib/route-utils";

export function POST(request: Request) {
  try {
    enforceSameOrigin(request);
    const actor = requireDemoActor();
    requireRole(actor, ["organization_owner", "security_lead"]);
    return NextResponse.json(seedDemo());
  } catch (error) {
    return errorResponse(error);
  }
}
