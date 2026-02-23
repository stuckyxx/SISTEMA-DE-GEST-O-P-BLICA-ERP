/**
 * Script para limpar todas as sessões de login do navegador
 * Execute este script no console do navegador (F12 > Console)
 * ou adicione como bookmarklet
 */

// Limpa todas as chaves de sessionStorage relacionadas à autenticação
const authKeys = [
  'erp_auth_token',
  'erp_auth_tenant',
  'master_auth'
];

// Limpa tokens por tenant (padrão: erp_auth_token_${tenantId})
Object.keys(sessionStorage).forEach(key => {
  if (key.startsWith('erp_auth_token_') || 
      key.startsWith('user_') ||
      authKeys.includes(key)) {
    sessionStorage.removeItem(key);
    console.log(`Removido: ${key}`);
  }
});

// Limpa localStorage relacionado (mantém apenas tema se necessário)
// Descomente a linha abaixo se quiser limpar o tema também
// localStorage.removeItem('theme');

console.log('✅ Todas as sessões de login foram limpas!');
console.log('Recarregue a página para aplicar as mudanças.');
