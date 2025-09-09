import { Suspense } from 'react';
import { T } from '@/components/ui/Typography';
import { getAllCommunities } from '@/data/anon/communities';
import { getAllUsers } from '@/data/anon/users';
import { EditUserForm } from './EditUserForm';
import { notFound } from 'next/navigation';

interface EditUserPageProps {
  params: {
    id: string;
  };
}

export default async function EditUserPage({ params }: EditUserPageProps) {
  return (
    <div className="space-y-8">
      <div>
        <T.H1>Editar Usuario</T.H1>
        <T.Subtle>
          Modifica los roles y permisos del usuario
        </T.Subtle>
      </div>

      <Suspense fallback={<div>Cargando formulario...</div>}>
        <EditUserPageContent userId={params.id} />
      </Suspense>
    </div>
  );
}

async function EditUserPageContent({ userId }: { userId: string }) {
  const [communities, users] = await Promise.all([
    getAllCommunities(),
    getAllUsers()
  ]);

  // Encontrar el usuario específico
  const user = users.find(u => u.id === userId);
  
  if (!user) {
    notFound();
  }

  return <EditUserForm user={user} communities={communities} />;
}