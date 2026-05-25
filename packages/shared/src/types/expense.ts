import { z } from 'zod';

export const EXPENSE_CATEGORIES = [
  'RENT',
  'SOFTWARE',
  'SALARY',
  'SUPPLIER',
  'UTILITIES',
  'MARKETING',
  'MAINTENANCE',
  'TAXES',
  'OTHER',
] as const;
export type ExpenseCategory = (typeof EXPENSE_CATEGORIES)[number];

export const EXPENSE_CATEGORY_LABELS: Record<ExpenseCategory, string> = {
  RENT: 'Renta',
  SOFTWARE: 'Software',
  SALARY: 'Salarios',
  SUPPLIER: 'Proveedores',
  UTILITIES: 'Servicios',
  MARKETING: 'Marketing',
  MAINTENANCE: 'Mantenimiento',
  TAXES: 'Impuestos',
  OTHER: 'Otros',
};

export const EXPENSE_CATEGORY_COLORS: Record<ExpenseCategory, string> = {
  RENT: '#EF4444',
  SOFTWARE: '#8B5CF6',
  SALARY: '#F59E0B',
  SUPPLIER: '#06B6D4',
  UTILITIES: '#3B82F6',
  MARKETING: '#EC4899',
  MAINTENANCE: '#64748B',
  TAXES: '#DC2626',
  OTHER: '#6B7280',
};

export const EXPENSE_STATUSES = ['PENDING', 'PAID', 'OVERDUE', 'CANCELLED'] as const;
export type ExpenseStatus = (typeof EXPENSE_STATUSES)[number];

export const EXPENSE_STATUS_LABELS: Record<ExpenseStatus, string> = {
  PENDING: 'Pendiente',
  PAID: 'Pagado',
  OVERDUE: 'Vencido',
  CANCELLED: 'Cancelado',
};

export const RECURRENCE_FREQUENCIES = ['WEEKLY', 'BIWEEKLY', 'MONTHLY', 'QUARTERLY', 'YEARLY'] as const;
export type RecurrenceFrequency = (typeof RECURRENCE_FREQUENCIES)[number];

export const RECURRENCE_FREQUENCY_LABELS: Record<RecurrenceFrequency, string> = {
  WEEKLY: 'Semanal',
  BIWEEKLY: 'Quincenal',
  MONTHLY: 'Mensual',
  QUARTERLY: 'Trimestral',
  YEARLY: 'Anual',
};

export const ExpenseTemplateCreateSchema = z.object({
  name: z.string().min(2).max(120),
  category: z.enum(EXPENSE_CATEGORIES),
  amount: z.number().positive(),
  frequency: z.enum(RECURRENCE_FREQUENCIES),
  dayOfMonth: z.number().int().min(1).max(31).optional().nullable(),
  dayOfWeek: z.number().int().min(0).max(6).optional().nullable(),
  monthOfYear: z.number().int().min(1).max(12).optional().nullable(),
  payee: z.string().max(120).optional().nullable(),
  notes: z.string().max(2000).optional().nullable(),
  startsOn: z.string().datetime(),
  endsOn: z.string().datetime().optional().nullable(),
  active: z.boolean().default(true),
});
export type ExpenseTemplateCreateDto = z.infer<typeof ExpenseTemplateCreateSchema>;

export const ExpenseCreateSchema = z.object({
  name: z.string().min(2).max(120),
  category: z.enum(EXPENSE_CATEGORIES),
  amount: z.number().positive(),
  date: z.string().datetime(),
  status: z.enum(EXPENSE_STATUSES).default('PENDING'),
  payee: z.string().max(120).optional().nullable(),
  notes: z.string().max(2000).optional().nullable(),
  templateId: z.string().uuid().optional().nullable(),
});
export type ExpenseCreateDto = z.infer<typeof ExpenseCreateSchema>;

export interface ExpenseTemplate {
  id: string;
  name: string;
  category: ExpenseCategory;
  amount: number;
  frequency: RecurrenceFrequency;
  dayOfMonth: number | null;
  dayOfWeek: number | null;
  monthOfYear: number | null;
  payee: string | null;
  notes: string | null;
  startsOn: string;
  endsOn: string | null;
  active: boolean;
}

export interface Expense {
  id: string;
  name: string;
  category: ExpenseCategory;
  amount: number;
  date: string;
  paidAt: string | null;
  status: ExpenseStatus;
  payee: string | null;
  notes: string | null;
  templateId: string | null;
  // virtual: si true, todavía no se materializó (vino de plantilla)
  virtual?: boolean;
}
