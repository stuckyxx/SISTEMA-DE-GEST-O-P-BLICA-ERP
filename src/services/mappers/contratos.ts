import type { Contract, ContractItem } from '../../types';
import type { ContratoResponse, ContratoCreate, ContratoItemCreate } from '../../types/api';

function parseNum(s: string | number): number {
  if (typeof s === 'number') return s;
  const n = parseFloat(String(s).replace(',', '.'));
  return Number.isFinite(n) ? n : 0;
}

export function contratoResponseToContract(r: ContratoResponse): Contract {
  const items: ContractItem[] = (r.itens ?? []).map((i) => ({
    id: String(i.id),
    description: i.descricao,
    unit: i.unidade ?? 'UNID',
    originalQty: i.quantidade_total,
    unitPrice: parseNum(i.valor_unitario),
    currentBalance: i.saldo_qtde,
  }));
  return {
    id: String(r.id),
    number: r.numero_contrato,
    supplierId: String(r.fornecedor_id),
    biddingModality: r.modalidade ?? '',
    startDate: r.data_inicio,
    endDate: r.data_fim,
    globalValue: parseNum(r.valor_total_contrato),
    items,
    ataId: r.ata_id != null ? String(r.ata_id) : undefined,
    secretariat: r.secretaria_vinculada ?? undefined,
  };
}

export function contractToContratoCreate(
  c: Contract,
  entidadeId: number,
  originType: 'direct' | 'ata'
): ContratoCreate {
  const entidadeIdNum = typeof entidadeId === 'string' ? parseInt(entidadeId, 10) : entidadeId;
  const payload: ContratoCreate = {
    numero_contrato: c.number,
    origem: originType === 'ata' ? 'ata' : 'direta',
    fornecedor_id: parseInt(c.supplierId, 10),
    data_inicio: c.startDate,
    data_fim: c.endDate,
    entidade_id: entidadeIdNum,
    itens: c.items.map((i) => ({
      descricao: i.description,
      quantidade_total: i.originalQty,
      unidade: i.unit || null,
      valor_unitario: i.unitPrice,
    })) as ContratoItemCreate[],
    modalidade: c.biddingModality || null,
  };
  if (originType === 'ata' && c.ataId && c.secretariat) {
    payload.ata_id = parseInt(c.ataId, 10);
    payload.secretaria_vinculada = c.secretariat;
  }
  return payload;
}
