'use client';

import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  LayoutDashboard,
  Users,
  Calendar,
  FileText,
  CreditCard,
  TrendingDown,
  ImageIcon,
  Settings,
  LogOut,
  Menu,
  X,
  Sun,
  Moon,
} from 'lucide-react';
import { getStoredUser, logout, type AuthUser, refresh } from '@/lib/auth-client';
import { cn } from '@/lib/utils';

const NAV = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard, exact: true },
  { href: '/admin/clientes', label: 'Clientes', icon: Users },
  { href: '/admin/calendario', label: 'Calendario', icon: Calendar },
  { href: '/admin/cotizaciones', label: 'Cotizaciones', icon: FileText },
  { href: '/admin/pagos', label: 'Pagos', icon: CreditCard },
  { href: '/admin/finanzas', label: 'Finanzas', icon: TrendingDown },
  { href: '/admin/galeria', label: 'Galería', icon: ImageIcon },
  { href: '/admin/configuracion', label: 'Configuración', icon: Settings },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  useEffect(() => {
    const t = (localStorage.getItem('fetis-theme') as 'light' | 'dark') ?? 'light';
    setTheme(t);
    document.documentElement.setAttribute('data-theme', t);
  }, []);

  useEffect(() => {
    const stored = getStoredUser();
    if (stored) {
      setUser(stored);
      setLoading(false);
      return;
    }
    (async () => {
      const ok = await refresh();
      if (!ok) {
        router.replace('/login');
        return;
      }
      setUser(getStoredUser());
      setLoading(false);
    })();
  }, [router]);

  function toggleTheme() {
    const next = theme === 'light' ? 'dark' : 'light';
    setTheme(next);
    document.documentElement.setAttribute('data-theme', next);
    localStorage.setItem('fetis-theme', next);
  }

  async function onLogout() {
    await logout();
    router.push('/login');
  }

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg-canvas)' }}>
        <div className="text-sm text-[color:var(--text-muted)]">Cargando...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex" style={{ background: 'var(--bg-canvas)' }}>
      {/* Sidebar desktop */}
      <aside className="hidden lg:flex w-64 flex-col border-r" style={{ borderColor: 'var(--border)', background: 'var(--bg-surface)' }}>
        <div className="h-16 px-6 flex items-center border-b" style={{ borderColor: 'var(--border)' }}>
          <Link href="/admin" className="text-xl font-display">
            <span className="gradient-text">FETIS</span>
            <span className="text-xs ml-2 tracking-[0.25em]" style={{ color: 'var(--text-muted)' }}>ADMIN</span>
          </Link>
        </div>
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {NAV.map((n) => (
            <NavItem key={n.href} {...n} pathname={pathname} />
          ))}
        </nav>
        <div className="px-3 py-4 border-t" style={{ borderColor: 'var(--border)' }}>
          <div className="px-3 py-2 mb-2">
            <div className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{user.name}</div>
            <div className="text-xs" style={{ color: 'var(--text-muted)' }}>{user.role === 'ADMIN' ? 'Administrador' : 'Empleado'}</div>
          </div>
          <button
            onClick={toggleTheme}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm hover:bg-[color:var(--bg-surface-hover)] transition-colors"
            style={{ color: 'var(--text-secondary)' }}
          >
            {theme === 'light' ? <Moon size={16} /> : <Sun size={16} />}
            {theme === 'light' ? 'Tema oscuro' : 'Tema claro'}
          </button>
          <button
            onClick={onLogout}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm hover:bg-red-500/10 hover:text-red-500 transition-colors"
            style={{ color: 'var(--text-secondary)' }}
          >
            <LogOut size={16} />
            Cerrar sesión
          </button>
        </div>
      </aside>

      {/* Mobile menu */}
      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-40 flex">
          <div className="absolute inset-0 bg-black/50" onClick={() => setSidebarOpen(false)} />
          <aside className="relative w-64 flex flex-col border-r" style={{ borderColor: 'var(--border)', background: 'var(--bg-surface)' }}>
            <div className="h-16 px-6 flex items-center justify-between border-b" style={{ borderColor: 'var(--border)' }}>
              <Link href="/admin" className="text-xl font-display" onClick={() => setSidebarOpen(false)}>
                <span className="gradient-text">FETIS</span>
              </Link>
              <button onClick={() => setSidebarOpen(false)}><X size={20} /></button>
            </div>
            <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
              {NAV.map((n) => (
                <NavItem key={n.href} {...n} pathname={pathname} onClick={() => setSidebarOpen(false)} />
              ))}
            </nav>
            <div className="px-3 py-4 border-t" style={{ borderColor: 'var(--border)' }}>
              <button onClick={toggleTheme} className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm hover:bg-[color:var(--bg-surface-hover)]">
                {theme === 'light' ? <Moon size={16} /> : <Sun size={16} />} {theme === 'light' ? 'Oscuro' : 'Claro'}
              </button>
              <button onClick={onLogout} className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm hover:bg-red-500/10 hover:text-red-500">
                <LogOut size={16} /> Cerrar sesión
              </button>
            </div>
          </aside>
        </div>
      )}

      <div className="flex-1 flex flex-col min-w-0">
        <header
          className="h-16 px-6 lg:px-8 flex items-center justify-between border-b lg:hidden"
          style={{ borderColor: 'var(--border)', background: 'var(--bg-surface)' }}
        >
          <button onClick={() => setSidebarOpen(true)}><Menu size={22} /></button>
          <Link href="/admin" className="font-display text-lg">
            <span className="gradient-text">FETIS</span>
          </Link>
          <div className="w-6" />
        </header>
        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}

function NavItem({
  href,
  label,
  icon: Icon,
  exact,
  pathname,
  onClick,
}: {
  href: string;
  label: string;
  icon: any;
  exact?: boolean;
  pathname: string;
  onClick?: () => void;
}) {
  const active = exact ? pathname === href : pathname.startsWith(href);
  return (
    <Link
      href={href}
      onClick={onClick}
      className={cn(
        'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
        active && 'bg-brand-500/10 text-brand-600 dark:text-brand-300',
      )}
      style={{
        color: active ? undefined : 'var(--text-secondary)',
      }}
    >
      <Icon size={18} className={active ? '' : 'opacity-70'} />
      {label}
    </Link>
  );
}
