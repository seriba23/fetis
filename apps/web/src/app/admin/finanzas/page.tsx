'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { Plus, Repeat, CalendarRange, List } from 'lucide-react';
import dayjs from 'dayjs';
import { apiFetch } from '@/lib/api';
import {
  formatMoney,
  EXPENSE_CATEGORY_LABELS,
  EXPENSE_CATEGORY_COLORS,
  EXPENSE_STATUS_LABELS,
  RECURRENCE_FREQUENCY_LABELS,
  EXPENSE_CATEGORIES,
  RECURRENCE_FREQUENCIES,
  type ExpenseCategory,
  type RecurrenceFrequency,
} from '@fetis/shared';
import { PageHeader } from '@/components/admin/page-header';
import { Card } from '@/components/admin/card';
import { Button, Input, Select, Modal, Label, Textarea, Badge } from '@/components/admin/ui-primitives';
import { CalendarView, type CalendarEvent } from '@/components/calendar/calendar-view';

type Tab = 'calendar' | 'list' | 'templates';

export default function FinanzasPage() {
  const [tab, setTab] = useState<Tab>('calendar');
  const [expenses, setExpenses] = useState<any[]>([]);
  const [templates, setTemplates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [creatingExpense, setCreatingExpense] = useState(false);
  const [creatingTemplate, setCreatingTemplate] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<any | null>(null);

  async function refresh() {
    setLoading(true);
    try {
      const from = dayjs().subtract(3, 'month').startOf('month').toISOString();
      const to = dayjs().add(12, 'month').endOf('month').toISOString();
      const [exs, tpls] = await Promise.all([
        apiFetch(`/expenses?from=${from}&to=${to}`),
        apiFetch('/expense-templates'),
      ]);
      setExpenses(exs as any[]);
      setTemplates(tpls as any[]);
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => { refresh(); }, []);

  const events: CalendarEvent[] = useMemo(
    () =>
      expenses.map((e) => ({
        id: e.id,
        title: `${e.name} · ${formatMoney(e.amount)}`,
        start: e.date,
        end: dayjs(e.date).add(30, 'minute').toISOString(),
        color: e.status === 'PAID' ? '#10B981' : e.status === 'OVERDUE' ? '#EF4444' : EXPENSE_CATEGORY_COLORS[e.category as ExpenseCategory] ?? '#6B7280',
        category: EXPENSE_CATEGORY_LABELS[e.category as ExpenseCategory] ?? e.category,
        status: e.status,
        meta: e,
      })),
    [expenses],
  );

  async function markPaid(expense: any) {
    await apiFetch(`/expenses/${expense.id}/mark-paid`, { method: 'POST', body: { paidAt: new Date().toISOString() } });
    refresh();
  }

  return (
    <>
      <PageHeader
        title="Finanzas"
        subtitle="Gestiona gastos eventuales y plantillas recurrentes"
        actions={
          tab === 'templates' ? (
            <Button onClick={() => setCreatingTemplate(true)}><Plus size={16} /> Nueva plantilla</Button>
          ) : (
            <Button onClick={() => setCreatingExpense(true)}><Plus size={16} /> Gasto eventual</Button>
          )
        }
      />

      <div className="px-6 lg:px-10 pb-10 space-y-4">
        <Tabs tab={tab} setTab={setTab} />

        {tab === 'calendar' && (
          <CalendarView
            mode="finance"
            events={events}
            loading={loading}
            onEventClick={(ev) => {
              if (ev.meta?.virtual || ev.status !== 'PAID') {
                if (confirm(`¿Marcar como pagado el gasto "${ev.meta.name}" (${formatMoney(ev.meta.amount)})?`)) {
                  markPaid(ev.meta);
                }
              }
            }}
            initialView="month"
          />
        )}

        {tab === 'list' && (
          <Card>
            {expenses.length === 0 ? (
              <div className="p-10 text-center text-sm text-[color:var(--text-muted)]">No hay gastos en el rango</div>
            ) : (
              <div className="divide-y" style={{ borderColor: 'var(--border)' }}>
                {expenses.map((e) => (
                  <div key={e.id} className="px-5 py-3 flex items-center justify-between gap-3" style={{ borderTop: '1px solid var(--border)' }}>
                    <div className="min-w-0 flex-1">
                      <div className="font-medium flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
                        {e.name}
                        {e.virtual && <span className="text-[10px] uppercase tracking-wider opacity-60">Recurrente</span>}
                      </div>
                      <div className="text-xs flex items-center gap-2" style={{ color: 'var(--text-muted)' }}>
                        <span className="inline-block w-2 h-2 rounded-full" style={{ background: EXPENSE_CATEGORY_COLORS[e.category as ExpenseCategory] }} />
                        {EXPENSE_CATEGORY_LABELS[e.category as ExpenseCategory]}
                        {e.payee ? ` · ${e.payee}` : ''}
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="font-medium" style={{ color: 'var(--text-primary)' }}>{formatMoney(e.amount)}</div>
                      <div className="text-xs" style={{ color: 'var(--text-muted)' }}>{dayjs(e.date).format('DD MMM')}</div>
                    </div>
                    <Badge color={e.status === 'PAID' ? 'green' : e.status === 'OVERDUE' ? 'red' : 'yellow'}>
                      {EXPENSE_STATUS_LABELS[e.status as keyof typeof EXPENSE_STATUS_LABELS]}
                    </Badge>
                    {e.status !== 'PAID' && (
                      <Button size="sm" variant="secondary" onClick={() => markPaid(e)}>Pagado</Button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </Card>
        )}

        {tab === 'templates' && (
          <Card>
            {templates.length === 0 ? (
              <div className="p-10 text-center text-sm text-[color:var(--text-muted)]">Sin plantillas recurrentes. Crea una para automatizar rentas, salarios, etc.</div>
            ) : (
              <div className="divide-y" style={{ borderColor: 'var(--border)' }}>
                {templates.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setEditingTemplate(t)}
                    className="w-full text-left px-5 py-4 flex items-center justify-between gap-3 hover:bg-[color:var(--bg-surface-hover)]"
                    style={{ borderTop: '1px solid var(--border)' }}
                  >
                    <div className="min-w-0 flex-1">
                      <div className="font-medium flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
                        <Repeat size={14} className="text-brand-500" />
                        {t.name}
                        {!t.active && <Badge color="gray">Inactiva</Badge>}
                      </div>
                      <div className="text-xs" style={{ color: 'var(--text-muted)' }}>
                        {EXPENSE_CATEGORY_LABELS[t.category as ExpenseCategory]}
                        {' · '}{RECURRENCE_FREQUENCY_LABELS[t.frequency as RecurrenceFrequency]}
                        {t.payee ? ` · ${t.payee}` : ''}
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="font-medium" style={{ color: 'var(--text-primary)' }}>{formatMoney(t.amount)}</div>
                      <div className="text-xs" style={{ color: 'var(--text-muted)' }}>
                        Desde {dayjs(t.startsOn).format('DD MMM YYYY')}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </Card>
        )}
      </div>

      {creatingExpense && <ExpenseForm onClose={() => setCreatingExpense(false)} onSaved={() => { setCreatingExpense(false); refresh(); }} />}
      {creatingTemplate && <TemplateForm onClose={() => setCreatingTemplate(false)} onSaved={() => { setCreatingTemplate(false); refresh(); }} />}
      {editingTemplate && <TemplateForm initial={editingTemplate} onClose={() => setEditingTemplate(null)} onSaved={() => { setEditingTemplate(null); refresh(); }} />}
    </>
  );
}

function Tabs({ tab, setTab }: { tab: Tab; setTab: (t: Tab) => void }) {
  const tabs: { id: Tab; label: string; icon: any }[] = [
    { id: 'calendar', label: 'Calendario', icon: CalendarRange },
    { id: 'list', label: 'Lista de gastos', icon: List },
    { id: 'templates', label: 'Plantillas recurrentes', icon: Repeat },
  ];
  return (
    <div className="flex gap-1 p-1 rounded-xl w-fit" style={{ background: 'var(--bg-surface-hover)' }}>
      {tabs.map((t) => {
        const Icon = t.icon;
        const active = tab === t.id;
        return (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition flex items-center gap-2 ${
              active ? 'bg-brand-500 text-white shadow' : ''
            }`}
            style={!active ? { color: 'var(--text-secondary)' } : undefined}
          >
            <Icon size={14} />
            {t.label}
          </button>
        );
      })}
    </div>
  );
}

function ExpenseForm({ onClose, onSaved }: { onClose: () => void; onSaved: () => void }) {
  const [form, setForm] = useState({
    name: '',
    category: 'OTHER' as ExpenseCategory,
    amount: 0,
    date: dayjs().format('YYYY-MM-DD'),
    status: 'PENDING' as 'PENDING' | 'PAID',
    payee: '',
    notes: '',
  });
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setSaving(true);
    try {
      await apiFetch('/expenses', {
        method: 'POST',
        body: {
          ...form,
          amount: Number(form.amount),
          date: new Date(form.date).toISOString(),
          payee: form.payee || undefined,
          notes: form.notes || undefined,
          paidAt: form.status === 'PAID' ? new Date().toISOString() : undefined,
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
    <Modal open onClose={onClose} title="Nuevo gasto eventual">
      <form onSubmit={onSubmit} className="p-6 space-y-4">
        <div>
          <Label>Concepto *</Label>
          <Input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Ej: Compra de herramienta nueva" />
        </div>
        <div className="grid sm:grid-cols-3 gap-3">
          <div>
            <Label>Categoría *</Label>
            <Select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value as ExpenseCategory })}>
              {EXPENSE_CATEGORIES.map((c) => <option key={c} value={c}>{EXPENSE_CATEGORY_LABELS[c]}</option>)}
            </Select>
          </div>
          <div>
            <Label>Monto *</Label>
            <Input type="number" min="0.01" step="0.01" required value={form.amount || ''} onChange={(e) => setForm({ ...form, amount: e.target.value === '' ? 0 : Number(e.target.value) })} />
          </div>
          <div>
            <Label>Fecha *</Label>
            <Input type="date" required value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
          </div>
        </div>
        <div className="grid sm:grid-cols-2 gap-3">
          <div>
            <Label>Estado</Label>
            <Select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as any })}>
              <option value="PENDING">Pendiente</option>
              <option value="PAID">Pagado</option>
            </Select>
          </div>
          <div>
            <Label>Pagado a</Label>
            <Input value={form.payee} onChange={(e) => setForm({ ...form, payee: e.target.value })} placeholder="Proveedor / persona" />
          </div>
        </div>
        <div>
          <Label>Notas</Label>
          <Textarea rows={2} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
        </div>
        {err && <div className="text-sm text-red-500">{err}</div>}
        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="outline" onClick={onClose}>Cancelar</Button>
          <Button type="submit" disabled={saving}>{saving ? 'Guardando...' : 'Guardar gasto'}</Button>
        </div>
      </form>
    </Modal>
  );
}

function TemplateForm({ initial, onClose, onSaved }: { initial?: any; onClose: () => void; onSaved: () => void }) {
  const [form, setForm] = useState({
    name: initial?.name ?? '',
    category: (initial?.category ?? 'RENT') as ExpenseCategory,
    amount: Number(initial?.amount ?? 0),
    frequency: (initial?.frequency ?? 'MONTHLY') as RecurrenceFrequency,
    dayOfMonth: initial?.dayOfMonth ?? 5,
    dayOfWeek: initial?.dayOfWeek ?? 1,
    monthOfYear: initial?.monthOfYear ?? 1,
    payee: initial?.payee ?? '',
    notes: initial?.notes ?? '',
    startsOn: initial?.startsOn ? dayjs(initial.startsOn).format('YYYY-MM-DD') : dayjs().format('YYYY-MM-DD'),
    endsOn: initial?.endsOn ? dayjs(initial.endsOn).format('YYYY-MM-DD') : '',
    active: initial?.active ?? true,
  });
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setSaving(true);
    try {
      const body: any = {
        name: form.name,
        category: form.category,
        amount: Number(form.amount),
        frequency: form.frequency,
        payee: form.payee || undefined,
        notes: form.notes || undefined,
        startsOn: new Date(form.startsOn).toISOString(),
        endsOn: form.endsOn ? new Date(form.endsOn).toISOString() : null,
        active: form.active,
      };
      if (form.frequency === 'WEEKLY' || form.frequency === 'BIWEEKLY') body.dayOfWeek = Number(form.dayOfWeek);
      else if (form.frequency === 'YEARLY') {
        body.dayOfMonth = Number(form.dayOfMonth);
        body.monthOfYear = Number(form.monthOfYear);
      } else body.dayOfMonth = Number(form.dayOfMonth);

      if (initial) {
        await apiFetch(`/expense-templates/${initial.id}`, { method: 'PATCH', body });
      } else {
        await apiFetch('/expense-templates', { method: 'POST', body });
      }
      onSaved();
    } catch (e: any) {
      setErr(e.message);
    } finally {
      setSaving(false);
    }
  }

  async function onDelete() {
    if (!confirm('¿Desactivar esta plantilla? Las ocurrencias ya materializadas no se eliminarán.')) return;
    await apiFetch(`/expense-templates/${initial.id}`, { method: 'DELETE' });
    onSaved();
  }

  return (
    <Modal open onClose={onClose} title={initial ? 'Editar plantilla' : 'Nueva plantilla recurrente'} size="lg">
      <form onSubmit={onSubmit} className="p-6 space-y-4">
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <Label>Concepto *</Label>
            <Input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Ej: Renta del local" />
          </div>
          <div>
            <Label>Categoría *</Label>
            <Select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value as ExpenseCategory })}>
              {EXPENSE_CATEGORIES.map((c) => <option key={c} value={c}>{EXPENSE_CATEGORY_LABELS[c]}</option>)}
            </Select>
          </div>
          <div>
            <Label>Monto *</Label>
            <Input type="number" min="0.01" step="0.01" required value={form.amount || ''} onChange={(e) => setForm({ ...form, amount: e.target.value === '' ? 0 : Number(e.target.value) })} />
          </div>
          <div>
            <Label>Frecuencia *</Label>
            <Select value={form.frequency} onChange={(e) => setForm({ ...form, frequency: e.target.value as RecurrenceFrequency })}>
              {RECURRENCE_FREQUENCIES.map((f) => <option key={f} value={f}>{RECURRENCE_FREQUENCY_LABELS[f]}</option>)}
            </Select>
          </div>
        </div>

        {(form.frequency === 'WEEKLY' || form.frequency === 'BIWEEKLY') && (
          <div>
            <Label>Día de la semana</Label>
            <Select value={form.dayOfWeek} onChange={(e) => setForm({ ...form, dayOfWeek: Number(e.target.value) })}>
              <option value={1}>Lunes</option><option value={2}>Martes</option><option value={3}>Miércoles</option>
              <option value={4}>Jueves</option><option value={5}>Viernes</option><option value={6}>Sábado</option>
              <option value={0}>Domingo</option>
            </Select>
          </div>
        )}
        {form.frequency === 'YEARLY' && (
          <div className="grid sm:grid-cols-2 gap-3">
            <div>
              <Label>Mes</Label>
              <Select value={form.monthOfYear} onChange={(e) => setForm({ ...form, monthOfYear: Number(e.target.value) })}>
                {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                  <option key={m} value={m}>{dayjs().month(m - 1).format('MMMM')}</option>
                ))}
              </Select>
            </div>
            <div>
              <Label>Día del mes</Label>
              <Input type="number" min="1" max="31" value={form.dayOfMonth || ''} onChange={(e) => setForm({ ...form, dayOfMonth: e.target.value === '' ? 0 : Number(e.target.value) })} />
            </div>
          </div>
        )}
        {(form.frequency === 'MONTHLY' || form.frequency === 'QUARTERLY') && (
          <div>
            <Label>Día del mes</Label>
            <Input type="number" min="1" max="31" value={form.dayOfMonth || ''} onChange={(e) => setForm({ ...form, dayOfMonth: e.target.value === '' ? 0 : Number(e.target.value) })} />
          </div>
        )}

        <div className="grid sm:grid-cols-2 gap-3">
          <div>
            <Label>Inicia</Label>
            <Input type="date" required value={form.startsOn} onChange={(e) => setForm({ ...form, startsOn: e.target.value })} />
          </div>
          <div>
            <Label>Termina (opcional)</Label>
            <Input type="date" value={form.endsOn} onChange={(e) => setForm({ ...form, endsOn: e.target.value })} />
          </div>
        </div>
        <div>
          <Label>Pagado a</Label>
          <Input value={form.payee} onChange={(e) => setForm({ ...form, payee: e.target.value })} placeholder="Arrendador, empleado, proveedor..." />
        </div>
        <div>
          <Label>Notas</Label>
          <Textarea rows={2} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
        </div>

        {err && <div className="text-sm text-red-500">{err}</div>}
        <div className="flex justify-between gap-2 pt-2">
          <div>
            {initial && <Button type="button" variant="danger" onClick={onDelete}>Desactivar</Button>}
          </div>
          <div className="flex gap-2">
            <Button type="button" variant="outline" onClick={onClose}>Cancelar</Button>
            <Button type="submit" disabled={saving}>{saving ? 'Guardando...' : 'Guardar'}</Button>
          </div>
        </div>
      </form>
    </Modal>
  );
}
