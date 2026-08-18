import { CreateMenuItemUseCase } from "@/application/use-cases/menu-item/create-menu-item/create-menu-item.use-case.js";
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
let sut: CreateMenuItemUseCase;

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

describe('CreateMenuItemUseCase', () => {
    beforeEach(() => {
        restaurantRepository = new InMemoryRestaurantRepository();
        menuItemRepository = new InMemoryMenuItemRepository();
        menuSectionRepository = new InMemoryMenuSectionRepository();
        sut = new CreateMenuItemUseCase(restaurantRepository, menuItemRepository, menuSectionRepository);
    });

    it('should create a menu item, creating the menu on first item', async () => {
        const restaurant = await createRestaurant(restaurantRepository, 'owner-1');

        const result = await sut.execute({
            restaurantId: restaurant.id.value,
            ownerId: 'owner-1',
            name: 'Pizza de Queijo',
            description: 'Pizza de Queijo com bordas de chocolate',
            price: 69.9
        });

        expect(result.isRight()).toBe(true);
        expect(menuItemRepository.items).toHaveLength(1);
        expect(menuItemRepository.menus).toHaveLength(1);
    });

    it('should reuse an existing menu when adding a second item', async () => {
        const restaurant = await createRestaurant(restaurantRepository, 'owner-1');

        await sut.execute({
            restaurantId: restaurant.id.value,
            ownerId: 'owner-1',
            name: 'Pizza de Calabresa',
            price: 39.9
        });

        await sut.execute({
            restaurantId: restaurant.id.value,
            ownerId: 'owner-1',
            name: 'Pizza de Queijo',
            price: 55
        });

        expect(menuItemRepository.items).toHaveLength(2);
        expect(menuItemRepository.menus).toHaveLength(1);
    });

    it('should create the item with an optional imageUrl', async () => {
        const restaurant = await createRestaurant(restaurantRepository, 'owner-1');

        await sut.execute({
            restaurantId: restaurant.id.value,
            ownerId: 'owner-1',
            name: 'Pizza de Calabresa',
            price: 39.9,
            imageUrl: 'https://example.com/pizza.png'
        });

        expect(menuItemRepository.items[0]?.imageUrl).toBe('https://example.com/pizza.png');
    });

    it('should not create an item for a non-existent restaurant', async () => {
        const result = await sut.execute({
            restaurantId: 'non-existent-id',
            ownerId: 'owner-1',
            name: 'Pizza de Chocolate',
            price: 70
        });

        expect(result.isLeft()).toBe(true);
        if(result.isLeft()){
            expect(result.value).toBeInstanceOf(ResourceNotFoundError)
        }
    });

    it('should not allow a different owner to create an item', async () => {
        const restaurant = await createRestaurant(restaurantRepository, 'owner-1');

        const result = await sut.execute({
            restaurantId: restaurant.id.value,
            ownerId: 'owner-2',
            name: 'Pizza de Calabresa',
            price: 39.9
        });

        expect(result.isLeft()).toBe(true);
        if(result.isLeft()){
            expect(result.value).toBeInstanceOf(NotAllowedError)
        }
    });

    it('should throw when price is invalid', async () => {
        const restaurant = await createRestaurant(restaurantRepository, 'owner-1');

        await expect(
            sut.execute({
                restaurantId: restaurant.id.value,
                ownerId: 'owner-1',
                name: 'Pizza de Calabresa',
                price: -10
            })
        ).rejects.toThrow();
    })
})