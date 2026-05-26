// Server component: lee branding.primary_color de los settings públicos
// y emite un <style> que sobrescribe la paleta brand-* de Tailwind con el
// color elegido. Usa color-mix(in oklch, ...) para derivar shades 400/600
// y mantener consistencia con el gradiente del logo.
import { publicApi } from '@/lib/api';

const DEFAULT_COLOR = '#A435F0';

export async function BrandStyle() {
  let color = DEFAULT_COLOR;
  try {
    const business = await publicApi.business();
    const raw = business['branding.primary_color']?.trim();
    if (raw && /^#[0-9a-fA-F]{3,8}$/.test(raw)) color = raw;
  } catch {
    // Si el API no responde, mantenemos el default — no rompe la página.
  }

  const css = `
:root { --brand: ${color}; }

.gradient-text {
  background: linear-gradient(135deg,
    color-mix(in oklch, ${color}, white 12%) 0%,
    ${color} 50%,
    color-mix(in oklch, ${color}, black 22%) 100%);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
}

.bg-brand-500 { background-color: ${color}; }
.bg-brand-600, .hover\\:bg-brand-600:hover { background-color: color-mix(in oklch, ${color}, black 12%); }
.hover\\:bg-brand-500:hover { background-color: ${color}; }

.bg-brand-500\\/5 { background-color: color-mix(in srgb, ${color} 5%, transparent); }
.bg-brand-500\\/10, .hover\\:bg-brand-500\\/10:hover { background-color: color-mix(in srgb, ${color} 10%, transparent); }
.bg-brand-500\\/15 { background-color: color-mix(in srgb, ${color} 15%, transparent); }
.bg-brand-500\\/20, .group:hover .group-hover\\:bg-brand-500\\/20 { background-color: color-mix(in srgb, ${color} 20%, transparent); }

.text-brand-200 { color: color-mix(in oklch, ${color}, white 32%); }
.text-brand-300, .hover\\:text-brand-300:hover { color: color-mix(in oklch, ${color}, white 22%); }
.text-brand-400, .hover\\:text-brand-400:hover, .dark\\:text-brand-400, .dark\\:group-hover\\:text-brand-400 { color: color-mix(in oklch, ${color}, white 12%); }
.text-brand-500, .hover\\:text-brand-500:hover, .group-hover\\:text-brand-500 { color: ${color}; }
.text-brand-600, .hover\\:text-brand-600:hover, .dark\\:text-brand-600 { color: color-mix(in oklch, ${color}, black 12%); }
.text-brand-700 { color: color-mix(in oklch, ${color}, black 22%); }

.border-brand-500 { border-color: ${color}; }
.border-brand-500\\/30 { border-color: color-mix(in srgb, ${color} 30%, transparent); }
.border-brand-500\\/40, .hover\\:border-brand-500\\/40:hover { border-color: color-mix(in srgb, ${color} 40%, transparent); }
.border-brand-500\\/60, .focus\\:border-brand-500\\/60:focus { border-color: color-mix(in srgb, ${color} 60%, transparent); }

.ring-brand-500\\/15, .focus\\:ring-brand-500\\/15:focus { --tw-ring-color: color-mix(in srgb, ${color} 15%, transparent); box-shadow: 0 0 0 3px var(--tw-ring-color); }

.shadow-brand-glow { box-shadow: 0 0 30px -10px color-mix(in srgb, ${color} 50%, transparent); }

.from-brand-500 { --tw-gradient-from: ${color}; --tw-gradient-to: color-mix(in srgb, ${color} 0%, transparent); --tw-gradient-stops: var(--tw-gradient-from), var(--tw-gradient-to); }
.from-brand-500\\/10 { --tw-gradient-from: color-mix(in srgb, ${color} 10%, transparent); --tw-gradient-stops: var(--tw-gradient-from), var(--tw-gradient-to); }
.to-brand-500 { --tw-gradient-to: ${color}; }
.to-brand-600 { --tw-gradient-to: color-mix(in oklch, ${color}, black 12%); }
`.trim();

  return <style dangerouslySetInnerHTML={{ __html: css }} />;
}
