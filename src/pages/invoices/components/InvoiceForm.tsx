import React from 'react';
import { 
  X, FileCheck, Package, Calculator, AlertTriangle, AlertCircle 
} from 'lucide-react';
import { AppState, Contract } from '../../../types';
import { formatCurrency } from '../../../utils/format';

interface InvoiceFormProps {
  onClose: () => void;
  // Alterado: passamos o ID ou null, que serve como boolean também
  editingInvoiceId: string | null; 
  selectedContractId: string;
  setSelectedContractId: (id: string) => void;
  invoiceNumber: string;
  setInvoiceNumber: (num: string) => void;
  issueDate: string;
  setIssueDate: (date: string) => void;
  quantities: Record<string, number>;
  setQuantities: React.Dispatch<React.SetStateAction<Record<string, number>>>;
  setError: React.Dispatch<React.SetStateAction<string>>;
  error: string;
  selectedContract: Contract | undefined;
  totalInvoiceValue: number;
  handleQuantityChange: (itemId: string, value: string) => void;
  handleSaveInvoice: () => void;
  state: AppState;
}

const InvoiceForm: React.FC<InvoiceFormProps> = ({
  onClose,
  editingInvoiceId,
  selectedContractId,
  setSelectedContractId,
  invoiceNumber,
  setInvoiceNumber,
  issueDate,
  setIssueDate,
  quantities,
  setQuantities,
  setError,
  error,
  selectedContract,
  totalInvoiceValue,
  handleQuantityChange,
  handleSaveInvoice,
  state
}) => {
  const isEditing = !!editingInvoiceId;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] w-full max-w-6xl max-h-[92vh] overflow-hidden flex flex-col shadow-2xl border border-white/20 dark:border-slate-800">
        
        {/* Header Modal */}
        <div className="p-8 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-white dark:bg-slate-900 shrink-0">
          <div>
            <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 mb-1">
              <FileCheck size={18} />
              <span className="text-xs font-black uppercase tracking-widest">{isEditing ? 'Edição de Lançamento' : 'Controle de Despesas'}</span>
            </div>
            <h3 className="text-2xl font-black text-slate-800 dark:text-white tracking-tight">{isEditing ? 'Editar Nota Fiscal' : 'Lançamento de Nota Fiscal'}</h3>
          </div>
          <button onClick={onClose} className="p-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-full text-slate-500 dark:text-slate-400 transition-all">
            <X size={24} />
          </button>
        </div>

        {/* Conteúdo com Scroll */}
        <div className="flex-1 overflow-y-auto p-8 space-y-8 custom-scrollbar">
          
          {/* Passo 1: Dados Básicos */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-black text-slate-400 uppercase ml-1 tracking-widest">Contrato de Origem *</label>
              <select 
                className={`w-full p-4 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-800 dark:text-white font-bold outline-none focus:ring-4 focus:ring-blue-500/10 transition-all ${isEditing ? 'opacity-60 cursor-not-allowed' : ''}`}
                value={selectedContractId}
                onChange={(e) => {
                  if (!isEditing) {
                    setSelectedContractId(e.target.value);
                    setQuantities({}); 
                    setError('');
                  }
                }}
                disabled={isEditing}
              >
                <option value="">Selecione o contrato...</option>
                {state.contracts.map(c => (
                  <option key={c.id} value={c.id}>Contrato {c.number} - {state.suppliers.find(s => s.id === c.supplierId)?.name}</option>
                ))}
              </select>
            </div>
            
            <div className="space-y-2">
              <label className="text-xs font-black text-slate-400 uppercase ml-1 tracking-widest">Número da Nota *</label>
              <input 
                type="text" 
                placeholder="Ex: 12345" 
                className="w-full p-4 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-800 dark:text-white font-bold outline-none focus:ring-4 focus:ring-blue-500/10 transition-all"
                value={invoiceNumber}
                onChange={(e) => setInvoiceNumber(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-black text-slate-400 uppercase ml-1 tracking-widest">Data de Emissão *</label>
              <input 
                type="date" 
                className="w-full p-4 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-800 dark:text-white font-bold outline-none focus:ring-4 focus:ring-blue-500/10 transition-all"
                value={issueDate}
                onChange={(e) => setIssueDate(e.target.value)}
              />
            </div>
          </div>

          {/* Mensagem de Erro Global */}
          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900/30 p-4 rounded-2xl flex items-center gap-3 text-red-700 dark:text-red-400 animate-in slide-in-from-top-2">
              <AlertCircle size={24} className="shrink-0" />
              <p className="text-sm font-bold">{error}</p>
            </div>
          )}

          {/* Passo 2: Tabela de Itens (Só aparece se tiver contrato selecionado) */}
          {selectedContract ? (
            <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-slate-800">
                <Package size={20} className="text-blue-600 dark:text-blue-400" />
                <h4 className="font-black text-slate-700 dark:text-slate-200 text-sm uppercase tracking-widest">Selecione os Itens e Quantitativos</h4>
              </div>
              
              <div className="bg-slate-50 dark:bg-slate-950 rounded-[2rem] border border-slate-200 dark:border-slate-800 overflow-hidden">
                <table className="w-full">
                  <thead>
                    <tr className="bg-slate-100 dark:bg-slate-900 text-left border-b border-slate-200 dark:border-slate-800">
                      <th className="p-4 text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest w-16 text-center">#</th>
                      <th className="p-4 text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">Descrição do Item</th>
                      <th className="p-4 text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest w-24 text-center">Unid</th>
                      <th className="p-4 text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest w-32 text-right">R$ Unit.</th>
                      <th className="p-4 text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest w-32 text-center bg-blue-50 dark:bg-blue-900/10">Saldo Atual</th>
                      <th className="p-4 text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest w-32 text-center bg-emerald-50 dark:bg-emerald-900/10">Qtd. NF</th>
                      <th className="p-4 text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest w-32 text-right">Subtotal</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                    {selectedContract.items.map((item, idx) => {
                      const qty = quantities[item.id] || 0;
                      const subtotal = qty * item.unitPrice;
                      
                      // Lógica de cálculo de saldo visual
                      let displayBalance = item.currentBalance;
                      if (editingInvoiceId) {
                        const originalInvoice = state.invoices.find(inv => inv.id === editingInvoiceId);
                        const originalItemUse = originalInvoice?.items.find(i => i.contractItemId === item.id)?.quantityUsed || 0;
                        displayBalance += originalItemUse;
                      }

                      const hasBalance = displayBalance > 0;

                      return (
                        <tr key={item.id} className={`transition-colors ${qty > 0 ? 'bg-blue-50/50 dark:bg-blue-900/10' : 'hover:bg-white dark:hover:bg-slate-900'}`}>
                          <td className="p-4 text-center text-slate-400 font-bold text-xs">{idx + 1}</td>
                          <td className="p-4 font-medium text-slate-700 dark:text-slate-300 text-sm">
                            {item.description}
                            {!hasBalance && <span className="ml-2 text-[10px] font-bold text-red-500 bg-red-100 dark:bg-red-900/30 px-2 py-0.5 rounded-full uppercase">Esgotado</span>}
                          </td>
                          <td className="p-4 text-center text-xs font-bold text-slate-500">{item.unit}</td>
                          <td className="p-4 text-right text-sm font-medium text-slate-600 dark:text-slate-400">
                            {formatCurrency(item.unitPrice)}
                          </td>
                          
                          {/* Coluna Saldo */}
                          <td className="p-4 text-center bg-blue-50/30 dark:bg-blue-900/5">
                            <span className={`font-black text-sm ${displayBalance <= 0 ? 'text-red-500' : 'text-blue-600 dark:text-blue-400'}`}>
                              {displayBalance.toFixed(2).replace('.', ',')}
                            </span>
                          </td>

                          {/* Coluna Input Qtd */}
                          <td className="p-2 bg-emerald-50/30 dark:bg-emerald-900/5">
                            <input 
                              type="number"
                              min="0"
                              max={displayBalance}
                              disabled={!hasBalance}
                              className={`w-full p-2 text-center rounded-lg border outline-none font-bold transition-all ${
                                !hasBalance 
                                  ? 'bg-slate-100 dark:bg-slate-800 text-slate-400 border-transparent cursor-not-allowed' 
                                  : qty > 0 
                                    ? 'border-emerald-500 ring-2 ring-emerald-500/20 bg-white dark:bg-slate-900 text-emerald-700 dark:text-emerald-400'
                                    : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus:border-blue-500'
                              }`}
                              value={qty === 0 ? '' : qty}
                              placeholder="0"
                              onChange={(e) => handleQuantityChange(item.id, e.target.value)}
                            />
                          </td>

                          {/* Coluna Subtotal */}
                          <td className="p-4 text-right">
                            <span className={`font-bold text-sm ${qty > 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400'}`}>
                              {formatCurrency(subtotal)}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-slate-400 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-3xl bg-slate-50/50 dark:bg-slate-900/50">
              <AlertTriangle size={48} className="mb-4 opacity-20" />
              <p className="font-bold">Aguardando Seleção de Contrato</p>
              <p className="text-sm">Selecione um contrato acima para carregar os itens e saldos.</p>
            </div>
          )}
        </div>

        {/* Footer com Totalizador */}
        <div className="p-6 bg-slate-50 dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 flex flex-col md:flex-row items-center justify-between gap-6 shrink-0">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-white dark:bg-slate-800 rounded-2xl flex items-center justify-center shadow-sm border border-slate-200 dark:border-slate-700">
              <Calculator size={24} className="text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Total da Nota Fiscal</p>
              <p className="text-2xl font-black text-slate-800 dark:text-white tracking-tighter">
                {formatCurrency(totalInvoiceValue)}
              </p>
            </div>
          </div>

          <div className="flex gap-4 w-full md:w-auto">
            <button 
              onClick={onClose}
              className="flex-1 md:flex-none px-8 py-4 rounded-xl font-bold text-slate-500 hover:bg-white dark:hover:bg-slate-800 transition-all border border-transparent hover:border-slate-200 dark:hover:border-slate-700"
            >
              Cancelar
            </button>
            <button 
              onClick={handleSaveInvoice}
              disabled={totalInvoiceValue <= 0}
              className="flex-1 md:flex-none bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 dark:disabled:bg-slate-800 disabled:text-slate-500 text-white px-10 py-4 rounded-xl font-bold shadow-lg shadow-emerald-200 dark:shadow-emerald-900/30 transition-all active:scale-95 flex items-center justify-center gap-2"
            >
              <FileCheck size={20} />
              {isEditing ? 'Salvar Alterações' : 'Confirmar Lançamento'}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default InvoiceForm;