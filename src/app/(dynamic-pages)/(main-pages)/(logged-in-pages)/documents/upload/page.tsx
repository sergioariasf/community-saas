import { Suspense } from 'react';
import ClientPage from './ClientPage';

export default function DocumentUploadPage() {
  return (
    <Suspense fallback={<div>Cargando formulario...</div>}>
      <ClientPage />
    </Suspense>
  );
}