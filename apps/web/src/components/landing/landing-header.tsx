'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Menu, X } from 'lucide-react';
import { ThemeToggle } from './theme-toggle';

const NAV = [
  { href: '/', label: 'Inicio' },
  { href: '/galeria', label: 'Galería' },
  { href: '/#servicios', label: 'Servicios' },
  { href: '/#nosotros', label: 'Nosotros' },
  { href: '/contacto', label: 'Contacto' },
];

export function LandingHeader({
  logoText = 'FETIS',
  logoSubtitle = 'MUEBLES',
}: {
  logoText?: string;
  logoSubtitle?: string;
}) {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 30);
    onScroll();
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 inset-x-0 z-40 transition-all ${
        scrolled
          ? 'glass border-b border-ink-900/5 dark:border-white/5'
          : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 lg:px-10 h-20 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3 group">
          <span className="text-2xl font-display font-semibold tracking-wide">
            <span className="gradient-text">{logoText}</span>
            {logoSubtitle && (
              <span className="text-ink-500 dark:text-white/40 text-sm ml-1.5 font-light tracking-[0.3em]">{logoSubtitle}</span>
            )}
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-8">
          {NAV.map((n) => (
            <Link
              key={n.href}
              href={n.href}
              className="text-sm text-ink-700 hover:text-ink-900 dark:text-white/70 dark:hover:text-white transition-colors"
            >
              {n.label}
            </Link>
          ))}
          <Link
            href="/contacto"
            className="rounded-full px-5 py-2 text-sm font-medium bg-brand-500 hover:bg-brand-600 text-white transition-colors shadow-brand-glow"
          >
            Cotizar
          </Link>
          <ThemeToggle />
        </nav>

        <div className="md:hidden flex items-center gap-1">
          <ThemeToggle />
          <button
            className="p-2 text-ink-900 dark:text-white"
            onClick={() => setOpen(!open)}
            aria-label="Menú"
          >
            {open ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {open && (
        <div className="md:hidden border-t border-ink-900/5 dark:border-white/5 bg-white/95 dark:bg-black/95 backdrop-blur">
          <nav className="px-6 py-4 flex flex-col gap-3">
            {NAV.map((n) => (
              <Link
                key={n.href}
                href={n.href}
                className="text-ink-800 dark:text-white/80 py-2"
                onClick={() => setOpen(false)}
              >
                {n.label}
              </Link>
            ))}
            <Link
              href="/contacto"
              className="rounded-full px-5 py-2 text-sm font-medium bg-brand-500 text-white text-center mt-2"
              onClick={() => setOpen(false)}
            >
              Cotizar
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
