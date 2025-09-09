'use client';

import { createBrowserClient } from '@supabase/ssr';

export function createClient() {
  // Use hardcoded values to bypass environment variable issues in Vercel
  const supabaseUrl = 'https://vhybocthkbupgedovovj.supabase.co';
  const supabaseKey = [
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9',
    'eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZoeWJvY3Roa2J1cGdlZG92b3ZqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTczNzk4MjAsImV4cCI6MjA3Mjk1NTgyMH0',
    'vbsKRZEv8woCY-rGhK1zRtty7iGkrMj35P1kk8xuGu8'
  ].join('.');

  return createBrowserClient(
    supabaseUrl,
    supabaseKey
  );
}
