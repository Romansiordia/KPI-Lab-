
import React, { useState, useMemo, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { KPIs } from './components/KPIs';
import { Charts } from './components/Charts';
import { DataTable } from './components/DataTable';
import { FinancialRecord } from './types';
import { processRawData, getBackupData } from './utils/dataProcessor';
import { LayoutDashboard, Menu, X } from 'lucide-react';

const App: React.FC = () => {
  const [allData, setAllData] = useState<FinancialRecord[]>([]);
  const [filteredData, setFilteredData] = useState<FinancialRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // Initialize with backup data
  useEffect(() => {
    const data = processRawData(getBackupData());
    setAllData(data);
    setFilteredData(data);
    setIsLoading(false);
  }, []);

  const handleDataUpdate = (newData: any[]) => {
    setIsLoading(true);
    const processed = processRawData(newData);
    setAllData(processed);
    setFilteredData(processed);
    setIsLoading(false);
  };

  const handleFilterChange = (filters: {
    years: string[]; // Ahora recibe un array de años
    client: string;
    classification: string;
    months: string[];
  }) => {
    const filtered = allData.filter((item) => {
      // Si el array de años está vacío, asumimos "Todos", si no, verificamos inclusión
      const yearMatch = filters.years.length === 0 || filters.years.includes(item.año.toString());
      const clientMatch = filters.client === 'all' || item['nombre cliente'] === filters.client;
      const classMatch = filters.classification === 'all' || item.clasificacion === filters.classification;
      const monthMatch = filters.months.length === 0 || filters.months.includes(item.Fecha.toUpperCase());
      return yearMatch && clientMatch && classMatch && monthMatch;
    });
    setFilteredData(filtered);
  };

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden text-slate-900">
      {/* Sidebar con transiciones */}
      <div className={`fixed inset-y-0 left-0 z-30 transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:relative lg:translate-x-0 transition-all duration-300 ease-in-out`}>
        <Sidebar 
          allData={allData} 
          onFilterChange={handleFilterChange} 
          onDataUpload={handleDataUpdate}
          onClose={() => setIsSidebarOpen(false)}
          isOpen={isSidebarOpen}
        />
      </div>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden w-full">
        {/* Header */}
        <header className="bg-white border-b border-slate-200 px-8 py-4 flex items-center justify-between shadow-sm z-10">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-2 hover:bg-slate-100 rounded-lg transition-colors text-slate-600 lg:hidden"
            >
              <Menu size={24} />
            </button>
            <button 
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-2 hover:bg-slate-100 rounded-lg transition-colors text-slate-600 hidden lg:block"
            >
              {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
            <div className="flex items-center gap-3">
              <div className="bg-blue-600 p-2 rounded-lg">
                <LayoutDashboard className="text-white w-6 h-6" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-800">Pilar Control Laboratorio</h1>
                <p className="text-xs text-slate-500 font-medium">Panel de Rendimiento Empresarial</p>
              </div>
            </div>
          </div>
          
          <div className="hidden md:flex items-center gap-4">
            <div className="text-right">
              <span className="text-xs text-slate-400 block uppercase tracking-wider font-bold">Estado de Datos</span>
              <span className="text-sm font-semibold text-emerald-600 flex items-center gap-1">
                <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
                Dataset Activo
              </span>
            </div>
          </div>
        </header>

        {/* Dashboard Scrollable Area */}
        <div className="flex-1 overflow-y-auto p-8 space-y-8 no-scrollbar">
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <>
              {/* Top Row: KPIs */}
              <KPIs data={filteredData} />

              {/* Middle Row: Trend Charts */}
              <Charts data={filteredData} />

              {/* Bottom Row: Detailed Table */}
              <div className="w-full">
                <DataTable data={filteredData} />
              </div>
            </>
          )}
        </div>
      </main>

      {/* Overlay para móviles cuando el sidebar está abierto */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/20 z-20 lg:hidden" 
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
    </div>
  );
};

export default App;
