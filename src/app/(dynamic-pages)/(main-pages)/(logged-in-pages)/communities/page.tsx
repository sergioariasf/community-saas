import { getAllCommunities } from '@/data/anon/communities';
import CommunitiesClientPage from './ClientPage';

export const dynamic = 'force-dynamic';

export default async function CommunitiesPage() {
  const communities = await getAllCommunities();
  return <CommunitiesClientPage communities={communities} />;
}