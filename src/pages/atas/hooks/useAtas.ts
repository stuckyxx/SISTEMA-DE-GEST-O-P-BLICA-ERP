import { useState, useRef, useMemo } from 'react';
import { AppState, Ata, AtaItem, AtaDistribution } from '../../../types';
import { processUploadFile } from '../../../services/importService';
import { useTenantOptional } from '../../../contexts/TenantContext';
import { useAlert } from '../../../contexts/AlertContext';
import { createAta, updateAta, deleteAta } from '../../../services/api';
import { ataToAtaCreate } from '../../../services/mappers';

export const useAtas = (state: AppState, setState: React.Dispatch<React.SetStateAction<AppState>>) => {
  const { alert, confirm } = useAlert();
  const tenant = useTenantOptional();
  const useApi = tenant?.entidadeId != null;
  const [apiLoading, setApiLoading] = useState(false);
  const [apiError, setApiError] = useState('');

  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAtaId, setEditingAtaId] = useState<string | null>(null);

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

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const isPdf = file.type === 'application/pdf';
    const isExcel = file.type.includes('sheet') || file.name.endsWith('.xlsx') || file.name.endsWith('.xls');

    if (!isPdf && !isExcel) {
      await alert({
        title: 'Formato Inválido',
        message: 'Por favor, envie apenas arquivos PDF ou Excel (.xlsx, .xls).',
      });
      return;
    }


    setIsImporting(true);
    setWarningMsg('');

    try {
      const extractedData = await processUploadFile(
        file, 
        process.env.API_KEY || '', 
        setImportStatus
      );

      // Identificar fornecedor
      let foundSupplierId = '';
      
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
      
      console.warn(`Erro detalhado: ${error.message}`);
    }
    
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleUpdateItem = (id: string, field: keyof AtaItem, value: any) => {
    setItems(items.map(item => {
      if (item.id === id) {
        const updated = { ...item, [field]: value };
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

  const handleAddItem = () => {
    setItems([...items, {
      id: Math.random().toString(36).substr(2, 9),
      lote: '1',
      itemNumber: items.length + 1,
      description: '',
      brand: '',
      unit: 'UN',
      quantity: 1,
      unitPrice: 0,
      totalPrice: 0
    }]);
  };

  const handleAddDistribution = async () => {
    if (!newDistSecretariat || newDistPercent <= 0) return;

    const currentDistributed = distributions.reduce((acc, d) => acc + d.percentage, 0);
    const available = 100 - currentDistributed;

    if (newDistPercent > available) {
      await alert({
        title: 'Percentual Excedido',
        message: `Atenção: Você só tem ${available}% disponível para distribuir.`,
      });
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

  const handleEditAta = (ata: Ata) => {
    setEditingAtaId(ata.id);
    
    setFormData({
      processNumber: ata.processNumber,
      modality: ata.modality,
      object: ata.object,
      supplierId: ata.supplierId,
      year: ata.year
    });

    setItems(ata.items.map(i => ({...i})));
    setDistributions(ata.distributions.map(d => ({...d})));
    
    setIsModalOpen(true);
  };

  const handleSaveAta = async () => {
    if (!formData.processNumber || !formData.supplierId || items.length === 0) {
      await alert({
        title: 'Campos Obrigatórios',
        message: 'Preencha o número do processo, fornecedor e adicione itens.',
      });
      return;
    }

    const updatedDistributions = distributions.map((d) => ({
      ...d,
      value: (totalValue * d.percentage) / 100,
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
        ? (state.atas.find((a) => a.id === editingAtaId)?.createdAt || new Date().toISOString())
        : new Date().toISOString(),
    };

    if (useApi && tenant?.entidadeId != null) {
      setApiLoading(true);
      setApiError('');
      try {
        if (editingAtaId) {
          const updated = await updateAta(parseInt(editingAtaId, 10), {
            numero_processo: ataData.processNumber,
            modalidade: ataData.modality,
            objeto: ataData.object,
            ano: ataData.year,
            fornecedor_id: parseInt(ataData.supplierId, 10),
          });
          setState((prev) => ({
            ...prev,
            atas: prev.atas.map((a) => (a.id === editingAtaId ? updated : a)),
          }));
        } else {
          const created = await createAta(tenant.entidadeId, ataToAtaCreate(ataData, tenant.entidadeId));
          setState((prev) => ({
            ...prev,
            atas: [...(prev.atas || []), created],
          }));
        }
        setIsModalOpen(false);
        resetForm();
      } catch (e) {
        setApiError(e instanceof Error ? e.message : 'Erro ao salvar Ata.');
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

  const handleDeleteAta = async (id: string) => {
    const confirmed = await confirm({
      title: 'Confirmar Exclusão',
      message: 'Deseja realmente excluir esta Ata?',
      confirmText: 'Excluir',
      cancelText: 'Cancelar',
    });
    if (!confirmed) return;

    if (useApi && tenant?.entidadeId != null) {
      setApiLoading(true);
      setApiError('');
      try {
        await deleteAta(parseInt(id, 10));
        setState((prev) => ({
          ...prev,
          atas: prev.atas.filter((a) => a.id !== id),
        }));
      } catch (e) {
        setApiError(e instanceof Error ? e.message : 'Erro ao excluir Ata.');
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
    setEditingAtaId(null);
    setFormData({ year: new Date().getFullYear().toString(), processNumber: '', modality: '', object: '', supplierId: '' });
    setItems([]);
    setDistributions([]);
    setWarningMsg('');
  };

  return {
    searchTerm,
    setSearchTerm,
    isModalOpen,
    setIsModalOpen,
    editingAtaId,
    isImporting,
    importStatus,
    warningMsg,
    fileInputRef,
    formData,
    setFormData,
    items,
    setItems,
    distributions,
    setDistributions,
    newDistSecretariat,
    setNewDistSecretariat,
    newDistPercent,
    setNewDistPercent,
    totalValue,
    filteredAtas,
    handleFileUpload,
    handleUpdateItem,
    removeItem,
    handleAddItem,
    handleAddDistribution,
    removeDistribution,
    reservedPercent,
    reservedValue,
    handleEditAta,
    handleSaveAta,
    handleDeleteAta,
    resetForm,
    apiLoading,
    apiError,
    setApiError,
  };
};