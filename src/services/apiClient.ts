/**
 * Cliente HTTP para a API. Usado por todas as requisições exceto POST /auth/login.
 * O interceptor de request adiciona Authorization: Bearer <token> (JWT obtido no login).
 * Em 401, limpa o token e chama onUnauthorized (ex.: logout).
 * 
 * IMPORTANTE: Usa middleware baseado em URL para detectar automaticamente o contexto
 * (Admin vs Cliente) e aplicar a configuração correta.
 */
import axios, { type AxiosError } from 'axios';
import { config } from '../config/env';
import { getCurrentApiContext, getCurrentApiConfig } from './middleware/apiContext';

const AUTH_TOKEN_KEY = 'erp_auth_token';
const AUTH_TENANT_KEY = 'erp_auth_tenant';

export function getStoredToken(tenantId?: string): string | null {
  try {
    const key = tenantId ? `${AUTH_TOKEN_KEY}_${tenantId}` : AUTH_TOKEN_KEY;
    return sessionStorage.getItem(key);
  } catch {
    return null;
  }
}

export function setStoredToken(token: string, tenantId?: string): void {
  try {
    const key = tenantId ? `${AUTH_TOKEN_KEY}_${tenantId}` : AUTH_TOKEN_KEY;
    sessionStorage.setItem(key, token);
    if (tenantId) sessionStorage.setItem(AUTH_TENANT_KEY, tenantId);
  } catch {
    // ignore
  }
}

export function clearStoredToken(tenantId?: string): void {
  try {
    if (tenantId) {
      sessionStorage.removeItem(`${AUTH_TOKEN_KEY}_${tenantId}`);
    } else {
      const t = sessionStorage.getItem(AUTH_TENANT_KEY);
      if (t) sessionStorage.removeItem(`${AUTH_TOKEN_KEY}_${t}`);
      sessionStorage.removeItem(AUTH_TENANT_KEY);
    }
    sessionStorage.removeItem(AUTH_TOKEN_KEY);
  } catch {
    // ignore
  }
}

let onUnauthorized: (() => void) | null = null;
export function setOnUnauthorized(cb: (() => void) | null) {
  onUnauthorized = cb;
}

/** Cliente API do banco do cliente: auth, usuarios, entidades, fornecedores, atas, etc. (doc: /docs/swagger/) */
// Base URL inicial será atualizada dinamicamente pelo interceptor baseado no contexto detectado
// IMPORTANTE: O baseURL inicial é apenas um placeholder; o interceptor sempre atualiza baseado na URL atual
export const apiClient = axios.create({
  baseURL: '', // Inicia vazio para forçar o interceptor a sempre definir o baseURL correto
  headers: { 'Content-Type': 'application/json' },
});

/** Cliente API Admin: clientes CRUD (doc: /apidoc/swagger/) */
export const adminApiClient = axios.create({
  baseURL: config.adminApiBaseUrl,
  headers: { 'Content-Type': 'application/json' },
});

// Interceptor para apiClient: usa middleware para detectar contexto e aplicar configuração
const attachAuthAndUpdateUrl = (req: import('axios').InternalAxiosRequestConfig) => {
  // Detecta contexto automaticamente baseado na URL atual
  const apiConfig = getCurrentApiConfig();
  
  // Aplica token baseado no contexto detectado
  if (apiConfig.tokenKey) {
    const token = getStoredToken(apiConfig.tokenKey);
    if (token) req.headers.Authorization = `Bearer ${token}`;
  }
  
  // IMPORTANTE: Sempre atualiza baseURL dinamicamente baseado no contexto detectado
  // Remove barra final se existir para evitar duplicação quando url começa com /
  const cleanBaseUrl = apiConfig.baseUrl.endsWith('/') ? apiConfig.baseUrl.slice(0, -1) : apiConfig.baseUrl;
  
  // Força atualização do baseURL (não apenas se diferente, mas sempre)
  req.baseURL = cleanBaseUrl;
  
  // Debug em desenvolvimento
  if (import.meta.env.DEV && req.url) {
    const context = getCurrentApiContext();
    const fullUrl = req.baseURL + (req.url.startsWith('/') ? req.url : '/' + req.url);
    console.log(`[apiClient] ${req.method?.toUpperCase()} ${fullUrl} (context: ${context.type}, tenant: ${context.tenantId || 'none'})`);
    console.log(`[apiClient] baseURL: "${req.baseURL}", url: "${req.url}", apiConfig.baseUrl: "${apiConfig.baseUrl}"`);
  }
  
  return req;
};

// Interceptor para adminApiClient: usa middleware para garantir contexto admin
const attachAuthAdmin = (req: import('axios').InternalAxiosRequestConfig) => {
  // Detecta contexto automaticamente baseado na URL atual
  const apiConfig = getCurrentApiConfig();
  const context = getCurrentApiContext();
  
  // Para adminApiClient, sempre usa token do 'master' independente do contexto detectado
  // Mas verifica se estamos realmente no contexto admin para debug
  const token = getStoredToken('master');
  if (token) req.headers.Authorization = `Bearer ${token}`;
  
  // Mantém URL fixa da API Admin
  if (req.baseURL !== config.adminApiBaseUrl) {
    req.baseURL = config.adminApiBaseUrl;
  }
  
  // Debug em desenvolvimento
  if (import.meta.env.DEV && req.url) {
    console.log(`[adminApiClient] ${req.method?.toUpperCase()} ${req.baseURL}${req.url} (context: ${context.type}, using master token)`);
  }
  
  return req;
};

const handleResponseError = (err: AxiosError<{ detail?: string | { msg?: string }[] }>) => {
  if (err.response?.status === 401) {
    clearStoredToken();
    if (typeof window !== 'undefined' && onUnauthorized) onUnauthorized();
  }
  
  // Tratamento específico para 404
  if (err.response?.status === 404) {
    const detail = err.response?.data?.detail;
    const message = typeof detail === 'string' ? detail : 'Recurso não encontrado';
    return Promise.reject(new Error(message));
  }
  
  const detail = err.response?.data?.detail;
  const message =
    typeof detail === 'string'
      ? detail
      : Array.isArray(detail)
        ? detail.map((d) => (d && typeof d === 'object' && 'msg' in d ? d.msg : String(d))).join(', ')
        : err.message;
  return Promise.reject(new Error(message || 'Erro de conexão com o servidor'));
};

apiClient.interceptors.request.use(attachAuthAndUpdateUrl);
apiClient.interceptors.response.use((res) => res, handleResponseError);

adminApiClient.interceptors.request.use(attachAuthAdmin);
adminApiClient.interceptors.response.use((res) => res, handleResponseError);

export default apiClient;
