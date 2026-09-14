import { NextResponse } from "next/server";
import { z } from "zod";
import { requireDemoActor, requireRole } from "@/lib/auth";
import { createDemoOrganization } from "@/lib/demo-store";
import { enforceSameOrigin, errorResponse } from "@/lib/route-utils";

const schema = z.object({ name: z.string().trim().min(2).max(160) });

export async function POST(request: Request) {
  try {
    enforceSameOrigin(request);
    const actor = requireDemoActor();
    requireRole(actor, ["organization_owner", "security_lead"]);
    const organization = createDemoOrganization(schema.parse(await request.json()));
    return NextResponse.json({ organization }, { status: 201 });
  } catch (error) {
    return errorResponse(error);
  }
}
