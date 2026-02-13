import apiClient from '../apiClient';
import type { EntidadeResponse, EntidadeUpdate, EntidadeCreate } from '../../types/api';
import { entidadeResponseToEntityConfig } from '../mappers';
import type { EntityConfig } from '../../types';
import { listClientes } from './clientes';

export async function listEntidades(): Promise<EntidadeResponse[]> {
  const { data } = await apiClient.get<EntidadeResponse | EntidadeResponse[]>('/entidades/');
  // A API pode retornar um objeto único ou uma lista
  if (Array.isArray(data)) {
    return data;
  }
  // Se retornar um objeto único, transforma em array
  if (data && typeof data === 'object' && 'id' in data) {
    return [data as EntidadeResponse];
  }
  return [];
}

export async function getEntidadeById(id: number): Promise<EntidadeResponse> {
  try {
    const { data } = await apiClient.get<EntidadeResponse>(`/entidades/${id}`);
    return data;
  } catch (error: any) {
    // Se for 404, a entidade não existe no banco de dados
    if (error?.response?.status === 404) {
      throw new Error(`Entidade com ID ${id} não encontrada. Verifique se a entidade está cadastrada no backend.`);
    }
    throw error;
  }
}

/** Resolve entidade_id from tenant slug or id. Accepts optional hint (e.g. client id from master panel). */
let entidadeIdCache: Record<string, number> = {};

export async function resolveEntidadeId(tenantId: string, hintId?: number): Promise<number> {
  // Limpa cache se estiver em desenvolvimento para evitar problemas
  if (import.meta.env.DEV) {
    console.log(`[resolveEntidadeId] Resolvendo entidadeId para tenantId: "${tenantId}", hintId: ${hintId}`);
  }
  
  if (entidadeIdCache[tenantId] != null) {
    if (import.meta.env.DEV) {
      console.log(`[resolveEntidadeId] Usando cache: ${entidadeIdCache[tenantId]}`);
    }
    return entidadeIdCache[tenantId];
  }
  
  if (hintId != null && Number.isFinite(hintId)) {
    entidadeIdCache[tenantId] = hintId;
    return hintId;
  }
  
  // Primeiro, tenta buscar na lista de clientes pela url_instancia
  try {
    const clientes = await listClientes();
    const byUrl = clientes.find(
      (c) => c.url_instancia === tenantId || c.url_instancia?.toLowerCase() === tenantId.toLowerCase()
    );
    if (byUrl) {
      if (import.meta.env.DEV) {
        console.log(`[resolveEntidadeId] Encontrado na lista de clientes: ID ${byUrl.id}`);
      }
      entidadeIdCache[tenantId] = byUrl.id;
      return byUrl.id;
    }
  } catch (error) {
    // listClientes pode falhar se o token não tiver permissão; continua com entidades
    if (import.meta.env.DEV) {
      console.log(`[resolveEntidadeId] Erro ao buscar clientes, continuando com entidades:`, error);
    }
  }
  
  // Busca a entidade usando o endpoint /entidades (retorna objeto único, não lista)
  if (import.meta.env.DEV) {
    console.log(`[resolveEntidadeId] Buscando entidade...`);
  }
  
  const { data } = await apiClient.get<EntidadeResponse | EntidadeResponse[]>('/entidades/');
  
  // A API pode retornar um objeto único ou uma lista
  let entidade: EntidadeResponse | undefined;
  let list: EntidadeResponse[] = [];
  
  if (Array.isArray(data)) {
    list = data;
    if (list.length === 0) {
      throw new Error('Nenhuma entidade cadastrada. Cadastre uma entidade no backend primeiro.');
    }
    // Se for lista, tenta encontrar a correta
    const bySlug = list.find((e) => {
      const entitySlug = e.nome.toLowerCase().replace(/\s+/g, '-');
      return entitySlug === tenantId.toLowerCase() || entitySlug.includes(tenantId.toLowerCase());
    });
    if (bySlug) {
      entidade = bySlug;
    } else {
      // Se não encontrou por nome, usa a primeira ou busca por ID
      const idFromSlug = parseInt(tenantId, 10);
      if (Number.isFinite(idFromSlug) && !isNaN(idFromSlug)) {
        entidade = list.find(e => e.id === idFromSlug);
      }
      if (!entidade) {
        entidade = list[0]; // Fallback: usa a primeira
      }
    }
  } else if (data && typeof data === 'object' && 'id' in data) {
    // Se for objeto único, usa diretamente
    entidade = data as EntidadeResponse;
    list = [entidade];
  } else {
    throw new Error('Resposta inválida da API: /entidades não retornou uma entidade válida.');
  }
  
  if (!entidade) {
    throw new Error('Entidade não encontrada.');
  }
  
  if (import.meta.env.DEV) {
    console.log(`[resolveEntidadeId] Entidade encontrada: ${entidade.nome} (ID: ${entidade.id})`);
  }
  
  entidadeIdCache[tenantId] = entidade.id;
  return entidade.id;
}

export function clearEntidadeIdCache() {
  if (import.meta.env.DEV) {
    console.log('[clearEntidadeIdCache] Limpando cache de entidades');
  }
  entidadeIdCache = {};
}

/**
 * Obtém a configuração da entidade usando apenas o endpoint /entidades.
 * A API retorna um objeto único (a entidade do cliente logado), não uma lista.
 */
export async function getEntityConfig(entidadeId: number): Promise<EntityConfig> {
  // A API retorna um objeto único em /entidades, não uma lista
  const { data } = await apiClient.get<EntidadeResponse>('/entidades/');
  
  // Verifica se é um array (caso a API retorne lista) ou objeto único
  let entidade: EntidadeResponse;
  if (Array.isArray(data)) {
    // Se for array, busca pelo ID
    entidade = data.find(e => e.id === entidadeId) || data[0];
    if (!entidade) {
      throw new Error(
        `Entidade com ID ${entidadeId} não encontrada na lista. ` +
        `Entidades disponíveis: ${data.map(e => `${e.nome} (ID: ${e.id})`).join(', ')}`
      );
    }
  } else {
    // Se for objeto único, usa diretamente
    entidade = data;
  }
  
  return entidadeResponseToEntityConfig(entidade);
}

export async function createEntidade(body: EntidadeCreate): Promise<EntidadeResponse> {
  const { data } = await apiClient.post<EntidadeResponse>('/entidades/', body);
  return data;
}

/**
 * Atualiza a configuração da entidade usando o endpoint /entidades/.
 * A API atualiza a entidade do usuário logado automaticamente (sem necessidade de ID no path).
 * O parâmetro id é mantido para compatibilidade, mas não é usado na URL.
 */
export async function updateEntidade(id: number, body: EntidadeUpdate): Promise<EntidadeResponse> {
  // Conforme Swagger, PUT /entidades/ atualiza a entidade do usuário logado
  const { data } = await apiClient.put<EntidadeResponse>('/entidades/', body);
  return data;
}

export async function deleteEntidade(id: number): Promise<void> {
  await apiClient.delete(`/entidades/${id}`);
}
