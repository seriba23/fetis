'use client';

import { useEffect, useState } from 'react';
import { Plus, Search, CreditCard } from 'lucide-react';
import dayjs from 'dayjs';
import { apiFetch } from '@/lib/api';
import { formatMoney, PAYMENT_METHOD_LABELS, PAYMENT_CONCEPT_LABELS, PAYMENT_METHODS, PAYMENT_CONCEPTS } from '@fetis/shared';
import { PageHeader } from '@/components/admin/page-header';
import { Card } from '@/components/admin/card';
import { Button, Input, Select, Badge, Modal, Label, Textarea } from '@/components/admin/ui-primitives';

export default function PagosPage() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);

  async function refresh() {
    setLoading(true);
    try {
      const data = await apiFetch<any[]>('/payments');
      setItems(data);
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => { refresh(); }, []);

  const total = items.reduce((acc, p) => acc + (p.status === 'COMPLETED' ? Number(p.amount) : 0), 0);

  return (
    <>
      <PageHeader
        title="Pagos"
        subtitle={`Total registrado: ${formatMoney(total)}`}
        actions={<Button onClick={() => setCreating(true)}><Plus size={16} /> Registrar pago</Button>}
      />

      <div className="px-6 lg:px-10 pb-10">
        <Card>
          {loading ? (
            <div className="p-6 text-sm text-[color:var(--text-muted)]">Cargando...</div>
          ) : items.length === 0 ? (
            <div className="p-10 text-center">
              <CreditCard size={32} className="mx-auto text-[color:var(--text-muted)] mb-3" />
              <div className="text-sm text-[color:var(--text-muted)]">Sin pagos registrados</div>
            </div>
          ) : (
            <div className="divide-y" style={{ borderColor: 'var(--border)' }}>
              {items.map((p) => (
                <div key={p.id} className="px-5 py-4 flex items-center justify-between gap-4" style={{ borderTop: '1px solid var(--border)' }}>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium" style={{ color: 'var(--text-primary)' }}>{p.client?.name}</span>
                      {p.quote && <Badge color="blue">{p.quote.number}</Badge>}
                      <Badge color={p.status === 'COMPLETED' ? 'green' : p.status === 'PENDING' ? 'yellow' : 'gray'}>
                        {p.status === 'COMPLETED' ? 'Completado' : p.status === 'PENDING' ? 'Pendiente' : 'Cancelado'}
                      </Badge>
                    </div>
                    <div className="text-xs" style={{ color: 'var(--text-muted)' }}>
                      {PAYMENT_CONCEPT_LABELS[p.concept as keyof typeof PAYMENT_CONCEPT_LABELS] ?? p.concept}
                      {' · '}{PAYMENT_METHOD_LABELS[p.method as keyof typeof PAYMENT_METHOD_LABELS] ?? p.method}
                      {' · '}{dayjs(p.paidAt).format('DD MMM YYYY')}
                      {p.reference && ` · ref: ${p.reference}`}
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="text-lg font-display" style={{ color: 'var(--text-primary)' }}>{formatMoney(p.amount)}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      {creating && <PaymentForm onClose={() => setCreating(false)} onSaved={() => { setCreating(false); refresh(); }} />}
    </>
  );
}

function PaymentForm({ onClose, onSaved }: { onClose: () => void; onSaved: () => void }) {
  const [clients, setClients] = useState<any[]>([]);
  const [quotes, setQuotes] = useState<any[]>([]);
  const [form, setForm] = useState({
    clientId: '',
    quoteId: '',
    amount: 0,
    method: 'CASH' as (typeof PAYMENT_METHODS)[number],
    concept: 'DEPOSIT' as (typeof PAYMENT_CONCEPTS)[number],
    reference: '',
    paidAt: dayjs().format('YYYY-MM-DDTHH:mm'),
    notes: '',
  });
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => { apiFetch('/clients').then(setClients); }, []);
  useEffect(() => {
    if (form.clientId) apiFetch(`/quotes?clientId=${form.clientId}`).then(setQuotes);
    else setQuotes([]);
  }, [form.clientId]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setSaving(true);
    try {
      await apiFetch('/payments', {
        method: 'POST',
        body: {
          ...form,
          quoteId: form.quoteId || undefined,
          amount: Number(form.amount),
          paidAt: new Date(form.paidAt).toISOString(),
          reference: form.reference || undefined,
          notes: form.notes || undefined,
        },
      });
      onSaved();
    } catch (e: any) {
      setErr(e.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal open onClose={onClose} title="Registrar pago">
      <form onSubmit={onSubmit} className="p-6 space-y-4">
        <div>
          <Label>Cliente *</Label>
          <Select required value={form.clientId} onChange={(e) => setForm({ ...form, clientId: e.target.value, quoteId: '' })}>
            <option value="">Selecciona...</option>
            {clients.map((c) => <option key={c.id} value={c.id}>{c.name} · {c.phone}</option>)}
          </Select>
        </div>
        {quotes.length > 0 && (
          <div>
            <Label>Cotización (opcional)</Label>
            <Select value={form.quoteId} onChange={(e) => setForm({ ...form, quoteId: e.target.value })}>
              <option value="">Sin asociar</option>
              {quotes.map((q) => <option key={q.id} value={q.id}>{q.number} · {formatMoney(q.total)}</option>)}
            </Select>
          </div>
        )}
        <div className="grid sm:grid-cols-3 gap-3">
          <div>
            <Label>Monto *</Label>
            <Input type="number" min="0.01" step="0.01" required value={form.amount || ''} onChange={(e) => setForm({ ...form, amount: e.target.value === '' ? 0 : Number(e.target.value) })} />
          </div>
          <div>
            <Label>Método *</Label>
            <Select value={form.method} onChange={(e) => setForm({ ...form, method: e.target.value as any })}>
              {Object.entries(PAYMENT_METHOD_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </Select>
          </div>
          <div>
            <Label>Concepto *</Label>
            <Select value={form.concept} onChange={(e) => setForm({ ...form, concept: e.target.value as any })}>
              {Object.entries(PAYMENT_CONCEPT_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </Select>
          </div>
        </div>
        <div className="grid sm:grid-cols-2 gap-3">
          <div>
            <Label>Fecha *</Label>
            <Input type="datetime-local" required value={form.paidAt} onChange={(e) => setForm({ ...form, paidAt: e.target.value })} />
          </div>
          <div>
            <Label>Referencia</Label>
            <Input value={form.reference} onChange={(e) => setForm({ ...form, reference: e.target.value })} placeholder="Núm. transferencia, últimos 4..." />
          </div>
        </div>
        <div>
          <Label>Notas</Label>
          <Textarea rows={2} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
        </div>
        {err && <div className="text-sm text-red-500">{err}</div>}
        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="outline" onClick={onClose}>Cancelar</Button>
          <Button type="submit" disabled={saving}>{saving ? 'Guardando...' : 'Registrar pago'}</Button>
        </div>
      </form>
    </Modal>
  );
}
