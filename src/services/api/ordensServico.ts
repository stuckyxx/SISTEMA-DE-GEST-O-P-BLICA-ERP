import apiClient from '../apiClient';
import type { OrdemServicoResponse, OrdemServicoCreate, OrdemServicoUpdate } from '../../types/api';
import { ordemServicoResponseToServiceOrder } from '../mappers';
import type { ServiceOrder } from '../../types';

export async function listOrdensServico(entidadeId: number): Promise<ServiceOrder[]> {
  const { data } = await apiClient.get<OrdemServicoResponse[]>('/contratos/os/', {
    params: { entidade_id: entidadeId },
  });
  const list = Array.isArray(data) ? data : [];
  return list.map(ordemServicoResponseToServiceOrder);
}

export async function getOrdemServico(id: number): Promise<ServiceOrder> {
  const { data } = await apiClient.get<OrdemServicoResponse>(`/contratos/os/${id}`);
  return ordemServicoResponseToServiceOrder(data);
}

export async function createOrdemServico(entidadeId: number, body: OrdemServicoCreate): Promise<ServiceOrder> {
  const payload = { ...body };
  if (import.meta.env.DEV) {
    console.log('[createOrdemServico] Payload sendo enviado:', JSON.stringify(payload, null, 2));
  }
  try {
    const { data } = await apiClient.post<OrdemServicoResponse>('/contratos/os/', payload);
    return ordemServicoResponseToServiceOrder(data);
  } catch (error: any) {
    if (import.meta.env.DEV) {
      console.error('[createOrdemServico] Erro completo:', error);
      if (error?.response) {
        console.error('[createOrdemServico] Status:', error.response.status);
        console.error('[createOrdemServico] Headers:', error.response.headers);
        console.error('[createOrdemServico] Data:', JSON.stringify(error.response.data, null, 2));
        console.error('[createOrdemServico] Request config:', {
          url: error.config?.url,
          method: error.config?.method,
          baseURL: error.config?.baseURL,
          data: error.config?.data,
        });
      }
    }
    throw error;
  }
}

export async function updateOrdemServico(id: number, body: OrdemServicoUpdate): Promise<ServiceOrder> {
  const { data } = await apiClient.put<OrdemServicoResponse>(`/contratos/os/${id}`, body);
  return ordemServicoResponseToServiceOrder(data);
}

export async function deleteOrdemServico(id: number): Promise<void> {
  await apiClient.delete(`/contratos/os/${id}`);
}
