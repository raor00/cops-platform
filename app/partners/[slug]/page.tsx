export type Partner = {
  name: string;
  slug: string;
  logo: string;      // ruta en /public (ej: "/partners/milestone.png")
  website?: string;  // opcional
  short: string;     // descripción corta (para card)
  description: string; // descripción completa (para ver más / detalle)
  tags: string[];
};

export const PARTNERS: Partner[] = [
  {
    name: "Milestone",
    slug: "milestone",
    logo: "/partners/milestone.png",
    website: "https://www.milestonesys.com",
    short: "VMS enterprise abierto, escalable e interoperable.",
    description:
      "Plataforma VMS de clase enterprise para operación multi-sede, estandarización, auditoría y escalabilidad. Ideal para entornos críticos donde la trazabilidad y la continuidad operativa son prioridad.",
    tags: ["VMS", "Enterprise", "Multi-sede"],
  },
  {
    name: "Winsted",
    slug: "winsted",
    logo: "/partners/winsted.png",
    website: "https://www.winsted.com",
    short: "Consolas y mobiliario técnico para centros de control.",
    description:
      "Diseño de consolas y mobiliario para salas de control 24/7. Ergonomía, gestión de cableado y robustez para operación continua.",
    tags: ["NOC", "SOC", "Salas de control"],
  },
  {
    name: "Invenzi",
    slug: "invenzi",
    logo: "/partners/invenzi.png",
    website: "https://www.invenzi.com",
    short: "Control de acceso e identidades a escala enterprise.",
    description:
      "Plataforma de control de acceso e identidades para entornos regulados: reglas por zonas, visitantes, auditoría y reportes. Integrable con video y eventos.",
    tags: ["Acceso", "Identidades", "Auditoría"],
  },
  {
    name: "Altronix",
    slug: "altronix",
    logo: "/partners/altronix.png",
    website: "https://www.altronix.com",
    short: "Energía y distribución para sistemas de seguridad.",
    description:
      "Soluciones de energía, distribución y protección para CCTV y control de acceso. Diseñadas para confiabilidad y continuidad operativa.",
    tags: ["Energía", "Distribución", "Protección"],
  },
  {
    name: "Automated Logic",
    slug: "automated-logic",
    logo: "/partners/automated-logic.png",
    website: "https://www.automatedlogic.com",
    short: "BMS para edificios inteligentes y operación eficiente.",
    description:
      "Soluciones BMS para monitoreo, control, alarmas y optimización de edificios e infraestructura crítica con tableros operativos.",
    tags: ["BMS", "Monitoreo", "Edificios inteligentes"],
  },
  {
    name: "Velasea",
    slug: "velasea",
    logo: "/partners/velasea.png",
    website: "https://velasea.com",
    short: "Soluciones tecnológicas para operación y entornos críticos.",
    description:
      "Ecosistema de soluciones orientadas a operación crítica e integración. Implementaciones alineadas a continuidad y control.",
    tags: ["Integración", "Operación", "Enterprise"],
  },
  {
    name: "Magos",
    slug: "magos",
    logo: "/partners/magos.png",
    website: "https://www.magos.com", // si no es correcto, lo quitamos
    short: "Monitoreo avanzado y analíticas basadas en radares.",
    description:
      "Tecnologías de monitoreo y detección con enfoque en radares y control de eventos para entornos de alta exigencia. Integrable a flujos operativos y respuesta.",
    tags: ["Radares", "Monitoreo", "Analíticas"],
  },
  {
    name: "Digital Watchdog",
    slug: "digital-watchdog",
    logo: "/partners/digital.png",
    website: "https://digital-watchdog.com",
    short: "Video y herramientas de gestión para operación.",
    description:
      "Soluciones de video, grabación y administración orientadas a despliegues escalables. Apoyo en operación y visibilidad de eventos.",
    tags: ["Video", "Grabación", "Operación"],
  },
];
