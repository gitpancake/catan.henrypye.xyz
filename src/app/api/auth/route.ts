import { getSession, setSession, clearSession } from "@/lib/auth";
import { adminAuth } from "@/lib/firebase-admin";
import { supabase } from "@/lib/supabase";

export async function POST(req: Request) {
  const { idToken } = (await req.json()) as { idToken?: string };

  if (!idToken) {
    return Response.json({ error: "Missing token" }, { status: 400 });
  }

  try {
    const decoded = await adminAuth.verifyIdToken(idToken);

    const { data: user, error } = await supabase
      .from("catan_users")
      .select("id, username, is_admin")
      .eq("firebase_uid", decoded.uid)
      .single();

    if (error || !user) {
      return Response.json({ error: "User not found" }, { status: 401 });
    }

    await setSession(idToken);
    return Response.json({
      ok: true,
      userId: user.id,
      username: user.username,
      isAdmin: user.is_admin,
    });
  } catch {
    return Response.json({ error: "Invalid token" }, { status: 401 });
  }
}

export async function GET() {
  const session = await getSession();
  if (!session) {
    return Response.json({ authenticated: false });
  }
  return Response.json({
    authenticated: true,
    userId: session.id,
    username: session.username,
    isAdmin: session.isAdmin,
  });
}

export async function DELETE() {
  await clearSession();
  return Response.json({ ok: true });
}
