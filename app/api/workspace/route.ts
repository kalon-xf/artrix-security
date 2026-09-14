import { NextResponse } from "next/server";
import { requireDemoActor } from "@/lib/auth";
import { getWorkspaceDashboard } from "@/lib/demo-store";
import { errorResponse } from "@/lib/route-utils";

export function GET() {
  try {
    requireDemoActor();
    return NextResponse.json(getWorkspaceDashboard());
  } catch (error) {
    return errorResponse(error);
  }
}
