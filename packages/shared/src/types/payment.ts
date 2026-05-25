import { z } from 'zod';

export const PAYMENT_METHODS = ['CASH', 'CARD', 'TRANSFER', 'CHECK', 'OTHER'] as const;
export type PaymentMethod = (typeof PAYMENT_METHODS)[number];

export const PAYMENT_STATUSES = ['PENDING', 'COMPLETED', 'REFUNDED', 'CANCELLED'] as const;
export type PaymentStatus = (typeof PAYMENT_STATUSES)[number];

export const PAYMENT_CONCEPTS = ['DEPOSIT', 'PROGRESS', 'FINAL', 'EXTRA', 'OTHER'] as const;
export type PaymentConcept = (typeof PAYMENT_CONCEPTS)[number];

export const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
  CASH: 'Efectivo',
  CARD: 'Tarjeta',
  TRANSFER: 'Transferencia',
  CHECK: 'Cheque',
  OTHER: 'Otro',
};

export const PAYMENT_CONCEPT_LABELS: Record<PaymentConcept, string> = {
  DEPOSIT: 'Anticipo',
  PROGRESS: 'Avance',
  FINAL: 'Liquidación',
  EXTRA: 'Adicional',
  OTHER: 'Otro',
};

export const PaymentCreateSchema = z.object({
  clientId: z.string().uuid(),
  quoteId: z.string().uuid().optional().nullable(),
  amount: z.number().positive(),
  method: z.enum(PAYMENT_METHODS).default('CASH'),
  status: z.enum(PAYMENT_STATUSES).default('COMPLETED'),
  concept: z.enum(PAYMENT_CONCEPTS).default('DEPOSIT'),
  reference: z.string().max(120).optional().nullable(),
  receiptUrl: z.string().url().optional().nullable(),
  paidAt: z.string().datetime(),
  notes: z.string().max(2000).optional().nullable(),
});
export type PaymentCreateDto = z.infer<typeof PaymentCreateSchema>;

export interface Payment {
  id: string;
  clientId: string;
  quoteId: string | null;
  amount: number;
  method: PaymentMethod;
  status: PaymentStatus;
  concept: PaymentConcept;
  reference: string | null;
  receiptUrl: string | null;
  paidAt: string;
  notes: string | null;
  createdAt: string;
  client?: { id: string; name: string };
  quote?: { id: string; number: string };
}
