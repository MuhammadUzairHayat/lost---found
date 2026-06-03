import Link from "next/link";

export function ProfileRequiredNotice() {
  return (
    <div className="rounded-2xl border border-line bg-paper p-6 max-w-md">
      <p className="text-sm font-semibold">Profile Required</p>
      <p className="mt-2 text-sm text-mute leading-relaxed">
        You need to complete your profile before using this feature.
      </p>
      <ul className="mt-4 text-xs text-mute space-y-1 list-disc list-inside">
        <li>Full Name</li>
        <li>Student ID (Format: FA24-BSCS-0295)</li>
        <li>Department</li>
        <li>Contact Method & Details</li>
      </ul>
      <p className="mt-3 text-xs text-mute">Optional: Bio, Profile Picture</p>
      <Link
        href="/profile/setup"
        className="mt-5 inline-block rounded-full bg-ink text-paper px-5 py-2 text-sm"
      >
        Complete Profile Now
      </Link>
    </div>
  );
}
