import { useState, useMemo } from 'react';
import { AppState, Invoice, InvoiceItem } from '../../../types';
import { useTenantOptional } from '../../../contexts/TenantContext';
import { useAlert } from '../../../contexts/AlertContext';
import { createNotaFiscal, updateNotaFiscal, deleteNotaFiscal } from '../../../services/api';
import { invoiceToNotaFiscalCreate, invoiceToNotaFiscalUpdate } from '../../../services/mappers';

export const useInvoices = (state: AppState, setState: React.Dispatch<React.SetStateAction<AppState>>) => {
  const { alert, confirm, success, error: showError } = useAlert();
  const tenant = useTenantOptional();
  const useApi = tenant?.entidadeId != null;
  const [apiLoading, setApiLoading] = useState(false);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingInvoiceId, setEditingInvoiceId] = useState<string | null>(null);

  const [selectedContractId, setSelectedContractId] = useState('');
  const [invoiceNumber, setInvoiceNumber] = useState('');
  const [issueDate, setIssueDate] = useState(new Date().toISOString().split('T')[0]);
  
  // Estado para controlar os inputs de quantidade. Chave é o contractItemId, Valor é a quantidade digitada.
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [error, setError] = useState('');

  const selectedContract = useMemo(() => 
    state.contracts.find(c => c.id === selectedContractId), 
    [selectedContractId, state.contracts]
  );

  const totalInvoiceValue = useMemo(() => {
    if (!selectedContract) return 0;
    return selectedContract.items.reduce((acc, item) => {
      const qty = quantities[item.id] || 0;
      return acc + (qty * item.unitPrice);
    }, 0);
  }, [selectedContract, quantities]);

  const handleQuantityChange = (itemId: string, value: string) => {
    const item = selectedContract?.items.find(i => i.id === itemId);
    if (!item) return;

    let newQty = parseFloat(value);
    
    // Validação: Não permite negativo
    if (newQty < 0 || isNaN(newQty)) newQty = 0;

    // Se estiver editando, precisamos considerar o que já foi usado nesta nota para calcular o limite
    // Limite Real = Saldo Atual no Banco + Quantidade Usada Nesta Nota (se houver)
    let currentLimit = item.currentBalance;
    
    if (editingInvoiceId) {
      const originalInvoice = state.invoices.find(inv => inv.id === editingInvoiceId);
      const originalItemUse = originalInvoice?.items.find(i => i.contractItemId === itemId)?.quantityUsed || 0;
      currentLimit += originalItemUse;
    }

    // Validação: Não permite maior que o saldo
    if (newQty > currentLimit) {
      setError(`Atenção: A quantidade não pode exceder o saldo disponível de ${currentLimit} ${item.unit}.`);
      newQty = currentLimit; // Trava no máximo
    } else {
      setError('');
    }

    setQuantities(prev => ({ ...prev, [itemId]: newQty }));
  };

  const handleEditInvoice = (invoice: Invoice) => {
    setEditingInvoiceId(invoice.id);
    setSelectedContractId(invoice.contractId);
    setInvoiceNumber(invoice.number);
    setIssueDate(invoice.issueDate);

    // Popula as quantidades existentes
    const initialQuantities: Record<string, number> = {};
    invoice.items.forEach(item => {
      initialQuantities[item.contractItemId] = item.quantityUsed;
    });
    setQuantities(initialQuantities);
    
    setIsModalOpen(true);
  };

  const applyInvoiceToState = (
    prev: AppState,
    newInvoiceData: Invoice,
    itemsToSave: InvoiceItem[],
    isEdit: boolean,
    originalInvoice?: Invoice
  ): AppState => {
    let updatedContracts = [...prev.contracts];
    if (isEdit && originalInvoice) {
      updatedContracts = updatedContracts.map((c) => {
        if (c.id === originalInvoice.contractId) {
          return {
            ...c,
            items: c.items.map((ci) => {
              const originalItem = originalInvoice.items.find((oi) => oi.contractItemId === ci.id);
              if (originalItem) {
                return { ...ci, currentBalance: ci.currentBalance + originalItem.quantityUsed };
              }
              return ci;
            }),
          };
        }
        return c;
      });
    }
    updatedContracts = updatedContracts.map((c) => {
      if (c.id === selectedContractId) {
        return {
          ...c,
          items: c.items.map((ci) => {
            const itemLaunched = itemsToSave.find((l) => l.contractItemId === ci.id);
            if (itemLaunched) {
              return { ...ci, currentBalance: ci.currentBalance - itemLaunched.quantityUsed };
            }
            return ci;
          }),
        };
      }
      return c;
    });
    const updatedInvoices = isEdit
      ? prev.invoices.map((inv) => (inv.id === editingInvoiceId ? newInvoiceData : inv))
      : [...prev.invoices, newInvoiceData];
    return { ...prev, contracts: updatedContracts, invoices: updatedInvoices };
  };

  const handleSaveInvoice = async () => {
    if (!selectedContractId || !invoiceNumber || !issueDate) {
      setError('Por favor, preencha os dados básicos da Nota Fiscal.');
      return;
    }

    const itemsToSave: InvoiceItem[] = [];
    selectedContract?.items.forEach((item) => {
      const qty = quantities[item.id] || 0;
      if (qty > 0) {
        itemsToSave.push({
          id: Math.random().toString(36).substr(2, 9),
          contractItemId: item.id,
          quantityUsed: qty,
          totalValue: qty * item.unitPrice,
        });
      }
    });

    if (itemsToSave.length === 0) {
      setError('A Nota Fiscal deve conter pelo menos um item com quantidade maior que zero.');
      return;
    }

    const newInvoiceData: Invoice = {
      id: editingInvoiceId || '',
      contractId: selectedContractId,
      number: invoiceNumber,
      issueDate,
      isPaid: false,
      items: itemsToSave,
    };

    if (useApi && !editingInvoiceId) {
      setApiLoading(true);
      try {
        const created = await createNotaFiscal(
          invoiceToNotaFiscalCreate({
            contractId: selectedContractId,
            number: invoiceNumber,
            issueDate,
            items: itemsToSave,
          })
        );
        // Calcula totalValue para os itens baseado no contrato
        const contract = state.contracts.find(c => c.id === created.contractId);
        const itemsWithTotal = created.items.map(item => {
          const contractItem = contract?.items.find(ci => ci.id === item.contractItemId);
          return {
            ...item,
            totalValue: contractItem ? item.quantityUsed * contractItem.unitPrice : item.totalValue || 0,
          };
        });
        const createdWithTotals = { ...created, items: itemsWithTotal };
        
        setState((prev) =>
          applyInvoiceToState(prev, createdWithTotals, itemsWithTotal, false)
        );
        setIsModalOpen(false);
        resetForm();
        await success({
          title: 'Sucesso!',
          message: 'Nota Fiscal criada com sucesso.',
        });
      } catch (e: any) {
        let errorMessage = 'Erro ao salvar Nota Fiscal.';
        if (e?.response?.data) {
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
        } else if (e instanceof Error) {
          errorMessage = e.message;
        }
        await showError({
          title: 'Erro ao Criar Nota Fiscal',
          message: errorMessage,
        });
      } finally {
        setApiLoading(false);
      }
      return;
    }

    if (useApi && editingInvoiceId) {
      setApiLoading(true);
      try {
        const updated = await updateNotaFiscal(
          parseInt(editingInvoiceId, 10),
          invoiceToNotaFiscalUpdate({
            number: invoiceNumber,
            issueDate,
            items: itemsToSave,
          })
        );
        // Calcula totalValue para os itens baseado no contrato
        const contract = state.contracts.find(c => c.id === updated.contractId);
        const itemsWithTotal = updated.items.map(item => {
          const contractItem = contract?.items.find(ci => ci.id === item.contractItemId);
          return {
            ...item,
            totalValue: contractItem ? item.quantityUsed * contractItem.unitPrice : item.totalValue || 0,
          };
        });
        const updatedWithTotals = { ...updated, items: itemsWithTotal };
        
        setState((prev) => {
          const originalInvoice = prev.invoices.find((inv) => inv.id === editingInvoiceId);
          return applyInvoiceToState(prev, updatedWithTotals, itemsWithTotal, true, originalInvoice);
        });
        setIsModalOpen(false);
        resetForm();
        await success({
          title: 'Sucesso!',
          message: 'Nota Fiscal atualizada com sucesso.',
        });
      } catch (e: any) {
        let errorMessage = 'Erro ao atualizar Nota Fiscal.';
        if (e?.response?.data) {
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
        } else if (e instanceof Error) {
          errorMessage = e.message;
        }
        await showError({
          title: 'Erro ao Atualizar Nota Fiscal',
          message: errorMessage,
        });
      } finally {
        setApiLoading(false);
      }
      return;
    }

    // Se não estiver usando API, não deve acontecer em produção
    if (!useApi) {
      await alert({
        title: 'API não configurada',
        message: 'Sistema configurado apenas para API. Faça login e tente novamente.',
      });
      return;
    }
  };

  const handleDeleteInvoice = async (id: string) => {
    const invoice = state.invoices.find((i) => i.id === id);
    if (!invoice) return;

    if (invoice.isPaid) {
      await alert({
        title: 'Não é possível excluir',
        message: 'Não é possível excluir uma nota fiscal que já foi paga pelo financeiro.',
      });
      return;
    }

    const confirmed = await confirm({
      title: 'Confirmar Exclusão',
      message: `Deseja realmente excluir a NF ${invoice.number}? O saldo dos itens será ESTORNADO ao contrato.`,
      confirmText: 'Excluir',
      cancelText: 'Cancelar',
    });
    if (!confirmed) return;

    const applyDelete = (prev: AppState) => {
      const updatedContracts = prev.contracts.map((c) => {
        if (c.id === invoice.contractId) {
          return {
            ...c,
            items: c.items.map((ci) => {
              const itemLaunched = invoice.items.find((li) => li.contractItemId === ci.id);
              if (itemLaunched) {
                return { ...ci, currentBalance: ci.currentBalance + itemLaunched.quantityUsed };
              }
              return ci;
            }),
          };
        }
        return c;
      });
      return { ...prev, contracts: updatedContracts, invoices: prev.invoices.filter((i) => i.id !== id) };
    };

    if (!useApi) {
      await alert({
        title: 'API não configurada',
        message: 'Sistema configurado apenas para API. Faça login e tente novamente.',
      });
      return;
    }

    setApiLoading(true);
    try {
      await deleteNotaFiscal(parseInt(id, 10));
      setState(applyDelete);
    } catch (e: any) {
      let errorMessage = 'Erro ao excluir Nota Fiscal.';
      if (e?.response?.data) {
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
      } else if (e instanceof Error) {
        errorMessage = e.message;
      }
      setError(errorMessage);
    } finally {
      setApiLoading(false);
    }
  };

  const resetForm = () => {
    setEditingInvoiceId(null);
    setSelectedContractId('');
    setInvoiceNumber('');
    setIssueDate(new Date().toISOString().split('T')[0]);
    setQuantities({});
    setError('');
  };

  return {
    isModalOpen,
    setIsModalOpen,
    editingInvoiceId,
    selectedContractId,
    setSelectedContractId,
    invoiceNumber,
    setInvoiceNumber,
    issueDate,
    setIssueDate,
    quantities,
    setQuantities,
    error,
    setError,
    selectedContract,
    totalInvoiceValue,
    handleQuantityChange,
    handleEditInvoice,
    handleSaveInvoice,
    handleDeleteInvoice,
    resetForm,
    apiLoading,
  };
};