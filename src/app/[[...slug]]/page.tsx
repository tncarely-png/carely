'use client';

// Catch-all route — delegates everything to the main page.tsx SPA router.
// This ensures paths like /superadmin, /pricing, etc. all render the app
// instead of returning 404.
import Home from './page';

export default function CatchAll() {
  return <Home />;
}
