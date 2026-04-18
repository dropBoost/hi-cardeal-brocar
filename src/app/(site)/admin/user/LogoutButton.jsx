import { logoutAction } from "./logoutAction";
import { FiLogOut } from "react-icons/fi";

export default function LogoutButton() {
  return (
    <form action={logoutAction}>
      <button className="flex flex-row items-center gap-2 rounded-xl text-sm font-medium">
        <FiLogOut /> Logout
      </button>
    </form>
  );
}