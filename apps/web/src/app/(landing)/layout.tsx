import Link from 'next/link';
import { LandingHeader } from '@/components/landing/landing-header';
import { LandingFooter } from '@/components/landing/landing-footer';
import { WhatsAppButton } from '@/components/landing/whatsapp-button';
import { publicApi } from '@/lib/api';

export default async function LandingLayout({ children }: { children: React.ReactNode }) {
  let business: Record<string, string> = {};
  try {
    business = await publicApi.business();
  } catch {
    business = {};
  }
  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'var(--ld-bg)', color: 'var(--ld-text)' }}>
      <LandingHeader
        logoText={business['branding.logo_text'] || 'FETIS'}
        logoSubtitle={business['branding.logo_subtitle'] || 'MUEBLES'}
      />
      <main className="flex-1">{children}</main>
      <LandingFooter business={business} />
      <WhatsAppButton phone={business['business.whatsapp']} />
    </div>
  );
}
