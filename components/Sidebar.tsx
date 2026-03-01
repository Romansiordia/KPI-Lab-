
import React, { useState, useEffect, useMemo } from 'react';
import { FinancialRecord } from '../types.ts';
import { MONTHS } from '../utils/dataProcessor.ts';
import { Filter, Upload, RotateCcw, Calendar, ChevronLeft, Search, X, Clock } from 'lucide-react';
import * as XLSX from 'xlsx';

interface SidebarProps {
  allData: FinancialRecord[];
  onFilterChange: (filters: any) => void;
  onDataUpload: (data: any[]) => void;
  onClose?: () => void;
  isOpen?: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({ allData, onFilterChange, onDataUpload, onClose, isOpen }) => {
  const [selectedYears, setSelectedYears] = useState<string[]>([]);
  const [client, setClient] = useState('all');
  const [clientSearch, setClientSearch] = useState('');
  const [classification, setClassification] = useState('all');
  const [selectedMonths, setSelectedMonths] = useState<string[]>([]);

  const years = useMemo(() => Array.from(new Set(allData.map(d => d.año))).sort((a: number, b: number) => b - a), [allData]);
  const allClients = useMemo(() => Array.from(new Set(allData.map(d => d['nombre cliente']))).sort(), [allData]);
  const classifications = useMemo(() => Array.from(new Set(allData.map(d => d.clasificacion))).filter(Boolean).sort(), [allData]);

  const filteredClients = useMemo(() => {
    if (!clientSearch.trim()) return allClients;
    return allClients.filter(c => 
      c.toLowerCase().includes(clientSearch.toLowerCase())
    );
  }, [allClients, clientSearch]);

  useEffect(() => {
    onFilterChange({ 
      years: selectedYears,
      client, 
      classification, 
      months: selectedMonths 
    });
  }, [selectedYears, client, classification, selectedMonths]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const bstr = event.target?.result;
      const wb = XLSX.read(bstr, { type: 'binary' });
      const wsname = wb.SheetNames[0];
      const ws = wb.Sheets[wsname];
      const data = XLSX.utils.sheet_to_json(ws);
      onDataUpload(data);
    };
    reader.readAsBinaryString(file);
  };

  const toggleYear = (y: string) => {
    setSelectedYears(prev => 
      prev.includes(y) ? prev.filter(year => year !== y) : [...prev, y]
    );
  };

  const toggleAllYears = () => {
    if (selectedYears.length === years.length) {
      setSelectedYears([]);
    } else {
      setSelectedYears(years.map(y => y.toString()));
    }
  };

  const toggleMonth = (m: string) => {
    setSelectedMonths(prev => 
      prev.includes(m) ? prev.filter(month => month !== m) : [...prev, m]
    );
  };

  const toggleAllMonths = () => {
    if (selectedMonths.length === MONTHS.length) {
      setSelectedMonths([]);
    } else {
      setSelectedMonths([...MONTHS]);
    }
  };

  const resetFilters = () => {
    setSelectedYears([]);
    setClient('all');
    setClientSearch('');
    setClassification('all');
    setSelectedMonths([]);
  };

  const clearSearch = () => {
    setClientSearch('');
  };

