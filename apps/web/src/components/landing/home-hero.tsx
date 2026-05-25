import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

export function HomeHero({
  title,
  subtitle,
  imageUrl,
}: {
  title: string;
  subtitle: string;
  imageUrl?: string | null;
}) {
  return (
    <section className="relative pt-32 lg:pt-40 pb-20 lg:pb-32 overflow-hidden gradient-bg">
      <div className="max-w-7xl mx-auto px-6 lg:px-10 grid lg:grid-cols-2 gap-12 items-center">
        <div className="animate-in">
          <div className="text-xs uppercase tracking-[0.3em] text-brand-600 dark:text-brand-400 mb-6">
            Fabricación a medida
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-7xl font-display font-light leading-[1.05] tracking-tight text-ink-900 dark:text-white">
            {title}
          </h1>
          <p className="text-lg lg:text-xl text-ink-700 dark:text-white/70 mt-8 max-w-xl leading-relaxed font-light">
            {subtitle}
          </p>
          <div className="mt-10 flex flex-wrap gap-4">
            <Link
              href="/contacto"
              className="inline-flex items-center gap-2 rounded-full px-7 py-3.5 bg-brand-500 hover:bg-brand-600 text-white text-sm font-medium shadow-brand-glow transition"
            >
              Cotizar mi proyecto
              <ArrowRight size={16} />
            </Link>
            <Link
              href="/galeria"
              className="inline-flex items-center gap-2 rounded-full px-7 py-3.5 bg-ink-900/5 hover:bg-ink-900/10 border border-ink-900/10 text-ink-900 dark:bg-white/5 dark:hover:bg-white/10 dark:border-white/10 dark:text-white text-sm font-medium transition"
            >
              Ver galería
            </Link>
          </div>
        </div>

        <div className="relative animate-in">
          {imageUrl ? (
            <div className="relative aspect-[4/5] rounded-3xl overflow-hidden border border-ink-900/10 dark:border-white/10 shadow-2xl">
              <img src={imageUrl} alt="Trabajo destacado" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
              <div className="absolute bottom-6 left-6 right-6 text-white/90">
                <div className="text-xs uppercase tracking-widest text-brand-300">Trabajo reciente</div>
                <div className="text-lg font-display mt-1">Diseño exclusivo a medida</div>
              </div>
            </div>
          ) : (
            <div className="aspect-[4/5] rounded-3xl bg-ink-900/5 dark:bg-white/5 border border-ink-900/10 dark:border-white/10" />
          )}
          {/* Decorative glow */}
          <div className="absolute -top-10 -right-10 w-72 h-72 bg-brand-500/20 rounded-full blur-[100px] -z-10" />
        </div>
      </div>
    </section>
  );
}
