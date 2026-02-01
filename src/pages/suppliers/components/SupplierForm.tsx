import React from 'react';
import { 
  Building2, 
  User, 
  CreditCard, 
  Mail, 
  Phone, 
  Save 
} from 'lucide-react';
import { Supplier } from '../../../types';

interface SupplierFormProps {
  isOpen: boolean;
  onClose: () => void;
  form: Partial<Supplier>;
  setForm: React.Dispatch<React.SetStateAction<Partial<Supplier>>>;
  onSave: () => void;
  formatCNPJ: (value: string) => string;
  formatPhone: (value: string) => string;
}

export const SupplierForm: React.FC<SupplierFormProps> = ({
  isOpen,
  onClose,
  form,
  setForm,
  onSave,
  formatCNPJ,
  formatPhone
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 dark:bg-black/80 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] w-full max-w-md overflow-hidden flex flex-col shadow-2xl scale-in-center border border-white/10">
        <div className="px-8 py-8 flex flex-col items-center text-center">
          <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-3xl flex items-center justify-center mb-4 shadow-inner">
            <Building2 size={32} />
          </div>
          <h3 className="text-2xl font-bold text-slate-800 dark:text-white tracking-tight">Novo Fornecedor</h3>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Preencha os dados oficiais da empresa.</p>
        </div>

        <div className="px-8 pb-8 space-y-4">
          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-slate-400 uppercase ml-1 tracking-widest">Razão Social *</label>
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 dark:text-slate-500" size={18} />
              <input 
                type="text" 
                placeholder="Nome da empresa" 
                className="w-full pl-12 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 focus:bg-white dark:focus:bg-slate-900 outline-none focus:ring-4 focus:ring-blue-500/10 dark:focus:ring-blue-500/20 transition-all font-medium text-slate-700 dark:text-slate-200"
                value={form.name}
                onChange={(e) => setForm({...form, name: e.target.value})}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-slate-400 uppercase ml-1 tracking-widest">CNPJ *</label>
            <div className="relative">
              <CreditCard className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 dark:text-slate-500" size={18} />
              <input 
                type="text" 
                placeholder="00.000.000/0000-00" 
                className="w-full pl-12 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 focus:bg-white dark:focus:bg-slate-900 outline-none focus:ring-4 focus:ring-blue-500/10 dark:focus:ring-blue-500/20 transition-all font-medium text-slate-700 dark:text-slate-200"
                value={form.cnpj}
                onChange={(e) => setForm({...form, cnpj: formatCNPJ(e.target.value)})}
                maxLength={18}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-slate-400 uppercase ml-1 tracking-widest">E-mail Corporativo</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 dark:text-slate-500" size={18} />
              <input 
                type="email" 
                placeholder="contato@empresa.com" 
                className="w-full pl-12 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 focus:bg-white dark:focus:bg-slate-900 outline-none focus:ring-4 focus:ring-blue-500/10 dark:focus:ring-blue-500/20 transition-all font-medium text-slate-700 dark:text-slate-200"
                value={form.email}
                onChange={(e) => setForm({...form, email: e.target.value})}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-slate-400 uppercase ml-1 tracking-widest">Telefone</label>
            <div className="relative">
              <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 dark:text-slate-500" size={18} />
              <input 
                type="text" 
                placeholder="(00) 0000-0000" 
                className="w-full pl-12 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 focus:bg-white dark:focus:bg-slate-900 outline-none focus:ring-4 focus:ring-blue-500/10 dark:focus:ring-blue-500/20 transition-all font-medium text-slate-700 dark:text-slate-200"
                value={form.phone}
                onChange={(e) => setForm({...form, phone: formatPhone(e.target.value)})}
                maxLength={15}
              />
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <button 
              onClick={onClose}
              className="flex-1 px-6 py-4 rounded-2xl font-bold text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all"
            >
              Cancelar
            </button>
            <button 
              onClick={onSave}
              className="flex-1 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-4 rounded-2xl font-bold transition-all shadow-xl shadow-blue-200 dark:shadow-blue-900/30"
            >
              <Save size={20} />
              Salvar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
