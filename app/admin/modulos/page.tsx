import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';

async function crearModulo(formData: FormData) {
  'use server';
  const supabase = await createClient();
  await supabase.from('modulos').insert({
    materia_id: formData.get('materia_id') as string,
    tipo: formData.get('tipo') as string,
    titulo: formData.get('titulo') as string,
    contenido_url: (formData.get('contenido_url') as string) || null,
    contenido_texto: (formData.get('contenido_texto') as string) || null,
    periodo: Number(formData.get('periodo')),
    orden: Number(formData.get('orden') ?? 0),
  });
  revalidatePath('/admin/modulos');
}

export default async function AdminModulosPage() {
  const supabase = await createClient();

  const [{ data: materias }, { data: modulos }] = await Promise.all([
    supabase.from('materias').select('id, nombre').eq('activa', true).order('nombre'),
    supabase
      .from('modulos')
      .select('*, materias(nombre)')
      .order('created_at', { ascending: false })
      .limit(50),
  ]);

  const tipoLabel: Record<string, string> = {
    video: 'Video',
    resumen: 'Resumen',
    taller: 'Taller',
    banco: 'Banco',
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      {/* Formulario */}
      <div className="bg-white rounded-xl p-6">
        <h2 className="text-base font-semibold text-gray-900 mb-5">Nuevo módulo</h2>
        <form action={crearModulo} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="label">Materia *</label>
              <select name="materia_id" required className="input-field">
                <option value="">Seleccionar materia</option>
                {(materias ?? []).map((m) => (
                  <option key={m.id} value={m.id}>{m.nombre}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">Tipo *</label>
              <select name="tipo" required className="input-field">
                <option value="">Seleccionar tipo</option>
                <option value="video">Video</option>
                <option value="resumen">Resumen</option>
                <option value="taller">Taller</option>
                <option value="banco">Banco de preguntas</option>
              </select>
            </div>
          </div>

          <div>
            <label className="label">Título *</label>
            <input name="titulo" required placeholder="Ej: Introducción a las ecuaciones" className="input-field" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="label">Período *</label>
              <select name="periodo" required className="input-field">
                <option value="">Seleccionar período</option>
                <option value="1">1° período</option>
                <option value="2">2° período</option>
                <option value="3">3° período</option>
                <option value="4">4° período</option>
              </select>
            </div>
            <div>
              <label className="label">Orden</label>
              <input name="orden" type="number" defaultValue={0} min={0} className="input-field" />
            </div>
          </div>

          <div>
            <label className="label">URL del contenido</label>
            <input
              name="contenido_url"
              type="url"
              placeholder="https://youtube.com/... o enlace al PDF"
              className="input-field"
            />
            <p className="text-xs text-gray-400 mt-1">
              Para videos: pega el enlace de YouTube. Para PDFs: enlace público de Drive o similar.
            </p>
          </div>

          <div>
            <label className="label">Contenido de texto (opcional)</label>
            <textarea
              name="contenido_texto"
              rows={4}
              placeholder="Descripción o instrucciones del módulo…"
              className="input-field resize-none"
            />
          </div>

          <div className="pt-2">
            <button type="submit" className="btn-primary">
              Crear módulo
            </button>
          </div>
        </form>
      </div>

      {/* Lista */}
      <div className="bg-white rounded-xl overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="text-base font-semibold text-gray-900">Módulos creados</h2>
        </div>
        {(!modulos || modulos.length === 0) ? (
          <div className="px-6 py-8 text-center">
            <p className="text-sm text-gray-400">No hay módulos aún.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {modulos.map((mod) => (
              <div key={mod.id} className="px-6 py-4 flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-medium text-gray-900 truncate">{mod.titulo}</span>
                    <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                      {tipoLabel[mod.tipo] ?? mod.tipo}
                    </span>
                    <span className="text-xs bg-electric/10 text-electric px-2 py-0.5 rounded-full">
                      P{mod.periodo}
                    </span>
                  </div>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {(mod.materias as { nombre: string } | null)?.nombre ?? '—'}
                  </p>
                  {mod.contenido_url && (
                    <a href={mod.contenido_url} target="_blank" rel="noopener noreferrer"
                      className="text-xs text-electric hover:underline mt-0.5 block truncate max-w-xs">
                      {mod.contenido_url}
                    </a>
                  )}
                </div>
                <span className={`text-xs shrink-0 px-2 py-0.5 rounded-full ${
                  mod.activo ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-500'
                }`}>
                  {mod.activo ? 'Activo' : 'Inactivo'}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
