import { NotAllowedError } from "@/domain/errors/not-allowed.error.js";
import { ResourceNotFoundError } from "@/domain/errors/resource-not-found.error.js";
import type { OrderRepository } from "@/domain/repositories/order.repository.js";
import type { RestaurantRepository } from "@/domain/repositories/restaurant.repository.js";
import { left, right, type Either } from "@/shared/either.js";
import type { ListRestaurantsOrdersOutput } from "./list-restaurant-orders.output.js";
import type { ListRestaurantOrdersInput } from "./list-restaurant-orders.input.js";

type ListRestaurantOrdersResult = Either<
    ResourceNotFoundError | NotAllowedError,
    ListRestaurantsOrdersOutput
>

export class ListRestaurantOrdersUseCase{
    constructor(
        private readonly restaurantRepository: RestaurantRepository,
        private readonly orderRepository: OrderRepository
    ){}

    async execute(input: ListRestaurantOrdersInput): Promise<ListRestaurantOrdersResult>{
        const restaurant = await this.restaurantRepository.findById(input.restaurantId);
        if(!restaurant){
            return left(new ResourceNotFoundError('Restaurant'));
        }

        if(restaurant.ownerId.value !== input.ownerId){
            return left(new NotAllowedError())
        }

        const result = await this.orderRepository.findByRestaurantId(input.restaurantId, {
            page: input.page ?? 1,
            perPage: input.perPage ?? 20
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