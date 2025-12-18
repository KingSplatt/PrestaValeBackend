import type { payment, PaymentID } from "../../types/payment";
import type { VoucherID } from "../../types/voucherType";
import { prisma } from "../../config/database.js";


// Obtener todos los pagos de un vale
export const getAllPaymentsOfVoucher = async (voucherId: VoucherID) => {
    try {
        const payments = await prisma.payment.findMany({
            where: { voucherid: voucherId.voucherId }
        });
        return payments;
    } catch (error: any) {
        throw new Error('Error al obtener los pagos: ' + error.message);
    }
}


// Obtener pago por ID
export const getPaymentById = async (id: PaymentID) => {
    try {
        const payment = await prisma.payment.findUnique({
            where: { paymentid: id.paymentId }
        });
        //if (!payment) throw new Error('Pago no encontrado');
        return payment;
    } catch (error: any) {
        throw new Error('Error al obtener el pago: ' + error.message);
    }
};


// Crear un nuevo pago 
export const createPayment = async (newPayment: payment) => {
    try {
        const { amount, paymentDate, voucherId } = newPayment;
        const payment = await prisma.payment.create({
            data: {
                amount,
                paymentdate: paymentDate,
                voucherid: voucherId
            }
        });
        return payment;
    } catch (error) {
        throw new Error('Error al crear el pago');
    }
};

// Actualizar un pago
export const updatePayment = async (prevPayment: payment) => {
    try {
        const { paymentId, amount, paymentDate, voucherId } = prevPayment;
        if (!paymentId) throw new Error('paymentId es requerido para actualizar');
        const payment = await prisma.payment.update({
            where: { paymentid: paymentId },
            data: {
                amount,
                paymentdate: paymentDate,
                voucherid: voucherId
            }
        });
        return payment;
    } catch (error: any) {
        throw new Error('Error al actualizar el pago: ' + error.message);
    }
};

// Eliminar un pago
export const deletePayment = async (id: PaymentID) => {
    try {
        await prisma.payment.delete({
            where: { paymentid: id.paymentId }
        });
    } catch (error: any) {
        throw new Error('Error al eliminar el pago: ' + error.message);
    }
};