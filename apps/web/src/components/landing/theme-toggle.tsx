'use client';

import { useEffect, useState } from 'react';
import { Moon, Sun } from 'lucide-react';

export function ThemeToggle({ className }: { className?: string }) {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const t = (localStorage.getItem('fetis-theme') as 'light' | 'dark') ?? 'light';
    setTheme(t);
    document.documentElement.setAttribute('data-theme', t);
    setMounted(true);
  }, []);

  function toggle() {
    const next = theme === 'light' ? 'dark' : 'light';
    setTheme(next);
    document.documentElement.setAttribute('data-theme', next);
    localStorage.setItem('fetis-theme', next);
  }

  return (
    <button
      onClick={toggle}
      aria-label={theme === 'light' ? 'Cambiar a modo oscuro' : 'Cambiar a modo claro'}
      className={`p-2 rounded-full transition-colors text-ink-700 hover:bg-ink-900/5 dark:text-white/80 dark:hover:bg-white/10 ${className ?? ''}`}
    >
      {mounted ? (theme === 'light' ? <Moon size={18} /> : <Sun size={18} />) : <Sun size={18} />}
    </button>
  );
}
