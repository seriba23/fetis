import { z } from 'zod';

const phoneRegex = /^\d{10}$/;
const postalCodeRegex = /^\d{5}$/;

export const ClientCreateSchema = z.object({
  name: z.string().min(2).max(120),
  email: z.string().email().optional().nullable().or(z.literal('')),
  phone: z.string().regex(phoneRegex, 'Debe ser un teléfono de 10 dígitos'),
  // Dirección
  street: z.string().max(160).optional().nullable(),
  extNumber: z.string().max(20).optional().nullable(),
  intNumber: z.string().max(20).optional().nullable(),
  neighborhood: z.string().max(120).optional().nullable(),
  city: z.string().max(80).optional().nullable(),
  state: z.string().max(80).optional().nullable(),
  postalCode: z.string().regex(postalCodeRegex, 'Código postal de 5 dígitos').optional().nullable().or(z.literal('')),
  country: z.string().max(60).optional().nullable(),
  addressNotes: z.string().max(500).optional().nullable(),
  // Otros
  notes: z.string().max(2000).optional().nullable(),
  source: z.string().max(80).optional().nullable(),
});
export type ClientCreateDto = z.infer<typeof ClientCreateSchema>;

export const ClientUpdateSchema = ClientCreateSchema.partial();
export type ClientUpdateDto = z.infer<typeof ClientUpdateSchema>;

export interface Client {
  id: string;
  name: string;
  email: string | null;
  phone: string;
  street: string | null;
  extNumber: string | null;
  intNumber: string | null;
  neighborhood: string | null;
  city: string | null;
  state: string | null;
  postalCode: string | null;
  country: string | null;
  addressNotes: string | null;
  notes: string | null;
  source: string | null;
  createdAt: string;
  updatedAt: string;
}

export function formatClientAddress(c: Partial<Client>): string {
  const line1 = [c.street, c.extNumber && `#${c.extNumber}`, c.intNumber && `Int. ${c.intNumber}`]
    .filter(Boolean)
    .join(' ');
  const line2 = [c.neighborhood, c.postalCode && `C.P. ${c.postalCode}`].filter(Boolean).join(', ');
  const line3 = [c.city, c.state, c.country].filter(Boolean).join(', ');
  return [line1, line2, line3].filter(Boolean).join(' · ');
}

export const MEXICAN_STATES = [
  'Aguascalientes', 'Baja California', 'Baja California Sur', 'Campeche', 'Chiapas',
  'Chihuahua', 'Ciudad de México', 'Coahuila', 'Colima', 'Durango', 'Estado de México',
  'Guanajuato', 'Guerrero', 'Hidalgo', 'Jalisco', 'Michoacán', 'Morelos', 'Nayarit',
  'Nuevo León', 'Oaxaca', 'Puebla', 'Querétaro', 'Quintana Roo', 'San Luis Potosí',
  'Sinaloa', 'Sonora', 'Tabasco', 'Tamaulipas', 'Tlaxcala', 'Veracruz', 'Yucatán', 'Zacatecas',
] as const;
