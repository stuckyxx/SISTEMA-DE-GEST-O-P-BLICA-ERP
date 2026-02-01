import React from 'react';
import { 
  ClipboardList, 
  FileText, 
  Building2, 
  Calendar, 
  Printer 
} from 'lucide-react';
import { AppState, ServiceOrder } from '../../../types';
import { formatCurrency } from '../../../utils/format';

interface ServiceOrderListProps {
  serviceOrders: ServiceOrder[];
  contracts: AppState['contracts'];
  suppliers: AppState['suppliers'];
  setViewOS: (os: ServiceOrder) => void;
  getTotalValue: (os: ServiceOrder) => number;
}

const ServiceOrderList: React.FC<ServiceOrderListProps> = ({ 
  serviceOrders, 
  contracts, 
  suppliers, 
  setViewOS,
  getTotalValue
}) => {
  if (serviceOrders.length === 0) {
    return (
      <div className="bg-white dark:bg-slate-900 p-12 rounded-3xl border border-dashed border-slate-200 dark:border-slate-800 text-center">
        <ClipboardList className="mx-auto text-slate-300 dark:text-slate-600 mb-4" size={48} />
        <p className="text-slate-500 dark:text-slate-400">Nenhuma Ordem de Serviço emitida.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4">
      {serviceOrders.map(os => {
        const contract = contracts.find(c => c.id === os.contractId);
        const supplier = suppliers.find(s => s.id === contract?.supplierId);
        
        return (
          <div key={os.id} className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-100 dark:border-slate-800 hover:border-blue-200 dark:hover:border-blue-800 transition-all shadow-sm">
            <div className="flex flex-col md:flex-row justify-between gap-4">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-xl flex items-center justify-center shrink-0">
                  <FileText size={24} />
                </div>
                <div>
                  <div className="flex items-center gap-3">
                    <h3 className="font-bold text-slate-800 dark:text-white text-lg">O.S. {os.number}</h3>
                    <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded ${
                      os.status === 'open' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300' :
                      os.status === 'completed' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300' :
                      'bg-red-100 text-red-700'
                    }`}>
                      {os.status === 'open' ? 'Aberta' : os.status === 'completed' ? 'Faturada' : 'Cancelada'}
                    </span>
                  </div>
                  <p className="text-slate-500 dark:text-slate-400 text-sm mt-1 flex items-center gap-1.5">
                    <Building2 size={14} />
                    {supplier?.name} (Contrato {contract?.number})
                  </p>
                  <p className="text-slate-500 dark:text-slate-400 text-sm mt-1 flex items-center gap-1.5">
                    <Calendar size={14} />
                    Emissão: {new Date(os.issueDate).toLocaleDateString()}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-6 justify-between md:justify-end border-t md:border-t-0 border-slate-100 dark:border-slate-800 pt-4 md:pt-0">
                <div className="text-right">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Valor Autorizado</p>
                  <p className="text-xl font-bold text-slate-800 dark:text-white">
                    {formatCurrency(getTotalValue(os))}
                  </p>
                </div>
                <button 
                  onClick={() => setViewOS(os)}
                  className="p-3 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-xl transition-colors"
                  title="Visualizar e Imprimir"
                >
                  <Printer size={20} />
                </button>
              </div>
            </div>
            <div className="mt-4 bg-slate-50 dark:bg-slate-950 p-3 rounded-lg text-sm text-slate-600 dark:text-slate-400 border border-slate-100 dark:border-slate-800">
              <span className="font-bold">Objeto:</span> {os.description}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default ServiceOrderList;