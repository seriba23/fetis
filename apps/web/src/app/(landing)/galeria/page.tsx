import { publicApi } from '@/lib/api';
import { GalleryGrid } from '@/components/landing/gallery-grid';

export const dynamic = 'force-dynamic';

export default async function GaleriaPage({
  searchParams,
}: {
  searchParams: { cat?: string };
}) {
  const [categories, items] = await Promise.all([
    publicApi.categories().catch(() => []),
    publicApi.gallery(undefined, 100).catch(() => []),
  ]);

  return (
    <div className="pt-32 pb-20 lg:pb-32">
      <div className="max-w-7xl mx-auto px-6 lg:px-10">
        <div className="mb-12 lg:mb-16">
          <div className="text-xs uppercase tracking-widest text-brand-600 dark:text-brand-400 mb-3">Galería</div>
          <h1 className="text-4xl lg:text-6xl font-display font-light text-ink-900 dark:text-white">
            Trabajos <span className="gradient-text italic">realizados</span>
          </h1>
          <p className="text-ink-600 dark:text-white/60 mt-4 max-w-2xl">
            Una muestra de los proyectos que hemos diseñado y fabricado a medida para nuestros clientes.
          </p>
        </div>

        <GalleryGrid
          items={items}
          categories={categories}
          initialCategory={searchParams.cat}
        />
      </div>
    </div>
  );
}
