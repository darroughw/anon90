import { NextResponse } from "next/server";
import { appendSignupRow } from "@/lib/googleSheets";
import { sendConfirmationEmail } from "@/lib/sendEmail";
import { verifyGoogleIdToken } from "@/lib/verifyGoogleToken";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);

  if (!body?.consent) {
    return NextResponse.json({ error: "Invalid submission" }, { status: 400 });
  }

  let email: string | null = null;
  let source: "email" | "google" = "email";

  if (typeof body.idToken === "string") {
    email = await verifyGoogleIdToken(body.idToken);
    source = "google";
  } else if (typeof body.email === "string" && EMAIL_RE.test(body.email)) {
    email = body.email;
  }

  if (!email) {
    return NextResponse.json({ error: "Invalid submission" }, { status: 400 });
  }

  try {
    await appendSignupRow({ email, source });
  } catch (error) {
    console.error("[subscribe] failed to record signup in Sheets:", error);
  }

  try {
    await sendConfirmationEmail(email);
  } catch (error) {
    console.error("[subscribe] failed to send confirmation email:", error);
  }

  console.log(`[subscribe] new signup (${source}):`, email);

  return NextResponse.json({ ok: true });
}
