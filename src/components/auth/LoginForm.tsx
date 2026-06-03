"use client";



import Link from "next/link";

import { useState } from "react";

import { useRouter, useSearchParams } from "next/navigation";
import { useProfile } from "@/components/profile/ProfileProvider";



export function LoginForm() {

  const router = useRouter();
  const { refreshProfile } = useProfile();
  const searchParams = useSearchParams();

  const [email, setEmail] = useState("");

  const [password, setPassword] = useState("");

  const [error, setError] = useState("");

  const [loading, setLoading] = useState(false);



  const callbackUrl = searchParams.get("callbackUrl") || "/posts";

  const signUpHref = `/signup?callbackUrl=${encodeURIComponent(callbackUrl)}`;



  const submit = async (e: React.FormEvent) => {

    e.preventDefault();

    setError("");

    setLoading(true);



    try {

      const res = await fetch("/api/auth/login", {

        method: "POST",

        headers: { "Content-Type": "application/json" },

        body: JSON.stringify({ email, password }),

      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Request failed");



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

    <form onSubmit={submit} className="space-y-5">

      <label className="field-label">
        Email
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoComplete="email"
          required
          className="field-input"
        />
      </label>
      <label className="field-label">
        Password
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="current-password"
          required
          className="field-input"
        />
      </label>



      {error && <p className="text-error">{error}</p>}



      <button

        type="submit"

        disabled={loading}

        className="btn-primary"

      >

        {loading ? "Please wait…" : "Sign in"}

      </button>



      <p className="text-xs text-mute">

        No account?{" "}

        <Link

          href={signUpHref}

          className="underline underline-offset-2 hover:text-ink"

        >

          Create an account

        </Link>

      </p>



      <p className="text-[10px] text-mute border-t border-line pt-4">

        Demo: <span className="font-mono">demo@example.com</span> /{" "}

        <span className="font-mono">demo123</span>

      </p>

    </form>

  );

}


