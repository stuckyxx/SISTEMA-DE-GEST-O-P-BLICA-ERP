import React, { useState, useEffect } from 'react';
import { Routes, Route, Link, useLocation, Navigate, useParams, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  FileText,
  Receipt,
  Wallet,
  Settings,
  Menu,
  Users,
  UserCircle,
  Moon,
  Sun,
  ClipboardList,
  LogOut,
  ArrowLeft,
  FileBadge,
} from 'lucide-react';

import { config } from './config/env';
import { getStoredToken, setOnUnauthorized, clearStoredToken } from './services/api';
import {
  resolveEntidadeId,
  getEntityConfig,
  listFornecedores,
  listAtas,
  listContratos,
  listNotasFiscais,
  listContasBancarias,
  listOrdensServico,
  listUsuarios,
} from './services/api';
import { TenantProvider } from './contexts/TenantContext';
import { AlertProvider } from './contexts/AlertContext';

import Dashboard from './pages/Dashboard';
import Atas from './pages/atas';
import Contracts from './pages/contracts';
import Invoices from './pages/invoices';
import Financial from './pages/financial';
import Suppliers from './pages/suppliers';
import ServiceOrders from './pages/service-orders';
import SettingsPage from './pages/Settings';
import Login from './pages/Login';
import AdminHome from './pages/AdminHome';
import Landing from './pages/Landing';
import UsersPage from './pages/users';
import { AppState, SystemUser } from './types';

const defaultEntity = {
  name: '',
  secretary: '',
  cnpj: '',
  address: '',
  city: '',
  state: '',
  zipCode: '',
  phone: '',
  email: '',
  website: '',
};

const defaultAppState: AppState = {
  entity: defaultEntity,
  users: [],
  logs: [],
  suppliers: [],
  accounts: [],
  atas: [],
  contracts: [],
  invoices: [],
  serviceOrders: [],
};

