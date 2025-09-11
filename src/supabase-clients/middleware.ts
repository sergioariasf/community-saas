import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';
import { match } from 'path-to-regexp';

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // IMPORTANT: Avoid writing any logic between createServerClient and
  // supabase.auth.getUser(). A simple mistake could make it very hard to debug
  // issues with users being randomly logged out.

  // Temporarily disable dashboard protection while debugging auth issues
  const protectedPages = ['/private-item'];
  const currentPath = request.nextUrl.pathname;

  console.log('Middleware - Checking path:', currentPath);

  const {
    data: { user },
    error
  } = await supabase.auth.getUser();

  console.log('Middleware - User check result:', {
    user: user?.email || 'No user',
    error: error?.message || 'No error'
  });

  // Check if current page is protected
  const isProtectedPage = protectedPages.some((page) => {
    const matcher = match(page);
    return matcher(currentPath);
  });

  console.log('Middleware - Is protected page:', isProtectedPage);

  // if user doesn't exist and the page is protected, redirect to login
  if (!user && isProtectedPage) {
    console.log('Middleware - Redirecting to login - no user for protected page');
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    return NextResponse.redirect(url);
  }

  if (user && isProtectedPage) {
    console.log('Middleware - Allowing access to protected page for user:', user.email);
  }

  // IMPORTANT: You *must* return the supabaseResponse object as it is. If you're
  // creating a new response object with NextResponse.next() make sure to:
  // 1. Pass the request in it, like so:
  //    const myNewResponse = NextResponse.next({ request })
  // 2. Copy over the cookies, like so:
  //    myNewResponse.cookies.setAll(supabaseResponse.cookies.getAll())
  // 3. Change the myNewResponse object to fit your needs, but avoid changing
  //    the cookies!
  // 4. Finally:
  //    return myNewResponse
  // If this is not done, you may be causing the browser and server to go out
  // of sync and terminate the user's session prematurely!

  return supabaseResponse;
}
