import React from 'react';
import { 
  User, 
  Mail, 
  Lock, 
  Shield,
  Save 
} from 'lucide-react';
import { SystemUser } from '../../../types';

interface UserFormProps {
  isOpen: boolean;
  onClose: () => void;
  form: Partial<SystemUser>;
  setForm: React.Dispatch<React.SetStateAction<Partial<SystemUser>>>;
  onSave: () => void;
}

export const UserForm: React.FC<UserFormProps> = ({
  isOpen,
  onClose,
  form,
  setForm,
  onSave
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 dark:bg-black/80 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] w-full max-w-md overflow-hidden flex flex-col shadow-2xl scale-in-center border border-white/10">
        <div className="px-8 py-8 flex flex-col items-center text-center">
          <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-3xl flex items-center justify-center mb-4 shadow-inner">
            <User size={32} />
          </div>
          <h3 className="text-2xl font-bold text-slate-800 dark:text-white tracking-tight">Novo Usuário</h3>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Preencha os dados do novo usuário.</p>
        </div>

        <div className="px-8 pb-8 space-y-4">
          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-slate-400 uppercase ml-1 tracking-widest">Nome Completo *</label>
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 dark:text-slate-500" size={18} />
              <input 
                type="text" 
                placeholder="Nome completo do usuário" 
                className="w-full pl-12 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 focus:bg-white dark:focus:bg-slate-900 outline-none focus:ring-4 focus:ring-blue-500/10 dark:focus:ring-blue-500/20 transition-all font-medium text-slate-700 dark:text-slate-200"
                value={form.name || ''}
                onChange={(e) => setForm({...form, name: e.target.value})}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-slate-400 uppercase ml-1 tracking-widest">Username *</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 dark:text-slate-500" size={18} />
              <input 
                type="text" 
                placeholder="nome.usuario" 
                className="w-full pl-12 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 focus:bg-white dark:focus:bg-slate-900 outline-none focus:ring-4 focus:ring-blue-500/10 dark:focus:ring-blue-500/20 transition-all font-medium text-slate-700 dark:text-slate-200"
                value={form.username || ''}
                onChange={(e) => setForm({...form, username: e.target.value.toLowerCase().replace(/\s/g, '.')})}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-slate-400 uppercase ml-1 tracking-widest">Senha *</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 dark:text-slate-500" size={18} />
              <input 
                type="password" 
                placeholder="Senha de acesso" 
                className="w-full pl-12 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 focus:bg-white dark:focus:bg-slate-900 outline-none focus:ring-4 focus:ring-blue-500/10 dark:focus:ring-blue-500/20 transition-all font-medium text-slate-700 dark:text-slate-200"
                value={form.password || ''}
                onChange={(e) => setForm({...form, password: e.target.value})}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-slate-400 uppercase ml-1 tracking-widest">Perfil *</label>
            <div className="relative">
              <Shield className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 dark:text-slate-500" size={18} />
              <select
                className="w-full pl-12 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 focus:bg-white dark:focus:bg-slate-900 outline-none focus:ring-4 focus:ring-blue-500/10 dark:focus:ring-blue-500/20 transition-all font-medium text-slate-700 dark:text-slate-200 appearance-none cursor-pointer"
                value={form.role || 'viewer'}
                onChange={(e) => setForm({...form, role: e.target.value as 'admin' | 'viewer'})}
              >
                <option value="viewer">Visualizador</option>
                <option value="admin">Administrador</option>
              </select>
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
