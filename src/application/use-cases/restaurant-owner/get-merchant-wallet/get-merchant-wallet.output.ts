export interface GetMerchantWalletOutput {
    balanceInCents: number;
    balanceFormatted: string;
    currency: string;
    payflowWalletId: string;
}