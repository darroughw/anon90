import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Page Not Found",
  robots: { index: false },
};

export default function NotFound() {
  return (
    <main id="main">
      <section className="not-found">
        <h1>This page doesn&apos;t exist.</h1>
        <p>
          <Link href="/">Back to Rhythm Recovery</Link>
        </p>
      </section>
    </main>
  );
}
