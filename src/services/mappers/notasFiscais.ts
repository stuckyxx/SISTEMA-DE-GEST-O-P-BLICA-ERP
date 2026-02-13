import type { Invoice, InvoiceItem } from '../../types';
import type { NotaFiscalResponse, NotaFiscalCreate, NotaFiscalUpdate } from '../../types/api';

export function notaFiscalResponseToInvoice(r: NotaFiscalResponse): Invoice {
  const items: InvoiceItem[] = (r.itens ?? []).map((i) => ({
    id: String(i.id),
    contractItemId: String(i.item_contrato_id),
    quantityUsed: i.quantidade_utilizada,
    totalValue: 0, // backend may not return; will be computed from contract item if needed
  }));
  return {
    id: String(r.id),
    contractId: String(r.contrato_id),
    number: r.numero_nf,
    issueDate: r.data_emissao,
    items,
    isPaid: r.status_pagamento,
    payment: undefined, // payment details if backend returns them
  };
}

export function invoiceToNotaFiscalCreate(
  invoice: Pick<Invoice, 'contractId' | 'number' | 'issueDate' | 'items'>
): NotaFiscalCreate {
  return {
    contrato_id: parseInt(invoice.contractId, 10),
    numero_nf: invoice.number,
    data_emissao: invoice.issueDate,
    itens: invoice.items.map((i) => ({
      item_contrato_id: parseInt(i.contractItemId, 10),
      quantidade_utilizada: i.quantityUsed,
    })),
  };
}

export function invoiceToNotaFiscalUpdate(
  invoice: Pick<Invoice, 'number' | 'issueDate' | 'items'>
): NotaFiscalUpdate {
  return {
    numero_nf: invoice.number,
    data_emissao: invoice.issueDate,
    itens: invoice.items.map((i) => ({
      item_contrato_id: parseInt(i.contractItemId, 10),
      quantidade_utilizada: i.quantityUsed,
    })),
  };
}
