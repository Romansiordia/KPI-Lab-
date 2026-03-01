
import React from 'react';
import { FinancialRecord } from '../types.ts';
import { Weight, DollarSign, TrendingUp, FlaskConical, Target, Activity } from 'lucide-react';

interface KPIsProps {
  data: FinancialRecord[];
}

export const KPIs: React.FC<KPIsProps> = ({ data }) => {
  const sumAll = (key: keyof FinancialRecord) => 
    data.reduce((acc, curr) => {
      const val = curr[key];
      return acc + (typeof val === 'number' ? val : 0);
    }, 0);

  const totalTons = sumAll('TON');
  const totalTurnover = sumAll('TURN OVER');
  const totalGM = sumAll('GM');
  const totalGP = sumAll('GP');
  const totalInv = sumAll('totalInversion');

  const globalRatio = totalGP !== 0 ? (totalInv / totalGP) * 100 : 0;

  const formatAdjustedPrecision = (val: number) => {
    const absVal = Math.abs(val);
    if (absVal >= 1000000) {
      return `$${(val / 1000000).toLocaleString(undefined, { minimumFractionDigits: 3, maximumFractionDigits: 3 })}M`;
    }
    if (absVal >= 1000) {
      return `$${(val / 1000).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}k`;
    }
    return `$${val.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const kpiList = [
    { label: 'Ton. Métricas', value: Math.round(totalTons).toLocaleString(), sub: 'Volumen Bruto (TON)', icon: Weight, color: 'bg-amber-500' },
    { label: 'Turn Over', value: formatAdjustedPrecision(totalTurnover), sub: 'Ventas Totales (Col H)', icon: Activity, color: 'bg-cyan-600' },
    { label: 'Margen Bruto', value: formatAdjustedPrecision(totalGM), sub: 'Total Columna J (GM)', icon: DollarSign, color: 'bg-emerald-500' },
    { label: 'Utilidad Bruta', value: formatAdjustedPrecision(totalGP), sub: 'Total Columna L (GP)', icon: TrendingUp, color: 'bg-blue-600' },
    { label: 'Inversión Lab', value: formatAdjustedPrecision(totalInv), sub: 'Total Columna Q (INV)', icon: FlaskConical, color: 'bg-violet-600' },
    { label: 'Índice Real', value: globalRatio.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + '%', sub: 'Ratio Global (Q/L)*100', icon: Target, color: 'bg-teal-600' },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {kpiList.map((kpi, idx) => (
        <div key={idx} className={`${kpi.color} p-5 rounded-2xl shadow-xl shadow-slate-200/50 text-white flex flex-col justify-between transform hover:-translate-y-1 transition-all duration-300`}>
          <div className="flex justify-between items-start mb-4">
            <div className="p-2 bg-white/20 rounded-xl">
              <kpi.icon size={20} />
            </div>
            <span className="text-[10px] font-bold uppercase tracking-widest opacity-70">
              {kpi.sub}
            </span>
          </div>
          <div>
            <p className="text-2xl font-extrabold tracking-tight leading-none mb-1">{kpi.value}</p>
            <h3 className="text-xs font-semibold opacity-90">{kpi.label}</h3>
          </div>
        </div>
      ))}
    </div>
  );
};