'use client';

import { useRole } from '@/lib/context/role-context';
import { useEffect, useState } from 'react';

export function usePermissions() {
  const { role, isLoading: roleLoading } = useRole();
  const [permissions, setPermissions] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    function loadPermissions() {
      if (roleLoading) return;
      
      try {
        if (!role?.permissions) {
          setLoading(false);
          return;
        }

        // Load all permissions from role
        setPermissions(role.permissions);
      } catch (error) {
        console.error('Error loading permissions:', error);
      } finally {
        setLoading(false);
      }
    }

    loadPermissions();
  }, [role, roleLoading]);

  const checkPermission = (permission: string): boolean => {
    return permissions[permission] || false;
  };

  return {
    role,
    permissions,
    loading: loading || roleLoading,
    checkPermission,
    hasPermission: (permission: string) => permissions[permission] || false
  };
}