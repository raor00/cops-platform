import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = "https://cops-electronics-site-hxk7mat37-raor00s-projects.vercel.app/";

  return [
    { url: `${base}/`, changeFrequency: "monthly", priority: 1 },
    { url: `${base}/nosotros`, changeFrequency: "monthly", priority: 0.8 },
    { url: `${base}/soluciones`, changeFrequency: "monthly", priority: 0.8 },
    { url: `${base}/proyectos`, changeFrequency: "monthly", priority: 0.8 },
    { url: `${base}/partners`, changeFrequency: "monthly", priority: 0.8 },
    { url: `${base}/contacto`, changeFrequency: "yearly", priority: 0.6 },
  ];
}
