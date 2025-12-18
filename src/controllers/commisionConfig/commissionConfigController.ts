import { prisma } from '../../config/database.js';

// Obtener todas las configuraciones de comision de los clientes
export const getAllCommissionConfigs = async () => {
    try {
        const configs = await prisma.commissionconfig.findMany();
        return configs;
    } catch (error) {
        throw new Error('Error al obtener las configuraciones de comision');
    }
};
