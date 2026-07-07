import type { RestaurantRepository } from "@/domain/repositories/restaurant.repository.js";
import type { ToggleRestaurantStatusInput } from "./toggle-restaurant-status.input.js";
import { left, right, type Either } from "@/shared/either.js";
import { ResourceNotFoundError } from "@/domain/errors/resource-not-found.error.js";
import { NotAllowedError } from "@/domain/errors/not-allowed.error.js";
import type { ToggleRestaurantStatusOutput } from "./toggle-restaurant-status.output.js";

type ToggleRestaurantStatusResult = Either<
    ResourceNotFoundError | NotAllowedError,
    ToggleRestaurantStatusOutput
>

export class ToggleRestaurantStatusUseCase{
    constructor(
        private readonly restaurantRepository: RestaurantRepository
    ){}

    async execute(input: ToggleRestaurantStatusInput): Promise<ToggleRestaurantStatusResult> {
        const restaurant = await this.restaurantRepository.findById(input.restaurantId);
        if(!restaurant){
            return left(new ResourceNotFoundError('Restaurant'));
        }

        if(restaurant.ownerId.value !== input.ownerId){
            return left(new NotAllowedError())
        }

        restaurant.toggleStatus()

        await this.restaurantRepository.save(restaurant);

        return right({ isOpen: restaurant.isOpen });
    }
}