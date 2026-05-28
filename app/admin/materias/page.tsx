import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';

async function crearMateria(formData: FormData) {
  'use server';
  const supabase = await createClient();
  const { error } = await supabase.from('materias').insert({
    nombre: formData.get('nombre') as string,
    descripcion: (formData.get('descripcion') as string) || null,
    grado: (formData.get('grado') as string) || null,
    color: (formData.get('color') as string) || '#2F80ED',
  });
  if (!error) revalidatePath('/admin/materias');
}

async function toggleMateria(id: string, activa: boolean) {
  'use server';
  const supabase = await createClient();
  await supabase.from('materias').update({ activa: !activa }).eq('id', id);
  revalidatePath('/admin/materias');
}

export default async function AdminMateriasPage() {
  const supabase = await createClient();
  const { data: materias } = await supabase
    .from('materias')
    .select('*')
    .order('created_at', { ascending: false });

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      {/* Formulario nuevo */}
      <div className="bg-white rounded-xl p-6">
        <h2 className="text-base font-semibold text-gray-900 mb-5">Nueva materia</h2>
        <form action={crearMateria} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="label">Nombre *</label>
              <input name="nombre" required placeholder="Ej: Matemáticas" className="input-field" />
            </div>
            <div>
              <label className="label">Grado</label>
              <select name="grado" className="input-field">
                <option value="">Sin especificar</option>
                {['6°','7°','8°','9°','10°','11°'].map((g) => (
                  <option key={g} value={g}>{g}</option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <label className="label">Descripción</label>
            <textarea
              name="descripcion"
              rows={2}
              placeholder="Descripción breve de la materia"
              className="input-field resize-none"
            />
          </div>
          <div>
            <label className="label">Color de identificación</label>
            <div className="flex items-center gap-3">
              <input name="color" type="color" defaultValue="#2F80ED" className="w-10 h-10 rounded cursor-pointer border border-gray-200" />
              <span className="text-xs text-gray-500">Se usa para identificar la materia visualmente.</span>
            </div>
          </div>
          <div className="pt-2">
            <button type="submit" className="btn-primary">
              Crear materia
            </button>
          </div>
        </form>
      </div>

      {/* Lista */}
      <div className="bg-white rounded-xl overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="text-base font-semibold text-gray-900">Materias creadas</h2>
        </div>
        {(!materias || materias.length === 0) ? (
          <div className="px-6 py-8 text-center">
            <p className="text-sm text-gray-400">No hay materias aún.</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider">
              <tr>
                <th className="px-6 py-3 text-left">Nombre</th>
                <th className="px-6 py-3 text-left">Grado</th>
                <th className="px-6 py-3 text-left">Estado</th>
                <th className="px-6 py-3 text-left">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {materias.map((m) => (
                <tr key={m.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: m.color }} />
                      <span className="font-medium text-gray-900">{m.nombre}</span>
                    </div>
                    {m.descripcion && (
                      <p className="text-xs text-gray-400 mt-0.5 pl-4 truncate max-w-xs">{m.descripcion}</p>
                    )}
                  </td>
                  <td className="px-6 py-4 text-gray-600">{m.grado ?? '—'}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                      m.activa ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-500'
                    }`}>
                      {m.activa ? 'Activa' : 'Inactiva'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <form action={toggleMateria.bind(null, m.id, m.activa)}>
                      <button type="submit" className="text-xs text-electric hover:underline">
                        {m.activa ? 'Desactivar' : 'Activar'}
                      </button>
                    </form>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
