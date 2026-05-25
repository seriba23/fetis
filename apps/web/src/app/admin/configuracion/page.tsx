'use client';

import { useEffect, useState } from 'react';
import { apiFetch } from '@/lib/api';
import { PageHeader } from '@/components/admin/page-header';
import { Card, CardBody, CardHeader } from '@/components/admin/card';
import { Button, Input, Label, Textarea } from '@/components/admin/ui-primitives';

const FIELDS = [
  { group: 'business', items: [
    { key: 'business.name', label: 'Nombre del negocio', type: 'text' },
    { key: 'business.email', label: 'Email', type: 'email' },
    { key: 'business.whatsapp', label: 'WhatsApp (incluye lada país, sin signos)', type: 'text', placeholder: '5215555555555' },
    { key: 'business.phone', label: 'Teléfono fijo', type: 'text' },
    { key: 'business.address', label: 'Dirección', type: 'textarea' },
    { key: 'business.instagram', label: 'URL Instagram', type: 'url' },
    { key: 'business.facebook', label: 'URL Facebook', type: 'url' },
  ]},
  { group: 'landing', items: [
    { key: 'landing.hero_title', label: 'Título del hero', type: 'text' },
    { key: 'landing.hero_subtitle', label: 'Subtítulo del hero', type: 'textarea' },
    { key: 'landing.about_title', label: 'Título sección "Nosotros"', type: 'text' },
    { key: 'landing.about_text', label: 'Texto sección "Nosotros"', type: 'textarea' },
  ]},
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
        group: k.split('.')[0] === 'landing' ? 'landing' : 'business',
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
            <CardHeader title={section.group === 'business' ? 'Datos del negocio' : 'Textos de la landing'} />
            <CardBody className="space-y-4">
              {section.items.map((f) => (
                <div key={f.key}>
                  <Label>{f.label}</Label>
                  {f.type === 'textarea' ? (
                    <Textarea rows={3} value={data[f.key] ?? ''} onChange={(e) => set(f.key, e.target.value)} />
                  ) : (
                    <Input type={f.type} placeholder={f.placeholder} value={data[f.key] ?? ''} onChange={(e) => set(f.key, e.target.value)} />
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
