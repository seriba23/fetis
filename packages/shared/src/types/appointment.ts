import { z } from 'zod';

export const APPOINTMENT_TYPES = ['CONSULTATION', 'MEASUREMENT', 'DELIVERY', 'AFTERSALE'] as const;
export type AppointmentType = (typeof APPOINTMENT_TYPES)[number];

export const APPOINTMENT_STATUSES = [
  'PENDING',
  'CONFIRMED',
  'RESCHEDULED',
  'IN_PROGRESS',
  'COMPLETED',
  'CANCELLED',
  'NO_SHOW',
] as const;
export type AppointmentStatus = (typeof APPOINTMENT_STATUSES)[number];

export const APPOINTMENT_TYPE_LABELS: Record<AppointmentType, string> = {
  CONSULTATION: 'Consulta inicial',
  MEASUREMENT: 'Medición a domicilio',
  DELIVERY: 'Entrega / instalación',
  AFTERSALE: 'Post-venta',
};

export const APPOINTMENT_STATUS_LABELS: Record<AppointmentStatus, string> = {
  PENDING: 'Pendiente',
  CONFIRMED: 'Confirmada',
  RESCHEDULED: 'Reagendada',
  IN_PROGRESS: 'En curso',
  COMPLETED: 'Completada',
  CANCELLED: 'Cancelada',
  NO_SHOW: 'No asistió',
};

export const APPOINTMENT_TYPE_COLORS: Record<AppointmentType, string> = {
  CONSULTATION: '#A435F0',
  MEASUREMENT: '#F59E0B',
  DELIVERY: '#10B981',
  AFTERSALE: '#3B82F6',
};

export const AppointmentCreateSchema = z.object({
  clientId: z.string().uuid(),
  type: z.enum(APPOINTMENT_TYPES).default('CONSULTATION'),
  title: z.string().max(200).optional().nullable(),
  startTime: z.string().datetime(),
  endTime: z.string().datetime(),
  address: z.string().max(500).optional().nullable(),
  notes: z.string().max(2000).optional().nullable(),
  internalNotes: z.string().max(2000).optional().nullable(),
});
export type AppointmentCreateDto = z.infer<typeof AppointmentCreateSchema>;

export const AppointmentUpdateSchema = AppointmentCreateSchema.partial().extend({
  status: z.enum(APPOINTMENT_STATUSES).optional(),
});
export type AppointmentUpdateDto = z.infer<typeof AppointmentUpdateSchema>;

export interface Appointment {
  id: string;
  clientId: string;
  type: AppointmentType;
  status: AppointmentStatus;
  title: string | null;
  startTime: string;
  endTime: string;
  address: string | null;
  notes: string | null;
  internalNotes: string | null;
  cancellationReason: string | null;
  createdAt: string;
  updatedAt: string;
  client?: { id: string; name: string; phone: string; email: string | null };
}
