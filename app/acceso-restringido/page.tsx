import Link from 'next/link';
import Logo from '@/components/Logo';

export default function AccesoRestringidoPage() {
  return (
    <div className="min-h-screen bg-navy flex items-center justify-center px-4">
      <div className="w-full max-w-sm text-center">
        <Logo height={48} color="#FFFFFF" className="mx-auto" />

        <h1 className="mt-8 text-xl font-semibold text-white">
          Acceso restringido
        </h1>

        <p className="mt-3 text-sm text-white/60 leading-relaxed">
          Esta plataforma es exclusiva para estudiantes y docentes del
          Colegio Cumbres de Medellín. Solo los correos con dominio{' '}
          <span className="text-white font-medium">@cumbres.edu.co</span>{' '}
          pueden ingresar.
        </p>

        <div className="mt-8">
          <Link
            href="/login"
            className="inline-block bg-electric text-white px-6 py-2.5 rounded-xl
                       text-sm font-medium hover:bg-electric-hover transition-colors"
          >
            Volver al inicio
          </Link>
        </div>

        <p className="mt-8 text-xs text-white/25">
          Si crees que esto es un error, contacta a un administrador.
        </p>
      </div>
    </div>
  );
}
