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
export const processPayment = async (voucherID: VoucherID, paymentAmount: number, fechapago : Date) => {
    // Los pagos no pueden ser negativos o cero
    if (paymentAmount <= 0) throw new Error('El monto del pago debe ser mayor a cero');

    //Transaccion para asegurar datos
    return await prisma.$transaction(async (tx) => {
        const voucher = await tx.voucher.findUnique({ //vale / cliente
            where: { voucherid: voucherID.voucherId },
            include: { client: true }
        });

        if (!voucher) throw new Error('Vale no encontrado');
        if (voucher.status === 'PAID') throw new Error('No se pueden registrar pagos a vales que ya están liquidados');
        
        const today = fechapago;
        let schema = obtenerSchemaComisionPorId(voucher.client!.commissionconfigid as number);
        const commissionPercentage = obtenerPorcentajePorEsquema(schema,today);
        
        // total = Total - Comision (1000-200=800)
        const netAmountlessComission = calcularMontoPagar(Number(voucher.totalamount), commissionPercentage); // a pagar neto sin comision
        const paidInMoment = Number(voucher.totalamount) - Number(voucher.balance); // pagado hasta el momento
        let Remaining = netAmountlessComission - paidInMoment; // restante a pagar neto
        

        let auxMountToVoucher = paymentAmount;
        let overpayment = 0;

        //excedentes
        if (paymentAmount > Remaining) {
            overpayment = paymentAmount - Remaining;
            auxMountToVoucher = Remaining;
        }

        //registro pago nvo
        const newPayment = await tx.payment.create({
            data: {
                voucherid: voucher.voucherid,
                amount: paymentAmount, 
                paymentdate: today
            }
        });

        //Actualizar el saldo del vale
        const newBalance = Number(voucher.balance) - auxMountToVoucher;

        //Definir nuevo estado del vale
        const minBalanceForPaid = Number(voucher.totalamount) - netAmountlessComission;
        const newStatus = (newBalance <= minBalanceForPaid) ? 'PAID' : 'ACTIVE';

        const updatedVoucher = await tx.voucher.update({
            where: { voucherid: voucherID.voucherId },
            data: {
                balance: newBalance,
                status: newStatus
            }
        });

        //guardar lo sobrante como credito para el cliente
        if (overpayment > 0) {
            await tx.client.update({
                where: { clientid: voucher.clientid! },
                data: {
                    creditbalance: { increment: overpayment }
                }
            });
        }
        //si el vale se liquida, sumar el saldo al credito del cliente
        if(newStatus === 'PAID'){
            await tx.client.update({
                where: {clientid: voucher.clientid!},
                data: {
                    creditbalance: { increment: newBalance }
                }
            })
        }

        return {
            payment: newPayment,
            voucher: updatedVoucher,
            netAmountlessComission,
            commissionPercentage,
            amountApplied: auxMountToVoucher,
            overpaymentSaved: overpayment,
            newStatus,
            message: newStatus === 'PAID' 
                ? 'Vale liquidado' 
                : 'Pago registrado'
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