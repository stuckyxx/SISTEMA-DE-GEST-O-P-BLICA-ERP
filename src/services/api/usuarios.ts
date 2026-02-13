import apiClient from '../apiClient';
import type { UsuarioResponse, UsuarioCreate, UsuarioUpdate } from '../../types/api';

export async function listUsuarios(entidadeId?: number): Promise<UsuarioResponse[]> {
  const params = entidadeId != null ? { entidade_id: entidadeId } : undefined;
  const { data } = await apiClient.get<UsuarioResponse[]>('/usuarios/', { params });
  return Array.isArray(data) ? data : [];
}

export async function getUsuarioById(id: number): Promise<UsuarioResponse> {
  const { data } = await apiClient.get<UsuarioResponse>(`/usuarios/${id}`);
  return data;
}

export async function createUsuario(body: UsuarioCreate): Promise<UsuarioResponse> {
  const { data } = await apiClient.post<UsuarioResponse>('/usuarios/', body);
  return data;
}

export async function updateUsuario(id: number, body: UsuarioUpdate): Promise<UsuarioResponse> {
  const { data } = await apiClient.put<UsuarioResponse>(`/usuarios/${id}`, body);
  return data;
}

export async function deleteUsuario(id: number): Promise<void> {
  await apiClient.delete(`/usuarios/${id}`);
}
