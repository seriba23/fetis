import { z } from 'zod';

export const QUOTE_STATUSES = ['DRAFT', 'SENT', 'ACCEPTED', 'REJECTED', 'EXPIRED', 'CONVERTED'] as const;
export type QuoteStatus = (typeof QUOTE_STATUSES)[number];

export const QUOTE_STATUS_LABELS: Record<QuoteStatus, string> = {
  DRAFT: 'Borrador',
  SENT: 'Enviada',
  ACCEPTED: 'Aceptada',
  REJECTED: 'Rechazada',
  EXPIRED: 'Vencida',
  CONVERTED: 'Convertida',
};

export const QuoteItemCreateSchema = z.object({
  furnitureTypeId: z.string().uuid(),
  title: z.string().min(2).max(200),
  specs: z.record(z.any()).default({}),
  notes: z.string().max(2000).optional().nullable(),
  unitPrice: z.number().min(0).default(0),
  quantity: z.number().int().min(1).default(1),
  order: z.number().int().default(0),
});
export type QuoteItemCreateDto = z.infer<typeof QuoteItemCreateSchema>;

export const QuoteCreateSchema = z.object({
  clientId: z.string().uuid(),
  status: z.enum(QUOTE_STATUSES).default('DRAFT'),
  discount: z.number().min(0).default(0),
  taxRate: z.number().min(0).max(100).default(0),
  validUntil: z.string().datetime().optional().nullable(),
  notes: z.string().max(2000).optional().nullable(),
  internalNotes: z.string().max(2000).optional().nullable(),
  items: z.array(QuoteItemCreateSchema).default([]),
});
export type QuoteCreateDto = z.infer<typeof QuoteCreateSchema>;

export const QuoteUpdateSchema = QuoteCreateSchema.partial().omit({ items: true });
export type QuoteUpdateDto = z.infer<typeof QuoteUpdateSchema>;

export interface QuoteItem {
  id: string;
  quoteId: string;
  furnitureTypeId: string;
  title: string;
  specs: Record<string, any>;
  notes: string | null;
  unitPrice: number;
  quantity: number;
  subtotal: number;
  order: number;
  furnitureType?: { id: string; name: string; slug: string; icon: string | null };
}

export interface Quote {
  id: string;
  number: string;
  clientId: string;
  status: QuoteStatus;
  subtotal: number;
  discount: number;
  taxRate: number;
  taxAmount: number;
  total: number;
  paidAmount: number;
  validUntil: string | null;
  notes: string | null;
  internalNotes: string | null;
  sentAt: string | null;
  acceptedAt: string | null;
  createdAt: string;
  updatedAt: string;
  client?: { id: string; name: string; phone: string; email: string | null };
  items?: QuoteItem[];
}
