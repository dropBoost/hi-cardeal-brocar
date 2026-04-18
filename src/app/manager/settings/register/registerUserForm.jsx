"use client";

import { useActionState, useState } from "react";
import { registerUserAction } from "./action/registerUserAction";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const initialState = {
  success: false,
  message: "",
};

export default function RegisterUserForm({count}) {
  const [state, formAction, pending] = useActionState(
    registerUserAction,
    initialState
  );

  const [role, setRole] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [clientError, setClientError] = useState("");

  function handleSubmit(e) {
    setClientError("");
    
    if (count > 4) {
      e.preventDefault();
      setClientError("Hai raggiunto il numero di licenze disponibili.");
      return;
    }
    
    if (!role) {
      e.preventDefault();
      setClientError("Seleziona un ruolo.");
      return;
    }

    if (!password || !confirmPassword) {
      e.preventDefault();
      setClientError("Inserisci password e conferma password.");
      return;
    }

    if (password.length < 6) {
      e.preventDefault();
      setClientError("La password deve contenere almeno 6 caratteri.");
      return;
    }

    if (password !== confirmPassword) {
      e.preventDefault();
      setClientError("Le password non coincidono.");
      return;
    }
  }

  return (
    <Card className="rounded-2xl shadow-sm h-full">
      <CardHeader>
        <CardTitle>Registrazione utente</CardTitle>
        <CardDescription>
          Crea un utente in Supabase Auth. Dopo la verifica email verrà inserito
          nella tabella utenti.
        </CardDescription>
      </CardHeader>

      <CardContent>
        <form action={formAction} onSubmit={handleSubmit} className="grid gap-5">
          <div className="grid gap-2">
            <Label htmlFor="name">Nome</Label>
            <Input id="name" name="name" placeholder="Mario" />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="surname">Cognome</Label>
            <Input id="surname" name="surname" placeholder="Rossi" />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="mario@email.com"
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="phone">Telefono</Label>
            <Input id="phone" name="phone" placeholder="+39 333 1234567" />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="role">Ruolo</Label>
            <RoleSelect value={role} onChange={setRole} />
            <input type="hidden" name="role" value={role} />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              name="password"
              type="password"
              placeholder="Inserisci password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="confirmPassword">Conferma password</Label>
            <Input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              placeholder="Ripeti password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </div>

          {clientError ? (
            <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-700 dark:text-red-400">
              {clientError}
            </div>
          ) : null}

          {state?.message ? (
            <div
              className={`rounded-xl border px-4 py-3 text-sm ${
                state.success
                  ? "border-green-500/30 bg-green-500/10 text-green-700 dark:text-green-400"
                  : "border-red-500/30 bg-red-500/10 text-red-700 dark:text-red-400"
              }`}
            >
              {state.message}
            </div>
          ) : null}

          <Button type="submit" disabled={pending}>
            {pending ? "Registrazione..." : "Registra utente"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

function RoleSelect({ value, onChange }) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className="w-full">
        <SelectValue placeholder="Seleziona ruolo" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="admin">admin</SelectItem>
      </SelectContent>
    </Select>
  );
}