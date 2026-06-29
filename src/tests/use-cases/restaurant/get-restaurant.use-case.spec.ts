import { GetRestaurantUseCase } from "@/application/use-cases/get-restaurant/get-restaurant.use-case.js";
import { Restaurant } from "@/domain/entities/restaurant.entity.js";
import { ResourceNotFoundError } from "@/domain/errors/resource-not-found.error.js";
import { UniqueEntityId } from "@/domain/value-objects/unique-entity-id.vo.js";
import { InMemoryRestaurantRepository } from "@/tests/repositories/in-memory-restaurant.repository.js";
import { beforeEach, describe, expect, it } from "vitest";

let restaurantRepository: InMemoryRestaurantRepository;
let sut: GetRestaurantUseCase;

describe('GetRestaurantUseCase', () => {
    beforeEach(() => {
        restaurantRepository = new InMemoryRestaurantRepository();
        sut = new GetRestaurantUseCase(restaurantRepository);
    });

    it('should return restaurant details', async () => {
        const restaurant = Restaurant.create({
            name: 'Capybaras Pizza',
            description: 'As melhores pizzas da cidade',
            phone: '11999999999',
            address: 'Rua Bagre Guimaraes, 123',
            city: 'São Paulo',
            state: 'SP',
            zipCode: '01234567',
            isOpen: true,
            ownerId: new UniqueEntityId()
        });
        await restaurantRepository.create(restaurant);

        const result = await sut.execute({ restaurantId: restaurant.id.value });

        expect(result.isRight()).toBe(true);
        if(result.isRight()){
            expect(result.value.name).toBe('Capybaras Pizza');
            expect(result.value.isOpen).toBe(true);
        }
    });

    it('should return business hours in the output', async () => {
        const restaurant = Restaurant.create({
            name: 'Capybaras Pizza',
            description: 'As melhores pizzas da cidade',
            phone: '11999999999',
            address: 'Rua Bagre Guimaraes, 123',
            city: 'São Paulo',
            state: 'SP',
            zipCode: '01234567',
            isOpen: true,
            ownerId: new UniqueEntityId(),
            businessHours: [
                { dayOfWeek: 1, openTime: '08:00', closeTime: '18:00', isActive: true }
            ]
        });
        await restaurantRepository.create(restaurant);

        const result = await sut.execute({ restaurantId: restaurant.id.value });

        expect(result.isRight()).toBe(true);
        if(result.isRight()){
            expect(result.value.businessHours).toHaveLength(1);
        }
    });

    it('should return error for a non-existent restaurant', async () => {
        const result = await sut.execute({ restaurantId: 'non-existent-id' });

        expect(result.isLeft()).toBe(true);
        if(result.isLeft()){
            expect(result.value).toBeInstanceOf(ResourceNotFoundError)
        }
    })
})