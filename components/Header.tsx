'use client';

import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

interface HeaderProps {
  userName: string;
  userGrade?: string | null;
  title?: string;
}

export default function Header({ userName, userGrade, title }: HeaderProps) {
  const router = useRouter();
  const supabase = createClient();

  async function handleSignOut() {
    await supabase.auth.signOut();
    router.push('/login');
    router.refresh();
  }

  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? 'Buenos días' : hour < 18 ? 'Buenas tardes' : 'Buenas noches';

  return (
    <header className="h-16 bg-white border-b border-gray-100 flex items-center justify-between px-6 shrink-0">
      <div>
        {title ? (
          <h1 className="text-base font-semibold text-gray-900">{title}</h1>
        ) : (
          <p className="text-base text-gray-900">
            {greeting},{' '}
            <span className="font-semibold">{userName.split(' ')[0]}.</span>
          </p>
        )}
        {userGrade && !title && (
          <p className="text-xs text-gray-400">{userGrade}</p>
        )}
      </div>

      <button
        onClick={handleSignOut}
        className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 transition-colors"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
        </svg>
        Cerrar sesión
      </button>
    </header>
  );
}
