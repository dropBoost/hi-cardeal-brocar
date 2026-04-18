"use client";

import { useActionState } from "react";
import { loginAction } from "./action/loginAction";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const initialState = {
  success: false,
  message: "",
};

export default function FormLogin() {
  const [state, formAction, pending] = useActionState(loginAction, initialState);

  return (
    <Card className="w-full max-w-md rounded-2xl">
      <CardHeader>
        <CardTitle>Login</CardTitle>
        <CardDescription>
          Accedi al gestionale con il tuo account.
        </CardDescription>
      </CardHeader>

      <CardContent>
        <form action={formAction} className="grid gap-5">
          <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="nome@email.com"
              autoComplete="email"
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              name="password"
              type="password"
              placeholder="********"
              autoComplete="current-password"
            />
          </div>

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
            {pending ? "Accesso..." : "Accedi"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}