import React from 'react';
import { 
  X, CheckCircle2, XCircle 
} from 'lucide-react';
import { AppState, ServiceOrderItem, Contract } from '../../../types';
import { formatCurrency } from '../../../utils/format';

interface ServiceOrderFormProps {
  onClose: () => void;
  selectedContractId: string;
  setSelectedContractId: (id: string) => void;
  osDate: string;
  setOsDate: (date: string) => void;
  osDescription: string;
  setOsDescription: (desc: string) => void;
  osItems: ServiceOrderItem[];
  setOsItems: React.Dispatch<React.SetStateAction<ServiceOrderItem[]>>;
  selectedContract: Contract | undefined;
  handleAddItem: (itemId: string) => void;
  handleUpdateQty: (itemId: string, qty: number) => void;
  handleCreateOS: () => void;
  resetForm: () => void;
  state: AppState;
}

const ServiceOrderForm: React.FC<ServiceOrderFormProps> = ({
  onClose,
  selectedContractId,
  setSelectedContractId,
  osDate,
  setOsDate,
  osDescription,
  setOsDescription,
  osItems,
  setOsItems,
  selectedContract,
  handleAddItem,
  handleUpdateQty,
  handleCreateOS,
  resetForm,
  state
}) => {


  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl border border-white/20 dark:border-slate-800">
        <div className="px-8 py-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-white dark:bg-slate-900">
          <h3 className="text-xl font-bold text-slate-800 dark:text-white">Emitir Nova Ordem de Serviço</h3>
          <button onClick={() => { onClose(); resetForm(); }} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full text-slate-500 dark:text-slate-400">
            <X size={24} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-8 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Contrato Vigente *</label>
              <select 
                className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-800 dark:text-white font-medium"
                value={selectedContractId}
                onChange={(e) => setSelectedContractId(e.target.value)}
              >
                <option value="">Selecione o contrato...</option>
                {state.contracts.map(c => (
                  <option key={c.id} value={c.id}>Contrato {c.number} - {state.suppliers.find(s => s.id === c.supplierId)?.name}</option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Data de Emissão</label>
              <input 
                type="date" 
                className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-800 dark:text-white"
                value={osDate}
                onChange={(e) => setOsDate(e.target.value)}
              />
            </div>
            <div className="md:col-span-2 space-y-2">
              <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Descrição da Solicitação *</label>
              <textarea 
                placeholder="Ex: Aquisição de material de expediente para a Secretaria de Educação..."
                className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-800 dark:text-white h-24 resize-none"
                value={osDescription}
                onChange={(e) => setOsDescription(e.target.value)}
              />
            </div>
          </div>

          {selectedContract && (
            <div className="space-y-4 pt-4 border-t border-slate-100 dark:border-slate-800">
              <h4 className="font-bold text-slate-700 dark:text-slate-300 mb-2">Selecione os Itens para Autorização</h4>
              
              {/* Lista de Itens do Contrato para Seleção */}
              <div className="flex flex-wrap gap-2 mb-6">
                {selectedContract.items.map(item => (
                  <button 
                    key={item.id}
                    onClick={() => handleAddItem(item.id)}
                    className={`text-xs font-bold px-3 py-2 rounded-lg border transition-all text-left ${
                      osItems.find(i => i.contractItemId === item.id) 
                        ? 'bg-blue-600 text-white border-blue-600' 
                        : 'bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-blue-400'
                    }`}
                  >
                    {item.description}
                  </button>
                ))}
              </div>

              {/* Tabela de Itens Selecionados */}
              {osItems.length > 0 && (
                <div className="bg-slate-50 dark:bg-slate-950 rounded-2xl p-4 border border-slate-100 dark:border-slate-800">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-left text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800">
                        <th className="pb-2 pl-2">Item</th>
                        <th className="pb-2 w-24">Qtd. Auth</th>
                        <th className="pb-2 text-right pr-2">Total</th>
                        <th className="w-10"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                      {osItems.map((osItem, idx) => {
                        const contractItem = selectedContract?.items.find(i => i.id === osItem.contractItemId);
                        return (
                          <tr key={idx}>
                            <td className="py-3 pl-2 font-medium text-slate-700 dark:text-slate-300">
                              {contractItem?.description}
                              <div className="text-[10px] text-slate-400">Saldo Contratual: {contractItem?.currentBalance} {contractItem?.unit}</div>
                            </td>
                            <td className="py-3">
                              <input 
                                type="number" 
                                className="w-20 p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-center font-bold"
                                value={osItem.quantity}
                                onChange={(e) => handleUpdateQty(osItem.contractItemId, parseFloat(e.target.value))}
                              />
                            </td>
                            <td className="py-3 text-right pr-2 font-bold text-slate-700 dark:text-slate-300">
                              {formatCurrency(osItem.total)}
                            </td>
                            <td className="py-3 text-center">
                              <button 
                                onClick={() => setOsItems(osItems.filter(i => i.contractItemId !== osItem.contractItemId))}
                                className="text-slate-400 hover:text-red-500"
                              >
                                <XCircle size={18} />
                              </button>
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

        <div className="p-6 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 flex justify-end gap-3">
          <button 
            onClick={() => { onClose(); resetForm(); }}
            className="px-6 py-3 rounded-xl font-bold text-slate-500 hover:bg-white dark:hover:bg-slate-800 transition-colors"
          >
            Cancelar
          </button>
          <button 
            onClick={handleCreateOS}
            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-xl font-bold shadow-lg shadow-blue-200 dark:shadow-blue-900/30 transition-all flex items-center gap-2"
          >
            <CheckCircle2 size={20} />
            Emitir Ordem
          </button>
        </div>
      </div>
    </div>
  );
};

export default ServiceOrderForm;