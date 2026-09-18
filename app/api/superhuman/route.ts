import { NextResponse } from "next/server";
import { requireDemoActor, requireRole } from "@/lib/auth";
import { getDemoSuperhumanMissions, startDemoSuperhumanMission } from "@/lib/demo-store";
import { allowRequest } from "@/lib/rate-limit";
import { enforceSameOrigin, errorResponse } from "@/lib/route-utils";
import { superhumanMissionRequestSchema } from "@/lib/security";

export function GET() {
  try {
    requireDemoActor();
    return NextResponse.json({ missions: getDemoSuperhumanMissions() });
  } catch (error) {
    return errorResponse(error);
  }
}

export async function POST(request: Request) {
  try {
    enforceSameOrigin(request);
    const actor = requireDemoActor();
    requireRole(actor, ["organization_owner", "security_lead", "researcher"]);
    if (!allowRequest(`superhuman:${actor.id}`, 4, 60_000)) {
      return NextResponse.json({ error: "Superhuman mission rate limit exceeded." }, { status: 429 });
    }
    const body: unknown = await request.json();
    const input = superhumanMissionRequestSchema.parse(body);
    return NextResponse.json({ mission: startDemoSuperhumanMission(input) }, { status: 201 });
  } catch (error) {
    return errorResponse(error);
  }
}
