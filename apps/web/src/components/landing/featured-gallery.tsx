import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { imageUrl } from '@/lib/utils';

export function FeaturedGallery({ items }: { items: any[] }) {
  if (!items?.length) return null;
  return (
    <section className="py-20 lg:py-28 border-t border-ink-900/5 dark:border-white/5">
      <div className="max-w-7xl mx-auto px-6 lg:px-10">
        <div className="flex items-end justify-between mb-12 flex-wrap gap-4">
          <div>
            <div className="text-xs uppercase tracking-widest text-brand-600 dark:text-brand-400 mb-3">Galería</div>
            <h2 className="text-3xl lg:text-5xl font-display font-light text-ink-900 dark:text-white">Trabajos recientes</h2>
          </div>
          <Link href="/galeria" className="text-sm text-ink-700 hover:text-ink-900 dark:text-white/70 dark:hover:text-white inline-flex items-center gap-2">
            Ver todos <ArrowRight size={16} />
          </Link>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
          {items.slice(0, 8).map((it, idx) => (
            <Link
              key={it.id}
              href={`/galeria?cat=${it.category?.slug ?? ''}`}
              className={`group relative overflow-hidden rounded-2xl border border-ink-900/5 dark:border-white/5 hover:border-brand-500/40 transition-all ${
                idx % 5 === 0 ? 'aspect-square lg:row-span-2 lg:aspect-auto' : 'aspect-square'
              }`}
            >
              <img
                src={imageUrl(it.imageUrl)}
                alt={it.title ?? it.category?.name ?? ''}
                className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-80" />
              <div className="absolute bottom-4 left-4 right-4">
                <div className="text-xs text-brand-300 uppercase tracking-widest">{it.category?.name}</div>
                {it.title && <div className="text-white mt-1 line-clamp-1">{it.title}</div>}
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
