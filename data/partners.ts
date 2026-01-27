// data/partners.ts

export type Partner = {
  id: string;              // identificador interno (puede servir como slug si luego quieres)
  name: string;
  subtitle: string;        // línea debajo del nombre (card)
  summary: string;         // resumen corto (card)
  description: string;     // texto largo (modal)
  tags: string[];
  capabilities: string[];
  website?: string;
  logo: string;            // ruta pública: /partners/xxx.png
};

export const PARTNERS: Partner[] = [
  {
    id: "milestone",
    name: "Milestone",
    subtitle: "VMS (Video Management System) para operación crítica",
    summary:
      "Plataforma VMS escalable para operación multi-sede, integración multi-marca y control centralizado.",
    description:
      "Milestone permite estandarizar la operación de video en entornos enterprise con escalabilidad multi-sede, integración con cámaras y analíticas de terceros, control por roles y auditoría. Ideal para centros de monitoreo, banca y operación crítica.",
    tags: ["VMS", "Integración", "Multi-sede"],
    capabilities: [
      "Arquitecturas escalables para múltiples sedes",
      "Integración con cámaras y analíticas de terceros",
      "Gestión de roles, auditoría y operación centralizada",
      "Estrategias de grabación, retención y resiliencia",
    ],
    website: "https://www.milestonesys.com/",
    logo: "/partners/milestone.png",
  },
  {
    id: "winsted",
    name: "Winsted",
    subtitle: "Consolas y salas de control",
    summary:
      "Mobiliario técnico para SOC/NOC: ergonomía, robustez y diseño para operación 24/7.",
    description:
      "Winsted diseña soluciones de mobiliario para centros de control con enfoque en ergonomía, operación 24/7 y crecimiento modular. Ideal para salas de seguridad, NOC/SOC y control rooms enterprise.",
    tags: ["SOC/NOC", "24/7", "Ergonomía"],
    capabilities: [
      "Diseño modular para centros de control",
      "Ergonomía para operación 24/7",
      "Integración de cableado y equipamiento",
      "Escalabilidad por fases y crecimiento",
    ],
    website: "https://www.winsted.com/",
    logo: "/partners/winsted.png",
  },
  {
    id: "invenzi",
    name: "Invenzi",
    subtitle: "Control de acceso y credenciales",
    summary:
      "Plataforma enterprise para accesos: roles, visitantes e integración con terceros.",
    description:
      "Invenzi ofrece control de acceso orientado a entornos enterprise con flujos, roles, visitantes y capacidades de integración para proyectos de alta demanda operativa. Ideal para industrias, banca y edificios con múltiples sedes.",
    tags: ["Acceso", "Visitantes", "Enterprise"],
    capabilities: [
      "Control de acceso con roles y flujos",
      "Gestión de visitantes y credenciales",
      "Integración con sistemas de terceros",
      "Reportes y auditoría para cumplimiento",
    ],
    website: "https://www.invenzi.com/",
    logo: "/partners/invenzi.png",
  },
  {
    id: "altronix",
    name: "Altronix",
    subtitle: "Energía y respaldo para seguridad",
    summary:
      "Soluciones de alimentación y distribución para CCTV, control de acceso y sistemas críticos.",
    description:
      "Altronix provee soluciones de energía y distribución orientadas a sistemas de seguridad: CCTV, control de acceso y operación crítica, con enfoque en confiabilidad, disponibilidad y ordenamiento de infraestructura.",
    tags: ["Continuidad", "CCTV/Acceso", "Confiabilidad"],
    capabilities: [
      "Distribución y respaldo de energía para seguridad",
      "Fuentes y controladores para infraestructura crítica",
      "Buenas prácticas de disponibilidad y continuidad",
      "Diseño ordenado para crecimiento y mantenimiento",
    ],
    website: "https://www.altronix.com/",
    logo: "/partners/altronix.png",
  },
  {
    id: "automated-logic",
    name: "Automated Logic",
    subtitle: "BMS y automatización de edificios",
    summary:
      "Gestión de edificios inteligentes: monitoreo, control y eficiencia operativa.",
    description:
      "Automated Logic habilita proyectos BMS para edificios inteligentes: supervisión, control, alarmas y eficiencia operativa. Ideal para infraestructuras enterprise que requieren visibilidad y operación centralizada.",
    tags: ["BMS", "Eficiencia", "Enterprise"],
    capabilities: [
      "BMS para control y supervisión centralizada",
      "Integración de subsistemas y tableros operativos",
      "Eficiencia operativa y mantenimiento preventivo",
      "Gestión de alarmas y operación por procedimientos",
    ],
    website: "https://www.automatedlogic.com/",
    logo: "/partners/automated-logic.png",
  },
  {
    id: "velasea",
    name: "Velasea",
    subtitle: "Integración y soluciones tecnológicas",
    summary:
      "Integración y despliegue para proyectos con enfoque enterprise y operación.",
    description:
      "Velasea apoya integraciones y despliegues en proyectos tecnológicos, facilitando ejecución por fases y alineación operativa para entornos enterprise.",
    tags: ["Integración", "Por fases", "Operación"],
    capabilities: [
      "Ejecución por fases y coordinación técnica",
      "Integración de componentes y plataformas",
      "Alineación con requerimientos operativos",
      "Soporte a despliegues en campo",
    ],
    website: "https://velasea.com",
    logo: "/partners/velasea.png",
  },
  {
    id: "digital-watchdog",
    name: "Digital Watchdog",
    subtitle: "Video, grabación y analítica para seguridad",
    summary:
      "Soluciones enfocadas en video y operación de seguridad con componentes y analíticas según requerimiento.",
    description:
      "Digital Watchdog ofrece soluciones para video y monitoreo con enfoque en operación, grabación y analítica, integrables en escenarios enterprise.",
    tags: ["Video", "Seguridad", "Operación"],
    capabilities: [
      "Componentes para operación de video",
      "Opciones de grabación y monitoreo",
      "Analíticas según requerimiento de seguridad",
      "Enfoque en operación y mantenimiento",
    ],
    website: "https://digital-watchdog.com/",
    logo: "/partners/digital.png",
  },
  {
    id: "magos",
    name: "Magos",
    subtitle: "Radar y monitoreo perimetral",
    summary:
      "Tecnología orientada a detección temprana y monitoreo para escenarios de seguridad perimetral.",
    description:
      "Magos se orienta a tecnologías de detección y monitoreo (incluyendo radar) para escenarios de seguridad y operación, especialmente útil en perímetros y áreas críticas donde se requiere detección temprana.",
    tags: ["Radar", "Monitoreo", "Perímetro"],
    capabilities: [
      "Detección orientada a seguridad perimetral",
      "Soporte a operación en áreas críticas",
      "Integración con plataformas de monitoreo",
      "Alineación a procedimientos de respuesta",
    ],
    website: "https://magossystems.com/es/",
    logo: "/partners/magos.png",
  },
];
