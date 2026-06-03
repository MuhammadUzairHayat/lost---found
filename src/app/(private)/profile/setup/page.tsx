import { Suspense } from "react";
import { PageShapes } from "@/components/ui/PageShapes";
import { ProfileSetupForm } from "@/components/profile/ProfileSetupForm";

export default function ProfileSetupPage() {
  return (
    <div className="relative">
      <PageShapes variant="minimal" />
      <div className="relative mx-auto max-w-5xl px-4 py-10 sm:px-6">
        <h1 className="text-2xl font-semibold tracking-tight">
          Complete Your Profile
        </h1>
        <p className="mt-2 text-sm text-mute">
          Please fill all required fields to continue
        </p>
        <Suspense fallback={<p className="mt-8 text-sm text-mute">Loading…</p>}>
          <ProfileSetupForm />
        </Suspense>
      </div>
    </div>
  );
}
