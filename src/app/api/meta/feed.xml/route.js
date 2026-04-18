import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ||
  process.env.SITE_URL ||
  "https://example.com";

function escapeXml(value) {
  if (value === null || value === undefined) return "";
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function tag(name, value) {
  if (value === null || value === undefined || value === "") return "";
  return `<${name}>${escapeXml(value)}</${name}>`;
}

function normalizeEnum(value, fallback = "") {
  if (!value) return fallback;
  return String(value).trim().toUpperCase();
}

function formatPrice(price, currency = "EUR") {
  if (price === null || price === undefined || price === "") return "";
  const numeric = Number(price);

  if (Number.isNaN(numeric)) return "";
  return `${numeric.toFixed(2)} ${currency}`;
}

function mapAvailability(vehicle) {
  const status = String(vehicle.status || "").trim().toUpperCase();
  const availability = String(vehicle.availability || "").trim().toLowerCase();

  // Meta automotive: available | not available
  if (status === "SOLD") return "available" === "x" ? "" : "not available";
  if (status === "PENDING") return "not available";

  if (availability === "out of stock") return "not available";
  if (availability === "not available") return "not available";
  if (availability === "available") return "available";

  return "available";
}

function mapStateOfVehicle(vehicle) {
  const raw = String(vehicle.state_of_vehicle || "").trim().toLowerCase();
  const rawCondition = String(vehicle.condition || "").trim().toLowerCase();

  if (raw === "cpo") return "CPO";
  if (raw === "new") return "New";
  if (raw === "used") return "Used";

  // fallback: se dal DB hai condition=new
  if (rawCondition === "new") return "New";

  return "Used";
}

function mapCondition(vehicle) {
  const raw = String(vehicle.condition || "").trim().toLowerCase();

  // Meta automotive: EXCELLENT | GOOD | FAIR | POOR | OTHER
  if (raw === "excellent") return "EXCELLENT";
  if (raw === "very good") return "GOOD";
  if (raw === "good") return "GOOD";
  if (raw === "fair") return "FAIR";
  if (raw === "poor") return "POOR";
  if (raw === "other") return "OTHER";

  // se nel DB hai solo new/used, non usarli qui
  if (raw === "new" || raw === "used") return "EXCELLENT";

  return "EXCELLENT";
}

function mapTransmission(value) {
  const raw = String(value || "").trim().toLowerCase();

  if (!raw) return "";
  if (raw === "automatic") return "Automatic";
  if (raw === "manual") return "Manual";

  return "";
}

function mapFuelType(value) {
  const raw = String(value || "").trim().toLowerCase();

  if (!raw) return "";
  if (raw === "diesel") return "DIESEL";
  if (raw === "electric") return "ELECTRIC";
  if (raw === "flex") return "FLEX";
  if (raw === "gasoline" || raw === "petrol" || raw === "benzina") return "GASOLINE";
  if (raw === "hybrid" || raw === "ibrida" || raw === "ibrido") return "HYBRID";

  return "OTHER";
}

function mapVehicleType(value) {
  const raw = String(value || "").trim().toLowerCase();

  if (!raw) return "car_truck";
  if (raw === "car" || raw === "car_truck" || raw === "auto") return "car_truck";
  if (raw === "boat") return "boat";
  if (raw === "commercial") return "commercial";
  if (raw === "motorcycle") return "motorcycle";
  if (raw === "powersport") return "powersport";
  if (raw === "rv_camper") return "rv_camper";
  if (raw === "trailer") return "trailer";

  return "other";
}

function mapBodyStyle(value) {
  const raw = String(value || "").trim().toUpperCase();

  const allowed = new Set([
    "CONVERTIBLE",
    "COUPE",
    "HATCHBACK",
    "MINIVAN",
    "TRUCK",
    "SUV",
    "SEDAN",
    "VAN",
    "WAGON",
    "CROSSOVER",
    "SMALL_CAR",
    "OTHER",
  ]);

  if (!raw) return "OTHER";
  return allowed.has(raw) ? raw : "OTHER";
}

function mapDrivetrain(value) {
  const raw = String(value || "").trim().toUpperCase();

  const allowed = new Set(["4X2", "4X4", "AWD", "FWD", "RWD", "OTHER"]);

  if (!raw) return "";
  return allowed.has(raw) ? raw : "OTHER";
}

function normalizeMileageUnit(value) {
  const raw = String(value || "").trim().toUpperCase();
  return raw === "MI" ? "MI" : "KM";
}

function buildVehicleUrl(vehicle) {
  return `${SITE_URL}/auto/${encodeURIComponent(vehicle.external_id)}`;
}

function buildAddressXml(vehicle) {
  const hasAddressParts =
    vehicle.seller_address ||
    vehicle.location_city ||
    vehicle.location_region ||
    vehicle.location_country;

  if (!hasAddressParts) return "";

  return `
    <address format="simple">
      ${vehicle.seller_address ? `<component name="addr1">${escapeXml(vehicle.seller_address)}</component>` : ""}
      ${vehicle.location_city ? `<component name="city">${escapeXml(vehicle.location_city)}</component>` : ""}
      ${vehicle.location_region ? `<component name="region">${escapeXml(vehicle.location_region)}</component>` : ""}
      ${vehicle.location_country ? `<component name="country">${escapeXml(vehicle.location_country)}</component>` : ""}
    </address>
  `;
}

function buildImagesXml(images) {
  if (!Array.isArray(images) || images.length === 0) return "";

  return images
    .slice(0, 20)
    .map((image, index) => {
      const imageTag = index === 0 ? "Exterior" : "Gallery";
      return `
        <image>
          <url>${escapeXml(image.url)}</url>
          <tag>${escapeXml(imageTag)}</tag>
        </image>
      `;
    })
    .join("");
}

function buildListingXml(vehicle) {
  const images = Array.isArray(vehicle.veicolo_media) ? vehicle.veicolo_media : [];
  if (images.length === 0) return "";

  const url = buildVehicleUrl(vehicle);
  const price = formatPrice(vehicle.price, vehicle.currency || "EUR");
  const availability = mapAvailability(vehicle);
  const stateOfVehicle = mapStateOfVehicle(vehicle);
  const condition = mapCondition(vehicle);
  const transmission = mapTransmission(vehicle.transmission);
  const fuelType = mapFuelType(vehicle.fuel_type);
  const bodyStyle = mapBodyStyle(vehicle.body_style);
  const drivetrain = mapDrivetrain(vehicle.drivetrain);
  const vehicleType = mapVehicleType(vehicle.vehicle_type);
  const mileageUnit = normalizeMileageUnit(vehicle.mileage_unit);

  return `
    <listing>
      ${tag("link", "https://www.brocar2.it")}
      ${tag("vehicle_id", vehicle.external_id)}
      ${tag("vehicle_registration_plate", vehicle.license_plate)}
      ${tag("vin", vehicle.vin)}
      ${tag("title", vehicle.title)}
      ${tag("description", vehicle.description)}
      ${tag("url", url)}
      ${tag("make", vehicle.brand)}
      ${tag("model", vehicle.model)}
      ${tag("year", vehicle.vehicle_year)}
      ${vehicle.trim ? tag("trim", vehicle.trim) : ""}
      ${tag("vehicle_type", vehicleType)}
      <mileage>
        ${tag("value", vehicle.mileage_value)}
        ${tag("unit", mileageUnit)}
      </mileage>
      ${buildImagesXml(images)}
      ${transmission ? tag("transmission", transmission) : ""}
      ${fuelType ? tag("fuel_type", fuelType) : ""}
      ${tag("body_style", bodyStyle)}
      ${drivetrain ? tag("drivetrain", drivetrain) : ""}
      ${tag("condition", condition)}
      ${tag("price", price)}
      ${buildAddressXml(vehicle)}
      ${vehicle.latitude !== null && vehicle.latitude !== undefined ? tag("latitude", vehicle.latitude) : ""}
      ${vehicle.longitude !== null && vehicle.longitude !== undefined ? tag("longitude", vehicle.longitude) : ""}
      ${vehicle.exterior_color ? tag("exterior_color", vehicle.exterior_color) : ""}
      ${vehicle.interior_color ? tag("interior_color", vehicle.interior_color) : ""}
      ${tag("availability", availability)}
      ${tag("state_of_vehicle", stateOfVehicle)}
      ${vehicle.date_first_registration ? tag("date_first_registration", vehicle.date_first_registration) : ""}
      ${vehicle.emissions_standard ? tag("emissions_standard", vehicle.emissions_standard) : ""}
      ${vehicle.co2_emissions !== null && vehicle.co2_emissions !== undefined ? tag("co2_emissions", vehicle.co2_emissions) : ""}
      ${vehicle.stock_number ? tag("stock_number", vehicle.stock_number) : ""}
      ${vehicle.seller_name ? tag("dealer_name", vehicle.seller_name) : ""}
      ${vehicle.seller_phone ? tag("dealer_phone", vehicle.seller_phone) : ""}
      ${vehicle.seller_email ? tag("dealer_email", vehicle.seller_email) : ""}
      ${tag("dealer_id", vehicle.external_id)}
    </listing>
  `;
}

export async function GET() {
  try {
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
        drivetrain,
        seller_name,
        seller_phone,
        seller_email,
        seller_address,
        latitude,
        longitude,
        state_of_vehicle,
        trim,
        date_first_registration,
        emissions_standard,
        co2_emissions,
        status,
        is_active,
        published_to_meta,
        location_city,
        location_region,
        location_country,
        veicolo_media!inner (
          id,
          url,
          alt_text,
          ordine,
          principale,
          is_active
        )
      `)
      .eq("is_active", true)
      .eq("published_to_meta", true)
      .neq("status", "hidden")
      .eq("veicolo_media.is_active", true)
      .order("created_at", { ascending: false })
      .order("principale", { foreignTable: "veicolo_media", ascending: false })
      .order("ordine", { foreignTable: "veicolo_media", ascending: true });

    if (error) {
      throw error;
    }

    const vehicles = (data || []).filter(
      (vehicle) =>
        Array.isArray(vehicle.veicolo_media) &&
        vehicle.veicolo_media.length > 0
    );

    const listingsXml = vehicles.map(buildListingXml).filter(Boolean).join("");

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<listings>
  <title>${escapeXml("Catalogo Veicoli")}</title>
  <link rel="self" href="${escapeXml(`${SITE_URL}/api/meta/feed.xml`)}" />
  ${listingsXml}
</listings>`;

    return new Response(xml, {
      status: 200,
      headers: {
        "Content-Type": "application/xml; charset=UTF-8",
        "Cache-Control": "no-store, max-age=0",
      },
    });
  } catch (error) {
    const xmlError = `<?xml version="1.0" encoding="UTF-8"?>
<error>
  <message>${escapeXml(error.message || "Errore generazione feed XML")}</message>
</error>`;

    return new Response(xmlError, {
      status: 500,
      headers: {
        "Content-Type": "application/xml; charset=UTF-8",
        "Cache-Control": "no-store, max-age=0",
      },
    });
  }
}