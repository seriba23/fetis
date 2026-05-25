'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Plus, Search, FileText } from 'lucide-react';
import { apiFetch } from '@/lib/api';
import { formatMoney, QUOTE_STATUS_LABELS, type QuoteStatus } from '@fetis/shared';
import { PageHeader } from '@/components/admin/page-header';
import { Card } from '@/components/admin/card';
import { Button, Input, Select, Badge, Modal, Label } from '@/components/admin/ui-primitives';

const STATUS_COLORS: Record<QuoteStatus, 'gray' | 'blue' | 'green' | 'red' | 'yellow' | 'purple'> = {
  DRAFT: 'gray',
  SENT: 'blue',
  ACCEPTED: 'green',
  REJECTED: 'red',
  EXPIRED: 'yellow',
  CONVERTED: 'purple',
};

export default function CotizacionesPage() {
  const router = useRouter();
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [creating, setCreating] = useState(false);

  async function refresh() {
    setLoading(true);
    try {
      const qs = new URLSearchParams();
      if (search) qs.set('search', search);
      if (status) qs.set('status', status);
      const data = await apiFetch<any[]>(`/quotes?${qs.toString()}`);
      setItems(data);
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => { refresh(); }, []);
  useEffect(() => { const t = setTimeout(refresh, 250); return () => clearTimeout(t); }, [search, status]);

  return (
    <>
      <PageHeader
        title="Cotizaciones"
        subtitle="Crea cotizaciones con partidas para cada mueble"
        actions={<Button onClick={() => setCreating(true)}><Plus size={16} /> Nueva cotización</Button>}
      />

      <div className="px-6 lg:px-10 pb-10 space-y-4">
        <div className="flex gap-3 flex-wrap">
          <div className="relative flex-1 min-w-[250px] max-w-md">
            <Search size={16} className="absolute left-3.5 top-3 text-[color:var(--text-muted)]" />
            <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar por número o cliente..." className="pl-10" />
          </div>
          <Select value={status} onChange={(e) => setStatus(e.target.value)} className="max-w-[200px]">
            <option value="">Todos los estados</option>
            {Object.entries(QUOTE_STATUS_LABELS).map(([k, v]) => (
              <option key={k} value={k}>{v}</option>
            ))}
          </Select>
        </div>

        <Card>
          {loading ? (
            <div className="p-6 text-sm text-[color:var(--text-muted)]">Cargando...</div>
          ) : items.length === 0 ? (
            <div className="p-10 text-center">
              <FileText size={32} className="mx-auto text-[color:var(--text-muted)] mb-3" />
              <div className="text-sm text-[color:var(--text-muted)]">Sin cotizaciones todavía</div>
            </div>
          ) : (
            <div className="divide-y" style={{ borderColor: 'var(--border)' }}>
              {items.map((q) => (
                <Link
                  key={q.id}
                  href={`/admin/cotizaciones/${q.id}`}
                  className="block px-5 py-4 hover:bg-[color:var(--bg-surface-hover)] transition-colors"
                  style={{ borderTop: '1px solid var(--border)' }}
                >
                  <div className="flex items-center justify-between gap-4">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-3 mb-1">
                        <span className="font-medium" style={{ color: 'var(--text-primary)' }}>{q.number}</span>
                        <Badge color={STATUS_COLORS[q.status as QuoteStatus]}>{QUOTE_STATUS_LABELS[q.status as QuoteStatus]}</Badge>
                      </div>
                      <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>{q.client?.name}</div>
                      <div className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
                        {q._count?.items ?? 0} partidas · {new Date(q.createdAt).toLocaleDateString('es-MX')}
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="text-lg font-display" style={{ color: 'var(--text-primary)' }}>{formatMoney(q.total)}</div>
                      {Number(q.paidAmount) > 0 && (
                        <div className="text-xs text-emerald-600 mt-0.5">Pagado: {formatMoney(q.paidAmount)}</div>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </Card>
      </div>

      {creating && <NewQuoteModal onClose={() => setCreating(false)} onCreated={(id) => router.push(`/admin/cotizaciones/${id}`)} />}
    </>
  );
}

function NewQuoteModal({ onClose, onCreated }: { onClose: () => void; onCreated: (id: string) => void }) {
  const [clients, setClients] = useState<any[]>([]);
  const [clientId, setClientId] = useState('');
  const [validUntil, setValidUntil] = useState('');
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => { apiFetch('/clients').then(setClients); }, []);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setSaving(true);
    try {
      const created = await apiFetch<any>('/quotes', {
        method: 'POST',
        body: {
          clientId,
          status: 'DRAFT',
          validUntil: validUntil ? new Date(validUntil).toISOString() : undefined,
          items: [],
        },
      });
      onCreated(created.id);
    } catch (e: any) {
      setErr(e.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal open onClose={onClose} title="Nueva cotización">
      <form onSubmit={onSubmit} className="p-6 space-y-4">
        <div>
          <Label>Cliente *</Label>
          <Select required value={clientId} onChange={(e) => setClientId(e.target.value)}>
            <option value="">Selecciona...</option>
            {clients.map((c) => (
              <option key={c.id} value={c.id}>{c.name} · {c.phone}</option>
            ))}
          </Select>
        </div>
        <div>
          <Label>Válida hasta (opcional)</Label>
          <Input type="date" value={validUntil} onChange={(e) => setValidUntil(e.target.value)} />
        </div>
        {err && <div className="text-sm text-red-500">{err}</div>}
        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="outline" onClick={onClose}>Cancelar</Button>
          <Button type="submit" disabled={saving || !clientId}>{saving ? 'Creando...' : 'Crear y agregar partidas'}</Button>
        </div>
      </form>
    </Modal>
  );
}
