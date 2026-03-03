import type { Metadata } from "next";
import GraciasClient from "./GraciasClient";

export const metadata: Metadata = {
  title: "Mensaje recibido",
  description: "Hemos recibido tu mensaje. El equipo de COP'S Electronics se comunicará contigo a la brevedad.",
};

export default function GraciasPage() {
  return <GraciasClient />;
}
