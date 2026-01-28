
import React from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Cell,
  PieChart,
  Pie
} from 'recharts';
import { 
  DollarSign, 
  Briefcase, 
  FileCheck2,
  TrendingDown,
  Clock
} from 'lucide-react';
import { AppState } from '../types';

interface DashboardProps {
  state: AppState;
  isDarkMode?: boolean;
}

const Dashboard: React.FC<DashboardProps> = ({ state, isDarkMode = false }) => {
  const totalContracted = state.contracts.reduce((acc, c) => acc + c.globalValue, 0);
  
  const totalPaid = state.invoices
    .filter(i => i.isPaid)
    .reduce((acc, i) => acc + (i.payment?.amountPaid || 0), 0);
    
  const totalPending = state.invoices
    .filter(i => !i.isPaid)
    .reduce((acc, i) => acc + i.items.reduce((s, item) => s + item.totalValue, 0), 0);
  
  const balanceAvailable = totalContracted - totalPaid;

  const chartData = state.contracts.map(c => ({
    name: c.number,
    valor: c.globalValue,
    executado: state.invoices
      .filter(i => i.contractId === c.id)
      .reduce((acc, i) => {
        return acc + i.items.reduce((sum, item) => sum + item.totalValue, 0);
      }, 0)
  }));

  const pieData = [
    { name: 'Executado (Pago)', value: totalPaid, color: '#3b82f6' },
    { name: 'Pendente Pagamento', value: totalPending, color: '#f97316' },
    { name: 'Saldo Disponível', value: balanceAvailable - totalPending, color: isDarkMode ? '#1e293b' : '#e2e8f0' }
  ];

  const axisColor = isDarkMode ? '#94a3b8' : '#64748b';
  const gridColor = isDarkMode ? '#334155' : '#f1f5f9';
  const tooltipBg = isDarkMode ? '#1e293b' : '#fff';
  const tooltipText = isDarkMode ? '#f1f5f9' : '#1e293b';

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Visão Geral</h2>
        <p className="text-slate-500 dark:text-slate-400">Acompanhamento de execução orçamentária e contratos.</p>
      </div>

      {/* Grid ajustado para 5 cards em telas largas */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-6">
        
        {/* Card 1: Total Contratado */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-xl flex items-center justify-center">
              <DollarSign size={24} />
            </div>
            <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 px-2 py-1 rounded-full">+12%</span>
          </div>
          <div>
            <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Valor Total Contratado</p>
            <h3 className="text-2xl font-bold text-slate-800 dark:text-white truncate">
              {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', notation: 'compact' }).format(totalContracted)}
            </h3>
          </div>
        </div>

        {/* Card 2: Contratos Ativos */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 rounded-xl flex items-center justify-center">
              <Briefcase size={24} />
            </div>
          </div>
          <div>
            <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Contratos Ativos</p>
            <h3 className="text-2xl font-bold text-slate-800 dark:text-white">{state.contracts.length}</h3>
          </div>
        </div>

        {/* Card 3: Notas Pendentes (NOVO) */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 flex flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 right-0 w-16 h-16 bg-orange-50 dark:bg-orange-900/10 rounded-bl-full -mr-4 -mt-4" />
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400 rounded-xl flex items-center justify-center">
              <Clock size={24} />
            </div>
          </div>
          <div>
            <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Notas Pendentes</p>
            <h3 className="text-2xl font-bold text-slate-800 dark:text-white truncate">
               {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', notation: 'compact' }).format(totalPending)}
            </h3>
            <p className="text-[10px] text-orange-500 font-bold mt-1">Aguardando Pagamento</p>
          </div>
        </div>

        {/* Card 4: Notas Pagas */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 rounded-xl flex items-center justify-center">
              <FileCheck2 size={24} />
            </div>
          </div>
          <div>
            <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Notas Pagas</p>
            <h3 className="text-2xl font-bold text-slate-800 dark:text-white truncate">
               {state.invoices.filter(i => i.isPaid).length} <span className="text-sm text-slate-400 font-normal">notas</span>
            </h3>
          </div>
        </div>

        {/* Card 5: Saldo Disponível */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-xl flex items-center justify-center">
              <TrendingDown size={24} />
            </div>
          </div>
          <div>
            <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Saldo Global</p>
            <h3 className="text-2xl font-bold text-slate-800 dark:text-white truncate">
              {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', notation: 'compact' }).format(balanceAvailable)}
            </h3>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 p-8 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800">
          <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-6">Execução por Contrato</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={gridColor} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: axisColor, fontSize: 12}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: axisColor, fontSize: 12}} />
                <Tooltip 
                  cursor={{fill: isDarkMode ? '#334155' : '#f8fafc'}}
                  contentStyle={{
                    borderRadius: '12px', 
                    border: isDarkMode ? '1px solid #334155' : 'none', 
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                    backgroundColor: tooltipBg,
                    color: tooltipText
                  }}
                  itemStyle={{ color: tooltipText }}
                  labelStyle={{ color: tooltipText, fontWeight: 'bold' }}
                />
                <Bar dataKey="valor" fill={isDarkMode ? '#334155' : '#e2e8f0'} radius={[4, 4, 0, 0]} name="Valor Global" />
                <Bar dataKey="executado" fill="#3b82f6" radius={[4, 4, 0, 0]} name="Valor Executado" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-8 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 flex flex-col">
          <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-6">Proporção Orçamentária</h3>
          <div className="flex-1 flex flex-col items-center justify-center">
             <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                    stroke={isDarkMode ? '#0f172a' : '#fff'}
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{
                      borderRadius: '12px', 
                      border: isDarkMode ? '1px solid #334155' : 'none', 
                      backgroundColor: tooltipBg,
                      color: tooltipText
                    }}
                    itemStyle={{ color: tooltipText }}
                  />
                </PieChart>
              </ResponsiveContainer>
             </div>
             <div className="space-y-3 w-full mt-4">
               {pieData.map(item => (
                 <div key={item.name} className="flex items-center justify-between text-sm">
                   <div className="flex items-center gap-2">
                     <div className="w-3 h-3 rounded-full" style={{backgroundColor: item.color}} />
                     <span className="text-slate-600 dark:text-slate-300 font-medium">{item.name}</span>
                   </div>
                   <span className="font-bold text-slate-800 dark:text-white">
                     {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', notation: 'compact' }).format(item.value)}
                   </span>
                 </div>
               ))}
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
