import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import {
  User,
  Lock,
  Sun,
  Moon,
  ShieldCheck,
  Building2,
  ChevronRight,
  AlertCircle,
} from 'lucide-react';
import { SystemUser } from '../types';
import { login as apiLogin } from '../services/api';

/** Conforme doc backend: POST /auth/login espera JSON { username, password } */
interface LoginFormValues {
  username: string;
  password: string;
}

interface LoginProps {
  onLogin: (user: SystemUser) => void;
  users: SystemUser[];
  entityName: string;
  isDarkMode: boolean;
  toggleTheme: () => void;
  tenantId?: string;
  useApi?: boolean;
}

const Login: React.FC<LoginProps> = ({
  onLogin,
  users,
  entityName,
  isDarkMode,
  toggleTheme,
  tenantId,
  useApi = false,
}) => {
  const [isLoading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    defaultValues: { username: '', password: '' },
  });

  const onSubmit = async (data: LoginFormValues) => {
    setLoading(true);
    setError('');

    if (useApi) {
      try {
        const { user } = await apiLogin(data.username, data.password, tenantId);
        onLogin({
          id: user.id,
          name: user.name,
          username: user.username,
          password: '',
          role: user.role,
          createdAt: new Date().toISOString(),
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Credenciais inválidas. Tente novamente.');
      } finally {
        setLoading(false);
      }
      return;
    }

    setTimeout(() => {
      const validUser = users.find((u) => u.username === data.username && u.password === data.password);
      if (validUser) {
        onLogin(validUser);
      } else {
        setError('Credenciais inválidas. Verifique usuário e senha.');
      }
      setLoading(false);
    }, 800);
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-slate-50 dark:bg-slate-950 transition-colors duration-500">
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-blue-600/10 dark:bg-blue-600/5 rounded-full blur-3xl animate-pulse" />
        <div className="absolute top-1/2 -right-24 w-80 h-80 bg-emerald-600/10 dark:bg-emerald-600/5 rounded-full blur-3xl" />
        <div className="absolute -bottom-24 left-1/2 -translate-x-1/2 w-[500px] h-[300px] bg-indigo-600/10 dark:bg-indigo-600/5 rounded-full blur-3xl" />
      </div>

      <div className="w-full max-w-md p-6 relative z-10 animate-in fade-in zoom-in duration-700">
        <button
          type="button"
          onClick={toggleTheme}
          className="absolute top-0 right-6 p-2 rounded-full bg-white/50 dark:bg-slate-900/50 backdrop-blur-md border border-white/20 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:scale-110 transition-all shadow-sm"
        >
          {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
        </button>

        <div className="bg-white dark:bg-slate-900/80 backdrop-blur-xl rounded-[2.5rem] shadow-2xl shadow-slate-200/50 dark:shadow-black/50 border border-white dark:border-slate-800 p-8 md:p-10">
          <div className="flex flex-col items-center mb-10">
            <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center text-white font-black text-3xl shadow-xl shadow-blue-500/30 mb-6 rotate-3 hover:rotate-0 transition-transform duration-500">
              G
            </div>
            <h1 className="text-2xl font-black text-slate-800 dark:text-white tracking-tight text-center">
              Gestão Pública ERP
            </h1>
            <div className="mt-2 px-4 py-1.5 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center gap-2">
              <Building2 size={12} className="text-slate-400" />
              <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest truncate max-w-[200px]">
                {entityName}
              </span>
            </div>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {error && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900/30 p-4 rounded-2xl flex items-center gap-3 text-red-600 dark:text-red-400 animate-in slide-in-from-top-2">
                <AlertCircle size={18} className="shrink-0" />
                <p className="text-xs font-bold leading-tight">{error}</p>
              </div>
            )}

            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">
                  Usuário / Login
                </label>
                <div className="relative group">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 dark:text-slate-600 group-focus-within:text-blue-500 transition-colors">
                    <User size={20} />
                  </div>
                  <input
                    type="text"
                    placeholder="Digite seu usuário"
                    className="w-full pl-12 p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 focus:bg-white dark:focus:bg-slate-900 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all font-medium text-slate-700 dark:text-white"
                    {...register('username', { required: 'Informe o usuário' })}
                  />
                </div>
                {errors.username && (
                  <p className="text-xs text-red-500 font-medium ml-1">{errors.username.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center ml-1">
                  <label className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                    Senha de Acesso
                  </label>
                </div>
                <div className="relative group">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 dark:text-slate-600 group-focus-within:text-blue-500 transition-colors">
                    <Lock size={20} />
                  </div>
                  <input
                    type="password"
                    placeholder="••••••••"
                    className="w-full pl-12 p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 focus:bg-white dark:focus:bg-slate-900 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all font-medium text-slate-700 dark:text-white"
                    {...register('password', { required: 'Informe a senha' })}
                  />
                </div>
                {errors.password && (
                  <p className="text-xs text-red-500 font-medium ml-1">{errors.password.message}</p>
                )}
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white p-5 rounded-2xl font-black text-lg shadow-xl shadow-blue-500/30 flex items-center justify-center gap-3 transition-all active:scale-95 disabled:opacity-70 group"
            >
              {isLoading ? (
                <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  Entrar no Sistema
                  <ChevronRight size={22} className="group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800 flex flex-col items-center gap-4">
            <div className="flex items-center gap-2 text-slate-400 dark:text-slate-500">
              <ShieldCheck size={16} />
              <span className="text-[10px] font-bold uppercase tracking-widest">Acesso Monitorado & Seguro</span>
            </div>
            <p className="text-[10px] text-slate-400 text-center leading-relaxed">
              Caso não possua acesso, contate o administrador
              <br />
              do órgão para solicitar credenciais.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
