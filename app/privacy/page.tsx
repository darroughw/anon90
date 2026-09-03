import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "How Rhythm Recovery collects, uses, and protects your information.",
};

export default function PrivacyPage() {
  return (
    <main id="main" className="policy">
      <h1>Privacy Policy</h1>
      <p>
        <strong>Last updated:</strong> September 3, 2026
      </p>

      <h2>Overview</h2>
      <p>
        Rhythm Recovery (&quot;we,&quot; &quot;us&quot;) helps you track
        daily activities over a 90-day period. This policy explains what
        information we collect, how we use it, and the choices you have. We
        do not sell your personal information, and we do not share it with
        third parties for their own marketing purposes.
      </p>

      <h2>Information We Collect</h2>
      <p>
        <strong>Account information</strong>
      </p>
      <ul>
        <li>Email address (for sign-in and account recovery)</li>
        <li>Google account identifier, if you sign up with Google</li>
        <li>
          Password (stored as a salted hash, we never store or can see your
          plaintext password)
        </li>
      </ul>

      <p>
        <strong>Profile information</strong>
      </p>
      <ul>
        <li>Auto-generated anonymous username (editable by you at any time)</li>
        <li>Your daily activity list and completion history</li>
        <li>Streak history and earned badges</li>
      </ul>

      <p>
        <strong>Communication preferences</strong>
      </p>
      <ul>
        <li>Reminder settings (in-app and email reminders, each on or off independently)</li>
        <li>Your timezone (used only to send reminders at the right local time)</li>
        <li>Subscriber list status (opted in or out of product-update emails)</li>
      </ul>

      <p>
        <strong>Usage analytics</strong>
      </p>
      <p>
        Aggregate, non-identifying usage data (e.g. page views) via Vercel
        Analytics, used solely to improve the product. We do not use
        analytics to build advertising profiles.
      </p>

      <h2>What We Don&apos;t Do</h2>
      <ul>
        <li>We do not sell, rent, or trade your personal information.</li>
        <li>We do not share your data with third parties for their own marketing.</li>
        <li>
          We do not retain data longer than needed to operate the product or
          as required by law.
        </li>
        <li>
          We do not use your activity content (what you&apos;re tracking)
          for anything other than displaying it back to you.
        </li>
      </ul>

      <h2>How We Use Information</h2>
      <ul>
        <li>To operate your account and the core tracking features</li>
        <li>To send reminders you&apos;ve opted into (in-app, email, or both)</li>
        <li>
          To send product-update emails, only if you&apos;ve opted in
          (unsubscribe available from account settings, and from a one-click
          link in every marketing email sent to a signed-in account)
        </li>
        <li>To improve the product via aggregate, non-identifying analytics</li>
        <li>To respond to support requests</li>
      </ul>

      <h2>Data Retention &amp; Deletion</h2>
      <ul>
        <li>Your data is retained only as long as your account is active.</li>
        <li>
          You can delete your account at any time from your profile
          settings; this immediately and permanently removes your profile,
          activity history, and preferences.
        </li>
        <li>
          Backups are purged on a rolling basis and do not persist deleted
          data indefinitely.
        </li>
      </ul>

      <h2>Third-Party Services</h2>
      <p>
        We use third-party infrastructure providers to operate the product.
        These providers process data only on our behalf, under contractual
        terms that prohibit them from using it for their own purposes:
      </p>
      <ul>
        <li>
          <strong>Supabase</strong> — authentication and the primary database
          (profiles, daily activity)
        </li>
        <li>
          <strong>Resend</strong> — sends account and reminder emails
        </li>
        <li>
          <strong>Google</strong> — &quot;Continue with Google&quot; sign-in,
          if you use it
        </li>
        <li>
          <strong>Vercel</strong> — hosting and aggregate analytics
        </li>
      </ul>

      <h2>Your Choices</h2>
      <ul>
        <li>
          Change your anonymous display name, sponsor status, and sobriety
          date at any time from your profile
        </li>
        <li>Turn in-app and email reminders on or off independently</li>
        <li>Opt in/out of product-update emails independently of reminders</li>
        <li>Delete your account at any time from your profile</li>
      </ul>

      <h2>Children&apos;s Privacy</h2>
      <p>
        This service is not directed to children under 13, and we do not
        knowingly collect information from them.
      </p>

      <h2>Changes to This Policy</h2>
      <p>
        We&apos;ll notify users of material changes via email and update the
        &quot;Last updated&quot; date above.
      </p>

      <h2>Contact</h2>
      <p>
        <a href="mailto:support@rhythmrecovery.app">support@rhythmrecovery.app</a>
      </p>
    </main>
  );
}
