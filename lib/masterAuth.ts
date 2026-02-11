export const MASTER_SESSION_COOKIE = "cops_master_session";
export const MASTER_ROLE_COOKIE = "cops_master_role";
export const MASTER_USER_COOKIE = "cops_master_user";
export const MASTER_SESSION_VALUE = "active";

export type UserRole = "admin" | "soporte" | "cotizaciones";
export type ModuleId = "soporte" | "cotizaciones" | "administracion";

export type ModuleAccess = {
  id: ModuleId;
  title: string;
  description: string;
  href: string;
  roles: UserRole[];
};

type AppUser = {
  username: string;
  password: string;
  role: UserRole;
  displayName: string;
};

export const APP_USERS: AppUser[] = [
  {
    username: "admin",
    password: "admin123",
    role: "admin",
    displayName: "Administrador",
  },
];

export const MODULE_ACCESS: ModuleAccess[] = [
  {
    id: "soporte",
    title: "Soporte",
    description: "Gestion de tickets, incidentes y seguimiento operativo.",
    href: "/panel/soporte",
    roles: ["admin", "soporte"],
  },
  {
    id: "cotizaciones",
    title: "Cotizacion",
    description: "Creacion de propuestas y flujo comercial.",
    href: "/panel/cotizaciones",
    roles: ["admin", "cotizaciones"],
  },
  {
    id: "administracion",
    title: "Administracion",
    description: "Configuracion, usuarios y control administrativo.",
    href: "/panel/administracion",
    roles: ["admin"],
  },
];

export function authenticateUser(username: string, password: string) {
  const normalizedUsername = username.trim().toLowerCase();

  return APP_USERS.find(
    (user) =>
      user.username.toLowerCase() === normalizedUsername &&
      user.password === password,
  );
}

export function canAccessModule(role: string | undefined, moduleId: ModuleId) {
  if (!role) return false;
  const moduleConfig = MODULE_ACCESS.find((item) => item.id === moduleId);
  if (!moduleConfig) return false;

  return moduleConfig.roles.includes(role as UserRole);
}

export function getVisibleModules(role: string | undefined) {
  if (!role) return [];

  return MODULE_ACCESS.filter((module) => module.roles.includes(role as UserRole));
}
