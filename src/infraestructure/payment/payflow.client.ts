import { left, right, type Either } from "@/shared/either.js";
import { env } from "@/shared/env/index.js";

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

export class PayflowClient {
    private readonly baseUrl: string;
    private readonly apiKey: string;

    constructor(){
        this.baseUrl = env.PAYFLOW_URL;
        this.apiKey = env.PAYFLOW_API_KEY
    }

    private get headers(): HeadersInit {
        return {
            'Content-Type': 'application/json',
            'X-API-Key': this.apiKey
        }
    }

    private async request<T>(
        method: string,
        path: string,
        body?: unknown
    ): Promise<Either<PayFlowError, T>>{
        try {
            const response = await fetch(`${this.baseUrl}${path}`, {
                method,
                headers: this.headers,
                body: body ? JSON.stringify(body) : null,
                signal: AbortSignal.timeout(10_000)
            });

            const data = await response.json();

            if(!response.ok){
                return left({
                    code: data.code ?? 'PAYFLOW_ERROR',
                    message: data.message ?? 'PayFlow request failed'
                });
            };

            return right(data.data as T);
        } catch (error) {
            return left({
                code: 'PAYFLOW_UNAVAILABLE',
                message: error instanceof Error ? error.message : 'PayFlow is unavailable'
            })
        }
    }

    async registerCustomer(data: {
        name: string;
        email: string;
        cpf: string;
        password: string;
        phone?: string;
    }): Promise<Either<PayFlowError, PayFlowRegisterCustomerResult>>{
        return this.request('POST', '/api/v1/service/customers', data);
    }

    async getCustomerWallet(
        customerId: string
    ): Promise<Either<PayFlowError, PayFlowWalletResult>>{
        return this.request('GET', `/api/v1/service/customers/${customerId}/wallet`);
    }

    async getMerchantWallet(
        merchantId: string
    ): Promise<Either<PayFlowError, PayFlowWalletResult>>{
        return this.request('GET', `/api/v1/service/merchants/${merchantId}/wallet`);
    }

    async registerMerchant(data: {
        name: string;
        tradeName: string;
        email: string;
        cnpj: string;
        password: string;
    }): Promise<Either<PayFlowError, PayFlowRegisterMerchantResult>>{
        return this.request('POST', '/api/v1/merchants', data);
    }

    async createTransaction(data: {
        customerId: string;
        merchantId: string;
        amountInCents: number;
        idempotencyKey: string;
        description?: string;
        metadata?: Record<string, unknown>
    }): Promise<Either<PayFlowError, PayFlowTransactionResult>>{
        return this.request('POST', '/api/v1/service/transactions', data);
    }

    async createDeposit(data: {
        customerId: string;
        amountInCents: number;
        currency?: string;
        method?: 'PIX' | 'TED' | 'BOLETO'
    }): Promise<Either<PayFlowError, {
        id: string;
        amountInCents: number;
        amountFormatted: string;
        status: string;
        method: string;
    }>>{
        return this.request('POST', '/api/v1/service/deposits', data);
    }

    async refundTransaction(data: {
        merchantId: string;
        transactionId: string;
        reason?: string;
    }): Promise<Either<PayFlowError, { id: string; status: string }>>{
        return this.request('POST', `/api/v1/service/transactions/${data.transactionId}/refund`, { merchantId: data.merchantId, reason: data.reason });
    }

    async getTransaction(
        transactionId: string
    ): Promise<Either<PayFlowError, PayFlowTransactionResult>>{
        return this.request('GET', `/api/v1/service/transactions/${transactionId}`);
    }
}

export const payFlowClient = new PayflowClient();