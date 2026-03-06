"use server";

import { supabase } from "@/lib/supabase";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const CreatePlayerSchema = z.object({
  name: z.string().min(1).max(100),
});

export async function createPlayer(input: z.infer<typeof CreatePlayerSchema>) {
  const parsed = CreatePlayerSchema.parse(input);

  const { data, error } = await supabase
    .from("catan_players")
    .insert({ name: parsed.name })
    .select()
    .single();

  if (error) throw error;

  revalidatePath("/players");
  revalidatePath("/enter-results");
  return data;
}
