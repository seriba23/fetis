import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { publicApi } from '@/lib/api';
import { imageUrl } from '@/lib/utils';
import { HomeHero } from '@/components/landing/home-hero';
import { CategoriesGrid } from '@/components/landing/categories-grid';
import { FeaturedGallery } from '@/components/landing/featured-gallery';
import { ProcessSection } from '@/components/landing/process-section';

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const [categories, featured, business] = await Promise.all([
    publicApi.categories().catch(() => []),
    publicApi.gallery(undefined, 8).catch(() => []),
    publicApi.business().catch(() => ({} as Record<string, string>)),
  ]);

  const heroTitle = business['landing.hero_title'] || 'Muebles a medida que transforman tu espacio';
  const heroSubtitle =
    business['landing.hero_subtitle'] ||
    'Diseño exclusivo, materiales premium y fabricación artesanal. Cada mueble Fetis es único, como tu hogar.';
  const aboutTitle = business['landing.about_title'] || 'Carpintería con visión de diseño';
  const aboutText =
    business['landing.about_text'] ||
    'En Fetis combinamos técnica tradicional con diseño contemporáneo. Cada pieza se proyecta a medida.';

  const heroImage = featured.find((f: any) => f.featured)?.imageUrl ?? featured[0]?.imageUrl ?? null;

  return (
    <>
      <HomeHero title={heroTitle} subtitle={heroSubtitle} imageUrl={imageUrl(heroImage)} />

      <section id="servicios" className="py-20 lg:py-28">
        <div className="max-w-7xl mx-auto px-6 lg:px-10">
          <div className="flex items-end justify-between mb-12 flex-wrap gap-4">
            <div>
              <div className="text-xs uppercase tracking-widest text-brand-600 dark:text-brand-400 mb-3">Categorías</div>
              <h2 className="text-3xl lg:text-5xl font-display font-light text-ink-900 dark:text-white">
                Diseñamos cada espacio
              </h2>
            </div>
            <Link href="/galeria" className="text-sm text-ink-700 hover:text-ink-900 dark:text-white/70 dark:hover:text-white inline-flex items-center gap-2">
              Ver galería completa <ArrowRight size={16} />
            </Link>
          </div>
          <CategoriesGrid categories={categories} />
        </div>
      </section>

      <FeaturedGallery items={featured} />

      <ProcessSection />

      <section id="nosotros" className="py-20 lg:py-28 border-t border-ink-900/5 dark:border-white/5">
        <div className="max-w-5xl mx-auto px-6 lg:px-10">
          <div className="text-xs uppercase tracking-widest text-brand-600 dark:text-brand-400 mb-3">Sobre nosotros</div>
          <h2 className="text-3xl lg:text-5xl font-display font-light mb-6 text-ink-900 dark:text-white">{aboutTitle}</h2>
          <p className="text-lg text-ink-700 dark:text-white/70 leading-relaxed max-w-3xl">{aboutText}</p>

          <div className="grid sm:grid-cols-3 gap-8 mt-12">
            <div>
              <div className="text-4xl font-display font-light gradient-text">+10</div>
              <div className="text-sm text-ink-600 dark:text-white/60 mt-1">Años de experiencia</div>
            </div>
            <div>
              <div className="text-4xl font-display font-light gradient-text">100%</div>
              <div className="text-sm text-ink-600 dark:text-white/60 mt-1">A medida</div>
            </div>
            <div>
              <div className="text-4xl font-display font-light gradient-text">+500</div>
              <div className="text-sm text-ink-600 dark:text-white/60 mt-1">Proyectos entregados</div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 lg:py-28 border-t border-ink-900/5 dark:border-white/5">
        <div className="max-w-4xl mx-auto px-6 lg:px-10 text-center">
          <h2 className="text-3xl lg:text-5xl font-display font-light mb-4 text-ink-900 dark:text-white">
            ¿Listo para diseñar <span className="gradient-text">tu mueble ideal</span>?
          </h2>
          <p className="text-ink-700 dark:text-white/70 text-lg mb-8 max-w-2xl mx-auto">
            Agenda una consulta sin compromiso. Te ayudamos a transformar tu espacio.
          </p>
          <Link
            href="/contacto"
            className="inline-flex items-center gap-2 rounded-full px-8 py-3.5 bg-brand-500 hover:bg-brand-600 text-white text-sm font-medium shadow-brand-glow transition-colors"
          >
            Solicitar cotización
            <ArrowRight size={16} />
          </Link>
        </div>
      </section>
    </>
  );
}
