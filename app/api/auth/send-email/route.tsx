import { render } from "@react-email/render";
import { NextResponse } from "next/server";
import { Resend } from "resend";
import { Webhook } from "standardwebhooks";
import AuthActionEmail, { getSubject, type AuthEmailType } from "@/emails/authAction";

const FROM = process.env.EMAIL_FROM || "Rhythm Recovery <onboarding@resend.dev>";

type HookPayload = {
  user: { email: string };
  email_data: {
    token_hash: string;
    redirect_to: string;
    email_action_type: AuthEmailType;
  };
};

/**
 * Supabase Auth "Send Email" hook: takes over sending every auth email
 * (signup confirmation, password reset, magic link, email change) so it
 * comes from our own domain via Resend, using our own template, instead of
 * Supabase's default sender/template. Must be registered in the Supabase
 * dashboard (Authentication -> Hooks) with a signing secret in
 * SUPABASE_AUTH_HOOK_SECRET before Supabase will call this.
 */
export async function POST(request: Request) {
  const secret = process.env.SUPABASE_AUTH_HOOK_SECRET;
  const supabaseUrl = process.env.SUPABASE_URL;
  const resendApiKey = process.env.RESEND_API_KEY;

  if (!secret || !supabaseUrl || !resendApiKey) {
    console.error(
      "[auth-email] missing SUPABASE_AUTH_HOOK_SECRET, SUPABASE_URL, or RESEND_API_KEY",
    );
    return NextResponse.json({ error: "Not configured" }, { status: 500 });
  }

  const rawBody = await request.text();
  const headers = Object.fromEntries(request.headers);

  let payload: HookPayload;
  try {
    payload = new Webhook(secret).verify(rawBody, headers) as HookPayload;
  } catch {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  const { user, email_data } = payload;
  const confirmationUrl =
    `${supabaseUrl}/auth/v1/verify?token=${email_data.token_hash}` +
    `&type=${email_data.email_action_type}&redirect_to=${encodeURIComponent(email_data.redirect_to)}`;

  const html = await render(
    <AuthActionEmail type={email_data.email_action_type} actionUrl={confirmationUrl} />,
  );

  const resend = new Resend(resendApiKey);
  const { error } = await resend.emails.send({
    from: FROM,
    to: user.email,
    subject: getSubject(email_data.email_action_type),
    html,
  });

  if (error) {
    console.error("[auth-email] Resend error:", error.message);
    return NextResponse.json({ error: "Failed to send email" }, { status: 500 });
  }

  return NextResponse.json({});
}