  return (
    <aside className={`w-80 bg-white border-r border-slate-200 flex flex-col h-full shadow-xl z-20 overflow-hidden transition-all duration-300`}>
      <div className="p-6 space-y-8 flex-1 overflow-y-auto no-scrollbar">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h2 className="text-xs font-bold text-slate-400 uppercase tracking-[0.2em]">Configuración</h2>
            <div className="flex items-center gap-2 text-slate-800">
              <Filter size={20} className="text-blue-600" />
              <span className="font-bold text-lg">Filtros y Datos</span>
            </div>
          </div>
          {onClose && (
            <button 
              onClick={onClose}
              className="p-2 hover:bg-slate-100 rounded-lg text-slate-400 lg:hidden"
            >
              <ChevronLeft size={20} />
            </button>
          )}
        </div>

        <div className="space-y-3">
          <label className="text-xs font-bold text-slate-500 uppercase flex items-center gap-2">
            <Upload size={14} /> Importar Datos (Excel)
          </label>
          <div className="relative group">
            <input 
              type="file" 
              accept=".xlsx,.xls,.csv" 
              onChange={handleFileUpload}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
            />
            <div className="border-2 border-dashed border-slate-200 group-hover:border-blue-400 group-hover:bg-blue-50 transition-all rounded-xl p-4 text-center">
              <span className="text-xs font-semibold text-slate-500 group-hover:text-blue-600 transition-colors">
                Arrastre archivo o haga clic
              </span>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="space-y-3">
             <div className="flex items-center justify-between">
              <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest flex items-center gap-1">
                <Clock size={10} /> Años de Análisis
              </label>
              <button 
                onClick={toggleAllYears}
                className="text-[9px] font-bold text-blue-600 hover:underline uppercase tracking-tighter"
              >
                {selectedYears.length === years.length ? 'Limpiar' : 'Seleccionar Todos'}
              </button>
            </div>
            <div className="grid grid-cols-3 gap-1.5">
              {years.map(y => {
                const yStr = y.toString();
                const isSelected = selectedYears.includes(yStr);
                return (
                  <button
                    key={y}
                    onClick={() => toggleYear(yStr)}
                    className={`py-2 px-1 text-[11px] font-bold rounded-md border transition-all truncate ${
                      isSelected 
                        ? 'bg-slate-800 border-slate-800 text-white shadow-md shadow-slate-200' 
                        : 'bg-white border-slate-100 text-slate-500 hover:border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    {y}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest flex items-center gap-1">
                <Calendar size={10} /> Selección de Meses
              </label>
              <button 
                onClick={toggleAllMonths}
                className="text-[9px] font-bold text-blue-600 hover:underline uppercase tracking-tighter"
              >
                {selectedMonths.length === MONTHS.length ? 'Limpiar' : 'Seleccionar Todos'}
              </button>
            </div>
            <div className="grid grid-cols-3 gap-1.5">
              {MONTHS.map(m => {
                const isSelected = selectedMonths.includes(m);
                return (
                  <button
                    key={m}
                    onClick={() => toggleMonth(m)}
                    className={`py-2 px-1 text-[10px] font-bold rounded-md border transition-all truncate ${
                      isSelected 
                        ? 'bg-blue-600 border-blue-600 text-white shadow-md shadow-blue-200' 
                        : 'bg-white border-slate-100 text-slate-400 hover:border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    {m.substring(0, 3)}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="space-y-3">
            <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">Filtro de Cliente</label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 group-focus-within:text-blue-500 transition-colors">
                <Search size={14} />
              </div>
              <input 
                type="text"
                placeholder="Escriba para buscar..."
                value={clientSearch}
                onChange={(e) => setClientSearch(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-8 py-2 text-xs font-medium focus:ring-2 focus:ring-blue-500 outline-none transition-all"
              />
              {clientSearch && (
                <button 
                  onClick={clearSearch}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-rose-500 transition-colors"
                >
                  <X size={14} />
                </button>
              )}
            </div>
            <select 
              value={client} 
              onChange={(e) => setClient(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 text-sm font-medium focus:ring-2 focus:ring-blue-500 outline-none transition-all"
            >
              <option value="all">Consolidado (Ver Todos)</option>
              {filteredClients.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">Clasificación</label>
            <select 
              value={classification} 
              onChange={(e) => setClassification(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 text-sm font-medium focus:ring-2 focus:ring-blue-500 outline-none transition-all"
            >
              <option value="all">Todas las categorías</option>
              {classifications.map(c => <option key={c} value={c}>Clase {c}</option>)}
            </select>
          </div>
        </div>
      </div>

      <div className="p-6 border-t border-slate-100 bg-slate-50">
        <button 
          onClick={resetFilters}
          className="w-full flex items-center justify-center gap-2 bg-slate-800 text-white p-3 rounded-xl font-bold text-sm hover:bg-slate-900 transition-all shadow-lg active:scale-95"
        >
          <RotateCcw size={16} />
          Limpiar Filtros
        </button>
      </div>
    </aside>
  );
};