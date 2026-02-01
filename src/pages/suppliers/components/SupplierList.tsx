import React from 'react';
import { 
  Building2, 
  Trash2, 
  CreditCard, 
  Mail, 
  Phone 
} from 'lucide-react';
import { Supplier } from '../../../types';

interface SupplierListProps {
  suppliers: Supplier[];
  onDelete: (id: string) => void;
}

export const SupplierList: React.FC<SupplierListProps> = ({ suppliers, onDelete }) => {
  if (suppliers.length === 0) {
    return (
      <div className="py-32 flex flex-col items-center justify-center text-slate-400 bg-white dark:bg-slate-900 rounded-[2.5rem] border border-dashed border-slate-200 dark:border-slate-800 shadow-inner">
        <div className="w-20 h-20 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4">
          <Building2 size={40} className="opacity-20" />
        </div>
        <p className="font-bold text-lg text-slate-400">Nenhum fornecedor cadastrado.</p>
        <p className="text-sm mt-1">Clique em "Cadastrar Fornecedor" para começar.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {suppliers.map(supplier => (
        <div key={supplier.id} className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-xl hover:shadow-slate-200/50 dark:hover:shadow-black/40 transition-all group relative overflow-hidden flex flex-col">
          <div className="absolute top-0 right-0 w-24 h-24 bg-blue-50/50 dark:bg-blue-900/20 rounded-full -mr-8 -mt-8 transition-transform group-hover:scale-110" />
          
          <div className="relative flex-1">
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 bg-blue-600 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-blue-100 dark:shadow-blue-900/30">
                <Building2 size={24} />
              </div>
              <button 
                onClick={() => onDelete(supplier.id)}
                className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-all"
              >
                <Trash2 size={18} />
              </button>
            </div>

            <h3 className="font-bold text-slate-800 dark:text-white text-lg mb-1 truncate pr-4">{supplier.name}</h3>
            <div className="space-y-3 mt-4">
              <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 text-sm">
                <CreditCard size={16} className="text-slate-400 dark:text-slate-500 shrink-0" />
                <span className="font-medium">{supplier.cnpj}</span>
              </div>
              <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 text-sm">
                <Mail size={16} className="text-slate-400 dark:text-slate-500 shrink-0" />
                <span className="font-medium truncate">{supplier.email || 'Email não informado'}</span>
              </div>
              <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 text-sm">
                <Phone size={16} className="text-slate-400 dark:text-slate-500 shrink-0" />
                <span className="font-medium">{supplier.phone || 'Telefone não informado'}</span>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-6 border-t border-slate-50 dark:border-slate-800 flex items-center justify-between relative">
            <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Ativo no Sistema</div>
            <button className="text-blue-600 dark:text-blue-400 font-bold text-xs hover:underline">Detalhes</button>
          </div>
        </div>
      ))}
    </div>
  );
};
