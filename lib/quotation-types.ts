export type QuotationType = "proyecto" | "servicio" | "mantenimiento"

export type CatalogCategory =
  | "CCTV"
  | "Control de Acceso"
  | "Alarmas"
  | "Redes"
  | "VMS"
  | "Energia"
  | "Materiales"

export interface CatalogItem {
  id: string
  code: string
  description: string
  unitPrice: number
  category: CatalogCategory
  unit: string
}

export interface QuotationItem {
  id: string
  quantity: number
  code: string
  description: string
  unitPrice: number
  totalPrice: number
  category?: CatalogCategory
}

export interface LaborItem {
  id: string
  description: string
  cost: number
}

export interface ClientInfo {
  name: string
  attention: string
  email: string
  rif: string
  phone: string
  address: string
}

export interface QuotationData {
  id: string
  code: string
  type: QuotationType
  subject: string
  clientInfo: ClientInfo
  items: QuotationItem[]
  materials: QuotationItem[]
  laborItems: LaborItem[]
  issueDate: string
  validUntil: string
  notes: string
  termsAndConditions: string
  paymentCondition: string
  subtotalEquipment: number
  subtotalMaterials: number
  subtotalLabor: number
  ivaRate: number
  ivaAmount: number
  total: number
  createdAt: string
  status: "borrador" | "enviada" | "aprobada" | "rechazada"
}

export const CATALOG_CATEGORIES: CatalogCategory[] = [
  "CCTV",
  "Control de Acceso",
  "Alarmas",
  "Redes",
  "VMS",
  "Energia",
  "Materiales",
]

