import { ListRestaurantsUseCase } from "@/application/use-cases/list-restaurants/list-restaurants.use-case.js";
import { Restaurant } from "@/domain/entities/restaurant.entity.js";
import { UniqueEntityId } from "@/domain/value-objects/unique-entity-id.vo.js";
import { InMemoryRestaurantRepository } from "@/tests/repositories/in-memory-restaurant.repository.js";
import { beforeEach, describe, expect, it } from "vitest";

let restaurantRepository: InMemoryRestaurantRepository;
let sut: ListRestaurantsUseCase;

async function createRestaurant(
    restaurantRepository: InMemoryRestaurantRepository,
    overrides: Partial<{ name: string; city: string; isOpen: boolean }> = {}
){
    const restaurant = Restaurant.create({
        name: overrides.name ?? 'Capybara Pizza',
        description: 'As melhores pizzas da cidade',
        phone: '11999999999',
        address: 'Rua Bagre Guimaraes, 123',
        city: overrides.city ?? 'São Paulo',
        state: 'SP',
        zipCode: '01234567',
        isOpen: overrides.isOpen ?? false,
        ownerId: new UniqueEntityId()
    });
    await restaurantRepository.create(restaurant);
    return restaurant;
}

describe('ListRestaurantsUseCase', () => {
    beforeEach(() => {
        restaurantRepository = new InMemoryRestaurantRepository();
        sut = new ListRestaurantsUseCase(restaurantRepository);
    });

    it('should list all restaurants', async () => {
        await createRestaurant(restaurantRepository, { name: 'ABC' });
        await createRestaurant(restaurantRepository, { name: 'BCD' });

        const result = await sut.execute({});

        expect(result.isRight()).toBe(true);
        if(result.isRight()){
            expect(result.value.restaurants).toHaveLength(2);
            expect(result.value.total).toBe(2);
        }
    });

    it('should filter by search term', async () => {
        await createRestaurant(restaurantRepository, { name: 'Pizza Place' });
        await createRestaurant(restaurantRepository, { name: 'Burguer House' });

        const result = await sut.execute({ search: 'pizza' });

        expect(result.isRight()).toBe(true);
        if(result.isRight()){
            expect(result.value.restaurants).toHaveLength(1);
            expect(result.value.restaurants[0]?.name).toBe('Pizza Place');
        }
    });

    it('should filter by city', async () => {
        await createRestaurant(restaurantRepository, { city: 'São Paulo' });
        await createRestaurant(restaurantRepository, { city: 'Xique-Xique' });

        const result = await sut.execute({ city: 'Xique' });

        expect(result.isRight()).toBe(true);
        if(result.isRight()){
            expect(result.value.restaurants).toHaveLength(1);
            expect(result.value.restaurants[0]?.city).toBe('Xique-Xique')
        }
    });

    it('should filter by isOpen status', async () => {
        await createRestaurant(restaurantRepository, { isOpen: true });
        await createRestaurant(restaurantRepository, { isOpen: false });

        const result = await sut.execute({ isOpen: true });

        expect(result.isRight()).toBe(true);
        if(result.isRight()){
            expect(result.value.restaurants).toHaveLength(1);
            expect(result.value.restaurants[0]?.isOpen).toBe(true);
        }
    });

    it('should paginate results', async () => {
        for(let i = 0; i < 5; i++){
            await createRestaurant(restaurantRepository, { name: `Restaurant ${i}` });
        }

        const result = await sut.execute({ page: 1, perPage: 2 });

        expect(result.isRight()).toBe(true);
        if(result.isRight()){
            expect(result.value.restaurants).toHaveLength(2);
            expect(result.value.total).toBe(5);
            expect(result.value.totalPages).toBe(3);
        }
    });

    it('should return an empty list when there are no restaurants', async () => {
        const result = await sut.execute({});

        expect(result.isRight()).toBe(true);
        if(result.isRight()){
            expect(result.value.restaurants).toEqual([]);
        }
    })
})