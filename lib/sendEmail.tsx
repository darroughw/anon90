import { render } from "@react-email/render";
import { Resend } from "resend";
import ConfirmationEmail, { subject as confirmationSubject } from "@/emails/confirmation";

const FROM = process.env.EMAIL_FROM || "Rhythm Recovery <onboarding@resend.dev>";

function getClient(): Resend | null {
  const apiKey = process.env.RESEND_API_KEY;
  return apiKey ? new Resend(apiKey) : null;
}

export async function sendConfirmationEmail(to: string): Promise<void> {
  const resend = getClient();

  if (!resend) {
    console.warn("[email] RESEND_API_KEY not set, skipping confirmation email to", to);
    return;
  }

  const html = await render(<ConfirmationEmail />);

  const { error } = await resend.emails.send({
    from: FROM,
    to,
    subject: confirmationSubject,
    html,
  });

  if (error) {
    throw new Error(`Resend error: ${error.message}`);
  }
}
