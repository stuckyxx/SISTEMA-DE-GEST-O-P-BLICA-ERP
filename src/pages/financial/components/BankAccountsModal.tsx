import React from 'react';
import { Settings2, X, Plus, Building, Landmark, Trash2 } from 'lucide-react';
import { BankAccount } from '../../../types';

interface BankAccountsModalProps {
  isOpen: boolean;
  onClose: () => void;
  accounts: BankAccount[];
  newAccount: Partial<BankAccount>;
  setNewAccount: React.Dispatch<React.SetStateAction<Partial<BankAccount>>>;
  onAdd: () => void;
  onDelete: (id: string) => void;
}

export const BankAccountsModal: React.FC<BankAccountsModalProps> = ({
  isOpen,
  onClose,
  accounts,
  newAccount,
  setNewAccount,
  onAdd,
  onDelete
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-900/70 dark:bg-black/80 backdrop-blur-md animate-in fade-in duration-300">
      <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] w-full max-w-2xl overflow-hidden flex flex-col shadow-2xl border border-white/20 dark:border-slate-800">
        <div className="px-8 py-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-white dark:bg-slate-900">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-xl flex items-center justify-center">
              <Settings2 size={20} />
            </div>
            <h3 className="text-xl font-bold text-slate-800 dark:text-white">Contas Bancárias das Secretarias</h3>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full text-slate-500 dark:text-slate-400">
            <X size={24} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-8 space-y-8 max-h-[70vh]">
          {/* Add New Account Form */}
          <div className="bg-slate-50 dark:bg-slate-950 p-6 rounded-3xl space-y-4 border border-slate-100 dark:border-slate-800">
            <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-2">
              <Plus size={14} /> Cadastrar Nova Conta
            </p>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 ml-1 uppercase">Secretaria *</label>
                <div className="relative">
                  <Building className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
                  <input 
                    type="text" 
                    placeholder="Saúde, Educação..." 
                    className="w-full pl-10 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 outline-none focus:ring-2 focus:ring-blue-500/20 text-sm text-slate-800 dark:text-white"
                    value={newAccount.secretariat}
                    onChange={(e) => setNewAccount({...newAccount, secretariat: e.target.value})}
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 ml-1 uppercase">Banco *</label>
                <input 
                  type="text" 
                  placeholder="Banco do Brasil, Caixa..." 
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 outline-none focus:ring-2 focus:ring-blue-500/20 text-sm text-slate-800 dark:text-white"
                  value={newAccount.bank}
                  onChange={(e) => setNewAccount({...newAccount, bank: e.target.value})}
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 ml-1 uppercase">Agência</label>
                <input 
                  type="text" 
                  placeholder="0001-2" 
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 outline-none focus:ring-2 focus:ring-blue-500/20 text-sm text-slate-800 dark:text-white"
                  value={newAccount.agency}
                  onChange={(e) => setNewAccount({...newAccount, agency: e.target.value})}
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 ml-1 uppercase">Conta Corrente *</label>
                <input 
                  type="text" 
                  placeholder="12345-6" 
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 outline-none focus:ring-2 focus:ring-blue-500/20 text-sm text-slate-800 dark:text-white"
                  value={newAccount.account}
                  onChange={(e) => setNewAccount({...newAccount, account: e.target.value})}
                />
              </div>
            </div>
            <button 
              onClick={onAdd}
              className="w-full bg-blue-600 text-white font-bold py-2.5 rounded-xl hover:bg-blue-700 transition-all flex items-center justify-center gap-2 mt-2"
            >
              <Plus size={18} /> Adicionar Conta à Lista
            </button>
          </div>

          {/* List of accounts */}
          <div className="space-y-3">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Contas Ativas no Sistema</p>
            {accounts.map(acc => (
              <div key={acc.id} className="flex items-center justify-between p-4 rounded-2xl border border-slate-100 dark:border-slate-800 hover:border-blue-100 dark:hover:border-blue-800 transition-all group bg-white dark:bg-slate-900">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 rounded-xl flex items-center justify-center group-hover:bg-blue-50 dark:group-hover:bg-blue-900/20 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    <Landmark size={20} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-bold text-slate-800 dark:text-white text-sm">{acc.bank}</p>
                      <span className="text-[9px] font-black bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 px-1.5 py-0.5 rounded uppercase">{acc.secretariat}</span>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Ag: {acc.agency} | CC: {acc.account}</p>
                  </div>
                </div>
                <button 
                  onClick={() => onDelete(acc.id)}
                  className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-all"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            ))}
            {accounts.length === 0 && (
              <p className="text-center text-sm text-slate-400 py-4">Nenhuma conta cadastrada.</p>
            )}
          </div>
        </div>

        <div className="p-6 bg-slate-50 dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 text-center">
          <button 
            onClick={onClose}
            className="font-bold text-blue-600 dark:text-blue-400 hover:underline text-sm"
          >
            Concluído
          </button>
        </div>
      </div>
    </div>
  );
};
