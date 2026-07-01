import { UpdateMenuItemUseCase } from "@/application/use-cases/update-menu-item/update-menu-item.use-case.js";
import { MenuItem } from "@/domain/entities/menu-item.entity.js";
import { Restaurant } from "@/domain/entities/restaurant.entity.js";
import { NotAllowedError } from "@/domain/errors/not-allowed.error.js";
import { ResourceNotFoundError } from "@/domain/errors/resource-not-found.error.js";
import { UniqueEntityId } from "@/domain/value-objects/unique-entity-id.vo.js";
import { InMemoryMenuItemRepository } from "@/tests/repositories/in-memory-menu-item.repository.js";
import { InMemoryRestaurantRepository } from "@/tests/repositories/in-memory-restaurant.repository.js";
import { beforeEach, describe, expect, it } from "vitest";

let restaurantRepository: InMemoryRestaurantRepository;
let menuItemRepository: InMemoryMenuItemRepository;
let sut: UpdateMenuItemUseCase;

async function setupRestaurantWithMenuItem(ownerId: string){
    const restaurant = Restaurant.create({
        name: 'Capybara Pizza',
        description: 'As melhores pizzas da cidade',
        phone: '11999999999',
        address: 'Rua Aleatoria, 123',
        city: 'São Paulo',
        state: 'SP',
        zipCode: '01234567',
        isOpen: true,
        ownerId: new UniqueEntityId(ownerId)
    });
    await restaurantRepository.create(restaurant);

    const menuId = new UniqueEntityId();
    restaurantRepository.linkMenuToRestaurant(menuId.value, restaurant.id.value);

    const menuItem = MenuItem.create({
        name: 'Pizza de Calabresa',
        description: 'Pizza muito boa',
        price: 59.9,
        isAvailable: true,
        menuId
    });
    await menuItemRepository.createMenuItem(menuItem);

    return { restaurant, menuItem }
}

describe('UpdateMenuItemUseCase', () => {
    beforeEach(() => {
        restaurantRepository = new InMemoryRestaurantRepository();
        menuItemRepository = new InMemoryMenuItemRepository();
        sut = new UpdateMenuItemUseCase(restaurantRepository, menuItemRepository);
    });

    it('should update name, description and price', async () => {
        const { menuItem } = await setupRestaurantWithMenuItem('owner-1');

        const result = await sut.execute({
            ownerId: 'owner-1',
            menuItemId: menuItem.id.value,
            name: 'Pizza Pepperoni',
            description: 'Spicy',
            price: 45
        });

        expect(result.isRight()).toBe(true);
        expect(menuItemRepository.items[0]?.name.value).toBe('Pizza Pepperoni');
        expect(menuItemRepository.items[0]?.description).toBe('Spicy');
        expect(menuItemRepository.items[0]?.price).toBe(45);
    });

    it('should toggle availability via isAvailable frag', async () => {
        const { menuItem } = await setupRestaurantWithMenuItem('owner-1');

        await sut.execute({
            ownerId: 'owner-1',
            menuItemId: menuItem.id.value,
            isAvailable: false
        });

        expect(menuItemRepository.items[0]?.isAvailable).toBe(false);
    });

    it('should update only the provided fields', async () => {
        const { menuItem } = await setupRestaurantWithMenuItem('owner-1');

        await sut.execute({
            ownerId: 'owner-1',
            menuItemId: menuItem.id.value,
            price: 50
        });

        expect(menuItemRepository.items[0]?.name.value).toBe('Pizza de Calabresa');
        expect(menuItemRepository.items[0]?.price).toBe(50);
    });

    it('should not update a non-existent menu item', async () => {
        const result = await sut.execute({
            ownerId: 'owner-1',
            menuItemId: 'non-existent-id',
            price: 50
        });

        expect(result.isLeft()).toBe(true);
        if(result.isLeft()){
            expect(result.value).toBeInstanceOf(ResourceNotFoundError)
        }
    });

    it('should not allow a different owner to update the item', async () => {
        const { menuItem } = await setupRestaurantWithMenuItem('owner-1');

        const result = await sut.execute({
            ownerId: 'owner-2',
            menuItemId: menuItem.id.value,
            price: 50
        });

        expect(result.isLeft()).toBe(true);
        if(result.isLeft()){
            expect(result.value).toBeInstanceOf(NotAllowedError)
        }
    });

    it('should throw when updating to an invalid price', async () => {
        const { menuItem } = await setupRestaurantWithMenuItem('owner-1');

        await expect(
            sut.execute({
                ownerId: 'owner-1',
                menuItemId: menuItem.id.value,
                price: -1
            })
        ).rejects.toThrow();
    })
})