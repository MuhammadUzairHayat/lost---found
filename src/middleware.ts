import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getSessionFromRequest } from "@/lib/auth/auth-edge";

const PUBLIC_PATHS = new Set([
  "/",
  "/login",
  "/signup",
  "/auth/signin",
  "/auth/signup",
]);

const PROFILE_SETUP_PATH = "/profile/setup";

/** Auth API routes that must work without an existing session. */
const PUBLIC_AUTH_API = new Set(["/api/auth/login", "/api/auth/register"]);

function isPublicAuthApi(pathname: string): boolean {
  return PUBLIC_AUTH_API.has(pathname);
}

/** Routes that require sign-in (home and auth pages are public). */
const PROTECTED_PREFIXES = [
  "/posts",
  "/profile",
  "/users",
  "/api/posts",
  "/api/users",
  "/api/notifications",
  "/dashboard",
  "/browse",
];

function isProtectedPath(pathname: string): boolean {
  if (pathname.startsWith("/post/")) return true;
  return PROTECTED_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
  );
}

function isStaticOrInternal(pathname: string): boolean {
  if (pathname.startsWith("/_next")) return true;
  if (pathname === "/favicon.ico") return true;
  if (pathname === "/sw.js") return true;
  if (pathname === "/manifest.json") return true;
  if (pathname.startsWith("/icons/")) return true;
  if (/\.(svg|png|jpg|jpeg|gif|webp|ico)$/i.test(pathname)) return true;
  return false;
}

function isPublicPath(pathname: string): boolean {
  return PUBLIC_PATHS.has(pathname);
}

function isProfileExempt(pathname: string): boolean {
  if (pathname === PROFILE_SETUP_PATH) return true;
  if (pathname.startsWith("/api/auth")) return true;
  if (pathname === "/api/auth/logout") return true;
  if (pathname.startsWith("/api/profile")) return true;
  if (pathname === "/api/upload") return true;
  return false;
}

function safeCallbackUrl(callback: string | null): string | null {
  if (
    !callback ||
    !callback.startsWith("/") ||
    callback.startsWith("//") ||
    callback.startsWith("/login") ||
    callback.startsWith("/auth/") ||
    callback === PROFILE_SETUP_PATH
  ) {
    return null;
  }
  return callback;
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (isStaticOrInternal(pathname)) {
    return NextResponse.next();
  }

  if (pathname === "/browse" || pathname.startsWith("/browse/")) {
    const url = request.nextUrl.clone();
    url.pathname = pathname.replace(/^\/browse/, "/posts");
    return NextResponse.redirect(url);
  }

  const session = await getSessionFromRequest(request);

  if (
    (pathname === "/login" ||
      pathname === "/signup" ||
      pathname === "/auth/signin" ||
      pathname === "/auth/signup") &&
    session
  ) {
    const dest = session.isProfileComplete
      ? safeCallbackUrl(request.nextUrl.searchParams.get("callbackUrl")) ??
        "/posts"
      : `/profile/setup?callbackUrl=${encodeURIComponent(
          safeCallbackUrl(request.nextUrl.searchParams.get("callbackUrl")) ??
            "/posts"
        )}`;
    return NextResponse.redirect(new URL(dest, request.url));
  }

  if (
    session &&
    !session.isProfileComplete &&
    !isProfileExempt(pathname)
  ) {
    if (pathname.startsWith("/api/")) {
      return NextResponse.json(
        {
          error: "Profile required.",
          code: "PROFILE_INCOMPLETE",
        },
        { status: 403 }
      );
    }

    const setupUrl = new URL(PROFILE_SETUP_PATH, request.url);
    setupUrl.searchParams.set(
      "callbackUrl",
      pathname + request.nextUrl.search
    );
    return NextResponse.redirect(setupUrl);
  }

  if (isPublicPath(pathname) || isPublicAuthApi(pathname)) {
    return NextResponse.next();
  }

  if (isProtectedPath(pathname)) {
    if (session) {
      if (pathname === "/profile" && !session.isProfileComplete) {
        return NextResponse.redirect(new URL(PROFILE_SETUP_PATH, request.url));
      }
      return NextResponse.next();
    }

    if (pathname.startsWith("/api/")) {
      return NextResponse.json(
        { error: "Authentication required." },
        { status: 401 }
      );
    }

    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set(
      "callbackUrl",
      pathname + request.nextUrl.search
    );
    return NextResponse.redirect(loginUrl);
  }

  if (session) {
    return NextResponse.next();
  }

  if (pathname.startsWith("/api/")) {
    return NextResponse.json(
      { error: "Authentication required." },
      { status: 401 }
    );
  }

  const loginUrl = new URL("/login", request.url);
  loginUrl.searchParams.set("callbackUrl", pathname + request.nextUrl.search);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: [
    "/",
    "/login",
    "/signup",
    "/auth/signin",
    "/auth/signup",
    "/posts",
    "/posts/:path*",
    "/profile",
    "/profile/:path*",
    "/users",
    "/users/:path*",
    "/api/users",
    "/api/users/:path*",
    "/browse",
    "/browse/:path*",
    "/dashboard",
    "/post/:path*",
    "/api/posts",
    "/api/posts/:path*",
    "/api/notifications",
    "/api/notifications/:path*",
    "/api/profile",
    "/api/profile/:path*",
    "/api/upload",
    "/api/auth/:path*",
  ],
};
