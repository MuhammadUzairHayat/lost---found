import { Suspense } from "react";
import Link from "next/link";
import { PageShapes } from "@/components/ui/PageShapes";
import { LoginForm } from "@/components/auth/LoginForm";

export default function LoginPage() {
  return (
    <div className="relative">
      <PageShapes variant="minimal" />
      <div className="relative mx-auto max-w-5xl px-4 py-10 sm:px-6 sm:py-14">
        <div className="max-w-md">
          <p className="page-eyebrow">Sign in</p>
          <h1 className="mt-2 page-title">Access your account</h1>
          <p className="mt-3 text-description">
            The home page is public. Browse posts, create listings, and manage
            your profile after signing in.
          </p>
          <div className="card mt-8 p-6 sm:p-8">
            <Suspense fallback={<p className="text-sm text-mute">Loading…</p>}>
              <LoginForm />
            </Suspense>
          </div>
          <p className="mt-6 text-xs text-mute">
            <Link
              href="/"
              className="font-medium transition-colors hover:text-ink underline-offset-2 hover:underline"
            >
              ← Back to home
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
