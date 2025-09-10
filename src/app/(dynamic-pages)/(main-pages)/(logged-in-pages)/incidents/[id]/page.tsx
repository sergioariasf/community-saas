import { Suspense } from 'react';

interface IncidentDetailPageProps {
  params: Promise<{ id: string; }>;
}

async function ClientPage({ params }: IncidentDetailPageProps) {
  const { id } = await params;
  
  const { default: ClientComponent } = await import('./ClientPage');
  
  return <ClientComponent incidentId={id} />;
}

export default function IncidentDetailPage({ params }: IncidentDetailPageProps) {
  return (
    <Suspense fallback={<div>Cargando incidencia...</div>}>
      <ClientPage params={params} />
    </Suspense>
  );
}