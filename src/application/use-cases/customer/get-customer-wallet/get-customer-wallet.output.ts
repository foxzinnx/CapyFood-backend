export interface GetCustomerWalletOutput {
    balanceInCents: number;
    balanceFormatted: string;
    currency: string;
    payflowWalletId: string;
}