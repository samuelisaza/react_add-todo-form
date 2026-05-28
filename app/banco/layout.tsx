import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';

export default async function BancoLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');
  const { data: ud } = await supabase.from('users').select('nombre, grado, rol').eq('id', user.id).single();
  const nombre = ud?.nombre ?? user.email ?? 'Estudiante';
  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar userName={nombre} userGrade={ud?.grado} isAdmin={ud?.rol === 'admin'} />
      <div className="flex-1 flex flex-col min-w-0">
        <Header userName={nombre} userGrade={ud?.grado} title="Banco de preguntas" />
        <main className="flex-1 p-6 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
