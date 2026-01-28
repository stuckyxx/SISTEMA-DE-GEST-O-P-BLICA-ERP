
export interface Supplier {
  id: string;
  name: string;
  cnpj: string;
  phone: string;
  email: string;
}

export interface BankAccount {
  id: string;
  bank: string;
  agency: string;
  account: string;
  description: string;
  secretariat: string;
}

export interface ContractItem {
  id: string;
  description: string;
  unit: string;
  originalQty: number;
  unitPrice: number;
  currentBalance: number;
}

export interface Contract {
  id: string;
  number: string;
  supplierId: string;
  biddingModality: string;
  startDate: string;
  endDate: string;
  globalValue: number;
  items: ContractItem[];
  // Novos campos para vínculo com Ata
  ataId?: string; 
  secretariat?: string;
}

export interface InvoiceItem {
  id: string;
  contractItemId: string;
  quantityUsed: number;
  totalValue: number;
}

export interface Invoice {
  id: string;
  contractId: string;
  number: string;
  issueDate: string;
  items: InvoiceItem[];
  isPaid: boolean;
  payment?: Payment;
}

export interface Payment {
  id: string;
  date: string;
  bankAccountId: string;
  amountPaid: number;
}

export interface ServiceOrderItem {
  contractItemId: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface ServiceOrder {
  id: string;
  number: string; // Sequencial ex: 001/2024
  contractId: string;
  issueDate: string;
  description: string; // Objeto da solicitação
  status: 'open' | 'completed' | 'cancelled';
  items: ServiceOrderItem[];
}

export interface EntityConfig {
  name: string;
  secretary: string;
  cnpj: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  phone: string;
  email: string;
  website: string;
}

export interface SystemUser {
  id: string;
  name: string;
  username: string;
  password: string; // Em produção, isso seria um hash
  role: 'admin' | 'viewer';
  createdAt: string;
}

export interface SystemLog {
  id: string;
  timestamp: string;
  action: string; // ex: 'LOGIN', 'CREATE_CONTRACT'
  details: string;
  user: string;
  ip?: string;
}

// --- NOVOS TIPOS PARA ATAS ---

export interface AtaItem {
  id: string;
  lote?: string; // Campo adicionado para identificar o lote
  itemNumber: number;
  description: string;
  brand: string;
  unit: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface AtaDistribution {
  id: string;
  secretariatName: string;
  percentage: number;
  value: number;
}

export interface Ata {
  id: string;
  processNumber: string;
  modality: string;
  object: string; // Descrição do objeto
  supplierId: string; // Vencedor da Ata
  year: string;
  totalValue: number;
  items: AtaItem[];
  distributions: AtaDistribution[];
  reservedPercentage: number; // Porcentagem não distribuída (reserva técnica)
  createdAt: string;
}

export type AppState = {
  entity: EntityConfig;
  users: SystemUser[]; 
  logs: SystemLog[];
  suppliers: Supplier[];
  accounts: BankAccount[];
  atas: Ata[]; // Novo array de Atas
  contracts: Contract[];
  invoices: Invoice[];
  serviceOrders: ServiceOrder[];
};

export interface Tenant {
  id: string; // slug (ex: 'prefeitura-sp')
  name: string;
  createdAt: string;
}
