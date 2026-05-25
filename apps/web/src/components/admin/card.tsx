import { cn } from '@/lib/utils';

export function Card({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn('rounded-2xl border', className)}
      style={{ background: 'var(--bg-surface)', borderColor: 'var(--border)' }}
      {...props}
    />
  );
}

export function CardBody({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('p-5 lg:p-6', className)} {...props} />;
}

export function CardHeader({
  title,
  subtitle,
  actions,
}: {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
}) {
  return (
    <div className="p-5 lg:p-6 flex items-center justify-between border-b" style={{ borderColor: 'var(--border)' }}>
      <div>
        <div className="text-base font-medium" style={{ color: 'var(--text-primary)' }}>{title}</div>
        {subtitle && <div className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>{subtitle}</div>}
      </div>
      {actions}
    </div>
  );
}
