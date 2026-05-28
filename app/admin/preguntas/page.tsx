import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';

async function crearPregunta(formData: FormData) {
  'use server';
  const supabase = await createClient();
  await supabase.from('preguntas').insert({
    materia_id: formData.get('materia_id') as string,
    periodo: Number(formData.get('periodo')) || null,
    enunciado: formData.get('enunciado') as string,
    opcion_a: formData.get('opcion_a') as string,
    opcion_b: formData.get('opcion_b') as string,
    opcion_c: formData.get('opcion_c') as string,
    opcion_d: formData.get('opcion_d') as string,
    correcta: formData.get('correcta') as string,
    explicacion: (formData.get('explicacion') as string) || null,
  });
  revalidatePath('/admin/preguntas');
}

export default async function AdminPreguntasPage() {
  const supabase = await createClient();

  const [{ data: materias }, { data: preguntas }] = await Promise.all([
    supabase.from('materias').select('id, nombre').eq('activa', true).order('nombre'),
    supabase
      .from('preguntas')
      .select('*, materias(nombre)')
      .order('created_at', { ascending: false })
      .limit(50),
  ]);

  const opcionLabel: Record<string, string> = { a: 'A', b: 'B', c: 'C', d: 'D' };

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      {/* Formulario */}
      <div className="bg-white rounded-xl p-6">
        <h2 className="text-base font-semibold text-gray-900 mb-5">Nueva pregunta</h2>
        <form action={crearPregunta} className="space-y-4">
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
              <label className="label">Período</label>
              <select name="periodo" className="input-field">
                <option value="">Sin especificar</option>
                <option value="1">1° período</option>
                <option value="2">2° período</option>
                <option value="3">3° período</option>
                <option value="4">4° período</option>
              </select>
            </div>
          </div>

          <div>
            <label className="label">Enunciado de la pregunta *</label>
            <textarea
              name="enunciado"
              required
              rows={3}
              placeholder="Escribe aquí la pregunta…"
              className="input-field resize-none"
            />
          </div>

          <div className="space-y-3">
            <p className="label">Opciones de respuesta *</p>
            {['a', 'b', 'c', 'd'].map((op) => (
              <div key={op} className="flex items-center gap-3">
                <span className="w-6 h-6 rounded-full bg-gray-100 text-gray-600 text-xs font-semibold flex items-center justify-center shrink-0">
                  {op.toUpperCase()}
                </span>
                <input
                  name={`opcion_${op}`}
                  required
                  placeholder={`Opción ${op.toUpperCase()}`}
                  className="input-field"
                />
              </div>
            ))}
          </div>

          <div>
            <label className="label">Respuesta correcta *</label>
            <select name="correcta" required className="input-field">
              <option value="">Seleccionar respuesta</option>
              <option value="a">A</option>
              <option value="b">B</option>
              <option value="c">C</option>
              <option value="d">D</option>
            </select>
          </div>

          <div>
            <label className="label">Explicación de la respuesta</label>
            <textarea
              name="explicacion"
              rows={3}
              placeholder="Explica por qué esta es la respuesta correcta…"
              className="input-field resize-none"
            />
          </div>

          <div className="pt-2">
            <button type="submit" className="btn-primary">
              Guardar pregunta
            </button>
          </div>
        </form>
      </div>

      {/* Lista */}
      <div className="bg-white rounded-xl overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="text-base font-semibold text-gray-900">
            Preguntas en el banco ({preguntas?.length ?? 0})
          </h2>
        </div>
        {(!preguntas || preguntas.length === 0) ? (
          <div className="px-6 py-8 text-center">
            <p className="text-sm text-gray-400">No hay preguntas aún.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {preguntas.map((p) => (
              <div key={p.id} className="px-6 py-4">
                <div className="flex items-start justify-between gap-3 mb-2">
                  <p className="text-sm text-gray-900 font-medium">{p.enunciado}</p>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                      {(p.materias as { nombre: string } | null)?.nombre ?? '—'}
                    </span>
                    {p.periodo && (
                      <span className="text-xs bg-electric/10 text-electric px-2 py-0.5 rounded-full">
                        P{p.periodo}
                      </span>
                    )}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-1.5 text-xs text-gray-500">
                  {(['a','b','c','d'] as const).map((op) => (
                    <div key={op} className={`flex items-start gap-1.5 ${p.correcta === op ? 'text-green-700 font-medium' : ''}`}>
                      <span className={`shrink-0 w-4 h-4 rounded-full flex items-center justify-center text-xs ${
                        p.correcta === op ? 'bg-green-100' : 'bg-gray-100'
                      }`}>
                        {opcionLabel[op]}
                      </span>
                      {p[`opcion_${op}` as keyof typeof p] as string}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
