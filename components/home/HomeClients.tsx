// components/home/HomeClients.tsx
import ClientShowcase from "../ClientShowcase";

type Logo = { src: string; alt: string };

export default function HomeClients({
  title,
  subtitle,
  logos,
  featuredCount,
}: {
  title: string;
  subtitle: string;
  logos: Logo[];
  featuredCount?: number;
}) {
  return (
    <div className="lg:col-span-12">
      <ClientShowcase
        title={title}
        subtitle={subtitle}
        logos={logos}
        featuredCount={featuredCount}
      />
    </div>
  );
}
