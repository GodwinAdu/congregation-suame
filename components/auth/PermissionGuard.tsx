'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { currentUser } from '@/lib/helpers/session';
import { checkPermission } from '@/lib/helpers/permission-check';
import { Loader2 } from 'lucide-react';

interface PermissionGuardProps {
  children: React.ReactNode;
  requiredPermission?: string;
  fallbackRoute?: string;
}

export default function PermissionGuard({ 
  children, 
  requiredPermission,
  fallbackRoute = '/dashboard/publisher' 
}: PermissionGuardProps) {
  const router = useRouter();
  const [hasAccess, setHasAccess] = useState<boolean | null>(null);

  useEffect(() => {
    async function verifyPermission() {
      try {
        const user = await currentUser();
        
        if (!user?._id) {
          setHasAccess(false);
          router.push('/sign-in');
          return;
        }

        if (!requiredPermission) {
          setHasAccess(true);
          return;
        }

        const currentPath = window.location.pathname;
        const permitted = await checkPermission(currentPath);
        setHasAccess(permitted);
        
        if (!permitted) {
          router.push(fallbackRoute);
        }
      } catch (error) {
        console.error('Permission verification failed:', error);
        setHasAccess(false);
        router.push(fallbackRoute);
      }
    }

    verifyPermission();
  }, [requiredPermission, router, fallbackRoute]);

  if (hasAccess === null) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!hasAccess) {
    return null;
  }

  return <>{children}</>;
}