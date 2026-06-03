import { Suspense } from "react";
import Link from "next/link";
import { PageShapes } from "@/components/ui/PageShapes";
import { RegisterForm } from "@/components/auth/RegisterForm";

export default function SignUpPage() {
  return (
    <div className="relative">
      <PageShapes variant="minimal" />
      <div className="relative mx-auto max-w-5xl px-4 py-10 sm:px-6 sm:py-14">
        <div className="max-w-md">
          <p className="page-eyebrow">Register</p>
          <h1 className="mt-2 page-title">Create your account</h1>
          <p className="mt-3 text-description">
            Use a valid email and a strong password. After signing up you will
            complete your campus profile before browsing or posting.
          </p>
          <div className="card mt-8 p-6 sm:p-8">
            <Suspense fallback={<p className="text-sm text-mute">Loading…</p>}>
              <RegisterForm />
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
