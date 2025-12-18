import type { Client, ClientID, newClient } from '../../types/clientType';
import { prisma } from '../../config/database.js';

// Obtener todos los clientes
export const getAllClients = async () => {
  try {
    const clients = await prisma.client.findMany();
    console.log(clients);
    return clients;
  } catch (error) {
    throw new Error('Error al obtener clientes');
  }
};

// Obtener cliente por ID
export const getClientById = async (id : ClientID) => {
  try {
    const client = await prisma.client.findUnique({
      where: { clientid: id.clientId }
    });
    
    if (!client) throw new Error('Cliente no encontrado');

    return client;
  } catch (error: any) {
    throw new Error('Error al obtener el cliente '+ error.message);
  }
};

// Crear cliente
export const createClient = async (newClient: newClient) => {
  try {
    const { name, creditBalance, commissionConfigId } = newClient;

    // Crear cliente con referencia al esquema de comisiones
    const client = await prisma.client.create({
      data: {
        name,
        creditbalance: creditBalance || 0,
        commissionconfigid: commissionConfigId || 1
      }
    });
    
    return client;
  } catch (error: any) {
    throw new Error('Error al crear cliente: ' + error.message);
  }
};

// Actualizar cliente
export const updateClient = async (prevClient : Client) => {
  try {
    const { clientId, name, creditBalance } = prevClient;
    
    if (!clientId) throw new Error('clientId es requerido para actualizar');
    
    const client = await prisma.client.update({
      where: { clientid: clientId },
      data: { name, creditbalance: creditBalance }
    });
    
    return client;
  } catch (error: any) {
    throw new Error('Error al actualizar cliente: ' + error.message);
  }
};

// Eliminar cliente
export const deleteClient = async (id : ClientID) => {
  try {
    await prisma.client.delete({
      where: { clientid: id.clientId }
    });
    
    return { message: 'Cliente eliminado exitosamente' };
  } catch (error) {
    throw new Error('Error al eliminar cliente');
  }
};
