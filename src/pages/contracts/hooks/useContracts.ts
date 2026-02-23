import { useMemo, useState, useEffect } from 'react';
import { AppState, Contract, ContractItem } from '../../../types';
import { formatCurrency } from '../../../utils/format';
import { useTenantOptional } from '../../../contexts/TenantContext';
import { useAlert } from '../../../contexts/AlertContext';
import { createContrato, updateContrato, deleteContrato } from '../../../services/api';
import { contractToContratoCreate } from '../../../services/mappers';

export const useContracts = (state: AppState, setState: React.Dispatch<React.SetStateAction<AppState>>) => {
  const { alert, confirm } = useAlert();
  const tenant = useTenantOptional();
  const useApi = tenant?.entidadeId != null;
  const [apiLoading, setApiLoading] = useState(false);
  const [apiError, setApiError] = useState('');
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

  const applyContractToState = (contract: Contract) => {
    setState((prev) => {
      const idx = prev.contracts.findIndex((c) => c.id === contract.id);
      const next = [...prev.contracts];
      if (idx >= 0) next[idx] = contract;
      else next.push(contract);
      return { ...prev, contracts: next };
    });
  };

  const handleSaveContract = async () => {
    if (!formContract.number || !formContract.supplierId || !formContract.biddingModality || !formContract.startDate || !formContract.endDate) {
      await alert({
        title: 'Campos Obrigatórios',
        message: 'Por favor, preencha todos os dados básicos do contrato.',
      });
      return;
    }
    if (originType === 'ata') {
      if (!formContract.ataId || !formContract.secretariat) {
        await alert({
          title: 'Campos Obrigatórios',
          message: 'Para contratos via Ata, selecione a Ata e a Secretaria.',
        });
        return;
      }
      if (ataBalanceInfo && globalTotal > ataBalanceInfo.available) {
        await alert({
          title: 'Valor Excedido',
          message: `O valor do contrato (${formatCurrency(globalTotal)}) excede o saldo disponível para a secretaria (${formatCurrency(ataBalanceInfo.available)}).`,
        });
        return;
      }
    }
    if (formItems.some((item) => !item.description || (item.originalQty || 0) <= 0)) {
      await alert({
        title: 'Itens Inválidos',
        message: 'Verifique se todos os itens possuem descrição e quantidade válida.',
      });
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
      secretariat: originType === 'ata' ? formContract.secretariat : undefined,
    };

    if (useApi && tenant?.entidadeId != null) {
      setApiLoading(true);
      setApiError('');
      try {
        if (editingId) {
          const updated = await updateContrato(parseInt(editingId, 10), {
            numero_contrato: formContract.number,
            data_fim: formContract.endDate,
            modalidade: formContract.biddingModality || null,
          });
          applyContractToState(updated);
        } else {
          const newContract: Contract = {
            id: '',
            ...contractData,
            items: formItems.map((item) => ({
              id: item.id!,
              description: item.description || '',
              unit: item.unit || 'UNID',
              originalQty: item.originalQty || 0,
              unitPrice: item.unitPrice || 0,
              currentBalance: item.originalQty || 0,
            })),
          };
          const created = await createContrato(tenant.entidadeId, contractToContratoCreate(newContract, tenant.entidadeId, originType));
          applyContractToState(created);
        }
        setIsRegistering(false);
        resetForm();
      } catch (e) {
        setApiError(e instanceof Error ? e.message : 'Erro ao salvar contrato.');
      } finally {
        setApiLoading(false);
      }
      return;
    }

    // API é obrigatória
    await alert({
      title: 'API não configurada',
      message: 'Sistema configurado apenas para API. Faça login e tente novamente.',
    });
  };

  const resetForm = () => {
    setEditingId(null);
    setOriginType('direct');
    setFormContract({ number: '', supplierId: '', biddingModality: '', startDate: '', endDate: '', ataId: '', secretariat: '' });
    setFormItems([{ id: '1', description: '', unit: 'UNID', originalQty: 0, unitPrice: 0 }]);
  };

  const handleDeleteContract = async (e: React.MouseEvent | null, id: string) => {
    if (e) e.stopPropagation();
    const hasInvoices = state.invoices.some((i) => i.contractId === id);
    if (hasInvoices) {
      await alert({
        title: 'Não é possível excluir',
        message: 'Não é possível excluir: existem notas fiscais ou movimentações vinculadas a este contrato.',
      });
      return;
    }
    const confirmed = await confirm({
      title: 'Confirmar Exclusão',
      message: 'Atenção: Deseja realmente excluir este contrato permanentemente?',
      confirmText: 'Excluir',
      cancelText: 'Cancelar',
    });
    if (!confirmed) return;

    if (useApi && tenant?.entidadeId != null) {
      setApiLoading(true);
      setApiError('');
      try {
        await deleteContrato(parseInt(id, 10));
        setState((prev) => ({ ...prev, contracts: prev.contracts.filter((c) => c.id !== id) }));
        if (selectedContract?.id === id) setSelectedContract(null);
        if (isRegistering) {
          setIsRegistering(false);
          resetForm();
        }
      } catch (err) {
        setApiError(err instanceof Error ? err.message : 'Erro ao excluir contrato.');
      } finally {
        setApiLoading(false);
      }
      return;
    }

    // API é obrigatória
    await alert({
      title: 'API não configurada',
      message: 'Sistema configurado apenas para API. Faça login e tente novamente.',
    });
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
    searchTerm,
    setSearchTerm,
    selectedContract,
    setSelectedContract,
    isRegistering,
    setIsRegistering,
    editingId,
    formContract,
    setFormContract,
    originType,
    setOriginType,
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
    resetForm,
    apiLoading,
    apiError,
    setApiError,
  };
};