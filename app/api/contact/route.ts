import { NextResponse } from "next/server";
import { z } from "zod";
import { allowRequest } from "@/lib/rate-limit";
import { enforceSameOrigin, errorResponse } from "@/lib/route-utils";

const contactSchema = z.object({
  name: z.string().trim().min(2).max(120),
  email: z.string().trim().email().max(254),
  company: z.string().trim().min(2).max(160),
  message: z.string().trim().min(20).max(4000),
  authorized: z.literal("on")
});

export async function POST(request: Request) {
  try {
    enforceSameOrigin(request);
    const clientKey = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
    if (!allowRequest(`contact:${clientKey}`, 5, 60_000)) {
      return NextResponse.json({ error: "Please wait before sending another assessment request." }, { status: 429 });
    }
    const body: unknown = await request.json().catch(() => null);
    const parsed = contactSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Please provide valid contact details and confirm authorization." }, { status: 400 });
    }

    // Intentionally do not log or persist contact details until a CRM/mail provider is configured.
    // A production deployment should forward this validated payload to a consented CRM endpoint.
    return NextResponse.json({ accepted: true }, { status: 202 });
  } catch (error) {
    return errorResponse(error);
  }
}
