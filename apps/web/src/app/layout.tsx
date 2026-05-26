import type { Metadata, Viewport } from 'next';
import { Inter, Outfit } from 'next/font/google';
import './globals.css';
import { BrandStyle } from '@/components/branding/brand-style';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const outfit = Outfit({
  subsets: ['latin'],
  variable: '--font-display',
  weight: ['300', '400', '500', '600', '700'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Fetis Muebles · Diseño y fabricación a medida',
  description:
    'Muebles a medida que transforman tu espacio. Cocinas, closets, salas, recámaras y más, diseñados y fabricados artesanalmente.',
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:4000'),
  applicationName: 'Fetis Muebles',
  appleWebApp: {
    capable: true,
    title: 'Fetis',
    statusBarStyle: 'black-translucent',
  },
  openGraph: {
    title: 'Fetis Muebles',
    description: 'Muebles a medida que transforman tu espacio.',
    type: 'website',
  },
};

export const viewport: Viewport = {
  themeColor: '#0A0A0A',
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={`${inter.variable} ${outfit.variable}`} suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function(){
                try {
                  var t = localStorage.getItem('fetis-theme');
                  if (!t) t = 'light';
                  document.documentElement.setAttribute('data-theme', t);
                } catch (e) {}
              })();
            `,
          }}
        />
        <BrandStyle />
      </head>
      <body className="font-sans antialiased">{children}</body>
    </html>
  );
}