const TenantLayout: React.FC = () => {
  const { tenantId } = useParams<{ tenantId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    if (tenantId) return !!getStoredToken(tenantId);
    return false;
  });
  const [currentUser, setCurrentUser] = useState<SystemUser | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem('theme');
    return saved === 'dark' || (!saved && window.matchMedia('(prefers-color-scheme: dark)').matches);
  });
  const [state, setState] = useState<AppState | null>(null);
  const [entidadeId, setEntidadeId] = useState<number | null>(null);

  useEffect(() => {
    setOnUnauthorized(() => {
      clearStoredToken(tenantId);
      setIsAuthenticated(false);
      setCurrentUser(null);
    });
    return () => setOnUnauthorized(null);
  }, [tenantId]);

  useEffect(() => {
    if (!tenantId) {
      setLoading(false);
      return;
    }

    if (!isAuthenticated || !getStoredToken(tenantId)) {
      setLoading(false);
      setState(null);
      return;
    }

    // O middleware detecta automaticamente o tenantId pela URL, não precisa mais setar sessionStorage
    // O interceptor do apiClient usa getCurrentApiContext() que lê diretamente da URL

    const LOAD_TIMEOUT_MS = 20000;
    const timeoutPromise = new Promise<never>((_, rej) =>
      setTimeout(() => rej(new Error('Tempo esgotado. Verifique se a API está acessível.')), LOAD_TIMEOUT_MS)
    );

    setLoadError(null);
    setLoading(true);

    const hintId =
      typeof (location.state as { clientId?: string })?.clientId === 'string'
        ? parseInt((location.state as { clientId: string }).clientId, 10)
        : undefined;
    const loadPromise = resolveEntidadeId(tenantId, hintId).then(async (eid) => {
      if (import.meta.env.DEV) {
        console.log(`[TenantLayout] EntidadeId resolvido: ${eid} para tenantId: ${tenantId}`);
      }
      setEntidadeId(eid);
      // Carrega ordens de serviço separadamente para não quebrar se o endpoint não existir
      let serviceOrders: AppState['serviceOrders'] = [];
      try {
        serviceOrders = await listOrdensServico(eid);
      } catch (err) {
        if (import.meta.env.DEV) {
          console.warn('[TenantLayout] Erro ao carregar ordens de serviço (endpoint pode não existir):', err);
        }
        // Continua com array vazio se falhar
      }
      
      const [entity, suppliers, atas, contracts, invoices, accounts, users] = await Promise.all([
        getEntityConfig(eid),
        listFornecedores(eid),
        listAtas(eid),
        listContratos(eid),
        listNotasFiscais(eid),
        listContasBancarias(eid),
        listUsuarios(eid),
      ]);
      setState({
        ...defaultAppState,
        entity,
        suppliers,
        atas,
        contracts,
        invoices,
        accounts,
        serviceOrders,
        users,
      });
    });

    Promise.race([loadPromise, timeoutPromise])
      .catch((err) => {
        // Captura mensagem de erro mais detalhada
        let errorMessage = 'Erro ao carregar dados';
        if (err instanceof Error) {
          errorMessage = err.message;
        } else if (typeof err === 'string') {
          errorMessage = err;
        }
        
        // Log adicional em desenvolvimento
        if (import.meta.env.DEV) {
          console.error('[TenantLayout] Erro ao carregar dados:', err);
          console.error('[TenantLayout] Tenant ID:', tenantId);
        }
        
        setLoadError(errorMessage);
        setState(null);
      })
      .finally(() => setLoading(false));
  }, [tenantId, isAuthenticated]);

  useEffect(() => {
    const root = window.document.documentElement;
    if (isDarkMode) {
      root.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      root.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);

  const toggleTheme = () => setIsDarkMode(!isDarkMode);

  const handleLogin = (user: SystemUser) => {
    setIsAuthenticated(true);
    setCurrentUser(user);
    sessionStorage.setItem(`user_${tenantId}`, JSON.stringify(user));
    if (state) {
      const newLog = {
        id: Math.random().toString(36).substr(2, 9),
        timestamp: new Date().toISOString(),
        action: 'LOGIN',
        details: 'Usuário realizou login no sistema',
        user: user.username,
      };
      setState((prev) => (prev ? { ...prev, logs: [newLog, ...(prev.logs || [])] } : null));
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setCurrentUser(null);
    sessionStorage.removeItem(`user_${tenantId}`);
    clearStoredToken(tenantId);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-slate-900 text-white p-6">
        <p className="text-slate-300">Carregando base de dados...</p>
        <p className="text-xs text-slate-500">Aguarde ou verifique se a API está acessível.</p>
      </div>
    );
  }

  if (loadError && isAuthenticated) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-900 text-white p-6">
        <div className="max-w-md w-full text-center">
          <h1 className="text-2xl font-bold text-red-400 mb-2">Erro ao Carregar Dados</h1>
          <p className="text-red-300 mb-6 whitespace-pre-wrap">{loadError}</p>
          <div className="space-y-3">
            <button
              onClick={() => {
                setLoadError(null);
                window.location.reload();
              }}
              className="w-full px-4 py-2 bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Tentar Novamente
            </button>
            <button
              onClick={() => navigate('/')}
              className="w-full px-4 py-2 bg-slate-700 rounded-lg hover:bg-slate-600 transition-colors"
            >
              Ir para Início
            </button>
          </div>
          {import.meta.env.DEV && (
            <details className="mt-6 text-left">
              <summary className="text-sm text-slate-400 cursor-pointer hover:text-slate-300">
                Detalhes técnicos (dev)
              </summary>
              <pre className="mt-2 text-xs text-slate-500 bg-slate-800 p-3 rounded overflow-auto">
                Tenant ID: {tenantId}
                {'\n'}
                {loadError}
              </pre>
            </details>
          )}
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="relative">
        <button
          onClick={() => navigate('/')}
          className="absolute top-4 left-4 z-50 flex items-center gap-2 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white transition-colors bg-white/50 dark:bg-black/50 p-2 rounded-lg"
        >
          <ArrowLeft size={20} /> Ir para Início
        </button>
        <Login
          onLogin={handleLogin}
          users={state?.users ?? []}
          entityName={state?.entity?.name || tenantId || 'Entidade'}
          isDarkMode={isDarkMode}
          toggleTheme={toggleTheme}
          tenantId={tenantId}
          useApi={true}
        />
      </div>
    );
  }

  if (!state) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900 text-white">
        Carregando...
      </div>
    );
  }

  const activeLink = (path: string) =>
    location.pathname.endsWith(path)
      ? 'bg-blue-600 text-white shadow-md shadow-blue-500/30 dark:shadow-blue-900/20'
      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-blue-600 dark:hover:text-blue-400';

  const p = `/${tenantId}`;

  return (
    <TenantProvider tenantId={tenantId} entidadeId={entidadeId}>
      <TenantLayoutContent
        state={state}
        setState={setState}
        p={p}
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        isDarkMode={isDarkMode}
        toggleTheme={toggleTheme}
        handleLogout={handleLogout}
        activeLink={activeLink}
      />
    </TenantProvider>
  );
};

