import { PaymentServiceUnavailableError } from "@/domain/errors/payment-service-unavailable.error.js";
import { ResourceNotFoundError } from "@/domain/errors/resource-not-found.error.js";
import { left, right, type Either } from "@/shared/either.js";
import type { GetMerchantWalletOutput } from "./get-merchant-wallet.output.js";
import type { RestaurantOwnerRepository } from "@/domain/repositories/restaurant-owner.repository.js";
import { payflowService } from "@/infrastructure/payment/payflow.service.js";
import { payFlowClient } from "@/infrastructure/payment/payflow.client.js";

export type GetMerchantWalletResult = Either<
    | ResourceNotFoundError
    | PaymentServiceUnavailableError,
    GetMerchantWalletOutput
>;

export class GetMerchantWalletUseCase {
    constructor(private readonly ownerRepository: RestaurantOwnerRepository){}

    async execute(ownerId: string): Promise<GetMerchantWalletResult>{
        const owner = await this.ownerRepository.findById(ownerId);
        if(!owner) return left(new ResourceNotFoundError('Restaurant owner'));

        const payFlowResult = await payflowService.ensureMerchantRegistered(
            owner,
            owner.name.value,
            this.ownerRepository
        );

        if(payFlowResult.isLeft()){
            return left(new PaymentServiceUnavailableError());
        }

        const walletResult = await payFlowClient.getMerchantWallet(
            payFlowResult.value.merchantId
        );

        if(walletResult.isLeft()){
            return left(new PaymentServiceUnavailableError());
        }

        return right({
            balanceInCents: walletResult.value.balanceInCents,
            balanceFormatted: walletResult.value.balanceFormatted,
            currency: walletResult.value.currency,
            payflowWalletId: walletResult.value.id
        });
    }
}