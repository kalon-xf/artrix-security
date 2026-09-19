import { NextResponse } from "next/server";
import { z } from "zod";
import { requireDemoActor, requireRole } from "@/lib/auth";
import { getWorkspaceDashboard } from "@/lib/demo-store";
import { reportKinds, buildReport } from "@/lib/report";
import { enforceSameOrigin, errorResponse } from "@/lib/route-utils";

const schema = z.object({ type: z.enum(reportKinds) });

export async function POST(request: Request) {
  try {
    enforceSameOrigin(request);
    const actor = requireDemoActor();
    requireRole(actor, ["organization_owner", "security_lead"]);
    const { type } = schema.parse(await request.json());
    const report = buildReport(getWorkspaceDashboard(), type);
    return NextResponse.json({ report });
  } catch (error) {
    return errorResponse(error);
  }
}
