import React from 'react';
import { 
  X, Loader2, FileSpreadsheet, AlertTriangle, Trash2, PieChart, Save 
} from 'lucide-react';
import { AppState, Ata, AtaItem, AtaDistribution } from '../../../types';
import { formatCurrency } from '../../../utils/format';

interface AtaFormProps {
  onClose: () => void;
  isEditing: boolean;
  formData: Partial<Ata>;
  setFormData: React.Dispatch<React.SetStateAction<Partial<Ata>>>;
  items: AtaItem[];
  handleUpdateItem: (id: string, field: keyof AtaItem, value: any) => void;
  removeItem: (id: string) => void;
  handleAddItem: () => void;
  totalValue: number;
  distributions: AtaDistribution[];
  handleAddDistribution: () => void;
  removeDistribution: (id: string) => void;
  newDistSecretariat: string;
  setNewDistSecretariat: (val: string) => void;
  newDistPercent: number;
  setNewDistPercent: (val: number) => void;
  reservedPercent: number;
  reservedValue: number;
  handleSaveAta: () => void;
  
  isImporting: boolean;
  importStatus: string;
  handleFileUpload: (event: React.ChangeEvent<HTMLInputElement>) => Promise<void>;
  fileInputRef: React.RefObject<HTMLInputElement>;
  warningMsg: string;
  
  state: AppState;
}

