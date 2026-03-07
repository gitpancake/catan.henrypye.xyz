import { cookies, headers } from "next/headers";
import { adminAuth } from "./firebase-admin";

const SESSION_COOKIE = "firebase-token";
const MAX_AGE = 60 * 60 * 24 * 30; // 30 days

export interface SessionUser {
  uid: string;
  email: string;
  displayName: string | null;
  photoURL: string | null;
}

async function resolveToken(token: string): Promise<SessionUser | null> {
  try {
    const decoded = await adminAuth.verifyIdToken(token);
    const userRecord = await adminAuth.getUser(decoded.uid);

    return {
      uid: decoded.uid,
      email: userRecord.email ?? "",
      displayName: userRecord.displayName ?? null,
      photoURL: userRecord.photoURL ?? null,
    };
  } catch {
    return null;
  }
}

export async function getSession(): Promise<SessionUser | null> {
  // Check cookie first
  const jar = await cookies();
  const cookieToken = jar.get(SESSION_COOKIE)?.value;
  if (cookieToken) return resolveToken(cookieToken);

  // Fall back to Authorization: Bearer header (for Chrome extension)
  const hdrs = await headers();
  const authHeader = hdrs.get("authorization");
  if (authHeader?.startsWith("Bearer ")) {
    return resolveToken(authHeader.slice(7));
  }

  return null;
}

export async function setSession(idToken: string) {
  const jar = await cookies();
  jar.set(SESSION_COOKIE, idToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: MAX_AGE,
    path: "/",
  });
}

export async function clearSession() {
  const jar = await cookies();
  jar.delete(SESSION_COOKIE);
}
