import dayjs from 'dayjs';

export interface VirtualOccurrence {
  date: Date;
}

interface Template {
  frequency: 'WEEKLY' | 'BIWEEKLY' | 'MONTHLY' | 'QUARTERLY' | 'YEARLY';
  dayOfMonth: number | null;
  dayOfWeek: number | null;
  monthOfYear: number | null;
  startsOn: Date;
  endsOn: Date | null;
}

/**
 * Genera ocurrencias virtuales del template dentro de [from, to].
 * Cumple con frequency + day fields.
 */
export function generateOccurrences(tpl: Template, from: Date, to: Date): VirtualOccurrence[] {
  const occurrences: VirtualOccurrence[] = [];
  const startsOn = dayjs(tpl.startsOn);
  const endsOn = tpl.endsOn ? dayjs(tpl.endsOn) : null;
  const rangeStart = dayjs(from);
  const rangeEnd = dayjs(to);

  if (rangeEnd.isBefore(startsOn, 'day')) return occurrences;
  if (endsOn && rangeStart.isAfter(endsOn, 'day')) return occurrences;

  const cursorStart = startsOn.isBefore(rangeStart) ? rangeStart : startsOn;
  const cursorEnd = endsOn && endsOn.isBefore(rangeEnd) ? endsOn : rangeEnd;

  if (tpl.frequency === 'WEEKLY' || tpl.frequency === 'BIWEEKLY') {
    const step = tpl.frequency === 'WEEKLY' ? 7 : 14;
    const dow = tpl.dayOfWeek ?? startsOn.day();
    // primer ocurrencia desde startsOn en ese día de la semana
    let cur = startsOn.day(dow);
    if (cur.isBefore(startsOn, 'day')) cur = cur.add(7, 'day');
    while (cur.isBefore(cursorStart, 'day')) cur = cur.add(step, 'day');
    while (cur.isBefore(cursorEnd, 'day') || cur.isSame(cursorEnd, 'day')) {
      if (!endsOn || cur.isBefore(endsOn, 'day') || cur.isSame(endsOn, 'day')) {
        occurrences.push({ date: cur.toDate() });
      }
      cur = cur.add(step, 'day');
    }
    return occurrences;
  }

  if (tpl.frequency === 'MONTHLY' || tpl.frequency === 'QUARTERLY' || tpl.frequency === 'YEARLY') {
    const stepMonths = tpl.frequency === 'MONTHLY' ? 1 : tpl.frequency === 'QUARTERLY' ? 3 : 12;
    const dom = tpl.dayOfMonth ?? startsOn.date();
    let cur = startsOn;
    if (tpl.frequency === 'YEARLY' && tpl.monthOfYear) {
      cur = cur.month(tpl.monthOfYear - 1);
    }
    // alinear primera fecha al día solicitado
    cur = cur.date(Math.min(dom, daysInMonth(cur)));
    if (cur.isBefore(startsOn, 'day')) cur = cur.add(stepMonths, 'month');

    while (cur.isBefore(cursorStart, 'day')) {
      cur = cur.add(stepMonths, 'month');
      cur = cur.date(Math.min(dom, daysInMonth(cur)));
    }

    while (cur.isBefore(cursorEnd, 'day') || cur.isSame(cursorEnd, 'day')) {
      if (!endsOn || cur.isBefore(endsOn, 'day') || cur.isSame(endsOn, 'day')) {
        occurrences.push({ date: cur.toDate() });
      }
      cur = cur.add(stepMonths, 'month');
      cur = cur.date(Math.min(dom, daysInMonth(cur)));
    }
    return occurrences;
  }

  return occurrences;
}

function daysInMonth(d: dayjs.Dayjs): number {
  return d.daysInMonth();
}
