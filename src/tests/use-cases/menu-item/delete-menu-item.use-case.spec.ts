import { DeleteMenuItemUseCase } from "@/application/use-cases/menu-item/delete-menu-item/delete-menu-item.use-case.js";
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
let sut: DeleteMenuItemUseCase;

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

describe('DeleteMenuItemUseCase', () => {
    beforeEach(() => {
        restaurantRepository = new InMemoryRestaurantRepository();
        menuItemRepository = new InMemoryMenuItemRepository();
        sut = new DeleteMenuItemUseCase(restaurantRepository, menuItemRepository);
    });

    it('should delete an existing menu item', async () => {
        const { menuItem } = await setupRestaurantWithMenuItem('owner-1');

        const result = await sut.execute({
            ownerId: 'owner-1',
            menuItemId: menuItem.id.value
        });

        expect(result.isRight()).toBe(true);
        expect(menuItemRepository.items).toHaveLength(0);
    });

    it('should not delete a non-existent menu item', async () => {
        const result = await sut.execute({
            ownerId: 'owner-1',
            menuItemId: 'non-existent-id'
        });

        expect(result.isLeft()).toBe(true);
        if(result.isLeft()){
            expect(result.value).toBeInstanceOf(ResourceNotFoundError)
        }
    });

    it('should not allow a different owner to delete the item', async () => {
        const { menuItem } = await setupRestaurantWithMenuItem('owner-1');

        const result = await sut.execute({
            ownerId: 'owner-2',
            menuItemId: menuItem.id.value
        });

        expect(result.isLeft()).toBe(true);
        if(result.isLeft()){
            expect(result.value).toBeInstanceOf(NotAllowedError)
        }
        expect(menuItemRepository.items).toHaveLength(1);
    })
})