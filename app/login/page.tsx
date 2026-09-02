import type { Metadata } from "next";
import LoginForm from "@/components/auth/LoginForm";

export const metadata: Metadata = {
  title: "Sign In",
};

export default function LoginPage() {
  return (
    <main id="main" className="ds-page">
      <h1 style={{ textAlign: "center" }}>Sign in</h1>
      <LoginForm />
    </main>
  );
}
