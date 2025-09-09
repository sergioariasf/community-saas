import { getCommunity } from '@/data/anon/communities';
import { notFound } from 'next/navigation';
import { ClientPage } from './ClientPage';

export default async function EditCommunityPage(props: {
  params: Promise<{
    id: string;
  }>;
}) {
  const params = await props.params;
  const { id } = params;

  try {
    const community = await getCommunity(id);
    
    return (
      <div className="container mx-auto py-8">
        <ClientPage community={community} />
      </div>
    );
  } catch (error) {
    return notFound();
  }
}