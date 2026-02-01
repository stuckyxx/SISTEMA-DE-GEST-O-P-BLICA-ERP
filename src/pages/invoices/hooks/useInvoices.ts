import { useState, useMemo } from 'react';
import { AppState, Invoice, InvoiceItem } from '../../../types';

export const useInvoices = (state: AppState, setState: React.Dispatch<React.SetStateAction<AppState>>) => {
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

  const handleSaveInvoice = () => {
    if (!selectedContractId || !invoiceNumber || !issueDate) {
      setError('Por favor, preencha os dados básicos da Nota Fiscal.');
      return;
    }

    // Filtrar apenas itens com quantidade > 0
    const itemsToSave: InvoiceItem[] = [];
    
    selectedContract?.items.forEach(item => {
      const qty = quantities[item.id] || 0;
      if (qty > 0) {
        itemsToSave.push({
          id: Math.random().toString(36).substr(2, 9),
          contractItemId: item.id,
          quantityUsed: qty,
          totalValue: qty * item.unitPrice
        });
      }
    });

    if (itemsToSave.length === 0) {
      setError('A Nota Fiscal deve conter pelo menos um item com quantidade maior que zero.');
      return;
    }

    // Atualizar Estado Global
    setState(prev => {
      let updatedContracts = [...prev.contracts];

      // Se for EDIÇÃO, primeiro precisamos RESTAURAR o saldo dos itens da nota original
      if (editingInvoiceId) {
        const originalInvoice = prev.invoices.find(inv => inv.id === editingInvoiceId);
        if (originalInvoice) {
          updatedContracts = updatedContracts.map(c => {
            if (c.id === originalInvoice.contractId) {
              return {
                ...c,
                items: c.items.map(ci => {
                  const originalItem = originalInvoice.items.find(oi => oi.contractItemId === ci.id);
                  if (originalItem) {
                    return { ...ci, currentBalance: ci.currentBalance + originalItem.quantityUsed };
                  }
                  return ci;
                })
              };
            }
            return c;
          });
        }
      }

      // Agora aplicamos o NOVO débito (seja criação ou edição)
      updatedContracts = updatedContracts.map(c => {
        if (c.id === selectedContractId) {
          return {
            ...c,
            items: c.items.map(ci => {
              const itemLaunched = itemsToSave.find(l => l.contractItemId === ci.id);
              if (itemLaunched) {
                return { ...ci, currentBalance: ci.currentBalance - itemLaunched.quantityUsed };
              }
              return ci;
            })
          };
        }
        return c;
      });

      const newInvoiceData: Invoice = {
        id: editingInvoiceId || Math.random().toString(36).substr(2, 9),
        contractId: selectedContractId,
        number: invoiceNumber,
        issueDate,
        isPaid: false, // Edição mantém como não pago (pois só edita se não pago)
        items: itemsToSave
      };

      let updatedInvoices = prev.invoices;
      if (editingInvoiceId) {
        updatedInvoices = prev.invoices.map(inv => inv.id === editingInvoiceId ? newInvoiceData : inv);
      } else {
        updatedInvoices = [...prev.invoices, newInvoiceData];
      }

      return {
        ...prev,
        contracts: updatedContracts,
        invoices: updatedInvoices
      };
    });

    setIsModalOpen(false);
    resetForm();
  };

  const handleDeleteInvoice = (id: string) => {
    const invoice = state.invoices.find(i => i.id === id);
    if (!invoice) return;

    if (invoice.isPaid) {
      alert("Não é possível excluir uma nota fiscal que já foi paga pelo financeiro.");
      return;
    }

    if (confirm(`Deseja realmente excluir a NF ${invoice.number}? O saldo dos itens será ESTORNADO ao contrato.`)) {
      setState(prev => {
        const updatedContracts = prev.contracts.map(c => {
          if (c.id === invoice.contractId) {
            return {
              ...c,
              items: c.items.map(ci => {
                const itemLaunched = invoice.items.find(li => li.contractItemId === ci.id);
                if (itemLaunched) {
                  // ESTORNO DO SALDO AQUI
                  return { ...ci, currentBalance: ci.currentBalance + itemLaunched.quantityUsed };
                }
                return ci;
              })
            };
          }
          return c;
        });

        return {
          ...prev,
          contracts: updatedContracts,
          invoices: prev.invoices.filter(i => i.id !== id)
        };
      });
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
    isModalOpen, setIsModalOpen,
    editingInvoiceId,
    selectedContractId, setSelectedContractId,
    invoiceNumber, setInvoiceNumber,
    issueDate, setIssueDate,
    quantities, setQuantities,
    error, setError,
    selectedContract,
    totalInvoiceValue,
    handleQuantityChange,
    handleEditInvoice,
    handleSaveInvoice,
    handleDeleteInvoice,
    resetForm
  };
};