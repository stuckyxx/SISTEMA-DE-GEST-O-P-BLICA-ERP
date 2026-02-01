import { useMemo, useState, useEffect } from 'react';
import { AppState, Contract, ContractItem } from '../../../types';
import { formatCurrency } from '../../../utils/format';

export const useContracts = (state: AppState, setState: React.Dispatch<React.SetStateAction<AppState>>) => {
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

  return {
    searchTerm, setSearchTerm,
    selectedContract, setSelectedContract,
    isRegistering, setIsRegistering,
    editingId,
    formContract, setFormContract,
    originType, setOriginType,
    formItems, 
    ataBalanceInfo,
    filteredContracts,
    globalTotal,
    getValidityProgress,
    getStatus,
    handleAddFormItem,
    handleRemoveFormItem,
    updateFormItem,
    handleEditContract,
    handleSaveContract,
    handleDeleteContract,
    resetForm
  };
};