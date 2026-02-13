import apiClient from '../apiClient';
import type { ContaBancariaResponse, ContaBancariaCreate, ContaBancariaUpdate } from '../../types/api';
import { contaBancariaResponseToBankAccount } from '../mappers';
import type { BankAccount } from '../../types';

export async function listContasBancarias(entidadeId: number): Promise<BankAccount[]> {
  const { data } = await apiClient.get<ContaBancariaResponse[]>('/contas-bancarias/', {
    params: { entidade_id: entidadeId },
  });
  const list = Array.isArray(data) ? data : [];
  return list.map(contaBancariaResponseToBankAccount);
}

export async function createContaBancaria(entidadeId: number, body: ContaBancariaCreate): Promise<BankAccount> {
  const payload = { ...body, entidade_id: entidadeId };
  const { data } = await apiClient.post<ContaBancariaResponse>('/contas-bancarias/', payload);
  return contaBancariaResponseToBankAccount(data);
}

export async function updateContaBancaria(id: number, body: ContaBancariaUpdate): Promise<BankAccount> {
  const { data } = await apiClient.put<ContaBancariaResponse>(`/contas-bancarias/${id}`, body);
  return contaBancariaResponseToBankAccount(data);
}

export async function deleteContaBancaria(id: number): Promise<void> {
  await apiClient.delete(`/contas-bancarias/${id}`);
}
