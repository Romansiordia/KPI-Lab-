import React, { useState, useMemo, useEffect } from 'react';
import { Sidebar } from './components/Sidebar.tsx';
import { KPIs } from './components/KPIs.tsx';
import { Charts } from './components/Charts.tsx';
import { DataTable } from './components/DataTable.tsx';
import { Login } from './components/Login.tsx';
import { FinancialRecord } from './types.ts';
import { User } from './services/authService.ts';
import { processRawData, getBackupData } from './utils/dataProcessor.ts';
import { LayoutDashboard, Menu, X, LogOut } from 'lucide-react';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [allData, setAllData] = useState<FinancialRecord[]>([]);
  const [filteredData, setFilteredData] = useState<FinancialRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // Cargar sesión si existe
  useEffect(() => {
    const savedUser = localStorage.getItem('lab_user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  const handleLoginSuccess = (userData: User) => {
    setUser(userData);
    localStorage.setItem('lab_user', JSON.stringify(userData));
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('lab_user');
  };

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
    years: string[];
    client: string;
    classification: string;
    months: string[];
  }) => {
    const filtered = allData.filter((item) => {
      const yearMatch = filters.years.length === 0 || filters.years.includes(item.año.toString());
      const clientMatch = filters.client === 'all' || item['nombre cliente'] === filters.client;
      const classMatch = filters.classification === 'all' || item.clasificacion === filters.classification;
      const monthMatch = filters.months.length === 0 || filters.months.includes(item.Fecha.toUpperCase());
      return yearMatch && clientMatch && classMatch && monthMatch;
    });
    setFilteredData(filtered);
  };

  if (!user) {
    return <Login onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden text-slate-900">
      <div className={`fixed inset-y-0 left-0 z-30 transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:relative lg:translate-x-0 transition-all duration-300 ease-in-out`}>
        <Sidebar 
          allData={allData} 
          onFilterChange={handleFilterChange} 
          onDataUpload={handleDataUpdate}
          onClose={() => setIsSidebarOpen(false)}
          isOpen={isSidebarOpen}
        />
      </div>

      <main className="flex-1 flex flex-col overflow-hidden w-full">
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
                <h1 className="text-[22px] font-bold text-slate-800 leading-tight">Pilar Control Laboratorio</h1>
                <p className="text-xs text-slate-500 font-medium">Panel de Rendimiento Empresarial</p>
              </div>
            </div>
          </div>
          
          <div className="hidden md:flex items-center gap-6">
            <div className="text-right">
              <span className="text-xs text-slate-400 block uppercase tracking-wider font-bold">Usuario</span>
              <span className="text-sm font-semibold text-slate-600 flex items-center gap-1">
                {user.username}
              </span>
            </div>
            <button 
              onClick={handleLogout}
              className="p-2 hover:bg-rose-50 text-rose-500 rounded-lg transition-colors flex items-center gap-2 text-sm font-bold"
              title="Cerrar Sesión"
            >
              <LogOut size={20} />
              <span className="hidden xl:inline">Salir</span>
            </button>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-8 space-y-8 no-scrollbar">
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <>
              <KPIs data={filteredData} />
              
              <div className="w-full">
                <Charts data={filteredData} />
              </div>

              <div className="w-full">
                <DataTable data={filteredData} />
              </div>
            </>
          )}
        </div>
      </main>

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