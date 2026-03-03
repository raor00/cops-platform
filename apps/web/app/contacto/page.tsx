import type { Metadata } from "next";
import ContactoClient from "./ContactoClient";

export const metadata: Metadata = {
  title: "Contacto",
  description:
    "Contáctenos para soluciones de automatización, videovigilancia y seguridad electrónica enterprise. Atendemos proyectos en banca, industria y comercio.",
};

export default function ContactoPage() {
  return <ContactoClient />;
}
