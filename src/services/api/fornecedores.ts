import apiClient from '../apiClient';
import type { FornecedorResponse, FornecedorCreate, FornecedorUpdate } from '../../types/api';
import { fornecedorResponseToSupplier } from '../mappers';
import type { Supplier } from '../../types';

export async function listFornecedores(entidadeId: number): Promise<Supplier[]> {
  const { data } = await apiClient.get<FornecedorResponse[]>('/fornecedores/', {
    params: { entidade_id: entidadeId },
  });
  const list = Array.isArray(data) ? data : [];
  return list.map(fornecedorResponseToSupplier);
}

export async function createFornecedor(entidadeId: number, body: FornecedorCreate): Promise<Supplier> {
  const payload = { ...body, entidade_id: entidadeId };
  const { data } = await apiClient.post<FornecedorResponse>('/fornecedores/', payload);
  return fornecedorResponseToSupplier(data);
}

export async function updateFornecedor(id: number, body: FornecedorUpdate): Promise<Supplier> {
  const { data } = await apiClient.put<FornecedorResponse>(`/fornecedores/${id}`, body);
  return fornecedorResponseToSupplier(data);
}

export async function deleteFornecedor(id: number): Promise<void> {
  await apiClient.delete(`/fornecedores/${id}`);
}
