import axios from 'axios';
import { config } from '../../config/env';
import { setStoredToken } from '../api';
import type { TokenResponse } from '../../types/api';
import { detectApiContext, getApiConfig, getCurrentApiContext } from '../middleware/apiContext';

/**
 * Login: POST /auth/login com body JSON (backend espera json={"username","senha"}).
 * Retorna access_token (JWT). Demais requisições usam apiClient com Authorization: Bearer <token>.
 * Esta função é para a API do cliente (doc: /docs/swagger/).
 * IMPORTANTE: A API do cliente usa "senha" ao invés de "password" no body.
 * 
 * Usa middleware para detectar automaticamente o contexto baseado na URL atual,
 * mas também aceita tenantId explícito quando fornecido.
 */
export async function login(
  username: string,
  password: string,
  tenantId?: string
): Promise<{ token: string; user: { id: string; name: string; username: string; role: 'admin' | 'viewer' } }> {
  let url: string;
  
  // Se tenantId foi fornecido explicitamente, usa ele
  // Caso contrário, detecta automaticamente pela URL atual
  if (tenantId && tenantId !== 'master') {
    const context = { type: 'client' as const, tenantId, isSubdomain: /^[a-z0-9-]+$/i.test(tenantId) && !tenantId.includes('.') };
    const apiConfig = getApiConfig(context);
    url = `${apiConfig.baseUrl}/auth/login`;
  } else {
    // Detecta contexto automaticamente pela URL atual
    const currentContext = getCurrentApiContext();
    const apiConfig = getApiConfig(currentContext);
    url = `${apiConfig.baseUrl}/auth/login`;
    
    // Se detectou um tenantId da URL, usa ele
    if (currentContext.tenantId && !tenantId) {
      tenantId = currentContext.tenantId;
    }
  }

  // Debug em desenvolvimento
  if (import.meta.env.DEV) {
    console.log('[login] URL:', url);
    console.log('[login] tenantId:', tenantId);
    console.log('[login] Context:', getCurrentApiContext());
  }

  try {
    const res = await axios.post<TokenResponse>(
      url,
      { username, senha: password }, // API do cliente usa "senha" ao invés de "password"
      { headers: { 'Content-Type': 'application/json' } }
    );
    const token = res.data.access_token;
    setStoredToken(token, tenantId);
    return {
      token,
      user: {
        id: 'api-user',
        name: username,
        username,
        role: 'admin',
      },
    };
  } catch (e: unknown) {
    const err = e as { response?: { data?: { detail?: unknown } }; message?: string };
    const detail = err.response?.data?.detail;
    const msg =
      typeof detail === 'string'
        ? detail
        : detail != null
          ? JSON.stringify(detail)
          : err.message ?? 'Falha no login. Verifique usuário e senha.';
    throw new Error(msg);
  }
}

/**
 * Login para API Admin: POST /auth/login com body JSON (backend espera json={"username","password"}).
 * Retorna access_token (JWT). Usado pelo painel admin para gerenciar clientes.
 * Endpoints da API Admin estão na raiz do servidor (não em /apidoc/). Doc Swagger: /apidoc/swagger/
 */
export async function adminLogin(
  username: string,
  password: string,
  tenantId?: string
): Promise<{ token: string; user: { id: string; name: string; username: string; role: 'admin' | 'viewer' } }> {
  const url = `${config.adminApiBaseUrl}/auth/login`;

  // Debug: log da URL em desenvolvimento
  if (import.meta.env.DEV) {
    console.log('[adminLogin] URL:', url);
    console.log('[adminLogin] Base URL:', config.adminApiBaseUrl);
  }

  try {
    const res = await axios.post<TokenResponse>(
      url,
      { username, password },
      { headers: { 'Content-Type': 'application/json' } }
    );
    const token = res.data.access_token;
    setStoredToken(token, tenantId);
    return {
      token,
      user: {
        id: 'admin-user',
        name: username,
        username,
        role: 'admin',
      },
    };
  } catch (e: unknown) {
    const err = e as { 
      response?: { 
        status?: number;
        statusText?: string;
        data?: { detail?: unknown };
        config?: { url?: string };
      }; 
      message?: string;
      request?: unknown;
    };
    
    // Debug: log detalhado do erro em desenvolvimento
    if (import.meta.env.DEV) {
      console.error('[adminLogin] Erro completo:', {
        status: err.response?.status,
        statusText: err.response?.statusText,
        url: err.response?.config?.url || url,
        data: err.response?.data,
        message: err.message,
      });
    }
    
    const detail = err.response?.data?.detail;
    let msg = 'Falha no login. Verifique usuário e senha.';
    
    if (err.response?.status === 404) {
      msg = `Endpoint não encontrado (404). Verifique se a URL está correta: ${url}`;
    } else if (err.response?.status === 401) {
      msg = 'Credenciais inválidas. Verifique usuário e senha.';
    } else if (typeof detail === 'string') {
      msg = detail;
    } else if (detail != null) {
      msg = JSON.stringify(detail);
    } else if (err.message) {
      msg = err.message;
    }
    
    throw new Error(msg);
  }
}