const TenantLayoutContent: React.FC<{
  state: AppState;
  setState: React.Dispatch<React.SetStateAction<AppState>>;
  p: string;
  sidebarOpen: boolean;
  setSidebarOpen: (v: boolean) => void;
  isDarkMode: boolean;
  toggleTheme: () => void;
  handleLogout: () => void;
  activeLink: (path: string) => string;
}> = ({ state, setState, p, sidebarOpen, setSidebarOpen, isDarkMode, toggleTheme, handleLogout, activeLink }) => {
  return (
    <div className="min-h-screen flex bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-300">
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      <aside
        className={`fixed inset-y-0 left-0 w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 z-50 transform transition-transform duration-300 lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}
      >
        <div className="h-full flex flex-col p-6">
          <div className="flex items-center gap-3 mb-8 px-2">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-blue-600/20">
              G
            </div>
            <div className="overflow-hidden">
              <h1 className="font-bold text-slate-800 dark:text-white leading-tight truncate">Gestão Pública</h1>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium uppercase tracking-wider truncate">
                {state.entity.name}
              </p>
            </div>
          </div>
          <nav className="flex-1 space-y-2">
            <Link to={`${p}/dashboard`} onClick={() => setSidebarOpen(false)} className={`flex items-center gap-3 p-3 rounded-xl transition-all font-medium ${activeLink('dashboard')}`}>
              <LayoutDashboard size={20} />
              Painel de Controle
            </Link>
            <Link to={`${p}/suppliers`} onClick={() => setSidebarOpen(false)} className={`flex items-center gap-3 p-3 rounded-xl transition-all font-medium ${activeLink('suppliers')}`}>
              <Users size={20} />
              Fornecedores
            </Link>
            <Link to={`${p}/users`} onClick={() => setSidebarOpen(false)} className={`flex items-center gap-3 p-3 rounded-xl transition-all font-medium ${activeLink('users')}`}>
              <UserCircle size={20} />
              Usuários
            </Link>
            <Link to={`${p}/atas`} onClick={() => setSidebarOpen(false)} className={`flex items-center gap-3 p-3 rounded-xl transition-all font-medium ${activeLink('atas')}`}>
              <FileBadge size={20} />
              ATAS / Registro de Preço
            </Link>
            <Link to={`${p}/contracts`} onClick={() => setSidebarOpen(false)} className={`flex items-center gap-3 p-3 rounded-xl transition-all font-medium ${activeLink('contracts')}`}>
              <FileText size={20} />
              Contratos
            </Link>
            <Link to={`${p}/service-orders`} onClick={() => setSidebarOpen(false)} className={`flex items-center gap-3 p-3 rounded-xl transition-all font-medium ${activeLink('service-orders')}`}>
              <ClipboardList size={20} />
              Ordens de Serviço
            </Link>
            <Link to={`${p}/invoices`} onClick={() => setSidebarOpen(false)} className={`flex items-center gap-3 p-3 rounded-xl transition-all font-medium ${activeLink('invoices')}`}>
              <Receipt size={20} />
              Notas Fiscais
            </Link>
            <Link to={`${p}/financial`} onClick={() => setSidebarOpen(false)} className={`flex items-center gap-3 p-3 rounded-xl transition-all font-medium ${activeLink('financial')}`}>
              <Wallet size={20} />
              Financeiro
            </Link>
          </nav>
          <div className="mt-auto pt-6 border-t border-slate-100 dark:border-slate-800 space-y-3">
            <button
              onClick={toggleTheme}
              className="flex items-center gap-3 w-full p-3 rounded-xl text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all font-medium"
            >
              {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
              {isDarkMode ? 'Modo Claro' : 'Modo Escuro'}
            </button>
            <Link to={`${p}/settings`} onClick={() => setSidebarOpen(false)} className={`flex items-center gap-3 w-full p-3 rounded-xl transition-all font-medium ${activeLink('settings')}`}>
              <Settings size={20} />
              Configurações
            </Link>
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 w-full p-3 rounded-xl text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all font-medium mt-2"
            >
              <LogOut size={20} />
              Sair
            </button>
          </div>
        </div>
      </aside>
      <main className="flex-1 lg:ml-64 p-4 lg:p-8 overflow-hidden">
        <header className="flex items-center justify-between mb-8 lg:hidden">
          <button onClick={() => setSidebarOpen(true)} className="p-2 bg-white dark:bg-slate-900 rounded-lg shadow-sm border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200">
            <Menu size={24} />
          </button>
          <div className="font-bold text-slate-800 dark:text-white uppercase tracking-tighter truncate max-w-[200px]">
            {state.entity.name}
          </div>
          <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-700" />
        </header>
        <Routes>
          <Route path="/" element={<Navigate to={`${p}/dashboard`} replace />} />
          <Route path="/dashboard" element={<Dashboard state={state} isDarkMode={isDarkMode} />} />
          <Route path="/suppliers" element={<Suppliers state={state} setState={setState} />} />
          <Route path="/users" element={<UsersPage state={state} setState={setState} />} />
          <Route path="/atas" element={<Atas state={state} setState={setState} />} />
          <Route path="/contracts/*" element={<Contracts state={state} setState={setState} />} />
          <Route path="/service-orders" element={<ServiceOrders state={state} setState={setState} />} />
          <Route path="/invoices/*" element={<Invoices state={state} setState={setState} />} />
          <Route path="/financial/*" element={<Financial state={state} setState={setState} />} />
          <Route path="/settings" element={<SettingsPage state={state} setState={setState} />} />
          <Route path="*" element={<Navigate to={`${p}/dashboard`} replace />} />
        </Routes>
      </main>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <AlertProvider>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/master-panel" element={<AdminHome />} />
        <Route path="/:tenantId/*" element={<TenantLayout />} />
      </Routes>
    </AlertProvider>
  );
};

export default App;
