import { createSupabaseServerClient } from "@/utils/supabase/server";
import FormSettings from "./components/FormSettings";

export default async function PAGESettings() {


  const supabase = await createSupabaseServerClient();

  const { data: { user } } = await supabase.auth.getUser();

  const superadmin = user?.email === "dev@dropboost.it"

  const { data, error } = await supabase
    .from("setting")
    .select("key, value")
    .order("key", { ascending: true });

  if (error) {
    throw new Error(error.message);
  }
  console.log(user)
  return (
    <div className="flex w-full flex-col gap-6 p-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">Settings</h1>
        <p className="text-sm text-muted-foreground">
          Gestione impostazioni e configurazioni avanzate
        </p>
      </div>

      {superadmin ? <FormSettings initialSettings={data || []}/> : 
      <div className="bg-muted p-10 rounded-2xl">
        <span>
          <font className="font-bold">{user?.user_metadata?.name || "Utente"}</font>, non sei autorizzato a modificare le impostazioni.
        </span>
        <p>
          Contatta il servizio di assistenza per richiedere le modifiche di cui hai bisogno.
        </p>
        <p>
          Il nostro staff sarà a tua disposizione per aiutarti e rendere la piattaforma sempre più adatta alle tue esigenze.
        </p>
        
      </div>
      }
    </div>
  );
}