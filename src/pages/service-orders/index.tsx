import React from 'react';
import { Plus } from 'lucide-react';
import { AppState } from '../../types';
import { useServiceOrders } from './hooks/useServiceOrders';
import ServiceOrderList from './components/ServiceOrderList';
import ServiceOrderForm from './components/ServiceOrderForm';
import ServiceOrderPrint from './components/ServiceOrderPrint';

interface ServiceOrdersPageProps {
  state: AppState;
  setState: React.Dispatch<React.SetStateAction<AppState>>;
}

const ServiceOrdersPage: React.FC<ServiceOrdersPageProps> = ({ state, setState }) => {
  const {
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
  } = useServiceOrders(state, setState);

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Ordens de Serviço</h2>
          <p className="text-slate-500 dark:text-slate-400">Autorização de fornecimento e execução.</p>
        </div>
        <button 
          onClick={() => { resetForm(); setIsModalOpen(true); }}
          className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl transition-all font-semibold shadow-md shadow-blue-200 dark:shadow-blue-900/30 active:scale-95"
        >
          <Plus size={20} />
          Nova O.S.
        </button>
      </div>

      <ServiceOrderList 
        serviceOrders={state.serviceOrders}
        contracts={state.contracts}
        suppliers={state.suppliers}
        setViewOS={setViewOS}
        getTotalValue={getTotalValue}
      />

      {isModalOpen && (
        <ServiceOrderForm
          onClose={() => setIsModalOpen(false)}
          selectedContractId={selectedContractId}
          setSelectedContractId={setSelectedContractId}
          osDate={osDate}
          setOsDate={setOsDate}
          osDescription={osDescription}
          setOsDescription={setOsDescription}
          osItems={osItems}
          setOsItems={setOsItems}
          selectedContract={selectedContract}
          handleAddItem={handleAddItem}
          handleUpdateQty={handleUpdateQty}
          handleCreateOS={handleCreateOS}
          resetForm={resetForm}
          state={state}
        />
      )}

      {viewOS && (
        <ServiceOrderPrint
          viewOS={viewOS}
          setViewOS={setViewOS}
          state={state}
          getTotalValue={getTotalValue}
          printOS={printOS}
        />
      )}
    </div>
  );
};

export default ServiceOrdersPage;