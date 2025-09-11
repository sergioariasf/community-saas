import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export default async function DashboardTestPage() {
  const cookieStore = await cookies();
  
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: { [key: string]: unknown }) {
          // Cannot set cookies in server component
        },
        remove(name: string, options: { [key: string]: unknown }) {
          // Cannot remove cookies in server component  
        },
      },
    }
  );

  const { data: { user }, error } = await supabase.auth.getUser();
  
  if (!user) {
    redirect('/login');
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-4">Dashboard Test</h1>
      
      <div className="bg-green-100 p-4 rounded-lg mb-4">
        <h2 className="font-semibold text-green-800">✅ Authentication Working!</h2>
        <p><strong>User:</strong> {user.email}</p>
        <p><strong>Provider:</strong> {user.app_metadata?.provider}</p>
      </div>

      <div className="bg-blue-50 p-4 rounded-lg">
        <h3 className="font-semibold mb-2">User Details:</h3>
        <pre className="text-xs overflow-auto">
          {JSON.stringify(user, null, 2)}
        </pre>
      </div>
      
      <div className="mt-6">
        <a 
          href="/dashboard" 
          className="bg-blue-500 text-white px-4 py-2 rounded mr-4"
        >
          Go to Main Dashboard
        </a>
        <a 
          href="/logout" 
          className="bg-red-500 text-white px-4 py-2 rounded"
        >
          Logout
        </a>
      </div>
    </div>
  );
}