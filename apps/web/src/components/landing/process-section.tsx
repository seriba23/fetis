const STEPS = [
  {
    n: '01',
    title: 'Consulta inicial',
    text: 'Conversamos sobre tu proyecto, espacio y necesidades. Sin compromiso.',
  },
  {
    n: '02',
    title: 'Diseño y cotización',
    text: 'Levantamos medidas, diseñamos a la medida y entregamos cotización transparente.',
  },
  {
    n: '03',
    title: 'Fabricación',
    text: 'Producción artesanal con materiales premium y herrajes de calidad europea.',
  },
  {
    n: '04',
    title: 'Entrega e instalación',
    text: 'Llevamos e instalamos en tu espacio, listo para usar y garantizado.',
  },
];

export function ProcessSection() {
  return (
    <section className="py-20 lg:py-28 border-t border-ink-900/5 dark:border-white/5">
      <div className="max-w-7xl mx-auto px-6 lg:px-10">
        <div className="mb-14">
          <div className="text-xs uppercase tracking-widest text-brand-600 dark:text-brand-400 mb-3">Proceso</div>
          <h2 className="text-3xl lg:text-5xl font-display font-light max-w-2xl text-ink-900 dark:text-white">
            Del concepto al espacio terminado
          </h2>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {STEPS.map((step, idx) => (
            <div
              key={step.n}
              className="relative rounded-2xl bg-ink-900/[0.03] border border-ink-900/5 hover:bg-ink-900/[0.05] dark:bg-white/[0.03] dark:border-white/5 dark:hover:bg-white/[0.05] p-7 transition-colors"
            >
              <div className="absolute top-6 right-6 text-5xl font-display text-brand-500/15 leading-none">
                {step.n}
              </div>
              <div className="text-brand-600 dark:text-brand-400 text-xs uppercase tracking-widest mb-3">
                Paso {idx + 1}
              </div>
              <h3 className="font-display text-xl mb-3 text-ink-900 dark:text-white">{step.title}</h3>
              <p className="text-ink-600 dark:text-white/60 text-sm leading-relaxed">{step.text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
