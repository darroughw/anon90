import type { Metadata } from "next";
import ForgotPasswordForm from "@/components/auth/ForgotPasswordForm";

export const metadata: Metadata = {
  title: "Reset Your Password",
  robots: { index: false },
};

export default function ForgotPasswordPage() {
  return (
    <main id="main" className="ds-page">
      <h1 style={{ textAlign: "center" }}>Reset your password</h1>
      <ForgotPasswordForm />
    </main>
  );
}
