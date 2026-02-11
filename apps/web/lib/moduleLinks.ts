export function getCotizacionesAppUrl() {
  const fromServer = process.env.COTIZACIONES_APP_URL;
  const fromPublic = process.env.NEXT_PUBLIC_COTIZACIONES_APP_URL;
  const candidate = fromServer ?? fromPublic ?? "";
  const normalized = candidate.trim();

  if (!normalized) {
    return null;
  }

  return normalized;
}
