import { AppSidebar } from "@/components/app-sidebar"
import BreadcrumbCOMP from "@/components/breadcrumbComp";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { TooltipProvider } from "@/components/ui/tooltip";
import { createSupabaseServerClient } from "@/utils/supabase/server";
import { getSetting } from "@/lib/setting";

export default async function MANAGERlayout({children}) {

  const supabase = await createSupabaseServerClient();
  const settings = await getSetting()

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) { redirect(`/admin/login`) }
  
  const { data: profilo, error } = await supabase
    .from("utenti")
    .select("*")
    .eq("uuid", user.id)
    .maybeSingle();

  if (error) {
    console.log(error);
  }

  return (
    <TooltipProvider>
    <SidebarProvider>
      <AppSidebar profilo={profilo} settings={settings}/>
      <SidebarInset>
        <BreadcrumbCOMP/>
        <main className="flex flex-1 flex-col gap-4 p-4 pt-0">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
    </TooltipProvider>
  );
}
