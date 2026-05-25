import { z } from 'zod';

export const GalleryCategoryCreateSchema = z.object({
  slug: z.string().min(2).max(60).regex(/^[a-z0-9-]+$/),
  name: z.string().min(2).max(80),
  description: z.string().max(500).optional().nullable(),
  order: z.number().int().default(0),
  visible: z.boolean().default(true),
});
export type GalleryCategoryCreateDto = z.infer<typeof GalleryCategoryCreateSchema>;

export const GalleryItemCreateSchema = z.object({
  categoryId: z.string().uuid(),
  imageUrl: z.string(),
  thumbUrl: z.string().optional().nullable(),
  title: z.string().max(150).optional().nullable(),
  description: z.string().max(1000).optional().nullable(),
  order: z.number().int().default(0),
  visible: z.boolean().default(true),
  featured: z.boolean().default(false),
});
export type GalleryItemCreateDto = z.infer<typeof GalleryItemCreateSchema>;

export interface GalleryCategory {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  order: number;
  visible: boolean;
  itemsCount?: number;
}

export interface GalleryItem {
  id: string;
  categoryId: string;
  imageUrl: string;
  thumbUrl: string | null;
  title: string | null;
  description: string | null;
  order: number;
  visible: boolean;
  featured: boolean;
  createdAt: string;
  category?: GalleryCategory;
}
