import React from 'react';
import { Plus, Search } from 'lucide-react';
import { AppState } from '../../types';
import { useSuppliers } from './hooks/useSuppliers';
import { SupplierList } from './components/SupplierList';
import { SupplierForm } from './components/SupplierForm';
import { SupplierDetailsModal } from './components/SupplierDetailsModal';

interface SuppliersProps {
  state: AppState;
  setState: React.Dispatch<React.SetStateAction<AppState>>;
}

const Suppliers: React.FC<SuppliersProps> = ({ state, setState }) => {
  const {
    searchTerm,
    setSearchTerm,
    isModalOpen,
    setIsModalOpen,
    isDetailsModalOpen,
    selectedSupplier,
    handleShowDetails,
    handleCloseDetails,
    form,
    setForm,
    filteredSuppliers,
    formatCNPJ,
    formatPhone,
    handleSave,
    handleUpdate,
    handleDelete,
    isLoading
  } = useSuppliers({ state, setState });

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Fornecedores</h2>
          <p className="text-slate-500 dark:text-slate-400">Cadastro centralizado de empresas parceiras.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl transition-all font-semibold shadow-md shadow-blue-200 dark:shadow-blue-900/30"
        >
          <Plus size={20} />
          Cadastrar Fornecedor
        </button>
      </div>

      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 flex items-center gap-3">
        <Search className="text-slate-400" size={20} />
        <input 
          type="text" 
          placeholder="Filtrar por nome, documento ou email..." 
          className="flex-1 outline-none text-slate-700 dark:text-slate-200 font-medium bg-transparent"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <SupplierList 
        suppliers={filteredSuppliers}
        onDelete={handleDelete}
        onShowDetails={handleShowDetails}
      />

      <SupplierForm 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        form={form}
        setForm={setForm}
        onSave={handleSave}
        formatCNPJ={formatCNPJ}
        formatPhone={formatPhone}
      />

      <SupplierDetailsModal
        isOpen={isDetailsModalOpen}
        onClose={handleCloseDetails}
        supplier={selectedSupplier}
        onSave={handleUpdate}
        formatCNPJ={formatCNPJ}
        formatPhone={formatPhone}
        isLoading={isLoading}
      />
    </div>
  );
};

export default Suppliers;
