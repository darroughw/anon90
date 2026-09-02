import type { Metadata } from "next";
import SignUpForm from "@/components/auth/SignUpForm";

export const metadata: Metadata = {
  title: "Create Account",
};

export default function SignUpPage() {
  return (
    <main id="main" className="ds-page">
      <h1 style={{ textAlign: "center" }}>Create your account</h1>
      <SignUpForm />
    </main>
  );
}
