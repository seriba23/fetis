// Server component: lee branding.primary_color de los settings públicos
// y emite un <style> que sobrescribe la paleta brand-* de Tailwind con el
// color elegido. Usa color-mix(in oklch, ...) para derivar shades 400/600
// y mantener consistencia con el gradiente del logo.
//
// Las reglas usan !important porque las clases de Tailwind compiladas con
// dark: tienen mayor specificity (parent selector [data-theme="dark"] + clase),
// y replicar la specificity por cada combinación inflaría mucho el CSS.
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

  const lighter = (pct: number) => `color-mix(in oklch, ${color}, white ${pct}%)`;
  const darker = (pct: number) => `color-mix(in oklch, ${color}, black ${pct}%)`;
  const alpha = (pct: number) => `color-mix(in srgb, ${color} ${pct}%, transparent)`;

  const css = `
:root { --brand: ${color}; --brand-tint: ${alpha(10)}; }

.gradient-text {
  background: linear-gradient(135deg, ${lighter(12)} 0%, ${color} 50%, ${darker(22)} 100%) !important;
  -webkit-background-clip: text !important;
  background-clip: text !important;
  -webkit-text-fill-color: transparent !important;
}

.gradient-bg {
  background:
    radial-gradient(ellipse at top, ${alpha(18)}, transparent 60%),
    radial-gradient(ellipse at bottom right, ${alpha(10)}, transparent 50%) !important;
}

.bg-brand-500 { background-color: ${color} !important; }
.bg-brand-600, .hover\\:bg-brand-600:hover { background-color: ${darker(12)} !important; }
.hover\\:bg-brand-500:hover { background-color: ${color} !important; }

.bg-brand-500\\/0 { background-color: transparent !important; }
.bg-brand-500\\/5 { background-color: ${alpha(5)} !important; }
.bg-brand-500\\/10, .hover\\:bg-brand-500\\/10:hover { background-color: ${alpha(10)} !important; }
.bg-brand-500\\/15, .group:hover .group-hover\\:bg-brand-500\\/15 { background-color: ${alpha(15)} !important; }
.bg-brand-500\\/20, .group:hover .group-hover\\:bg-brand-500\\/20 { background-color: ${alpha(20)} !important; }

.text-brand-200 { color: ${lighter(32)} !important; }
.text-brand-300, .hover\\:text-brand-300:hover { color: ${lighter(22)} !important; }
.text-brand-400, .hover\\:text-brand-400:hover, .dark\\:text-brand-400, .dark\\:group-hover\\:text-brand-400 { color: ${lighter(12)} !important; }
.text-brand-500, .hover\\:text-brand-500:hover, .group-hover\\:text-brand-500 { color: ${color} !important; }
.text-brand-600, .hover\\:text-brand-600:hover, .dark\\:text-brand-600 { color: ${darker(12)} !important; }
.text-brand-700 { color: ${darker(22)} !important; }

.text-brand-500\\/15 { color: ${alpha(15)} !important; }
.text-brand-500\\/20 { color: ${alpha(20)} !important; }
.text-brand-500\\/40 { color: ${alpha(40)} !important; }
.text-brand-500\\/60 { color: ${alpha(60)} !important; }

.border-brand-500 { border-color: ${color} !important; }
.border-brand-500\\/30 { border-color: ${alpha(30)} !important; }
.border-brand-500\\/40, .hover\\:border-brand-500\\/40:hover { border-color: ${alpha(40)} !important; }
.border-brand-500\\/60, .focus\\:border-brand-500\\/60:focus { border-color: ${alpha(60)} !important; }

.focus\\:ring-brand-500\\/15:focus { --tw-ring-color: ${alpha(15)} !important; }
.focus\\:ring-brand-500\\/20:focus { --tw-ring-color: ${alpha(20)} !important; }

.shadow-brand-glow { box-shadow: 0 0 30px -10px ${alpha(50)} !important; }

.from-brand-500 { --tw-gradient-from: ${color} !important; }
.from-brand-500\\/10 { --tw-gradient-from: ${alpha(10)} !important; }
.from-brand-500\\/5 { --tw-gradient-from: ${alpha(5)} !important; }
.to-brand-500 { --tw-gradient-to: ${color} !important; }
.to-brand-600 { --tw-gradient-to: ${darker(12)} !important; }
.via-brand-500 { --tw-gradient-via: ${color} !important; }
`.trim();

  return <style dangerouslySetInnerHTML={{ __html: css }} />;
}
