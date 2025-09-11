'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { createClient } from '@/supabase-clients/client';
import type { Session } from '@supabase/supabase-js';

export default function DebugAuthPage() {
  const searchParams = useSearchParams();
  const [logs, setLogs] = useState<string[]>([]);
  const [session, setSession] = useState<Session | null>(null);
  
  const addLog = (message: string) => {
    setLogs(prev => [...prev, `${new Date().toISOString()}: ${message}`]);
  };

  useEffect(() => {
    const debugAuth = async () => {
      addLog('Starting auth debug...');
      
      // Check URL parameters
      const code = searchParams.get('code');
      const error = searchParams.get('error');
      const state = searchParams.get('state');
      
      addLog(`URL Code: ${code ? 'PRESENT' : 'MISSING'}`);
      addLog(`URL Error: ${error || 'NONE'}`);
      addLog(`URL State: ${state || 'NONE'}`);
      
      // Check current session
      try {
        const supabase = createClient();
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        addLog(`Current session: ${session ? 'LOGGED IN' : 'NOT LOGGED IN'}`);
        if (session) {
          addLog(`User: ${session.user.email}`);
          addLog(`Provider: ${session.user.app_metadata.provider}`);
        }
        if (sessionError) {
          addLog(`Session error: ${sessionError.message}`);
        }
        
        setSession(session);
        
        // Check environment variables
        addLog(`SUPABASE_URL: ${process.env.NEXT_PUBLIC_SUPABASE_URL ? 'SET' : 'MISSING'}`);
        addLog(`SUPABASE_ANON_KEY: ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'SET' : 'MISSING'}`);
        
        // If we have a code, try to process it
        if (code && !session) {
          addLog('Attempting to exchange code for session...');
          
          try {
            const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
            
            if (exchangeError) {
              addLog(`Exchange error: ${exchangeError.message}`);
              addLog(`Exchange error details: ${JSON.stringify(exchangeError)}`);
            } else {
              addLog('Code exchange successful!');
              addLog(`New session user: ${data.session?.user.email}`);
              setSession(data.session);
            }
          } catch (err) {
            addLog(`Exchange exception: ${err}`);
          }
        }
        
      } catch (err) {
        addLog(`General error: ${err}`);
      }
    };

    debugAuth();
  }, [searchParams]);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-4">Auth Debug Info</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <h2 className="text-xl font-semibold mb-4">Debug Logs</h2>
          <div className="bg-gray-100 p-4 rounded-lg h-96 overflow-y-auto">
            {logs.map((log, index) => (
              <div key={index} className="text-sm font-mono mb-1">
                {log}
              </div>
            ))}
          </div>
        </div>
        
        <div>
          <h2 className="text-xl font-semibold mb-4">URL Parameters</h2>
          <div className="bg-blue-50 p-4 rounded-lg">
            {Array.from(searchParams.entries()).map(([key, value]) => (
              <div key={key} className="mb-2">
                <strong>{key}:</strong> <span className="break-all">{value}</span>
              </div>
            ))}
          </div>
          
          <h2 className="text-xl font-semibold mb-4 mt-6">Current Session</h2>
          <div className="bg-green-50 p-4 rounded-lg">
            <pre className="text-xs overflow-auto">
              {JSON.stringify(session, null, 2)}
            </pre>
          </div>
        </div>
      </div>
      
      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-4">Actions</h2>
        <div className="flex gap-4">
          <button
            onClick={() => window.location.href = '/login'}
            className="bg-blue-500 text-white px-4 py-2 rounded"
          >
            Go to Login
          </button>
          <button
            onClick={() => window.location.href = '/dashboard'}
            className="bg-green-500 text-white px-4 py-2 rounded"
          >
            Go to Dashboard
          </button>
          <button
            onClick={() => {
              setLogs([]);
              window.location.reload();
            }}
            className="bg-gray-500 text-white px-4 py-2 rounded"
          >
            Refresh Debug
          </button>
        </div>
      </div>
    </div>
  );
}