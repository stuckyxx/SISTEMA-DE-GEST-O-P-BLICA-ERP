import { useState } from 'react';
import { AppState, Invoice, Payment, BankAccount } from '../../../types';
import { useTenantOptional } from '../../../contexts/TenantContext';
import { useAlert } from '../../../contexts/AlertContext';
import { createContaBancaria, deleteContaBancaria, marcarNotaFiscalComoPaga } from '../../../services/api';
import { bankAccountToContaBancariaCreate } from '../../../services/mappers';

interface UseFinancialProps {
  state: AppState;
  setState: React.Dispatch<React.SetStateAction<AppState>>;
}

export const useFinancial = ({ state, setState }: UseFinancialProps) => {
  const { alert, confirm, error: showError, success } = useAlert();
  const tenant = useTenantOptional();
  const useApi = tenant?.entidadeId != null;
  const [apiLoading, setApiLoading] = useState(false);

  const [activeTab, setActiveTab] = useState<'pending' | 'history'>('pending');
  const [selectedInvoiceId, setSelectedInvoiceId] = useState<string | null>(null);
  const [paymentDate, setPaymentDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedAccountId, setSelectedAccountId] = useState('');

  const [isConfigModalOpen, setIsConfigModalOpen] = useState(false);

  const [newAccount, setNewAccount] = useState<Partial<BankAccount>>({
    bank: '',
    agency: '',
    account: '',
    description: '',
    secretariat: '',
  });

  const pendingInvoices = state.invoices.filter((i) => !i.isPaid);
  const paidInvoices = state.invoices
    .filter((i) => i.isPaid)
    .sort((a, b) => new Date(b.payment?.date || 0).getTime() - new Date(a.payment?.date || 0).getTime());

  const totalPaid = paidInvoices.reduce((acc, i) => acc + (i.payment?.amountPaid || 0), 0);
  const totalPending = pendingInvoices.reduce(
    (acc, i) => acc + i.items.reduce((s, item) => s + (item.totalValue || 0), 0),
    0
  );

  const handlePay = async (invoice: Invoice) => {
    if (!selectedAccountId) {
      await alert({
        title: 'Conta Bancária Necessária',
        message: 'Selecione a conta bancária para efetuar o pagamento.',
      });
      return;
    }

    const totalAmount = invoice.items.reduce((acc, i) => acc + (i.totalValue || 0), 0);
    const newPayment: Payment = {
      id: Math.random().toString(36).substr(2, 9),
      date: paymentDate,
      bankAccountId: selectedAccountId,
      amountPaid: totalAmount,
    };

    if (useApi) {
      setApiLoading(true);
      try {
        const updated = await marcarNotaFiscalComoPaga(parseInt(invoice.id, 10));
        setState((prev) => ({
          ...prev,
          invoices: prev.invoices.map((i) =>
            i.id === invoice.id ? { ...updated, payment: newPayment } : i
          ),
        }));
        setSelectedInvoiceId(null);
      } catch (e) {
        await showError({
          title: 'Erro ao Registrar Pagamento',
          message: e instanceof Error ? e.message : 'Erro ao registrar pagamento.',
        });
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

  const handleAddAccount = async () => {
    if (!newAccount.bank || !newAccount.account || !newAccount.secretariat) {
      await alert({
        title: 'Campos Obrigatórios',
        message: 'Preencha Banco, Conta e Secretaria.',
      });
      return;
    }

    if (!useApi || !tenant?.entidadeId) {
      await alert({
        title: 'API não configurada',
        message: 'Sistema configurado apenas para API. Faça login e tente novamente.',
      });
      return;
    }

    setApiLoading(true);
    try {
      const created = await createContaBancaria(
        tenant.entidadeId,
        bankAccountToContaBancariaCreate(
          {
            bank: newAccount.bank,
            agency: newAccount.agency || '0000',
            account: newAccount.account,
            description: newAccount.description || '',
            secretariat: newAccount.secretariat,
          },
          tenant.entidadeId
        )
      );
      setState((prev) => ({
        ...prev,
        accounts: [...prev.accounts, created],
      }));
      setNewAccount({ bank: '', agency: '', account: '', description: '', secretariat: '' });
      await success({
        title: 'Sucesso!',
        message: 'Conta bancária cadastrada com sucesso.',
      });
    } catch (e: any) {
      let errorMessage = 'Erro ao cadastrar conta.';
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
        title: 'Erro ao Cadastrar Conta',
        message: errorMessage,
      });
    } finally {
      setApiLoading(false);
    }
  };

  const handleDeleteAccount = async (id: string) => {
    const isUsed = state.invoices.some((i) => i.payment?.bankAccountId === id);
    if (isUsed) {
      await alert({
        title: 'Não é possível excluir',
        message: 'Não é possível excluir esta conta pois ela já foi usada em pagamentos anteriores.',
      });
      return;
    }

    const confirmed = await confirm({
      title: 'Confirmar Exclusão',
      message: 'Excluir configuração desta conta bancária?',
      confirmText: 'Excluir',
      cancelText: 'Cancelar',
    });
    if (!confirmed) return;

    if (!useApi) {
      await alert({
        title: 'API não configurada',
        message: 'Sistema configurado apenas para API. Faça login e tente novamente.',
      });
      return;
    }

    setApiLoading(true);
    try {
      await deleteContaBancaria(parseInt(id, 10));
      setState((prev) => ({
        ...prev,
        accounts: prev.accounts.filter((a) => a.id !== id),
      }));
    } catch (e: any) {
      let errorMessage = 'Erro ao excluir conta.';
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
        title: 'Erro ao excluir',
        message: errorMessage,
      });
    } finally {
      setApiLoading(false);
    }
  };

  return {
    activeTab,
    setActiveTab,
    selectedInvoiceId,
    setSelectedInvoiceId,
    paymentDate,
    setPaymentDate,
    selectedAccountId,
    setSelectedAccountId,
    isConfigModalOpen,
    setIsConfigModalOpen,
    newAccount,
    setNewAccount,
    pendingInvoices,
    paidInvoices,
    totalPaid,
    totalPending,
    handlePay,
    handleAddAccount,
    handleDeleteAccount,
    apiLoading,
  };
};
