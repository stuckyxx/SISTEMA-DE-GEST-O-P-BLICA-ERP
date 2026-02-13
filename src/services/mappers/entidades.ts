import type { EntityConfig } from '../../types';
import type { EntidadeResponse, EntidadeUpdate } from '../../types/api';

export function entidadeResponseToEntityConfig(r: EntidadeResponse): EntityConfig {
  return {
    name: r.nome,
    secretary: r.secretaria_padrao ?? '',
    cnpj: r.cnpj,
    address: r.logradouro ?? '',
    city: r.cidade ?? '',
    state: r.uf ?? '',
    zipCode: r.cep ?? '',
    phone: r.telefone ?? '',
    email: r.email ?? '',
    website: r.website ?? '',
  };
}

export function entityConfigToEntidadeUpdate(e: EntityConfig): EntidadeUpdate {
  return {
    nome: e.name,
    cnpj: e.cnpj,
    logradouro: e.address || null,
    cidade: e.city || null,
    uf: e.state || null,
    cep: e.zipCode || null,
    telefone: e.phone || null,
    email: e.email || null,
    website: e.website || null,
    secretaria_padrao: e.secretary || null,
  };
}
