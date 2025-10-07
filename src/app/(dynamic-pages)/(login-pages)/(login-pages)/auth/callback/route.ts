import { createServerClient } from '@supabase/ssr';
import { createClient } from '@supabase/supabase-js';
import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const next = requestUrl.searchParams.get('next');
  const invitationToken = requestUrl.searchParams.get('invitation_token');

  console.log('Auth callback - Code received:', code ? 'YES' : 'NO');
  console.log('Auth callback - Next param:', next);
  console.log('Auth callback - Invitation token:', invitationToken ? 'YES' : 'NO');

  if (code) {
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
            try {
              cookieStore.set({ name, value, ...options });
            } catch (error) {
              // Handle error (cookies can only be set in Server Actions/Route Handlers)
            }
          },
          remove(name: string, options: { [key: string]: unknown }) {
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

      // Si hay un token de invitación, procesar la aceptación
      if (invitationToken && data.session?.user) {
        try {
          console.log('Auth callback - Processing invitation...');

          // Crear cliente admin para bypass RLS
          const supabaseAdmin = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!,
            {
              auth: {
                autoRefreshToken: false,
                persistSession: false
              }
            }
          );

          // Obtener la invitación
          const { data: invitation, error: invError } = await supabaseAdmin
            .from('user_invitations')
            .select('*')
            .eq('token', invitationToken)
            .eq('status', 'pending')
            .maybeSingle();

          if (!invError && invitation) {
            console.log('Auth callback - Found invitation for:', invitation.email);

            // Crear entrada en users si no existe (con admin client para bypass RLS)
            const { error: userInsertError } = await supabaseAdmin
              .from('users')
              .upsert({
                id: data.session.user.id,
                email: data.session.user.email!,
                full_name: data.session.user.user_metadata?.full_name || data.session.user.email?.split('@')[0],
              }, {
                onConflict: 'id',
              });

            if (userInsertError) {
              console.error('Auth callback - Error creating user:', userInsertError);
            } else {
              console.log('Auth callback - User created/updated successfully');
            }

            // Crear role para el usuario (con admin client para bypass RLS)
            const { error: roleError } = await supabaseAdmin
              .from('user_roles')
              .insert({
                user_id: data.session.user.id,
                organization_id: invitation.organization_id,
                role: invitation.role,
                community_id: invitation.community_ids?.[0] || null,
              });

            if (roleError) {
              console.error('Auth callback - Error creating role:', roleError);
            } else {
              console.log('Auth callback - Role created successfully');

              // Marcar invitación como aceptada
              const { error: updateError } = await supabaseAdmin
                .from('user_invitations')
                .update({
                  status: 'accepted',
                  accepted_at: new Date().toISOString(),
                  accepted_by_user_id: data.session.user.id,
                })
                .eq('id', invitation.id);

              if (updateError) {
                console.error('Auth callback - Error updating invitation:', updateError);
              } else {
                console.log('Auth callback - Invitation accepted successfully');
              }
            }
          } else {
            console.log('Auth callback - Invitation not found or error:', invError);
          }
        } catch (invProcessError) {
          console.error('Auth callback - Error processing invitation:', invProcessError);
        }
      }

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
