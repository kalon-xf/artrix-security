import { NextResponse } from "next/server";
import { isDemoMode } from "@/lib/env";

export function GET() {
  return NextResponse.json({
    status: "ok",
    service: "artrix",
    demoMode: isDemoMode()
  });
}
