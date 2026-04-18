"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import {
  ArrowLeft,
  Eye,
  EyeOff,
  ImagePlus,
  Loader2,
  Trash2,
  Upload,
  Images,
  Star,
} from "lucide-react";

import { createSupabaseBrowserClient } from "@/utils/supabase/client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Label } from "@/components/ui/label";

const BUCKET_NAME = "veicoli";

function MediaSkeletonCard() {
  return (
    <Card className="overflow-hidden rounded-2xl">
      <div className="aspect-4/3 w-full">
        <Skeleton className="h-full w-full" />
      </div>
      <CardContent className="space-y-3 p-4">
        <Skeleton className="h-4 w-2/3" />
        <Skeleton className="h-10 w-full rounded-xl" />
        <Skeleton className="h-10 w-full rounded-xl" />
        <Skeleton className="h-10 w-full rounded-xl" />
      </CardContent>
    </Card>
  );
}

function getFileExtension(filename) {
  const parts = filename.split(".");
  return parts.length > 1 ? parts.pop().toLowerCase() : "";
}

function createSafeFileName(fileName) {
  const extension = getFileExtension(fileName);
  const baseName = fileName
    .replace(/\.[^/.]+$/, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  const unique = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  return `${baseName || "immagine"}-${unique}.${extension || "jpg"}`;
}

function getPathFromUrl(url) {
  if (!url) return null;

  const marker = `/storage/v1/object/public/${BUCKET_NAME}/`;
  const index = url.indexOf(marker);

  if (index === -1) return null;

  return url.slice(index + marker.length);
}

export default function GestioneMediaVeicolo({ idveicolo }) {
  const inputRef = useRef(null);

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [busyId, setBusyId] = useState(null);

  useEffect(() => {
    if (!idveicolo) return;
    fetchMedia();
  }, [idveicolo]);

  async function fetchMedia() {
    try {
      setLoading(true);

      const supabase = createSupabaseBrowserClient();

      const { data, error } = await supabase
        .from("veicolo_media")
        .select("*")
        .eq("id_veicolo", idveicolo)
        .order("principale", { ascending: false })
        .order("ordine", { ascending: true })
        .order("created_at", { ascending: false });

      if (error) throw error;

      setItems(data || []);
    } catch (error) {
      console.error(error);
      toast.error("Errore durante il caricamento dei media");
      setItems([]);
    } finally {
      setLoading(false);
    }
  }

  async function getNextOrdine() {
    const supabase = createSupabaseBrowserClient();

    const { data, error } = await supabase
      .from("veicolo_media")
      .select("ordine")
      .eq("id_veicolo", idveicolo)
      .order("ordine", { ascending: false })
      .limit(1);

    if (error) {
      console.error(error);
      return 0;
    }

    return data?.length ? Number(data[0].ordine || 0) + 1 : 0;
  }

  async function handleFileChange(e) {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    try {
      setUploading(true);

      const supabase = createSupabaseBrowserClient();
      let nextOrdine = await getNextOrdine();

      for (const file of files) {
        if (!file.type.startsWith("image/")) {
          toast.error(`Il file ${file.name} non è un'immagine valida`);
          continue;
        }

        const safeName = createSafeFileName(file.name);
        const filePath = `${idveicolo}/${safeName}`;

        const { error: uploadError } = await supabase.storage
          .from(BUCKET_NAME)
          .upload(filePath, file, {
            cacheControl: "3600",
            upsert: false,
          });

        if (uploadError) {
          console.error(uploadError);
          toast.error(`Errore upload file: ${file.name}`);
          continue;
        }

        const { data: publicUrlData } = supabase.storage
          .from(BUCKET_NAME)
          .getPublicUrl(filePath);

        const publicUrl = publicUrlData?.publicUrl || null;

        const isFirstImage = items.length === 0 && nextOrdine === 0;

        const { error: insertError } = await supabase
          .from("veicolo_media")
          .insert({
            id_veicolo: idveicolo,
            url: publicUrl,
            alt_text: file.name,
            ordine: nextOrdine,
            principale: isFirstImage,
            is_active: true,
          });

        if (insertError) {
          console.error(insertError);
          toast.error(`Errore salvataggio DB: ${file.name}`);
          continue;
        }

        nextOrdine += 1;
      }

      toast.success("Upload completato");
      await fetchMedia();
    } catch (error) {
      console.error(error);
      toast.error("Errore durante il caricamento dei file");
    } finally {
      setUploading(false);
      if (inputRef.current) {
        inputRef.current.value = "";
      }
    }
  }

  async function handleToggleActive(item) {
    try {
      setBusyId(item.id);

      const supabase = createSupabaseBrowserClient();

      const { error } = await supabase
        .from("veicolo_media")
        .update({ is_active: !item.is_active })
        .eq("id", item.id);

      if (error) throw error;

      setItems((prev) =>
        prev.map((media) =>
          media.id === item.id
            ? { ...media, is_active: !media.is_active }
            : media
        )
      );

      toast.success("Visibilità aggiornata");
    } catch (error) {
      console.error(error);
      toast.error("Errore durante l'aggiornamento della visibilità");
    } finally {
      setBusyId(null);
    }
  }

  async function handleSetPrincipale(item) {
    try {
      setBusyId(item.id);

      const supabase = createSupabaseBrowserClient();

      const { error: resetError } = await supabase
        .from("veicolo_media")
        .update({ principale: false })
        .eq("id_veicolo", idveicolo);

      if (resetError) throw resetError;

      const { error: setError } = await supabase
        .from("veicolo_media")
        .update({ principale: true })
        .eq("id", item.id);

      if (setError) throw setError;

      setItems((prev) =>
        prev.map((media) => ({
          ...media,
          principale: media.id === item.id,
        }))
      );

      toast.success("Immagine principale aggiornata");
    } catch (error) {
      console.error(error);
      toast.error("Errore durante l'aggiornamento dell'immagine principale");
    } finally {
      setBusyId(null);
    }
  }

  async function handleDelete(item) {
    const conferma = window.confirm("Vuoi eliminare definitivamente questa immagine?");
    if (!conferma) return;

    try {
      setBusyId(item.id);

      const supabase = createSupabaseBrowserClient();

      const filePath = getPathFromUrl(item.url);

      if (filePath) {
        const { error: storageError } = await supabase.storage
          .from(BUCKET_NAME)
          .remove([filePath]);

        if (storageError) {
          console.error(storageError);
        }
      }

      const wasPrincipale = item.principale;

      const { error: deleteError } = await supabase
        .from("veicolo_media")
        .delete()
        .eq("id", item.id);

      if (deleteError) throw deleteError;

      const nextItems = items.filter((media) => media.id !== item.id);
      setItems(nextItems);

      if (wasPrincipale && nextItems.length > 0) {
        const nextPrincipale = [...nextItems].sort((a, b) => {
          if ((a.ordine ?? 0) !== (b.ordine ?? 0)) {
            return (a.ordine ?? 0) - (b.ordine ?? 0);
          }
          return new Date(a.created_at) - new Date(b.created_at);
        })[0];

        if (nextPrincipale) {
          const { error: principaleError } = await supabase
            .from("veicolo_media")
            .update({ principale: true })
            .eq("id", nextPrincipale.id);

          if (!principaleError) {
            setItems((prev) =>
              prev.map((media) => ({
                ...media,
                principale: media.id === nextPrincipale.id,
              }))
            );
          }
        }
      }

      toast.success("Immagine eliminata");
    } catch (error) {
      console.error(error);
      toast.error("Errore durante l'eliminazione dell'immagine");
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="space-y-6">
      <Card className="rounded-2xl">
        <CardHeader className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div>
            <CardTitle className="flex items-center gap-2 text-2xl">
              <Images className="h-6 w-6" />
              Media veicolo
            </CardTitle>
            <CardDescription>
              Carica, attiva, imposta come principale o elimina le immagini del veicolo.
            </CardDescription>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button asChild variant="outline">
              <Link href={`/manager/garage/elenco-veicoli/${idveicolo}`}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Torna al veicolo
              </Link>
            </Button>

            <Button
              type="button"
              onClick={() => inputRef.current?.click()}
              disabled={uploading}
            >
              {uploading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <ImagePlus className="mr-2 h-4 w-4" />
              )}
              Carica immagini
            </Button>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="rounded-2xl border border-dashed p-4">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div>
                <Label className="text-sm font-medium">Upload immagini</Label>
                <p className="text-sm text-muted-foreground">
                  Le immagini verranno salvate nel bucket come:
                  <br />
                  <span className="font-mono text-xs">
                    veicoli/{idveicolo}/nome-file
                  </span>
                </p>
              </div>

              <Button
                type="button"
                variant="outline"
                onClick={() => inputRef.current?.click()}
                disabled={uploading}
              >
                {uploading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Upload className="mr-2 h-4 w-4" />
                )}
                Seleziona file
              </Button>
            </div>

            <input
              ref={inputRef}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={handleFileChange}
            />
          </div>

          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>
              Totale immagini: <strong>{items.length}</strong>
            </span>

            <Button type="button" variant="ghost" onClick={fetchMedia}>
              Aggiorna
            </Button>
          </div>
        </CardContent>
      </Card>

      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <MediaSkeletonCard key={index} />
          ))}
        </div>
      ) : items.length === 0 ? (
        <Card className="rounded-2xl border border-dashed">
          <CardContent className="flex min-h-64 flex-col items-center justify-center gap-3 text-center">
            <Images className="h-10 w-10 text-muted-foreground" />
            <div>
              <p className="font-medium">Nessuna immagine caricata</p>
              <p className="text-sm text-muted-foreground">
                Carica le prime immagini del veicolo per iniziare.
              </p>
            </div>
            <Button type="button" onClick={() => inputRef.current?.click()}>
              <ImagePlus className="mr-2 h-4 w-4" />
              Carica immagini
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {items.map((item) => (
            <Card key={item.id} className="overflow-hidden rounded-2xl">
              <div className="relative aspect-4/3 w-full overflow-hidden bg-muted">
                {item.url ? (
                  <img
                    src={item.url}
                    alt={item.alt_text || "Media veicolo"}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-muted-foreground">
                    Nessuna anteprima
                  </div>
                )}

                <div className="absolute right-3 top-3 flex gap-2">
                  {item.principale && <Badge>Principale</Badge>}
                  {item.is_active ? (
                    <Badge variant="default" className={`bg-green-700`}>Attiva</Badge>
                  ) : (
                    <Badge variant="secondary">Nascosta</Badge>
                  )}
                </div>

                {busyId === item.id && (
                  <div className="absolute inset-0 flex items-center justify-center bg-background/70 backdrop-blur-sm">
                    <div className="flex items-center gap-2 rounded-xl border bg-background px-4 py-2 shadow-sm">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span className="text-sm">Operazione...</span>
                    </div>
                  </div>
                )}
              </div>

              <CardContent className="space-y-4 p-4">
                <div className="space-y-1">
                  <p className="truncate text-sm font-medium">
                    {item.alt_text || "Immagine veicolo"}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Ordine: {item.ordine}
                  </p>
                </div>

                <div className="flex items-center justify-between rounded-xl border p-3">
                  <div className="flex items-center gap-2">
                    {item.is_active ? (
                      <Eye className="h-4 w-4" />
                    ) : (
                      <EyeOff className="h-4 w-4" />
                    )}
                    <span className="text-sm font-medium">Attiva</span>
                  </div>

                  <Switch
                    checked={!!item.is_active}
                    onCheckedChange={() => handleToggleActive(item)}
                    disabled={busyId === item.id}
                  />
                </div>

                <Button
                  type="button"
                  variant={item.principale ? "secondary" : "outline"}
                  className={`w-full ${item.principale ? "bg-primary" : ""}`}
                  onClick={() => handleSetPrincipale(item)}
                  disabled={busyId === item.id || item.principale}
                >
                  <Star className="mr-2 h-4 w-4" />
                  {item.principale ? "Immagine principale" : "Imposta come principale"}
                </Button>

                <Button
                  type="button"
                  variant="destructive"
                  className="w-full"
                  onClick={() => handleDelete(item)}
                  disabled={busyId === item.id}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Elimina immagine
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}