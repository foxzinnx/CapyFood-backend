export interface DepositToWalletOutput {
    id: string;
    amountInCents: number;
    amountFormatted: string;
    status: string;
    method: string;
}