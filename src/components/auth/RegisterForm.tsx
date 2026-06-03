"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useProfile } from "@/components/profile/ProfileProvider";
import { useMemo, useState } from "react";
import {
  PASSWORD_REQUIREMENTS,
  type RegisterValidationErrors,
  validateRegisterInput,
} from "@/lib/validation/auth";

function fieldClass(hasError: boolean) {
  return `field-input ${hasError ? "field-error" : ""}`;
}

export function RegisterForm() {
  const router = useRouter();
  const { refreshProfile } = useProfile();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState<RegisterValidationErrors>({});
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const callbackUrl = searchParams.get("callbackUrl") || "/posts";
  const signInHref = `/login?callbackUrl=${encodeURIComponent(callbackUrl)}`;

  const requirementStatus = useMemo(
    () =>
      PASSWORD_REQUIREMENTS.map((req) => ({
        ...req,
        met: req.test(password),
      })),
    [password]
  );

  const validateField = (field: "email" | "password" | "confirmPassword") => {
    const next = validateRegisterInput({ email, password, confirmPassword });
    setErrors((prev) => {
      const updated = { ...prev };
      if (next[field]) updated[field] = next[field]!;
      else delete updated[field];
      return updated;
    });
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setTouched({ email: true, password: true, confirmPassword: true });

    const validation = validateRegisterInput({
      email,
      password,
      confirmPassword,
    });
    if (Object.keys(validation).length > 0) {
      setErrors(validation);
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();

      if (!res.ok) {
        if (data.errors && typeof data.errors === "object") {
          setErrors(data.errors as RegisterValidationErrors);
          return;
        }
        throw new Error(data.error || "Registration failed");
      }

      const dest = data.user?.isProfileComplete
        ? callbackUrl
        : `/profile/setup?callbackUrl=${encodeURIComponent(callbackUrl)}`;

      await refreshProfile();
      router.push(dest);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={submit} className="space-y-5" noValidate>
      <label className="field-label">
        Email
        <input
          type="email"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            if (touched.email) validateField("email");
          }}
          onBlur={() => {
            setTouched((t) => ({ ...t, email: true }));
            validateField("email");
          }}
          autoComplete="email"
          inputMode="email"
          spellCheck={false}
          className={fieldClass(!!errors.email)}
        />
        {errors.email && (
          <p className="mt-1 text-error">{errors.email}</p>
        )}
      </label>

      <label className="field-label">
        Password
        <input
          type="password"
          value={password}
          onChange={(e) => {
            setPassword(e.target.value);
            if (touched.password) validateField("password");
            if (touched.confirmPassword) validateField("confirmPassword");
          }}
          onBlur={() => {
            setTouched((t) => ({ ...t, password: true }));
            validateField("password");
          }}
          autoComplete="new-password"
          className={fieldClass(!!errors.password)}
        />
        {errors.password && (
          <p className="mt-1 text-error">{errors.password}</p>
        )}
        {password.length > 0 && (
          <ul className="mt-2 space-y-1" aria-label="Password requirements">
            {requirementStatus.map((req) => (
              <li
                key={req.id}
                className={`text-[11px] ${
                  req.met ? "text-ink font-medium" : "text-mute"
                }`}
              >
                <span aria-hidden="true">{req.met ? "✓" : "○"}</span>{" "}
                {req.label}
              </li>
            ))}
          </ul>
        )}
      </label>

      <label className="field-label">
        Confirm password
        <input
          type="password"
          value={confirmPassword}
          onChange={(e) => {
            setConfirmPassword(e.target.value);
            if (touched.confirmPassword) validateField("confirmPassword");
          }}
          onBlur={() => {
            setTouched((t) => ({ ...t, confirmPassword: true }));
            validateField("confirmPassword");
          }}
          autoComplete="new-password"
          className={fieldClass(!!errors.confirmPassword)}
        />
        {errors.confirmPassword && (
          <p className="mt-1 text-error">{errors.confirmPassword}</p>
        )}
      </label>

      {error && <p className="text-error">{error}</p>}

      <button
        type="submit"
        disabled={loading}
        className="btn-primary"
      >
        {loading ? "Creating account…" : "Create account"}
      </button>

      <p className="text-xs text-mute">
        Already have an account?{" "}
        <Link
          href={signInHref}
          className="underline underline-offset-2 hover:text-ink"
        >
          Sign in
        </Link>
      </p>
    </form>
  );
}
