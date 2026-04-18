"use server";

import { createSupabaseServerClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

export async function updateSettingsAction(formData) {
  try {
    const supabase = await createSupabaseServerClient();

    const entries = Object.fromEntries(formData.entries());

    const updates = Object.entries(entries)
      .filter(([name]) => name.startsWith("setting__"))
      .map(([name, value]) => {
        const key = name.replace("setting__", "");
        return {
          key,
          value: value ?? "",
        };
      });

    if (!updates.length) {
      return { success: false, error: "Nessun dato da aggiornare." };
    }

    for (const item of updates) {
      const { error } = await supabase
        .from("setting")
        .update({ value: item.value })
        .eq("key", item.key);

      if (error) {
        throw new Error(error.message);
      }
    }

    revalidatePath("/manager/settings");

    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error.message || "Errore durante il salvataggio dei settings.",
    };
  }
}