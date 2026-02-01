import { useState } from 'react';
import { AppState, Invoice, Payment, BankAccount } from '../../../types';

interface UseFinancialProps {
  state: AppState;
  setState: React.Dispatch<React.SetStateAction<AppState>>;
}

export const useFinancial = ({ state, setState }: UseFinancialProps) => {
  const [activeTab, setActiveTab] = useState<'pending' | 'history'>('pending');
  const [selectedInvoiceId, setSelectedInvoiceId] = useState<string | null>(null);
  const [paymentDate, setPaymentDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedAccountId, setSelectedAccountId] = useState('');
  
  // Modals State
  const [isConfigModalOpen, setIsConfigModalOpen] = useState(false);

  // Form for New Bank Account
  const [newAccount, setNewAccount] = useState<Partial<BankAccount>>({
    bank: '',
    agency: '',
    account: '',
    description: '',
    secretariat: ''
  });

  const pendingInvoices = state.invoices.filter(i => !i.isPaid);
  const paidInvoices = state.invoices.filter(i => i.isPaid).sort((a, b) => 
    new Date(b.payment?.date || 0).getTime() - new Date(a.payment?.date || 0).getTime()
  );

  const totalPaid = paidInvoices.reduce((acc, i) => acc + (i.payment?.amountPaid || 0), 0);
  const totalPending = pendingInvoices.reduce((acc, i) => acc + i.items.reduce((s, item) => s + item.totalValue, 0), 0);

  const handlePay = (invoice: Invoice) => {
    if (!selectedAccountId) {
      alert('Selecione a conta bancária para efetuar o pagamento.');
      return;
    }

    const totalAmount = invoice.items.reduce((acc, i) => acc + i.totalValue, 0);

    const newPayment: Payment = {
      id: Math.random().toString(36).substr(2, 9),
      date: paymentDate,
      bankAccountId: selectedAccountId,
      amountPaid: totalAmount
    };

    setState(prev => ({
      ...prev,
      invoices: prev.invoices.map(i => {
        if (i.id === invoice.id) {
          return { ...i, isPaid: true, payment: newPayment };
        }
        return i;
      })
    }));

    setSelectedInvoiceId(null);
  };

  const handleAddAccount = () => {
    if (!newAccount.bank || !newAccount.account || !newAccount.secretariat) {
      alert("Preencha Banco, Conta e Secretaria.");
      return;
    }

    const account: BankAccount = {
      id: Math.random().toString(36).substr(2, 9),
      bank: newAccount.bank!,
      agency: newAccount.agency || '0000',
      account: newAccount.account!,
      description: newAccount.description || '',
      secretariat: newAccount.secretariat!
    };

    setState(prev => ({
      ...prev,
      accounts: [...prev.accounts, account]
    }));

    setNewAccount({ bank: '', agency: '', account: '', description: '', secretariat: '' });
  };

  const handleDeleteAccount = (id: string) => {
    const isUsed = state.invoices.some(i => i.payment?.bankAccountId === id);
    if (isUsed) {
      alert("Não é possível excluir esta conta pois ela já foi usada em pagamentos anteriores.");
      return;
    }

    if (confirm("Excluir configuração desta conta bancária?")) {
      setState(prev => ({
        ...prev,
        accounts: prev.accounts.filter(a => a.id !== id)
      }));
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
    handleDeleteAccount
  };
};
