
import React from 'react';
import { FinancialRecord } from '../types.ts';
import { AlertCircle, TrendingUp, DollarSign } from 'lucide-react';

interface DataTableProps {
  data: FinancialRecord[];
}

export const DataTable: React.FC<DataTableProps> = ({ data }) => {
  const clientGroups = data.reduce((acc, curr) => {
    const name = curr['nombre cliente'];
    if (!acc[name]) acc[name] = { gm: 0, gp: 0, inv: 0 };
    acc[name].gm += curr.GM;
    acc[name].gp += curr.GP;
    acc[name].inv += (curr.totalInversion || 0);
    return acc;
  }, {} as Record<string, { gm: number; gp: number; inv: number }>);

  const riskClients = Object.keys(clientGroups).map(name => {
    const group = clientGroups[name];
    const ratio = group.gp > 0 ? (group.inv / group.gp) * 100 : 0;
    return { name, ...group, ratio };
  }).sort((a, b) => b.ratio - a.ratio);

  const highRisk = riskClients.filter(c => c.ratio > 8);
  const displayClients = riskClients.length > 0 ? riskClients : [];

  return (
    <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden flex flex-col h-full">
      <div className="p-6 border-b border-slate-50 flex items-center justify-between bg-slate-50/50">
        <div className="flex items-center gap-3">
          <div className="bg-blue-100 p-2 rounded-lg text-blue-600">
            <DollarSign size={20} />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-800">Desglose de Rentabilidad por Cliente</h3>
            <p className="text-xs text-slate-500 font-medium">Análisis detallado de GM (Col J) y GP (Col L)</p>
          </div>
        </div>
        <div className="flex gap-2">
          {highRisk.length > 0 && (
            <span className="bg-rose-50 text-rose-700 px-3 py-1 rounded-full text-xs font-bold border border-rose-100 flex items-center gap-1">
              <AlertCircle size={12} /> {highRisk.length} Ratios Altos
            </span>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-auto max-h-[500px]">
        <table className="w-full text-left border-collapse">
          <thead className="sticky top-0 bg-white shadow-sm z-10">
            <tr>
              <th className="px-6 py-4 text-[10px] font-extrabold text-slate-400 uppercase tracking-widest border-b border-slate-50">Cliente</th>
              <th className="px-6 py-4 text-[10px] font-extrabold text-slate-400 uppercase tracking-widest border-b border-slate-50 text-right">Margen Bruto (GM)</th>
              <th className="px-6 py-4 text-[10px] font-extrabold text-slate-400 uppercase tracking-widest border-b border-slate-50 text-right">Utilidad Bruta (GP)</th>
              <th className="px-6 py-4 text-[10px] font-extrabold text-slate-400 uppercase tracking-widest border-b border-slate-50 text-right">Inv. Lab (Q)</th>
              <th className="px-6 py-4 text-[10px] font-extrabold text-slate-400 uppercase tracking-widest border-b border-slate-50 text-center">Ratio % (Q/L)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {displayClients.length > 0 ? (
              displayClients.map((client, idx) => {
                const isHighRisk = client.ratio > 8;
                return (
                  <tr key={idx} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-6 py-4 text-sm font-bold text-slate-700 group-hover:text-blue-600">{client.name}</td>
                    <td className="px-6 py-4 text-sm font-bold text-emerald-600 text-right">${Math.round(client.gm).toLocaleString()}</td>
                    <td className="px-6 py-4 text-sm font-medium text-slate-600 text-right">${Math.round(client.gp).toLocaleString()}</td>
                    <td className="px-6 py-4 text-sm font-medium text-slate-600 text-right">${Math.round(client.inv).toLocaleString()}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-2">
                        <span className={`text-sm font-bold ${isHighRisk ? 'text-rose-600' : 'text-slate-500'}`}>{client.ratio.toFixed(4)}%</span>
                        {isHighRisk && <TrendingUp size={14} className="text-rose-400" />}
                      </div>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-slate-400 text-sm font-medium italic">No hay datos disponibles para la selección actual.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};