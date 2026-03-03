import type { Metadata } from "next";
import ProyectosClient from "./ProyectosClient";

export const metadata: Metadata = {
  title: "Proyectos",
  description:
    "Portafolio de proyectos enterprise de COP'S Electronics: videovigilancia, control de acceso, automatización y energía crítica para banca, industria y comercio.",
};

export default function ProyectosPage() {
  return <ProyectosClient />;
}
