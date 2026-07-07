import type { RestaurantRepository } from "@/domain/repositories/restaurant.repository.js";
import type { GetRestaurantInput } from "./get-restaurant.input.js";
import { left, right, type Either } from "@/shared/either.js";
import { ResourceNotFoundError } from "@/domain/errors/resource-not-found.error.js";
import type { GetRestaurantOutput } from "./get-restaurant-output.js";

type GetRestaurantResult = Either<ResourceNotFoundError, GetRestaurantOutput>

export class GetRestaurantUseCase{
    constructor(private readonly restaurantRepository: RestaurantRepository){}

    async execute(input: GetRestaurantInput): Promise<GetRestaurantResult>{
        const restaurant = await this.restaurantRepository.findById(input.restaurantId);
        if(!restaurant){
            return left(new ResourceNotFoundError('Restaurant'));
        }

        return right(restaurant.toOutputDTO());
    }
}