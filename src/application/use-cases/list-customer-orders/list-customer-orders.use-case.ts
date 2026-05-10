import { ResourceNotFoundError } from "@/domain/errors/resource-not-found.error.js";
import type { CustomerRepository } from "@/domain/repositories/customer.repository.js";
import type { OrderRepository } from "@/domain/repositories/order.repository.js";
import { left, right, type Either } from "@/shared/either.js";
import type { ListCustomerOrdersOutput } from "./list-customer-orders.output.js";
import type { ListCustomerOrdersInput } from "./list-customer-orders.input.js";
import { NotAllowedError } from "@/domain/errors/not-allowed.error.js";

type ListCustomerOrdersResult = Either<
    ResourceNotFoundError | NotAllowedError,
    ListCustomerOrdersOutput
>

export class ListCustomerOrdersUseCase {
    constructor(
        private readonly customerRepository: CustomerRepository,
        private readonly orderRepository: OrderRepository
    ){}

    async execute(input: ListCustomerOrdersInput): Promise<ListCustomerOrdersResult>{
        const customer = await this.customerRepository.findById(input.customerId);
        if(!customer){
            return left(new ResourceNotFoundError('Customer'));
        }

        if(customer.id.value !== input.customerId){
            return left(new NotAllowedError());
        }

        const result = await this.orderRepository.findByCustomerId(input.customerId, {
            page: input.page ?? 1,
            perPage: input.perPage ?? 10
        });

        return right({
            orders: result.data.map((order) => order.toOutputDTO()),
            total: result.total,
            page: result.page,
            perPage: result.perPage,
            totalPages: result.totalPages
        })
    }
}