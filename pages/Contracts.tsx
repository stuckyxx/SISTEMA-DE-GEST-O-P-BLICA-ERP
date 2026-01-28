
import React, { useState, useMemo, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  ChevronRight, 
  Calendar, 
  Package, 
  X,
  Save,
  Trash2,
  Building2,
  Briefcase,
  Layers,
  Calculator,
  Info,
  ChevronDown,
  Hash,
  Gavel,
  Pencil,
  FileBadge,
  PieChart
} from 'lucide-react';
import { AppState, Contract, ContractItem } from '../types';

// Lista padronizada de unidades baseada na imagem do usuário
const UNIT_OPTIONS = [
  { sigla: 'AMPOLA', descricao: 'AMPOLA' },
  { sigla: 'BALDE', descricao: 'BALDE' },
  { sigla: 'BANDEJ', descricao: 'BANDEJA' },
  { sigla: 'BARRA', descricao: 'BARRA' },
  { sigla: 'BISNAG', descricao: 'BISNAGA' },
  { sigla: 'BLOCO', descricao: 'BLOCO' },
  { sigla: 'BOBINA', descricao: 'BOBINA' },
  { sigla: 'BOL', descricao: 'BOLSA' },
  { sigla: 'BOMB', descricao: 'BOMBONA' },
  { sigla: 'CX', descricao: 'CAIXA' },
  { sigla: 'CAPS', descricao: 'CAPSULA' },
  { sigla: 'CART', descricao: 'CARTELA' },
  { sigla: 'CENTO', descricao: 'CENTO' },
  { sigla: 'CONJ', descricao: 'CONJUNTO' },
  { sigla: 'DUZIA', descricao: 'DUZIA' },
  { sigla: 'FRASCO', descricao: 'FRASCO' },
  { sigla: 'GALAO', descricao: 'GALAO' },
  { sigla: 'GRAMA', descricao: 'GRAMA' },
  { sigla: 'KIT', descricao: 'KIT' },
  { sigla: 'LATA', descricao: 'LATA' },
  { sigla: 'LITRO', descricao: 'LITRO' },
  { sigla: 'METRO', descricao: 'METRO' },
  { sigla: 'M2', descricao: 'METRO QUADRADO' },
  { sigla: 'M3', descricao: 'METRO CUBICO' },
  { sigla: 'MILHEI', descricao: 'MILHEIRO' },
  { sigla: 'PACOTE', descricao: 'PACOTE' },
  { sigla: 'PAR', descricao: 'PAR' },
  { sigla: 'PEÇA', descricao: 'PEÇA' },
  { sigla: 'RESMA', descricao: 'RESMA' },
  { sigla: 'ROLO', descricao: 'ROLO' },
  { sigla: 'SACO', descricao: 'SACO' },
  { sigla: 'TUBETE', descricao: 'TUBETE' },
  { sigla: 'TUBO', descricao: 'TUBO' },
  { sigla: 'UNID', descricao: 'UNIDADE' },
];

const BIDDING_MODALITIES = [
  "Pregão Eletrônico",
  "Pregão Presencial",
  "Concorrência",
  "Tomada de Preços",
  "Convite",
  "Concurso",
  "Diálogo Competitivo",
  "Dispensa de Licitação",
  "Inexigibilidade",
  "Credenciamento",
  "Adesão a Ata (Carona)"
];

interface ContractsProps {
  state: AppState;
  setState: React.Dispatch<React.SetStateAction<AppState>>;
}

