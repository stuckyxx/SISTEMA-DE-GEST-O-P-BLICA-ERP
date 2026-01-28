
import React, { useState } from 'react';
import { 
  Wallet, 
  Landmark, 
  CheckCircle2, 
  Clock, 
  ArrowRight,
  DollarSign,
  Plus,
  Trash2,
  X,
  Settings2,
  Building,
  TrendingUp,
  History,
  CalendarCheck
} from 'lucide-react';
import { AppState, Invoice, Payment, BankAccount } from '../types';

interface FinancialProps {
  state: AppState;
  setState: React.Dispatch<React.SetStateAction<AppState>>;
}

const Financial: React.FC<FinancialProps> = ({ state, setState }) => {
  const [activeTab, setActiveTab] = useState<'pending' | 'history'>('pending');
  const [selectedInvoiceId, setSelectedInvoiceId] = useState<string | null>(null);
  const [paymentDate, setPaymentDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedAccountId, setSelectedAccountId] = useState('');
  
  // Modals State
  const [isConfigModalOpen, setIsConfigModalOpen] = useState(false);

  // Form for New Bank Account
  const [newAccount, setNewAccount] = useState<Partial<BankAccount>>({
    bank: '',
    agency: '',
    account: '',
    description: '',
    secretariat: ''
  });

  const pendingInvoices = state.invoices.filter(i => !i.isPaid);
  const paidInvoices = state.invoices.filter(i => i.isPaid).sort((a, b) => 
    new Date(b.payment?.date || 0).getTime() - new Date(a.payment?.date || 0).getTime()
  );

  const totalPaid = paidInvoices.reduce((acc, i) => acc + (i.payment?.amountPaid || 0), 0);
  const totalPending = pendingInvoices.reduce((acc, i) => acc + i.items.reduce((s, item) => s + item.totalValue, 0), 0);

  const handlePay = (invoice: Invoice) => {
    if (!selectedAccountId) {
      alert('Selecione a conta bancária para efetuar o pagamento.');
      return;
    }

    const totalAmount = invoice.items.reduce((acc, i) => acc + i.totalValue, 0);

    const newPayment: Payment = {
      id: Math.random().toString(36).substr(2, 9),
      date: paymentDate,
      bankAccountId: selectedAccountId,
      amountPaid: totalAmount
    };

    setState(prev => ({
      ...prev,
      invoices: prev.invoices.map(i => {
        if (i.id === invoice.id) {
          return { ...i, isPaid: true, payment: newPayment };
        }
        return i;
      })
    }));

    setSelectedInvoiceId(null);
  };

  // --- Account Handlers ---
  const handleAddAccount = () => {
    if (!newAccount.bank || !newAccount.account || !newAccount.secretariat) {
      alert("Preencha Banco, Conta e Secretaria.");
      return;
    }

    const account: BankAccount = {
      id: Math.random().toString(36).substr(2, 9),
      bank: newAccount.bank!,
      agency: newAccount.agency || '0000',
      account: newAccount.account!,
      description: newAccount.description || '',
      secretariat: newAccount.secretariat!
    };

    setState(prev => ({
      ...prev,
      accounts: [...prev.accounts, account]
    }));

    setNewAccount({ bank: '', agency: '', account: '', description: '', secretariat: '' });
  };

  const handleDeleteAccount = (id: string) => {
    const isUsed = state.invoices.some(i => i.payment?.bankAccountId === id);
    if (isUsed) {
      alert("Não é possível excluir esta conta pois ela já foi usada em pagamentos anteriores.");
      return;
    }

    if (confirm("Excluir configuração desta conta bancária?")) {
      setState(prev => ({
        ...prev,
        accounts: prev.accounts.filter(a => a.id !== id)
      }));
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Financeiro / Tesouraria</h2>
          <p className="text-slate-500 dark:text-slate-400">Controle de pagamentos e histórico financeiro.</p>
        </div>
        <button 
          onClick={() => setIsConfigModalOpen(true)}
          className="flex items-center justify-center gap-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 px-5 py-2.5 rounded-xl transition-all font-semibold shadow-sm hover:bg-slate-50 dark:hover:bg-slate-800"
        >
          <Settings2 size={20} />
          Gerir Contas Bancárias
        </button>
      </div>

      {/* Cards de Resumo */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-orange-50 dark:bg-orange-900/10 rounded-full -mr-10 -mt-10 transition-transform group-hover:scale-110" />
          <div className="relative">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 rounded-xl flex items-center justify-center">
                <Clock size={20} />
              </div>
              <span className="font-bold text-slate-600 dark:text-slate-400 uppercase text-xs tracking-widest">A Pagar</span>
            </div>
            <h3 className="text-3xl font-black text-slate-800 dark:text-white">
              {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalPending)}
            </h3>
            <p className="text-sm text-slate-400 mt-1">{pendingInvoices.length} notas aguardando pagamento</p>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-50 dark:bg-emerald-900/10 rounded-full -mr-10 -mt-10 transition-transform group-hover:scale-110" />
          <div className="relative">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-xl flex items-center justify-center">
                <TrendingUp size={20} />
              </div>
              <span className="font-bold text-slate-600 dark:text-slate-400 uppercase text-xs tracking-widest">Total Executado</span>
            </div>
            <h3 className="text-3xl font-black text-slate-800 dark:text-white">
              {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalPaid)}
            </h3>
            <p className="text-sm text-slate-400 mt-1">{paidInvoices.length} pagamentos realizados</p>
          </div>
        </div>
      </div>

      {/* Tabs de Navegação */}
      <div className="flex gap-4 border-b border-slate-200 dark:border-slate-800">
        <button 
          onClick={() => setActiveTab('pending')}
          className={`pb-4 px-4 font-bold text-sm flex items-center gap-2 transition-all ${
            activeTab === 'pending' 
              ? 'text-blue-600 border-b-2 border-blue-600' 
              : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
          }`}
        >
          <Clock size={16} />
          Contas a Pagar
        </button>
        <button 
          onClick={() => setActiveTab('history')}
          className={`pb-4 px-4 font-bold text-sm flex items-center gap-2 transition-all ${
            activeTab === 'history' 
              ? 'text-emerald-600 border-b-2 border-emerald-600' 
              : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
          }`}
        >
          <History size={16} />
          Histórico de Despesas
        </button>
      </div>

      {/* Conteúdo das Abas */}
      <div className="min-h-[400px]">
        
        {/* ABA: CONTAS A PAGAR */}
        {activeTab === 'pending' && (
          <div className="space-y-4 animate-in fade-in slide-in-from-left-4 duration-300">
            {pendingInvoices.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 bg-white dark:bg-slate-900 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 text-slate-400">
                <CheckCircle2 size={48} className="text-emerald-500 opacity-20 mb-4" />
                <p className="font-bold text-lg">Tudo em dia!</p>
                <p className="text-sm">Nenhuma nota fiscal pendente de pagamento.</p>
              </div>
            ) : (
              pendingInvoices.map(inv => {
                const contract = state.contracts.find(c => c.id === inv.contractId);
                const supplier = state.suppliers.find(s => s.id === contract?.supplierId);
                const total = inv.items.reduce((acc, i) => acc + i.totalValue, 0);
                const isSelected = selectedInvoiceId === inv.id;

                return (
                  <div key={inv.id} className={`bg-white dark:bg-slate-900 rounded-2xl border transition-all ${isSelected ? 'border-blue-500 ring-4 ring-blue-50 dark:ring-blue-900/20' : 'border-slate-100 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'}`}>
                    <div className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 cursor-pointer" onClick={() => setSelectedInvoiceId(isSelected ? null : inv.id)}>
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-slate-50 dark:bg-slate-800 rounded-2xl flex items-center justify-center text-slate-400">
                          <DollarSign size={24} />
                        </div>
                        <div>
                          <div className="flex items-center gap-3">
                            <p className="font-bold text-slate-800 dark:text-white text-lg">NF {inv.number}</p>
                            <span className="text-[10px] bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400 px-2 py-0.5 rounded-full font-black uppercase">Pendente</span>
                          </div>
                          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{supplier?.name}</p>
                          <p className="text-xs text-slate-400 mt-0.5">Ref: Contrato {contract?.number}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-6">
                        <div className="text-right">
                          <p className="text-xl font-bold text-slate-800 dark:text-white">
                             {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(total)}
                          </p>
                          <p className="text-xs text-slate-400 dark:text-slate-500 font-medium">Emitida em: {new Date(inv.issueDate).toLocaleDateString()}</p>
                        </div>
                        <ArrowRight size={20} className={`text-slate-300 dark:text-slate-600 transition-transform ${isSelected ? 'rotate-90' : ''}`} />
                      </div>
                    </div>

                    {isSelected && (
                      <div className="p-6 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/50 rounded-b-2xl animate-in slide-in-from-top-4 duration-300">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                           <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-600 dark:text-slate-400 ml-1 uppercase">Data do Pagamento</label>
                            <input 
                              type="date" 
                              className="w-full p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-white font-medium"
                              value={paymentDate}
                              onChange={(e) => setPaymentDate(e.target.value)}
                            />
                          </div>
                          <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-600 dark:text-slate-400 ml-1 uppercase">Conta Bancária de Origem</label>
                            <select 
                              className="w-full p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-white font-medium"
                              value={selectedAccountId}
                              onChange={(e) => setSelectedAccountId(e.target.value)}
                            >
                              <option value="">Selecione a conta...</option>
                              {state.accounts.map(a => <option key={a.id} value={a.id}>{a.bank} (Ag: {a.agency} / CC: {a.account}) - {a.secretariat}</option>)}
                            </select>
                          </div>
                        </div>
                        <button 
                          onClick={() => handlePay(inv)}
                          className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-4 rounded-xl shadow-lg shadow-emerald-200 dark:shadow-emerald-900/20 flex items-center justify-center gap-3 transition-all active:scale-95"
                        >
                          <CheckCircle2 size={20} />
                          Confirmar Pagamento
                        </button>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* ABA: HISTÓRICO */}
        {activeTab === 'history' && (
          <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
            {paidInvoices.length === 0 ? (
               <div className="flex flex-col items-center justify-center py-20 bg-white dark:bg-slate-900 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 text-slate-400">
                <Wallet size={48} className="text-slate-300 dark:text-slate-600 mb-4 opacity-50" />
                <p className="font-bold text-lg">Sem histórico</p>
                <p className="text-sm">Nenhum pagamento foi registrado ainda.</p>
              </div>
            ) : (
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 overflow-hidden shadow-sm">
                <table className="w-full text-left">
                  <thead className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800">
                    <tr>
                      <th className="px-6 py-4 text-[10px] font-black uppercase text-slate-500 dark:text-slate-400 tracking-widest">Nota Fiscal</th>
                      <th className="px-6 py-4 text-[10px] font-black uppercase text-slate-500 dark:text-slate-400 tracking-widest">Fornecedor</th>
                      <th className="px-6 py-4 text-[10px] font-black uppercase text-slate-500 dark:text-slate-400 tracking-widest text-center">Data Pagto</th>
                      <th className="px-6 py-4 text-[10px] font-black uppercase text-slate-500 dark:text-slate-400 tracking-widest">Conta Utilizada</th>
                      <th className="px-6 py-4 text-[10px] font-black uppercase text-slate-500 dark:text-slate-400 tracking-widest text-right">Valor Pago</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {paidInvoices.map(inv => {
                      const contract = state.contracts.find(c => c.id === inv.contractId);
                      const supplier = state.suppliers.find(s => s.id === contract?.supplierId);
                      const bank = state.accounts.find(a => a.id === inv.payment?.bankAccountId);

                      return (
                        <tr key={inv.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                          <td className="px-6 py-4">
                            <p className="font-bold text-slate-700 dark:text-slate-200">NF {inv.number}</p>
                            <span className="text-[10px] text-slate-400">Contrato {contract?.number}</span>
                          </td>
                          <td className="px-6 py-4 font-medium text-slate-600 dark:text-slate-300">
                            {supplier?.name}
                          </td>
                          <td className="px-6 py-4 text-center">
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 text-xs font-bold">
                              <CalendarCheck size={14} />
                              {new Date(inv.payment?.date || '').toLocaleDateString()}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <p className="text-sm font-medium text-slate-700 dark:text-slate-300">{bank?.bank}</p>
                            <p className="text-xs text-slate-400">Ag: {bank?.agency} CC: {bank?.account}</p>
                          </td>
                          <td className="px-6 py-4 text-right">
                             <span className="font-bold text-slate-800 dark:text-white">
                                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(inv.payment?.amountPaid || 0)}
                             </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>

      {/* MODAL DE CONFIGURAÇÃO DE CONTAS */}
      {isConfigModalOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-900/70 dark:bg-black/80 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] w-full max-w-2xl overflow-hidden flex flex-col shadow-2xl border border-white/20 dark:border-slate-800">
            <div className="px-8 py-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-white dark:bg-slate-900">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-xl flex items-center justify-center">
                  <Settings2 size={20} />
                </div>
                <h3 className="text-xl font-bold text-slate-800 dark:text-white">Contas Bancárias das Secretarias</h3>
              </div>
              <button onClick={() => setIsConfigModalOpen(false)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full text-slate-500 dark:text-slate-400">
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
                  onClick={handleAddAccount}
                  className="w-full bg-blue-600 text-white font-bold py-2.5 rounded-xl hover:bg-blue-700 transition-all flex items-center justify-center gap-2 mt-2"
                >
                  <Plus size={18} /> Adicionar Conta à Lista
                </button>
              </div>

              {/* List of accounts */}
              <div className="space-y-3">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Contas Ativas no Sistema</p>
                {state.accounts.map(acc => (
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
                      onClick={() => handleDeleteAccount(acc.id)}
                      className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-all"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                ))}
                {state.accounts.length === 0 && (
                  <p className="text-center text-sm text-slate-400 py-4">Nenhuma conta cadastrada.</p>
                )}
              </div>
            </div>

            <div className="p-6 bg-slate-50 dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 text-center">
              <button 
                onClick={() => setIsConfigModalOpen(false)}
                className="font-bold text-blue-600 dark:text-blue-400 hover:underline text-sm"
              >
                Concluído
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Financial;
