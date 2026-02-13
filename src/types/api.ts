/**
 * API request/response types matching backend OpenAPI schemas (snake_case, integer ids).
 */

export interface EntidadeResponse {
  id: number;
  nome: string;
  cnpj: string;
  logradouro?: string | null;
  cidade?: string | null;
  uf?: string | null;
  cep?: string | null;
  telefone?: string | null;
  email?: string | null;
  website?: string | null;
  secretaria_padrao?: string | null;
}

export interface EntidadeCreate {
  nome: string;
  cnpj: string;
  logradouro?: string | null;
  cidade?: string | null;
  uf?: string | null;
  cep?: string | null;
  telefone?: string | null;
  email?: string | null;
  website?: string | null;
  secretaria_padrao?: string | null;
}

export interface EntidadeUpdate {
  nome?: string | null;
  cnpj?: string | null;
  logradouro?: string | null;
  cidade?: string | null;
  uf?: string | null;
  cep?: string | null;
  telefone?: string | null;
  email?: string | null;
  website?: string | null;
  secretaria_padrao?: string | null;
}

/** API /clientes/ (backend gestão) */
export type StatusCliente = 'ATIVO' | 'INATIVO' | 'SUSPENSO' | 'CANCELADO';
export type StatusInterno = 'OPERACIONAL' | 'IMPLANTACAO' | 'MANUTENCAO' | 'ERRO';

export interface ClienteResponse {
  id: number;
  nome_fantasia: string;
  razao_social: string;
  cnpj: string;
  uf: string;
  data_inicio: string;
  data_fim: string;
  status_cliente: StatusCliente;
  status_interno: StatusInterno;
  url_instancia?: string | null;
  versao_atual?: string | null;
  responsavel_tecnico?: string | null;
  contato_comercial?: string | null;
  observacoes?: string | null;
}

export interface ClienteCreate {
  nome_fantasia: string;
  razao_social: string;
  cnpj: string;
  uf: string;
  data_inicio: string;
  data_fim: string;
  status_cliente?: StatusCliente;
  status_interno?: StatusInterno;
  url_instancia?: string | null;
  versao_atual?: string | null;
  responsavel_tecnico?: string | null;
  contato_comercial?: string | null;
  observacoes?: string | null;
}

export interface ClienteUpdate {
  nome_fantasia?: string | null;
  razao_social?: string | null;
  cnpj?: string | null;
  uf?: string | null;
  data_inicio?: string | null;
  data_fim?: string | null;
  status_cliente?: StatusCliente | null;
  status_interno?: StatusInterno | null;
  url_instancia?: string | null;
  versao_atual?: string | null;
  responsavel_tecnico?: string | null;
  contato_comercial?: string | null;
  observacoes?: string | null;
}

/**
 * API /usuarios/ (backend).
 * Schemas na doc: UsuarioCreate.6512618, UsuarioOut.6512618, UsuarioUpdate.6512618.
 * Ver Swagger → Usuários → POST /usuarios/ para campos exatos.
 */
export interface UsuarioResponse {
  id: number;
  username: string;
  full_name?: string | null;
  nome?: string | null;
  role?: string | null;
  entidade_id?: number | null;
}

/** Payload POST /usuarios/: backend espera nome, username, senha, role, entidade_id */
export interface UsuarioCreate {
  nome: string;
  username: string;
  senha: string;
  role?: string | null;
  entidade_id: number;
}

export interface UsuarioUpdate {
  username?: string | null;
  senha?: string | null;
  nome?: string | null;
  role?: string | null;
}

export interface FornecedorResponse {
  id: number;
  razao_social: string;
  cnpj: string;
  entidade_id: number;
  telefone?: string | null;
  email?: string | null;
}

export interface FornecedorCreate {
  razao_social: string;
  cnpj: string;
  entidade_id: number;
  telefone?: string | null;
  email?: string | null;
}

export interface FornecedorUpdate {
  razao_social?: string | null;
  cnpj?: string | null;
  telefone?: string | null;
  email?: string | null;
}

export interface AtaDistribuicaoResponse {
  id: number;
  ata_id: number;
  secretaria: string;
  percentual: string;
}

export interface AtaItemResponse {
  id: number;
  ata_id: number;
  numero: number;
  descricao: string;
  unidade: string;
  quantidade: number;
  valor_unitario: string;
  valor_total: string;
  lote?: string | null;
  marca?: string | null;
}

export interface AtaResponse {
  id: number;
  numero_processo: string;
  modalidade: string;
  objeto: string;
  ano: string;
  fornecedor_id: number;
  entidade_id: number;
  valor_total_ata: string;
  itens: AtaItemResponse[];
  distribuicoes: AtaDistribuicaoResponse[];
}