const Contracts: React.FC<ContractsProps> = ({ state, setState }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedContract, setSelectedContract] = useState<Contract | null>(null);
  const [isRegistering, setIsRegistering] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form State
  const [formContract, setFormContract] = useState({
    number: '',
    supplierId: '',
    biddingModality: '',
    startDate: '',
    endDate: '',
    ataId: '', // Vínculo com Ata
    secretariat: '' // Vínculo com Secretaria da Ata
  });
  
  const [originType, setOriginType] = useState<'direct' | 'ata'>('direct');

  const [formItems, setFormItems] = useState<Partial<ContractItem>[]>([
    { id: '1', description: '', unit: 'UNID', originalQty: 0, unitPrice: 0 }
  ]);

  // Cálculos de Saldo da Ata
  const ataBalanceInfo = useMemo(() => {
    if (originType !== 'ata' || !formContract.ataId || !formContract.secretariat) return null;

    const ata = state.atas.find(a => a.id === formContract.ataId);
    if (!ata) return null;

    const distribution = ata.distributions.find(d => d.secretariatName === formContract.secretariat);
    if (!distribution) return null;

    // Calcular quanto esta secretaria já consumiu desta ata em OUTROS contratos
    const usedValue = state.contracts
      .filter(c => c.ataId === formContract.ataId && c.secretariat === formContract.secretariat && c.id !== editingId)
      .reduce((acc, c) => acc + c.globalValue, 0);

    const available = distribution.value - usedValue;

    return {
      totalDistributed: distribution.value,
      used: usedValue,
      available: available
    };
  }, [formContract.ataId, formContract.secretariat, state.contracts, state.atas, editingId, originType]);


  const filteredContracts = state.contracts.filter(c => 
    c.number.includes(searchTerm) || 
    state.suppliers.find(s => s.id === c.supplierId)?.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const globalTotal = useMemo(() => {
    return formItems.reduce((acc, item) => acc + ((item.originalQty || 0) * (item.unitPrice || 0)), 0);
  }, [formItems]);

  const getValidityProgress = (startDate: string, endDate: string) => {
    const start = new Date(startDate).getTime();
    const end = new Date(endDate).getTime();
    const today = new Date().getTime();
    
    if (end < today) return 100; // Vencido
    if (start > today) return 0; // Não iniciou

    const totalDuration = end - start;
    const elapsed = today - start;
    
    return Math.min(100, Math.max(0, Math.round((elapsed / totalDuration) * 100)));
  };

  const getStatus = (endDate: string) => {
    const end = new Date(endDate).getTime();
    const today = new Date().getTime();
    return end >= today ? 'Ativo' : 'Vencido';
  };

  const handleAddFormItem = () => {
    setFormItems([...formItems, { 
      id: Math.random().toString(36).substr(2, 9), 
      description: '', 
      unit: 'UNID', 
      originalQty: 0, 
      unitPrice: 0 
    }]);
  };

  const handleRemoveFormItem = (id: string) => {
    if (formItems.length > 1) {
      setFormItems(formItems.filter(item => item.id !== id));
    }
  };

  const updateFormItem = (id: string, field: keyof ContractItem, value: any) => {
    setFormItems(formItems.map(item => item.id === id ? { ...item, [field]: value } : item));
  };

  const handleEditContract = (e: React.MouseEvent, contract: Contract) => {
    e.stopPropagation();
    setEditingId(contract.id);
    
    // Determinar se veio de Ata
    if (contract.ataId) {
      setOriginType('ata');
    } else {
      setOriginType('direct');
    }

    setFormContract({
      number: contract.number,
      supplierId: contract.supplierId,
      biddingModality: contract.biddingModality,
      startDate: contract.startDate,
      endDate: contract.endDate,
      ataId: contract.ataId || '',
      secretariat: contract.secretariat || ''
    });
    setFormItems(contract.items.map(item => ({...item})));
    setIsRegistering(true);
  };

  const handleSaveContract = () => {
    if (!formContract.number || !formContract.supplierId || !formContract.biddingModality || !formContract.startDate || !formContract.endDate) {
      alert("Por favor, preencha todos os dados básicos do contrato.");
      return;
    }

    // Validação de Saldo da Ata
    if (originType === 'ata') {
      if (!formContract.ataId || !formContract.secretariat) {
        alert("Para contratos via Ata, selecione a Ata e a Secretaria.");
        return;
      }
      if (ataBalanceInfo && globalTotal > ataBalanceInfo.available) {
        alert(`O valor do contrato (${formatCurrency(globalTotal)}) excede o saldo disponível para a secretaria (${formatCurrency(ataBalanceInfo.available)}).`);
        return;
      }
    }

    if (formItems.some(item => !item.description || (item.originalQty || 0) <= 0)) {
      alert("Verifique se todos os itens possuem descrição e quantidade válida.");
      return;
    }

    const contractData = {
      number: formContract.number,
      supplierId: formContract.supplierId,
      biddingModality: formContract.biddingModality,
      startDate: formContract.startDate,
      endDate: formContract.endDate,
      globalValue: globalTotal,
      ataId: originType === 'ata' ? formContract.ataId : undefined,
      secretariat: originType === 'ata' ? formContract.secretariat : undefined
    };

    if (editingId) {
      setState(prev => ({
        ...prev,
        contracts: prev.contracts.map(c => {
          if (c.id === editingId) {
            const updatedItems: ContractItem[] = formItems.map(fItem => {
              const existingItem = c.items.find(old => old.id === fItem.id);
              if (existingItem) {
                const qtyDifference = (fItem.originalQty || 0) - existingItem.originalQty;
                return {
                  ...existingItem,
                  description: fItem.description!,
                  unit: fItem.unit!,
                  unitPrice: fItem.unitPrice!,
                  originalQty: fItem.originalQty!,
                  currentBalance: existingItem.currentBalance + qtyDifference
                };
              } else {
                return {
                  id: fItem.id || Math.random().toString(36).substr(2, 9),
                  description: fItem.description!,
                  unit: fItem.unit!,
                  originalQty: fItem.originalQty!,
                  unitPrice: fItem.unitPrice!,
                  currentBalance: fItem.originalQty!
                };
              }
            });

            return { ...c, ...contractData, items: updatedItems };
          }
          return c;
        })
      }));
    } else {
      const newContract: Contract = {
        id: Math.random().toString(36).substr(2, 9),
        ...contractData,
        items: formItems.map(item => ({
          id: item.id!,
          description: item.description || '',
          unit: item.unit || 'UNID',
          originalQty: item.originalQty || 0,
          unitPrice: item.unitPrice || 0,
          currentBalance: item.originalQty || 0
        }))
      };

      setState(prev => ({
        ...prev,
        contracts: [...prev.contracts, newContract]
      }));
    }

    setIsRegistering(false);
    resetForm();
  };

  const resetForm = () => {
    setEditingId(null);
    setOriginType('direct');
    setFormContract({ number: '', supplierId: '', biddingModality: '', startDate: '', endDate: '', ataId: '', secretariat: '' });
    setFormItems([{ id: '1', description: '', unit: 'UNID', originalQty: 0, unitPrice: 0 }]);
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
  };

  const handleDeleteContract = (e: React.MouseEvent | null, id: string) => {
    if(e) e.stopPropagation();
    
    const hasInvoices = state.invoices.some(i => i.contractId === id);
    if (hasInvoices) {
      alert("Não é possível excluir: existem notas fiscais ou movimentações vinculadas a este contrato.");
      return;
    }
    if (window.confirm("Atenção: Deseja realmente excluir este contrato permanentemente?")) {
      setState(prev => ({
        ...prev,
        contracts: prev.contracts.filter(c => c.id !== id)
      }));
      if (selectedContract?.id === id) setSelectedContract(null);
      if (isRegistering) {
        setIsRegistering(false);
        resetForm();
      }
    }
  };

  // Quando muda a Ata, limpar a secretaria
  useEffect(() => {
    if (originType === 'ata' && formContract.ataId) {
       // Se a ata mudar e a secretaria selecionada não fizer parte da nova ata, limpa.
       const ata = state.atas.find(a => a.id === formContract.ataId);
       if (ata && formContract.secretariat) {
         const hasSec = ata.distributions.some(d => d.secretariatName === formContract.secretariat);
         if (!hasSec) setFormContract(prev => ({ ...prev, secretariat: '' }));
       }
       
       // Auto-preencher fornecedor da Ata
       if (ata && ata.supplierId) {
         setFormContract(prev => ({ ...prev, supplierId: ata.supplierId }));
       }
    }
  }, [formContract.ataId, originType, state.atas]);

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-white tracking-tight">Contratos</h2>
          <p className="text-slate-500 dark:text-slate-400 font-medium">Gestão e fiscalização de saldos contratuais.</p>
        </div>
        <button 
          onClick={() => { resetForm(); setIsRegistering(true); }}
          className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-2xl transition-all font-bold shadow-lg shadow-blue-100 dark:shadow-blue-900/30 active:scale-95"
        >
          <Plus size={20} />
          Novo Contrato
        </button>
      </div>

      <div className="relative group">
        <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
          <Search className="text-slate-400 group-focus-within:text-blue-500 transition-colors" size={20} />
        </div>
        <input 
          type="text" 
          placeholder="Pesquisar por número ou empresa..." 
          className="w-full bg-white dark:bg-slate-900 pl-12 pr-4 py-4 rounded-2xl border border-slate-200 dark:border-slate-800 outline-none focus:ring-4 focus:ring-blue-100 dark:focus:ring-blue-900/30 focus:border-blue-400 transition-all text-slate-700 dark:text-slate-200 font-medium shadow-sm"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 gap-4">
        {filteredContracts.map(contract => {
          const supplier = state.suppliers.find(s => s.id === contract.supplierId);
          const progress = getValidityProgress(contract.startDate, contract.endDate);
          const status = getStatus(contract.endDate);
          const linkedAta = state.atas.find(a => a.id === contract.ataId);
          
          return (
            <div 
              key={contract.id} 
              className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 hover:border-blue-300 dark:hover:border-blue-700 transition-all cursor-pointer overflow-hidden group"
              onClick={() => setSelectedContract(selectedContract?.id === contract.id ? null : contract)}
            >
              <div className="p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
                
                {/* Coluna 1: Info Principal (5 colunas) */}
                <div className="lg:col-span-5 flex items-start gap-4">
                  <div className="w-12 h-12 bg-slate-50 dark:bg-slate-800 text-slate-400 dark:text-slate-300 rounded-xl flex items-center justify-center shrink-0 group-hover:bg-blue-50 dark:group-hover:bg-blue-900/30 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-all">
                    <Briefcase size={24} />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-800 dark:text-white text-lg">Contrato {contract.number}</h3>
                    <div className="flex flex-col gap-1 mt-1">
                      <p className="text-sm text-slate-500 dark:text-slate-400 flex items-center gap-1.5 font-medium">
                        <Building2 size={14} className="text-slate-400" />
                        {supplier?.name || 'Fornecedor não encontrado'}
                      </p>
                      {linkedAta ? (
                        <p className="text-xs text-indigo-600 dark:text-indigo-400 flex items-center gap-1.5 font-bold">
                          <FileBadge size={14} />
                          Vinculado à Ata: {linkedAta.processNumber} ({contract.secretariat})
                        </p>
                      ) : (
                        <p className="text-sm text-slate-500 dark:text-slate-400 flex items-center gap-1.5 font-medium">
                          <Gavel size={14} className="text-slate-400" />
                          {contract.biddingModality}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Coluna 2: Status e Vigência (4 colunas) */}
                <div className="lg:col-span-4 border-l border-r border-slate-100 dark:border-slate-800 px-6 hidden lg:block">
                   <div className="flex justify-between items-center mb-2">
                     <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Status / Vigência</span>
                     <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded ${status === 'Ativo' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'}`}>
                       {status}
                     </span>
                   </div>
                   <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-4 relative overflow-hidden">
                      <div 
                        className={`h-full rounded-full transition-all duration-1000 ${status === 'Ativo' ? 'bg-emerald-500' : 'bg-red-500'}`}
                        style={{ width: `${progress}%` }}
                      ></div>
                      <span className="absolute inset-0 flex items-center justify-center text-[9px] font-bold text-slate-600 dark:text-slate-300">
                        {progress}% Decorrido
                      </span>
                   </div>
                   <p className="text-[10px] text-center mt-1 text-slate-400">
                     {new Date(contract.startDate).toLocaleDateString()} — {new Date(contract.endDate).toLocaleDateString()}
                   </p>
                </div>

                {/* Coluna 3: Ações e Valor (3 colunas) */}
                <div className="lg:col-span-3 flex items-center justify-between lg:justify-end gap-6">
                  <div className="text-right">
                    <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Valor Global</p>
                    <p className="font-black text-slate-800 dark:text-slate-200 text-xl tracking-tight">
                      {formatCurrency(contract.globalValue)}
                    </p>
                  </div>
                  <div className="flex gap-1">
                    <button 
                      onClick={(e) => handleEditContract(e, contract)}
                      className="p-2 text-slate-300 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-xl transition-all"
                      title="Editar Contrato"
                    >
                      <Pencil size={18} />
                    </button>
                    <button 
                      onClick={(e) => handleDeleteContract(e, contract.id)}
                      className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-all"
                      title="Excluir Contrato"
                    >
                      <Trash2 size={18} />
                    </button>
                    <div className={`p-2 rounded-xl transition-all ${selectedContract?.id === contract.id ? 'bg-blue-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500'}`}>
                      <ChevronRight size={18} className={`transition-transform duration-300 ${selectedContract?.id === contract.id ? 'rotate-90' : ''}`} />
                    </div>
                  </div>
                </div>
              </div>

              {selectedContract?.id === contract.id && (
                <div className="bg-slate-50/50 dark:bg-slate-950/50 p-6 border-t border-slate-200 dark:border-slate-800 animate-in slide-in-from-top-4 duration-300">
                  <div className="grid grid-cols-1 gap-3">
                    {contract.items.map(item => (
                      <div key={item.id} className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-700 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 bg-blue-50 dark:bg-blue-900/20 text-blue-500 rounded-lg flex items-center justify-center">
                            <Layers size={18} />
                          </div>
                          <div>
                            <p className="font-bold text-slate-800 dark:text-white">{item.description}</p>
                            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">UN: {item.unit}</p>
                          </div>
                        </div>
                        <div className="grid grid-cols-3 gap-8 md:text-right">
                          <div>
                            <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest">Contratado</p>
                            <p className="font-bold text-slate-700 dark:text-slate-300">{item.originalQty}</p>
                          </div>
                          <div>
                            <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest">Saldo</p>
                            <p className={`font-black ${item.currentBalance < (item.originalQty * 0.1) ? 'text-red-500' : 'text-blue-600 dark:text-blue-400'}`}>{item.currentBalance}</p>
                          </div>
                          <div>
                            <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest">Unitário</p>
                            <p className="font-bold text-slate-700 dark:text-slate-300">{formatCurrency(item.unitPrice)}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {isRegistering && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 dark:bg-black/60 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] w-full max-w-7xl max-h-[92vh] overflow-hidden flex flex-col shadow-2xl border border-white/20 dark:border-slate-700">
            {/* Header do Modal */}
            <div className="px-10 py-8 flex items-center justify-between bg-white dark:bg-slate-900 shrink-0">
              <div>
                <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 mb-1">
                  <Info size={18} />
                  <span className="text-xs font-black uppercase tracking-widest">{editingId ? 'Edição de Registro' : 'Novo Registro Administrativo'}</span>
                </div>
                <h3 className="text-3xl font-black text-slate-800 dark:text-white tracking-tight">{editingId ? 'Editar Contrato' : 'Cadastro de Contrato'}</h3>
              </div>
              <button 
                onClick={() => { setIsRegistering(false); resetForm(); }} 
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
                      onClick={() => { setOriginType('direct'); setFormContract(p => ({...p, ataId: '', secretariat: ''})); }}
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
                          <div className="text-right">
                            <p className="text-2xl font-black text-indigo-600 dark:text-indigo-400">
                              {formatCurrency(ataBalanceInfo.available)}
                            </p>
                          </div>
                        </div>
                      )}
                    </>
                  )}

                  <div className="md:col-span-3 space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Número do Contrato</label>
                    <input 
                      type="text" 
                      placeholder="Ex: 045/2024" 
                      className="w-full bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 dark:focus:ring-blue-900/30 outline-none transition-all font-bold text-slate-800 dark:text-white shadow-sm"
                      value={formContract.number}
                      onChange={(e) => setFormContract({...formContract, number: e.target.value})}
                    />
                  </div>
                  
                  <div className="md:col-span-5 space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Fornecedor Credenciado</label>
                    <div className="relative">
                      <select 
                        className={`w-full bg-white dark:bg-slate-900 p-4 pr-12 rounded-2xl border border-slate-200 dark:border-slate-700 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 dark:focus:ring-blue-900/30 outline-none transition-all font-bold text-slate-800 dark:text-white appearance-none shadow-sm cursor-pointer ${originType === 'ata' ? 'opacity-70 pointer-events-none' : ''}`}
                        value={formContract.supplierId}
                        onChange={(e) => setFormContract({...formContract, supplierId: e.target.value})}
                        disabled={originType === 'ata'}
                      >
                        <option value="">Selecione o Fornecedor...</option>
                        {state.suppliers.map(s => <option key={s.id} value={s.id}>{s.name} ({s.cnpj})</option>)}
                      </select>
                      <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                        <ChevronDown size={20} />
                      </div>
                    </div>
                  </div>

                  <div className="md:col-span-4 space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Modalidade de Licitação</label>
                    <div className="relative">
                      <select 
                        className="w-full bg-white dark:bg-slate-900 p-4 pr-12 rounded-2xl border border-slate-200 dark:border-slate-700 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 dark:focus:ring-blue-900/30 outline-none transition-all font-bold text-slate-800 dark:text-white appearance-none shadow-sm cursor-pointer"
                        value={formContract.biddingModality}
                        onChange={(e) => setFormContract({...formContract, biddingModality: e.target.value})}
                      >
                        <option value="">Selecione...</option>
                        {BIDDING_MODALITIES.map(modality => (
                          <option key={modality} value={modality}>{modality}</option>
                        ))}
                      </select>
                      <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                        <ChevronDown size={20} />
                      </div>
                    </div>
                  </div>

                  <div className="md:col-span-2 space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 text-emerald-600 dark:text-emerald-400">Data Inicial</label>
                    <input 
                      type="date" 
                      className="w-full bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 dark:focus:ring-blue-900/30 outline-none transition-all font-bold text-slate-800 dark:text-white shadow-sm"
                      value={formContract.startDate}
                      onChange={(e) => setFormContract({...formContract, startDate: e.target.value})}
                    />
                  </div>
                  <div className="md:col-span-2 space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 text-red-500 dark:text-red-400">Data Final</label>
                    <input 
                      type="date" 
                      className="w-full bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 dark:focus:ring-blue-900/30 outline-none transition-all font-bold text-slate-800 dark:text-white shadow-sm"
                      value={formContract.endDate}
                      onChange={(e) => setFormContract({...formContract, endDate: e.target.value})}
                    />
                  </div>
                </div>
              </div>

              {/* Seção 2: Itens Licitados */}
              <div className="space-y-6">
                <div className="flex justify-between items-center pb-2">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg flex items-center justify-center">
                      <Layers size={18} />
                    </div>
                    <h4 className="font-black text-slate-700 dark:text-slate-200 text-xs uppercase tracking-[0.2em]">Itens e Quantitativos do Contrato</h4>
                  </div>
                  <button 
                    onClick={handleAddFormItem} 
                    className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-2xl font-black text-xs hover:bg-blue-700 transition-all shadow-lg shadow-blue-100 dark:shadow-blue-900/30"
                  >
                    <Plus size={16} /> Adicionar Novo Item
                  </button>
                </div>

                <div className="grid grid-cols-1 gap-6">
                  {formItems.map((item, idx) => {
                    const subtotal = (item.originalQty || 0) * (item.unitPrice || 0);
                    return (
                      <div key={item.id} className="relative group p-8 rounded-[2rem] border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:border-blue-500 dark:hover:border-blue-500 transition-all shadow-sm hover:shadow-md">
                        {/* Indicador do Item */}
                        <div className="absolute -left-3 top-1/2 -translate-y-1/2 w-8 h-8 bg-slate-800 dark:bg-slate-700 text-white rounded-full flex items-center justify-center text-[10px] font-black shadow-lg">
                          {idx + 1}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-end">
                          {/* Descrição - Aumentado col-span para evitar corte */}
                          <div className="md:col-span-4 space-y-2">
                            <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Descrição Completa</label>
                            <input 
                              type="text" placeholder="Descreva o material ou serviço detalhadamente..." 
                              className="w-full bg-white dark:bg-slate-950 p-4 rounded-xl border border-slate-100 dark:border-slate-800 focus:border-blue-500 outline-none font-bold text-slate-800 dark:text-white transition-colors focus:bg-slate-50/30"
                              value={item.description}
                              onChange={(e) => updateFormItem(item.id!, 'description', e.target.value)}
                            />
                          </div>
                          
                          {/* Unidade */}
                          <div className="md:col-span-2 space-y-2">
                            <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1 block">Unidade</label>
                            <div className="relative">
                              <select 
                                className="w-full bg-white dark:bg-slate-950 p-4 pr-10 rounded-xl border border-slate-100 dark:border-slate-800 focus:border-blue-500 text-left font-black text-blue-600 dark:text-blue-400 outline-none appearance-none cursor-pointer"
                                value={item.unit}
                                onChange={(e) => updateFormItem(item.id!, 'unit', e.target.value)}
                              >
                                {UNIT_OPTIONS.map(opt => (
                                  <option key={opt.sigla} value={opt.sigla}>
                                    {opt.sigla} — {opt.descricao}
                                  </option>
                                ))}
                              </select>
                              <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-blue-400">
                                <ChevronDown size={18} />
                              </div>
                            </div>
                          </div>

                          {/* Quantidade */}
                          <div className="md:col-span-2 space-y-2">
                            <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1 block">Qtd. Total</label>
                            <div className="relative">
                              <input 
                                type="number" 
                                className="w-full bg-white dark:bg-slate-950 p-4 pr-10 rounded-xl border border-slate-100 dark:border-slate-800 focus:border-blue-500 font-black text-slate-800 dark:text-white outline-none"
                                value={item.originalQty || ''}
                                onChange={(e) => updateFormItem(item.id!, 'originalQty', parseFloat(e.target.value) || 0)}
                              />
                              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                                <Package size={18} className="text-slate-300" />
                              </div>
                            </div>
                          </div>

                          {/* Valor Unitário */}
                          <div className="md:col-span-2 space-y-2">
                            <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1 block">R$ Unitário</label>
                            <div className="relative">
                              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-xs">R$</span>
                              <input 
                                type="number" 
                                className="w-full bg-white dark:bg-slate-950 pl-8 p-4 rounded-xl border border-slate-100 dark:border-slate-800 focus:border-blue-500 font-black text-emerald-600 dark:text-emerald-400 outline-none"
                                value={item.unitPrice || ''}
                                onChange={(e) => updateFormItem(item.id!, 'unitPrice', parseFloat(e.target.value) || 0)}
                              />
                            </div>
                          </div>

                          {/* Subtotal */}
                          <div className="md:col-span-2 space-y-2">
                            <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1 block">Subtotal Item</label>
                            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 text-right">
                              <span className="font-black text-slate-800 dark:text-white text-sm">
                                {formatCurrency(subtotal)}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Botão Remover flutuante para ganhar espaço */}
                        {formItems.length > 1 && (
                          <button 
                            onClick={() => handleRemoveFormItem(item.id!)} 
                            className="absolute -top-3 -right-3 w-10 h-10 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 shadow-lg text-slate-300 hover:text-red-500 hover:scale-110 rounded-full flex items-center justify-center transition-all hover:border-red-200 z-10"
                            title="Remover Item"
                          >
                            <Trash2 size={18} />
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Footer do Modal - Totalizador Fixo */}
            <div className="px-10 py-8 border-t border-slate-100 dark:border-slate-800 flex flex-col md:flex-row items-center justify-between gap-8 bg-slate-50 dark:bg-slate-900 shrink-0">
              <div className="flex items-center gap-5">
                <div className="w-16 h-16 bg-white dark:bg-slate-800 rounded-3xl flex items-center justify-center shadow-sm border border-slate-200 dark:border-slate-700">
                  <Calculator size={32} className="text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Valor Global Previsto</p>
                  <div className="flex items-center gap-3">
                    <p className={`text-4xl font-black tracking-tighter ${ataBalanceInfo && globalTotal > ataBalanceInfo.available ? 'text-red-500' : 'text-slate-800 dark:text-white'}`}>
                      {formatCurrency(globalTotal)}
                    </p>
                    {ataBalanceInfo && globalTotal > ataBalanceInfo.available && (
                      <span className="bg-red-100 text-red-600 text-xs font-bold px-2 py-1 rounded">Saldo Excedido</span>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-4 w-full md:w-auto">
                 {/* BOTÃO EXCLUIR NO MODAL (NOVO) */}
                {editingId && (
                  <button 
                    onClick={() => handleDeleteContract(null, editingId)}
                    className="p-5 rounded-2xl font-bold text-red-500 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/40 border border-red-100 dark:border-red-900/30 transition-all active:scale-95 flex items-center justify-center"
                    title="Excluir Contrato"
                  >
                    <Trash2 size={22} />
                  </button>
                )}

                <button 
                  onClick={() => { setIsRegistering(false); resetForm(); }}
                  className="flex-1 md:flex-none px-12 py-5 rounded-2xl font-bold text-slate-500 hover:bg-white dark:hover:bg-slate-800 border border-transparent hover:border-slate-200 dark:hover:border-slate-700 transition-all active:scale-95"
                >
                  Cancelar
                </button>
                <button 
                  onClick={handleSaveContract}
                  disabled={ataBalanceInfo ? globalTotal > ataBalanceInfo.available : false}
                  className="flex-1 md:flex-none bg-blue-600 hover:bg-blue-700 disabled:bg-slate-400 text-white px-16 py-5 rounded-2xl font-black shadow-2xl shadow-blue-200 dark:shadow-blue-900/40 transition-all transform active:scale-95 flex items-center justify-center gap-3"
                >
                  <Save size={22} />
                  {editingId ? 'Atualizar Contrato' : 'Salvar Contrato Administrativo'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Contracts;
