import { NextResponse } from "next/server";
import { z } from "zod";
import { requireDemoActor, requireRole } from "@/lib/auth";
import { createDemoClient } from "@/lib/demo-store";
import { enforceSameOrigin, errorResponse } from "@/lib/route-utils";

const schema = z.object({
  name: z.string().trim().min(2).max(160),
  contactName: z.string().trim().min(2).max(160),
  contactEmail: z.string().trim().email().max(254)
});

export async function POST(request: Request) {
  try {
    enforceSameOrigin(request);
    const actor = requireDemoActor();
    requireRole(actor, ["organization_owner", "security_lead"]);
    const client = createDemoClient(schema.parse(await request.json()));
    return NextResponse.json({ client }, { status: 201 });
  } catch (error) {
    return errorResponse(error);
  }
}
