export type QuotationType = "proyecto" | "servicio" | "mantenimiento"

export interface QuotationItem {
  id: string
  quantity: number
  code: string
  description: string
  unitPrice: number
  totalPrice: number
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
  code: string
  type: QuotationType
  subject: string
  clientInfo: ClientInfo
  items: QuotationItem[]
  laborCost: number
  laborDescription: string
  issueDate: string
  validUntil: string
  notes: string
  termsAndConditions: string
  paymentCondition: string
  subtotal: number
  ivaRate: number
  ivaAmount: number
  total: number
}

export interface PresetItem {
  code: string
  description: string
  unitPrice: number
  category: string
}

export const PRESET_ITEMS: PresetItem[] = [
  // CCTV
  { code: "CAM-HIK-DS2CD2143G2", description: "Camara IP Hikvision DS-2CD2143G2-IS 4MP Domo IR 30m PoE", unitPrice: 185, category: "CCTV" },
  { code: "CAM-HIK-DS2CD2T47G2", description: "Camara IP Hikvision DS-2CD2T47G2-L 4MP Bullet ColorVu", unitPrice: 220, category: "CCTV" },
  { code: "CAM-HIK-DS2DE4425IW", description: "Camara IP PTZ Hikvision DS-2DE4425IW-DE 4MP 25x Zoom", unitPrice: 650, category: "CCTV" },
  { code: "NVR-HIK-DS7732NI-K4", description: "NVR Hikvision DS-7732NI-K4 32 Canales 4HDD H.265+", unitPrice: 480, category: "CCTV" },
  { code: "NVR-HIK-DS7616NI-K2", description: "NVR Hikvision DS-7616NI-K2 16 Canales 2HDD H.265+", unitPrice: 290, category: "CCTV" },
  { code: "HDD-WD-PURPLE-4TB", description: "Disco Duro WD Purple 4TB Surveillance WD43PURZ", unitPrice: 120, category: "CCTV" },
  { code: "HDD-WD-PURPLE-8TB", description: "Disco Duro WD Purple 8TB Surveillance WD84PURZ", unitPrice: 210, category: "CCTV" },
  
  // Control de Acceso
  { code: "ACC-HIK-DS-K1T671M", description: "Terminal de Acceso Facial Hikvision DS-K1T671M 7\" LCD", unitPrice: 520, category: "Control de Acceso" },
  { code: "ACC-HIK-DS-K1T342M", description: "Terminal de Acceso Hikvision DS-K1T342M Huella/Tarjeta", unitPrice: 280, category: "Control de Acceso" },
  { code: "ACC-LOCK-ELEC-600", description: "Electroiman 600 lbs con soporte L y sensor", unitPrice: 85, category: "Control de Acceso" },
  
  // Alarmas
  { code: "ALR-DSC-PC1832", description: "Panel de Alarma DSC PowerSeries PC1832 8 Zonas Expandible", unitPrice: 145, category: "Alarmas" },
  { code: "ALR-DSC-PG9914", description: "Detector de Movimiento DSC PG9914 PIR Inalambrico", unitPrice: 95, category: "Alarmas" },
  { code: "ALR-SIR-EXT-30W", description: "Sirena Exterior 30W con Luz Estroboscopica", unitPrice: 65, category: "Alarmas" },

  // Redes y Cableado
  { code: "SW-HIK-DS3E1326P", description: "Switch PoE Hikvision DS-3E1326P-EI 24P Gigabit Gestionable", unitPrice: 350, category: "Redes" },
  { code: "SW-HIK-DS3E0510P", description: "Switch PoE Hikvision DS-3E0510P-E 8P 10/100/1000", unitPrice: 120, category: "Redes" },
  { code: "CBL-UTP-CAT6-305", description: "Bobina Cable UTP Cat6 305m Exterior Doble Forro", unitPrice: 95, category: "Redes" },
  { code: "CBL-FIBER-SM-1KM", description: "Fibra Optica Monomodo SM 6 Hilos 1Km", unitPrice: 280, category: "Redes" },
  
  // VMS / BMS
  { code: "VMS-MILESTONE-XPE", description: "Licencia Milestone XProtect Express+ por Camara", unitPrice: 90, category: "VMS" },
  { code: "VMS-MILESTONE-PRO", description: "Licencia Milestone XProtect Professional+ por Camara", unitPrice: 180, category: "VMS" },
  { code: "NOVASTAR-VX400", description: "NovaStar VX400 All-in-One LED Display Controller Video Processor", unitPrice: 3900, category: "VMS" },
  
  // Energia y Respaldo
  { code: "UPS-APC-SRT3000", description: "UPS APC Smart-UPS SRT 3000VA 208V Online Doble Conversion", unitPrice: 2200, category: "Energia" },
  { code: "UPS-APC-SMT1500", description: "UPS APC Smart-UPS 1500VA LCD 120V", unitPrice: 680, category: "Energia" },
  { code: "FNT-REG-12V-30A", description: "Fuente Regulada 12V 30A con Respaldo para Bateria", unitPrice: 75, category: "Energia" },
]

export const CATEGORIES = [
  "CCTV",
  "Control de Acceso",
  "Alarmas",
  "Redes",
  "VMS",
  "Energia",
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
