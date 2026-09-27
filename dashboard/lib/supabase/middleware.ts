import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function updateSession(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder-project.supabase.co';
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-anon-key';

  const isConfigured = Boolean(
    supabaseUrl &&
    supabaseAnonKey &&
    !supabaseUrl.includes('placeholder') &&
    !supabaseUrl.includes('your-project-id') &&
    supabaseAnonKey !== 'placeholder-anon-key'
  );

  // In local preview/demo mode, allow navigating freely between all routes
  if (!isConfigured) {
    if (pathname === '/campany') {
      const url = request.nextUrl.clone();
      url.pathname = '/company';
      return NextResponse.redirect(url);
    }
    return supabaseResponse;
  }

  let user: any = null;
  let role = 'user';

  // 1. Try Supabase Auth if credentials configured
  if (isConfigured) {
    try {
      const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
        cookies: {
          getAll() {
            return request.cookies.getAll();
          },
          setAll(cookiesToSet: Array<{ name: string; value: string; options?: any }>) {
            cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
            supabaseResponse = NextResponse.next({
              request,
            });
            cookiesToSet.forEach(({ name, value, options }) =>
              supabaseResponse.cookies.set(name, value, options)
            );
          },
        },
      });

      const { data } = await supabase.auth.getUser();
      if (data?.user) {
        user = data.user;
        role = (user.user_metadata?.role as string) || 'user';
      }
    } catch (e) {
      // Fall through to fallback check
    }
  }

  // 2. Fallback store check (local cookie)
  if (!user) {
    const fallbackCookie = request.cookies.get('sb-fallback-user');
    if (fallbackCookie?.value) {
      try {
        const parsed = JSON.parse(decodeURIComponent(fallbackCookie.value));
        if (parsed?.id) {
          user = parsed;
          role = parsed.role || 'user';
        }
      } catch (e) {
        // invalid cookie
      }
    }
  }

  // Handle /campany alias
  if (pathname === '/campany') {
    const url = request.nextUrl.clone();
    url.pathname = '/company';
    return NextResponse.redirect(url);
  }

  const isProtectedPath =
    pathname.startsWith('/dashboard') ||
    pathname.startsWith('/user') ||
    pathname.startsWith('/company') ||
    pathname.startsWith('/cashier');

  // Protect routes
  if (isProtectedPath) {
    if (!user) {
      const url = request.nextUrl.clone();
      url.pathname = '/login';
      url.searchParams.set('redirect', pathname);
      return NextResponse.redirect(url);
    }

    if (
      (pathname.startsWith('/company') || pathname.startsWith('/dashboard/company')) &&
      role !== 'company'
    ) {
      const url = request.nextUrl.clone();
      url.pathname = role === 'cashier' ? '/cashier' : '/user';
      return NextResponse.redirect(url);
    }

    if (
      (pathname.startsWith('/cashier') || pathname.startsWith('/dashboard/cashier')) &&
      role !== 'cashier' &&
      role !== 'company'
    ) {
      const url = request.nextUrl.clone();
      url.pathname = '/user';
      return NextResponse.redirect(url);
    }
  }

  // Redirect authenticated users away from auth pages
  if (user && (pathname === '/login' || pathname === '/register')) {
    const url = request.nextUrl.clone();
    if (role === 'company') {
      url.pathname = '/company';
    } else if (role === 'cashier') {
      url.pathname = '/cashier';
    } else {
      url.pathname = '/user';
    }
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}
