import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { Button } from '@/components/ui/button';

export default async function Dashboard() {
  const cookieStore = cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
      },
    },
  );

  const { data: { session } } = await supabase.auth.getSession();

  if (!session) {
    redirect('/auth');
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="bg-black rounded-md p-1.5">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M14 5.5V3C14 1.89543 13.1046 1 12 1H4C2.89543 1 2 1.89543 2 3V13C2 14.1046 2.89543 15 4 15H12C13.1046 15 14 14.1046 14 13V10.5" stroke="white" strokeWidth="2" strokeLinecap="round"/>
                <path d="M6 8H13M13 8L10.5 5.5M13 8L10.5 10.5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <span className="font-semibold text-lg">FindMyGuy</span>
          </div>
          <form action="/auth/signout" method="post">
            <Button type="submit" variant="outline">
              Sign Out
            </Button>
          </form>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white shadow rounded-lg p-6">
          <h1 className="text-2xl font-bold mb-4">Welcome to Your Dashboard</h1>
          <p className="text-gray-600">
            This is a placeholder dashboard. You can start building your application's main interface here.
          </p>
          <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {/* Placeholder cards */}
            {[1, 2, 3].map((item) => (
              <div key={item} className="bg-gray-50 rounded-lg p-6">
                <h2 className="text-lg font-medium mb-2">Feature {item}</h2>
                <p className="text-gray-600">
                  This is a placeholder for a dashboard feature or widget.
                </p>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
} 