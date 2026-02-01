import React from 'react';
import { Wallet, CalendarCheck } from 'lucide-react';
import { AppState, Invoice } from '../../../types';
import { formatCurrency } from '../../../utils/format';

interface TransactionsHistoryProps {
  invoices: Invoice[];
  state: AppState;
}

export const TransactionsHistory: React.FC<TransactionsHistoryProps> = ({ invoices, state }) => {
  if (invoices.length === 0) {
    return (
       <div className="flex flex-col items-center justify-center py-20 bg-white dark:bg-slate-900 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 text-slate-400">
        <Wallet size={48} className="text-slate-300 dark:text-slate-600 mb-4 opacity-50" />
        <p className="font-bold text-lg">Sem histórico</p>
        <p className="text-sm">Nenhum pagamento foi registrado ainda.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 overflow-hidden shadow-sm">
        <table className="w-full text-left">
          <thead className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800">
            <tr>
              <th className="px-6 py-4 text-[10px] font-black uppercase text-slate-500 dark:text-slate-400 tracking-widest">Nota Fiscal</th>
              <th className="px-6 py-4 text-[10px] font-black uppercase text-slate-500 dark:text-slate-400 tracking-widest">Fornecedor</th>
              <th className="px-6 py-4 text-[10px] font-black uppercase text-slate-500 dark:text-slate-400 tracking-widest text-center">Data Pagto</th>
              <th className="px-6 py-4 text-[10px] font-black uppercase text-slate-500 dark:text-slate-400 tracking-widest">Conta Utilizada</th>
              <th className="px-6 py-4 text-[10px] font-black uppercase text-slate-500 dark:text-slate-400 tracking-widest text-right">Valor Pago</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {invoices.map(inv => {
              const contract = state.contracts.find(c => c.id === inv.contractId);
              const supplier = state.suppliers.find(s => s.id === contract?.supplierId);
              const bank = state.accounts.find(a => a.id === inv.payment?.bankAccountId);

              return (
                <tr key={inv.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                  <td className="px-6 py-4">
                    <p className="font-bold text-slate-700 dark:text-slate-200">NF {inv.number}</p>
                    <span className="text-[10px] text-slate-400">Contrato {contract?.number}</span>
                  </td>
                  <td className="px-6 py-4 font-medium text-slate-600 dark:text-slate-300">
                    {supplier?.name}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 text-xs font-bold">
                      <CalendarCheck size={14} />
                      {new Date(inv.payment?.date || '').toLocaleDateString()}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm font-medium text-slate-700 dark:text-slate-300">{bank?.bank}</p>
                    <p className="text-xs text-slate-400">Ag: {bank?.agency} CC: {bank?.account}</p>
                  </td>
                  <td className="px-6 py-4 text-right">
                     <span className="font-bold text-slate-800 dark:text-white">
                        {formatCurrency(inv.payment?.amountPaid || 0)}
                     </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
