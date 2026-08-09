import type { PayFlowClient, PayFlowDepositResult, PayFlowError, PayFlowTransactionResult, PayFlowWalletResult } from "@/application/ports/payflow-client.js";
import { left, right, type Either } from "@/shared/either.js";

export class FakePayFlowClient implements PayFlowClient {
    public transactions: PayFlowTransactionResult[] = [];
    public deposits: PayFlowDepositResult[] = [];
    public refundedIds: string[] = [];

    shouldFailTransaction = false;
    shouldTransactionBeDenied = false;
    denialReason = 'Insufficient funds';
    shouldFailDeposit = false;
    shouldFailWallet = false;
    
    async createTransaction(data: { customerId: string; merchantId: string; amountInCents: number; idempotencyKey: string; description?: string; metadata?: Record<string, unknown>; }): Promise<Either<PayFlowError, PayFlowTransactionResult>> {
        if(this.shouldFailTransaction){
            return left({ code: 'PAYFLOW_UNAVAILABLE', message: 'PayFlow is unavailable' });
        }

        const result: PayFlowTransactionResult = {
            id: `txn_fake_${data.idempotencyKey}`,
            status: this.shouldTransactionBeDenied ? 'FAILED' : 'APPROVED',
            amountInCents: data.amountInCents,
            amountFormatted: `R$ ${(data.amountInCents / 100).toFixed(2)}`,
            denialReason: this.shouldTransactionBeDenied ? this.denialReason : null,
            metadata: data.metadata ?? null,
        }
    
        this.transactions.push(result)
        return right(result)
    }

    async refundTransaction(data: { merchantId: string; transactionId: string; reason?: string; }): Promise<Either<PayFlowError, { id: string; status: string; }>> {
        this.refundedIds.push(data.transactionId);
        return right({ id: data.transactionId, status: 'REFUNDED' });
    }

    async getTransaction(transactionId: string): Promise<Either<PayFlowError, PayFlowTransactionResult>> {
        const txn = this.transactions.find((t) => t.id === transactionId);
        if(!txn){
            return left({ code: 'NOT_FOUND', message: 'Transaction not found' });
        }
        return right(txn);
    }

    async getCustomerWallet(customerId: string): Promise<Either<PayFlowError, PayFlowWalletResult>> {
        if(this.shouldFailWallet){
            return left({ code: 'PAYFLOW_UNAVAILABLE', message: 'PayFlow is unavailable' });
        }
        return right({
            id: `wallet_fake_${customerId}`,
            balanceInCents: 10000,
            balanceFormatted: 'R$ 100,00',
            currency: 'BRL'
        });
    }

    async getMerchantWallet(merchantId: string): Promise<Either<PayFlowError, PayFlowWalletResult>> {
        if(this.shouldFailWallet){
            return left({ code: 'PAYFLOW_UNAVAILABLE', message: 'PayFlow is unavailable' });
        }
        return right({
            id: `wallet_fake_${merchantId}`,
            balanceInCents: 50000,
            balanceFormatted: 'R$ 500,00',
            currency: 'BRL'
        })
    }

    async createDeposit(data: { customerId: string; amountInCents: number; method?: "PIX" | "TED" | "BOLETO"; }): Promise<Either<PayFlowError, PayFlowDepositResult>> {
        if(this.shouldFailDeposit){
            return left({ code: 'PAYFLOW_UNAVAILABLE', message: 'PayFlow is unavailable' });
        }
        const result: PayFlowDepositResult = {
            id: `dep_fake_${Date.now()}`,
            amountInCents: data.amountInCents,
            amountFormatted: `R$ ${(data.amountInCents / 100).toFixed(2)}`,
            status: 'PENDING',
            method: data.method ?? 'PIX'
        }
        this.deposits.push(result);
        return right(result);
    }
}