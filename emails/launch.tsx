import { Button, Text } from "@react-email/components";
import EmailLayout from "./components/EmailLayout";

export const subject = "Rhythm Recovery is ready";

type LaunchEmailProps = {
  appUrl?: string;
  unsubscribeUrl?: string;
};

export default function LaunchEmail({
  appUrl = "https://rhythmrecovery.app",
  unsubscribeUrl,
}: LaunchEmailProps) {
  return (
    <EmailLayout preview="You can start today." unsubscribeUrl={unsubscribeUrl}>
      <Text style={heading}>Rhythm Recovery is ready.</Text>
      <Text style={paragraph}>You can start your first day whenever you&apos;re ready.</Text>
      <Button href={appUrl} style={button}>
        Open Rhythm Recovery
      </Button>
    </EmailLayout>
  );
}

LaunchEmail.PreviewProps = {
  appUrl: "https://rhythmrecovery.app",
  unsubscribeUrl: "https://rhythmrecovery.app/unsubscribe?token=preview",
} satisfies LaunchEmailProps;

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
