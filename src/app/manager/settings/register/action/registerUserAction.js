"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@supabase/supabase-js";

export async function registerUserAction(prevState, formData) {
  try {
    const name = formData.get("name")?.toString().trim();
    const surname = formData.get("surname")?.toString().trim();
    const email = formData.get("email")?.toString().trim().toLowerCase();
    const phone = formData.get("phone")?.toString().trim();
    const role = formData.get("role")?.toString().trim();
    const password = formData.get("password")?.toString().trim();
    const confirmPassword = formData.get("confirmPassword")?.toString().trim();

    if (!name || !surname || !email || !phone || !role || !password || !confirmPassword) {
      return {
        success: false,
        message: "Compila tutti i campi.",
      };
    }

    if (password.length < 6) {
      return {
        success: false,
        message: "La password deve contenere almeno 6 caratteri.",
      };
    }

    if (password !== confirmPassword) {
      return {
        success: false,
        message: "Le password non coincidono.",
      };
    }

    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    );

    const { error } = await supabaseAdmin.auth.admin.createUser({
      email,
      phone,
      password,
      email_confirm: false,
      user_metadata: {
        name,
        surname,
        phone,
        role,
      },
    });

    if (error) {
      return {
        success: false,
        message: error.message,
      };
    }

    revalidatePath("/admin/register");

    return {
      success: true,
      message:
        "Utente creato correttamente. Deve verificare la mail prima di essere inserito nella tabella utenti.",
    };
  } catch (error) {
    return {
      success: false,
      message: error.message || "Errore durante la registrazione.",
    };
  }
}