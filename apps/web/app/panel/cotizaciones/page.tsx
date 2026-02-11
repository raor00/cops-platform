import { redirect } from "next/navigation";
import { getCotizacionesAppUrl } from "../../../lib/moduleLinks";

export const dynamic = "force-dynamic";

export default function CotizacionesPage() {
  const cotizacionesUrl = getCotizacionesAppUrl();
  redirect(cotizacionesUrl);
}