export const DEFAULT_CATALOG: CatalogItem[] = [
  // CCTV
  { id: "1", code: "CAM-HIK-DS2CD2143G2", description: "Camara IP Hikvision DS-2CD2143G2-IS 4MP Domo IR 30m PoE", unitPrice: 185, category: "CCTV", unit: "UND" },
  { id: "2", code: "CAM-HIK-DS2CD2T47G2", description: "Camara IP Hikvision DS-2CD2T47G2-L 4MP Bullet ColorVu", unitPrice: 220, category: "CCTV", unit: "UND" },
  { id: "3", code: "CAM-HIK-DS2DE4425IW", description: "Camara IP PTZ Hikvision DS-2DE4425IW-DE 4MP 25x Zoom", unitPrice: 650, category: "CCTV", unit: "UND" },
  { id: "4", code: "NVR-HIK-DS7732NI-K4", description: "NVR Hikvision DS-7732NI-K4 32 Canales 4HDD H.265+", unitPrice: 480, category: "CCTV", unit: "UND" },
  { id: "5", code: "NVR-HIK-DS7616NI-K2", description: "NVR Hikvision DS-7616NI-K2 16 Canales 2HDD H.265+", unitPrice: 290, category: "CCTV", unit: "UND" },
  { id: "6", code: "HDD-WD-PURPLE-4TB", description: "Disco Duro WD Purple 4TB Surveillance WD43PURZ", unitPrice: 120, category: "CCTV", unit: "UND" },
  { id: "7", code: "HDD-WD-PURPLE-8TB", description: "Disco Duro WD Purple 8TB Surveillance WD84PURZ", unitPrice: 210, category: "CCTV", unit: "UND" },

  // Control de Acceso
  { id: "8", code: "ACC-HIK-DS-K1T671M", description: "Terminal de Acceso Facial Hikvision DS-K1T671M 7\" LCD", unitPrice: 520, category: "Control de Acceso", unit: "UND" },
  { id: "9", code: "ACC-HIK-DS-K1T342M", description: "Terminal de Acceso Hikvision DS-K1T342M Huella/Tarjeta", unitPrice: 280, category: "Control de Acceso", unit: "UND" },
  { id: "10", code: "ACC-LOCK-ELEC-600", description: "Electroiman 600 lbs con soporte L y sensor", unitPrice: 85, category: "Control de Acceso", unit: "UND" },
  { id: "11", code: "ACC-BOTON-SALIDA", description: "Boton de Salida No Touch con LED Infrarrojo", unitPrice: 25, category: "Control de Acceso", unit: "UND" },

  // Alarmas
  { id: "12", code: "ALR-DSC-PC1832", description: "Panel de Alarma DSC PowerSeries PC1832 8 Zonas Expandible", unitPrice: 145, category: "Alarmas", unit: "UND" },
  { id: "13", code: "ALR-DSC-PG9914", description: "Detector de Movimiento DSC PG9914 PIR Inalambrico", unitPrice: 95, category: "Alarmas", unit: "UND" },
  { id: "14", code: "ALR-SIR-EXT-30W", description: "Sirena Exterior 30W con Luz Estroboscopica", unitPrice: 65, category: "Alarmas", unit: "UND" },
  { id: "15", code: "ALR-TECLADO-PK5500", description: "Teclado LCD DSC PK5500 PowerSeries", unitPrice: 75, category: "Alarmas", unit: "UND" },

  // Redes
  { id: "16", code: "SW-HIK-DS3E1326P", description: "Switch PoE Hikvision DS-3E1326P-EI 24P Gigabit Gestionable", unitPrice: 350, category: "Redes", unit: "UND" },
  { id: "17", code: "SW-HIK-DS3E0510P", description: "Switch PoE Hikvision DS-3E0510P-E 8P 10/100/1000", unitPrice: 120, category: "Redes", unit: "UND" },
  { id: "18", code: "CBL-FIBER-SM-1KM", description: "Fibra Optica Monomodo SM 6 Hilos 1Km", unitPrice: 280, category: "Redes", unit: "UND" },

  // VMS
  { id: "19", code: "VMS-MILESTONE-XPE", description: "Licencia Milestone XProtect Express+ por Camara", unitPrice: 90, category: "VMS", unit: "UND" },
  { id: "20", code: "VMS-MILESTONE-PRO", description: "Licencia Milestone XProtect Professional+ por Camara", unitPrice: 180, category: "VMS", unit: "UND" },
  { id: "21", code: "NOVASTAR-VX400", description: "NovaStar VX400 All-in-One LED Display Controller Video Processor", unitPrice: 3900, category: "VMS", unit: "UND" },

  // Energia y Respaldo
  { id: "22", code: "UPS-APC-SRT3000", description: "UPS APC Smart-UPS SRT 3000VA 208V Online Doble Conversion", unitPrice: 2200, category: "Energia", unit: "UND" },
  { id: "23", code: "UPS-APC-SMT1500", description: "UPS APC Smart-UPS 1500VA LCD 120V", unitPrice: 680, category: "Energia", unit: "UND" },
  { id: "24", code: "FNT-REG-12V-30A", description: "Fuente Regulada 12V 30A con Respaldo para Bateria", unitPrice: 75, category: "Energia", unit: "UND" },
  { id: "25", code: "BAT-12V-7AH", description: "Bateria Recargable 12V 7Ah Sellada", unitPrice: 18, category: "Energia", unit: "UND" },

  // Materiales
  { id: "26", code: "MAT-UTP-CAT6-305", description: "Bobina Cable UTP Cat6 305m Exterior Doble Forro", unitPrice: 95, category: "Materiales", unit: "BOB" },
  { id: "27", code: "MAT-UTP-CAT6-INT", description: "Bobina Cable UTP Cat6 305m Interior", unitPrice: 68, category: "Materiales", unit: "BOB" },
  { id: "28", code: "MAT-RJ45-CAT6", description: "Conector RJ45 Cat6 Macho (Bolsa x100)", unitPrice: 12, category: "Materiales", unit: "BLS" },
  { id: "29", code: "MAT-RJ45-BOOT", description: "Bota Protectora RJ45 (Bolsa x100)", unitPrice: 5, category: "Materiales", unit: "BLS" },
  { id: "30", code: "MAT-JACK-CAT6", description: "Jack Keystone Cat6 Hembra", unitPrice: 3.5, category: "Materiales", unit: "UND" },
  { id: "31", code: "MAT-PATCH-PANEL-24", description: "Patch Panel 24 Puertos Cat6 1U Rack", unitPrice: 45, category: "Materiales", unit: "UND" },
  { id: "32", code: "MAT-FACE-PLATE-2", description: "Faceplate 2 Puertos con Tapa", unitPrice: 2.5, category: "Materiales", unit: "UND" },
  { id: "33", code: "MAT-CAJETIN-4X4", description: "Cajetin Plastico 4x4 para Empotrar", unitPrice: 1.2, category: "Materiales", unit: "UND" },
  { id: "34", code: "MAT-CAJETIN-2X4", description: "Cajetin Plastico 2x4 para Empotrar", unitPrice: 0.8, category: "Materiales", unit: "UND" },
  { id: "35", code: "MAT-TUB-EMT-3/4", description: "Tuberia EMT 3/4\" x 3m Galvanizada", unitPrice: 4.5, category: "Materiales", unit: "UND" },
  { id: "36", code: "MAT-TUB-EMT-1", description: "Tuberia EMT 1\" x 3m Galvanizada", unitPrice: 6.8, category: "Materiales", unit: "UND" },
  { id: "37", code: "MAT-TUB-PVC-3/4", description: "Tuberia PVC 3/4\" x 3m Electrica", unitPrice: 2.5, category: "Materiales", unit: "UND" },
  { id: "38", code: "MAT-TUB-PVC-1", description: "Tuberia PVC 1\" x 3m Electrica", unitPrice: 3.2, category: "Materiales", unit: "UND" },
  { id: "39", code: "MAT-CANALETA-40X25", description: "Canaleta Plastica 40x25mm x 2m con Adhesivo", unitPrice: 3.8, category: "Materiales", unit: "UND" },
  { id: "40", code: "MAT-CANALETA-60X40", description: "Canaleta Plastica 60x40mm x 2m con Adhesivo", unitPrice: 5.5, category: "Materiales", unit: "UND" },
  { id: "41", code: "MAT-CANALETA-100X45", description: "Canaleta Plastica 100x45mm x 2m con Division", unitPrice: 9.5, category: "Materiales", unit: "UND" },
  { id: "42", code: "MAT-CURVA-EMT-3/4", description: "Curva EMT 3/4\" Galvanizada", unitPrice: 1.5, category: "Materiales", unit: "UND" },
  { id: "43", code: "MAT-CONECTOR-EMT-3/4", description: "Conector EMT 3/4\" Recto", unitPrice: 0.8, category: "Materiales", unit: "UND" },
  { id: "44", code: "MAT-ABRAZADERA-3/4", description: "Abrazadera Metalica Tipo Omega 3/4\"", unitPrice: 0.3, category: "Materiales", unit: "UND" },
  { id: "45", code: "MAT-CABLE-ST-2X18", description: "Cable de Señal Blindado 2x18 AWG (por metro)", unitPrice: 0.85, category: "Materiales", unit: "MTS" },
  { id: "46", code: "MAT-CABLE-POT-2X16", description: "Cable de Potencia 2x16 AWG (por metro)", unitPrice: 0.65, category: "Materiales", unit: "MTS" },
  { id: "47", code: "MAT-PATCH-CORD-1M", description: "Patch Cord UTP Cat6 1m", unitPrice: 2.5, category: "Materiales", unit: "UND" },
  { id: "48", code: "MAT-PATCH-CORD-3M", description: "Patch Cord UTP Cat6 3m", unitPrice: 4, category: "Materiales", unit: "UND" },
  { id: "49", code: "MAT-AMARRAS-300", description: "Amarras Plasticas 300mm (Bolsa x100)", unitPrice: 3, category: "Materiales", unit: "BLS" },
  { id: "50", code: "MAT-RACK-6U", description: "Gabinete de Pared 6U 600x450mm con Llave", unitPrice: 85, category: "Materiales", unit: "UND" },
  { id: "51", code: "MAT-RACK-12U", description: "Gabinete de Pared 12U 600x600mm con Llave", unitPrice: 145, category: "Materiales", unit: "UND" },
  { id: "52", code: "MAT-BANDEJA-1U", description: "Bandeja Fija para Rack 1U 250mm", unitPrice: 18, category: "Materiales", unit: "UND" },
  { id: "53", code: "MAT-REGLETA-RACK", description: "Regleta Electrica para Rack 6 Tomas con Breaker", unitPrice: 22, category: "Materiales", unit: "UND" },
  { id: "54", code: "MAT-SOPORTE-PARED", description: "Soporte de Pared para Camara Domo/Bullet", unitPrice: 8, category: "Materiales", unit: "UND" },
  { id: "55", code: "MAT-SOPORTE-TECHO", description: "Soporte de Techo Colgante para Camara Domo", unitPrice: 15, category: "Materiales", unit: "UND" },
]

