import { NextResponse } from "next/server";
import { appOrigin } from "@/lib/env";

export function enforceSameOrigin(request: Request): void {
  const origin = request.headers.get("origin");
  const allowedOrigin = appOrigin();
  if (process.env.NODE_ENV === "production" && !allowedOrigin) {
    throw new Error("NEXT_PUBLIC_APP_URL must be configured in production.");
  }
  if (origin && allowedOrigin && origin !== allowedOrigin) {
    throw new Error("Cross-origin requests are not allowed.");
  }
}

export function errorResponse(error: unknown) {
  const message = error instanceof Error ? error.message : "Unexpected request failure.";
  const status =
    message.includes("permission") || message.includes("Cross-origin") ? 403 :
    message.includes("disabled") || message.includes("must be configured") ? 503 :
    message.includes("not found") ? 404 :
    message.includes("approved") || message.includes("scope") || message.includes("authorization") ? 409 :
    400;
  return NextResponse.json({ error: message }, { status });
}
