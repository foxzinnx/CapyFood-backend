export interface DepositToWalletInput {
    amountInCents: number;
    method?: 'PIX' | 'TED' | 'BOLETO'
}