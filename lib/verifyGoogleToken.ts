import { OAuth2Client } from "google-auth-library";

const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
const client = clientId ? new OAuth2Client(clientId) : null;

export async function verifyGoogleIdToken(idToken: string): Promise<string | null> {
  if (!client || !clientId) {
    return null;
  }

  try {
    const ticket = await client.verifyIdToken({ idToken, audience: clientId });
    const payload = ticket.getPayload();

    if (!payload?.email || !payload.email_verified) {
      return null;
    }

    return payload.email;
  } catch {
    return null;
  }
}
