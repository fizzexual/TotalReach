import { NextResponse, type NextRequest } from "next/server";
import { jwtVerify } from "jose";

const COOKIE_NAME = "tr_session";

function getSecret() {
  return new TextEncoder().encode(
    process.env.AUTH_SECRET || "dev-insecure-secret-change-me",
  );
}

const AUTH_PAGES = ["/login", "/register"];

async function isValidToken(token?: string) {
  if (!token) return false;
  try {
    await jwtVerify(token, getSecret());
    return true;
  } catch {
    return false;
  }
}

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const token = req.cookies.get(COOKIE_NAME)?.value;
  const valid = await isValidToken(token);

  // Auth pages are always accessible. (Never redirect away from them — a
  // signature-valid token whose user no longer exists would otherwise cause
  // an infinite /login <-> /companies redirect loop.)
  if (AUTH_PAGES.includes(pathname)) {
    return NextResponse.next();
  }

  // The root page decides where to send the user.
  if (pathname === "/") return NextResponse.next();

  if (!valid) {
    const url = req.nextUrl.clone();
    url.pathname = "/login";
    url.search = `?next=${encodeURIComponent(pathname)}`;
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)"],
};
