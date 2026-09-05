import type { Customer } from "@/domain/entities/customer.entity.js";
import { payFlowClient, type PayflowClient, type PayFlowError } from "./payflow.client.js";
import type { CustomerRepository } from "@/domain/repositories/customer.repository.js";
import { left, right, type Either } from "@/shared/either.js";
import crypto from 'crypto'
import { env } from "@/shared/env/index.js";
import type { RestaurantOwner } from "@/domain/entities/restaurant-owner.entity.js";
import type { RestaurantOwnerRepository } from "@/domain/repositories/restaurant-owner.repository.js";

export class PayFlowIntegrationError extends Error {
    readonly code: string;

    constructor(payFlowError: PayFlowError){
        super(payFlowError.message);
        this.name = 'PayFlowIntegrationError'
        this.code = payFlowError.code;
    }
}

export class PayFlowService {
    constructor(private readonly client: PayflowClient){}

    async ensureCustomerRegistered(
        customer: Customer, 
        customerRepository: CustomerRepository
    ): Promise<Either<PayFlowIntegrationError, { customerId: string; walletId: string }>>{
        if(customer.isRegisteredInPayFlow){
            return right({
                customerId: customer.payflowCustomerId!,
                walletId: customer.payflowWalletId!
            })
        }

        const result = await this.client.registerCustomer({
            name: customer.name.value,
            email: customer.email.value,
            cpf: customer.cpf.value,
            password: this.generateSecurePassword(customer.id.value),
            phone: customer.phone
        });

        if(result.isLeft()){
            return left(new PayFlowIntegrationError(result.value));
        }

        const { customerId, walletId } = result.value;
        customer.linkToPayFlow(customerId, walletId);
        await customerRepository.save(customer);

        return right({ customerId, walletId });
    }

    async ensureMerchantRegistered(
        owner: RestaurantOwner,
        restaurantTradeName: string,
        ownerRepository: RestaurantOwnerRepository
    ): Promise<Either<PayFlowIntegrationError, { merchantId: string; walletId: string }>> {
        if(owner.isRegisteredInPayFlow){
            return right({
                merchantId: owner.payflowMerchantId!,
                walletId: owner.payflowWalletId!
            });
        }

        const result = await this.client.registerMerchant({
            name: owner.name.value,
            tradeName: restaurantTradeName,
            email: owner.email.value,
            cnpj: owner.cnpj.value,
            password: this.generateSecurePassword(owner.id.value)
        });

        if(result.isLeft()){
            return left(new PayFlowIntegrationError(result.value));
        }

        const { merchantId, walletId } = result.value;
        owner.linkToPayFlow(merchantId, walletId);
        await ownerRepository.save(owner);

        return right({ merchantId, walletId });
    }

    generateSecurePassword(userId: string): string {
        return crypto
            .createHmac('sha256', env.PAYFLOW_PASSWORD_SECRET)
            .update(userId)
            .digest('hex')
            .substring(0, 32)
    }
}

export const payflowService = new PayFlowService(payFlowClient);