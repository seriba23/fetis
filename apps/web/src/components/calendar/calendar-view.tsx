'use client';

import { useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight, CalendarDays } from 'lucide-react';
import dayjs from 'dayjs';
import 'dayjs/locale/es';
import { cn } from '@/lib/utils';

dayjs.locale('es');

export type CalendarEvent = {
  id: string;
  title: string;
  start: string;
  end: string;
  color: string;
  category?: string;
  status?: string;
  meta?: any;
};

export type CalendarMode = 'appointments' | 'finance';

interface CalendarViewProps {
  events: CalendarEvent[];
  mode: CalendarMode;
  onEventClick?: (event: CalendarEvent) => void;
  onSlotClick?: (date: Date) => void;
  initialView?: 'month' | 'week' | 'day';
  loading?: boolean;
}

export function CalendarView({ events, mode, onEventClick, onSlotClick, initialView = 'month', loading }: CalendarViewProps) {
  const [cursor, setCursor] = useState(() => dayjs());
  const [view, setView] = useState<'month' | 'week' | 'day'>(initialView);

  function goPrev() {
    if (view === 'month') setCursor(cursor.subtract(1, 'month'));
    else if (view === 'week') setCursor(cursor.subtract(1, 'week'));
    else setCursor(cursor.subtract(1, 'day'));
  }
  function goNext() {
    if (view === 'month') setCursor(cursor.add(1, 'month'));
    else if (view === 'week') setCursor(cursor.add(1, 'week'));
    else setCursor(cursor.add(1, 'day'));
  }
  function goToday() {
    setCursor(dayjs());
  }

  return (
    <div className="rounded-2xl overflow-hidden border" style={{ background: 'var(--bg-surface)', borderColor: 'var(--border)' }}>
      {/* Header */}
      <div className="px-4 lg:px-6 py-4 flex items-center justify-between gap-4 border-b flex-wrap" style={{ borderColor: 'var(--border)' }}>
        <div className="flex items-center gap-2">
          <button onClick={goPrev} className="w-9 h-9 rounded-lg hover:bg-[color:var(--bg-surface-hover)] flex items-center justify-center transition" style={{ color: 'var(--text-secondary)' }}>
            <ChevronLeft size={18} />
          </button>
          <button onClick={goNext} className="w-9 h-9 rounded-lg hover:bg-[color:var(--bg-surface-hover)] flex items-center justify-center transition" style={{ color: 'var(--text-secondary)' }}>
            <ChevronRight size={18} />
          </button>
          <button onClick={goToday} className="px-3 h-9 rounded-lg text-xs font-medium hover:bg-[color:var(--bg-surface-hover)] transition" style={{ color: 'var(--text-secondary)' }}>
            Hoy
          </button>
          <div className="ml-3 text-lg font-display capitalize" style={{ color: 'var(--text-primary)' }}>
            {view === 'month' ? cursor.format('MMMM YYYY') : view === 'week' ? `Semana de ${cursor.startOf('week').format('D MMM')}` : cursor.format('dddd, D MMMM YYYY')}
          </div>
        </div>

        <div className="flex items-center gap-1 p-1 rounded-lg" style={{ background: 'var(--bg-surface-hover)' }}>
          {(['month', 'week', 'day'] as const).map((v) => (
            <button
              key={v}
              onClick={() => setView(v)}
              className={cn(
                'px-3 h-7 rounded-md text-xs font-medium transition',
                view === v ? 'bg-brand-500 text-white shadow' : 'hover:bg-white/30 dark:hover:bg-white/5',
              )}
              style={view === v ? undefined : { color: 'var(--text-secondary)' }}
            >
              {v === 'month' ? 'Mes' : v === 'week' ? 'Semana' : 'Día'}
            </button>
          ))}
        </div>
      </div>

      {loading && <div className="px-6 py-2 text-xs" style={{ color: 'var(--text-muted)' }}>Cargando eventos...</div>}

      {view === 'month' && <MonthView cursor={cursor} events={events} onEventClick={onEventClick} onSlotClick={onSlotClick} />}
      {view === 'week' && <WeekView cursor={cursor} events={events} onEventClick={onEventClick} onSlotClick={onSlotClick} mode={mode} />}
      {view === 'day' && <DayView cursor={cursor} events={events} onEventClick={onEventClick} onSlotClick={onSlotClick} mode={mode} />}
    </div>
  );
}

// ---------- Month View ----------

