'use client';

import { useEffect, useState } from 'react';
import { Plus, Search, Phone, Mail, MapPin, X } from 'lucide-react';
import { apiFetch } from '@/lib/api';
import { formatDate, formatClientAddress } from '@fetis/shared';
import { PageHeader } from '@/components/admin/page-header';
import { Card, CardBody } from '@/components/admin/card';
import { Button, Input, Modal, Label, Textarea, Badge, Field } from '@/components/admin/ui-primitives';
import { AddressFields } from '@/components/admin/address-fields';
import { sanitizePhone, isValidPhone10, isValidEmail, isValidPostalCode, formatPhoneDisplay } from '@/lib/validators';

export default function ClientesPage() {
  const [clients, setClients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<any | null>(null);
  const [creating, setCreating] = useState(false);

  async function refresh() {
    setLoading(true);
    try {
      const data = await apiFetch<any[]>(`/clients${search ? `?search=${encodeURIComponent(search)}` : ''}`);
      setClients(data);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    refresh();
  }, []);

  useEffect(() => {
    const t = setTimeout(refresh, 250);
    return () => clearTimeout(t);
  }, [search]);

  return (
    <>
      <PageHeader
        title="Clientes"
        subtitle="Gestiona tu cartera de clientes"
        actions={
          <Button onClick={() => setCreating(true)}>
            <Plus size={16} /> Nuevo cliente
          </Button>
        }
      />

      <div className="px-6 lg:px-10 pb-10 space-y-4">
        <div className="relative max-w-md">
          <Search size={16} className="absolute left-3.5 top-3 text-[color:var(--text-muted)]" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por nombre, teléfono, email..."
            className="pl-10"
          />
        </div>

        <Card>
          {loading ? (
            <CardBody><div className="text-sm text-[color:var(--text-muted)]">Cargando...</div></CardBody>
          ) : clients.length === 0 ? (
            <CardBody>
              <div className="text-sm text-[color:var(--text-muted)]">
                {search ? 'Sin resultados' : 'Aún no hay clientes. Crea el primero.'}
              </div>
            </CardBody>
          ) : (
            <div className="divide-y" style={{ borderColor: 'var(--border)' }}>
              {clients.map((c) => (
                <button
                  key={c.id}
                  onClick={() => setSelected(c.id)}
                  className="w-full text-left px-5 py-4 flex items-center justify-between gap-4 hover:bg-[color:var(--bg-surface-hover)] transition-colors"
                  style={{ borderTop: '1px solid var(--border)' }}
                >
                  <div className="min-w-0 flex-1">
                    <div className="font-medium" style={{ color: 'var(--text-primary)' }}>{c.name}</div>
                    <div className="text-xs mt-1 flex items-center gap-3 flex-wrap" style={{ color: 'var(--text-muted)' }}>
                      <span className="flex items-center gap-1"><Phone size={12} />{c.phone}</span>
                      {c.email && <span className="flex items-center gap-1"><Mail size={12} />{c.email}</span>}
                      {c.city && <span className="flex items-center gap-1"><MapPin size={12} />{c.city}</span>}
                    </div>
                  </div>
                  <div className="flex gap-1.5 shrink-0">
                    {c._count?.appointments > 0 && <Badge color="purple">{c._count.appointments} citas</Badge>}
                    {c._count?.quotes > 0 && <Badge color="blue">{c._count.quotes} cotiz.</Badge>}
                    {c._count?.payments > 0 && <Badge color="green">{c._count.payments} pagos</Badge>}
                  </div>
                </button>
              ))}
            </div>
          )}
        </Card>
      </div>

      {selected && (
        <ClientDetailModal id={selected} onClose={() => setSelected(null)} onChange={refresh} />
      )}

      {creating && <ClientForm onClose={() => setCreating(false)} onSaved={() => { setCreating(false); refresh(); }} />}
    </>
  );
}

function ClientForm({ onClose, onSaved, initial }: { onClose: () => void; onSaved: () => void; initial?: any }) {
  const [form, setForm] = useState({
    name: initial?.name ?? '',
    phone: initial?.phone ?? '',
    email: initial?.email ?? '',
    street: initial?.street ?? '',
    extNumber: initial?.extNumber ?? '',
    intNumber: initial?.intNumber ?? '',
    neighborhood: initial?.neighborhood ?? '',
    city: initial?.city ?? '',
    state: initial?.state ?? '',
    postalCode: initial?.postalCode ?? '',
    country: initial?.country ?? 'México',
    addressNotes: initial?.addressNotes ?? '',
    notes: initial?.notes ?? '',
  });
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [saving, setSaving] = useState(false);
  const [serverErr, setServerErr] = useState<string | null>(null);

  const errors: Record<string, string> = {};
  if (!form.name.trim()) errors.name = 'Requerido';
  if (form.name.trim().length === 1) errors.name = 'Mínimo 2 caracteres';
  if (!form.phone) errors.phone = 'Requerido';
  else if (!isValidPhone10(form.phone)) errors.phone = 'Debe tener 10 dígitos';
  if (form.email && !isValidEmail(form.email)) errors.email = 'Email inválido';
  if (form.postalCode && !isValidPostalCode(form.postalCode)) errors.postalCode = 'Debe tener 5 dígitos';

  const isValid = Object.keys(errors).length === 0;

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setTouched({ name: true, phone: true, email: true, postalCode: true });
    if (!isValid) return;
    setServerErr(null);
    setSaving(true);
    try {
      const body = {
        ...form,
        email: form.email || null,
        phone: form.phone,
        postalCode: form.postalCode || null,
        state: form.state || null,
      };
      if (initial?.id) {
        await apiFetch(`/clients/${initial.id}`, { method: 'PATCH', body });
      } else {
        await apiFetch('/clients', { method: 'POST', body });
      }
      onSaved();
    } catch (e: any) {
      setServerErr(e.message);
    } finally {
      setSaving(false);
    }
  }

  function show(key: string) {
    return touched[key] ? errors[key] : undefined;
  }

  return (
    <Modal open onClose={onClose} title={initial ? 'Editar cliente' : 'Nuevo cliente'} size="lg">
      <form onSubmit={onSubmit} className="p-6 space-y-5" noValidate>
        <div className="grid sm:grid-cols-2 gap-4">
          <Field label="Nombre" required error={show('name')}>
            <Input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              onBlur={() => setTouched({ ...touched, name: true })}
              error={show('name')}
              placeholder="Nombre completo"
              maxLength={120}
            />
          </Field>
          <Field label="Teléfono" required error={show('phone')} hint={!show('phone') && form.phone && isValidPhone10(form.phone) ? formatPhoneDisplay(form.phone) : undefined}>
            <Input
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: sanitizePhone(e.target.value) })}
              onBlur={() => setTouched({ ...touched, phone: true })}
              error={show('phone')}
              placeholder="5555555555"
              inputMode="numeric"
              maxLength={10}
            />
          </Field>
          <Field label="Email" error={show('email')} className="sm:col-span-2">
            <Input
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              onBlur={() => setTouched({ ...touched, email: true })}
              error={show('email')}
              placeholder="cliente@correo.com (opcional)"
              maxLength={120}
            />
          </Field>
        </div>

        <div className="pt-3 border-t" style={{ borderColor: 'var(--border)' }}>
          <div className="text-xs uppercase tracking-widest mb-3" style={{ color: 'var(--text-muted)' }}>Domicilio</div>
          <AddressFields
            value={form}
            onChange={(patch) => setForm({ ...form, ...patch })}
            errors={{ postalCode: show('postalCode') }}
          />
        </div>

        <Field label="Notas internas" className="pt-3 border-t" hint="Visible solo para el equipo">
          <Textarea rows={3} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} maxLength={2000} />
        </Field>

        {serverErr && <div className="rounded-xl border border-red-500/30 bg-red-500/10 text-red-200 px-4 py-3 text-sm">{serverErr}</div>}

        <div className="flex justify-end gap-2 pt-2 border-t" style={{ borderColor: 'var(--border)' }}>
          <Button type="button" variant="outline" onClick={onClose}>Cancelar</Button>
          <Button type="submit" disabled={saving || !isValid}>{saving ? 'Guardando...' : 'Guardar'}</Button>
        </div>
      </form>
    </Modal>
  );
}

