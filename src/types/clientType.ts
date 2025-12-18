export type Client = {
    clientId: number;
    name: string;
    creditBalance: number;
}

export type ClientID = Pick<Client, 'clientId'>;
