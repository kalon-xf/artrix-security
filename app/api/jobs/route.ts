import { NextResponse } from "next/server";
import { requireDemoActor, requireRole } from "@/lib/auth";
import { queueSafeDemoJob } from "@/lib/demo-store";
import { allowRequest } from "@/lib/rate-limit";
import { enforceSameOrigin, errorResponse } from "@/lib/route-utils";
import { safeJobRequestSchema } from "@/lib/security";

export async function POST(request: Request) {
  try {
    enforceSameOrigin(request);
    const actor = requireDemoActor();
    requireRole(actor, ["organization_owner", "security_lead", "researcher"]);
    if (!allowRequest(`job:${actor.id}`, 12, 60_000)) {
      return NextResponse.json({ error: "Job request rate limit exceeded." }, { status: 429 });
    }
    const body: unknown = await request.json();
    const input = safeJobRequestSchema.parse(body);
    const job = queueSafeDemoJob(input);
    return NextResponse.json({ job }, { status: 201 });
  } catch (error) {
    return errorResponse(error);
  }
}
