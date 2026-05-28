-- ============================================================
-- Bridge Education — Schema completo para Supabase
-- Ejecutar en: Supabase Dashboard > SQL Editor
-- ============================================================

-- Extensiones
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- TABLAS
-- ============================================================

CREATE TABLE IF NOT EXISTS public.users (
  id          UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email       TEXT UNIQUE NOT NULL,
  nombre      TEXT NOT NULL,
  grado       TEXT,
  rol         TEXT NOT NULL DEFAULT 'student'
                CHECK (rol IN ('student', 'admin')),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.materias (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nombre      TEXT NOT NULL,
  descripcion TEXT,
  grado       TEXT,
  color       TEXT NOT NULL DEFAULT '#2F80ED',
  activa      BOOLEAN NOT NULL DEFAULT true,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.modulos (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  materia_id      UUID NOT NULL REFERENCES public.materias(id) ON DELETE CASCADE,
  tipo            TEXT NOT NULL
                    CHECK (tipo IN ('video', 'resumen', 'taller', 'banco')),
  titulo          TEXT NOT NULL,
  contenido_url   TEXT,
  contenido_texto TEXT,
  orden           INTEGER NOT NULL DEFAULT 0,
  periodo         INTEGER NOT NULL CHECK (periodo IN (1, 2, 3, 4)),
  activo          BOOLEAN NOT NULL DEFAULT true,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.preguntas (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  materia_id  UUID NOT NULL REFERENCES public.materias(id) ON DELETE CASCADE,
  periodo     INTEGER CHECK (periodo IN (1, 2, 3, 4)),
  enunciado   TEXT NOT NULL,
  opcion_a    TEXT NOT NULL,
  opcion_b    TEXT NOT NULL,
  opcion_c    TEXT NOT NULL,
  opcion_d    TEXT NOT NULL,
  correcta    TEXT NOT NULL CHECK (correcta IN ('a', 'b', 'c', 'd')),
  explicacion TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.progreso (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  modulo_id   UUID NOT NULL REFERENCES public.modulos(id) ON DELETE CASCADE,
  completado  BOOLEAN NOT NULL DEFAULT false,
  fecha       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, modulo_id)
);

CREATE TABLE IF NOT EXISTS public.intentos_banco (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id      UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  pregunta_id  UUID NOT NULL REFERENCES public.preguntas(id) ON DELETE CASCADE,
  respuesta    TEXT NOT NULL CHECK (respuesta IN ('a', 'b', 'c', 'd')),
  correcta     BOOLEAN NOT NULL,
  fecha        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- FUNCIÓN: sincronizar usuario al hacer login con OAuth
-- ============================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  admin_emails TEXT[] := string_to_array(
    COALESCE(current_setting('app.admin_emails', true), 'cristobal@cumbres.edu.co,samuel@cumbres.edu.co'),
    ','
  );
  user_rol TEXT;
BEGIN
  user_rol := CASE
    WHEN NEW.email = ANY(admin_emails) THEN 'admin'
    ELSE 'student'
  END;

  INSERT INTO public.users (id, email, nombre, rol)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    user_rol
  )
  ON CONFLICT (id) DO UPDATE SET
    nombre     = EXCLUDED.nombre,
    updated_at = NOW();

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

ALTER TABLE public.users          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.materias       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.modulos        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.preguntas      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.progreso       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.intentos_banco ENABLE ROW LEVEL SECURITY;

-- Función auxiliar para verificar rol admin (evita recursión en RLS)
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.users
    WHERE id = auth.uid() AND rol = 'admin'
  );
$$;

-- users
CREATE POLICY "usuarios_propios" ON public.users
  FOR SELECT USING (id = auth.uid() OR public.is_admin());

CREATE POLICY "usuarios_update_propio" ON public.users
  FOR UPDATE USING (id = auth.uid());

-- materias (todos los autenticados pueden leer)
CREATE POLICY "materias_lectura" ON public.materias
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "materias_admin" ON public.materias
  FOR ALL USING (public.is_admin());

-- modulos
CREATE POLICY "modulos_lectura" ON public.modulos
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "modulos_admin" ON public.modulos
  FOR ALL USING (public.is_admin());

-- preguntas
CREATE POLICY "preguntas_lectura" ON public.preguntas
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "preguntas_admin" ON public.preguntas
  FOR ALL USING (public.is_admin());

-- progreso
CREATE POLICY "progreso_propio" ON public.progreso
  FOR SELECT USING (user_id = auth.uid() OR public.is_admin());

CREATE POLICY "progreso_insert" ON public.progreso
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "progreso_update" ON public.progreso
  FOR UPDATE USING (user_id = auth.uid());

-- intentos_banco
CREATE POLICY "intentos_propio" ON public.intentos_banco
  FOR SELECT USING (user_id = auth.uid() OR public.is_admin());

CREATE POLICY "intentos_insert" ON public.intentos_banco
  FOR INSERT WITH CHECK (user_id = auth.uid());

-- ============================================================
-- DATOS DE EJEMPLO (opcional — borrar en producción)
-- ============================================================

INSERT INTO public.materias (nombre, descripcion, grado, color) VALUES
  ('Matemáticas', 'Álgebra, geometría y cálculo básico', '11°', '#2F80ED'),
  ('Física', 'Mecánica, termodinámica y electromagnetismo', '11°', '#0A1F44'),
  ('Química', 'Química orgánica e inorgánica', '11°', '#1B4F72'),
  ('Español', 'Comprensión lectora y producción textual', '11°', '#154360'),
  ('Inglés', 'Reading, writing and grammar', '11°', '#1A5276')
ON CONFLICT DO NOTHING;
