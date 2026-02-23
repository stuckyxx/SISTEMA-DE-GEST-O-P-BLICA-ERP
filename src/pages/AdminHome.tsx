import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import {
  Building2,
  Plus,
  Database,
  ArrowRight,
  Trash2,
  ShieldCheck,
  Server,
  LayoutDashboard,
  Lock,
  LogOut,
  AlertTriangle,
  ArrowLeft,
  Settings,
  Users,
  History,
  Save,
  X,
  UserPlus,
  Activity,
  Key,
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Tenant, AppState, SystemUser, SystemLog } from '../types';
import { useAlert } from '../contexts/AlertContext';
import {
  listClientes,
  getClienteById,
  createCliente,
  deleteCliente,
  updateCliente,
  listUsuarios,
  createUsuario,
  deleteUsuario,
  adminLogin,
  clearStoredToken,
} from '../services/api';

const MASTER_TENANT_ID = 'master';

const emptyAppState = (entityName: string): AppState => ({
  entity: {
    name: entityName,
    secretary: '',
    cnpj: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    phone: '',
    email: '',
    website: '',
  },
  users: [],
  logs: [],
  suppliers: [],
  accounts: [],
  atas: [],
  contracts: [],
  invoices: [],
  serviceOrders: [],
});

const AdminHome: React.FC = () => {
  const navigate = useNavigate();
  const { alert, confirm, error: showError, success } = useAlert();

  // Nota: O middleware detecta automaticamente que estamos no contexto admin pela URL /master-panel
  // e configura o adminApiClient corretamente. A verificação de autenticação abaixo é apenas
  // para controlar o estado da UI (mostrar login vs conteúdo).
  const [isMasterAuthenticated, setIsMasterAuthenticated] = useState(() => {
    return sessionStorage.getItem('master_auth') === 'true';
  });
  const [authError, setAuthError] = useState('');
  const [authLoading, setAuthLoading] = useState(false);

  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [tenantsLoading, setTenantsLoading] = useState(false);
  const [tenantsError, setTenantsError] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);

  const [managedTenantId, setManagedTenantId] = useState<string | null>(null);
  const [managedDb, setManagedDb] = useState<AppState | null>(null);
  const [managerTab, setManagerTab] = useState<'info' | 'users' | 'logs' | 'config'>('info');

  /** Doc backend: POST /auth/login → JSON { username, password } */
  const masterLoginForm = useForm<{ username: string; password: string }>({
    defaultValues: { username: '', password: '' },
  });

  /** Doc backend: POST /clientes/ → ClienteCreate (nome_fantasia, razao_social, cnpj, uf, data_inicio, data_fim, url_instancia, ...) */
  const newClienteForm = useForm<{
    nome_fantasia: string;
    razao_social: string;
    cnpj: string;
    uf: string;
    data_inicio: string;
    data_fim: string;
    url_instancia: string;
  }>({
    defaultValues: {
      nome_fantasia: '',
      razao_social: '',
      cnpj: '',
      uf: 'MA',
      data_inicio: '',
      data_fim: '',
      url_instancia: '',
    },
  });

  /** Doc backend: POST /usuarios/ → UsuarioCreate (username, password, full_name/nome, role, entidade_id) */
  const newUserFormHook = useForm<{ name: string; username: string; password: string; role: string }>({
    defaultValues: { name: '', username: '', password: '', role: 'viewer' },
  });

  // Limpa dados antigos do localStorage (migração: painel usa apenas API)
  useEffect(() => {
    if (!isMasterAuthenticated) return;
    try {
      localStorage.removeItem('erp_tenants');
      const keysToRemove: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key?.startsWith('erp_db_')) keysToRemove.push(key);
      }
      keysToRemove.forEach((k) => localStorage.removeItem(k));
    } catch (_) {}
  }, [isMasterAuthenticated]);

  useEffect(() => {
    if (!isMasterAuthenticated) return;
    setTenantsLoading(true);
    setTenantsError(null);
    listClientes()
      .then((list) => {
        setTenants(
          list.map((c) => ({
            id: String(c.id),
            name: c.nome_fantasia,
            urlInstancia: c.url_instancia || undefined,
            createdAt: '',
          }))
        );
      })
      .catch((err) => {
        const msg = err instanceof Error ? err.message : String(err);
        const isUnauthorized = /401|unauthorized|não autorizado|não autenticado|not authenticated/i.test(msg);
        setTenantsError(
          isUnauthorized
            ? 'É necessário estar logado na API. Faça login e tente novamente.'
            : msg || 'Erro ao carregar clientes.'
        );
        setTenants([]);
      })
      .finally(() => setTenantsLoading(false));
  }, [isMasterAuthenticated]);

  useEffect(() => {
    if (!managedTenantId) {
      setManagedDb(null);
      return;
    }
    const eid = parseInt(managedTenantId, 10);
    if (!Number.isFinite(eid)) {
      setManagedDb(null);
      return;
    }
    getClienteById(eid)
      .then((cliente) => {
        const baseState = {
          ...emptyAppState(cliente.nome_fantasia),
          entity: {
            name: cliente.nome_fantasia,
            secretary: '',
            cnpj: cliente.cnpj,
            address: '',
            city: '',
            state: cliente.uf,
            zipCode: '',
            phone: '',
            email: '',
            website: cliente.url_instancia || '',
          },
        };
        listUsuarios(eid)
          .then((usuarios) => {
            const users: SystemUser[] = usuarios
              .filter((u) => u.entidade_id == null || u.entidade_id === eid)
              .map((u) => ({
                id: String(u.id),
                name: (u.full_name ?? u.nome ?? u.username) || '',
                username: u.username,
                password: '',
                role: (u.role === 'admin' || u.role === 'viewer' ? u.role : 'viewer') as 'admin' | 'viewer',
                createdAt: '',
              }));
            setManagedDb({ ...baseState, users });
          })
          .catch(() => {
            setManagedDb({ ...baseState, users: [] });
          });
      })
      .catch(() => setManagedDb(null));
  }, [managedTenantId]);

  const onMasterLogin = async (data: { username: string; password: string }) => {
    setAuthError('');
    setAuthLoading(true);
    try {
      await adminLogin(data.username.trim(), data.password, MASTER_TENANT_ID);
      sessionStorage.setItem('master_auth', 'true');
      setIsMasterAuthenticated(true);
    } catch (err) {
      setAuthError(err instanceof Error ? err.message : 'Credenciais inválidas. Tente novamente.');
    } finally {
      setAuthLoading(false);
    }
  };

  type NewClienteFormValues = {
    nome_fantasia: string;
    razao_social: string;
    cnpj: string;
    uf: string;
    data_inicio: string;
    data_fim: string;
    url_instancia: string;
  };

  const onCreateCliente = async (data: NewClienteFormValues) => {
    const cnpjRaw = (data.cnpj || '').trim().replace(/\D/g, '');
    if (cnpjRaw.length !== 14) {
      await alert({
        title: 'CNPJ Inválido',
        message: 'CNPJ deve conter 14 dígitos.',
      });
      return;
    }
    const cnpj = cnpjRaw.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, '$1.$2.$3/$4-$5');
    const hoje = new Date();
    const dataInicio = data.data_inicio || hoje.toISOString().slice(0, 10);
    const dataFim = data.data_fim || new Date(hoje.getFullYear() + 1, hoje.getMonth(), hoje.getDate()).toISOString().slice(0, 10);
    setCreateLoading(true);
    try {
      const created = await createCliente({
        nome_fantasia: data.nome_fantasia.trim(),
        razao_social: (data.razao_social || '').trim() || data.nome_fantasia.trim(),
        cnpj,
        uf: data.uf || 'MA',
        data_inicio: dataInicio,
        data_fim: dataFim,
        status_cliente: 'ATIVO',
        status_interno: 'IMPLANTACAO',
        url_instancia: (data.url_instancia || '').trim() || `https://${data.nome_fantasia.trim().toLowerCase().replace(/\s+/g, '-')}.gestao.com.br`,
      });
      setTenants((prev) => [...prev, { id: String(created.id), name: created.nome_fantasia, urlInstancia: created.url_instancia || undefined, createdAt: '' }]);
      setIsCreating(false);
      newClienteForm.reset();
    } catch (err) {
      await showError({
        title: 'Erro ao Criar Cliente',
        message: err instanceof Error ? err.message : 'Erro ao criar cliente.',
      });
    } finally {
      setCreateLoading(false);
    }
  };

  const handleDeleteTenant = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    const tenant = tenants.find((t) => t.id === id);
    const confirmed = await confirm({
      title: 'Confirmar Exclusão',
      message: `ATENÇÃO: Isso excluirá o cliente "${tenant?.name ?? id}". Esta ação é irreversível. Confirmar?`,
      confirmText: 'Excluir',
      cancelText: 'Cancelar',
    });
    if (!confirmed) return;
    const eid = parseInt(id, 10);
    if (!Number.isFinite(eid)) return;
    try {
      await deleteCliente(eid);
      setTenants((prev) => prev.filter((t) => t.id !== id));
      if (managedTenantId === id) setManagedTenantId(null);
    } catch (err) {
      await showError({
        title: 'Erro ao Excluir Cliente',
        message: err instanceof Error ? err.message : 'Erro ao excluir cliente.',
      });
    }
  };

  // --- MANAGER ACTIONS ---

  const saveManagedDb = async (updatedDb: AppState, _logAction?: string, _logDetails?: string) => {
    if (!managedTenantId) return;
    const eid = parseInt(managedTenantId, 10);
    if (!Number.isFinite(eid)) return;
    try {
      await updateCliente(eid, {
        nome_fantasia: updatedDb.entity.name,
        cnpj: updatedDb.entity.cnpj,
        uf: updatedDb.entity.state || null,
        url_instancia: updatedDb.entity.website || null,
      });
      setManagedDb(updatedDb);
    } catch (err) {
      await showError({
        title: 'Erro ao Salvar Configuração',
        message: err instanceof Error ? err.message : 'Erro ao salvar configuração.',
      });
    }
  };

  const onAddUser = async (data: { name: string; username: string; password: string; role: string }) => {
    if (!managedDb || !managedTenantId) return;
    const eid = parseInt(managedTenantId, 10);
    if (!Number.isFinite(eid)) return;
    try {
      const created = await createUsuario({
        nome: data.name.trim() || '',
        username: data.username.trim(),
        senha: data.password,
        role: data.role,
        entidade_id: eid,
      });
      const newUser: SystemUser = {
        id: String(created.id),
        name: (created.full_name ?? created.nome ?? created.username) || '',
        username: created.username,
        password: '',
        role: (created.role === 'admin' || created.role === 'viewer' ? created.role : 'viewer') as 'admin' | 'viewer',
        createdAt: '',
      };
      setManagedDb((prev) => (prev ? { ...prev, users: [...prev.users, newUser] } : null));
      newUserFormHook.reset();
    } catch (err) {
      await showError({
        title: 'Erro ao Criar Usuário',
        message: err instanceof Error ? err.message : 'Erro ao criar usuário no backend.',
      });
    }
  };

  const handleRemoveUser = async (userId: string) => {
    if (!managedDb) return;
    const confirmed = await confirm({
      title: 'Confirmar Remoção',
      message: 'Remover este usuário? Ele não poderá mais acessar a instância.',
      confirmText: 'Remover',
      cancelText: 'Cancelar',
    });
    if (!confirmed) return;
    const id = parseInt(userId, 10);
    if (!Number.isFinite(id)) return;
    try {
      await deleteUsuario(id);
      setManagedDb((prev) => (prev ? { ...prev, users: prev.users.filter((u) => u.id !== userId) } : null));
    } catch (err) {
      await showError({
        title: 'Erro ao Remover Usuário',
        message: err instanceof Error ? err.message : 'Erro ao remover usuário.',
      });
    }
  };

  const handleUpdateConfig = async () => {
    if (!managedDb) return;
    await saveManagedDb(managedDb);
    await success({
      title: 'Sucesso!',
      message: 'Configurações salvas.',
    });
  };

  // -----------------------

  if (!isMasterAuthenticated) {
    return (
       <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 relative">
        <button 
          onClick={() => navigate('/')} 
          className="absolute top-6 left-6 flex items-center gap-2 text-slate-500 hover:text-white transition-colors px-4 py-2 rounded-lg bg-slate-900 border border-slate-800 hover:border-slate-600 text-sm font-bold"
        >
          <ArrowLeft size={16} /> Voltar ao Início
        </button>

        <div className="w-full max-w-md bg-slate-900 border border-slate-800 p-8 rounded-3xl shadow-2xl animate-in fade-in zoom-in duration-300">
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 bg-red-500/10 rounded-2xl flex items-center justify-center border border-red-500/20">
              <Lock size={32} className="text-red-500" />
            </div>
          </div>
          <h2 className="text-2xl font-black text-white text-center mb-2">Painel Master</h2>
          <p className="text-slate-400 text-center text-sm mb-8">Área exclusiva para criação e gestão de bancos de dados dos clientes.</p>
          
          <form onSubmit={masterLoginForm.handleSubmit(onMasterLogin)} className="space-y-4">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase ml-1">Usuário (API)</label>
              <input
                type="text"
                autoComplete="username"
                className="w-full p-4 rounded-xl bg-slate-950 border border-slate-800 text-white outline-none focus:border-red-500 focus:ring-4 focus:ring-red-500/10 transition-all font-bold"
                placeholder="Ex: admin"
                {...masterLoginForm.register('username', { required: 'Informe o usuário' })}
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase ml-1">Senha (API)</label>
              <input
                type="password"
                autoComplete="current-password"
                className="w-full p-4 rounded-xl bg-slate-950 border border-slate-800 text-white outline-none focus:border-red-500 focus:ring-4 focus:ring-red-500/10 transition-all font-bold"
                placeholder="••••••••••••"
                {...masterLoginForm.register('password', { required: 'Informe a senha' })}
              />
            </div>

            {authError && (
              <div className="flex items-center gap-2 text-red-400 text-xs font-bold bg-red-950/30 p-3 rounded-lg border border-red-900/50">
                <AlertTriangle size={14} />
                {authError}
              </div>
            )}

            <Button
              type="submit"
              variant="secondary"
              className="w-full font-bold py-4 shadow-lg active:scale-95"
              disabled={authLoading}
            >
              {authLoading ? 'Entrando...' : 'Acessar Gerenciador'}
            </Button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 font-sans selection:bg-blue-500/30">
      
      {/* Navbar Admin */}
      <div className="border-b border-slate-800 bg-slate-950/50 backdrop-blur-md sticky top-0 z-20">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <ShieldCheck className="text-white" size={20} />
            </div>
            <div>
              <h1 className="font-bold text-lg tracking-tight text-white">Painel Central</h1>
              <p className="text-xs text-slate-400 font-medium uppercase tracking-wider">Gestão de Instâncias</p>
            </div>
          </div>
          <button
            onClick={() => {
              setIsMasterAuthenticated(false);
              sessionStorage.removeItem('master_auth');
              clearStoredToken(MASTER_TENANT_ID);
              navigate('/');
            }}
            className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-red-900/30 text-slate-300 hover:text-red-400 rounded-lg transition-all text-xs font-bold border border-slate-700"
          >
            <LogOut size={16} /> Encerrar Sessão
          </button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <h2 className="text-3xl font-black text-white mb-2">Clientes & Bancos de Dados</h2>
            <p className="text-slate-400 max-w-xl">
              Gerencie as instâncias do sistema. Cada cliente possui um banco de dados isolado e configurações próprias.
            </p>
          </div>
          <Button 
            onClick={() => setIsCreating(true)}
            icon={Plus}
            className="px-6 py-3 font-bold shadow-lg shadow-indigo-900/40 hover:scale-105 active:scale-95 bg-indigo-600 hover:bg-indigo-500 border-none"
          >
            Nova Instância
          </Button>
        </div>

        {tenantsError && (
          <div className="mb-6 p-4 rounded-xl bg-red-950/30 border border-red-900/50 text-red-400 text-sm">
            <div className="flex items-start gap-2">
              <AlertTriangle size={20} className="flex-shrink-0 mt-0.5" />
              <div>
                <p>{tenantsError}</p>
                {tenantsError.includes('logado') && (
                  <button
                    type="button"
                    onClick={() => navigate('/')}
                    className="mt-3 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-lg transition-colors"
                  >
                    Ir para Início e fazer login
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tenantsLoading ? (
            <div className="col-span-full text-center py-12 text-slate-500">Carregando clientes...</div>
          ) : (
          tenants.map(tenant => (
            <div 
              key={tenant.id}
              className="group bg-slate-800/50 hover:bg-slate-800 border border-slate-700 hover:border-indigo-500/50 rounded-2xl p-6 transition-all relative overflow-hidden"
            >
              <div className="flex justify-between items-start mb-6">
                <div className="w-12 h-12 bg-slate-900 rounded-xl flex items-center justify-center border border-slate-700 group-hover:border-indigo-500/30 group-hover:bg-indigo-500/10 transition-colors">
                  <Database className="text-slate-400 group-hover:text-indigo-400" size={24} />
                </div>
                <div className="flex gap-2">
                   {/* Botão GERENCIAR */}
                   <button 
                    onClick={() => setManagedTenantId(tenant.id)}
                    className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors z-10"
                    title="Configurar Banco e Usuários"
                  >
                    <Settings size={18} />
                  </button>
                  <button 
                    onClick={(e) => handleDeleteTenant(e, tenant.id)}
                    className="p-2 text-slate-600 hover:text-red-400 hover:bg-red-950/30 rounded-lg transition-colors z-10"
                    title="Excluir Banco"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>

              <h3 className="text-xl font-bold text-white mb-1">{tenant.name}</h3>
              <p className="text-sm text-slate-400 font-mono mb-6" title="Link da instância">
                {tenant.urlInstancia ? `/${tenant.urlInstancia}` : `ID: ${tenant.id}`}
              </p>

              <div className="flex items-center justify-between mt-auto pt-4 border-t border-slate-700/50">
                <span className="text-xs text-slate-500 font-medium flex items-center gap-1.5">
                  <Server size={12} />
                  Online
                </span>
                <button 
                   onClick={() => navigate(`/${tenant.urlInstancia || tenant.id}`, { state: { clientId: tenant.id } })}
                   className="flex items-center gap-1 text-sm font-bold text-indigo-400 hover:text-indigo-300 transition-colors"
                >
                  Acessar App <ArrowRight size={16} />
                </button>
              </div>
            </div>
          ))
          )}
          
           {!tenantsLoading && tenants.length === 0 && (
            <div 
              onClick={() => setIsCreating(true)}
              className="col-span-full border-2 border-dashed border-slate-700 hover:border-slate-600 rounded-2xl p-12 flex flex-col items-center justify-center text-center cursor-pointer transition-colors bg-slate-900/50"
            >
              <LayoutDashboard size={48} className="text-slate-600 mb-4" />
              <h3 className="text-xl font-bold text-slate-300">Nenhum cliente cadastrado</h3>
              <p className="text-slate-500 mt-2">Clique aqui para criar o primeiro banco de dados.</p>
            </div>
          )}
        </div>
      </div>

      {/* MODAL CRIAR CLIENTE */}
      {isCreating && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-300 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-700 w-full max-w-md rounded-2xl p-8 shadow-2xl my-8">
            <h3 className="text-2xl font-bold text-white mb-6">Novo Cliente</h3>
            <form onSubmit={newClienteForm.handleSubmit(onCreateCliente)} className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase">Nome fantasia</label>
                <input
                  type="text"
                  placeholder="Ex: Prefeitura Municipal..."
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-white outline-none focus:border-indigo-500 transition-colors"
                  {...newClienteForm.register('nome_fantasia', { required: 'Obrigatório' })}
                />
                {newClienteForm.formState.errors.nome_fantasia && (
                  <p className="text-xs text-red-400">{newClienteForm.formState.errors.nome_fantasia.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase">Razão social</label>
                <input
                  type="text"
                  placeholder="Ex: Município de..."
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-white outline-none focus:border-indigo-500 transition-colors"
                  {...newClienteForm.register('razao_social')}
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase">CNPJ (14 dígitos)</label>
                <input
                  type="text"
                  placeholder="00.000.000/0001-00 ou apenas números"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-white outline-none focus:border-indigo-500 transition-colors"
                  {...newClienteForm.register('cnpj', { required: 'CNPJ com 14 dígitos' })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-400 uppercase">UF</label>
                  <input
                    type="text"
                    placeholder="MA"
                    maxLength={2}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-white outline-none focus:border-indigo-500 transition-colors uppercase"
                    {...newClienteForm.register('uf')}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-400 uppercase">Data início</label>
                  <input
                    type="date"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-white outline-none focus:border-indigo-500 transition-colors"
                    {...newClienteForm.register('data_inicio')}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase">Data fim</label>
                <input
                  type="date"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-white outline-none focus:border-indigo-500 transition-colors"
                  {...newClienteForm.register('data_fim')}
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase">URL instância</label>
                <input
                  type="text"
                  placeholder="https://cliente.gestao.com.br"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-white outline-none focus:border-indigo-500 transition-colors"
                  {...newClienteForm.register('url_instancia')}
                />
              </div>
              <div className="flex gap-3 mt-8">
                <button type="button" onClick={() => setIsCreating(false)} disabled={createLoading} className="flex-1 py-3 rounded-xl font-bold text-slate-400 hover:bg-slate-800 transition-colors disabled:opacity-50">Cancelar</button>
                <button type="submit" disabled={createLoading} className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white py-3 rounded-xl font-bold transition-colors shadow-lg disabled:opacity-50">
                  {createLoading ? 'Criando...' : 'Criar cliente'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL GERENCIADOR DO BANCO (FULL SCREEN DRAWER) */}
      {managedTenantId && managedDb && (
        <div className="fixed inset-0 z-50 flex items-center justify-end bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="w-full max-w-5xl h-full bg-slate-900 border-l border-slate-800 shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
            
            {/* Header */}
            <div className="p-6 border-b border-slate-800 flex items-center justify-between bg-slate-950">
              <div className="flex items-center gap-4">
                 <div className="w-12 h-12 bg-indigo-600 rounded-xl flex items-center justify-center text-white">
                    <Database size={24} />
                 </div>
                 <div>
                   <h2 className="text-2xl font-black text-white">{managedDb.entity.name}</h2>
                   <p className="text-slate-400 text-sm font-mono">ID: {managedTenantId}</p>
                 </div>
              </div>
              <button onClick={() => setManagedTenantId(null)} className="p-2 hover:bg-slate-800 rounded-full text-slate-400 hover:text-white transition-colors">
                <X size={28} />
              </button>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-slate-800 bg-slate-900 px-6 gap-6">
              <button 
                onClick={() => setManagerTab('info')}
                className={`py-4 text-sm font-bold flex items-center gap-2 border-b-2 transition-colors ${managerTab === 'info' ? 'border-indigo-500 text-white' : 'border-transparent text-slate-500 hover:text-slate-300'}`}
              >
                <Activity size={16} /> Visão Geral
              </button>
              <button 
                onClick={() => setManagerTab('config')}
                className={`py-4 text-sm font-bold flex items-center gap-2 border-b-2 transition-colors ${managerTab === 'config' ? 'border-indigo-500 text-white' : 'border-transparent text-slate-500 hover:text-slate-300'}`}
              >
                <Building2 size={16} /> Configurações do Banco
              </button>
              <button 
                onClick={() => setManagerTab('users')}
                className={`py-4 text-sm font-bold flex items-center gap-2 border-b-2 transition-colors ${managerTab === 'users' ? 'border-indigo-500 text-white' : 'border-transparent text-slate-500 hover:text-slate-300'}`}
              >
                <Users size={16} /> Usuários & Acesso
              </button>
              <button 
                onClick={() => setManagerTab('logs')}
                className={`py-4 text-sm font-bold flex items-center gap-2 border-b-2 transition-colors ${managerTab === 'logs' ? 'border-indigo-500 text-white' : 'border-transparent text-slate-500 hover:text-slate-300'}`}
              >
                <History size={16} /> Logs de Auditoria
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-8 bg-slate-900/50">
              
              {/* TAB: INFO */}
              {managerTab === 'info' && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-2">
                   <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700">
                      <p className="text-slate-400 text-xs font-bold uppercase mb-2">Tamanho do Banco</p>
                      <p className="text-3xl font-black text-white">{(JSON.stringify(managedDb).length / 1024).toFixed(2)} KB</p>
                   </div>
                   <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700">
                      <p className="text-slate-400 text-xs font-bold uppercase mb-2">Contratos Registrados</p>
                      <p className="text-3xl font-black text-white">{managedDb.contracts.length}</p>
                   </div>
                   <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700">
                      <p className="text-slate-400 text-xs font-bold uppercase mb-2">Usuários Ativos</p>
                      <p className="text-3xl font-black text-white">{managedDb.users?.length || 0}</p>
                   </div>
                </div>
              )}

              {/* TAB: CONFIGURAÇÕES */}
              {managerTab === 'config' && (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
                  <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700">
                    <h3 className="text-lg font-bold text-white mb-4">Dados da Entidade</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="col-span-2 space-y-1">
                        <label className="text-xs text-slate-400 font-bold uppercase">Nome da Entidade</label>
                        <input 
                          type="text" 
                          className="w-full bg-slate-900 border border-slate-600 rounded-lg p-2.5 text-white"
                          value={managedDb.entity.name}
                          onChange={(e) => setManagedDb({...managedDb, entity: {...managedDb.entity, name: e.target.value}})}
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs text-slate-400 font-bold uppercase">CNPJ</label>
                        <input 
                          type="text" 
                          className="w-full bg-slate-900 border border-slate-600 rounded-lg p-2.5 text-white"
                          value={managedDb.entity.cnpj}
                          onChange={(e) => setManagedDb({...managedDb, entity: {...managedDb.entity, cnpj: e.target.value}})}
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs text-slate-400 font-bold uppercase">Secretaria Padrão</label>
                        <input 
                          type="text" 
                          className="w-full bg-slate-900 border border-slate-600 rounded-lg p-2.5 text-white"
                          value={managedDb.entity.secretary}
                          onChange={(e) => setManagedDb({...managedDb, entity: {...managedDb.entity, secretary: e.target.value}})}
                        />
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-end">
                    <button 
                      onClick={handleUpdateConfig}
                      className="bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2"
                    >
                      <Save size={18} /> Salvar Alterações
                    </button>
                  </div>
                </div>
              )}

              {/* TAB: USUÁRIOS */}
              {managerTab === 'users' && (
                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2">
                  
                  {/* Lista de Usuários */}
                  <div className="bg-slate-800 rounded-2xl border border-slate-700 overflow-hidden">
                    <table className="w-full text-left text-sm text-slate-300">
                      <thead className="bg-slate-900/50 text-slate-400 font-bold uppercase text-xs">
                        <tr>
                          <th className="p-4">Nome</th>
                          <th className="p-4">Usuário (Login)</th>
                          <th className="p-4">Permissão</th>
                          <th className="p-4 text-right">Ações</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-700">
                        {managedDb.users?.map(user => (
                          <tr key={user.id}>
                            <td className="p-4 font-bold text-white">{user.name}</td>
                            <td className="p-4 font-mono text-indigo-300">{user.username}</td>
                            <td className="p-4">
                              <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${user.role === 'admin' ? 'bg-indigo-900/50 text-indigo-300' : 'bg-slate-700 text-slate-300'}`}>
                                {user.role}
                              </span>
                            </td>
                            <td className="p-4 text-right">
                              <button 
                                onClick={() => handleRemoveUser(user.id)}
                                className="text-red-400 hover:text-red-300 hover:bg-red-900/20 p-2 rounded-lg transition-colors"
                              >
                                <Trash2 size={16} />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Formulário Novo Usuário — doc: POST /usuarios/ UsuarioCreate */}
                  <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700">
                    <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                      <UserPlus size={20} className="text-indigo-400" /> 
                      Adicionar Usuário ao Banco
                    </h3>
                    <form onSubmit={newUserFormHook.handleSubmit(onAddUser)} className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                        <div className="space-y-1">
                          <label className="text-xs text-slate-400 font-bold uppercase">Nome Completo</label>
                          <input 
                            type="text" 
                            className="w-full bg-slate-900 border border-slate-600 rounded-lg p-2.5 text-white"
                            placeholder="Ex: João Silva"
                            {...newUserFormHook.register('name', { required: 'Obrigatório' })}
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-xs text-slate-400 font-bold uppercase">Login</label>
                          <input 
                            type="text" 
                            className="w-full bg-slate-900 border border-slate-600 rounded-lg p-2.5 text-white"
                            placeholder="Ex: joao.silva"
                            {...newUserFormHook.register('username', { required: 'Obrigatório' })}
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-xs text-slate-400 font-bold uppercase">Senha</label>
                          <input 
                            type="password" 
                            className="w-full bg-slate-900 border border-slate-600 rounded-lg p-2.5 text-white"
                            placeholder="***"
                            {...newUserFormHook.register('password', { required: 'Obrigatório' })}
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-xs text-slate-400 font-bold uppercase">Perfil</label>
                          <select 
                            className="w-full bg-slate-900 border border-slate-600 rounded-lg p-2.5 text-white"
                            {...newUserFormHook.register('role')}
                          >
                            <option value="viewer">Visualizador</option>
                            <option value="admin">Administrador</option>
                          </select>
                        </div>
                      </div>
                      <button 
                        type="submit"
                        className="mt-4 w-full bg-slate-700 hover:bg-indigo-600 text-white py-3 rounded-xl font-bold transition-colors"
                      >
                        Criar Credencial
                      </button>
                    </form>
                  </div>
                </div>
              )}

              {/* TAB: LOGS */}
              {managerTab === 'logs' && (
                <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2">
                  <div className="bg-slate-800 rounded-2xl border border-slate-700 overflow-hidden">
                    <table className="w-full text-left text-sm text-slate-300">
                      <thead className="bg-slate-900/50 text-slate-400 font-bold uppercase text-xs">
                        <tr>
                          <th className="p-4 w-40">Data/Hora</th>
                          <th className="p-4 w-32">Ação</th>
                          <th className="p-4">Detalhes</th>
                          <th className="p-4 w-32 text-right">Usuário</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-700">
                        {managedDb.logs?.map(log => (
                          <tr key={log.id} className="hover:bg-slate-700/30">
                            <td className="p-4 font-mono text-xs text-slate-400">
                              {new Date(log.timestamp).toLocaleString()}
                            </td>
                            <td className="p-4">
                              <span className="bg-slate-900 text-slate-300 px-2 py-1 rounded text-xs font-bold font-mono">
                                {log.action}
                              </span>
                            </td>
                            <td className="p-4 text-slate-300">{log.details}</td>
                            <td className="p-4 text-right font-bold text-slate-400">{log.user}</td>
                          </tr>
                        ))}
                        {(!managedDb.logs || managedDb.logs.length === 0) && (
                          <tr><td colSpan={4} className="p-8 text-center text-slate-500">Nenhum log registrado.</td></tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default AdminHome;
