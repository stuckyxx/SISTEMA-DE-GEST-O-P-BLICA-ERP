import apiClient from '../apiClient';
import type { NotaFiscalResponse, NotaFiscalCreate, NotaFiscalUpdate } from '../../types/api';
import { notaFiscalResponseToInvoice } from '../mappers';
import type { Invoice } from '../../types';

export async function listNotasFiscais(entidadeId: number): Promise<Invoice[]> {
  const { data } = await apiClient.get<NotaFiscalResponse[]>('/financeiro/notas-fiscais/', {
    params: { entidade_id: entidadeId },
  });
  const list = Array.isArray(data) ? data : [];
  return list.map(notaFiscalResponseToInvoice);
}

export async function getNotaFiscal(id: number): Promise<Invoice> {
  const { data } = await apiClient.get<NotaFiscalResponse>(`/financeiro/notas-fiscais/${id}`);
  return notaFiscalResponseToInvoice(data);
}

export async function createNotaFiscal(body: NotaFiscalCreate): Promise<Invoice> {
  const { data } = await apiClient.post<NotaFiscalResponse>('/financeiro/notas-fiscais/', body);
  return notaFiscalResponseToInvoice(data);
}

export async function updateNotaFiscal(id: number, body: NotaFiscalUpdate): Promise<Invoice> {
  const { data } = await apiClient.put<NotaFiscalResponse>(`/financeiro/notas-fiscais/${id}`, body);
  return notaFiscalResponseToInvoice(data);
}

export async function deleteNotaFiscal(id: number): Promise<void> {
  await apiClient.delete(`/financeiro/notas-fiscais/${id}`);
}

/** Mark NF as paid (PATCH status_pagamento). Backend may also have POST /financeiro/pagamentos/ for full payment record. */
export async function marcarNotaFiscalComoPaga(nfId: number): Promise<Invoice> {
  const { data } = await apiClient.patch<NotaFiscalResponse>(`/financeiro/notas-fiscais/${nfId}`, {
    status_pagamento: true,
  });
  return notaFiscalResponseToInvoice(data);
}
