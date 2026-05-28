import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import ProgressBar from '@/components/ProgressBar';

export default async function ProgresoPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: materias } = await supabase
    .from('materias')
    .select('*, modulos(id)')
    .eq('activa', true)
    .order('nombre');

  const { data: progresoData } = await supabase
    .from('progreso')
    .select('modulo_id')
    .eq('user_id', user.id)
    .eq('completado', true);

  const { data: intentos } = await supabase
    .from('intentos_banco')
    .select('correcta')
    .eq('user_id', user.id);

  const completadosSet = new Set((progresoData ?? []).map((p) => p.modulo_id));
  const totalIntentos = intentos?.length ?? 0;
  const correctos = intentos?.filter((i) => i.correcta).length ?? 0;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl p-5">
          <p className="text-xs text-gray-500">Módulos completados</p>
          <p className="text-3xl font-semibold text-gray-900 mt-1">{completadosSet.size}</p>
        </div>
        <div className="bg-white rounded-xl p-5">
          <p className="text-xs text-gray-500">Preguntas respondidas</p>
          <p className="text-3xl font-semibold text-gray-900 mt-1">{totalIntentos}</p>
        </div>
        <div className="bg-white rounded-xl p-5">
          <p className="text-xs text-gray-500">Aciertos banco</p>
          <p className="text-3xl font-semibold text-gray-900 mt-1">
            {totalIntentos > 0 ? `${Math.round((correctos / totalIntentos) * 100)}%` : '—'}
          </p>
        </div>
      </div>

      <div className="bg-white rounded-xl p-6">
        <h2 className="text-sm font-semibold text-gray-900 mb-4">Progreso por materia</h2>
        {(!materias || materias.length === 0) ? (
          <p className="text-sm text-gray-400 text-center py-6">Sin datos disponibles.</p>
        ) : (
          <div className="space-y-5">
            {materias.map((m) => {
              const total = (m.modulos as { id: string }[]).length;
              const done = (m.modulos as { id: string }[]).filter((mod) =>
                completadosSet.has(mod.id)
              ).length;
              const pct = total > 0 ? Math.round((done / total) * 100) : 0;
              return (
                <div key={m.id}>
                  <div className="flex items-center gap-2 mb-1.5">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: m.color }} />
                    <span className="text-sm font-medium text-gray-800">{m.nombre}</span>
                  </div>
                  <ProgressBar
                    value={pct}
                    label={`${done} de ${total} módulos`}
                  />
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
