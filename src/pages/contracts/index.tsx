import React from 'react';
import { Plus } from 'lucide-react';
import { AppState } from '../../types';
import { useContracts } from './hooks/useContracts';
import ContractList from './components/ContractList';
import ContractForm from './components/ContractForm';
import { formatCurrency } from '../../utils/format';

interface ContractsProps {
  state: AppState;
  setState: React.Dispatch<React.SetStateAction<AppState>>;
}

const Contracts: React.FC<ContractsProps> = ({ state, setState }) => {
  const {
    searchTerm, setSearchTerm,
    selectedContract, setSelectedContract,
    isRegistering, setIsRegistering,
    editingId,
    formContract, setFormContract,
    originType, setOriginType,
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
    resetForm
  } = useContracts(state, setState);

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-white tracking-tight">Contratos</h2>
          <p className="text-slate-500 dark:text-slate-400 font-medium">Gestão e fiscalização de saldos contratuais.</p>
        </div>
        <button 
          onClick={() => { resetForm(); setIsRegistering(true); }}
          className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-2xl transition-all font-bold shadow-lg shadow-blue-100 dark:shadow-blue-900/30 active:scale-95"
        >
          <Plus size={20} />
          Novo Contrato
        </button>
      </div>

      <ContractList 
        filteredContracts={filteredContracts}
        state={state}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        onEdit={handleEditContract}
        onDelete={handleDeleteContract}
        selectedContract={selectedContract}
        onSelect={(c) => setSelectedContract(selectedContract?.id === c.id ? null : c)}
        getValidityProgress={getValidityProgress}
        getStatus={getStatus}
      />

      {isRegistering && (
        <ContractForm 
          onClose={() => { setIsRegistering(false); resetForm(); }}
          isEditing={!!editingId}
          formContract={formContract}
          setFormContract={setFormContract}
          originType={originType}
          setOriginType={setOriginType}
          formItems={formItems}
          handleAddFormItem={handleAddFormItem}
          handleRemoveFormItem={handleRemoveFormItem}
          updateFormItem={updateFormItem}
          handleSaveContract={handleSaveContract}
          state={state}
          globalTotal={globalTotal}
          ataBalanceInfo={ataBalanceInfo}
        />
      )}
    </div>
  );
};

export default Contracts;