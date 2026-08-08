import type { Customer } from "@/domain/entities/customer.entity.js";
import type { RestaurantOwner } from "@/domain/entities/restaurant-owner.entity.js";
import type { CustomerRepository } from "@/domain/repositories/customer.repository.js";
import type { RestaurantOwnerRepository } from "@/domain/repositories/restaurant-owner.repository.js";
import type { Either } from "@/shared/either.js";

export interface PayFlowIntegrationFailure {
    code: string;
    message: string;
}

export interface PayFlowService {
    ensureCustomerRegistered(
        customer: Customer,
        customerRepository: CustomerRepository
    ): Promise<Either<PayFlowIntegrationFailure, { customerId: string; walletId: string; }>>;

    ensureMerchantRegistered(
        owner: RestaurantOwner,
        restaurantTradeName: string,
        ownerRepository: RestaurantOwnerRepository
    ): Promise<Either<PayFlowIntegrationFailure, { merchantId: string; walletId: string }>>
}