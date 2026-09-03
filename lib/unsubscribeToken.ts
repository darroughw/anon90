import { createHmac, timingSafeEqual } from "node:crypto";

// Reuses the Supabase project's JWT secret — it's already a private
// server-only value in this project, so no new secret to provision.
const SECRET = process.env.SUPABASE_JWT_SECRET;

// Signature is a fixed-length (64 hex chars) HMAC-SHA256 digest, appended
// directly rather than joined with a separator -- subjects can be email
// addresses, which routinely contain ".", so splitting on a delimiter
// would silently truncate them instead of failing loudly.
const SIGNATURE_LENGTH = 64;

export function createUnsubscribeToken(subject: string): string {
  if (!SECRET) {
    throw new Error("SUPABASE_JWT_SECRET is required to create unsubscribe tokens");
  }

  const signature = createHmac("sha256", SECRET).update(subject).digest("hex");
  return Buffer.from(`${subject}${signature}`).toString("base64url");
}

export function verifyUnsubscribeToken(token: string): string | null {
  if (!SECRET) return null;

  try {
    const decoded = Buffer.from(token, "base64url").toString("utf8");
    if (decoded.length <= SIGNATURE_LENGTH) return null;

    const subject = decoded.slice(0, -SIGNATURE_LENGTH);
    const signature = decoded.slice(-SIGNATURE_LENGTH);

    const expected = createHmac("sha256", SECRET).update(subject).digest("hex");
    const provided = Buffer.from(signature);
    const expectedBuffer = Buffer.from(expected);

    if (provided.length !== expectedBuffer.length || !timingSafeEqual(provided, expectedBuffer)) {
      return null;
    }

    return subject;
  } catch {
    return null;
  }
}
