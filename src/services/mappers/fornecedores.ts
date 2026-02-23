import type { Supplier } from '../../types';
import type { FornecedorResponse, FornecedorCreate, FornecedorUpdate } from '../../types/api';

export function fornecedorResponseToSupplier(r: FornecedorResponse): Supplier {
  return {
    id: String(r.id),
    name: r.razao_social,
    cnpj: r.cnpj,
    phone: r.telefone ?? '',
    email: r.email ?? '',
  };
}

export function supplierToFornecedorCreate(s: Pick<Supplier, 'name' | 'cnpj' | 'phone' | 'email'>, entidadeId: number): FornecedorCreate {
  return {
    razao_social: s.name,
    cnpj: s.cnpj,
    entidade_id: entidadeId,
    telefone: s.phone || null,
    email: s.email || null,
  };
}

export function supplierToFornecedorUpdate(s: Pick<Supplier, 'name' | 'cnpj' | 'phone' | 'email'>): FornecedorUpdate {
  return {
    razao_social: s.name || null,
    cnpj: s.cnpj || null,
    telefone: s.phone || null,
    email: s.email || null,
  };
}
