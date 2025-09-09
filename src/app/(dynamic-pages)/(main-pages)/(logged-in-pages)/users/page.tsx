import { Suspense } from 'react';
import { T } from '@/components/ui/Typography';
import { getAllUsers } from '@/data/anon/users';
import { UsersList } from './UsersList';

export default async function UsersPage() {
  return (
    <div className="space-y-8">
      <div>
        <T.H1>Gestión de Usuarios</T.H1>
        <T.Subtle>
          Administra usuarios y sus roles en el sistema
        </T.Subtle>
      </div>

      <Suspense fallback={<div>Cargando usuarios...</div>}>
        <UsersPageContent />
      </Suspense>
    </div>
  );
}

async function UsersPageContent() {
  const users = await getAllUsers();

  return <UsersList users={users} />;
}