export type Voucher = {
    voucherId: number;
    totalAmount: number;
    balance: number;
    creationDate: Date;
    dueDate: Date;
    clientId: number;
    status: 'ACTIVE' | 'PAID' ;
}

export type VoucherInfo = Omit<Voucher, `clientId`>;