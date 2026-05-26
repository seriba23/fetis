'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Calendar,
  Users,
  FileText,
  DollarSign,
  TrendingDown,
  TrendingUp,
  AlertCircle,
  ArrowRight,
} from 'lucide-react';
import { apiFetch } from '@/lib/api';
import { formatMoney, formatDateTime } from '@fetis/shared';
import { APPOINTMENT_TYPE_LABELS, APPOINTMENT_STATUS_LABELS, QUOTE_STATUS_LABELS, EXPENSE_CATEGORY_LABELS } from '@fetis/shared';
import { PageHeader } from '@/components/admin/page-header';
import { Card, CardBody, CardHeader } from '@/components/admin/card';
import { Badge } from '@/components/admin/ui-primitives';

export default function DashboardPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    apiFetch('/dashboard/summary')
      .then(setData)
      .catch((e) => setErr(e.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="p-10 text-sm text-[color:var(--text-muted)]">Cargando...</div>;
  if (err) return <div className="p-10 text-sm text-red-500">{err}</div>;
  if (!data) return null;

  return (
    <>
      <PageHeader title="Dashboard" subtitle={`Resumen de ${new Date().toLocaleDateString('es-MX', { weekday: 'long', day: 'numeric', month: 'long' })}`} />

      <div className="px-6 lg:px-10 pb-10 space-y-6">
        {/* KPIs */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Kpi icon={Calendar} color="purple" label="Citas hoy" value={data.appointmentsToday} sub={`${data.appointmentsWeek} esta semana`} />
          <Kpi icon={FileText} color="blue" label="Cotizaciones" value={data.pendingQuotes} sub={`${data.acceptedQuotes} aceptadas`} />
          <Kpi icon={DollarSign} color="green" label="Ingresos del mes" value={formatMoney(data.incomeMonth)} sub={`+${data.newClientsMonth} clientes`} valueAsString />
          <Kpi
            icon={data.balanceMonth >= 0 ? TrendingUp : TrendingDown}
            color={data.balanceMonth >= 0 ? 'green' : 'red'}
            label="Balance del mes"
            value={formatMoney(data.balanceMonth)}
            sub={`Gastos ${formatMoney(data.expensesMonth)}`}
            valueAsString
          />
        </div>

        {data.overdueExpenses > 0 && (
          <div className="rounded-xl border border-red-500/30 bg-red-500/5 p-4 flex items-center gap-3">
            <AlertCircle className="text-red-500 shrink-0" size={20} />
            <div className="flex-1">
              <div className="text-sm font-medium text-red-600">
                Tienes {data.overdueExpenses} gasto{data.overdueExpenses === 1 ? '' : 's'} vencido{data.overdueExpenses === 1 ? '' : 's'}
              </div>
              <div className="text-xs text-red-500/80">Revisa la sección de finanzas para regularizar</div>
            </div>
            <Link href="/admin/finanzas" className="text-xs text-red-600 hover:underline">Ver →</Link>
          </div>
        )}

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Próximas citas */}
          <Card>
            <CardHeader
              title="Próximas citas"
              actions={
                <Link href="/admin/calendario" className="text-xs text-brand-600 hover:underline inline-flex items-center gap-1">
                  Ver todas <ArrowRight size={12} />
                </Link>
              }
            />
            <CardBody className="p-0">
              {data.upcomingAppointments.length === 0 ? (
                <div className="p-6 text-sm text-[color:var(--text-muted)]">Sin citas próximas</div>
              ) : (
                <div className="divide-y" style={{ borderColor: 'var(--border)' }}>
                  {data.upcomingAppointments.map((a: any) => (
                    <div key={a.id} className="px-5 py-3 flex items-center justify-between gap-3" style={{ borderTop: '1px solid var(--border)' }}>
                      <div className="min-w-0 flex-1">
                        <div className="text-sm font-medium truncate" style={{ color: 'var(--text-primary)' }}>{a.clientName}</div>
                        <div className="text-xs" style={{ color: 'var(--text-muted)' }}>{APPOINTMENT_TYPE_LABELS[a.type as keyof typeof APPOINTMENT_TYPE_LABELS] ?? a.type}</div>
                      </div>
                      <div className="text-right shrink-0">
                        <div className="text-xs" style={{ color: 'var(--text-primary)' }}>{formatDateTime(a.startTime)}</div>
                        <Badge color={a.status === 'CONFIRMED' ? 'green' : a.status === 'PENDING' ? 'yellow' : 'gray'}>
                          {APPOINTMENT_STATUS_LABELS[a.status as keyof typeof APPOINTMENT_STATUS_LABELS] ?? a.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardBody>
          </Card>

          {/* Cotizaciones recientes */}
          <Card>
            <CardHeader
              title="Cotizaciones recientes"
              actions={
                <Link href="/admin/cotizaciones" className="text-xs text-brand-600 hover:underline inline-flex items-center gap-1">
                  Ver todas <ArrowRight size={12} />
                </Link>
              }
            />
            <CardBody className="p-0">
              {data.recentQuotes.length === 0 ? (
                <div className="p-6 text-sm text-[color:var(--text-muted)]">Aún no hay cotizaciones</div>
              ) : (
                <div className="divide-y" style={{ borderColor: 'var(--border)' }}>
                  {data.recentQuotes.map((q: any) => (
                    <div key={q.id} className="px-5 py-3 flex items-center justify-between gap-3" style={{ borderTop: '1px solid var(--border)' }}>
                      <div className="min-w-0 flex-1">
                        <div className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{q.number} · {q.clientName}</div>
                        <div className="text-xs" style={{ color: 'var(--text-muted)' }}>{formatDateTime(q.createdAt)}</div>
                      </div>
                      <div className="text-right shrink-0">
                        <div className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{formatMoney(q.total)}</div>
                        <Badge color={q.status === 'ACCEPTED' ? 'green' : q.status === 'SENT' ? 'blue' : 'gray'}>
                          {QUOTE_STATUS_LABELS[q.status as keyof typeof QUOTE_STATUS_LABELS] ?? q.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardBody>
          </Card>
        </div>

        {/* Próximos gastos */}
        <Card>
          <CardHeader
            title="Próximos gastos"
            subtitle="Plantillas recurrentes y gastos eventuales en los próximos 30 días"
            actions={
              <Link href="/admin/finanzas" className="text-xs text-brand-600 hover:underline inline-flex items-center gap-1">
                Ver finanzas <ArrowRight size={12} />
              </Link>
            }
          />
          <CardBody className="p-0">
            {data.upcomingExpenses.length === 0 ? (
              <div className="p-6 text-sm text-[color:var(--text-muted)]">Sin gastos próximos</div>
            ) : (
              <div className="divide-y" style={{ borderColor: 'var(--border)' }}>
                {data.upcomingExpenses.map((e: any) => (
                  <div key={e.id} className="px-5 py-3 flex items-center justify-between gap-3" style={{ borderTop: '1px solid var(--border)' }}>
                    <div className="min-w-0 flex-1">
                      <div className="text-sm font-medium flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
                        {e.name}
                        {e.virtual && <span className="text-[10px] uppercase tracking-wider opacity-60">Recurrente</span>}
                      </div>
                      <div className="text-xs" style={{ color: 'var(--text-muted)' }}>
                        {EXPENSE_CATEGORY_LABELS[e.category as keyof typeof EXPENSE_CATEGORY_LABELS] ?? e.category}{e.payee ? ` · ${e.payee}` : ''}
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{formatMoney(e.amount)}</div>
                      <div className="text-xs" style={{ color: 'var(--text-muted)' }}>{new Date(e.date).toLocaleDateString('es-MX', { day: 'numeric', month: 'short' })}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardBody>
        </Card>
      </div>
    </>
  );
}

function Kpi({
  icon: Icon,
  color,
  label,
  value,
  sub,
  valueAsString,
}: {
  icon: any;
  color: 'purple' | 'blue' | 'green' | 'red';
  label: string;
  value: any;
  sub?: string;
  valueAsString?: boolean;
}) {
  const colorClasses = {
    purple: 'bg-brand-500/10 text-brand-600',
    blue: 'bg-blue-500/10 text-blue-600',
    green: 'bg-emerald-500/10 text-emerald-600',
    red: 'bg-red-500/10 text-red-600',
  };
  return (
    <Card>
      <CardBody className="p-4 sm:p-5 lg:p-6">
        <div className="flex items-start justify-between gap-2 mb-2 sm:mb-3">
          <div
            className="text-[10px] sm:text-xs uppercase tracking-widest flex-1 min-w-0"
            style={{ color: 'var(--text-muted)' }}
          >
            {label}
          </div>
          <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl flex items-center justify-center shrink-0 ${colorClasses[color]}`}>
            <Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4 lg:w-[18px] lg:h-[18px]" />
          </div>
        </div>
        <div
          className="font-display tabular-nums leading-tight"
          style={{
            color: 'var(--text-primary)',
            fontSize: 'clamp(1.05rem, 4.5vw, 1.875rem)',
          }}
          title={valueAsString ? value : String(value)}
        >
          {valueAsString ? value : value.toLocaleString('es-MX')}
        </div>
        {sub && (
          <div
            className="text-[10px] sm:text-xs mt-1.5 truncate"
            style={{ color: 'var(--text-muted)' }}
            title={sub}
          >
            {sub}
          </div>
        )}
      </CardBody>
    </Card>
  );
}
