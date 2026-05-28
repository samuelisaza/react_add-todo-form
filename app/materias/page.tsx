import { redirect } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import ProgressBar from '@/components/ProgressBar';

export default async function MateriasPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

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

  const completadosSet = new Set((progresoData ?? []).map((p) => p.modulo_id));

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-lg font-semibold text-gray-900 mb-6">Mis materias</h1>

      {(!materias || materias.length === 0) ? (
        <div className="bg-white rounded-xl p-10 text-center">
          <p className="text-sm text-gray-400">No hay materias disponibles.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {materias.map((m) => {
            const total = (m.modulos as { id: string }[]).length;
            const done = (m.modulos as { id: string }[]).filter((mod) =>
              completadosSet.has(mod.id)
            ).length;
            const pct = total > 0 ? Math.round((done / total) * 100) : 0;

            return (
              <Link key={m.id} href={`/materias/${m.id}`}>
                <div className="bg-white rounded-xl p-5 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-3">
                    <div
                      className="w-3 h-3 rounded-full mt-0.5"
                      style={{ backgroundColor: m.color }}
                    />
                    {m.grado && <span className="text-xs text-gray-400">{m.grado}</span>}
                  </div>
                  <h2 className="text-sm font-semibold text-gray-900 mb-1">{m.nombre}</h2>
                  {m.descripcion && (
                    <p className="text-xs text-gray-500 mb-3 line-clamp-2">{m.descripcion}</p>
                  )}
                  <ProgressBar
                    value={pct}
                    label={`${done}/${total} módulos`}
                  />
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
