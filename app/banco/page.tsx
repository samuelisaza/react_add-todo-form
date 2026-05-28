import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

export default async function BancoPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: materias } = await supabase
    .from('materias')
    .select('id, nombre, color')
    .eq('activa', true)
    .order('nombre');

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-lg font-semibold text-gray-900 mb-2">Banco de preguntas</h1>
      <p className="text-sm text-gray-500 mb-6">
        Selecciona una materia para practicar con preguntas de opción múltiple.
      </p>

      {(!materias || materias.length === 0) ? (
        <div className="bg-white rounded-xl p-10 text-center">
          <p className="text-sm text-gray-400">No hay preguntas disponibles aún.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {materias.map((m) => (
            <a key={m.id} href={`/banco/${m.id}`}>
              <div className="bg-white rounded-xl p-5 hover:shadow-md transition-shadow cursor-pointer flex items-center gap-4">
                <div
                  className="w-4 h-4 rounded-full shrink-0"
                  style={{ backgroundColor: m.color }}
                />
                <span className="text-sm font-medium text-gray-900">{m.nombre}</span>
              </div>
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
