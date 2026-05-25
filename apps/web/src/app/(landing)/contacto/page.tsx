import { publicApi } from '@/lib/api';
import { ContactForm } from '@/components/landing/contact-form';
import { Mail, MapPin, Phone } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function ContactoPage() {
  const [types, business] = await Promise.all([
    publicApi.furnitureTypes().catch(() => []),
    publicApi.business().catch(() => ({} as Record<string, string>)),
  ]);

  return (
    <div className="pt-32 pb-20 lg:pb-32">
      <div className="max-w-6xl mx-auto px-6 lg:px-10">
        <div className="mb-12 lg:mb-16">
          <div className="text-xs uppercase tracking-widest text-brand-600 dark:text-brand-400 mb-3">Contacto</div>
          <h1 className="text-4xl lg:text-6xl font-display font-light text-ink-900 dark:text-white">
            Hablemos de tu <span className="gradient-text italic">proyecto</span>
          </h1>
          <p className="text-ink-600 dark:text-white/60 mt-4 max-w-2xl">
            Cuéntanos qué necesitas. Te contactaremos en menos de 24 horas para agendar una consulta sin compromiso.
          </p>
        </div>

        <div className="grid lg:grid-cols-5 gap-10">
          <div className="lg:col-span-3">
            <ContactForm furnitureTypes={types} />
          </div>

          <aside className="lg:col-span-2 space-y-6">
            <div className="rounded-2xl border border-ink-900/5 dark:border-white/5 bg-ink-900/[0.03] dark:bg-white/[0.03] p-6">
              <h3 className="text-lg font-display mb-4 text-ink-900 dark:text-white">Información de contacto</h3>
              <ul className="space-y-4 text-sm text-ink-700 dark:text-white/70">
                {business['business.email'] && (
                  <li className="flex items-start gap-3">
                    <Mail size={16} className="mt-1 text-brand-500 dark:text-brand-400 shrink-0" />
                    <a href={`mailto:${business['business.email']}`} className="hover:text-ink-900 dark:hover:text-white">
                      {business['business.email']}
                    </a>
                  </li>
                )}
                {business['business.phone'] && (
                  <li className="flex items-start gap-3">
                    <Phone size={16} className="mt-1 text-brand-500 dark:text-brand-400 shrink-0" />
                    <a href={`tel:${business['business.phone']}`} className="hover:text-ink-900 dark:hover:text-white">
                      {business['business.phone']}
                    </a>
                  </li>
                )}
                {business['business.whatsapp'] && (
                  <li className="flex items-start gap-3">
                    <span className="mt-1 text-brand-500 dark:text-brand-400 shrink-0 text-xs">WA</span>
                    <a
                      href={`https://wa.me/${business['business.whatsapp'].replace(/\D/g, '')}?text=${encodeURIComponent(
                        'Hola Fetis, me gustaría obtener información sobre sus muebles.',
                      )}`}
                      target="_blank"
                      rel="noreferrer"
                      className="hover:text-ink-900 dark:hover:text-white"
                    >
                      WhatsApp directo
                    </a>
                  </li>
                )}
                {business['business.address'] && (
                  <li className="flex items-start gap-3">
                    <MapPin size={16} className="mt-1 text-brand-500 dark:text-brand-400 shrink-0" />
                    <span>{business['business.address']}</span>
                  </li>
                )}
              </ul>
            </div>

            <div className="rounded-2xl border border-ink-900/5 dark:border-white/5 bg-gradient-to-br from-brand-500/10 to-transparent p-6">
              <h3 className="text-lg font-display mb-2 text-ink-900 dark:text-white">Horario de atención</h3>
              <ul className="text-sm text-ink-700 dark:text-white/70 space-y-1">
                <li>Lun - Vie: 9:00 - 19:00</li>
                <li>Sábado: 10:00 - 14:00</li>
                <li>Domingo: cerrado</li>
              </ul>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
