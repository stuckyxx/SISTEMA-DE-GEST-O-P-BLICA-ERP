/**
 * Hook React para obter o contexto da API baseado na URL atual.
 * Usa React Router para detectar automaticamente se estamos no contexto
 * Admin, Cliente ou Landing.
 */

import { useLocation } from 'react-router-dom';
import { detectApiContext, getApiConfig, type ApiContext, type ApiConfig } from '../services/middleware/apiContext';

/**
 * Hook que retorna o contexto e configuração da API baseado na URL atual.
 * 
 * @returns Objeto com apiContext e apiConfig
 */
export function useApiContext(): { apiContext: ApiContext; apiConfig: ApiConfig } {
  const location = useLocation();
  
  // Para HashRouter, location.pathname já contém o path sem o hash
  // location.hash contém o hash completo incluindo o #
  // Usamos location.pathname que funciona tanto para HashRouter quanto BrowserRouter
  const pathname = location.pathname || location.hash.replace(/^#/, '');
  
  const apiContext = detectApiContext(pathname);
  const apiConfig = getApiConfig(apiContext);
  
  return { apiContext, apiConfig };
}
