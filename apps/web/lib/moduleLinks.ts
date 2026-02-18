const DEFAULT_COTIZACIONES_APP_URL = "https://cops-platform-cotizaciones.vercel.app/";
const DEFAULT_TICKETS_APP_URL = "https://cops-platform-tickets.vercel.app/";

function toAbsoluteUrl(raw: string) {
  const trimmed = raw.trim();
  if (!trimmed) return null;

  const withProtocol = /^https?:\/\//i.test(trimmed)
    ? trimmed
    : `https://${trimmed}`;

  try {
    const parsed = new URL(withProtocol);
    return parsed.toString();
  } catch {
    return null;
  }
}

export function getCotizacionesAppUrl() {
  const candidates = [
    process.env.COTIZACIONES_APP_URL,
    process.env.NEXT_PUBLIC_COTIZACIONES_APP_URL,
    process.env.cops_cotizaciones_key,
    process.env.NEXT_PUBLIC_COPS_COTIZACIONES_KEY,
    DEFAULT_COTIZACIONES_APP_URL,
  ];

  for (const candidate of candidates) {
    if (!candidate) continue;
    const normalized = toAbsoluteUrl(candidate);
    if (normalized) return normalized;
  }

  return DEFAULT_COTIZACIONES_APP_URL;
}

export function getTicketsAppUrl() {
  const candidates = [
    process.env.TICKETS_APP_URL,
    process.env.NEXT_PUBLIC_TICKETS_APP_URL,
    DEFAULT_TICKETS_APP_URL,
  ];

  for (const candidate of candidates) {
    if (!candidate) continue;
    const normalized = toAbsoluteUrl(candidate);
    if (normalized) return normalized;
  }

  return DEFAULT_TICKETS_APP_URL;
}

export function getCotizacionesClientUrl() {
  if (typeof window === "undefined") {
    return DEFAULT_COTIZACIONES_APP_URL;
  }

  const candidates = [
    process.env.NEXT_PUBLIC_COTIZACIONES_APP_URL,
    process.env.NEXT_PUBLIC_COPS_COTIZACIONES_KEY,
  ];

  for (const candidate of candidates) {
    if (!candidate) continue;
    const normalized = toAbsoluteUrl(candidate);
    if (normalized) return normalized;
  }

  return DEFAULT_COTIZACIONES_APP_URL;
}
