import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "The terms that govern your use of Rhythm Recovery.",
};

export default function TermsPage() {
  return (
    <main id="main" className="policy">
      <h1>Terms of Service (Draft)</h1>
      <p>
        <em>
          Draft for internal review, not legal advice. Have counsel review
          before publishing.
        </em>
      </p>
      <p>
        <strong>Last updated:</strong> September 3, 2026
      </p>

      <h2>Overview</h2>
      <p>
        These terms govern your use of Rhythm Recovery (&quot;we,&quot;
        &quot;us,&quot; &quot;the service&quot;). By creating an account or
        using the service, you agree to them. If you don&apos;t agree,
        don&apos;t use the service.
      </p>

      <h2>Not Medical Advice, No Outcome Guarantee</h2>
      <p>
        Rhythm Recovery is a tracking tool. It is not a medical device, a
        treatment program, a substitute for professional medical or mental
        health care, or a substitute for a 12-step program, sponsor, or
        fellowship. It does not diagnose, treat, or claim to prevent
        relapse, and using it does not guarantee any outcome, including
        sobriety.
      </p>
      <p>
        If you are in crisis or considering harming yourself, contact the
        988 Suicide &amp; Crisis Lifeline (call or text 988) or emergency
        services immediately — not this app.
      </p>

      <h2>Eligibility</h2>
      <p>
        You must be at least [13 / 16 / 18 — pick one; consistent with the
        age in the Privacy Policy&apos;s Children&apos;s Privacy section]
        years old to create an account. Given the subject matter, this is
        worth a deliberate call rather than defaulting to the lowest legal
        minimum.
      </p>

      <h2>Your Account</h2>
      <ul>
        <li>
          You&apos;re responsible for keeping your login credentials secure
          and for all activity under your account.
        </li>
        <li>
          Provide accurate information at signup (an anonymous display name
          is expected and fine — your real email just needs to be one you
          control).
        </li>
        <li>
          One account per person. Don&apos;t create an account on someone
          else&apos;s behalf without their knowledge.
        </li>
        <li>
          We can suspend or terminate an account that violates these terms,
          including abusive behavior toward other users or attempts to
          compromise the service.
        </li>
      </ul>

      <h2>Acceptable Use</h2>
      <p>Don&apos;t use Rhythm Recovery to:</p>
      <ul>
        <li>
          Impersonate another person, or use your display name to harass or
          mislead others
        </li>
        <li>Attempt to access another user&apos;s account or data</li>
        <li>
          Interfere with, scrape, or reverse-engineer the service beyond
          what&apos;s needed for your own normal use
        </li>
        <li>Use the service for anything illegal</li>
      </ul>

      <h2>Your Content</h2>
      <p>
        Your checklist entries, journal notes, and profile information are
        yours. We store and process them only to operate the service for
        you — see the <a href="/privacy">Privacy Policy</a> for the
        specifics. We don&apos;t use your content for anything beyond
        displaying it back to you and the aggregate, non-identifying
        analytics described there.
      </p>
      <p>
        If you use a sharing feature to send a progress snapshot to someone
        else, that&apos;s your choice and your responsibility — we send what
        you select, to who you specify, and don&apos;t control what the
        recipient does with it afterward.
      </p>

      <h2>Termination</h2>
      <p>
        You can stop using the service and request account deletion at any
        time (see the Privacy Policy for how). We can suspend or terminate
        access for violating these terms, at our discretion, with notice
        where practical.
      </p>

      <h2>Disclaimers</h2>
      <p>
        The service is provided &quot;as is,&quot; without warranties of any
        kind, express or implied. We don&apos;t guarantee it will be
        uninterrupted, error-free, or available at all times.
      </p>

      <h2>Limitation of Liability</h2>
      <p>
        To the maximum extent permitted by law, Rhythm Recovery and its
        operators aren&apos;t liable for indirect, incidental, or
        consequential damages arising from your use of the service. This
        section and any liability cap amount need counsel — don&apos;t treat
        the boilerplate here as sufficient on its own.
      </p>

      <h2>Governing Law &amp; Disputes</h2>
      <p>
        [Placeholder — governing state/jurisdiction and whether disputes go
        through arbitration or courts are business/legal decisions that need
        to be made deliberately, not defaulted. Have counsel draft this
        section.]
      </p>

      <h2>Changes to These Terms</h2>
      <p>
        We&apos;ll notify users of material changes via email and update the
        &quot;Last updated&quot; date above. Continued use after a change
        means you accept the updated terms.
      </p>

      <h2>Contact</h2>
      <p>
        <a href="mailto:support@rhythmrecovery.app">support@rhythmrecovery.app</a>
      </p>
    </main>
  );
}
