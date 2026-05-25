'use client';

import { useMemo, useState } from 'react';
import { imageUrl } from '@/lib/utils';
import { X } from 'lucide-react';

export function GalleryGrid({
  items,
  categories,
  initialCategory,
}: {
  items: any[];
  categories: any[];
  initialCategory?: string;
}) {
  const [active, setActive] = useState<string | null>(initialCategory ?? null);
  const [lightbox, setLightbox] = useState<any | null>(null);

  const filtered = useMemo(() => {
    if (!active) return items;
    return items.filter((i) => i.category?.slug === active);
  }, [items, active]);

  return (
    <>
      <div className="flex flex-wrap gap-2 mb-10">
        <button
          onClick={() => setActive(null)}
          className={`px-4 py-2 rounded-full text-sm transition-all ${
            !active
              ? 'bg-brand-500 text-white'
              : 'bg-ink-900/5 text-ink-700 hover:bg-ink-900/10 border border-ink-900/5 dark:bg-white/5 dark:text-white/70 dark:hover:bg-white/10 dark:border-white/5'
          }`}
        >
          Todos
          <span className="ml-2 opacity-60">{items.length}</span>
        </button>
        {categories.map((c) => (
          <button
            key={c.id}
            onClick={() => setActive(c.slug)}
            className={`px-4 py-2 rounded-full text-sm transition-all ${
              active === c.slug
                ? 'bg-brand-500 text-white'
                : 'bg-ink-900/5 text-ink-700 hover:bg-ink-900/10 border border-ink-900/5 dark:bg-white/5 dark:text-white/70 dark:hover:bg-white/10 dark:border-white/5'
            }`}
          >
            {c.name}
            <span className="ml-2 opacity-60">{c._count?.items ?? 0}</span>
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-20 text-ink-500 dark:text-white/50">
          No hay imágenes en esta categoría todavía.
        </div>
      ) : (
        <div className="columns-1 sm:columns-2 lg:columns-3 gap-4 space-y-4">
          {filtered.map((it) => (
            <button
              key={it.id}
              onClick={() => setLightbox(it)}
              className="group block w-full rounded-2xl overflow-hidden border border-ink-900/5 dark:border-white/5 hover:border-brand-500/40 transition-all break-inside-avoid"
            >
              <div className="relative">
                <img
                  src={imageUrl(it.imageUrl)}
                  alt={it.title ?? ''}
                  className="w-full h-auto group-hover:scale-[1.02] transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="absolute bottom-3 left-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="text-xs uppercase tracking-widest text-brand-300">
                    {it.category?.name}
                  </div>
                  {it.title && <div className="text-white text-sm mt-0.5">{it.title}</div>}
                </div>
              </div>
            </button>
          ))}
        </div>
      )}

      {lightbox && (
        <div
          className="fixed inset-0 z-50 bg-black/95 backdrop-blur flex items-center justify-center p-4"
          onClick={() => setLightbox(null)}
        >
          <button
            className="absolute top-6 right-6 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white"
            onClick={() => setLightbox(null)}
            aria-label="Cerrar"
          >
            <X size={20} />
          </button>
          <div
            className="relative max-w-5xl w-full max-h-[88vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={imageUrl(lightbox.imageUrl)}
              alt={lightbox.title ?? ''}
              className="w-full max-h-[78vh] object-contain rounded-xl"
            />
            <div className="mt-4 text-center">
              <div className="text-xs uppercase tracking-widest text-brand-300">
                {lightbox.category?.name}
              </div>
              {lightbox.title && <div className="text-white mt-1">{lightbox.title}</div>}
              {lightbox.description && (
                <div className="text-white/60 text-sm mt-2 max-w-2xl mx-auto">
                  {lightbox.description}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
