import { useState } from 'react';
import { AppState, SystemUser } from '../../../types';
import { useTenantOptional } from '../../../contexts/TenantContext';
import { useAlert } from '../../../contexts/AlertContext';
import { createUsuario, deleteUsuario, updateUsuario } from '../../../services/api';
import { systemUserToUsuarioCreate, systemUserToUsuarioUpdate } from '../../../services/mappers';

interface UseUsersProps {
  state: AppState;
  setState: React.Dispatch<React.SetStateAction<AppState>>;
}

export const useUsers = ({ state, setState }: UseUsersProps) => {
  const { alert, confirm, error: showError } = useAlert();
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<SystemUser | null>(null);
  const [form, setForm] = useState<Partial<SystemUser>>({
    name: '',
    username: '',
    password: '',
    role: 'viewer',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const tenant = useTenantOptional();
  const useApi = tenant?.entidadeId != null;

  const filteredUsers = state.users.filter(
    (u) =>
      u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.role.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSave = async () => {
    if (!form.name || !form.username || !form.password) {
      await alert({
        title: 'Campos Obrigatórios',
        message: 'Nome, Username e Senha são campos obrigatórios.',
      });
      return;
    }
    setError('');

    if (useApi && tenant?.entidadeId != null) {
      setIsLoading(true);
      try {
        const created = await createUsuario(
          systemUserToUsuarioCreate(form as SystemUser, tenant.entidadeId)
        );
        setState((prev) => ({
          ...prev,
          users: [...prev.users, created],
        }));
        setIsModalOpen(false);
        setForm({ name: '', username: '', password: '', role: 'viewer' });
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Erro ao salvar usuário.');
        await showError(e instanceof Error ? e.message : 'Erro ao salvar usuário.');
      } finally {
        setIsLoading(false);
      }
      return;
    }

    setError('Sistema configurado apenas para API. Faça login e tente novamente.');
  };

  const handleUpdate = async (updatedUser: SystemUser) => {
    if (!updatedUser.name || !updatedUser.username) {
      await alert({
        title: 'Campos Obrigatórios',
        message: 'Nome e Username são campos obrigatórios.',
      });
      return;
    }
    setError('');

    if (useApi && tenant?.entidadeId != null) {
      setIsLoading(true);
      try {
        // Se a senha está vazia, não incluir no update
        const updateData: Partial<SystemUser> = {
          name: updatedUser.name,
          username: updatedUser.username,
          role: updatedUser.role,
        };
        
        // Só incluir senha se foi fornecida
        if (updatedUser.password && updatedUser.password.trim() !== '') {
          updateData.password = updatedUser.password;
        }

        const updated = await updateUsuario(
          parseInt(updatedUser.id, 10),
          systemUserToUsuarioUpdate(updateData)
        );
        setState((prev) => ({
          ...prev,
          users: prev.users.map((u) => 
            u.id === updatedUser.id ? updated : u
          ),
        }));
        setIsDetailsModalOpen(false);
        setSelectedUser(null);
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Erro ao atualizar usuário.');
        await showError(e instanceof Error ? e.message : 'Erro ao atualizar usuário.');
      } finally {
        setIsLoading(false);
      }
      return;
    }

    setError('Sistema configurado apenas para API. Faça login e tente novamente.');
  };

  const handleDelete = async (id: string) => {
    const confirmed = await confirm({
      title: 'Confirmar Exclusão',
      message: 'Atenção: Você tem certeza que deseja excluir este usuário permanentemente?',
      confirmText: 'Excluir',
      cancelText: 'Cancelar',
    });
    if (!confirmed) return;

    if (useApi) {
      setIsLoading(true);
      setError('');
      try {
        await deleteUsuario(parseInt(id, 10));
        setState((prev) => ({
          ...prev,
          users: prev.users.filter((u) => u.id !== id),
        }));
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Erro ao excluir usuário.');
        await showError(e instanceof Error ? e.message : 'Erro ao excluir usuário.');
      } finally {
        setIsLoading(false);
      }
      return;
    }

    setError('Sistema configurado apenas para API.');
  };

  const handleShowDetails = (user: SystemUser) => {
    setSelectedUser(user);
    setIsDetailsModalOpen(true);
  };

  const handleCloseDetails = () => {
    setIsDetailsModalOpen(false);
    setSelectedUser(null);
  };

  return {
    searchTerm,
    setSearchTerm,
    isModalOpen,
    setIsModalOpen,
    isDetailsModalOpen,
    setIsDetailsModalOpen,
    selectedUser,
    handleShowDetails,
    handleCloseDetails,
    form,
    setForm,
    filteredUsers,
    handleSave,
    handleUpdate,
    handleDelete,
    isLoading,
    error,
    setError,
  };
};
