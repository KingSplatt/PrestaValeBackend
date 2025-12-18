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
export const processPayment = async (voucherID: VoucherID, paymentAmount: number, fechapago: Date) => {
    if (paymentAmount <= 0) throw new Error('El monto del pago debe ser mayor a cero'); 

    return await prisma.$transaction(async (tx) => {
        const voucher = await tx.voucher.findUnique({
            where: { voucherid: voucherID.voucherId },
            include: { client: true }
        });

        if (!voucher) throw new Error('Vale no encontrado');
        if (voucher.status === 'PAID') throw new Error('No se pueden registrar pagos a vales que ya están liquidados'); 
        
        const today = fechapago;
        
        //Esquema cliente
        const schema = obtenerSchemaComisionPorId(voucher.client!.commissionconfigid as number);
        const commissionPercentage = obtenerPorcentajePorEsquema(schema, today, voucher.duedate as Date);
        
        //Monto Neto de Liquidacion
        //1000-200 = 800
        const totalNetoALiquidar = calcularMontoPagar(Number(voucher.totalamount), commissionPercentage);
        const pagadoRealmente = Number(voucher.totalamount) - Number(voucher.balance);
        const faltanteParaLiquidar = totalNetoALiquidar - pagadoRealmente;

        let montoAplicadoAlVale = paymentAmount;
        let overpayment = 0;

        //excedentes
        if (paymentAmount > faltanteParaLiquidar) {
            overpayment = paymentAmount - faltanteParaLiquidar;
            montoAplicadoAlVale = faltanteParaLiquidar;
        }

        //Registrar el pago
        const newPayment = await tx.payment.create({
            data: {
                voucherid: voucher.voucherid,
                amount: paymentAmount, 
                paymentdate: today
            }
        });

        //Actualizar el saldo del vale
        const nuevoSaldo = Number(voucher.balance) - montoAplicadoAlVale;
        
        //Definir nuevo estado del vale
        const montoComision = Number(voucher.totalamount) - totalNetoALiquidar;
        const newStatus = (nuevoSaldo <= montoComision) ? 'PAID' : 'ACTIVE'; 

        const updatedVoucher = await tx.voucher.update({
            where: { voucherid: voucherID.voucherId },
            data: {
                balance: nuevoSaldo,
                status: newStatus
            }
        });

        // 8. Guardar excedente como crédito 
        if (overpayment > 0) {
            await tx.client.update({
                where: { clientid: voucher.clientid! },
                data: {
                    creditbalance: { increment: overpayment }
                }
            });
        }

        if(newStatus === 'PAID'){
            await tx.client.update({
                where: { clientid: voucher.clientid! },
                data: {
                    creditbalance: { increment: montoComision }
                }
            });
        }

        return {
            payment: newPayment,
            voucher: updatedVoucher,
            totalNetoALiquidar,
            faltanteParaLiquidar,
            commissionPercentage,
            amountApplied: montoAplicadoAlVale,
            overpaymentSaved: overpayment,
            newStatus,
            message: newStatus === 'PAID' ? 'Vale liquidado' : 'Pago parcial registrado'
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