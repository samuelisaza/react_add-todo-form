import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';

export default async function AdminPage() {
  const supabase = await createClient();

  const [
    { count: totalUsers },
    { count: totalMaterias },
    { count: totalModulos },
    { count: totalPreguntas },
    { count: totalProgreso },
  ] = await Promise.all([
    supabase.from('users').select('*', { count: 'exact', head: true }),
    supabase.from('materias').select('*', { count: 'exact', head: true }).eq('activa', true),
    supabase.from('modulos').select('*', { count: 'exact', head: true }).eq('activo', true),
    supabase.from('preguntas').select('*', { count: 'exact', head: true }),
    supabase.from('progreso').select('*', { count: 'exact', head: true }).eq('completado', true),
  ]);

  const stats = [
    { label: 'Estudiantes registrados', value: totalUsers ?? 0, href: '/admin/progreso' },
    { label: 'Materias activas', value: totalMaterias ?? 0, href: '/admin/materias' },
    { label: 'Módulos publicados', value: totalModulos ?? 0, href: '/admin/modulos' },
    { label: 'Preguntas en banco', value: totalPreguntas ?? 0, href: '/admin/preguntas' },
    { label: 'Módulos completados', value: totalProgreso ?? 0, href: '/admin/progreso' },
  ];

  const quickActions = [
    { label: 'Agregar materia', href: '/admin/materias', desc: 'Crea o edita una materia.' },
    { label: 'Agregar módulo', href: '/admin/modulos', desc: 'Sube un video, resumen o taller.' },
    { label: 'Agregar pregunta', href: '/admin/preguntas', desc: 'Añade preguntas al banco.' },
    { label: 'Ver progreso', href: '/admin/progreso', desc: 'Consulta el avance por estudiante.' },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <section>
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">
          Estadísticas generales
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {stats.map((s) => (
            <Link key={s.label} href={s.href}>
              <div className="bg-white rounded-xl p-4 hover:shadow-md transition-shadow text-center">
                <p className="text-3xl font-bold text-navy">{s.value}</p>
                <p className="text-xs text-gray-500 mt-1 leading-tight">{s.label}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">
          Acciones rápidas
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {quickActions.map((a) => (
            <Link key={a.href} href={a.href}>
              <div className="bg-white rounded-xl p-5 hover:shadow-md transition-shadow flex items-center gap-4">
                <div className="w-8 h-8 rounded-lg bg-electric/10 flex items-center justify-center text-electric shrink-0">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900">{a.label}</p>
                  <p className="text-xs text-gray-500">{a.desc}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
