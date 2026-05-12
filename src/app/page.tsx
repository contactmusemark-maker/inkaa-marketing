import { redirect } from 'next/navigation';

// The root "/" route serves the dashboard for authenticated users.
// Unauthenticated users are redirected to /sign-up-login by middleware.
// The public landing page is at /landing.
export default function RootPage() {
  // Dashboard is the default authenticated home
  return redirect('/dashboard');
}
