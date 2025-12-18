export type payment = {
    paymentId: number;
    amount: number;
    paymentDate: Date;
    voucherId: number;
}

export type PaymentInfo = Omit<payment, `voucherId`>;