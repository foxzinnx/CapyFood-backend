import type { CustomerRepository } from "@/domain/repositories/customer.repository.js";
import type { GetCustomerProfileInput } from "./get-customer-profile.input.js";
import { left, right, type Either } from "@/shared/either.js";
import { ResourceNotFoundError } from "@/domain/errors/resource-not-found.error.js";
import type { GetCustomerProfileOutput } from "./get-customer-profile.output.js";

type GetCustomerProfileResult = Either<ResourceNotFoundError, GetCustomerProfileOutput>;

export class GetCustomerProfileUseCase{
    constructor(
        private readonly customerRepository: CustomerRepository
    ){}

    async execute(input: GetCustomerProfileInput): Promise<GetCustomerProfileResult>{
        const customer = await this.customerRepository.findById(input.customerId);
        if(!customer){
            return left(new ResourceNotFoundError('Customer'));
        }

        return right(customer.toOutputDTO());
    }
}