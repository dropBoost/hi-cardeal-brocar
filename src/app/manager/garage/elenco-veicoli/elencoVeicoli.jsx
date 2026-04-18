"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { Search, CarFront, Pencil, Trash2, Images, Loader2, SlidersHorizontal } from "lucide-react";

import { createSupabaseBrowserClient } from "@/utils/supabase/client";

import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const statusOptions = [
  { value: "ALL", label: "Tutti gli stati" },
  { value: "AVAILABLE", label: "Disponibile" },
  { value: "PENDING", label: "Prenotato" },
  { value: "SOLD", label: "Venduto" },
];

const orderOptions = [
  { value: "created_at_desc", label: "Più recenti" },
  { value: "created_at_asc", label: "Meno recenti" },
  { value: "price_asc", label: "Prezzo crescente" },
  { value: "price_desc", label: "Prezzo decrescente" },
  { value: "vehicle_year_desc", label: "Anno più recente" },
  { value: "vehicle_year_asc", label: "Anno più vecchio" },
  { value: "mileage_value_asc", label: "Km crescenti" },
  { value: "mileage_value_desc", label: "Km decrescenti" },
];

function formatPrice(value) {
  if (value === null || value === undefined || value === "") return "-";
  return new Intl.NumberFormat("it-IT", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(Number(value));
}

function formatKm(value, unit = "KM") {
  if (value === null || value === undefined || value === "") return "-";
  return `${new Intl.NumberFormat("it-IT").format(Number(value))} ${unit}`;
}

function getStatusBadgeVariant(status) {
  switch (status) {
    case "AVAILABLE":
      return "default";
    case "PENDING":
      return "secondary";
    case "SOLD":
      return "destructive";
    default:
      return "outline";
  }
}

function getStatusLabel(status) {
  switch (status) {
    case "AVAILABLE":
      return "Disponibile";
    case "PENDING":
      return "Prenotato";
    case "SOLD":
      return "Venduto";
    default:
      return status || "—";
  }
}

function VehicleCardSkeleton() {
  return (
    <Card className="overflow-hidden rounded-2xl">
      <div className="aspect-16/10 w-full">
        <Skeleton className="h-full w-full" />
      </div>

      <CardHeader className="space-y-3">
        <Skeleton className="h-6 w-2/3" />
        <Skeleton className="h-4 w-1/3" />
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <Skeleton className="h-14 w-full rounded-xl" />
          <Skeleton className="h-14 w-full rounded-xl" />
          <Skeleton className="h-14 w-full rounded-xl" />
          <Skeleton className="h-14 w-full rounded-xl" />
        </div>
      </CardContent>

      <CardFooter className="grid grid-cols-3 gap-2">
        <Skeleton className="h-10 w-full rounded-xl" />
        <Skeleton className="h-10 w-full rounded-xl" />
        <Skeleton className="h-10 w-full rounded-xl" />
      </CardFooter>
    </Card>
  );
}

function VehicleCard({ item, onDelete }) {
  const media = Array.isArray(item.veicolo_media) ? item.veicolo_media : [];
  const activeMedia = media.filter((m) => m.is_active);

  const principale = activeMedia.find((m) => m.principale);
  const fallbackMedia = [...activeMedia].sort((a, b) => {
    const ordineA = a?.ordine ?? 0;
    const ordineB = b?.ordine ?? 0;
    return ordineA - ordineB;
  })[0];

  const cover = principale?.url || fallbackMedia?.url || null;

  return (
    <Card className="overflow-hidden rounded-2xl border bg-background shadow-sm">
      <div className="relative aspect-16/10 w-full overflow-hidden bg-muted">
        {cover ? (
          <img
            src={cover}
            alt={item.title || `${item.brand || ""} ${item.model || ""}`}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-muted-foreground">
            <div className="flex flex-col items-center gap-2">
              <CarFront className="h-10 w-10" />
              <span className="text-sm">Nessuna immagine</span>
            </div>
          </div>
        )}

        <div className="absolute right-3 top-3">
          <Badge variant={getStatusBadgeVariant(item.status)}>
            {getStatusLabel(item.status)}
          </Badge>
        </div>
      </div>

      <CardHeader className="pb-3">
        <CardTitle className="line-clamp-1 text-lg">
          {[item.brand, item.model, item.trim].filter(Boolean).join(" ") || item.title || "Veicolo"}
        </CardTitle>
        <CardDescription className="line-clamp-2">
          {item.license_plate
            ? `Targa: ${item.license_plate}`
            : item.title || "Titolo non disponibile"}
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-xl border p-3">
            <p className="text-xs text-muted-foreground">Prezzo</p>
            <p className="font-semibold">{formatPrice(item.price)}</p>
          </div>

          <div className="rounded-xl border p-3">
            <p className="text-xs text-muted-foreground">Km</p>
            <p className="font-semibold">{formatKm(item.mileage_value, item.mileage_unit || "KM")}</p>
          </div>

          <div className="rounded-xl border p-3">
            <p className="text-xs text-muted-foreground">Anno</p>
            <p className="font-semibold">{item.vehicle_year || "-"}</p>
          </div>

          <div className="rounded-xl border p-3">
            <p className="text-xs text-muted-foreground">Immagini attive</p>
            <p className="font-semibold">{activeMedia.length}</p>
          </div>
        </div>
      </CardContent>

      <CardFooter className="grid grid-cols-3 gap-2">
        <Button asChild variant="outline" className="rounded-xl">
          <Link href={`/manager/garage/elenco-veicoli/${item.id}`}>
            <Pencil className="mr-2 h-4 w-4" />
            Modifica
          </Link>
        </Button>

        <Button asChild variant="outline" className="rounded-xl">
          <Link href={`/manager/garage/elenco-veicoli/${item.id}/media`}>
            <Images className="mr-2 h-4 w-4" />
            Media
          </Link>
        </Button>

        <Button
          type="button"
          variant="destructive"
          className="rounded-xl"
          onClick={() => onDelete(item.id)}
        >
          <Trash2 className="mr-2 h-4 w-4" />
          Elimina
        </Button>
      </CardFooter>
    </Card>
  );
}

export default function ListaVeicoli() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteLoadingId, setDeleteLoadingId] = useState(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [orderBy, setOrderBy] = useState("created_at_desc");

  useEffect(() => {
    fetchItems();
  }, []);

  async function fetchItems() {
    try {
      setLoading(true);

      const supabase = createSupabaseBrowserClient();

      const { data, error } = await supabase
        .from("veicolo")
        .select(`
          *,
          veicolo_media (
            id,
            id_veicolo,
            url,
            alt_text,
            ordine,
            principale,
            is_active,
            created_at
          )
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;

      setItems(data || []);
    } catch (error) {
      console.error(error);
      toast.error("Errore durante il caricamento dei veicoli");
      setItems([]);
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id) {
    const conferma = window.confirm("Vuoi davvero eliminare questo veicolo?");
    if (!conferma) return;

    try {
      setDeleteLoadingId(id);

      const supabase = createSupabaseBrowserClient();

      const { error } = await supabase
        .from("veicolo")
        .delete()
        .eq("id", id);

      if (error) throw error;

      setItems((prev) => prev.filter((item) => item.id !== id));
      toast.success("Veicolo eliminato correttamente");
    } catch (error) {
      console.error(error);
      toast.error("Errore durante l'eliminazione del veicolo");
    } finally {
      setDeleteLoadingId(null);
    }
  }

  const filteredItems = useMemo(() => {
    let result = [...items];

    const q = search.trim().toLowerCase();

    if (q) {
      result = result.filter((item) => {
        const brand = String(item.brand || "").toLowerCase();
        const model = String(item.model || "").toLowerCase();
        const trim = String(item.trim || "").toLowerCase();
        const plate = String(item.license_plate || "").toLowerCase();
        const title = String(item.title || "").toLowerCase();
        const externalId = String(item.external_id || "").toLowerCase();
        const stockNumber = String(item.stock_number || "").toLowerCase();

        return (
          brand.includes(q) ||
          model.includes(q) ||
          trim.includes(q) ||
          plate.includes(q) ||
          title.includes(q) ||
          externalId.includes(q) ||
          stockNumber.includes(q)
        );
      });
    }

    if (statusFilter !== "all") {
      result = result.filter((item) => item.status === statusFilter);
    }

    result.sort((a, b) => {
      switch (orderBy) {
        case "created_at_asc":
          return new Date(a.created_at || 0) - new Date(b.created_at || 0);

        case "created_at_desc":
          return new Date(b.created_at || 0) - new Date(a.created_at || 0);

        case "price_asc":
          return Number(a.price || 0) - Number(b.price || 0);

        case "price_desc":
          return Number(b.price || 0) - Number(a.price || 0);

        case "vehicle_year_asc":
          return Number(a.vehicle_year || 0) - Number(b.vehicle_year || 0);

        case "vehicle_year_desc":
          return Number(b.vehicle_year || 0) - Number(a.vehicle_year || 0);

        case "mileage_value_asc":
          return Number(a.mileage_value || 0) - Number(b.mileage_value || 0);

        case "mileage_value_desc":
          return Number(b.mileage_value || 0) - Number(a.mileage_value || 0);

        default:
          return 0;
      }
    });

    return result;
  }, [items, search, statusFilter, orderBy]);

  return (
    <div className="space-y-6">
      <Card className="rounded-2xl border shadow-sm">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-xl">
            <SlidersHorizontal className="h-5 w-5" />
            Lista veicoli
          </CardTitle>
          <CardDescription>
            Cerca, filtra e gestisci i veicoli del gestionale
          </CardDescription>
        </CardHeader>

        <CardContent>
          <div className="grid gap-3 md:grid-cols-3">
            <div className="relative md:col-span-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Cerca per marca, modello, targa, titolo..."
                className="pl-9"
              />
            </div>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filtra per stato" />
              </SelectTrigger>
              <SelectContent>
                {statusOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={orderBy} onValueChange={setOrderBy}>
              <SelectTrigger>
                <SelectValue placeholder="Ordina per" />
              </SelectTrigger>
              <SelectContent>
                {orderOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="mt-4 flex items-center justify-between text-sm text-muted-foreground">
            <span>
              Totale veicoli: <strong>{filteredItems.length}</strong>
            </span>

            <Button type="button" variant="outline" onClick={fetchItems}>
              Aggiorna
            </Button>
          </div>
        </CardContent>
      </Card>

      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <VehicleCardSkeleton key={index} />
          ))}
        </div>
      ) : filteredItems.length === 0 ? (
        <Card className="rounded-2xl border border-dashed">
          <CardContent className="flex min-h-55 flex-col items-center justify-center gap-3 text-center">
            <CarFront className="h-10 w-10 text-muted-foreground" />
            <div>
              <p className="font-medium">Nessun veicolo trovato</p>
              <p className="text-sm text-muted-foreground">
                Prova a modificare i filtri o ad aggiungere un nuovo veicolo.
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {filteredItems.map((item) => (
            <div key={item.id} className="relative">
              {deleteLoadingId === item.id && (
                <div className="absolute inset-0 z-20 flex items-center justify-center rounded-2xl bg-background/70 backdrop-blur-sm">
                  <div className="flex items-center gap-2 rounded-xl border bg-background px-4 py-2 shadow-sm">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span className="text-sm">Eliminazione...</span>
                  </div>
                </div>
              )}

              <VehicleCard item={item} onDelete={handleDelete} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}