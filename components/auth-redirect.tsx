'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';

export function AuthRedirect() {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Check if user is authenticated
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/auth/check', {
          method: 'GET',
          credentials: 'include'
        });
        
        if (response.ok) {
          // User is authenticated
          const pathWithoutLocale = pathname.replace(/^\/(?:en|tw)/, '') || '/';
          
          // Redirect from auth pages and home to dashboard
          if (pathWithoutLocale === '/' || pathWithoutLocale === '/sign-in' || pathWithoutLocale === '/signup') {
            const locale = pathname.match(/^\/(en|tw)/)?.[1] || 'en';
            router.replace(`/${locale}/dashboard`);
          }
        }
      } catch (error) {
        // User is not authenticated, do nothing
      }
    };

    checkAuth();
  }, [pathname, router]);

  return null;
}