import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import "./globals.css";

const siteUrl = "https://rhythmrecovery.app";
const description =
  "Rhythm Recovery is a daily habit tracker that pairs fixed recovery commitments with the 12 steps, built to help you keep that rhythm one day at a time.";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Rhythm Recovery — Coming Soon",
    template: "%s — Rhythm Recovery",
  },
  description,
  openGraph: {
    type: "website",
    title: "Rhythm Recovery — Coming Soon",
    description,
    url: siteUrl,
    siteName: "Rhythm Recovery",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Rhythm Recovery",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Rhythm Recovery — Coming Soon",
    description,
    images: ["/og-image.png"],
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "Rhythm Recovery",
  url: siteUrl,
  logo: `${siteUrl}/assets/logo/rhythm-recovery.svg`,
  description,
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body>
        <a className="skip-link" href="#main">
          Skip to content
        </a>

        <header className="site-header">
          <Link href="/">
            <Image
              className="logo"
              src="/assets/logo/rhythm-recovery.svg"
              alt="Rhythm Recovery"
              width={230}
              height={163}
              priority
            />
          </Link>
        </header>

        {children}

        <footer className="site-footer">
          <Link href="/privacy">Privacy Policy</Link>
        </footer>
      </body>
    </html>
  );
}
