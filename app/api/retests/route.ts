import { NextResponse } from "next/server";
import { z } from "zod";
import { requireDemoActor, requireRole } from "@/lib/auth";
import { recordDemoRetest } from "@/lib/demo-store";
import { enforceSameOrigin, errorResponse } from "@/lib/route-utils";

const schema = z.object({
  findingId: z.string().min(1).max(120),
  result: z.enum(["pass", "partial_pass", "fail"]),
  notes: z.string().trim().min(5).max(2000)
});

export async function POST(request: Request) {
  try {
    enforceSameOrigin(request);
    const actor = requireDemoActor();
    requireRole(actor, ["organization_owner", "security_lead", "researcher"]);
    const retest = recordDemoRetest(schema.parse(await request.json()));
    return NextResponse.json({ retest }, { status: 201 });
  } catch (error) {
    return errorResponse(error);
  }
}
