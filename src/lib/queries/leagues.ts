import { supabase } from "@/lib/supabase";

export async function getLeagues() {
  const { data, error } = await supabase
    .from("catan_leagues")
    .select("*")
    .order("name");
  if (error) throw error;
  return data;
}

export async function getLeague(id: string) {
  const { data, error } = await supabase
    .from("catan_leagues")
    .select("*")
    .eq("id", id)
    .single();
  if (error) throw error;
  return data;
}
