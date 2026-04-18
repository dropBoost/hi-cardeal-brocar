import "server-only";
import { cache } from "react";
import { createSupabaseServerClient } from "@/utils/supabase/server";

// legge tutta la tabella setting e la trasforma in oggetto { key: value }
export const getSettings = cache(async () => {
  const supabase = await createSupabaseServerClient();

  const { data, error } = await supabase
    .from("setting")
    .select("key,value");

  if (error) throw new Error(error.message);

  const settings = Object.fromEntries(
    (data || []).map((r) => [r.key, r.value])
  );

  return settings;
});

// helper comodo: getSetting("brand_color")
export async function getSetting(k) {
  const s = await getSettings();
  return s?.[k] ?? null;
}