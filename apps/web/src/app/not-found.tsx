import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-black text-white text-center px-6">
      <div className="text-7xl font-display gradient-text">404</div>
      <div className="text-white/60 mt-4 max-w-md">
        La página que buscas no existe o fue movida.
      </div>
      <Link href="/" className="mt-8 inline-flex rounded-full px-6 py-2.5 bg-brand-500 hover:bg-brand-600 text-sm">
        Volver al inicio
      </Link>
    </div>
  );
}
