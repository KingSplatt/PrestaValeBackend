export type Client = {
    clientId: number;
    name: string;
    creditBalance: number;
    commissionConfigId: number;
}

export type newClient = Omit<Client, 'clientId'>;

export type ClientID = Pick<Client, 'clientId'>;
