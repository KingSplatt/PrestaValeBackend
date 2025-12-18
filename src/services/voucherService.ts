// Constantes para cálculo de fechas
const DAY_MAX = 15;
const DAY_LIMIT = 14;

const DAY_IN_MS = 24 * 60 * 60 * 1000; // Milisegundos en un día

export const REGLAS_COMISION = {
  DEFAULT: { 
    15: 20, 16: 20, 17: 20, 18: 19, 19: 17, 20: 14, 21: 10, 22: 5
  },
  PREMIUM: {
    15: 25, 16: 25, 17: 25, 18: 22, 19: 20, 20: 18, 21: 15, 22: 10
  }
};

export const obtenerSchemaComisionPorId = (configId: number): { [key: number]: number } => {
  return configId === 2 ? REGLAS_COMISION.PREMIUM : REGLAS_COMISION.DEFAULT;
};

export const obtenerPorcentajePorEsquema = (schema: { [key: number]: number }, fechaPago: Date): number => {
  const dia = fechaPago.getDate();
  if (dia < 15) return schema === REGLAS_COMISION.PREMIUM ? 25 : 20; 

  const esquema = schema === REGLAS_COMISION.PREMIUM ? REGLAS_COMISION.PREMIUM : REGLAS_COMISION.DEFAULT;

  return (esquema as any)[dia] ?? 0; 
};

export function calcularFechaVencimiento(fechaCreacion: Date): Date {
    const day = fechaCreacion.getDate();
    const month = fechaCreacion.getMonth();
    const year = fechaCreacion.getFullYear();

    return (day <= DAY_LIMIT) ? new Date(year, month, DAY_MAX) : new Date(year, month + 1, DAY_MAX);
}

export function calcularDiasTranscurridos(fechaInicio: Date, fechaFin: Date = new Date()): number {
    const diffTime = fechaFin.getTime() - fechaInicio.getTime();
    return Math.ceil(diffTime / (DAY_IN_MS));
}

export function calcularMontoPagar(totalVale: number, porcentajeComision: number): number {
    const comision = (totalVale * porcentajeComision) / 100;
    return totalVale - comision;
}

export function calcularComision(totalVale: number, porcentajeComision: number): number {
    return (totalVale * porcentajeComision) / 100;
}
