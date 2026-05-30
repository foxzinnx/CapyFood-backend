import { NotAllowedError } from "@/domain/errors/not-allowed.error.js";
import { ResourceNotFoundError } from "@/domain/errors/resource-not-found.error.js";
import type { OrderRepository } from "@/domain/repositories/order.repository.js";
import { left, right, type Either } from "@/shared/either.js";
import type { GetOrderOutput } from "./get-order.output.js";
import type { GetOrderInput } from "./get-order.input.js";
import type { RestaurantRepository } from "@/domain/repositories/restaurant.repository.js";

type GetOrderResult = Either<
    |   ResourceNotFoundError
    |   NotAllowedError,
    GetOrderOutput
>

export class GetOrderUseCase{
    constructor(
        private readonly orderRepository: OrderRepository,
        private readonly restaurantRepository: RestaurantRepository
    ){}

    async execute(input: GetOrderInput): Promise<GetOrderResult>{
        const order = await this.orderRepository.findById(input.orderId);
        if(!order){
            return left(new ResourceNotFoundError('Order'));
        }

        const isCustomer = order.customerId.value === input.requesterId;
        if(isCustomer){
            return right(order.toOutputDTO());
        }

        const restaurant = await this.restaurantRepository.findById(order.restaurantId.value);

        const isOwner = restaurant?.ownerId.value === input.requesterId;
        if(isOwner){
            return right(order.toOutputDTO());
        }

        return left(new NotAllowedError());
    }
}