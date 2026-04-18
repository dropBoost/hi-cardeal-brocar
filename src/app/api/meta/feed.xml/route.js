import { createClient } from "@supabase/supabase-js";

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

function escapeXml(value) {
  if (value === null || value === undefined) return "";

  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function escapeCData(value) {
  if (value === null || value === undefined) return "";
  return String(value).replaceAll("]]>", "]]]]><![CDATA[>");
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

function isValidHttpUrl(value) {
  if (!value) return false;

  try {
    const url = new URL(String(value));
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

function getPublicImageUrl(supabase, mediaRow) {
  if (isValidHttpUrl(mediaRow.url)) return mediaRow.url;
  if (isValidHttpUrl(mediaRow.public_url)) return mediaRow.public_url;
  if (isValidHttpUrl(mediaRow.link)) return mediaRow.link;

  if (mediaRow.path) {
    const bucket = mediaRow.bucket || "veicoli";
    const { data } = supabase.storage.from(bucket).getPublicUrl(mediaRow.path);
    if (isValidHttpUrl(data?.publicUrl)) return data.publicUrl;
  }

  return "";
}

function buildVehicleLink(vehicle) {
  return buildAbsoluteUrl(`/veicoli/${vehicle.id}`);
}

async function loadVehicles(supabase) {
  const { data, error } = await supabase
    .from("veicolo")
    .select(`
      id,
      external_id,
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
      fuel_type,
      transmission,
      body_style,
      exterior_color,
      is_active,
      published_to_meta,
      status,
      created_at
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
    .select("*")
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

function buildMinimalRssXml(items) {
  const itemsXml = items
    .map((item) => {
      const imageTags = item.images
        .map((imageUrl, index) =>
          index === 0
            ? `<g:image_link>${escapeXml(imageUrl)}</g:image_link>`
            : `<g:additional_image_link>${escapeXml(imageUrl)}</g:additional_image_link>`
        )
        .join("");

      const mileageTag =
        item.mileage_value !== "" && item.mileage_value !== null && item.mileage_value !== undefined
          ? `<g:mileage>${escapeXml(`${item.mileage_value} ${item.mileage_unit || "KM"}`)}</g:mileage>`
          : "";

      return `<item>
<g:id>${escapeXml(item.id)}</g:id>
<title><![CDATA[${escapeCData(item.title)}]]></title>
<description><![CDATA[${escapeCData(item.description)}]]></description>
<g:availability>${escapeXml(item.availability)}</g:availability>
<g:condition>${escapeXml(item.condition)}</g:condition>
<g:price>${escapeXml(item.price)}</g:price>
<link>${escapeXml(item.link)}</link>
${imageTags}
<g:make>${escapeXml(item.make)}</g:make>
<g:model>${escapeXml(item.model)}</g:model>
<g:year>${escapeXml(item.year)}</g:year>
${mileageTag}
<g:fuel_type>${escapeXml(item.fuel_type)}</g:fuel_type>
<g:transmission>${escapeXml(item.transmission)}</g:transmission>
<g:body_style>${escapeXml(item.body_style)}</g:body_style>
<g:exterior_color>${escapeXml(item.exterior_color)}</g:exterior_color>
</item>`;
    })
    .join("");

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:g="http://base.google.com/ns/1.0">
  <channel>
    <title>Catalogo Veicoli</title>
    <link>${escapeXml(process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000")}</link>
    <description>Feed XML veicoli per catalogo Meta</description>
    ${itemsXml}
  </channel>
</rss>`;
}

export async function GET() {
  try {
    const supabase = getSupabaseAdmin();

    const vehicles = await loadVehicles(supabase);
    const vehicleIds = vehicles.map((v) => v.id);
    const mediaMap = await loadVehicleMedia(supabase, vehicleIds);

    const items = vehicles
      .map((vehicle) => {
        const images = (mediaMap.get(vehicle.id) || [])
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
          fuel_type: normalizeText(vehicle.fuel_type),
          transmission: normalizeText(vehicle.transmission),
          body_style: normalizeText(vehicle.body_style),
          exterior_color: normalizeText(vehicle.exterior_color),
        };
      })
      .filter(Boolean);

    const xml = buildMinimalRssXml(items).trim();

    return new Response(xml, {
      status: 200,
      headers: {
        "Content-Type": "application/xml; charset=utf-8",
        "Content-Disposition": 'inline; filename="meta-feed.xml"',
        "Cache-Control": "public, max-age=0, s-maxage=0",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch (error) {
    return new Response(
      `<?xml version="1.0" encoding="UTF-8"?><error>${escapeXml(
        error.message || "Errore generazione feed"
      )}</error>`,
      {
        status: 500,
        headers: {
          "Content-Type": "application/xml; charset=utf-8",
          "Cache-Control": "no-store, max-age=0",
        },
      }
    );
  }
}