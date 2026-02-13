import { useState } from 'react';
import { AppState, Supplier } from '../../../types';
import { useTenantOptional } from '../../../contexts/TenantContext';
import { useAlert } from '../../../contexts/AlertContext';
import { createFornecedor, deleteFornecedor, updateFornecedor } from '../../../services/api';
import { supplierToFornecedorCreate, supplierToFornecedorUpdate } from '../../../services/mappers';

interface UseSuppliersProps {
  state: AppState;
  setState: React.Dispatch<React.SetStateAction<AppState>>;
}

export const useSuppliers = ({ state, setState }: UseSuppliersProps) => {
  const { alert, confirm, error: showError } = useAlert();
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null);
  const [form, setForm] = useState<Partial<Supplier>>({
    name: '',
    cnpj: '',
    phone: '',
    email: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const tenant = useTenantOptional();
  const useApi = tenant?.entidadeId != null;

  const filteredSuppliers = state.suppliers.filter(
    (s) =>
      s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.cnpj.includes(searchTerm) ||
      s.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatCNPJ = (value: string) => {
    return value
      .replace(/\D/g, '')
      .replace(/^(\d{2})(\d)/, '$1.$2')
      .replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3')
      .replace(/\.(\d{3})(\d)/, '.$1/$2')
      .replace(/(\d{4})(\d)/, '$1-$2')
      .substring(0, 18);
  };

  const formatPhone = (value: string) => {
    return value
      .replace(/\D/g, '')
      .replace(/^(\d{2})(\d)/, '($1) $2')
      .replace(/(\d)(\d{4})$/, '$1-$2')
      .substring(0, 15);
  };

  const handleSave = async () => {
    if (!form.name || !form.cnpj) {
      await alert({
        title: 'Campos Obrigatórios',
        message: 'Razão Social e CNPJ são campos obrigatórios.',
      });
      return;
    }
    setError('');

    if (useApi && tenant?.entidadeId != null) {
      setIsLoading(true);
      try {
        const created = await createFornecedor(tenant.entidadeId, supplierToFornecedorCreate(form as Supplier, tenant.entidadeId));
        setState((prev) => ({
          ...prev,
          suppliers: [...prev.suppliers, created],
        }));
        setIsModalOpen(false);
        setForm({ name: '', cnpj: '', phone: '', email: '' });
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Erro ao salvar fornecedor.');
      } finally {
        setIsLoading(false);
      }
      return;
    }

    setError('Sistema configurado apenas para API. Faça login e tente novamente.');
  };

  const handleUpdate = async (updatedSupplier: Supplier) => {
    if (!updatedSupplier.name || !updatedSupplier.cnpj) {
      await alert({
        title: 'Campos Obrigatórios',
        message: 'Razão Social e CNPJ são campos obrigatórios.',
      });
      return;
    }
    setError('');

    if (useApi && tenant?.entidadeId != null) {
      setIsLoading(true);
      try {
        const updated = await updateFornecedor(
          parseInt(updatedSupplier.id, 10),
          supplierToFornecedorUpdate(updatedSupplier)
        );
        setState((prev) => ({
          ...prev,
          suppliers: prev.suppliers.map((s) => 
            s.id === updatedSupplier.id ? updated : s
          ),
        }));
        setIsDetailsModalOpen(false);
        setSelectedSupplier(null);
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Erro ao atualizar fornecedor.');
      } finally {
        setIsLoading(false);
      }
      return;
    }

    setError('Sistema configurado apenas para API. Faça login e tente novamente.');
  };

  const handleDelete = async (id: string) => {
    const hasContracts = state.contracts.some((c) => c.supplierId === id);
    if (hasContracts) {
      await alert({
        title: 'Não é possível excluir',
        message: 'Não é possível excluir este fornecedor pois ele possui contratos ativos. Remova os contratos primeiro.',
        type: 'warning',
      });
      return;
    }
    const confirmed = await confirm({
      title: 'Confirmar Exclusão',
      message: 'Atenção: Você tem certeza que deseja excluir este fornecedor permanentemente?',
      confirmText: 'Excluir',
      cancelText: 'Cancelar',
    });
    if (!confirmed) return;

    if (useApi) {
      setIsLoading(true);
      setError('');
      try {
        await deleteFornecedor(parseInt(id, 10));
        setState((prev) => ({
          ...prev,
          suppliers: prev.suppliers.filter((s) => s.id !== id),
        }));
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Erro ao excluir fornecedor.');
      } finally {
        setIsLoading(false);
      }
      return;
    }

    setError('Sistema configurado apenas para API.');
  };

  const handleShowDetails = (supplier: Supplier) => {
    setSelectedSupplier(supplier);
    setIsDetailsModalOpen(true);
  };

  const handleCloseDetails = () => {
    setIsDetailsModalOpen(false);
    setSelectedSupplier(null);
  };

  return {
    searchTerm,
    setSearchTerm,
    isModalOpen,
    setIsModalOpen,
    isDetailsModalOpen,
    setIsDetailsModalOpen,
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
    isLoading,
    error,
    setError,
  };
};
