export function isDemoMode(): boolean {
  return process.env.NODE_ENV === "development" && process.env.ARTRIX_DEMO_MODE === "true";
}

export function appOrigin(): string | undefined {
  return process.env.NEXT_PUBLIC_APP_URL;
}

export function assertDemoMode(): void {
  if (!isDemoMode()) {
    throw new Error("The local demo is disabled. Enable it only with ARTRIX_DEMO_MODE=true in development.");
  }
}
