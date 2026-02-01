import React from 'react';
import { 
  Settings2,
  Clock,
  History
} from 'lucide-react';
import { AppState } from '../../types';
import { useFinancial } from './hooks/useFinancial';
import { FinancialSummary } from './components/FinancialSummary';
import { AccountsPayable } from './components/AccountsPayable';
import { TransactionsHistory } from './components/TransactionsHistory';
import { BankAccountsModal } from './components/BankAccountsModal';

interface FinancialProps {
  state: AppState;
  setState: React.Dispatch<React.SetStateAction<AppState>>;
}

const Financial: React.FC<FinancialProps> = ({ state, setState }) => {
  const {
    activeTab,
    setActiveTab,
    selectedInvoiceId,
    setSelectedInvoiceId,
    paymentDate,
    setPaymentDate,
    selectedAccountId,
    setSelectedAccountId,
    isConfigModalOpen,
    setIsConfigModalOpen,
    newAccount,
    setNewAccount,
    pendingInvoices,
    paidInvoices,
    totalPaid,
    totalPending,
    handlePay,
    handleAddAccount,
    handleDeleteAccount
  } = useFinancial({ state, setState });

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Financeiro / Tesouraria</h2>
          <p className="text-slate-500 dark:text-slate-400">Controle de pagamentos e histórico financeiro.</p>
        </div>
        <button 
          onClick={() => setIsConfigModalOpen(true)}
          className="flex items-center justify-center gap-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 px-5 py-2.5 rounded-xl transition-all font-semibold shadow-sm hover:bg-slate-50 dark:hover:bg-slate-800"
        >
          <Settings2 size={20} />
          Gerir Contas Bancárias
        </button>
      </div>

      <FinancialSummary 
        totalPending={totalPending}
        totalPaid={totalPaid}
        pendingCount={pendingInvoices.length}
        paidCount={paidInvoices.length}
      />

      {/* Tabs de Navegação */}
      <div className="flex gap-4 border-b border-slate-200 dark:border-slate-800">
        <button 
          onClick={() => setActiveTab('pending')}
          className={`pb-4 px-4 font-bold text-sm flex items-center gap-2 transition-all ${
            activeTab === 'pending' 
              ? 'text-blue-600 border-b-2 border-blue-600' 
              : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
          }`}
        >
          <Clock size={16} />
          Contas a Pagar
        </button>
        <button 
          onClick={() => setActiveTab('history')}
          className={`pb-4 px-4 font-bold text-sm flex items-center gap-2 transition-all ${
            activeTab === 'history' 
              ? 'text-emerald-600 border-b-2 border-emerald-600' 
              : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
          }`}
        >
          <History size={16} />
          Histórico de Despesas
        </button>
      </div>

      {/* Conteúdo das Abas */}
      <div className="min-h-[400px]">
        {activeTab === 'pending' && (
          <AccountsPayable 
            invoices={pendingInvoices}
            state={state}
            selectedInvoiceId={selectedInvoiceId}
            setSelectedInvoiceId={setSelectedInvoiceId}
            paymentDate={paymentDate}
            setPaymentDate={setPaymentDate}
            selectedAccountId={selectedAccountId}
            setSelectedAccountId={setSelectedAccountId}
            onPay={handlePay}
          />
        )}

        {activeTab === 'history' && (
          <TransactionsHistory 
            invoices={paidInvoices}
            state={state}
          />
        )}
      </div>

      <BankAccountsModal 
        isOpen={isConfigModalOpen}
        onClose={() => setIsConfigModalOpen(false)}
        accounts={state.accounts}
        newAccount={newAccount}
        setNewAccount={setNewAccount}
        onAdd={handleAddAccount}
        onDelete={handleDeleteAccount}
      />
    </div>
  );
};

export default Financial;
