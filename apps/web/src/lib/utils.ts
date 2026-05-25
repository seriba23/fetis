import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { UPLOADS_BASE } from './api';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function imageUrl(path: string | null | undefined): string {
  if (!path) return '';
  if (path.startsWith('http://') || path.startsWith('https://')) return path;
  return `${UPLOADS_BASE}${path}`;
}
