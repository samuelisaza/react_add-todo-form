import { redirect } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import Logo from '@/components/Logo';
import Header from '@/components/Header';

const adminNav = [
  { label: 'Panel', href: '/admin' },
  { label: 'Materias', href: '/admin/materias' },
  { label: 'Módulos', href: '/admin/modulos' },
  { label: 'Preguntas', href: '/admin/preguntas' },
  { label: 'Progreso', href: '/admin/progreso' },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect('/login');

  const { data: userData } = await supabase
    .from('users')
    .select('nombre, grado, rol')
    .eq('id', user.id)
    .single();

  if (userData?.rol !== 'admin') redirect('/dashboard');

  const nombre = userData.nombre;

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Admin sidebar */}
      <aside className="w-60 min-h-screen bg-navy flex flex-col border-r border-white/10 shrink-0">
        <div className="px-5 py-6 border-b border-white/10">
          <div className="flex items-center gap-3">
            <Logo height={28} color="#FFFFFF" />
            <div>
              <p className="text-xs font-semibold text-white tracking-widest uppercase">Bridge</p>
              <p className="text-xs text-white/40">Admin</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-0.5">
          {adminNav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center px-3 py-2.5 rounded-lg text-sm text-white/60
                         hover:text-white hover:bg-white/8 transition-colors"
            >
              {item.label}
            </Link>
          ))}

          <div className="pt-4 pb-1">
            <Link
              href="/dashboard"
              className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm text-white/40
                         hover:text-white/70 transition-colors"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Vista estudiante
            </Link>
          </div>
        </nav>

        <div className="px-4 py-4 border-t border-white/10">
          <p className="text-xs text-white/40 truncate">{nombre}</p>
          <p className="text-xs text-electric mt-0.5">Administrador</p>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <Header userName={nombre} title="Administración" />
        <main className="flex-1 p-6 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
