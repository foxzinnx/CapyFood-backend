import { CreateMenuSectionUseCase } from "@/application/use-cases/menu-section/create-menu-section/create-menu-section.use-case.js";
import { Restaurant } from "@/domain/entities/restaurant.entity.js";
import { NotAllowedError } from "@/domain/errors/not-allowed.error.js";
import { ResourceNotFoundError } from "@/domain/errors/resource-not-found.error.js";
import { UniqueEntityId } from "@/domain/value-objects/unique-entity-id.vo.js";
import { InMemoryMenuItemRepository } from "@/tests/repositories/in-memory-menu-item.repository.js";
import { InMemoryMenuSectionRepository } from "@/tests/repositories/in-memory-menu-section.repository.js";
import { InMemoryRestaurantRepository } from "@/tests/repositories/in-memory-restaurant.repository.js";
import { beforeEach, describe, expect, it } from "vitest";

let restaurantRepository: InMemoryRestaurantRepository;
let menuItemRepository: InMemoryMenuItemRepository;
let menuSectionRepository: InMemoryMenuSectionRepository;
let sut: CreateMenuSectionUseCase;


async function makeRestaurant(ownerId: string): Promise<Restaurant>{
    const restaurant = Restaurant.create({
        name: 'Pizza Place',
        phone: '11999999999',
        address: 'Rua das Flores, 123',
        city: 'São Paulo',
        state: 'SP',
        zipCode: '01234567',
        isOpen: true,
        ownerId: new UniqueEntityId(ownerId)
    });
    await restaurantRepository.create(restaurant);
    return restaurant;
}

describe('CreateMenuSectionUseCase', () => {
    beforeEach(() => {
        restaurantRepository = new InMemoryRestaurantRepository();
        menuItemRepository = new InMemoryMenuItemRepository();
        menuSectionRepository = new InMemoryMenuSectionRepository();
        sut = new CreateMenuSectionUseCase(restaurantRepository, menuItemRepository, menuSectionRepository);
    });

    it('should create a menu section', async () => {
        const restaurant = await makeRestaurant('owner-1');

        const result = await sut.execute({
            restaurantId: restaurant.id.value,
            ownerId: 'owner-1',
            name: 'Combos do momento',
            description: 'Os melhores combos'
        });

        expect(result.isRight()).toBe(true);
        expect(menuSectionRepository.sections).toHaveLength(1);
        if(result.isRight()){
            expect(result.value.name).toBe('Combos do momento');
            expect(result.value.position).toBe(0);
            expect(result.value.isActive).toBe(true);
        }
    });

    it('should create the menu automatically if it does not exist yet', async () => {
        const restaurant = await makeRestaurant('owner-1');

        expect(menuItemRepository.menus).toHaveLength(0);

        await sut.execute({
            restaurantId: restaurant.id.value,
            ownerId: 'owner-1',
            name: 'Lançamentos'
        });

        expect(menuItemRepository.menus).toHaveLength(1);
    });

    it('should set position as the last in the list', async () => {
        const restaurant = await makeRestaurant('owner-1');

        await sut.execute({
            restaurantId: restaurant.id.value,
            ownerId: 'owner-1',
            name: 'Seção 1'
        });

        await sut.execute({
            restaurantId: restaurant.id.value,
            ownerId: 'owner-1',
            name: 'Seção 2'
        });

        const result = await sut.execute({
            restaurantId: restaurant.id.value,
            ownerId: 'owner-1',
            name: 'Seção 3'
        });
        
        expect(result.isRight()).toBe(true);
        if(result.isRight()){
            expect(result.value.position).toBe(2);
        }
    });

    it('should create a section without description', async () => {
        const restaurant = await makeRestaurant('owner-1');

        const result = await sut.execute({
            restaurantId: restaurant.id.value,
            ownerId: 'owner-1',
            name: 'Lançamentos'
        });

        expect(result.isRight()).toBe(true);
        if(result.isRight()){
            expect(result.value.description).toBeNull();
        }
    });

    it('should not create a section for a non-existent restaurant', async () => {
        const result = await sut.execute({
            restaurantId: 'non-existent-id',
            ownerId: 'owner-1',
            name: 'Combos'
        });

        expect(result.isLeft()).toBe(true);
        if(result.isLeft()){
            expect(result.value).toBeInstanceOf(ResourceNotFoundError)
        }
    });

    it('should not allow a different owner to create a section', async () => {
        const restaurant = await makeRestaurant('owner-1');

        const result = await sut.execute({
            restaurantId: restaurant.id.value,
            ownerId: 'owner-2',
            name: 'Combos'
        });

        expect(result.isLeft()).toBe(true);
        if(result.isLeft()){
            expect(result.value).toBeInstanceOf(NotAllowedError)
        }
    });

    it('should throw when name is invalid', async () => {
        const restaurant = await makeRestaurant('owner-1');

        await expect(
            sut.execute({
                restaurantId: restaurant.id.value,
                ownerId: 'owner-1',
                name: 'A'
            })
        ).rejects.toThrow()
    });
})