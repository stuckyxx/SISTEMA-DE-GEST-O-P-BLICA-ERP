import React from 'react';
import { 
  X, Info, Hash, Gavel, FileBadge, PieChart, Plus, Trash2, Calculator 
} from 'lucide-react';
import { AppState, ContractItem } from '../../../types';
import { BIDDING_MODALITIES, UNIT_OPTIONS } from '../constants';
import { formatCurrency } from '../../../utils/format';

interface ContractFormProps {
  onClose: () => void;
  isEditing: boolean;
  formContract: {
    number: string;
    supplierId: string;
    biddingModality: string;
    startDate: string;
    endDate: string;
    ataId: string;
    secretariat: string;
  };
  setFormContract: React.Dispatch<React.SetStateAction<any>>;
  originType: 'direct' | 'ata';
  setOriginType: React.Dispatch<React.SetStateAction<'direct' | 'ata'>>;
  formItems: Partial<ContractItem>[];
  handleAddFormItem: () => void;
  handleRemoveFormItem: (id: string) => void;
  updateFormItem: (id: string, field: keyof ContractItem, value: any) => void;
  handleSaveContract: () => void;
  state: AppState;
  globalTotal: number;
  ataBalanceInfo: {
    totalDistributed: number;
    used: number;
    available: number;
  } | null;
}

