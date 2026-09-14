import { NextResponse } from "next/server";
import { z } from "zod";
import { requireDemoActor, requireRole } from "@/lib/auth";
import { addDemoAsset } from "@/lib/demo-store";
import { enforceSameOrigin, errorResponse } from "@/lib/route-utils";

const schema = z.object({
  scopeId: z.string().min(1).max(120),
  hostname: z.string().trim().min(3).max(253),
  kind: z.enum(["root_domain", "subdomain", "url", "api"]),
  environment: z.enum(["development", "staging", "production"]),
  priority: z.enum(["high", "medium", "low"])
});

export async function POST(request: Request) {
  try {
    enforceSameOrigin(request);
    const actor = requireDemoActor();
    requireRole(actor, ["organization_owner", "security_lead", "researcher"]);
    const asset = addDemoAsset(schema.parse(await request.json()));
    return NextResponse.json({ asset }, { status: 201 });
  } catch (error) {
    return errorResponse(error);
  }
}
