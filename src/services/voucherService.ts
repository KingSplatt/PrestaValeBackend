// Constantes para cálculo de fechas
const DAY_MAX = 15;
const DAY_LIMIT = 14;
const DAYMONT = 30;

const DAY_IN_MS = 24 * 60 * 60 * 1000; // Milisegundos en un día

export const REGLAS_COMISION = {
  DEFAULT: { 
    15: 18, 16: 17, 17: 16, 18: 14, 19: 10, 20: 5
  },
  PREMIUM: {
    15: 20, 16: 19, 17: 17, 18: 14, 19: 10, 20: 5
  }
};

export const obtenerSchemaComisionPorId = (configId: number): { [key: number]: number } => {
  return configId === 2 ? REGLAS_COMISION.PREMIUM : REGLAS_COMISION.DEFAULT;
};

export const obtenerPorcentajePorEsquema = (shema: { [key: number]: number }, fechaPago: Date, fechaVencimiento: Date): number => {
    const diasTranscurridos = calcularDiasTranscurridos(fechaVencimiento, fechaPago);
    let diaPertence = DAYMONT - diasTranscurridos;
    console.log('Días transcurridos:', diasTranscurridos, 'Día pertenece:', diaPertence);
    if (diaPertence < 15) diaPertence = 15;
    return shema[diaPertence] || 0;
};

export function calcularFechaVencimiento(fechaCreacion: Date): Date {
    const day = fechaCreacion.getDate();
    const month = fechaCreacion.getMonth();
    const year = fechaCreacion.getFullYear();

    return (day <= DAY_LIMIT) ? new Date(year, month, DAY_MAX) : new Date(year, month + 1, DAY_MAX);
}

export function calcularDiasTranscurridos(fechaInicio: Date, fechaFin: Date = new Date()): number {
    const diffTime = Math.abs(fechaFin.getTime() - fechaInicio.getTime());
    return Math.ceil(diffTime / (DAY_IN_MS));
}

export function calcularMontoPagar(totalVale: number, porcentajeComision: number): number {
    const comision = (totalVale * porcentajeComision) / 100;
    return totalVale - comision;
}
