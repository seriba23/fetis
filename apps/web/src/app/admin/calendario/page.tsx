'use client';

import { useEffect, useMemo, useState } from 'react';
import { Plus } from 'lucide-react';
import dayjs from 'dayjs';
import { apiFetch } from '@/lib/api';
import {
  APPOINTMENT_TYPE_LABELS,
  APPOINTMENT_TYPE_COLORS,
  APPOINTMENT_STATUS_LABELS,
} from '@fetis/shared';
import { PageHeader } from '@/components/admin/page-header';
import { Button, Modal, Input, Select, Label, Textarea, Badge } from '@/components/admin/ui-primitives';
import { CalendarView, type CalendarEvent } from '@/components/calendar/calendar-view';

export default function CalendarioPage() {
  const [appointments, setAppointments] = useState<any[]>([]);
  const [clients, setClients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState<Date | null>(null);
  const [editing, setEditing] = useState<any | null>(null);

  async function refresh() {
    setLoading(true);
    try {
      const from = dayjs().subtract(2, 'month').startOf('month').toISOString();
      const to = dayjs().add(4, 'month').endOf('month').toISOString();
      const [appts, cls] = await Promise.all([
        apiFetch(`/appointments?from=${from}&to=${to}`),
        apiFetch('/clients'),
      ]);
      setAppointments(appts as any[]);
      setClients(cls as any[]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { refresh(); }, []);

  const events: CalendarEvent[] = useMemo(
    () =>
      appointments
        .filter((a) => a.status !== 'CANCELLED')
        .map((a) => ({
          id: a.id,
          title: `${a.client?.name ?? '?'} · ${APPOINTMENT_TYPE_LABELS[a.type as keyof typeof APPOINTMENT_TYPE_LABELS] ?? a.type}`,
          start: a.startTime,
          end: a.endTime,
          color: APPOINTMENT_TYPE_COLORS[a.type as keyof typeof APPOINTMENT_TYPE_COLORS] ?? '#A435F0',
          category: a.type,
          status: a.status,
          meta: a,
        })),
    [appointments],
  );

  return (
    <>
      <PageHeader
        title="Calendario de citas"
        subtitle="Gestiona consultas, mediciones, entregas y post-venta"
        actions={
          <Button onClick={() => setCreating(dayjs().hour(11).minute(0).toDate())}>
            <Plus size={16} /> Nueva cita
          </Button>
        }
      />

      <div className="px-6 lg:px-10 pb-10 space-y-4">
        <Legend />
        <CalendarView
          mode="appointments"
          events={events}
          loading={loading}
          onEventClick={(ev) => setEditing(ev.meta)}
          onSlotClick={(d) => setCreating(d)}
          initialView="month"
        />
      </div>

      {creating && (
        <AppointmentForm
          initialDate={creating}
          clients={clients}
          onClose={() => setCreating(null)}
          onSaved={() => { setCreating(null); refresh(); }}
        />
      )}
      {editing && (
        <AppointmentEditor
          appointment={editing}
          onClose={() => setEditing(null)}
          onChanged={() => { setEditing(null); refresh(); }}
        />
      )}
    </>
  );
}

function Legend() {
  return (
    <div className="flex flex-wrap gap-3 text-xs">
      {(['CONSULTATION', 'MEASUREMENT', 'DELIVERY', 'AFTERSALE'] as const).map((t) => (
        <div key={t} className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full" style={{ background: APPOINTMENT_TYPE_COLORS[t] }} />
          <span style={{ color: 'var(--text-secondary)' }}>{APPOINTMENT_TYPE_LABELS[t]}</span>
        </div>
      ))}
    </div>
  );
}

function AppointmentForm({
  initialDate,
  clients,
  onClose,
  onSaved,
}: {
  initialDate: Date;
  clients: any[];
  onClose: () => void;
  onSaved: () => void;
}) {
  const [form, setForm] = useState({
    clientId: '',
    type: 'CONSULTATION',
    title: '',
    startTime: dayjs(initialDate).format('YYYY-MM-DDTHH:mm'),
    endTime: dayjs(initialDate).add(1, 'hour').format('YYYY-MM-DDTHH:mm'),
    address: '',
    notes: '',
  });
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setSaving(true);
    try {
      await apiFetch('/appointments', {
        method: 'POST',
        body: {
          ...form,
          startTime: new Date(form.startTime).toISOString(),
          endTime: new Date(form.endTime).toISOString(),
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
    <Modal open onClose={onClose} title="Nueva cita">
      <form onSubmit={onSubmit} className="p-6 space-y-4">
        <div>
          <Label>Cliente *</Label>
          <Select required value={form.clientId} onChange={(e) => setForm({ ...form, clientId: e.target.value })}>
            <option value="">Selecciona...</option>
            {clients.map((c) => (
              <option key={c.id} value={c.id}>{c.name} · {c.phone}</option>
            ))}
          </Select>
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <Label>Tipo de cita</Label>
            <Select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
              {Object.entries(APPOINTMENT_TYPE_LABELS).map(([k, v]) => (
                <option key={k} value={k}>{v}</option>
              ))}
            </Select>
          </div>
          <div>
            <Label>Título (opcional)</Label>
            <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Ej: Levantar medidas cocina" />
          </div>
          <div>
            <Label>Inicio *</Label>
            <Input type="datetime-local" required value={form.startTime} onChange={(e) => setForm({ ...form, startTime: e.target.value })} />
          </div>
          <div>
            <Label>Fin *</Label>
            <Input type="datetime-local" required value={form.endTime} onChange={(e) => setForm({ ...form, endTime: e.target.value })} />
          </div>
        </div>
        <div>
          <Label>Dirección (si aplica)</Label>
          <Input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} placeholder="Calle, número, colonia..." />
        </div>
        <div>
          <Label>Notas</Label>
          <Textarea rows={3} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
        </div>
        {err && <div className="text-sm text-red-500">{err}</div>}
        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="outline" onClick={onClose}>Cancelar</Button>
          <Button type="submit" disabled={saving}>{saving ? 'Guardando...' : 'Crear cita'}</Button>
        </div>
      </form>
    </Modal>
  );
}

function AppointmentEditor({ appointment, onClose, onChanged }: { appointment: any; onClose: () => void; onChanged: () => void }) {
  async function changeStatus(status: string) {
    if (status === 'CONFIRMED') await apiFetch(`/appointments/${appointment.id}/confirm`, { method: 'POST' });
    else if (status === 'COMPLETED') await apiFetch(`/appointments/${appointment.id}/complete`, { method: 'POST' });
    else if (status === 'CANCELLED') {
      const reason = prompt('Motivo de cancelación (opcional):');
      await apiFetch(`/appointments/${appointment.id}/cancel`, { method: 'POST', body: { reason } });
    }
    onChanged();
  }
  async function onDelete() {
    if (!confirm('¿Eliminar esta cita?')) return;
    await apiFetch(`/appointments/${appointment.id}`, { method: 'DELETE' });
    onChanged();
  }

  return (
    <Modal open onClose={onClose} title="Detalle de cita">
      <div className="p-6 space-y-4">
        <div>
          <div className="text-xl font-display" style={{ color: 'var(--text-primary)' }}>
            {appointment.client?.name ?? 'Cliente'}
          </div>
          <div className="text-sm" style={{ color: 'var(--text-muted)' }}>
            {APPOINTMENT_TYPE_LABELS[appointment.type as keyof typeof APPOINTMENT_TYPE_LABELS]}
            {' · '}
            <Badge color={appointment.status === 'CONFIRMED' ? 'green' : appointment.status === 'PENDING' ? 'yellow' : 'gray'}>
              {APPOINTMENT_STATUS_LABELS[appointment.status as keyof typeof APPOINTMENT_STATUS_LABELS]}
            </Badge>
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-3 text-sm">
          <Info label="Inicio" value={dayjs(appointment.startTime).format('DD MMM YYYY, HH:mm')} />
          <Info label="Fin" value={dayjs(appointment.endTime).format('DD MMM YYYY, HH:mm')} />
          {appointment.client?.phone && <Info label="Teléfono" value={appointment.client.phone} />}
          {appointment.address && <Info label="Dirección" value={appointment.address} />}
        </div>

        {appointment.notes && (
          <div>
            <div className="text-xs uppercase tracking-widest mb-1" style={{ color: 'var(--text-muted)' }}>Notas</div>
            <div className="text-sm whitespace-pre-wrap">{appointment.notes}</div>
          </div>
        )}

        <div className="flex flex-wrap justify-end gap-2 pt-4 border-t" style={{ borderColor: 'var(--border)' }}>
          <Button variant="danger" onClick={onDelete}>Eliminar</Button>
          <Button variant="outline" onClick={() => changeStatus('CANCELLED')}>Cancelar cita</Button>
          {appointment.status !== 'COMPLETED' && (
            <Button variant="outline" onClick={() => changeStatus('COMPLETED')}>Marcar completada</Button>
          )}
          {appointment.status === 'PENDING' && <Button onClick={() => changeStatus('CONFIRMED')}>Confirmar</Button>}
        </div>
      </div>
    </Modal>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-xs uppercase tracking-widest mb-1" style={{ color: 'var(--text-muted)' }}>{label}</div>
      <div style={{ color: 'var(--text-primary)' }}>{value}</div>
    </div>
  );
}
