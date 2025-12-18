const DAY_MAX = 15;
const DAY_LIMIT = 14;

//Calcular fecha de vencimiento
export function calcularFechaVencimiento(fechaCreacion: Date): Date {
    const day = fechaCreacion.getDate();
    const month = fechaCreacion.getMonth();
    const year = fechaCreacion.getFullYear();

    return (day <= DAY_LIMIT) ? new Date(year, month, DAY_MAX) : new Date(year, month + 1, DAY_MAX);
  }

//obtener porcentaje según tu tabla personalizada
export function obtenerPorcentajeComision(diaPago: number): number {
    if (diaPago < DAY_MAX) return 20;
    
    //REGLA COMISIONES SEGUN DIA DE PAGO
    const tabla: Record<number, number> = {
      15: 20, 16: 20, 17: 20,
      18: 19, 19: 17, 20: 14,
      21: 10, 22: 5
    };
    return tabla[diaPago] ?? 0;
  }
