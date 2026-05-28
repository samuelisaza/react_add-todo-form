import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';

export default async function MateriasLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect('/login');

  const { data: userData } = await supabase
    .from('users')
    .select('nombre, grado, rol')
    .eq('id', user.id)
    .single();

  const nombre = userData?.nombre ?? user.email ?? 'Estudiante';

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar
        userName={nombre}
        userGrade={userData?.grado}
        isAdmin={userData?.rol === 'admin'}
      />
      <div className="flex-1 flex flex-col min-w-0">
        <Header userName={nombre} userGrade={userData?.grado} title="Mis materias" />
        <main className="flex-1 p-6 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
