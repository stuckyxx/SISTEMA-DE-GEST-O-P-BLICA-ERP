import { useState } from 'react';
import { AppState, Supplier } from '../../../types';

interface UseSuppliersProps {
  state: AppState;
  setState: React.Dispatch<React.SetStateAction<AppState>>;
}

export const useSuppliers = ({ state, setState }: UseSuppliersProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form, setForm] = useState<Partial<Supplier>>({
    name: '',
    cnpj: '',
    phone: '',
    email: ''
  });

  const filteredSuppliers = state.suppliers.filter(s => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    s.cnpj.includes(searchTerm) ||
    s.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Funções de Máscara
  const formatCNPJ = (value: string) => {
    return value
      .replace(/\D/g, '') // Remove tudo o que não é dígito
      .replace(/^(\d{2})(\d)/, '$1.$2') // Coloca ponto após os 2 primeiros dígitos
      .replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3') // Coloca ponto após os 3 próximos
      .replace(/\.(\d{3})(\d)/, '.$1/$2') // Coloca barra após os 3 próximos
      .replace(/(\d{4})(\d)/, '$1-$2') // Coloca hífen antes dos 2 últimos
      .substring(0, 18); // Limita o tamanho
  };

  const formatPhone = (value: string) => {
    return value
      .replace(/\D/g, '')
      .replace(/^(\d{2})(\d)/, '($1) $2')
      .replace(/(\d)(\d{4})$/, '$1-$2')
      .substring(0, 15);
  };

  const handleSave = () => {
    if (!form.name || !form.cnpj) {
      alert("Razão Social e CNPJ são campos obrigatórios.");
      return;
    }

    const newSupplier: Supplier = {
      id: Math.random().toString(36).substr(2, 9),
      name: form.name || '',
      cnpj: form.cnpj || '',
      phone: form.phone || '',
      email: form.email || ''
    };

    setState(prev => ({
      ...prev,
      suppliers: [...prev.suppliers, newSupplier]
    }));

    setIsModalOpen(false);
    setForm({ name: '', cnpj: '', phone: '', email: '' });
  };

  const handleDelete = (id: string) => {
    // Check if supplier has contracts
    const hasContracts = state.contracts.some(c => c.supplierId === id);
    if (hasContracts) {
      alert("Não é possível excluir este fornecedor pois ele possui contratos ativos. Remova os contratos primeiro.");
      return;
    }

    if (window.confirm("Atenção: Você tem certeza que deseja excluir este fornecedor permanentemente?")) {
      setState(prev => ({
        ...prev,
        suppliers: prev.suppliers.filter(s => s.id !== id)
      }));
    }
  };

  return {
    searchTerm,
    setSearchTerm,
    isModalOpen,
    setIsModalOpen,
    form,
    setForm,
    filteredSuppliers,
    formatCNPJ,
    formatPhone,
    handleSave,
    handleDelete
  };
};
