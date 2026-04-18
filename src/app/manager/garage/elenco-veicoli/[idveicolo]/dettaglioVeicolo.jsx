"use client";

import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { Loader2, CarFront, Save, ArrowLeft, Images } from "lucide-react";
import Link from "next/link";

import { createSupabaseBrowserClient } from "@/utils/supabase/client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const availabilityOptions = [
  { value: "in stock", label: "Disponibile" },
  { value: "out of stock", label: "Non disponibile" },
];

const conditionOptions = [
  { value: "new", label: "Nuovo" },
  { value: "used", label: "Usato" },
];

const statusOptions = [
  { value: "AVAILABLE", label: "Disponibile" },
  { value: "PENDING", label: "Prenotato" },
  { value: "SOLD", label: "Venduto" }
];

const vehicleTypeOptions = [
  { value: "car", label: "Auto" },
  { value: "motorcycle", label: "Moto" },
  { value: "truck", label: "Camion" },
  { value: "van", label: "Furgone" },
  { value: "suv", label: "SUV" },
];

const fuelTypeOptions = [
  { value: "petrol", label: "Benzina" },
  { value: "diesel", label: "Diesel" },
  { value: "lpg", label: "GPL" },
  { value: "cng", label: "Metano" },
  { value: "hybrid", label: "Hybrid" },
  { value: "electric", label: "Electric" },
];

const transmissionOptions = [
  { value: "manual", label: "Manuale" },
  { value: "automatic", label: "Automatico" },
  { value: "semi-automatic", label: "Semiautomatico" },
];

const bodyStyleOptions = [
  { value: "sedan", label: "Berlina" },
  { value: "suv", label: "SUV" },
  { value: "hatchback", label: "Hatchback" },
  { value: "wagon", label: "Station Wagon" },
  { value: "coupe", label: "Coupé" },
  { value: "convertible", label: "Cabrio" },
  { value: "van", label: "Van" },
];

const drivetrainOptions = [
  { value: "fwd", label: "Trazione anteriore" },
  { value: "rwd", label: "Trazione posteriore" },
  { value: "awd", label: "Integrale AWD" },
  { value: "4wd", label: "4x4" },
];

const colorOptions = [
  "black",
  "white",
  "gray",
  "silver",
  "blue",
  "red",
  "green",
  "yellow",
  "orange",
  "brown",
  "beige",
  "gold",
  "purple",
];

const emissionsStandardOptions = [
  "euro_1",
  "euro_2",
  "euro_3",
  "euro_4",
  "euro_5",
  "euro_6",
  "euro_6d",
];

const enginePowerUnitOptions = [
  "HP",
  "CV",
  "kW",
];

const initialForm = {
  external_id: "",
  stock_number: "",
  vin: "",
  license_plate: "",
  title: "",
  description: "",
  availability: "in stock",
  condition: "used",
  price: "",
  currency: "EUR",
  brand: "",
  model: "",
  vehicle_year: "",
  mileage_value: "",
  mileage_unit: "KM",
  vehicle_type: "car",
  fuel_type: "",
  transmission: "",
  body_style: "",
  exterior_color: "",
  interior_color: "",
  engine_size: "",
  drivetrain: "",
  doors: "",
  seller_name: "",
  seller_phone: "",
  seller_email: "",
  seller_address: "",
  latitude: "",
  longitude: "",
  state_of_vehicle: "used",
  trim: "",
  engine_power: "",
  engine_power_unit: "CV",
  date_first_registration: "",
  emissions_standard: "",
  co2_emissions: "",
  status: "available",
  is_active: true,
  published_to_meta: false,
  location_city: "",
  location_region: "",
  location_country: "IT",
  notes: "",
};

