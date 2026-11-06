import { createPrivateKey, createSign } from "node:crypto";
import http2 from "node:http2";

// Token-based APNs auth (RFC 7519 JWT, ES256) — see
// https://developer.apple.com/documentation/usernotifications/establishing-a-token-based-connection-to-apns
// Apple asks that this token be reused, not regenerated per-request (at most once
// per ~20min), so it's cached at module scope for the lifetime of this cron invocation.
let cachedToken: { value: string; issuedAt: number } | null = null;
const TOKEN_TTL_MS = 55 * 60 * 1000;

function base64url(input: Buffer | string): string {
  return Buffer.from(input).toString("base64").replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function signingKey(): string | undefined {
  return process.env.APNS_PRIVATE_KEY?.replace(/\\n/g, "\n");
}

function authToken(): string | null {
  const keyId = process.env.APNS_KEY_ID;
  const teamId = process.env.APNS_TEAM_ID;
  const privateKey = signingKey();
  if (!keyId || !teamId || !privateKey) return null;

  if (cachedToken && Date.now() - cachedToken.issuedAt < TOKEN_TTL_MS) {
    return cachedToken.value;
  }

  const header = base64url(JSON.stringify({ alg: "ES256", kid: keyId }));
  const issuedAt = Math.floor(Date.now() / 1000);
  const payload = base64url(JSON.stringify({ iss: teamId, iat: issuedAt }));
  const unsigned = `${header}.${payload}`;

  const signer = createSign("SHA256");
  signer.update(unsigned);
  const signature = signer.sign(
    { key: createPrivateKey(privateKey), dsaEncoding: "ieee-p1363" },
  );

  const token = `${unsigned}.${base64url(signature)}`;
  cachedToken = { value: token, issuedAt: Date.now() };
  return token;
}

export type ApnsSendResult = { ok: true } | { ok: false; error: string; shouldForget: boolean };

/**
 * Sends a single alert push over an HTTP/2 connection opened per-call — APNs cron runs are
 * low-volume (hourly, one push per due+incomplete user) so a pooled/reused connection isn't
 * worth the complexity yet.
 */
export async function sendPush(deviceToken: string, tasksRemaining: number): Promise<ApnsSendResult> {
  const token = authToken();
  const bundleId = process.env.APNS_BUNDLE_ID;
  if (!token || !bundleId) {
    return { ok: false, error: "APNs not configured", shouldForget: false };
  }

  const host =
    process.env.APNS_ENV === "production" ? "api.push.apple.com" : "api.sandbox.push.apple.com";

  return new Promise((resolve) => {
    const client = http2.connect(`https://${host}`);

    client.on("error", (err) => {
      resolve({ ok: false, error: err.message, shouldForget: false });
    });

    const body = JSON.stringify({
      aps: {
        alert: {
          title: "Rhythm Recovery",
          body:
            tasksRemaining === 1
              ? "It's later in the day. 1 task is still open on today's list."
              : `It's later in the day. ${tasksRemaining} tasks are still open on today's list.`,
        },
        sound: "default",
      },
    });

    const req = client.request({
      ":method": "POST",
      ":path": `/3/device/${deviceToken}`,
      authorization: `bearer ${token}`,
      "apns-topic": bundleId,
      "apns-push-type": "alert",
      "content-type": "application/json",
    });

    let status = 0;
    let responseBody = "";

    req.on("response", (headers) => {
      status = Number(headers[":status"] ?? 0);
    });
    req.on("data", (chunk) => {
      responseBody += chunk;
    });
    req.on("end", () => {
      client.close();
      if (status === 200) {
        resolve({ ok: true });
      } else {
        // 410 Gone / "Unregistered" means the token is no longer valid on Apple's side —
        // the caller should delete it so the cron stops retrying it forever.
        const shouldForget = status === 410 || responseBody.includes("Unregistered");
        resolve({ ok: false, error: `APNs ${status}: ${responseBody}`, shouldForget });
      }
    });
    req.on("error", (err) => {
      client.close();
      resolve({ ok: false, error: err.message, shouldForget: false });
    });

    req.write(body);
    req.end();
  });
}
