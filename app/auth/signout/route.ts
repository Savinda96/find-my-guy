import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const cookieStore = cookies();
  const supabase = await createClient();

  await supabase.auth.signOut();

  return NextResponse.redirect(new URL('/auth', request.url), {
    status: 302,
  });
} 