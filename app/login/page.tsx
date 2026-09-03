import type { Metadata } from "next";
import { Alert } from "@/components/ui";
import LoginForm from "@/components/auth/LoginForm";

export const metadata: Metadata = {
  title: "Sign In",
};

type LoginPageProps = {
  searchParams: Promise<{ deleted?: string }>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const { deleted } = await searchParams;

  return (
    <main id="main" className="ds-page">
      <h1 style={{ textAlign: "center" }}>Sign in</h1>
      {deleted && (
        <div style={{ marginBottom: "1.5rem" }}>
          <Alert>Your account has been deleted.</Alert>
        </div>
      )}
      <LoginForm />
    </main>
  );
}
