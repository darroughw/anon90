import Link from "next/link";

export default function HomePage() {
  return (
    <main id="main">
      <section className="hero">
        <h1 className="visually-hidden">Rhythm Recovery</h1>
        <p className="mission">
          Recovery isn&apos;t one decision. It&apos;s a rhythm you rebuild one
          day at a time. Rhythm Recovery gives you a place to track the daily
          commitments many people lean on in recovery: prayer, meetings,
          calls to your sponsor, calls to your fellowship. Paired with
          working the steps, it&apos;s built to help you keep that rhythm,
          one day at a time, through the first 90 days and beyond.
        </p>
      </section>

      <section className="signup" aria-label="Get started">
        <h2>Get started</h2>
        <Link href="/signup" className="ds-button ds-button--primary ds-button--block">
          Create your account
        </Link>
        <p className="hint" style={{ textAlign: "center", marginTop: "1rem" }}>
          Already have an account? <Link href="/login">Sign in</Link>
        </p>
      </section>
    </main>
  );
}
