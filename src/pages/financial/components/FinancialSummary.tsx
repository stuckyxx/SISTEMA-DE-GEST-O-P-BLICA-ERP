import React from 'react';
import { Clock, TrendingUp } from 'lucide-react';
import { formatCurrency } from '../../../utils/format';

interface FinancialSummaryProps {
  totalPending: number;
  totalPaid: number;
  pendingCount: number;
  paidCount: number;
}

export const FinancialSummary: React.FC<FinancialSummaryProps> = ({
  totalPending,
  totalPaid,
  pendingCount,
  paidCount
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-32 h-32 bg-orange-50 dark:bg-orange-900/10 rounded-full -mr-10 -mt-10 transition-transform group-hover:scale-110" />
        <div className="relative">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 rounded-xl flex items-center justify-center">
              <Clock size={20} />
            </div>
            <span className="font-bold text-slate-600 dark:text-slate-400 uppercase text-xs tracking-widest">A Pagar</span>
          </div>
          <h3 className="text-3xl font-black text-slate-800 dark:text-white">
            {formatCurrency(totalPending)}
          </h3>
          <p className="text-sm text-slate-400 mt-1">{pendingCount} notas aguardando pagamento</p>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-50 dark:bg-emerald-900/10 rounded-full -mr-10 -mt-10 transition-transform group-hover:scale-110" />
        <div className="relative">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-xl flex items-center justify-center">
              <TrendingUp size={20} />
            </div>
            <span className="font-bold text-slate-600 dark:text-slate-400 uppercase text-xs tracking-widest">Total Executado</span>
          </div>
          <h3 className="text-3xl font-black text-slate-800 dark:text-white">
            {formatCurrency(totalPaid)}
          </h3>
          <p className="text-sm text-slate-400 mt-1">{paidCount} pagamentos realizados</p>
        </div>
      </div>
    </div>
  );
};
