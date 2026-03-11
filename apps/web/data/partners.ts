import type { Locale } from "@/lib/i18n/translations";

export type Partner = {
  id: string;
  name: string;
  subtitle: string;
  summary: string;
  description: string;
  tags: string[];
  capabilities: string[];
  website?: string;
  logo: string;
  focus?: string;
  usecases?: string[];
};

type LocalizedPartner = {
  id: string;
  name: string;
  subtitle: Record<Locale, string>;
  summary: Record<Locale, string>;
  description: Record<Locale, string>;
  tags: Record<Locale, string[]>;
  capabilities: Record<Locale, string[]>;
  website?: string;
  logo: string;
  focus?: Record<Locale, string>;
  usecases?: Record<Locale, string[]>;
};

const PARTNER_ENTRIES: LocalizedPartner[] = [
  {
    id: "milestone",
    name: "Milestone",
    subtitle: {
      es: "VMS (Video Management System) para operacion critica",
      en: "VMS (Video Management System) for critical operations",
    },
    summary: {
      es: "Plataforma VMS escalable para operacion multi-sede, integracion multi-marca y control centralizado.",
      en: "Scalable VMS platform for multi-site operations, multi-brand integration, and centralized control.",
    },
    description: {
      es: "Milestone permite estandarizar la operacion de video en entornos enterprise con escalabilidad multi-sede, integracion con camaras y analiticas de terceros, control por roles y auditoria.",
      en: "Milestone standardizes video operations in enterprise environments with multi-site scalability, third-party camera and analytics integration, role-based control, and auditing.",
    },
    tags: {
      es: ["VMS", "Integracion", "Multi-sede"],
      en: ["VMS", "Integration", "Multi-site"],
    },
    capabilities: {
      es: [
        "Arquitecturas escalables para multiples sedes",
        "Integracion con camaras y analiticas de terceros",
        "Gestion de roles, auditoria y operacion centralizada",
        "Estrategias de grabacion, retencion y resiliencia",
      ],
      en: [
        "Scalable architectures for multiple sites",
        "Integration with third-party cameras and analytics",
        "Role management, auditing, and centralized operations",
        "Recording, retention, and resilience strategies",
      ],
    },
    website: "https://www.milestonesys.com/",
    logo: "/partners/milestone.png",
  },
  {
    id: "winsted",
    name: "Winsted",
    subtitle: {
      es: "Consolas y salas de control",
      en: "Consoles and control rooms",
    },
    summary: {
      es: "Mobiliario tecnico para SOC/NOC: ergonomia, robustez y diseno para operacion 24/7.",
      en: "Technical furniture for SOC/NOC: ergonomics, durability, and design for 24/7 operations.",
    },
    description: {
      es: "Winsted disena soluciones de mobiliario para centros de control con enfoque en ergonomia, operacion 24/7 y crecimiento modular.",
      en: "Winsted designs control room furniture solutions focused on ergonomics, 24/7 operation, and modular growth.",
    },
    tags: {
      es: ["SOC/NOC", "24/7", "Ergonomia"],
      en: ["SOC/NOC", "24/7", "Ergonomics"],
    },
    capabilities: {
      es: [
        "Diseno modular para centros de control",
        "Ergonomia para operacion 24/7",
        "Integracion de cableado y equipamiento",
        "Escalabilidad por fases y crecimiento",
      ],
      en: [
        "Modular design for control centers",
        "Ergonomics for 24/7 operation",
        "Integrated cabling and equipment layouts",
        "Phased scalability and growth",
      ],
    },
    website: "https://www.winsted.com/",
    logo: "/partners/winsted.png",
  },
  {
    id: "invenzi",
    name: "Invenzi",
    subtitle: {
      es: "Control de acceso y credenciales",
      en: "Access control and credentials",
    },
    summary: {
      es: "Plataforma enterprise para accesos: roles, visitantes e integracion con terceros.",
      en: "Enterprise access platform for roles, visitors, and third-party integrations.",
    },
    description: {
      es: "Invenzi ofrece control de acceso orientado a entornos enterprise con flujos, roles, visitantes y capacidades de integracion.",
      en: "Invenzi provides enterprise-oriented access control with workflows, roles, visitor management, and integration capabilities.",
    },
    tags: {
      es: ["Acceso", "Visitantes", "Enterprise"],
      en: ["Access", "Visitors", "Enterprise"],
    },
    capabilities: {
      es: [
        "Control de acceso con roles y flujos",
        "Gestion de visitantes y credenciales",
        "Integracion con sistemas de terceros",
        "Reportes y auditoria para cumplimiento",
      ],
      en: [
        "Access control with roles and workflows",
        "Visitor and credential management",
        "Integration with third-party systems",
        "Reporting and auditing for compliance",
      ],
    },
    website: "https://www.invenzi.com/",
    logo: "/partners/invenzi.png",
  },
  {
    id: "altronix",
    name: "Altronix",
    subtitle: {
      es: "Energia y respaldo para seguridad",
      en: "Power and backup for security systems",
    },
    summary: {
      es: "Soluciones de alimentacion y distribucion para CCTV, control de acceso y sistemas criticos.",
      en: "Power supply and distribution solutions for CCTV, access control, and critical systems.",
    },
    description: {
      es: "Altronix provee soluciones de energia y distribucion orientadas a sistemas de seguridad.",
      en: "Altronix delivers power and distribution solutions built for security infrastructure.",
    },
    tags: {
      es: ["Continuidad", "CCTV/Acceso", "Confiabilidad"],
      en: ["Continuity", "CCTV/Access", "Reliability"],
    },
    capabilities: {
      es: [
        "Distribucion y respaldo de energia para seguridad",
        "Fuentes y controladores para infraestructura critica",
        "Buenas practicas de disponibilidad y continuidad",
        "Diseno ordenado para crecimiento y mantenimiento",
      ],
      en: [
        "Power distribution and backup for security systems",
        "Power supplies and controllers for critical infrastructure",
        "Availability and continuity best practices",
        "Clean designs for growth and maintenance",
      ],
    },
    website: "https://www.altronix.com/",
    logo: "/partners/altronix.png",
  },
  {
    id: "automated-logic",
    name: "Automated Logic",
    subtitle: {
      es: "BMS y automatizacion de edificios",
      en: "BMS and building automation",
    },
    summary: {
      es: "Gestion de edificios inteligentes: monitoreo, control y eficiencia operativa.",
      en: "Smart building management with monitoring, control, and operational efficiency.",
    },
    description: {
      es: "Automated Logic habilita proyectos BMS para edificios inteligentes: supervision, control, alarmas y eficiencia operativa.",
      en: "Automated Logic enables BMS projects for smart buildings with supervision, control, alarms, and operational efficiency.",
    },
    tags: {
      es: ["BMS", "Eficiencia", "Enterprise"],
      en: ["BMS", "Efficiency", "Enterprise"],
    },
    capabilities: {
      es: [
        "BMS para control y supervision centralizada",
        "Integracion de subsistemas y tableros operativos",
        "Eficiencia operativa y mantenimiento preventivo",
        "Gestion de alarmas y operacion por procedimientos",
      ],
      en: [
        "BMS for centralized control and supervision",
        "Subsystem integration and operational dashboards",
        "Operational efficiency and preventive maintenance",
        "Alarm management and procedure-driven operations",
      ],
    },
    website: "https://www.automatedlogic.com/",
    logo: "/partners/automated-logic.png",
  },
  {
    id: "velasea",
    name: "Velasea",
    subtitle: {
      es: "Integracion y soluciones tecnologicas",
      en: "Integration and technology solutions",
    },
    summary: {
      es: "Integracion y despliegue para proyectos con enfoque enterprise y operacion.",
      en: "Integration and deployment for enterprise-focused operational projects.",
    },
    description: {
      es: "Velasea apoya integraciones y despliegues en proyectos tecnologicos.",
      en: "Velasea supports integrations and deployments across technology projects.",
    },
    tags: {
      es: ["Integracion", "Por fases", "Operacion"],
      en: ["Integration", "Phased rollout", "Operations"],
    },
    capabilities: {
      es: [
        "Ejecucion por fases y coordinacion tecnica",
        "Integracion de componentes y plataformas",
        "Alineacion con requerimientos operativos",
        "Soporte a despliegues en campo",
      ],
      en: [
        "Phased execution and technical coordination",
        "Integration of components and platforms",
        "Alignment with operational requirements",
        "Field deployment support",
      ],
    },
    website: "https://velasea.com",
    logo: "/partners/velasea.png",
  },
  {
    id: "digital-watchdog",
    name: "Digital Watchdog",
    subtitle: {
      es: "Video, grabacion y analitica para seguridad",
      en: "Video, recording, and analytics for security",
    },
    summary: {
      es: "Soluciones enfocadas en video y operacion de seguridad.",
      en: "Solutions focused on video and day-to-day security operations.",
    },
    description: {
      es: "Digital Watchdog ofrece soluciones para video y monitoreo con enfoque en operacion.",
      en: "Digital Watchdog offers video and monitoring solutions built for operational security teams.",
    },
    tags: {
      es: ["Video", "Seguridad", "Operacion"],
      en: ["Video", "Security", "Operations"],
    },
    capabilities: {
      es: [
        "Componentes para operacion de video",
        "Opciones de grabacion y monitoreo",
        "Analiticas segun requerimiento de seguridad",
        "Enfoque en operacion y mantenimiento",
      ],
      en: [
        "Components for video operations",
        "Recording and monitoring options",
        "Analytics aligned with security requirements",
        "Operational and maintenance-oriented approach",
      ],
    },
    website: "https://digital-watchdog.com/",
    logo: "/partners/digital.png",
  },
  {
    id: "magos",
    name: "Magos",
    subtitle: {
      es: "Radar y monitoreo perimetral",
      en: "Radar and perimeter monitoring",
    },
    summary: {
      es: "Tecnologia orientada a deteccion temprana y monitoreo perimetral.",
      en: "Technology focused on early detection and perimeter monitoring.",
    },
    description: {
      es: "Magos se orienta a tecnologias de deteccion y monitoreo (incluyendo radar) para escenarios de seguridad.",
      en: "Magos focuses on detection and monitoring technologies, including radar, for security scenarios.",
    },
    tags: {
      es: ["Radar", "Monitoreo", "Perimetro"],
      en: ["Radar", "Monitoring", "Perimeter"],
    },
    capabilities: {
      es: [
        "Deteccion orientada a seguridad perimetral",
        "Soporte a operacion en areas criticas",
        "Integracion con plataformas de monitoreo",
        "Alineacion a procedimientos de respuesta",
      ],
      en: [
        "Detection focused on perimeter security",
        "Support for operations in critical areas",
        "Integration with monitoring platforms",
        "Alignment with response procedures",
      ],
    },
    website: "https://magossystems.com/es/",
    logo: "/partners/magos.png",
  },
];

export function getPartners(locale: Locale): Partner[] {
  return PARTNER_ENTRIES.map((partner) => ({
    id: partner.id,
    name: partner.name,
    subtitle: partner.subtitle[locale],
    summary: partner.summary[locale],
    description: partner.description[locale],
    tags: partner.tags[locale],
    capabilities: partner.capabilities[locale],
    website: partner.website,
    logo: partner.logo,
    focus: partner.focus?.[locale],
    usecases: partner.usecases?.[locale],
  }));
}

export const PARTNERS = getPartners("es");
