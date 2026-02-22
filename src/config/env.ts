/**
 * Environment configuration for the ERP frontend.
 * Existem duas APIs no backend:
 * - API Admin: endpoints na raiz (/auth/login, /clientes/), doc Swagger em /apidoc/swagger/ — Painel Master.
 * - API do banco do cliente (doc: /docs/swagger/): auth, usuarios, entidades, fornecedores, atas, etc.
 */
interface ImportMetaEnv {
  DEV?: boolean;
  VITE_API_BASE_URL?: string;
  VITE_API_ADMIN_BASE_URL?: string;
}
const env = (import.meta as unknown as { env?: ImportMetaEnv }).env;
const VITE_API_BASE_URL = env?.VITE_API_BASE_URL;
const VITE_API_ADMIN_BASE_URL = env?.VITE_API_ADMIN_BASE_URL;

// Vite expõe import.meta.env.DEV como boolean para modo desenvolvimento
// Em desenvolvimento: usa proxy do Vite (/api e /api-admin) para evitar CORS
// Em produção: usa URL completa da API
const isDev = import.meta.env.DEV === true || import.meta.env.MODE === 'development';

// Fallback robusto para URLs da API
const defaultClientApi = '/api';
const defaultAdminApi = '/api-admin';

export const config = {
  /** API do banco do cliente: auth, usuarios, entidades, fornecedores, atas, contratos. Doc: /docs/swagger/ */
  apiBaseUrl: (VITE_API_BASE_URL || defaultClientApi).replace(/\/$/, ''),
  /** API Admin: clientes (CRUD). Doc: /apidoc/swagger/ */
  adminApiBaseUrl: (VITE_API_ADMIN_BASE_URL || defaultAdminApi).replace(/\/$/, ''),
} as const;

// Debug: log da configuração em desenvolvimento
if (import.meta.env.DEV) {
  console.log('[config] isDev:', isDev);
  console.log('[config] apiBaseUrl:', config.apiBaseUrl);
  console.log('[config] adminApiBaseUrl:', config.adminApiBaseUrl);
  console.log('[config] MODE:', import.meta.env.MODE);
  console.log('[config] DEV:', import.meta.env.DEV);
}
