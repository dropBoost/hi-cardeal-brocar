'use client'

import FormLogin from "./FormLogin";
import { useSettings } from "@/settings/settingsProvider";

export default function LoginPage() {

  const s = useSettings();
  return (
    <div className="w-full h-full bg-cover bg-center" style={{ backgroundImage: `url("${s?.homeBanner}")` }}>
      <div className="flex h-full w-full items-center justify-center bg-neutral-100 p-6 dark:bg-neutral-950/80">
        <FormLogin />
      </div>
    </div>
  );
}