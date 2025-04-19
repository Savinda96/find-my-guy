import { createClient } from '@/utils/supabase/server';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // If user is not signed in and the current path is not /auth
  // redirect the user to /auth
  if (!user && request.nextUrl.pathname !== '/auth') {
    return NextResponse.redirect(new URL('/auth/signin', request.url));
  }

  // If user is signed in and the current path is /auth
  // redirect the user to /
  if (user && request.nextUrl.pathname === '/auth') {
    return NextResponse.redirect(new URL('/', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
