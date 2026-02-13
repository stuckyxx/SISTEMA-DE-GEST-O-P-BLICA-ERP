import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '');
  const apiTarget = 'https://backgestao.pythonanywhere.com';
  const isDev = mode === 'development' || process.env.NODE_ENV !== 'production';
  
  // Configuração do proxy para subdomínios de clientes
  const proxyConfig: Record<string, any> = {
    // /api-admin deve vir antes de /api para evitar conflito
    '^/api-admin': {
      target: apiTarget,
      changeOrigin: true,
      secure: true,
      rewrite: (path: string) => path.replace(/^\/api-admin/, ''),
    },
  };
  
  // Proxy para subdomínios de clientes: /api-client/{subdomain}/* → https://{subdomain}.pythonanywhere.com/*
  // Deve vir antes de /api para evitar conflito
  const createClientProxy = (subdomain: string) => ({
    target: `https://${subdomain}.pythonanywhere.com`,
    changeOrigin: true,
    secure: true,
    rewrite: (path: string) => {
      // Remove /api-client/{subdomain} do início do path
      // Ex: /api-client/pmportopi/entidades/1 → /entidades/1
      // Ex: /api-client/pmportopi/entidades/ → /entidades/
      const prefix = `/api-client/${subdomain}`;
      if (path.startsWith(prefix)) {
        const rest = path.slice(prefix.length);
        // Garante que sempre começa com / (ou retorna / se vazio)
        if (!rest || rest === '/') {
          return '/';
        }
        return rest.startsWith('/') ? rest : `/${rest}`;
      }
      return path; // Se não começar com o prefixo, retorna como está
    },
  });

  // Adiciona proxy para subdomínios conhecidos (ordem específica antes do genérico)
  // IMPORTANTE: O padrão regex deve corresponder exatamente ao path
  const knownSubdomains = ['pmportopi', 'pmsaojoaobatista', 'pmolindanova'];
  knownSubdomains.forEach(subdomain => {
    // Usa padrão que captura tudo após /api-client/{subdomain}/
    // O padrão ^/api-client/{subdomain} captura qualquer path que comece com /api-client/{subdomain}
    // O $ no final garante que não capture paths mais longos, mas na verdade queremos capturar tudo
    // Então removemos o $ e usamos apenas ^/api-client/{subdomain} para capturar tudo que começa com isso
    proxyConfig[`^/api-client/${subdomain}`] = createClientProxy(subdomain);
  });
  
  // Proxy genérico para outros subdomínios (deve vir depois dos específicos)
  // Nota: Este proxy genérico não funciona perfeitamente porque precisa do target dinâmico
  // Mas serve como fallback para subdomínios não listados acima
  proxyConfig['^/api-client/([^/]+)'] = {
    target: apiTarget, // Fallback
    changeOrigin: true,
    secure: true,
    rewrite: (path: string) => {
      // Remove /api-client/{subdomain} do path
      const match = path.match(/^\/api-client\/[^/]+\/(.*)$/);
      return match ? `/${match[1]}` : '/';
    },
  };
  
  // Proxy padrão para /api
  proxyConfig['^/api'] = {
    target: apiTarget,
    changeOrigin: true,
    secure: true,
    rewrite: (path: string) => path.replace(/^\/api/, ''),
  };
  
  return {
    server: {
      port: 3000,
      host: '0.0.0.0',
      proxy: isDev ? proxyConfig : undefined,
    },
    plugins: [react(), tailwindcss()],
    define: {
      'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
      'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY),
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
  };
});
