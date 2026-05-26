import Link from 'next/link';
import { Mail, MapPin, Phone, Instagram, Facebook } from 'lucide-react';

export function LandingFooter({ business }: { business: Record<string, string> }) {
  const name = business['business.name'] || 'Fetis Muebles';
  const logoText = business['branding.logo_text'] || 'FETIS';
  const logoSubtitle = business['branding.logo_subtitle'] || 'MUEBLES';
  const email = business['business.email'];
  const phone = business['business.phone'];
  const address = business['business.address'];
  const ig = business['business.instagram'];
  const fb = business['business.facebook'];

  return (
    <footer className="border-t border-ink-900/5 dark:border-white/5 mt-24">
      <div className="max-w-7xl mx-auto px-6 lg:px-10 py-16">
        <div className="grid md:grid-cols-3 gap-12">
          <div>
            <div className="text-2xl font-display">
              <span className="gradient-text">{logoText}</span>
              {logoSubtitle && (
                <span className="text-ink-500 dark:text-white/40 text-sm ml-1.5 tracking-[0.3em]">{logoSubtitle}</span>
              )}
            </div>
            <p className="mt-4 text-ink-600 dark:text-white/60 text-sm leading-relaxed max-w-xs">
              Diseño y fabricación de muebles a medida con atención al detalle, materiales premium y acabados de calidad.
            </p>
          </div>

          <div>
            <h4 className="text-xs uppercase tracking-widest text-ink-500 dark:text-white/40 mb-4">Navegación</h4>
            <ul className="space-y-2 text-sm text-ink-700 dark:text-white/70">
              <li><Link href="/" className="hover:text-ink-900 dark:hover:text-white transition">Inicio</Link></li>
              <li><Link href="/galeria" className="hover:text-ink-900 dark:hover:text-white transition">Galería</Link></li>
              <li><Link href="/#servicios" className="hover:text-ink-900 dark:hover:text-white transition">Servicios</Link></li>
              <li><Link href="/#nosotros" className="hover:text-ink-900 dark:hover:text-white transition">Nosotros</Link></li>
              <li><Link href="/contacto" className="hover:text-ink-900 dark:hover:text-white transition">Contacto</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs uppercase tracking-widest text-ink-500 dark:text-white/40 mb-4">Contacto</h4>
            <ul className="space-y-3 text-sm text-ink-700 dark:text-white/70">
              {email && (
                <li className="flex items-start gap-3">
                  <Mail size={16} className="mt-0.5 text-brand-500 dark:text-brand-400" />
                  <a href={`mailto:${email}`} className="hover:text-ink-900 dark:hover:text-white">{email}</a>
                </li>
              )}
              {phone && (
                <li className="flex items-start gap-3">
                  <Phone size={16} className="mt-0.5 text-brand-500 dark:text-brand-400" />
                  <a href={`tel:${phone}`} className="hover:text-ink-900 dark:hover:text-white">{phone}</a>
                </li>
              )}
              {address && (
                <li className="flex items-start gap-3">
                  <MapPin size={16} className="mt-0.5 text-brand-500 dark:text-brand-400" />
                  <span>{address}</span>
                </li>
              )}
            </ul>
            <div className="flex gap-3 mt-5">
              {ig && (
                <a href={ig} target="_blank" rel="noreferrer" className="w-9 h-9 rounded-full bg-ink-900/5 hover:bg-brand-500/20 dark:bg-white/5 flex items-center justify-center transition">
                  <Instagram size={16} />
                </a>
              )}
              {fb && (
                <a href={fb} target="_blank" rel="noreferrer" className="w-9 h-9 rounded-full bg-ink-900/5 hover:bg-brand-500/20 dark:bg-white/5 flex items-center justify-center transition">
                  <Facebook size={16} />
                </a>
              )}
            </div>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-ink-900/5 dark:border-white/5 flex flex-col md:flex-row gap-3 items-center justify-between text-xs text-ink-500 dark:text-white/40">
          <div>© {new Date().getFullYear()} {name}. Todos los derechos reservados.</div>
          <Link href="/admin" className="hover:text-ink-700 dark:hover:text-white/70 transition">Acceso administrativo</Link>
        </div>
      </div>
    </footer>
  );
}
