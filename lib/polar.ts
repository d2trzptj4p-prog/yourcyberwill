import { Polar } from "@polar-sh/sdk";

export function polarServer(): "sandbox" | "production" {
  const server = process.env.POLAR_SERVER?.trim().toLowerCase();
  if (server === "production" || server === "sandbox") {
    return server;
  }
  return process.env.NODE_ENV === "production" ? "production" : "sandbox";
}

/** Strip whitespace and optional surrounding quotes from .env values. */
export function getPolarAccessToken(): string | null {
  const raw = process.env.POLAR_ACCESS_TOKEN?.trim();
  if (!raw) {
    return null;
  }
  return raw.replace(/^["']|["']$/g, "");
}

export function getPolarClient(): Polar | null {
  const token = getPolarAccessToken();
  if (!token) {
    return null;
  }
  return new Polar({
    accessToken: token,
    server: polarServer(),
  });
}

export function polarAuthHint(): string {
  const server = polarServer();
  return server === "sandbox"
    ? "Create your Organization Access Token and $5 product at https://sandbox.polar.sh (not polar.sh). Set POLAR_SERVER=sandbox."
    : "Create your Organization Access Token and product at https://polar.sh. Set POLAR_SERVER=production.";
}

export function isPolarAuthError(error: unknown): boolean {
  const message = error instanceof Error ? error.message : String(error);
  return (
    message.includes("invalid_token") ||
    message.includes("401") ||
    message.includes("Unauthorized")
  );
}

export function getAppUrl(): string {
  return process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") ?? "http://localhost:3000";
}
