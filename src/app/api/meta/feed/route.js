import { createClient } from "@supabase/supabase-js";
import { buildMetaVehicleFeedXml } from "@/lib/meta/feed-builders";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

function getSupabaseAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );
}

function buildAbsoluteUrl(path = "") {
  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL ||
    process.env.NEXT_PUBLIC_APP_URL ||
    "http://localhost:3000";

  return `${siteUrl.replace(/\/$/, "")}/${String(path).replace(/^\//, "")}`;
}

function normalizeText(value) {
  if (value === null || value === undefined) return "";
  return String(value).trim();
}

function normalizePrice(price, currency = "EUR") {
  if (price === null || price === undefined || price === "") return "";
  const num = Number(price);
  if (Number.isNaN(num)) return "";
  return `${num.toFixed(2)} ${currency}`;
}

function buildVehicleLink(vehicle) {
  return buildAbsoluteUrl(`/veicoli/${vehicle.id}`);
}

function getPublicImageUrl(supabase, mediaRow) {
  if (mediaRow.url) return mediaRow.url;
  if (mediaRow.public_url) return mediaRow.public_url;
  if (mediaRow.link) return mediaRow.link;

  if (mediaRow.path) {
    const bucket = mediaRow.bucket || "veicoli";
    const { data } = supabase.storage.from(bucket).getPublicUrl(mediaRow.path);
    return data?.publicUrl || "";
  }

  return "";
}

function buildSellerAddress(vehicle) {
  if (vehicle.seller_address) return normalizeText(vehicle.seller_address);

  const parts = [
    vehicle.location_city,
    vehicle.location_region,
    vehicle.location_country,
  ]
    .map(normalizeText)
    .filter(Boolean);

  return parts.join(", ");
}

async function loadVehicles(supabase) {
  const { data, error } = await supabase
    .from("veicolo")
    .select(`
      id,
      external_id,
      stock_number,
      vin,
      license_plate,
      title,
      description,
      availability,
      condition,
      price,
      currency,
      brand,
      model,
      vehicle_year,
      mileage_value,
      mileage_unit,
      vehicle_type,
      fuel_type,
      transmission,
      body_style,
      exterior_color,
      interior_color,
      engine_size,
      drivetrain,
      doors,
      seller_name,
      seller_phone,
      seller_email,
      seller_address,
      latitude,
      longitude,
      state_of_vehicle,
      trim,
      engine_power,
      engine_power_unit,
      date_first_registration,
      emissions_standard,
      co2_emissions,
      status,
      is_active,
      published_to_meta,
      location_city,
      location_region,
      location_country,
      notes,
      created_at,
      updated_at
    `)
    .eq("is_active", true)
    .eq("published_to_meta", true)
    .neq("status", "hidden")
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(`Errore caricamento veicoli: ${error.message}`);
  }

  return data || [];
}

async function loadVehicleMedia(supabase, vehicleIds = []) {
  if (!vehicleIds.length) return new Map();

  const { data, error } = await supabase
    .from("veicolo_media")
    .select(`*`)
    .in("id_veicolo", vehicleIds)
    .eq("is_active", true)
    .order("ordine", { ascending: true });

  if (error) {
    throw new Error(`Errore caricamento media: ${error.message}`);
  }

  const mediaMap = new Map();

  for (const row of data || []) {
    if (!mediaMap.has(row.id_veicolo)) {
      mediaMap.set(row.id_veicolo, []);
    }
    mediaMap.get(row.id_veicolo).push(row);
  }

  return mediaMap;
}

async function loadVehicleOptionals(supabase, vehicleIds = []) {
  if (!vehicleIds.length) return new Map();

  const { data, error } = await supabase
    .from("veicolo_optional")
    .select(`
      id,
      id_veicolo,
      nome
    `)
    .in("id_veicolo", vehicleIds);

  if (error) {
    throw new Error(`Errore caricamento optional: ${error.message}`);
  }

  const optionalsMap = new Map();

  for (const row of data || []) {
    if (!optionalsMap.has(row.id_veicolo)) {
      optionalsMap.set(row.id_veicolo, []);
    }
    optionalsMap.get(row.id_veicolo).push(row.nome);
  }

  return optionalsMap;
}

