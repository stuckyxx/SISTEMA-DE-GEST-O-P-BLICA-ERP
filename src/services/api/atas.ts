import apiClient from '../apiClient';
import type { AtaResponse, AtaCreate, AtaUpdate } from '../../types/api';
import { ataResponseToAta } from '../mappers';
import type { Ata } from '../../types';

export async function listAtas(entidadeId: number): Promise<Ata[]> {
  const { data } = await apiClient.get<AtaResponse[]>('/atas/', {
    params: { entidade_id: entidadeId },
  });
  const list = Array.isArray(data) ? data : [];
  return list.map(ataResponseToAta);
}

export async function getAta(id: number): Promise<Ata> {
  const { data } = await apiClient.get<AtaResponse>(`/atas/${id}`);
  return ataResponseToAta(data);
}

export async function createAta(entidadeId: number, body: AtaCreate): Promise<Ata> {
  const payload = { ...body, entidade_id: entidadeId };
  const { data } = await apiClient.post<AtaResponse>('/atas/', payload);
  return ataResponseToAta(data);
}

export async function updateAta(id: number, body: AtaUpdate): Promise<Ata> {
  const { data } = await apiClient.put<AtaResponse>(`/atas/${id}`, body);
  return ataResponseToAta(data);
}

export async function deleteAta(id: number): Promise<void> {
  await apiClient.delete(`/atas/${id}`);
}
