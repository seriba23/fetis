'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Plus, Trash2, Send, Check, Printer, Edit } from 'lucide-react';
import { apiFetch } from '@/lib/api';
import {
  formatMoney,
  QUOTE_STATUS_LABELS,
  type QuoteStatus,
  type AttributeField,
} from '@fetis/shared';
import { PageHeader } from '@/components/admin/page-header';
import { Card } from '@/components/admin/card';
import { Button, Input, Select, Textarea, Modal, Label, Badge } from '@/components/admin/ui-primitives';
import { FurnitureIcon } from '@/components/icons/furniture-icon';

const STATUS_COLORS: Record<QuoteStatus, 'gray' | 'blue' | 'green' | 'red' | 'yellow' | 'purple'> = {
  DRAFT: 'gray',
  SENT: 'blue',
  ACCEPTED: 'green',
  REJECTED: 'red',
  EXPIRED: 'yellow',
  CONVERTED: 'purple',
};

export default function QuoteDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [quote, setQuote] = useState<any | null>(null);
  const [types, setTypes] = useState<any[]>([]);
  const [addingItem, setAddingItem] = useState(false);
  const [editingItem, setEditingItem] = useState<any | null>(null);
  const [editingMeta, setEditingMeta] = useState(false);

  async function load() {
    const [q, ts] = await Promise.all([
      apiFetch(`/quotes/${params.id}`),
      apiFetch('/furniture-types?active=true'),
    ]);
    setQuote(q);
    setTypes(ts as any[]);
  }
  useEffect(() => { load(); }, [params.id]);

  async function changeStatus(s: QuoteStatus) {
    await apiFetch(`/quotes/${params.id}`, { method: 'PATCH', body: { status: s } });
    load();
  }
  async function removeItem(itemId: string) {
    if (!confirm('¿Eliminar partida?')) return;
    await apiFetch(`/quotes/${params.id}/items/${itemId}`, { method: 'DELETE' });
    load();
  }
  async function deleteQuote() {
    if (!confirm('¿Eliminar cotización completa?')) return;
    await apiFetch(`/quotes/${params.id}`, { method: 'DELETE' });
    router.push('/admin/cotizaciones');
  }

  if (!quote) return <div className="p-10 text-sm text-[color:var(--text-muted)]">Cargando...</div>;

  return (
    <>
      <div className="px-6 lg:px-10 pt-6">
        <Link href="/admin/cotizaciones" className="inline-flex items-center gap-2 text-sm text-[color:var(--text-muted)] hover:text-[color:var(--text-primary)]">
          <ArrowLeft size={14} /> Cotizaciones
        </Link>
      </div>

      <PageHeader
        title={`${quote.number}`}
        subtitle={`${quote.client?.name} · ${quote.client?.phone}`}
        actions={
          <div className="flex gap-2 flex-wrap items-center">
            <Badge color={STATUS_COLORS[quote.status as QuoteStatus]}>{QUOTE_STATUS_LABELS[quote.status as QuoteStatus]}</Badge>
            {quote.status === 'DRAFT' && <Button onClick={() => changeStatus('SENT')}><Send size={14} /> Marcar enviada</Button>}
            {quote.status === 'SENT' && (
              <>
                <Button variant="outline" onClick={() => changeStatus('REJECTED')}>Rechazada</Button>
                <Button onClick={() => changeStatus('ACCEPTED')}><Check size={14} /> Aceptada</Button>
              </>
            )}
            <Button variant="outline" onClick={() => window.print()}><Printer size={14} /> Imprimir</Button>
          </div>
        }
      />

      <div className="px-6 lg:px-10 pb-10 space-y-6">
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <div className="px-6 py-4 border-b flex items-center justify-between" style={{ borderColor: 'var(--border)' }}>
                <div className="font-medium">Partidas</div>
                <Button size="sm" variant="secondary" onClick={() => setAddingItem(true)}><Plus size={14} /> Agregar</Button>
              </div>
              {quote.items?.length === 0 ? (
                <div className="p-8 text-center text-sm text-[color:var(--text-muted)]">
                  Aún no hay partidas. Agrega la primera.
                </div>
              ) : (
                <div className="divide-y" style={{ borderColor: 'var(--border)' }}>
                  {quote.items?.map((it: any) => (
                    <div key={it.id} className="px-6 py-4 flex items-start justify-between gap-4" style={{ borderTop: '1px solid var(--border)' }}>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="w-8 h-8 rounded-lg flex items-center justify-center text-brand-600 bg-brand-500/10 shrink-0">
                            <FurnitureIcon slug={it.furnitureType?.slug ?? 'otros'} size={16} />
                          </span>
                          <span className="font-medium" style={{ color: 'var(--text-primary)' }}>{it.title}</span>
                        </div>
                        <div className="text-xs uppercase tracking-widest mb-2" style={{ color: 'var(--text-muted)' }}>
                          {it.furnitureType?.name}
                        </div>
                        <SpecsRender specs={it.specs} schema={(it.furnitureType?.attributesSchema as AttributeField[]) ?? []} />
                        {it.notes && (
                          <div className="mt-3 text-xs italic" style={{ color: 'var(--text-muted)' }}>
                            Notas: {it.notes}
                          </div>
                        )}
                      </div>
                      <div className="text-right shrink-0">
                        <div className="text-sm" style={{ color: 'var(--text-muted)' }}>{it.quantity} × {formatMoney(it.unitPrice)}</div>
                        <div className="font-medium" style={{ color: 'var(--text-primary)' }}>{formatMoney(it.subtotal)}</div>
                        <div className="flex justify-end gap-1 mt-2">
                          <Button size="sm" variant="ghost" onClick={() => setEditingItem(it)}><Edit size={12} /></Button>
                          <Button size="sm" variant="ghost" onClick={() => removeItem(it.id)}><Trash2 size={12} /></Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>

            {quote.notes && (
              <Card>
                <div className="px-6 py-4 border-b" style={{ borderColor: 'var(--border)' }}>
                  <div className="font-medium">Notas para el cliente</div>
                </div>
                <div className="px-6 py-4 text-sm whitespace-pre-wrap">{quote.notes}</div>
              </Card>
            )}
          </div>

          <div className="space-y-6">
            <Card>
              <div className="px-6 py-4 border-b flex items-center justify-between" style={{ borderColor: 'var(--border)' }}>
                <div className="font-medium">Totales</div>
                <Button size="sm" variant="ghost" onClick={() => setEditingMeta(true)}><Edit size={12} /></Button>
              </div>
              <div className="px-6 py-4 space-y-2 text-sm">
                <Row label="Subtotal" value={formatMoney(quote.subtotal)} />
                {Number(quote.discount) > 0 && <Row label="Descuento" value={`- ${formatMoney(quote.discount)}`} />}
                {Number(quote.taxRate) > 0 && <Row label={`IVA (${quote.taxRate}%)`} value={formatMoney(quote.taxAmount)} />}
                <div className="pt-2 border-t" style={{ borderColor: 'var(--border)' }}>
                  <Row label="Total" value={formatMoney(quote.total)} bold />
                </div>
                {Number(quote.paidAmount) > 0 && (
                  <>
                    <Row label="Pagado" value={formatMoney(quote.paidAmount)} />
                    <Row label="Saldo" value={formatMoney(Number(quote.total) - Number(quote.paidAmount))} />
                  </>
                )}
              </div>
            </Card>

            {quote.validUntil && (
              <Card>
                <div className="px-6 py-4 text-sm">
                  <div className="text-xs uppercase tracking-widest mb-1" style={{ color: 'var(--text-muted)' }}>Válida hasta</div>
                  {new Date(quote.validUntil).toLocaleDateString('es-MX', { dateStyle: 'long' })}
                </div>
              </Card>
            )}

            <Card>
              <div className="px-6 py-4 text-sm space-y-1">
                <Row label="Creada" value={new Date(quote.createdAt).toLocaleDateString('es-MX', { dateStyle: 'medium' })} />
                {quote.sentAt && <Row label="Enviada" value={new Date(quote.sentAt).toLocaleDateString('es-MX', { dateStyle: 'medium' })} />}
                {quote.acceptedAt && <Row label="Aceptada" value={new Date(quote.acceptedAt).toLocaleDateString('es-MX', { dateStyle: 'medium' })} />}
              </div>
            </Card>

            {(quote.status === 'DRAFT' || quote.status === 'REJECTED' || quote.status === 'EXPIRED') && (
              <Button variant="danger" onClick={deleteQuote}>Eliminar cotización</Button>
            )}
          </div>
        </div>
      </div>

      {addingItem && (
        <QuoteItemForm
          types={types}
          quoteId={params.id}
          onClose={() => setAddingItem(false)}
          onSaved={() => { setAddingItem(false); load(); }}
        />
      )}
      {editingItem && (
        <QuoteItemForm
          types={types}
          quoteId={params.id}
          item={editingItem}
          onClose={() => setEditingItem(null)}
          onSaved={() => { setEditingItem(null); load(); }}
        />
      )}
      {editingMeta && (
        <QuoteMetaForm
          quote={quote}
          onClose={() => setEditingMeta(false)}
          onSaved={() => { setEditingMeta(false); load(); }}
        />
      )}
    </>
  );
}

function Row({ label, value, bold }: { label: string; value: string; bold?: boolean }) {
  return (
    <div className="flex justify-between">
      <span style={{ color: 'var(--text-secondary)' }}>{label}</span>
      <span className={bold ? 'font-medium text-base' : ''} style={{ color: 'var(--text-primary)' }}>{value}</span>
    </div>
  );
}

function SpecsRender({ specs, schema }: { specs: Record<string, any>; schema: AttributeField[] }) {
  if (!specs || Object.keys(specs).length === 0) return null;
  return (
    <div className="grid sm:grid-cols-2 gap-x-4 gap-y-1 text-xs">
      {schema.map((f) => {
        const val = specs[f.key];
        if (val == null || val === '') return null;
        let displayVal: string;
        if (f.type === 'boolean') displayVal = val ? 'Sí' : 'No';
        else displayVal = String(val) + (f.unit ? ` ${f.unit}` : '');
        return (
          <div key={f.key}>
            <span style={{ color: 'var(--text-muted)' }}>{f.label}:</span>{' '}
            <span style={{ color: 'var(--text-secondary)' }}>{displayVal}</span>
          </div>
        );
      })}
    </div>
  );
}

function QuoteItemForm({ types, quoteId, item, onClose, onSaved }: { types: any[]; quoteId: string; item?: any; onClose: () => void; onSaved: () => void }) {
  const [furnitureTypeId, setFurnitureTypeId] = useState<string>(item?.furnitureTypeId ?? '');
  const [title, setTitle] = useState(item?.title ?? '');
  const [specs, setSpecs] = useState<Record<string, any>>(item?.specs ?? {});
  const [notes, setNotes] = useState(item?.notes ?? '');
  const [unitPrice, setUnitPrice] = useState<number>(Number(item?.unitPrice ?? 0));
  const [quantity, setQuantity] = useState<number>(item?.quantity ?? 1);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const selectedType = types.find((t) => t.id === furnitureTypeId);
  const schema: AttributeField[] = (selectedType?.attributesSchema as AttributeField[]) ?? [];

  function setSpec(key: string, value: any) {
    setSpecs((prev) => ({ ...prev, [key]: value }));
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setSaving(true);
    try {
      const body = {
        furnitureTypeId,
        title,
        specs,
        notes: notes || undefined,
        unitPrice: Number(unitPrice),
        quantity: Number(quantity),
      };
      if (item) {
        const { furnitureTypeId: _ft, ...rest } = body;
        await apiFetch(`/quotes/${quoteId}/items/${item.id}`, { method: 'PATCH', body: rest });
      } else {
        await apiFetch(`/quotes/${quoteId}/items`, { method: 'POST', body });
      }
      onSaved();
    } catch (e: any) {
      setErr(e.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal open onClose={onClose} title={item ? 'Editar partida' : 'Nueva partida'} size="lg">
      <form onSubmit={onSubmit} className="p-6 space-y-5">
        <div>
          <Label>Tipo de mueble *</Label>
          <Select required value={furnitureTypeId} onChange={(e) => { setFurnitureTypeId(e.target.value); setSpecs({}); }} disabled={!!item}>
            <option value="">Selecciona...</option>
            {types.map((t) => (
              <option key={t.id} value={t.id}>{t.name}</option>
            ))}
          </Select>
        </div>

        {selectedType && (
          <>
            <div>
              <Label>Título de la partida *</Label>
              <Input
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder={`Ej: ${selectedType.name} a medida`}
              />
            </div>

            <div className="border-t pt-5" style={{ borderColor: 'var(--border)' }}>
              <div className="text-xs uppercase tracking-widest mb-3" style={{ color: 'var(--text-muted)' }}>Atributos del mueble</div>
              <div className="grid sm:grid-cols-2 gap-3">
                {schema.map((f) => (
                  <div key={f.key} className={f.type === 'textarea' ? 'sm:col-span-2' : ''}>
                    <Label>{f.label}{f.required ? ' *' : ''}{f.unit ? ` (${f.unit})` : ''}</Label>
                    {f.type === 'select' ? (
                      <Select required={f.required} value={specs[f.key] ?? ''} onChange={(e) => setSpec(f.key, e.target.value)}>
                        <option value="">—</option>
                        {f.options?.map((o) => <option key={o} value={o}>{o}</option>)}
                      </Select>
                    ) : f.type === 'textarea' ? (
                      <Textarea rows={2} value={specs[f.key] ?? ''} onChange={(e) => setSpec(f.key, e.target.value)} placeholder={f.placeholder} />
                    ) : f.type === 'boolean' ? (
                      <Select value={specs[f.key] ? 'true' : 'false'} onChange={(e) => setSpec(f.key, e.target.value === 'true')}>
                        <option value="false">No</option>
                        <option value="true">Sí</option>
                      </Select>
                    ) : (
                      <Input
                        required={f.required}
                        type={f.type === 'number' ? 'number' : 'text'}
                        value={specs[f.key] ?? ''}
                        onChange={(e) => setSpec(f.key, f.type === 'number' ? (e.target.value === '' ? '' : Number(e.target.value)) : e.target.value)}
                        placeholder={f.placeholder}
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div>
              <Label>Observaciones / extras</Label>
              <Textarea
                rows={3}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Anotaciones adicionales, requerimientos especiales, accesorios..."
              />
            </div>

            <div className="grid sm:grid-cols-3 gap-3 pt-4 border-t" style={{ borderColor: 'var(--border)' }}>
              <div>
                <Label>Precio unitario *</Label>
                <Input type="number" step="0.01" min="0" required value={unitPrice || ''} onChange={(e) => setUnitPrice(e.target.value === '' ? 0 : Number(e.target.value))} />
              </div>
              <div>
                <Label>Cantidad *</Label>
                <Input type="number" min="1" required value={quantity || ''} onChange={(e) => setQuantity(e.target.value === '' ? 1 : Number(e.target.value))} />
              </div>
              <div>
                <Label>Subtotal</Label>
                <div className="text-lg font-display py-2" style={{ color: 'var(--text-primary)' }}>
                  {formatMoney((unitPrice || 0) * (quantity || 0))}
                </div>
              </div>
            </div>
          </>
        )}

        {err && <div className="text-sm text-red-500">{err}</div>}
        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="outline" onClick={onClose}>Cancelar</Button>
          <Button type="submit" disabled={saving || !furnitureTypeId}>{saving ? 'Guardando...' : (item ? 'Guardar cambios' : 'Agregar partida')}</Button>
        </div>
      </form>
    </Modal>
  );
}

function QuoteMetaForm({ quote, onClose, onSaved }: { quote: any; onClose: () => void; onSaved: () => void }) {
  const [discount, setDiscount] = useState<number>(Number(quote.discount));
  const [taxRate, setTaxRate] = useState<number>(Number(quote.taxRate));
  const [validUntil, setValidUntil] = useState<string>(quote.validUntil ? quote.validUntil.slice(0, 10) : '');
  const [notes, setNotes] = useState(quote.notes ?? '');
  const [internalNotes, setInternalNotes] = useState(quote.internalNotes ?? '');
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setSaving(true);
    try {
      await apiFetch(`/quotes/${quote.id}`, {
        method: 'PATCH',
        body: {
          discount: Number(discount),
          taxRate: Number(taxRate),
          validUntil: validUntil ? new Date(validUntil).toISOString() : null,
          notes,
          internalNotes,
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
    <Modal open onClose={onClose} title="Editar cotización">
      <form onSubmit={onSubmit} className="p-6 space-y-4">
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <Label>Descuento (monto)</Label>
            <Input type="number" min="0" step="0.01" value={discount || ''} onChange={(e) => setDiscount(e.target.value === '' ? 0 : Number(e.target.value))} />
          </div>
          <div>
            <Label>IVA (%)</Label>
            <Input type="number" min="0" step="0.01" value={taxRate || ''} onChange={(e) => setTaxRate(e.target.value === '' ? 0 : Number(e.target.value))} />
          </div>
        </div>
        <div>
          <Label>Válida hasta</Label>
          <Input type="date" value={validUntil} onChange={(e) => setValidUntil(e.target.value)} />
        </div>
        <div>
          <Label>Notas para el cliente</Label>
          <Textarea rows={3} value={notes} onChange={(e) => setNotes(e.target.value)} />
        </div>
        <div>
          <Label>Notas internas</Label>
          <Textarea rows={2} value={internalNotes} onChange={(e) => setInternalNotes(e.target.value)} />
        </div>
        {err && <div className="text-sm text-red-500">{err}</div>}
        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="outline" onClick={onClose}>Cancelar</Button>
          <Button type="submit" disabled={saving}>{saving ? 'Guardando...' : 'Guardar'}</Button>
        </div>
      </form>
    </Modal>
  );
}
