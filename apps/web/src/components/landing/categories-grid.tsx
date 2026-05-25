import Link from 'next/link';
import { CategoryIcon } from '@/components/icons/category-icon';

export function CategoriesGrid({ categories }: { categories: any[] }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {categories.map((c) => (
        <Link
          key={c.id}
          href={`/galeria?cat=${c.slug}`}
          className="group relative overflow-hidden rounded-2xl bg-ink-900/[0.03] border border-ink-900/5 hover:border-brand-500/40 hover:bg-brand-500/5 dark:bg-white/[0.03] dark:border-white/5 transition-all p-6 aspect-square flex flex-col justify-between"
        >
          <div className="w-12 h-12 rounded-xl bg-brand-500/10 text-brand-600 dark:text-brand-400 flex items-center justify-center group-hover:bg-brand-500/20 transition-colors">
            <CategoryIcon slug={c.slug} size={22} />
          </div>
          <div>
            <div className="text-xs text-ink-500 dark:text-white/40 mb-1">
              {c._count?.items ?? 0} {(c._count?.items ?? 0) === 1 ? 'proyecto' : 'proyectos'}
            </div>
            <div className="text-lg font-display text-ink-900 dark:text-white group-hover:text-brand-500 dark:group-hover:text-brand-400 transition-colors">
              {c.name}
            </div>
          </div>
          <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-brand-500/0 group-hover:bg-brand-500/15 rounded-full blur-2xl transition-all" />
        </Link>
      ))}
    </div>
  );
}
