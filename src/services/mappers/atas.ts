import type { Ata, AtaItem, AtaDistribution } from '../../types';
import type { AtaResponse, AtaCreate, AtaItemCreate, AtaDistribuicaoCreate } from '../../types/api';

function parseNum(s: string | number): number {
  if (typeof s === 'number') return s;
  const n = parseFloat(String(s).replace(',', '.'));
  return Number.isFinite(n) ? n : 0;
}

export function ataResponseToAta(r: AtaResponse): Ata {
  const totalValue = parseNum(r.valor_total_ata);
  const items: AtaItem[] = (r.itens ?? []).map((i) => ({
    id: String(i.id),
    lote: i.lote ?? undefined,
    itemNumber: i.numero,
    description: i.descricao,
    brand: i.marca ?? '',
    unit: i.unidade,
    quantity: i.quantidade,
    unitPrice: parseNum(i.valor_unitario),
    totalPrice: parseNum(i.valor_total),
  }));
  const distributions: AtaDistribution[] = (r.distribuicoes ?? []).map((d) => ({
    id: String(d.id),
    secretariatName: d.secretaria,
    percentage: parseNum(d.percentual),
    value: (totalValue * parseNum(d.percentual)) / 100,
  }));
  const distributedPct = distributions.reduce((acc, d) => acc + d.percentage, 0);
  return {
    id: String(r.id),
    processNumber: r.numero_processo,
    modality: r.modalidade,
    object: r.objeto,
    supplierId: String(r.fornecedor_id),
    year: r.ano,
    totalValue,
    items,
    distributions,
    reservedPercentage: 100 - distributedPct,
    createdAt: new Date().toISOString(),
  };
}

export function ataToAtaCreate(a: Ata, entidadeId: number): AtaCreate {
  const entidadeIdNum = typeof entidadeId === 'string' ? parseInt(entidadeId, 10) : entidadeId;
  return {
    numero_processo: a.processNumber,
    modalidade: a.modality,
    objeto: a.object,
    ano: a.year,
    fornecedor_id: parseInt(a.supplierId, 10),
    entidade_id: entidadeIdNum,
    itens: a.items.map((i) => ({
      numero: i.itemNumber,
      descricao: i.description,
      unidade: i.unit,
      quantidade: i.quantity,
      valor_unitario: i.unitPrice,
      lote: i.lote ?? null,
      marca: i.brand || null,
    })) as AtaItemCreate[],
    distribuicoes: a.distributions.map((d) => ({
      secretaria: d.secretariatName,
      percentual: d.percentage,
    })) as AtaDistribuicaoCreate[],
  };
}
