import { PaymentServiceUnavailableError } from "@/domain/errors/payment-service-unavailable.error.js";
import { ResourceNotFoundError } from "@/domain/errors/resource-not-found.error.js";
import { left, right, type Either } from "@/shared/either.js";
import type { GetCustomerWalletOutput } from "./get-customer-wallet.output.js";
import type { CustomerRepository } from "@/domain/repositories/customer.repository.js";
import type { GetCustomerWalletInput } from "./get-customer-wallet.input.js";
import { payflowService } from "@/infraestructure/payment/payflow.service.js";
import { payFlowClient } from "@/infraestructure/payment/payflow.client.js";

type GetCustomerWalletResult = Either<
    ResourceNotFoundError | PaymentServiceUnavailableError,
    GetCustomerWalletOutput
>;

export class GetCustomerWalletUseCase {
    constructor(private readonly customerRepository: CustomerRepository){}

    async execute(input: GetCustomerWalletInput): Promise<GetCustomerWalletResult>{
        const customer = await this.customerRepository.findById(input.customerId);
        if(!customer){
            return left(new ResourceNotFoundError('Customer'));
        }

        const payflowResult = await payflowService.ensureCustomerRegistered(
            customer,
            this.customerRepository
        );

        if(payflowResult.isLeft()){
            return left(new PaymentServiceUnavailableError());
        }

        const walletResult = await payFlowClient.getCustomerWallet(payflowResult.value.customerId);

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