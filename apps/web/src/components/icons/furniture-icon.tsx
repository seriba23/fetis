import {
  ChefHat,
  Archive,
  Square,
  Armchair,
  Bed,
  Sofa,
  Tv,
  Package,
  LucideIcon,
} from 'lucide-react';

const ICONS: Record<string, LucideIcon> = {
  cocina: ChefHat,
  closet: Archive,
  mesa: Square,
  silla: Armchair,
  recamara: Bed,
  sala: Sofa,
  sofa: Sofa,
  'mueble-tv': Tv,
  otros: Package,
};

export function FurnitureIcon({
  slug,
  size = 18,
  className,
}: {
  slug: string;
  size?: number;
  className?: string;
}) {
  const Icon = ICONS[slug] ?? Package;
  return <Icon size={size} className={className} />;
}