function MonthView({
  cursor,
  events,
  onEventClick,
  onSlotClick,
}: {
  cursor: dayjs.Dayjs;
  events: CalendarEvent[];
  onEventClick?: (e: CalendarEvent) => void;
  onSlotClick?: (date: Date) => void;
}) {
  const startOfMonth = cursor.startOf('month');
  const startOfGrid = startOfMonth.startOf('week');
  const endOfMonth = cursor.endOf('month');
  const endOfGrid = endOfMonth.endOf('week');
  const totalDays = endOfGrid.diff(startOfGrid, 'day') + 1;
  const days = Array.from({ length: totalDays }, (_, i) => startOfGrid.add(i, 'day'));

  const eventsByDay = useMemo(() => {
    const map = new Map<string, CalendarEvent[]>();
    for (const ev of events) {
      const key = dayjs(ev.start).format('YYYY-MM-DD');
      const arr = map.get(key) ?? [];
      arr.push(ev);
      map.set(key, arr);
    }
    return map;
  }, [events]);

  const weekDayLabels = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

  return (
    <div>
      <div className="grid grid-cols-7 border-b text-xs uppercase tracking-wider" style={{ borderColor: 'var(--border)', color: 'var(--text-muted)' }}>
        {weekDayLabels.map((d) => (
          <div key={d} className="px-3 py-2 text-center">{d}</div>
        ))}
      </div>
      <div className="grid grid-cols-7" style={{ minHeight: '60vh' }}>
        {days.map((d) => {
          const key = d.format('YYYY-MM-DD');
          const dayEvents = eventsByDay.get(key) ?? [];
          const isCurrentMonth = d.month() === cursor.month();
          const isToday = d.isSame(dayjs(), 'day');
          return (
            <div
              key={key}
              className="border-b border-r p-1.5 min-h-[110px] cursor-pointer hover:bg-[color:var(--bg-surface-hover)] transition"
              style={{ borderColor: 'var(--border)', opacity: isCurrentMonth ? 1 : 0.4 }}
              onClick={() => onSlotClick?.(d.hour(11).minute(0).toDate())}
            >
              <div className={cn('text-xs font-medium mb-1 inline-flex items-center justify-center', isToday && 'w-6 h-6 rounded-full bg-brand-500 text-white')}>
                {d.date()}
              </div>
              <div className="space-y-0.5">
                {dayEvents.slice(0, 3).map((ev) => (
                  <button
                    key={ev.id}
                    onClick={(e) => { e.stopPropagation(); onEventClick?.(ev); }}
                    className="cal-event w-full text-left text-[11px] px-1.5 py-1 rounded truncate"
                    style={{ background: ev.color + '22', color: ev.color, borderLeft: `2px solid ${ev.color}` }}
                  >
                    {dayjs(ev.start).format('HH:mm')} {ev.title}
                  </button>
                ))}
                {dayEvents.length > 3 && (
                  <div className="text-[10px] px-1.5" style={{ color: 'var(--text-muted)' }}>
                    +{dayEvents.length - 3} más
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ---------- Week View ----------

function WeekView({
  cursor,
  events,
  onEventClick,
  onSlotClick,
  mode,
}: {
  cursor: dayjs.Dayjs;
  events: CalendarEvent[];
  onEventClick?: (e: CalendarEvent) => void;
  onSlotClick?: (date: Date) => void;
  mode: CalendarMode;
}) {
  const start = cursor.startOf('week');
  const days = Array.from({ length: 7 }, (_, i) => start.add(i, 'day'));
  const startHour = 7;
  const endHour = 21;
  const hourHeight = 56;

  return (
    <div className="overflow-x-auto">
      <div className="min-w-[900px] grid grid-cols-[60px_repeat(7,minmax(0,1fr))]">
        <div />
        {days.map((d) => {
          const isToday = d.isSame(dayjs(), 'day');
          return (
            <div key={d.format('YYYY-MM-DD')} className="p-2 text-center border-b border-l" style={{ borderColor: 'var(--border)' }}>
              <div className="text-[10px] uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>{d.format('ddd')}</div>
              <div className={cn('text-lg font-display mt-0.5', isToday ? 'text-brand-500' : '')} style={!isToday ? { color: 'var(--text-primary)' } : undefined}>
                {d.date()}
              </div>
            </div>
          );
        })}

        {/* Hours grid */}
        {Array.from({ length: endHour - startHour + 1 }, (_, i) => startHour + i).map((h) => (
          <>
            <div key={`label-${h}`} className="text-[10px] text-right pr-2 pt-1.5" style={{ color: 'var(--text-muted)', height: `${hourHeight}px` }}>
              {`${h}:00`}
            </div>
            {days.map((d) => (
              <div
                key={`${d.format('YYYY-MM-DD')}-${h}`}
                className="relative border-l border-b cursor-pointer hover:bg-[color:var(--bg-surface-hover)]"
                style={{ height: `${hourHeight}px`, borderColor: 'var(--border)' }}
                onClick={() => onSlotClick?.(d.hour(h).minute(0).toDate())}
              >
                {events
                  .filter((ev) => dayjs(ev.start).isSame(d, 'day') && dayjs(ev.start).hour() === h)
                  .map((ev) => {
                    const startMin = dayjs(ev.start).minute();
                    const durationMin = Math.max(30, dayjs(ev.end).diff(ev.start, 'minute'));
                    const top = (startMin / 60) * hourHeight;
                    const height = (durationMin / 60) * hourHeight - 2;
                    return (
                      <button
                        key={ev.id}
                        onClick={(e) => { e.stopPropagation(); onEventClick?.(ev); }}
                        className="cal-event absolute left-1 right-1 rounded-lg p-1.5 text-[11px] text-left overflow-hidden"
                        style={{
                          top: `${top}px`,
                          height: `${height}px`,
                          background: ev.color + '22',
                          color: ev.color,
                          borderLeft: `3px solid ${ev.color}`,
                        }}
                      >
                        <div className="font-medium truncate">{ev.title}</div>
                        <div className="opacity-75 truncate">{dayjs(ev.start).format('HH:mm')} - {dayjs(ev.end).format('HH:mm')}</div>
                      </button>
                    );
                  })}
              </div>
            ))}
          </>
        ))}
      </div>
    </div>
  );
}

// ---------- Day View ----------

function DayView({
  cursor,
  events,
  onEventClick,
  onSlotClick,
  mode,
}: {
  cursor: dayjs.Dayjs;
  events: CalendarEvent[];
  onEventClick?: (e: CalendarEvent) => void;
  onSlotClick?: (date: Date) => void;
  mode: CalendarMode;
}) {
  const startHour = 7;
  const endHour = 21;
  const hourHeight = 64;
  const dayEvents = events.filter((e) => dayjs(e.start).isSame(cursor, 'day'));

  return (
    <div className="grid grid-cols-[60px_1fr] min-h-[600px]">
      <div>
        {Array.from({ length: endHour - startHour + 1 }, (_, i) => startHour + i).map((h) => (
          <div key={h} className="text-[10px] text-right pr-2 pt-1.5" style={{ color: 'var(--text-muted)', height: `${hourHeight}px` }}>
            {`${h}:00`}
          </div>
        ))}
      </div>
      <div className="relative border-l" style={{ borderColor: 'var(--border)' }}>
        {Array.from({ length: endHour - startHour + 1 }, (_, i) => startHour + i).map((h) => (
          <div
            key={h}
            className="border-b cursor-pointer hover:bg-[color:var(--bg-surface-hover)]"
            style={{ height: `${hourHeight}px`, borderColor: 'var(--border)' }}
            onClick={() => onSlotClick?.(cursor.hour(h).minute(0).toDate())}
          />
        ))}

        {dayEvents.map((ev) => {
          const startDate = dayjs(ev.start);
          const hour = startDate.hour();
          const minute = startDate.minute();
          if (hour < startHour || hour > endHour) return null;
          const top = (hour - startHour) * hourHeight + (minute / 60) * hourHeight;
          const durationMin = Math.max(30, dayjs(ev.end).diff(ev.start, 'minute'));
          const height = (durationMin / 60) * hourHeight - 4;
          return (
            <button
              key={ev.id}
              onClick={() => onEventClick?.(ev)}
              className="cal-event absolute left-2 right-2 rounded-xl p-3 text-left overflow-hidden"
              style={{
                top: `${top}px`,
                height: `${height}px`,
                background: ev.color + '22',
                color: ev.color,
                borderLeft: `4px solid ${ev.color}`,
              }}
            >
              <div className="text-sm font-medium truncate">{ev.title}</div>
              <div className="text-xs opacity-80 mt-0.5">{dayjs(ev.start).format('HH:mm')} - {dayjs(ev.end).format('HH:mm')}</div>
              {ev.category && <div className="text-[10px] opacity-70 mt-1 uppercase tracking-wider">{ev.category}</div>}
            </button>
          );
        })}
      </div>
    </div>
  );
}
