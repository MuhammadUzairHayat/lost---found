import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-24 text-center sm:py-32">
      <p className="page-eyebrow">404</p>
      <h1 className="mt-2 page-title">Page not found</h1>
      <p className="mt-3 text-description">
        This post or page does not exist.
      </p>
      <Link href="/" className="btn-primary mt-8">
        Go home
      </Link>
    </div>
  );
}
