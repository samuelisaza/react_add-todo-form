import { redirect } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import StatCard from '@/components/StatCard';
import ProgressBar from '@/components/ProgressBar';
import type { MateriaConProgreso } from '@/lib/types';

export default async function DashboardPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect('/login');

  const { data: userData } = await supabase
    .from('users')
    .select('nombre, grado')
    .eq('id', user.id)
    .single();

  // Stats: módulos completados
  const { count: completados } = await supabase
    .from('progreso')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id)
    .eq('completado', true);

  // Stats: preguntas correctas en el banco
  const { data: intentos } = await supabase
    .from('intentos_banco')
    .select('correcta')
    .eq('user_id', user.id);

  const totalIntentos = intentos?.length ?? 0;
  const correctos = intentos?.filter((i) => i.correcta).length ?? 0;
  const puntajeBanco =
    totalIntentos > 0 ? Math.round((correctos / totalIntentos) * 100) : 0;

  // Materias con progreso
  const { data: materias } = await supabase
    .from('materias')
    .select('*, modulos(id)')
    .eq('activa', true)
    .order('nombre');

  const { data: progresoData } = await supabase
    .from('progreso')
    .select('modulo_id, completado')
    .eq('user_id', user.id)
    .eq('completado', true);

  const completadosSet = new Set((progresoData ?? []).map((p) => p.modulo_id));

  const materiasConProgreso: MateriaConProgreso[] = (materias ?? []).map((m) => {
    const modulosIds = (m.modulos as { id: string }[]).map((mod) => mod.id);
    const total = modulosIds.length;
    const completadosCnt = modulosIds.filter((id) => completadosSet.has(id)).length;
    return {
      ...m,
      modulos: undefined as unknown as never,
      total_modulos: total,
      modulos_completados: completadosCnt,
      porcentaje: total > 0 ? Math.round((completadosCnt / total) * 100) : 0,
    };
  });

  const nombre = userData?.nombre ?? '';

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Stats */}
      <section>
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">
          Resumen
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <StatCard
            label="Temas completados"
            value={completados ?? 0}
            sub="módulos terminados"
            icon={
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            }
          />
          <StatCard
            label="Banco de preguntas"
            value={totalIntentos > 0 ? `${puntajeBanco}%` : '—'}
            sub={totalIntentos > 0 ? `${correctos} de ${totalIntentos} correctas` : 'Sin intentos aún'}
            icon={
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            }
          />
          <StatCard
            label="Materias activas"
            value={materias?.length ?? 0}
            sub="disponibles este periodo"
            icon={
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            }
          />
        </div>
      </section>

      {/* Materias */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">
            Mis materias
          </h2>
          <Link href="/materias" className="text-xs text-electric hover:underline">
            Ver todas
          </Link>
        </div>

        {materiasConProgreso.length === 0 ? (
          <div className="bg-white rounded-xl p-8 text-center">
            <p className="text-sm text-gray-400">
              No hay materias disponibles aún.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {materiasConProgreso.slice(0, 4).map((materia) => (
              <Link key={materia.id} href={`/materias/${materia.id}`}>
                <div className="bg-white rounded-xl p-5 hover:shadow-md transition-shadow cursor-pointer">
                  <div className="flex items-start justify-between mb-3">
                    <div
                      className="w-3 h-3 rounded-full mt-0.5"
                      style={{ backgroundColor: materia.color }}
                    />
                    {materia.grado && (
                      <span className="text-xs text-gray-400">{materia.grado}</span>
                    )}
                  </div>
                  <h3 className="text-sm font-semibold text-gray-900 mb-1">
                    {materia.nombre}
                  </h3>
                  {materia.descripcion && (
                    <p className="text-xs text-gray-500 mb-3 line-clamp-2">
                      {materia.descripcion}
                    </p>
                  )}
                  <ProgressBar
                    value={materia.porcentaje}
                    label={`${materia.modulos_completados}/${materia.total_modulos} módulos`}
                  />
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* Próxima tutoría */}
      <section>
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">
          Tutorías
        </h2>
        <div className="bg-white rounded-xl p-5 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-lg bg-electric/10 flex items-center justify-center text-electric">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">
                Agenda una sesión presencial
              </p>
              <p className="text-xs text-gray-500 mt-0.5">
                Las tutorías se coordinan directamente por WhatsApp.
              </p>
            </div>
          </div>
          <Link href="/tutorias">
            <span className="text-sm text-electric hover:underline">Ver más</span>
          </Link>
        </div>
      </section>
    </div>
  );
}
