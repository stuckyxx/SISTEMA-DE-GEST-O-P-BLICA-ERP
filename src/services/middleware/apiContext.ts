/**
 * Middleware para detecção automática de contexto da API baseado na URL.
 * Detecta se estamos no contexto Admin, Cliente ou Landing e configura
 * automaticamente a API correta.
 */

export type ApiContextType = 'admin' | 'client' | 'landing';

export interface ApiContext {
  type: ApiContextType;
  tenantId: string | null;
  isSubdomain: boolean;
}

export interface ApiConfig {
  baseUrl: string;
  tokenKey: string;
  useAdminClient: boolean;
}

/**
 * Detecta o contexto da API baseado no pathname da URL.
 * 
 * @param pathname - Pathname da URL (ex: '/master-panel', '/pmportopi/dashboard', '/')
 * @returns Contexto detectado com tipo, tenantId e se é subdomínio
 */
export function detectApiContext(pathname: string): ApiContext {
  // Remove hash se presente (HashRouter usa #)
  const cleanPath = pathname.replace(/^#/, '').replace(/^\/+/, '/');
  
  // Contexto Admin: /master-panel
  if (cleanPath.startsWith('/master-panel')) {
    return { type: 'admin', tenantId: 'master', isSubdomain: false };
  }
  
  // Contexto Cliente: /:tenantId/*
  // Extrai o primeiro segmento da URL como tenantId
  const tenantMatch = cleanPath.match(/^\/([^/]+)/);
  if (tenantMatch && tenantMatch[1] !== 'master-panel') {
    const tenantId = tenantMatch[1];
    // Verifica se é um subdomínio válido (apenas letras, números e hífens)
    const isSubdomain = /^[a-z0-9-]+$/i.test(tenantId) && !tenantId.includes('.');
    return { type: 'client', tenantId, isSubdomain };
  }
  
  // Contexto Landing: / ou outras rotas não identificadas
  return { type: 'landing', tenantId: null, isSubdomain: false };
}

/**
 * Obtém a configuração da API baseada no contexto detectado.
 * 
 * @param context - Contexto detectado pela função detectApiContext()
 * @returns Configuração da API (URL base, chave do token, qual cliente usar)
 */
export function getApiConfig(context: ApiContext): ApiConfig {
  const isDev = import.meta.env.DEV === true || import.meta.env.MODE === 'development';
  
  if (context.type === 'admin') {
    // API Admin: sempre usa backgestao.pythonanywhere.com
    return {
      baseUrl: isDev ? '/api-admin' : 'https://backgestao.pythonanywhere.com',
      tokenKey: 'master',
      useAdminClient: true,
    };
  }
  
  if (context.type === 'client' && context.tenantId) {
    // API do Cliente: usa subdomínio específico se for subdomínio válido
    if (context.isSubdomain) {
      // Em dev: usa proxy /api-client/{tenantId}
      // Em prod: usa URL completa do subdomínio
      // Não adiciona barra final para que o axios combine corretamente com paths que começam com /
      const baseUrl = isDev 
        ? `/api-client/${context.tenantId}` 
        : `https://${context.tenantId}.pythonanywhere.com`;
      return {
        baseUrl,
        tokenKey: context.tenantId,
        useAdminClient: false,
      };
    }
    
    // Se não for subdomínio válido, usa URL padrão
    return {
      baseUrl: isDev ? '/api' : 'https://backgestao.pythonanywhere.com',
      tokenKey: context.tenantId,
      useAdminClient: false,
    };
  }
  
  // Landing ou contexto desconhecido: usa URL padrão
  return {
    baseUrl: isDev ? '/api' : 'https://backgestao.pythonanywhere.com',
    tokenKey: '',
    useAdminClient: false,
  };
}

/**
 * Obtém o contexto atual da API baseado na URL do navegador.
 * Útil para uso em interceptors do axios.
 */
export function getCurrentApiContext(): ApiContext {
  if (typeof window === 'undefined') {
    return { type: 'landing', tenantId: null, isSubdomain: false };
  }
  
  // Para HashRouter, usa window.location.hash (remove o # inicial)
  // Para BrowserRouter, usa window.location.pathname
  let pathname = window.location.hash;
  if (pathname) {
    // Remove o # inicial do hash
    pathname = pathname.replace(/^#/, '');
  } else {
    pathname = window.location.pathname;
  }
  
  return detectApiContext(pathname);
}

/**
 * Obtém a configuração da API atual baseada na URL do navegador.
 * Útil para uso em interceptors do axios.
 */
export function getCurrentApiConfig(): ApiConfig {
  const context = getCurrentApiContext();
  return getApiConfig(context);
}
