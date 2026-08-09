import type { Either } from "@/shared/either.js";

export interface PayFlowError {
    code: string;
    message: string;
}

export interface PayFlowRegisterCustomerResult {
    customerId: string;
    walletId: string;
    accessToken: string;
    refreshToken: string;
}

export interface PayFlowRegisterMerchantResult {
    merchantId: string;
    walletId: string;
    accessToken: string;
    refreshToken: string;
}

export interface PayFlowTransactionResult {
    id: string;
    status: "APPROVED" | "FAILED";
    amountInCents: number;
    amountFormatted: string;
    denialReason: string | null;
    metadata: Record<string, unknown> | null;
}

export interface PayFlowWalletResult {
    id: string;
    balanceInCents: number;
    balanceFormatted: string;
    currency: string;
}

export interface PayFlowDepositResult {
  id: string
  amountInCents: number
  amountFormatted: string
  status: string
  method: string
}

export interface PayFlowClient {
    createTransaction(data: {
        customerId: string;
        merchantId: string;
        amountInCents: number;
        idempotencyKey: string;
        description?: string;
        metadata?: Record<string, unknown>
    }): Promise<Either<PayFlowError, PayFlowTransactionResult>>;

    refundTransaction(data: {
        merchantId: string;
        transactionId: string;
        reason?: string;
    }): Promise<Either<PayFlowError, { id: string; status: string; }>>;

    getTransaction(transactionId: string): Promise<Either<PayFlowError, PayFlowTransactionResult>>;

    getCustomerWallet(
        customerId: string,
    ): Promise<Either<PayFlowError, PayFlowWalletResult>>
    
    getMerchantWallet(
        merchantId: string,
    ): Promise<Either<PayFlowError, PayFlowWalletResult>>
    
    createDeposit(data: {
        customerId: string
        amountInCents: number
        method?: 'PIX' | 'TED' | 'BOLETO'
    }): Promise<Either<PayFlowError, PayFlowDepositResult>>;
}