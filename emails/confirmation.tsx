import { Text } from "@react-email/components";
import EmailLayout from "./components/EmailLayout";

export const subject = "You're registered for Rhythm Recovery";

type ConfirmationEmailProps = {
  unsubscribeUrl?: string;
};

export default function ConfirmationEmail({ unsubscribeUrl }: ConfirmationEmailProps) {
  return (
    <EmailLayout preview="We'll email you when it's ready." unsubscribeUrl={unsubscribeUrl}>
      <Text style={heading}>You&apos;re registered.</Text>
      <Text style={paragraph}>
        We&apos;ll send one email when Rhythm Recovery is ready to use. Nothing before that.
      </Text>
    </EmailLayout>
  );
}

ConfirmationEmail.PreviewProps = {
  unsubscribeUrl: "https://rhythmrecovery.app/unsubscribe?token=preview",
} satisfies ConfirmationEmailProps;

const heading: React.CSSProperties = {
  fontSize: "20px",
  fontWeight: 600,
  margin: "0 0 12px",
};

const paragraph: React.CSSProperties = {
  fontSize: "15px",
  lineHeight: "1.5",
  color: "#3d332a",
  margin: 0,
};
