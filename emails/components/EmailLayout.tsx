import {
  Body,
  Container,
  Head,
  Hr,
  Html,
  Img,
  Link,
  Preview,
  Section,
  Text,
} from "@react-email/components";
import type { ReactNode } from "react";

const SITE_URL = "https://rhythmrecovery.app";
const LOGO_URL = `${SITE_URL}/email/logo.png`;

type EmailLayoutProps = {
  preview: string;
  unsubscribeUrl?: string;
  children: ReactNode;
};

export default function EmailLayout({ preview, unsubscribeUrl, children }: EmailLayoutProps) {
  return (
    <Html lang="en">
      <Head />
      <Preview>{preview}</Preview>
      <Body style={body}>
        <Container style={container}>
          <Img src={LOGO_URL} width="160" alt="Rhythm Recovery" style={logo} />

          {children}

          <Hr style={hr} />

          <Text style={footerText}>
            Rhythm Recovery ·{" "}
            <Link href={`${SITE_URL}/privacy`} style={footerLink}>
              Privacy Policy
            </Link>
            {unsubscribeUrl && (
              <>
                {" "}
                ·{" "}
                <Link href={unsubscribeUrl} style={footerLink}>
                  Unsubscribe
                </Link>
              </>
            )}
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

const body: React.CSSProperties = {
  backgroundColor: "#ffffff",
  fontFamily:
    '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
  color: "#1a120b",
  margin: 0,
  padding: "32px 16px",
};

const container: React.CSSProperties = {
  maxWidth: "480px",
  margin: "0 auto",
};

const logo: React.CSSProperties = {
  height: "auto",
  marginBottom: "24px",
};

const hr: React.CSSProperties = {
  borderColor: "#e5e0da",
  margin: "32px 0 16px",
};

const footerText: React.CSSProperties = {
  fontSize: "13px",
  color: "#6b6157",
};

const footerLink: React.CSSProperties = {
  color: "#6b6157",
  textDecoration: "underline",
};
