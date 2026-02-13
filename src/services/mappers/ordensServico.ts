import type { ServiceOrder, ServiceOrderItem } from '../../types';
import type { OrdemServicoResponse, OrdemServicoCreate, OrdemServicoItemCreate } from '../../types/api';

function parseNum(s: string | number): number {
  if (typeof s === 'number') return s;
  const n = parseFloat(String(s).replace(',', '.'));
  return Number.isFinite(n) ? n : 0;
}

function mapStatus(status: string): 'open' | 'completed' | 'cancelled' {
  if (status === 'concluida') return 'completed';
  if (status === 'cancelada') return 'cancelled';
  return 'open';
}

function mapStatusToApi(status: 'open' | 'completed' | 'cancelled'): 'aberta' | 'concluida' | 'cancelada' {
  if (status === 'completed') return 'concluida';
  if (status === 'cancelled') return 'cancelada';
  return 'aberta';
}

export function ordemServicoResponseToServiceOrder(r: OrdemServicoResponse): ServiceOrder {
  const items: ServiceOrderItem[] = (r.itens ?? []).map((i) => ({
    contractItemId: String(i.item_contrato_id),
    quantity: i.quantidade_autorizada || i.quantidade || 0, // Suporta ambos os formatos
    unitPrice: parseNum(i.valor_unitario),
    total: parseNum(i.valor_total),
  }));
  return {
    id: String(r.id),
    number: r.numero_os,
    contractId: String(r.contrato_id),
    issueDate: r.data_emissao,
    description: r.descricao,
    status: mapStatus(r.status),
    items,
  };
}

export function serviceOrderToOrdemServicoCreate(
  os: ServiceOrder,
  entidadeId: number
): OrdemServicoCreate {
  const payload: OrdemServicoCreate = {
    contrato_id: parseInt(os.contractId, 10),
    data_emissao: os.issueDate,
    descricao: os.description || null,
    itens: os.items.map((i) => ({
      item_contrato_id: parseInt(i.contractItemId, 10),
      quantidade_autorizada: i.quantity,
    })) as OrdemServicoItemCreate[],
  };
  // numero_os pode ser gerado pelo backend, então não enviamos se não for necessário
  // Se o backend exigir, descomente a linha abaixo:
  // payload.numero_os = os.number;
  return payload;
}
