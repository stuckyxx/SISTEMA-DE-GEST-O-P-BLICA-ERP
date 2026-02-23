import React, { useState, useEffect } from 'react';
import { 
  User, 
  Mail, 
  Lock, 
  Shield,
  X,
  Save
} from 'lucide-react';
import { SystemUser } from '../../../types';
import { useAlert } from '../../../contexts/AlertContext';

interface UserDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: SystemUser | null;
  onSave: (user: SystemUser) => void;
  isLoading?: boolean;
}

export const UserDetailsModal: React.FC<UserDetailsModalProps> = ({
  isOpen,
  onClose,
  user,
  onSave,
  isLoading = false
}) => {
  const { alert } = useAlert();
  const [form, setForm] = useState<Partial<SystemUser>>({
    name: '',
    username: '',
    password: '',
    role: 'viewer',
  });

  useEffect(() => {
    if (user) {
      setForm({
        name: user.name,
        username: user.username,
        password: '', // Não preencher senha por segurança
        role: user.role,
      });
    }
  }, [user]);

  if (!isOpen || !user) return null;

  const handleSave = async () => {
    if (!form.name || !form.username) {
      await alert({
        title: 'Campos Obrigatórios',
        message: 'Nome e Username são campos obrigatórios.',
      });
      return;
    }
    onSave({
      ...user,
      ...form,
    } as SystemUser);
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
            <User size={32} />
          </div>
          <h3 className="text-2xl font-bold text-slate-800 dark:text-white tracking-tight">Editar Usuário</h3>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Altere os dados do usuário.</p>
        </div>

        <div className="px-8 pb-8 space-y-6">
          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-400 uppercase ml-1 tracking-widest">Nome Completo *</label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 dark:text-slate-500" size={18} />
                <input 
                  type="text" 
                  placeholder="Nome completo do usuário" 
                  className="w-full pl-12 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 focus:bg-white dark:focus:bg-slate-900 outline-none focus:ring-4 focus:ring-blue-500/10 dark:focus:ring-blue-500/20 transition-all font-medium text-slate-700 dark:text-slate-200"
                  value={form.name}
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
                  value={form.username}
                  onChange={(e) => setForm({...form, username: e.target.value.toLowerCase().replace(/\s/g, '.')})}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-400 uppercase ml-1 tracking-widest">Nova Senha (deixe em branco para manter)</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 dark:text-slate-500" size={18} />
                <input 
                  type="password" 
                  placeholder="Deixe em branco para manter a senha atual" 
                  className="w-full pl-12 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 focus:bg-white dark:focus:bg-slate-900 outline-none focus:ring-4 focus:ring-blue-500/10 dark:focus:ring-blue-500/20 transition-all font-medium text-slate-700 dark:text-slate-200"
                  value={form.password}
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
