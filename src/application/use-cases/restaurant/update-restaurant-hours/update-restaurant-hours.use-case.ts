import type { RestaurantRepository } from "@/domain/repositories/restaurant.repository.js";
import type { UpdateRestaurantHoursInput } from "./update-restaurant-hours.input.js";
import { left, right, type Either } from "@/shared/either.js";
import { ResourceNotFoundError } from "@/domain/errors/resource-not-found.error.js";
import { NotAllowedError } from "@/domain/errors/not-allowed.error.js";
import type { UpdateRestaurantHoursOutput } from "./update-restaurant-hours.output.js";

type UpdateRestaurantHoursResult = Either<
    ResourceNotFoundError | NotAllowedError,
    UpdateRestaurantHoursOutput
>

export class UpdateRestaurantHoursUseCase{
    constructor(
        private readonly restaurantRepository: RestaurantRepository
    ){}

    async execute(input: UpdateRestaurantHoursInput): Promise<UpdateRestaurantHoursResult>{
        const restaurant = await this.restaurantRepository.findById(input.restaurantId);
        if(!restaurant){
            return left(new ResourceNotFoundError('Restaurant'));
        }

        if(restaurant.ownerId.value !== input.ownerId){
            return left(new NotAllowedError());
        }

        restaurant.updateBusinessHours(input.businessHours);

        await this.restaurantRepository.save(restaurant);

        return right({ restaurantId: restaurant.id.value });
    }
}