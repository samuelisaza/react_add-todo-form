export interface User {
  id: string;
  email: string;
  nombre: string;
  grado: string | null;
  rol: 'student' | 'admin';
  created_at: string;
  updated_at: string;
}

export interface Materia {
  id: string;
  nombre: string;
  descripcion: string | null;
  grado: string | null;
  color: string;
  activa: boolean;
  created_at: string;
}

export interface Modulo {
  id: string;
  materia_id: string;
  tipo: 'video' | 'resumen' | 'taller' | 'banco';
  titulo: string;
  contenido_url: string | null;
  contenido_texto: string | null;
  orden: number;
  periodo: 1 | 2 | 3 | 4;
  activo: boolean;
  created_at: string;
}

export interface Pregunta {
  id: string;
  materia_id: string;
  periodo: 1 | 2 | 3 | 4 | null;
  enunciado: string;
  opcion_a: string;
  opcion_b: string;
  opcion_c: string;
  opcion_d: string;
  correcta: 'a' | 'b' | 'c' | 'd';
  explicacion: string | null;
  created_at: string;
}

export interface Progreso {
  id: string;
  user_id: string;
  modulo_id: string;
  completado: boolean;
  fecha: string;
}

export interface IntentosBanco {
  id: string;
  user_id: string;
  pregunta_id: string;
  respuesta: 'a' | 'b' | 'c' | 'd';
  correcta: boolean;
  fecha: string;
}

export interface MateriaConProgreso extends Materia {
  total_modulos: number;
  modulos_completados: number;
  porcentaje: number;
}
