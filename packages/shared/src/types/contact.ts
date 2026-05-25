import { z } from 'zod';

export const CONTACT_REQUEST_STATUSES = ['NEW', 'CONTACTED', 'SCHEDULED', 'CONVERTED', 'DISCARDED'] as const;
export type ContactRequestStatus = (typeof CONTACT_REQUEST_STATUSES)[number];

export const ContactRequestCreateSchema = z.object({
  name: z.string().min(2).max(120),
  email: z.string().email().optional().nullable().or(z.literal('')),
  phone: z.string().min(7).max(20),
  furnitureType: z.string().max(60).optional().nullable(),
  message: z.string().min(5).max(2000),
  source: z.string().max(255).optional().nullable(),
});
export type ContactRequestCreateDto = z.infer<typeof ContactRequestCreateSchema>;

export interface ContactRequest {
  id: string;
  name: string;
  email: string | null;
  phone: string;
  furnitureType: string | null;
  message: string;
  status: ContactRequestStatus;
  clientId: string | null;
  appointmentId: string | null;
  source: string | null;
  createdAt: string;
}