export interface AtaDistribuicaoCreate {
  secretaria: string;
  percentual: number | string;
}

export interface AtaItemCreate {
  numero: number;
  descricao: string;
  unidade: string;
  quantidade: number;
  valor_unitario: number | string;
  lote?: string | null;
  marca?: string | null;
}

export interface AtaCreate {
  numero_processo: string;
  modalidade: string;
  objeto: string;
  ano: string;
  fornecedor_id: number;
  entidade_id: number;
  itens?: AtaItemCreate[] | null;
  distribuicoes?: AtaDistribuicaoCreate[] | null;
}

export interface AtaUpdate {
  numero_processo?: string | null;
  modalidade?: string | null;
  objeto?: string | null;
  ano?: string | null;
  fornecedor_id?: number | null;
}

export interface ContratoItemResponse {
  id: number;
  contrato_id: number;
  descricao: string;
  quantidade_total: number;
  saldo_qtde: number;
  unidade?: string | null;
  valor_unitario: string;
  valor_total: string;
}

export interface ContratoResponse {
  id: number;
  numero_contrato: string;
  origem: string;
  fornecedor_id: number;
  data_inicio: string;
  data_fim: string;
  entidade_id: number;
  valor_total_contrato: string;
  itens: ContratoItemResponse[];
  ata_id?: number | null;
  secretaria_vinculada?: string | null;
  modalidade?: string | null;
}

export interface ContratoItemCreate {
  descricao: string;
  quantidade_total: number;
  unidade?: string | null;
  valor_unitario: number | string;
}

export interface ContratoCreate {
  numero_contrato: string;
  origem: string;
  fornecedor_id: number;
  data_inicio: string;
  data_fim: string;
  entidade_id: number;
  itens: ContratoItemCreate[];
  ata_id?: number | null;
  secretaria_vinculada?: string | null;
  modalidade?: string | null;
}

export interface ContratoUpdate {
  numero_contrato?: string | null;
  data_fim?: string | null;
  modalidade?: string | null;
}

export interface NotaFiscalItemResponse {
  id: number;
  nf_id: number;
  item_contrato_id: number;
  quantidade_utilizada: number;
}

export interface NotaFiscalResponse {
  id: number;
  contrato_id: number;
  numero_nf: string;
  data_emissao: string;
  status_pagamento: boolean;
  itens: NotaFiscalItemResponse[];
}

export interface NotaFiscalItemCreate {
  item_contrato_id: number;
  quantidade_utilizada: number;
}

export interface NotaFiscalCreate {
  contrato_id: number;
  numero_nf: string;
  data_emissao: string;
  itens: NotaFiscalItemCreate[];
}

export interface NotaFiscalUpdate {
  numero_nf?: string | null;
  data_emissao?: string | null;
  itens?: NotaFiscalItemCreate[] | null;
}

export interface ContaBancariaResponse {
  id: number;
  banco: string;
  agencia: string;
  conta_corrente: string;
  descricao?: string | null;
  entidade_id: number;
  secretaria: string;
}

export interface ContaBancariaCreate {
  banco: string;
  agencia: string;
  conta_corrente: string;
  descricao?: string | null;
  entidade_id: number;
  secretaria: string;
}

export interface ContaBancariaUpdate {
  banco?: string | null;
  agencia?: string | null;
  conta_corrente?: string | null;
  descricao?: string | null;
  secretaria?: string | null;
}

export interface OrdemServicoItemResponse {
  id: number;
  os_id: number;
  item_contrato_id: number;
  quantidade: number;
  valor_unitario: string;
  valor_total: string;
}

export interface OrdemServicoResponse {
  id: number;
  numero_os: string;
  contrato_id: number;
  data_emissao: string;
  descricao: string;
  status: 'aberta' | 'concluida' | 'cancelada';
  itens: OrdemServicoItemResponse[];
}

export interface OrdemServicoItemCreate {
  item_contrato_id: number;
  quantidade_autorizada: number;
}

export interface OrdemServicoCreate {
  contrato_id: number;
  numero_os?: string | null;
  data_emissao: string;
  descricao: string | null;
  itens: OrdemServicoItemCreate[];
}

export interface OrdemServicoUpdate {
  descricao?: string | null;
  status?: 'aberta' | 'concluida' | 'cancelada' | null;
}

/** OAuth2 token response (FastAPI typical) */
export interface TokenResponse {
  access_token: string;
  token_type: string;
  expires_in?: number;
}
