'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function ProfileRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    let username = 'shadcn';
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('devtrack_current_user');
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          if (parsed.username) username = parsed.username;
        } catch (e) {}
      }
    }
    router.replace(`/u/${username}`);
  }, [router]);

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-400 font-mono text-xs">
      Redirecting to Profile...
    </div>
  );
}
