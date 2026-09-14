import { NextResponse } from "next/server";
import { z } from "zod";
import { requireDemoActor, requireRole } from "@/lib/auth";
import { createDemoRemediation } from "@/lib/demo-store";
import { enforceSameOrigin, errorResponse } from "@/lib/route-utils";

const schema = z.object({
  findingId: z.string().min(1).max(120),
  title: z.string().trim().min(3).max(240),
  owner: z.string().trim().min(2).max(160),
  dueDate: z.string().date()
});

export async function POST(request: Request) {
  try {
    enforceSameOrigin(request);
    const actor = requireDemoActor();
    requireRole(actor, ["organization_owner", "security_lead", "remediation_member"]);
    const task = createDemoRemediation(schema.parse(await request.json()));
    return NextResponse.json({ task }, { status: 201 });
  } catch (error) {
    return errorResponse(error);
  }
}
