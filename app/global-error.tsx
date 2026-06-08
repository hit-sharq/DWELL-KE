'use client';

import { useEffect } from 'react';

export default function GlobalError({
  error,
}: {
  error: Error & { digest?: string };
}) {
  useEffect(() => {
    console.error('[Global Error]', error);
  }, [error]);

  return (
    <html lang="en">
      <body className="min-h-screen bg-slate-950 text-white flex items-center justify-center">
        <div className="max-w-md text-center space-y-4">
          <h1 className="text-3xl font-bold text-red-400">Something went wrong</h1>
          <p className="text-gray-400">
            {error.message || 'An unexpected error occurred. Please try again.'}
          </p>
          <p className="text-sm text-gray-500">Error digest: {error.digest || 'N/A'}</p>
        </div>
      </body>
    </html>
  );
}
