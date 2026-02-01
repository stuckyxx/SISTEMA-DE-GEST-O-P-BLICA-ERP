import React from 'react';
import { 
  Search, Briefcase, Building2, Gavel, FileBadge, 
  Pencil, Trash2, ChevronRight, Layers 
} from 'lucide-react';
import { AppState, Contract } from '../../../types';
import { formatCurrency } from '../../../utils/format';

interface ContractListProps {
  filteredContracts: Contract[];
  state: AppState;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  onEdit: (e: React.MouseEvent, contract: Contract) => void;
  onDelete: (e: React.MouseEvent, id: string) => void;
  selectedContract: Contract | null;
  onSelect: (contract: Contract) => void;
  getValidityProgress: (start: string, end: string) => number;
  getStatus: (end: string) => 'Ativo' | 'Vencido';
}

const ContractList: React.FC<ContractListProps> = ({
  filteredContracts,
  state,
  searchTerm,
  setSearchTerm,
  onEdit,
  onDelete,
  selectedContract,
  onSelect,
  getValidityProgress,
  getStatus
}) => {
  return (
    <div className="space-y-6">
      <div className="relative group">
        <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
          <Search className="text-slate-400 group-focus-within:text-blue-500 transition-colors" size={20} />
        </div>
        <input 
          type="text" 
          placeholder="Pesquisar por número ou empresa..." 
          className="w-full bg-white dark:bg-slate-900 pl-12 pr-4 py-4 rounded-2xl border border-slate-200 dark:border-slate-800 outline-none focus:ring-4 focus:ring-blue-100 dark:focus:ring-blue-900/30 focus:border-blue-400 transition-all text-slate-700 dark:text-slate-200 font-medium shadow-sm"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 gap-4">
        {filteredContracts.map(contract => {
          const supplier = state.suppliers.find(s => s.id === contract.supplierId);
          const progress = getValidityProgress(contract.startDate, contract.endDate);
          const status = getStatus(contract.endDate);
          const linkedAta = state.atas.find(a => a.id === contract.ataId);
          
          return (
            <div 
              key={contract.id} 
              className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 hover:border-blue-300 dark:hover:border-blue-700 transition-all cursor-pointer overflow-hidden group"
              onClick={() => onSelect(contract)}
            >
              <div className="p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
                
                {/* Coluna 1: Info Principal (5 colunas) */}
                <div className="lg:col-span-5 flex items-start gap-4">
                  <div className="w-12 h-12 bg-slate-50 dark:bg-slate-800 text-slate-400 dark:text-slate-300 rounded-xl flex items-center justify-center shrink-0 group-hover:bg-blue-50 dark:group-hover:bg-blue-900/30 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-all">
                    <Briefcase size={24} />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-800 dark:text-white text-lg">Contrato {contract.number}</h3>
                    <div className="flex flex-col gap-1 mt-1">
                      <p className="text-sm text-slate-500 dark:text-slate-400 flex items-center gap-1.5 font-medium">
                        <Building2 size={14} className="text-slate-400" />
                        {supplier?.name || 'Fornecedor não encontrado'}
                      </p>
                      {linkedAta ? (
                        <p className="text-xs text-indigo-600 dark:text-indigo-400 flex items-center gap-1.5 font-bold">
                          <FileBadge size={14} />
                          Vinculado à Ata: {linkedAta.processNumber} ({contract.secretariat})
                        </p>
                      ) : (
                        <p className="text-sm text-slate-500 dark:text-slate-400 flex items-center gap-1.5 font-medium">
                          <Gavel size={14} className="text-slate-400" />
                          {contract.biddingModality}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Coluna 2: Status e Vigência (4 colunas) */}
                <div className="lg:col-span-4 border-l border-r border-slate-100 dark:border-slate-800 px-6 hidden lg:block">
                   <div className="flex justify-between items-center mb-2">
                     <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Status / Vigência</span>
                     <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded ${status === 'Ativo' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'}`}>
                       {status}
                     </span>
                   </div>
                   <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-4 relative overflow-hidden">
                      <div 
                        className={`h-full rounded-full transition-all duration-1000 ${status === 'Ativo' ? 'bg-emerald-500' : 'bg-red-500'}`}
                        style={{ width: `${progress}%` }}
                      ></div>
                      <span className="absolute inset-0 flex items-center justify-center text-[9px] font-bold text-slate-600 dark:text-slate-300">
                        {progress}% Decorrido
                      </span>
                   </div>
                   <p className="text-[10px] text-center mt-1 text-slate-400">
                     {new Date(contract.startDate).toLocaleDateString()} — {new Date(contract.endDate).toLocaleDateString()}
                   </p>
                </div>

                {/* Coluna 3: Ações e Valor (3 colunas) */}
                <div className="lg:col-span-3 flex items-center justify-between lg:justify-end gap-6">
                  <div className="text-right">
                    <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Valor Global</p>
                    <p className="font-black text-slate-800 dark:text-slate-200 text-xl tracking-tight">
                      {formatCurrency(contract.globalValue)}
                    </p>
                  </div>
                  <div className="flex gap-1">
                    <button 
                      onClick={(e) => onEdit(e, contract)}
                      className="p-2 text-slate-300 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-xl transition-all"
                      title="Editar Contrato"
                    >
                      <Pencil size={18} />
                    </button>
                    <button 
                      onClick={(e) => onDelete(e, contract.id)}
                      className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-all"
                      title="Excluir Contrato"
                    >
                      <Trash2 size={18} />
                    </button>
                    <div className={`p-2 rounded-xl transition-all ${selectedContract?.id === contract.id ? 'bg-blue-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500'}`}>
                      <ChevronRight size={18} className={`transition-transform duration-300 ${selectedContract?.id === contract.id ? 'rotate-90' : ''}`} />
                    </div>
                  </div>
                </div>
              </div>

              {selectedContract?.id === contract.id && (
                <div className="bg-slate-50/50 dark:bg-slate-950/50 p-6 border-t border-slate-200 dark:border-slate-800 animate-in slide-in-from-top-4 duration-300">
                  <div className="grid grid-cols-1 gap-3">
                    {contract.items.map(item => (
                      <div key={item.id} className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-700 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 bg-blue-50 dark:bg-blue-900/20 text-blue-500 rounded-lg flex items-center justify-center">
                            <Layers size={18} />
                          </div>
                          <div>
                            <p className="font-bold text-slate-800 dark:text-white">{item.description}</p>
                            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">UN: {item.unit}</p>
                          </div>
                        </div>
                        <div className="grid grid-cols-3 gap-8 md:text-right">
                          <div>
                            <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest">Contratado</p>
                            <p className="font-bold text-slate-700 dark:text-slate-300">{item.originalQty}</p>
                          </div>
                          <div>
                            <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest">Saldo</p>
                            <p className={`font-black ${item.currentBalance < (item.originalQty * 0.1) ? 'text-red-500' : 'text-blue-600 dark:text-blue-400'}`}>{item.currentBalance}</p>
                          </div>
                          <div>
                            <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest">Unitário</p>
                            <p className="font-bold text-slate-700 dark:text-slate-300">{formatCurrency(item.unitPrice)}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ContractList;