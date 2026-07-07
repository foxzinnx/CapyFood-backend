import { NotAllowedError } from "@/domain/errors/not-allowed.error.js";
import { OrderAlreadyCancelledError } from "@/domain/errors/order-already-cancelled.error.js";
import { OrderCannotBeCancelledError } from "@/domain/errors/order-cannot-be-cancelled.error.js";
import { ResourceNotFoundError } from "@/domain/errors/resource-not-found.error.js";
import type { OrderRepository } from "@/domain/repositories/order.repository.js";
import { left, right, type Either } from "@/shared/either.js";
import type { CancelOrderOutput } from "./cancel-order.output.js";
import type { CancelOrderInput } from "./cancel-order.input.js";
import { CUSTOMER_CANCELLABLE } from "@/domain/entities/order-transitions.js";

type CancelOrderResult = Either<
    |   ResourceNotFoundError
    |   NotAllowedError
    |   OrderAlreadyCancelledError
    |   OrderCannotBeCancelledError,
    CancelOrderOutput
>

export class CancelOrderUseCase{
    constructor(
        private readonly orderRepository: OrderRepository
    ){}

    async execute(input: CancelOrderInput): Promise<CancelOrderResult>{
        const order = await this.orderRepository.findById(input.orderId);
        if(!order){
            return left(new ResourceNotFoundError('Order'));
        }

        if(order.customerId.value !== input.customerId){
            return left(new NotAllowedError());
        }

        if(order.status === 'CANCELLED'){
            return left(new OrderAlreadyCancelledError());
        }

        if(!CUSTOMER_CANCELLABLE.includes(order.status)){
            return left(new OrderCannotBeCancelledError());
        }

        order.cancel();

        await this.orderRepository.save(order);

        return right(order.toOutputDTO());
    }
}