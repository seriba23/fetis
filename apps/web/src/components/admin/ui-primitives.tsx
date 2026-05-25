import { cn } from '@/lib/utils';
import { forwardRef } from 'react';

export const Button = forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement> & {
    variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
    size?: 'sm' | 'md' | 'lg';
  }
>(({ className, variant = 'primary', size = 'md', ...props }, ref) => {
  const sizes = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-4 py-2 text-sm',
    lg: 'px-5 py-2.5 text-sm',
  };
  const variants = {
    primary: 'bg-brand-500 hover:bg-brand-600 text-white shadow-brand-glow disabled:opacity-50',
    secondary: 'bg-brand-500/10 text-brand-600 hover:bg-brand-500/20',
    outline: 'border bg-transparent hover:bg-[color:var(--bg-surface-hover)]',
    ghost: 'hover:bg-[color:var(--bg-surface-hover)]',
    danger: 'bg-red-500/10 text-red-600 hover:bg-red-500/20',
  };
  return (
    <button
      ref={ref}
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-full font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed',
        sizes[size],
        variants[variant],
        className,
      )}
      style={
        variant === 'outline'
          ? { borderColor: 'var(--border-strong)', color: 'var(--text-primary)' }
          : variant === 'ghost'
          ? { color: 'var(--text-primary)' }
          : undefined
      }
      {...props}
    />
  );
});
Button.displayName = 'Button';

export const Input = forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement> & { error?: string | null }
>(({ className, error, ...props }, ref) => (
  <input
    ref={ref}
    aria-invalid={error ? true : undefined}
    className={cn(
      'w-full px-3.5 py-2.5 rounded-xl border text-sm transition focus:outline-none focus:ring-2',
      error
        ? 'border-red-500/60 focus:border-red-500/80 focus:ring-red-500/15'
        : 'focus:border-brand-500/60 focus:ring-brand-500/15',
      className,
    )}
    style={{
      background: 'var(--bg-surface)',
      borderColor: error ? '#EF4444' : 'var(--border)',
      color: 'var(--text-primary)',
    }}
    {...props}
  />
));
Input.displayName = 'Input';

export const Textarea = forwardRef<HTMLTextAreaElement, React.TextareaHTMLAttributes<HTMLTextAreaElement>>(
  ({ className, ...props }, ref) => (
    <textarea
      ref={ref}
      className={cn(
        'w-full px-3.5 py-2.5 rounded-xl border text-sm transition focus:outline-none focus:border-brand-500/60 focus:ring-2 focus:ring-brand-500/15 resize-none',
        className,
      )}
      style={{ background: 'var(--bg-surface)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
      {...props}
    />
  ),
);
Textarea.displayName = 'Textarea';

export const Select = forwardRef<HTMLSelectElement, React.SelectHTMLAttributes<HTMLSelectElement>>(
  ({ className, ...props }, ref) => (
    <select
      ref={ref}
      className={cn(
        'w-full px-3.5 py-2.5 rounded-xl border text-sm transition focus:outline-none focus:border-brand-500/60 focus:ring-2 focus:ring-brand-500/15',
        className,
      )}
      style={{ background: 'var(--bg-surface)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
      {...props}
    />
  ),
);
Select.displayName = 'Select';

export function Label({ children, htmlFor, className }: { children: React.ReactNode; htmlFor?: string; className?: string }) {
  return (
    <label
      htmlFor={htmlFor}
      className={cn('text-xs uppercase tracking-widest font-medium mb-1.5 block', className)}
      style={{ color: 'var(--text-muted)' }}
    >
      {children}
    </label>
  );
}

export function Field({
  label,
  required,
  error,
  hint,
  children,
  className,
}: {
  label?: string;
  required?: boolean;
  error?: string | null;
  hint?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={className}>
      {label && (
        <Label>
          {label}
          {required ? ' *' : ''}
        </Label>
      )}
      {children}
      {error ? (
        <div className="text-xs mt-1 text-red-500">{error}</div>
      ) : hint ? (
        <div className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>{hint}</div>
      ) : null}
    </div>
  );
}

export function Badge({
  children,
  color = 'gray',
}: {
  children: React.ReactNode;
  color?: 'gray' | 'green' | 'yellow' | 'red' | 'blue' | 'purple';
}) {
  const colors = {
    gray: 'bg-slate-500/15 text-slate-600',
    green: 'bg-emerald-500/15 text-emerald-600',
    yellow: 'bg-amber-500/15 text-amber-600',
    red: 'bg-red-500/15 text-red-600',
    blue: 'bg-blue-500/15 text-blue-600',
    purple: 'bg-brand-500/15 text-brand-600',
  };
  return (
    <span className={cn('inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium', colors[color])}>
      {children}
    </span>
  );
}

export function Modal({
  open,
  onClose,
  title,
  children,
  size = 'md',
}: {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}) {
  if (!open) return null;
  const sizes = { sm: 'max-w-md', md: 'max-w-xl', lg: 'max-w-3xl', xl: 'max-w-5xl' };
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div
        className={cn('relative w-full rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]', sizes[size])}
        style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)' }}
      >
        {title && (
          <div className="px-6 py-4 border-b flex items-center justify-between" style={{ borderColor: 'var(--border)' }}>
            <div className="font-medium" style={{ color: 'var(--text-primary)' }}>{title}</div>
            <button onClick={onClose} className="text-[color:var(--text-muted)] hover:text-[color:var(--text-primary)]">✕</button>
          </div>
        )}
        <div className="overflow-y-auto flex-1">{children}</div>
      </div>
    </div>
  );
}
