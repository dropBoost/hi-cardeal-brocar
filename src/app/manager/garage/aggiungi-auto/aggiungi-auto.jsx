"use client";

import { useMemo, useState, useEffect } from "react";
import { toast } from "sonner";
import { Loader2, Plus } from "lucide-react";
import { createSupabaseBrowserClient } from "@/utils/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import SelectComboBox from "@/components/select-combobox";
import { useSettings } from "@/settings/settingsProvider";

const availabilityOptions = [
  { value: "in stock", label: "Disponibile" },
  { value: "out of stock", label: "Non disponibile" },
];

const conditionOptions = [
  { value: "new", label: "Nuovo" },
  { value: "used", label: "Usato" },
];

const fuelTypeOptions = [
  { value: "petrol", label: "Benzina" },
  { value: "diesel", label: "Diesel" },
  { value: "electric", label: "Elettrica" },
  { value: "hybrid", label: "Ibrida" },
  { value: "lpg", label: "GPL" },
  { value: "cng", label: "Metano" },
];

const transmissionOptions = [
  { value: "manual", label: "Manuale" },
  { value: "automatic", label: "Automatico" },
  { value: "semi-automatic", label: "Semi-automatico" },
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

const statusOptions = [
  { value: "available", label: "Disponibile" },
  { value: "reserved", label: "Prenotato" },
  { value: "sold", label: "Venduto" },
  { value: "hidden", label: "Nascosto" },
];

const vehicleTypeOptions = [
  { value: "car", label: "Auto" },
  { value: "van", label: "Van" },
  { value: "suv", label: "SUV" },
  { value: "truck", label: "Truck" },
  { value: "motorcycle", label: "Moto" },
];

const stateOfVehicleOptions = [
  { value: "excellent", label: "Eccellente" },
  { value: "very good", label: "Molto buono" },
  { value: "good", label: "Buono" },
  { value: "fair", label: "Discreto" },
  { value: "poor", label: "Da riparare" },
];

const emissionsStandardOptions = [
  { value: "euro_1", label: "Euro 1" },
  { value: "euro_2", label: "Euro 2" },
  { value: "euro_3", label: "Euro 3" },
  { value: "euro_4", label: "Euro 4" },
  { value: "euro_5", label: "Euro 5" },
  { value: "euro_6", label: "Euro 6" },
  { value: "euro_6d", label: "Euro 6d" },
];

export default function FormVeicolo({ onSuccess, defaultValues = {} }) {

  const supabase = useMemo(() => createSupabaseBrowserClient(), []);
  const s = useSettings();

  const [form, setForm] = useState({
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
    vehicle_type: "",
    fuel_type: "",
    transmission: "",
    body_style: "",
    exterior_color: "",
    interior_color: "",
    engine_size: "",
    drivetrain: "",
    doors: "",
    state_of_vehicle: "",
    trim: "",
    engine_power: "",
    date_first_registration: "",
    emissions_standard: "",
    co2_emissions: "",
    status: "available",
    is_active: true,
    published_to_meta: false,
    notes: "",
    seller_name: "",
    seller_phone: "",
    seller_email: "",
    seller_address: "",
    engine_power_unit: "",
    location_city: "",
    location_region: "",
    location_country: "IT",
    latitude: "",
    longitude: "",
  });

  const [marche, setMarche] = useState([]);
  const [colori, setColori] = useState([]);
  const [extUniqueCode, setExtUniqueCode] = useState("");
  const [intUniqueCode, setIntUniqueCode] = useState("");
  const [loading, setLoading] = useState(false);

  // CARICAMENTO COLORI AUTO
  useEffect(() => {

    async function fetchColori() {

      const res = await fetch("/api/colori-auto");
      const json = await res.json();

      const jasonValue = json.data.map((m,i) => (
        {
          key:m.id,
          label:m.label_color,
          value:m.category_color
        }
      ))

      if (jasonValue) {
        setColori(jasonValue);
      } else (
        console.log("errore nel recupero dei colori")
      )

    }

    fetchColori();

  }, []);

  // CARICAMENTO MARCHI AUTO
  useEffect(() => {

    async function fetchMarche() {

      const res = await fetch("/api/marchi-auto");
      const json = await res.json();

      const jasonValue = json.data.map((m,i) => (
        {
          key:m.id,
          label:m.marchio,
          value:m.marchio
        }
      ))

      if (jasonValue) {
        setMarche(jasonValue);
      } else (
        console.log("errore nel recupero dei marchi")
      )

    }

    fetchMarche();

  }, []);

  //GESTIONE CODICE ESTERNO E INTERNO
  useEffect(() => {
  if (!form.brand || !form.license_plate || !form.vin || !form.model) {
    setForm((prev) => ({
      ...prev,
      external_id: "",
      stock_number: "",
    }));
    return;
  }

  const cfBrand = form.brand
    .trim()
    .toUpperCase()
    .replace(/[AEIOUÀÁÈÉÌÍÒÓÙÚ]/g, "")
    .replace(/\s/g, "")
    .slice(0, 4);

  const cfTarga = form.license_plate
    .trim()
    .toUpperCase()
    .replace(/[AEIOUÀÁÈÉÌÍÒÓÙÚ]/g, "")
    .replace(/\s/g, "");

  const cfVin = form.vin
    .trim()
    .toUpperCase()
    .replace(/\s/g, "")
    .slice(0, 6);

  const cfMod = form.model
    .trim()
    .toUpperCase()
    .replace(/\s/g, "")
    .slice(0, 3);

  const randomNumber1 = Math.floor(Math.random() * 10000) + 1;
  const randomNumber2 = Math.floor(Math.random() * 10000) + 1;

  const externalId = `${cfBrand}-${cfTarga}${cfVin}-${cfMod}-${randomNumber1}`;
  const stockNumber = `${cfBrand}-${cfMod}-${cfTarga}-${randomNumber2}`;

  setForm((prev) => ({
    ...prev,
    external_id: externalId,
    stock_number: stockNumber,
  }));
}, [form.brand, form.license_plate, form.vin, form.model]);

  //GESTIONE VALORI DI DEFAULT
  useEffect(() => {
  if (!s) return;

  setForm((prev) => ({
    ...prev,
    seller_name: s?.aboutMaps?.trim() || "",
    seller_phone: s?.telefono?.trim() || "",
    seller_email: s?.email?.trim() || "",
    seller_address: s?.indirizzo?.trim() || "",
    location_city: s?.location_city?.trim() || "",
    location_region: s?.location_region?.trim() || "",
    location_country: s?.language?.toUpperCase?.() || "IT",
    longitude: s?.location_longitude?.trim() || "",
    latitude: s?.location_latitude?.trim() || "",
    engine_power_unit: s?.list_power?.toUpperCase?.() || "",
    }));
  }, [s]);

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  function handleSelect(name, value) {
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

  function resetForm() {
    setForm((prev) => ({
    ...prev,
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
    vehicle_type: "",
    fuel_type: "",
    transmission: "",
    body_style: "",
    exterior_color: "",
    interior_color: "",
    engine_size: "",
    drivetrain: "",
    doors: "",
    state_of_vehicle: "",
    trim: "",
    engine_power: "",
    date_first_registration: "",
    emissions_standard: "",
    co2_emissions: "",
    status: "available",
    is_active: true,
    published_to_meta: false,
    notes: "",
  }));
  }

  function buildPayload(values) {
  
    return {
      external_id: values.external_id.trim() || null,
      stock_number: values.stock_number.trim() || null,
      vin: values.vin.trim() || null,
      license_plate: values.license_plate.trim() || null,

      title: values.title.trim(),
      description: values.description.trim(),

      availability: values.availability,
      condition: values.condition,
      price: values.price === "" ? null : Number(values.price),
      currency: values.currency || "EUR",

      brand: values.brand.trim(),
      model: values.model.trim(),
      vehicle_year: values.vehicle_year === "" ? null : Number(values.vehicle_year),
      mileage_value: values.mileage_value === "" ? null : Number(values.mileage_value),
      mileage_unit: values.mileage_unit || "KM",

      vehicle_type: values.vehicle_type.trim() || null,
      fuel_type: values.fuel_type || null,
      transmission: values.transmission || null,
      body_style: values.body_style || null,
      exterior_color: values.exterior_color.trim() || null,
      interior_color: values.interior_color.trim() || null,
      engine_size: values.engine_size === "" ? null : Number(values.engine_size),
      drivetrain: values.drivetrain || null,
      doors: values.doors === "" ? null : Number(values.doors),

      seller_name: values.seller_name.trim() || null,
      seller_phone: values.seller_phone.trim() || null,
      seller_email: values.seller_email.trim() || null,
      seller_address: values.seller_address.trim() || null,

      latitude: values.latitude.trim() || null,
      longitude: values.longitude.trim() || null,
      state_of_vehicle: values.state_of_vehicle.trim() || null,
      trim: values.trim.trim() || null,
      engine_power: values.engine_power === "" ? null : Number(values.engine_power),
      engine_power_unit: values.engine_power_unit || null,
      date_first_registration: values.date_first_registration || null,
      emissions_standard: values.emissions_standard.trim() || null,
      co2_emissions: values.co2_emissions === "" ? null : Number(values.co2_emissions),

      status: values.status,
      is_active: values.is_active,
      published_to_meta: values.published_to_meta,

      location_city: values.location_city.trim() || null,
      location_region: values.location_region.trim() || null,
      location_country: values.location_country.trim() || "IT",
      notes: values.notes.trim() || null,
    };
  }

  function validate(values) {
    if (!values.external_id.trim()) return "external_id è obbligatorio";
    if (!values.title.trim()) return "title è obbligatorio";
    if (!values.description.trim()) return "description è obbligatorio";
    if (!values.price) return "price è obbligatorio";
    if (!values.brand.trim()) return "brand è obbligatorio";
    if (!values.model.trim()) return "model è obbligatorio";
    if (!values.vehicle_year) return "vehicle_year è obbligatorio";
    if (!values.mileage_value) return "mileage_value è obbligatorio";
    return "";
  }

  async function handleSubmit(e) {
    e.preventDefault();

    const validationError = validate(form);
    if (validationError) {
      toast.error(validationError);
      return;
    }

    setLoading(true);

    try {
      const payload = buildPayload(form);

      const { data, error } = await supabase
        .from("veicolo")
        .insert([payload])
        .select()
        .single();

      if (error) {
        throw error;
      }

      toast.success("Veicolo salvato con successo");

      if (onSuccess) {
        onSuccess(data);
      }

      resetForm();
    } catch (error) {
      toast.error(error.message || "Errore durante il salvataggio");
    } finally {
      setLoading(false);
    }
  }

  function handleMarcaChange(value) {
    setForm((prev) => ({
      ...prev,
      brand: value,
    }));
  }
  function handleExtColorChange(value) {
    setForm((prev) => ({
      ...prev,
      exterior_color: value,
    }));
  }
  function handleIntColorChange(value) {
    setForm((prev) => ({
      ...prev,
      interior_color: value,
    }));
  }

  console.log(form, extUniqueCode)

  return (
    <Card className="rounded-2xl">
      <CardHeader>
        <CardTitle>Nuovo veicolo</CardTitle>
        <CardDescription>
          Inserisci i dati principali del veicolo. Media e optional li gestiamo dopo.
        </CardDescription>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-8">
          
          {/* ANAGRAFICA AUTO */}
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-2">
            <Field label="External ID">
              <Input
                disabled
                name="external_id"
                value={form.external_id}
                placeholder={"BTN-051512125"}
              />
            </Field>
            <Field label="Codice interno">
              <Input
                disabled
                name="stock_number"
                value={form.stock_number}
                placeholder="STK-001"
              />
            </Field>
            <Field label="VIN">
              <Input
                name="vin"
                value={form.vin}
                onChange={handleChange}
                placeholder="WVWZZZ1JZXW000001"
              />
            </Field>
            <Field label="Targa">
              <Input
                name="license_plate"
                value={form.license_plate}
                onChange={handleChange}
                placeholder="AB123CD"
              />
            </Field>
          </div>

          {/* DATI ANNUNCIO */}
          <div className="flex flex-col gap-4">
            <Field label="Titolo" className="w-full">
              <Input
                name="title"
                value={form.title}
                onChange={handleChange}
                placeholder="Audi A3 Sportback 2.0 TDI S line"
              />
            </Field>
            <Field label="Descrizione">
              <Textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                placeholder="Descrizione completa del veicolo"
                className="min-h-32"
              />
            </Field>
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">

            <Field label="Disponibilità">
              <Select value={form.availability} onValueChange={(value) => handleSelect("availability", value)}>
                <SelectTrigger className={`w-full`}>
                  <SelectValue placeholder="Seleziona disponibilità" />
                </SelectTrigger>
                <SelectContent>
                  {availabilityOptions.map((item) => (
                    <SelectItem key={item.value} value={item.value}>
                      {item.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>

            <Field label="Condizione">
              <Select value={form.condition} onValueChange={(value) => handleSelect("condition", value)}>
                <SelectTrigger className={`w-full`}>
                  <SelectValue placeholder="Seleziona condizione" />
                </SelectTrigger>
                <SelectContent>
                  {conditionOptions.map((item) => (
                    <SelectItem key={item.value} value={item.value}>
                      {item.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>

            <Field label="Prezzo">
              <Input
                name="price"
                type="number"
                step="0.01"
                value={form.price}
                onChange={handleChange}
                placeholder="18900"
              />
            </Field>

            <Field label="Valuta">
              <Input
                name="currency"
                value={form.currency}
                onChange={handleChange}
                placeholder="EUR"
              />
            </Field>
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">

            <Field label="Marca">
              <SelectComboBox
                options={marche}
                value={form.brand || ""}
                onChange={handleMarcaChange}
                placeholder="Seleziona marca"
                searchPlaceholder="Cerca marca..."
              />
            </Field>

            <Field label="Modello">
              <Input
                name="model"
                value={form.model}
                onChange={handleChange}
                placeholder="A3"
              />
            </Field>

            <Field label="Anno">
              <Input
                name="vehicle_year"
                type="number"
                value={form.vehicle_year}
                onChange={handleChange}
                placeholder="2020"
              />
            </Field>

            <Field label="Km">
              <Input
                name="mileage_value"
                type="number"
                value={form.mileage_value}
                onChange={handleChange}
                placeholder="84500"
              />
            </Field>
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <Field label="Unità chilometraggio">
              <Input
                name="mileage_unit"
                value={form.mileage_unit}
                onChange={handleChange}
                placeholder="KM"
              />
            </Field>

            <Field label="Tipo veicolo">
              <Select
                value={form.vehicle_type || ""}
                onValueChange={(value) => handleSelect("vehicle_type", value)}
              >
                <SelectTrigger className={`w-full`}>
                  <SelectValue placeholder="Seleziona Tipologia" />
                </SelectTrigger>
                <SelectContent>
                  {vehicleTypeOptions.map((item) => (
                    <SelectItem key={item.value} value={item.value}>
                      {item.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>

            <Field label="Alimentazione">
              <Select value={form.fuel_type || ""} onValueChange={(value) => handleSelect("fuel_type", value)}>
                <SelectTrigger className={`w-full`}>
                  <SelectValue placeholder="Seleziona alimentazione" />
                </SelectTrigger>
                <SelectContent>
                  {fuelTypeOptions.map((item) => (
                    <SelectItem key={item.value} value={item.value}>
                      {item.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>

            <Field label="Cambio">
              <Select
                value={form.transmission || ""}
                onValueChange={(value) => handleSelect("transmission", value)}
              >
                <SelectTrigger className={`w-full`}>
                  <SelectValue placeholder="Seleziona cambio" />
                </SelectTrigger>
                <SelectContent>
                  {transmissionOptions.map((item) => (
                    <SelectItem key={item.value} value={item.value}>
                      {item.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <Field label="Carrozzeria">
              <Select value={form.body_style || ""} onValueChange={(value) => handleSelect("body_style", value)}>
                <SelectTrigger className={`w-full`}>
                  <SelectValue placeholder="Seleziona carrozzeria" />
                </SelectTrigger>
                <SelectContent>
                  {bodyStyleOptions.map((item) => (
                    <SelectItem key={item.value} value={item.value}>
                      {item.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>

            <Field label="Colore Esterno">
              <SelectComboBox
                options={colori}
                value={form.exterior_color || ""}
                onChange={handleExtColorChange}
                placeholder="Seleziona Colore"
                searchPlaceholder="Cerca colore..."
              />
            </Field>
            <Field label="Colore Interni">
              <SelectComboBox
                options={colori}
                value={form.interior_color || ""}
                onChange={handleIntColorChange}
                placeholder="Seleziona Colore"
                searchPlaceholder="Cerca colore..."
              />
            </Field>

            <Field label="Porte">
              <Input
                name="doors"
                type="number"
                value={form.doors}
                onChange={handleChange}
                placeholder="5"
              />
            </Field>
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <Field label="Cilindrata">
              <Input
                name="engine_size"
                type="number"
                step="0.1"
                value={form.engine_size}
                onChange={handleChange}
                placeholder="2.0"
              />
            </Field>

            <Field label="Trazione">
              <Select value={form.drivetrain || ""} onValueChange={(value) => handleSelect("drivetrain", value)}>
                <SelectTrigger className={`w-full`}>
                  <SelectValue placeholder="Seleziona trazione" />
                </SelectTrigger>
                <SelectContent>
                  {drivetrainOptions.map((item) => (
                    <SelectItem key={item.value} value={item.value}>
                      {item.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>

            <Field label="Potenza motore">
              <Input
                name="engine_power"
                type="number"
                value={form.engine_power}
                onChange={handleChange}
                placeholder="150"
              />
            </Field>

            <Field label="Unità potenza">
              <Input
                disabled
                name="engine_power_unit"
                value={form.engine_power_unit}
                placeholder="CV"
              />
            </Field>
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">

            <Field label="Stato veicolo">
              <Select
                value={form.state_of_vehicle || ""}
                onValueChange={(value) => handleSelect("state_of_vehicle", value)}
              >
                <SelectTrigger className={`w-full`}>
                  <SelectValue placeholder="Seleziona Stato" />
                </SelectTrigger>
                <SelectContent>
                  {stateOfVehicleOptions.map((item) => (
                    <SelectItem key={item.value} value={item.value}>
                      {item.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>

            <Field label="Allestimento">
              <Input
                name="trim"
                value={form.trim}
                onChange={handleChange}
                placeholder="S line"
              />
            </Field>

            <Field label="Prima immatricolazione">
              <Input
                name="date_first_registration"
                type="date"
                value={form.date_first_registration}
                onChange={handleChange}
              />
            </Field>

            <Field label="Classe emissioni">
              <Select
                value={form.emissions_standard || ""}
                onValueChange={(value) => handleSelect("emissions_standard", value)}
              >
                <SelectTrigger className={`w-full`}>
                  <SelectValue placeholder="Seleziona Euro" />
                </SelectTrigger>
                <SelectContent>
                  {emissionsStandardOptions.map((item) => (
                    <SelectItem key={item.value} value={item.value}>
                      {item.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>

          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            <Field label="CO2 emissioni">
              <Input
                name="co2_emissions"
                type="number"
                value={form.co2_emissions}
                onChange={handleChange}
                placeholder="120"
              />
            </Field>

            <Field label="Stato gestionale">
              <Select value={form.status} onValueChange={(value) => handleSelect("status", value)}>
                <SelectTrigger className={`w-full`}>
                  <SelectValue placeholder="Seleziona stato" />
                </SelectTrigger>
                <SelectContent>
                  {statusOptions.map((item) => (
                    <SelectItem key={item.value} value={item.value}>
                      {item.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Venditore / concessionaria">
              <Input
                disabled
                name="seller_name"
                value={form.seller_name}
                placeholder="Autosalone Rossi"
              />
            </Field>

            <Field label="Telefono venditore">
              <Input
                disabled
                name="seller_phone"
                value={form.seller_phone}
                placeholder="+39..."
              />
            </Field>

            <Field label="Email venditore">
              <Input
                disabled
                name="seller_email"
                value={form.seller_email}
                placeholder="info@dominio.it"
              />
            </Field>

            <Field label="Indirizzo venditore">
              <Input
                disabled
                name="seller_address"
                value={form.seller_address}
                placeholder="Via Roma 1, Sora"
              />
            </Field>
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <Field label="Città">
              <Input
                disabled
                name="location_city"
                value={form.location_city}
                placeholder="Brusciano"
              />
            </Field>

            <Field label="Regione">
              <Input
                disabled
                name="location_region"
                value={form.location_region}
                placeholder="Campania"
              />
            </Field>

            <Field label="Paese">
              <Input
                disabled
                name="location_country"
                value={form.location_country}
                placeholder="IT"
              />
            </Field>

            <Field label="Latitudine">
              <Input
                disabled
                name="latitude"
                step="0.0000001"
                value={form.latitude}
                placeholder="41.718..."
              />
            </Field>

            <Field label="Longitudine">
              <Input
                disabled
                name="longitude"
                step="0.0000001"
                value={form.longitude}
                placeholder="13.613..."
              />
            </Field>

          </div>

          <div className="flex flex-col gap-4">
            <Field label="Note">
              <Textarea
                name="notes"
                value={form.notes}
                onChange={handleChange}
                placeholder="Note interne"
                className="min-h-28"
              />
            </Field>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            <div className="flex items-center justify-between rounded-xl border p-4">
              <div className="space-y-1">
                <p className="text-sm font-medium">Attivo</p>
                <p className="text-xs text-muted-foreground">Mostra il veicolo nel gestionale</p>
              </div>
              <Switch
                checked={form.is_active}
                onCheckedChange={(checked) => handleSwitch("is_active", checked)}
              />
            </div>

            <div className="flex items-center justify-between rounded-xl border p-4">
              <div className="space-y-1">
                <p className="text-sm font-medium">Pubblicato su Meta</p>
                <p className="text-xs text-muted-foreground">Flag interno di sincronizzazione</p>
              </div>
              <Switch
                checked={form.published_to_meta}
                onCheckedChange={(checked) => handleSwitch("published_to_meta", checked)}
              />
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <Button type="submit" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Salvataggio...
                </>
              ) : (
                <>
                  <Plus className="mr-2 h-4 w-4" />
                  Salva veicolo
                </>
              )}
            </Button>

            <Button type="button" variant="outline" onClick={resetForm} disabled={loading}>
              Reset
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

function Field({ label, children, description }) {
  return (
    <div className="space-y-2">
      <Label className={`truncate`}>{label}</Label>
      {children}
      {description ? <p className="text-xs text-muted-foreground">{description}</p> : null}
    </div>
  );
}