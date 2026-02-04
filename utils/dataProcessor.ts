
import { FinancialRecord } from '../types';

export const MONTHS = [
  'ENERO', 'FEBRERO', 'MARZO', 'ABRIL', 'MAYO', 'JUNIO', 
  'JULIO', 'AGOSTO', 'SEPTIEMBRE', 'OCTUBRE', 'NOVIEMBRE', 'DICIEMBRE'
];

function excelDateToJSDate(serial: number) {
  return new Date(Math.round((serial - 25569) * 86400 * 1000));
}

export const processRawData = (data: any[]): FinancialRecord[] => {
  return data.map((row, index) => {
    const findKey = (r: any, searches: string[]) => {
      const key = Object.keys(r).find(k => 
        searches.some(s => k.toLowerCase().trim() === s.toLowerCase().trim())
      );
      return key ? r[key] : undefined;
    };

    const parseNum = (val: any) => {
      if (typeof val === 'number') return val;
      if (!val) return 0;
      const clean = String(val).replace(/[$,]/g, "").trim();
      return parseFloat(clean) || 0;
    };

    // Intentar obtener año, si no existe usar el actual
    const añoDetectado = parseNum(findKey(row, ['año', 'year', 'ejercicio']));
    const año = añoDetectado > 1900 ? añoDetectado : new Date().getFullYear();
    
    // Procesar Fecha/Mes con resiliencia total
    let rawFecha = findKey(row, ['Fecha', 'Month', 'Mes']);
    let dateObj: Date = new Date(año, 0, 1);

    if (typeof rawFecha === 'number') {
      dateObj = excelDateToJSDate(rawFecha);
    } else if (typeof rawFecha === 'string') {
      const cleanMonth = rawFecha.trim().toUpperCase();
      const idx = MONTHS.indexOf(cleanMonth);
      if (idx !== -1) {
        dateObj = new Date(año, idx, 1);
      } else {
        const parsedDate = new Date(rawFecha);
        if (!isNaN(parsedDate.getTime())) dateObj = parsedDate;
      }
    }

    // Columnas Core
    const gm = parseNum(findKey(row, ['GM', 'Margen Bruto', 'MargenBruto', 'M Bruto'])); // Col J
    const gp = parseNum(findKey(row, ['GP', 'Utilidad Bruta', 'UtilidadBruta', 'U Bruta'])); // Col L
    const ton = parseNum(findKey(row, ['TON', 'Toneladas', 'Volume']));
    const turnover = parseNum(findKey(row, ['TURN OVER', 'Ventas', 'Ingresos', 'Turnover']));
    
    // Inversión (Columna Q y desglose M, N, O)
    const explicitQ = parseNum(findKey(row, ['TOTAL INVERSION LAB', 'TOTAL INVERSION', 'Inversion Total', 'INV TOTAL']));
    const labInv = parseNum(findKey(row, ['inversion analisis lab', 'Lab Inv', 'Analisis Lab']));
    const nirInv = parseNum(findKey(row, ['Inversion Nir', 'NIR Inv', 'Equipos NIR']));
    const micoInv = parseNum(findKey(row, ['Inversion equipos Micotoxinas', 'Mico Inv', 'Equipos Mico']));
    
    // Si Q es cero, recalculamos sumando las partes para no perder datos
    const totalInv = explicitQ !== 0 ? explicitQ : (labInv + nirInv + micoInv);

    return {
      Fecha: MONTHS[dateObj.getMonth()],
      año: dateObj.getFullYear(),
      clasificacion: String(findKey(row, ['clasificacion', 'clase', 'cat']) || 'N/A').toUpperCase().trim(),
      'nombre cliente': String(findKey(row, ['nombre cliente', 'cliente', 'customer']) || 'SIN NOMBRE').trim(),
      TON: ton,
      'TURN OVER': turnover,
      GM: gm,
      GP: gp,
      'inversion analisis lab': labInv,
      'Inversion Nir': nirInv,
      'Inversion equipos Micotoxinas': micoInv,
      totalInversion: totalInv,
      scoreS: parseNum(findKey(row, ['% Inversion Lab', 'Ratio', 'Score'])), 
      '% Inversion Lab': gp !== 0 ? (totalInv / gp) : 0,
      date: dateObj
    };
  }); // Eliminado el .filter(null) para procesar el 100% de las filas
};

export const getBackupData = () => [
  { "Fecha": "ENERO", "año": 2024, "clasificacion": "A", "nombre cliente": "ALEJANDRO BAILLE CALDERON", "TON": 30505, "TURN OVER": 1446891, "GM": 555980.456, "GP": 550000.123, "inversion analisis lab": 10000, "Inversion Nir": 5000, "Inversion equipos Micotoxinas": 2000, "TOTAL INVERSION LAB": 17000 },
  { "Fecha": "FEBRERO", "año": 2024, "clasificacion": "A", "nombre cliente": "ALEJANDRO BAILLE CALDERON", "TON": 53125, "TURN OVER": 1486740, "GM": 560024.889, "GP": 555000.333, "inversion analisis lab": 11000, "Inversion Nir": 5500, "Inversion equipos Micotoxinas": 2100, "TOTAL INVERSION LAB": 18600 },
  { "Fecha": "MARZO", "año": 2024, "clasificacion": "B", "nombre cliente": "SOCORRO ROMERO SANCHEZ", "TON": 50192, "TURN OVER": 3079840, "GM": 1184307.221, "GP": 1180000.555, "inversion analisis lab": 80000, "Inversion Nir": 15000, "Inversion equipos Micotoxinas": 10000, "TOTAL INVERSION LAB": 105000 }
];
