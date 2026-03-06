"use server";

import { supabase } from "@/lib/supabase";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const CreateLeagueSchema = z.object({
  name: z.string().min(1).max(100),
});

export async function createLeague(input: z.infer<typeof CreateLeagueSchema>) {
  const parsed = CreateLeagueSchema.parse(input);

  const { data, error } = await supabase
    .from("catan_leagues")
    .insert({ name: parsed.name })
    .select()
    .single();

  if (error) throw error;

  revalidatePath("/dashboard");
  revalidatePath("/leagues");
  return data;
}
