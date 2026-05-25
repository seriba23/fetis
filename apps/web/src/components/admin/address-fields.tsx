'use client';

import { MEXICAN_STATES } from '@fetis/shared';
import { Field, Input, Select, Textarea } from './ui-primitives';
import { isValidPostalCode } from '@/lib/validators';

export interface AddressValue {
  street?: string | null;
  extNumber?: string | null;
  intNumber?: string | null;
  neighborhood?: string | null;
  city?: string | null;
  state?: string | null;
  postalCode?: string | null;
  country?: string | null;
  addressNotes?: string | null;
}

export function AddressFields({
  value,
  onChange,
  errors,
}: {
  value: AddressValue;
  onChange: (patch: Partial<AddressValue>) => void;
  errors?: Partial<Record<keyof AddressValue, string>>;
}) {
  return (
    <div className="space-y-3">
      <div className="grid sm:grid-cols-[1fr_140px_140px] gap-3">
        <Field label="Calle">
          <Input
            value={value.street ?? ''}
            onChange={(e) => onChange({ street: e.target.value })}
            placeholder="Av. Reforma"
            maxLength={160}
          />
        </Field>
        <Field label="Núm. exterior">
          <Input
            value={value.extNumber ?? ''}
            onChange={(e) => onChange({ extNumber: e.target.value })}
            placeholder="123"
            maxLength={20}
          />
        </Field>
        <Field label="Núm. interior">
          <Input
            value={value.intNumber ?? ''}
            onChange={(e) => onChange({ intNumber: e.target.value })}
            placeholder="A, 4B..."
            maxLength={20}
          />
        </Field>
      </div>

      <div className="grid sm:grid-cols-[1fr_140px] gap-3">
        <Field label="Colonia">
          <Input
            value={value.neighborhood ?? ''}
            onChange={(e) => onChange({ neighborhood: e.target.value })}
            placeholder="Centro"
            maxLength={120}
          />
        </Field>
        <Field label="Código postal" error={errors?.postalCode}>
          <Input
            value={value.postalCode ?? ''}
            onChange={(e) => onChange({ postalCode: e.target.value.replace(/\D/g, '').slice(0, 5) })}
            placeholder="01000"
            inputMode="numeric"
            maxLength={5}
            error={errors?.postalCode}
          />
        </Field>
      </div>

      <div className="grid sm:grid-cols-3 gap-3">
        <Field label="Ciudad / Municipio">
          <Input
            value={value.city ?? ''}
            onChange={(e) => onChange({ city: e.target.value })}
            placeholder="Ciudad de México"
            maxLength={80}
          />
        </Field>
        <Field label="Estado">
          <Select value={value.state ?? ''} onChange={(e) => onChange({ state: e.target.value || null })}>
            <option value="">—</option>
            {MEXICAN_STATES.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </Select>
        </Field>
        <Field label="País">
          <Input
            value={value.country ?? 'México'}
            onChange={(e) => onChange({ country: e.target.value })}
            maxLength={60}
          />
        </Field>
      </div>

      <Field label="Referencias / entre calles" hint="Indicaciones para llegar, color de fachada, etc.">
        <Textarea
          rows={2}
          value={value.addressNotes ?? ''}
          onChange={(e) => onChange({ addressNotes: e.target.value })}
          maxLength={500}
        />
      </Field>
    </div>
  );
}
