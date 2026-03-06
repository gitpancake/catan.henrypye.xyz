import { cookies } from "next/headers";
import { adminAuth } from "./firebase-admin";
import { supabase } from "./supabase";

const SESSION_COOKIE = "firebase-token";
const MAX_AGE = 60 * 60 * 24 * 30; // 30 days

export interface SessionUser {
  id: string;
  username: string;
  isAdmin: boolean;
}

export async function getSession(): Promise<SessionUser | null> {
  const jar = await cookies();
  const token = jar.get(SESSION_COOKIE)?.value;
  if (!token) return null;

  try {
    const decoded = await adminAuth.verifyIdToken(token);

    const { data, error } = await supabase
      .from("catan_users")
      .select("id, username, is_admin")
      .eq("firebase_uid", decoded.uid)
      .single();

    if (error || !data) return null;
    return { id: data.id, username: data.username, isAdmin: data.is_admin };
  } catch {
    return null;
  }
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
