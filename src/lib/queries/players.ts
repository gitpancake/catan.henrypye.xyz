import { supabase } from "@/lib/supabase";

export async function getPlayers() {
  const { data, error } = await supabase
    .from("catan_players")
    .select("*")
    .order("name");
  if (error) throw error;
  return data;
}
