import { UpdateRestaurantHoursUseCase } from "@/application/use-cases/restaurant/update-restaurant-hours/update-restaurant-hours.use-case.js";
import { Restaurant } from "@/domain/entities/restaurant.entity.js";
import { NotAllowedError } from "@/domain/errors/not-allowed.error.js";
import { ResourceNotFoundError } from "@/domain/errors/resource-not-found.error.js";
import { UniqueEntityId } from "@/domain/value-objects/unique-entity-id.vo.js";
import { InMemoryRestaurantRepository } from "@/tests/repositories/in-memory-restaurant.repository.js";
import { beforeEach, describe, expect, it } from "vitest";

let restaurantRepository: InMemoryRestaurantRepository;
let sut: UpdateRestaurantHoursUseCase;

async function createRestaurant(
    restaurantRepository: InMemoryRestaurantRepository,
    ownerId: string
){
    const restaurant = Restaurant.create({
        name: 'Capybara Pizza',
        description: 'As melhores pizzas da cidade',
        phone: '11999999999',
        address: 'Rua Bagre Guimaraes, 123',
        city: 'São Paulo',
        state: 'SP',
        zipCode: '01234567',
        isOpen: false,
        ownerId: new UniqueEntityId(ownerId)
    });
    await restaurantRepository.create(restaurant);
    return restaurant;
}

const sampleHours = [
    { dayOfWeek: 1, openTime: '08:00', closeTime: '18:00', isActive: true },
    { dayOfWeek: 2, openTime: '08:00', closeTime: '18:00', isActive: true }
]

describe('UpdateRestaurantHoursUseCase', () => {
    beforeEach(() => {
        restaurantRepository = new InMemoryRestaurantRepository();
        sut = new UpdateRestaurantHoursUseCase(restaurantRepository);
    });

    it('should update business hours of the restaurant', async () => {
        const restaurant = await createRestaurant(restaurantRepository, 'owner-1');

        const result = await sut.execute({
            restaurantId: restaurant.id.value,
            ownerId: 'owner-1',
            businessHours: sampleHours
        });

        expect(result.isRight()).toBe(true);
        expect(restaurantRepository.items[0]?.businessHours).toHaveLength(2);
    });

    it('should replace previous business hours entirely', async () => {
        const restaurant = await createRestaurant(restaurantRepository, 'owner-1');
        await sut.execute({
            restaurantId: restaurant.id.value,
            ownerId: 'owner-1',
            businessHours: sampleHours
        });

        await sut.execute({
            restaurantId: restaurant.id.value,
            ownerId: 'owner-1',
            businessHours: [sampleHours[0]!]
        });

        expect(restaurantRepository.items[0]?.businessHours).toHaveLength(1)
    });

    it('should not update hours of a non-existent restaurant', async () => {
        const result = await sut.execute({
            restaurantId: 'non-existent-id',
            ownerId: 'owner-1',
            businessHours: sampleHours
        });

        expect(result.isLeft()).toBe(true);
        if(result.isLeft()){
            expect(result.value).toBeInstanceOf(ResourceNotFoundError)
        }
    });

    it('should not allow a different owner to update hours', async () => {
        const restaurant = await createRestaurant(restaurantRepository, 'owner-1');

        const result = await sut.execute({
            restaurantId: restaurant.id.value,
            ownerId: 'owner-2',
            businessHours: sampleHours
        });

        expect(result.isLeft()).toBe(true);
        if(result.isLeft()){
            expect(result.value).toBeInstanceOf(NotAllowedError)
        }
    })
})