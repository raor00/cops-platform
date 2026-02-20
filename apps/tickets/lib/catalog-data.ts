// Catálogo de productos — espejo del DEFAULT_CATALOG de la app de cotizaciones.
// Sincronizar manualmente si se agregan productos en apps/cotizaciones/lib/quotation-types.ts

export interface CatalogEntry {
  code: string
  description: string
  unitPrice: number
  category: string
  unit: string
}

export const CATALOG_CATEGORIES = [
  "CCTV",
  "Control de Acceso",
  "Alarmas",
  "Redes",
  "VMS",
  "Energia",
  "Materiales",
  "Automatizacion",
] as const

export const TICKET_CATALOG: CatalogEntry[] = [
  // CCTV
  { code: "CAM-HIK-DS2CD2143G2", description: "Camara IP Hikvision DS-2CD2143G2-IS 4MP Domo IR 30m PoE", unitPrice: 185, category: "CCTV", unit: "UND" },
  { code: "CAM-HIK-DS2CD2T47G2", description: "Camara IP Hikvision DS-2CD2T47G2-L 4MP Bullet ColorVu", unitPrice: 220, category: "CCTV", unit: "UND" },
  { code: "CAM-HIK-DS2DE4425IW", description: "Camara IP PTZ Hikvision DS-2DE4425IW-DE 4MP 25x Zoom", unitPrice: 650, category: "CCTV", unit: "UND" },
  { code: "NVR-HIK-DS7732NI-K4", description: "NVR Hikvision DS-7732NI-K4 32 Canales 4HDD H.265+", unitPrice: 480, category: "CCTV", unit: "UND" },
  { code: "NVR-HIK-DS7616NI-K2", description: "NVR Hikvision DS-7616NI-K2 16 Canales 2HDD H.265+", unitPrice: 290, category: "CCTV", unit: "UND" },
  { code: "HDD-WD-PURPLE-4TB", description: "Disco Duro WD Purple 4TB Surveillance WD43PURZ", unitPrice: 120, category: "CCTV", unit: "UND" },
  { code: "HDD-WD-PURPLE-8TB", description: "Disco Duro WD Purple 8TB Surveillance WD84PURZ", unitPrice: 210, category: "CCTV", unit: "UND" },
  // Control de Acceso
  { code: "ACC-HIK-DS-K1T671M", description: "Terminal de Acceso Facial Hikvision DS-K1T671M 7\" LCD", unitPrice: 520, category: "Control de Acceso", unit: "UND" },
  { code: "ACC-HIK-DS-K1T342M", description: "Terminal de Acceso Hikvision DS-K1T342M Huella/Tarjeta", unitPrice: 280, category: "Control de Acceso", unit: "UND" },
  { code: "ACC-LOCK-ELEC-600", description: "Electroiman 600 lbs con soporte L y sensor", unitPrice: 85, category: "Control de Acceso", unit: "UND" },
  { code: "ACC-BOTON-SALIDA", description: "Boton de Salida No Touch con LED Infrarrojo", unitPrice: 25, category: "Control de Acceso", unit: "UND" },
  // Alarmas
  { code: "ALR-DSC-PC1832", description: "Panel de Alarma DSC PowerSeries PC1832 8 Zonas Expandible", unitPrice: 145, category: "Alarmas", unit: "UND" },
  { code: "ALR-DSC-PG9914", description: "Detector de Movimiento DSC PG9914 PIR Inalambrico", unitPrice: 95, category: "Alarmas", unit: "UND" },
  { code: "ALR-SIR-EXT-30W", description: "Sirena Exterior 30W con Luz Estroboscopica", unitPrice: 65, category: "Alarmas", unit: "UND" },
  { code: "ALR-TECLADO-PK5500", description: "Teclado LCD DSC PK5500 PowerSeries", unitPrice: 75, category: "Alarmas", unit: "UND" },
  // Redes
  { code: "SW-HIK-DS3E1326P", description: "Switch PoE Hikvision DS-3E1326P-EI 24P Gigabit Gestionable", unitPrice: 350, category: "Redes", unit: "UND" },
  { code: "SW-HIK-DS3E0510P", description: "Switch PoE Hikvision DS-3E0510P-E 8P 10/100/1000", unitPrice: 120, category: "Redes", unit: "UND" },
  { code: "CBL-FIBER-SM-1KM", description: "Fibra Optica Monomodo SM 6 Hilos 1Km", unitPrice: 280, category: "Redes", unit: "UND" },
  // VMS
  { code: "VMS-MILESTONE-XPE", description: "Licencia Milestone XProtect Express+ por Camara", unitPrice: 90, category: "VMS", unit: "UND" },
  { code: "VMS-MILESTONE-PRO", description: "Licencia Milestone XProtect Professional+ por Camara", unitPrice: 180, category: "VMS", unit: "UND" },
  { code: "NOVASTAR-VX400", description: "NovaStar VX400 All-in-One LED Display Controller", unitPrice: 3900, category: "VMS", unit: "UND" },
  // Energia
  { code: "UPS-APC-SRT3000", description: "UPS APC Smart-UPS SRT 3000VA 208V Online Doble Conversion", unitPrice: 2200, category: "Energia", unit: "UND" },
  { code: "UPS-APC-SMT1500", description: "UPS APC Smart-UPS 1500VA LCD 120V", unitPrice: 680, category: "Energia", unit: "UND" },
  { code: "FNT-REG-12V-30A", description: "Fuente Regulada 12V 30A con Respaldo para Bateria", unitPrice: 75, category: "Energia", unit: "UND" },
  { code: "BAT-12V-7AH", description: "Bateria Recargable 12V 7Ah Sellada", unitPrice: 18, category: "Energia", unit: "UND" },
  // Materiales
  { code: "MAT-UTP-CAT6-305", description: "Bobina Cable UTP Cat6 305m Exterior Doble Forro", unitPrice: 95, category: "Materiales", unit: "BOB" },
  { code: "MAT-UTP-CAT6-INT", description: "Bobina Cable UTP Cat6 305m Interior", unitPrice: 68, category: "Materiales", unit: "BOB" },
  { code: "MAT-RJ45-CAT6", description: "Conector RJ45 Cat6 Macho (Bolsa x100)", unitPrice: 12, category: "Materiales", unit: "BLS" },
  { code: "MAT-JACK-CAT6", description: "Jack Keystone Cat6 Hembra", unitPrice: 3.5, category: "Materiales", unit: "UND" },
  { code: "MAT-PATCH-PANEL-24", description: "Patch Panel 24 Puertos Cat6 1U Rack", unitPrice: 45, category: "Materiales", unit: "UND" },
  { code: "MAT-TUB-EMT-3/4", description: "Tuberia EMT 3/4\" x 3m Galvanizada", unitPrice: 4.5, category: "Materiales", unit: "UND" },
  { code: "MAT-TUB-EMT-1", description: "Tuberia EMT 1\" x 3m Galvanizada", unitPrice: 6.8, category: "Materiales", unit: "UND" },
  { code: "MAT-TUB-PVC-3/4", description: "Tuberia PVC 3/4\" x 3m Electrica", unitPrice: 2.5, category: "Materiales", unit: "UND" },
  { code: "MAT-CANALETA-40X25", description: "Canaleta Plastica 40x25mm x 2m con Adhesivo", unitPrice: 3.8, category: "Materiales", unit: "UND" },
  { code: "MAT-CANALETA-60X40", description: "Canaleta Plastica 60x40mm x 2m con Adhesivo", unitPrice: 5.5, category: "Materiales", unit: "UND" },
  { code: "MAT-CANALETA-100X45", description: "Canaleta Plastica 100x45mm x 2m con Division", unitPrice: 9.5, category: "Materiales", unit: "UND" },
  { code: "MAT-CABLE-ST-2X18", description: "Cable de Senal Blindado 2x18 AWG (por metro)", unitPrice: 0.85, category: "Materiales", unit: "MTS" },
  { code: "MAT-CABLE-POT-2X16", description: "Cable de Potencia 2x16 AWG (por metro)", unitPrice: 0.65, category: "Materiales", unit: "MTS" },
  { code: "MAT-PATCH-CORD-1M", description: "Patch Cord UTP Cat6 1m", unitPrice: 2.5, category: "Materiales", unit: "UND" },
  { code: "MAT-PATCH-CORD-3M", description: "Patch Cord UTP Cat6 3m", unitPrice: 4, category: "Materiales", unit: "UND" },
  { code: "MAT-RACK-6U", description: "Gabinete de Pared 6U 600x450mm con Llave", unitPrice: 85, category: "Materiales", unit: "UND" },
  { code: "MAT-RACK-12U", description: "Gabinete de Pared 12U 600x600mm con Llave", unitPrice: 145, category: "Materiales", unit: "UND" },
  { code: "MAT-SOPORTE-PARED", description: "Soporte de Pared para Camara Domo/Bullet", unitPrice: 8, category: "Materiales", unit: "UND" },
  { code: "MAT-SOPORTE-TECHO", description: "Soporte de Techo Colgante para Camara Domo", unitPrice: 15, category: "Materiales", unit: "UND" },
  // Automatizacion
  { code: "OF1628", description: "Controlador OptiFlex BACnet & Router. Automated Logic", unitPrice: 17028.9, category: "Automatizacion", unit: "UND" },
  { code: "NSB-10K-2-H200-O-BB2-A", description: "Detector Ambiente Temp+Humedad. Automated Logic", unitPrice: 372.65, category: "Automatizacion", unit: "UND" },
  { code: "EQT3-7", description: "Display EQT touchscreen 7\" color. Automated Logic", unitPrice: 2548, category: "Automatizacion", unit: "UND" },
  { code: "FIO812U", description: "Modulo de Expansion 12 Entradas - 8 Salidas. Automated Logic", unitPrice: 3997.15, category: "Automatizacion", unit: "UND" },
  { code: "FIO88U", description: "Modulo de Expansion 8 Entradas - 8 Salidas. Automated Logic", unitPrice: 3065.2, category: "Automatizacion", unit: "UND" },
]
