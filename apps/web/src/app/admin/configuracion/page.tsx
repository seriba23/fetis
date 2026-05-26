'use client';

import { useEffect, useState } from 'react';
import { apiFetch } from '@/lib/api';
import { PageHeader } from '@/components/admin/page-header';
import { Card, CardBody, CardHeader } from '@/components/admin/card';
import { Button, Input, Label, Textarea } from '@/components/admin/ui-primitives';

type FieldType = 'text' | 'email' | 'url' | 'textarea' | 'color';
interface FieldDef { key: string; label: string; type: FieldType; placeholder?: string; hint?: string }
interface Section { group: string; title: string; subtitle?: string; items: FieldDef[] }

const FIELDS: Section[] = [
  {
    group: 'branding',
    title: 'Marca',
    subtitle: 'Personaliza el logo y el color principal — se reflejan en toda la landing',
    items: [
      { key: 'branding.logo_text', label: 'Logo (palabra principal)', type: 'text', placeholder: 'FETIS', hint: 'Aparece con efecto degradado en header y footer' },
      { key: 'branding.logo_subtitle', label: 'Logo (subtítulo)', type: 'text', placeholder: 'MUEBLES', hint: 'Aparece a la derecha con letras separadas y tono atenuado' },
      { key: 'branding.primary_color', label: 'Color principal', type: 'color', hint: 'Botones, badges, gradiente del logo y links de acento' },
    ],
  },
  {
    group: 'business',
    title: 'Datos del negocio',
    items: [
      { key: 'business.name', label: 'Nombre del negocio', type: 'text' },
      { key: 'business.email', label: 'Email', type: 'email' },
      { key: 'business.whatsapp', label: 'WhatsApp (incluye lada país, sin signos)', type: 'text', placeholder: '5215555555555' },
      { key: 'business.phone', label: 'Teléfono fijo', type: 'text' },
      { key: 'business.address', label: 'Dirección', type: 'textarea' },
      { key: 'business.instagram', label: 'URL Instagram', type: 'url' },
      { key: 'business.facebook', label: 'URL Facebook', type: 'url' },
    ],
  },
  {
    group: 'landing',
    title: 'Textos de la landing',
    items: [
      { key: 'landing.hero_title', label: 'Título del hero', type: 'text' },
      { key: 'landing.hero_subtitle', label: 'Subtítulo del hero', type: 'textarea' },
      { key: 'landing.about_title', label: 'Título sección "Nosotros"', type: 'text' },
      { key: 'landing.about_text', label: 'Texto sección "Nosotros"', type: 'textarea' },
    ],
  },
];

export default function ConfiguracionPage() {
  const [data, setData] = useState<Record<string, string>>({});
  const [original, setOriginal] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  async function load() {
    const all = await apiFetch<Record<string, string>>('/settings');
    setData(all);
    setOriginal(all);
  }
  useEffect(() => { load(); }, []);

  async function onSave() {
    setSaving(true);
    setSaved(false);
    try {
      const changed = Object.entries(data).filter(([k, v]) => original[k] !== v).map(([k, v]) => ({
        key: k,
        value: v,
        type: 'string',
        group: k.split('.')[0] || 'business',
      }));
      await apiFetch('/settings', { method: 'POST', body: { items: changed } });
      setOriginal(data);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } finally {
      setSaving(false);
    }
  }

  function set(key: string, value: string) {
    setData((prev) => ({ ...prev, [key]: value }));
  }

  const dirty = Object.keys(data).some((k) => data[k] !== original[k]);

  return (
    <>
      <PageHeader
        title="Configuración"
        subtitle="Datos del negocio y textos de la landing pública"
        actions={
          <>
            {saved && <span className="text-sm text-emerald-600">✓ Guardado</span>}
            <Button onClick={onSave} disabled={saving || !dirty}>{saving ? 'Guardando...' : 'Guardar cambios'}</Button>
          </>
        }
      />

      <div className="px-6 lg:px-10 pb-10 space-y-6 max-w-3xl">
        {FIELDS.map((section) => (
          <Card key={section.group}>
            <CardHeader title={section.title} subtitle={section.subtitle} />
            <CardBody className="space-y-4">
              {section.items.map((f) => (
                <div key={f.key}>
                  <Label>{f.label}</Label>
                  {f.type === 'textarea' ? (
                    <Textarea rows={3} value={data[f.key] ?? ''} onChange={(e) => set(f.key, e.target.value)} />
                  ) : f.type === 'color' ? (
                    <div className="flex items-center gap-3">
                      <input
                        type="color"
                        value={data[f.key] || '#A435F0'}
                        onChange={(e) => set(f.key, e.target.value)}
                        className="w-14 h-10 rounded-lg cursor-pointer border"
                        style={{ borderColor: 'var(--border)', background: 'transparent' }}
                      />
                      <Input
                        type="text"
                        placeholder="#A435F0"
                        value={data[f.key] ?? ''}
                        onChange={(e) => set(f.key, e.target.value)}
                        className="flex-1 font-mono uppercase"
                      />
                    </div>
                  ) : (
                    <Input type={f.type} placeholder={f.placeholder} value={data[f.key] ?? ''} onChange={(e) => set(f.key, e.target.value)} />
                  )}
                  {f.hint && (
                    <div className="text-xs mt-1.5" style={{ color: 'var(--text-muted)' }}>{f.hint}</div>
                  )}
                </div>
              ))}
            </CardBody>
          </Card>
        ))}
      </div>
    </>
  );
}
