import React from 'react';
import { Plus, Search } from 'lucide-react';
import { AppState } from '../../types';
import { useUsers } from './hooks/useUsers';
import { UserList } from './components/UserList';
import { UserForm } from './components/UserForm';
import { UserDetailsModal } from './components/UserDetailsModal';

interface UsersProps {
  state: AppState;
  setState: React.Dispatch<React.SetStateAction<AppState>>;
}

const Users: React.FC<UsersProps> = ({ state, setState }) => {
  const {
    searchTerm,
    setSearchTerm,
    isModalOpen,
    setIsModalOpen,
    isDetailsModalOpen,
    selectedUser,
    handleShowDetails,
    handleCloseDetails,
    form,
    setForm,
    filteredUsers,
    handleSave,
    handleUpdate,
    handleDelete,
    isLoading
  } = useUsers({ state, setState });

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Usuários</h2>
          <p className="text-slate-500 dark:text-slate-400">Gestão de usuários do sistema.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl transition-all font-semibold shadow-md shadow-blue-200 dark:shadow-blue-900/30"
        >
          <Plus size={20} />
          Cadastrar Usuário
        </button>
      </div>

      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 flex items-center gap-3">
        <Search className="text-slate-400" size={20} />
        <input 
          type="text" 
          placeholder="Filtrar por nome, username ou perfil..." 
          className="flex-1 outline-none text-slate-700 dark:text-slate-200 font-medium bg-transparent"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <UserList 
        users={filteredUsers}
        onDelete={handleDelete}
        onShowDetails={handleShowDetails}
      />

      <UserForm 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        form={form}
        setForm={setForm}
        onSave={handleSave}
      />

      <UserDetailsModal
        isOpen={isDetailsModalOpen}
        onClose={handleCloseDetails}
        user={selectedUser}
        onSave={handleUpdate}
        isLoading={isLoading}
      />
    </div>
  );
};

export default Users;
