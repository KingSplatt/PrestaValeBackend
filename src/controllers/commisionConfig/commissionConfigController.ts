import type { commissionConfig } from "../../types/commissionConfigType";
import type { ClientID } from "../../types/clientType";
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

// Obtener configuracion de comision de un cliente x ID
export const getCommissionConfigByClientId = async (id : ClientID) => {
    try {
        const config = await prisma.commissionconfig.findMany({
            where: { clientid: id.clientId }
        });
        return config;
    } catch (error) {
        throw new Error('Error al obtener la configuracion de comision del cliente');
    }
};

// Crear una nueva configuracion de comision
export const createCommissionConfig = async (newConfig : commissionConfig) => {
    try {
        const { day, percentage, clientId } = newConfig;
        const config = await prisma.commissionconfig.create({
            data: {
                day,
                percentage,
                clientid: clientId
            }
        });
        return config;
    } catch (error) {
        throw new Error('Error al crear la configuracion de comision');
    }
};


// Actualizar una configuracion de comision existente a un cliente
export const updateCommissionConfig = async (prevConfig : commissionConfig) => {
    try {
        const { configId, day, percentage, clientId } = prevConfig;
        if (!configId) throw new Error('configId es requerido para actualizar');
        const config = await prisma.commissionconfig.update({
            where: { configid: configId },
            data: {
                day,
                percentage,
                clientid: clientId
            }
        });
        return config;
    } catch (error) {
        throw new Error('Error al actualizar la configuracion de comision');
    }
};