import type { Metadata } from "next";
import DesignSystemDemo from "./DesignSystemDemo";

export const metadata: Metadata = {
  title: "Design System",
  robots: { index: false },
};

export default function DesignSystemPage() {
  return (
    <main id="main" className="ds-page">
      <h1>Rhythm Recovery — Design System</h1>
      <p className="hint">Internal component reference. Not linked from the site.</p>
      <DesignSystemDemo />
    </main>
  );
}
