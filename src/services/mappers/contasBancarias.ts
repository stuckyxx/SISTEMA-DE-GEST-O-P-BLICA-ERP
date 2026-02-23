import type { BankAccount } from '../../types';
import type { ContaBancariaResponse, ContaBancariaCreate } from '../../types/api';

export function contaBancariaResponseToBankAccount(r: ContaBancariaResponse): BankAccount {
  return {
    id: String(r.id),
    bank: r.banco,
    agency: r.agencia,
    account: r.conta_corrente,
    description: r.descricao ?? '',
    secretariat: r.secretaria,
  };
}

export function bankAccountToContaBancariaCreate(
  b: Pick<BankAccount, 'bank' | 'agency' | 'account' | 'description' | 'secretariat'>,
  entidadeId: number
): ContaBancariaCreate {
  const entidadeIdNum = typeof entidadeId === 'string' ? parseInt(entidadeId, 10) : entidadeId;
  return {
    banco: b.bank,
    agencia: b.agency,
    conta_corrente: b.account,
    descricao: b.description || null,
    entidade_id: entidadeIdNum,
    secretaria: b.secretariat,
  };
}
