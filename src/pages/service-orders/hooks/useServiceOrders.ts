import { useState, useMemo } from 'react';
import { AppState, ServiceOrder, ServiceOrderItem } from '../../../types';

export const useServiceOrders = (state: AppState, setState: React.Dispatch<React.SetStateAction<AppState>>) => {
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

  const handleCreateOS = () => {
    if (!selectedContractId || !osDescription || osItems.length === 0) {
      alert("Preencha todos os campos obrigatórios.");
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

    setState(prev => ({
      ...prev,
      serviceOrders: [...prev.serviceOrders, newOS]
    }));

    setIsModalOpen(false);
    resetForm();
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
    printOS
  };
};