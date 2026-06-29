import { ToggleRestaurantStatusUseCase } from "@/application/use-cases/toggle-restaurant-status/toggle-restaurant-status.use-case.js";
import { Restaurant } from "@/domain/entities/restaurant.entity.js";
import { NotAllowedError } from "@/domain/errors/not-allowed.error.js";
import { ResourceNotFoundError } from "@/domain/errors/resource-not-found.error.js";
import { UniqueEntityId } from "@/domain/value-objects/unique-entity-id.vo.js";
import { InMemoryRestaurantRepository } from "@/tests/repositories/in-memory-restaurant.repository.js";
import { beforeEach, describe, expect, it } from "vitest";

let restaurantRepository: InMemoryRestaurantRepository;
let sut: ToggleRestaurantStatusUseCase;

async function createRestaurant(
    restaurantRepository: InMemoryRestaurantRepository,
    ownerId: string,
    isOpen = false
){
    const restaurant = Restaurant.create({
        name: 'Capybara Pizza',
        description: 'As melhores pizzas da cidade',
        phone: '11999999999',
        address: 'Rua Bagre Guimaraes, 123',
        city: 'São Paulo',
        state: 'SP',
        zipCode: '01234567',
        isOpen,
        ownerId: new UniqueEntityId(ownerId)
    });
    await restaurantRepository.create(restaurant);
    return restaurant;
}

describe('ToggleRestaurantStatusUseCase', () => {
    beforeEach(() => {
        restaurantRepository = new InMemoryRestaurantRepository();
        sut = new ToggleRestaurantStatusUseCase(restaurantRepository)
    });

    it('should toggle status from closed to open', async () => {
        const restaurant = await createRestaurant(restaurantRepository, 'owner-1', false);

        const result = await sut.execute({
            restaurantId: restaurant.id.value,
            ownerId: 'owner-1'
        });

        expect(result.isRight()).toBe(true);
        if(result.isRight()){
            expect(result.value.isOpen).toBe(true);
        }
    });

    it('should toggle status from open to closed', async () => {
        const restaurant = await createRestaurant(restaurantRepository, 'owner-1', true);

        const result = await sut.execute({
            restaurantId: restaurant.id.value,
            ownerId: 'owner-1'
        });

        expect(result.isRight()).toBe(true);
        if(result.isRight()){
            expect(result.value.isOpen).toBe(false);
        }
    });

    it('should persist the new status', async () => {
        const restaurant = await createRestaurant(restaurantRepository, 'owner-1', false);

        await sut.execute({ restaurantId: restaurant.id.value, ownerId: 'owner-1' });

        expect(restaurantRepository.items[0]?.isOpen).toBe(true);
    });

    it('should not toggle a non-existing restaurant', async () => {
        const result = await sut.execute({
            restaurantId: 'non-existing-id',
            ownerId: 'owner-1'
        });

        expect(result.isLeft()).toBe(true);
        if(result.isLeft()){
            expect(result.value).toBeInstanceOf(ResourceNotFoundError)
        }
    });

    it('should not allow a different owner to toggle the status', async () => {
        const restaurant = await createRestaurant(restaurantRepository, 'owner-1');

        const result = await sut.execute({
            restaurantId: restaurant.id.value,
            ownerId: 'owner-2'
        });

        expect(result.isLeft()).toBe(true);
        if(result.isLeft()){
            expect(result.value).toBeInstanceOf(NotAllowedError)
        }
    })
})