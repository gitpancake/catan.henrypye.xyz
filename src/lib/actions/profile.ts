"use server";

import { getSession } from "@/lib/auth";
import { supabase } from "@/lib/supabase";
import { adminAuth } from "@/lib/firebase-admin";

export async function uploadAvatar(formData: FormData) {
  const session = await getSession();
  if (!session) throw new Error("Not authenticated");

  const file = formData.get("file") as File;
  if (!file) throw new Error("No file provided");

  // Validate file
  if (!file.type.startsWith("image/")) throw new Error("File must be an image");
  if (file.size > 5 * 1024 * 1024) throw new Error("File must be under 5MB");

  const ext = file.name.split(".").pop() ?? "jpg";
  const path = `${session.uid}.${ext}`;

  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  // Upload to Supabase Storage
  const { error: uploadError } = await supabase.storage
    .from("avatars")
    .upload(path, buffer, {
      contentType: file.type,
      upsert: true,
    });

  if (uploadError) throw uploadError;

  // Get public URL
  const { data: urlData } = supabase.storage
    .from("avatars")
    .getPublicUrl(path);

  // Update Firebase user record with the photo URL
  await adminAuth.updateUser(session.uid, {
    photoURL: urlData.publicUrl,
  });

  return { photoURL: urlData.publicUrl };
}
