export const dynamic = "force-dynamic";

import { PageShapes } from "@/components/ui/PageShapes";
import { NewPostForm } from "@/components/post/NewPostForm";

export default function NewPostPage() {
  return (
    <div className="relative">
      <PageShapes />
      <div className="relative mx-auto max-w-5xl px-4 py-10 sm:px-6">
        <h1 className="text-2xl font-semibold tracking-tight">Create post</h1>
        <p className="mt-2 text-sm text-mute max-w-md">
          Lost or found — pick a category, add details, and set how people can
          reach you.
        </p>
        <NewPostForm />
      </div>
    </div>
  );
}
