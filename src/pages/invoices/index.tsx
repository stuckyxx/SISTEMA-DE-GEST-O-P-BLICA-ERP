import React from 'react';
import { Plus } from 'lucide-react';
import { AppState } from '../../types';
import { useInvoices } from './hooks/useInvoices';
import InvoiceList from './components/InvoiceList';
import InvoiceForm from './components/InvoiceForm';

interface InvoicesProps {
  state: AppState;
  setState: React.Dispatch<React.SetStateAction<AppState>>;
}

const InvoicesPage: React.FC<InvoicesProps> = ({ state, setState }) => {
  const {
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
  } = useInvoices(state, setState);

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Notas Fiscais / Despesas</h2>
          <p className="text-slate-500 dark:text-slate-400">Lançamento e baixa de itens contratuais.</p>
        </div>
        <button 
          onClick={() => { resetForm(); setIsModalOpen(true); }}
          className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl transition-all font-semibold shadow-md shadow-blue-200 dark:shadow-blue-900/30 active:scale-95"
        >
          <Plus size={20} />
          Lançar Nota Fiscal
        </button>
      </div>

      {/* Lista de Notas Fiscais */}
      <InvoiceList 
        invoices={state.invoices}
        contracts={state.contracts}
        handleEditInvoice={handleEditInvoice}
        handleDeleteInvoice={handleDeleteInvoice}
      />

      {/* MODAL DE LANÇAMENTO / EDIÇÃO */}
      {isModalOpen && (
        <InvoiceForm 
          onClose={() => { setIsModalOpen(false); resetForm(); }}
          editingInvoiceId={editingInvoiceId}
          selectedContractId={selectedContractId}
          setSelectedContractId={setSelectedContractId}
          invoiceNumber={invoiceNumber}
          setInvoiceNumber={setInvoiceNumber}
          issueDate={issueDate}
          setIssueDate={setIssueDate}
          quantities={quantities}
          setQuantities={setQuantities}
          setError={setError}
          error={error}
          selectedContract={selectedContract}
          totalInvoiceValue={totalInvoiceValue}
          handleQuantityChange={handleQuantityChange}
          handleSaveInvoice={handleSaveInvoice}
          state={state}
        />
      )}
    </div>
  );
};

export default InvoicesPage;