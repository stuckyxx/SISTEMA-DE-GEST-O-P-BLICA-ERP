import { useState, useMemo } from 'react';
import { AppState, ServiceOrder, ServiceOrderItem } from '../../../types';
import { useAlert } from '../../../contexts/AlertContext';
import { useTenantOptional } from '../../../contexts/TenantContext';
import { createOrdemServico } from '../../../services/api';
import { serviceOrderToOrdemServicoCreate } from '../../../services/mappers';

export const useServiceOrders = (state: AppState, setState: React.Dispatch<React.SetStateAction<AppState>>) => {
  const { alert, success, error: showError } = useAlert();
  const tenant = useTenantOptional();
  const useApi = tenant?.entidadeId != null;
  const [isLoading, setIsLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [viewOS, setViewOS] = useState<ServiceOrder | null>(null);
  
  // Form State
  const [selectedContractId, setSelectedContractId] = useState('');
  const [osDescription, setOsDescription] = useState('');
  const [osDate, setOsDate] = useState(new Date().toISOString().split('T')[0]);
  const [osItems, setOsItems] = useState<ServiceOrderItem[]>([]);

  const selectedContract = useMemo(() => 
    state.contracts.find(c => c.id === selectedContractId), 
    [selectedContractId, state.contracts]
  );

  const handleAddItem = (contractItemId: string) => {
    if (osItems.find(i => i.contractItemId === contractItemId)) return;
    
    const contractItem = selectedContract?.items.find(i => i.id === contractItemId);
    if (!contractItem) return;

    setOsItems([...osItems, { 
      contractItemId, 
      quantity: 1, 
      unitPrice: contractItem.unitPrice, 
      total: contractItem.unitPrice 
    }]);
  };

  const handleUpdateQty = (contractItemId: string, qty: number) => {
    setOsItems(prev => prev.map(item => {
      if (item.contractItemId === contractItemId) {
        return {
          ...item,
          quantity: qty,
          total: qty * item.unitPrice
        };
      }
      return item;
    }));
  };

  const handleCreateOS = async () => {
    if (!selectedContractId || !osDescription || osItems.length === 0) {
      await alert({
        title: 'Campos Obrigatórios',
        message: 'Preencha todos os campos obrigatórios.',
      });
      return;
    }

    const nextNumber = (state.serviceOrders.length + 1).toString().padStart(3, '0') + '/' + new Date().getFullYear();

    const newOS: ServiceOrder = {
      id: Math.random().toString(36).substr(2, 9),
      number: nextNumber,
      contractId: selectedContractId,
      issueDate: osDate,
      description: osDescription,
      status: 'open',
      items: osItems
    };

    if (useApi && tenant?.entidadeId != null) {
      setIsLoading(true);
      try {
        const created = await createOrdemServico(
          tenant.entidadeId,
          serviceOrderToOrdemServicoCreate(newOS, tenant.entidadeId)
        );
        setState(prev => ({
          ...prev,
          serviceOrders: [...prev.serviceOrders, created]
        }));
        setIsModalOpen(false);
        resetForm();
        await success({
          title: 'Sucesso!',
          message: 'Ordem de Serviço criada com sucesso.',
        });
      } catch (e: any) {
        let errorMessage = 'Erro ao criar ordem de serviço.';
        if (e?.response?.data) {
          // Se a API retornou detalhes do erro
          const errorData = e.response.data;
          if (typeof errorData === 'string') {
            errorMessage = errorData;
          } else if (errorData.detail) {
            errorMessage = Array.isArray(errorData.detail) 
              ? errorData.detail.map((d: any) => d.msg || JSON.stringify(d)).join(', ')
              : errorData.detail;
          } else if (errorData.message) {
            errorMessage = errorData.message;
          }
          if (import.meta.env.DEV) {
            console.error('[handleCreateOS] Erro detalhado da API:', errorData);
          }
        } else if (e instanceof Error) {
          errorMessage = e.message;
        }
        await showError({
          title: 'Erro ao Criar O.S.',
          message: errorMessage,
        });
      } finally {
        setIsLoading(false);
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
    setSelectedContractId('');
    setOsDescription('');
    setOsItems([]);
    setOsDate(new Date().toISOString().split('T')[0]);
  };

  const getTotalValue = (os: ServiceOrder) => {
    return os.items.reduce((acc, i) => acc + i.total, 0);
  };

  const printOS = () => {
    window.print();
  };

  return {
    isModalOpen, setIsModalOpen,
    viewOS, setViewOS,
    selectedContractId, setSelectedContractId,
    osDescription, setOsDescription,
    osDate, setOsDate,
    osItems, setOsItems,
    selectedContract,
    handleAddItem,
    handleUpdateQty,
    handleCreateOS,
    resetForm,
    getTotalValue,
    printOS,
    isLoading
  };
};