import { randomBytes } from "node:crypto";

export function generateShareToken(): string {
  return randomBytes(32).toString("base64url");
}

export async function hashShareToken(token: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(token);

  const hashBuffer = await crypto.subtle.digest("SHA-256", data);

  return Array.from(new Uint8Array(hashBuffer))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}
