import { createServerClient } from '@supabase/ssr';
import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const next = requestUrl.searchParams.get('next');

  console.log('Auth callback - Code received:', code ? 'YES' : 'NO');
  console.log('Auth callback - Next param:', next);

  if (code) {
    const cookieStore = cookies();
    
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value;
          },
          set(name: string, value: string, options: any) {
            try {
              cookieStore.set({ name, value, ...options });
            } catch (error) {
              // Handle error (cookies can only be set in Server Actions/Route Handlers)
            }
          },
          remove(name: string, options: any) {
            try {
              cookieStore.set({ name, value: '', ...options });
            } catch (error) {
              // Handle error
            }
          },
        },
      }
    );

    try {
      console.log('Auth callback - Exchanging code for session...');
      const { data, error } = await supabase.auth.exchangeCodeForSession(code);
      
      if (error) {
        console.error('Auth callback - Exchange failed:', error);
        return NextResponse.redirect(new URL('/login?error=auth_failed', requestUrl.origin));
      }
      
      console.log('Auth callback - Session created successfully:', data.session?.user?.email);
      
    } catch (error) {
      console.error('Auth callback - Exception during exchange:', error);
      return NextResponse.redirect(new URL('/login?error=auth_failed', requestUrl.origin));
    }
  }
  
  revalidatePath('/', 'layout');

  let redirectTo = new URL('/dashboard', requestUrl.origin);

  if (next) {
    try {
      const decodedNext = decodeURIComponent(next);
      redirectTo = new URL(decodedNext, requestUrl.origin);
    } catch (error) {
      console.error('Auth callback - Invalid next parameter:', error);
    }
  }
  
  console.log('Auth callback - Redirecting to:', redirectTo.toString());
  return NextResponse.redirect(redirectTo);
}
