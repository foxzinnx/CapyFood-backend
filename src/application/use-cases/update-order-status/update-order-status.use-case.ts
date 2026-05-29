import { InvalidOrderStatusTransitionError } from "@/domain/errors/invalid-order-status-transition.error.js";
import { NotAllowedError } from "@/domain/errors/not-allowed.error.js";
import { ResourceNotFoundError } from "@/domain/errors/resource-not-found.error.js";
import { left, right, type Either } from "@/shared/either.js";
import type { UpdateOrderStatusOutput } from "./update-order-status.output.js";
import type { OrderRepository } from "@/domain/repositories/order.repository.js";
import type { RestaurantRepository } from "@/domain/repositories/restaurant.repository.js";
import type { UpdateOrderStatusInput } from "./update-order-status.input.js";
import { isTransitionAllowed } from "@/domain/entities/order-transitions.js";

type UpdateOrderStatusResult = Either<
    |   ResourceNotFoundError
    |   NotAllowedError
    |   InvalidOrderStatusTransitionError,
    UpdateOrderStatusOutput
>

export class UpdateOrderStatusUseCase{
    constructor(
        private readonly orderRepository: OrderRepository,
        private readonly restaurantRepository: RestaurantRepository
    ){}
    
    async execute(input: UpdateOrderStatusInput): Promise<UpdateOrderStatusResult>{
        const order = await this.orderRepository.findById(input.orderId);
        if(!order){
            return left(new ResourceNotFoundError('Order'));
        }

        const restaurant = await this.restaurantRepository.findByOwnerId(input.ownerId);
        if(!restaurant){
            return left(new ResourceNotFoundError('Restaurant'));
        }

        if(restaurant.ownerId.value !== input.ownerId){
            return left(new NotAllowedError());
        }

        if(!isTransitionAllowed(order.status, input.newStatus)){
            return left(
                new InvalidOrderStatusTransitionError(order.status, input.newStatus)
            )
        }

        switch(input.newStatus){
            case 'CONFIRMED': order.confirm(); break
            case 'PREPARING': order.startPreparing(); break
            case 'READY': order.markReady(); break
            case 'DELIVERING': order.startDelivering(); break
            case 'DELIVERED': order.deliver(); break
            case 'CANCELLED': order.cancel(); break
        }

        await this.orderRepository.save(order);

        return right(order.toOutputDTO());
    }
}