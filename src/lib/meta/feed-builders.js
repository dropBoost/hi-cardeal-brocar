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

function wrapTag(tagName, value) {
  if (value === null || value === undefined || value === "") return "";
  return `<${tagName}>${escapeXml(value)}</${tagName}>`;
}

function wrapGoogleTag(tagName, value) {
  if (value === null || value === undefined || value === "") return "";
  return `<g:${tagName}>${escapeXml(value)}</g:${tagName}>`;
}

function wrapCDataTag(tagName, value) {
  if (value === null || value === undefined || value === "") return "";
  return `<${tagName}><![CDATA[${escapeCData(value)}]]></${tagName}>`;
}

function buildImageTags(images = []) {
  if (!Array.isArray(images) || images.length === 0) return "";

  const validImages = images.filter(Boolean);
  if (validImages.length === 0) return "";

  const [mainImage, ...additionalImages] = validImages;

  let xml = "";
  xml += wrapGoogleTag("image_link", mainImage);

  for (const imageUrl of additionalImages) {
    xml += wrapGoogleTag("additional_image_link", imageUrl);
  }

  return xml;
}

function buildMileageTag(item) {
  if (
    item.mileage_value === null ||
    item.mileage_value === undefined ||
    item.mileage_value === ""
  ) {
    return "";
  }

  const unit = item.mileage_unit || "KM";
  return wrapGoogleTag("mileage", `${item.mileage_value} ${unit}`);
}

function buildEngineSizeTag(item) {
  if (
    item.engine_size === null ||
    item.engine_size === undefined ||
    item.engine_size === ""
  ) {
    return "";
  }

  return wrapGoogleTag("engine_size", item.engine_size);
}

function buildEnginePowerTag(item) {
  if (
    item.engine_power === null ||
    item.engine_power === undefined ||
    item.engine_power === ""
  ) {
    return "";
  }

  const unit = item.engine_power_unit || "";
  return wrapGoogleTag(
    "engine_power",
    unit ? `${item.engine_power} ${unit}` : item.engine_power
  );
}

function buildCoordinatesTag(item) {
  let xml = "";

  if (
    item.latitude !== null &&
    item.latitude !== undefined &&
    item.latitude !== ""
  ) {
    xml += wrapGoogleTag("latitude", item.latitude);
  }

  if (
    item.longitude !== null &&
    item.longitude !== undefined &&
    item.longitude !== ""
  ) {
    xml += wrapGoogleTag("longitude", item.longitude);
  }

  return xml;
}

function buildVehicleItemXml(item) {
  let xml = "<item>";

  // Campi base
  xml += wrapGoogleTag("id", item.id);
  xml += wrapCDataTag("title", item.title);
  xml += wrapCDataTag("description", item.description);
  xml += wrapGoogleTag("availability", item.availability);
  xml += wrapGoogleTag("condition", item.condition);
  xml += wrapGoogleTag("price", item.price);
  xml += wrapTag("link", item.link);

  // Immagini
  xml += buildImageTags(item.images);

  // Campi automotive principali
  xml += wrapGoogleTag("make", item.make);
  xml += wrapGoogleTag("model", item.model);
  xml += wrapGoogleTag("year", item.year);
  xml += buildMileageTag(item);
  xml += wrapGoogleTag("vin", item.vin);
  xml += wrapGoogleTag("fuel_type", item.fuel_type);
  xml += wrapGoogleTag("transmission", item.transmission);
  xml += wrapGoogleTag("body_style", item.body_style);
  xml += wrapGoogleTag("exterior_color", item.exterior_color);
  xml += wrapGoogleTag("interior_color", item.interior_color);
  xml += wrapGoogleTag("state_of_vehicle", item.state_of_vehicle);
  xml += wrapGoogleTag("emissions_standard", item.emissions_standard);
  xml += wrapGoogleTag("vehicle_type", item.vehicle_type);
  xml += wrapGoogleTag("trim", item.trim);
  xml += wrapGoogleTag("drivetrain", item.drivetrain);

  // Campi aggiuntivi
  xml += wrapGoogleTag("stock_number", item.stock_number);
  xml += wrapGoogleTag("license_plate", item.license_plate);
  xml += wrapGoogleTag("doors", item.doors);
  xml += buildEngineSizeTag(item);
  xml += buildEnginePowerTag(item);
  xml += wrapGoogleTag("date_first_registration", item.date_first_registration);
  xml += wrapGoogleTag("co2_emissions", item.co2_emissions);

  // Seller / location
  xml += wrapGoogleTag("seller_name", item.seller_name);
  xml += wrapGoogleTag("phone", item.seller_phone);
  xml += wrapGoogleTag("seller_email", item.seller_email);
  xml += wrapGoogleTag("address", item.seller_address);
  xml += buildCoordinatesTag(item);

  xml += "</item>";

  return xml;
}

export function buildMetaVehicleFeedXml({
  title = "Catalogo Veicoli",
  link = "https://example.com",
  description = "Feed veicoli per catalogo Meta",
  items = [],
} = {}) {
  const safeItems = Array.isArray(items) ? items : [];
  const itemsXml = safeItems.map(buildVehicleItemXml).join("");

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:g="http://base.google.com/ns/1.0">
  <channel>
    <title>${escapeXml(title)}</title>
    <link>${escapeXml(link)}</link>
    <description>${escapeXml(description)}</description>
    ${itemsXml}
  </channel>
</rss>`;
}

export function buildMetaVehicleFeedResponse(options = {}) {
  return buildMetaVehicleFeedXml(options).trim();
}