const AtaForm: React.FC<AtaFormProps> = ({
  onClose,
  isEditing,
  formData,
  setFormData,
  items,
  handleUpdateItem,
  removeItem,
  handleAddItem,
  totalValue,
  distributions,
  handleAddDistribution,
  removeDistribution,
  newDistSecretariat,
  setNewDistSecretariat,
  newDistPercent,
  setNewDistPercent,
  reservedPercent,
  reservedValue,
  handleSaveAta,
  isImporting,
  importStatus,
  handleFileUpload,
  fileInputRef,
  warningMsg,
  state
}) => {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white dark:bg-slate-900 rounded-[2rem] w-full max-w-7xl max-h-[95vh] overflow-hidden flex flex-col shadow-2xl border border-white/20">
        
        {/* Header */}
        <div className="px-8 py-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-white dark:bg-slate-900 shrink-0">
          <div>
            <h3 className="text-2xl font-black text-slate-800 dark:text-white">
              {isEditing ? 'Editar Ata de Registro' : 'Cadastro de Ata de Registro de Preços'}
            </h3>
            <p className="text-xs text-slate-500">
              {isEditing ? 'Altere itens e distribuição conforme necessário.' : 'Preencha manualmente ou utilize a IA para importar PDF ou Excel.'}
            </p>
          </div>
          <div className="flex gap-2">
            {!isEditing && (
              <>
                <input 
                  type="file" 
                  accept="application/pdf, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel" 
                  className="hidden" 
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                />
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isImporting}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all disabled:opacity-80 ${isImporting ? 'bg-emerald-600 text-white' : 'bg-indigo-600 hover:bg-indigo-700 text-white'}`}
                >
                  {isImporting ? <Loader2 className="animate-spin" size={16} /> : <FileSpreadsheet size={16} />}
                  {isImporting ? importStatus : 'Importar PDF ou Excel (IA)'}
                </button>
              </>
            )}
            <button onClick={onClose} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full text-slate-400">
              <X size={24} />
            </button>
          </div>
        </div>

        {/* Conteúdo Scrollable */}
        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar space-y-8">
          
          {/* Aviso de Leitura Parcial */}
          {warningMsg && (
            <div className="bg-orange-50 dark:bg-orange-900/30 border border-orange-200 dark:border-orange-800 p-4 rounded-xl flex items-center gap-3 text-orange-700 dark:text-orange-400">
              <AlertTriangle size={20} />
              <p className="text-sm font-bold">{warningMsg}</p>
            </div>
          )}

          {/* Seção 1: Dados Principais */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="md:col-span-1 space-y-2">
              <label className="text-[10px] font-bold uppercase text-slate-400 tracking-widest">Processo Nº</label>
              <input 
                type="text" 
                className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 font-bold outline-none focus:border-blue-500 text-slate-800 dark:text-white"
                value={formData.processNumber}
                onChange={e => setFormData({...formData, processNumber: e.target.value})}
              />
            </div>
            <div className="md:col-span-1 space-y-2">
              <label className="text-[10px] font-bold uppercase text-slate-400 tracking-widest">Ano</label>
              <input 
                type="text" 
                className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 font-bold outline-none focus:border-blue-500 text-slate-800 dark:text-white"
                value={formData.year}
                onChange={e => setFormData({...formData, year: e.target.value})}
              />
            </div>
            <div className="md:col-span-2 space-y-2">
              <label className="text-[10px] font-bold uppercase text-slate-400 tracking-widest">Fornecedor Vencedor</label>
              <select 
                className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 font-bold outline-none focus:border-blue-500 text-slate-800 dark:text-white"
                value={formData.supplierId}
                onChange={e => setFormData({...formData, supplierId: e.target.value})}
              >
                <option value="">Selecione...</option>
                {state.suppliers.map(s => <option key={s.id} value={s.id}>{s.name} ({s.cnpj})</option>)}
              </select>
            </div>
            <div className="md:col-span-4 space-y-2">
              <label className="text-[10px] font-bold uppercase text-slate-400 tracking-widest">Modalidade</label>
              <input 
                type="text" 
                placeholder="Ex: Pregão Eletrônico nº 010/2023"
                className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 font-medium outline-none focus:border-blue-500 text-slate-800 dark:text-white"
                value={formData.modality}
                onChange={e => setFormData({...formData, modality: e.target.value})}
              />
            </div>
            <div className="md:col-span-4 space-y-2">
              <label className="text-[10px] font-bold uppercase text-slate-400 tracking-widest">Objeto</label>
              <textarea 
                className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 font-medium outline-none focus:border-blue-500 text-slate-800 dark:text-white resize-none h-20"
                value={formData.object}
                onChange={e => setFormData({...formData, object: e.target.value})}
              />
            </div>
          </div>

          {/* Seção 2: Itens */}
          <div className="space-y-4">
            <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-2">
              <h4 className="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                Itens da Ata
                {items.length > 0 && <span className="bg-slate-200 dark:bg-slate-800 text-xs px-2 py-0.5 rounded-full">{items.length} itens</span>}
              </h4>
              <button onClick={handleAddItem} className="text-xs bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 px-3 py-1.5 rounded-lg font-bold transition-colors">
                + Adicionar Item
              </button>
            </div>
            
            <div className="overflow-x-auto max-h-[400px] custom-scrollbar rounded-xl border border-slate-200 dark:border-slate-800">
              <table className="w-full text-sm text-left relative">
                <thead className="bg-slate-50 dark:bg-slate-950 text-slate-500 dark:text-slate-400 uppercase text-[10px] font-bold sticky top-0 z-10 shadow-sm">
                  <tr>
                    <th className="p-3 w-16 text-center bg-slate-50 dark:bg-slate-950">Item</th>
                    <th className="p-3 w-24 text-center bg-slate-50 dark:bg-slate-950">Lote</th>
                    <th className="p-3 bg-slate-50 dark:bg-slate-950">Descrição</th>
                    <th className="p-3 w-32 bg-slate-50 dark:bg-slate-950">Marca</th>
                    <th className="p-3 w-20 text-center bg-slate-50 dark:bg-slate-950">Und</th>
                    <th className="p-3 w-24 text-center bg-slate-50 dark:bg-slate-950">Qtd</th>
                    <th className="p-3 w-32 text-right bg-slate-50 dark:bg-slate-950">Unitário</th>
                    <th className="p-3 w-32 text-right bg-slate-50 dark:bg-slate-950">Total</th>
                    <th className="p-3 w-10 bg-slate-50 dark:bg-slate-950"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {items.map((item, index) => (
                    <tr key={item.id} className="hover:bg-slate-50 dark:hover:bg-slate-900/50">
                      <td className="p-2 text-center font-bold text-slate-400">{item.itemNumber || index + 1}</td>
                      <td className="p-2">
                        <input 
                          type="text" 
                          className="w-full bg-transparent outline-none text-center font-medium text-blue-600 dark:text-blue-400"
                          value={item.lote || ''}
                          onChange={e => handleUpdateItem(item.id, 'lote', e.target.value)}
                          placeholder="Lote"
                        />
                      </td>
                      <td className="p-2">
                        <input 
                          type="text" 
                          className="w-full bg-transparent outline-none font-medium text-slate-700 dark:text-slate-200"
                          value={item.description}
                          onChange={e => handleUpdateItem(item.id, 'description', e.target.value)}
                          placeholder="Descrição do item"
                        />
                      </td>
                      <td className="p-2">
                        <input 
                          type="text" 
                          className="w-full bg-transparent outline-none text-slate-600 dark:text-slate-400"
                          value={item.brand}
                          onChange={e => handleUpdateItem(item.id, 'brand', e.target.value)}
                          placeholder="Marca"
                        />
                      </td>
                      <td className="p-2">
                        <input 
                          type="text" 
                          className="w-full bg-transparent outline-none text-center font-bold text-slate-500 uppercase"
                          value={item.unit}
                          onChange={e => handleUpdateItem(item.id, 'unit', e.target.value)}
                        />
                      </td>
                      <td className="p-2">
                        <input 
                          type="number" 
                          className="w-full bg-slate-50 dark:bg-slate-800 rounded p-1 outline-none text-center font-bold"
                          value={item.quantity}
                          onChange={e => handleUpdateItem(item.id, 'quantity', Number(e.target.value))}
                        />
                      </td>
                      <td className="p-2">
                        <input 
                          type="number" 
                          className="w-full bg-slate-50 dark:bg-slate-800 rounded p-1 outline-none text-right font-bold"
                          value={item.unitPrice}
                          onChange={e => handleUpdateItem(item.id, 'unitPrice', Number(e.target.value))}
                        />
                      </td>
                      <td className="p-2 text-right font-black text-slate-700 dark:text-slate-300">
                        {formatCurrency(item.totalPrice)}
                      </td>
                      <td className="p-2 text-center">
                        <button onClick={() => removeItem(item.id)} className="text-slate-300 hover:text-red-500"><Trash2 size={16} /></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-slate-50 dark:bg-slate-950 font-bold sticky bottom-0 z-10 shadow-inner">
                  <tr>
                    <td colSpan={7} className="p-3 text-right text-slate-500 uppercase text-xs tracking-widest bg-slate-50 dark:bg-slate-950">Total Geral da Ata</td>
                    <td className="p-3 text-right text-slate-800 dark:text-white text-lg bg-slate-50 dark:bg-slate-950">
                      {formatCurrency(totalValue)}
                    </td>
                    <td className="bg-slate-50 dark:bg-slate-950"></td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

          {/* Seção 3: Distribuição Financeira (O 50%) */}
          <div className="bg-slate-50/50 dark:bg-slate-950/50 p-6 rounded-2xl border border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-xl flex items-center justify-center">
                <PieChart size={20} />
              </div>
              <div>
                <h4 className="font-bold text-slate-800 dark:text-white">Distribuição Orçamentária</h4>
                <p className="text-xs text-slate-500">Defina a porcentagem da Ata destinada a cada secretaria.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Form de Adicionar */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase text-slate-400 tracking-widest">Secretaria</label>
                  <input 
                    type="text" 
                    placeholder="Ex: Saúde, Educação..." 
                    className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 outline-none"
                    value={newDistSecretariat}
                    onChange={e => setNewDistSecretariat(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase text-slate-400 tracking-widest">Porcentagem (%)</label>
                  <div className="relative">
                    <input 
                      type="number" 
                      placeholder="50" 
                      max="100"
                      className="w-full p-3 pr-8 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 outline-none font-bold"
                      value={newDistPercent || ''}
                      onChange={e => setNewDistPercent(Number(e.target.value))}
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold">%</span>
                  </div>
                </div>
                <button 
                  onClick={handleAddDistribution}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-xl transition-all"
                >
                  Adicionar Distribuição
                </button>
              </div>

              {/* Lista e Gráfico */}
              <div className="md:col-span-2 space-y-4">
                {distributions.map(dist => (
                  <div key={dist.id} className="flex items-center justify-between p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700">
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-10 bg-indigo-500 rounded-full" />
                      <div>
                        <p className="font-bold text-slate-700 dark:text-slate-200">{dist.secretariatName}</p>
                        <p className="text-xs text-slate-400">{dist.percentage}% do valor total</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <p className="font-bold text-slate-800 dark:text-white">
                        {formatCurrency(dist.value)}
                      </p>
                      <button onClick={() => removeDistribution(dist.id)} className="text-slate-300 hover:text-red-500">
                        <X size={18} />
                      </button>
                    </div>
                  </div>
                ))}

                {/* Resumo da Reserva */}
                <div className="flex items-center justify-between p-3 bg-orange-50 dark:bg-orange-900/10 rounded-xl border border-orange-100 dark:border-orange-800/30">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-10 bg-orange-400 rounded-full" />
                    <div>
                      <p className="font-bold text-orange-800 dark:text-orange-200">Reserva Técnica (Saldo Restante)</p>
                      <p className="text-xs text-orange-600/70 dark:text-orange-300/70">{reservedPercent}% não distribuído</p>
                    </div>
                  </div>
                  <p className="font-bold text-orange-700 dark:text-orange-300">
                    {formatCurrency(reservedValue)}
                  </p>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="p-6 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 flex justify-end gap-3 shrink-0">
          <button 
            onClick={onClose}
            className="px-6 py-3 rounded-xl font-bold text-slate-500 hover:bg-white dark:hover:bg-slate-800 transition-colors"
          >
            Cancelar
          </button>
          <button 
            onClick={handleSaveAta} 
            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-xl font-bold shadow-lg flex items-center gap-2"
          >
            <Save size={20} /> {isEditing ? 'Atualizar Ata' : 'Salvar Ata'}
          </button>
        </div>

      </div>
    </div>
  );
};

export default AtaForm;