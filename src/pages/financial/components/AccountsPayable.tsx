import React from 'react';
import { CheckCircle2, DollarSign, ArrowRight } from 'lucide-react';
import { AppState, Invoice } from '../../../types';
import { formatCurrency } from '../../../utils/format';

interface AccountsPayableProps {
  invoices: Invoice[];
  state: AppState;
  selectedInvoiceId: string | null;
  setSelectedInvoiceId: (id: string | null) => void;
  paymentDate: string;
  setPaymentDate: (date: string) => void;
  selectedAccountId: string;
  setSelectedAccountId: (id: string) => void;
  onPay: (invoice: Invoice) => void;
}

export const AccountsPayable: React.FC<AccountsPayableProps> = ({
  invoices,
  state,
  selectedInvoiceId,
  setSelectedInvoiceId,
  paymentDate,
  setPaymentDate,
  selectedAccountId,
  setSelectedAccountId,
  onPay
}) => {
  if (invoices.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 bg-white dark:bg-slate-900 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 text-slate-400">
        <CheckCircle2 size={48} className="text-emerald-500 opacity-20 mb-4" />
        <p className="font-bold text-lg">Tudo em dia!</p>
        <p className="text-sm">Nenhuma nota fiscal pendente de pagamento.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 animate-in fade-in slide-in-from-left-4 duration-300">
      {invoices.map(inv => {
        const contract = state.contracts.find(c => c.id === inv.contractId);
        const supplier = state.suppliers.find(s => s.id === contract?.supplierId);
        const total = inv.items.reduce((acc, i) => acc + i.totalValue, 0);
        const isSelected = selectedInvoiceId === inv.id;

        return (
          <div key={inv.id} className={`bg-white dark:bg-slate-900 rounded-2xl border transition-all ${isSelected ? 'border-blue-500 ring-4 ring-blue-50 dark:ring-blue-900/20' : 'border-slate-100 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'}`}>
            <div className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 cursor-pointer" onClick={() => setSelectedInvoiceId(isSelected ? null : inv.id)}>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-slate-50 dark:bg-slate-800 rounded-2xl flex items-center justify-center text-slate-400">
                  <DollarSign size={24} />
                </div>
                <div>
                  <div className="flex items-center gap-3">
                    <p className="font-bold text-slate-800 dark:text-white text-lg">NF {inv.number}</p>
                    <span className="text-[10px] bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400 px-2 py-0.5 rounded-full font-black uppercase">Pendente</span>
                  </div>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{supplier?.name}</p>
                  <p className="text-xs text-slate-400 mt-0.5">Ref: Contrato {contract?.number}</p>
                </div>
              </div>
              <div className="flex items-center gap-6">
                <div className="text-right">
                  <p className="text-xl font-bold text-slate-800 dark:text-white">
                     {formatCurrency(total)}
                  </p>
                  <p className="text-xs text-slate-400 dark:text-slate-500 font-medium">Emitida em: {new Date(inv.issueDate).toLocaleDateString()}</p>
                </div>
                <ArrowRight size={20} className={`text-slate-300 dark:text-slate-600 transition-transform ${isSelected ? 'rotate-90' : ''}`} />
              </div>
            </div>

            {isSelected && (
              <div className="p-6 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/50 rounded-b-2xl animate-in slide-in-from-top-4 duration-300">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                   <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-600 dark:text-slate-400 ml-1 uppercase">Data do Pagamento</label>
                    <input 
                      type="date" 
                      className="w-full p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-white font-medium"
                      value={paymentDate}
                      onChange={(e) => setPaymentDate(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-600 dark:text-slate-400 ml-1 uppercase">Conta Bancária de Origem</label>
                    <select 
                      className="w-full p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-white font-medium"
                      value={selectedAccountId}
                      onChange={(e) => setSelectedAccountId(e.target.value)}
                    >
                      <option value="">Selecione a conta...</option>
                      {state.accounts.map(a => <option key={a.id} value={a.id}>{a.bank} (Ag: {a.agency} / CC: {a.account}) - {a.secretariat}</option>)}
                    </select>
                  </div>
                </div>
                <button 
                  onClick={() => onPay(inv)}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-4 rounded-xl shadow-lg shadow-emerald-200 dark:shadow-emerald-900/20 flex items-center justify-center gap-3 transition-all active:scale-95"
                >
                  <CheckCircle2 size={20} />
                  Confirmar Pagamento
                </button>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};