function mapVehicleToMetaItem({ supabase, vehicle, mediaRows = [], optionalNames = [] }) {
  const images = mediaRows
    .map((row) => getPublicImageUrl(supabase, row))
    .filter(Boolean);

  if (!images.length) return null;

  return {
    id: normalizeText(vehicle.external_id || vehicle.id),
    title: normalizeText(vehicle.title),
    description: normalizeText(vehicle.description),
    availability: normalizeText(vehicle.availability),
    condition: normalizeText(vehicle.condition),
    price: normalizePrice(vehicle.price, vehicle.currency),
    link: buildVehicleLink(vehicle),
    images,

    make: normalizeText(vehicle.brand),
    model: normalizeText(vehicle.model),
    year: vehicle.vehicle_year || "",
    mileage_value: vehicle.mileage_value ?? "",
    mileage_unit: normalizeText(vehicle.mileage_unit || "KM"),
    vin: normalizeText(vehicle.vin),
    fuel_type: normalizeText(vehicle.fuel_type),
    transmission: normalizeText(vehicle.transmission),
    body_style: normalizeText(vehicle.body_style),
    exterior_color: normalizeText(vehicle.exterior_color),
    interior_color: normalizeText(vehicle.interior_color),
    state_of_vehicle: normalizeText(vehicle.state_of_vehicle),
    emissions_standard: normalizeText(vehicle.emissions_standard),

    vehicle_type: normalizeText(vehicle.vehicle_type),
    trim: normalizeText(vehicle.trim),
    drivetrain: normalizeText(vehicle.drivetrain),

    engine_size: vehicle.engine_size ?? "",
    engine_power: vehicle.engine_power ?? "",
    engine_power_unit: normalizeText(vehicle.engine_power_unit),
    doors: vehicle.doors ?? "",
    stock_number: normalizeText(vehicle.stock_number),
    license_plate: normalizeText(vehicle.license_plate),
    seller_name: normalizeText(vehicle.seller_name),
    seller_phone: normalizeText(vehicle.seller_phone),
    seller_email: normalizeText(vehicle.seller_email),
    seller_address: buildSellerAddress(vehicle),
    latitude: vehicle.latitude ?? "",
    longitude: vehicle.longitude ?? "",
    date_first_registration: vehicle.date_first_registration || "",
    co2_emissions: vehicle.co2_emissions ?? "",
    location_city: normalizeText(vehicle.location_city),
    location_region: normalizeText(vehicle.location_region),
    location_country: normalizeText(vehicle.location_country),
    notes: normalizeText(vehicle.notes),

    optional_names: optionalNames,
  };
}

export async function GET(request) {
  try {
    const url = new URL(request.url);
    const token = url.searchParams.get("token");

    if (process.env.META_FEED_TOKEN && token !== process.env.META_FEED_TOKEN) {
      return new Response("Unauthorized", { status: 401 });
    }

    const supabase = getSupabaseAdmin();

    const vehicles = await loadVehicles(supabase);
    const vehicleIds = vehicles.map((v) => v.id);

    const [mediaMap, optionalsMap] = await Promise.all([
      loadVehicleMedia(supabase, vehicleIds),
      loadVehicleOptionals(supabase, vehicleIds),
    ]);

    const items = vehicles
      .map((vehicle) =>
        mapVehicleToMetaItem({
          supabase,
          vehicle,
          mediaRows: mediaMap.get(vehicle.id) || [],
          optionalNames: optionalsMap.get(vehicle.id) || [],
        })
      )
      .filter(Boolean);

    const xml = buildMetaVehicleFeedXml({
      title: "Catalogo Veicoli",
      link: process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
      description: "Feed XML veicoli per catalogo Meta",
      items,
    });

    return new Response(xml, {
      status: 200,
      headers: {
        "Content-Type": "application/xml; charset=utf-8",
        "Cache-Control": "no-store, max-age=0",
      },
    });
  } catch (error) {
    console.error("META FEED ERROR:", error);

    return new Response(
      JSON.stringify({
        ok: false,
        error: error.message || "Errore generazione feed",
      }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json; charset=utf-8",
        },
      }
    );
  }
}