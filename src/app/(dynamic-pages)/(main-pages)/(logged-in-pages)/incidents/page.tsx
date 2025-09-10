import { Suspense } from 'react';
import ClientPage from './ClientPage';

export default function IncidentsPage() {
  return (
    <Suspense fallback={<div>Cargando incidencias...</div>}>
      <ClientPage />
    </Suspense>
  );
}