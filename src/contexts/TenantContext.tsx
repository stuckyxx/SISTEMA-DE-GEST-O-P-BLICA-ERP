import React, { createContext, useContext } from 'react';

interface TenantContextValue {
  tenantId: string | undefined;
  entidadeId: number | null;
}

const TenantContext = createContext<TenantContextValue | null>(null);

export function TenantProvider({
  tenantId,
  entidadeId = null,
  children,
}: {
  tenantId: string | undefined;
  entidadeId?: number | null;
  children: React.ReactNode;
}) {
  const value: TenantContextValue = { tenantId, entidadeId };
  return <TenantContext.Provider value={value}>{children}</TenantContext.Provider>;
}

export function useTenant(): TenantContextValue {
  const ctx = useContext(TenantContext);
  if (!ctx) throw new Error('useTenant must be used within TenantProvider');
  return ctx;
}

export function useTenantOptional(): TenantContextValue | null {
  return useContext(TenantContext);
}

/** Returns entidadeId; throws if not available (use when API is required). */
export function useEntidadeId(): number {
  const ctx = useContext(TenantContext);
  if (!ctx?.entidadeId) throw new Error('entidadeId não disponível');
  return ctx.entidadeId;
}
