import { createClient } from '@/lib/supabase/server';
import ProgressBar from '@/components/ProgressBar';

export default async function AdminProgresoPage() {
  const supabase = await createClient();

  const [
    { data: users },
    { data: materias },
    { data: todosModulos },
    { data: todosProgresos },
    { data: todosIntentos },
  ] = await Promise.all([
    supabase.from('users').select('id, nombre, email, grado').eq('rol', 'student').order('nombre'),
    supabase.from('materias').select('id, nombre, color').eq('activa', true).order('nombre'),
    supabase.from('modulos').select('id, materia_id').eq('activo', true),
    supabase.from('progreso').select('user_id, modulo_id, completado').eq('completado', true),
    supabase.from('intentos_banco').select('user_id, correcta'),
  ]);

  const modulosPorMateria = new Map<string, string[]>();
  for (const mod of todosModulos ?? []) {
    const arr = modulosPorMateria.get(mod.materia_id) ?? [];
    arr.push(mod.id);
    modulosPorMateria.set(mod.materia_id, arr);
  }

  const completadosPorUser = new Map<string, Set<string>>();
  for (const p of todosProgresos ?? []) {
    const s = completadosPorUser.get(p.user_id) ?? new Set<string>();
    s.add(p.modulo_id);
    completadosPorUser.set(p.user_id, s);
  }

  const intentosPorUser = new Map<string, { total: number; correctas: number }>();
  for (const i of todosIntentos ?? []) {
    const prev = intentosPorUser.get(i.user_id) ?? { total: 0, correctas: 0 };
    intentosPorUser.set(i.user_id, {
      total: prev.total + 1,
      correctas: prev.correctas + (i.correcta ? 1 : 0),
    });
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl p-5 text-center">
          <p className="text-3xl font-bold text-navy">{users?.length ?? 0}</p>
          <p className="text-xs text-gray-500 mt-1">Estudiantes registrados</p>
        </div>
        <div className="bg-white rounded-xl p-5 text-center">
          <p className="text-3xl font-bold text-navy">{todosProgresos?.length ?? 0}</p>
          <p className="text-xs text-gray-500 mt-1">Módulos completados (total)</p>
        </div>
        <div className="bg-white rounded-xl p-5 text-center">
          <p className="text-3xl font-bold text-navy">{todosIntentos?.length ?? 0}</p>
          <p className="text-xs text-gray-500 mt-1">Intentos en banco</p>
        </div>
      </div>

      <div className="bg-white rounded-xl overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="text-base font-semibold text-gray-900">Progreso por estudiante</h2>
        </div>
        {(!users || users.length === 0) ? (
          <div className="px-6 py-8 text-center">
            <p className="text-sm text-gray-400">No hay estudiantes registrados aún.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {users.map((u) => {
              const completados = completadosPorUser.get(u.id) ?? new Set<string>();
              const totalModulos = todosModulos?.length ?? 0;
              const pct = totalModulos > 0
                ? Math.round((completados.size / totalModulos) * 100)
                : 0;
              const intentos = intentosPorUser.get(u.id);
              const bancoPct = intentos && intentos.total > 0
                ? Math.round((intentos.correctas / intentos.total) * 100)
                : null;

              return (
                <div key={u.id} className="px-6 py-4">
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{u.nombre}</p>
                      <p className="text-xs text-gray-400">{u.email}</p>
                      {u.grado && <p className="text-xs text-gray-400">{u.grado}</p>}
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-xs text-gray-500">
                        {completados.size}/{totalModulos} módulos
                      </p>
                      {bancoPct !== null && (
                        <p className="text-xs text-gray-500">
                          Banco: {bancoPct}% ({intentos?.total} intentos)
                        </p>
                      )}
                    </div>
                  </div>

                  <ProgressBar value={pct} label="Progreso general" />

                  {(materias ?? []).length > 0 && (
                    <div className="mt-3 grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {(materias ?? []).map((m) => {
                        const modsMateria = modulosPorMateria.get(m.id) ?? [];
                        const done = modsMateria.filter((id) => completados.has(id)).length;
                        const total = modsMateria.length;
                        const mpct = total > 0 ? Math.round((done / total) * 100) : 0;
                        return (
                          <div key={m.id} className="text-xs">
                            <div className="flex items-center gap-1.5 mb-1">
                              <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: m.color }} />
                              <span className="text-gray-600 truncate">{m.nombre}</span>
                              <span className="text-gray-400 ml-auto shrink-0">{mpct}%</span>
                            </div>
                            <div className="h-1 bg-gray-100 rounded-full overflow-hidden">
                              <div
                                className="h-full rounded-full"
                                style={{ width: `${mpct}%`, backgroundColor: m.color }}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
