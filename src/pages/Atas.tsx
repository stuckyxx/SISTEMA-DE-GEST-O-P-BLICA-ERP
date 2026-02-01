
import React, { useState, useRef, useMemo } from 'react';
import { 
  Plus, 
  Search, 
  FileBadge, 
  Upload, 
  Trash2, 
  Save, 
  X, 
  Building2, 
  PieChart,
  Bot,
  Loader2,
  ChevronDown,
  CheckCircle2,
  Pencil,
  AlertTriangle,
  FileSpreadsheet
} from 'lucide-react';
import { AppState, Ata, AtaItem, AtaDistribution } from '../types';
import { processUploadFile, ImportedData } from '../services/importService';
import { formatCurrency } from '../utils/format';
import { Button } from '../components/ui/Button';

interface AtasProps {
  state: AppState;
  setState: React.Dispatch<React.SetStateAction<AppState>>;
}

const Atas: React.FC<AtasProps> = ({ state, setState }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAtaId, setEditingAtaId] = useState<string | null>(null);
  
  // Status de Importação
  const [isImporting, setIsImporting] = useState(false);
  const [importStatus, setImportStatus] = useState(''); 
  const [warningMsg, setWarningMsg] = useState('');
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form State
  const [formData, setFormData] = useState<Partial<Ata>>({
    processNumber: '',
    modality: '',
    object: '',
    supplierId: '',
    year: new Date().getFullYear().toString(),
    items: [],
    distributions: [],
    reservedPercentage: 100
  });

  // State para itens
  const [items, setItems] = useState<AtaItem[]>([]);
  
  // State para distribuição
  const [distributions, setDistributions] = useState<AtaDistribution[]>([]);
  const [newDistSecretariat, setNewDistSecretariat] = useState('');
  const [newDistPercent, setNewDistPercent] = useState<number>(0);

  const totalValue = useMemo(() => {
    return items.reduce((acc, item) => acc + item.totalPrice, 0);
  }, [items]);

  const filteredAtas = (state.atas || []).filter(a => 
    a.processNumber.toLowerCase().includes(searchTerm.toLowerCase()) || 
    a.object.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // --- AI IMPORT LOGIC OTIMIZADA ---
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const isPdf = file.type === 'application/pdf';
    const isExcel = file.type.includes('sheet') || file.name.endsWith('.xlsx') || file.name.endsWith('.xls');

    if (!isPdf && !isExcel) {
      alert('Por favor, envie apenas arquivos PDF ou Excel (.xlsx, .xls).');
      return;
    }


    setIsImporting(true);
    setWarningMsg('');

    try {
      const extractedData = await processUploadFile(
        file, 
        process.env.API_KEY || '', // Ensure API key is available
        setImportStatus
      );

      // Identificar fornecedor
      let foundSupplierId = '';
      
      // Attempt to find supplier
      if (extractedData.supplierName) {
          const supplier = state.suppliers.find(s => 
            s.name.toLowerCase().includes(extractedData.supplierName?.toLowerCase() || '') || 
            (extractedData.supplierName?.toLowerCase() || '').includes(s.name.toLowerCase())
          );
          if (supplier) foundSupplierId = supplier.id;
      }

      // Atualizar formulário
      setFormData(prev => ({
        ...prev,
        processNumber: extractedData.processNumber || prev.processNumber,
        supplierId: foundSupplierId || prev.supplierId
      }));

      // Map items
      if (extractedData.items && Array.isArray(extractedData.items)) {
          const newItems: AtaItem[] = extractedData.items.map((item: any) => ({
              id: Math.random().toString(36).substr(2, 9),
              lote: item.lote || 'Único',
              itemNumber: parseInt(item.itemNumber) || 0,
              description: item.description || '',
              brand: item.brand || '',
              unit: item.unit || 'UN',
              quantity: parseFloat(item.quantity) || 0,
              unitPrice: parseFloat(item.unitPrice) || 0,
              totalPrice: (parseFloat(item.quantity) || 0) * (parseFloat(item.unitPrice) || 0)
          }));
          setItems(newItems);
      }
      
      setImportStatus('Concluído!');
      setTimeout(() => setIsImporting(false), 1500);

    } catch (error: any) {
      console.error("Erro na importação:", error);
      setImportStatus('Erro');
      setIsImporting(false);
      // Alert removido para evitar problemas de compilação
      console.warn(`Erro detalhado: ${error.message}`);
    }
    
    // Limpa input
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // --- ITEM MANAGEMENT LOGIC ---
  const handleUpdateItem = (id: string, field: keyof AtaItem, value: any) => {
    setItems(items.map(item => {
      if (item.id === id) {
        const updated = { ...item, [field]: value };
        // Recalcular total se mudar qtd ou preço
        if (field === 'quantity' || field === 'unitPrice') {
          updated.totalPrice = updated.quantity * updated.unitPrice;
        }
        return updated;
      }
      return item;
    }));
  };

  const removeItem = (id: string) => {
    setItems(items.filter(i => i.id !== id));
  };

  // --- DISTRIBUTION LOGIC ---
  const handleAddDistribution = () => {
    if (!newDistSecretariat || newDistPercent <= 0) return;

    const currentDistributed = distributions.reduce((acc, d) => acc + d.percentage, 0);
    const available = 100 - currentDistributed;

    if (newDistPercent > available) {
      alert(`Atenção: Você só tem ${available}% disponível para distribuir.`);
      return;
    }

    const newValue = (totalValue * newDistPercent) / 100;

    const newDist: AtaDistribution = {
      id: Math.random().toString(36).substr(2, 9),
      secretariatName: newDistSecretariat,
      percentage: newDistPercent,
      value: newValue
    };

    setDistributions([...distributions, newDist]);
    setNewDistSecretariat('');
    setNewDistPercent(0);
  };

  const removeDistribution = (id: string) => {
    setDistributions(distributions.filter(d => d.id !== id));
  };

  const reservedPercent = 100 - distributions.reduce((acc, d) => acc + d.percentage, 0);
  const reservedValue = (totalValue * reservedPercent) / 100;

  // --- EDIT & SAVE ATA ---
  
  const handleEditAta = (ata: Ata) => {
    setEditingAtaId(ata.id);
    
    // Popula o formulário com os dados existentes
    setFormData({
      processNumber: ata.processNumber,
      modality: ata.modality,
      object: ata.object,
      supplierId: ata.supplierId,
      year: ata.year
    });

    // Clona os itens e distribuições para evitar mutação direta antes de salvar
    setItems(ata.items.map(i => ({...i})));
    setDistributions(ata.distributions.map(d => ({...d})));
    
    setIsModalOpen(true);
  };

  const handleSaveAta = () => {
    if (!formData.processNumber || !formData.supplierId || items.length === 0) {
      alert("Preencha o número do processo, fornecedor e adicione itens.");
      return;
    }

    // Recalcula o valor das distribuições com base no novo total (caso itens tenham mudado)
    const updatedDistributions = distributions.map(d => ({
      ...d,
      value: (totalValue * d.percentage) / 100
    }));

    const ataData: Ata = {
      id: editingAtaId || Math.random().toString(36).substr(2, 9),
      processNumber: formData.processNumber!,
      modality: formData.modality || '',
      object: formData.object || '',
      supplierId: formData.supplierId!,
      year: formData.year || new Date().getFullYear().toString(),
      totalValue: totalValue,
      items: items,
      distributions: updatedDistributions,
      reservedPercentage: reservedPercent,
      createdAt: editingAtaId 
        ? (state.atas.find(a => a.id === editingAtaId)?.createdAt || new Date().toISOString()) 
        : new Date().toISOString()
    };

    if (editingAtaId) {
      // Atualizar Ata Existente
      setState(prev => ({
        ...prev,
        atas: prev.atas.map(a => a.id === editingAtaId ? ataData : a)
      }));
    } else {
      // Criar Nova Ata
      setState(prev => ({
        ...prev,
        atas: [...(prev.atas || []), ataData]
      }));
    }

    setIsModalOpen(false);
    resetForm();
  };

  const handleDeleteAta = (id: string) => {
    if (confirm("Deseja realmente excluir esta Ata?")) {
      setState(prev => ({
        ...prev,
        atas: prev.atas.filter(a => a.id !== id)
      }));
    }
  };

  const resetForm = () => {
    setEditingAtaId(null);
    setFormData({ year: new Date().getFullYear().toString(), processNumber: '', modality: '', object: '', supplierId: '' });
    setItems([]);
    setDistributions([]);
    setWarningMsg('');
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
            ATAS / Registro de Preço
          </h2>
          <p className="text-slate-500 dark:text-slate-400">Gestão de Atas e Distribuição de Saldo.</p>
        </div>
        <button 
          onClick={() => { resetForm(); setIsModalOpen(true); }}
          className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl transition-all font-bold shadow-lg shadow-blue-200 dark:shadow-blue-900/30"
        >
          <Plus size={20} />
          Nova Ata
        </button>
      </div>

      {/* Lista de Atas */}
      <div className="grid grid-cols-1 gap-4">
        {/* Filtro */}
        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 flex items-center gap-3">
          <Search className="text-slate-400" size={20} />
          <input 
            type="text" 
            placeholder="Buscar por nº processo ou objeto..." 
            className="flex-1 outline-none text-slate-700 dark:text-slate-200 font-medium bg-transparent"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {filteredAtas.length === 0 ? (
          <div className="text-center py-12 text-slate-400 bg-white dark:bg-slate-900 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800">
            <FileBadge size={48} className="mx-auto mb-4 opacity-20" />
            <p>Nenhuma Ata Registrada.</p>
          </div>
        ) : (
          filteredAtas.map(ata => {
            const supplier = state.suppliers.find(s => s.id === ata.supplierId);
            return (
              <div key={ata.id} className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm hover:border-blue-300 transition-all">
                <div className="flex flex-col md:flex-row justify-between gap-4">
                  <div>
                    <h3 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2">
                      <FileBadge size={20} className="text-blue-500" />
                      Processo: {ata.processNumber}
                    </h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 font-medium">{ata.modality}</p>
                    <p className="text-xs text-slate-400 mt-2 max-w-2xl">{ata.object}</p>
                    <div className="flex items-center gap-2 mt-4 text-sm text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-800 px-3 py-1.5 rounded-lg w-fit">
                      <Building2 size={14} />
                      {supplier?.name || 'Fornecedor não identificado'}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Valor Total da Ata</p>
                    <p className="text-2xl font-black text-slate-800 dark:text-white mb-4">
                      {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(ata.totalValue)}
                    </p>
                    
                    <div className="flex justify-end gap-2">
                      <div className="text-right px-3 py-1 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg border border-emerald-100 dark:border-emerald-800">
                        <p className="text-[9px] font-bold text-emerald-600 dark:text-emerald-400 uppercase">Distribuído</p>
                        <p className="font-bold text-emerald-700 dark:text-emerald-300 text-sm">{100 - ata.reservedPercentage}%</p>
                      </div>
                      <div className="text-right px-3 py-1 bg-orange-50 dark:bg-orange-900/20 rounded-lg border border-orange-100 dark:border-orange-800">
                        <p className="text-[9px] font-bold text-orange-600 dark:text-orange-400 uppercase">Reserva</p>
                        <p className="font-bold text-orange-700 dark:text-orange-300 text-sm">{ata.reservedPercentage}%</p>
                      </div>
                    </div>

                    <div className="flex items-center justify-end gap-2 mt-4">
                      <button 
                        onClick={() => handleEditAta(ata)}
                        className="text-indigo-500 hover:text-indigo-600 bg-indigo-50 dark:bg-indigo-900/20 px-3 py-2 rounded-lg text-xs font-bold flex items-center gap-1 transition-colors"
                      >
                        <Pencil size={14} /> Editar
                      </button>
                      <button 
                        onClick={() => handleDeleteAta(ata.id)}
                        className="text-red-400 hover:text-red-500 bg-red-50 dark:bg-red-900/20 px-3 py-2 rounded-lg text-xs font-bold flex items-center gap-1 transition-colors"
                      >
                        <Trash2 size={14} /> Excluir
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* MODAL DE CADASTRO / EDIÇÃO */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white dark:bg-slate-900 rounded-[2rem] w-full max-w-7xl max-h-[95vh] overflow-hidden flex flex-col shadow-2xl border border-white/20">
            
            {/* Header */}
            <div className="px-8 py-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-white dark:bg-slate-900 shrink-0">
              <div>
                <h3 className="text-2xl font-black text-slate-800 dark:text-white">
                  {editingAtaId ? 'Editar Ata de Registro' : 'Cadastro de Ata de Registro de Preços'}
                </h3>
                <p className="text-xs text-slate-500">
                  {editingAtaId ? 'Altere itens e distribuição conforme necessário.' : 'Preencha manualmente ou utilize a IA para importar PDF ou Excel.'}
                </p>
              </div>
              <div className="flex gap-2">
                {!editingAtaId && (
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
                <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full text-slate-400">
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
                              onChange={e => updateItem(item.id, 'lote', e.target.value)}
                              placeholder="Lote"
                            />
                          </td>
                          <td className="p-2">
                            <input 
                              type="text" 
                              className="w-full bg-transparent outline-none font-medium text-slate-700 dark:text-slate-200"
                              value={item.description}
                              onChange={e => updateItem(item.id, 'description', e.target.value)}
                              placeholder="Descrição do item"
                            />
                          </td>
                          <td className="p-2">
                            <input 
                              type="text" 
                              className="w-full bg-transparent outline-none text-slate-600 dark:text-slate-400"
                              value={item.brand}
                              onChange={e => updateItem(item.id, 'brand', e.target.value)}
                              placeholder="Marca"
                            />
                          </td>
                          <td className="p-2">
                            <input 
                              type="text" 
                              className="w-full bg-transparent outline-none text-center font-bold text-slate-500 uppercase"
                              value={item.unit}
                              onChange={e => updateItem(item.id, 'unit', e.target.value)}
                            />
                          </td>
                          <td className="p-2">
                            <input 
                              type="number" 
                              className="w-full bg-slate-50 dark:bg-slate-800 rounded p-1 outline-none text-center font-bold"
                              value={item.quantity}
                              onChange={e => updateItem(item.id, 'quantity', Number(e.target.value))}
                            />
                          </td>
                          <td className="p-2">
                            <input 
                              type="number" 
                              className="w-full bg-slate-50 dark:bg-slate-800 rounded p-1 outline-none text-right font-bold"
                              value={item.unitPrice}
                              onChange={e => updateItem(item.id, 'unitPrice', Number(e.target.value))}
                            />
                          </td>
                          <td className="p-2 text-right font-black text-slate-700 dark:text-slate-300">
                            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(item.totalPrice)}
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
                          {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalValue)}
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
                            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(dist.value)}
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
                        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(reservedValue)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

            </div>

            {/* Footer */}
            <div className="p-6 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 flex justify-end gap-3 shrink-0">
              <button 
                onClick={() => { setIsModalOpen(false); resetForm(); }}
                className="px-6 py-3 rounded-xl font-bold text-slate-500 hover:bg-white dark:hover:bg-slate-800 transition-colors"
              >
                Cancelar
              </button>
              <button 
                onClick={handleSaveAta} 
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-xl font-bold shadow-lg flex items-center gap-2"
              >
                <Save size={20} /> {editingAtaId ? 'Atualizar Ata' : 'Salvar Ata'}
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
};

export default Atas;
