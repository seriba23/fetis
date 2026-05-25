import { z } from 'zod';

export type AttributeFieldType = 'text' | 'number' | 'textarea' | 'select' | 'boolean';

export interface AttributeField {
  key: string;
  label: string;
  type: AttributeFieldType;
  unit?: string;
  options?: string[];
  placeholder?: string;
  required?: boolean;
  hint?: string;
}

export interface FurnitureType {
  id: string;
  slug: string;
  name: string;
  icon: string | null;
  description: string | null;
  attributesSchema: AttributeField[];
  order: number;
  active: boolean;
}

export const FurnitureTypeCreateSchema = z.object({
  slug: z.string().min(2).max(60).regex(/^[a-z0-9-]+$/, 'solo minúsculas, números y guiones'),
  name: z.string().min(2).max(80),
  icon: z.string().max(60).optional().nullable(),
  description: z.string().max(500).optional().nullable(),
  attributesSchema: z.array(z.object({
    key: z.string(),
    label: z.string(),
    type: z.enum(['text', 'number', 'textarea', 'select', 'boolean']),
    unit: z.string().optional(),
    options: z.array(z.string()).optional(),
    placeholder: z.string().optional(),
    required: z.boolean().optional(),
    hint: z.string().optional(),
  })),
  order: z.number().int().default(0),
  active: z.boolean().default(true),
});
export type FurnitureTypeCreateDto = z.infer<typeof FurnitureTypeCreateSchema>;
