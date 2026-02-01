import React from 'react';
import { 
  FileCheck, Edit2, Trash2, Box, BarChart2, FileText 
} from 'lucide-react';
import { Ata, Supplier } from '../../../types';
import { formatCurrency } from '../../../utils/format';

interface AtaListProps {
  atas: Ata[];
  handleEditAta: (ata: Ata) => void;
  handleDeleteAta: (id: string) => void;
  suppliers: Supplier[];
}

const AtaList: React.FC<AtaListProps> = ({ 
  atas, 
  handleEditAta, 
  handleDeleteAta,
  suppliers 
}) => {

  const getSupplierName = (id: string) => {
    return suppliers.find(s => s.id === id)?.name || 'Fornecedor Desconhecido';
  };

  if (atas.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-slate-400 bg-white dark:bg-slate-900 rounded-2xl border border-dashed border-slate-300 dark:border-slate-700">
        <FileText size={48} className="mb-4 opacity-20" />
        <p>Nenhuma Ata de Registro de Preço encontrada.</p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 dark:bg-slate-950 text-slate-500 uppercase font-bold text-xs">
            <tr>
              <th className="p-4">Processo / Modalidade</th>
              <th className="p-4">Fornecedor</th>
              <th className="p-4 text-center">Itens</th>
              <th className="p-4 text-right">Valor Total</th>
              <th className="p-4 text-center">Reserva</th>
              <th className="p-4 text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {atas.map((ata) => (
              <tr key={ata.id} className="hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors">
                <td className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-50 dark:bg-blue-900/20 text-blue-600 rounded-lg">
                      <FileCheck size={20} />
                    </div>
                    <div>
                      <p className="font-bold text-slate-800 dark:text-white">{ata.processNumber}</p>
                      <p className="text-xs text-slate-500">{ata.modality}</p>
                    </div>
                  </div>
                </td>
                <td className="p-4">
                  <p className="font-medium text-slate-700 dark:text-slate-300">
                    {getSupplierName(ata.supplierId)}
                  </p>
                  <p className="text-xs text-slate-400 truncate max-w-[200px]">{ata.object}</p>
                </td>
                <td className="p-4 text-center">
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-xs font-bold">
                    <Box size={14} />
                    {ata.items.length}
                  </div>
                </td>
                <td className="p-4 text-right">
                  <span className="font-bold text-slate-800 dark:text-white block">
                    {formatCurrency(ata.items.reduce((acc, i) => acc + i.totalPrice, 0))}
                  </span>
                </td>
                <td className="p-4">
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-24 h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-blue-500" 
                        style={{ width: `${ata.reservedPercentage}%` }} 
                      />
                    </div>
                    <span className="text-xs font-bold text-slate-500">{Math.round(ata.reservedPercentage)}%</span>
                  </div>
                </td>
                <td className="p-4 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <button 
                      onClick={() => handleEditAta(ata)}
                      className="p-2 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 text-slate-400 hover:text-indigo-600 rounded-lg transition-colors"
                      title="Editar"
                    >
                      <Edit2 size={18} />
                    </button>
                    <button 
                      onClick={() => handleDeleteAta(ata.id)}
                      className="p-2 hover:bg-red-50 dark:hover:bg-red-900/30 text-slate-400 hover:text-red-500 rounded-lg transition-colors"
                      title="Excluir"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AtaList;