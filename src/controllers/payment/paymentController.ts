import type { payment, PaymentID } from "../../types/payment";
import type { VoucherID } from "../../types/voucherType";
import { prisma } from "../../config/database.js";
import { obtenerPorcentajePorEsquema, obtenerSchemaComisionPorId,calcularMontoPagar} from "../../services/voucherService.js";

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

// Procesar pago con todas las reglas de negocio
export const processPayment = async (voucherID: VoucherID, paymentAmount: number) => {
    // Los pagos no pueden ser negativos o cero
    if (paymentAmount <= 0) throw new Error('El monto del pago debe ser mayor a cero');

    return await prisma.$transaction(async (tx) => {
        // 1. Obtener información del vale y el cliente
        const voucher = await tx.voucher.findUnique({
            where: { voucherid: voucherID.voucherId },
            include: { client: true }
        });

        if (!voucher) throw new Error('Vale no encontrado');
        if (voucher.status === 'PAID') throw new Error('No se pueden registrar pagos a vales que ya están liquidados');
        
        // 3. Determinar comisión y monto neto para liquidar hoy
        // La comisión depende del día en que el vale es liquidado
        const today = new Date();
        let schema = obtenerSchemaComisionPorId(voucher.client!.commissionconfigid as number);
        const commissionPercentage = obtenerPorcentajePorEsquema(schema,today);
        
        // Regla: Se liquida con el Total - Comisión
        const netAmountToSettle = calcularMontoPagar(Number(voucher.totalamount), commissionPercentage);
        
        // Calcular cuánto se ha pagado hasta ahora (TotalAmount - CurrentBalance)
        const paidSoFar = Number(voucher.totalamount) - Number(voucher.balance);
        
        // Determinar cuánto falta realmente para llegar al monto neto de liquidación
        const realRemaining = netAmountToSettle - paidSoFar;

        let amountToApplyToVoucher = paymentAmount;
        let overpayment = 0;

        // 4. Regla: Manejar pagos excedentes (Overpayment)
        if (paymentAmount > realRemaining) {
            overpayment = paymentAmount - realRemaining;
            amountToApplyToVoucher = realRemaining;
        }

        // 5. Registrar el pago en la base de datos
        const newPayment = await tx.payment.create({
            data: {
                voucherid: voucher.voucherid,
                amount: paymentAmount, // Se registra el monto total recibido
                paymentdate: today
            }
        });

        // 6. Actualizar el saldo del vale
        // El saldo disminuye según lo aplicado
        const newBalance = Number(voucher.balance) - amountToApplyToVoucher;

        // Regla: Cambio automático a PAID cuando se completa el pago neto
        const minBalanceForPaid = Number(voucher.totalamount) - netAmountToSettle;
        const newStatus = newBalance <= minBalanceForPaid ? 'PAID' : 'ACTIVE';

        const updatedVoucher = await tx.voucher.update({
            where: { voucherid: voucherID.voucherId },
            data: {
                balance: newBalance,
                status: newStatus
            }
        });

        // 7. Guardar excedente como saldo a favor si existe
        if (overpayment > 0) {
            await tx.client.update({
                where: { clientid: voucher.clientid! },
                data: {
                    creditbalance: { increment: overpayment }
                }
            });
        }

        return {
            payment: newPayment,
            voucher: updatedVoucher,
            commissionPercentage,
            amountApplied: amountToApplyToVoucher,
            overpaymentSaved: overpayment,
            newStatus,
            message: newStatus === 'PAID' 
                ? 'Vale liquidado con éxito' 
                : 'Pago parcial registrado'
        };
    });
}

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