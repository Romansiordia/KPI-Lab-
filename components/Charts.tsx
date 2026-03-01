
import React, { useMemo } from 'react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  BarChart, Bar, Legend, Cell, PieChart, Pie, LabelList, ReferenceLine, Label
} from 'recharts';
import { FinancialRecord } from '../types.ts';
import { MONTHS } from '../utils/dataProcessor.ts';

interface ChartsProps {data: FinancialRecord[];}

export const Charts: React.FC<ChartsProps> = ({ data }) => {
  // 1. Tendencia Mensual
  const trendData = useMemo(() => {
    return MONTHS.map(m => {
      const recordsInMonth = data.filter(d => d.Fecha.toUpperCase() === m);
      return {
        month: m.substring(0, 3),
        gp: recordsInMonth.reduce((acc, curr) => acc + curr.GP, 0),
        labInv: recordsInMonth.reduce((acc, curr) => acc + (curr.totalInversion || 0), 0),
        ton: recordsInMonth.reduce((acc, curr) => acc + curr.TON, 0),
      };
    }).filter(d => d.gp !== 0 || d.labInv !== 0 || d.ton !== 0);
  }, [data]);

  // Promedio inversión mensual
  const avgLabInv = useMemo(() => {
    if (trendData.length === 0) return 0;
    const total = trendData.reduce((acc, curr) => acc + curr.labInv, 0);
    return total / trendData.length;
  }, [trendData]);

  // 2. Distribución de Inversión
  const distributionData = useMemo(() => {
    const lab = data.reduce((acc, curr) => acc + curr['inversion analisis lab'], 0);
    const nir = data.reduce((acc, curr) => acc + curr['Inversion Nir'], 0);
    const mico = data.reduce((acc, curr) => acc + curr['Inversion equipos Micotoxinas'], 0);
    return [
      { name: 'Lab Análisis', value: lab, color: '#3b82f6' },
      { name: 'NIR', value: nir, color: '#10b981' },
      { name: 'Micotoxinas', value: mico, color: '#f59e0b' }
    ].filter(d => d.value > 0);
  }, [data]);

  // 3. Ratios por Cliente
  const riskData = useMemo(() => {
    const clientGroups = data.reduce((acc, curr) => {
      const name = curr['nombre cliente'];
      if (!acc[name]) acc[name] = { gp: 0, inv: 0 };
      const group = acc[name]!;
      group.gp += curr.GP;
      group.inv += (curr.totalInversion || 0);
      return acc;
    }, {} as Record<string, { gp: number; inv: number }>);

    return Object.keys(clientGroups)
      .map(name => {
        const group = clientGroups[name]!;
        const rawRatio = group.gp !== 0 ? (group.inv / group.gp) * 100 : 0;
        return { name, ratio: rawRatio, rawRatio };
      })
      .sort((a, b) => b.ratio - a.ratio)
      .slice(0, 10);
  }, [data]);

  // 4. Top 10 Clientes por GP
  const topGPData = useMemo(() => {
    const clientGroups = data.reduce((acc, curr) => {
      const name = curr['nombre cliente'];
      if (acc[name] === undefined) acc[name] = 0;
      acc[name] = (acc[name] as number) + curr.GP;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(clientGroups)
      .map(([name, gp]) => ({ name, gp: gp as number }))
      .sort((a, b) => (b.gp as number) - (a.gp as number))
      .slice(0, 10);
  }, [data]);

  // 5. Inversión por Clasificación
  const classificationData = useMemo(() => {
    const groups: Record<string, { total: number; count: number }> = {};
    data.forEach(item => {
      const cls = item.clasificacion || 'N/A';
      const inv = item.totalInversion || 0;
      if (!groups[cls]) groups[cls] = { total: 0, count: 0 };
      
      const group = groups[cls]!;
      group.total += inv;
      if (inv > 0) {
        group.count += 1;
      }
    });

    return Object.entries(groups).map(([name, stats]) => ({
      name: `Clase ${name}`,
      avg: stats.count > 0 ? stats.total / stats.count : 0
    })).sort((a, b) => a.name.localeCompare(b.name));
  }, [data]);

  // Conteo de clientes únicos por categoría y total global
  const { categoryCounts, totalUniqueClients } = useMemo(() => {
    const counts: Record<string, Set<string>> = {};
    const allUniqueClients = new Set<string>();

    data.forEach(item => {
      const cls = item.clasificacion || 'N/A';
      const client = item['nombre cliente'];
      if (!counts[cls]) counts[cls] = new Set();
      counts[cls].add(client);
      allUniqueClients.add(client);
    });

    const categoryCountsArray = Object.entries(counts).map(([name, clients]) => ({
      name: `Clase ${name}`,
      count: clients.size
    })).sort((a, b) => a.name.localeCompare(b.name));

    return {
      categoryCounts: categoryCountsArray,
      totalUniqueClients: allUniqueClients.size
    };
  }, [data]);

  const formatCurrency = (value: number) => `$${value.toLocaleString(undefined, {minimumFractionDigits: 0, maximumFractionDigits: 0})}`;

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 gap-8">
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 h-[380px] flex flex-col">
          <h3 className="text-sm font-bold text-slate-800 mb-6 flex items-center gap-2">
            <span className="w-2 h-2 bg-blue-600 rounded-full"></span>
            Utilidad Bruta Mensual (GP)
          </h3>
          <div className="flex-1">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData}>
                <defs>
                  <linearGradient id="colorGp" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563eb" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#94a3b8'}} />
                <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#94a3b8'}} tickFormatter={(v) => `$${Math.round(v/1000)}k`} />
                <Tooltip formatter={(value: any) => [formatCurrency(Number(value || 0)), "GP"]} />
                <Area type="monotone" dataKey="gp" stroke="#2563eb" strokeWidth={3} fill="url(#colorGp)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8">
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 h-[380px] flex flex-col">
          <h3 className="text-sm font-bold text-slate-800 mb-6 flex items-center gap-2">
            <span className="w-2 h-2 bg-violet-500 rounded-full"></span>
            Inversión Total por Mes (Q)
          </h3>
          <div className="flex-1">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={trendData} margin={{ left: 10, right: 10 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#94a3b8'}} />
                <YAxis 
                  axisLine={true} 
                  tickLine={true} 
                  tick={{fontSize: 10, fill: '#64748b'}} 
                  width={60}
                  domain={[0, 'auto']}
                  tickFormatter={(v) => v >= 1000 ? `$${(v/1000).toFixed(1)}k` : `$${v}`}
                />
                <Tooltip formatter={(value: any) => [formatCurrency(Number(value || 0)), "Inversión Mensual"]} />
                <Bar dataKey="labInv" fill="#8b5cf6" radius={[6, 6, 0, 0]} barSize={35} />
                {avgLabInv > 0 && (
                  <ReferenceLine y={avgLabInv} stroke="#4f46e5" strokeDasharray="5 5" strokeWidth={2}>
                    <Label value={`PROM: ${formatCurrency(avgLabInv)}`} position="top" fill="#4f46e5" style={{ fontSize: 11, fontWeight: '800', backgroundColor: 'white' }} />
                  </ReferenceLine>
                )}
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 h-[380px] flex flex-col relative overflow-hidden">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
              <span className="w-2 h-2 bg-amber-500 rounded-full"></span>
              Distribución de Cartera por Clasificación
            </h3>
            <div className="bg-amber-50 border border-amber-100 px-3 py-1.5 rounded-2xl flex flex-col items-center justify-center min-w-[80px]">
              <span className="text-[10px] font-extrabold text-amber-600 uppercase leading-none mb-0.5">Total Clientes</span>
              <span className="text-lg font-black text-amber-700 leading-none">{totalUniqueClients}</span>
            </div>
          </div>
          <div className="flex-1">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categoryCounts} layout="vertical" margin={{ left: 20, right: 40 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#f1f5f9" />
                <XAxis type="number" hide />
                <YAxis dataKey="name" type="category" width={80} tick={{fontSize: 11, fill: '#64748b'}} axisLine={false} tickLine={false} />
                <Tooltip />
                <Bar dataKey="count" fill="#f59e0b" radius={[0, 8, 8, 0]} barSize={35}>
                  <LabelList dataKey="count" position="right" style={{fontSize: 11, fill: '#d97706', fontWeight: 'bold'}} />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 h-[380px] flex flex-col">
          <h3 className="text-sm font-bold text-slate-800 mb-6 flex items-center gap-2">
            <span className="w-2 h-2 bg-indigo-500 rounded-full"></span>
            Inversión Promedio por Clase (Q)
          </h3>
          <div className="flex-1">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={classificationData} margin={{ top: 20 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 11, fill: '#64748b'}} />
                <YAxis hide />
                <Tooltip formatter={(v: any) => formatCurrency(Number(v || 0))} />
                <Bar dataKey="avg" fill="#6366f1" radius={[8, 8, 0, 0]} barSize={45}>
                  <LabelList dataKey="avg" position="top" formatter={(v: any) => `$${Math.round(Number(v || 0)/1000)}k`} style={{fontSize: 10, fill: '#6366f1', fontWeight: 'bold'}} />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8">
         <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 h-[380px] flex flex-col">
          <h3 className="text-sm font-bold text-slate-800 mb-6 flex items-center gap-2">
            <span className="w-2 h-2 bg-emerald-500 rounded-full"></span>
            Desglose de Activos de Inversión
          </h3>
          <div className="flex-1">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={distributionData} cx="50%" cy="45%" innerRadius={60} outerRadius={85} paddingAngle={5} dataKey="value" label={({ name, percent }: any) => `${name}: ${((percent || 0) * 100).toFixed(0)}%`}>
                  {distributionData.map((entry, index) => <Cell key={index} fill={entry.color} />)}
                </Pie>
                <Tooltip formatter={(v: any) => formatCurrency(Number(v || 0))} />
                <Legend verticalAlign="bottom" iconType="circle" />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 h-[450px] flex flex-col">
          <h3 className="text-sm font-bold text-slate-800 mb-6 flex items-center gap-2">
            <span className="w-2 h-2 bg-rose-500 rounded-full"></span>
            Ratio de Inversión por Cliente (% Utilidad)
          </h3>
          <div className="flex-1">
            {riskData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={riskData} layout="vertical" margin={{ left: 30, right: 40 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#f1f5f9" />
                  <XAxis type="number" hide />
                  <YAxis dataKey="name" type="category" width={120} tick={{fontSize: 9, fill: '#64748b'}} axisLine={false} tickLine={false} />
                  <Tooltip formatter={(v: any) => [`${Number(v || 0).toFixed(2)}%`, "Ratio"]} />
                  <Bar dataKey="ratio" radius={[0, 4, 4, 0]} barSize={15}>
                    {riskData.map((entry, index) => <Cell key={index} fill={entry.rawRatio > 8 ? '#f43f5e' : '#cbd5e1'} />)}
                    <LabelList dataKey="ratio" position="right" formatter={(v: any) => `${Number(v || 0).toFixed(2)}%`} style={{fontSize: 9, fill: '#64748b', fontWeight: 'bold'}} />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full items-center justify-center text-slate-400 italic text-sm">Sin datos para mostrar.</div>
            )}
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 h-[450px] flex flex-col">
          <h3 className="text-sm font-bold text-slate-800 mb-6 flex items-center gap-2">
            <span className="w-2 h-2 bg-emerald-600 rounded-full"></span>
            Top 10 Clientes por Utilidad Bruta (GP)
          </h3>
          <div className="flex-1">
            {topGPData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={topGPData} layout="vertical" margin={{ left: 30, right: 60 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#f1f5f9" />
                  <XAxis type="number" hide />
                  <YAxis dataKey="name" type="category" width={120} tick={{fontSize: 9, fill: '#64748b'}} axisLine={false} tickLine={false} />
                  <Tooltip formatter={(v: any) => [formatCurrency(Number(v || 0)), "Utilidad Bruta"]} />
                  <Bar dataKey="gp" fill="#059669" radius={[0, 4, 4, 0]} barSize={15}>
                    <LabelList dataKey="gp" position="right" formatter={(v: any) => `$${Math.round(Number(v || 0)/1000)}k`} style={{fontSize: 9, fill: '#059669', fontWeight: 'bold'}} />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full items-center justify-center text-slate-400 italic text-sm">Sin datos para mostrar.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};