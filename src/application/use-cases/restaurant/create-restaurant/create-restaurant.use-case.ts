import type { RestaurantOwnerRepository } from "@/domain/repositories/restaurant-owner.repository.js";
import type { RestaurantRepository } from "@/domain/repositories/restaurant.repository.js";
import type { CreateRestaurantInput } from "./create-restaurant.input.js";
import { left, right, type Either } from "@/shared/either.js";
import { ResourceNotFoundError } from "@/domain/errors/resource-not-found.error.js";
import { RestaurantAlreadyExistsError } from "@/domain/errors/restaurant-already-exists.error.js";
import type { CreateRestaurantOutput } from "./create-restaurant.output.js";
import { Restaurant } from "@/domain/entities/restaurant.entity.js";
import { UniqueEntityId } from "@/domain/value-objects/unique-entity-id.vo.js";

type CreateRestaurantResult = Either<
    ResourceNotFoundError | RestaurantAlreadyExistsError,
    CreateRestaurantOutput
>

export class CreateRestaurantUseCase{
    constructor(
        private readonly ownerRepository: RestaurantOwnerRepository,
        private readonly restaurantRepository: RestaurantRepository
    ){}

    async execute(input: CreateRestaurantInput): Promise<CreateRestaurantResult>{
        const owner = await this.ownerRepository.findById(input.ownerId);
        if(!owner){
            return left(new ResourceNotFoundError('Restaurant Owner'));
        }

        const existingRestaurant = await this.restaurantRepository.findByOwnerId(input.ownerId);
        if(existingRestaurant){
            return left(new RestaurantAlreadyExistsError());
        }

        const restaurant = Restaurant.create({
            name: input.name,
            description: input.description ?? null,
            phone: input.phone,
            address: input.address,
            city: input.city,
            state: input.state,
            zipCode: input.zipCode,
            isOpen: false,
            ownerId: new UniqueEntityId(input.ownerId)
        });

        await this.restaurantRepository.create(restaurant);

        return right({ restaurantId: restaurant.id.value })
    }
}