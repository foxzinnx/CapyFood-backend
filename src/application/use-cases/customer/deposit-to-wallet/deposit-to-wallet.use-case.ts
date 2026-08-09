import { PaymentServiceUnavailableError } from "@/domain/errors/payment-service-unavailable.error.js";
import { ResourceNotFoundError } from "@/domain/errors/resource-not-found.error.js";
import { left, right, type Either } from "@/shared/either.js";
import type { DepositToWalletOutput } from "./deposit-to-wallet.output.js";
import type { CustomerRepository } from "@/domain/repositories/customer.repository.js";
import type { DepositToWalletInput } from "./deposit-to-wallet.input.js";
import { payflowService } from "@/infraestructure/payment/payflow.service.js";
import { payFlowClient } from "@/infraestructure/payment/payflow.client.js";

export type DepositToWalletResult = Either<
    | ResourceNotFoundError
    | PaymentServiceUnavailableError,
    DepositToWalletOutput
>

export class DepositToWalletUseCase {
    constructor(private readonly customerRepository: CustomerRepository){}

    async execute(customerId: string, input: DepositToWalletInput): Promise<DepositToWalletResult>{
        const customer = await this.customerRepository.findById(customerId);
        if(!customer) return left(new ResourceNotFoundError('Customer'));

        const payFlowResult = await payflowService.ensureCustomerRegistered(
            customer,
            this.customerRepository
        );

        if(payFlowResult.isLeft()){
            return left(new PaymentServiceUnavailableError())
        };

        const depositResult = await payFlowClient.createDeposit({
            customerId: payFlowResult.value.customerId,
            amountInCents: input.amountInCents,
            method: input.method ?? 'PIX'
        });

        if(depositResult.isLeft()){
            return left(new PaymentServiceUnavailableError());
        }

        return right(depositResult.value)
    }
}