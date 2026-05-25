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
  cocinas: ChefHat,
  closets: Archive,
  mesas: Square,
  sillas: Armchair,
  recamaras: Bed,
  salas: Sofa,
  sofas: Sofa,
  'mueble-tv': Tv,
  otros: Package,
};

export function CategoryIcon({
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
