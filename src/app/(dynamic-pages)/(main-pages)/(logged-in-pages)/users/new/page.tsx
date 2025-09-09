import { Suspense } from 'react';
import { T } from '@/components/ui/Typography';
import { getAllCommunities } from '@/data/anon/communities';
import { CreateUserForm } from './CreateUserForm';

export default async function NewUserPage() {
  return (
    <div className="space-y-8">
      <div>
        <T.H1>Crear Nuevo Usuario</T.H1>
        <T.Subtle>
          Crea un nuevo usuario y asigna sus roles en el sistema
        </T.Subtle>
      </div>

      <Suspense fallback={<div>Cargando formulario...</div>}>
        <CreateUserPageContent />
      </Suspense>
    </div>
  );
}

async function CreateUserPageContent() {
  const communities = await getAllCommunities();

  return <CreateUserForm communities={communities} />;
}