-- ################################################
-- SISTEMA DE GESTÃO PÚBLICA ERP - SUPABASE SCHEMA
-- ################################################

-- 1. TABELA DE TENANTS (MASTER TABLE)
-- Esta tabela é utilizada pela implementação atual do App para sincronizar o estado completo.
CREATE TABLE IF NOT EXISTS tenants (
    id TEXT PRIMARY KEY, -- O slug/ID da prefeitura (ex: 'prefeitura-modelo')
    name TEXT,
    state JSONB, -- Armazena o AppState completo
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Habilitar RLS para tenants
ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;

-- Política de acesso simples (Permite leitura/escrita para usuários anônimos com a chave certa)
-- Em produção, deve-se usar Supabase Auth e políticas baseadas em auth.uid()
CREATE POLICY "Permitir acesso total para anon" ON tenants
    FOR ALL USING (true) WITH CHECK (true);


-- ################################################
-- SCHEMA NORMALIZADO (OPCIONAL / FUTURO)
-- Use estas tabelas se desejar migrar do JSONB para tabelas individuais.
-- ################################################

-- Fornecedores
CREATE TABLE IF NOT EXISTS suppliers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id TEXT REFERENCES tenants(id),
    name TEXT NOT NULL,
    cnpj TEXT UNIQUE,
    phone TEXT,
    email TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Contas Bancárias
CREATE TABLE IF NOT EXISTS bank_accounts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id TEXT REFERENCES tenants(id),
    bank TEXT,
    agency TEXT,
    account TEXT,
    description TEXT,
    secretariat TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Atas de Registro de Preço
CREATE TABLE IF NOT EXISTS atas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id TEXT REFERENCES tenants(id),
    process_number TEXT,
    modality TEXT,
    object TEXT,
    supplier_id UUID REFERENCES suppliers(id),
    year TEXT,
    total_value DECIMAL(15,2),
    reserved_percentage DECIMAL(5,2),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Itens da Ata
CREATE TABLE IF NOT EXISTS ata_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ata_id UUID REFERENCES atas(id) ON DELETE CASCADE,
    lote TEXT,
    item_number INTEGER,
    description TEXT,
    brand TEXT,
    unit TEXT,
    quantity DECIMAL(15,3),
    unit_price DECIMAL(15,2),
    total_price DECIMAL(15,2)
);

-- Contratos
CREATE TABLE IF NOT EXISTS contracts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id TEXT REFERENCES tenants(id),
    number TEXT,
    supplier_id UUID REFERENCES suppliers(id),
    bidding_modality TEXT,
    start_date DATE,
    end_date DATE,
    global_value DECIMAL(15,2),
    ata_id UUID REFERENCES atas(id),
    secretariat TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Itens do Contrato
CREATE TABLE IF NOT EXISTS contract_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    contract_id UUID REFERENCES contracts(id) ON DELETE CASCADE,
    description TEXT,
    unit TEXT,
    original_qty DECIMAL(15,3),
    unit_price DECIMAL(15,2),
    current_balance DECIMAL(15,3)
);

-- Notas Fiscais
CREATE TABLE IF NOT EXISTS invoices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id TEXT REFERENCES tenants(id),
    contract_id UUID REFERENCES contracts(id),
    number TEXT,
    issue_date DATE,
    is_paid BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Itens da Nota Fiscal
CREATE TABLE IF NOT EXISTS invoice_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    invoice_id UUID REFERENCES invoices(id) ON DELETE CASCADE,
    contract_item_id UUID REFERENCES contract_items(id),
    quantity_used DECIMAL(15,3),
    total_value DECIMAL(15,2)
);

-- Pagamentos
CREATE TABLE IF NOT EXISTS payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    invoice_id UUID REFERENCES invoices(id) ON DELETE CASCADE,
    date DATE,
    bank_account_id UUID REFERENCES bank_accounts(id),
    amount_paid DECIMAL(15,2)
);

-- Ordens de Serviço
CREATE TABLE IF NOT EXISTS service_orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id TEXT REFERENCES tenants(id),
    contract_id UUID REFERENCES contracts(id),
    number TEXT,
    issue_date DATE,
    description TEXT,
    status TEXT CHECK (status IN ('open', 'completed', 'cancelled')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Itens da Ordem de Serviço
CREATE TABLE IF NOT EXISTS service_order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    service_order_id UUID REFERENCES service_orders(id) ON DELETE CASCADE,
    contract_item_id UUID REFERENCES contract_items(id),
    quantity DECIMAL(15,3),
    unit_price DECIMAL(15,2),
    total DECIMAL(15,2)
);

-- Logs do Sistema
CREATE TABLE IF NOT EXISTS system_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id TEXT REFERENCES tenants(id),
    timestamp TIMESTAMPTZ DEFAULT NOW(),
    action TEXT,
    details TEXT,
    username TEXT,
    ip TEXT
);

-- Habilitar RLS em todas as tabelas
ALTER TABLE suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE bank_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE atas ENABLE ROW LEVEL SECURITY;
ALTER TABLE ata_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE contracts ENABLE ROW LEVEL SECURITY;
ALTER TABLE contract_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoice_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_logs ENABLE ROW LEVEL SECURITY;

-- Políticas de RLS genéricas para anon (SIMPLIFICADO)
CREATE POLICY "Permitir tudo fornecedores" ON suppliers FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Permitir tudo contas" ON bank_accounts FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Permitir tudo atas" ON atas FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Permitir tudo itens_ata" ON ata_items FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Permitir tudo contratos" ON contracts FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Permitir tudo itens_contrato" ON contract_items FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Permitir tudo notas" ON invoices FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Permitir tudo itens_nota" ON invoice_items FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Permitir tudo pagamentos" ON payments FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Permitir tudo os" ON service_orders FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Permitir tudo itens_os" ON service_order_items FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Permitir tudo logs" ON system_logs FOR ALL USING (true) WITH CHECK (true);
