import { useMemo } from 'react';
import { useAuth } from './auth';

/** Headers for Phase 1 / v1 tenant-scoped APIs */
export function useSessionHeaders() {
  const { accessToken, user } = useAuth();
  return useMemo(
    () => ({
      token: accessToken || undefined,
      tenantId: user?.tenantId || undefined,
      branchId: user?.branchIds?.[0],
    }),
    [accessToken, user?.tenantId, user?.branchIds?.[0]],
  );
}
