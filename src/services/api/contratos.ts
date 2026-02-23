import apiClient from '../apiClient';
import type { ContratoResponse, ContratoCreate, ContratoUpdate } from '../../types/api';
import { contratoResponseToContract } from '../mappers';
import type { Contract } from '../../types';

export async function listContratos(entidadeId: number): Promise<Contract[]> {
  const { data } = await apiClient.get<ContratoResponse[]>('/contratos/', {
    params: { entidade_id: entidadeId },
  });
  const list = Array.isArray(data) ? data : [];
  return list.map(contratoResponseToContract);
}

export async function getContrato(id: number): Promise<Contract> {
  const { data } = await apiClient.get<ContratoResponse>(`/contratos/${id}`);
  return contratoResponseToContract(data);
}

export async function createContrato(entidadeId: number, body: ContratoCreate): Promise<Contract> {
  const payload = { ...body, entidade_id: entidadeId };
  const { data } = await apiClient.post<ContratoResponse>('/contratos/', payload);
  return contratoResponseToContract(data);
}

export async function updateContrato(id: number, body: ContratoUpdate): Promise<Contract> {
  const { data } = await apiClient.put<ContratoResponse>(`/contratos/${id}`, body);
  return contratoResponseToContract(data);
}

export async function deleteContrato(id: number): Promise<void> {
  await apiClient.delete(`/contratos/${id}`);
}
