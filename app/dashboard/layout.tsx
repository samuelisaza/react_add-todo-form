import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const { data: userData } = await supabase
    .from('users')
    .select('nombre, grado, rol')
    .eq('id', user.id)
    .single();

  const nombre = userData?.nombre ?? user.email ?? 'Estudiante';
  const isAdmin = userData?.rol === 'admin';

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar userName={nombre} userGrade={userData?.grado} isAdmin={isAdmin} />
      <div className="flex-1 flex flex-col min-w-0">
        <Header userName={nombre} userGrade={userData?.grado} />
        <main className="flex-1 p-6 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
