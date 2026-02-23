import React from 'react';
import { Trash2, Pencil } from 'lucide-react';
import { AppState, Invoice } from '../../../types';
import { formatCurrency, formatDate } from '../../../utils/format';

interface InvoiceListProps {
  invoices: Invoice[];
  contracts: AppState['contracts'];
  handleEditInvoice: (invoice: Invoice) => void;
  handleDeleteInvoice: (id: string) => void;
}

const InvoiceList: React.FC<InvoiceListProps> = ({
  invoices,
  contracts,
  handleEditInvoice,
  handleDeleteInvoice
}) => {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
            <tr>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Nota Fiscal</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Contrato</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase text-center">Data</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase text-center">Status</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase text-right">Valor Total</th>
              <th className="px-6 py-4 w-28 text-center">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {invoices.map(inv => {
              const contract = contracts.find(c => c.id === inv.contractId);
              const total = inv.items.reduce((acc, i) => acc + i.totalValue, 0);
              return (
                <tr key={inv.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                  <td className="px-6 py-4 font-bold text-slate-700 dark:text-slate-200">NF {inv.number}</td>
                  <td className="px-6 py-4 text-slate-600 dark:text-slate-400">{contract?.number}</td>
                  <td className="px-6 py-4 text-slate-600 dark:text-slate-400 text-center">{formatDate(inv.issueDate)}</td>
                  <td className="px-6 py-4 text-center">
                    <span className={`px-2 py-1 rounded-full text-[10px] font-black uppercase tracking-tight ${inv.isPaid ? 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400' : 'bg-orange-50 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400'}`}>
                      {inv.isPaid ? 'Paga' : 'Pendente'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right font-bold text-slate-800 dark:text-white">
                    {formatCurrency(total)}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <div className="flex items-center justify-center gap-2">
                      {!inv.isPaid && (
                        <button 
                          onClick={() => handleEditInvoice(inv)}
                          className="p-2 text-slate-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                          title="Editar Itens da Nota"
                        >
                          <Pencil size={18} />
                        </button>
                      )}
                      <button 
                        onClick={() => handleDeleteInvoice(inv.id)}
                        className={`p-2 rounded-lg transition-colors ${inv.isPaid ? 'text-slate-200 dark:text-slate-700 cursor-not-allowed' : 'text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20'}`}
                        disabled={inv.isPaid}
                        title={inv.isPaid ? "Nota paga não pode ser excluída" : "Excluir Nota"}
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
            {invoices.length === 0 && (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center text-slate-400 dark:text-slate-600">Nenhuma nota fiscal lançada.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default InvoiceList;