function ClientDetailModal({ id, onClose, onChange }: { id: string; onClose: () => void; onChange: () => void }) {
  const [client, setClient] = useState<any | null>(null);
  const [editing, setEditing] = useState(false);

  useEffect(() => {
    apiFetch(`/clients/${id}`).then(setClient);
  }, [id]);

  if (!client) return <Modal open onClose={onClose}><div className="p-10 text-sm text-[color:var(--text-muted)]">Cargando...</div></Modal>;

  return (
    <Modal open onClose={onClose} title={client.name} size="lg">
      <div className="p-6 space-y-6">
        <div className="grid sm:grid-cols-2 gap-4 text-sm">
          <div><div className="text-xs uppercase tracking-widest text-[color:var(--text-muted)] mb-1">Teléfono</div><div>{formatPhoneDisplay(client.phone)}</div></div>
          {client.email && <div><div className="text-xs uppercase tracking-widest text-[color:var(--text-muted)] mb-1">Email</div><div>{client.email}</div></div>}
          {(client.street || client.neighborhood || client.city) && (
            <div className="sm:col-span-2">
              <div className="text-xs uppercase tracking-widest text-[color:var(--text-muted)] mb-1">Dirección</div>
              <div>{formatClientAddress(client)}</div>
              {client.addressNotes && <div className="text-xs mt-1 italic" style={{ color: 'var(--text-muted)' }}>{client.addressNotes}</div>}
            </div>
          )}
          {client.notes && <div className="sm:col-span-2"><div className="text-xs uppercase tracking-widest text-[color:var(--text-muted)] mb-1">Notas</div><div className="whitespace-pre-wrap">{client.notes}</div></div>}
        </div>

        <Section title={`Citas (${client.appointments?.length ?? 0})`}>
          {client.appointments?.length ? (
            <ul className="text-sm divide-y" style={{ borderColor: 'var(--border)' }}>
              {client.appointments.map((a: any) => (
                <li key={a.id} className="py-2 flex justify-between gap-2" style={{ borderTop: '1px solid var(--border)' }}>
                  <span>{a.title ?? a.type}</span>
                  <span className="text-[color:var(--text-muted)]">{formatDate(a.startTime)}</span>
                </li>
              ))}
            </ul>
          ) : <Empty>Sin citas</Empty>}
        </Section>

        <Section title={`Cotizaciones (${client.quotes?.length ?? 0})`}>
          {client.quotes?.length ? (
            <ul className="text-sm divide-y" style={{ borderColor: 'var(--border)' }}>
              {client.quotes.map((q: any) => (
                <li key={q.id} className="py-2 flex justify-between gap-2" style={{ borderTop: '1px solid var(--border)' }}>
                  <span>{q.number}</span>
                  <span className="text-[color:var(--text-muted)]">${Number(q.total).toLocaleString('es-MX', { minimumFractionDigits: 2 })}</span>
                </li>
              ))}
            </ul>
          ) : <Empty>Sin cotizaciones</Empty>}
        </Section>

        <Section title={`Pagos (${client.payments?.length ?? 0})`}>
          {client.payments?.length ? (
            <ul className="text-sm divide-y" style={{ borderColor: 'var(--border)' }}>
              {client.payments.map((p: any) => (
                <li key={p.id} className="py-2 flex justify-between gap-2" style={{ borderTop: '1px solid var(--border)' }}>
                  <span>{p.concept} {p.quote ? `· ${p.quote.number}` : ''}</span>
                  <span className="text-[color:var(--text-muted)]">${Number(p.amount).toLocaleString('es-MX', { minimumFractionDigits: 2 })}</span>
                </li>
              ))}
            </ul>
          ) : <Empty>Sin pagos</Empty>}
        </Section>

        <div className="flex justify-end gap-2 pt-4 border-t" style={{ borderColor: 'var(--border)' }}>
          <Button variant="outline" onClick={() => setEditing(true)}>Editar</Button>
          <Button onClick={onClose}>Cerrar</Button>
        </div>
      </div>

      {editing && (
        <ClientForm
          initial={client}
          onClose={() => setEditing(false)}
          onSaved={() => { setEditing(false); apiFetch(`/clients/${id}`).then(setClient); onChange(); }}
        />
      )}
    </Modal>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="text-xs uppercase tracking-widest mb-2" style={{ color: 'var(--text-muted)' }}>{title}</div>
      {children}
    </div>
  );
}

function Empty({ children }: { children: React.ReactNode }) {
  return <div className="text-sm text-[color:var(--text-muted)] py-2">{children}</div>;
}
