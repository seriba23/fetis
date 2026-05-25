export function sanitizePhone(input: string): string {
  return (input ?? '').replace(/\D/g, '').slice(0, 10);
}

export function isValidPhone10(s: string): boolean {
  return /^\d{10}$/.test(s);
}

export function isValidEmail(s: string): boolean {
  if (!s) return true; // opcional
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(s);
}

export function isValidPostalCode(s: string): boolean {
  if (!s) return true;
  return /^\d{5}$/.test(s);
}

export function formatPhoneDisplay(s: string): string {
  const clean = sanitizePhone(s);
  if (clean.length === 10) return `${clean.slice(0, 2)} ${clean.slice(2, 6)} ${clean.slice(6)}`;
  return clean;
}
