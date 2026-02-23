import apiClient from '../apiClient';
import type { UsuarioResponse, UsuarioCreate, UsuarioUpdate } from '../../types/api';
import { usuarioResponseToSystemUser } from '../mappers';
import type { SystemUser } from '../../types';

export async function listUsuarios(entidadeId?: number): Promise<SystemUser[]> {
  const params = entidadeId != null ? { entidade_id: entidadeId } : undefined;
  const { data } = await apiClient.get<UsuarioResponse[]>('/usuarios/', { params });
  const list = Array.isArray(data) ? data : [];
  return list.map(usuarioResponseToSystemUser);
}

export async function getUsuarioById(id: number): Promise<SystemUser> {
  const { data } = await apiClient.get<UsuarioResponse>(`/usuarios/${id}`);
  return usuarioResponseToSystemUser(data);
}

export async function createUsuario(body: UsuarioCreate): Promise<SystemUser> {
  const { data } = await apiClient.post<UsuarioResponse>('/usuarios/', body);
  return usuarioResponseToSystemUser(data);
}

export async function updateUsuario(id: number, body: UsuarioUpdate): Promise<SystemUser> {
  const { data } = await apiClient.put<UsuarioResponse>(`/usuarios/${id}`, body);
  return usuarioResponseToSystemUser(data);
}

export async function deleteUsuario(id: number): Promise<void> {
  await apiClient.delete(`/usuarios/${id}`);
}