function normalizeFormFromDb(data) {
  return {
    external_id: data?.external_id ?? "",
    stock_number: data?.stock_number ?? "",
    vin: data?.vin ?? "",
    license_plate: data?.license_plate ?? "",
    title: data?.title ?? "",
    description: data?.description ?? "",
    availability: data?.availability ?? "in stock",
    condition: data?.condition ?? "used",
    price: data?.price ?? "",
    currency: data?.currency ?? "EUR",
    brand: data?.brand ?? "",
    model: data?.model ?? "",
    vehicle_year: data?.vehicle_year ?? "",
    mileage_value: data?.mileage_value ?? "",
    mileage_unit: data?.mileage_unit ?? "KM",
    vehicle_type: data?.vehicle_type ?? "car",
    fuel_type: data?.fuel_type ?? "",
    transmission: data?.transmission ?? "",
    body_style: data?.body_style ?? "",
    exterior_color: data?.exterior_color ?? "",
    interior_color: data?.interior_color ?? "",
    engine_size: data?.engine_size ?? "",
    drivetrain: data?.drivetrain ?? "",
    doors: data?.doors ?? "",
    seller_name: data?.seller_name ?? "",
    seller_phone: data?.seller_phone ?? "",
    seller_email: data?.seller_email ?? "",
    seller_address: data?.seller_address ?? "",
    latitude: data?.latitude ?? "",
    longitude: data?.longitude ?? "",
    state_of_vehicle: data?.state_of_vehicle ?? "used",
    trim: data?.trim ?? "",
    engine_power: data?.engine_power ?? "",
    engine_power_unit: data?.engine_power_unit ?? "CV",
    date_first_registration: data?.date_first_registration ?? "",
    emissions_standard: data?.emissions_standard ?? "",
    co2_emissions: data?.co2_emissions ?? "",
    status: data?.status ?? "available",
    is_active: data?.is_active ?? true,
    published_to_meta: data?.published_to_meta ?? false,
    location_city: data?.location_city ?? "",
    location_region: data?.location_region ?? "",
    location_country: data?.location_country ?? "IT",
    notes: data?.notes ?? "",
  };
}

function buildPayload(form) {
  return {
    external_id: form.external_id || null,
    stock_number: form.stock_number || null,
    vin: form.vin || null,
    license_plate: form.license_plate || null,
    title: form.title || null,
    description: form.description || null,
    availability: form.availability || null,
    condition: form.condition || null,
    price: form.price === "" ? null : Number(form.price),
    currency: form.currency || "EUR",
    brand: form.brand || null,
    model: form.model || null,
    vehicle_year: form.vehicle_year === "" ? null : Number(form.vehicle_year),
    mileage_value: form.mileage_value === "" ? null : Number(form.mileage_value),
    mileage_unit: form.mileage_unit || "KM",
    vehicle_type: form.vehicle_type || null,
    fuel_type: form.fuel_type || null,
    transmission: form.transmission || null,
    body_style: form.body_style || null,
    exterior_color: form.exterior_color || null,
    interior_color: form.interior_color || null,
    engine_size: form.engine_size === "" ? null : Number(form.engine_size),
    drivetrain: form.drivetrain || null,
    doors: form.doors === "" ? null : Number(form.doors),
    seller_name: form.seller_name || null,
    seller_phone: form.seller_phone || null,
    seller_email: form.seller_email || null,
    seller_address: form.seller_address || null,
    latitude: form.latitude === "" ? null : Number(form.latitude),
    longitude: form.longitude === "" ? null : Number(form.longitude),
    state_of_vehicle: form.state_of_vehicle || null,
    trim: form.trim || null,
    engine_power: form.engine_power === "" ? null : Number(form.engine_power),
    engine_power_unit: form.engine_power_unit || null,
    date_first_registration: form.date_first_registration || null,
    emissions_standard: form.emissions_standard || null,
    co2_emissions: form.co2_emissions === "" ? null : Number(form.co2_emissions),
    status: form.status || "available",
    is_active: !!form.is_active,
    published_to_meta: !!form.published_to_meta,
    location_city: form.location_city || null,
    location_region: form.location_region || null,
    location_country: form.location_country || "IT",
    notes: form.notes || null,
  };
}

