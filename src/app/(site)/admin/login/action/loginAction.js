"use server";

import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/utils/supabase/server";

export async function loginAction(prevState, formData) {
  const email = formData.get("email")?.toString().trim().toLowerCase();
  const password = formData.get("password")?.toString().trim();

  if (!email || !password) {
    return {
      success: false,
      message: "Inserisci email e password.",
    };
  }

  const supabase = await createSupabaseServerClient();

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return {
      success: false,
      message: error.message,
    };
  }

  redirect("/manager");
}