import type { Voucher, VoucherID } from "../../types/voucherType";
import type { ClientID } from "../../types/clientType";
import { prisma } from "../../config/database.js";

//Obtener todos los vales de un cliente
export const getAllVouchersClient = async (clientId : ClientID) => {
    try {
        const vouchers = await prisma.voucher.findMany({
            where: { clientid: clientId.clientId }
        });
        return vouchers;
    } catch (error) {
        throw new Error('Error al obtener los vouchers del cliente');
    }
}
//Obtener un vale por su ID y su cliente asociado
export const getVoucherByIdAndClient = async (voucherId : VoucherID, clientId : ClientID) => {
    try {
        if(!voucherId.voucherId) throw new Error('voucherId es requerido para la busqueda');
        if(!clientId.clientId) throw new Error('clientId es requerido para la busqueda');

        const voucher = await prisma.voucher.findFirst({
            where: { voucherid: voucherId.voucherId, clientid: clientId.clientId }
        });

        if (!voucher) throw new Error('Voucher no encontrado para el cliente especificado');
        return voucher;
    } catch (error) {
        throw new Error('Error al obtener el voucher del cliente');
    }
}
//Crear un vale nuevo por un cliente
export const createVoucher = async (newVoucher : Voucher) => {
    try {
        const { totalAmount, balance, creationDate, dueDate, clientId, status } = newVoucher;
        const voucher = await prisma.voucher.create({
            data: {
                totalamount: totalAmount,
                balance: balance,
                creationdate: creationDate,
                duedate: dueDate,
                clientid: clientId,
                status: status
            }
        });
        return voucher;
    } catch (error) {
        throw new Error('Error al crear el voucher');
    }
}
//Actualizar un vale existente
export const updateVoucher = async (prevVoucher : Voucher) => {
    try {
        const { voucherId, totalAmount, balance, creationDate, dueDate, clientId, status } = prevVoucher;
        if (!voucherId) throw new Error('voucherId es requerido para actualizar');
        const voucher = await prisma.voucher.update({
            where: { voucherid: voucherId },
            data: {
                totalamount: totalAmount,
                balance: balance,
                creationdate: creationDate,
                duedate: dueDate,
                clientid: clientId,
                status: status
            }
        });
        return voucher;
    } catch (error: any) {
        throw new Error('Error al actualizar el voucher: ' + error.message);
    } 
};
//Eliminar un vale por su ID
export const deleteVoucher = async (id : VoucherID) => {
    try {
        await prisma.voucher.delete({
            where: { voucherid: id.voucherId }
        });
    } catch (error) {
        throw new Error('Error al eliminar el voucher');
    }
}