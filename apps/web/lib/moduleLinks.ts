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
  ];

  for (const candidate of candidates) {
    if (!candidate) continue;
    const normalized = toAbsoluteUrl(candidate);
    if (normalized) return normalized;
  }

  return null;
}
