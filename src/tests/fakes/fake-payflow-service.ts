import type { PayFlowIntegrationFailure, PayFlowService } from "@/application/ports/payflow-service.js";
import type { Customer } from "@/domain/entities/customer.entity.js";
import type { RestaurantOwner } from "@/domain/entities/restaurant-owner.entity.js";
import type { CustomerRepository } from "@/domain/repositories/customer.repository.js";
import type { RestaurantOwnerRepository } from "@/domain/repositories/restaurant-owner.repository.js";
import { left, right, type Either } from "@/shared/either.js";

export class FakePayflowService implements PayFlowService {
    shouldFailCustomerRegistration = false;
    shouldFailMerchantRegistration = false;
    
    async ensureCustomerRegistered(customer: Customer, customerRepository: CustomerRepository): Promise<Either<PayFlowIntegrationFailure, { customerId: string; walletId: string; }>> {
        if(this.shouldFailCustomerRegistration){
            return left({ code: 'PAYFLOW_UNAVAILABLE', message: 'PayFlow is unavailable' });
        }

        if(!customer.isRegisteredInPayFlow){
            const customerId = `payflow_customer_${customer.id.value}`;
            const walletId = `payflow_wallet_${customer.id.value}`;
            customer.linkToPayFlow(customerId, walletId);
            await customerRepository.save(customer);
        }

        return right({
            customerId: customer.payflowCustomerId!,
            walletId: customer.payflowWalletId!
        })
    }

    async ensureMerchantRegistered(owner: RestaurantOwner, restaurantTradeName: string, ownerRepository: RestaurantOwnerRepository): Promise<Either<PayFlowIntegrationFailure, { merchantId: string; walletId: string; }>> {
        if(this.shouldFailMerchantRegistration){
            return left({ code: 'PAYFLOW_UNAVAILABLE', message: 'PayFlow is unavailable' });
        }

        if(!owner.isRegisteredInPayFlow){
            const merchantId = `payflow_merchant_${owner.id.value}`;
            const walletId = `payflow_wallet_${owner.id.value}`;
            owner.linkToPayFlow(merchantId, walletId);
            await ownerRepository.save(owner);
        }

        return right({
            merchantId: owner.payflowMerchantId!,
            walletId: owner.payflowWalletId!
        })
    }
}