export default function DettaglioVeicolo({ idveicolo }) {
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notFound, setNotFound] = useState(false);

  const titlePage = useMemo(() => {
    const parts = [form.brand, form.model, form.trim].filter(Boolean);
    return parts.length ? parts.join(" ") : "Dettaglio veicolo";
  }, [form]);

  useEffect(() => {
    if (!idveicolo) return;
    fetchVeicolo();
  }, [idveicolo]);

  async function fetchVeicolo() {
    try {
      setLoading(true);
      setNotFound(false);

      const supabase = createSupabaseBrowserClient();

      const { data, error } = await supabase
        .from("veicolo")
        .select("*")
        .eq("id", idveicolo)
        .single();

      if (error) {
        if (error.code === "PGRST116") {
          setNotFound(true);
          return;
        }

        throw error;
      }

      setForm(normalizeFormFromDb(data));
    } catch (error) {
      console.error(error);
      toast.error("Errore durante il caricamento del veicolo");
    } finally {
      setLoading(false);
    }
  }

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  function handleSwitch(name, checked) {
    setForm((prev) => ({
      ...prev,
      [name]: checked,
    }));
  }

  function handleSelect(name, value) {
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  async function handleSubmit(e) {
    e.preventDefault();

    try {
      setSaving(true);

      const supabase = createSupabaseBrowserClient();
      const payload = buildPayload(form);

      const { error } = await supabase
        .from("veicolo")
        .update(payload)
        .eq("id", idveicolo);

      if (error) throw error;

      toast.success("Veicolo aggiornato correttamente");
    } catch (error) {
      console.error(error);
      toast.error(error.message || "Errore durante il salvataggio");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-100 items-center justify-center">
        <div className="flex items-center gap-3 rounded-2xl border bg-background px-5 py-4 shadow-sm">
          <Loader2 className="h-5 w-5 animate-spin" />
          <span>Caricamento veicolo...</span>
        </div>
      </div>
    );
  }

  if (notFound) {
    return (
      <Card className="rounded-2xl border border-dashed">
        <CardContent className="flex min-h-80 flex-col items-center justify-center gap-4 text-center">
          <CarFront className="h-12 w-12 text-muted-foreground" />
          <div>
            <p className="text-lg font-semibold">Veicolo non trovato</p>
            <p className="text-sm text-muted-foreground">
              Il record richiesto non esiste oppure è stato eliminato.
            </p>
          </div>

          <Button asChild variant="outline">
            <Link href="/manager/garage/elenco-veicoli">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Torna all'elenco
            </Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card className="rounded-2xl">
        <CardHeader className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div>
            <CardTitle className="text-2xl">{titlePage}</CardTitle>
            <CardDescription>
              Modifica i dati del veicolo e salva la scheda aggiornata.
            </CardDescription>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button asChild type="button" variant="outline">
              <Link href="/manager/garage/elenco-veicoli">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Elenco veicoli
              </Link>
            </Button>

            <Button asChild type="button" variant="outline">
              <Link href={`/manager/garage/elenco-veicoli/${idveicolo}/media`}>
                <Images className="mr-2 h-4 w-4" />
                Gestisci media
              </Link>
            </Button>

            <Button type="submit" disabled={saving}>
              {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
              Salva modifiche
            </Button>
          </div>
        </CardHeader>
      </Card>

      <Card className="rounded-2xl">
        <CardHeader>
          <CardTitle>Dati principali</CardTitle>
        </CardHeader>

        <CardContent className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <div className="space-y-2">
            <Label htmlFor="external_id">External ID</Label>
            <Input id="external_id" name="external_id" value={form.external_id} onChange={handleChange} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="stock_number">Stock number</Label>
            <Input id="stock_number" name="stock_number" value={form.stock_number} onChange={handleChange} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="brand">Marca</Label>
            <Input id="brand" name="brand" value={form.brand} onChange={handleChange} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="model">Modello</Label>
            <Input id="model" name="model" value={form.model} onChange={handleChange} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="trim">Versione</Label>
            <Input id="trim" name="trim" value={form.trim} onChange={handleChange} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="title">Titolo</Label>
            <Input id="title" name="title" value={form.title} onChange={handleChange} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="license_plate">Targa</Label>
            <Input id="license_plate" name="license_plate" value={form.license_plate} onChange={handleChange} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="vin">VIN / Telaio</Label>
            <Input id="vin" name="vin" value={form.vin} onChange={handleChange} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="price">Prezzo</Label>
            <Input id="price" name="price" type="number" step="0.01" value={form.price} onChange={handleChange} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="vehicle_year">Anno</Label>
            <Input id="vehicle_year" name="vehicle_year" type="number" value={form.vehicle_year} onChange={handleChange} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="mileage_value">Chilometri</Label>
            <Input id="mileage_value" name="mileage_value" type="number" value={form.mileage_value} onChange={handleChange} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="date_first_registration">Prima immatricolazione</Label>
            <Input
              id="date_first_registration"
              name="date_first_registration"
              type="date"
              value={form.date_first_registration}
              onChange={handleChange}
            />
          </div>
        </CardContent>
      </Card>

      <Card className="rounded-2xl">
        <CardHeader>
          <CardTitle>Caratteristiche tecniche</CardTitle>
        </CardHeader>

        <CardContent className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <div className="space-y-2">
            <Label>Tipo veicolo</Label>
            <Select value={form.vehicle_type || ""} onValueChange={(value) => handleSelect("vehicle_type", value)}>
              <SelectTrigger><SelectValue placeholder="Seleziona tipo veicolo" /></SelectTrigger>
              <SelectContent>
                {vehicleTypeOptions.map((item) => (
                  <SelectItem key={item.value} value={item.value}>{item.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Alimentazione</Label>
            <Select value={form.fuel_type || ""} onValueChange={(value) => handleSelect("fuel_type", value)}>
              <SelectTrigger><SelectValue placeholder="Seleziona alimentazione" /></SelectTrigger>
              <SelectContent>
                {fuelTypeOptions.map((item) => (
                  <SelectItem key={item.value} value={item.value}>{item.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Cambio</Label>
            <Select value={form.transmission || ""} onValueChange={(value) => handleSelect("transmission", value)}>
              <SelectTrigger><SelectValue placeholder="Seleziona cambio" /></SelectTrigger>
              <SelectContent>
                {transmissionOptions.map((item) => (
                  <SelectItem key={item.value} value={item.value}>{item.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Carrozzeria</Label>
            <Select value={form.body_style || ""} onValueChange={(value) => handleSelect("body_style", value)}>
              <SelectTrigger><SelectValue placeholder="Seleziona carrozzeria" /></SelectTrigger>
              <SelectContent>
                {bodyStyleOptions.map((item) => (
                  <SelectItem key={item.value} value={item.value}>{item.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="engine_size">Cilindrata</Label>
            <Input id="engine_size" name="engine_size" type="number" step="0.01" value={form.engine_size} onChange={handleChange} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="engine_power">Potenza</Label>
            <Input id="engine_power" name="engine_power" type="number" value={form.engine_power} onChange={handleChange} />
          </div>

          <div className="space-y-2">
            <Label>Unità potenza</Label>
            <Select value={form.engine_power_unit || ""} onValueChange={(value) => handleSelect("engine_power_unit", value)}>
              <SelectTrigger><SelectValue placeholder="Seleziona unità" /></SelectTrigger>
              <SelectContent>
                {enginePowerUnitOptions.map((item) => (
                  <SelectItem key={item} value={item}>{item}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Trazione</Label>
            <Select value={form.drivetrain || ""} onValueChange={(value) => handleSelect("drivetrain", value)}>
              <SelectTrigger><SelectValue placeholder="Seleziona trazione" /></SelectTrigger>
              <SelectContent>
                {drivetrainOptions.map((item) => (
                  <SelectItem key={item.value} value={item.value}>{item.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="doors">Porte</Label>
            <Input id="doors" name="doors" type="number" value={form.doors} onChange={handleChange} />
          </div>

          <div className="space-y-2">
            <Label>Standard emissioni</Label>
            <Select value={form.emissions_standard || ""} onValueChange={(value) => handleSelect("emissions_standard", value)}>
              <SelectTrigger><SelectValue placeholder="Seleziona standard emissioni" /></SelectTrigger>
              <SelectContent>
                {emissionsStandardOptions.map((item) => (
                  <SelectItem key={item} value={item}>{item}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="co2_emissions">CO2 emissioni</Label>
            <Input id="co2_emissions" name="co2_emissions" type="number" value={form.co2_emissions} onChange={handleChange} />
          </div>
        </CardContent>
      </Card>

      <Card className="rounded-2xl">
        <CardHeader>
          <CardTitle>Meta / Catalogazione</CardTitle>
        </CardHeader>

        <CardContent className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <div className="space-y-2">
            <Label>Disponibilità</Label>
            <Select value={form.availability} onValueChange={(value) => handleSelect("availability", value)}>
              <SelectTrigger><SelectValue placeholder="Disponibilità" /></SelectTrigger>
              <SelectContent>
                {availabilityOptions.map((item) => (
                  <SelectItem key={item.value} value={item.value}>{item.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Condition</Label>
            <Select value={form.condition} onValueChange={(value) => handleSelect("condition", value)}>
              <SelectTrigger><SelectValue placeholder="Condition" /></SelectTrigger>
              <SelectContent>
                {conditionOptions.map((item) => (
                  <SelectItem key={item.value} value={item.value}>{item.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>State of vehicle</Label>
            <Select value={form.state_of_vehicle || ""} onValueChange={(value) => handleSelect("state_of_vehicle", value)}>
              <SelectTrigger><SelectValue placeholder="State of vehicle" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="new">new</SelectItem>
                <SelectItem value="used">used</SelectItem>
                <SelectItem value="cpo">cpo</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Stato gestionale</Label>
            <Select value={form.status} onValueChange={(value) => handleSelect("status", value)}>
              <SelectTrigger><SelectValue placeholder="Stato gestionale" /></SelectTrigger>
              <SelectContent>
                {statusOptions.map((item) => (
                  <SelectItem key={item.value} value={item.value}>{item.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card className="rounded-2xl">
        <CardHeader>
          <CardTitle>Colori e localizzazione</CardTitle>
        </CardHeader>

        <CardContent className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <div className="space-y-2">
            <Label>Colore esterno</Label>
            <Select value={form.exterior_color || ""} onValueChange={(value) => handleSelect("exterior_color", value)}>
              <SelectTrigger><SelectValue placeholder="Seleziona colore esterno" /></SelectTrigger>
              <SelectContent>
                {colorOptions.map((item) => (
                  <SelectItem key={item} value={item}>{item}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Colore interno</Label>
            <Select value={form.interior_color || ""} onValueChange={(value) => handleSelect("interior_color", value)}>
              <SelectTrigger><SelectValue placeholder="Seleziona colore interno" /></SelectTrigger>
              <SelectContent>
                {colorOptions.map((item) => (
                  <SelectItem key={item} value={item}>{item}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="location_city">Città</Label>
            <Input id="location_city" name="location_city" value={form.location_city} onChange={handleChange} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="location_region">Regione</Label>
            <Input id="location_region" name="location_region" value={form.location_region} onChange={handleChange} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="location_country">Paese</Label>
            <Input id="location_country" name="location_country" value={form.location_country} onChange={handleChange} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="latitude">Latitudine</Label>
            <Input id="latitude" name="latitude" type="number" step="0.0000001" value={form.latitude} onChange={handleChange} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="longitude">Longitudine</Label>
            <Input id="longitude" name="longitude" type="number" step="0.0000001" value={form.longitude} onChange={handleChange} />
          </div>
        </CardContent>
      </Card>

      <Card className="rounded-2xl">
        <CardHeader>
          <CardTitle>Venditore</CardTitle>
        </CardHeader>

        <CardContent className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <div className="space-y-2">
            <Label htmlFor="seller_name">Nome venditore</Label>
            <Input id="seller_name" name="seller_name" value={form.seller_name} onChange={handleChange} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="seller_phone">Telefono venditore</Label>
            <Input id="seller_phone" name="seller_phone" value={form.seller_phone} onChange={handleChange} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="seller_email">Email venditore</Label>
            <Input id="seller_email" name="seller_email" value={form.seller_email} onChange={handleChange} />
          </div>

          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="seller_address">Indirizzo venditore</Label>
            <Input id="seller_address" name="seller_address" value={form.seller_address} onChange={handleChange} />
          </div>
        </CardContent>
      </Card>

      <Card className="rounded-2xl">
        <CardHeader>
          <CardTitle>Descrizioni e note</CardTitle>
        </CardHeader>

        <CardContent className="grid gap-4">
          <div className="space-y-2">
            <Label htmlFor="description">Descrizione</Label>
            <Textarea
              id="description"
              name="description"
              value={form.description}
              onChange={handleChange}
              rows={6}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Note interne</Label>
            <Textarea
              id="notes"
              name="notes"
              value={form.notes}
              onChange={handleChange}
              rows={4}
            />
          </div>
        </CardContent>
      </Card>

      <Card className="rounded-2xl">
        <CardHeader>
          <CardTitle>Pubblicazione</CardTitle>
        </CardHeader>

        <CardContent className="grid gap-6 md:grid-cols-2">
          <div className="flex items-center justify-between rounded-2xl border p-4">
            <div>
              <p className="font-medium">Attivo</p>
              <p className="text-sm text-muted-foreground">
                Il veicolo può essere mostrato nel gestionale e nelle liste.
              </p>
            </div>
            <Switch checked={form.is_active} onCheckedChange={(checked) => handleSwitch("is_active", checked)} />
          </div>

          <div className="flex items-center justify-between rounded-2xl border p-4">
            <div>
              <p className="font-medium">Pubblicato su Meta</p>
              <p className="text-sm text-muted-foreground">
                Indica se il veicolo è già stato pubblicato o sincronizzato.
              </p>
            </div>
            <Switch
              checked={form.published_to_meta}
              onCheckedChange={(checked) => handleSwitch("published_to_meta", checked)}
            />
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button type="submit" size="lg" disabled={saving}>
          {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
          Salva modifiche
        </Button>
      </div>
    </form>
  );
}