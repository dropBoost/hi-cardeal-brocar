import ListAllUser from "./listUser";
import RegisterUserForm from "./registerUserForm";
import { createSupabaseAdmin } from "@/utils/supabase/admin";

export default async function PageAdminRegister() {

  async function getAuthUsers () {

  const supabase = createSupabaseAdmin();

  const { data, error } = await supabase.auth.admin.listUsers();

  if (error) {
    throw new Error(error.message);
  }

  return data.users;

  }

  const alluser = await getAuthUsers()
  const userCount = alluser.length

  console.log(alluser.length)

  return (
    <div className="flex flex-row w-full p-6 gap-4 h-full">
      <div className="basis-3/6 h-full">
        <RegisterUserForm count={userCount}/>
      </div>
      <div className="flex flex-col items-end gap-4 basis-3/6 border rounded-2xl p-5 h-full">
        <div className="flex flex-col w-full">
          <div className="flex flex-row justify-between w-full px-3">
            <span className="font-bold text-lg">LISTA UTENTI</span>
            <span className="font-bold text-lg">{userCount} / 4</span>
          </div>
          <span className="text-xs text-neutral-500 italic px-3">
            È possibile attivare un massimo di 3 utenze. Per necessità aggiuntive, contatta l’ufficio commerciale.
          </span>
        </div>
        <ListAllUser data={alluser}/>
      </div>
    </div>
  );
}