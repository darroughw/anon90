import { Button, Text } from "@react-email/components";
import EmailLayout from "./components/EmailLayout";

export type AuthEmailType = "signup" | "recovery" | "magiclink" | "email_change" | "invite";

const COPY: Record<AuthEmailType, { subject: string; heading: string; body: string; cta: string }> = {
  signup: {
    subject: "Confirm your email",
    heading: "Confirm your email.",
    body: "Click below to confirm your email and finish setting up your account.",
    cta: "Confirm email",
  },
  recovery: {
    subject: "Reset your password",
    heading: "Reset your password.",
    body: "Click below to set a new password. If you didn't ask for this, you can ignore this email.",
    cta: "Reset password",
  },
  magiclink: {
    subject: "Sign in to Rhythm Recovery",
    heading: "Sign in.",
    body: "Click below to sign in to Rhythm Recovery.",
    cta: "Sign in",
  },
  email_change: {
    subject: "Confirm your new email address",
    heading: "Confirm your new email address.",
    body: "Click below to confirm this is your new email address.",
    cta: "Confirm new email",
  },
  invite: {
    subject: "You're invited to Rhythm Recovery",
    heading: "You're invited.",
    body: "Click below to set up your account.",
    cta: "Set up account",
  },
};

export function getSubject(type: AuthEmailType): string {
  return COPY[type].subject;
}

type AuthActionEmailProps = {
  type: AuthEmailType;
  actionUrl: string;
};

export default function AuthActionEmail({ type, actionUrl }: AuthActionEmailProps) {
  const copy = COPY[type];

  return (
    <EmailLayout preview={copy.heading}>
      <Text style={heading}>{copy.heading}</Text>
      <Text style={paragraph}>{copy.body}</Text>
      <Button href={actionUrl} style={button}>
        {copy.cta}
      </Button>
    </EmailLayout>
  );
}

AuthActionEmail.PreviewProps = {
  type: "signup",
  actionUrl: "https://rhythmrecovery.app",
} satisfies AuthActionEmailProps;

const heading: React.CSSProperties = {
  fontSize: "20px",
  fontWeight: 600,
  margin: "0 0 12px",
};

const paragraph: React.CSSProperties = {
  fontSize: "15px",
  lineHeight: "1.5",
  color: "#3d332a",
  margin: "0 0 24px",
};

const button: React.CSSProperties = {
  backgroundColor: "#1a120b",
  color: "#f2e9dd",
  fontSize: "15px",
  fontWeight: 600,
  textDecoration: "none",
  padding: "12px 24px",
  borderRadius: "4px",
  display: "inline-block",
};
