import React from 'react';
import { Plus, Search, FileText } from 'lucide-react';
import { AppState } from '../../types';
import { useAtas } from './hooks/useAtas';
import AtaList from './components/AtaList';
import AtaForm from './components/AtaForm';
import { formatCurrency } from '../../utils/format';

interface AtasPageProps {
  state: AppState;
  setState: React.Dispatch<React.SetStateAction<AppState>>;
}

const AtasPage: React.FC<AtasPageProps> = ({ state, setState }) => {
  const {
    searchTerm, setSearchTerm,
    isModalOpen, setIsModalOpen,
    editingAtaId,
    isImporting,
    importStatus,
    warningMsg,
    fileInputRef,
    formData, setFormData,
    items, setItems,
    distributions,
    newDistSecretariat, setNewDistSecretariat,
    newDistPercent, setNewDistPercent,
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
    resetForm
  } = useAtas(state, setState);

  return (
    <div className="p-8 max-w-[1600px] mx-auto space-y-8 animate-in fade-in duration-500">

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-slate-800 dark:text-white tracking-tight">
            Atas de Registro de Preços
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-2 text-lg">
            Gerencie as atas, itens e distribua saldos entre secretarias.
          </p>
        </div>

        <div className="flex items-center gap-4">
          <div className="relative group">
            <input
              type="text"
              placeholder="Buscar ata..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-12 pr-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 w-full md:w-80 outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all shadow-sm group-hover:shadow-md"
            />
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
          </div>

          <button
            onClick={() => {
              resetForm();
              setIsModalOpen(true);
            }}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-2xl font-bold shadow-lg shadow-indigo-500/20 transition-all transform hover:-translate-y-1 active:translate-y-0"
          >
            <Plus size={24} />
            <span>Nova Ata</span>
          </button>
        </div>
      </div>

      {/* Stats Cards - Optional layout enhancement */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 rounded-xl">
              <FileText size={24} />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-500 uppercase tracking-wider">Total em Atas</p>
              <p className="text-2xl font-black text-slate-800 dark:text-white">
                {formatCurrency(state.atas.reduce((acc, a) => acc + a.totalValue, 0))}
              </p>
            </div>
          </div>
        </div>
        {/* Adicionar mais cards se necessário */}
      </div>

      {/* List */}
      <AtaList
        atas={filteredAtas}
        handleEditAta={handleEditAta}
        handleDeleteAta={handleDeleteAta}
        suppliers={state.suppliers}
      />

      {/* Modal */}
      {isModalOpen && (
        <AtaForm
          onClose={() => setIsModalOpen(false)}
          isEditing={!!editingAtaId}
          formData={formData}
          setFormData={setFormData}
          items={items}
          setItems={setItems}
          handleUpdateItem={handleUpdateItem}
          removeItem={removeItem}
          handleAddItem={handleAddItem}
          totalValue={totalValue}
          distributions={distributions}
          handleAddDistribution={handleAddDistribution}
          removeDistribution={removeDistribution}
          newDistSecretariat={newDistSecretariat}
          setNewDistSecretariat={setNewDistSecretariat}
          newDistPercent={newDistPercent}
          setNewDistPercent={setNewDistPercent}
          reservedPercent={reservedPercent}
          reservedValue={reservedValue}
          handleSaveAta={handleSaveAta}
          isImporting={isImporting}
          importStatus={importStatus}
          handleFileUpload={handleFileUpload}
          fileInputRef={fileInputRef}
          warningMsg={warningMsg}
          state={state}
        />
      )}
    </div>
  );
};

export default AtasPage;