export const DEFAULT_TERMS = `1. Los precios estan expresados en Dolares Americanos (USD).
2. Los precios no incluyen IVA (16%).
3. Tiempo de entrega: 5 a 15 dias habiles despues de confirmada la orden de compra y recibido el pago.
4. Garantia de equipos: 12 meses por defectos de fabricacion.
5. Garantia de instalacion: 6 meses por mano de obra.
6. La cotizacion no incluye obras civiles, electricas ni cableado estructurado, salvo que se indique expresamente.
7. Cualquier trabajo adicional no contemplado en esta cotizacion sera presupuestado por separado.
8. El cliente debe proveer las condiciones minimas de infraestructura para la instalacion.`

export const PAYMENT_CONDITIONS = [
  "CONTADO / PREPAGADO A TASA EURO BCV",
  "50% ANTICIPO - 50% CONTRA ENTREGA",
  "100% ANTICIPO",
  "CREDITO 30 DIAS",
  "CONTADO CONTRA ENTREGA",
]

export function generateQuotationCode(type: QuotationType): string {
  const prefix = type === "proyecto" ? "P" : type === "servicio" ? "S" : "M"
  const year = new Date().getFullYear()
  const random = Math.floor(Math.random() * 900) + 100
  return `${prefix}-${random}-${year}`
}

export function formatCurrency(amount: number): string {
  return amount.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
}