const ContractForm: React.FC<ContractFormProps> = ({
  onClose,
  isEditing,
  formContract,
  setFormContract,
  originType,
  setOriginType,
  formItems,
  handleAddFormItem,
  handleRemoveFormItem,
  updateFormItem,
  handleSaveContract,
  state,
  globalTotal,
  ataBalanceInfo
}) => {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 dark:bg-black/60 backdrop-blur-md animate-in fade-in duration-300">
      <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] w-full max-w-7xl max-h-[92vh] overflow-hidden flex flex-col shadow-2xl border border-white/20 dark:border-slate-700">
        {/* Header do Modal */}
        <div className="px-10 py-8 flex items-center justify-between bg-white dark:bg-slate-900 shrink-0">
          <div>
            <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 mb-1">
              <Info size={18} />
              <span className="text-xs font-black uppercase tracking-widest">{isEditing ? 'Edição de Registro' : 'Novo Registro Administrativo'}</span>
            </div>
            <h3 className="text-3xl font-black text-slate-800 dark:text-white tracking-tight">{isEditing ? 'Editar Contrato' : 'Cadastro de Contrato'}</h3>
          </div>
          <button 
            onClick={onClose} 
            className="p-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-full transition-all text-slate-500 dark:text-slate-400 hover:scale-105 active:scale-95"
          >
            <X size={24} />
          </button>
        </div>

        {/* Conteúdo com Scroll */}
        <div className="flex-1 overflow-y-auto px-10 pb-10 space-y-12 custom-scrollbar">
          
          {/* Seção 1: Origem e Dados do Contrato */}
          <div className="bg-slate-50/50 dark:bg-slate-950/50 p-8 rounded-[2.5rem] border border-slate-100 dark:border-slate-800">
            
            {/* Seleção de Origem */}
            <div className="mb-8">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 ml-1">Origem do Contrato</p>
              <div className="flex gap-4">
                <button 
                  onClick={() => { setOriginType('direct'); setFormContract((p: any) => ({...p, ataId: '', secretariat: ''})); }}
                  className={`flex-1 py-4 rounded-2xl border-2 font-bold transition-all flex items-center justify-center gap-2 ${originType === 'direct' ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400' : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-500'}`}
                >
                  <Gavel size={20} /> Licitação Direta / Dispensa
                </button>
                <button 
                  onClick={() => setOriginType('ata')}
                  className={`flex-1 py-4 rounded-2xl border-2 font-bold transition-all flex items-center justify-center gap-2 ${originType === 'ata' ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400' : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-500'}`}
                >
                  <FileBadge size={20} /> Ata de Registro de Preço
                </button>
              </div>
            </div>

            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 bg-blue-600 text-white rounded-lg flex items-center justify-center">
                <Hash size={18} />
              </div>
              <h4 className="font-black text-slate-700 dark:text-slate-200 text-xs uppercase tracking-[0.2em]">Identificação Principal</h4>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
              
              {/* Se for ATA, mostrar seleção de Ata e Secretaria */}
              {originType === 'ata' && (
                <>
                  <div className="md:col-span-6 space-y-2">
                    <label className="text-[10px] font-black text-indigo-500 dark:text-indigo-400 uppercase tracking-widest ml-1">Vincular Ata de Registro de Preço</label>
                    <select 
                      className="w-full bg-white dark:bg-slate-900 p-4 rounded-2xl border border-indigo-200 dark:border-indigo-900/50 focus:border-indigo-500 outline-none transition-all font-bold text-slate-800 dark:text-white"
                      value={formContract.ataId}
                      onChange={(e) => setFormContract({...formContract, ataId: e.target.value})}
                    >
                      <option value="">Selecione a Ata...</option>
                      {state.atas.map(ata => (
                        <option key={ata.id} value={ata.id}>Proc: {ata.processNumber} - {ata.object.substring(0, 50)}...</option>
                      ))}
                    </select>
                  </div>
                  <div className="md:col-span-6 space-y-2">
                    <label className="text-[10px] font-black text-indigo-500 dark:text-indigo-400 uppercase tracking-widest ml-1">Secretaria (Centro de Custo)</label>
                    <select 
                      className="w-full bg-white dark:bg-slate-900 p-4 rounded-2xl border border-indigo-200 dark:border-indigo-900/50 focus:border-indigo-500 outline-none transition-all font-bold text-slate-800 dark:text-white"
                      value={formContract.secretariat}
                      onChange={(e) => setFormContract({...formContract, secretariat: e.target.value})}
                      disabled={!formContract.ataId}
                    >
                      <option value="">Selecione a Secretaria...</option>
                      {state.atas.find(a => a.id === formContract.ataId)?.distributions.map(dist => (
                        <option key={dist.id} value={dist.secretariatName}>
                          {dist.secretariatName} ({dist.percentage}%)
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Display de Saldo da Secretaria na Ata */}
                  {ataBalanceInfo && (
                    <div className="md:col-span-12 bg-indigo-50 dark:bg-indigo-900/20 p-4 rounded-2xl border border-indigo-100 dark:border-indigo-800 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <PieChart className="text-indigo-500" />
                        <div>
                          <p className="font-bold text-indigo-700 dark:text-indigo-300 text-sm">Saldo Disponível para {formContract.secretariat}</p>
                          <p className="text-xs text-indigo-500">De um total distribuído de {formatCurrency(ataBalanceInfo.totalDistributed)}</p>
                        </div>
                      </div>
                      <p className="text-2xl font-black text-indigo-600 dark:text-indigo-400">{formatCurrency(ataBalanceInfo.available)}</p>
                    </div>
                  )}
                </>
              )}

              <div className="md:col-span-4 space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Número do Contrato</label>
                <input 
                  type="text" 
                  placeholder="Ex: 123/2023"
                  className="w-full bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 focus:border-blue-500 outline-none transition-all font-bold text-slate-800 dark:text-white"
                  value={formContract.number}
                  onChange={e => setFormContract({...formContract, number: e.target.value})}
                />
              </div>

              <div className="md:col-span-8 space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Fornecedor Contratado</label>
                <select 
                  className="w-full bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 focus:border-blue-500 outline-none transition-all font-bold text-slate-800 dark:text-white"
                  value={formContract.supplierId}
                  onChange={e => setFormContract({...formContract, supplierId: e.target.value})}
                  disabled={originType === 'ata' && !!formContract.ataId} // Bloqueia se vier de Ata
                >
                  <option value="">Selecione o Fornecedor...</option>
                  {state.suppliers.map(supplier => (
                    <option key={supplier.id} value={supplier.id}>{supplier.name} - {supplier.cnpj}</option>
                  ))}
                </select>
              </div>

              <div className="md:col-span-4 space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Modalidade</label>
                <select 
                  className="w-full bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 focus:border-blue-500 outline-none transition-all font-bold text-slate-800 dark:text-white"
                  value={formContract.biddingModality}
                  onChange={e => setFormContract({...formContract, biddingModality: e.target.value})}
                >
                  <option value="">Selecione...</option>
                  {BIDDING_MODALITIES.map(m => <option key={m} value={m}>{m}</option>)}
                </select>
              </div>

              <div className="md:col-span-4 space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Data Início</label>
                <input 
                  type="date" 
                  className="w-full bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 focus:border-blue-500 outline-none transition-all font-bold text-slate-800 dark:text-white"
                  value={formContract.startDate}
                  onChange={e => setFormContract({...formContract, startDate: e.target.value})}
                />
              </div>

              <div className="md:col-span-4 space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Data Fim</label>
                <input 
                  type="date" 
                  className="w-full bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 focus:border-blue-500 outline-none transition-all font-bold text-slate-800 dark:text-white"
                  value={formContract.endDate}
                  onChange={e => setFormContract({...formContract, endDate: e.target.value})}
                />
              </div>
            </div>
          </div>

          {/* Seção 2: Itens do Contrato */}
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-emerald-600 text-white rounded-lg flex items-center justify-center">
                  <Calculator size={18} />
                </div>
                <h4 className="font-black text-slate-700 dark:text-slate-200 text-xs uppercase tracking-[0.2em]">Itens Contratados</h4>
              </div>
              <button 
                onClick={handleAddFormItem}
                className="bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 px-4 py-2 rounded-xl text-xs font-bold hover:bg-emerald-100 dark:hover:bg-emerald-900/40 transition-colors flex items-center gap-2"
              >
                <Plus size={16} /> Adicionar Item
              </button>
            </div>

            <div className="space-y-3">
              {formItems.map((item, index) => (
                <div key={item.id} className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-col lg:flex-row items-start lg:items-center gap-4 hover:border-blue-300 transition-colors group">
                  <div className="w-8 h-8 bg-slate-100 dark:bg-slate-800 rounded-lg flex items-center justify-center font-bold text-slate-400 text-xs">
                    {index + 1}
                  </div>
                  
                  <div className="flex-1 w-full lg:w-auto">
                    <input 
                      type="text" 
                      placeholder="Descrição do item..." 
                      className="w-full bg-transparent outline-none font-bold text-slate-700 dark:text-slate-200 placeholder:font-normal"
                      value={item.description}
                      onChange={e => updateFormItem(item.id!, 'description', e.target.value)}
                    />
                  </div>

                  <div className="flex gap-2 w-full lg:w-auto">
                    <div className="w-32">
                        <select
                          className="w-full bg-slate-50 dark:bg-slate-800 p-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-600 outline-none"
                          value={item.unit}
                          onChange={e => updateFormItem(item.id!, 'unit', e.target.value)}
                        >
                            {UNIT_OPTIONS.map(u => (
                                <option key={u.sigla} value={u.sigla}>{u.sigla}</option>
                            ))}
                        </select>
                    </div>
                    
                    <div className="w-32 relative">
                      <span className="absolute left-3 top-2 text-[10px] font-bold text-slate-400 uppercase">Qtd</span>
                      <input 
                        type="number" 
                        className="w-full bg-slate-50 dark:bg-slate-800 pl-3 pr-3 pt-5 pb-1 rounded-xl border border-slate-200 dark:border-slate-700 outline-none font-black text-slate-700 dark:text-slate-200 text-right"
                        value={item.originalQty}
                        onChange={e => updateFormItem(item.id!, 'originalQty', Number(e.target.value))}
                      />
                    </div>

                    <div className="w-40 relative">
                       <span className="absolute left-3 top-2 text-[10px] font-bold text-slate-400 uppercase">Unitário</span>
                       <input 
                        type="number" 
                        className="w-full bg-slate-50 dark:bg-slate-800 pl-3 pr-3 pt-5 pb-1 rounded-xl border border-slate-200 dark:border-slate-700 outline-none font-black text-slate-700 dark:text-slate-200 text-right"
                        value={item.unitPrice}
                        onChange={e => updateFormItem(item.id!, 'unitPrice', Number(e.target.value))}
                      />
                    </div>
                  </div>

                  <div className="w-full lg:w-40 text-right px-4">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Item</p>
                    <p className="font-bold text-slate-800 dark:text-slate-200">
                      {formatCurrency((item.originalQty || 0) * (item.unitPrice || 0))}
                    </p>
                  </div>

                  <button 
                    onClick={() => handleRemoveFormItem(item.id!)}
                    className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              ))}
            </div>
            
            {/* Footer do Modal com Total */}
            <div className="mt-8 flex items-center justify-between border-t border-slate-100 dark:border-slate-800 pt-8">
               <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Valor Global do Contrato</p>
                  <p className="text-4xl font-black text-slate-800 dark:text-white tracking-tighter mt-1">
                    {formatCurrency(globalTotal)}
                  </p>
               </div>
               
               <button 
                onClick={handleSaveContract}
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-2xl font-bold text-lg shadow-xl shadow-blue-200 dark:shadow-blue-900/20 hover:scale-105 active:scale-95 transition-all flex items-center gap-3"
               >
                 <FileBadge size={24} />
                 Salvar Contrato
               </button>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default ContractForm;