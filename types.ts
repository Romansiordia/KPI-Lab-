
export interface FinancialRecord {
  Fecha: string;
  año: number;
  clasificacion: string;
  'nombre cliente': string;
  TON: number;
  'TURN OVER': number;
  GM: number;
  GP: number;
  'inversion analisis lab': number;
  'Inversion Nir': number;
  'Inversion equipos Micotoxinas': number;
  '% Inversion Lab': number;
  totalInversion?: number;
  scoreS?: number; // Representa el valor directo de la Columna S
  ratioReal?: number;
  date?: Date;
}

export interface SummaryStats {
  totalTons: number;
  totalGM: number;
  totalGP: number;
  totalInvestment: number;
  globalRatio: number;
  realRatio: number; // Ratio only for clients with > 0 investment
}

export interface ChartDataPoint {
  month: string;
  gp: number;
  investment: number;
  tons: number;
}
