import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  CreditCard, 
  Mail, 
  Phone,
  X,
  Save
} from 'lucide-react';
import { Supplier } from '../../../types';
import { useAlert } from '../../../contexts/AlertContext';

interface SupplierDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  supplier: Supplier | null;
  onSave: (supplier: Supplier) => void;
  formatCNPJ: (value: string) => string;
  formatPhone: (value: string) => string;
  isLoading?: boolean;
}

export const SupplierDetailsModal: React.FC<SupplierDetailsModalProps> = ({
  isOpen,
  onClose,
  supplier,
  onSave,
  formatCNPJ,
  formatPhone,
  isLoading = false
}) => {
  const { alert } = useAlert();
  const [form, setForm] = useState<Partial<Supplier>>({
    name: '',
    cnpj: '',
    phone: '',
    email: '',
  });

  useEffect(() => {
    if (supplier) {
      setForm({
        name: supplier.name,
        cnpj: supplier.cnpj,
        phone: supplier.phone,
        email: supplier.email,
      });
    }
  }, [supplier]);

  if (!isOpen || !supplier) return null;

  const handleSave = async () => {
    if (!form.name || !form.cnpj) {
      await alert({
        title: 'Campos Obrigatórios',
        message: 'Razão Social e CNPJ são campos obrigatórios.',
      });
      return;
    }
    onSave({
      ...supplier,
      ...form,
    } as Supplier);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 dark:bg-black/80 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] w-full max-w-md overflow-hidden flex flex-col shadow-2xl scale-in-center border border-white/10">
        <div className="px-8 py-8 flex flex-col items-center text-center relative">
          <button
            onClick={onClose}
            className="absolute top-6 right-6 p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all"
          >
            <X size={20} />
          </button>
          
          <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-3xl flex items-center justify-center mb-4 shadow-inner">
            <Building2 size={32} />
          </div>
          <h3 className="text-2xl font-bold text-slate-800 dark:text-white tracking-tight">Editar Fornecedor</h3>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Altere os dados do fornecedor.</p>
        </div>

        <div className="px-8 pb-8 space-y-6">
          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-400 uppercase ml-1 tracking-widest">Razão Social *</label>
              <div className="relative">
                <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 dark:text-slate-500" size={18} />
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
          </div>

          <div className="flex gap-3 pt-4">
            <button 
              onClick={onClose}
              disabled={isLoading}
              className="flex-1 px-6 py-4 rounded-2xl font-bold text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancelar
            </button>
            <button 
              onClick={handleSave}
              disabled={isLoading}
              className="flex-1 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-4 rounded-2xl font-bold transition-all shadow-xl shadow-blue-200 dark:shadow-blue-900/30 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <div className="animate-spin h-5 w-5 border-2 border-current border-t-transparent rounded-full" />
              ) : (
                <>
                  <Save size={20} />
                  Salvar Alterações
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
