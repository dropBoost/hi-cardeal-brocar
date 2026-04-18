"use client";

import { useState, useTransition } from "react";
import { updateSettingsAction } from "../action/updateSettingsAction";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export default function FormSettings({ initialSettings }) {
  const [isPending, startTransition] = useTransition();
  const [msg, setMsg] = useState(null);
  const [formValues, setFormValues] = useState(() => {
    const values = {};
    initialSettings.forEach((item) => {
      values[item.key] = item.value ?? "";
    });
    return values;
  });

  function handleChange(key, value) {
    setFormValues((prev) => ({
      ...prev,
      [key]: value,
    }));
  }

  function formatLabel(value) {
    if (!value) return "";
    return value
      .replace(/[_-]/g, " ")
      .replace(/\b\w/g, (char) => char.toUpperCase());
  }

  function isTextareaField(key, value) {
    const k = key?.toLowerCase() || "";
    const longKeys = [
      "description",
      "meta_description",
      "footer",
      "about",
      "text",
      "address",
      "privacy",
      "terms",
    ];

    if ((value ?? "").length > 100) return true;

    return longKeys.some((item) => k.includes(item));
  }

  function handleSubmit(formData) {
    setMsg(null);

    startTransition(async () => {
      const res = await updateSettingsAction(formData);

      if (res?.success) {
        setMsg({
          type: "success",
          text: "Impostazioni aggiornate con successo.",
        });
      } else {
        setMsg({
          type: "error",
          text: res?.error || "Errore durante il salvataggio.",
        });
      }
    });
  }

  return (
    <Card className="w-full border-border/60 shadow-sm">
      <CardHeader>
        <CardTitle>Impostazioni</CardTitle>
        <CardDescription>
          Modifica i valori presenti nella tabella setting.
        </CardDescription>
      </CardHeader>

      <CardContent>
        <form action={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {initialSettings?.map((item) => (
              <div key={item.key} className="space-y-2">
                <Label htmlFor={`setting-${item.key}`}>
                  {formatLabel(item.key)}
                </Label>

                {isTextareaField(item.key, formValues[item.key]) ? (
                  <Textarea
                    id={`setting-${item.key}`}
                    name={`setting__${item.key}`}
                    value={formValues[item.key] ?? ""}
                    onChange={(e) => handleChange(item.key, e.target.value)}
                    className="min-h-[120px]"
                  />
                ) : (
                  <Input
                    id={`setting-${item.key}`}
                    name={`setting__${item.key}`}
                    value={formValues[item.key] ?? ""}
                    onChange={(e) => handleChange(item.key, e.target.value)}
                  />
                )}

                <p className="text-xs text-muted-foreground">
                  key: {item.key}
                </p>
              </div>
            ))}
          </div>

          {msg && (
            <div
              className={`rounded-md border px-4 py-3 text-sm ${
                msg.type === "success"
                  ? "border-green-500/30 bg-green-500/10 text-green-700 dark:text-green-400"
                  : "border-red-500/30 bg-red-500/10 text-red-700 dark:text-red-400"
              }`}
            >
              {msg.text}
            </div>
          )}

          <div className="flex justify-end">
            <Button type="submit" disabled={isPending}>
              {isPending ? "Salvataggio..." : "Salva impostazioni"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}