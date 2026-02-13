import { adminApiClient } from '../apiClient';
import type { ClienteResponse, ClienteCreate, ClienteUpdate } from '../../types/api';

/** Clientes: API Admin (endpoints na raiz, doc Swagger: /apidoc/swagger/) */
export async function listClientes(): Promise<ClienteResponse[]> {
  const { data } = await adminApiClient.get<ClienteResponse[]>('/clientes/');
  return Array.isArray(data) ? data : [];
}

export async function getClienteById(id: number): Promise<ClienteResponse> {
  const { data } = await adminApiClient.get<ClienteResponse>(`/clientes/${id}`);
  return data;
}

export async function createCliente(body: ClienteCreate): Promise<ClienteResponse> {
  const { data } = await adminApiClient.post<ClienteResponse>('/clientes/', body);
  return data;
}

export async function updateCliente(id: number, body: ClienteUpdate): Promise<ClienteResponse> {
  const { data } = await adminApiClient.put<ClienteResponse>(`/clientes/${id}`, body);
  return data;
}

export async function deleteCliente(id: number): Promise<void> {
  await adminApiClient.delete(`/clientes/${id}`);
}
