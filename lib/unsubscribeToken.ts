import { createHmac, timingSafeEqual } from "node:crypto";

// Reuses the Supabase project's JWT secret — it's already a private
// server-only value in this project, so no new secret to provision.
const SECRET = process.env.SUPABASE_JWT_SECRET;

export function createUnsubscribeToken(userId: string): string {
  if (!SECRET) {
    throw new Error("SUPABASE_JWT_SECRET is required to create unsubscribe tokens");
  }

  const signature = createHmac("sha256", SECRET).update(userId).digest("hex");
  return Buffer.from(`${userId}.${signature}`).toString("base64url");
}

export function verifyUnsubscribeToken(token: string): string | null {
  if (!SECRET) return null;

  try {
    const [userId, signature] = Buffer.from(token, "base64url").toString("utf8").split(".");
    if (!userId || !signature) return null;

    const expected = createHmac("sha256", SECRET).update(userId).digest("hex");
    const provided = Buffer.from(signature);
    const expectedBuffer = Buffer.from(expected);

    if (provided.length !== expectedBuffer.length || !timingSafeEqual(provided, expectedBuffer)) {
      return null;
    }

    return userId;
  } catch {
    return null;
  }
}
