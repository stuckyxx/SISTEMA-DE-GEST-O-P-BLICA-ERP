 import React from 'react';
 import { Printer } from 'lucide-react';
 import { ServiceOrder, AppState } from '../../../types';
 
 interface ServiceOrderPrintProps {
   viewOS: ServiceOrder;
   setViewOS: (os: ServiceOrder | null) => void;
   state: AppState;
   getTotalValue: (os: ServiceOrder) => number;
   printOS: () => void;
 }
 
 const ServiceOrderPrint: React.FC<ServiceOrderPrintProps> = ({
   viewOS,
   setViewOS,
   state,
   getTotalValue,
   printOS
 }) => {
   return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white text-black w-full max-w-[210mm] h-[90vh] overflow-y-auto rounded-sm shadow-2xl relative flex flex-col">
        {/* Toolbar fixa no topo do modal */}
        <div className="sticky top-0 bg-slate-800 text-white p-4 flex justify-between items-center print:hidden z-10">
          <span className="font-bold flex items-center gap-2"><Printer size={18} /> Visualização de Impressão</span>
          <div className="flex gap-3">
            <button onClick={printOS} className="bg-blue-500 hover:bg-blue-600 px-4 py-2 rounded font-bold text-sm">Imprimir / PDF</button>
            <button onClick={() => setViewOS(null)} className="bg-slate-700 hover:bg-slate-600 px-4 py-2 rounded font-bold text-sm">Fechar</button>
          </div>
        </div>

        {/* Documento A4 */}
        <div className="p-[15mm] space-y-8 print:p-0 print:space-y-6 flex-1 bg-white text-black">
          {/* Cabeçalho */}
          <div className="flex gap-4 items-center border-b-2 border-black pb-4">
            <div className="w-20 h-20 bg-gray-100 flex items-center justify-center font-bold text-xs text-center p-2 border border-black uppercase">
              LOGOTIPO
            </div>
            <div className="flex-1 text-center">
              <h1 className="font-bold text-xl uppercase">{state.entity.name}</h1>
              <p className="text-sm">{state.entity.secretary}</p>
              <p className="text-xs mt-1">CNPJ: {state.entity.cnpj}</p>
              <p className="text-[10px] mt-0.5 text-gray-500">{state.entity.address} - {state.entity.city}/{state.entity.state}</p>
            </div>
            <div className="w-24 text-right">
              <p className="font-bold text-lg">O.S.</p>
              <p className="text-xl font-black">{viewOS.number}</p>
            </div>
          </div>

          {/* Título */}
          <div className="text-center py-2 bg-gray-100 border border-black font-bold uppercase tracking-wider">
            Ordem de Serviço / Autorização de Fornecimento
          </div>

          {/* Dados */}
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="border border-black p-3 space-y-1">
              <p className="font-bold border-b border-gray-300 mb-2 pb-1">DADOS DO CONTRATO</p>
              <p><span className="font-bold">Contrato Nº:</span> {state.contracts.find(c => c.id === viewOS.contractId)?.number}</p>
              <p><span className="font-bold">Fornecedor:</span> {state.suppliers.find(s => s.id === state.contracts.find(c => c.id === viewOS.contractId)?.supplierId)?.name}</p>
              <p><span className="font-bold">CNPJ:</span> {state.suppliers.find(s => s.id === state.contracts.find(c => c.id === viewOS.contractId)?.supplierId)?.cnpj}</p>
            </div>
            <div className="border border-black p-3 space-y-1">
              <p className="font-bold border-b border-gray-300 mb-2 pb-1">DADOS DA ORDEM</p>
              <p><span className="font-bold">Data Emissão:</span> {new Date(viewOS.issueDate).toLocaleDateString()}</p>
              <p><span className="font-bold">Local de Entrega:</span> {state.entity.address}</p>
              <p><span className="font-bold">Status:</span> EMITIDA</p>
            </div>
          </div>

          <div className="border border-black p-3 text-sm min-h-[80px]">
            <p className="font-bold mb-1">DESCRIÇÃO DA SOLICITAÇÃO:</p>
            <p>{viewOS.description}</p>
          </div>

          {/* Itens */}
          <div className="mt-4">
            <p className="font-bold text-sm mb-2">ITENS AUTORIZADOS:</p>
            <table className="w-full border-collapse border border-black text-sm">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border border-black p-2 w-10">Item</th>
                  <th className="border border-black p-2 text-left">Descrição</th>
                  <th className="border border-black p-2 w-16">Unid</th>
                  <th className="border border-black p-2 w-20">Qtd</th>
                  <th className="border border-black p-2 w-24">Vl. Unit</th>
                  <th className="border border-black p-2 w-24">Vl. Total</th>
                </tr>
              </thead>
              <tbody>
                {viewOS.items.map((item, idx) => {
                  const contractItem = state.contracts.find(c => c.id === viewOS.contractId)?.items.find(i => i.id === item.contractItemId);
                  return (
                    <tr key={idx}>
                      <td className="border border-black p-2 text-center">{idx + 1}</td>
                      <td className="border border-black p-2">{contractItem?.description}</td>
                      <td className="border border-black p-2 text-center">{contractItem?.unit}</td>
                      <td className="border border-black p-2 text-center">{item.quantity}</td>
                      <td className="border border-black p-2 text-right">{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(item.unitPrice)}</td>
                      <td className="border border-black p-2 text-right">{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(item.total)}</td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot>
                <tr className="bg-gray-100 font-bold">
                  <td colSpan={5} className="border border-black p-2 text-right">TOTAL GERAL</td>
                  <td className="border border-black p-2 text-right">{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(getTotalValue(viewOS))}</td>
                </tr>
              </tfoot>
            </table>
          </div>

          {/* Assinaturas */}
          <div className="grid grid-cols-2 gap-16 mt-20 pt-10 text-center text-sm">
            <div className="border-t border-black pt-2">
              <p className="font-bold">Gestor do Contrato</p>
              <p>{state.entity.secretary}</p>
            </div>
            <div className="border-t border-black pt-2">
              <p className="font-bold">Recebido por (Fornecedor)</p>
              <p>Data: ____/____/______</p>
            </div>
          </div>
        </div>
      </div>
    </div>
   );
 };
 
 export default ServiceOrderPrint;