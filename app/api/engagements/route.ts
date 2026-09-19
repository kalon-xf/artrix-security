import { NextResponse } from "next/server";
import { z } from "zod";
import { requireDemoActor, requireRole } from "@/lib/auth";
import { createDemoEngagement } from "@/lib/demo-store";
import { enforceSameOrigin, errorResponse } from "@/lib/route-utils";

const schema = z.object({
  clientId: z.string().min(1).max(120),
  name: z.string().trim().min(3).max(200),
  startsOn: z.string().date(),
  endsOn: z.string().date()
}).refine((value) => value.endsOn >= value.startsOn, {
  message: "The engagement end date cannot be before the start date.",
  path: ["endsOn"]
});

export async function POST(request: Request) {
  try {
    enforceSameOrigin(request);
    const actor = requireDemoActor();
    requireRole(actor, ["organization_owner", "security_lead"]);
    const engagement = createDemoEngagement(schema.parse(await request.json()));
    return NextResponse.json({ engagement }, { status: 201 });
  } catch (error) {
    return errorResponse(error);
  }
}
