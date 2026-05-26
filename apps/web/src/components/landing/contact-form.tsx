'use client';

import { useState } from 'react';
import { CheckCircle2, Loader2 } from 'lucide-react';
import { publicApi } from '@/lib/api';
import { sanitizePhone, isValidPhone10, isValidEmail, formatPhoneDisplay } from '@/lib/validators';

export function ContactForm({ furnitureTypes }: { furnitureTypes: any[] }) {
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    furnitureType: '',
    message: '',
  });
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const errors: Record<string, string> = {};
  if (!form.name.trim()) errors.name = 'Requerido';
  else if (form.name.trim().length < 2) errors.name = 'Mínimo 2 caracteres';
  if (!form.phone) errors.phone = 'Requerido';
  else if (!isValidPhone10(form.phone)) errors.phone = 'Debe tener 10 dígitos';
  if (form.email && !isValidEmail(form.email)) errors.email = 'Email inválido';
  if (!form.message.trim()) errors.message = 'Requerido';
  else if (form.message.trim().length < 5) errors.message = 'Cuéntanos un poco más (mín. 5 caracteres)';

  const isValid = Object.keys(errors).length === 0;

  function show(key: string) {
    return touched[key] ? errors[key] : undefined;
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setTouched({ name: true, phone: true, email: true, message: true });
    if (!isValid) return;
    setError(null);
    setSubmitting(true);
    try {
      const res = await publicApi.contact({
        ...form,
        source: typeof window !== 'undefined' ? window.location.href : '',
      });
      setSuccess(res.message);
      setForm({ name: '', email: '', phone: '', furnitureType: '', message: '' });
      setTouched({});
    } catch (e: any) {
      setError(e?.message ?? 'No se pudo enviar tu solicitud. Inténtalo de nuevo o llámanos.');
    } finally {
      setSubmitting(false);
    }
  }

  if (success) {
    return (
      <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-10 text-center">
        <CheckCircle2 size={48} className="mx-auto text-emerald-500 dark:text-emerald-400 mb-4" />
        <h3 className="text-2xl font-display mb-2 text-ink-900 dark:text-white">¡Gracias!</h3>
        <p className="text-ink-700 dark:text-white/80 mb-6">{success}</p>
        <button
          onClick={() => setSuccess(null)}
          className="text-brand-600 hover:text-brand-700 dark:text-brand-300 dark:hover:text-brand-200 text-sm underline-offset-4 hover:underline"
        >
          Enviar otra consulta
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-5" noValidate>
      <div className="grid sm:grid-cols-2 gap-4">
        <FormField label="Nombre" required error={show('name')}>
          <input
            type="text"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            onBlur={() => setTouched({ ...touched, name: true })}
            className={`input ${show('name') ? 'input-error' : ''}`}
            placeholder="Tu nombre completo"
            maxLength={120}
          />
        </FormField>

        <FormField
          label="Teléfono"
          required
          error={show('phone')}
          hint={!show('phone') && form.phone && isValidPhone10(form.phone) ? formatPhoneDisplay(form.phone) : undefined}
        >
          <input
            type="tel"
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: sanitizePhone(e.target.value) })}
            onBlur={() => setTouched({ ...touched, phone: true })}
            className={`input ${show('phone') ? 'input-error' : ''}`}
            placeholder="5555555555"
            inputMode="numeric"
            maxLength={10}
          />
        </FormField>
      </div>

      <FormField label="Email" error={show('email')}>
        <input
          type="email"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          onBlur={() => setTouched({ ...touched, email: true })}
          className={`input ${show('email') ? 'input-error' : ''}`}
          placeholder="tu@correo.com (opcional)"
          maxLength={120}
        />
      </FormField>

      <FormField label="¿Qué tipo de mueble te interesa?">
        <select
          value={form.furnitureType}
          onChange={(e) => setForm({ ...form, furnitureType: e.target.value })}
          className="input"
        >
          <option value="">Selecciona una opción</option>
          {furnitureTypes.map((t) => (
            <option key={t.slug} value={t.slug}>
              {t.name}
            </option>
          ))}
        </select>
      </FormField>

      <FormField label="Cuéntanos sobre tu proyecto" required error={show('message')}>
        <textarea
          rows={5}
          value={form.message}
          onChange={(e) => setForm({ ...form, message: e.target.value })}
          onBlur={() => setTouched({ ...touched, message: true })}
          className={`input resize-none ${show('message') ? 'input-error' : ''}`}
          placeholder="Describe el espacio, dimensiones aproximadas, estilo deseado, presupuesto estimado..."
          maxLength={2000}
        />
      </FormField>

      {error && (
        <div className="rounded-xl border border-red-500/30 bg-red-500/10 text-red-700 dark:text-red-200 px-4 py-3 text-sm">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={submitting || !isValid}
        className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-full px-7 py-3.5 bg-brand-500 hover:bg-brand-600 disabled:opacity-60 disabled:cursor-not-allowed text-white text-sm font-medium shadow-brand-glow transition"
      >
        {submitting && <Loader2 size={16} className="animate-spin" />}
        {submitting ? 'Enviando...' : 'Enviar solicitud'}
      </button>

      <style jsx>{`
        :global(.input) {
          width: 100%;
          background: rgba(15, 23, 42, 0.04);
          border: 1px solid rgba(15, 23, 42, 0.10);
          color: #0F172A;
          padding: 0.85rem 1rem;
          border-radius: 0.75rem;
          font-size: 0.95rem;
          transition: all 0.15s;
        }
        :global([data-theme='dark'] .input) {
          background: rgba(255, 255, 255, 0.04);
          border-color: rgba(255, 255, 255, 0.08);
          color: white;
        }
        :global(.input:focus) {
          outline: none;
          border-color: color-mix(in srgb, var(--brand) 50%, transparent);
          background: color-mix(in srgb, var(--brand) 4%, transparent);
          box-shadow: 0 0 0 3px color-mix(in srgb, var(--brand) 15%, transparent);
        }
        :global([data-theme='dark'] .input:focus) {
          background: rgba(255, 255, 255, 0.06);
        }
        :global(.input.input-error) {
          border-color: rgba(239, 68, 68, 0.6);
        }
        :global(.input.input-error:focus) {
          box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.15);
        }
        :global(.input::placeholder) { color: rgba(15, 23, 42, 0.40); }
        :global([data-theme='dark'] .input::placeholder) { color: rgba(255, 255, 255, 0.35); }
        :global(select.input option) { background: #ffffff; color: #0F172A; }
        :global([data-theme='dark'] select.input option) { background: #1a1a1a; color: white; }
      `}</style>
    </form>
  );
}

function FormField({
  label,
  children,
  required,
  error,
  hint,
}: {
  label: string;
  children: React.ReactNode;
  required?: boolean;
  error?: string;
  hint?: string;
}) {
  return (
    <label className="block">
      <span className="block text-xs uppercase tracking-widest text-ink-500 dark:text-white/50 mb-2">
        {label}
        {required ? ' *' : ''}
      </span>
      {children}
      {error ? (
        <span className="block text-xs mt-1.5 text-red-500 dark:text-red-400">{error}</span>
      ) : hint ? (
        <span className="block text-xs mt-1.5 text-ink-500 dark:text-white/40">{hint}</span>
      ) : null}
    </label>
  );
}
