import { NextResponse } from "next/server";
import { z } from "zod";

const contactSchema = z.object({
  name: z.string().trim().min(2).max(120),
  email: z.string().trim().email().max(254),
  company: z.string().trim().min(2).max(160),
  message: z.string().trim().min(20).max(4000),
  authorized: z.literal("on")
});

export async function POST(request: Request) {
  const origin = request.headers.get("origin");
  const appOrigin = process.env.NEXT_PUBLIC_APP_URL;
  if (origin && appOrigin && origin !== appOrigin) {
    return NextResponse.json({ error: "Cross-origin form submission is not allowed." }, { status: 403 });
  }

  const body: unknown = await request.json().catch(() => null);
  const parsed = contactSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Please provide valid contact details and confirm authorization." }, { status: 400 });
  }

  // Intentionally do not log or persist contact details until a CRM/mail provider is configured.
  // A production deployment should forward this validated payload to a consented CRM endpoint.
  return NextResponse.json({ accepted: true }, { status: 202 });
}
